import * as l from './lang.mjs'
import * as rb from './ren_base.mjs'
export {A, P, Raw} from './ren_base.mjs'

export function E(...val) {return ren.E(...val)}
export function S(...val) {return RenStrSvg.main.E(...val)}
export function X(...val) {return RenStr.main.E(...val)}
export function F(...val) {return ren.frag(...val)}

/*
Renders XML strings with a convenient React-inspired syntax. For better
compatibility between XML and HTML, uses full closing tags: `<tag></tag>`.

Does not support HTML special cases such as void elements and boolean
attributes. Use `RenStrHtml` and `RenStrSvg` as appropriate.
*/
export class RenStr extends rb.RenBase {
  // Short for "element".
  E(tag, props, ...chi) {return new rb.Raw(this.elem(tag, props, ...chi))}

  // Short for "fragment". Allows JSX compat.
  frag(...val) {return new rb.Raw(this.chi(...val))}

  elem(tag, props, ...chi) {
    return this.open(tag, props) + this.chi(...chi) + this.close(tag)
  }

  open(tag, props) {return `<` + this.reqTag(tag) + this.props(props) + `>`}
  close(tag) {return `</` + l.reqStr(tag) + `>`}

  chi(...val) {
    let out = ``
    for (val of val) out += this.child(val)
    return out
  }

  // TODO: bench deopt with non-array iterators.
  child(val) {
    if (rb.isRaw(val)) return val.valueOf()
    if (l.isSeq(val)) return this.chi(...val)
    return this.escapeText(this.strLax(val))
  }

  props(val) {return this.fold(val, this.prop)}
  prop(key, val) {return this.attr(key, val)}

  attrs(val) {return this.fold(val, this.attr)}

  attr(key, val) {
    this.reqAttr(key)
    val = this.strOpt(val)
    if (l.isNil(val)) return ``
    return ` ${key}="${this.escapeAttr(val)}"`
  }

  attrOpt(key, val) {return l.laxStr(val) && this.attr(key, val)}

  escapeAttr(val) {return escapeAttr(val)}
  escapeText(val) {return escapeText(val)}

  fold(val, fun) {
    let acc = ``
    if ((val = this.deref(val))) {
      for (const key of l.structKeys(val)) {
        acc += l.reqSome(fun.call(this, key, val[key]))
      }
    }
    return acc
  }
}
RenStr.main = /* @__PURE__ */ new RenStr()

// Implements various special cases shared by HTML and SVG-in-HTML.
export class RenHtmlBase extends RenStr {
  elem(tag, props, ...chi) {
    return this.open(tag, props) + this.inner(props) + this.chi(...chi) + this.close(tag)
  }

  inner(props) {
    if (l.isNil(props)) return ``
    if (l.isStruct(props)) return this.strLax(props.innerHTML)
    throw l.errConv(props, `props`)
  }

  attr(key, val) {
    if (this.isBool(key)) return this.attrBool(key, val)
    return super.attr(key, val)
  }

  attrBool(key, val) {
    this.reqAttr(key)
    if (rb.optAt(key, val, l.isBool)) return ` ${key}=""`
    return ``
  }

  prop(key, val) {
    if (key === `innerHTML`) return ``
    if (key === `attributes`) return this.attrs(val)
    if (key === `class`) return this.attr(`class`, this.strOpt(val))
    if (key === `className`) return this.attr(`class`, this.strOpt(val))
    if (key === `style`) return this.attrOpt(`style`, this.style(val))
    if (key === `dataset`) return this.dataset(val)
    if (key === `httpEquiv`) return this.attr(`http-equiv`, val)
    if (key === `htmlFor`) return this.attr(`for`, val)
    return this.attr(key, val)
  }

  style(val) {
    if (l.isNil(val)) return ``
    if (l.isStr(val)) return val
    if (l.isStruct(val)) return this.styleStruct(val)
    throw l.errConv(val, `style`)
  }

