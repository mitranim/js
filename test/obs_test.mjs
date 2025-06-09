import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ob from '../obs.mjs'
import * as ds from '../dom_shim.mjs'

/* Util */

class Run extends l.Emp {
  #ref = new ob.RunRef(this)
  get ref() {return this.#ref}

  constructor({runs = 0, dep = 0} = {}) {
    super()
    this.runs = runs
    this.dep = dep
  }

  run() {this.runs++}
  depth() {return this.dep}
}

class TestRecur extends ob.Recur {
  constructor({runs = 0, dep = 0, shed} = {}) {
    super()
    this.runs = runs
    this.dep = dep
    this.setShed(shed)
  }

  run() {
    this.runs++
    return super.run()
  }

  depth() {return this.dep}
}

class TestShedMicro extends ob.ShedMicro {
  timerInit(fun) {return Promise.resolve().then(fun)}
}

function head(src) {return [...src][0]}

function after(ms) {
  return new Promise(function init(done) {setTimeout(done, ms, true)})
}

/* Test */

t.test(function test_RUN_REF() {
  const dyn = ob.RUN_REF
  t.is(dyn.get(), undefined)

  dyn.set()
  t.is(dyn.get(), undefined)

  t.throws(() => dyn.set(123), TypeError, `expected instance of RunRef, got 123`)
  t.is(dyn.get(), undefined)

  t.throws(() => dyn.set(new WeakRef({})), TypeError, `expected instance of RunRef, got instance of WeakRef`)
  t.is(dyn.get(), undefined)

  const ref = new ob.RunRef({})
  dyn.set(ref)
  t.is(dyn.get(), ref)

  dyn.set()
  t.is(dyn.get(), undefined)
})

await t.test(async function test_Que() {
  t.test(function test_enqueDyn() {
    const que = new ob.Que()
    const dyn = que.dyn
    t.is(dyn, ob.RUN_REF)

    testQueEmpty(que)

    const ref = new Run().ref
    dyn.set(ref)

    que.enqueDyn()
    testQueRef(que, ref)

    // No redundant addition.
    que.enqueDyn()
    testQueRef(que, ref)

    que.deinit()
    testQueEmpty(que)

    dyn.set()
  })

  t.test(function test_enque_flush() {
    const que = new ob.Que()
    testQueEmpty(que)

    const run0 = new Run()
    const ref0 = run0.ref
    t.throws(() => que.enque(run0), TypeError, `expected instance of RunRef, got instance of Run`)

    que.enque(ref0)
    testQueRef(que, ref0)

    // No redundant addition.
    que.enque(ref0)
    testQueRef(que, ref0)

    que.deinit()
    testQueEmpty(que)

    /*
    When enqueing a new reference for the same target, we deque the old
    reference for that target. This is implemented only for theoretical
    misbehaving callers. Our code should avoid creating unnecessary new
    references.
    */
    const ref_0_1 = new ob.RunRef(run0)
    que.enque(ref_0_1)
    testQueRef(que, ref_0_1)

    // No redundant addition.
    que.enque(ref_0_1)
    testQueRef(que, ref_0_1)

    que.deinit()
    testQueEmpty(que)

    que.enque(ref0)
    testQueRef(que, ref0)

    const run1 = new Run()
    const ref1 = run1.ref

    que.enque(ref1)
    t.eq(que, new ob.Que([ref0, ref1]))

    que.flush()
    testQueEmpty(que)
    t.eq(run0, new Run({runs: 1}))
    t.eq(run1, new Run({runs: 1}))

    que.flush()
    testQueEmpty(que)
    t.eq(run0, new Run({runs: 1}))
    t.eq(run1, new Run({runs: 1}))

    que.enque(ref0)
    que.enque(ref1)
    que.enque(ref0)
    que.enque(ref1)
    que.enque(ref0)
    que.enque(ref1)
    t.eq(que, new ob.Que([ref0, ref1]))
    que.flush()
    testQueEmpty(que)
    t.eq(run0, new Run({runs: 2}))
    t.eq(run1, new Run({runs: 2}))

    que.enque(ref0)
    que.enque(ref1)
    t.eq(que, new ob.Que([ref0, ref1]))
    que.deinit()
    testQueEmpty(que)
    t.eq(run0, new Run({runs: 2}))
    t.eq(run1, new Run({runs: 2}))
  })

  t.test(function test_reentrant_enque() {
    const que = new ob.Que()
    t.no(que.flushing)

    class RunEnque extends Run {
      run() {
        super.run()
        t.ok(que.flushing)
        que.enque(this.ref)
      }
    }

    const run0 = new RunEnque()
    const run1 = new RunEnque()

    que.enque(run0.ref)
    que.enque(run1.ref)
    que.flush()

    t.eq(run0, new RunEnque({runs: 1}))
    t.eq(run1, new RunEnque({runs: 1}))

    t.eq(que, new ob.Que([run0.ref, run1.ref]))
    t.no(que.flushing)
  })

  t.test(function test_reentrant_flush() {
    const que = new ob.Que()
    t.no(que.flushing)

    class RunFlush extends Run {
      run() {
        super.run()
        t.ok(que.flushing)
        que.flush()
      }
    }

    const run0 = new RunFlush()
    const run1 = new RunFlush()

    que.enque(run0.ref)
    que.enque(run1.ref)
    que.flush()

    t.eq(run0, new RunFlush({runs: 1}))
    t.eq(run1, new RunFlush({runs: 1}))

    testQueEmpty(que)
    t.no(que.flushing)
  })

  t.test(function test_reentrant_enque_flush() {
    const que = new ob.Que()
    t.no(que.flushing)

    class RunEnqueFlush extends Run {
      run() {
        super.run()
        t.ok(que.flushing)
        que.enque(this.ref)
        que.flush()
      }
    }

    const run0 = new RunEnqueFlush()
    const run1 = new RunEnqueFlush()

    que.enque(run0.ref)
    que.enque(run1.ref)
    que.flush()

    t.eq(run0, new RunEnqueFlush({runs: 1}))
    t.eq(run1, new RunEnqueFlush({runs: 1}))

    t.eq(que, new ob.Que([run0.ref, run1.ref]))
    t.no(que.flushing)
  })

  /*
  When runners are garbage collected, we want to auto-remove their weak refs
  from ques. This prevents accidental accumulation of refs in long-lived ques
  which are rarely flushed, such as for observables which never change, which
  could have been a significant memory leak when many observers / runners come
  and go frequently.
  */
  await t.test(async function test_finalization() {
    if (!l.isFun(globalThis.gc)) return

    const que = new ob.Que()

    let run0 = new Run()
    const ref0 = run0.ref
    t.is(ref0.deref(), run0)

    let run1 = new Run()
    const ref1 = run1.ref
    t.is(ref1.deref(), run1)

    que.enque(ref0)
    que.enque(ref1)
    t.eq(que, new ob.Que([ref0, ref1]))

    await waitForGcAndFinalizers()
    t.eq(que, new ob.Que([ref0, ref1]))

    run0 = undefined
    run1 = undefined

    await waitForGcAndFinalizers()
    testQueEmpty(que)
    t.is(ref0.deref(), undefined)
    t.is(ref1.deref(), undefined)
  })
})

function testQueRef(que, ref) {
  t.is(que.prev.size, 0)
  t.is(que.next.size, 1)
  t.is(head(que.next), ref)
  t.is(que.refs.get(ref.deref()), ref)
  t.eq(que, new ob.Que([ref]))
}

function testQueEmpty(que) {
  t.eq(que, new ob.Que())
  t.is(que.prev.size, 0)
  t.is(que.next.size, 0)
}

await t.test(async function test_Shed() {
  const shed = new TestShedMicro()
  const run0 = new Run()
  const run1 = new Run()

  t.throws(() => shed.enque(run0), TypeError, `expected instance of RunRef, got instance of Run`)

  shed.enque(run0.ref)
  shed.enque(run0.ref)
  shed.enque(run0.ref)

  t.eq(shed.ques, [new ob.Que([run0.ref])])
  t.eq(run0, new Run())

  await shed.timer

  t.eq(shed.ques, [new ob.Que()])
  t.eq(run0, new Run({runs: 1}))

  shed.enque(run1.ref)
  shed.enque(run0.ref)

  t.eq(shed.ques, [new ob.Que([run1.ref, run0.ref])])
  t.eq(run0, new Run({runs: 1}))
  t.eq(run1, new Run())

  await shed.timer

  t.eq(shed.ques, [new ob.Que()])
  t.eq(run0, new Run({runs: 2}))
  t.eq(run1, new Run({runs: 1}))

  run0.dep = 3
  run1.dep = 2

  shed.enque(run0.ref)
  shed.enque(run1.ref)

  t.eq(shed.ques, [new ob.Que(), undefined, new ob.Que([run1.ref]), new ob.Que([run0.ref])])

  await shed.timer

  t.eq(shed.ques, [new ob.Que(), undefined, new ob.Que(), new ob.Que()])
  t.eq(run0, new Run({runs: 3, dep: 3}))
  t.eq(run1, new Run({runs: 2, dep: 2}))
})

t.test(function test_Recur() {
  const rec = new TestRecur()
  const dyn = rec.dyn
  t.is(dyn, ob.RUN_REF)

  t.no(rec.running)
  t.is(rec.shed, undefined)

  t.inst(getShedRef(rec), ob.ShedRef)
  testWeakerRef(getShedRef(rec), rec)

  t.inst(getRunRef(rec), ob.RunRef)
  testWeakerRef(getRunRef(rec), rec)

  t.is(rec.depth(), 0)
  t.is(dyn.get(), undefined)

  rec.onRun = function onRun() {
    return {running: this.running, dyn: dyn.get()}
  }

  function testRunOut(run, ref) {
    t.ok(run.running)
    t.no(rec.running)
    t.is(run.dyn, ref)
    testWeakerRef(run.dyn, rec)
  }

  const run0 = rec.run()
  testRunOut(run0, getShedRef(rec))
  t.is(rec.runs, 1)

  const run1 = rec.run()
  testRunOut(run1, getShedRef(rec))
  t.is(rec.runs, 2)

  t.eq(run0, run1)

  const shed = ob.ShedSync.main
  t.inst(shed, ob.ShedSync)

  rec.setShed(shed)

  const run2 = rec.run()
  testRunOut(run2, getShedRef(rec))
  t.is(rec.runs, 3)

  const run3 = rec.run()
  testRunOut(run3, getShedRef(rec))
  t.is(rec.runs, 4)

  t.eq(run2, run3)

  t.test(function test_refs() {
    const rec = new TestRecur({shed: ob.ShedSync.main})
    const {shedRef, runRef} = rec
    testWeakerRef(shedRef, rec)
    testWeakerRef(runRef, rec)

    rec.deinit()

    testWeakerRef(shedRef)
    testWeakerRef(runRef)

    rec.run()

    testWeakerRef(shedRef, rec)
    testWeakerRef(runRef)

    shedRef.run()
    testWeakerRef(shedRef, rec)
    testWeakerRef(runRef, rec)
  })
})

t.test(function test_Recur_scheduling_sync() {
  test_Recur_sync()
  test_Recur_sync(new ob.ShedSync())
})

// Very minimal. See the more complete async test below.
function test_Recur_sync(shed) {
  t.is(new ob.Recur().shed, undefined)
  t.is(new ob.Recur(shed).shed, shed)

  const rec = new TestRecur({shed})
  const ref = getShedRef(rec)
  testWeakerRef(ref, rec)

  t.is(rec.shed, shed)

  rec.setShed()
  t.is(rec.shed, undefined)

  rec.setShed(shed)
  t.is(rec.shed, shed)

  t.is(rec.runs, 0)
  t.no(rec.running)

  function enque() {
    if (shed) shed.enque(rec)
    else rec.run()
  }

  enque()

  t.is(rec.runs, 1)
  t.no(rec.running)

  rec.dep = 1
  enque()
  t.is(rec.runs, 2)

  enque()
  enque()
  t.is(rec.runs, 4)

  /*
  Synchronous triggering is tricky. Without careful handling, it's easy to
  accidentally enter an infinite loop. We avoid that by rotating the prev /
  next sets of runnables in `Que`. This ensures that during a flush, we do not
  re-run any previous runnables, while correctly managing to add them to the
  next pending set of runnables instead of dropping.
  */
  t.test(function test_no_infinite_cycle() {
    const obs = ob.obs({val: 10})
    const que = ob.getPh(obs)[ob.QUE]
    testQueEmpty(que)

    rec.onRun = function onRun() {return obs.val}
    t.is(rec.runs, 4)

    t.is(rec.run(), 10)
    testQueRef(que, ref)
    t.is(rec.runs, 5)

    obs.val++
    t.is(obs.val, 11)
    testQueRef(que, ref)
    t.is(rec.runs, 6)

    obs.val++
    t.is(obs.val, 12)
    testQueRef(que, ref)
    t.is(rec.runs, 7)
  })
}

t.test(function test_shed_sync_pause_resume() {
  const shed = ob.ShedSync.main

  const obs = ob.obs({one: 10, two: 20})

  class PauseTestRecur extends TestRecur {
    constructor({val, ...opt}) {super(opt).val = val}
    onRun() {this.val = obs.one + obs.two}
  }

  const rec = new PauseTestRecur({shed})

  /*
  Ideally, we would just compare via `t.eq`, but it has a false negative
  when cyclic references are involved.
  */
  function test(runs, val) {
    t.is(rec.runs, runs, `runs`)
    t.is(rec.val, val, `val`)
  }

  test(0, undefined)
  rec.run()
  test(1, 30)

  // Without pausing, it runs twice.
  obs.one = 30
  test(2, 50)

  obs.two = 40
  test(3, 70)

  // Pausing and resuming causes it to run once.
  shed.pause()
  try {
    obs.one = 50
    test(3, 70) // Triggered once more.

    obs.two = 60
    test(3, 70) // NOT triggered anymore. Scheduled for later.
  }
  finally {shed.flush()}
  test(4, 110)
})

await t.test(async function test_Recur_scheduling_async() {
  const shed = new TestShedMicro()
  const rec = new TestRecur({shed})
  const ref = getRunRef(rec)
  testWeakerRef(ref, rec)

  t.is(rec.shed, shed)
  t.no(rec.running)
  t.is(rec.runs, 0)

  shed.enque(ref)

  t.no(rec.running)
  t.is(rec.runs, 0)

  await shedWait(shed, ref)

  t.no(rec.running)
  t.is(rec.runs, 1)

  rec.dep = 1
  shed.enque(ref)
  shed.enque(ref)
  shed.enque(ref)

  t.is(rec.runs, 1)

  t.eq(shed.ques, [new ob.Que(), new ob.Que([ref])])
  await shed.timer
  t.eq(shed.ques, [new ob.Que(), new ob.Que()])

  t.is(rec.runs, 2)
})

t.test(function test_isRef_isObsRef_deref_derefAll() {
  t.test(function test_obs() {
    const tar = l.Emp()
    const obs = ob.obs(tar)

    t.eq(Object.keys(obs), [])
    t.eq(Reflect.ownKeys(obs), [])

    t.no(l.VAL in tar)
    t.ok(l.VAL in obs)
    t.is(tar[l.VAL], undefined)
    t.is(obs[l.VAL], tar)

    t.no(l.isRef(tar))
    t.ok(l.isRef(obs))

    t.no(ob.isObsRef(tar))
    t.ok(ob.isObsRef(obs))

    t.is(l.deref(tar), tar)
    t.is(l.deref(obs), tar)

    t.is(l.derefAll(tar), tar)
    t.is(l.derefAll(obs), tar)

    tar[l.VAL] = 10

    t.ok(l.isRef(tar))
    t.ok(l.isRef(obs))

    t.no(ob.isObsRef(tar))
    t.ok(ob.isObsRef(obs))

    t.is(l.deref(tar), 10)
    t.is(l.deref(obs), tar)

    t.is(l.derefAll(tar), 10)
    t.is(l.derefAll(obs), 10)
  })

  t.test(function test_obsRef() {
    const obs = ob.obsRef()

    t.eq(Object.keys(obs), [])
    t.eq(Reflect.ownKeys(obs), [ob.QUE, l.VAL])

    t.ok(l.isRef(obs))
    t.no(l.isRef(obs.val))

    t.ok(ob.isObsRef(obs))
    t.no(ob.isObsRef(obs.val))

    t.is(l.deref(obs), undefined)
    t.is(l.derefAll(obs), undefined)

    obs.val = 10

    t.ok(l.isRef(obs))
    t.no(l.isRef(obs.val))

    t.ok(ob.isObsRef(obs))
    t.no(ob.isObsRef(obs.val))

    t.is(l.deref(obs), 10)
    t.is(l.derefAll(obs), 10)
  })
})

await t.test(async function test_obs() {
  const shed = new TestShedMicro()

  const tar0 = l.Emp()
  const obs0 = ob.obs(tar0)
  t.is(l.deref(obs0), tar0)

  const ph0 = ob.getPh(obs0)
  t.inst(ph0, ob.ObsPh)

  const que0 = ph0[ob.QUE]
  testQueEmpty(que0)

  ph0[ob.QUE].enqueDyn()
  testQueEmpty(que0)

  const tar1 = l.Emp()
  const obs1 = ob.obs(tar1)
  t.is(l.deref(obs1), tar1)

  const ph1 = ob.getPh(obs1)
  t.inst(ph1, ob.ObsPh)

  const que1 = ph1[ob.QUE]
  testQueEmpty(que1)

  ph1[ob.QUE].enqueDyn()
  testQueEmpty(que1)

  let rec0 = new TestRecur({shed})
  rec0.onRun = function onRun() {return obs0.val}
  t.is(rec0.runs, 0)

  rec0.run()
  t.is(rec0.runs, 1)
  testQueRef(que0, getShedRef(rec0))

  obs0.val = 10
  t.is(rec0.runs, 1)
  testQueEmpty(que0)

  await shedWait(shed, getRunRef(rec0))

  t.is(rec0.runs, 2)
  testQueRef(que0, getShedRef(rec0))

  // No change, no run.
  obs0.val = 10
  await shed.timer
  t.is(rec0.runs, 2)
  testQueRef(que0, getShedRef(rec0))

  // Not monitored / observed / enqued, no run.
  obs1.val = 20
  await shed.timer
  t.is(rec0.runs, 2)
  testQueEmpty(que1)

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
  testQueEmpty(que0)
  testQueEmpty(que1)

  await shedWait(shed, getRunRef(rec0))

  t.is(rec0.runs, 3)

  testQueEmpty(que0)
  testQueRef(que1, getShedRef(rec0))

  /*
  Since the reference held by `que0` is expired, changes should no longer
  affect this triggerable.
  */
  obs0.val = 40
  t.is(rec0.runs, 3)

  que0.flush()
  t.is(rec0.runs, 3)
  testQueEmpty(que0)
  testQueRef(que1, getShedRef(rec0))

  obs1.val = 50
  t.is(rec0.runs, 3)
  testQueEmpty(que1)

  await shedWait(shed, getRunRef(rec0))

  t.is(rec0.runs, 4)
  testQueRef(que1, getShedRef(rec0))

  // Monitor both observables.
  rec0.onRun = function onRun() {return obs0.val + obs1.val}

  obs1.val = 60
  t.is(rec0.runs, 4)
  testQueEmpty(que0)
  testQueEmpty(que1)

  await shedWait(shed, getRunRef(rec0))

  t.is(rec0.runs, 5)
  testQueRef(que0, getShedRef(rec0))
  testQueRef(que1, getShedRef(rec0))

  let rec1 = new TestRecur({shed})
  rec1.onRun = function onRun() {return obs1.val}
  t.is(rec1.runs, 0)

  rec1.run()
  t.is(rec1.runs, 1)

  t.eq(que0, new ob.Que([getShedRef(rec0)]))
  t.eq(que1, new ob.Que([getShedRef(rec0), getShedRef(rec1)]))

  obs0.val = obs0.val // eslint-disable-line no-self-assign
  obs1.val = obs1.val // eslint-disable-line no-self-assign
  t.is(rec0.runs, 5)
  t.is(rec1.runs, 1)

  t.eq(que0, new ob.Que([getShedRef(rec0)]))
  t.eq(que1, new ob.Que([getShedRef(rec0), getShedRef(rec1)]))

  obs1.val = 70
  t.is(rec0.runs, 5)
  t.is(rec1.runs, 1)
  testQueRef(que0, getShedRef(rec0))
  testQueEmpty(que1)

  t.eq(shed.ques, [new ob.Que([getRunRef(rec0), getRunRef(rec1)])])
  await shed.timer
  t.eq(shed.ques, [new ob.Que()])

  t.is(rec0.runs, 6)
  t.is(rec1.runs, 2)

  t.eq(que0, new ob.Que([getShedRef(rec0)]))
  t.eq(que1, new ob.Que([getShedRef(rec0), getShedRef(rec1)]))

  rec0.deinit()

  obs0.val = 80
  obs1.val = 90
  t.is(rec0.runs, 6)
  t.is(rec1.runs, 2)
  testQueEmpty(que0)
  testQueEmpty(que1)

  await shedWait(shed, getRunRef(rec1))

  t.is(rec0.runs, 6)
  t.is(rec1.runs, 3)

  testQueEmpty(que0)
  testQueRef(que1, getShedRef(rec1))

  /*
  Earlier in this test, we deinit one of the `Recur` instances.
  Here, we reinit it to verify that they're reusable: automatically
  reinited if rerun.
  */

  rec0.run()
  t.is(rec0.runs, 7)
  t.is(rec1.runs, 3)

  testQueRef(que0, getShedRef(rec0))
  t.eq(que0, new ob.Que([getShedRef(rec0)]))
  t.eq(que1, new ob.Que([getShedRef(rec1), getShedRef(rec0)]))

  obs0.val = 90

  t.is(rec0.runs, 7)
  t.is(rec1.runs, 3)
  testQueEmpty(que0)
  t.eq(que1, new ob.Que([getShedRef(rec1), getShedRef(rec0)]))

  await shedWait(shed, getRunRef(rec0))

  t.is(rec0.runs, 8)
  t.is(rec1.runs, 3)

  t.eq(que0, new ob.Que([getShedRef(rec0)]))
  t.eq(que1, new ob.Que([getShedRef(rec1), getShedRef(rec0)]))

  if (!l.isFun(globalThis.gc)) return

  t.eq(que0, new ob.Que([getShedRef(rec0)]))
  t.eq(que1, new ob.Que([getShedRef(rec0), getShedRef(rec1)]))

  const shedRef0 = getShedRef(rec0)
  const runRef0 = getRunRef(rec0)
  testWeakerRef(shedRef0, rec0)
  testWeakerRef(runRef0, rec0)

  const shedRef1 = getShedRef(rec1)
  const runRef1 = getRunRef(rec1)
  testWeakerRef(shedRef1, rec1)
  testWeakerRef(runRef1, rec1)

  rec0 = undefined
  rec1 = undefined

  await waitForGcAndFinalizers()

  testWeakerRef(shedRef0)
  testWeakerRef(runRef0)
  testWeakerRef(shedRef1)
  testWeakerRef(runRef1)

  testQueEmpty(que0)
  testQueEmpty(que1)
})

function testWeakerRef(ref, tar, exp) {
  t.inst(ref, ob.WeakerRef)
  t.is(ref.deref(), tar)
  if (l.isSome(exp)) t.is(ref.expired, exp)
  if (tar) t.no(ref.expired)
}

async function shedWait(shed, ref) {
  t.ok(shed.scheduled)
  t.inst(shed.timer, Promise)

  t.eq(shed.ques, [new ob.Que([ref])])
  testQueRef(shed.ques[0], ref)

  await shed.timer

  testShedEmpty(shed)
}

function testShedEmpty(shed) {
  t.no(shed.scheduled)
  t.is(shed.timer, undefined)
  t.eq(shed.ques, [new ob.Que()])
  testQueEmpty(shed.ques[0])
}

/*
The function `globalThis.gc` is available with `--v8-flags=--expose_gc`.

We use `FinalizationRegistry` to evict expired que entries.

The following seems unreliable. May need adjustments in the future.
*/
async function waitForGcAndFinalizers() {
  globalThis.gc()
  await after(1)
  globalThis.gc()
  await after(1)
}

await t.test(async function test_recur_sync() {
  t.throws(() => ob.recurSync(), TypeError, `expected at least one function, got undefined and undefined`)
  t.throws(() => ob.recurSync(10), TypeError, `expected at least one function, got 10 and undefined`)
  t.throws(() => ob.recurSync(10, 20), TypeError, `expected at least one function, got 10 and 20`)

  ob.recurSync(l.nop)
  ob.recurSync(l.nop, undefined)
  ob.recurSync(l.nop, 10)
  ob.recurSync(l.nop, l.Emp())
  ob.recurSync(undefined, l.nop)
  ob.recurSync(10, l.nop)
  ob.recurSync(l.Emp(), l.nop)

  await test_recurSync(Symbol(), false)
  await test_recurSync(Symbol(), true)
  await test_recurSync(l.Emp(), false)
  await test_recurSync(l.Emp(), true)
})

async function test_recurSync(tar, swap) {
  l.reqSome(tar)

  const obs0 = ob.obs({val: 3})
  const obs1 = ob.obsRef(5)

  const que0 = ob.getPh(obs0)[ob.QUE]
  const que1 = obs1[ob.QUE]

  let runs = 0
  let val = undefined

  function run(arg) {
    t.is(this, tar)
    t.is(arg, tar)

    runs++
    val = obs0.val + obs1.val
  }

  let rec = (
    swap
    ? ob.recurSync(run, tar)
    : ob.recurSync(tar, run)
  )

  t.is(runs, 1)
  t.is(val, 8)

  testQueRef(que0, getShedRef(rec))
  testQueRef(que1, getShedRef(rec))

  // No change, no run.
  obs0.val = 3

  t.is(runs, 1)
  t.is(val, 8)

  testQueRef(que0, getShedRef(rec))
  testQueRef(que1, getShedRef(rec))

  obs0.val = 7

  t.is(runs, 2)
  t.is(val, 12)

  testQueRef(que0, getShedRef(rec))
  testQueRef(que1, getShedRef(rec))

  obs1.val = 11

  t.is(runs, 3)
  t.is(val, 18)

  testQueRef(que0, getShedRef(rec))
  testQueRef(que1, getShedRef(rec))

  t.test(function test_deinit_reinit() {
    rec.deinit()

    testWeakerRef(getShedRef(rec))
    testWeakerRef(getRunRef(rec))

    t.is(que0.next.size, 1)
    t.is(head(que0.next), getShedRef(rec))

    t.is(que1.next.size, 1)
    t.is(head(que1.next), getShedRef(rec))

    obs1.val = 13

    // No rerun.
    t.is(runs, 3)
    t.is(val, 18)

    t.is(que0.next.size, 1)
    t.is(head(que0.next), getShedRef(rec))
    testQueEmpty(que1)

    rec.run()

    t.is(runs, 4)
    t.is(val, 20)

    testWeakerRef(getShedRef(rec), rec)
    testWeakerRef(getRunRef(rec))

    t.is(que0.next.size, 1)
    t.is(head(que0.next), getShedRef(rec))

    t.is(que1.next.size, 1)
    t.is(head(que1.next), getShedRef(rec))

    obs0.val = 17

    t.is(runs, 5)
    t.is(val, 30)

    testWeakerRef(getShedRef(rec), rec)
    testWeakerRef(getRunRef(rec), rec)
  })

  if (!l.isFun(globalThis.gc)) return

  await t.test(async function test_finalization() {
    rec = undefined
    await waitForGcAndFinalizers()
    testQueEmpty(que0)
    testQueEmpty(que1)
  })
}

await t.test(async function test_hierarchical_scheduling() {
  const shed = new TestShedMicro()

  function recur(tar, fun) {return ob.recurShed(shed, tar, fun)}

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

  const rec0_0 = recur(tar0, tar0.run0)
  testElem(tar0, 1, 0, 10, undefined)

  const rec0_1 = recur(tar0, tar0.run1)
  testElem(tar0, 1, 1, 10, 20)

  t.eq(shed.ques, [])
  t.is(shed.ques.length, 0)

  obs0.val++

  await shedWait(shed, getRunRef(rec0_0))

  testElem(tar0, 2, 1, 11, 20)

  obs1.val += 3

  await shedWait(shed, getRunRef(rec0_1))

  testElem(tar0, 2, 2, 11, 23)

  testElem(tar3, 0, 0, undefined, undefined)

  const rec3_1 = recur(tar3, tar3.run1)
  testElem(tar3, 0, 1, undefined, 23)

  const rec3_0 = recur(tar3, tar3.run0)
  testElem(tar3, 1, 1, 11, 23)

  testShedEmpty(shed)

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
    new ob.Que([getRunRef(rec0_1)]),
    undefined,
    undefined,
    new ob.Que([getRunRef(rec3_1)]),
  ], `each triggerable must be scheduled at node depth`)

