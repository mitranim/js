import * as l from './lang.mjs'
import * as o from './obj.mjs'
import * as ob from './obs.mjs'

export const SYM_REC = Symbol.for(`recur`)

/*
Reactive version of a `Text` node. Usage:

  reacText(() => someObservable.someField)
*/
export function reacText(fun) {return new ReacText(fun)}

export class ReacText extends (l.onlyCls(globalThis.Text) || l.Emp) {
  get Recur() {return NodeRecur}

  constructor(fun) {
    super()
    this.fun = l.reqFun(fun)
    const rec = this[SYM_REC] = new this.Recur(this)
    rec.run()
  }

  run() {
    const val = l.renderLax(this.fun())
    if (val !== this.textContent) this.textContent = val
  }
}

/*
Short for "mixin: reactive element". The input must be a subclass of `Element`
(in a browser) or its shimmed equivalent from `dom_shim.mjs` (in server code).
The output must be subclassed, and the subclass must implement the method "run"
which is expected to access arbitrary observables and mutate the receiver. It
runs when connected to the DOM and reruns automatically when triggered by any
observables that it uses.
*/
export function MixReacElem(cls) {return MixReacElemCache.goc(cls)}

export class MixReacElemCache extends o.StaticCache {
  static make(cls) {
    return class MixReacElem extends cls {
      get Recur() {return ElemRecur}

      connectedCallback() {
        super.connectedCallback?.()
        const rec = this[SYM_REC] ||= new this.Recur(this)
        rec.run()
      }

      disconnectedCallback() {
        this[SYM_REC]?.deinit()
        super.disconnectedCallback?.()
      }
    }
  }
}

export const SYM_RECS = Symbol.for(`recurs`)

/*
Similar to `MixReacElem`, but instead of requiring and using a single method
called `.run`, expects the subclass or superclass to have a property or
getter `.runs`, which must be an iterable of functions (usually methods
from the class's prototype), which are used like `.run`, but separately.
Allows to trigger different methods on changes in different observables.
*/
export function MixReacsElem(cls) {return MixReacsElemCache.goc(cls)}

export class MixReacsElemCache extends o.StaticCache {
  static make(cls) {
    return class MixReacsElem extends cls {
      get Recur() {return FunElemRecur}

      connectedCallback() {
        super.connectedCallback?.()

        const runs = this.runs ?? this.constructor.runs
        if (l.isNil(runs)) return

        if (!this[SYM_RECS]) {
          const buf = []
          for (const fun of runs) buf.push(new this.Recur(this, fun))
          this[SYM_RECS] = buf
        }

        for (const rec of this[SYM_RECS]) rec.run()
      }

      disconnectedCallback() {
        const recs = this[SYM_RECS]
        if (recs) for (const rec of recs) rec.deinit()
        super.disconnectedCallback?.()
      }
    }
  }
}

export class NodeRecur extends ob.Recur {
  get Ref() {return WeakRef}

  constructor(node) {
    super()
    this.ref = new this.Ref(reqNode(node))
    REG_DEINIT.register(node, this)
  }

  onRun() {
    const node = this.ref.deref()
    return node ? node.run() : this.deinit()
  }

  depth() {return nodeDepth(this.node)}
}

export class ElemRecur extends NodeRecur {
  constructor(val) {super(reqElement(val))}

  onRun() {
    const node = this.ref.deref()
    return node?.isConnected ? node.run() : this.deinit()
  }
}

export class FunElemRecur extends ElemRecur {
  constructor(val, fun) {super(val).fun = l.reqFun(fun)}

  onRun() {
    const {ref, fun} = this
    const node = ref.deref()
    return node?.isConnected ? fun.call(node, node) : this.deinit()
  }
}

export const REG_DEINIT = new FinalizationRegistry(finalizeDeinit)
function finalizeDeinit(val) {val.deinit()}

export function nodeDepth(val) {
  let out = 0
  while ((val = val?.parentNode)) out++
  return out
}

// Dup from `dom.mjs` to avoid import.
export function isNode(val) {return l.isObj(val) && `parentNode` in val}
export function reqNode(val) {return l.req(val, isNode)}

// See `dom_shim.mjs`.
export function isElement(val) {return isNode(val) && val.nodeType === 1}
export function reqElement(val) {return l.req(val, isElement)}
