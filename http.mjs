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

export const HEAD_CACHE_CONTROL = `cache-control`
export const HEAD_CONTENT_TYPE = `content-type`
export const HEAD_ETAG = `etag`
export const HEAD_ACCEPT = `accept`
export const HEAD_ORIGIN = `origin`
export const HEAD_HOST = `host`

export const TYPE_TEXT = `text/plain`
export const TYPE_HTML = `text/html`
export const TYPE_JSON = `application/json`
export const TYPE_FORM = `application/x-www-form-urlencoded`
export const TYPE_MULTI = `multipart/form-data`

export function jsonDecode(val) {return l.laxStr(val) ? JSON.parse(val) : null}
export function jsonEncode(val) {return JSON.stringify(l.isNil(val) ? null : val)}

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

// Usable on instances of `HttpErr` and instances of `Response`.
export function hasStatus(val, code) {return l.reqNat(code) === getStatus(val)}
export function getStatus(val) {return l.get(val, `status`)}

/*
The built-in `AbortError` is not a separate class but an instance of
`DOMException`. We're unable to detect it purely by `instanceof`.
*/
export function isErrAbort(val) {
  return l.isInst(val, Error) && val.name === `AbortError`
}

// TODO rename to `ErrHttp`.
export class HttpErr extends Error {
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
various APIs using it. The built-in `AbortError` is an instance of
`DOMException` instead of being its own class. At the time of writing, the only
built-in way to throw it is via `AbortSignal.prototype.throwIfAborted`, with
very little browser support. Our own `AbortError` is an emulation. Our
`isErrAbort` detects both types.
*/
export class AbortError extends Error {
  constructor(msg) {super(l.renderLax(msg) || `signal has been aborted`)}
  get name() {return this.constructor.name}
}

/*
"Bui" is short for "builder". This is a common component of `ReqBui` and
`ResBui`, providing shortcuts for building HTTP headers.
*/
export class HttpBui extends l.Emp {
  constructor(val) {super().mut(val)}

  mut(val) {
    if (l.isNil(val)) return this
    if (l.isStruct(val)) return this.mutFromStruct(val)
    throw l.errConvInst(val, this)
  }

  mutFromStruct(val) {
    for (const key of l.structKeys(val)) {
      if (key === `headers`) this.headMut(val[key])
      else this[key] = val[key]
    }
    return this
  }

  type(val) {return this.headSet(HEAD_CONTENT_TYPE, val)}
  typeText() {return this.type(TYPE_TEXT)}
  typeHtml() {return this.type(TYPE_HTML)}
  typeJson() {return this.type(TYPE_JSON)}
  typeForm() {return this.type(TYPE_FORM)}
  typeMulti() {return this.type(TYPE_MULTI)}

  /*
  Not called ".head" to avoid accidental confusion with HEAD,  which could be a gotcha for `ReqBui`. It's better to avoid  a ".head" method or property.  */  heads() {return this.headers || (this.headers = l.npo())}
  headHas(key) {return l.hasOwn(this.headers, reqHeadKey(key))}
  headGet(key) {return this.headHas(key) ? this.headers[key] : ``}

  headSet(key, val) {
    if (l.isNil(val)) return this.headDelete(key)
    this.heads()[reqHeadKey(key)] = this.headRender(val)
    return this
  }

  headSetAll(key, val) {
    this.headDelete(key)
    if (l.optArr(val)) for (val of val) this.headAppend(key, val)
    return this
  }

  headSetAny(key, val) {
    if (l.isArr(val)) return this.headSetAll(key, val)
    return this.headSet(key, val)
  }

  headSetOpt(key, val) {
    reqHeadKey(key)
    val = this.headRender(val)
    if (this.headHas(key) || !val) return this
    return this.headSet(key, val)
  }

