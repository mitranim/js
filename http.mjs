/*
HTTP tools shared by servers and clients.
Server-specific tools are defined in:
- `http_srv.mjs`
- `http_bun.mjs`
- `http_deno.mjs`
*/

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as u from './url.mjs'
import * as c from './coll.mjs'
import * as d from './dom.mjs'
import * as pt from './path.mjs'

/*
The HTTP standard defines methods as case-sensitive. The `fetch` standard
requires `fetch` to normalize a very small set of known methods to uppercase,
and treat the rest as case-sensitive. `PATCH` is NOT on that list. Use these
constants to avoid having to remember the details.
*/
export const OPTIONS = `OPTIONS`
export const HEAD = `HEAD`
export const GET = `GET`
export const DELETE = `DELETE`
export const PUT = `PUT`
export const POST = `POST`
export const PATCH = `PATCH`

/*
Should include only headers likely to be used by browser apps.
Server-only headers should be placed in `http_srv.mjs`.
Note that `cache-control` is used in responses _and_ requests.
*/
export const HEADER_NAME_ACCEPT = `accept`
export const HEADER_NAME_CACHE_CONTROL = `cache-control`
export const HEADER_NAME_CONTENT_TYPE = `content-type`

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

export async function resOk(res) {
  if (l.isPromise(res)) res = await res
  l.reqInst(res, Response)
  if (res.ok) return res
  const text = await res.text()
  throw new ErrHttp((text || `unknown fetch error`), {response: res})
}

export function jsonDecode(...src) {
  return l.optStr(src[0]) ? JSON.parse(...src) : undefined
}

export function jsonEncode(...src) {return JSON.stringify(...src) ?? `null`}

export function isStatusInfo(val) {return l.isNat(val) && val >= 100 && val <= 199}
export function isStatusOk(val) {return l.isNat(val) && val >= 200 && val <= 299}
export function isStatusRedir(val) {return l.isNat(val) && val >= 300 && val <= 399}
export function isStatusClientErr(val) {return l.isNat(val) && val >= 400 && val <= 499}
export function isStatusServerErr(val) {return l.isNat(val) && val >= 500 && val <= 599}

// Works on instances of `ErrHttp` and instances of `Response`.
export function hasStatus(val, code) {return val?.status === l.reqNat(code)}

export class ErrHttp extends Error {
  constructor(msg, opt) {
    msg = l.renderLax(msg)
    l.optRec(opt)

    const res = opt?.response
    const status = l.optNat(res?.status) ?? l.optNat(opt?.status)
    if (status) msg = status + `: ` + msg

    super(msg, opt)
    this.status = status
    this.res = res
  }

  get name() {return this.constructor.name}
}

export function isErrAbort(val) {
  return l.isInst(val, AbortError) || val?.name === `AbortError`
}

/*
`AbortController..abort`, called without arguments, constructs an instance of
`DOMException` with the name `AbortError`. Its `.message` varies between JS
engines. At the time of writing, in Bun, its `.stack` is Safari-style rather
than V8-style, and thus inconsistent with other Bun errors. We define our own
abort error class and use our own messages to ensure consistency. `isErrAbort`
detects both error types.
*/
export class AbortError extends Error {
  constructor(msg) {super(l.renderLax(msg) || `operation aborted`)}
  get name() {return this.constructor.name}
}

const LIS = Symbol.for(`lis`)

// Tool for parent-child cancelation; similar to Go contexts.
export class Ctx extends AbortController {
  constructor(sig) {
    l.setProto(super(), new.target) // Safari bug workaround.
    this[LIS] = linkAbort(this, sig)
  }

  abort(err) {
    this[LIS]?.deinit()
    this[LIS] = undefined
    super.abort(err ?? new AbortError())
  }

  deinit() {if (!this.aborted) this.abort()}
}

export function linkAbort(abc, sig) {
  l.optInst(abc, AbortController)
  l.optInst(sig, AbortSignal)
  if (!abc || !sig) return undefined
  if (sig.aborted) {
    abc.abort(sig.reason ?? new AbortError())
    return undefined
  }
  return new d.ListenRef({
    self: abc, src: sig, type: `abort`, fun: onAbort, opt: {once: true},
  }).init()
}

function onAbort(eve) {this.abort(eve.target.reason ?? new AbortError())}

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
intended for servers. Placed here because in SSR / SPA hybrids,
this is used in routing code shared between server and client.
*/
export class ReqRou extends Rou {
  get Res() {return Response}

  constructor(req) {
    l.reqInst(req, Request)
    super(req.url)
    this.req = req
  }

  preflight() {return this.someMethod(HEAD, OPTIONS)}
  get(pat) {return this.match(GET, pat)}
  head(pat) {return this.match(HEAD, pat)}
  options(pat) {return this.match(OPTIONS, pat)}
  post(pat) {return this.match(POST, pat)}
  put(pat) {return this.match(PUT, pat)}
  patch(pat) {return this.match(PATCH, pat)}
  delete(pat) {return this.match(DELETE, pat)}

  match(met, pat) {return this.method(met) && this.pat(pat)}
  methods(fun) {return this.either(fun, this.notAllowed)}
  method(val) {return this.req.method === reqMethod(val)}
  someMethod(...val) {return val.some(this.method, this)}
  empty() {return new this.Res()}
  found(fun) {return this.either(fun, this.notFound)}

  notFound() {
    const {req: {method}, url: {pathname}, Res} = this
    return notFound({method, pathname, Res})
  }

  either(fun, def) {
    const val = this.call(fun)
    if (l.isPromise(val)) return this.eitherAsync(val, def)
    if (val) return val
    return this.call(def)
  }

  async eitherAsync(val, fun) {return (await val) || this.call(fun)}

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

export function notFound({method, pathname, Res}) {
  l.reqStr(method)
  l.reqStr(pathname)
  Res ??= Response
  return new Res(`not found: ${method} ${pathname}`, {status: 404})
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

  setName(val) {return (this.name = optCookieName(val)), this}
  setValue(val) {return (this.value = optCookieValue(val)), this}
  setPath(val) {return (this.path = optCookieAttr(val)), this}
  setDomain(val) {return (this.domain = optCookieAttr(val)), this}
  setExpires(val) {return (this.expires = l.optValidDate(val)), this}
  setMaxAge(val) {return (this.maxAge = l.optNat(val)), this}
  setSecure(val) {return (this.secure = l.optBool(val)), this}
  setHttpOnly(val) {return (this.httpOnly = l.optBool(val)), this}
  setSameSite(val) {return (this.sameSite = optCookieAttr(val)), this}

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
  install() {return (globalThis.document.cookie = this.toString()), this}

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
