import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'
import * as ti from '../time.mjs'

/* Util */

const durEmpty = freeze({years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0})

const durNonZeros = freeze([
  {years: 10},
  {months: 20},
  {days: 30},
  {hours: 40},
  {minutes: 50},
  {seconds: 60},
])

/*
Not part of the public API because premature freezing can lead to pointlessly
restrictive APIs, and traversing data structures to freeze them is a massive
waste of performance. We encourage assertions, but this is much more
restrictive and expensive. It should be done in tests only.
*/
function freeze(val) {
  if (l.isComp(val)) i.each(Object.freeze(val), freeze)
  return val
}

/* Test */

// Incomplete, needs A LOT more tests.
t.test(function test_Dur() {
  t.test(function test_decoding_invalid() {
    function test(src) {
      t.throws(() => ti.dur(src), SyntaxError, `unable to convert ${l.show(src)} to ${ti.Dur.name}`)
    }

    test(`1Y`)
    test(`1H`)
    test(`T1H`)
    test(`P0`)
    test(`PT0`)
    test(`P-`)
    test(`P-0`)
    test(`P-1`)
    test(`PT-`)
    test(`PT-0`)
    test(`PT-1`)
    test(`P1Y-`)
    test(`P1Y-0`)
    test(`P1Y-1`)
    test(`P1YT-`)
    test(`P1YT-0`)
    test(`P1YT-1`)
    test(`P--0Y`)
    test(`PT--0H`)
    test(`P+0Y`)
    test(`PT+0H`)
    test(`BLAH`)
  })

  // TODO consider porting bigger test from `github.com/mitranim/gt`.
  t.test(function test_decoding_valid() {testDurMutStr(ti.dur)})
  t.test(function test_mut_str() {testDurMut(testDurMutStr)})

  t.test(function test_from_struct() {testDurMutStruct(ti.dur)})
  t.test(function test_mut_struct() {testDurMut(testDurMutStruct)})

  t.test(function test_from_dur() {
    testDurMutStruct(function make(src) {return ti.dur(ti.dur(src))})
  })

  t.test(function test_mut_dur() {
    testDurMutStruct(function make(src) {return ti.dur().mut(ti.dur(src))})
    testDurMutStruct(function make(src) {return ti.dur(src).mut(ti.dur(src))})
  })

  t.test(function test_isZero() {
    function zero(src) {t.ok(ti.dur(src).isZero())}
    function full(src) {t.no(ti.dur(src).isZero())}

    zero()
    zero(``)
    zero(`PT0S`)
    zero({})
    zero(durEmpty)

    full(`P1Y2M3DT4H5M6S`)
    durNonZeros.forEach(full)
  })

  t.test(function test_toJSON() {
    function test(src, exp) {t.is(ti.dur(src).toJSON(), exp)}
    function none(src) {test(src, null)}

    none()
    none(``)
    none(`PT0S`)
    none({})

    test(`P1Y2M3DT4H5M6S`, `P1Y2M3DT4H5M6S`)
  })
})

function testDurMut(fun) {
  fun(function make(src) {return ti.dur().mut(src)})
  fun(function make(src) {return ti.dur(src).mut(src)})

  for (const val of durNonZeros) {
    fun(function make(src) {return ti.dur(val).mut(src)})
  }
}

function testDurMutStr(make) {
  function test(src, str, fields) {
    t.is(make(src).toString(), str)
    t.eq({...make(src)}, fields)
  }

  test(``, `PT0S`, durEmpty)
  test(`PT0S`, `PT0S`, durEmpty)

  test(
    `P1Y2M3DT4H5M6S`,
    `P1Y2M3DT4H5M6S`,
    {years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6},
  )

  test(
    `P-1Y-2M-3DT-4H-5M-6S`,
    `P-1Y-2M-3DT-4H-5M-6S`,
    {years: -1, months: -2, days: -3, hours: -4, minutes: -5, seconds: -6},
  )

  test(
    `P5678Y11M23DT13H53M37S`,
    `P5678Y11M23DT13H53M37S`,
    {years: 5678, months: 11, days: 23, hours: 13, minutes: 53, seconds: 37},
  )

  test(
    `P-5678Y-11M-23DT-13H-53M-37S`,
    `P-5678Y-11M-23DT-13H-53M-37S`,
    {years: -5678, months: -11, days: -23, hours: -13, minutes: -53, seconds: -37},
  )
}

function testDurMutStruct(make) {
  t.throws(() => make({years: `10`}), TypeError, `expected variant of isInt, got "10"`)
  t.throws(() => make({months: `10`}), TypeError, `expected variant of isInt, got "10"`)
  t.throws(() => make({days: `10`}), TypeError, `expected variant of isInt, got "10"`)
  t.throws(() => make({hours: `10`}), TypeError, `expected variant of isInt, got "10"`)
  t.throws(() => make({minutes: `10`}), TypeError, `expected variant of isInt, got "10"`)
  t.throws(() => make({seconds: `10`}), TypeError, `expected variant of isInt, got "10"`)

  function test(src) {t.eq({...make(src)}, {...durEmpty, ...src})}

  test({})
  test({years: 10, months: 20})
  durNonZeros.forEach(test)
}

if (import.meta.main) console.log(`[test] ok!`)
