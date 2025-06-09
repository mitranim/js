import * as l from './lang.mjs'
import * as o from './obj.mjs'

export class DynRunRef extends o.TypedDynVar {
  reqVal(val) {return l.isNil(val) ? undefined : l.reqInst(val, RunRef)}
}

export const RUN_REF = new DynRunRef()

export const HAS_DOM = (
  l.isObj(globalThis.window) &&
  l.isObj(globalThis.document) &&
  l.isFun(globalThis.document?.createElement)
)

export let UI_SHED
export function setUiShed(val) {UI_SHED = val}
export function getUiShed() {
  return UI_SHED ?? (HAS_DOM ? ShedTask.main : ShedMicro.main)
}

export let DEFAULT_SHED
export function setDefaultShed(val) {DEFAULT_SHED = val}
export function getDefaultShed() {return DEFAULT_SHED ?? ShedMicro.main}

export const PH = Symbol.for(`ph`)
export const QUE = Symbol.for(`que`)

export function isRunner(val) {return l.hasMeth(val, `run`)}
export function optRunner(val) {return l.opt(val, isRunner)}
export function reqRunner(val) {return l.req(val, isRunner)}

export function isObs(val) {return l.isObj(val) && QUE in val}
export function optObs(val) {return l.opt(val, isObs)}
export function reqObs(val) {return l.req(val, isObs)}

export function isObsRef(val) {return l.isObj(val) && QUE in val && l.VAL in val}
export function optObsRef(val) {return l.opt(val, isObsRef)}
export function reqObsRef(val) {return l.req(val, isObsRef)}

export function isQue(val) {return l.hasMeth(val, `enque`) && l.hasMeth(val, `flush`)}
export function optQue(val) {return l.opt(val, isQue)}
export function reqQue(val) {return l.req(val, isQue)}

export function obs(val) {return new Proxy(val, new ObsPh())}
export function getPh(val) {return val?.[PH]}
export function getQue(val) {return val?.[QUE]}

export function recur(tar, fun) {return recurShed(getDefaultShed(), tar, fun)}
export function recurSync(tar, fun) {return recurShed(ShedSync.main, tar, fun)}
export function recurMicro(tar, fun) {return recurShed(ShedMicro.main, tar, fun)}
export function recurTask(tar, fun) {return recurShed(ShedTask.main, tar, fun)}

export function recurShed(shed, tar, fun) {
  const rec = new FunRecur(shed, tar, fun)
  rec.run()
  return rec
}

export function preferShed(val) {RUN_REF.get()?.setShed?.(val)}
export function preferSync() {RUN_REF.get()?.setShed?.(ShedSync.main)}
export function preferMicro() {RUN_REF.get()?.setShed?.(ShedMicro.main)}
export function preferTask() {RUN_REF.get()?.setShed?.(ShedTask.main)}

export function nodeDepth(val) {
  let out = 0
  while ((val = val?.parentNode)) out++
  return out
}

export class WeakerRef extends WeakRef {
  expired = false
  deref() {return this.expired ? undefined : super.deref()}
  init() {return this.expired = false, this}
  deinit() {this.expired = true}
}

export class RunRef extends WeakerRef {
  run() {this.deref()?.run()}
  depth() {return this.deref()?.depth() ?? 0}
  setShed(val) {this.deref()?.setShed(val)}
}

export class ShedRef extends RunRef {run() {this.deref()?.schedule()}}

export class Que extends l.Emp {
  get dyn() {return RUN_REF}

  flushing = false
  prev = new Set()
  next = new Set()
  refs = new WeakMap()
  reg = new FinalizationRegistry(this.deque.bind(this))

  constructor(src) {
    super()
    if (l.isSome(src)) for (src of src) this.enque(src)
  }

  enque(ref) {
    const set = this.next
    if (set.has(ref)) return

    l.reqInst(ref, RunRef)
    const tar = ref.deref()
    if (l.isNil(tar)) return

    const {refs, reg} = this
    const prev = refs.get(tar)
    refs.set(tar, ref)

    if (!prev) reg.register(tar, ref, ref)
    else if (prev !== ref) reg.unregister(prev)

    set.add(ref)
  }

