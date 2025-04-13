/* eslint-env browser */

/*
This module has tools mostly for client code such as browsers apps. For server
code, see `http_srv.mjs`. The modules are split because browser apps are more
sensitive to code size. Our code is compatible with tree shaking, but apps
without a bundler or using `deno bundle` are still affected.
*/

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as u from './url.mjs'
import * as c from './coll.mjs'

export const GET = `GET`
export const HEAD = `HEAD`
export const OPTIONS = `OPTIONS`
export const POST = `POST`
export const PUT = `PUT`
export const PATCH = `PATCH`
export const DELETE = `DELETE`

export const HEADER_NAME_CACHE_CONTROL = `cache-control`
export const HEADER_NAME_CONTENT_TYPE = `content-type`
export const HEADER_NAME_ACCEPT = `accept`
export const HEADER_NAME_ETAG = `etag`
export const HEADER_NAME_ORIGIN = `origin`
export const HEADER_NAME_HOST = `host`
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

/*
The built-in `AbortError` is not a separate class but an instance of
`DOMException`. We're unable to detect it purely by `instanceof`.
*/
export function isErrAbort(val) {return l.isErr(val) && val.name === `AbortError`}

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

/*
Do not confuse this with the built-in `AbortError` thrown by `AbortSignal` and
some other APIs. The built-in `AbortError` is an instance of `DOMException`
rather than its own class. At the time of writing, the only built-in way to
throw it is via `AbortSignal.prototype.throwIfAborted`, with very little
browser support. Our own `AbortError` is an emulation. Our `isErrAbort` detects
both types.
*/
export class AbortError extends Error {
  constructor(msg) {super(l.renderLax(msg) || `signal has been aborted`)}
  get name() {return this.constructor.name}
}

export function toRou(val) {return l.toInst(val, Rou)}

// Short for "router".
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
  pre(val) {return s.isSubpath(val, this.url.pathname)}

  reqGroups() {
    const val = this.groups
    if (val) return val
    throw Error(`unexpected lack of named captures when routing ${this.url.pathname}`)
  }

  get Url() {return u.Url}
}

export function toReqRou(val) {return l.toInst(val, ReqRou)}

// Short for "request router".
export class ReqRou extends Rou {
  constructor(req) {
    l.reqInst(req, Request)
    super(req.url)
    this.req = req
  }

  /*
  Example (depends on app semantics):

    if (rou.preflight()) {
      return new Response(undefined, {headers: h.HEADERS_CORS_PROMISCUOUS})
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

  empty() {return new Response()}

  notFound() {
    const pat = this.url.pathname
    const met = this.req.method
    return new Response(`not found: ${met} ${pat}`, {status: 404})
  }

  notAllowed() {
    const pat = this.url.pathname
    const met = this.req.method
    return new Response(`method not allowed: ${met} ${pat}`, {status: 405})
  }

  call(fun) {return l.reqFun(fun).call(this, this)}

  // Shortcut for SPA routing.
  static from(loc, opt) {
    return new this(new Request(l.reqScalar(loc), l.optStruct(opt)))
  }
}

// Short for "context". Supports subcontexts / trees, like Go context.
export class Ctx extends AbortController {
  constructor(sig) {
    l.setProto(super(), new.target)
    this[sigKey] = undefined
    this.link(sig)
  }

  link(sig) {
    this.unlink()
    if (!l.optInst(sig, AbortSignal)) return this
    if (sig.aborted) return this.deinit(sig.reason), this

    this[sigKey] = sig
    sig.addEventListener(`abort`, this, {once: true})
    return this
  }

  unlink() {
    const sig = this[sigKey]
    if (sig) {
      this[sigKey] = undefined
      sig.removeEventListener(`abort`, this)
    }
    return this
  }

  handleEvent({type}) {if (type === `abort`) this.deinit(type)}
  sub() {return new this.constructor(this.req.signal)}
  abort(...val) {this.deinit(...val)}

  deinit(...val) {
    this.unlink()
    super.abort(...val)
  }
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
  install() {return document.cookie = this.toString(), this}

  reset(val) {
    if (l.isNil(val)) return this
    if (l.isStruct(val)) return this.resetFromStruct(val)
    throw l.errConvInst(val, this)
  }

  resetFromStruct(val) {
    l.reqStruct(val)
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

const sigKey = Symbol.for(`sig`)
function tuple(...src) {return Object.freeze(src)}

function isMethod(val) {return l.isValidStr(val)}
function reqMethod(val) {return isMethod(val) ? val : l.throwErrFun(val, isMethod)}

function isCookieName(val) {return l.isStr(val) && !/[;=]/.test(val)}
function optCookieName(val) {return l.opt(val, isCookieName)}

function isCookieValue(val) {return l.isStr(val) && !/[;]/.test(val)}
function optCookieValue(val) {return l.opt(val, isCookieValue)}

function isCookieAttr(val) {return l.isStr(val) && !/[\s;]/.test(val)}
function optCookieAttr(val) {return l.opt(val, isCookieAttr)}
