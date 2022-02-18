import * as l from './lang.mjs'

export function E(...val) {return Ren.main.E(...val)}
export function S(...val) {return RenSvg.main.E(...val)}
export function mut(...val) {return Ren.main.mut(...val)}
export function mutProps(...val) {return Ren.main.mutProps(...val)}
export function mutChi(...val) {return Ren.main.mutChi(...val)}

export class MakerPh extends Map {
  get(tar, key) {
    if (!super.has(key)) super.set(key, this.make(tar, key))
    return super.get(key)
  }

  make() {}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class TagPh extends MakerPh {
  make(tar, key) {return tar.E.bind(tar, key)}
}

export class TagnPh extends MakerPh {
  make(tar, key) {return tar.E.bind(tar, key, undefined)}
}

/*
Short for "renderer". Allows to create DOM nodes with a convenient
React-inspired syntax. Implemented as a class for flexibility. Consumer code
can subclass this and override specific methods to change the semantics, or
even monkey-patch the main class.
*/
export class Ren {
  constructor() {
    this.lax = false
    this.tag = new Proxy(this, new this.TagPh())
    this.tagn = new Proxy(this, new this.TagnPh())
  }

  // Short for "element". Creates a DOM node with the given props and children.
  E(tag, props, ...chi) {return this.mut(this.make(tag, props), props, ...chi)}

  // Short for "fragment". Useful in edge case scenarios.
  F(...val) {return this.addChi(new DocumentFragment(), ...val)}

  make(tag, props) {return document.createElement(l.reqStr(tag), props)}

  mut(tar, props, ...chi) {
    this.mutProps(tar, props)
    this.mutChi(tar, ...chi)
    return tar
  }

  mutProps(tar, props) {
    reqElement(tar)
    for (const key of l.structKeys(props)) this.mutProp(tar, key, props[key])
    return tar
  }

  mutProp(tar, key, val) {
    if (key === `children`) throw Error(`children-in-props are unsupported`)
    if (key === `is`) return undefined
    if (key === `attributes`) return this.mutAttrs(tar, val)
    if (key === `class`) return this.mutCls(tar, val)
    if (key === `className`) return this.mutCls(tar, val)
    if (key === `style`) return this.mutStyle(tar, val)
    if (key === `dataset`) return this.mutDsetAttrs(tar, val)
    if (/^aria[A-Z]/.test(key)) return this.mutAria(tar, key, val)
    return this.mutPropAny(tar, key, val)
  }

  mutAttrs(tar, val) {
    for (const key of l.structKeys(val)) this.mutAttr(tar, key, val[key])
  }

  mutAttr(tar, key, val) {
    if (this.isBoolAttr(key)) return this.mutAttrBool(tar, key, val)
    return this.mutAttrAny(tar, key, val)
  }

  mutAttrBool(tar, key, val) {
    l.reqStr(key)
    if (optAt(val, key, l.isBool)) tar.setAttribute(key, ``)
    else tar.removeAttribute(key)
  }

  mutAttrAny(tar, key, val) {
    l.reqStr(key)
    val = this.strOpt(val)
    if (l.isNil(val)) tar.removeAttribute(key)
    else tar.setAttribute(key, val)
  }

  mutCls(tar, val) {
    const src = tar.className
    // `HTMLElement`.
    if (l.isStr(src)) setOpt(tar, `className`, src, this.str(val))
    // `SVGElement` and possibly others.
    else this.mutAttrAny(tar, `class`, val)
  }

  mutStyle(tar, val) {
    if (l.isNil(val) || l.isStr(val)) return this.mutAttrAny(tar, `style`, val)
    if (l.isStruct(val)) return this.mutStyleProps(tar, val)
    throw l.errConv(val, `style`)
  }

  mutStyleProps(tar, val) {
    for (const key of l.structKeys(val)) this.mutStyleProp(tar.style, key, val[key])
  }

  mutStyleProp(tar, key, val) {
    setOpt(tar, key, tar[key], optAt(val, key, l.isStr) || ``)
  }

  mutDsetAttrs(tar, val) {
    for (const key of l.structKeys(val)) this.mutDsetAttr(tar.dataset, key, val[key])
  }

  mutDsetAttr(tar, key, val) {
    val = this.strOpt(val)
    if (l.isNil(val)) delete tar[key]
    else tar[key] = val
  }

  mutAria(tar, key, val) {this.mutAttrAny(tar, toAria(key), val)}

  mutPropAny(tar, key, val) {
    if (!(key in tar)) return this.mutAttr(tar, key, val)

    const src = tar[key]

    if (l.isNil(src)) return setOpt(tar, key, src, norm(val))
    if (l.isStr(src)) return setOpt(tar, key, src, this.str(val))

    if (l.isPrim(src)) {
      if (l.isPrim(val)) return setOpt(tar, key, src, norm(val))
      throw errMismatch(tar, key, src, val)
    }

    if (l.isFun(src)) {
      if (l.isNil(val) || l.isFun(val)) return setOpt(tar, key, src, norm(val))
      throw errMismatch(tar, key, src, val)
    }

    return this.mutAttr(tar, key, val)
  }

