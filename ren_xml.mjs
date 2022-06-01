import * as l from './lang.mjs'
import * as o from './obj.mjs'
import * as rb from './ren_base.mjs'
export {A, P, Raw} from './ren_base.mjs'

export function E(...val) {return ren.E(...val)}
export function S(...val) {return RenXmlSvg.main.E(...val)}
export function X(...val) {return RenXml.main.E(...val)}
export function F(...val) {return ren.F(...val)}

/*
Renders XML strings with a convenient React-inspired syntax. For better
compatibility between XML and HTML, uses full closing tags: `<tag/>` for void
elements (none by default) and `<tag></tag>` for all other elements.

Does not support HTML special cases such as whitelists of void elements and
boolean attributes. Use `RenXmlHtml` and `RenXmlSvg` as appropriate.
*/
export class RenXml extends rb.RenBase {
  // Short for "element".
  E(tag, props, ...chi) {return new rb.Raw(this.elem(tag, props, ...chi))}

  // Short for "fragment".
  F(...val) {return new rb.Raw(this.chi(...val))}

  elem(tag, props, ...chi) {
    return this.open(tag, props) + this.chi(...chi) + this.close(tag)
  }

  elemVoid(tag, props, ...chi) {
    if (chi.length) this.throwVoidChi(tag, chi)
    return `<` + this.reqTag(tag) + this.props(props) + `/>`
  }

  open(tag, props) {return `<` + this.reqTag(tag) + this.props(props) + `>`}
  close(tag) {return `</` + l.reqStr(tag) + `>`}

  chi(...val) {
    let out = ``
    for (val of val) out += l.laxStr(this.child(val))
    return out
  }

  // TODO: bench deopt with non-array iterators.
  child(val) {
    if (rb.isRaw(val)) return l.laxStr(val.outerHTML)
    if (rb.isSeq(val)) return this.chi(...val)
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
RenXml.main = /* @__PURE__ */ new RenXml()

// Implements various special cases shared by HTML and SVG-in-HTML.
export class RenHtmlBase extends RenXml {
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

  styleKey(key) {return styleKeys.goc(l.reqStr(key))}
  dataKey(key) {return dataKeys.goc(l.reqStr(key))}
}

// Should be used for rendering SVG.
export class RenXmlSvg extends RenHtmlBase {
  // E(tag, props, ...chi) {
  //   return new rb.Raw(this.elem(tag, props, ...chi))
  // }

  // elem(tag, props, ...chi) {
  //   // if (tag === `svg`) throw Error(`wtf`)
  //   return super.elem(tag, props, ...chi)
  // }
}
RenXmlSvg.main = /* @__PURE__ */ new RenXmlSvg()

// Should be used for rendering HTML.
export class RenXmlHtml extends RenHtmlBase {
  doc(...val) {return `<!doctype html>` + this.chi(...val)}

  elem(tag, props, ...chi) {
    // if (tag === `svg`) throw Error(`wtf`)
    if (this.isVoid(tag)) return this.elemVoid(tag, props, ...chi)
    return super.elem(tag, props, ...chi)
  }
}
RenXmlHtml.main = /* @__PURE__ */ new RenXmlHtml()

// Easier to remember, and iso with `ren_dom.mjs`.
export const ren = /* @__PURE__ */ RenXmlHtml.main

export const elems = /* @__PURE__ */ class ElemsPh extends o.MakerPh {
  make(key) {
    if (key === `Node`) return Node
    if (key === `Text`) return Text
    if (key === `Comment`) return Comment
    if (key === `HTMLElement`) return HTMLElement
    if (key === `SVGElement`) return SVGElement
    if (key === `Element`) return Element

    return class Element extends this.base(key) {
      static get name() {return key}
    }
  }

  base(key) {
    if (!key.endsWith(`Element`)) return undefined
    if (key.startsWith(`HTML`)) return HTMLElement
    if (key.startsWith(`SVG`)) return SVGElement
    return Element
  }
}.new()

export class Node extends l.Emp {
  get parentNode() {return this[parentNodeKey]}
  set parentNode(val) {this[parentNodeKey] = l.optInst(val, Node) || null}
  get childNodes() {return this[childNodesKey] || (this[childNodesKey] = new this.NodeList())}
  set childNodes(val) {this[childNodesKey] = l.reqArr(val)}
  get NodeList() {return Array}
}

class TextNode extends Node {
  get textContent() {return l.laxStr(this[textContentKey])}
  set textContent(val) {this[textContentKey] = l.render(val)}
}

export class Text extends TextNode {
  constructor(val) {super().textContent = val}
  get outerHTML() {return escapeText(this.textContent)}
}

export class Comment extends TextNode {
  constructor(val) {super().textContent = val}
  get outerHTML() {return `<!--` + escapeText(this.textContent) + `-->`}
}

export class Element extends Node {
  props(val) {
    this[propsKey] = this[propsKey]?.with(val) || rb.A.with(val)
    return this
  }

  chi(...val) {
    for (val of (this.childNodes = flat(val))) {
      if (isChildNode(val)) val.parentNode = this
    }
    return this
  }

  get innerHTML() {return this.ren.F(this.childNodes)}
  set innerHTML(val) {this.chi(new rb.Raw(val))}

  get outerHTML() {
    const ren = this.ren
    const cls = this.constructor
    const name = ren.reqTag(cls.localName)
    const base = cls.options?.extends
    const tag = ren.reqTag(base || name)
    const is = base && base !== name ? ren.attr(`is`, name) : ``
    const props = this[propsKey]

    // Same as `ren.elem` but inserts `is` when relevant.
    return (
      (`<` + l.reqStr(tag) + l.reqStr(is) + l.reqStr(ren.props(props)) + `>`) +
      l.reqStr(ren.chi(...this.childNodes)) +
      (`</` + l.reqStr(tag) + `>`)
    )
  }

  get ren() {return RenXml.main}
}

export class HTMLElement extends Element {
  get ren() {return RenXmlHtml.main}
}

export class SVGElement extends Element {
  get ren() {return RenXmlSvg.main}
}

const styleKeys = /* @__PURE__ */ new class StyleKeys extends o.Cache {
  make(val) {return camelToKebab(val)}
}

const dataKeys = /* @__PURE__ */ new class DataKeys extends o.Cache {
  make(val) {return camelToData(val)}
}

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

export const propsKey = Symbol.for(`props`)
export const parentNodeKey = Symbol.for(`parentNode`)
export const childNodesKey = Symbol.for(`childNodes`)
export const textContentKey = Symbol.for(`textContent`)

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

// Adapted from `iter.mjs` to avoid dependency.
function flat(val) {
  for (const elem of val) if (l.isArr(elem)) return val.flat(Infinity)
  return val
}

// Duplicated from `dom.mjs` to avoid dependency.
function isChildNode(val) {return l.hasIn(val, `parentNode`)}
