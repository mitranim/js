import * as l from './lang.mjs'
import * as o from './obj.mjs'

export const TRIG = new o.DynVar()
export const SYM_PH = Symbol.for(`ph`)
export const SYM_TAR = Symbol.for(`self`)
export const SYM_REC = Symbol.for(`recur`)
export const SYM_RECS = Symbol.for(`recurs`)

export function isRunner(val) {return l.isComp(val) && l.hasMeth(val, `run`)}
export function reqRunner(val) {return l.req(val, isRunner)}

export function isTrig(val) {return l.isComp(val) && l.hasMeth(val, `trigger`)}
export function reqTrig(val) {return l.req(val, isTrig)}

export function obs(val) {return new Proxy(val, new ObsPh())}
export function getPh(val) {return val?.[SYM_PH]}
export function getTar(val) {return val?.[SYM_TAR]}

export const REG_DELETE = new FinalizationRegistry(finalizeDelete)

function finalizeDelete([set, val]) {set.delete(val)}

export const REG_DEINIT = new FinalizationRegistry(finalizeDeinit)

function finalizeDeinit(val) {
  if (l.isFun(val)) val()
  else val.deinit()
}

/*
Short for "scheduler". Tool for scheduling hierarchical runs, from ancestors to
descendants. Runnables may report their "depth", which allows us to determine
order.

Note that scheduling is opt-in at the level of triggerables, not at the level of
observables. Our observables and broadcasters always monitor and trigger
synchronously. `Recur` uses scheduling by default, but subclasses can override
this behavior.
*/
export class Shed extends o.MixMain(l.Emp) {
  get Que() {return Que}

  ques = []
  timer = undefined
  scheduled = false
  run = this.run.bind(this)

  run() { // eslint-disable-line no-dupe-class-members
    this.unschedule()
    for (const que of this.ques) que?.run()
  }

  add(val) {
    this.queAt(val.depth()).add(val)
    this.schedule()
  }

  queAt(depth) {return this.ques[l.reqNat(depth)] ||= new this.Que()}

  schedule() {
    if (this.scheduled) return
    this.scheduled = true
    this.timer = this.timerInit(this.run)
  }

  unschedule() {
    const {timer} = this
    this.timer = undefined
    this.scheduled = false
    if (l.isSome(timer)) this.timerDeinit(timer)
  }

  timerInit(run) {
    const fun = globalThis.requestAnimationFrame || setTimeout
    return fun(run)
  }

  timerDeinit(val) {
    if (l.isNil(val)) return
    const fun = globalThis.cancelAnimationFrame || clearTimeout
    fun(val)
  }

  deinit() {
    this.unschedule()
    for (const que of this.ques) que?.deinit()
  }
}

/*
Used internally by `Shed`. Updates are scheduled by adding vals to the que, and
flushed together as a batch by calling `.run()`. Reentrant flush is a nop.

TODO consider preventing exceptions from individual vals from interfering with
each other.
*/
export class Que extends Set {
  active = false

  reqVal(val) {return reqRunner(val)}
  runVal(val) {return val.run()}
  add(val) {return super.add(this.reqVal(val))}

  run() {
    if (this.active) return
    this.active = true

    try {
      for (const val of this) {
        this.delete(val)
        this.runVal(val)
      }
    }
    finally {
      this.active = false
      this.clear()
    }
    return
  }
}

/*
Broadcaster used by observables. Supports implicit monitoring via the dynamic
variable `TRIG` which may hold a triggerable. Holds triggerables weakly.
*/
export class Broad extends l.Emp {
  get reg() {return REG_DELETE}

  refs = new Set()
  pairs = new WeakMap()
  trigs = new Set()

  constructor(src) {
    super()
    if (l.isSome(src)) for (src of src) this.add(src)
  }

  monitor() {
    const src = TRIG.get()
    if (isTrig(derefOpt(src))) this.add(src)
  }

  add(src) {
    const tar = reqTrig(derefOpt(src))
    const ref = l.onlyInst(src, WeakRef) ?? new WeakRef(tar)
    const {reg, refs, pairs} = this
    let pair = pairs.get(tar)

    if (pair) {
      refs.delete(pair[1])
      reg.unregister(pair)
    }

    pair = [refs, ref]
    refs.add(ref)
    pairs.set(tar, pair)
    reg.register(tar, pair, pair)
  }

  trigger() {
    const {refs, trigs} = this

    try {
      for (const ref of refs) {
        const tar = ref.deref()
        if (!tar) {
          refs.delete(tar)
          continue
        }

        if (trigs.has(tar)) continue

        trigs.add(tar)
        tar.trigger()
      }
    }
    finally {trigs.clear()}
  }

  depth() {return 0}
  deinit() {this.refs.clear()}
}

function derefOpt(src) {return l.isInst(src, WeakRef) ? src.deref() : src}

export function obsRef(val) {return new ObsRef(val)}

/*
Atomic observable with a single value. Compare `obs`, which creates a proxy
which implicitly observes all fields of the target. Unlike `obs`, this one
doesn't have proxy overheads.
*/
export class ObsRef extends l.Emp {
  get Broad() {return Broad}

  bro = undefined

  constructor(val) {super().$ = val}

  get val() {
    this.monitor()
    return this.get()
  }

  set val(val) {
    if (l.is(val, this.get())) return
    this.set(val)
    this.trigger()
  }