  await shed.timer
  t.eq(shed.ques, [new ob.Que(), undefined, undefined, new ob.Que()])

  testElem(tar0, 2, 3, 11, 25)
  testElem(tar3, 1, 2, 11, 25)


  const rec1_0 = recur(tar1, tar1.run0)
  testElem(tar1, 1, 0, 11, undefined)

  const rec2_1 = recur(tar2, tar2.run1)
  testElem(tar2, 0, 1, undefined, 25)

  obs0.val++

  t.eq(shed.ques, [
    new ob.Que([getRunRef(rec0_0)]),
    new ob.Que([getRunRef(rec1_0)]),
    undefined,
    new ob.Que([getRunRef(rec3_0)]),
  ])
  await shed.timer
  t.eq(shed.ques, [new ob.Que(), new ob.Que(), undefined, new ob.Que()])

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
    new ob.Que([getRunRef(rec0_0), getRunRef(rec0_1)]),
    new ob.Que([getRunRef(rec1_0)]),
    new ob.Que([getRunRef(rec2_1)]),
    new ob.Que([getRunRef(rec3_1), getRunRef(rec3_0)]),
  ])
  await shed.timer
  t.eq(shed.ques, [new ob.Que(), new ob.Que(), new ob.Que(), new ob.Que()])
  t.no(shed.scheduled)

  testElem(tar0, 4, 4, 19, 30)
  testElem(tar1, 3, 0, 19, undefined)
  testElem(tar2, 0, 2, undefined, 30)
  testElem(tar3, 3, 3, 19, 30)

  rec0_0.deinit()
  rec0_1.deinit()
  rec1_0.deinit()
  rec2_1.deinit()
  rec3_1.deinit()
  rec3_0.deinit()

  obs0.val++
  obs1.val++

  t.eq(shed.ques, [new ob.Que(), new ob.Que(), new ob.Que(), new ob.Que()])
  t.no(shed.scheduled)
  t.is(shed.timer, undefined)

  if (!l.isFun(globalThis.gc)) return

  await t.test(async function test_finalization() {
    let tar4 = new Elem()
    let rec4_0 = recur(tar4, tar4.run0)
    let rec4_1 = recur(tar4, tar4.run1)
    testElem(tar4, 1, 1, 20, 31)

    const que0 = ob.getPh(obs0)[ob.QUE]
    const que1 = obs1[ob.QUE]

    t.eq(que0, new ob.Que([getShedRef(rec4_0)]))
    t.eq(que1, new ob.Que([getShedRef(rec4_1)]))

    tar4 = undefined
    rec4_0 = undefined
    rec4_1 = undefined

    await waitForGcAndFinalizers()

    testQueEmpty(que0)
    t.eq(que1, new ob.Que())

    obs0.val++
    obs1.val++

    t.eq(shed.ques, [new ob.Que(), new ob.Que(), new ob.Que(), new ob.Que()])
    t.no(shed.scheduled)
    t.is(shed.timer, undefined)
  })
})

