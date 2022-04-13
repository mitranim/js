import * as l from './lang.mjs'
import * as co from './coll.mjs'

export const RE_WORD = /[\p{Lu}\d]+(?=\W|_|$)|[\p{Lu}\d]+(?=\p{Lu}\p{Ll}|\W|_|$)|\p{Lu}[\p{Ll}\d]*(?=\p{Lu}|\W|_|$)|[\p{Ll}\d]+(?=\p{Lu}|\W|_|$)|[\p{Lu}\d]+(?=\p{Ll}|\W|_|$)|[\p{L}\d]+(?=\W|_|$)/gu
export const RE_EMBED = /{{([^{}]*)}}/g

export function isBlank(val) {return /^\s*$/.test(l.reqStr(val))}

export function isAscii(val) {return isEveryCharCode(val, isCodeAscii)}

export function isAsciiPrint(val) {return isEveryCharCode(val, isCodeAsciiPrint)}

export function isNarrow(val) {
  l.reqStr(val)
  for (val of val) if (val.length > 1) return false
  return true
}

export function isUni(val) {return !isNarrow(val)}

export function isEveryCharCode(str, fun) {
  l.reqStr(str)
  l.reqFun(fun)

  let ind = -1
  while (++ind < str.length) if (!fun(str.charCodeAt(ind))) return false
  return true
}

export function isCodeAscii(val) {
  return l.isInt(val) && val >= 0 && val < 128
}

export function isCodeAsciiPrint(val) {
  return l.isInt(val) && val >= 32 && val < 127
}

export function lenStr(val) {return l.reqStr(val).length}

export function lenUni(val) {
  l.reqStr(val)
  let out = 0
  for (const _ of val) out++
  return out
}

export function ell(val, len) {return trunc(val, len, `…`)}

export function trunc(val, len, suf) {
  val = l.laxStr(val)
  l.reqNat(len)
  l.reqStr(suf)

  if (!len) return ``
  if (val.length <= len) return val

  let chars = 0
  let prev = 0
  let ind = 0

  for (const char of val) {
    if ((chars + 1) > len) return val.slice(0, ind - prev) + suf
    chars++
    prev = char.length
    ind += prev
  }

  return val
}

export function trim(val) {return l.laxStr(val).trim()}

export function words(val) {return Words.from(val)}

/*
Performance note: subclassing `Array` would be cleaner but slower. We call
`String..match` which creates a regular array, which we wrap and recycle.
Thin wrapping seems significantly cheaper than copying.

TODO: support initials.
*/
export class Words extends co.Vec {
  spaced() {return this.join(` `)}
  snake() {return this.join(`_`)}
  kebab() {return this.join(`-`)}
  solid() {return this.join(``)}

  lower() {return this.mapMut(lower)}
  upper() {return this.mapMut(upper)}
  title() {return this.mapMut(title)}
  sentence() {return this.lower().mapHead(title)}
  camel() {return this.title().mapHead(lower)}

  lowerSpaced() {return this.lower().spaced()}
  upperSpaced() {return this.upper().spaced()}
  titleSpaced() {return this.title().spaced()}
  sentenceSpaced() {return this.sentence().spaced()}
  camelSpaced() {return this.camel().spaced()}

  lowerSnake() {return this.lower().snake()}
  upperSnake() {return this.upper().snake()}
  titleSnake() {return this.title().snake()}
  senteSnake() {return this.sentence().snake()}
  camelSnake() {return this.camel().snake()}

  lowerKebab() {return this.lower().kebab()}
  upperKebab() {return this.upper().kebab()}
  titleKebab() {return this.title().kebab()}
  senteKebab() {return this.sentence().kebab()}
  camelKebab() {return this.camel().kebab()}

  lowerCamel() {return this.camel().solid()}
  titleCamel() {return this.title().solid()}

  // Same as `iter.mjs` → `mapMut`. Avoiding import.
  mapMut(fun) {
    l.reqFun(fun)
    const {$: arr} = this
    let ind = -1
    while (++ind < arr.length) arr[ind] = fun(arr[ind])
    return this
  }

  mapHead(fun) {
    l.reqFun(fun)
    const {$: arr} = this
    if (arr.length) arr[0] = fun(arr[0])
    return this
  }

  join(val) {return this.$.join(val)}
  str() {return this.toString()}
  toString() {return this.spaced()}

