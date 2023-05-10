import './internal_test_init.mjs'
import * as l from '../lang.mjs'
import * as t from '../test.mjs'

class ErrUnreachable extends Error {get name() {return this.constructor.name}}

/* Util */

function advanceTime() {
  const start = t.now()
  let cycles = -1
  while (++cycles < 4096) if (t.now() > start) return
  throw Error(`failed to advance time after ${cycles} cycles`)
}

// Tool for tracking call levels.
class Track extends l.Emp {
  constructor() {super().lvl = 0}
  inc() {return this.lvl += 1, this}
  dec() {return this.lvl -= 1, this}
  req(exp) {return t.is(this.lvl, exp), this}
}

const track = new Track()

/* Test */

t.test(function test_test() {
  track.inc().req(1)
  t.test(function test_reject_invalid() {
    t.throws(() => t.test(), TypeError, `expected variant of isFun, got undefined`)
    t.throws(() => t.test(`str`), TypeError, `expected variant of isFun, got "str"`)
    t.throws(() => t.test(l.nop), SyntaxError, `names of test functions must begin with "test"`)

    track.dec().req(0)
  })
  track.req(0)

  track.inc().req(1)
  t.test(function test_test_return() {
    t.is(t.test(function test() {}), undefined)
    t.is(t.test(function test() {return 10}), 10)
    track.dec().req(0)
  })
  track.req(0)

  track.inc().req(1)
  t.test(function test_test_run() {
    const run = t.test(function test() {return arguments[0]})
    l.reqInst(run, t.Run)
    run.reqDone()
    track.dec().req(0)
  })
  track.req(0)

  // Lower-level test for filtering features. See the higher-level test below.
  t.test(function test_Run_allow() {
    const run0 = new t.Run(`run0`)
    const run1 = new t.Run(`run1`, run0)
    const run2 = new t.Run(`run2`, run1)

    t.ok(run0.allow())
    t.ok(run1.allow())
    t.ok(run2.allow())

    t.ok(run0.allow([]))
    t.ok(run1.allow([]))
    t.ok(run2.allow([]))

    t.ok(run0.allow([/run0/]))
    t.ok(run1.allow([/run0/]))
    t.ok(run2.allow([/run0/]))

    t.no(run0.allow([/run_none/]))
    t.no(run1.allow([/run_none/]))
    t.no(run2.allow([/run_none/]))

    t.ok(run0.allow([/run0/, /run1/]))
    t.ok(run1.allow([/run0/, /run1/]))
    t.ok(run2.allow([/run0/, /run1/]))

    t.no(run0.allow([/run_none/, /run1/]))
    t.no(run1.allow([/run_none/, /run1/]))
    t.no(run2.allow([/run_none/, /run1/]))

    t.ok(run0.allow([/run0/, /run2/]))
    t.no(run1.allow([/run0/, /run2/]))
    t.no(run2.allow([/run0/, /run2/]))

    t.ok(run0.allow([/run0/, /run1/, /run2/]))
    t.ok(run1.allow([/run0/, /run1/, /run2/]))
    t.ok(run2.allow([/run0/, /run1/, /run2/]))

    t.ok(run0.allow([/run0/, /run1/, /run2/]))
    t.no(run1.allow([/run0/, /run_none/, /run2/]))
    t.no(run2.allow([/run0/, /run_none/, /run2/]))

    t.no(run0.allow([/run_none/, /run1/, /run2/]))
    t.no(run1.allow([/run_none/, /run1/, /run2/]))
    t.no(run2.allow([/run_none/, /run1/, /run2/]))

    t.ok(run0.allow([/run0/, /run1/, /run2/, /run3/]))
    t.ok(run1.allow([/run0/, /run1/, /run2/, /run3/]))
    t.ok(run2.allow([/run0/, /run1/, /run2/, /run3/]))
  })

  track.inc().req(1)
  t.test(function test_filtering() {
    t.conf.setTestFilter(`---`)
    t.test(function test_failing() {throw new ErrUnreachable(`unreachable`)})
    t.conf.setTestFilter()

    t.conf.setTestFilter(`test_test/test_filtering`)
    track.inc().req(2)
    t.test(function test_normal() {track.dec().req(1)})
    track.req(1)
    t.conf.setTestFilter()

    t.conf.setTestFilter(`test_test/test_filtering/test_normal`)
    track.inc().req(2)
    t.test(function test_normal() {track.dec().req(1)})
    track.req(1)
    t.conf.setTestFilter()

    track.dec().req(0)
  })
  track.req(0)
})

