/* global Deno */

import * as l from './lang.mjs'
import * as o from './obj.mjs'
import * as s from './str.mjs'
import * as u from './url.mjs'
import * as h from './http.mjs'
import * as io from './io_deno.mjs'
import * as p from './path.mjs'

// TODO move to a non-Deno-specific file.
export const contentTypes = l.Emp()
contentTypes[`.css`] = `text/css`
contentTypes[`.gif`] = `image/gif`
contentTypes[`.htm`] = `text/html`
contentTypes[`.html`] = `text/html`
contentTypes[`.ico`] = `image/x-icon`
contentTypes[`.jpeg`] = `image/jpeg`
contentTypes[`.jpg`] = `image/jpeg`
contentTypes[`.js`] = `application/javascript`
contentTypes[`.json`] = `application/json`
contentTypes[`.mjs`] = `application/javascript`
contentTypes[`.pdf`] = `application/pdf`
contentTypes[`.png`] = `image/png`
contentTypes[`.svg`] = `image/svg+xml`
contentTypes[`.tif`] = `image/tiff`
contentTypes[`.tiff`] = `image/tiff`
contentTypes[`.xml`] = `text/xml`
contentTypes[`.zip`] = `application/zip`
contentTypes[`.webp`] = `image/webp`
contentTypes[`.woff`] = `font/woff`
contentTypes[`.woff2`] = `font/woff2`

export function guessContentType(val) {return contentTypes[p.posix.ext(val)]}

export class DirBase extends l.Emp {
  urlPathToFsPath() {return undefined}
  fsPathToUrlPath() {return undefined}
  fsStat(val) {return this.FileInfo.statOpt(val)}
  resolve(url) {return this.fsStat(this.urlPathToFsPath(url))}

  async resolveFile(url) {return (await this.resolve(url))?.onlyFile()}

  async resolveSiteFile(url) {
    url = u.url(url)

    const info = await this.resolveFile(url)
    if (info) return info

    if (p.posix.ext(url.pathname)) return undefined

    if (url.pathname.endsWith(`/`)) {
      return this.resolveFile(url.addPath(this.index))
    }

    return this.resolveFile(url.pathname + `.html`)
  }

  async resolveSiteFileWithNotFound(url) {
    return (await this.resolveSiteFile(url)) || (await this.resolveNotFound())
  }

  // TODO: code 404.
  resolveNotFound() {return this.resolveFile(this.notFound)}

  get index() {return `index.html`}
  get notFound() {return `404.html`}
  get FileInfo() {return HttpFileInfo}
}

export function dirAbs() {return new DirAbs()}

export class DirAbs extends DirBase {
  urlPathToFsPath(val) {
    if (io.IS_WINDOWS) return unslashPre(toFsPathNorm(val))
    return toFsPathNorm(val)
  }

  fsPathToUrlPath(val) {
    if (io.paths.isAbs(val)) return slashPre(val)
    return undefined
  }
}

// Short for "directory relative".
export class DirRel extends DirBase {
  constructor(base) {super().base = l.reqStr(base)}

  urlPathToFsPath(val) {
    val = unslashPre(toFsPathNorm(val))
    if (this.testUrlPath(val)) return p.posix.join(this.base, val)
    return undefined
  }

  fsPathToUrlPath(val) {
    if (this.testFsPath(val)) return slashPre(this.fsPathRel(val))
    return undefined
  }

  fsPathRel(val) {return p.posix.strictRelTo(fsPathNorm(val), this.base)}
  testUrlPath(val) {return l.isStr(val) && !hasDotDot(val)}
  testFsPath(val) {return p.posix.isSubOf(fsPathNorm(val), this.base)}
}

export function dirRel(base, fil) {return new DirRelFil(base, fil)}

// Short for "directory relative with filter".
export class DirRelFil extends DirRel {
  constructor(base, fil) {
    super(base).fil = l.toInstOpt(fil, this.Fil)
  }

  testUrlPath(val) {return super.testUrlPath(val) && this.test(val)}
  testFsPath(val) {return super.testFsPath(val) && this.test(this.fsPathRel(val))}
  test(val) {return !this.fil || !!this.fil.test(val)}

  get Fil() {return Fil}
}

export class Dirs extends Array {
  resolve(val) {
    val = u.url(val)
    return this.procure(function iter(dir) {return dir.resolve(val)})
  }

  resolveFile(val) {
    val = u.url(val)
    return this.procure(function iter(dir) {return dir.resolveFile(val)})
  }

  resolveSiteFile(val) {
    val = u.url(val)
    return this.procure(function iter(dir) {return dir.resolveSiteFile(val)})
  }

  resolveNotFound(val) {
    val = u.url(val)
    return this.procure(function iter(dir) {return dir.resolveNotFound(val)})
  }

  async resolveSiteFileWithNotFound(val) {
    val = u.url(val)
    return (await this.resolveSiteFile(val)) || (await this.resolveNotFound(val))
  }

  async procure(fun) {
    for (const val of this) {
      const out = await fun(val)
      if (out) return out
    }
    return undefined
  }

  fsPathToUrlPath(val) {
    for (const dir of this) {
      const out = dir.fsPathToUrlPath(val)
      if (l.isSome(out)) return out
    }
    return undefined
  }

