import * as l from './lang.mjs'
import * as c from './cli.mjs'

/*
Base error class used by this module. Allows to differentiate errors generated
by test utils from errors generated by functions being tested.
*/
export class AssertError extends Error {
  get name() {return this.constructor.name}
}

export class InternalError extends AssertError {}

/*
Describes a single test or benchmark run. All runs must have names. We recommend
using unique names but don't enforce uniqueness. Tests receive `Run` as an
input, and may use it for introspection, for example to test timing.

Leaves generation of timestamps and calculation of averages up to runners.
This makes it possible to implement runners that use different performance
APIs such as standard `performance.now` vs Node `process.hrtime`, or fudge
the averages.
*/
export class Run extends l.Emp {
  constructor(name, parent) {
    if (!l.reqStr(name)) throw new SyntaxError(`missing run name`)
    super()
    this.name = name
    this.parent = l.optInst(parent, Run)
  }

  #runs = 0
  get runs() {return this.#runs}
  set runs(val) {this.#runs = l.reqIntPos(val)}

  #start = NaN
  get start() {return this.#start}
  set start(val) {this.#start = l.reqFinPos(val)}

  #end = NaN
  get end() {return this.#end}
  set end(val) {this.#end = l.reqFinPos(val)}

  #avg = NaN
  get avg() {return this.#avg}
  set avg(val) {this.#avg = l.reqFin(val)}

  level() {return (this.parent?.level() + 1) | 0}
  time() {return this.end - this.start}
  elapsed() {return (l.onlyFin(this.end) ?? now()) - this.start}

  done(end, runs) {
    this.end = end
    this.runs = runs
    this.avg = this.time() / this.runs
  }

  reset() {
    this.#runs = 0
    this.#start = NaN
    this.#end = NaN
    this.#avg = NaN
  }

  reqDone() {
    const {name, runs, end, avg} = this
    if (!l.isIntPos(runs)) {
      throw new InternalError(`internal error: expected run ${l.show(name)} to have at least 1 run, got ${l.show(runs)} runs`)
    }
    if (!l.isFinPos(end)) {
      throw new InternalError(`internal error: expected run ${l.show(name)} to have an end time, found ${l.show(end)}`)
    }
    if (!l.isFin(avg)) {
      throw new InternalError(`internal error: expected run ${l.show(name)} to have an average time, found ${l.show(avg)}`)
    }
  }

  nameFull() {
    const {name, parent} = this
    return parent ? `${parent.nameFull()}/${name}` : name
  }
}

export class FinRunner extends Number {
  constructor(val) {super(l.reqFin(val))}
  run() {throw new AssertError(`must be implemented in subclass`)}

  static default() {return new this(this.defaultSize)}
  static defaultSize = 0

  static defaultWarmup() {return new this(this.defaultWarmupSize)}
  static defaultWarmupSize = 1

  static warmup() {
    /*
    Note: subclasses require their own warmup and thus their own property. A
    regular static property would be automatically shared between super- and
    sub-classes. We must get and set it on each class separately.

    Reentrant calls are allowed, as nops, because this method is called by
    runner instances DURING the warmup.
    */
    if (l.hasOwn(this, `warm`)) return
    this.warm = false

    // Must pass different functions for deoptimization.
    this.defaultWarmup().run(function warmup0() {}, new Run(`warmup_${this.name}_0`))
    this.defaultWarmup().run(function warmup1() {}, new Run(`warmup_${this.name}_1`))
    this.defaultWarmup().run(function warmup2() {}, new Run(`warmup_${this.name}_2`))
    this.defaultWarmup().run(function warmup3() {}, new Run(`warmup_${this.name}_3`))

    this.nowAvg = l.req(nowAvg(), l.isFinPos)

    const run = new Run(`overhead_${this.name}`)
    this.defaultWarmup().run(function overhead() {}, run)
    this.overhead = l.req(run.avg, l.isFinPos)

    this.warm = true
    conf.verbLog(`[warmup] warmed up ${this.name}`)
  }

  static getOverhead() {return l.hasOwn(this, `overhead`) ? this.overhead : 0}
  static getNowAvg() {return l.hasOwn(this, `nowAvg`) ? this.nowAvg : nowAvg(1024)}
}

/*
Runs a benchmark for N amount of runs, recording the timing. Passes the current
run to the given benchmark function.
*/
export class CountRunner extends FinRunner {
  constructor(runs) {super(l.reqIntPos(runs))}

  run(fun, run) {
    this.constructor.warmup()
    const nowAvg = this.constructor.getNowAvg()
    let runs = 0
    const thresh = this.valueOf()

    const start = run.start = now()
    do {fun()} while (++runs < thresh)
    const end = run.end = now()

    run.runs = runs
    run.avg = ((end - start - nowAvg) / runs) - this.constructor.getOverhead()

    conf.verbLog(`[${run.name}] runs: ${runs}, runtime: ${tsMilli(end - start)}, nowAvg: ${tsNano(nowAvg)} avg: ${tsNano(run.avg)}`)
  }

  static defaultSize = 1024
  static defaultWarmupSize = 2 << 24
}

/*
Runs a benchmark for approximately N amount of milliseconds (no more than twice
that amount), recording the number of runs and the timing. Passes the current
run to the given benchmark function.
*/
export class TimeRunner extends FinRunner {
  constructor(ms) {super(l.reqFinPos(ms))}

  /*
  Performance cost distribution should be:

    * Calls to the function we're benchmarking: dominant.
    * Calls to `now`: amortized through batching.
    * Everything else: excluded from timing.

  Despite the optimization and amortization, this machinery has measurable
  overhead. To improve precision, we measure the overhead of measurement and
  subtract it from measurements. An empty benchmark should clock at ±0.
  */
  run(fun, run) {
    this.constructor.warmup()

    const nowAvg = this.constructor.getNowAvg()
    let runs = 0
    let nows = 0
    let end = undefined
    let batch = 1
    const start = run.start = now()
    const timeThresh = start + this.valueOf()

    do {
      let rem = batch
      do {runs++, fun()} while (rem-- > 0)

      batch *= 2
      nows++
      end = now()
    }
    while (end < timeThresh)

    run.end = now()
    run.runs = runs
    run.avg = ((end - start - (nowAvg * nows)) / runs) - this.constructor.getOverhead()

    conf.verbLog(`[${run.name}] runs: ${runs}, nows: ${nows}, runtime: ${tsMilli(end - start)}, nowAvg: ${tsNano(nowAvg)} avg: ${tsNano(run.avg)}`)
  }

  static defaultSize = 128
  static defaultWarmupSize = 128
}

export class DeoptRunner extends CountRunner {
  constructor() {super(1)}
  static getNowAvg() {return 0}
  static warmup() {}
}

/*
Base class for reporters that use strings, as opposed to reporters that render
DOM nodes or ring bells. Has no side effects. Reporting methods are nops.
*/
export class StringReporter extends l.Emp {
  constructor(pad) {super().pad = l.reqStr(pad)}

  // Nop implementation of `isReporter`.
  reportStart(run) {l.reqInst(run, Run)}
  reportEnd(run) {l.reqInst(run, Run)}

  cols() {return 0}

  str(pref, suff) {
    l.reqStr(pref)
    l.reqStr(suff)

    if (!suff) return pref
    if (!pref) return suff

    const space = ` `

    // Semi-placeholder. See comments on `test_string_length`.
    const infix = this.pad.repeat(pos(
      this.cols() - pref.length - (space.length * 2) - suff.length,
    ))

    return pref + space + infix + (infix && space) + suff
  }

  runPref(run) {
    l.reqInst(run, Run)
    return this.pad.repeat(run.level() * 2) + `[${run.name}]`
  }

  static default() {return new this(`·`)}
}

/*
Base class used by specialized console reporters such as `ConsoleOkReporter`.
Has utility methods for console printing, but its `isReporter` methods are
still nops.
*/
export class ConsoleReporter extends StringReporter {
  cols() {return c.consoleCols()}
  report(pref, suff) {this.log(this.str(pref, suff))}
  log() {console.log(...arguments)}
  err() {console.error(...arguments)}
}

/*
Reports runs by printing name and success message.
TODO implement an alternative DOM reporter that renders a table.
*/
export class ConsoleOkReporter extends ConsoleReporter {
  reportEnd(run) {
    l.reqInst(run, Run)
    this.report(this.runPref(run), `ok`)
  }
}

// Reports runs by printing name and average time.
export class ConsoleAvgReporter extends ConsoleReporter {
  constructor(pad, fun) {
    super(pad)
    this.fun = l.reqFun(fun)
  }

  reportEnd(run) {
    l.reqInst(run, Run)
    const {fun} = this
    this.report(this.runPref(run), l.req(fun(run.avg), l.isStr))
  }

  static default() {return this.with(tsNano)}
  static with(fun) {return new this(`·`, fun)}
}

// Reports runs by printing name and amount of runs.
export class ConsoleRunsReporter extends ConsoleReporter {
  reportEnd(run) {
    l.reqInst(run, Run)
    this.report(this.runPref(run), String(run.runs))
  }
}

/*
Reports benchmark runs by printing name, amount of runs, average timing.
TODO accumulate results, printing a table on `.flush`.
TODO variant that re-prints a table on the fly, clearing the terminal each time.
TODO alternative DOM reporter that renders a table.
*/
export class ConsoleBenchReporter extends ConsoleAvgReporter {
  reportEnd(run) {
    l.reqInst(run, Run)
    const {fun} = this
    this.report(this.runPref(run), `x${run.runs} ${l.req(fun(run.avg), l.isStr)}`)
  }
}

// TODO consider using utils from `time.mjs`.
export function tsMilli(val) {return `${(l.reqFin(val)).toFixed(6)} ms`}
export function tsMicro(val) {return `${(l.reqFin(val) * 1000).toFixed(3)} µs`}
export function tsNano(val) {return `${(l.reqFin(val) * 1_000_000).toFixed(0)} ns`}
export function tsPico(val) {return `${(l.reqFin(val) * 1_000_000_000).toFixed(0)} ps`}

// Global config and global state.
export const conf = new class Conf extends l.Emp {
  #testFilter = /(?:)/
  get testFilter() {return this.#testFilter}
  set testFilter(val) {this.#testFilter = l.reqReg(val)}

  #benchFilter = /(?:)/
  get benchFilter() {return this.#benchFilter}
  set benchFilter(val) {this.#benchFilter = l.reqReg(val)}

  #benchRunner = TimeRunner.default()
  get benchRunner() {return this.#benchRunner}
  set benchRunner(val) {this.#benchRunner = l.req(val, isRunner)}

  #testRep = undefined
  get testRep() {return this.#testRep}
  set testRep(val) {this.#testRep = l.opt(val, isReporter)}

  #benchRep = ConsoleAvgReporter.default()
  get benchRep() {return this.#benchRep}
  set benchRep(val) {this.#benchRep = l.opt(val, isReporter)}

  #run = undefined
  get run() {return this.#run}
  set run(val) {this.#run = l.optInst(val, Run)}

  #benches = new Set()
  get benches() {return this.#benches}
  set benches(val) {this.#benches = l.reqSet(val)}

  #verb = false
  get verb() {return this.#verb}
  set verb(val) {this.#verb = l.reqBool(val)}

  testAllow(run) {
    return this.testFilter.test(run.nameFull())
  }

  benchAllow(name) {
    return this.benchFilter.test(l.reqStr(name))
  }

  testFilterFrom(val) {
    this.testFilter = toReg(val)
    return this
  }

  benchFilterFrom(val) {
    this.benchFilter = toReg(val)
    return this
  }

  isTop() {return !this.run}
  verbLog(...val) {if (this.verb) console.log(...val)}
  verbErr(...val) {if (this.verb) console.error(...val)}
}()

/*
Runs a named test function. May skip depending on `conf.testFilter`. Uses
optional `conf.testRep` to report start and end of the test. Records test
timing, which may be used by the reporter. Passes the current `Run` to the test
function.
*/
export function test(fun) {
  reqNamedFun(fun, `test`)

  const run = new Run(fun.name, conf.run)
  if (!conf.testAllow(run)) return run

  conf.testRep?.reportStart(run)
  run.start = now()

  if (l.isFunAsync(fun)) return testAsync(run, fun)

  conf.run = run
  try {fun(run)}
  finally {conf.run = run.parent}
  return testDone(run)
}

async function testAsync(run, fun) {
  conf.run = run
  try {await fun(run)}
  finally {conf.run = run.parent}
  return testDone(run)
}

function testDone(run) {
  run.done(now(), 1)
  conf.testRep?.reportEnd(run)
  return run
}

/*
Registers a function for benchmarking, returning the resulting `Bench`.
Registered benchmarks can be run by calling `benches`.
*/
export function bench(fun, runner) {
  const bench = new Bench(fun, runner)
  conf.benches.add(bench)
  return bench
}

/*
Named benchmark. Accepts an optional runner, falling back on default
`conf.benchRunner`. Expects the runner to run the given function multiple
times, recording the amount of runs and the timing. Uses `conf.benchRep` to
report start and end of the benchmark.
*/
export class Bench extends l.Emp {
  constructor(fun, runner) {
    super()
    this.fun = reqNamedFun(fun, `bench`)
    this.runner = optRunner(runner)
  }

  get name() {return this.fun.name}

  run(runner = this.runner ?? conf.benchRunner) {
    const run = new Run(this.name)
    conf.benchRep?.reportStart(run)

    conf.run = run
    try {runner.run(this.fun, run)}
    finally {conf.run = run.parent}

    run.reqDone()
    conf.benchRep?.reportEnd(run)
    return run
  }
}

/*
Runs all registered benchmarks, using a single-pass runner, without filtering.
May cause deoptimization of polymorphic code. Leads to more predictable
benchmark results. Run this before `benches`.
*/
export function deopt() {
  const runner = new DeoptRunner()
  const rep = conf.benchRep
  conf.benchRep = conf.verb ? rep : undefined

  try {for (const bench of conf.benches) bench.run(runner)}
  finally {conf.benchRep = rep}
}

// Runs registered benchmarks, filtering them via `conf.benchFilter`.
export function benches() {
  for (const bench of conf.benches) {
    if (conf.benchAllow(bench.name)) bench.run()
  }
}

function reqNamedFun(fun, type) {
  const {name} = l.reqFun(fun)
  if (!name) {
    throw new SyntaxError(`${type} functions must have names for clearer stacktraces and easier search; missing name on ${fun}`)
  }
  if (!name.startsWith(type)) {
    throw new SyntaxError(`names of ${type} functions must begin with ${l.show(type)} for clearer stacktraces and easier search; invalid name on the following function:
  ${fun}`)
  }
  return fun
}

// Asserts that the given value is exactly `true`. Otherwise throws `AssertError`.
export function ok(val, ...info) {
  if (val === true) return

  throw new AssertError(`
expected:
  true
got:
  ${l.show(val)}
${optInfo(...info)}
`)
}

function optInfo(...val) {
  val = val.filter(l.isSome).map(l.show).map(indent).join(`\n`)
  if (!val) return ``

  return `info:
${val}
`.trim()
}

function indent(val) {return `  ` + l.reqStr(val)}

// Asserts that the given value is exactly `false`. Otherwise throws `AssertError`.
export function no(val, ...info) {
  if (val === false) return

  throw new AssertError(`
expected:
  false
got:
  ${l.show(val)}
${optInfo(...info)}
`.trim())
}

/*
Asserts that the inputs are identical, using `Object.is`.
Otherwise throws `AssertError`.
*/
export function is(act, exp) {
  if (Object.is(act, exp)) return

  throw new AssertError(`
actual:
  ${l.show(act)}
expected:
  ${l.show(exp)}
${equal(act, exp) ? `
note:
  equivalent structure, different reference
`.trim() : ``}`)
}

/*
Asserts that the inputs are NOT identical, using `Object.is`.
Otherwise throws `AssertError`.
*/
export function isnt(act, exp) {
  if (!Object.is(act, exp)) return
  throw new AssertError(`expected distinct values, but both inputs were ${l.show(act)}`)
}

/*
Asserts that the inputs have equivalent structure, using `equal`.
Otherwise throws `AssertError`.
*/
export function eq(act, exp) {
  if (equal(act, exp)) return
  throw new AssertError(`
actual:
  ${l.show(act)}
expected:
  ${l.show(exp)}
`)
}

/*
Asserts that the inputs DO NOT have equivalent structure, using `equal`.
Otherwise throws `AssertError`.
*/
export function notEq(act, exp) {
  if (!equal(act, exp)) return
  throw new AssertError(`expected distinct values, but both inputs were ${l.show(act)}`)
}

// Tentative. May need to improve error messages.
export function own(act, exp) {
  eq(
    Object.getOwnPropertyDescriptors(act),
    Object.getOwnPropertyDescriptors(exp),
  )
}

/*
Asserts that the given value is an instance of the given class.
Otherwise throws `AssertError`.
The argument order matches `instanceof` and `l.isInst`.
*/
export function inst(val, cls) {
  if (l.isInst(val, cls)) return
  throw new AssertError(`expected an instance of ${cls}, got ${l.show(val)}`)
}

/*
Asserts that the given function throws an instance of the given error class,
with a given non-empty error message.
*/
export function throws(fun, cls, msg) {
  if (!l.isFun(fun)) {
    throw new TypeError(`expected a function, got ${l.show(fun)}`)
  }
  if (!l.isCls(cls) || !l.isSubCls(cls, Error)) {
    throw new TypeError(`expected an error class, got ${l.show(cls)}`)
  }
  if (!l.isStr(msg) || !msg) {
    throw new TypeError(`expected an error message, got ${l.show(msg)}`)
  }

  if (l.isFunAsync(fun)) return throwsAsync(fun, cls, msg)

  let val
  try {val = fun()}
  catch (err) {return throwsCaught(fun, cls, msg, err)}
  return throwsReturned(fun, cls, msg, val)
}

async function throwsAsync(fun, cls, msg) {
  let val
  try {val = await fun()}
  catch (err) {
    throwsCaught(fun, cls, msg, err)
    return
  }
  throwsReturned(fun, cls, msg, val)
}

function throwsCaught(fun, cls, msg, err) {
  if (!l.isInst(err, cls)) {
    throw new AssertError(`
${throwsFunMsg(fun)}
${throwsErrMsg(cls, msg)}
got error:
  ${l.show(err)}
`)
  }

  if (!err.message.includes(msg)) {
    throw new AssertError(`
${throwsFunMsg(fun)}
${throwsErrMsg(cls, msg)}
got error:
  ${l.show(err)}
`)
  }
}

function throwsReturned(fun, cls, msg, val) {
  throw new AssertError(`
${throwsFunMsg(fun)}
${throwsErrMsg(cls, msg)}
got return value:
  ${l.show(val)}
`)
}

function throwsFunMsg(fun) {
  return `expected function to throw:
  ${fun}`
}

function throwsErrMsg(cls, msg) {
  return `expected error:
  ${cls.name || l.show(cls)}: ${msg}`
}

/*
Returns true if the inputs have an equivalent structure. Supports plain dicts,
arrays, maps, sets, and arbitrary objects with enumerable properties.

This is confined to the testing module, instead of being part of the "normal"
API, because deeply traversing and comparing data structures is a popular JS
antipattern that should be discouraged, not encouraged. The existence of this
function proves the occasional need, but live apps should avoid wasting
performance on this.
*/
export function equal(one, two) {
  return Object.is(one, two) || (
    l.isObj(one) && l.isObj(two) && equalObj(one, two)
  )
}

function equalObj(one, two) {
  // Probably faster than letting `equalList` compare them.
  if (l.isInst(one, String)) return equalCons(one, two) && one.valueOf() === two.valueOf()
  if (l.isList(one)) return equalCons(one, two) && equalList(one, two)
  if (l.isSet(one)) return equalCons(one, two) && equalSet(one, two)
  if (l.isMap(one)) return equalCons(one, two) && equalMap(one, two)
  if (l.isInst(one, URL)) return equalCons(one, two) && one.href === two.href
  if (l.isInst(one, Date)) return equalCons(one, two) && one.valueOf() === two.valueOf()
  if (l.isInst(one, Request)) return equalCons(one, two) && equalRequest(one, two)
  if (l.isDict(one)) return l.isDict(two) && equalStruct(one, two)
  return equalCons(one, two) && equalStruct(one, two)
}

function equalCons(one, two) {
  return l.isComp(one) && l.isComp(two) && equal(one.constructor, two.constructor)
}

function equalList(one, two) {
  if (one.length !== two.length) return false
  let ind = -1
  while (++ind < one.length) if (!equal(one[ind], two[ind])) return false
  return true
}

function equalSet(one, two) {
  if (one.size !== two.size) return false

outer:
  for (const valOne of setVals(one)) {
    if (two.has(valOne)) continue outer

    for (const valTwo of setVals(two)) {
      if (equal(valOne, valTwo)) continue outer
    }

    return false
  }
  return true
}

function setVals(val) {return Set.prototype.values.call(val)}

function equalMap(one, two) {
  if (one.size !== two.size) return false
  for (const [key, val] of Map.prototype.entries.call(one)) {
    if (!equal(val, Map.prototype.get.call(two, key))) return false
  }
  return true
}

// https://developer.mozilla.org/en-US/docs/Web/API/Request
function equalRequest(one, two) {
  return (
    equal(one.body, two.body) && // Not properly implemented.
    equal(one.bodyUsed, two.bodyUsed) &&
    equal(one.credentials, two.credentials) &&
    equal(one.destination, two.destination) &&
    equal(one.headers, two.headers) &&
    equal(one.integrity, two.integrity) &&
    equal(one.method, two.method) &&
    equal(one.mode, two.mode) &&
    equal(one.redirect, two.redirect) &&
    equal(one.referrer, two.referrer) &&
    equal(one.referrerPolicy, two.referrerPolicy) &&
    equal(one.url, two.url)
  )
}

function equalStruct(one, two) {
  // Takes care of primitive wrapper objects such as `new Number`,
  // as well as arbitrary classes with a custom `.valueOf`.
  const oneVal = maybeValueOf(one)
  const twoVal = maybeValueOf(two)
  if (one !== oneVal && two !== twoVal) return equal(oneVal, twoVal)

  const keysOne = Object.keys(one)
  const keysTwo = Object.keys(two)

  for (const key of keysOne) {
    if (!l.hasOwnEnum(two, key) || !equal(one[key], two[key])) return false
  }

  for (const key of keysTwo) {
    if (!l.hasOwnEnum(one, key) || !equal(two[key], one[key])) return false
  }

  return true
}

function maybeValueOf(val) {
  if (l.hasMeth(val, `valueOf`)) return val.valueOf()
  return val
}

function pos(val) {return Math.max(0, l.laxInt(val))}

function toReg(val) {
  if (l.isNil(val)) return /(?:)/
  if (l.isStr(val)) return val ? new RegExp(val) : /(?:)/
  if (l.isReg(val)) return val
  throw new TypeError(`unable to convert ${l.show(val)} to RegExp`)
}

/*
Used for all measurements. Semi-placeholder. In the future we may decide to
auto-detect the best available timing API depending on the environment. For
example, in Node we might use `process.hrtime`.
*/
export function now() {return performance.now()}

/*
Average overhead of the timing API. VERY approximate. The overhead varies,
possibly due to factors such as JIT tiers, CPU boost state, and possibly more.
Observed variance in Deno: 200ns, 600ns, 2µs.

The unstable performance of `performance.now` is responsible for a significant
portion of our warmup time. We would prefer to measure this just once, but due
to its variance, we end up measuring multiple times, which is relatively slow.
*/
export function nowAvg(runs = 65536) {
  l.reqIntPos(runs)
  const start = now()
  let rem = runs
  while (rem-- > 0) now()
  const end = now()
  return (end - start) / runs
}

function reqRunner(val) {
  if (!isRunner(val)) {
    throw new TypeError(`benchmarks require a valid runner, got ${l.show(val)}`)
  }
  return val
}

function optRunner(val) {return l.isNil(val) ? undefined : reqRunner(val)}

export function isRunner(val) {return l.isComp(val) && l.hasMeth(val, `run`)}

export function isReporter(val) {
  return l.isComp(val) && l.hasMeth(val, `reportStart`) && l.hasMeth(val, `reportEnd`)
}
