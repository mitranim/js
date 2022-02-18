import * as l from './lang.mjs'

export function isDe(val) {return l.isComp(val) && l.hasMeth(val, `deinit`)}
export function isObs(val) {return isDe(val) && isTrig(val) && l.hasMeth(val, `sub`) && l.hasMeth(val, `unsub`)}
export function isTrig(val) {return l.isComp(val) && l.hasMeth(val, `trig`)}
export function isSub(val) {return l.isFun(val) || isTrig(val)}
export function isSubber(val) {return l.isFun(val) || (l.isComp(val) && l.hasMeth(val, `subTo`))}
export function isRunTrig(val) {return l.isComp(val) && l.hasMeth(val, `run`) && isTrig(val)}

export function reqDe(val) {return l.req(val, isDe)}
export function reqObs(val) {return l.req(val, isObs)}
export function reqTrig(val) {return l.req(val, isTrig)}
export function reqSub(val) {return l.req(val, isSub)}
export function reqSubber(val) {return l.req(val, isSubber)}
export function reqRunTrig(val) {return l.req(val, isRunTrig)}

export function ph(ref) {return ref ? ref[keyPh] : undefined}
export function self(ref) {return ref ? ref[keySelf] || ref : undefined}
export function deinit(val) {if (isDe(val)) val.deinit()}

export function de(ref) {return new Proxy(ref, deinitPh)}
export function obs(ref) {return pro(ref, new (getPh(ref) || ObsPh)())}
export function comp(ref, fun) {return pro(ref, new (getPh(ref) || CompPh)(fun))}
export function lazyComp(ref, fun) {return pro(ref, new (getPh(ref) || LazyCompPh)(fun))}

export class Deinit {constructor() {return de(this)}}
export class Obs {constructor() {return obs(this)}}
export class Comp {constructor(fun) {return comp(this, fun)}}
export class LazyComp {constructor(fun) {return lazyComp(this, fun)}}

/* Secondary API (lower level, semi-undocumented) */

export const ctx = /* @__PURE__ */ new class Ctx {
  constructor() {this.subber = undefined}

  sub(obs) {
    const val = this.subber
    if (l.isFun(val)) val(obs)
    else if (isSubber(val)) val.subTo(obs)
  }

  inert(fun, ...val) {
    const sub = this.subber
    this.subber = undefined
    try {return fun(...val)}
    finally {this.subber = sub}
  }
}()

export const keyPh = Symbol.for(`ph`)
export const keySelf = Symbol.for(`self`)

export class Rec extends Set {
  constructor() {
    super()
    this.new = new Set()
    this.act = false
  }

  onRun() {}

  run(...args) {
    if (this.act) throw Error(`unexpected overlapping rec.run`)

    const {subber} = ctx
    ctx.subber = this
    this.act = true

    this.new.clear()
    sch.pause()

    try {
      return this.onRun(...args)
    }
    finally {
      ctx.subber = subber
      this.forEach(recDelOld, this)
      try {sch.resume()}
      finally {this.act = false}
    }
  }

  trig() {}

  subTo(obs) {
    reqObs(obs)
    if (this.new.has(obs)) return
    this.new.add(obs)
    this.add(obs)
    obs.sub(this)
  }

  deinit() {this.forEach(recDel, this)}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class Moebius extends Rec {
  constructor(ref) {super().ref = reqRunTrig(ref)}
  onRun(...args) {return this.ref.run(...args)}
  trig() {if (!this.act) this.ref.trig()}
}

export class Loop extends Rec {
  constructor(ref) {super().ref = reqSub(ref)}
  onRun() {subTrig(this.ref)}
  trig() {if (!this.act) this.run()}
}

export class DeinitPh {
  has(tar, key) {
    return key in tar || key === keyPh || key === keySelf || key === `deinit`
  }

  get(tar, key) {
    if (key === keyPh) return this
    if (key === keySelf) return tar
    if (key === `deinit`) return dePhDeinit
    return tar[key]
  }

  set(tar, key, val) {
    set(tar, key, val)
    return true
  }

  deleteProperty(tar, key) {
    del(tar, key)
    return true
  }
}

const deinitPh = new DeinitPh()

export class ObsBase extends Set {
  onInit() {}
  onDeinit() {}

  sub(val) {
    const {size} = this
    this.add(reqSub(val))
    if (!size) this.onInit()
  }

  unsub(val) {
    const {size} = this
    this.delete(val)
    if (size && !this.size) this.onDeinit()
  }