  enqueDyn() {
    const val = this.dyn.get()
    if (l.isSome(val)) this.enque(val)
  }

  deque(val) {
    if (l.isNil(val)) return
    this.prev.delete(val)
    this.next.delete(val)
    this.refs.delete(val.deref())
    this.reg.unregister(val)
  }

  flush() {
    const {flushing, prev, next} = this
    if (flushing) return

    this.prev = next
    this.next = prev
    this.flushing = true

    try {
      for (const val of next) {
        next.delete(val)
        val.run()
      }
    }
    finally {this.flushing = false}
  }

  hasNext() {return this.next.size > 0}

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

  enque(val) {
    const depth = l.reqNat(val.depth())
    const que = this.ques[depth] ??= new this.Que()
    que.enque(val)
  }

  flush() {for (const que of this.ques) que?.flush()}

  deinit() {
    const {ques} = this
    for (const que of ques) que?.deinit()
    ques.length = 0
  }
}

export class ShedSync extends o.MixMain(ShardedQue) {
  flushing = false
  pauses = 0

  pause() {this.pauses++}

  enque(val) {
    if (this.pauses > 0) super.enque(val)
    else val.run()
  }

  flush() {
    if (this.flushing) return
    if (!(this.pauses > 0)) return
    if (--this.pauses) return

    this.flushing = true
    try {super.flush()}
    finally {this.flushing = false}
  }
}

export class ShedAsync extends o.MixMain(ShardedQue) {
  scheduled = false
  onerror = undefined
  timer = undefined
  flush = this.flush.bind(this)

  timerInit() {}
  timerDeinit() {}

  flush() { // eslint-disable-line no-dupe-class-members
    this.unschedule()

    const onerror = l.optFun(this.onerror)
    if (!onerror) return super.flush()

    try {return super.flush()}
    catch (err) {
      onerror(err)
      return undefined
    }
  }

