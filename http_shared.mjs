/*
Module for code shared between `http_bun.mjs` and `http_deno.mjs`.
Code intended for browser apps should be placed in `http.mjs`.
*/

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as h from './http.mjs'
import * as pt from './path.mjs'

let ENC

// Consumer code can extend this as needed.
export const EXT_TO_MIME_TYPE = {
  __proto__: null,
  [`.css`]: `text/css`,
  [`.gif`]: `image/gif`,
  [`.htm`]: `text/html`,
  [`.html`]: `text/html`,
  [`.ico`]: `image/x-icon`,
  [`.jpeg`]: `image/jpeg`,
  [`.jpg`]: `image/jpeg`,
  [`.js`]: `application/javascript`,
  [`.json`]: `application/json`,
  [`.mjs`]: `application/javascript`,
  [`.pdf`]: `application/pdf`,
  [`.png`]: `image/png`,
  [`.svg`]: `image/svg+xml`,
  [`.tif`]: `image/tiff`,
  [`.tiff`]: `image/tiff`,
  [`.txt`]: `text/plain`,
  [`.xml`]: `text/xml`,
  [`.zip`]: `application/zip`,
  [`.webp`]: `image/webp`,
  [`.woff`]: `font/woff`,
  [`.woff2`]: `font/woff2`,
}

export function guessContentType(val) {
  return EXT_TO_MIME_TYPE[pt.ext(val).toLowerCase()]
}

// Consumer code can add extensions as needed.
export const COMPRESSABLE = new Set([
  `.css`, `.htm`, `.html`, `.js`, `.json`, `.mjs`, `.svg`, `.txt`, `.xml`,
])

/*
A readable stream that can be written to.
Much simpler to use than `TransformStream`.
*/
export class WritableReadableStream extends ReadableStream {
  ctr = undefined

  constructor(src) {
    l.optRec(src)
    let ctr
    super({...src, start(val) {
      ctr = val
      src?.start?.(val)
    }})
    this.ctr = ctr
  }

  error(val) {return this.ctr.error(val)}
  write(val) {return this.ctr.enqueue(val)}
  close() {try {this.ctr.close()} catch {}}
  deinit() {return this.close()}
}

export class WritableReadableByteStream extends WritableReadableStream {
  write(val) {
    ENC ??= new TextEncoder()
    return super.write(ENC.encode(val))
  }
}

export function concatStreams(...src) {
  if (!src.length) return undefined
  if (src.length === 1) return src[0]
  return new ReadableStream(new ConcatStreamSource(...src))
}

/*
Concatenates inputs into one stream. Supported inputs:
- Nils.
- `ReadableStream` instances.
- `Uint8Array` instances.
- String values.
- Stringable primitives such as numbers.
- Stringable objects such as `URL` instances.
*/
export class ConcatStreamSource extends l.Emp {
  constructor(...src) {
    super()
    this.src = src.map(this.usable, this).filter(l.id)
  }

  async pull(ctr) {
    try {await this.pullInternal(ctr)}
    catch (err) {
      this.deinit(err)
      ctr.error(err)
    }
  }

  async pullInternal(ctr) {
    while (this.src.length) {
      const src = this.src[0]
      if (l.isNil(src)) {
        this.src.shift()
        continue
      }

      if (l.isInst(src, Uint8Array)) {
        this.src.shift()
        ctr.enqueue(src)
        return
      }

      const {done, value} = await src.read()
      if (done) {
        this.src.shift()
        continue
      }

      ctr.enqueue(value)
      return
    }

    ctr.close()
  }

  usable(val) {
    if (l.isNil(val)) return val
    if (l.isInst(val, ReadableStream)) return val.getReader()
    if (l.isInst(val, Uint8Array)) return val
    val = l.renderLax(val)
    if (!val) return undefined
    ENC ??= new TextEncoder()
    return ENC.encode(val)
  }

  cancel(reason) {return this.deinit(reason)}

  deinit(reason) {
    for (const val of this.src) cancelOrDeinit(val, reason)
    this.src.length = 0
  }
}

function cancelOrDeinit(val, why) {
  if (l.hasMeth(val, `cancel`)) val.cancel(why)
  else if (l.hasMeth(val, `deinit`)) val.deinit(why)
}

