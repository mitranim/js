/* eslint-disable no-self-assign */
// deno-lint-ignore-file no-self-assign

/*
The test is incomplete and being written gradually.
*/

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ob from '../obs.mjs'

/* Util */

class Track extends l.Emp {
  constructor({tr = 0, de = 0} = {}) {
    super()

    // Counts trigger calls.
    this.tr = l.reqInt(tr)

    // Counts deinit calls.
    this.de = l.reqInt(de)
  }

  trig() {this.tr++}
  deinit() {this.de++}
  toString() {return `new Track({tr: ${this.tr}, de: ${this.de}})`}
}

/* Test */

t.test(function test_isDe() {
  t.no(ob.isDe())
  t.no(ob.isDe({}))

  t.ok(ob.isDe(new Track()))
  t.ok(ob.isDe(Object.create(new Track())))
  t.ok(ob.isDe(Object.assign(deinit, {deinit})))

  function deinit() {}
})

t.test(function test_deinit() {
  ob.deinit()
  ob.deinit({})

  const counter = new Track()
  t.is(ob.deinit(counter), undefined)
  t.eq(counter, new Track({de: 1}))
})

t.test(function test_isObs() {
  t.no(ob.isObs())
  t.no(ob.isObs({}))
  t.no(ob.isObs(new Track()))

  t.ok(ob.isObs({
    sub() {},
    unsub() {},
    trig() {},
    deinit() {},
  }))
})

t.test(function test_isTrig() {
  t.no(ob.isTrig())
  t.no(ob.isTrig({}))
  t.no(ob.isTrig(l.nop))

  t.ok(ob.isTrig(new Track()))
  t.ok(ob.isTrig({trig() {}}))
  t.ok(ob.isTrig(Object.create({trig() {}})))
})

t.test(function test_isSub() {
  t.no(ob.isSub())
  t.no(ob.isSub({}))

  t.ok(ob.isSub(l.nop))
  t.ok(ob.isSub(new Track()))
  t.ok(ob.isSub({trig() {}}))
  t.ok(ob.isSub(Object.create({trig() {}})))
})

t.test(function test_Sched() {
  const sch = new ob.Sched()

  t.test(function test_isPaused_resume_depth_1() {
    t.no(sch.isPaused())

    sch.pause()
    t.ok(sch.isPaused())

    sch.resume()
    t.no(sch.isPaused())

    sch.resume()
    sch.resume()
    sch.resume()
    t.no(sch.isPaused())
  })

  t.test(function test_isPaused_resume_depth_2() {
    t.no(sch.isPaused())

    sch.pause()
    t.ok(sch.isPaused())

    sch.pause()
    t.ok(sch.isPaused())

    sch.resume()
    t.ok(sch.isPaused())

    sch.resume()
    t.no(sch.isPaused())

    sch.resume()
    sch.resume()
    sch.resume()
    t.no(sch.isPaused())
  })

  // Our observables don't actually use this mode.
  // When scheduler is unpaused, they bypass it.
  t.test(function test_unpaused() {
    t.eq(sch, new ob.Sched())

    const track = new Track()
    sch.add(track)

    t.eq(sch, new ob.Sched([track]))
    t.eq(track, new Track())

    sch.run()

    t.eq(sch, new ob.Sched())
    t.eq(track, new Track({tr: 1}))
  })

  t.test(function test_pause_resume() {
    t.eq(sch, new ob.Sched())
    sch.pause()
    sch.pause()
    t.ok(sch.isPaused())

    const track = new Track()
    sch.add(track)

    sch.resume()
    t.eq(sch, new ob.Sched([track]).pause())
    t.eq(track, new Track())

    sch.resume()
    t.eq(sch, new ob.Sched())
    t.eq(track, new Track({tr: 1}))
  })
})