await t.test(async function test_calc() {
  const obs0 = ob.obs({val: 10})
  const obs1 = ob.obsRef(20)

  const que0 = ob.getPh(obs0)[ob.QUE]
  const que1 = obs1[ob.QUE]

  let runs0 = 0

  const calc0 = ob.calc(function calculate0() {
    runs0++
    return obs0.val + obs1.val
  })

  t.is(calc0[l.VAL], undefined)
  t.no(calc0.valid)
  t.is(runs0, 0)

  // When accessing the value, calculate on demand.
  t.is(calc0.val, 30)

  t.ok(calc0.valid)
  t.is(runs0, 1)

  // No redundant recalc.
  t.is(calc0.val, 30)
  t.ok(calc0.valid)
  t.is(runs0, 1)

  // No redundant recalc.
  t.is(calc0.get(), 30)
  t.ok(calc0.valid)
  t.is(runs0, 1)

  // No redundant recalc.
  t.is(calc0.get(), 30)
  t.ok(calc0.valid)
  t.is(runs0, 1)

  // No redundant recalc.
  t.is(calc0[l.VAL], 30)
  t.ok(calc0.valid)
  t.is(runs0, 1)

  testQueRef(que0, getShedRef(calc0.rec))
  testQueRef(que1, getShedRef(calc0.rec))

  obs0.val = 5

  testQueEmpty(que0)
  testQueRef(que1, getShedRef(calc0.rec))

  // Must invalidate but not recalculate.
  t.is(calc0[l.VAL], 30)
  t.no(calc0.valid)
  t.is(runs0, 1)

  // Accessing the value must recalculate once.
  t.is(calc0.get(), 25)
  t.ok(calc0.valid)
  t.is(runs0, 2)

  // Recalc must que up for future updates.
  testQueRef(que0, getShedRef(calc0.rec))
  testQueRef(que1, getShedRef(calc0.rec))

  // No redundant recalc.
  t.is(calc0.get(), 25)
  t.ok(calc0.valid)
  t.is(runs0, 2)

  // No redundant recalc.
  t.is(calc0.val, 25)
  t.ok(calc0.valid)
  t.is(runs0, 2)

  testQueRef(que0, getShedRef(calc0.rec))
  testQueRef(que1, getShedRef(calc0.rec))

  obs1.val = 7

  testQueRef(que0, getShedRef(calc0.rec))
  testQueEmpty(que1)

  // Must invalidate but not recalculate.
  t.is(calc0[l.VAL], 25)
  t.no(calc0.valid)
  t.is(runs0, 2)

  // Accessing the value must recalculate once.
  t.is(calc0.get(), 12)
  t.ok(calc0.valid)
  t.is(runs0, 3)

  // Recalc must que up for future updates.
  testQueRef(que0, getShedRef(calc0.rec))
  testQueRef(que1, getShedRef(calc0.rec))

  // No redundant recalc.
  t.is(calc0.get(), 12)
  t.ok(calc0.valid)
  t.is(runs0, 3)

  // No redundant recalc.
  t.is(calc0.val, 12)
  t.ok(calc0.valid)
  t.is(runs0, 3)

  let runs1 = 0

  let calc1 = ob.calc(function calculate1() {
    runs1++
    return calc0.val * 2
  })

  // No accidental rerun of accessed calc observable.
  t.is(runs0, 3)
  t.is(calc0[l.VAL], 12)

  t.is(calc1[l.VAL], undefined)
  t.no(calc1.valid)
  t.is(runs1, 0)

  // Nothing qued up until the derived calc is accessed.
  testQueEmpty(calc0[ob.QUE])

  // Accessing the valid calculates on demand and ques up for future updates.
  t.is(calc1.val, 24)
  t.ok(calc1.valid)
  t.is(runs1, 1)

  testQueRef(calc0[ob.QUE], getShedRef(calc1.rec))

  // No accidental rerun of accessed calc observable.
  t.is(runs0, 3)
  t.is(calc0[l.VAL], 12)

  // No redundant recalc.
  t.is(calc1.val, 24)
  t.ok(calc1.valid)
  t.is(runs1, 1)

  // No redundant recalc.
  t.is(calc1.get(), 24)
  t.ok(calc1.valid)
  t.is(runs1, 1)

  // No redundant recalc.
  t.is(calc1.get(), 24)
  t.ok(calc1.valid)
  t.is(runs1, 1)

  testQueRef(que0, getShedRef(calc0.rec))
  testQueRef(que1, getShedRef(calc0.rec))

  obs0.val = 11

  // Must run and recalc immediately and flush the pending runners,
  // in this case the derived calc.
  t.is(runs0, 4)
  t.is(calc0[l.VAL], 18)

  // ...Which is why it must also que up on all of its source observables.
  testQueRef(que0, getShedRef(calc0.rec))
  testQueRef(que1, getShedRef(calc0.rec))

  // ...But the derived calc is not qued up until its value is observed.
  testQueEmpty(calc0[ob.QUE])

  // Must invalidate derived calc but not recalculate.
  t.is(calc1[l.VAL], 24)
  t.no(calc1.valid)
  t.is(runs1, 1)

  // No redundant recalc of first calc on further value access.
  t.is(calc0.get(), 18)
  t.ok(calc0.valid)
  t.is(runs0, 4)

  // Accessing derived calc runs it and calculates value on demand.
  t.is(calc1.get(), 36)
  t.ok(calc1.valid)
  t.is(runs1, 2)

  // Recalc must que up derived calc for future updates.
  testQueRef(calc0[ob.QUE], getShedRef(calc1.rec))

  // No redundant recalc of derived calc.
  t.is(calc1.get(), 36)
  t.ok(calc1.valid)
  t.is(runs1, 2)

  // Must remain qued up for future updates.
  testQueRef(calc0[ob.QUE], getShedRef(calc1.rec))

  const shed = calc0.rec.shed
  let rec = new TestRecur({shed})
  let recTrueRuns = 0
  let recVal = undefined

  rec.onRun = function onRun() {
    recTrueRuns++
    recVal = calc0.val + calc1.val
  }
  rec.run()

  t.eq(calc0[ob.QUE], new ob.Que([getShedRef(calc1.rec), getShedRef(rec)]))
  testQueRef(calc1[ob.QUE], getShedRef(rec))

  // No redundant recalc of either calc.
  t.is(runs0, 4)
  t.is(runs1, 2)

  t.is(rec.runs, 1)
  t.is(recTrueRuns, 1)
  t.is(recVal, 54)

  obs1.val = 13

  /*
  This produces +2 runs instead of an ideal +1. When we change the observable,
  it synchronously flushes `calc0`, which synchronously flushes `rec`, which
  was in its que, and `calc1`, and `calc1` also flushes `rec`, which was in its
  que.

  Pausing the synchronous scheduler doesn't prevent this because only `calc0`
  gets paused, and all our ques explicitly prevent adding new runnables to a
  que while it's flushing.
  */
  t.is(rec.runs, 3)
  t.is(recTrueRuns, 3)
  t.is(recVal, 72)

  t.is(calc0.get(), 24)
  t.is(calc1.get(), 48)
  t.is(runs0, 5)
  t.is(runs1, 3)

  if (!l.isFun(globalThis.gc)) return

  calc1 = undefined
  rec = undefined

  await waitForGcAndFinalizers()
  testQueEmpty(calc0[ob.QUE])
})

t.test(function test_calc_arg_swap() {
  const tar0 = Symbol()
  const tar1 = l.Emp()

  let runs0 = 0
  let runs1 = 0

  const calc0 = ob.calc(tar0, function run0(arg) {
    runs0++
    t.is(this, tar0)
    t.is(arg, tar0)
    return 10
  })

  t.is(runs0, 0)
  t.is(calc0.get(), 10)
  t.is(runs0, 1)

  const calc1 = ob.calc(function run1(arg) {
    runs1++
    t.is(this, tar1)
    t.is(arg, tar1)
    return 20
  }, tar1)

  t.is(runs1, 0)
  t.is(calc1.val, 20)
  t.is(runs1, 1)
})

function testElem(tar, count0, count1, val0, val1) {
  t.is(tar.count0, count0, `count0`)
  t.is(tar.count1, count1, `count1`)
  t.is(tar.val0, val0, `val0`)
  t.is(tar.val1, val1, `val1`)
}

function getRunRef(val) {return l.reqInst(val.runRef, ob.RunRef)}
function getShedRef(val) {return l.reqInst(val.shedRef, ob.ShedRef)}

if (import.meta.main) console.log(`[test] ok!`)