/*
Short for "broadcaster". Maintains a set of "clients", which are writable /
readable streams, and can broadcast over them. Uses the standard stream APIs,
which work in every modern JS environment.

Each "client" is a stream of arbitrary values. `.writeJson` and `.writeEvent`
broadcast a string. For HTTP responses, "clients" must be converted to streams
of `Uint8Array`, either via `.pipeThrough(new TextEncoderStream())`, or by
subclassing the broadcaster and overriding its client `.Stream` type with
`WritableReadableByteStream`. See `LiveBroad` which does the latter.
*/
export class Broad extends Set {
  get Stream() {return WritableReadableStream}

  make() {
    const out = new this.Stream({cancel: () => {this.delete(out)}})
    this.add(out)
    return out
  }

  write(val) {
    const buf = []
    for (const wri of this) buf.push(this.writeTo(wri, val))
    return Promise.all(buf)
  }

  writeJson(val) {return this.write(jsonEncode(val))}
  writeEvent(val) {return this.write(eventSourceLine(val))}
  writeEventJson(val) {return this.writeEvent(jsonEncode(val))}

  async writeTo(wri, val) {
    try {await wri.write(val)}
    catch (err) {
      this.delete(wri)
      wri.deinit()
      this.onWriteErr(err, wri)
    }
  }

  onWriteErr(err) {
    if (isErrAbort(err)) return
    throw err
  }

  deinit() {
    for (const wri of this) {
      this.delete(wri)
      wri.deinit()
    }
  }
}

/*
References:
  https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
  https://developer.mozilla.org/en-US/docs/Web/API/EventSource
*/
function eventSourceLine(val) {return `data: ` + l.reqStr(val) + `\n\n`}

// Copied from `http.mjs` to avoid import.
function isErrAbort(val) {return val?.name === `AbortError`}
function jsonEncode(src) {return JSON.stringify(src) ?? `null`}

export class BaseHttpFile extends l.Emp {
  get Head() {return Headers}
  get Res() {return Response}

  constructor(urlPath, fsPath) {
    super()
    this.urlPath = l.reqValidStr(urlPath)
    this.fsPath = l.reqValidStr(fsPath)
    this.status = undefined
  }

  static make() {}
  onlyFile() {}
  onlyDir() {}
  live(cli) {return cli?.addFile(this)}

  opt(opt) {
    l.optRec(opt)
    const status = opt?.status ?? this.status
    const headers = l.toInst(opt?.headers, this.Head)
    const key = h.HEADER_NAME_CONTENT_TYPE
    if (!headers.has(key)) {
      const val = guessContentType(this.fsPath)
      if (val) headers.set(key, val)
    }
    return {...opt, status, headers}
  }
}

export class BaseHttpDir extends l.Emp {
  get HttpFile() {return BaseHttpFile}
  get indexPath() {return `index.html`}
  get notFoundPath() {return `404.html`}

  constructor(base, filter) {
    super()
    this.base = l.reqStr(base)
    this.filter = toFilterOpt(filter)
  }

  allow(val) {
    return !!(
      l.optStr(val) && !hasDotDot(val) && (!this.filter || this.filter(val))
    )
  }

  urlPathToFsPath(val) {
    val = pt.join(this.base, unslashPre(decodeURIComponent(pt.norm(val))))
    if (!this.allow(val)) return undefined
    return val
  }

  fsPathToUrlPath(val) {
    val = l.renderLax(val)
    if (!this.allow(val)) return undefined
    const {base} = this
    if (!base) return val
    return s.stripPre(val, pt.dirLike(base))
  }

  resolve(urlPath) {
    const fsPath = this.urlPathToFsPath(urlPath)
    if (!fsPath) return undefined
    return this.HttpFile.make(urlPath, fsPath)
  }

  async resolveFile(path) {return (await this.resolve(path))?.onlyFile()}

  async resolveSiteFile(path) {
    const out = await this.resolveFile(path)
    if (out) return out
    if (pt.hasExt(path)) return undefined
    if (path.endsWith(`/`)) {
      return this.resolveFile(path + l.reqStr(this.indexPath))
    }
    return this.resolveFile(path + `.html`)
  }

