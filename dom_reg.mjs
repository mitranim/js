import * as l from './lang.mjs'
import * as o from './obj.mjs'

class StrMap extends Map {
  set(key, val) {return super.set(l.reqStr(key), l.optStr(val))}
}

/*
Represents a hidden part of native DOM implementations: mapping from element
names to class names. The native DOM API doesn't expose such a registry, so we
have to implement it ourselves.
*/
export const tagToCls = l.Emp()
tagToCls[`a`] = `HTMLAnchorElement`
tagToCls[`area`] = `HTMLAreaElement`
tagToCls[`audio`] = `HTMLAudioElement`
tagToCls[`base`] = `HTMLBaseElement`
tagToCls[`body`] = `HTMLBodyElement`
tagToCls[`br`] = `HTMLBRElement`
tagToCls[`button`] = `HTMLButtonElement`
tagToCls[`canvas`] = `HTMLCanvasElement`
tagToCls[`data`] = `HTMLDataElement`
tagToCls[`datalist`] = `HTMLDataListElement`
tagToCls[`details`] = `HTMLDetailsElement`
tagToCls[`dialog`] = `HTMLDialogElement`
tagToCls[`div`] = `HTMLDivElement`
tagToCls[`dl`] = `HTMLDListElement`
tagToCls[`embed`] = `HTMLEmbedElement`
tagToCls[`fieldset`] = `HTMLFieldSetElement`
tagToCls[`font`] = `HTMLFontElement`
tagToCls[`form`] = `HTMLFormElement`
tagToCls[`frame`] = `HTMLFrameElement`
tagToCls[`frameset`] = `HTMLFrameSetElement`
tagToCls[`head`] = `HTMLHeadElement`
tagToCls[`h1`] = `HTMLHeadingElement`
tagToCls[`h2`] = `HTMLHeadingElement`
tagToCls[`h3`] = `HTMLHeadingElement`
tagToCls[`h4`] = `HTMLHeadingElement`
tagToCls[`h5`] = `HTMLHeadingElement`
tagToCls[`h6`] = `HTMLHeadingElement`
tagToCls[`hr`] = `HTMLHRElement`
tagToCls[`html`] = `HTMLHtmlElement`
tagToCls[`iframe`] = `HTMLIFrameElement`
tagToCls[`img`] = `HTMLImageElement`
tagToCls[`input`] = `HTMLInputElement`
tagToCls[`label`] = `HTMLLabelElement`
tagToCls[`legend`] = `HTMLLegendElement`
tagToCls[`li`] = `HTMLLIElement`
tagToCls[`link`] = `HTMLLinkElement`
tagToCls[`map`] = `HTMLMapElement`
tagToCls[`marquee`] = `HTMLMarqueeElement`
tagToCls[`menu`] = `HTMLMenuElement`
tagToCls[`meta`] = `HTMLMetaElement`
tagToCls[`meter`] = `HTMLMeterElement`
tagToCls[`del`] = `HTMLModElement`
tagToCls[`ins`] = `HTMLModElement`
tagToCls[`object`] = `HTMLObjectElement`
tagToCls[`ol`] = `HTMLOListElement`
tagToCls[`optgroup`] = `HTMLOptGroupElement`
tagToCls[`option`] = `HTMLOptionElement`
tagToCls[`output`] = `HTMLOutputElement`
tagToCls[`p`] = `HTMLParagraphElement`
tagToCls[`param`] = `HTMLParamElement`
tagToCls[`picture`] = `HTMLPictureElement`
tagToCls[`pre`] = `HTMLPreElement`
tagToCls[`progress`] = `HTMLProgressElement`
tagToCls[`q`] = `HTMLQuoteElement`
tagToCls[`blockquote`] = `HTMLQuoteElement`
tagToCls[`script`] = `HTMLScriptElement`
tagToCls[`select`] = `HTMLSelectElement`
tagToCls[`slot`] = `HTMLSlotElement`
tagToCls[`source`] = `HTMLSourceElement`
tagToCls[`span`] = `HTMLSpanElement`
tagToCls[`style`] = `HTMLStyleElement`
tagToCls[`caption`] = `HTMLTableCaptionElement`
tagToCls[`th`] = `HTMLTableCellElement`
tagToCls[`td`] = `HTMLTableCellElement`
tagToCls[`col`] = `HTMLTableColElement`
tagToCls[`colgroup`] = `HTMLTableColElement`
tagToCls[`table`] = `HTMLTableElement`
tagToCls[`tr`] = `HTMLTableRowElement`
tagToCls[`tfoot`] = `HTMLTableSectionElement`
tagToCls[`thead`] = `HTMLTableSectionElement`
tagToCls[`tbody`] = `HTMLTableSectionElement`
tagToCls[`template`] = `HTMLTemplateElement`
tagToCls[`textarea`] = `HTMLTextAreaElement`
tagToCls[`time`] = `HTMLTimeElement`
tagToCls[`title`] = `HTMLTitleElement`
tagToCls[`track`] = `HTMLTrackElement`
tagToCls[`ul`] = `HTMLUListElement`
tagToCls[`video`] = `HTMLVideoElement`
tagToCls[`svg`] = `SVGSvgElement`

/*
Represents a hidden part of native DOM implementations: mapping from class names
to element names. The native DOM API doesn't expose such a registry, so we have
to implement it ourselves.
*/
export const clsToTag = l.Emp()
for (const [tag, cls] of Object.entries(tagToCls)) {
  clsToTag[cls] = cls in clsToTag ? undefined : tag
}

