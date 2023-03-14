import * as l from './lang.mjs'
import * as o from './obj.mjs'

export function deinit(val) {if (isDe(val)) val.deinit()}

// TODO move to `lang.mjs`.
export function isDe(val) {return l.isComp(val) && l.hasMeth(val, `deinit`)}
export function reqDe(val) {return l.req(val, isDe)}

export function isObs(val) {return isDe(val) && isTrig(val) && l.hasMeth(val, `sub`) && l.hasMeth(val, `unsub`)}
export function reqObs(val) {return l.req(val, isObs)}

export function isTrig(val) {return l.isComp(val) && l.hasMeth(val, `trig`)}
export function reqTrig(val) {return l.req(val, isTrig)}

export function isSub(val) {return l.isFun(val) || isTrig(val)}
export function reqSub(val) {return l.req(val, isSub)}

export function isSubber(val) {return l.isFun(val) || (l.isComp(val) && l.hasMeth(val, `subTo`))}
export function reqSubber(val) {return l.req(val, isSubber)}

export function isRunTrig(val) {return l.isComp(val) && l.hasMeth(val, `run`) && isTrig(val)}
export function reqRunTrig(val) {return l.req(val, isRunTrig)}

export function ph(val) {return l.hasIn(val, keyPh) ? val[keyPh] : undefined}
export function self(val) {return l.hasIn(val, keySelf) ? val[keySelf] : val}

export const keyPh = Symbol.for(`ph`)
export const keySelf = Symbol.for(`self`)

export function de(val) {return new Proxy(val, DeinitPh.main)}
export function obs(val) {return new Proxy(val, new ObsPh())}
export function deObs(val) {return new Proxy(val, new DeObsPh())}

export class StaticProxied extends l.Emp {
  constructor() {
    super()
    return new Proxy(this, this.ph)
  }
}

export class Proxied extends l.Emp {
  constructor() {
    super()
    return new Proxy(this, new this.Ph())
  }
}

export class De extends StaticProxied {get ph() {return DeinitPh.main}}
export class Obs extends Proxied {get Ph() {return ObsPh}}
export class DeObs extends Proxied {get Ph() {return DeObsPh}}

export const dyn = new class Dyn extends o.Dyn {
  sub(obs) {
    const val = this.$
    if (l.isFun(val)) val(obs)
    else if (isSubber(val)) val.subTo(obs)
  }

  inert(fun, ...val) {
    const prev = this.swap()
    try {return fun(...val)}
    finally {this.swap(prev)}
  }
}()

/*
Extremely simple scheduler for our observables. Provides reentrant pause/resume
and batch flushing. Note that even in the "unpaused" state, the scheduler
doesn't immediately run its entries. Our observables simply bypass it when
unpaused. Also note that this is fully synchronous. Compare the timed scheduler
in `sched.mjs`.
*/
export class Sched extends o.MixMain(Set) {
  constructor(val) {super(val).p = 0}
  isPaused() {return this.p > 0}
  pause() {return this.p++, this}

  resume() {
    if (!this.p) return this
    this.p--
    if (!this.p) this.run()
    return this
  }

  run() {
    for (const val of this) {
      this.delete(val)
      val.trig()
    }
    return this
  }

  paused(fun, ...val) {
    this.pause()
    try {return fun(...val)}
    finally {this.resume()}
  }

  /*
  Caution: this doesn't reset the `.p` counter because non-buggy callers must
  always use try/finally for pause/unpause. If some code is calling `.deinit`
  while the scheduler is paused, it should unpause the scheduler afterwards.
  Resetting the counter here would be a surprise.
  */
  deinit() {this.clear()}
}

/*
Extremely simple implementation of an observable in a "traditional" sense.
Name short for "imperative observable". Maintains and triggers subscribers.
Satisfies the `isObs` interface. All functionality is imperative, not automatic.
Not to be confused with `Obs`, which is an "automatically" observable object
wrapped into a proxy that secretly uses `ImpObs`.

Implicit observation and automatic triggers are provided by other classes using
this as an inner component. See `Rec` and `ObsPh`.
*/
export class ImpObs extends Set {
  sub(val) {this.add(reqSub(val))}
  unsub(val) {this.delete(val)}

  trig() {
    const sch = Sched.main
    if (sch.isPaused()) sch.add(this)
    else for (const val of this) subTrig(val)
  }

  deinit() {for (const val of this) this.unsub(val)}
}

/*
Name is short for "reactive" or "recurring", because it's both. Base class for
implementing automatic subscriptions. Invoking `.run` sets up context via `dyn`
and calls `.onRun`. During the call, observables may find the `Rec` instance in
`dyn` and register themselves for future triggers. The link is two-way;
observables must refer to `Rec` to trigger it, and `Rec` must refer to
observables to unsubscribe when deinited. Rerunning `.run` clears previous
observables.

This is half of our "invisible magic" for automatic subscriptions. The other
half is proxy handlers such as `ObsPh`, which trap property access such as
`someObs.someField` and secretly use `dyn` to find the current "subber" such as
`Rec` and establish subscriptions.

`Rec` itself has a nop run. See subclasses.
*/
export class Rec extends Set {
  constructor() {
    super()
    this.new = new Set()
    this.act = false
  }