  mutChi(tar, ...chi) {
    reqNode(tar)
    if (!chi.length) return nodeClear(tar)

    const frag = this.F(...chi)
    nodeClear(tar)
    tar.append(frag)
    return tar
  }

  addChi(tar, ...val) {
    reqNode(tar)
    for (val of val) this.appendChi(tar, val)
    return tar
  }

  appendChi(tar, val) {
    if (l.isNil(val)) return undefined
    if (l.isStr(val)) return this.appendStr(tar, val)
    if (isNode(val)) return tar.append(val)
    if (isRaw(val)) return this.appendRaw(tar, val)
    if (l.isSeq(val)) return this.appendSeq(tar, val)
    return this.appendChi(tar, this.strOpt(val))
  }

  appendStr(tar, val) {if (l.reqStr(val)) tar.append(val)}

  // Might be stupidly inefficient. Need benchmarks.
  appendRaw(tar, val) {
    const buf = tar.cloneNode()
    buf.innerHTML = reqRaw(val)
    while (buf.firstChild) tar.append(buf.firstChild)
  }

  appendSeq(tar, val) {for (val of val) this.appendChi(tar, val)}

  mutText(tar, val) {
    reqNode(tar)
    setOpt(tar, `textContent`, tar.textContent, this.str(val))
    return tar
  }

  // Seems faster than a set.
  isBoolAttr(key) {return key === `allowfullscreen` || key === `allowpaymentrequest` || key === `async` || key === `autofocus` || key === `autoplay` || key === `checked` || key === `controls` || key === `default` || key === `disabled` || key === `formnovalidate` || key === `hidden` || key === `ismap` || key === `itemscope` || key === `loop` || key === `multiple` || key === `muted` || key === `nomodule` || key === `novalidate` || key === `open` || key === `playsinline` || key === `readonly` || key === `required` || key === `reversed` || key === `selected` || key === `truespeed`}

  isVac(val) {return l.isNil(val) || (this.lax && !l.isScalar(val))}
  str(val) {return this.isVac(val) ? `` : l.render(val)}
  strOpt(val) {return this.isVac(val) ? undefined : l.render(val)}

  get TagPh() {return TagPh}
  get TagnPh() {return TagnPh}
  get [Symbol.toStringTag]() {return this.constructor.name}
}

Ren.main = /* @__PURE__ */ new Ren()

/*
Renderer specialized for SVG elements. Unlike template-based systems, we can't
automatically detect when to use the SVG namespace, because our markup consists
of nested function calls which are evaluated inner-to-outer. The user code must
tell us, by using this renderer.
*/
export class RenSvg extends Ren {
  make(tag, props) {
    l.reqStr(tag)
    return document.createElementNS(`http://www.w3.org/2000/svg`, tag, props)
  }
}

RenSvg.main = /* @__PURE__ */ new RenSvg()

/*
Markup wrapped in this marker class is included into the DOM as raw
`.innerHTML`, rather than as text.
*/
export class Raw extends String {}

/*
ARIA attributes seem to be case-insensitive. Unlike `data-` attributes,
they don't seem to require kebab conversion.
*/
function toAria(key) {return `aria-` + key.slice(`aria`.length).toLowerCase()}

/*
Many DOM APIs think that nil can be only `null` but not `undefined`.
Many other APIs think the exact opposite.
*/
function norm(val) {return l.isNil(val) ? null : val}

function errMismatch(tar, key, src, val) {
  return TypeError(`unable to set ${l.show(key)} ${l.show(val)} on ${l.show(tar)}: type mismatch with ${l.show(src)}`)
}

function optAt(val, key, fun) {
  if (l.isNil(val) || fun(val)) return val
  throw TypeError(`invalid property ${l.show(key)}: ` + l.msgType(val, fun))
}

// Dup from `dom.mjs` to avoid import.
function isNode(val) {return typeof Node === `function` && l.isInst(val, Node)}
function reqNode(val) {return l.req(val, isNode)}

// Dup from `dom.mjs` to avoid import.
function isElement(val) {return typeof Element === `function` && l.isInst(val, Element)}
function reqElement(val) {return l.req(val, isElement)}

function isRaw(val) {return l.isInst(val, Raw)}
function reqRaw(val) {return l.req(val, isRaw)}

// Sometimes avoids slow style/layout recalculations.
function setOpt(tar, key, prev, next) {if (!l.is(prev, next)) tar[key] = next}

function nodeClear(val) {while (val.firstChild) val.firstChild.remove()}

// Suboptimal but not worth more lines.
export function merge(...val) {return val.reduce(mergeAdd, l.npo())}

function mergeAdd(acc, val) {
  return {...acc, ...val, class: spaced(acc.class, l.laxStruct(val).class)}
}

// Suboptimal but not worth more lines.
function spaced(...val) {return val.reduce(spaceAdd, undefined)}

function spaceAdd(acc, val) {
  return (acc && l.laxStr(val)) ? (acc + ` ` + val) : (val || acc)
}
