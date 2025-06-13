## Overview

[test.mjs](../test.mjs) provides tools for JS tests and benchmarks. Similar to https://deno.land/std/testing, but runs in all environments: browsers, Deno, Node, and possibly more.

Important **non-features**:

  * No CLI required.
  * Doesn't require Node or Deno.
  * Doesn't require TypeScript.
  * No external dependencies.
  * No slowness.

Features:

  * Small. Native JS module. Can be imported by URL.
  * Runs in all environments: browsers, Deno, Node, possibly more.
  * Assertion shortcuts such as `is`, `eq`, `ok`, and more.
  * Filter tests by name.
  * Filter benchmarks by name.
  * Multiple benchmarking strategies.
    * `TimeRunner`: by total runtime in ms.
    * `CountRunner`: by run count.
    * Pluggable: bring your own runner.
  * Multiple reporting strategies.
    * Can report start, end, timing, number of runs, in any combination.
    * Pluggable: bring your own reporter.
  * Test and benchmark functions must be named.
    * Functions are registered and filtered by their name, not by an arbitrary string. This forces them to be indexable and searchable in editors.
  * Benchmarks support warmup for stable results.
  * Benchmark precision is tuned to 1/10th of a nanosecond.
    * Tested in Deno with `--allow-hrtime`.
  * Supports async tests.
  * Non-verbose. Tests are silent by default.

Ported from https://github.com/mitranim/test which is also available separately.

## TOC

* [#Limitations](#limitations)
* [#Gotchas](#gotchas)
* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Limitations

* Undocumented, or rather documented only through comments. Read the source. Docs are planned but not written yet.
* Benchmarks are only synchronous. Async support is planned but not implemented.
  * Tests can be sync or async.
* Almost no support for additional messages accompanying failed tests.
* No support for timeouts. A hanged test stays hanged.

## Gotchas

Deno requires `--allow-hrtime` for better benchmark precision and `--unstable` for measuring terminal width.

Performance is variable due to factors such as JIT tiers, CPU boost, inline caching, and possibly more. Code affects other code. Order is significant. Benchmarks affect each other. Consider calling `deopt` before `benches`.

Timing precision varies by JS engine and environment.

## Usage

Simple testing example:

```js
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.69/test.mjs'

t.test(function test_some_feature() {
  t.eq(someFunction(someInputs), `expected result`)
})
```

Simple benchmarking example:

```js
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.69/test.mjs'

t.bench(function bench_some_feature() {
  someFunction(someInputs)
})

t.deopt()
t.benches()
```

Complex example:

```js
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.69/test.mjs'

// Optional CLI flag parsing.
const cli = t.Args.os()

// Optional filtering.
t.conf.setTestFilter(cli.get(`--test`))
t.conf.setBenchFilter(cli.get(`--bench`))

// Optional bench adjustment. Can be overridden per-function.
t.conf.benchRunner = new t.TimeRunner(1024)

// Filterable tests with assertion shortcuts.
t.test(function test_some_feature() {
  t.eq(someFunction(someInputs), `expected result`)
})

// Easy and precise benchmarks.
t.bench(function bench_some_feature() {
  someFunction(someInputs)
})

t.deopt()
t.benches()
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [test.mjs](../test.mjs).

  * [`class AssertError`](../test.mjs#L8)
  * [`class InternalError`](../test.mjs#L17)
  * [`class Run`](../test.mjs#L29)
  * [`class FinRunner`](../test.mjs#L106)
  * [`class CountRunner`](../test.mjs#L152)
  * [`class TimeRunner`](../test.mjs#L180)
  * [`class DeoptRunner`](../test.mjs#L226)
  * [`class StringReporter`](../test.mjs#L236)
  * [`class ConsoleReporter`](../test.mjs#L275)
  * [`class ConsoleStartReporter`](../test.mjs#L286)
  * [`class ConsoleAvgReporter`](../test.mjs#L296)
  * [`class ConsoleStartEndAvgReporter`](../test.mjs#L313)
  * [`class ConsoleRunsReporter`](../test.mjs#L327)
  * [`class ConsoleBenchReporter`](../test.mjs#L340)
  * [`function tsMilli`](../test.mjs#L349)
  * [`function tsMicro`](../test.mjs#L350)
  * [`function tsNano`](../test.mjs#L351)
  * [`function tsPico`](../test.mjs#L352)
  * [`const conf`](../test.mjs#L355)
  * [`function test`](../test.mjs#L402)
  * [`function bench`](../test.mjs#L437)
  * [`class Bench`](../test.mjs#L449)
  * [`function deopt`](../test.mjs#L479)
  * [`function benches`](../test.mjs#L489)
  * [`function ok`](../test.mjs#L510)
  * [`function no`](../test.mjs#L548)
  * [`function is`](../test.mjs#L559)
  * [`function isnt`](../test.mjs#L575)
  * [`function eq`](../test.mjs#L585)
  * [`function notEq`](../test.mjs#L596)
  * [`function own`](../test.mjs#L606)
  * [`function inst`](../test.mjs#L625)
  * [`function optInst`](../test.mjs#L639)
  * [`function throws`](../test.mjs#L652)
  * [`function msgThrowsCaught`](../test.mjs#L687)
  * [`function throwsGotErr`](../test.mjs#L705)
  * [`function msgThrowsReturned`](../test.mjs#L722)
  * [`function throwsFunMsg`](../test.mjs#L730)
  * [`function throwsErrMsg`](../test.mjs#L735)
  * [`function equal`](../test.mjs#L760)
  * [`class Eq`](../test.mjs#L762)
  * [`function now`](../test.mjs#L878)
  * [`function nowAvg`](../test.mjs#L889)
  * [`function isRunner`](../test.mjs#L907)
  * [`function isReporter`](../test.mjs#L909)
