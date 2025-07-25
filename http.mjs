/*
This module contains tools intended mostly for client code such as browsers
apps. For HTTP-adjacent tools intended for server code, see `io_shared.mjs`
and the engine-specific modules such as `io_deno.mjs` and `io_bun.mjs`.
*/

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as u from './url.mjs'
import * as c from './coll.mjs'
import * as d from './dom.mjs'
import * as pt from './path.mjs'

export const GET = `GET`
export const HEAD = `HEAD`
export const OPTIONS = `OPTIONS`
export const POST = `POST`
export const PUT = `PUT`
export const PATCH = `PATCH`
export const DELETE = `DELETE`

export const HEADER_NAME_ACCEPT = `accept`
export const HEADER_NAME_ORIGIN = `origin`
export const HEADER_NAME_HOST = `host`
export const HEADER_NAME_ETAG = `etag`
export const HEADER_NAME_CACHE_CONTROL = `cache-control`
export const HEADER_NAME_CONTENT_TYPE = `content-type`
export const HEADER_NAME_ACCEPT_ENCODING = `accept-encoding`
export const HEADER_NAME_CONTENT_ENCODING = `content-encoding`
export const HEADER_NAME_CORS_CREDENTIALS = `access-control-allow-credentials`
export const HEADER_NAME_CORS_HEADERS = `access-control-allow-headers`
export const HEADER_NAME_CORS_METHODS = `access-control-allow-methods`
export const HEADER_NAME_CORS_ORIGIN = `access-control-allow-origin`

export const MIME_TYPE_TEXT = `text/plain`
export const MIME_TYPE_HTML = `text/html`
export const MIME_TYPE_JSON = `application/json`
export const MIME_TYPE_FORM = `application/x-www-form-urlencoded`
export const MIME_TYPE_MULTI = `multipart/form-data`

export const HEADER_TEXT = tuple(HEADER_NAME_CONTENT_TYPE, MIME_TYPE_TEXT)
export const HEADER_HTML = tuple(HEADER_NAME_CONTENT_TYPE, MIME_TYPE_HTML)
export const HEADER_JSON = tuple(HEADER_NAME_CONTENT_TYPE, MIME_TYPE_JSON)

export const HEADER_JSON_ACCEPT = tuple(HEADER_NAME_ACCEPT, MIME_TYPE_JSON)
export const HEADERS_JSON_INOUT = tuple(HEADER_JSON, HEADER_JSON_ACCEPT)

export const HEADERS_CORS_PROMISCUOUS = tuple(
  tuple(HEADER_NAME_CORS_ORIGIN, `*`),
  tuple(HEADER_NAME_CORS_METHODS, GET),
  tuple(HEADER_NAME_CORS_METHODS, HEAD),
  tuple(HEADER_NAME_CORS_METHODS, OPTIONS),
  tuple(HEADER_NAME_CORS_METHODS, POST),
  tuple(HEADER_NAME_CORS_METHODS, PUT),
  tuple(HEADER_NAME_CORS_METHODS, PATCH),
  tuple(HEADER_NAME_CORS_METHODS, DELETE),
  tuple(HEADER_NAME_CORS_CREDENTIALS, `true`),
  tuple(HEADER_NAME_CORS_HEADERS, HEADER_NAME_CONTENT_TYPE),
  tuple(HEADER_NAME_CORS_HEADERS, HEADER_NAME_CACHE_CONTROL),
)

export async function resOk(res) {
  if (l.isPromise(res)) res = await res
  l.reqInst(res, Response)
  if (res.ok) return res
  const text = await res.text()
  throw new ErrHttp((text || `unknown fetch error`), res.status, res)
}

export function jsonDecode(...src) {
  return l.optStr(src[0]) ? JSON.parse(...src) : undefined
}

export function jsonEncode(...src) {return JSON.stringify(...src) ?? `null`}

// True if given HTTP status code is between 100 and 199 inclusive.
export function isStatusInfo(val) {return l.isNat(val) && val >= 100 && val <= 199}