  trig() {
    if (sch.isPaused) {
      sch.add(this)
      return
    }
    this.forEach(subTrig)
  }

  deinit() {
    this.forEach(this.unsub, this)
  }

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class ObsPh extends ObsBase {
  constructor() {super().pro = undefined}

  has() {return DeinitPh.prototype.has.apply(this, arguments)}

  get(tar, key) {
    if (key === keyPh) return this
    if (key === keySelf) return tar
    if (key === `deinit`) return phDeinit
    if (!hidden(tar, key)) ctx.sub(this)
    return tar[key]
  }

  set(tar, key, val) {
    if (set(tar, key, val)) this.trig()
    return true
  }

  deleteProperty(tar, key) {
    if (del(tar, key)) this.trig()
    return true
  }

  onInit() {
    const {pro} = this
    if (l.hasMeth(pro, `onInit`)) pro.onInit()
  }

  onDeinit() {
    const {pro} = this
    if (l.hasMeth(pro, `onDeinit`)) pro.onDeinit()
  }
}

export class LazyCompPh extends ObsPh {
  constructor(fun) {
    super()
    this.fun = l.reqFun(fun)
    this.out = true // means "outdated"
    this.cre = new CompRec(this)
  }

  get(tar, key) {
    if (key === keyPh) return this
    if (key === keySelf) return tar
    if (key === `deinit`) return phDeinit

    if (!hidden(tar, key)) {
      ctx.sub(this)
      if (this.out) {
        this.out = false
        this.cre.run()
      }
    }

    return tar[key]
  }

  // Invoked by `CompRec`.
  run() {return this.fun.call(this.pro, this.pro)}
  onTrig() {this.out = true}
  onInit() {this.cre.init()}
  onDeinit() {this.cre.deinit()}
}

export class CompPh extends LazyCompPh {
  onTrig() {this.cre.run()}
}

export class CompRec extends Moebius {
  subTo(obs) {
    reqObs(obs)
    this.new.add(obs)
    if (this.ref.size) {
      this.add(obs)
      obs.sub(this)
    }
  }

  init() {
    this.new.forEach(compRecSub, this)
  }

  trig() {
    if (!this.act) this.ref.onTrig()
  }
}

export class Sched extends Set {
  constructor() {super().p = 0}

  get isPaused() {return this.p > 0}

  pause() {this.p++}

  resume() {
    if (!this.p) return
    this.p--
    if (!this.p) this.forEach(schFlush, this)
  }

  paused(fun, ...val) {
    this.pause()
    try {return fun(...val)}
    finally {this.resume()}
  }

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export const sch = /* @__PURE__ */ new Sched()

/* Internal */

function getPh(ref) {return ref.constructor && ref.constructor.ph}

// // Dup from `lang.mjs`. Might export later.
// function getProto(val) {return isObj(val) ? Object.getPrototypeOf(val) : undefined}
// function getCon(val) {return get(getProto(val), `constructor`)}

function pro(ref, ph) {
  const pro = new Proxy(ref, ph)
  ph.pro = pro
  return pro
}

function set(ref, key, next) {
  const de = l.hasOwnEnum(ref, key)
  const prev = ref[key]
  ref[key] = next
  if (Object.is(prev, next)) return false
  if (de) deinit(prev)
  return true
}

function del(ref, key) {
  if (!l.hasOwn(ref, key)) return false
  const de = l.hasOwnEnum(ref, key)
  const val = ref[key]
  delete ref[key]
  if (de) deinit(val)
  return true
}

function dePhDeinit() {
  deinitAll(this)
  deinit(self(this))
}

function phDeinit() {
  ph(this).deinit()
  const ref = self(this)
  deinitAll(ref)
  deinit(ref)
}

function deinitAll(ref) {
  l.reqComp(ref)
  for (const key of l.structKeys(ref)) deinit(ref[key])
}

function subTrig(val) {
  if (l.isFun(val)) val()
  else val.trig()
}

function recDelOld(obs) {
  if (!this.new.has(obs)) recDel.call(this, obs)
}

function recDel(obs) {
  this.delete(obs)
  obs.unsub(this)
}

function compRecSub(obs) {
  this.add(obs)
  obs.sub(this)
}

function schFlush(obs) {
  this.delete(obs)
  obs.trig()
}

function hidden(val, key) {return !l.hasOwnEnum(val, key) && key in val}
