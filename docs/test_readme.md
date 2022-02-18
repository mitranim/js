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
* Only synchronous. Async support is planned but not implemented.
* No support for additional messages accompanying failed tests.
* No support for timeouts. A hanged test stays hanged.

## Gotchas

Deno requires `--allow-hrtime` for better benchmark precision and `--unstable` for measuring terminal width.

Performance is variable due to factors such as JIT tiers, CPU boost, inline caching, and possibly more. Code affects other code. Order is significant. Benchmarks affect each other. Consider calling `deopt` before `benches`.

Timing precision varies by JS engine and environment.

## Usage

Simple testing example:

```js
import * as t from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/test.mjs'

t.test(function test_some_feature() {
  t.eq(someFunction(someInputs), `expected result`)
})
```

Simple benchmarking example:

```js
import * as t from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/test.mjs'

t.bench(function bench_some_feature() {
  someFunction(someInputs)
})

t.deopt()
t.benches()
```

Complex example:

```js
import * as t from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/test.mjs'

// Optional CLI flag parsing.
const cli = t.Args.os()

// Optional filtering.
t.conf.testFilterFrom(cli.get(`test`))
t.conf.benchFilterFrom(cli.get(`bench`))

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
  * [`class InternalError`](../test.mjs#L13)
  * [`class Run`](../test.mjs#L25)
  * [`class FinRunner`](../test.mjs#L86)
  * [`class CountRunner`](../test.mjs#L134)
  * [`class TimeRunner`](../test.mjs#L162)
  * [`class DeoptRunner`](../test.mjs#L208)
  * [`class StringReporter`](../test.mjs#L218)
  * [`class ConsoleReporter`](../test.mjs#L258)
  * [`class ConsoleOkReporter`](../test.mjs#L269)
  * [`class ConsoleAvgReporter`](../test.mjs#L277)
  * [`class ConsoleRunsReporter`](../test.mjs#L294)
  * [`class ConsoleBenchReporter`](../test.mjs#L307)
  * [`function tsMilli`](../test.mjs#L316)
  * [`function tsMicro`](../test.mjs#L317)
  * [`function tsNano`](../test.mjs#L318)
  * [`function tsPico`](../test.mjs#L319)
  * [`const conf`](../test.mjs#L322)
  * [`function test`](../test.mjs#L386)
  * [`function bench`](../test.mjs#L408)
  * [`class Bench`](../test.mjs#L420)
  * [`function deopt`](../test.mjs#L449)
  * [`function benches`](../test.mjs#L459)
  * [`function ok`](../test.mjs#L478)
  * [`function no`](../test.mjs#L484)
  * [`function is`](../test.mjs#L493)
  * [`function isnt`](../test.mjs#L508)
  * [`function eq`](../test.mjs#L517)
  * [`function notEq`](../test.mjs#L529)
  * [`function inst`](../test.mjs#L539)
  * [`function throws`](../test.mjs#L548)
  * [`function equal`](../test.mjs#L608)
  * [`function now`](../test.mjs#L722)
  * [`function nowAvg`](../test.mjs#L729)
  * [`function isRunner`](../test.mjs#L747)
  * [`function isReporter`](../test.mjs#L749)