  static from(val) {
    if (l.isStr(val)) return this.fromStr(val)
    return super.from(val)
  }

  static fromStr(val) {return new this(l.laxStr(val).match(RE_WORD) || [])}
}

export function lower(val) {return l.laxStr(val).toLowerCase()}
export function upper(val) {return l.laxStr(val).toUpperCase()}

// Probably suboptimal.
export function title(val) {
  val = lower(val)
  if (!val.length) return val
  return val[0].toUpperCase() + val.slice(1)
}

export function strMap(val) {return new StrMap(val)}

/*
Map<string, string[]> used by various subclasses such as `Query` and `Flag`.
Features:

  * Automatic type checks / sanity checks.
  * Support for patching/merging.
  * Support for both `string` and `string[]` values.
  * Support for dicts such as {key: 'value'} and {key: ['value']}.
  * Support for arbitrary iterators.
  * Parsing of bool and numeric values.
*/
export class StrMap extends Map {
  constructor(val) {super().mut(val)}

  has(key) {return super.has(l.reqStr(key))}
  get(key) {return this.has(key) ? super.get(key)[0] : undefined}
  getAll(key) {return super.get(l.reqStr(key))}

  set(key, val) {return this.delete(key), this.append(key, val)}
  setAll(key, val) {return this.delete(key), this.appendAll(key, val)}
  setAny(key, val) {return l.isArr(val) ? this.setAll(key, val) : this.set(key, val)}

  append(key, val) {
    l.reqStr(key)
    if (l.isNil(val)) return this
    val = l.renderLax(val)

    if (super.has(key)) super.get(key).push(val)
    else super.set(key, [val])
    return this
  }

  appendAll(key, val) {
    l.reqStr(key)
    if (l.optArr(val)) for (val of val) this.append(key, val)
    return this
  }

  appendAny(key, val) {
    return l.isArr(val) ? this.appendAll(key, val) : this.append(key, val)
  }

  delete(key) {return super.delete(l.reqStr(key))}

  clear() {return (super.size && super.clear()), this}

  reset(val) {
    if (l.isInst(val, StrMap)) return this.resetFromStrMap(val)
    return this.clear().mut(val)
  }

  resetFromStrMap(src) {
    l.reqInst(src, StrMap)
    this.clear()
    for (const [key, val] of src) super.set(key, val.slice())
    return this
  }

  mut(val) {
    if (l.isNil(val)) return this
    if (l.isIter(val)) return this.mutFromIter(val)
    if (l.isStruct(val)) return this.mutFromStruct(val)
    throw l.errInst(val, this)
  }

  mutFromIter(src) {
    l.reqIter(src)
    for (const [key, val] of src) this.appendAny(key, val)
    return this
  }

  mutFromStruct(val) {
    for (const key of l.structKeys(val)) this.appendAny(key, val[key])
    return this
  }

  toDict() {
    const out = l.npo()
    for (const [key, val] of this.entries()) if (val.length) out[key] = val[0]
    return out
  }

  toDictAll() {
    const out = l.npo()
    for (const [key, val] of this.entries()) out[key] = val
    return out
  }

  boolOpt(key) {return boolOpt(this.get(key))}
  bool(key) {return bool(this.get(key))}

  finOpt(key) {return finOpt(this.get(key))}
  fin(key) {return fin(this.get(key))}

  intOpt(key) {return intOpt(this.get(key))}
  int(key) {return int(this.get(key))}

  natOpt(key) {return natOpt(this.get(key))}
  nat(key) {return nat(this.get(key))}

  clone() {return new this.constructor(this)}
  toJSON() {return this.toDictAll()}
}

export function regTest(val, reg) {
  l.reqReg(reg)
  return l.isSome(val) && reg.test(l.reqStr(val))
}

export function boolOpt(val) {
  l.opt(val, l.isStr)
  if (val === `false`) return false
  if (val === `true`) return true
  return undefined
}

export function bool(val) {return l.convSynt(boolOpt(val), val, `bool`)}

export function finOpt(val) {
  if (!regTest(val, /^[+-]?\d+(?:[.]\d+)?(?:[Ee][+-]?\d+)?$/)) return undefined
  return Number.parseFloat(val)
}

export function fin(val) {return l.convSynt(finOpt(val), val, `fin`)}

export function intOpt(val) {
  if (!regTest(val, /^[+-]?\d+$/)) return undefined
  return Number.parseInt(val)
}

