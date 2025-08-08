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
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.83/test.mjs'

t.test(function test_some_feature() {
  t.eq(someFunction(someInputs), `expected result`)
})
```

Simple benchmarking example:

```js
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.83/test.mjs'

t.bench(function bench_some_feature() {
  someFunction(someInputs)
})

t.deopt()
t.benches()
```

Complex example:

```js
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.83/test.mjs'

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
  * [`class DeoptRunner`](../test.mjs#L229)
  * [`class StringReporter`](../test.mjs#L239)
  * [`class ConsoleReporter`](../test.mjs#L278)
  * [`class ConsoleStartReporter`](../test.mjs#L289)
  * [`class ConsoleAvgReporter`](../test.mjs#L299)
  * [`class ConsoleStartEndAvgReporter`](../test.mjs#L316)
  * [`class ConsoleRunsReporter`](../test.mjs#L330)
  * [`class ConsoleBenchReporter`](../test.mjs#L343)
  * [`function tsMilli`](../test.mjs#L352)
  * [`function tsMicro`](../test.mjs#L353)
  * [`function tsNano`](../test.mjs#L354)
  * [`function tsPico`](../test.mjs#L355)
  * [`const conf`](../test.mjs#L358)
  * [`function test`](../test.mjs#L405)
  * [`function bench`](../test.mjs#L440)
  * [`class Bench`](../test.mjs#L452)
  * [`function deopt`](../test.mjs#L482)
  * [`function benches`](../test.mjs#L492)
  * [`function ok`](../test.mjs#L513)
  * [`function no`](../test.mjs#L571)
  * [`function is`](../test.mjs#L582)
  * [`function isnt`](../test.mjs#L598)
  * [`function eq`](../test.mjs#L608)
  * [`function notEq`](../test.mjs#L619)
  * [`function own`](../test.mjs#L629)
  * [`function inst`](../test.mjs#L648)
  * [`function instOpt`](../test.mjs#L662)
  * [`function throws`](../test.mjs#L675)
  * [`function msgThrowsCaught`](../test.mjs#L710)
  * [`function throwsGotErr`](../test.mjs#L728)
  * [`function msgThrowsReturned`](../test.mjs#L745)
  * [`function throwsFunMsg`](../test.mjs#L753)
  * [`function throwsErrMsg`](../test.mjs#L758)
  * [`function equal`](../test.mjs#L783)
  * [`class Eq`](../test.mjs#L785)
  * [`function now`](../test.mjs#L907)
  * [`function nowAvg`](../test.mjs#L918)
  * [`function isRunner`](../test.mjs#L927)
  * [`function optRunner`](../test.mjs#L928)
  * [`function reqRunner`](../test.mjs#L930)
  * [`function isReporter`](../test.mjs#L935)
  * [`function optReporter`](../test.mjs#L938)
  * [`function reqReporter`](../test.mjs#L939)
