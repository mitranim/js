import * as l from './lang.mjs'
import * as o from './obj.mjs'

/*
Represents a hidden part of native DOM implementations: mapping from element
names to class names. The native DOM API doesn't expose such a registry, so we
have to implement it ourselves.
*/
export const TAG_TO_CLS = l.Emp()
TAG_TO_CLS[`a`] = `HTMLAnchorElement`
TAG_TO_CLS[`area`] = `HTMLAreaElement`
TAG_TO_CLS[`audio`] = `HTMLAudioElement`
TAG_TO_CLS[`base`] = `HTMLBaseElement`
TAG_TO_CLS[`body`] = `HTMLBodyElement`
TAG_TO_CLS[`br`] = `HTMLBRElement`
TAG_TO_CLS[`button`] = `HTMLButtonElement`
TAG_TO_CLS[`canvas`] = `HTMLCanvasElement`
TAG_TO_CLS[`data`] = `HTMLDataElement`
TAG_TO_CLS[`datalist`] = `HTMLDataListElement`
TAG_TO_CLS[`details`] = `HTMLDetailsElement`
TAG_TO_CLS[`dialog`] = `HTMLDialogElement`
TAG_TO_CLS[`div`] = `HTMLDivElement`
TAG_TO_CLS[`dl`] = `HTMLDListElement`
TAG_TO_CLS[`embed`] = `HTMLEmbedElement`
TAG_TO_CLS[`fieldset`] = `HTMLFieldSetElement`
TAG_TO_CLS[`font`] = `HTMLFontElement`
TAG_TO_CLS[`form`] = `HTMLFormElement`
TAG_TO_CLS[`frame`] = `HTMLFrameElement`
TAG_TO_CLS[`frameset`] = `HTMLFrameSetElement`
TAG_TO_CLS[`head`] = `HTMLHeadElement`
TAG_TO_CLS[`h1`] = `HTMLHeadingElement`
TAG_TO_CLS[`h2`] = `HTMLHeadingElement`
TAG_TO_CLS[`h3`] = `HTMLHeadingElement`
TAG_TO_CLS[`h4`] = `HTMLHeadingElement`
TAG_TO_CLS[`h5`] = `HTMLHeadingElement`
TAG_TO_CLS[`h6`] = `HTMLHeadingElement`
TAG_TO_CLS[`hr`] = `HTMLHRElement`
TAG_TO_CLS[`html`] = `HTMLHtmlElement`
TAG_TO_CLS[`iframe`] = `HTMLIFrameElement`
TAG_TO_CLS[`img`] = `HTMLImageElement`
TAG_TO_CLS[`input`] = `HTMLInputElement`
TAG_TO_CLS[`label`] = `HTMLLabelElement`
TAG_TO_CLS[`legend`] = `HTMLLegendElement`
TAG_TO_CLS[`li`] = `HTMLLIElement`
TAG_TO_CLS[`link`] = `HTMLLinkElement`
TAG_TO_CLS[`map`] = `HTMLMapElement`
TAG_TO_CLS[`marquee`] = `HTMLMarqueeElement`
TAG_TO_CLS[`menu`] = `HTMLMenuElement`
TAG_TO_CLS[`meta`] = `HTMLMetaElement`
TAG_TO_CLS[`meter`] = `HTMLMeterElement`
TAG_TO_CLS[`del`] = `HTMLModElement`
TAG_TO_CLS[`ins`] = `HTMLModElement`
TAG_TO_CLS[`object`] = `HTMLObjectElement`
TAG_TO_CLS[`ol`] = `HTMLOListElement`
TAG_TO_CLS[`optgroup`] = `HTMLOptGroupElement`
TAG_TO_CLS[`option`] = `HTMLOptionElement`
TAG_TO_CLS[`output`] = `HTMLOutputElement`
TAG_TO_CLS[`p`] = `HTMLParagraphElement`
TAG_TO_CLS[`param`] = `HTMLParamElement`
TAG_TO_CLS[`picture`] = `HTMLPictureElement`
TAG_TO_CLS[`pre`] = `HTMLPreElement`
TAG_TO_CLS[`progress`] = `HTMLProgressElement`
TAG_TO_CLS[`q`] = `HTMLQuoteElement`
TAG_TO_CLS[`blockquote`] = `HTMLQuoteElement`
TAG_TO_CLS[`script`] = `HTMLScriptElement`
TAG_TO_CLS[`select`] = `HTMLSelectElement`
TAG_TO_CLS[`slot`] = `HTMLSlotElement`
TAG_TO_CLS[`source`] = `HTMLSourceElement`
TAG_TO_CLS[`span`] = `HTMLSpanElement`
TAG_TO_CLS[`style`] = `HTMLStyleElement`
TAG_TO_CLS[`caption`] = `HTMLTableCaptionElement`
TAG_TO_CLS[`th`] = `HTMLTableCellElement`
TAG_TO_CLS[`td`] = `HTMLTableCellElement`
TAG_TO_CLS[`col`] = `HTMLTableColElement`
TAG_TO_CLS[`colgroup`] = `HTMLTableColElement`
TAG_TO_CLS[`table`] = `HTMLTableElement`
TAG_TO_CLS[`tr`] = `HTMLTableRowElement`
TAG_TO_CLS[`tfoot`] = `HTMLTableSectionElement`
TAG_TO_CLS[`thead`] = `HTMLTableSectionElement`
TAG_TO_CLS[`tbody`] = `HTMLTableSectionElement`
TAG_TO_CLS[`template`] = `HTMLTemplateElement`
TAG_TO_CLS[`textarea`] = `HTMLTextAreaElement`
TAG_TO_CLS[`time`] = `HTMLTimeElement`
TAG_TO_CLS[`title`] = `HTMLTitleElement`
TAG_TO_CLS[`track`] = `HTMLTrackElement`
TAG_TO_CLS[`ul`] = `HTMLUListElement`
TAG_TO_CLS[`video`] = `HTMLVideoElement`
TAG_TO_CLS[`svg`] = `SVGSvgElement`

