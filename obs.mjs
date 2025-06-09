import * as l from './lang.mjs'
import * as o from './obj.mjs'

export const TRIG = new o.DynVar()
export const SYM_PH = Symbol.for(`ph`)
export const SYM_TAR = Symbol.for(`self`)
export const SYM_REC = Symbol.for(`recur`)
export const SYM_RECS = Symbol.for(`recurs`)

export function isRunner(val) {return l.isComp(val) && l.hasMeth(val, `run`)}
export function reqRunner(val) {return l.req(val, isRunner)}

export function isTrigger(val) {return l.isComp(val) && l.hasMeth(val, `trigger`)}
export function reqTrigger(val) {return l.req(val, isTrigger)}

export function obs(val) {return new Proxy(val, new ObsPh())}
export function getPh(val) {return val?.[SYM_PH]}
export function getTar(val) {return val?.[SYM_TAR]}

/*
Used internally by schedulers. Pending values are added to a queue, and ran as a
batch by calling `.flush`. Re-adding the same value during a flush queues it up
for the next flush, not for the current one. Reentrant flush is a nop.

TODO consider preventing exceptions from individual vals from interfering with
each other.
*/
export class Que extends l.Emp {
  active = false
  prev = new Set()
  next = new Set()

  constructor(src) {
    super()
    if (l.isNil(src)) return
    for (src of src) this.next.add(src)
  }

  add(val) {this.next.add(val)}

  delete(val) {
    this.prev.delete(val)
    this.next.delete(val)
  }

  flushVal() {}

  flush() {
    const {active, prev, next} = this
    if (active || !next) return

    this.prev = next
    this.next = prev
    this.active = true

    try {
      for (const val of next) {
        next.delete(val)
        this.flushVal(val)
      }
    }
    finally {
      this.active = false
      next.clear()
    }
  }

  deinit() {
    this.prev.clear()
    this.next.clear()
  }
}

/*
Sharding can be used to run ancestors before descendants, which may allow more
accurate UI updates. Values report their "depth", which allows us to determine
order.
*/
export class ShardedQue extends l.Emp {
  get Que() {return Que}
  ques = []

  add(val) {this.queAt(val.depth()).add(val)}
  queAt(depth) {return this.ques[l.reqNat(depth)] ||= new this.Que()}
  flush() {for (const que of this.ques) que?.flush()}

  deinit() {
    const {ques} = this
    for (const que of ques) que?.deinit()
    ques.length = 0
  }
}

export class RunQue extends Que {flushVal(val) {val.run()}}
export class ShardedRunQue extends ShardedQue {get Que() {return RunQue}}

/*
Short for "scheduler synchronous".

Scheduling is opt-in at the level of triggerables. Our observables, when
triggered, flush their que of triggerables (which corresponds to "subscribers"
in other systems) synchronously. The "final" triggerables such as `Recur`
choose whether to use a sheduler, and which one.

We understand and support 3 timing concepts:

- Synchronous (`ShedSync`): run immediately by default; optionally pause and
  resume (for batching / deduplication).

- Microtask (`ShedMicro`): runs after `ShedSync` but before `ShedMacro`. Useful
  for consumers which want automatic batching / deduplication without requiring
  user code to pause and resume a scheduler, but want to guarantee running
  before UI updates. One such example is derived / computed / calculated
  observables.

- Macrotask (`ShedMacro`): runs after `SchedMicro`. For UI-updating code.
*/
export class ShedSync extends o.MixMain(RunQue) {
  paused = false

  add(val) {
    if (this.paused) super.add(val)
    else val.run()
  }

  pause() {this.paused = true}

  resume() {
    if (!this.paused) return
    this.paused = false
    this.flush()
  }
}

// Short for "scheduler asynchronous". See subclasses.
export class ShedAsync extends ShardedRunQue {
  scheduled = false
  timer = undefined
  flush = this.flush.bind(this)

  timerInit() {}
  timerDeinit() {}

  flush() { // eslint-disable-line no-dupe-class-members
    this.unschedule()
    super.flush()
  }

  add(val) {
    super.add(val)
    this.schedule()
  }

  schedule() {
    if (this.scheduled) return
    this.scheduled = true
    this.timer = this.timerInit(this.flush)
  }

  unschedule() {
    const {timer} = this
    this.scheduled = false
    this.timer = undefined
    if (l.isSome(timer)) this.timerDeinit(timer)
  }

  deinit() {
    this.unschedule()
    super.deinit()
  }
}

export class ShedMicro extends o.MixMain(ShedAsync) {
  timerInit(fun) {queueMicrotask(fun)}
}

export class ShedMacro extends o.MixMain(ShedAsync) {
  timerInit(flush) {
    const fun = globalThis.requestAnimationFrame ?? setTimeout
    return fun(flush)
  }

  timerDeinit(val) {
    if (l.isNil(val)) return
    const fun = globalThis.cancelAnimationFrame ?? clearTimeout
    fun(val)
  }
}

export class WeakQue extends Que {
  reg = new FinalizationRegistry(this.delete.bind(this))
  refs = new WeakMap()

  constructor(src) {
    super()
    if (l.isNil(src)) return
    for (src of src) this.add(src)
  }

