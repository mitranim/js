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
export class TagToCls extends o.MixMain(StrMap) {
  static get default() {
    return new this()
      .set(`a`, `HTMLAnchorElement`)
      .set(`area`, `HTMLAreaElement`)
      .set(`audio`, `HTMLAudioElement`)
      .set(`base`, `HTMLBaseElement`)
      .set(`body`, `HTMLBodyElement`)
      .set(`br`, `HTMLBRElement`)
      .set(`button`, `HTMLButtonElement`)
      .set(`canvas`, `HTMLCanvasElement`)
      .set(`data`, `HTMLDataElement`)
      .set(`datalist`, `HTMLDataListElement`)
      .set(`details`, `HTMLDetailsElement`)
      .set(`dialog`, `HTMLDialogElement`)
      .set(`div`, `HTMLDivElement`)
      .set(`dl`, `HTMLDListElement`)
      .set(`embed`, `HTMLEmbedElement`)
      .set(`fieldset`, `HTMLFieldSetElement`)
      .set(`font`, `HTMLFontElement`)
      .set(`form`, `HTMLFormElement`)
      .set(`frame`, `HTMLFrameElement`)
      .set(`frameset`, `HTMLFrameSetElement`)
      .set(`head`, `HTMLHeadElement`)
      .set(`heading`, `HTMLHeadingElement`)
      .set(`hr`, `HTMLHRElement`)
      .set(`html`, `HTMLHtmlElement`)
      .set(`iframe`, `HTMLIFrameElement`)
      .set(`image`, `HTMLImageElement`)
      .set(`input`, `HTMLInputElement`)
      .set(`label`, `HTMLLabelElement`)
      .set(`legend`, `HTMLLegendElement`)
      .set(`li`, `HTMLLIElement`)
      .set(`link`, `HTMLLinkElement`)
      .set(`map`, `HTMLMapElement`)
      .set(`marquee`, `HTMLMarqueeElement`)
      .set(`menu`, `HTMLMenuElement`)
      .set(`meta`, `HTMLMetaElement`)
      .set(`meter`, `HTMLMeterElement`)
      .set(`del`, `HTMLModElement`)
      .set(`ins`, `HTMLModElement`)
      .set(`object`, `HTMLObjectElement`)
      .set(`ol`, `HTMLOListElement`)
      .set(`optgroup`, `HTMLOptGroupElement`)
      .set(`option`, `HTMLOptionElement`)
      .set(`output`, `HTMLOutputElement`)
      .set(`p`, `HTMLParagraphElement`)
      .set(`param`, `HTMLParamElement`)
      .set(`picture`, `HTMLPictureElement`)
      .set(`pre`, `HTMLPreElement`)
      .set(`progress`, `HTMLProgressElement`)
      .set(`q`, `HTMLQuoteElement`)
      .set(`blockquote`, `HTMLQuoteElement`)
      .set(`script`, `HTMLScriptElement`)
      .set(`select`, `HTMLSelectElement`)
      .set(`slot`, `HTMLSlotElement`)
      .set(`source`, `HTMLSourceElement`)
      .set(`span`, `HTMLSpanElement`)
      .set(`style`, `HTMLStyleElement`)
      .set(`caption`, `HTMLTableCaptionElement`)
      .set(`th`, `HTMLTableCellElement`)
      .set(`td`, `HTMLTableCellElement`)
      .set(`col`, `HTMLTableColElement`)
      .set(`colgroup`, `HTMLTableColElement`)
      .set(`table`, `HTMLTableElement`)
      .set(`tr`, `HTMLTableRowElement`)
      .set(`tfoot`, `HTMLTableSectionElement`)
      .set(`thead`, `HTMLTableSectionElement`)
      .set(`tbody`, `HTMLTableSectionElement`)
      .set(`template`, `HTMLTemplateElement`)
      .set(`textarea`, `HTMLTextAreaElement`)
      .set(`time`, `HTMLTimeElement`)
      .set(`title`, `HTMLTitleElement`)
      .set(`track`, `HTMLTrackElement`)
      .set(`ul`, `HTMLUListElement`)
      .set(`video`, `HTMLVideoElement`)
      .set(`svg`, `SVGSvgElement`)
  }
}

/*
Represents a hidden part of native DOM implementations: mapping from class names
to element names. The native DOM API doesn't expose such a registry, so we have
to implement it ourselves.
*/
export class ClsToTag extends o.MixMain(StrMap) {
  invert(src) {
    for (const [key, val] of src) this.set(val, this.has(val) ? undefined : key)
    return this
  }

  localName(cls) {
    l.reqCls(cls)

    while (l.isFun(cls)) {
      const {name} = cls

      if (name) {
        if (this.has(name)) return this.get(name)

        const mat = name.match(l.reqReg(this.re))

        if (mat) {
          const val = mat[1].toLowerCase()
          this.set(name, val)
          return val
        }
      }

      cls = Object.getPrototypeOf(cls)
    }

    return undefined
  }

  get re() {return /^(?:HTML|SVG)(\w*)Element$/}

  static get default() {return new this().invert(TagToCls.main)}
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

export function MixReg(val) {return MixRegCache.main.goc(val)}

export class MixRegCache extends o.WeakCache {
  make(cls) {
    return class MixRegCls extends cls {
      constructor(...val) {
        reg(new.target)
        super(...val)
      }
    }
  }
}

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
      ClsToTag.main.localName(cls) ||
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
  return (str && str.match(/[A-Za-z0-9]+?(?=[^a-z0-9]|$)/g)) || []
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
