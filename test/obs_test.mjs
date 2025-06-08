import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ob from '../obs.mjs'
import * as ds from '../dom_shim.mjs'

/* Util */

class Trig extends l.Emp {
  constructor({trigs = 0} = {}) {
    super()
    this.trigs = trigs
  }

  trigger() {this.trigs++}
}

class Runner extends l.Emp {
  constructor({runs = 0, dep = 0} = {}) {
    super()
    this.runs = runs
    this.dep = dep
  }

  run() {this.runs++}
  depth() {return this.dep}
}

class TestRecur extends ob.Recur {
  constructor({trigs = 0, runs = 0, dep = 0, shed} = {}) {
    super()
    this.trigs = trigs
    this.runs = runs
    this.dep = dep
    this.setShed(shed)
  }

  trigger() {
    this.trigs++
    return super.trigger()
  }

  run() {
    this.runs++
    return super.run()
  }

  depth() {return this.dep}
}

class TestShed extends ob.ShedAsync {
  timerInit(fun) {return Promise.resolve().then(fun)}
  timerDeinit() {}
}

function head(src) {return [...src][0]}

function after(ms) {
  return new Promise(function init(done) {setTimeout(done, ms, true)})
}

/* Test */

t.test(function test_TriggerWeakQue() {
  t.test(function test_monitor() {
    const que = new ob.TriggerWeakQue()

    const trig = new Trig()
    ob.TRIG.set(trig)

    que.monitor()
    t.eq(que, new ob.TriggerWeakQue([new WeakRef(trig)]), `added and referenced weakly`)

    que.monitor()
    t.eq(que, new ob.TriggerWeakQue([new WeakRef(trig)]), `no redundant addition`)

    que.deinit()
    t.eq(que, new ob.TriggerWeakQue())

    const weak = new WeakRef(trig)
    ob.TRIG.set(weak)

    que.monitor()
    t.eq(que, new ob.TriggerWeakQue([weak]))
    testTriggerWeakQueRef(que, weak)

    ob.TRIG.set()
  })

  t.test(function test_add() {
    const que = new ob.TriggerWeakQue()
    t.eq(que, new ob.TriggerWeakQue())

    const trig = new Trig()
    que.add(trig)
    t.eq(que, new ob.TriggerWeakQue([new WeakRef(trig)]), `added and referenced weakly`)

    que.add(trig)
    t.eq(que, new ob.TriggerWeakQue([new WeakRef(trig)]), `no redundant addition`)

    que.deinit()
    t.eq(que, new ob.TriggerWeakQue())

    const weak = new WeakRef(trig)
    que.add(weak)
    t.eq(que, new ob.TriggerWeakQue([weak]))
    testTriggerWeakQueRef(que, weak)

    que.add(weak)
    t.eq(que, new ob.TriggerWeakQue([weak]), `no redundant addition`)
    testTriggerWeakQueRef(que, weak)

    // Internal stuff.
    t.eq(que.prev, new Set())
    t.eq(que.next, new Set([weak]))
    t.is(que.refs.get(trig), weak)

    que.deinit()
    t.eq(que, new ob.TriggerWeakQue())

    que.add(weak)
    t.eq(que, new ob.TriggerWeakQue([weak]))
    testTriggerWeakQueRef(que, weak)

    que.deinit()
    t.eq(que, new ob.TriggerWeakQue())
    t.eq(trig, new Trig())
  })

  t.test(function test_flush() {
    const que = new ob.TriggerWeakQue()

    const tri0 = new Trig()
    que.add(tri0)
    t.eq(tri0, new Trig())

    que.flush()
    t.eq(tri0, new Trig({trigs: 1}))

    que.flush()
    t.eq(tri0, new Trig({trigs: 1}), `removed from que, not re-added`)

    que.flush()
    t.eq(tri0, new Trig({trigs: 1}), `removed from que, not re-added`)

    const tri1 = new Trig()
    que.add(tri1)

    que.flush()
    t.eq(tri0, new Trig({trigs: 1}))
    t.eq(tri1, new Trig({trigs: 1}))

    que.add(tri0)
    que.add(tri0)
    que.add(tri0)
    que.flush()
    que.flush()
    que.flush()
    t.eq(tri0, new Trig({trigs: 2}))
    t.eq(tri1, new Trig({trigs: 1}))

    que.flush()
    t.eq(tri0, new Trig({trigs: 2}))
    t.eq(tri1, new Trig({trigs: 1}))

    que.add(tri0)
    que.add(tri1)
    que.add(tri0)
    que.add(tri1)
    que.flush()
    que.flush()
    que.flush()
    t.eq(tri0, new Trig({trigs: 3}))
    t.eq(tri1, new Trig({trigs: 2}))

    que.deinit()
    t.eq(que, new ob.TriggerWeakQue())
    t.eq(tri0, new Trig({trigs: 3}))
    t.eq(tri1, new Trig({trigs: 2}))

    que.flush()
    t.eq(tri0, new Trig({trigs: 3}))
    t.eq(tri1, new Trig({trigs: 2}))
  })
})