  get() {return this.$}
  set(val) {this.$ = val}

  monitor() {
    const bro = this.bro ??= new this.Broad()
    bro.monitor()
  }

  trigger() {this.bro?.trigger()}
  deinit() {this.bro?.deinit()}
}

export class TypedObsRef extends ObsRef {
  constructor(val) {super(val).reqVal(val)}
  set(val) {super.set(this.reqVal(val))}
  reqVal(val) {return val}
}

// Short for "observable proxy handler". Used via `obs`.
export class ObsPh extends l.Emp {
  get Broad() {return Broad}

  /*
  This declaration is not cosmetic. At the time of writing, V8 seems to ignore
  proxy handlers which don't have at least one own key at the time of proxy
  construction.
  */
  bro = undefined

  /* Standard traps */

  has(tar, key) {return key === SYM_PH || key === SYM_TAR || key in tar}

  get(tar, key) {
    if (key === SYM_PH) return this
    if (key === SYM_TAR) return tar

    const val = tar[key]
    if (!l.isFun(val) || l.hasOwnEnum(tar, key)) this.monitor()
    return val
  }

  set(tar, key, val) {
    const prev = tar[key]
    tar[key] = val
    if (!l.is(prev, val)) this.trigger()
    return true
  }

  deleteProperty(tar, key) {
    if (delete tar[key]) this.trigger()
    return true
  }

  ownKeys(tar) {
    this.monitor()
    return Reflect.ownKeys(tar)
  }

  /* Extensions */

  // Allows accidental `ph(ph(val))` to work.
  get [SYM_PH]() {return this}

  monitor() {
    const bro = this.bro ??= new this.Broad()
    bro.monitor()
  }

  trigger() {this.bro?.trigger()}
  deinit() {this.bro?.deinit()}
}

/*
Base class for implementing implicit monitoring. Invoking `.run` sets up
context via `TRIG` and calls `.onRun`. During the call, broadcasters may
find a reference to the `Recur` instance in `TRIG` and register it for
future triggers.

Uses async scheduling by default. Calling `.trigger` schedules the next run via
`Shed.main`. Can be overridden in a subclass or by monkey-patching either this
class, or `Shed.main`, or `Shed.default` before first access to `Shed.main`.

This is half of our "invisible magic" for implicit monitoring. The other
half is proxy handlers such as `ObsPh`, which trap property access such as
`someObs.someField` and secretly use `TRIG` to find the current triggerable,
such as `Recur`, to register it.

`Recur` itself has a nop run. See subclasses.
*/
export class Recur extends l.Emp {
  get shed() {return Shed.main}
  weak = undefined
  active = false

  onRun() {}
  depth() {return 0}
  trigger() {this.shed.add(this)}

  run() {
    if (this.active) return undefined
    this.deinit()
    this.weak = new o.WeakerRef(this)

    const prev = TRIG.swap(this.weak)
    this.active = true

    try {return this.onRun()}
    finally {
      this.active = false
      TRIG.swap(prev)
    }
  }

  deinit() {this.weak?.deinit()}
}

export class FunRecur extends Recur {
  constructor(fun) {super().fun = l.reqFun(fun)}
  onRun() {return this.fun()}
}

export class MethRecur extends Recur {
  get Ref() {return WeakRef}

  constructor(tar, fun) {
    super()
    this.ref = new this.Ref(tar)
    this.fun = l.reqFun(fun)
    REG_DEINIT.register(tar, this)
  }

  onRun() {
    const tar = this.ref.deref()
    return tar ? this.fun.call(tar, tar) : this.deinit()
  }
}

// Variant of `MethRecur` for DOM nodes.
export class NodeMethRecur extends MethRecur {
  depth() {return nodeDepth(this.tar)}
}

export function nodeDepth(val) {
  let out = 0
  while ((val = val?.parentNode)) out++
  return out
}

export class MethRecurs extends Map {
  get Recur() {return NodeMethRecur}

  add(tar, fun) {
    if (this.has(fun)) return
    const rec = new this.Recur(tar, fun)
    this.set(fun, rec)
    rec.run()
  }

  deinit() {for (const val of this.values()) val.deinit()}

  static init(tar, ...funs) {
    l.reqObj(tar)
    const map = tar[SYM_RECS] ??= new this()
    for (const fun of funs) map.add(tar, fun)
    return tar
  }

  static deinit(tar) {
    const map = tar?.[SYM_RECS]
    if (!map) return
    tar[SYM_RECS] = undefined
    map.deinit()
  }
}

/*
Takes a target and makes it reactive. The provided methods are invoked
immediately, any observables accessed during those calls are monitored,
and the methods are re-invoked when the observables trigger.
*/
export function reac(tar, ...vals) {return MethRecurs.init(tar, ...vals)}
export function unreac(tar) {return MethRecurs.deinit(tar)}

/*
Reactive version of a `Text` DOM node. Usage:

  reacText(() => someObs.someField)
*/
export function reacText(fun) {return new ReacText(fun)}

export class ReacText extends (l.onlyCls(globalThis.Text) ?? l.Emp) {
  get Recur() {return NodeMethRecur}

  constructor(fun) {
    super()
    this.fun = l.reqFun(fun)
    const rec = this[SYM_REC] = new this.Recur(this, this.init)
    rec.run()
  }

  init() {this.textContent = l.renderLax(this.fun())}
}