  headAppend(key, val) {
    reqHeadKey(key)
    if (l.isNil(val)) return this
    val = this.headRender(val)

    const head = this.heads()
    const prev = head[key]
    head[key] = (prev && val) ? (prev + `, ` + val) : (prev || val)
    return this
  }

  headAppendAll(key, val) {
    reqHeadKey(key)
    if (l.optArr(val)) for (val of val) this.headAppend(key, val)
    return this
  }

  headAppendAny(key, val) {
    if (l.isArr(val)) return this.headAppendAll(key, val)
    return this.headAppend(key, val)
  }

  headDelete(key) {
    if (this.headHas(key)) delete this.headers[key]
    return this
  }

  headMut(val) {
    if (l.isNil(val)) return this
    if (l.isIter(val)) return this.headMutFromIter(val)
    if (l.isStruct(val)) return this.headMutFromStruct(val)
    throw l.errConv(val, `head`)
  }

  headMutFromIter(src) {
    for (const [key, val] of l.reqIter(src)) this.headAppendAny(key, val)
    return this
  }

  headMutFromStruct(src) {
    for (const key of l.structKeys(src)) this.headAppendAny(key, src[key])
    return this
  }

  headRender(val) {return l.renderLax(val).trim()}
}

export function reqBui(val) {return new ReqBui(val)}

// Short for "request builder".
export class ReqBui extends HttpBui {
  async fetch() {return new this.Res(await fetch(l.reqScalar(this.url), this))}
  async fetchOk() {return (await this.fetch()).okRes()}
  async fetchOkText() {return (await this.fetch()).okText()}
  async fetchOkJson() {return (await this.fetch()).okJson()}

  req() {return new Request(l.reqScalar(this.url), this)}
  meth(val) {return this.method = l.laxStr(val) || undefined, this}
  get() {return this.meth(GET)}
  post() {return this.meth(POST)}
  put() {return this.meth(PUT)}
  patch() {return this.meth(PATCH)}
  delete() {return this.meth(DELETE)}

  to(val) {return this.url = l.optScalar(val), this}
  path(...val) {return this.initUrl().setPath(...val), this}
  query(val) {return this.initUrl().setQuery(val), this}
  initUrl() {return this.url = u.toUrl(this.url)}

  sig(val) {return this.signal = l.optInst(val, AbortSignal), this}
  inp(val) {return this.body = optBody(val), this}
  json(val) {return this.inp(jsonEncode(val)).typeJson()}

  get Res() {return Res}
}

export function resBui(val) {return new ResBui(val)}

// Short for "response builder".
export class ResBui extends HttpBui {
  res() {return new this.Res(this.body, this)}
  inp(val) {return this.body = val, this}
  text(val) {return this.inp(val).typeText()}
  html(val) {return this.inp(val).typeHtml()}
  json(val) {return this.inp(jsonEncode(val)).typeJson()}
  code(val) {return this.status = l.optNat(val), this}
  isRedir() {return isStatusRedir(this.status)}
  redirMoved(val) {return this.code(301).headSet(`location`, val)}
  redirFound(val) {return this.code(302).headSet(`location`, val)}
  redirSeeOther(val) {return this.code(303).headSet(`location`, val)}
  redirTemp(val) {return this.code(307).headSet(`location`, val)}
  redirPerm(val) {return this.code(308).headSet(`location`, val)}

  /*
  For an actual implementation of an event stream, see the following:  `WritableReadableStream`, `Broad`, `LiveBroad`.  */  typeEventStream() {
    return this.type(`text/event-stream`).headSet(`transfer-encoding`, `utf-8`)
  }

  corsCredentials() {return this.headSet(`access-control-allow-credentials`, `true`)}
  corsHeaders(...val) {return this.headSetAll(`access-control-allow-headers`, val)}
  corsMethods(...val) {return this.headSetAll(`access-control-allow-methods`, val)}
  corsOrigin(val) {return this.headSet(`access-control-allow-origin`, val)}