  enque(val) {
    super.enque(val)
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

export class ShedMicro extends ShedAsync {
  timerInit(fun) {queueMicrotask(fun)}
}

export class ShedTask extends ShedAsync {
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

// Short for "observable proxy handler". Used via `obs`.
export class ObsPh extends l.Emp {
  get Que() {return Que}

  [QUE] = new this.Que()

  has(tar, key) {
    return key === PH || key === QUE || key === l.VAL || key in tar
  }

  get(tar, key) {
    if (key === PH) return this
    if (key === QUE) return this[QUE]
    if (key === l.VAL) return tar

    const val = tar[key]
    if (!l.isFun(val) || l.hasOwnEnum(tar, key)) this[QUE].enqueDyn()
    return val
  }

  set(tar, key, val) {
    const prev = tar[key]
    tar[key] = val
    if (!l.is(prev, val)) this[QUE].flush()
    return true
  }

  deleteProperty(tar, key) {
    if (delete tar[key]) this[QUE].flush()
    return true
  }

  ownKeys(tar) {
    this[QUE].enqueDyn()
    return Reflect.ownKeys(tar)
  }
}

export class Obs extends l.Emp {
  get Que() {return Que}
  [QUE] = new this.Que()
  enqueDyn() {this[QUE].enqueDyn()}
  enque(val) {this[QUE].enque(val)}
  flush() {this[QUE].flush()}
  deinit() {this[QUE].deinit()}
}

export function obsRef(val) {return new ObsRef(val)}

/*
Atomic observable with a single value. Compare `obs`, which creates a proxy
which implicitly observes all fields of the target. Unlike `obs`, this one
doesn't have proxy overheads (which are small to begin with).
*/
export class ObsRef extends Obs {
  constructor(val) {super()[l.VAL] = val}

  get val() {
    this.enqueDyn()
    return this.get()
  }

  set val(val) {if (this.set(val)) this.flush()}

  // `get` and `set` are lower-level and non-reactive.
  get() {return this[l.VAL]}
  set(val) {return !l.is(this[l.VAL], (this[l.VAL] = val))}
}

export class TypedObsRef extends ObsRef {
  constructor(val) {super(val).reqVal(val)}
  set(val) {return super.set(this.reqVal(val))}
  reqVal(val) {return val}
}

export function calc(tar, fun) {return new ObsCalc(tar, fun)}

export class ObsCalc extends ObsRef {
  get Recur() {return CalcRecur}

  valid = false
  rec = new this.Recur(this, this.onFlush)

  constructor(tar, fun) {
    super()
    if (l.isFun(tar)) [tar, fun] = [fun, tar]
    reqTarFun(tar, fun)
    this.tar = tar
    this.fun = fun
  }

  get() {
    this.validate()
    return super.get()
  }

  validate() {
    if (this.valid) return
    this.valid = true
    this.rec.run(this, this.onRun)
  }

  onRun() {
    const {tar, fun} = this
    this[l.VAL] = fun.call(tar, tar)
  }

  onFlush() {
    const {valid, tar, fun} = this
    if ((this.valid = (!valid || this[QUE].hasNext()))) {
      this.val = fun.call(tar, tar)
    }
  }

  depth() {return nodeDepth(this.tar)}

  deinit() {
    this.rec.deinit()
    super.deinit()
  }
}

function reqTarFun(tar, fun) {
  if (l.isFun(fun)) return
  throw TypeError(`expected at least one function, got ${l.show(tar)} and ${l.show(fun)}`)
}

/*
Base class for implementing implicit monitoring. Counterpart and complement to
our observables (`ObsPh`, `ObsRef`, `ObsCalc`). Invoking `.run` sets up
reactive context by placing a runnable in `RUN_REF` and calls `.onRun`.
During the call, observables may look for the runnable in `RUN_REF` and
enque it for future runs.

Scheduling is pluggable. Callers may pass a scheduler, and subclasses may
override `.shed` to choose the timing mode appropriate for their use case.

Subclasses must override `.onRun` with a non-nop implementation.
*/
export class Recur extends l.Emp {
  get ShedRef() {return ShedRef}
  get RunRef() {return RunRef}
  get dyn() {return RUN_REF}

  running = false
  shedRef = new this.ShedRef(this) // Enqued on observables, schedules a run.
  runRef = new this.RunRef(this)   // Enqued on schedulers, runs immediately.

  constructor(shed) {super().shed = shed}

  onRun() {}

  run(tar, fun) {
    const {running, dyn} = this
    if (running) return undefined

    tar ??= this
    fun = l.optFun(fun) ?? this.onRun

    const prev = dyn.swap(this.shedRef.init())
    this.running = true

    try {return fun.call(tar, tar)}
    finally {
      this.running = false
      dyn.swap(prev)
    }
  }

  setShed(val) {this.shed = val}

  schedule() {
    const {shed} = this
    if (shed) shed.enque(this.runRef.init())
    else this.run()
  }

  depth() {return 0}

  deinit() {
    this.shedRef.deinit()
    this.runRef.deinit()
  }
}

export class FunRecur extends Recur {
  constructor(shed, tar, fun) {
    super(shed)
    if (l.isFun(tar)) [tar, fun] = [fun, tar]
    reqTarFun(tar, fun)
    this.tar = tar
    this.fun = fun
  }

  onRun() {
    const {tar, fun} = this
    return fun.call(tar, tar)
  }

  depth() {return nodeDepth(this.tar)}
}

export class FunRecurSync extends FunRecur {
  constructor(tar, fun) {super(ShedSync.main, tar, fun)}
}

export class FunRecurMicro extends FunRecur {
  constructor(tar, fun) {super(ShedMicro.main, tar, fun)}
}

export class FunRecurTask extends FunRecur {
  constructor(tar, fun) {super(ShedTask.main, tar, fun)}
}

export class CalcRecur extends FunRecurSync {depth() {return this.tar.depth()}}
