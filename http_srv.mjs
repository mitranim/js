/*
Module for code shared between `http_bun.mjs` and `http_deno.mjs`.
Code intended for browser apps should be placed in `http.mjs`.
*/

import * as l from './lang.mjs'
import * as o from './obj.mjs'
import * as s from './str.mjs'
import * as h from './http.mjs'
import * as pt from './path.mjs'

export const HEADER_NAME_ACCEPT_ENCODING = `accept-encoding`
export const HEADER_NAME_CONTENT_ENCODING = `content-encoding`
export const HEADER_NAME_CORS_CREDENTIALS = `access-control-allow-credentials`
export const HEADER_NAME_CORS_HEADERS = `access-control-allow-headers`
export const HEADER_NAME_CORS_METHODS = `access-control-allow-methods`
export const HEADER_NAME_CORS_ORIGIN = `access-control-allow-origin`
export const HEADER_NAME_ETAG = `etag`
export const HEADER_NAME_HOST = `host`
export const HEADER_NAME_IF_MODIFIED_SINCE = `if-modified-since`
export const HEADER_NAME_IF_NONE_MATCH = `if-none-match`
export const HEADER_NAME_LAST_MODIFIED = `last-modified`
export const HEADER_NAME_ORIGIN = `origin`
export const HEADER_NAME_VARY = `vary`

export const HEADERS_CORS_PROMISCUOUS = tuple(
  tuple(HEADER_NAME_CORS_ORIGIN, `*`),
  tuple(HEADER_NAME_CORS_METHODS, h.GET),
  tuple(HEADER_NAME_CORS_METHODS, h.HEAD),
  tuple(HEADER_NAME_CORS_METHODS, h.OPTIONS),
  tuple(HEADER_NAME_CORS_METHODS, h.POST),
  tuple(HEADER_NAME_CORS_METHODS, h.PUT),
  tuple(HEADER_NAME_CORS_METHODS, h.PATCH),
  tuple(HEADER_NAME_CORS_METHODS, h.DELETE),
  tuple(HEADER_NAME_CORS_HEADERS, h.HEADER_NAME_CONTENT_TYPE),
  tuple(HEADER_NAME_CORS_HEADERS, h.HEADER_NAME_CACHE_CONTROL),
  tuple(HEADER_NAME_CORS_CREDENTIALS, `true`),
)

// Consumer code can mutate this as needed.
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
export const COMPRESSIBLE = new Set([
  `.css`, `.htm`, `.html`, `.js`, `.json`, `.mjs`, `.svg`, `.txt`, `.xml`,
])

let ENC // Internal. Tiny savings in JSC.

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
export class Broad extends l.Emp {
  get Stream() {return WritableReadableStream}
  clients = new Set()

  make() {
    const {clients} = this
    const out = new this.Stream({cancel: () => {clients.delete(out)}})
    clients.add(out)
    return out
  }

  write(val) {
    const buf = []
    for (const wri of this.clients) buf.push(this.writeTo(wri, val))
    return Promise.all(buf)
  }

  writeJson(val) {return this.write(h.jsonEncode(val))}
  writeEvent(val) {return this.write(eventSourceLine(val))}
  writeEventJson(val) {return this.writeEvent(h.jsonEncode(val))}

  async writeTo(wri, val) {
    try {await wri.write(val)}
    catch (err) {
      this.clients.delete(wri)
      wri.deinit()
      this.onWriteErr(err, wri)
    }
  }

  onWriteErr(err) {
    if (h.isErrAbort(err)) return
    throw err
  }