  /*
  Note: `content-type` is whitelisted by default but not redundant here.  Default has restrictions on allowed values.  */  corsHeadersCommon() {
    return this.corsHeaders(HEAD_CONTENT_TYPE, HEAD_CACHE_CONTROL)
  }

  corsMethodsAll() {
    return this.corsMethods(GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE)
  }

  corsOriginAll() {return this.corsOrigin(`*`)}

  corsAll() {
    return this
      .corsCredentials()
      .corsHeadersCommon()
      .corsMethodsAll()
      .corsOriginAll()
  }

  get Res() {return Response}
}

export class Res extends Response {
  constructor(one, two) {
    // This non-standard clause is used by `ReqBui`.
    if (l.isInst(one, Response)) {
      l.reqNil(two)
      super(optBody(one.body), one)
      this.res = one
      return
    }

    // Allows to instantiate from an existing response but override the body.
    if (l.isInst(two, Response)) {
      super(optBody(one), two)
      this.res = two
      return
    }

    // Like standard constructor but with stricter type checks.
    super(optBody(one), l.optStruct(two))
    this.res = this
  }

  get redirected() {return this.res.redirected}
  get type() {return this.res.type}
  get url() {return this.res.url}

  async okRes() {
    if (!this.ok) {
      const msg = (await this.text()) || `unknown fetch error`
      throw new this.Err(msg, this.status, this)
    }
    return this
  }

  async okText() {return (await this.okRes()).text()}
  async okJson() {return (await this.okRes()).json()}

  get Err() {return HttpErr}
}

export function toRou(val) {return l.toInst(val, Rou)}

// Short for "router".
export class Rou extends l.Emp {
  constructor(url) {
    super()
    this.url = l.toInst(url, this.Url)
    this.groups = undefined
  }

  get pathname() {return l.reqStr(this.url.pathname)}
  
  get  hostedPathname() {return l.reqStr(u.urlJoin(this.url.host, this.url.pathname).toString())}

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
    return l.reqStr(val) === this.pathname || l.reqStr(val) === this.hostedPathname
  }

  // Short for "regular expression".
  reg(val) {
    this.clear()
    console.log(this.hostedPathname);
    let mat = this.pathname.match(l.reqReg(val))
    if (!mat) mat = this.hostedPathname.match(l.reqReg(val))
    this.groups = (mat && mat.groups) || undefined
    return !!mat
  }

  // Short for "prefix".
  pre(val) {return s.isSubpath(val, this.pathname) || s.isSubpath(val, this.hostedPathname) }

  reqGroups() {
    const val = this.groups
    if (val) return val
    throw Error(`unexpected lack of named captures when routing ${this.pathname}`)
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

  get method() {return l.reqStr(this.req.method)}
  get signal() {return this.req.signal}

  /*
  Example (depends on app semantics):
    if (rou.preflight()) return h.resBui().corsAll().res()  */  preflight() {return this.someMeth(HEAD, OPTIONS)}

  match(met, pat) {return this.meth(met) && this.pat(pat)}
  found(fun) {return this.either(fun, this.notFound)}
  methods(fun) {return this.either(fun, this.notAllowed)}

  get(pat) {return this.match(GET, pat)}
  head(pat) {return this.match(HEAD, pat)}
  options(pat) {return this.match(OPTIONS, pat)}
  post(pat) {return this.match(POST, pat)}
  put(pat) {return this.match(PUT, pat)}
  patch(pat) {return this.match(PATCH, pat)}
  delete(pat) {return this.match(DELETE, pat)}

  meth(val) {return this.method === reqMethod(val)}
  someMeth(...val) {return val.some(this.meth, this)}

  either(fun, def) {
    const val = this.call(fun)
    if (l.isPromise(val)) return this.eitherAsync(val, def)
    if (val) return val
    return this.call(def)
  }

  async eitherAsync(val, fun) {return (await val) || this.call(fun)}

  empty() {return new Response()}

  notFound() {
    const {pathname: path, method: met} = l.reqInst(this, Rou)
    return new Response(`not found: ${met} ${path}`, {status: 404})
  }

  notAllowed() {
    const {pathname: path, method: met} = l.reqInst(this, Rou)
    return new Response(`method not allowed: ${met} ${path}`, {status: 405})
  }

  call(fun) {return l.reqFun(fun).call(this, this)}

  // Shortcut for SPA routing.
  static from(loc, opt) {
    return new this(new Request(l.reqScalar(loc), l.optStruct(opt)))
  }
}

// Short for "context". Supports chains/trees, like Go context.
export class Ctx extends AbortController {
  constructor(sig) {
    l.setProto(super(), new.target)
    this[sigKey] = undefined
    this.link(sig)
  }