// True if given HTTP status code is between 200 and 299 inclusive.
export function isStatusOk(val) {return l.isNat(val) && val >= 200 && val <= 299}

// True if given HTTP status code is between 300 and 399 inclusive.
export function isStatusRedir(val) {return l.isNat(val) && val >= 300 && val <= 399}

// True if given HTTP status code is between 400 and 499 inclusive.
export function isStatusClientErr(val) {return l.isNat(val) && val >= 400 && val <= 499}

// True if given HTTP status code is between 500 and 599 inclusive.
export function isStatusServerErr(val) {return l.isNat(val) && val >= 500 && val <= 599}

// Usable on instances of `ErrHttp` and instances of `Response`.
export function hasStatus(val, code) {return l.reqNat(code) === getStatus(val)}
export function getStatus(val) {return l.get(val, `status`)}

export class ErrHttp extends Error {
  constructor(msg, status, res) {
    l.reqStr(msg)
    l.reqNat(status)
    l.optInst(res, Response)

    super((status ? status + `: ` : ``) + msg)
    this.status = status
    this.res = res
  }

  get name() {return this.constructor.name}
}

export function isErrAbort(val) {return val?.name === `AbortError`}

/*
`AbortController..abort`, called without arguments, constructs an instance of
`DOMException` with the name `AbortError`. Its `.message` varies between JS
engines. At the time of writing, in Bun, its `.stack` is Safari-style rather
than V8-style; in other words, inconsistent with other errors. We define our
own abort error class and use our own messages to ensure consistency.
Our `isErrAbort` detects both error types.
*/
export class AbortError extends Error {
  constructor(msg) {super(l.renderLax(msg) || `operation aborted`)}
  get name() {return this.constructor.name}
}

const lis = Symbol.for(`lis`)

// Tool for parent-child cancelation; similar to Go contexts.
export class Ctx extends AbortController {
  constructor(sig) {
    l.setProto(super(), new.target) // Safari bug workaround.
    this[lis] = linkAbort(this, sig)
  }

  abort(err) {
    this[lis]?.deinit()
    super.abort(err ?? new AbortError())
  }

  deinit() {this.abort()}
}

export function linkAbort(abc, sig) {
  l.reqInst(abc, AbortController)
  l.optInst(sig, AbortSignal)
  if (!sig) return undefined
  if (sig.aborted) {
    abc.abort(sig.reason ?? new AbortError())
    return undefined
  }
  return new d.ListenRef(abc, sig, `abort`, onAbort, {once: true}).init()
}

/* eslint-disable no-invalid-this */
function onAbort(eve) {this.abort(eve.target.reason ?? new AbortError())}
/* eslint-enable no-invalid-this */

export function toRou(val) {return l.toInst(val, Rou)}

/*
Short for "router". A low-level procedural-style router suitable for SPA.
See `ReqRou` for a router suitable for servers.
*/
export class Rou extends l.Emp {
  constructor(url) {
    super()
    this.url = l.toInst(url, this.Url)
    this.groups = undefined
  }

  clear() {this.groups = undefined}

  // Short for "pattern".
  pat(val) {
    if (l.isNil(val)) return this.clear(), true
    if (l.isStr(val)) return this.exa(val)
    if (l.isReg(val)) return this.reg(val)
    throw l.errConv(val, `pattern`)
  }

  // Short for "exact".
  exa(val) {
    this.clear()
    return l.reqStr(val) === this.url.pathname
  }

  // Short for "regular expression".
  reg(val) {
    this.clear()
    const mat = this.url.pathname.match(l.reqReg(val))
    this.groups = mat?.groups
    return !!mat
  }

  // Short for "prefix".
  pre(val) {return pt.isSubOf(this.url.pathname, val)}

  reqGroups() {
    const val = this.groups
    if (val) return val
    throw Error(`unexpected lack of named captures when routing ${this.url.pathname}`)
  }

  get Url() {return u.Url}
}

export function toReqRou(val) {return l.toInst(val, ReqRou)}

