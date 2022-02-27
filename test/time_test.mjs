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
function freeze(val) {return i.each(val, freeze), Object.freeze(val)}

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
  t.test(function test_decoding_valid() {testDurResetFromStr(ti.dur)})
  t.test(function test_reset_from_str() {testDurReset(testDurResetFromStr)})

  t.test(function test_from_struct() {testDurResetFromStruct(ti.dur)})
  t.test(function test_reset_from_struct() {testDurReset(testDurResetFromStruct)})

  t.test(function test_from_dur() {
    testDurResetFromStruct(function make(src) {return ti.dur(ti.dur(src))})
  })

  t.test(function test_reset_from_dur() {
    testDurResetFromStruct(function make(src) {return ti.dur().reset(ti.dur(src))})
    testDurResetFromStruct(function make(src) {return ti.dur(src).reset(ti.dur(src))})
  })

  t.test(function test_mut() {
    t.throws(() => ti.dur().mut({years: `10`}), TypeError, `expected variant of isInt, got "10"`)

    function test(ref, inp, exp) {
      t.is(ref.mut(inp), ref)
      t.eq(ref, exp)
    }

    test(ti.dur(), undefined, ti.dur())
    test(ti.dur(), {months: 20}, ti.dur({months: 20}))
    test(ti.dur({years: 10}), {months: 20}, ti.dur({years: 10, months: 20}))
    test(ti.dur({years: 10}), {years: 20, months: 30}, ti.dur({years: 20, months: 30}))
    test(ti.dur({years: 10}), {years: undefined}, ti.dur())
    test(ti.dur({years: 10, months: 20}), {years: undefined}, ti.dur({months: 20}))

    for (const val of durNonZeros) {
      test(ti.dur(), val, ti.dur(val))
    }

    for (const outer of durNonZeros) {
      for (const inner of durNonZeros) {
        test(ti.dur(outer), inner, ti.dur({...outer, ...inner}))
      }
    }
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

function testDurReset(fun) {
  fun(function make(src) {return ti.dur().reset(src)})
  fun(function make(src) {return ti.dur(src).reset(src)})

  for (const val of durNonZeros) {
    fun(function make(src) {return ti.dur(val).reset(src)})
  }
}

function testDurResetFromStr(make) {
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

function testDurResetFromStruct(make) {
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

t.test(function test_DateShort() {
  testDateShortString(ti.DateShort)

  t.test(function test_toJSON() {
    function test(src, exp) {
      t.is(JSON.stringify(new ti.DateShort(src)), JSON.stringify(exp))
    }

    test(`0001-01-01`, `0001-01-01T00:00:00.000Z`)
    test(`1234-05-06`, `1234-05-06T00:00:00.000Z`)
    test(`2345-01-23T07:53:21.000Z`, `2345-01-23T07:53:21.000Z`)
  })
})

t.test(function test_DateShortJson() {
  testDateShortString(ti.DateShortJson)

  t.test(function test_toJSON() {
    testDateShort(function test(src, exp) {
      t.is(JSON.stringify(new ti.DateShortJson(src)), JSON.stringify(exp))
    })
  })
})

function testDateShortString(cls) {
  testDateShort(function test(src, exp) {
    t.is(new cls(src).toString(), exp)
  })
}

function testDateShort(test) {
  test(`0001-01-01`, `0001-01-01`)
  test(`1234-05-06`, `1234-05-06`)
  test(`12345-06-07`, `12345-06-07`)
  test(`123456-07-08`, `123456-07-08`)
  test(`2345-01-23T07:53:21.000Z`, `2345-01-23`)
}

t.test(function test_Pico() {
  const val = new ti.Pico(1_234_567_890_123)

  t.is(val.pico(), 1_234_567_890_123)
  t.is(val.nano(), 1_234_567_890.123)
  t.is(val.micro(), 1_234_567.890_123)
  t.is(val.milli(), 1_234.567_890_123)
  t.is(val.sec(), 1.234_567_890_123)

  t.is(val.picoStr(), `1234567890123 ps`)
  t.is(val.nanoStr(), `1234567890.123 ns`)
  t.is(val.microStr(), `1234567.890123 µs`)
  t.is(val.milliStr(), `1234.567890123 ms`)
  t.is(val.secStr(), `1.234567890123 s`)

  t.is(val.toString(), val.picoStr())
})

t.test(function test_Nano() {
  const val = new ti.Nano(1_234_567_890_123)

  t.is(val.pico(), 1_234_567_890_123_000)
  t.is(val.nano(), 1_234_567_890_123)
  t.is(val.micro(), 1_234_567_890.123)
  t.is(val.milli(), 1_234_567.890_123)
  t.is(val.sec(), 1_234.567_890_123)

  t.is(val.picoStr(), `1234567890123000 ps`)
  t.is(val.nanoStr(), `1234567890123 ns`)
  t.is(val.microStr(), `1234567890.123 µs`)
  t.is(val.milliStr(), `1234567.890123 ms`)
  t.is(val.secStr(), `1234.567890123 s`)

  t.is(val.toString(), val.nanoStr())
})

t.test(function test_Micro() {
  const val = new ti.Micro(1_234_567_890_123)

  t.is(val.pico(), 1_234_567_890_123_000_000)
  t.is(val.nano(), 1_234_567_890_123_000)
  t.is(val.micro(), 1_234_567_890_123)
  t.is(val.milli(), 1_234_567_890.123)
  t.is(val.sec(), 1_234_567.890_123)

  t.is(val.picoStr(), `1234567890123000000 ps`)
  t.is(val.nanoStr(), `1234567890123000 ns`)
  t.is(val.microStr(), `1234567890123 µs`)
  t.is(val.milliStr(), `1234567890.123 ms`)
  t.is(val.secStr(), `1234567.890123 s`)

  t.is(val.toString(), val.microStr())
})

t.test(function test_Milli() {
  const val = new ti.Milli(1_234_567_890_123)

  t.is(val.pico(), 1_234_567_890_123_000_000_000)
  t.is(val.nano(), 1_234_567_890_123_000_000)
  t.is(val.micro(), 1_234_567_890_123_000)
  t.is(val.milli(), 1_234_567_890_123)
  t.is(val.sec(), 1_234_567_890.123)

  t.is(val.picoStr(), `1234567890123000000000 ps`)
  t.is(val.nanoStr(), `1234567890123000000 ns`)
  t.is(val.microStr(), `1234567890123000 µs`)
  t.is(val.milliStr(), `1234567890123 ms`)
  t.is(val.secStr(), `1234567890.123 s`)

  t.is(val.toString(), val.milliStr())
})

t.test(function test_Sec() {
  const val = new ti.Sec(1_234_567_890_123)

  t.is(val.pico(), 1_234_567_890_123_000_000_000_000)
  t.is(val.nano(), 1_234_567_890_123_000_000_000)
  t.is(val.micro(), 1_234_567_890_123_000_000)
  t.is(val.milli(), 1_234_567_890_123_000)
  t.is(val.sec(), 1_234_567_890_123)

  t.is(val.minute(), val.sec() / 60)
  t.is(val.hour(), val.sec() / (60 * 60))

  t.is(val.picoStr(), `1234567890123000000000000 ps`)
  t.is(val.nanoStr(), `1234567890123000000000 ns`)
  t.is(val.microStr(), `1234567890123000000 µs`)
  t.is(val.milliStr(), `1234567890123000 ms`)
  t.is(val.secStr(), `1234567890123 s`)

  t.is(val.toString(), val.secStr())

  t.test(function test_dur() {
    t.eq(
      new ti.Sec(0).dur(),
      new ti.Dur(),
    )

    t.eq(
      val.dur(),
      new ti.Dur().setHours(342935525).setMinutes(2).setSeconds(3),
    )

    t.eq(
      new ti.Sec(-val).dur(),
      new ti.Dur().setHours(-342935525).setMinutes(-2).setSeconds(-3),
    )
  })
})

if (import.meta.main) console.log(`[test] ok!`)