export function int(val) {return l.convSynt(intOpt(val), val, `int`)}

export function natOpt(val) {
  if (!regTest(val, /^[+]?\d+$/)) return undefined
  return Number.parseInt(val)
}

export function nat(val) {return l.convSynt(natOpt(val), val, `nat`)}

export function inter(pre, sep, suf) {
  pre = l.laxStr(pre)
  l.reqStr(sep)
  suf = l.laxStr(suf)

  if (!pre) return suf
  if (!suf) return pre
  return stripSuf(pre, sep) + sep + stripPre(suf, sep)
}

export function maybeInter(pre, sep, suf) {
  pre = l.laxStr(pre)
  l.reqStr(sep)
  suf = l.laxStr(suf)

  if (!pre) return suf
  if (!suf) return pre
  return pre + sep + suf
}

// TODO rename to `stripPreAll` and provide a "once" version.
export function stripPre(val, pre) {
  val = l.laxStr(val)
  l.reqStr(pre)
  while (pre && val.startsWith(pre)) val = val.slice(pre.length)
  return val
}

// TODO rename to `stripSufAll` and provide a "once" version.
export function stripSuf(val, suf) {
  val = l.laxStr(val)
  l.reqStr(suf)
  while (suf && val.endsWith(suf)) val = val.slice(0, -suf.length)
  return val
}

export function optPre(val, pre) {
  val = l.laxStr(val)
  l.reqStr(pre)
  return (!val || val.startsWith(pre)) ? val : (pre + val)
}

export function optSuf(val, suf) {
  val = l.laxStr(val)
  l.reqStr(suf)
  return (!val || val.endsWith(suf)) ? val : (val + suf)
}

export function maybePre(val, pre) {
  val = l.laxStr(val)
  l.reqStr(pre)
  return val && (pre + val)
}

export function maybeSuf(val, suf) {
  val = l.laxStr(val)
  l.reqStr(suf)
  return val && (val + suf)
}

export function split(val, sep) {
  return val = l.laxStr(val) ? val.split(sep) : []
}

// Tested indirectly through `Draft`. Needs to be simplified. Needs its own tests.
export function splitMap(src, reg, fun) {
  src = l.laxStr(src)
  reqRegGlob(reg)
  l.reqFun(fun)

  const buf = []
  if (!src) return buf

  let mat
  let ind = 0
  reg.lastIndex = 0

  while ((mat = reg.exec(src))) {
    const {index} = mat
    if (index > ind) buf.push(src.slice(ind, index))
    ind = index + mat[0].length
    buf.push(fun.call(this, mat[1]))
  }

  if (ind < src.length) buf.push(src.slice(ind))
  return buf
}

export function lines(val) {return split(val, /(?:\r\n|\r|\n)/g)}
export function trimLines(val) {return l.laxStr(val).replace(/^\s+|\s+$/gm, ``)}

export function joinBy(val, sep, fun) {
  l.reqStr(sep)
  l.reqFun(fun)
  if (l.isNil(val)) return ``

  let out = ``
  for (val of l.reqArr(val)) out += (out && sep) + l.reqStr(fun(val))
  return out
}

export function joinOptBy(val, sep, fun) {
  l.reqStr(sep)
  l.reqFun(fun)
  if (l.isNil(val)) return ``

  let out = ``
  for (val of l.reqArr(val)) out = maybeInter(out, sep, fun(val))
  return out
}

export function join(val, sep) {return joinBy(val, sep, l.render)}
export function joinLax(val, sep) {return joinBy(val, sep, l.renderLax)}
export function joinOpt(val, sep) {return joinOptBy(val, sep, l.render)}
export function joinOptLax(val, sep) {return joinOptBy(val, sep, l.renderLax)}

export function joinLines(val) {return join(val, `\n`)}
export function joinLinesLax(val) {return joinLax(val, `\n`)}
export function joinLinesOpt(val) {return joinOpt(val, `\n`)}
export function joinLinesOptLax(val) {return joinOptLax(val, `\n`)}

export function spaced(...val) {return joinOptLax(val, ` `)}
export function dashed(...val) {return joinOptLax(val, `-`)}

// TODO rename to something like `pathStartsWith` and swap args.
export function isSubpath(sup, sub) {
  l.reqStr(sup), l.reqStr(sub)
  return sup === sub || sub.startsWith(sup) && stripPre(sub, sup).startsWith(`/`)
}