function testTriggerWeakQueRef(que, ref) {
  t.eq(que, new ob.TriggerWeakQue([ref]))
  t.is(head(que.next), ref, `uses the exact provided weak reference`)
}

await t.test(async function test_Shed() {
  const shed = new TestShed()
  const run0 = new Runner()
  const run1 = new Runner()

  shed.add(run0)
  shed.add(run0)
  shed.add(run0)

  t.eq(shed.ques, [new ob.RunQue([run0])])
  t.eq(run0, new Runner())

  await shed.timer

  t.eq(shed.ques, [new ob.RunQue()])
  t.eq(run0, new Runner({runs: 1}))

  shed.add(run1)
  shed.add(run0)

  t.eq(shed.ques, [new ob.RunQue([run1, run0])])
  t.eq(run0, new Runner({runs: 1}))
  t.eq(run1, new Runner())

  await shed.timer

  t.eq(shed.ques, [new ob.RunQue()])
  t.eq(run0, new Runner({runs: 2}))
  t.eq(run1, new Runner({runs: 1}))

  run0.dep = 3
  run1.dep = 2

  shed.add(run0)
  shed.add(run1)

  t.eq(shed.ques, [new ob.RunQue(), undefined, new ob.RunQue([run1]), new ob.RunQue([run0])])

  await shed.timer

  t.eq(shed.ques, [new ob.RunQue(), undefined, new ob.RunQue(), new ob.RunQue()])
  t.eq(run0, new Runner({runs: 3, dep: 3}))
  t.eq(run1, new Runner({runs: 2, dep: 2}))
})

t.test(function test_Recur() {
  const rec = new TestRecur()
  t.no(rec.active)
  testRecurRef(rec.weak, rec)
  t.is(rec.depth(), 0)
  t.is(ob.TRIG.get(), undefined)

  rec.onRun = function onRun() {
    return {
      active: this.active,
      weak: this.weak,
      trig: ob.TRIG.get(),
    }
  }

  function testRunOut(run) {
    t.ok(run.active)
    t.no(rec.active)

    t.is(run.weak, rec.weak)
    t.is(run.trig, run.weak)
    testRecurRef(run.weak, rec)
  }

  const run0 = rec.run()
  testRunOut(run0)
  t.is(rec.runs, 1)
  t.is(rec.trigs, 0)

  const run1 = rec.run()
  testRunOut(run1)
  t.is(rec.runs, 2)
  t.is(rec.trigs, 0)

  t.is(run0.weak, run1.weak)
})