  add(src) {
    const tar = derefOpt(src)
    if (l.isNil(tar)) return

    const {reg, refs} = this
    const next = l.onlyInst(src, WeakRef) ?? new WeakRef(tar)
    const prev = refs.get(tar)

    if (prev && prev !== next) {
      this.delete(prev)
      reg.unregister(prev)
    }

    refs.set(tar, next)
    reg.register(tar, next, next)
    super.add(next)
  }

  delete(val) {
    super.delete(val)
    this.refs.delete(val)
  }
}

function derefOpt(src) {return l.isInst(src, WeakRef) ? src.deref() : src}

/*
Triggering que used by observables. Supports implicit monitoring via the dynamic
variable `TRIG`, where tools such as `Recur`, `FunRecur`, `MethRecur` place
themselves for the duration of reactive callbacks. Holds triggerables weakly.
*/
export class TriggerWeakQue extends WeakQue {
  get trig() {return TRIG}

  monitor() {
    const val = this.trig.get()
    if (l.isSome(val)) this.add(val)
  }

  flushVal(val) {val.deref()?.trigger()}
}

export function obsRef(val) {return new ObsRef(val)}

/*
Atomic observable with a single value. Compare `obs`, which creates a proxy
which implicitly observes all fields of the target. Unlike `obs`, this one
doesn't have proxy overheads (which are small to begin with).
*/
export class ObsRef extends l.Emp {
  get Que() {return TriggerWeakQue}

  constructor(val) {
    super()
    this.$ = val
    this.que = new this.Que()
  }

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
  monitor() {this.que.monitor()}
  trigger() {this.que.flush()}
  deinit() {this.que.deinit()}
}

export class TypedObsRef extends ObsRef {
  constructor(val) {super(val).reqVal(val)}
  set(val) {super.set(this.reqVal(val))}
  reqVal(val) {return val}
}

// Short for "observable proxy handler". Used via `obs`.
export class ObsPh extends l.Emp {
  get Que() {return TriggerWeakQue}

  /*
  Caution: at the time of writing, V8 seems to ignore proxy handlers which don't
  have at least one own property at the time of proxy construction. We must
  assign at least one own property, doesn't matter which.
  */
  que = new this.Que()

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

  monitor() {this.que.monitor()}
  trigger() {this.que.flush()}
  deinit() {this.que.deinit()}
}

export class RecurRef extends o.WeakerRef {
  run() {this.deref()?.run()}
  trigger() {this.deref()?.trigger()}
  depth() {return this.deref()?.depth() ?? 0}
  getShed() {return this.deref()?.getShed()}
  setShed(val) {this.deref()?.setShed(val)}
}

/*
Base class for implementing implicit monitoring. Invoking `.run` sets up
context via `TRIG` and calls `.onRun`. During the call, triggerable ques
used by observables may find a reference to the `Recur` instance in `TRIG`
and register it for future triggers.

Calling `.trigger` schedules the next run. Uses sync scheduling by default,
which runs immediately by default unless `ShedSync.main` is temporarily paused.
Subclasses override the `.shed` getter to choose scheduling modes appropriate
for their use case.

This is half of our "invisible magic" for implicit monitoring. The other
half is proxy handlers such as `ObsPh`, which trap property access such as
`someObs.someField` and secretly use `TRIG` to find the current triggerable,
such as `Recur`, to register it.

`Recur` itself has a nop run. See subclasses.
*/
export class Recur extends l.Emp {
  get Ref() {return RecurRef}
  get shed() {return ShedSync.main}
  get trig() {return TRIG}

  active = false
  weak = new this.Ref(this)
  #shed = undefined

  onRun() {}
  trigger() {this.getShed().add(this.weak.init())}

  run() {
    const {active, trig, weak} = this
    if (active) return undefined

    const prev = trig.swap(weak.init())
    this.active = true
    try {return this.onRun()}
    finally {
      this.active = false
      trig.swap(prev)
    }
  }

  setShed(val) {this.#shed = val}
  getShed() {return this.#shed ?? this.shed}
  depth() {return 0}
  deinit() {this.weak.deinit()}
}

export class FunRecur extends Recur {
  constructor(fun) {super().fun = l.reqFun(fun)}
  onRun() {return this.fun()}
}

export class MethRecur extends Recur {
  get shed() {return ShedMicro.main}

  constructor(tar, fun) {
    super()
    this.ref = new this.Ref(tar)
    this.fun = l.reqFun(fun)
  }

  onRun() {
    const tar = this.ref.deref()
    return tar ? this.fun.call(tar, tar) : this.deinit()
  }
}

// Variant of `MethRecur` for DOM nodes.
export class NodeMethRecur extends MethRecur {
  get shed() {return ShedMacro.main}
  depth() {return nodeDepth(this.ref.deref())}
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

  deinit() {
    for (const val of this.values()) val.deinit()
    this.clear()
  }

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

export function preferShed(val) {TRIG.get()?.setShed?.(val)}
export function preferSync() {TRIG.get()?.setShed?.(ShedSync.main)}
export function preferMicro() {TRIG.get()?.setShed?.(ShedMicro.main)}
export function preferMacro() {TRIG.get()?.setShed?.(ShedMacro.main)}

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