export function rndHex(len) {
  if (!l.reqNat(len)) return ``
  return arrHex(crypto.getRandomValues(new Uint8Array(len)))
}

// Stupidly inefficient, but all attempted alternatives were worse.
export function arrHex(val) {
  l.reqInst(val, Uint8Array)
  const buf = Array(val.length)
  let ind = -1
  while (++ind < val.length) buf[ind] = val[ind].toString(16).padStart(2, `0`)
  return buf.join(``)
}

/*
Would be simpler and faster to use `crypto.randomUUID().replaceAll('-', '')`,
but requires Safari 15++.
*/
export function uuid() {return arrHex(uuidArr())}

// https://en.wikipedia.org/wiki/Universally_unique_identifier
export function uuidArr() {
  // Standard web API, available in browsers and Deno, but not in Node 16.
  const val = crypto.getRandomValues(new Uint8Array(16))

  // Version 4.
  val[6] = (val[6] & 0b00001111) | 0b01000000

  // Variant 1.
  val[8] = (val[8] & 0b00111111) | 0b10000000

  return val
}

// See the warning on `Draft`.
export function draftParse(val) {return new Draft().parse(val, RE_EMBED)}
export function draftRender(src, ctx) {return draftParse(src).render(ctx)}
export function draftRenderAsync(src, ctx) {return draftParse(src).renderAsync(ctx)}

/*
Word of warning. Most apps shouldn't use string templating. Whenever possible,
structured markup should be authored as code, not as string templates, with
something like our `ren_str.mjs` or `ren_dom.mjs`. Markup-as-code allows MUCH
better performance, doesn't need special build systems, and is compatible with
common static analysis tools such as type checkers and linters. String-based
templating should be used only when already committed to a dedicated markup
language such as Markdown.
*/
export class Draft extends co.Vec {
  // TODO consider merging with `renderAsync`, automatically switching to
  // promises when the first promise is detected. Might be tricky.
  render(ctx) {
    let out = ``
    for (const val of this.$) {
      out += l.renderLax(isRen(val) ? val.render(ctx) : val)
    }
    return out
  }

  renderAsync(ctx) {
    const seg = val => isRen(val) ? val.render(ctx) : val
    return Promise.all(this.$.map(seg)).then(strConcatLax)
  }

  parse(src, reg) {
    this.$.push(...splitMap.call(this, src, reg, this.embed))
    return this
  }

  embed(val) {return new this.Embed(val)}
  get Embed() {return Embed}
}

function reqRegGlob(val) {
  if (l.reqReg(val).global) return val
  throw SyntaxError(`expected global regexp, got ${val}`)
}

export function isRen(val) {return l.hasMeth(val, `render`)}

// See the warning on `Draft`.
export class Embed extends l.Emp {
  constructor(val) {
    super()
    {[this.key, ...this.args] = split(trim(val), /\s+/g)}
    if (!this.key) throw SyntaxError(`missing key in ${l.show(val)}`)
  }

  render(ctx) {
    const {key, args} = this
    let val = l.reqGet(ctx, key)

    if (l.isFun(val)) {
      val = val.apply(ctx, args)
    }
    else if (args.length) {
      throw SyntaxError(`property ${l.show(key)} doesn't expect args ${l.show(args)}`)
    }

    if (l.isPromise(val)) return val.then(l.renderLax)
    return l.renderLax(val)
  }
}

export function str(...val) {
  let out = ``
  for (val of val) out += l.render(val)
  return out
}

export function strLax(...val) {
  let out = ``
  for (val of val) out += l.renderLax(val)
  return out
}

export function strConcat(val) {
  return l.isNil(val) ? `` : str(...l.reqArr(val))
}

export function strConcatLax(val) {
  return l.isNil(val) ? `` : strLax(...l.reqArr(val))
}

/*
Short for "sanity", "string sanity". Must be used as a "tag function" for
template strings.
*/
export function san(str, ...inp) {return interpolate(str, inp, l.render)}

export function sanLax(str, ...inp) {return interpolate(str, inp, l.renderLax)}

// Internal tool for "tag" functions for template strings.
export function interpolate(str, inp, fun) {
  l.reqArr(str)
  l.reqArr(inp)

  let out = ``
  let ind = -1

  while (++ind < inp.length) {
    out += str[ind]
    out += fun(inp[ind])
  }
  if (ind < str.length) out += str[ind]
  return out
}