  async resolveSiteFileWithNotFound(path) {
    return (await this.resolveSiteFile(path)) || (await this.resolveNotFound())
  }

  resolveNotFound() {
    const out = this.resolveFile(this.notFoundPath)
    if (out) out.status = 404
    return out
  }
}

/*
A list of multiple "HTTP dirs" (see above) with an external interface similar to
that of a single directory. Correctly handles some edge cases such as resolving
existing files before falling back on 404. Supports caching, which should be
used in production for directories containing fixed sets of static files.

Minor implementation note. When caching is enabled, we could choose to cache
the cases where a path doesn't match a file, eliminating the cost of iterating
through directories and using IO. This would be suitable in the case of
well-behaved clients which only request a closed set of known, referenced
paths, which are nevertheless missing for one reason or another. But it would
also leak RAM in the case of malicious clients requesting many different
invented, imaginary paths, which would allow them to eventually OOM-crash the
server. Various mitigations are possible, but they seem out of scope.
*/
export class HttpDirs extends Array {
  cache = false
  resolved = undefined

  resolve(path) {return this.procure(resolve, path)}
  resolveFile(path) {return this.procure(resolveFile, path)}
  resolveSiteFile(path) {return this.procure(resolveSiteFile, path)}
  resolveNotFound(path) {return this.procure(resolveNotFound, path)}

  async resolveSiteFileWithNotFound(path) {
    return (await this.resolveSiteFile(path)) || (await this.resolveNotFound(path))
  }

  async procure(fun, path) {
    const out = this.resolved?.[path]
    if (out) return out
    for (const dir of this) {
      const file = await fun.call(dir, path)
      if (!file) continue
      if (this.cache) (this.resolved ??= l.Emp())[path] ??= file
      return file
    }
    return undefined
  }

  static of(...src) {return super.of(...src.filter(l.isSome))}
}

/* eslint-disable no-invalid-this */
function resolve(...src) {return this.resolve(...src)}
function resolveFile(...src) {return this.resolveFile(...src)}
function resolveSiteFile(...src) {return this.resolveSiteFile(...src)}
function resolveNotFound(...src) {return this.resolveNotFound(...src)}
/* eslint-enable no-invalid-this */

function toFilter(val) {
  if (l.isFun(val)) return val
  if (l.hasMeth(val, `test`)) return val.test.bind(val)
  throw l.errConv(val, `filter: need function or RegExp`)
}

function toFilterOpt(val) {return l.isNil(val) ? val : toFilter(val)}
export function slashPre(val) {return s.optPre(val, `/`)}
export function unslashPre(val) {return l.reqStr(val).replace(/^[/\\]*/g, ``)}
export function hasDotDot(val) {return l.laxStr(val).includes(`..`)}

/*
Usage:

  etag(await httpFile.stat())
  etag(httpFile.statSync())

In Deno, `HttpFile..stat` and `HttpFile..statSync` don't use IO.
*/
export function etag(stat) {
  const {size, mtime, birthtime} = l.reqRec(stat)
  const out = s.dashed(birthtime?.valueOf(), mtime?.valueOf(), size)
  return out && (`W/` + h.jsonEncode(out))
}

/*
Parses an `accept-encoding` header, returning the list of encodings
without their q-values.
*/
export function decodeAcceptEncoding(src) {
  const out = s.split(src, `,`)
  let ind = -1
  while (++ind < out.length) {
    let val = out[ind]
    const charInd = val.indexOf(`;`)
    if (charInd >= 0) val = val.slice(0, charInd) // Get rid of q-value, if any.
    out[ind] = val.trim()
  }
  return out
}

const ZSTD_LVL = 100 // ZLIB.constants.ZSTD_c_compressionLevel
const BRO_LVL = 1 // ZLIB.constants.BROTLI_PARAM_QUALITY
let ZLIB

/*
Tool for compressing HTTP responses. Can be used for dynamically generated
responses and for static files. Has opt-in support for RAM caching, which
should be used in production when serving a small fixed set of static files.

Our current implementation is technically vulnerable to a "thundering herd"
scenario where multiple concurrent requests are asking for the same file which
is not yet cached, which end up compressing multiple times concurrently, but
this should be rare and the redundancy is not worth fixing.

Compression of dynamically-generated responses is unnecessary in Deno,
which performs it automatically. It's provided for Bun.
*/
export class HttpCompressor extends l.Emp {
  get Res() {return Response}
  cache = false
  resolved = undefined

