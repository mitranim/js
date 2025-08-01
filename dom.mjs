/* global document*/

import * as l from './lang.mjs'
import * as o from './obj.mjs'

export function isEvent(val) {return typeof Event === `function` && l.isInst(val, Event)}
export function reqEvent(val) {return l.req(val, isEvent)}
export function optEvent(val) {return l.opt(val, isEvent)}

export function isChildNode(val) {return l.isObj(val) && `parentNode` in val}
export function reqChildNode(val) {return l.req(val, isChildNode)}
export function optChildNode(val) {return l.opt(val, isChildNode)}

export function isParentNode(val) {return l.isObj(val) && `childNodes` in val}
export function reqParentNode(val) {return l.req(val, isParentNode)}
export function optParentNode(val) {return l.opt(val, isParentNode)}

// See `dom_shim.mjs` → `Node`.
export function isNode(val) {return l.isObj(val) && `nodeType` in val}
export function reqNode(val) {return l.req(val, isNode)}
export function optNode(val) {return l.opt(val, isNode)}

// See `dom_shim.mjs` → `Node.ELEMENT_NODE`.
export function isElement(val) {return l.isObj(val) && val.nodeType === 1}
export function reqElement(val) {return l.req(val, isElement)}
export function optElement(val) {return l.opt(val, isElement)}

export function isBlob(val) {return typeof Blob === `function` && l.isInst(val, Blob)}
export function reqBlob(val) {return l.req(val, isBlob)}
export function optBlob(val) {return l.opt(val, isBlob)}

export function isFile(val) {return typeof File === `function` && l.isInst(val, File)}
export function reqFile(val) {return l.req(val, isFile)}
export function optFile(val) {return l.opt(val, isFile)}

export function eventKill(val) {
  if (!optEvent(val)) return val
  val.preventDefault()
  return eventStop(val)
}

export function eventStop(val) {
  if (!optEvent(val)) return val
  val.stopPropagation()
  val.stopImmediatePropagation()
  return val
}

export function isEventModified(val) {
  return !!(optEvent(val) && (val.altKey || val.ctrlKey || val.metaKey || val.shiftKey))
}

export function eventDispatch(tar, typ, data) {
  tar.dispatchEvent(new CustomEvent(l.reqStr(typ), {detail: data}))
}

export function eventListen(tar, typ, han, opt) {
  l.reqObj(tar).addEventListener(l.reqStr(typ), l.reqComp(han), l.optRec(opt))
  return function deinit() {tar.removeEventListener(typ, han, opt)}
}

export class ListenRef extends l.WeakRef {
  constructor(tar, src, typ, fun, opt) {
    super(tar)
    this.src = new l.WeakRef(src)
    this.typ = l.reqStr(typ)
    this.fun = l.reqFun(fun)
    this.opt = l.optRec(opt)
    REG_DEINIT.register(tar, this)
  }

  handleEvent(eve) {
    const tar = this.deref()
    if (tar) this.fun.call(tar, eve)
    else this.deinit()
  }

  init() {
    this.deinit()
    this.src.deref().addEventListener(this.typ, this, this.opt)
    return this
  }

  deinit() {
    this.src.deref()?.removeEventListener(this.typ, this, this.opt)
  }
}

const REG_DEINIT = new l.FinalizationRegistry(function finalizeDeinit(val) {
  if (l.isFun(val)) val()
  else val.deinit()
})

export function nodeShow(val) {if (optNode(val) && val.hidden) val.hidden = false}
export function nodeHide(val) {if (optNode(val) && !val.hidden) val.hidden = true}
export function nodeRemove(val) {if (optNode(val)) val.remove()}
export function nodeSel(val, sel) {return val.querySelector(l.reqStr(sel))}
export function nodeSelAll(val, sel) {return val.querySelectorAll(l.reqStr(sel))}
export function isConnected(val) {return isNode(val) && val.isConnected}
export function isDisconnected(val) {return isNode(val) && !val.isConnected}

export function copyToClipboard(src) {
  if (!(src = l.render(src))) return

  const prev = document.activeElement
  const next = document.createElement(`textarea`)
  next.value = src
  document.body.append(next)

  try {
    next.focus()
    selectText(next)
    document.execCommand(`copy`)
  }
  finally {
    next.remove()
    prev?.focus?.()
  }
}

export function selectText(val) {
  if (!optElement(val)) return

  if (l.hasMeth(val, `select`)) {
    val.select()
  }
  else if (l.hasMeth(val, `setSelectionRange`)) {
    val.setSelectionRange(0, l.laxStr(val.value).length)
  }
}

export function ancestor(tar, cls) {return findAncestor(tar, clsTest(cls))}

function clsTest(cls) {
  l.reqFun(cls)
  return function test(val) {return l.isInst(val, cls)}
}

export function findAncestor(tar, fun) {
  l.reqFun(fun)
  while (l.isSome(tar)) {
    if (fun(tar)) return tar
    if (!isChildNode(tar)) break
    tar = tar.parentNode
  }
  return undefined
}

