import * as l from './lang.mjs'
import * as s from './str.mjs'

/*
Reference: https://en.wikipedia.org/wiki/Uniform_Resource_Identifier

JS doesn't support multiline regexes. To read and edit this, manually reformat
into multiline, then combine back into one line.
*/
export const RE_URL = /^(?:(?<scheme>[A-Za-z][\w+.-]*):(?:(?<slash>[/][/])(?:(?<username>[^\s/?#@:]*)(?::(?<password>[^\s/?#@]*))?@)?(?<hostname>[^\s/?#:]*)(?::(?<port>\d*))?)?)?(?<pathname>[^\s?#]*)(?:[?](?<query>[^\s#]*))?(?:[#](?<hash>[^\s]*))?$/
export const RE_SCHEME = /^[A-Za-z][\w+.-]*$/
export const RE_SLASH = /^[/]*$/
export const RE_PROTOCOL = /^(?:(?<scheme>[A-Za-z][\w+.-]*):(?<slash>[/][/])?)?$/
export const RE_USERNAME = /^[^\s/?#@:]*$/
export const RE_PASSWORD = /^[^\s/?#@]*$/
export const RE_HOSTNAME = /^[^\s/?#:]*$/
export const RE_PORT = /^\d*$/
export const RE_HOST = /^(?<hostname>[^\s/?#:]*)(?::(?<port>\d*))?$/
export const RE_ORIGIN = /^(?:(?<scheme>[A-Za-z][\w+.-]*):(?:(?<slash>[/][/])(?:(?<username>[^\s/?#@:]*)(?::(?<password>[^\s/?#@]*))?@)?(?<hostname>[^\s/?#:]*)(?::(?<port>\d*))?)?)?$/
export const RE_PATHNAME = /^[^\s?#]*$/
export const RE_HASH = /^\S*$/

export function query(val) {return new Query(val)}
export function toQuery(val) {return l.toInst(val, Query)}

export function url(val) {return new Url(val)}
export function toUrl(val) {return l.toInst(val, Url)}

export function urlJoin(val, ...vals) {return Url.join(val, ...vals)}

export class Query extends s.StrMap {
  mut(val) {
    if (l.isStr(val)) return this.mutFromStr(val)
    return super.mut(val)
  }

  mutFromStr(val) {
    val = unSearch(val, this.constructor.name)
    for (val of s.split(val, `&`)) {
      const ind = val.indexOf(`=`)
      this.append(this.dec(val.slice(0, ind)), this.dec(val.slice(ind + 1)))
    }
    return this
  }

  dec(val) {return queryDec(val)}
  enc(val) {return queryEnc(val)}

  toURLSearchParams() {
    const out = new URLSearchParams()
    for (let [key, val] of this.entries()) for (val of val) out.append(key, val)
    return out
  }

  // TODO consider another method that ALWAYS prepends `?`.
  toStringFull() {return toSearchFull(this.toString())}

  toString() {
    let out = ``
    for (let [key, val] of super.entries()) {
      key = this.enc(key)
      for (val of val) out += `${out && `&`}${key}=${this.enc(val)}`
    }
    return out
  }

  toJSON() {return this.toString() || null}
}

/*
Our lexicon is somewhere between IETF

Reference:

  https://en.wikipedia.org/wiki/Uniform_Resource_Identifier
*/
export class Url extends l.Emp {
  constructor(val) {
    super()
    this[schemeKey] = ``
    this[slashKey] = ``
    this[usernameKey] = ``
    this[passwordKey] = ``
    this[hostnameKey] = ``
    this[portKey] = ``
    this[pathnameKey] = ``
    this[queryKey] = ``
    this[hashKey] = ``
    if (!isEmpty(val)) this.reset(val)
  }

  get scheme() {return this[schemeKey]}
  set scheme(val) {if (!(this[schemeKey] = toScheme(val))) this.slash = ``}

  get slash() {return this[slashKey]}

  set slash(val) {
    if (!(this[slashKey] = toSlash(val))) {
      this[usernameKey] = ``
      this[passwordKey] = ``
      this[hostnameKey] = ``
      this[portKey] = ``
    }
  }

  get username() {return this[usernameKey]}
  set username(val) {this[usernameKey] = toUsername(val, this[slashKey])}

  get password() {return this[passwordKey]}
  set password(val) {this[passwordKey] = toPassword(val, this[slashKey])}

  get hostname() {return this[hostnameKey]}
  set hostname(val) {this[hostnameKey] = toHostname(val, this[slashKey])}

  get port() {return this[portKey]}
  set port(val) {this[portKey] = toPort(val, this[slashKey])}

  get pathname() {return this[pathnameKey]}
  set pathname(val) {this[pathnameKey] = toPathname(val)}

  get search() {return String(this[queryKey])}
  set search(val) {this[queryKey] = encodeURI(unSearch(l.laxStr(val), this.Query.name))}

  get query() {
    let val = this[queryKey]
    const cls = this.Query
    if (!l.isInst(val, cls)) this[queryKey] = val = new cls(val)
    return val
  }

  set query(val) {
    if (l.isNil(val) || l.isStr(val)) this.search = val
    else this.query.reset(val)
  }

  get searchParams() {return this.query}
  set searchParams(val) {this.query = val}

  get hash() {return this[hashKey]}
  set hash(val) {this[hashKey] = unHash(toHash(val))}

  get protocol() {return this.schemeFull() + this.slash}

  set protocol(val) {
    const gro = reqGroups(val, RE_PROTOCOL, `protocol`)
    this.slash = gro.slash
    this.scheme = gro.scheme
  }

  get host() {return s.optSuf(this.hostname, this.portFull())}

  set host(val) {
    if (val && !this[slashKey]) throw errSlash(`host`)
    const gro = reqGroups(val, RE_HOST, `host`)
    this[hostnameKey] = l.laxStr(gro.hostname)
    this[portKey] = l.laxStr(gro.port)
  }

  get origin() {return s.optPre(this.host, this.protocol)}

  set origin(val) {
    const gro = reqGroups(val, RE_ORIGIN, `origin`)
    this[hostnameKey] = l.laxStr(gro.hostname)
    this[portKey] = l.laxStr(gro.port)
    this.username = l.laxStr(gro.username)
    this.password = l.laxStr(gro.password)
    this.slash = l.laxStr(gro.slash)
    this.scheme = l.laxStr(gro.scheme)
  }

  get href() {return this.clean() + this.searchFull() + this.hashFull()}
  set href(val) {this.reset(val)}

  setScheme(val) {return this.scheme = val, this}
  setSlash(val) {return this.slash = val, this}
  setUsername(val) {return this.username = val, this}
  setPassword(val) {return this.password = val, this}
  setHostname(val) {return this.hostname = val, this}
  setPort(val) {return this.port = val, this}
  setPathname(val) {return this.pathname = val, this}
  setSearch(val) {return this.search = val, this}
  setSearchParams(val) {return this.searchParams = val, this}
  setQuery(val) {return this.query = val, this}
  mutQuery(val) {return this.query.mut(val), this}
  setHash(val) {return this.hash = val, this}
  setHashExact(val) {return this[hashKey] = toHash(val), this}
  setProtocol(val) {return this.protocol = val, this}
  setHost(val) {return this.host = val, this}
  setOrigin(val) {return this.origin = val, this}
  setHref(val) {return this.href = val, this}

  withScheme(val) {return this.clone().setScheme(val)}
  withSlash(val) {return this.clone().setSlash(val)}
  withUsername(val) {return this.clone().setUsername(val)}
  withPassword(val) {return this.clone().setPassword(val)}
  withHostname(val) {return this.clone().setHostname(val)}
  withPort(val) {return this.clone().setPort(val)}
  withPathname(val) {return this.clone().setPathname(val)}
  withSearch(val) {return this.withoutQuery().setSearch(val)}
  withSearchParams(val) {return this.withQuery(val)}
  withQuery(val) {return this.withoutQuery().setQuery(val)}
  withHash(val) {return this.clone().setHash(val)}
  withHashExact(val) {return this.clone().setHashExact(val)}
  withProtocol(val) {return this.clone().setProtocol(val)}
  withHost(val) {return this.clone().setHost(val)}
  withOrigin(val) {return this.clone().setOrigin(val)}
  withHref(val) {return this.clone().setHref(val)}

  withoutQuery() {
    const val = this[queryKey]
    this[queryKey] = ``
    try {return this.clone()}
    finally {this[queryKey] = val}
  }

  schemeFull() {return s.optSuf(this[schemeKey], `:`)}
  portFull() {return s.maybePre(this[portKey], `:`)}
  pathnameFull() {return s.optPre(this[pathnameKey], `/`) || `/`}
  searchFull() {return toSearchFull(this.search)}
  hashFull() {return s.maybePre(this[hashKey], `#`)}
  base() {return `${this.protocol}${this.authFull()}${this.host}`}
  hostPath() {return s.inter(this.host, `/`, this.pathname)}
  auth() {return this.username + s.maybePre(this.password, `:`)}
  authFull() {return s.optSuf(this.auth(), `@`)}
  rel() {return this.pathname + this.searchFull() + this.hashFull()}

  /*
  Very similar to `.origin` but includes auth and pathname. This omits only
  query and hash. See https://en.wikipedia.org/wiki/Clean_URL which seems to
  describe the same concept.
  */
  clean() {return this.protocol + this.authFull() + this.hostPath()}

  withPath(...val) {return this.clone().setPath(...val)}
  setPath(...val) {return this.setPathname().addPath(...val)}
  addPath(...val) {return val.forEach(this.addSeg, this), this}

  addSeg(seg) {
    const val = l.renderLax(seg)
    if (!val) throw SyntaxError(`invalid empty URL segment ${l.show(seg)}`)
    this[pathnameKey] = s.inter(this[pathnameKey], `/`, val)
    return this
  }

  setPathOpt(...val) {return val.forEach(this.setSegOpt, this), this}
  addPathOpt(...val) {return val.forEach(this.addSegOpt, this), this}

  addSegOpt(seg) {
    this[pathnameKey] = s.inter(this[pathnameKey], `/`, l.renderLax(seg))
    return this
  }

  // TODO: consider supporting `window.Location` for better performance.
  // Benchmark first. Avoid code bloat.
  reset(val) {
    if (l.isNil(val)) return this.clear()
    if (l.isStr(val)) return this.resetFromStr(val)
    if (isURL(val)) return this.resetFromURL(val)
    if (isUrl(val)) return this.resetFromUrl(val)
    if (isUrlLike(val)) return this.resetFromStr(val.href)
    throw l.errInst(val, this)
  }

  resetFromStr(val) {
    const gro = urlParse(val)
    this[schemeKey] = l.laxStr(gro.scheme)
    this[slashKey] = l.laxStr(gro.slash)
    this[usernameKey] = l.laxStr(gro.username)
    this[passwordKey] = l.laxStr(gro.password)
    this[hostnameKey] = l.laxStr(gro.hostname)
    this[portKey] = l.laxStr(gro.port)
    this[pathnameKey] = l.laxStr(gro.pathname)
    this.search = l.laxStr(gro.query)
    this[hashKey] = l.laxStr(gro.hash)
    return this
  }

  resetFromURL(val) {
    l.req(val, isURL)
    this[schemeKey] = s.stripSuf(val.protocol, `:`)
    this[slashKey] = val.href.startsWith(val.protocol + `//`) ? `//` : ``
    this[usernameKey] = val.username
    this[passwordKey] = val.password
    this[hostnameKey] = val.hostname
    this[portKey] = val.port
    this[pathnameKey] = val.pathname
    this.query.reset(val.searchParams)
    this[hashKey] = unHash(val.hash)
    return this
  }

  resetFromUrl(val) {
    l.req(val, isUrl)
    this[schemeKey] = val[schemeKey]
    this[slashKey] = val[slashKey]
    this[usernameKey] = val[usernameKey]
    this[passwordKey] = val[passwordKey]
    this[hostnameKey] = val[hostnameKey]
    this[portKey] = val[portKey]
    this[pathnameKey] = val[pathnameKey]
    this.query = val[queryKey]
    this[hashKey] = val[hashKey]
    return this
  }

  clear() {
    this[schemeKey] = ``
    this[slashKey] = ``
    this[usernameKey] = ``
    this[passwordKey] = ``
    this[hostnameKey] = ``
    this[portKey] = ``
    this[pathnameKey] = ``
    this[queryKey] = ``
    this[hashKey] = ``
  }

  clone() {return new this.constructor(this)}
  toURL() {return new this.URL(this.href)}
  toString() {return this.href}
  toJSON() {return this.toString() || null}
  valueOf() {return this.href}

  get Query() {return Query}

  static join(val, ...vals) {return new this(val).addPath(...vals)}
}

export const schemeKey = Symbol.for(`scheme`)
export const slashKey = Symbol.for(`slash`)
export const usernameKey = Symbol.for(`username`)
export const passwordKey = Symbol.for(`password`)
export const hostnameKey = Symbol.for(`hostname`)
export const portKey = Symbol.for(`port`)
export const pathnameKey = Symbol.for(`pathname`)
export const queryKey = Symbol.for(`query`)
export const hashKey = Symbol.for(`hash`)

export function urlParse(val) {return reqGroups(val, RE_URL, `URL`)}

// TODO consider moving to `str.mjs`. Might rename.
function reqGroups(val, reg, msg) {
  const mat = l.laxStr(val).match(reg)
  return l.convSynt(mat && mat.groups, val, msg)
}

function errSlash(msg) {return SyntaxError(`${msg} is forbidden in URL without protocol double slash`)}

function unHash(val) {return s.stripPre(val, `#`)}

function toScheme(val) {return toStrWith(val, RE_SCHEME, `scheme`)}
function toSlash(val) {return toStrWith(val, RE_SLASH, `slash`)}
function toUsername(val, slash) {return toStrWithSlash(val, RE_USERNAME, `username`, slash)}
function toPassword(val, slash) {return toStrWithSlash(val, RE_PASSWORD, `password`, slash)}
function toHostname(val, slash) {return toStrWithSlash(val, RE_HOSTNAME, `hostname`, slash)}
function toPort(val, slash) {return reqSlash(encodePort(val), slash, `port`)}
function toPathname(val) {return toStrWith(val, RE_PATHNAME, `pathname`)}
function toHash(val) {return toStrWith(val, RE_HASH, `hash`)}

function encodePort(val) {
  if (l.isNat(val)) return String(val)
  return toStrWith(val, RE_PORT, `port`)
}

function unSearch(val, msg) {
  if (l.isStr(val)) {
    if (val.includes(`#`)) throw l.errSynt(val, msg)
    return s.stripPre(val, `?`)
  }
  throw l.errConv(val, msg)
}

function toSearchFull(val) {return s.maybePre(val, `?`)}

function toStrWith(val, reg, msg) {
  if (l.isNil(val)) return ``
  if (l.isStr(val)) {
    if (val && !reg.test(val)) throw l.errSynt(val, msg)
    return val
  }
  throw l.errConv(val, msg)
}

function toStrWithSlash(val, reg, msg, slash) {
  return reqSlash(toStrWith(val, reg, msg), slash, msg)
}

function reqSlash(val, slash, msg) {
  if (val && !slash) throw errSlash(msg)
  return val
}

function isEmpty(val) {return l.isNil(val) || val === ``}
function isURL(val) {return l.isInst(val, URL)}
function isUrl(val) {return l.isInst(val, Url)}
function isUrlLike(val) {return l.isStruct(val) && `href` in val}

// Needs optimization. This is currently our bottleneck.
export function queryDec(val) {
  if (val.includes(`+`)) val = val.replace(/[+]/g, ` `)
  return decodeURIComponent(val)
}

// Needs optimization. This is currently one of our bottlenecks.
export function queryEnc(val) {
  val = encodeURIComponent(val)
  if (val.includes(`%20`)) val = val.replace(/%20/g, `+`)
  return val
}