// Needs a much more comprehensive test.
t.test(function test_equal() {
  t.no(t.equal(NaN, undefined))
  t.ok(t.equal(NaN, NaN))

  t.no(t.equal(10, `10`))
  t.ok(t.equal(10, 10))

  t.no(t.equal(new Boolean(false), new Boolean(true)))
  t.ok(t.equal(new Boolean(false), new Boolean(false)))
  t.ok(t.equal(new Boolean(true), new Boolean(true)))

  t.no(t.equal(new Number(10), new Number(20)))
  t.no(t.equal(new Number(10), new Number(NaN)))
  t.ok(t.equal(new Number(0), new Number(0)))
  t.ok(t.equal(new Number(10), new Number(10)))
  t.ok(t.equal(new Number(NaN), new Number(NaN)))

  t.no(t.equal(new String(`one`), new String(`two`)))
  t.ok(t.equal(new String(), new String()))
  t.ok(t.equal(new String(`one`), new String(`one`)))

  t.no(t.equal([10], [20]))
  t.no(t.equal([10, 20], [20, 10]))
  t.no(t.equal([10, 20], [10, 20, 30]))
  t.no(t.equal([10, 20, 30], [10, 20]))
  t.ok(t.equal([], []))
  t.ok(t.equal([10, 20], [10, 20]))
  t.ok(t.equal([10, 20, NaN, 40], [10, 20, NaN, 40]))

  t.no(t.equal({one: 10}, {one: 20}))
  t.no(t.equal({one: 10}, {one: 10, two: 20}))
  t.no(t.equal({one: 10, two: 20}, {one: 10}))
  t.no(t.equal({one: 10, two: 20}, {two: 20}))
  t.ok(t.equal({one: 10}, {one: 10}))
  t.ok(t.equal({one: 10, two: 20}, {one: 10, two: 20}))

  t.no(t.equal(new Set().add(10), new Set()))
  t.no(t.equal(new Set(), new Set().add(10)))
  t.ok(t.equal(new Set(), new Set()))
  t.ok(t.equal(new Set([10, 20, 30]), new Set([20, 30, 10])))

  t.no(t.equal(new Map().set(10, 20), new Map()))
  t.no(t.equal(new Map(), new Map().set(10, 20)))
  t.ok(t.equal(new Map(), new Map()))
  t.ok(t.equal(new Map().set(10, 20).set(30, 40), new Map().set(30, 40).set(10, 20)))

  t.no(t.equal(new Date(1023), new Date(1024)))
  t.ok(t.equal(new Date(1024), new Date(1024)))

  t.no(t.equal(new URL(`https://example.com`), new URL(`https://example.comm`)))
  t.ok(t.equal(new URL(`https://example.com`), new URL(`https://example.com`)))

  t.no(t.equal(new Request(`one://two.three`), new Request(`two://three.four`)))
  t.no(t.equal(new Request(`one://two.three`, {method: `GET`}), new Request(`one://two.three`, {method: `POST`})))
  t.ok(t.equal(new Request(`one://two.three`), new Request(`one://two.three`)))
  t.ok(t.equal(new Request(`one://two.three`, {method: `GET`}), new Request(`one://two.three`, {method: `GET`})))
  t.ok(t.equal(new Request(`one://two.three`, {method: `POST`}), new Request(`one://two.three`, {method: `POST`})))
  t.ok(t.equal(new Request(`one://two.three`, {method: `POST`, body: `one`}), new Request(`one://two.three`, {method: `POST`, body: `one`})))

  // Wasn't implemented because reading streams requires awaiting,
  // and `test.mjs` didn't support async. Now it does, so let's fix this.
  //
  // t.no(t.equal(new Request(`one://two.three`, {method: `POST`, body: `one`}), new Request(`one://two.three`, {method: `POST`, body: `two`})))
})

t.test(function test_now() {advanceTime()})

t.test(function test_Run() {
  t.test(function test_reject_invalid() {
    t.throws(() => new t.Run(), TypeError, `expected variant of isStr, got undefined`)
    t.throws(() => new t.Run(`name`, `str`), TypeError, `expected instance of Run, got "str"`)
  })

  t.test(function test_level() {
    const top = new t.Run(`top`)
    t.is(top.parent, undefined)
    t.is(top.name, `top`)
    t.is(top.level(), 0)

    const mid = new t.Run(`mid`, top)
    t.is(mid.parent, top)
    t.is(mid.name, `mid`)
    t.is(mid.level(), 1)

    const low = new t.Run(`low`, mid)
    t.is(low.parent, mid)
    t.is(low.name, `low`)
    t.is(low.level(), 2)
  })

  t.test(function test_nameFull() {
    const top = new t.Run(`top`)
    const mid = new t.Run(`mid`, top)
    const low = new t.Run(`low`, mid)

    t.is(top.nameFull(), `top`)
    t.is(mid.nameFull(), `top/mid`)
    t.is(low.nameFull(), `top/mid/low`)
  })

  t.test(function test_normal() {
    const run = new t.Run(`name`)

    t.is(run.parent, undefined)
    t.is(run.name, `name`)
    t.is(run.start, NaN)
    t.is(run.end, NaN)
    t.is(run.runs, 0)
    t.is(run.level(), 0)
    t.is(run.time(), NaN)
    t.is(run.avg, NaN)
    t.is(run.elapsed(), NaN)

    run.start = t.now()
    advanceTime()
    l.reqFinPos(run.elapsed())
    t.is(run.time(), NaN)

    t.throws(() => run.done(`str`), TypeError, `expected variant of isFinPos, got "str"`)
    t.throws(() => run.done(1, `str`), TypeError, `expected variant of isIntPos, got "str"`)
    run.done(t.now(), 17)

    l.reqFinPos(run.start)
    l.reqFinPos(run.end)
    t.ok(run.end >= run.start)
    t.is(run.runs, 17)
    l.reqFinPos(run.elapsed())
    l.reqFinPos(run.time())
    t.is(run.time(), run.elapsed())
    l.reqFinPos(run.avg)
    t.is(run.avg, run.time() / run.runs)
  })
})