  deinit() {
    const {clients} = this
    for (const wri of clients) {
      clients.delete(wri)
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

export async function fileResponse(opt) {
  const {file, compressor, liveClient: live} = l.reqRec(opt)

  if (!file) return undefined

  live?.addFile(file)

  let res = await file.notModifiedResponse(opt)
  if (res) return res

  if (live && file.isHtml()) {
    file.setOpt({text: live.liveHtml(await file.getText())})
  }

  if (compressor) {
    res = await file.compressedResponse(opt)
    if (res) return res
  }

  return file.response(opt)
}

/*
Used by `HttpDir` and `HttpDirs` as part of URL-to-FS file resolution.
Designed for deduplicating IO and other work involved in serving files,
especially when caching is enabled.

All "expensive" properties are generated only once and reused. This avoids
repeated IO when a file's stats or body are needed in different places in
the code.
*/
export class BaseHttpFile extends l.Emp {
  get Head() {return Headers}
  get Res() {return Response}

  fsPath = undefined
  urlPath = undefined
  info = undefined
  text = undefined
  bytes = undefined
  caching = undefined
  compressed = undefined

  constructor(opt) {
    l.reqRec(opt)
    super()
    this.fsPath = l.reqScalar(opt.fsPath)
    this.urlPath = l.reqScalar(opt.urlPath)
    this.setOpt(opt)
  }

  setOpt(opt) {
    if (!l.optRec(opt)) return this
    if (`info` in opt) this.info = l.optRec(opt.info)
    if (`text` in opt) this.text = l.optStr(opt.text)
    if (`bytes` in opt) this.bytes = l.optInst(opt.bytes, Uint8Array)
    if (`caching` in opt) this.caching = l.optBool(opt.caching)
    return this
  }

  // See overrides in `http_bun.mjs` and `http_deno.mjs`.
  static resolve() {}
  getInfo() {return this.info}
  getBody() {return this.bytes ?? this.text ?? this.getBytes()}
  getText() {return this.text}
  getBytes() {return this.bytes}

  // TODO: consider generating strong hash-based etags when caching is enabled.
  async getEtag() {
    return this.etag ??= this.getEtagSync(this.info ?? await this.getInfo())
  }

  getEtagSync(info) {return this.etag ??= etag(info ?? this.info)}

  isHtml() {
    const {fsPath} = this
    return fsPath.endsWith(`.html`) || fsPath.endsWith(`.htm`)
  }

  isCompressible() {return COMPRESSIBLE.has(pt.ext(this.fsPath))}

  resOpt(opt) {
    l.optRec(opt)

    const type = guessContentType(this.fsPath)
    const etag = this.getEtagSync()
    if (!type && !etag) return opt

    /*
    Avoid mutating the input. Avoids edge case issues and allows callers to
    freely mutate the output. No measurable overhead when the input is nil.
    */
    opt = o.assign(l.Emp(), opt)

    const head = opt.headers = l.toInst(opt.headers, this.Head)
    if (type) head.set(h.HEADER_NAME_CONTENT_TYPE, type)
    if (etag) head.set(HEADER_NAME_ETAG, etag)
    return opt
  }

  // Used internally by `fileResponse`.
  async notModifiedResponse(opt) {
    const {req} = l.reqRec(opt)
    const head = req.headers

    const etag = head.get(HEADER_NAME_IF_NONE_MATCH)
    if (etag && etag === await this.getEtag()) return notModRes(this, opt)

    let since = head.get(HEADER_NAME_IF_MODIFIED_SINCE)
    if (!since) return undefined

    since = Math.trunc(Date.parse(since) / 1000)
    if (!since) return undefined

    const info = this.info ?? await this.getInfo()
    const mtime = Math.trunc(info?.mtime / 1000)
    if (mtime <= since) return notModRes(this, opt)
    return undefined
  }

  /*
  Used internally by `fileResponse`. Should be called only when the compressor
  is actually available, and only for known compressible file formats.

  Internal note: we read files fully, instead of piping them through compression
  streams, because compression should be used either for dynamically generated
  text, which is fully available in RAM (HTML streaming has been abandoned by
  most rendering frameworks including our `prax.mjs`), or in combination with
  RAM caching for static files, where caching the full content allows to skip
  disk IO on cache hits.
  */
  async compressedResponse(opt) {
    const {req, compressor: comp} = l.reqRec(opt)
    if (!comp) return undefined

    const {caching, compressed} = this
    const algos = comp.requestEncodings(req)
    if (!algos?.length) return undefined

    const Res = opt.Res ?? this.Res

    let algo
    let body
    let bodyOut

    for (algo of algos) {
      const prev = compressed?.[algo]
      if (prev) {
        const {body, opt} = prev
        return new Res(body, opt)
      }

      body ??= await this.getBody()
      bodyOut = comp.compress({algo, body})

      if (l.isPromise(bodyOut)) bodyOut = await bodyOut
      if (bodyOut) break
    }

    /*
    The caller should invoke `.response` as the fallback. If we've already
    called `this.getBody`, it will be used without further disk IO.
    */
    if (!bodyOut) return undefined

    const resOpt = l.laxRec(await this.resOpt(opt.resOpt))
    resOpt.headers = l.toInst(resOpt.headers, this.Head)
    resOpt.headers.set(HEADER_NAME_CONTENT_ENCODING, algo)
    resOpt.headers.set(HEADER_NAME_VARY, HEADER_NAME_ACCEPT_ENCODING)

    if (caching) {
      (this.compressed ??= l.Emp())[algo] = {body: bodyOut, opt: resOpt}
    }
    return new Res(bodyOut, resOpt)
  }

  /*
  Optional caching-related header for production. Unlike the etag header,
  we don't set this by default, because it causes browsers to treat the
  file as briefly immutable and use their own RAM or disk cache, without
  revalidation requests, breaking file updates in development.
  */
  setLastModified(head) {
    l.reqInst(head, Headers)

    const mtime = this.info?.mtime
    if (!mtime) return

    const date = l.toInst(mtime, Date)
    if (!date.valueOf()) return

    head.set(HEADER_NAME_LAST_MODIFIED, date.toUTCString())
  }
}

function notModRes(file, opt) {
  const resOpt = l.laxRec(file.resOpt(opt?.resOpt))
  resOpt.status = 304
  const Res = opt?.Res ?? file.Res
  return new Res(undefined, resOpt)
}

export class BaseHttpDir extends l.Emp {
  get HttpFile() {return BaseHttpFile} // Performs the actual disk IO.
  get indexPath() {return `index.html`}
  get notFoundPath() {return `404.html`}

  constructor(opt) {
    const {fsPath, filter} = l.laxRec(opt)
    super()
    this.fsPath = l.optStr(fsPath)
    this.filter = toFilterOpt(filter)
  }

  /*
  High-level file resolution algorithm for static websites.
  Similar to the algorithm used by GitHub Pages:
  - Try an exactly matching file.
  - If path ends with "/", try `index.html` in that directory.
  - If path doesn't end with "/", try a file with an added `.html`.
  - Fall back on `404.html` in current directory.
  */
  async resolveSiteFileWithNotFound(urlPath) {
    return (
      (await this.resolveSiteFile(urlPath)) ||
      (await this.resolveNotFound())
    )
  }

  async resolveSiteFile(urlPath) {
    const out = await this.resolve(urlPath)
    if (out) return out
    if (urlPath.endsWith(`/`)) {
      return this.resolve(urlPath + l.reqStr(this.indexPath))
    }
    return this.resolve(urlPath + `.html`)
  }

  resolve(urlPath) {
    const fsPath = this.urlPathToFsPath(urlPath)
    if (!fsPath) return undefined
    return this.HttpFile.resolve({fsPath, urlPath})
  }

  async resolveNotFound() {
    const out = await this.resolve(this.notFoundPath)
    out?.setOpts({resOpt: {status: 404}})
    return out
  }

  urlPathToFsPath(val) {
    val = pt.join(this.fsPath, unslashPre(decodeURIComponent(pt.norm(val))))
    if (!this.allow(val)) return undefined
    return val
  }

  fsPathToUrlPath(val) {
    val = l.renderLax(val)
    if (!this.allow(val)) return undefined
    const {fsPath} = this
    if (!fsPath) return val
    return s.stripPre(val, pt.dirLike(fsPath))
  }

  allow(val) {
    return !!(
      l.optStr(val) && !hasDotDot(val) && (!this.filter || this.filter(val))
    )
  }
}

/*
A list of "HTTP dirs" (see above) with the same file-resolution interface as
individual dirs. Correctly handles some edge cases such as resolving existing
files before falling back on 404.

Supports caching, which should be used in production for directories containing
fixed sets of static files. On cache hits, it skips disk IO entirely.

Compression via `HttpCompressor` is integrated into caching. On cache hits, we
not only skips file lookup IO, but also avoids repeated compression, reducing
latency at the cost of needing more RAM. See `HttpFile..compressedResponse`.

We never cache knowledge of which paths were "not found",
because there's infinitely many of them.
*/
export class HttpDirs extends Array {
  static of(...src) {return super.from(src.filter(l.isSome))}

  caching = false
  filesByFsPath = undefined
  filesByUrlPath = undefined
  notFoundFile = undefined

  setOpt(opt) {
    if (!l.optRec(opt)) return this
    if (`caching` in opt) this.caching = l.optBool(opt.caching)
    return this
  }

  async resolveSiteFileWithNotFound(urlPath) {
    return (
      (await this.resolveSiteFile(urlPath)) ||
      (await this.resolveNotFound())
    )
  }

  resolveSiteFile(urlPath) {return this.procure(resolveSiteFile, urlPath)}
  resolve(urlPath) {return this.procure(resolve, urlPath)}

  async resolveNotFound() {
    const {notFoundFile: prev, caching} = this
    if (prev) return prev

    for (const dir of this) {
      const file = await dir.resolveNotFound()
      if (!file) continue
      if (caching) this.notFoundFile = file
      return file
    }
    return undefined
  }

  async procure(fun, urlPath) {
    l.reqStr(urlPath)

    const {filesByUrlPath, caching} = this
    const prev = filesByUrlPath?.[urlPath]
    if (prev) return prev

    for (const dir of this) {
      const file = await fun.call(dir, urlPath)
      if (!file) continue
      if (!caching) return file
      return this.cacheFile(file)
    }
    return undefined
  }

  cacheFiles(src) {
    for (src of src) this.cacheFile(src)
    return this
  }

  /*
  In addition to caching, this performs normalization / deduplication.
  URL paths are non-canonical, while FS paths are canonical. Multiple
  URL paths can be resolved to the same FS path. For example, calling
  `HttpDirs..resolveSiteFile` with `/` and `/index.html` will resolve
  to the same FS path `index.html` relative to the first directory which
  contains such a file. In such cases, we prefer to discard the redundant
  file object, and reuse the previously-cached one. This avoids an increase
  in RAM usage and allows us to store compression caches on file objects,
  without another, redundant mapping of FS paths to compressed artifacts.
  Callers of this method must use the return value.
  */
  cacheFile(file) {
    const {fsPath, urlPath} = l.reqInst(file, BaseHttpFile)

    if (!fsPath) {
      throw Error(`unable to cache file without FS path: ${l.show(file)}`)
    }
    if (!urlPath) {
      throw Error(`unable to cache file without URL path: ${l.show(file)}`)
    }

    const byFs = this.filesByFsPath ??= l.Emp()
    const prev = byFs[fsPath]
    if (prev) return prev

    const byUrl = this.filesByUrlPath ??= l.Emp()
    byFs[fsPath] = file
    byUrl[urlPath] = file
    file.setOpt({caching: true})
    return file
  }
}

function resolve(...src) {return this.resolve(...src)}
function resolveSiteFile(...src) {return this.resolveSiteFile(...src)}

function toFilter(val) {
  if (l.isFun(val)) return val
  if (l.hasMeth(val, `test`)) return val.test.bind(val)
  throw l.errConv(val, `filter: need function or RegExp`)
}

function toFilterOpt(val) {return l.isNil(val) ? val : toFilter(val)}
export function slashPre(val) {return s.optPre(val, `/`)}
export function unslashPre(val) {return l.reqStr(val).replace(/^[/\\]*/g, ``)}
export function hasDotDot(val) {return l.laxStr(val).includes(`..`)}

// Normally accessed via `BaseHttpFile..getEtagSync`.
export function etag(info) {
  if (!l.optRec(info)) return ``
  const {size, mtime, birthtime} = info
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

export const COMPRESSION_ALGOS = [`zstd`, `br`, `gzip`, `deflate`]

export const COMPRESSION_OPTS = {
  __proto__: null,
  zstd:    {params: {100: 9}}, // zlib.constants.ZSTD_c_compressionLevel
  br:      {params: {1: 5}},   // zlib.constants.BROTLI_PARAM_QUALITY
  gzip:    {level: 8},
  deflate: {level: 8},
}

/*
Tool for compressing HTTP responses. Can be used for dynamically generated
responses and for static files. For dynamic responses, this should be used
directly. For static files, call `fileResponse`, providing request, file,
and compressor.

Compression of dynamically-generated responses is unnecessary in Deno,
which performs it automatically.

The compressor is somewhat stateful and should be created exactly once.
*/
export class HttpCompressor extends l.Emp {
  get Res() {return Response}

  constructor(opt) {
    super()
    const {algos, opts, Res} = l.laxRec(opt)
    this.algos = l.optArr(algos) ?? COMPRESSION_ALGOS
    this.opts = l.optNpo(opts) ?? COMPRESSION_OPTS
    if (l.optCls(Res)) o.priv(this, `Res`, Res)
  }

  async response({req, body, resOpt, Res}) {
    Res ??= this.Res
    const algos = this.requestEncodings(req)
    if (!algos?.length) return new Res(body, resOpt)

    let algo
    let bodyOut

    for (algo of algos) {
      bodyOut = this.compress({algo, body})
      if (l.isPromise(bodyOut)) bodyOut = await bodyOut
      if (bodyOut) break
    }

    if (!bodyOut) return new Res(body, resOpt)

    const res = new Res(bodyOut, resOpt)
    res.headers.set(HEADER_NAME_CONTENT_ENCODING, algo)
    return res
  }

  compress({algo, body}) {
    if (algo === `zstd`) return this.zstdCompress(body)
    if (algo === `br`) return this.brotliCompress(body)
    if (algo === `gzip`) return this.gzipCompress(body)
    if (algo === `deflate`) return this.deflateCompress(body)
    return undefined
  }

  decompress({algo, body}) {
    if (algo === `zstd`) return this.zstdDecompress(body)
    if (algo === `br`) return this.brotliDecompress(body)
    if (algo === `gzip`) return this.gzipDecompress(body)
    if (algo === `deflate`) return this.deflateDecompress(body)
    return undefined
  }

  zstdCompress(src) {
    const {zlib, opts} = this
    if (!zlib) return this.initWith(this.zstdCompress, src)
    return promiseCall(zlib.zstdCompress, src, opts?.zstd)
  }

  zstdDecompress(src) {
    const {zlib} = this
    if (!zlib) return this.initWith(this.zstdDecompress, src)
    return promiseCall(zlib.zstdDecompress, src)
  }

  brotliCompress(src) {
    const {zlib, opts} = this
    if (!zlib) return this.initWith(this.brotliCompress, src)
    return promiseCall(zlib.brotliCompress, src, opts?.br)
  }

  brotliDecompress(src) {
    const {zlib} = this
    if (!zlib) return this.initWith(this.brotliDecompress, src)
    return promiseCall(zlib.brotliDecompress, src)
  }

  gzipCompress(src) {
    const {zlib, opts} = this
    if (!zlib) return this.initWith(this.gzipCompress, src)
    return promiseCall(zlib.gzip, src, opts?.gzip)
  }

  gzipDecompress(src) {
    const {zlib} = this
    if (!zlib) return this.initWith(this.gzipDecompress, src)
    return promiseCall(zlib.gunzip, src)
  }

  deflateCompress(src) {
    const {zlib, opts} = this
    if (!zlib) return this.initWith(this.deflateCompress, src)
    return promiseCall(zlib.deflate, src, opts?.deflate)
  }

  deflateDecompress(src) {
    const {zlib} = this
    if (!zlib) return this.initWith(this.deflateDecompress, src)
    return promiseCall(zlib.inflate, src)
  }

  /*
  The zlib module is available in all major engines: Bun, Deno (2+), Node.

  At the time of writing, according to various sources, Deno and Node offload
  compression to background threads, while Bun does not. In the future, we
  should probably implement and use a worker pool in Bun.

  We import this only on demand because the module is quite hefty and takes
  several milliseconds to import in Bun. In Deno, it seems to be pre-imported.
  Probably part of the reason `deno` takes longer to start.
  */
  async init() {return this.zlib ??= await import(`node:zlib`)}

  async initWith(fun, ...src) {
    await this.init()
    return fun.apply(this, src)
  }

  /*
  For simplicity, we always use our algo order and discard client-specified
  q-values. In the future, we may consider respecting q-values, but it seems
  like an edge case since browsers tend to just list the algorithms.
  For example, Chrome 138 specifies `gzip, deflate, br, zstd`.
  */
  requestEncodings(req) {
    const algos = decodeAcceptEncoding(req.headers.get(HEADER_NAME_ACCEPT_ENCODING))
    if (!algos.length) return algos

    /*
    The following would be elegant but incorrect:

      this.algos.filter(algos.includes, algos)

    ...because `Array..includes` has an optional second parameter,
    which is an index at which to start searching.
    */
    return this.algos.filter(includes, algos)
  }
}

function includes(val) {return this.includes(val)}

/*
Promisification of Node-style callbacks. Unlike its own `promisify`,
this supports nil functions. When the function is missing, the output
is synchronously nil.

At the time of writing, Deno doesn't support Zstd, lacking `zlib.zstdCompress`
and `zlib.zstdDecompress`, and this lets us skip them.
*/
function promiseCall(fun, ...args) {
  l.optFun(fun)
  if (!fun) return undefined

  const {promise, reject, resolve} = Promise.withResolvers()
  function done(err, val) {if (err) {reject(err)} else {resolve(val)}}
  fun(...args, done)
  return promise
}

/*
Bun-only polyfills. References:

  https://github.com/oven-sh/bun/issues/1723
  https://github.com/ungap/compression-stream
*/
class StreamPolyfillBase extends l.Emp {
  constructor(algo) {
    super()
    const ns = require(`node:stream`) // eslint-disable-line no-undef
    const stream = this.createStream(algo)
    this.readable = ns.Readable.toWeb(stream)
    this.writable = ns.Writable.toWeb(stream)
  }
}

export class CompressionStreamPolyfill extends StreamPolyfillBase {
  createStream(algo) {
    l.reqStr(algo)
    const z = require(`node:zlib`) // eslint-disable-line no-undef
    const opts = COMPRESSION_OPTS
    if (algo === `gzip`) return z.createGzip(opts[algo])
    if (algo === `deflate`) return z.createDeflate(opts[algo])
    if (algo === `deflate-raw`) return z.createDeflateRaw(opts[algo])
    throw Error(`unable to create stream for compression algorithm ${algo}`)
  }
}

export class DecompressionStreamPolyfill extends StreamPolyfillBase {
  createStream(algo) {
    l.reqStr(algo)
    const z = require(`node:zlib`) // eslint-disable-line no-undef
    const opts = COMPRESSION_OPTS
    if (algo === `gzip`) return z.createGunzip(opts[algo])
    if (algo === `deflate`) return z.createInflate(opts[algo])
    if (algo === `deflate-raw`) return z.createInflateRaw(opts[algo])
    throw Error(`unable to create stream for decompression algorithm ${algo}`)
  }
}

function tuple(...src) {return Object.freeze(src)}