  onRun() {}

  /*
  Language observation. The `try` pyramid demonstrates that `try`/`finally` is
  inferior to `defer` as seen in Go and Swift, which would simplify our code
  to the following:

      const subber = dyn.swap(this)
      defer dyn.swap(subber)

      this.act = true
      defer this.act = false

      this.new.clear()
      defer this.delOld()

      sch.pause()
      defer sch.resume()

      return this.onRun()
  */
  run() {
    if (this.act) throw Error(`unexpected overlapping rec.run`)

    const sch = Sched.main
    const subber = dyn.swap(this)

    try {
      this.act = true

      try {
        this.new.clear()

        try {
          sch.pause()

          try {return this.onRun()}
          finally {sch.resume()}
        }
        finally {this.delOld()}
      }
      finally {this.act = false}
    }
    finally {dyn.swap(subber)}
  }

  trig() {}

  subTo(obs) {
    reqObs(obs)
    if (this.new.has(obs)) return
    this.new.add(obs)
    this.add(obs)
    obs.sub(this)
  }

  del(obs) {this.delete(obs), obs.unsub(this)}
  delOld() {for (const val of this) if (!this.new.has(val)) this.del(val)}
  deinit() {for (const val of this) this.del(val)}
}

export class Moebius extends Rec {
  constructor(ref) {super().ref = reqRunTrig(ref)}
  onRun() {return this.ref.run()}
  trig() {if (!this.act) this.ref.trig()}
}

export class Loop extends Rec {
  constructor(ref) {super().ref = reqSub(ref)}
  onRun() {subTrig(this.ref)}
  trig() {if (!this.act) this.run()}
}

// Short for "proxy handler". Base for other handlers.
export class Ph extends l.Emp {
  /* Standard traps */

  has(tar, key) {
    return (
      key === keyPh ||
      key === keySelf ||
      key === `deinit` ||
      key in tar
    )
  }

  get(tar, key) {
    if (key === keyPh) return this
    if (key === keySelf) return tar
    if (key === `deinit`) return this.proDeinit
    return this.getIn(tar, key)
  }

  set(tar, key, val) {
    this.didSet(tar, key, val)
    return true
  }

  deleteProperty(tar, key) {
    this.didDel(tar, key)
    return true
  }

  /* Extensions */

  // Allows accidental `ph(ph(val))` to work.
  get [keyPh]() {return this}

  getIn(tar, key) {return tar[key]}

  didSet(tar, key, val) {
    const had = hasPub(tar, key)
    const prev = tar[key]
    tar[key] = val
    if (l.eq(prev, val)) return false
    if (had) this.drop(prev)
    return true
  }

  didDel(ref, key) {
    if (!l.hasOwn(ref, key)) return false

    const had = hasPub(ref, key)
    const val = ref[key]
    delete ref[key]

    if (had) this.drop(val)
    return true
  }

  drop() {}

  /*
  This method is returned by the "get" trap and invoked on the proxy, not the
  proxy handler. It assumes that `this` is the proxy. Placed on the handler's
  prototype to make it possible to override in subclasses. The base
  implementation simply tries to invoke the same method on the target.
  */
  proDeinit() {deinit(self(this))}
}

export class DeinitPh extends o.MixMain(Ph) {
  drop(val) {deinit(val)}

  proDeinit() {
    const val = self(this)
    deinitAll(val)
    deinit(val)
  }
}

export class ObsPh extends Ph {
  constructor() {super().obs = new this.ImpObs()}

  set(tar, key, val) {
    if (this.didSet(tar, key, val)) this.obs.trig()
    return true
  }

  deleteProperty(tar, key) {
    if (this.didDel(tar, key)) this.obs.trig()
    return true
  }

  getIn(tar, key) {
    if (!hasPriv(tar, key)) dyn.sub(this.obs)
    return tar[key]
  }

  /*
  See comments on `Ph.prototype.proDeinit`. "this" is the proxy.
  `ph(this)` gets the `ObsPh` instance to deinit the observable.
  `self(this)` gets the target to deinit it, if appropriate.
  */
  proDeinit() {
    ph(this).deinit()
    deinit(self(this))
  }

  deinit() {this.obs.deinit()}

  get ImpObs() {return ImpObs}
}

export class DeObsPh extends ObsPh {
  drop(val) {DeinitPh.prototype.drop.call(this, val)}

  proDeinit() {
    ph(this).deinit()
    DeinitPh.prototype.proDeinit.call(this)
  }
}

/* Internal */

export function deinitAll(val) {
  for (const key of l.structKeys(val)) deinit(val[key])
}

function subTrig(val) {
  if (l.isFun(val)) val()
  else val.trig()
}

function hasPriv(tar, key) {
  return l.isStr(key) && !l.hasOwnEnum(tar, key) && key in tar
}

function hasPub(tar, key) {
  return l.isStr(key) && l.hasOwnEnum(tar, key)
}
