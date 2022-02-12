import * as l from './lang.mjs'
import * as s from './str.mjs'

/*
Reference: https://en.wikipedia.org/wiki/Uniform_Resource_Identifier

JS doesn't support multiline regexes. To read and edit this, manually reformat
into multiline, then combine back into one line.
*/
export const RE_URL = /^(?:(?<scheme>[A-Za-z][\w+.-]*):(?:(?<slash>[/][/])(?:(?<username>[^\s/?#@:]*)(?::(?<password>[^\s/?#@]*))?@)?(?<hostname>[^\s/?#:]*)(?::(?<port>\d*))?)?)?(?<pathname>[^\s?#]*)(?:[?](?<search>[^\s#]*))?(?:[#](?<hash>[^\s]*))?$/
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

export function search(val) {return new Search(val)}
export function toSearch(val) {return l.toInst(val, Search)}

export function url(val) {return new Url(val)}
export function toUrl(val) {return l.toInst(val, Url)}

export function urlJoin(val, ...vals) {return Url.join(val, ...vals)}

export class Search extends s.StrMap {
  add(val) {
    if (l.isStr(val)) return this.addStr(val)
    return super.add(val)
  }

  addStr(val) {
    val = unSearch(val, this.constructor.name)
    for (val of s.split(val, `&`)) {
      const ind = val.indexOf(`=`)
      this.append(this.dec(val.slice(0, ind)), this.dec(val.slice(ind + 1)))
    }
    return this
  }

  dec(val) {return searchDec(val)}
  enc(val) {return searchEnc(val)}

  toURLSearchParams() {
    const out = new URLSearchParams()
    for (let [key, val] of this.entries()) for (val of val) out.append(key, val)
    return out
  }

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

export class Url {
  constructor(val) {
    this[schemeKey] = ``
    this[slashKey] = ``
    this[usernameKey] = ``
    this[passwordKey] = ``
    this[hostnameKey] = ``
    this[portKey] = ``
    this[pathnameKey] = ``
    this[searchKey] = ``
    this[hashKey] = ``
    if (!isEmpty(val)) this.mut(val)
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

  get search() {return this[searchKey] + ``}
  set search(val) {this[searchKey] = encodeURI(unSearch(l.laxStr(val), this.Search.name))}

  get searchParams() {
    let val = this[searchKey]
    const cls = this.Search
    if (!l.isInst(val, cls)) this[searchKey] = val = new cls(val)
    return val
  }

  set searchParams(val) {
    if (l.isNil(val) || l.isStr(val)) this.search = val
    else this.searchParams.mut(val)
  }

  get query() {return this.searchParams}
  set query(val) {this.searchParams = val}

  get hash() {return this[hashKey]}
  set hash(val) {this[hashKey] = unHash(toHash(val))}

  get protocol() {return this.schemeFull() + this.slash}

  set protocol(val) {
    const gr = reqGroups(val, RE_PROTOCOL, `protocol`)
    this.slash = gr.slash
    this.scheme = gr.scheme
  }

  get host() {return s.optSuf(this.hostname, this.portFull())}

  set host(val) {
    if (val && !this[slashKey]) throw errSlash(`host`)
    const gr = reqGroups(val, RE_HOST, `host`)
    this[hostnameKey] = l.laxStr(gr.hostname)
    this[portKey] = l.laxStr(gr.port)
  }

  get origin() {return s.optPre(this.host, this.protocol)}

  set origin(val) {
    const gr = reqGroups(val, RE_ORIGIN, `origin`)
    this[hostnameKey] = l.laxStr(gr.hostname)
    this[portKey] = l.laxStr(gr.port)
    this.username = l.laxStr(gr.username)
    this.password = l.laxStr(gr.password)
    this.slash = l.laxStr(gr.slash)
    this.scheme = l.laxStr(gr.scheme)
  }

  // TODO: when scheme or slash is missing, auth and host should be excluded.
  get href() {return `${this.protocol}${this.authFull()}${this.hostPath()}${this.searchFull()}${this.hashFull()}`}
  set href(val) {this.mut(val)}

  setScheme(val) {return this.scheme = val, this}
  setSlash(val) {return this.slash = val, this}
  setUsername(val) {return this.username = val, this}
  setPassword(val) {return this.password = val, this}
  setHostname(val) {return this.hostname = val, this}
  setPort(val) {return this.port = val, this}
  setPathname(val) {return this.pathname = val, this}
  setSearch(val) {return this.search = val, this}
  setSearchParams(val) {return this.searchParams = val, this}
  setQuery(val) {return this.searchParams = val, this}
  addQuery(val) {return this.searchParams.add(val), this}
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
  withSearch(val) {return this.withSearchParams(val)}
  withSearchParams(val) {return this.withoutSearchParams().setQuery(val)}
  withQuery(val) {return this.withSearchParams(val)}
  withHash(val) {return this.clone().setHash(val)}
  withHashExact(val) {return this.clone().setHashExact(val)}
  withProtocol(val) {return this.clone().setProtocol(val)}
  withHost(val) {return this.clone().setHost(val)}
  withOrigin(val) {return this.clone().setOrigin(val)}
  withHref(val) {return this.clone().setHref(val)}

  withoutSearchParams() {
    const val = this[searchKey]
    this[searchKey] = ``
    try {return this.clone()}
    finally {this[searchKey] = val}
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

  setPath(...vals) {return this.setPathname().addPath(...vals)}
  addPath(...vals) {return vals.forEach(this.addSeg, this), this}

  addSeg(seg) {
    const val = l.renderLax(seg)
    if (!val) throw SyntaxError(`invalid empty URL segment ${l.show(seg)}`)
    this[pathnameKey] = s.inter(this[pathnameKey], `/`, val)
    return this
  }

  mut(val) {
    if (l.isNil(val)) return this.clear()
    if (l.isStr(val)) return this.setStr(val)
    if (isURL(val)) return this.setURL(val)
    if (isUrl(val)) return this.setUrl(val)
    if (isLoc(val)) return this.setStr(val.href)
    throw l.errInst(val, this)
  }

  setStr(val) {
    const gr = urlParse(val)
    this[schemeKey] = l.laxStr(gr.scheme)
    this[slashKey] = l.laxStr(gr.slash)
    this[usernameKey] = l.laxStr(gr.username)
    this[passwordKey] = l.laxStr(gr.password)
    this[hostnameKey] = l.laxStr(gr.hostname)
    this[portKey] = l.laxStr(gr.port)
    this[pathnameKey] = l.laxStr(gr.pathname)
    this.search = l.laxStr(gr.search)
    this[hashKey] = l.laxStr(gr.hash)
    return this
  }

  setURL(val) {
    l.req(val, isURL)
    this[schemeKey] = s.stripSuf(val.protocol, `:`)
    this[slashKey] = val.href.startsWith(val.protocol + `//`) ? `//` : ``
    this[usernameKey] = val.username
    this[passwordKey] = val.password
    this[hostnameKey] = val.hostname
    this[portKey] = val.port
    this[pathnameKey] = val.pathname
    this.searchParams.mut(val.searchParams)
    this[hashKey] = unHash(val.hash)
    return this
  }

  setUrl(val) {
    l.req(val, isUrl)
    this[schemeKey] = val[schemeKey]
    this[slashKey] = val[slashKey]
    this[usernameKey] = val[usernameKey]
    this[passwordKey] = val[passwordKey]
    this[hostnameKey] = val[hostnameKey]
    this[portKey] = val[portKey]
    this[pathnameKey] = val[pathnameKey]
    this.searchParams = val[searchKey]
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
    this[searchKey] = ``
    this[hashKey] = ``
  }

  clone() {return new this.constructor(this)}
  toURL() {return new this.URL(this.href)}
  toString() {return this.href}
  toJSON() {return this.toString() || null}
  valueOf() {return this.href}

  get Search() {return Search}
  get [Symbol.toStringTag]() {return this.constructor.name}
  [Symbol.toPrimitive]() {return this.toString()}

  static join(val, ...vals) {return new this(val).addPath(...vals)}
}

export const schemeKey = Symbol.for(`scheme`)
export const slashKey = Symbol.for(`slash`)
export const usernameKey = Symbol.for(`username`)
export const passwordKey = Symbol.for(`password`)
export const hostnameKey = Symbol.for(`hostname`)
export const portKey = Symbol.for(`port`)
export const pathnameKey = Symbol.for(`pathname`)
export const searchKey = Symbol.for(`search`)
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
  if (l.isNat(val)) return val + ``
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

export function isUrlLike(val) {
  return l.isStr(val) || isURL(val) || isUrl(val) || isLoc(val)
}

function isEmpty(val) {return l.isNil(val) || val === ``}
function isURL(val) {return l.isInst(val, URL)}
function isUrl(val) {return l.isInst(val, Url)}
function isLoc(val) {return typeof Location === `function` && l.isInst(val, Location)}

// Needs optimization. This is currently our bottleneck.
export function searchDec(val) {
  if (val.includes(`+`)) val = val.replace(/[+]/g, ` `)
  return decodeURIComponent(val)
}

// Needs optimization. This is currently one of our bottlenecks.
export function searchEnc(val) {
  val = encodeURIComponent(val)
  if (val.includes(`%20`)) val = val.replace(/%20/g, `+`)
  return val
}