  // Our preferred order.
  algos = [`zstd`, `br`, `gzip`, `deflate`]

  // See `./misc/compression.mjs` for comparison of algos, levels, engines.
  strats = {
    __proto__: null,
    zstd:    {key: `zstdCompress`,   opt: {params: {[ZSTD_LVL]: 9}}},
    br:      {key: `brotliCompress`, opt: {params: {[BRO_LVL]: 5}}},
    gzip:    {key: `gzip`,           opt: {level: 8}},
    deflate: {key: `deflate`,        opt: {level: 8}},
  }

  async fileResponse({req, file, compression}) {
    l.reqInst(req, Request)
    l.optInst(file, BaseHttpFile)
    l.optRec(compression)
    if (!file) return undefined

    const path = l.reqStr(file.fsPath)
    const body = await file.bytes()
    const opt = await file.opt()
    if (!COMPRESSABLE.has(pt.ext(path))) return new this.Res(body, opt)
    return this.response({req, body, opt, path, compression})
  }

  async response({req, body, opt, path, compression}) {
    l.reqInst(req, Request)
    l.optStr(path)
    l.optRec(opt)
    l.optRec(compression)

    const algos = this.requestEncodings(req)
    if (!algos?.length) return new this.Res(body, opt)

    /*
    Import just before we need this. Avoid adding startup latency when this
    feature is not used.

    Available in Bun, Deno, Node. At the time of writing, according to various
    sources, Deno and Node offload compression to background threads, while Bun
    does not. In the future, we should probably implement and use a worker pool
    in Bun.
    */
    ZLIB ??= await import(`node:zlib`)

    const cache = path && this.cache
      ? ((this.resolved ??= l.Emp())[path] ??= l.Emp())
      : undefined

    let algo
    let promise

    for (algo of algos) {
      const cached = cache?.[algo]
      if (cached) {
        const {body, opt} = cached
        return withContentEncoding(new this.Res(body, opt), algo)
      }
      promise = this.compress(body, algo, compression?.[algo])
      if (promise) break
    }

    if (!promise) return new this.Res(body, opt)
    body = l.reqInst((await promise), Uint8Array)
    if (cache) cache[algo] = {body, opt}
    return withContentEncoding(new this.Res(body, opt), algo)
  }

  /*
  When an algo is not supported, this method must SYNCHRONOUSLY return nil.
  This means it can't be defined as an async method. Subclasses which override
  it must respect this requirement. Otherwise we'd have to `await` for each
  algo check. The caller must import `ZLIB` before calling this method.
  */
  compress(body, algo, opt) {
    l.reqStr(algo)
    l.optRec(opt)

    const strat = this.strats[algo]
    if (!strat) return undefined

    const {key, opt: optDef} = strat
    const fun = l.optFun(ZLIB[key])
    if (!fun) return undefined

    if (opt) opt = {...optDef, ...opt}
    else opt = optDef

    const {promise, reject, resolve} = Promise.withResolvers()
    function done(err, val) {if (err) {reject(err)} else {resolve(val)}}
    fun(body, opt, done)
    return promise
  }

  /*
  For simplicity, we always use our algo order and ignore client-specified
  q-values. In the future, we may consider respecting q-values, but it seems
  like an edge case since browsers tend to just list the algorithms.
  For example, Chrome 138 specifies `gzip, deflate, br, zstd`.
  */
  requestEncodings(req) {
    const algos = decodeAcceptEncoding(req.headers.get(h.HEADER_NAME_ACCEPT_ENCODING))
    if (!algos.length) return algos

    /*
    Minor note: we cannot write this as:

      this.algos.filter(algos.includes, algos)

    ...because `Array..includes` has an optional second parameter,
    which is an index at which to start searching.
    */
    return this.algos.filter(includes, algos)
  }
}

// eslint-disable-next-line no-invalid-this
function includes(val) {return this.includes(val)}

function withContentEncoding(res, algo) {
  res.headers.set(`content-encoding`, l.reqStr(algo))
  return res
}