t.test(function test_TimeRunner() {
  // For faster testing.
  const defaultSize = t.TimeRunner.defaultWarmupSize
  t.TimeRunner.defaultWarmupSize = 1

  try {
    t.throws(() => new t.TimeRunner(`str`), TypeError, `expected variant of isFinPos, got "str"`)
    t.is(new t.TimeRunner(123).valueOf(), 123)

    const interval = 8
    const runner = new t.TimeRunner(interval)
    t.is(runner.valueOf(), interval)

    const run = new t.Run(`name`)
    runner.run(advanceTime, run)

    l.reqFinPos(run.end)
    l.reqFinPos(run.runs)
    l.reqFinPos(run.time())

    t.ok(run.time() > runner.valueOf())
    t.ok(run.time() < (runner.valueOf() * 2))

    t.ok(run.avg > 0)
    t.ok(run.avg < (run.time() / run.runs))
  }
  finally {
    t.TimeRunner.defaultWarmupSize = defaultSize
  }
})

t.test(function test_CountRunner() {
  /*
  Use fewer cycles for faster testing, but still enough for a positive time
  delta. In envs with better timer precision, a handful of cycles is enough. In
  envs with worse precision, such as browsers, the number is much larger and
  may vary. This needs a better solution.
  */
  const defaultSize = t.CountRunner.defaultWarmupSize
  t.CountRunner.defaultWarmupSize = 16384

  try {
    t.throws(() => new t.CountRunner(`str`), TypeError, `expected variant of isIntPos, got "str"`)
    t.throws(() => new t.CountRunner(0), TypeError, `expected variant of isIntPos, got 0`)

    const runner = new t.CountRunner(17)
    t.is(runner.valueOf(), 17)

    const run = new t.Run(`name`)
    runner.run(advanceTime, run)

    l.reqFinPos(run.start)
    l.reqFinPos(run.end)
    l.reqFinPos(run.runs)
    l.reqFinPos(run.time())
    t.is(run.runs, runner.valueOf())

    t.ok(run.avg > 0)
    t.ok(run.avg < (run.time() / run.runs))
  }
  finally {
    t.CountRunner.defaultWarmupSize = defaultSize
  }
})

t.test(function test_string_length() {
  /*
  These character sets tend to have consistent 1-1 relation between UTF-16 code
  points, Unicode code points, and rendering width. When using a monospace
  font, we can predict and allocate precisely the right width.
  */
  t.test(function test_normal() {
    t.is(`abcdef`.length, 6)
    t.is(`αβγδεζ`.length, 6)
    t.is(`äḅĉḏèḟ`.length, 6)
    t.is(`абвгде`.length, 6)
    t.is(`абвгде`.length, 6)
  })

  /*
  These character sets require more pixels per character on display. Unclear if
  the width is consistent between environments such as different terminals on
  different operating systems, and whether we can predict and allocate the
  required width.
  */
  t.test(function test_wide() {
    t.is(`䶵龞龘`.length, 3)
    t.is(`あいう`.length, 3)
  })

  /*
  These character sets don't have a 1-1 relation between UTF-16 and Unicode.
  We COULD count Unicode code points, but these characters may also be wide.
  See the comment on `test_wide`.
  */
  t.test(function test_surrogate() {
    t.is(`🙂😁😛`.length, 6)
  })
})

t.test(function test_StringReporter() {
  t.test(function test_without_cols() {
    const rep = t.StringReporter.default()

    t.is(rep.str(``, ``), ``)
    t.is(rep.str(`one`, ``), `one`)
    t.is(rep.str(``, `two`), `two`)
    t.is(rep.str(`one`, `two`), `one two`)

    t.is(rep.runPrefix(new t.Run(`top`)), `[top]`)
    t.is(rep.runPrefix(new t.Run(`mid`, new t.Run(`top`))), `··[mid]`)
    t.is(rep.runPrefix(new t.Run(`low`, new t.Run(`mid`, new t.Run(`top`)))), `····[low]`)
  })

  t.test(function test_with_cols() {
    const rep = class Rep extends t.StringReporter {cols() {return 12}}.default()

    t.is(rep.str(``, ``), ``)
    t.is(rep.str(`one`, ``), `one`)
    t.is(rep.str(``, `two`), `two`)

    t.is(rep.str(`one`, `two`), `one ···· two`)
    t.is(`one ···· two`.length, rep.cols())

    t.is(rep.str(`three`, `four`), `three · four`)
    t.is(`three · four`.length, rep.cols())

    t.is(rep.str(`seven`, `eight`), `seven eight`)
    t.is(`seven eight`.length, 11)
  })
})

if (import.meta.main) console.log(`[test] ok!`)
