import * as l from './lang.mjs'
import * as u from './url.mjs'

export const GET = `GET`
export const HEAD = `HEAD`
export const OPTIONS = `OPTIONS`
export const POST = `POST`
export const PUT = `PUT`
export const PATCH = `PATCH`
export const DELETE = `DELETE`

export const CONTENT_TYPE = `content-type`
export const TYPE_HTML = `text/html`
export const TYPE_JSON = `application/json`
export const TYPE_FORM = `application/x-www-form-urlencoded`
export const TYPE_MULTI = `multipart/form-data`

export function jsonDecode(val) {return l.laxStr(val) ? JSON.parse(val) : null}
export function jsonEncode(val) {return JSON.stringify(l.isNil(val) ? null : val)}
export function getStatus(val) {return l.get(val, `status`)}
export function hasStatus(err, sta) {return l.reqNat(sta) === getStatus(err)}

export class Err extends Error {
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

export function reqBui(val) {return new ReqBui(val)}

export class ReqBui {
  constructor(val) {this.add(val)}

  async fetch() {return new this.Res(await fetch(this.url, this))}
  async fetchOk() {return (await this.fetch()).okRes()}
  async fetchOkText() {return (await this.fetch()).okText()}
  async fetchOkJson() {return (await this.fetch()).okJson()}

  meth(val) {return this.method = l.laxStr(val) || undefined, this}
  get() {return this.meth(GET)}
  post() {return this.meth(POST)}
  put() {return this.meth(PUT)}
  patch() {return this.meth(PATCH)}
  delete() {return this.meth(DELETE)}

  to(val) {return this.url = l.reqScalar(val), this}
  sig(val) {return this.signal = l.optInst(val, AbortSignal), this}
  inp(val) {return this.body = reqBody(val), this}
  json(val) {return this.inp(jsonEncode(val)).headSet(CONTENT_TYPE, TYPE_JSON)}

  type(val) {return this.headSet(CONTENT_TYPE, val)}
  typeJson() {return this.type(TYPE_JSON)}
  typeForm() {return this.type(TYPE_FORM)}
  typeMulti() {return this.type(TYPE_MULTI)}

  req() {return new Request(this.url, this)}

  add(val) {
    if (l.isNil(val)) return this
    if (l.isStruct(val)) return this.addStruct(val)
    throw l.errInst(val, this)
  }

  addStruct(val) {
    for (const key of l.structKeys(val)) {
      if (key === `headers`) this.headAdd(val[key])
      else this[key] = val[key]
    }
    return this
  }

  // Not called ".head" to avoid accidental confusion with HEAD.
  // It's better to avoid having a ".head" method or property.
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

  headAdd(val) {
    if (l.isNil(val)) return this
    if (l.isIter(val)) return this.headAddIter(val)
    if (l.isStruct(val)) return this.headAddStruct(val)
    throw l.errConv(val, `head`)
  }

  headAddIter(src) {
    for (const [key, val] of l.reqIter(src)) this.headAppendAny(key, val)
    return this
  }

  headAddStruct(src) {
    for (const key of l.structKeys(src)) this.headAppendAny(key, src[key])
    return this
  }

  headRender(val) {return l.renderLax(val).trim()}

  get Res() {return Res}
  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class Res extends Response {
  constructor(body, res) {
    if (l.isInst(body, Response)) {
      res = body
      body = res.body
    }
    else {
      l.reqBody(body)
      l.reqInst(res, Response)
    }

    super(body, res)
    this.res = res
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

  get Err() {return Err}
  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class Rou {
  constructor(req) {
    this.req = l.reqInst(req, Request)
    this.url = u.url(req.url)
    this.groups = undefined
  }

  get pathname() {return l.reqStr(this.url.pathname)}
  get method() {return l.reqStr(this.req.method)}

  // May be overridden in subclasses.
  run(fun) {return fun(this)}

  preflight(fun = resEmpty) {
    l.reqFun(fun)
    return this.someMeth(HEAD, OPTIONS) ? this.run(fun) : undefined
  }

  sub(pat, fun) {
    l.reqFun(fun)
    return this.matchPat(pat) ? this.either(fun, resNotFound) : undefined
  }

  methods(pat, fun) {
    l.reqFun(fun)
    return this.matchPat(pat) ? this.either(fun, resNotAllowed) : undefined
  }

  meth(met, pat, fun) {
    reqPattern(pat)
    l.reqFun(fun)
    return this.matchMeth(met) ? this.pat(pat, fun) : undefined
  }

  get(pat, fun) {return this.meth(GET, pat, fun)}
  head(pat, fun) {return this.meth(HEAD, pat, fun)}
  options(pat, fun) {return this.meth(OPTIONS, pat, fun)}
  post(pat, fun) {return this.meth(POST, pat, fun)}
  put(pat, fun) {return this.meth(PUT, pat, fun)}
  patch(pat, fun) {return this.meth(PATCH, pat, fun)}
  delete(pat, fun) {return this.meth(DELETE, pat, fun)}

  pat(pat, fun) {
    l.reqFun(fun)
    return this.matchPat(pat) ? this.run(fun) : undefined
  }

  only(...val) {return this.someMeth(...val) ? undefined : this.run(resNotAllowed)}

  onlyGet() {return this.only(GET)}
  onlyHead() {return this.only(HEAD)}
  onlyOptions() {return this.only(OPTIONS)}
  onlyPost() {return this.only(POST)}
  onlyPut() {return this.only(PUT)}
  onlyPatch() {return this.only(PATCH)}
  onlyDelete() {return this.only(DELETE)}

  match(met, pat) {
    this.groups = undefined
    return this.matchMeth(met) && this.matchPat(pat)
  }

  matchMeth(val) {return this.method === reqMethod(val)}
  someMeth(...val) {return val.some(this.matchMeth, this)}

  matchPat(val) {
    this.groups = undefined
    if (l.isStr(val)) return this.matchPatStr(val)
    if (l.isReg(val)) return this.matchPatReg(val)
    throw l.errConv(val, `pattern`)
  }

  matchPatStr(val) {
    return l.reqStr(val) === this.pathname
  }

  matchPatReg(val) {
    const mat = this.pathname.match(l.reqReg(val))
    this.groups = (mat && mat.groups) || undefined
    return !!mat
  }

  either(fun, def) {
    l.reqFun(fun), l.reqFun(def)
    const val = this.run(fun)
    if (l.isPromise(val)) return this.eitherAsync(val, def)
    if (val) return val
    return this.run(def)
  }

  async eitherAsync(val, fun) {return (await val) || this.run(fun)}
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
  return new Response(err?.stack || err?.message || `unknown error`, {status: 500})
}

function isBody(val) {
  return l.isInst(val, Uint8Array) || l.isInst(val, ReadableStream) || l.isScalar(val)
}
function reqBody(val) {return l.req(val, isBody)}

// Semi-placeholder. May tighten up.
function isHeadKey(val) {return l.isStr(val) && val !== ``}
function reqHeadKey(val) {return isHeadKey(val) ? val : l.convFun(val, isHeadKey)}

// Semi-placeholder. May tighten up.
function isMethod(val) {return l.isStr(val)}
function reqMethod(val) {return isMethod(val) ? val : l.convFun(val, isMethod)}

function isPattern(val) {return l.isStr(val) || l.isReg(val)}
function reqPattern(val) {return isPattern(val) ? val : l.convFun(val, isPattern)}