t.test(function test_ImpObs() {
  const obs = new ob.ImpObs()
  const sub0 = new Track()
  const sub1 = new Track()

  t.test(function test_unpaused() {
    obs.sub(sub0)
    t.eq(obs, new ob.ImpObs([sub0]))
    t.eq(sub0, new Track())

    obs.sub(sub0)
    t.eq(obs, new ob.ImpObs([sub0]))

    obs.trig()
    t.eq(obs, new ob.ImpObs([sub0]))
    t.eq(sub0, new Track({tr: 1}))

    obs.add(sub1)
    t.eq(obs, new ob.ImpObs([sub0, sub1]))
    t.eq(sub0, new Track({tr: 1}))
    t.eq(sub1, new Track())

    obs.trig()
    t.eq(obs, new ob.ImpObs([sub0, sub1]))
    t.eq(sub0, new Track({tr: 2}))
    t.eq(sub1, new Track({tr: 1}))
  })

  t.test(function test_paused() {
    const sch = ob.Sched.main
    sch.pause()

    function testPaused() {
      obs.trig()
      t.eq(sub0, new Track({tr: 2}))
      t.eq(sub1, new Track({tr: 1}))
    }

    testPaused()
    testPaused()
    testPaused()

    function testUnpaused() {
      sch.resume()
      t.eq(sub0, new Track({tr: 3}))
      t.eq(sub1, new Track({tr: 2}))
    }

    testUnpaused()
    testUnpaused()
    testUnpaused()
  })

  t.test(function test_deinit() {
    t.is(obs.size, 2)
    obs.deinit()
    t.is(obs.size, 0)

    t.eq(sub0, new Track({tr: 3}))
    t.eq(sub1, new Track({tr: 2}))
  })
})

t.test(function test_de() {
  const ref    = ob.de({})
  const first  = new Track()
  const second = new Track()
  const third  = new Track()

  Object.defineProperty(ref, `nonEnum`, {value: third, enumerable: false})

  ref.val = first
  t.is(ref.val, first)
  t.own(ref, {val: new Track(), nonEnum: third})

  ref.val = ref.val
  t.is(ref.val, first)
  t.own(ref, {val: new Track(), nonEnum: third})

  ref.val = second
  t.is(ref.val, second)
  t.own(ref, {val: new Track(), nonEnum: third})
  t.eq(first, new Track({de: 1}))

  ref.deinit()
  t.is(ref.val, second)
  t.own(ref, {val: new Track({de: 1}), nonEnum: third})

  delete ref.val
  t.is(ref.val, undefined)
  t.is(l.hasOwn(ref, `val`), false)
  t.eq(second, new Track({de: 2}))

  t.is(ref.nonEnum, third)
  t.eq(third, new Track())
})

// The test is rudimentary, maybe about 5% complete.
t.test(function test_obs() {
  t.test(function test_imperative() {
    const ref = ob.obs({})
    const obs = ob.ph(ref).obs
    const first = new Track()
    const second = new Track()

    function firstTrig() {return first.trig()}
    function secondTrig() {return second.trig()}

    obs.sub(firstTrig)
    obs.sub(secondTrig)
    t.eq(first, new Track())
    t.eq(second, new Track())

    obs.trig()
    t.eq(first, new Track({tr: 1}))
    t.eq(second, new Track({tr: 1}))

    // Implicit trigger.
    ref.val = 10
    t.eq(first, new Track({tr: 2}))
    t.eq(second, new Track({tr: 2}))

    // Rudimentary change detection prevents another trigger.
    ref.val = 10
    t.eq(first, new Track({tr: 2}))
    t.eq(second, new Track({tr: 2}))

    obs.unsub(firstTrig)
    t.eq(first, new Track({tr: 2}))
    t.eq(second, new Track({tr: 2}))

    ref.val = 20
    t.eq(first, new Track({tr: 2}))
    t.eq(second, new Track({tr: 3}))

    ref.deinit()
    t.eq(first, new Track({tr: 2}))
    t.eq(second, new Track({tr: 3}))

    obs.trig()
    t.eq(first, new Track({tr: 2}))
    t.eq(second, new Track({tr: 3}))
  })
})

if (import.meta.main) console.log(`[test] ok!`)