/*
Short for "request router". A low-level procedural-style router
intended for servers.
*/
export class ReqRou extends Rou {
  get Res() {return Response}

  constructor(req) {
    l.reqInst(req, Request)
    super(req.url)
    this.req = req
  }

  /*
  Example (depends on app semantics):

    if (rou.preflight()) {
      return new this.Res(undefined, {headers: h.HEADERS_CORS_PROMISCUOUS})
    }
  */
  preflight() {return this.someMethod(HEAD, OPTIONS)}

  match(met, pat) {return this.method(met) && this.pat(pat)}
  found(fun) {return this.either(fun, this.notFound)}
  methods(fun) {return this.either(fun, this.notAllowed)}

  get(pat) {return this.match(GET, pat)}
  head(pat) {return this.match(HEAD, pat)}
  options(pat) {return this.match(OPTIONS, pat)}
  post(pat) {return this.match(POST, pat)}
  put(pat) {return this.match(PUT, pat)}
  patch(pat) {return this.match(PATCH, pat)}
  delete(pat) {return this.match(DELETE, pat)}

  method(val) {return this.req.method === reqMethod(val)}
  someMethod(...val) {return val.some(this.method, this)}

  either(fun, def) {
    const val = this.call(fun)
    if (l.isPromise(val)) return this.eitherAsync(val, def)
    if (val) return val
    return this.call(def)
  }

  async eitherAsync(val, fun) {return (await val) || this.call(fun)}

  empty() {return new this.Res()}

  notFound() {return notFound.call(this, this.req.method, this.url.pathname)}

  notAllowed() {
    const pat = this.url.pathname
    const met = this.req.method
    return new this.Res(`method not allowed: ${met} ${pat}`, {status: 405})
  }

  call(fun) {return l.reqFun(fun).call(this, this)}

  // Shortcut for SPA routing.
  static from(loc, opt) {
    return new this(new Request(l.reqScalar(loc), l.optRec(opt)))
  }
}

export function notFound(path, meth) {
  l.reqStr(path)
  l.reqStr(meth)
  const Res = this.Res ?? Response // eslint-disable-line no-invalid-this
  return new Res(`not found: ${meth} ${path}`, {status: 404})
}

// Used internally by `Cookies`.
export function cookieSplitPairs(val) {
  val = l.laxStr(val)
  return s.split(s.trim(val), /\s*;\s*/g).filter(l.id)
}

// Used internally, exported for testing.
export function cookieSplitPair(src) {
  src = l.reqStr(src).trim()
  if (!src) throw TypeError(`unexpected empty cookie pair`)
  if (src.includes(`;`)) throw TypeError(`invalid cookie pair ${l.show(src)}`)

  const ind = src.indexOf(`=`)
  if (!(ind >= 0)) return [``, src]

  const key = src.slice(0, ind)
  const val = src.slice(ind + 1)
  return [key.trim(), val.trim()]
}

export function cook(val) {return new Cookie(val)}

export class Cookie extends l.Emp {
  constructor(val) {super().clear().reset(val)}

  clear() {
    this.name = undefined
    this.value = undefined
    this.path = undefined
    this.domain = undefined
    this.expires = undefined
    this.maxAge = undefined
    this.secure = undefined
    this.httpOnly = undefined
    this.sameSite = undefined
    return this
  }

  setName(val) {return this.name = optCookieName(val), this}
  setValue(val) {return this.value = optCookieValue(val), this}
  setPath(val) {return this.path = optCookieAttr(val), this}
  setDomain(val) {return this.domain = optCookieAttr(val), this}
  setExpires(val) {return this.expires = l.optValidDate(val), this}
  setMaxAge(val) {return this.maxAge = l.optNat(val), this}
  setSecure(val) {return this.secure = l.optBool(val), this}
  setHttpOnly(val) {return this.httpOnly = l.optBool(val), this}
  setSameSite(val) {return this.sameSite = optCookieAttr(val), this}

  setDomainSub(val) {
    if (l.isNil(val)) return this.setDomain()
    return this.setDomain(s.optPre(val, `.`))
  }