  styleStruct(val) {return this.fold(val, this.styleProp).trim()}

  /*
  Might need smarter conversion from JS to CSS properties.
  Probably want to detect and reject unquoted `:;` in values.
  */
  styleProp(key, val) {
    val = rb.optAt(key, val, l.isStr)
    if (!val) return ``
    return ` ` + this.styleKey(key) + `: ` + this.styleVal(val) + `;`
  }

  // Placeholder, may consider rejecting unquoted `:` and `;`.
  styleVal(val) {return val}

  dataset(val) {return this.fold(val, this.datasetProp)}

  datasetProp(key, val) {
    if (l.isNil(val)) return ``
    return this.attr(this.dataKey(key), this.strLax(val))
  }

  styleKey(val) {return StyleKeyCache.main.goc(val)}
  dataKey(val) {return DataKeyCache.main.goc(val)}
}

// Should be used for rendering SVG.
export class RenStrSvg extends RenHtmlBase {}
RenStrSvg.main = /* @__PURE__ */ new RenStrSvg()

// Should be used for rendering HTML.
export class RenStrHtml extends RenHtmlBase {
  doc(...val) {return `<!doctype html>` + this.chi(...val)}

  elem(tag, props, ...chi) {
    if (this.isVoid(tag)) return this.elemVoid(tag, props, ...chi)
    return super.elem(tag, props, ...chi)
  }

  // TODO also forbid `.innerHTML` in props.
  elemVoid(tag, props, ...chi) {
    if (chi.length) throw this.voidErr(tag, chi)
    return this.open(tag, props)
  }
}
RenStrHtml.main = /* @__PURE__ */ new RenStrHtml()

// Easier to remember, and iso with `ren_dom.mjs`.
export const ren = /* @__PURE__ */ RenStrHtml.main

class Cache extends Map {
  // Short for "get or create".
  goc(val) {
    if (this.has(val)) return this.get(val)
    this.set(val, val = this.make(val))
    return val
  }

  make() {}
}

class StyleKeyCache extends Cache {make(val) {return camelToKebab(val)}}
StyleKeyCache.main = /* @__PURE__ */ new StyleKeyCache()

class DataKeyCache extends Cache {make(val) {return camelToData(val)}}
DataKeyCache.main = /* @__PURE__ */ new DataKeyCache()

/*
https://www.w3.org/TR/html52/syntax.html#escaping-a-string

We don't need to escape other chars like `'` because we always generate
double-quoted attributes. Single quotes or angle brackets don't "break out".
*/
export function escapeAttr(val) {
  val = l.reqStr(val)
  const re = /[\u00a0&"]/g
  return re.test(val) ? val.replace(re, escapeChar) : val
}

/*
https://www.w3.org/TR/html52/syntax.html#escaping-a-string

We don't need to escape other chars like `'` because we don't interpolate
unknown text into unknown parts of unknown markup. We generate valid markup
and use precise contextual escaping in the right places.
*/
export function escapeText(val) {
  val = l.reqStr(val)
  const re = /[\u00a0&<>]/g
  return re.test(val) ? val.replace(re, escapeChar) : val
}

// https://www.w3.org/TR/html52/syntax.html#escaping-a-string
export function escapeChar(char) {
  if (char === `&`) return `&amp;`
  if (char === `\u00a0`) return `&nbsp;`
  if (char === `"`) return `&quot;`
  if (char === `<`) return `&lt;`
  if (char === `>`) return `&gt;`
  return char
}

/*
Reference:

  https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset#name_conversion

Suboptimal, amortized with caching.
*/
function camelToData(val) {return `data-` + (/^[A-Z]/.test(val) ? `-` : ``) + camelToKebab(val)}

/*
Part of the dataset key algorithm. Seems to be okayish for CSS names,
but we may have to differentiate them later.
*/
function camelToKebab(val) {return val.split(/(?=[A-Z])/g).map(lower).join(`-`)}
function lower(val) {return val.toLowerCase()}
