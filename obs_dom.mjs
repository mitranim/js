import * as l from './lang.mjs'
import * as ob from './obs.mjs'
import * as sc from './sched.mjs'

/*
Short for "mixin reactive". The output must be subclassed, and the subclass must
implement method "run" that mutates the instance. It runs when connected to the
DOM and reruns automatically when triggered by any observables that it uses.
See the readme.
*/
export function MixReac(cls) {
  return class MixReac extends cls {
    connectedCallback() {
      super.connectedCallback?.()
      const reac = this[reacKey] || (this[reacKey] = new ElementReac(this))
      reac.exec()
    }

    disconnectedCallback() {
      this[reacKey]?.deinit()
      super.disconnectedCallback?.()
    }
  }
}

export class ReacText extends (globalThis.Text || Object) {
  constructor(val) {
    super(l.renderLax(val))
    this[reacKey] = new TextReac(this)
  }

  /*
  Override in subclass. Called by `Reac`. During a run,
  accessing observables automatically establishes subscriptions.
  Call `.exec` to perform a reactive run.
  */
  run() {}

  // Subclasses may call this to perform a reactive run.
  exec() {this[reacKey].exec()}
}

/*
Usage:

  new FunText(() => someObservable.someField)
*/
export class FunText extends ReacText {
  constructor(fun) {
    super()
    this.fun = l.reqFun(fun)
    this.exec()
  }

  run() {
    const val = l.renderLax(this.fun())
    if (val !== this.textContent) this.textContent = val
  }
}

/*
Used internally by `Reac`. Implements "magic" automatic subscriptions on
observable access. Implements the interface required by `Sched`.
*/
export class ReacMoebius extends ob.Moebius {
  depth() {return this.ref.depth()}

  /*
  Called by `Sched`/`Que`.

  Explanation. Our scheduler uses async batching. This happens:

    obs_trig → sched_delay → DOM rebuild → sched_run

  Between scheduling this instance for a future run, and the actual run, the
  node may get disconnected. The disconnect calls `.deinit` on this instance,
  which clears subscriptions, but doesn't remove the instance from the pending
  que. We could modify the scheduler to support unscheduling, but it seems
  simpler and more reliable to check node liveness instead. A single node may
  get disconnected and reconnected multiple times. The next connect will reinit
  the reactive loop.
  */
  run() {
    if (this.ref.isLive()) super.run()
    else this.deinit()
  }
}

/*
Small adapter that enables implicit reactivity with careful hierarchical
scheduling. Expects external deinit such as via `.disconnectedCallback`.
Use `ElementReac` for elements, and `TextReac` for text.
*/
export class Reac extends l.Emp {
  constructor(node) {
    super()
    this.node = reqRunnerNode(node)
    this.loop = new ReacMoebius(this)
  }

  // Called by `Moebius`.
  run() {this.node.run()}
  trig() {this.sched.push(this.loop)}

  // Internal.
  exec() {this.loop.run()}
  depth() {return nodeDepth(this.node)}
  isLive() {return this.node.isConnected}
  deinit() {this.loop.deinit()}

  get sched() {return sc.Sched.main}
}

export class ElementReac extends Reac {
  constructor(node) {super(reqRunnerElement(node))}
}

/*
Implementation note. The DOM API doesn't seem to support `.connectedCallback`
and `.disconnectedCallback` for subclasses of `Text`. A reactive run that
updates the node and establishes subscriptions may happen in the constructor or
at other arbitrary times, and updates may be triggered before the node is
connected to the DOM, or after it's disconnected from the DOM. Without
connected/disconnected callbacks, we have to rely on heuristics. The current
heuristic is to unsubscribe if triggered when disconnected, but we may have to
revise this in the future.
*/
export class TextReac extends Reac {
  constructor(node) {super(reqRunnerText(node))}

  trig() {
    if (this.isLive()) super.trig()
    else this.deinit()
  }
}

const reacKey = Symbol.for(`reac`)

// Defined here, rather than `dom.mjs`, to avoid import.
function nodeDepth(val) {
  reqNode(val)
  let out = 0
  while ((val = val.parentNode)) out++
  return out
}

// Dup from `dom.mjs` to avoid import.
function isNode(val) {return l.isObj(val) && `parentNode` in val && `childNodes` in val}
function reqNode(val) {return l.req(val, isNode)}

// See `dom_shim.mjs`.
function isText(val) {return isNode(val) && val.nodeType === 3}

// See `dom_shim.mjs`.
function isElement(val) {return isNode(val) && val.nodeType === 1}

function isRunnerNode(val) {return isNode(val) && sc.isRunner(val)}
function reqRunnerNode(val) {return l.req(val, isRunnerNode)}

function isRunnerText(val) {return isText(val) && sc.isRunner(val)}
function reqRunnerText(val) {return l.req(val, isRunnerText)}

function isRunnerElement(val) {return isElement(val) && sc.isRunner(val)}
function reqRunnerElement(val) {return l.req(val, isRunnerElement)}
