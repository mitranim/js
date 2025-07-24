import * as l from '../lang.mjs'
import * as cl from '../cli.mjs'
import * as t from '../test.mjs'

export const cli = cl.Flag.os()
export const run = cli.get(`--run`)
export const verb = cli.boolOpt(`--verb`)
export const prec = cli.boolOpt(`--prec`)
export const once = cli.boolOpt(`--once`)

// export const clear = cli.boolOpt(`--clear`)
// if (clear) cl.emptty()

t.conf.setTestFilter(run)
t.conf.setBenchFilter(run)

if (verb) t.conf.testRep = t.ConsoleStartReporter.default()

// Allows to bench code in "slow mode", without much warmup.
if (once) t.conf.benchRunner = new t.CountRunner(1)

// Opt-in for benchmarks that require more precision than whole nanoseconds.
if (prec) t.conf.benchRep = t.ConsoleAvgReporter.with(t.tsPico)

// Indicates benchmark accuracy. Should be single digit nanoseconds, ideally 0.
t.bench(function bench_baseline() {})

/*
In Deno, `globalThis.gc` is available with `--v8-flags=--expose_gc`.

In Bun, `Bun.gc` is always available, and `globalThis.gc` is available with
`--expose-gc`. However, at the time of writing, our finalization tests tend to
fail in Bun, because of differences in GC timing between V8 and JSC, even when
using the `--smol` flag. Somehow, it is also possible for our GC tests to pass
in Bun under alternate conditions, like sometimes when remote inspection is
enabled. For now though, we skip them there.
*/
export const gc = (
  l.onlyFun(globalThis.gc)
  // ?? (l.onlyFun(globalThis.Bun?.gc) && function gc() {globalThis.Bun.gc(true)})
)

/*
We use `FinalizationRegistry` instances for cleanup in various modules.
The following seems unreliable. May need adjustments in the future.
*/
export async function waitForGcAndFinalizers() {
  let ind = -1
  while (++ind < 2) {
    gc()
    await after(1)
  }
}

function after(ms) {
  return new Promise(function init(done) {setTimeout(done, ms)})
}