const RE_ELEM_CLS_NAME = /^(?:HTML|SVG)(\w*)Element$/

// Given a DOM element class, returns an HTML `.localName` for its nearest
// superclass with a known associated `.localName`. Otherwise `undefined`.
// Uses the registry `clsToTag`.
export function clsLocalName(cls) {
  l.reqCls(cls)

  while (l.isFun(cls)) {
    const {name} = cls

    if (name) {
      if (name in clsToTag) return clsToTag[name]

      const mat = name.match(RE_ELEM_CLS_NAME)

      if (mat) {
        const val = mat[1].toLowerCase()
        clsToTag[name] = val
        return val
      }
    }

    cls = Object.getPrototypeOf(cls)
  }

  return undefined
}

// Shim/polyfill for the built-in `CustomElementRegistry`.
export class CustomElementRegistry extends o.MixMain(l.Emp) {
  constructor() {
    super()
    this.set = new Set()
    this.map = new Map()
  }

  get(val) {return this.map.get(val)}

  define(tag, cls, opt) {
    reqCustomName(tag)
    l.reqCls(cls)
    l.optStruct(opt)

    if (this.map.has(tag)) {
      throw Error(`redundant registration of ${l.show(tag)}`)
    }
    if (this.set.has(cls)) {
      throw Error(`redundant registration of ${l.show(cls)}`)
    }
    this.set.add(cls)
    this.map.set(tag, cls)
  }
}

export function MixReg(val) {return MixRegCache.goc(val)}

export class MixRegCache extends o.DedupMixinCache {
  static make(cls) {
    return class MixRegCls extends cls {
      constructor(...val) {
        reg(new.target)
        super(...val)
      }
    }
  }
}

export function setDefiner(def) {return Reg.main.setDefiner(def)}

export function reg(cls) {return Reg.main.reg(cls)}

export class Reg extends o.MixMain(l.Emp) {
  constructor(def) {
    super()
    this.pending = new Set()
    this.tagToCls = new Map()
    this.clsToTag = new Map()
    this.definer = optDefiner(def)
  }

  reg(cls) {
    if (this.hasCls(cls)) return cls
    this.mut(cls)
    this.def(cls)
    return cls
  }

  def(cls) {
    if (!this.definer) {
      this.pending.add(cls)
      return
    }

    this.pending.delete(cls)
    const {customName} = cls

    if (this.definer.get?.(customName)) return

    const {localName} = cls
    const opt = localName !== customName ? {extends: localName} : undefined
    this.definer.define(customName, cls, opt)
  }

  hasTag(val) {return this.tagToCls.has(val)}
  hasCls(val) {return this.clsToTag.has(val)}
  tagCls(val) {return this.tagToCls.get(val)}
  clsTag(val) {return this.clsToTag.get(val)}

  setDefiner(def) {
    if ((this.definer = optDefiner(def))) {
      for (const val of this.pending) this.def(val)
    }
  }

  mut(cls) {
    const customName = l.getOwn(cls, `customName`) || this.toTag(cls.name)
    if (!customName) throw Error(`unable to derive custom name for ${l.show(cls)}`)

    const localName = (
      l.getOwn(cls, `localName`) ||
      clsLocalName(cls) ||
      customName
    )

    o.final(cls, `localName`, localName)
    o.final(cls, `customName`, customName)
    this.assoc(customName, cls)
  }

  toTag(src) {
    src = toTag(src)
    let tar = src
    let ind = 0
    while (this.hasTag(tar)) tar = src + `-` + ++ind
    return tar
  }

  assoc(tag, cls) {
    reqCustomName(tag)
    l.reqCls(cls)

    const prevTag = this.clsToTag.get(cls)
    if (prevTag && prevTag !== tag) {
      throw Error(`tag mismatch for ${l.show(cls)}: expected ${l.show(tag)}, found ${l.show(prevTag)}`)
    }

    const prevCls = this.tagToCls.get(tag)
    if (prevCls && prevTag !== cls) {
      throw Error(`class mismatch for ${l.show(tag)}: expected ${l.show(cls)}, found ${l.show(prevCls)}`)
    }

    this.clsToTag.set(cls, tag)
    this.tagToCls.set(tag, cls)
  }
}

function toTag(name) {
  const words = toWords(l.optStr(name))
  switch (words.length) {
    case 0: return ``
    case 1: return `a-` + words[0].toLowerCase()
    default: return kebab(words)
  }
}

/*
Simpler and more restrictive compared to the word regexp in `str.mjs`.
Specialized for converting class names to HTML custom element tags, which allow
only lowercase Latin letters, digits, hyphens. Not equivalent to the algorithm
for converting camel to kebab for dataset attrs.
*/
function toWords(str) {
  return (str && str.match(/[A-Za-z0-9]+?(?=[^a-z0-9]|$)/g)) ?? []
}

function kebab(words) {return words.join(`-`).toLowerCase()}

export function isDefiner(val) {return l.hasMeth(val, `define`)}
export function optDefiner(val) {return l.opt(val, isDefiner)}

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
export function isCustomName(val) {
  return l.isStr(val) && /^[a-z][a-z\d_.]*-[a-z\d_.-]*$/.test(val)
}

export function reqCustomName(val) {
  return l.req(val, isCustomName)
}
