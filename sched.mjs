/*
Tools for async batching and scheduling of hierarchical runs,
from ancestors to descendants. See `Sched`.
*/

import * as l from './lang.mjs'

// Base implementation used by other timers. Nop by itself.
export class BaseTimer extends l.Emp {
  constructor(ref) {
    super()
    this.ref = reqRunner(ref)
    this.run = this.run.bind(this)
    this.val = undefined
  }

  // Override in subclass.
  timerInit() {}
  timerDeinit() {}

  run() {try {this.ref.run()} finally {this.unschedule()}}
  schedule() {if (!this.val) this.val = this.timerInit(this.run)}

  unschedule() {
    const {val} = this
    if (val) {
      this.val = undefined
      this.timerDeinit(val)
    }
  }

  deinit() {this.unschedule()}
}

// Default recommended timer.
export class RofTimer extends BaseTimer {
  timerInit(run) {return requestAnimationFrame(run)}
  timerDeinit(val) {cancelAnimationFrame(val)}
}

// Fallback alternative to `requestAnimationFrame`.
export class TimeoutTimer extends BaseTimer {
  timerInit(run) {return setTimeout(run)}
  timerDeinit(val) {clearTimeout(val)}
}

// Fake/nop timer that always runs synchronously.
export class SyncTimer extends l.Emp {
  constructor(ref) {super().ref = reqRunner(ref)}
  schedule() {this.ref.run()}
  unschedule() {}
}

/*
Used internally by `Sched`. Updates are scheduled by adding vals to the que, and
flushed together as a batch by calling `.run()`. Reentrant flush is a nop.

TODO consider preventing exceptions from individual runs from interfering with
each other.
*/
export class Que extends Set {
  constructor() {super().flushing = false}

  add(val) {return super.add(reqRunner(val))}

  run() {
    if (this.flushing) return this
    this.flushing = true

    try {
      for (const val of this.values()) val.run()
    }
    finally {
      this.flushing = false
      this.clear()
    }
    return this
  }
}

/*
Short for "scheduler". Tool for scheduling hierarchical runs, from ancestors to
descendants. Inputs report their "depth", which allows us to determine order.
*/
export class Sched extends l.Emp {
  constructor() {
    super()
    this.ques = []
    this.timer = new this.Timer(this)
  }

  // Main API for consumer code.
  push(val) {return this.add(val).schedule()}

  // Called by timer. Can also be flushed manually.
  run() {
    this.unschedule()
    for (const que of this.ques) if (que) que.run()
    return this
  }

  add(val) {return this.que(val.depth()).add(val), this}

  que(depth) {
    l.reqNat(depth)
    return this.ques[depth] || (this.ques[depth] = new this.Que())
  }

  schedule() {return this.timer.schedule(), this}
  unschedule() {return this.timer.unschedule(), this}
  deinit() {this.unschedule()}

  get Timer() {return RofTimer}
  get Que() {return Que}
}
Sched.main = /* @__PURE__ */ new Sched()

export function isDep(val) {return l.hasMeth(val, `depth`)}
export function reqDep(val) {return l.req(val, isDep)}

export function isRunner(val) {return l.hasMeth(val, `run`)}
export function reqRunner(val) {return l.req(val, isRunner)}

export function isDepRunner(val) {return isDep(val) && isRunner(val)}
export function reqDepRunner(val) {return l.req(val, isDepRunner)}

export function isTimer(val) {return l.hasMeth(val, `schedule`) && l.hasMeth(val, `unschedule`)}
export function reqTimer(val) {return l.req(val, isTimer)}
