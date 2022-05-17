import * as l from './lang.mjs'
import * as rb from './ren_base.mjs'
export {A, P, Raw} from './ren_base.mjs'

export function E(...val) {return ren.E(...val)}
export function S(...val) {return RenDomSvg.main.E(...val)}
export function F(...val) {return ren.frag(...val)}
export function mut(...val) {return ren.mut(...val)}
export function mutProps(...val) {return ren.mutProps(...val)}
export function mutChi(...val) {return ren.mutChi(...val)}

/*
Creates or mutates DOM elements with a convenient React-inspired syntax.
Shared component of HTML and SVG renderers.
*/
export class RenDom extends rb.RenBase {
  /*
  Short for "element". Main API.
  Creates a DOM node with the given props and children.
  */
  E(tag, props, ...chi) {return this.mut(this.make(tag, props), props, ...chi)}

  // Short for "fragment". Used internally. Also allows JSX compat.
  frag(...val) {return this.addChi(new DocumentFragment(), ...val)}

  make(tag, props) {return document.createElement(this.reqTag(tag), props)}

  mut(tar, props, ...chi) {
    this.mutProps(tar, props)
    this.mutChi(tar, ...chi)
    return tar
  }

  mutProps(tar, val) {return this.loop(reqElement(tar), val, this.mutProp)}

  mutProp(tar, key, val) {
    if (key === `is`) return undefined
    if (key === `attributes`) return this.mutAttrs(tar, val)
    if (key === `class`) return this.mutCls(tar, val)
    if (key === `className`) return this.mutCls(tar, val)
    if (key === `style`) return this.mutStyle(tar, val)
    if (key === `dataset`) return this.mutDataset(tar, val)
    return this.mutPropAny(tar, key, val)
  }

  mutAttrs(tar, val) {return this.loop(tar, val, this.mutAttr)}

  mutAttr(tar, key, val) {
    if (this.isBool(key)) return this.mutAttrBool(tar, key, val)
    return this.mutAttrAny(tar, key, val)
  }

  mutAttrBool(tar, key, val) {
    l.reqStr(key)
    if (rb.optAt(key, val, l.isBool)) return tar.setAttribute(key, ``)
    return tar.removeAttribute(key)
  }

  mutAttrAny(tar, key, val) {
    l.reqStr(key)
    val = this.strOpt(val)
    if (l.isNil(val)) return tar.removeAttribute(key)
    return tar.setAttribute(key, val)
  }

  // Should work for both `HTMLElement` and `SVGElement`.
  mutCls(tar, val) {
    setOpt(tar.classList, `value`, tar.classList.value, this.strLax(val))
  }

  mutStyle(tar, val) {
    if (l.isNil(val) || l.isStr(val)) return this.mutAttrAny(tar, `style`, val)
    if (l.isStruct(val)) return this.mutStyleStruct(tar, val)
    throw l.errConv(val, `style`)
  }

  mutStyleStruct(tar, val) {return this.loop(tar, val, this.mutStyleProp)}

  mutStyleProp(tar, key, val) {
    const {style} = tar
    setOpt(style, key, style[key], rb.optAt(key, val, l.isStr) || ``)
  }

  mutDataset(tar, val) {return this.loop(tar, val, this.mutDatasetProp)}

  mutDatasetProp(tar, key, val) {
    val = this.strOpt(val)
    if (l.isNil(val)) delete tar.dataset[key]
    else tar.dataset[key] = val
    return tar
  }

  mutPropAny(tar, key, val) {
    if (!(key in tar)) return this.mutAttr(tar, key, val)

    const src = tar[key]
    if (l.isNil(src)) return setOpt(tar, key, src, norm(val))
    if (l.isStr(src)) return setOpt(tar, key, src, this.strLax(val))

    if (l.isPrim(src)) {
      if (l.isPrim(val)) {
        if (this.isBool(key)) rb.optAt(key, val, l.isBool)
        return setOpt(tar, key, src, norm(val))
      }

      throw errMismatch(tar, key, val, src)
    }

    if (l.isFun(src)) {
      if (l.isNil(val) || l.isFun(val)) return setOpt(tar, key, src, norm(val))
      throw errMismatch(tar, key, val, src)
    }

    return this.mutAttr(tar, key, val)
  }