  link(sig) {
    this.unlink()
    if (!l.optInst(sig, AbortSignal)) return this
    if (sig.aborted) return this.deinit(), this

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

  handleEvent({type}) {if (type === `abort`) this.deinit()}
  sub() {return new this.constructor(this.signal)}
  abort() {this.deinit()}

  deinit() {
    this.unlink()
    super.abort()
  }
}

// Used internally by `Cookies`.
export function cookieSplitPairs(val) {
  val = l.laxStr(val)
  return s.split(s.trim(val), /\s*;\s*/g).filter(l.id)
}

// Used internally by `Cookies` and `Cookie`.
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
    return this  }

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
  install() {return document.cookie = this, this}

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
    const domain = window.location?.hostname

    return this.expired(key)
      .install()
      .root().install()
      .setDomain(domain).install()
      .setDomainSub(domain).install()
  }
}

export class Cookies extends c.ClsColl {
  get cls() {return Cookie}

  getVal(key) {return this.get(key)?.value}
  setVal(key, val) {return this.addOpt(this.cls.make(key, val))}

  mut(src) {
    if (l.isStr(src)) return this.mutFromStr(src)
    return super.mut(src)
  }

  mutFromStr(src) {
    for (src of cookieSplitPairs(src)) {
      src = cookieSplitPair(src)
      this.setVal(src[0], src[1])
    }
    return this
  }

  static native() {return new this(window.document?.cookie)}
}

/* Internal */

const sigKey = Symbol.for(`sig`)

// Semi-placeholder. May tighten up.
function isHeadKey(val) {return l.isStr(val) && val !== ``}
function reqHeadKey(val) {return isHeadKey(val) ? val : l.throwErrFun(val, isHeadKey)}

// Semi-placeholder. May tighten up.
function isMethod(val) {return l.isStr(val)}
function reqMethod(val) {return isMethod(val) ? val : l.throwErrFun(val, isMethod)}

export function reqBody(val) {return l.reqOneOf(val, bodyFuns)}
export function optBody(val) {return l.optOneOf(val, bodyFuns)}
export const bodyFuns = [l.isScalar, isUint8Array, isReadableStream, isFormData]

function isUint8Array(val) {return l.isInst(val, Uint8Array)}
function isReadableStream(val) {return l.isInst(val, ReadableStream)}
function isFormData(val) {return typeof FormData === `function` && l.isInst(val, FormData)}

function isCookieName(val) {return l.isStr(val) && !/[;=]/.test(val)}
function optCookieName(val) {return l.opt(val, isCookieName)}
// function reqCookieName(val) {return l.req(val, isCookieName)}

function isCookieValue(val) {return l.isStr(val) && !/[;]/.test(val)}
function optCookieValue(val) {return l.opt(val, isCookieValue)}
// function reqCookieValue(val) {return l.req(val, isCookieValue)}

function isCookieAttr(val) {return l.isStr(val) && !/[\s;]/.test(val)}
function optCookieAttr(val) {return l.opt(val, isCookieAttr)}
// function reqCookieAttr(val) {return l.req(val, isCookieAttr)}
