/*
This module has tools mostly for client code such as browsers apps. For server
code, see `http_srv.mjs`. The modules are split because browser apps are more
sensitive to code size. Our code is compatible with tree shaking, but apps
without a bundler or using `deno bundle` are still affected.
*/

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as u from './url.mjs'

export const GET = `GET`
export const HEAD = `HEAD`
export const OPTIONS = `OPTIONS`
export const POST = `POST`
export const PUT = `PUT`
export const PATCH = `PATCH`
export const DELETE = `DELETE`

export const HEAD_CACHE_CONTROL = `cache-control`
export const HEAD_CONTENT_TYPE = `content-type`
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
    throw l.errInst(val, this)
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
  Not called ".head" to avoid accidental confusion with HEAD,
  which could be a gotcha for `ReqBui`. It's better to avoid
  a ".head" method or property.
  */
  heads() {return this.headers || (this.headers = l.npo())}
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

export class ReqBui extends HttpBui {
  async fetch() {return new this.Res(await fetch(this.url, this))}
  async fetchOk() {return (await this.fetch()).okRes()}
  async fetchOkText() {return (await this.fetch()).okText()}
  async fetchOkJson() {return (await this.fetch()).okJson()}

  req() {return new Request(this.url, this)}
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

export class Rou extends l.Emp {
  constructor(req) {
    super()
    this.req = l.reqInst(req, Request)
    this.url = u.url(req.url)
    this.groups = undefined
  }

  get pathname() {return l.reqStr(this.url.pathname)}
  get method() {return l.reqStr(this.req.method)}

  /*
  Example (depends on app semantics):

    if (rou.preflight()) return h.resBui().corsAll().res()
  */
  preflight() {return this.someMeth(HEAD, OPTIONS)}

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

  /*
  Usage:

    if (rou.pre(`/api`)) return rou.found(routeApi)
  */
  pre(val) {return s.isSubpath(val, this.pathname)}

  pat(val) {
    if (l.isNil(val)) return this.patNil()
    if (l.isStr(val)) return this.patStr(val)
    if (l.isReg(val)) return this.patReg(val)
    throw l.errConv(val, `pattern`)
  }

  patNil() {return true}

  patStr(val) {
    this.groups = undefined
    return l.reqStr(val) === this.pathname
  }

  patReg(val) {
    const mat = this.pathname.match(l.reqReg(val))
    this.groups = (mat && mat.groups) || undefined
    return !!mat
  }

  reqGroups() {
    const val = this.groups
    if (val) return val
    throw Error(`unexpected lack of named captures when routing ${this.pathname}`)
  }

  run(fun) {return l.reqFun(fun).call(this, this)}

  either(fun, def) {
    const val = this.run(fun)
    if (l.isPromise(val)) return this.eitherAsync(val, def)
    if (val) return val
    return this.run(def)
  }

  async eitherAsync(val, fun) {return (await val) || fun.call(this, this)}

  notFound() {
    const {pathname: path, method: met} = l.reqInst(this, Rou)
    return new Response(`not found: ${met} ${path}`, {status: 404})
  }

  notAllowed() {
    const {pathname: path, method: met} = l.reqInst(this, Rou)
    return new Response(`method not allowed: ${met} ${path}`, {status: 405})
  }

  // Needs a more specific name.
  static from(loc, opt) {
    return new this(new Request(l.reqScalar(loc), l.optStruct(opt)))
  }
}

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
  abort() {return this.deinit()}
  deinit() {return this.unlink(), super.abort()}
}

export function resNotAllowed(rou) {
  const {pathname: path, method: met} = l.reqInst(rou, Rou)
  return new Response(`method not allowed: ${met} ${path}`, {status: 405})
}

export function resNotFound(rou) {
  const {pathname: path, method: met} = l.reqInst(rou, Rou)
  return new Response(`not found: ${met} ${path}`, {status: 404})
}

export function resEmpty() {return new Response()}

export function resErr(err) {
  return new Response(
    (err && (err.stack || err.message)) || `unknown error`,
    {status: 500},
  )
}

// Also see `Cookie.fromPairs`.
export function cookieSplitPairs(val) {
  val = l.laxStr(val)
  return s.split(s.trim(val), /\s*;\s*/g).filter(l.id)
}

// Also see `Cookie.fromPairs`.
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

  lax() {return this.setSameSite(`lax`)}
  expired() {return this.setValue(this.value || ``).setMaxAge(0)}
  durable() {return this.setMaxAge(60 * 60 * 24 * 365 * 17)}
  install() {return document.cookie = this, this}

  reset(val) {
    if (l.isNil(val)) return this
    if (l.isStruct(val)) return this.resetFromStruct(val)
    throw l.errInst(val, this)
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

  join(buf, key, val) {
    l.reqStr(buf)
    if (l.isNil(val)) return buf
    return (buf && buf + `; `) + l.reqStr(key) + `=` + l.render(val)
  }

  toString() {
    let buf = this.nameValue()
    if (!buf) return ``

    buf = this.join(buf, `path`, this.path)
    buf = this.join(buf, `domain`, this.domain)
    buf = this.join(buf, `expires`, this.expires && this.expires.toUTCString())
    buf = this.join(buf, `max-age`, this.maxAge)
    buf = this.join(buf, `secure`, this.secure)
    buf = this.join(buf, `http-only`, this.httpOnly)
    buf = this.join(buf, `same-site`, this.sameSite)
    return buf
  }

  static fromPair(src) {
    const pair = cookieSplitPair(src)
    return new this().setName(pair[0]).setValue(pair[1])
  }

  static fromPairs(src) {
    return cookieSplitPairs(src).map(this.fromPair, this)
  }

  static toMap(src) {
    const buf = new Map()
    for (const val of this.fromPairs(src)) buf.set(val.name, val)
    return buf
  }

  static del(name) {
    if (!optCookieName(name)) return

    new this()
      .setName(name).expired().install()
      .setPath(`/`).install()
  }
}

/* Internal */

// Semi-placeholder. May tighten up.
function isHeadKey(val) {return l.isStr(val) && val !== ``}
function reqHeadKey(val) {return isHeadKey(val) ? val : l.convFun(val, isHeadKey)}

// Semi-placeholder. May tighten up.
function isMethod(val) {return l.isStr(val)}
function reqMethod(val) {return isMethod(val) ? val : l.convFun(val, isMethod)}

export function reqBody(val) {return l.reqOneOf(val, bodyFuns)}
export function optBody(val) {return l.optOneOf(val, bodyFuns)}
export const bodyFuns = [l.isScalar, isUint8Array, isReadableStream, isFormData]

function isUint8Array(val) {return l.isInst(val, Uint8Array)}
function isReadableStream(val) {return l.isInst(val, ReadableStream)}
function isFormData(val) {return typeof FormData === `function` && l.isInst(val, FormData)}

const sigKey = Symbol.for(`sig`)

function isCookieName(val) {return l.isStr(val) && !/[;=]/.test(val)}
function optCookieName(val) {return l.opt(val, isCookieName)}

function isCookieValue(val) {return l.isStr(val) && !/[;]/.test(val)}
function optCookieValue(val) {return l.opt(val, isCookieValue)}

function isCookieAttr(val) {return l.isStr(val) && !/[\s;]/.test(val)}
function optCookieAttr(val) {return l.opt(val, isCookieAttr)}
