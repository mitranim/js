import * as l from './lang.mjs'
import * as o from './obj.mjs'

export function reg(cls) {return Reg.main.reg(cls)}

export const MixReg = /* @__PURE__ */ o.weakCache(function MixReg(cls) {
  return class MixReg extends cls {
    constructor(...val) {reg(new.target), super(...val)}
  }
})

// Maps class names such as `HTMLAnchorElement` to base local names such as `a`.
export class BaseTags extends Map {
  find(cls) {
    l.reqCls(cls)

    while (l.isFun(cls)) {
      const {name} = cls

      if (name) {
        if (this.has(name)) return this.get(name)

        const mat = name.match(RE_BASE)

        if (mat) {
          const val = mat[1].toLowerCase()
          this.set(name, val)
          return val
        }
      }

      cls = Object.getPrototypeOf(cls)
    }

    return ``
  }
}

BaseTags.main = /* @__PURE__ */ new BaseTags()
  // Unambiguous cases.
  .set(`HTMLAnchorElement`, `a`)
  .set(`HTMLQuoteElement`, `blockquote`)
  .set(`HTMLDListElement`, `dl`)
  .set(`HTMLImageElement`, `img`)
  .set(`HTMLOListElement`, `ol`)
  .set(`HTMLParagraphElement`, `p`)
  .set(`HTMLTableCaptionElement`, `caption`)
  .set(`HTMLTableRowElement`, `tr`)
  .set(`HTMLUListElement`, `ul`)
  // Ambiguous cases.
  .set(`HTMLTableColElement`, `col`)       // All: col, colgroup.
  .set(`HTMLTableSectionElement`, `tbody`) // All: thead, tbody, tfoot.
  .set(`HTMLTableCellElement`, `td`)       // All: th, td.

export class Reg extends l.Emp {
  constructor(def) {
    super()
    this.definer = optDefiner(def)
    this.all = new Set()
    this.pending = new Set()
    this.clsToLocalName = new Map()
    this.localNameToCls = new Map()
  }

  tagHas(val) {return this.localNameToCls.has(val)}
  tagCls(val) {return this.localNameToCls.get(val)}
  clsHas(val) {return this.clsToLocalName.has(val)}
  clsTag(val) {return this.clsToLocalName.get(val)}

  setDefiner(def) {
    this.definer = optDefiner(def)
    if (def) {
      for (const cls of this.pending) {
        this.pending.delete(cls)
        this.def(def, cls)
      }
    }
  }

  reg(cls) {
    if (!this.all.has(cls)) {
      this.setup(cls)
      if (this.definer) this.def(this.definer, cls)
      else this.pending.add(cls)
      this.all.add(cls)
    }
    return cls
  }

  def(tar, cls) {
    if (tar.get?.(cls.localName)) return
    tar.define(cls.localName, cls, cls.options)
  }

  setup(cls) {
    this.setupLocalName(cls)
    this.setupOptions(cls)
  }

  setupLocalName(cls) {
    // If a class provides its own `localName`, we must use this EXACT name
    // without automatic derivatives, fallbacks, or redundancies.
    if (l.hasOwn(cls, `localName`)) {
      const name = l.reqStr(cls.localName)

      if (this.localNameToCls.has(name)) {
        if (this.localNameToCls.get(name) === name) return
        throw Error(`redundant registration of ${name}`)
      }

      this.clsToLocalName.set(cls, name)
      this.localNameToCls.set(name, cls)
      return
    }

    const base = this.clsLocalName(cls)
    let name = base
    let ind = 0
    while (this.localNameToCls.has(name)) name = base + `-` + ++ind

    final(cls, `localName`, name)
    this.clsToLocalName.set(cls, name)
    this.localNameToCls.set(name, cls)
  }

  setupOptions(cls) {
    if (l.hasOwn(cls, `options`)) return
    const name = BaseTags.main.find(cls)
    final(cls, `options`, name ? {extends: name} : undefined)
  }

  clsLocalName(cls) {
    const words = toWords(l.reqCls(cls).name)
    switch (words.length) {
      case 0: return ``
      case 1: return `a-` + words[0].toLowerCase()
      default: return toKebab(words)
    }
  }
}

Reg.main = /* @__PURE__ */ new Reg(globalThis.customElements)

const RE_BASE = /^(?:HTML|SVG)(\w*)Element$/

/*
Simpler and more restrictive compared to the word regexp in `str.mjs`.
Specialized for converting class names to HTML custom element tags, which allow
only lowercase Latin letters, digits, hyphens. Not equivalent to the algorithm
for converting camel to kebab for dataset attrs.
*/
function toWords(str) {
  return (str && str.match(/[A-Za-z0-9]+?(?=[^a-z0-9]|$)/g)) || []
}

function toKebab(words) {return words.join(`-`).toLowerCase()}
function isDefiner(val) {return l.hasMeth(val, `define`)}
function optDefiner(val) {return l.opt(val, isDefiner)}
function final(tar, key, value) {Object.defineProperty(tar, key, {value})}
