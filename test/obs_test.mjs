import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as o from '../obj.mjs'
import * as ob from '../obs.mjs'

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
  // Override super getter.
  shed = undefined

  constructor({trigs = 0, runs = 0, dep = 0, shed} = {}) {
    super()
    this.trigs = trigs
    this.runs = runs
    this.dep = dep
    this.shed = shed
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

/*
Modified version: lets us easily wait until the scheduled broadcast. By default
we prefer `requestAnimationFrame`, with a fallback on `setTimeout`, because the
main use case for observables is UI updates.
*/
class TestShed extends ob.Shed {
  schedule() {return Promise.resolve().then(this.run)}
  unschedule() {}
}

function head(src) {return [...src][0]}
function get(src, ind) {return [...src][ind]}

function after(ms) {
  return new Promise(function init(done) {setTimeout(done, ms, true)})
}

/* Test */

t.test(function test_Broad() {
  t.test(function test_monitor() {
    const bro = new ob.Broad()

    ob.TRIG.set(123)
    bro.monitor()
    t.eq(bro, new ob.Broad())

    ob.TRIG.set(new Runner())
    bro.monitor()
    t.eq(bro, new ob.Broad())

    const trig = new Trig()
    ob.TRIG.set(trig)

    bro.monitor()
    t.eq(bro, new ob.Broad([new WeakRef(trig)]), `added and referenced weakly`)

    bro.monitor()
    t.eq(bro, new ob.Broad([new WeakRef(trig)]), `no redundant addition`)

    bro.deinit()
    t.eq(bro, new ob.Broad())

    const weak = new WeakRef(trig)
    ob.TRIG.set(weak)

    bro.monitor()
    t.eq(bro, new ob.Broad([weak]))
    testWeak(bro, weak)

    ob.TRIG.set()
  })

  t.test(function test_add() {
    const bro = new ob.Broad()
    t.eq(bro, new ob.Broad())

    t.throws(() => bro.add(new Runner()), TypeError, `expected variant of isTrig, got [object Runner {runs: 0, dep: 0}]`)
    t.eq(bro, new ob.Broad())

    const trig = new Trig()
    bro.add(trig)
    t.eq(bro, new ob.Broad([new WeakRef(trig)]), `added and referenced weakly`)

    bro.add(trig)
    t.eq(bro, new ob.Broad([new WeakRef(trig)]), `no redundant addition`)

    bro.deinit()
    t.eq(bro, new ob.Broad())

    const weak = new WeakRef(trig)
    bro.add(weak)
    t.eq(bro, new ob.Broad([weak]))
    testWeak(bro, weak)

    bro.add(weak)
    t.eq(bro, new ob.Broad([weak]), `no redundant addition`)
    testWeak(bro, weak)

    // Internal stuff.
    t.ok(bro.pairs.has(trig))
    t.eq(bro.pairs.get(trig), [bro.refs, weak])
    t.is(bro.trigs.size, 0)

    bro.deinit()
    t.eq(bro, new ob.Broad())

    bro.add(weak)
    t.eq(bro, new ob.Broad([weak]))
    testWeak(bro, weak)

    bro.deinit()
    t.eq(bro, new ob.Broad())
    t.no(bro.refs.has(trig))

    t.eq(trig, new Trig())
  })

  t.test(function test_trigger() {
    const bro = new ob.Broad()
    bro.trigger()
    bro.trigger()
    bro.trigger()

    const tri0 = new Trig()
    bro.add(tri0)
    t.eq(tri0, new Trig())

    bro.trigger()
    t.eq(tri0, new Trig({trigs: 1}))

    bro.trigger()
    t.eq(tri0, new Trig({trigs: 2}))

    const tri1 = new Trig()
    bro.add(tri1)

    bro.trigger()
    t.eq(tri0, new Trig({trigs: 3}))
    t.eq(tri1, new Trig({trigs: 1}))

    bro.trigger()
    t.eq(tri0, new Trig({trigs: 4}))
    t.eq(tri1, new Trig({trigs: 2}))

    bro.deinit()
    t.eq(bro, new ob.Broad())
    t.eq(tri0, new Trig({trigs: 4}))
    t.eq(tri1, new Trig({trigs: 2}))
  })
})

function testWeak(bro, ref) {
  t.eq(bro, new ob.Broad([ref]))
  t.is(head(bro.refs), ref, `uses the exact provided weak reference`)
}

await t.test(async function test_Shed() {
  const shed = new TestShed()
  const run0 = new Runner()
  const run1 = new Runner()

  shed.add(run0)
  shed.add(run0)
  shed.add(run0)

  t.eq(shed.ques, [new ob.Que([run0])])
  t.eq(run0, new Runner())

  await shed.timer

  t.eq(shed.ques, [new ob.Que()])
  t.eq(run0, new Runner({runs: 1}))

  shed.add(run1)
  shed.add(run0)

  t.eq(shed.ques, [new ob.Que([run1, run0])])
  t.eq(run0, new Runner({runs: 1}))
  t.eq(run1, new Runner())

  await shed.timer

  t.eq(shed.ques, [new ob.Que()])
  t.eq(run0, new Runner({runs: 2}))
  t.eq(run1, new Runner({runs: 1}))

  run0.dep = 3
  run1.dep = 2

  shed.add(run0)
  shed.add(run1)

  t.eq(shed.ques, [new ob.Que(), undefined, new ob.Que([run1]), new ob.Que([run0])])

  await shed.timer

  t.eq(shed.ques, [new ob.Que(), undefined, new ob.Que(), new ob.Que()])
  t.eq(run0, new Runner({runs: 3, dep: 3}))
  t.eq(run1, new Runner({runs: 2, dep: 2}))
})

t.test(function test_Recur() {
  const rec = new TestRecur()
  t.is(rec.weak, undefined)
  t.no(rec.active)
  t.is(rec.depth(), 0)
  t.is(ob.TRIG.get(), undefined)

  rec.onRun = function onRun() {
    return {
      weak: this.weak,
      active: this.active,
      trig: ob.TRIG.get(),
    }
  }

  function testRunOut(run) {
    t.inst(run.weak, o.WeakerRef)
    t.is(run.weak, rec.weak)
    testWeakUnexpired(run.weak, rec)

    t.ok(run.active)
    t.no(rec.active)

    t.is(run.trig, run.weak)
  }

  const run0 = rec.run()
  testRunOut(run0)
  t.is(rec.runs, 1)
  t.is(rec.trigs, 0)

  const run1 = rec.run()
  testRunOut(run1)
  t.is(rec.runs, 2)
  t.is(rec.trigs, 0)

  t.isnt(run0.weak, run1.weak)
  t.is(run1.weak, rec.weak)

  testWeakExpired(run0.weak)
  testWeakUnexpired(run1.weak, rec)
})

await t.test(async function test_Recur_scheduling() {
  t.is(new ob.Recur().shed, ob.Shed.main)

  const shed = new TestShed()
  const rec = new TestRecur({shed})
  t.is(rec.shed, shed)

  shed.add(rec)

  t.eq(rec, new TestRecur({shed}))
  t.is(rec.runs, 0)
  t.is(rec.trigs, 0)
  t.is(rec.weak, undefined)
  t.no(rec.active)

  t.eq(shed.ques, [new ob.Que([rec])])
  await shed.timer
  t.eq(shed.ques, [new ob.Que()])

  t.is(rec.runs, 1)
  t.is(rec.trigs, 0)
  t.eq(rec.weak, new o.WeakerRef(rec))
  t.no(rec.active)

  rec.dep = 1
  shed.add(rec)
  shed.add(rec)
  shed.add(rec)

  t.is(rec.runs, 1)
  t.is(rec.trigs, 0)

  t.eq(shed.ques, [new ob.Que(), new ob.Que([rec])])
  await shed.timer
  t.eq(shed.ques, [new ob.Que(), new ob.Que()])

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
  t.is(ph0.bro, undefined)

  ph0.monitor()
  const bro0 = ph0.bro
  t.inst(bro0, ob.Broad)

  const tar1 = l.Emp()
  const obs1 = ob.obs(tar1)
  t.is(ob.getTar(obs1), tar1)

  const ph1 = ob.getPh(obs1)
  t.inst(ph1, ob.ObsPh)
  t.is(ph1.bro, undefined)

  ph1.monitor()
  const bro1 = ph1.bro
  t.inst(bro1, ob.Broad)

  let rec0 = new TestRecur({shed})
  rec0.onRun = function onRun() {return obs0.val}
  t.is(rec0.runs, 0)
  t.is(rec0.trigs, 0)

  rec0.run()
  t.is(rec0.runs, 1)
  t.is(rec0.trigs, 0)
  t.eq(bro0, new ob.Broad([rec0.weak]))

  obs0.val = 10
  t.is(rec0.runs, 1)
  t.is(rec0.trigs, 1)
  t.eq(bro0, new ob.Broad([rec0.weak]))

  await shedWait(shed, rec0)
  t.is(rec0.runs, 2)
  t.is(rec0.trigs, 1)
  t.eq(bro0, new ob.Broad([rec0.weak]))

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
  We switch from one observable to another. On the next run, the broadcaster of
  the previous observable must forget about this triggerable, while the broad
  of the next observable must learn about it.
  */
  rec0.onRun = function onRun() {return obs1.val}

  obs0.val = 30
  t.is(rec0.runs, 2)
  t.is(rec0.trigs, 2)

  await shedWait(shed, rec0)
  t.is(rec0.runs, 3)
  t.is(rec0.trigs, 2)

  testWeakExpired(head(bro0.refs))

  /*
  Since the reference held by `bro0` is expired, changes should no longer
  affect this triggerable.
  */
  obs0.val = 40
  t.is(rec0.runs, 3)
  t.is(rec0.trigs, 2)

  bro0.trigger()
  t.is(rec0.runs, 3)
  t.is(rec0.trigs, 2)

  t.eq(bro1, new ob.Broad([rec0.weak]))

  obs1.val = 50
  t.is(rec0.runs, 3)
  t.is(rec0.trigs, 3)

  await shedWait(shed, rec0)
  t.is(rec0.runs, 4)
  t.is(rec0.trigs, 3)

  // Monitor both observables.
  rec0.onRun = function onRun() {return obs0.val + obs1.val}

  obs1.val = 60
  t.is(rec0.runs, 4)
  t.is(rec0.trigs, 4)
  testWeakExpired(head(bro0.refs))
  testWeakUnexpired(head(bro1.refs), rec0)

  await shedWait(shed, rec0)
  t.is(rec0.runs, 5)
  t.is(rec0.trigs, 4)
  testWeakUnexpired(head(bro0.refs), rec0)
  testWeakUnexpired(head(bro1.refs), rec0)

  let rec1 = new TestRecur({shed})
  rec1.onRun = function onRun() {return obs1.val}
  t.is(rec1.runs, 0)
  t.is(rec1.trigs, 0)

  rec1.run()
  t.is(rec1.runs, 1)
  t.is(rec1.trigs, 0)

  t.eq(bro0, new ob.Broad([rec0.weak]))
  t.eq(bro1, new ob.Broad([rec0.weak, rec1.weak]))

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

  t.eq(shed.ques, [new ob.Que([rec0, rec1])])
  await shed.timer
  t.eq(shed.ques, [new ob.Que()])

  t.is(rec0.runs, 6)
  t.is(rec0.trigs, 5)
  t.is(rec1.runs, 2)
  t.is(rec1.trigs, 1)

  t.eq(bro0, new ob.Broad([rec0.weak]))
  t.eq(bro1, new ob.Broad([rec0.weak, rec1.weak]))

  rec0.deinit()
  testWeakExpired(rec0.weak)
  testWeakExpired(head(bro0.refs))
  testWeakExpired(head(bro1.refs))
  testWeakUnexpired(get(bro1.refs, 1), rec1)

  obs0.val = 80
  obs1.val = 90
  t.is(rec0.runs, 6)
  t.is(rec0.trigs, 5)
  t.is(rec1.runs, 2)
  t.is(rec1.trigs, 2)

  await shedWait(shed, rec1)
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

  await shedWait(shed, rec0)
  t.is(rec0.runs, 8)
  t.is(rec0.trigs, 6)
  t.is(rec1.runs, 3)
  t.is(rec1.trigs, 2)

  /*
  The function `globalThis.gc` is available with `--v8-flags=--expose_gc`.
  The following test verifies that we use a `FinalizationRegistry` to evict
  expired broadcaster entries.
  */
  if (!l.isFun(globalThis.gc)) return

  t.is(bro0.refs.size, 1)
  t.is(bro1.refs.size, 2)

  testWeakUnexpired(head(bro0.refs), rec0)
  testWeakUnexpired(head(bro1.refs), rec1)
  testWeakUnexpired(get(bro1.refs, 1), rec0)

  rec0 = undefined
  rec1 = undefined

  // Very unreliable. This will need adjustments in the future.
  globalThis.gc()
  await after(1)
  globalThis.gc()
  await after(1)

  t.is(bro0.refs.size, 0)
  t.is(bro1.refs.size, 0)

  t.eq(bro0, new ob.Broad())
  t.eq(bro1, new ob.Broad())
})

function testWeakUnexpired(ref, val) {
  t.inst(ref, o.WeakerRef)
  t.is(ref.deref(), val)
  t.no(ref.expired)
}

function testWeakExpired(ref) {
  t.inst(ref, o.WeakerRef)
  t.is(ref.deref(), undefined)
  t.ok(ref.expired)
}

async function shedWait(shed, val) {
  t.eq(shed.ques, [new ob.Que([val])])
  await shed.timer
  t.eq(shed.ques, [new ob.Que()])
}

if (import.meta.main) console.log(`[test] ok!`)