  static of(...val) {return super.of(...val.filter(l.id))}
}

export class HttpFileInfo extends io.FileInfo {
  res(opt) {return this.HttpFileStream.res(this.path, opt)}

  stream() {return this.HttpFileStream.open(this.path)}

  // Not used automatically. May be used by user code.
  etag() {
    const {size, mtime, birthtime} = this.stat
    return s.dashed(birthtime?.valueOf(), mtime?.valueOf(), size)
  }

  etagQuoted() {return JSON.stringify(l.reqStr(this.etag()))}
  etagQuotedWeak() {return s.maybePre(this.etagQuoted(), `W/`)}

  get HttpFileStream() {return HttpFileStream}
}

export class HttpFileStream extends io.FileStream {
  res(opt) {
    try {
      const res = new this.Res(this, l.optStruct(opt))
      this.setTypeOpt(res.headers)
      return res
    }
    catch (err) {
      this.deinit()
      throw err
    }
  }

  type() {return guessContentType(this.path)}

  setType(head) {
    const val = this.type()
    if (val) head.set(h.HEADER_NAME_CONTENT_TYPE, val)
  }

  setTypeOpt(head) {
    if (!head.get(h.HEADER_NAME_CONTENT_TYPE)) this.setType(head)
  }

  static async res(path, opt) {
    return (await this.open(path)).res(opt)
  }

  get Res() {return Response}
}

// TODO ability to store multiple listeners.
// TODO convert to `Deno.serve` API.
export class Srv extends l.Emp {
  lis = undefined

  listen(opt) {
    this.deinit()
    this.lis = this.listener(opt)
    this.onListen(opt)
    return this.serve(this.lis)
  }

  listener(opt) {
    if (opt?.certFile || opt?.keyFile) return Deno.listenTls(opt)
    return Deno.listen(opt)
  }

  async serve(lis) {
    for await (const conn of lis) {
      const onConnErr = err => this.onConnErr(err, conn)
      this.serveConn(conn).catch(onConnErr)
    }
  }

  async serveConn(conn) {
    for await (const event of Deno.serveHttp(conn)) {
      const onEventErr = err => this.onEventErr(err, event)
      event.respondWith(l.reqPromise(this.response(event.request))).catch(onEventErr)
    }
  }

  /*
  To minimize error potential, subclasses should override `.res` and `.errRes`
  rather than this.

  This method must ALWAYS be async. Our error handling assumes that we can pass
  the resulting promise to `event.respondWith` without having to handle
  synchronous exceptions resulting from the call in cases where the response
  might be malformed.
  */
  async response(req) {
    try {return await this.res(req)}
    catch (err) {
      try {return await this.errRes(err, req)}
      catch (err) {
        try {
          this.onReqErr(err, req)
          return errRes(err, req)
        }
        catch (err) {
          console.error(err)
          return new Response(`unknown error`, {status: 500})
        }
      }
    }
  }

  // Subclasses should override this.
  res() {return new Response()}
  onErr(err) {if (!isErrCancel(err)) console.error(err)}
  onConnErr(err, conn) {this.onErr(err, conn)}
  onEventErr(err, event) {this.onErr(err, event)}
  onReqErr(err, req) {this.onErr(err, req)}
  errRes(err, req) {return errRes(err, req)}

  onListen(opt) {
    console.log(`[${this.constructor.name}] listening on http://${opt.hostname || `localhost`}:${opt.port}`)
  }

  deinit() {
    try {this.lis?.close()}
    finally {this.lis = undefined}
  }
}

export function errRes(err) {return new Response(l.show(err), {status: 500})}

// Short for "filter".
export class Fil extends l.Emp {
  constructor(val) {
    super()
    this.val = l.req(val, this.isTest)
  }

  isTest(val) {return l.isFun(val) || l.hasMeth(val, `test`)}
  test(val) {return l.isFun(this.val) ? this.val(val) : this.val.test(val)}
}

export function isErrCancel(val) {
  return (
    h.isErrAbort(val) ||
    l.isInst(val, Deno.errors.ConnectionAborted) ||
    (l.isInst(val, Deno.errors.Http) && val.message.includes(`connection closed`))
  )
}

/*
Various features of this module take arbitrary paths as inputs, including URL
paths and full URLs. After decoding the pathname, we always normalize it to
Posix-style to simplify path testing in `DirRelFil`. On Windows, FS operations
in Deno and Node work even with `/` instead of `\`.
*/
function fsPathNorm(val) {return p.toPosix(val)}
function toFsPathNorm(val) {return fsPathNorm(toFsPath(val))}
function toFsPath(val) {return urlDec(toPathname(val))}

// May consider moving to `url.mjs`.
function toPathname(val) {
  if (l.isStr(val) && u.RE_PATHNAME.test(val)) return val
  return u.toUrl(val).pathname
}

function urlDec(val) {return decodeURIComponent(l.reqStr(val))}
function slashPre(val) {return s.optPre(val, `/`)}
function unslashPre(val) {return blank(val, /^(?:[/\\])*/g)}
function blank(val, reg) {return l.reqStr(val).replace(reg, ``)}
function hasDotDot(val) {return l.reqStr(val).includes(`..`)}