/*
Very minimal. See the more complete async test below.

TODO test pausing and resuming.
*/
t.test(function test_Recur_scheduling_sync() {
  t.is(new ob.Recur().getShed(), ob.ShedSync.main)

  const shed = new ob.ShedSync()
  const rec = new TestRecur({shed})
  t.is(rec.getShed(), shed)

  t.is(rec.runs, 0)
  t.is(rec.trigs, 0)
  t.no(rec.active)
  testRecurRef(rec.weak, rec)

  shed.add(rec)

  t.is(rec.runs, 1)
  t.is(rec.trigs, 0)
  t.no(rec.active)
  testRecurRef(rec.weak, rec)

  rec.dep = 1
  shed.add(rec)
  t.is(rec.runs, 2)
  t.is(rec.trigs, 0)

  shed.add(rec)
  shed.add(rec)
  t.is(rec.runs, 4)
  t.is(rec.trigs, 0)

  /*
  Synchronous triggering is tricky. Without careful handling, it's easy to
  accidentally re-trigger. We avoid that by rotating the prev / next sets
  of triggerables in `Que`. This ensures that during a flush, we do not
  re-trigger any previous triggerables, because they're being added to a
  different set, while at the same time, they are still correctly queued up
  for the next trigger.
  */
  t.test(function test_no_infinite_cycle() {
    const obs = ob.obs({val: 10})
    const que = ob.getPh(obs).que

    t.eq(que, new ob.TriggerWeakQue())

    rec.onRun = function onRun() {return obs.val}
    t.is(rec.runs, 4)
    t.is(rec.trigs, 0)

    t.is(rec.run(), 10)
    t.eq(que, new ob.TriggerWeakQue([rec.weak]))
    t.is(rec.runs, 5)
    t.is(rec.trigs, 0)

    obs.val++
    t.is(obs.val, 11)
    t.eq(que, new ob.TriggerWeakQue([rec.weak]))
    t.is(rec.runs, 6)
    t.is(rec.trigs, 1)

    obs.val++
    t.is(obs.val, 12)
    t.eq(que, new ob.TriggerWeakQue([rec.weak]))
    t.is(rec.runs, 7)
    t.is(rec.trigs, 2)
  })
})

await t.test(async function test_Recur_scheduling_async() {
  t.is(new ob.Recur().getShed(), ob.ShedSync.main)

  const shed = new TestShed()
  const rec = new TestRecur({shed})
  t.is(rec.getShed(), shed)

  t.is(rec.runs, 0)
  t.is(rec.trigs, 0)
  t.no(rec.active)
  testRecurRef(rec.weak, rec)

  shed.add(rec)

  t.is(rec.runs, 0)
  t.is(rec.trigs, 0)
  t.no(rec.active)
  testRecurRef(rec.weak, rec)

  t.eq(shed.ques, [new ob.RunQue([rec])])
  await shed.timer
  t.eq(shed.ques, [new ob.RunQue()])

  t.is(rec.runs, 1)
  t.is(rec.trigs, 0)
  t.no(rec.active)
  testRecurRef(rec.weak, rec)

  rec.dep = 1
  shed.add(rec)
  shed.add(rec)
  shed.add(rec)

  t.is(rec.runs, 1)
  t.is(rec.trigs, 0)

  t.eq(shed.ques, [new ob.RunQue(), new ob.RunQue([rec])])
  await shed.timer
  t.eq(shed.ques, [new ob.RunQue(), new ob.RunQue()])

  t.is(rec.runs, 2)
  t.is(rec.trigs, 0)
})

