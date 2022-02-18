/* global Deno */

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as u from './url.mjs'
import * as h from './http.mjs'
import * as io from './io_deno.mjs'

export class ContentTypeMap extends Map {
  guess(val) {return this.get(io.ext(toPathname(val)))}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

ContentTypeMap.main = /* @__PURE__ */ new ContentTypeMap()
  .set(`.css`, `text/css`)
  .set(`.gif`, `image/gif`)
  .set(`.htm`, `text/html`)
  .set(`.html`, `text/html`)
  .set(`.ico`, `image/x-icon`)
  .set(`.jpeg`, `image/jpeg`)
  .set(`.jpg`, `image/jpeg`)
  .set(`.js`, `application/javascript`)
  .set(`.json`, `application/json`)
  .set(`.mjs`, `application/javascript`)
  .set(`.pdf`, `application/pdf`)
  .set(`.png`, `image/png`)
  .set(`.svg`, `image/svg+xml`)
  .set(`.tif`, `image/tiff`)
  .set(`.tiff`, `image/tiff`)
  .set(`.xml`, `text/xml`)
  .set(`.zip`, `application/zip`)
  .set(`.webp`, `image/webp`)
  .set(`.woff`, `font/woff`)
  .set(`.woff2`, `font/woff2`)

export class DirBase {
  fsPath(val) {return toFsPath(val)}
  fsStat(val) {return this.FileInfo.statOpt(val)}
  resolve(url) {return this.fsStat(this.fsPath(url))}

  async resolveFile(url) {return (await this.resolve(url))?.onlyFile()}

  async resolveSiteFile(url) {
    url = u.url(url)

    const info = this.resolveFile(url)
    if (info) return info

    if (io.ext(url.pathname)) return undefined

    if (url.pathname.endsWith(`/`)) {
      return this.resolveFile(url.addPath(this.index))
    }

    return this.resolveFile(url.pathname + `.html`)
  }

  async resolveSiteFileWithNotFound(url) {
    return (await this.resolveSiteFile(url)) || (await this.resolveNotFound())
  }

  resolveNotFound() {return this.resolveFile(this.notFound)}

  get index() {return `index.html`}
  get notFound() {return `404.html`}
  get FileInfo() {return HttpFileInfo}
  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class DirAny extends DirBase {
  fsPath(val) {
    val = super.fsPath(val)
    if (io.IS_WINDOWS) val = unslash(val)
    return val
  }
}

export class DirRel extends DirBase {
  constructor(base) {super().base = l.reqStr(base)}

  fsPath(val) {
    val = super.fsPath(val)
    if (!this.test(val)) return undefined
    return join(this.base, val)
  }

  test(val) {return l.isStr(val) && !hasDotDot(val)}
}

export class DirRelTest extends DirRel {
  constructor(base, fil) {
    super(base).fil = l.toInstOpt(fil, this.Fil)
  }

  fsPath(val) {
    val = unslash(unixy(toFsPath(val)))
    if (!this.test(val)) return undefined
    return undot(join(this.base, val))
  }

  test(val) {return super.test(val) && (!this.fil || !!this.fil.test(val))}

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

  resolveSiteFileWithNotFound(val) {
    val = u.url(val)
    return this.procure(function iter(dir) {return dir.resolveSiteFileWithNotFound(val)})
  }

  async procure(fun) {
    for (const val of this) {
      const out = await fun(val)
      if (out) return out
    }
    return undefined
  }
}

export class HttpFileInfo extends io.FileInfo {
  res(opt) {return this.HttpFileStream.res(this.path, opt)}

  stream() {return this.HttpFileStream.open(this.path)}

  // Currently unused, may consider automatically adding to headers.
  etag() {
    const {size, mtime, birthtime} = this.stat
    return s.dashed(birthtime?.valueOf(), mtime?.valueOf(), size)
  }

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

  type() {return ContentTypeMap.main.guess(this.path)}

  setType(head) {
    const val = this.type()
    if (val) head.set(h.CONTENT_TYPE, val)
  }

  setTypeOpt(head) {
    if (!head.get(h.CONTENT_TYPE)) this.setType(head)
  }

  static async res(path, opt) {
    return (await this.open(path)).res(opt)
  }

  get Res() {return Response}
}

export class Srv {
  listen(opt) {
    const lis = Deno.listen(opt)
    console.log(`listening on http://${opt.hostname || `localhost`}:${opt.port}`)
    return this.serve(lis)
  }

  async serve(lis) {
    for await (const conn of lis) this.serveConn(conn)
  }

  async serveConn(conn) {
    for await (const event of Deno.serveHttp(conn)) {
      try {
        event.respondWith(this.res(event.request)).catch(this.onErr.bind(this))
      }
      catch (err) {
        this.onErr(err)
      }
    }
  }

  res() {return new Response()}

  onErr(err) {console.error(err)}
}

// Short for "filter".
export class Fil {
  constructor(val) {this.val = l.req(val, this.isTest)}
  isTest(val) {return l.isFun(val) || l.hasMeth(val, `test`)}
  test(val) {return l.isFun(this.val) ? this.val(val) : this.val.test(val)}
  get [Symbol.toStringTag]() {return this.constructor.name}
}

function join(one, two) {return s.inter(one, `/`, two)}
function urlDec(val) {return decodeURIComponent(l.reqStr(val))}
function unslash(val) {return blank(val, /^(?:[/\\])*/g)}
function undot(val) {return blank(val, /^(?:[.][/\\])*/g)}
function blank(val, reg) {return l.reqStr(val).replaceAll(reg, ``)}
function unixy(val) {return l.reqStr(val).replaceAll(`\\`, `/`)}
function hasDotDot(val) {return l.reqStr(val).includes(`..`)}

/*
Note: we don't have to convert `/` to `\` for Windows.
FS operations seem to work even with `/`.
*/
function toFsPath(val) {return urlDec(toPathname(val))}

// May consider moving to `url.mjs`.
function toPathname(val) {
  if (l.isStr(val) && u.RE_PATHNAME.test(val)) return val
  return u.toUrl(val).pathname
}