/*
Represents a hidden part of native DOM implementations: mapping from class names
to element names. The native DOM API doesn't expose such a registry, so we have
to implement it ourselves.
*/
export const CLS_TO_TAG = l.Emp()
for (const [tag, cls] of Object.entries(TAG_TO_CLS)) {
  CLS_TO_TAG[cls] = cls in CLS_TO_TAG ? undefined : tag
}

const RE_ELEM_CLS_NAME = /^(?:HTML|SVG)(\w*)Element$/

/*
Given a DOM element class, returns any known `.localName` for it. The static
property `.localName` takes priority. Otherwise we look for the nearest
superclass with a known entry in the registry `CLS_TO_TAG`. If nothing is
found, the result is nil.
*/
export function clsLocalName(cls) {
  l.reqFun(cls)
  const out = l.onlyStr(cls.localName)
  if (out) return isPossiblyCustomName(out) ? undefined : out

  while (l.isFun(cls)) {
    const {name} = cls

    if (name) {
      if (name in CLS_TO_TAG) return CLS_TO_TAG[name]
      const val = name.match(RE_ELEM_CLS_NAME)?.[1]?.toLowerCase()
      if (val) return CLS_TO_TAG[name] = val
    }

    cls = Object.getPrototypeOf(cls)
  }

  return undefined
}

export function MixReg(val) {return MixinReg.get(val)}

export class MixinReg extends o.Mixin {
  static make(cls) {
    return class Reg extends cls {
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
  pending = new Set()
  tagToCls = new Map()
  clsToTag = new Map()
  constructor(def) {super().definer = optDefiner(def)}

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
    const localName = clsLocalName(cls) || customName
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
    l.reqFun(cls)

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

  nameIs(cls) {
    this.reg(cls)
    const {localName: local, customName: custom} = cls
    return {name: local, is: local === custom ? undefined: custom}
  }

  static default() {return new this(onlyDefiner(globalThis.customElements))}
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
export function reqDefiner(val) {return l.req(val, isDefiner)}
export function onlyDefiner(val) {return l.only(val, isDefiner)}

function isPossiblyCustomName(val) {return l.isStr(val) && val.includes(`-`)}

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
export function isCustomName(val) {
  return l.isStr(val) && /^[a-z][a-z\d_.]*-[a-z\d_.-]*$/.test(val)
}

export function reqCustomName(val) {return l.req(val, isCustomName)}
