/*
TODO more tests:

  * ob.mut
  * ob.paused
  * ob.deinitAll
  * all classes
*/

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ob from '../obs.mjs'

/* Util */

class Track {
  constructor(tr, de) {
    // Counts trigger calls.
    this.tr = l.onlyInt(tr) ?? 0

    // Counts deinit calls.
    this.de = l.onlyInt(de) ?? 0

    // Bind methods, keeping these properties non-enumerable.
    Object.defineProperty(this, `trig`, {value: this.trig.bind(this)})
    Object.defineProperty(this, `deinit`, {value: this.deinit.bind(this)})
  }

  trig() {this.tr++}
  deinit() {this.de++}
  toString() {return `new Track(${this.tr}, ${this.de})`}
  get [Symbol.toStringTag]() {return this.constructor.name}
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

  t.ok(ob.isTrig({trig() {}}))
  t.ok(ob.isTrig(Object.create({trig() {}})))
})

t.test(function test_isSub() {
  t.no(ob.isSub())
  t.no(ob.isSub({}))

  t.ok(ob.isSub({trig() {}}))
  t.ok(ob.isSub(Object.create({trig() {}})))
  t.ok(ob.isSub(l.nop))
})

t.test(function test_deinit() {
  ob.deinit()
  ob.deinit({})

  const counter = new Track()
  t.is(ob.deinit(counter), undefined)
  t.eq(counter, new Track(0, 1))
})

t.test(function test_de() {
  const ref    = ob.de({})
  const first  = new Track()
  const second = new Track()
  const third  = new Track()

  Object.defineProperty(ref, `hidden`, {value: third, enumerable: false})

  ref.val = first
  t.is(ref.val, first)
  t.eq(ref, {val: new Track(0, 0)})

  // Hide self-assign from linters.
  ref.val = l.id(ref.val)
  t.is(ref.val, first)
  t.eq(ref, {val: new Track(0, 0)})

  ref.val = second
  t.is(ref.val, second)
  t.eq(ref, {val: new Track(0, 0)})
  t.eq(first, new Track(0, 1))

  ref.deinit()
  t.is(ref.val, second)
  t.eq(ref, {val: new Track(0, 1)})

  delete ref.val
  t.is(ref.val, undefined)
  t.is(l.hasOwn(ref, `val`), false)
  t.eq(second, new Track(0, 2))

  t.is(ref.hidden, third)
  t.eq(third, new Track(0, 0))
})

// The test is rudimentary, maybe about 5% complete.
t.test(function test_obs() {
  t.test(function test_imperative() {
    const ref = ob.obs({})
    const obs = ob.ph(ref)
    const first = new Track()
    const second = new Track()

    obs.sub(first.trig)
    obs.sub(second.trig)
    t.eq(first, new Track(0, 0))
    t.eq(second, new Track(0, 0))

    obs.trig()
    t.eq(first, new Track(1, 0))
    t.eq(second, new Track(1, 0))

    // Implicit trigger.
    ref.val = 10
    t.eq(first, new Track(2, 0))
    t.eq(second, new Track(2, 0))

    // Rudimentary change detection prevents another trigger.
    ref.val = 10
    t.eq(first, new Track(2, 0))
    t.eq(second, new Track(2, 0))

    obs.unsub(first.trig)
    t.eq(first, new Track(2, 0))
    t.eq(second, new Track(2, 0))

    ref.val = 20
    t.eq(first, new Track(2, 0))
    t.eq(second, new Track(3, 0))

    ref.deinit()
    t.eq(first, new Track(2, 0))
    t.eq(second, new Track(3, 0))

    obs.trig()
    t.eq(first, new Track(2, 0))
    t.eq(second, new Track(3, 0))
  })
})

if (import.meta.main) console.log(`[test] ok!`)