/*
Implementation note. In a native DOM environment, we could transparently use
`.querySelector` when the given class is registered through `dom_reg.mjs` and
has `.localName` and `.customName` defined as static properties. You would
expect `.querySelector` to perform better. However, in testing, it seems to
perform worse than our approach.
*/
export function descendant(src, cls) {return findDescendant(src, clsTest(cls))}

export function findDescendant(val, fun) {
  for (val of findDescendants(val, fun)) return val
  return undefined
}

export function descendants(tar, cls) {return findDescendants(tar, clsTest(cls))}

export function* findDescendants(val, fun) {
  l.reqFun(fun)

  if (l.isNil(val)) return
  if (fun(val)) yield val

  if (!isParentNode(val)) return
  val = val.childNodes
  if (val) for (val of val) yield* findDescendants(val, fun)
}

export function findNextSibling(tar, fun) {
  l.reqFun(fun)
  while (l.isSome((tar = l.get(tar, `nextSibling`)))) {
    if (fun(tar)) return tar
  }
  return undefined
}

export function nextSibling(tar, cls) {return findNextSibling(tar, clsTest(cls))}

export function findPrevSibling(tar, fun) {
  l.reqFun(fun)
  while (l.isSome((tar = l.get(tar, `previousSibling`)))) {
    if (fun(tar)) return tar
  }
  return undefined
}

export function prevSibling(tar, cls) {return findPrevSibling(tar, clsTest(cls))}

/*
Takes a DOM node class and returns a subclass with various shortcuts for DOM
inspection and manipulation.
*/
export function MixNode(val) {return MixinNode.get(val)}

export class MixinNode extends o.Mixin {
  static make(cls) {
    return class MixinNode extends cls {
      anc(cls) {return ancestor(this, cls)}
      findAnc(fun) {return findAncestor(this, fun)}

      desc(cls) {return descendant(this, cls)}
      findDesc(fun) {return findDescendant(this, fun)}

      descs(cls) {return descendants(this, cls)}
      findDescs(fun) {return findDescendants(this, fun)}
    }
  }
}

// Should match `dom_shim.mjs`.
export const PARENT_NODE = Symbol.for(`parentNode`)

/*
Short for "mixin: child". Supports establishing child-to-parent relations.

Implementation note. This uses the `get parentNode` and `set parentNode`
properties for compatibility with native DOM classes and our own DOM shim.
In addition to properties, we provide methods, because:

- Methods are easier to override. Subclasses may override `.setParent` to add a
  type assertion. To correctly override `set parentNode`, a subclass must also
  explicitly define `get parentNode`, which takes more code and ends up more
  error-prone.

- Methods may return `this`, which is convenient for chaining.
*/
export function MixChild(val) {return MixinChild.get(val)}

export class MixinChild extends o.Mixin {
  static make(cls) {
    const desc = o.descIn(cls.prototype, `parentNode`)

    if (!desc || !desc.get) {
      return class ChildClsBase extends cls {
        get parentNode() {return this[PARENT_NODE]}
        set parentNode(val) {this[PARENT_NODE] = val}

        getParent() {return this.parentNode}
        setParent(val) {return this.parentNode = val, this}
      }
    }

    if (desc.set) {
      return class ChildClsOnlyMethods extends cls {
        getParent() {return this.parentNode}
        setParent(val) {return this.parentNode = val, this}
      }
    }

    /*
    Native DOM classes operate in this mode. They define `.parentNode` getter
    without setter. DOM tree operations set this property magically, bypassing
    JS operations. We must prioritize the native getter over our property to
    ensure that when the element is attached to the DOM, the native parent
    takes priority over the grafted one.
    */
    return class ChildClsCompat extends cls {
      get parentNode() {return super.parentNode ?? this[PARENT_NODE]}
      set parentNode(val) {this[PARENT_NODE] = val}

      getParent() {return this.parentNode}
      setParent(val) {return this.parentNode = val, this}
    }
  }
}

/*
Short for "mixin: child with constructor". Variant of `MixChild` that
automatically calls `.setParent` in the constructor if at least one argument
was provided. Convenient for code that heavily relies on child-to-parent
relations, which are particularly important when working with custom DOM
elements and using our `prax.mjs` and/or `dom_shim.mjs`.

Important note. Normally, DOM nodes establish child-to-parent relations when
children are attached to parents. With this mixin, the child-to-parent
relationship is established at construction time, via the first argument
provided to the constructor, and before the child is attached to the parent.
This allows children to immediately traverse the ancestor chain to
access "contextual" data available on ancestors. Note that this establishes
only child-to-parent relations, not parent-to-child. The latter become
available only after attaching the newly initialized children to the parent,
which is out of scope for this mixin.
*/
export function MixChildCon(val) {return MixinChildCon.get(val)}

export class MixinChildCon extends o.Mixin {
  static make(cls) {
    return class ChildCon extends MixChild(cls) {
      constructor(...val) {
        super()
        if (val.length) this.setParent(...val)
      }
    }
  }
}
