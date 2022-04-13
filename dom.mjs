import * as l from './lang.mjs'
import * as u from './url.mjs'

export const HAS_DOM = (
  typeof window === `object` && !!window &&
  typeof document === `object` && !!document
)

export function isEvent(val) {return typeof Event === `function` && l.isInst(val, Event)}
export function reqEvent(val) {return l.req(val, isEvent)}
export function optEvent(val) {return l.opt(val, isEvent)}

export function isNode(val) {return typeof Node === `function` && l.isInst(val, Node)}
export function reqNode(val) {return l.req(val, isNode)}
export function optNode(val) {return l.opt(val, isNode)}

export function isElement(val) {return typeof Element === `function` && l.isInst(val, Element)}
export function reqElement(val) {return l.req(val, isElement)}
export function optElement(val) {return l.opt(val, isElement)}

export function isBlob(val) {return typeof Blob === `function` && l.isInst(val, Blob)}
export function reqBlob(val) {return l.req(val, isBlob)}
export function optBlob(val) {return l.opt(val, isBlob)}

export function isFile(val) {return typeof File === `function` && l.isInst(val, File)}
export function reqFile(val) {return l.req(val, isFile)}
export function optFile(val) {return l.opt(val, isFile)}

export function isDomHandler(val) {return l.hasMeth(val, `handleEvent`)}
export function reqDomHandler(val) {return l.req(val, isDomHandler)}
export function optDomHandler(val) {return l.opt(val, isDomHandler)}

export function mutDoc(head, body) {
  DocHeadMut.main.mut(head)
  DocBodyMut.main.mut(body)
}

export class DocHeadMut extends WeakSet {
  get head() {return document.head}
  get title() {return document.title}
  set title(val) {document.title = val}

  mut(src) {
    l.reqInst(src, HTMLHeadElement)
    const set = new Set(src.children)

    for (const val of copy(this.head.children)) {
      if (this.has(val) && !set.has(val)) val.remove()
    }

    for (const val of set) this.append(val)
  }

  append(val) {
    if (val instanceof HTMLTitleElement) {
      this.title = val.textContent
    }
    else {
      this.add(val)
      this.head.append(val)
    }
  }
}
DocHeadMut.main = /* @__PURE__ */ new DocHeadMut()

export class DocBodyMut extends l.Emp {
  get foc() {return DocFoc.main}
  get doc() {return document}

  mut(val) {
    l.reqInst(val, HTMLBodyElement)
    this.foc.stash()
    this.doc.body = val
    this.foc.pop()
  }
}
DocBodyMut.main = /* @__PURE__ */ new DocBodyMut()

/*
Short for "document focus". Can stash/pop the path to the focused node, which is
useful when replacing the document body. Array subclasses have performance
issues, but this is not a bottleneck.
*/
export class DocFoc extends Array {
  get doc() {return document}

  clear() {this.length = 0}

  pop() {try {this.apply()} finally {this.clear()}}

  apply() {
    let val = this.doc
    for (const ind of this) if (!(val = val.childNodes[ind])) return
    if (l.hasMeth(val, `focus`)) val.focus()
  }

  stash() {
    this.clear()
    let val = this.doc.activeElement
    while (val && val.parentNode) {
      this.push(indexOf(val.parentNode.childNodes, val))
      val = val.parentNode
    }
    this.reverse()
  }
}

DocFoc.main = /* @__PURE__ */ new DocFoc()

function copy(val) {return Array.prototype.slice.call(val)}
function indexOf(list, val) {return Array.prototype.indexOf.call(list, val)}

export function eventStop(val) {
  if (optEvent(val)) {
    val.preventDefault()
    val.stopPropagation()
  }
  return val
}

export function isEventModified(val) {
  return !!(optEvent(val) && (val.altKey || val.ctrlKey || val.metaKey || val.shiftKey))
}

export function nodeShow(val) {if (optNode(val) && val.hidden) val.hidden = false}
export function nodeHide(val) {if (optNode(val) && !val.hidden) val.hidden = true}
export function nodeRemove(val) {if (optNode(val)) val.remove()}
export function nodeSel(val, sel) {return val.querySelector(l.reqStr(sel))}
export function nodeSelAll(val, sel) {return val.querySelectorAll(l.reqStr(sel))}

export function isConnected(val) {return isNode(val) && val.isConnected}
export function isDisconnected(val) {return isNode(val) && !val.isConnected}

export function addEvents(node, names, opt) {
  reqDomHandler(node)
  for (const name of l.reqArr(names)) node.addEventListener(name, node, opt)
}

export function removeEvents(node, names, opt) {
  reqDomHandler(node)
  for (const name of l.reqArr(names)) node.removeEventListener(name, node, opt)
}

export function clip(val) {
  if (!(val = l.laxStr(val))) return

  const node = document.createElement(`input`)
  node.value = val

  document.body.append(node)
  try {clipNode(node)}
  finally {node.remove()}
}

export function clipNode(val) {selectText(val), document.execCommand(`copy`)}

export function selectText(val) {
  if (!optElement(val)) return

  if (l.hasMeth(val, `select`)) {
    val.select()
  }
  else if (l.hasMeth(val, `setSelectionRange`)) {
    val.setSelectionRange(0, l.laxStr(val.value).length)
  }
}

export function findAncestor(node, cls) {
  l.reqCls(cls)
  while (optNode(node)) {
    if (l.isInst(node, cls)) return node
    node = node.parentNode
  }
  return undefined
}

export function loc(val) {return new Loc(val)}
export function toLoc(val) {return l.toInst(val, Loc)}

/*
Short for "location". Variant of `Url` with awareness of DOM APIs. Uses both
`window.location` and `window.history`, providing various shortcuts for
manipulating location and history.

Additional properties are symbolic for consistency with `Url`.
Getters and setters also perform type checking.
*/
export class Loc extends u.Url {
  constructor(val) {
    super()
    this[stateKey] = undefined
    this[titleKey] = ``
    this.reset(val)
  }

  get state() {return this[stateKey]}
  set state(val) {this[stateKey] = val}

  get title() {return this[titleKey]}
  set title(val) {this[titleKey] = l.laxStr(val)}

  withState(val) {return this.clone().setState(val)}
  setState(val) {return this.state = val, this}

  withTitle(val) {return this.clone().setTitle(val)}
  setTitle(val) {return this.title = val, this}

  push() {this.history.pushState(this.state, this.title, this)}
  replace() {this.history.replaceState(this.state, this.title, this)}
  reload() {this.location.href = this}

  // Allows `new Loc(loc)` and `loc.clone()`.
  resetFromUrl(val) {
    super.resetFromUrl(val)
    this.state = val.state
    this.title = val.title
    return this
  }

  eq(val) {
    return (
      !!l.optInst(val, Loc) &&
      l.is(this.state, val.state) &&
      l.is(this.title, val.title) &&
      l.is(this.href, val.href)
    )
  }

  get history() {return this.constructor.history}
  get location() {return this.constructor.location}

  static get history() {return window.history}
  static get location() {return window.location}

  // Note: at the time of writing, browsers don't store the title anywhere.
  static current() {
    return new this(this.location).setState(this.history.state)
  }
}

export const stateKey = Symbol.for(`state`)
export const titleKey = Symbol.for(`title`)
