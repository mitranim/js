/*
Module for code shared between `http_bun.mjs` and `http_deno.mjs`.
Code intended for browser apps should be placed in `http.mjs`.

All code in this module must use only the standard web APIs
available in all modern environments.
*/

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as h from './http.mjs'
import * as pt from './path.mjs'

// Consumer code can add types as needed.
export const EXT_TO_MIME_TYPE = l.Emp()
EXT_TO_MIME_TYPE[`.css`] = `text/css`
EXT_TO_MIME_TYPE[`.gif`] = `image/gif`
EXT_TO_MIME_TYPE[`.htm`] = `text/html`
EXT_TO_MIME_TYPE[`.html`] = `text/html`
EXT_TO_MIME_TYPE[`.ico`] = `image/x-icon`
EXT_TO_MIME_TYPE[`.jpeg`] = `image/jpeg`
EXT_TO_MIME_TYPE[`.jpg`] = `image/jpeg`
EXT_TO_MIME_TYPE[`.js`] = `application/javascript`
EXT_TO_MIME_TYPE[`.json`] = `application/json`
EXT_TO_MIME_TYPE[`.mjs`] = EXT_TO_MIME_TYPE[`.js`]
EXT_TO_MIME_TYPE[`.pdf`] = `application/pdf`
EXT_TO_MIME_TYPE[`.png`] = `image/png`
EXT_TO_MIME_TYPE[`.svg`] = `image/svg+xml`
EXT_TO_MIME_TYPE[`.tif`] = `image/tiff`
EXT_TO_MIME_TYPE[`.tiff`] = `image/tiff`
EXT_TO_MIME_TYPE[`.txt`] = `text/plain`
EXT_TO_MIME_TYPE[`.xml`] = `text/xml`
EXT_TO_MIME_TYPE[`.zip`] = `application/zip`
EXT_TO_MIME_TYPE[`.webp`] = `image/webp`
EXT_TO_MIME_TYPE[`.woff`] = `font/woff`
EXT_TO_MIME_TYPE[`.woff2`] = `font/woff2`

export function guessContentType(val) {
  return EXT_TO_MIME_TYPE[pt.ext(val).toLowerCase()]
}

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
  enc = undefined

  write(val) {
    const enc = this.enc ??= new TextEncoder()
    return super.write(enc.encode(val))
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
    return enc.encode(val)
  }

  cancel(reason) {return this.deinit(reason)}

  deinit(reason) {
    for (const val of this.src) cancelOrDeinit(val, reason)
    this.src.length = 0
  }
}

const enc = new TextEncoder()

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
    const {status} = this
    if (l.isNil(status) || opt && !(`status` in opt)) return opt
    return {...opt, status}
  }

  setHeaders(head) {this.setType(head)}

  setType(head) {
    const key = h.HEADER_NAME_CONTENT_TYPE
    if (head.has(key)) return
    const val = guessContentType(this.fsPath)
    if (val) head.set(key, val)
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

export class HttpDirs extends Array {
  resolve(path) {
    return this.procure(function iter(dir) {return dir.resolve(path)})
  }

  resolveFile(path) {
    return this.procure(function iter(dir) {return dir.resolveFile(path)})
  }

  resolveSiteFile(path) {
    return this.procure(function iter(dir) {return dir.resolveSiteFile(path)})
  }

  resolveNotFound(path) {
    return this.procure(function iter(dir) {return dir.resolveNotFound(path)})
  }

  async resolveSiteFileWithNotFound(path) {
    return (await this.resolveSiteFile(path)) || (await this.resolveNotFound(path))
  }

  async procure(fun) {
    for (const dir of this) {
      const out = await fun(dir)
      if (out) return out
    }
    return undefined
  }

  static of(...src) {return super.of(...src.filter(l.isSome))}
}

function toFilterOpt(val) {return l.isNil(val) ? val : toFilter(val)}

function toFilter(val) {
  if (l.isFun(val)) return val
  if (l.hasMeth(val, `test`)) return val.test.bind(val)
  throw l.errConv(val, `filter: need function or RegExp`)
}

export function slashPre(val) {return s.optPre(val, `/`)}
export function unslashPre(val) {return l.reqStr(val).replace(/^[/\\]*/g, ``)}
export function hasDotDot(val) {return l.laxStr(val).includes(`..`)}