await t.test(async function test_obs() {
  const shed = new TestShed()

  const tar0 = l.Emp()
  const obs0 = ob.obs(tar0)
  t.is(ob.getTar(obs0), tar0)

  const ph0 = ob.getPh(obs0)
  t.inst(ph0, ob.ObsPh)

  const que0 = ph0.que
  t.eq(que0, new ob.TriggerWeakQue())

  ph0.monitor()
  t.eq(que0, new ob.TriggerWeakQue())

  const tar1 = l.Emp()
  const obs1 = ob.obs(tar1)
  t.is(ob.getTar(obs1), tar1)

  const ph1 = ob.getPh(obs1)
  t.inst(ph1, ob.ObsPh)

  const que1 = ph1.que
  t.eq(que1, new ob.TriggerWeakQue())

  ph1.monitor()
  t.eq(que1, new ob.TriggerWeakQue())

  let rec0 = new TestRecur({shed})
  rec0.onRun = function onRun() {return obs0.val}
  t.is(rec0.runs, 0)
  t.is(rec0.trigs, 0)

  rec0.run()
  t.is(rec0.runs, 1)
  t.is(rec0.trigs, 0)
  t.eq(que0, new ob.TriggerWeakQue([rec0.weak]))

  obs0.val = 10
  t.is(rec0.runs, 1)
  t.is(rec0.trigs, 1)
  t.eq(que0, new ob.TriggerWeakQue())

  await shedWait(shed, rec0.weak)
  t.is(rec0.runs, 2)
  t.is(rec0.trigs, 1)
  t.eq(que0, new ob.TriggerWeakQue([rec0.weak]))

  // No change, no trigger.
  obs0.val = 10
  await shed.timer
  t.is(rec0.runs, 2)
  t.is(rec0.trigs, 1)

  // Not monitored, no trigger.
  obs1.val = 20
  await shed.timer
  t.is(rec0.runs, 2)
  t.is(rec0.trigs, 1)

  /*
  We switch from one observable to another. On the next run, the que of the
  previous observable must be flushed and become empty since it has no other
  triggerables, while the que of the next observable must obtain a reference
  to this triggerable.

  If multiple observables were referencing this triggerable, only one of them
  was flushed, and none of them were used during the next reactive run of the
  `Recur` instance, then the rest would retain the references until their own
  next flush. We consider this an internal implementation tradeoff which is not
  worth "fixing". Switching between sets of observables seems like an edge case
  because it comes with the gotcha of not monitoring the right observables and
  not being triggered when you need to be. It seems like something to avoid in
  the first place. In the current implementation, triggerables correctly get
  added to the ques of the next observables, and eventually get evicted from
  the ques of next observables, perhaps at a minor cost of a few redundant
  triggers here and there in the edge case of this actually happening, which
  we're yet to have in practice.
  */
  rec0.onRun = function onRun() {return obs1.val}

  obs0.val = 30
  t.is(rec0.runs, 2)
  t.is(rec0.trigs, 2)
  t.eq(que0, new ob.TriggerWeakQue())
  t.eq(que1, new ob.TriggerWeakQue())

  await shedWait(shed, rec0.weak)
  t.is(rec0.runs, 3)
  t.is(rec0.trigs, 2)
  t.eq(que0, new ob.TriggerWeakQue())
  t.eq(que1, new ob.TriggerWeakQue([rec0.weak]))

  /*
  Since the reference held by `que0` is expired, changes should no longer
  affect this triggerable.
  */
  obs0.val = 40
  t.is(rec0.runs, 3)
  t.is(rec0.trigs, 2)

  que0.flush()
  t.is(rec0.runs, 3)
  t.is(rec0.trigs, 2)
  t.eq(que0, new ob.TriggerWeakQue())
  t.eq(que1, new ob.TriggerWeakQue([rec0.weak]))

  obs1.val = 50
  t.is(rec0.runs, 3)
  t.is(rec0.trigs, 3)
  t.eq(que1, new ob.TriggerWeakQue())

  await shedWait(shed, rec0.weak)
  t.is(rec0.runs, 4)
  t.is(rec0.trigs, 3)
  t.eq(que1, new ob.TriggerWeakQue([rec0.weak]))

  // Monitor both observables.
  rec0.onRun = function onRun() {return obs0.val + obs1.val}

  obs1.val = 60
  t.is(rec0.runs, 4)
  t.is(rec0.trigs, 4)
  t.eq(que0, new ob.TriggerWeakQue())
  t.eq(que1, new ob.TriggerWeakQue())

  await shedWait(shed, rec0.weak)
  t.is(rec0.runs, 5)
  t.is(rec0.trigs, 4)
  t.eq(que0, new ob.TriggerWeakQue([rec0.weak]))
  t.eq(que1, new ob.TriggerWeakQue([rec0.weak]))

  let rec1 = new TestRecur({shed})
  rec1.onRun = function onRun() {return obs1.val}
  t.is(rec1.runs, 0)
  t.is(rec1.trigs, 0)

  rec1.run()
  t.is(rec1.runs, 1)
  t.is(rec1.trigs, 0)

  t.eq(que0, new ob.TriggerWeakQue([rec0.weak]))
  t.eq(que1, new ob.TriggerWeakQue([rec0.weak, rec1.weak]))

  obs0.val = obs0.val // eslint-disable-line no-self-assign
  obs1.val = obs1.val // eslint-disable-line no-self-assign
  t.is(rec0.runs, 5)
  t.is(rec0.trigs, 4)
  t.is(rec1.runs, 1)
  t.is(rec1.trigs, 0)

  obs1.val = 70
  t.is(rec0.runs, 5)
  t.is(rec0.trigs, 5)
  t.is(rec1.runs, 1)
  t.is(rec1.trigs, 1)

  t.eq(shed.ques, [new ob.RunQue([rec0.weak, rec1.weak])])
  await shed.timer
  t.eq(shed.ques, [new ob.RunQue()])

  t.is(rec0.runs, 6)
  t.is(rec0.trigs, 5)
  t.is(rec1.runs, 2)
  t.is(rec1.trigs, 1)

  t.eq(que0, new ob.TriggerWeakQue([rec0.weak]))
  t.eq(que1, new ob.TriggerWeakQue([rec0.weak, rec1.weak]))

  {
    const weak0 = rec0.weak
    testWeakRef(weak0, rec0)
    rec0.deinit()
    t.is(rec0.weak, weak0)
    testWeakRef(weak0)
  }

  obs0.val = 80
  obs1.val = 90
  t.is(rec0.runs, 6)
  t.is(rec0.trigs, 5)
  t.is(rec1.runs, 2)
  t.is(rec1.trigs, 2)

  await shedWait(shed, rec1.weak)
  t.is(rec0.runs, 6)
  t.is(rec0.trigs, 5)
  t.is(rec1.runs, 3)
  t.is(rec1.trigs, 2)

  /*
  Verify that our `Recur` instances are reusable.
  It should be possible to `.deinit` one, and then use it again.
  */

  rec0.run()
  t.is(rec0.runs, 7)
  t.is(rec0.trigs, 5)
  t.is(rec1.runs, 3)
  t.is(rec1.trigs, 2)

  obs0.val = 90
  t.is(rec0.runs, 7)
  t.is(rec0.trigs, 6)
  t.is(rec1.runs, 3)
  t.is(rec1.trigs, 2)

  await shedWait(shed, rec0.weak)
  t.is(rec0.runs, 8)
  t.is(rec0.trigs, 6)
  t.is(rec1.runs, 3)
  t.is(rec1.trigs, 2)

  /*
  The function `globalThis.gc` is available with `--v8-flags=--expose_gc`.
  The following test verifies that we use a `FinalizationRegistry` to evict
  expired que entries.
  */
  if (!l.isFun(globalThis.gc)) return

  t.eq(que0, new ob.TriggerWeakQue([rec0.weak]))
  t.eq(que1, new ob.TriggerWeakQue([rec0.weak, rec1.weak]))

  const weak0 = rec0.weak
  const weak1 = rec1.weak

  testWeakRef(weak0, rec0)
  testWeakRef(weak1, rec1)

  rec0 = undefined
  rec1 = undefined

  await waitForGcAndFinalizers()

  testWeakRef(weak0)
  testWeakRef(weak1)

  t.eq(que0, new ob.TriggerWeakQue())
  t.eq(que1, new ob.TriggerWeakQue())
})

