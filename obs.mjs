import * as l from './lang.mjs'
import * as o from './obj.mjs'

export const TRIG = new o.DynVar()
export const SYM_PH = Symbol.for(`ph`)
export const SYM_TAR = Symbol.for(`self`)

export function isRunner(val) {return l.isComp(val) && l.hasMeth(val, `run`)}
export function reqRunner(val) {return l.req(val, isRunner)}

export function isTrig(val) {return l.isComp(val) && l.hasMeth(val, `trigger`)}
export function reqTrig(val) {return l.req(val, isTrig)}

export function obs(val) {return new Proxy(val, new ObsPh())}
export function getPh(val) {return val?.[SYM_PH]}
export function getTar(val) {return val?.[SYM_TAR]}

// Short for "observable proxy handler".
export class ObsPh extends l.Emp {
  get Broad() {return Broad}

  constructor() {super().bro = new this.Broad()}

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

  monitor() {this.bro.monitor()}
  trigger() {this.bro.trigger()}
  deinit() {this.bro.deinit()}
}

export class Broad extends l.Emp {
  get reg() {return REG_PAIR}

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

export const REG_PAIR = new FinalizationRegistry(deinitPair)
function deinitPair([set, val]) {set.delete(val)}
function derefOpt(src) {return l.isInst(src, WeakRef) ? src.deref() : src}

/*
Base class for implementing automatic subscriptions. Invoking `.run` sets up
context via `TRIG` and calls `.onRun`. During the call, broadcasters may
find a reference to the `Recur` instance in `TRIG` and register it for
future triggers.

Uses async scheduling by default. Calling `.trigger` schedules the next run via
`Shed.main`. Can be overridden in a subclass or by monkey-patching either this
class, or `Shed.main`, or `Shed.default` before first access to `Shed.main`.

This is half of our "invisible magic" for automatic subscriptions. The other
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

export class ObsRef extends l.Emp {
  get Broad() {return Broad}

  constructor(val) {super().$ = val}

  get() {
    this.monitor()
    return this.$
  }

  set(val) {
    if (l.is(val, this.$)) return val
    this.$ = val
    this.trigger()
    return val
  }

  monitor() {
    const bro = this.bro ??= new this.Broad()
    bro.monitor()
  }

  trigger() {this.bro?.trigger()}
  deinit() {this.bro?.deinit()}
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
Short for "scheduler". Tool for scheduling hierarchical runs, from ancestors to
descendants. Runnables may report their "depth", which allows us to determine
order. The base runnables in this module are all at depth 0; see the module
`obs_dom.mjs` which actually uses the depth feature.
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
    return fun(this.run)
  }

  timerDeinit(val) {
    const fun = globalThis.cancelAnimationFrame || clearTimeout
    fun(val)
  }

  deinit() {
    this.unschedule()
    for (const que of this.ques) que?.deinit()
  }
}