  pk() {return this.name}
  isValid() {return !!this.name && l.isSome(this.value)}
  lax() {return this.setSameSite(`lax`)}
  root() {return this.setPath(`/`)}
  expired() {return this.setValue(this.value || ``).setExpires().setMaxAge(0)}
  durable() {return this.setMaxAge(60 * 60 * 24 * 365 * 17)}
  install() {return globalThis.document.cookie = this.toString(), this}

  reset(val) {
    if (l.isNil(val)) return this
    if (l.isRec(val)) return this.resetFromStruct(val)
    throw l.errConvInst(val, this)
  }

  resetFromStruct(val) {
    l.reqRec(val)
    this.setName(val.name)
    this.setValue(val.value)
    this.setPath(val.path)
    this.setDomain(val.domain)
    this.setExpires(val.expires)
    this.setMaxAge(val.maxAge)
    this.setSecure(val.secure)
    this.setHttpOnly(val.httpOnly)
    this.setSameSite(val.sameSite)
    return this
  }

  clone() {return new this.constructor(this)}

  nameValue() {
    const {name, value} = this
    if (l.isNil(name) || l.isNil(value)) return ``
    return l.reqStr(name) + `=` + l.reqStr(value)
  }

  // Implemented as a method to allow overrides.
  join(out, key, val) {
    l.reqStr(out)
    if (l.isNil(val)) return out
    return (out && out + `; `) + l.reqStr(key) + `=` + l.render(val)
  }

  toString() {
    let out = this.nameValue()
    if (!out) return ``

    out = this.join(out, `path`, this.path)
    out = this.join(out, `domain`, this.domain)
    out = this.join(out, `expires`, this.expires && this.expires.toUTCString())
    out = this.join(out, `max-age`, this.maxAge)
    out = this.join(out, `secure`, this.secure)
    out = this.join(out, `http-only`, this.httpOnly)
    out = this.join(out, `same-site`, this.sameSite)
    return out
  }

  setPair(src) {
    src = cookieSplitPair(src)
    return this.setName(src[0]).setValue(src[1])
  }

  static make(key, val) {return new this().setName(key).setValue(val)}
  static expired(key) {return this.make(key).expired()}

  // TODO browser test.
  static delete(key) {
    const domain = globalThis.location?.hostname

    return this.expired(key)
      .install()
      .root().install()
      .setDomain(domain).install()
      .setDomainSub(domain).install()
  }
}

export class Cookies extends c.ClsColl {
  get cls() {return Cookie}

  reqKey(key) {return l.reqStr(key)}
  getVal(key) {return this.get(key)?.value}
  setVal(key, val) {return this.addOpt(this.cls.make(key, val))}

  mut(src) {
    if (l.isStr(src)) return this.mutFromStr(src)
    return super.mut(src)
  }

  /*
  When a cookie is repeated, the last value is "accidentally" preferred.
  This seems consistent with cookie decoding behavior in Go, and possibly
  in other server-side implementations.
  */
  mutFromStr(src) {
    for (src of cookieSplitPairs(src)) {
      src = cookieSplitPair(src)
      this.setVal(src[0], src[1])
    }
    return this
  }

  toString() {return this.toArray().join(`; `)}
  static native() {return new this(globalThis.document?.cookie)}
}

/* Internal */

function tuple(...src) {return Object.freeze(src)}

function isMethod(val) {return l.isValidStr(val)}
function reqMethod(val) {return isMethod(val) ? val : l.throwErrFun(val, isMethod)}

function isCookieName(val) {return l.isStr(val) && !/[;=]/.test(val)}
function optCookieName(val) {return l.opt(val, isCookieName)}

function isCookieValue(val) {return l.isStr(val) && !/[;]/.test(val)}
function optCookieValue(val) {return l.opt(val, isCookieValue)}

function isCookieAttr(val) {return l.isStr(val) && !/[\s;]/.test(val)}
function optCookieAttr(val) {return l.opt(val, isCookieAttr)}
