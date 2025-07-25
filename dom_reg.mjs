import * as l from './lang.mjs'
import * as o from './obj.mjs'

/*
Part of the DOM spec not exposed by browser implementations: mapping from
element names to class names. The DOM API doesn't seem to expose this.
*/
export const TAG_TO_CLS = {
  __proto__: null,
  a: `HTMLAnchorElement`,
  area: `HTMLAreaElement`,
  audio: `HTMLAudioElement`,
  base: `HTMLBaseElement`,
  body: `HTMLBodyElement`,
  br: `HTMLBRElement`,
  button: `HTMLButtonElement`,
  canvas: `HTMLCanvasElement`,
  data: `HTMLDataElement`,
  datalist: `HTMLDataListElement`,
  details: `HTMLDetailsElement`,
  dialog: `HTMLDialogElement`,
  div: `HTMLDivElement`,
  dl: `HTMLDListElement`,
  embed: `HTMLEmbedElement`,
  fieldset: `HTMLFieldSetElement`,
  font: `HTMLFontElement`,
  form: `HTMLFormElement`,
  frame: `HTMLFrameElement`,
  frameset: `HTMLFrameSetElement`,
  head: `HTMLHeadElement`,
  h1: `HTMLHeadingElement`,
  h2: `HTMLHeadingElement`,
  h3: `HTMLHeadingElement`,
  h4: `HTMLHeadingElement`,
  h5: `HTMLHeadingElement`,
  h6: `HTMLHeadingElement`,
  hr: `HTMLHRElement`,
  html: `HTMLHtmlElement`,
  iframe: `HTMLIFrameElement`,
  img: `HTMLImageElement`,
  input: `HTMLInputElement`,
  label: `HTMLLabelElement`,
  legend: `HTMLLegendElement`,
  li: `HTMLLIElement`,
  link: `HTMLLinkElement`,
  map: `HTMLMapElement`,
  marquee: `HTMLMarqueeElement`,
  menu: `HTMLMenuElement`,
  meta: `HTMLMetaElement`,
  meter: `HTMLMeterElement`,
  del: `HTMLModElement`,
  ins: `HTMLModElement`,
  object: `HTMLObjectElement`,
  ol: `HTMLOListElement`,
  optgroup: `HTMLOptGroupElement`,
  option: `HTMLOptionElement`,
  output: `HTMLOutputElement`,
  p: `HTMLParagraphElement`,
  param: `HTMLParamElement`,
  picture: `HTMLPictureElement`,
  pre: `HTMLPreElement`,
  progress: `HTMLProgressElement`,
  q: `HTMLQuoteElement`,
  blockquote: `HTMLQuoteElement`,
  script: `HTMLScriptElement`,
  select: `HTMLSelectElement`,
  slot: `HTMLSlotElement`,
  source: `HTMLSourceElement`,
  span: `HTMLSpanElement`,
  style: `HTMLStyleElement`,
  caption: `HTMLTableCaptionElement`,
  th: `HTMLTableCellElement`,
  td: `HTMLTableCellElement`,
  col: `HTMLTableColElement`,
  colgroup: `HTMLTableColElement`,
  table: `HTMLTableElement`,
  tr: `HTMLTableRowElement`,
  tfoot: `HTMLTableSectionElement`,
  thead: `HTMLTableSectionElement`,
  tbody: `HTMLTableSectionElement`,
  template: `HTMLTemplateElement`,
  textarea: `HTMLTextAreaElement`,
  time: `HTMLTimeElement`,
  title: `HTMLTitleElement`,
  track: `HTMLTrackElement`,
  ul: `HTMLUListElement`,
  video: `HTMLVideoElement`,
  svg: `SVGSvgElement`,
}

/*
Another part of the DOM spec not exposed by browser implementations:
mapping from class names to element names.
*/
export const CLS_TO_TAG = clsToTag(TAG_TO_CLS)

function clsToTag(src) {
  const out = l.Emp()
  for (const [tag, cls] of Object.entries(src)) {
    out[cls] = cls in out ? undefined : tag
  }
  return out
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