function testWeakRef(ref, tar) {
  t.inst(ref, WeakRef)
  t.is(ref.deref(), tar)
}

function testRecurRef(ref, tar, exp) {
  t.inst(ref, ob.RecurRef)
  t.is(ref.deref(), tar)
  if (l.isSome(exp)) t.is(ref.expired, exp)
  if (tar) t.no(ref.expired)
}

async function shedWait(shed, val) {
  t.eq(shed.ques, [new ob.RunQue([val])])
  await shed.timer
  t.eq(shed.ques, [new ob.RunQue()])
}

// Very unreliable. This will need adjustments in the future.
async function waitForGcAndFinalizers() {
  globalThis.gc()
  await after(1)
  globalThis.gc()
  await after(1)
}

await t.test(async function test_reac_unreac_and_hierarchical_scheduling() {
  const shed = new TestShed()

  class TestNodeMethRecur extends ob.NodeMethRecur {
    get shed() {return shed}
  }

  class TestMethRecurs extends ob.MethRecurs {
    get Recur() {return TestNodeMethRecur}
  }

  function reac(tar, ...vals) {return TestMethRecurs.init(tar, ...vals)}

  const obs0 = ob.obs({val: 10})
  const obs1 = ob.obsRef(20)

  class Elem extends ds.global.HTMLElement {
    count0 = 0
    count1 = 0
    val0 = undefined
    val1 = undefined

    run0() {
      this.count0++
      this.val0 = obs0.val
    }

    run1() {
      this.count1++
      this.val1 = obs1.val
    }
  }

  const tar0 = new Elem()
  const tar1 = new Elem()
  const tar2 = new Elem()
  const tar3 = new Elem()

  tar0.appendChild(tar1)
  tar1.appendChild(tar2)
  tar2.appendChild(tar3)

  reac(tar0)
  testMethRecs(tar0)
  testElem(tar0, 0, 0, undefined, undefined)

  reac(tar0, tar0.run0)
  testMethRecs(tar0, tar0.run0)
  testElem(tar0, 1, 0, 10, undefined)

  // No redundant invocation.
  reac(tar0, tar0.run0)
  testElem(tar0, 1, 0, 10, undefined)

  reac(tar0, tar0.run1)
  testMethRecs(tar0, tar0.run0, tar0.run1)
  testElem(tar0, 1, 1, 10, 20)

  // No redundant invocation.
  reac(tar0, tar0.run1)
  testElem(tar0, 1, 1, 10, 20)

  // No redundant invocations.
  reac(tar0, tar0.run0, tar0.run1)
  testElem(tar0, 1, 1, 10, 20)

  t.eq(shed.ques, [])
  t.is(shed.ques.length, 0)

  obs0.val++

  t.eq(shed.ques, [new ob.RunQue([getWeak(recs(tar0).get(tar0.run0))])])
  t.inst(shed.timer, Promise)
  await shed.timer
  t.eq(shed.ques, [new ob.RunQue()])
  t.is(shed.timer, undefined)
  testElem(tar0, 2, 1, 11, 20)

  obs1.val += 3

  t.eq(shed.ques, [new ob.RunQue([getWeak(recs(tar0).get(tar0.run1))])])
  await shed.timer
  t.eq(shed.ques, [new ob.RunQue()])
  testElem(tar0, 2, 2, 11, 23)

  testElem(tar3, 0, 0, undefined, undefined)
  reac(tar3, tar3.run1, tar3.run0)
  testMethRecs(tar3, tar3.run1, tar3.run0)
  testElem(tar3, 1, 1, 11, 23)

  t.eq(shed.ques, [new ob.RunQue()])

  obs1.val += 2

  /*
  The scheduler runs its ques from left to right, from depth 0 to depth N.
  When using this for reactivity in the DOM, ancestors run before descendants.
  Ancestors often replace descendants.

  Our earlier implementation of reactivity for DOM nodes defined the methods
  `.connectedCallback` and `.disconnectedCallback`; when connected, nodes would
  run a reactive callback and start monitoring observables; when disconnected,
  nodes would stop monitoring observables. This meant that when ancestors
  removed descendants in their reactive callbacks, descendants would not run,
  which seemed nice and clean.

  We found some issues with that approach. Sometimes the UI requires frequently
  moving nodes around. One common example is table sorting. In such cases, the
  mandatory un-monitoring and re-monitoring can be just pure overhead, because
  it also requires re-running the descendants' reactive callbacks without any
  actual change in their observables.

  The current approach at the time of writing does not involve any lifecycle
  callbacks, and relies mostly on GC-based cleanup with `FinalizationRegistry`.
  Which means that the hierarchical scheduling is not really different from
  flat scheduling. We're keeping the hierarchical system for now, because user
  code can easily opt into immediate un-monitoring on disconnect, simply by
  calling `ob.unreac` in `.disconnectedCallback` and placing its `ob.reac` call
  in `.connectedCallback`. Or even more simply, reactive callbacks can check if
  the node is `.isConnected`. This can be done on a per-class basis, giving
  consumer code fine-grained control.
  */
  t.eq(shed.ques, [
    new ob.RunQue([getWeak(recs(tar0).get(tar0.run1))]),
    undefined,
    undefined,
    new ob.RunQue([getWeak(recs(tar3).get(tar3.run1))]),
  ], `each triggerable must be scheduled at node depth`)

  await shed.timer
  t.eq(shed.ques, [new ob.RunQue(), undefined, undefined, new ob.RunQue()])

  testElem(tar0, 2, 3, 11, 25)
  testElem(tar3, 1, 2, 11, 25)

  reac(tar1, tar1.run0)
  testMethRecs(tar1, tar1.run0)
  testElem(tar1, 1, 0, 11, undefined)

  reac(tar2, tar2.run1)
  testMethRecs(tar2, tar2.run1)
  testElem(tar2, 0, 1, undefined, 25)

  obs0.val++

  t.eq(shed.ques, [
    new ob.RunQue([getWeak(recs(tar0).get(tar0.run0))]),
    new ob.RunQue([getWeak(recs(tar1).get(tar1.run0))]),
    undefined,
    new ob.RunQue([getWeak(recs(tar3).get(tar3.run0))]),
  ])
  await shed.timer
  t.eq(shed.ques, [new ob.RunQue(), new ob.RunQue(), undefined, new ob.RunQue()])

  testElem(tar0, 3, 3, 12, 25)
  testElem(tar1, 2, 0, 12, undefined)
  testElem(tar2, 0, 1, undefined, 25)
  testElem(tar3, 2, 2, 12, 25)

  obs0.val += 7
  obs1.val += 5
  t.is(obs0.val, 19)
  t.is(obs1.val, 30)

  t.ok(shed.scheduled)
  t.eq(shed.ques, [
    new ob.RunQue(recWeaks(tar0)),
    new ob.RunQue([getWeak(recs(tar1).get(tar1.run0))]),
    new ob.RunQue([getWeak(recs(tar2).get(tar1.run1))]),
    new ob.RunQue(recWeaks(tar3)),
  ])
  await shed.timer
  t.eq(shed.ques, [new ob.RunQue(), new ob.RunQue(), new ob.RunQue(), new ob.RunQue()])
  t.no(shed.scheduled)

  testElem(tar0, 4, 4, 19, 30)
  testElem(tar1, 3, 0, 19, undefined)
  testElem(tar2, 0, 2, undefined, 30)
  testElem(tar3, 3, 3, 19, 30)

  ob.unreac(tar0)
  ob.unreac(tar1)
  ob.unreac(tar2)
  ob.unreac(tar3)

  t.is(recs(tar0), undefined)
  t.is(recs(tar1), undefined)
  t.is(recs(tar2), undefined)
  t.is(recs(tar3), undefined)

  obs0.val++
  obs1.val++

  t.eq(shed.ques, [new ob.RunQue(), new ob.RunQue(), new ob.RunQue(), new ob.RunQue()])
  t.no(shed.scheduled)
  t.is(shed.timer, undefined)

  if (!l.isFun(globalThis.gc)) return

  let tar4 = new Elem()
  reac(tar4, tar4.run0, tar4.run1)
  testElem(tar4, 1, 1, 20, 31)

  const que0 = ob.getPh(obs0).que
  const que1 = obs1.que

  t.eq(que0, new ob.TriggerWeakQue([getWeak(recs(tar4).get(tar4.run0))]))
  t.eq(que1, new ob.TriggerWeakQue([getWeak(recs(tar4).get(tar4.run1))]))

  tar4 = undefined

  await waitForGcAndFinalizers()

  t.eq(que0, new ob.TriggerWeakQue())
  t.eq(que1, new ob.TriggerWeakQue())

  obs0.val++
  obs1.val++

  t.eq(shed.ques, [new ob.RunQue(), new ob.RunQue(), new ob.RunQue(), new ob.RunQue()])
  t.no(shed.scheduled)
  t.is(shed.timer, undefined)
})

function testElem(tar, count0, count1, val0, val1) {
  t.is(tar.count0, count0, `count0`)
  t.is(tar.count1, count1, `count1`)
  t.is(tar.val0, val0, `val0`)
  t.is(tar.val1, val1, `val1`)
}

// Incomplete, TODO validate values too.
function testMethRecs(tar, ...funs) {t.eq(recKeys(tar), funs)}

function recs(tar) {return tar[ob.SYM_RECS]}
function recKeys(tar) {return [...tar[ob.SYM_RECS].keys()]}
function recVals(tar) {return [...tar[ob.SYM_RECS].values()]}
function recWeaks(tar) {return recVals(tar).map(getWeak)}
function getWeak(val) {return l.reqInst(val.weak, WeakRef)}

if (import.meta.main) console.log(`[test] ok!`)