  /*
  Important implementation detail. Because this renders children in a temporary
  fragment BEFORE clearing the target, exceptions during child rendering do NOT
  destroy the current content, leaving you with a blank page. This is a real
  blunder in Preact, which we avoid.
  */
  mutChi(tar, ...chi) {
    reqNode(tar)
    if (!chi.length) return nodeClear(tar)

    const frag = this.frag(...chi)
    nodeClear(tar)
    tar.appendChild(frag)
    return tar
  }

  // TODO: test deoptimization with non-array iterators.
  addChi(tar, ...val) {
    reqNode(tar)
    for (val of val) this.appendChi(tar, val)
    return tar
  }

  appendChi(tar, val) {
    if (l.isNil(val)) return undefined
    if (l.isStr(val)) return this.appendStr(tar, val)
    if (isNode(val)) return tar.appendChild(val)
    if (rb.isRaw(val)) return this.appendRaw(tar, val)
    if (l.isSeq(val)) return this.appendSeq(tar, val)
    return this.appendChi(tar, this.strOpt(val))
  }

  appendStr(tar, val) {if (l.reqStr(val)) tar.append(val)}

  /*
  Might be stupidly inefficient. Need benchmarks.
  Might not be compatible with SVG rendering. Needs SVG testing.
  */
  appendRaw(tar, val) {
    const buf = this.makeDef()
    buf.innerHTML = rb.reqRaw(val)
    while (buf.firstChild) tar.appendChild(buf.firstChild)
  }

  // TODO: test deoptimization with non-array iterators.
  appendSeq(tar, val) {for (val of val) this.appendChi(tar, val)}

  mutText(tar, val) {
    reqNode(tar)
    setOpt(tar, `textContent`, tar.textContent, this.strLax(val))
    return tar
  }

  replace(tar, ...chi) {
    reqNode(tar)
    tar.parentNode.replaceChild(this.frag(...chi), tar)
  }

  makeDef() {return this.make(`div`)}

  loop(tar, val, fun) {
    if ((val = this.deref(val))) {
      for (const key of l.structKeys(val)) {
        fun.call(this, tar, key, val[key])
      }
    }
    return tar
  }
}

export class RenDomHtml extends RenDom {
  E(tag, props, ...chi) {
    if (this.isVoid(tag) && chi.length) throw this.voidErr(tag, chi)
    return super.E(tag, props, ...chi)
  }
}
RenDomHtml.main = /* @__PURE__ */ new RenDomHtml()

// Easier to remember, and iso with `ren_str.mjs`.
export const ren = RenDomHtml.main

/*
Renderer specialized for SVG elements. Unlike template-based systems, we can't
automatically detect when to use the SVG namespace, because our markup consists
of nested function calls which are evaluated inner-to-outer, rather than
outer-to-inner. The user code must tell us, by using this renderer.
*/
export class RenDomSvg extends RenDom {
  make(tag, props) {
    l.reqStr(tag)
    return document.createElementNS(`http://www.w3.org/2000/svg`, tag, props)
  }

  makeDef() {return this.make(`svg`)}
}
RenDomSvg.main = /* @__PURE__ */ new RenDomSvg()

/*
In many DOM APIs only `null` is considered nil/missing, while `undefined` is
stringified to `'undefined'`.
*/
function norm(val) {return l.isNil(val) ? null : val}

function errMismatch(tar, key, val, src) {
  return TypeError(`unable to set ${l.show(key)} ${l.show(val)} on ${l.show(tar)}: type mismatch with ${l.show(src)}`)
}

// Dup from `dom.mjs` to avoid import.
function isNode(val) {return typeof Node === `function` && l.isInst(val, Node)}
function reqNode(val) {return l.req(val, isNode)}

// Dup from `dom.mjs` to avoid import.
function isElement(val) {return typeof Element === `function` && l.isInst(val, Element)}
function reqElement(val) {return l.req(val, isElement)}

// Sometimes avoids slow style/layout recalculations.
function setOpt(tar, key, prev, next) {if (!l.is(prev, next)) tar[key] = next}

function nodeClear(val) {while (val.firstChild) val.firstChild.remove()}
