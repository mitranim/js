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
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.42/test.mjs'

t.test(function test_some_feature() {
  t.eq(someFunction(someInputs), `expected result`)
})
```

Simple benchmarking example:

```js
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.42/test.mjs'

t.bench(function bench_some_feature() {
  someFunction(someInputs)
})

t.deopt()
t.benches()
```

Complex example:

```js
import * as t from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.42/test.mjs'

// Optional CLI flag parsing.
const cli = t.Args.os()

// Optional filtering.
t.conf.setTestFilter(cli.get(`test`))
t.conf.setBenchFilter(cli.get(`bench`))

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
  * [`class InternalError`](../test.mjs#L12)
  * [`class Run`](../test.mjs#L24)
  * [`class FinRunner`](../test.mjs#L84)
  * [`class CountRunner`](../test.mjs#L130)
  * [`class TimeRunner`](../test.mjs#L158)
  * [`class DeoptRunner`](../test.mjs#L204)
  * [`class StringReporter`](../test.mjs#L214)
  * [`class ConsoleReporter`](../test.mjs#L253)
  * [`class ConsoleOkReporter`](../test.mjs#L264)
  * [`class ConsoleAvgReporter`](../test.mjs#L272)
  * [`class ConsoleRunsReporter`](../test.mjs#L289)
  * [`class ConsoleBenchReporter`](../test.mjs#L302)
  * [`function tsMilli`](../test.mjs#L311)
  * [`function tsMicro`](../test.mjs#L312)
  * [`function tsNano`](../test.mjs#L313)
  * [`function tsPico`](../test.mjs#L314)
  * [`const conf`](../test.mjs#L317)
  * [`function test`](../test.mjs#L365)
  * [`function bench`](../test.mjs#L399)
  * [`class Bench`](../test.mjs#L411)
  * [`function deopt`](../test.mjs#L439)
  * [`function benches`](../test.mjs#L449)
  * [`function ok`](../test.mjs#L468)
  * [`function no`](../test.mjs#L496)
  * [`function is`](../test.mjs#L516)
  * [`function isnt`](../test.mjs#L538)
  * [`function eq`](../test.mjs#L547)
  * [`function notEq`](../test.mjs#L564)
  * [`function own`](../test.mjs#L570)
  * [`function inst`](../test.mjs#L600)
  * [`function optInst`](../test.mjs#L611)
  * [`function throws`](../test.mjs#L623)
  * [`function equal`](../test.mjs#L701)
  * [`function now`](../test.mjs#L815)
  * [`function nowAvg`](../test.mjs#L826)
  * [`function isRunner`](../test.mjs#L844)
  * [`function isReporter`](../test.mjs#L846)
