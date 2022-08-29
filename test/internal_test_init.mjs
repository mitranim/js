import '../cli_emptty.mjs'
import * as l from '../lang.mjs'
import * as cl from '../cli.mjs'
import * as t from '../test.mjs'

Error.stackTraceLimit = Infinity

export const cli = cl.Flag.os()
export const run = cli.get(`run`)
export const verb = cli.boolOpt(`verb`)
export const more = cli.boolOpt(`more`)
export const prec = cli.boolOpt(`prec`)
export const once = cli.boolOpt(`once`)

t.conf.setTestFilter(run)
t.conf.setBenchFilter(run)

if (verb) t.conf.testRep = t.conf.benchRep

// Allows to bench code in "slow mode", without much warmup.
if (once) t.conf.benchRunner = new t.CountRunner(1)

// Opt-in for benchmarks that require more precision than whole nanoseconds.
if (prec) t.conf.benchRep = t.ConsoleAvgReporter.with(t.tsPico)

// Indicates benchmark accuracy. Should be single digit nanoseconds.
t.bench(function bench_baseline() {})

// See comment on `readFull`.
export async function testStream(src, exp) {t.is(await readFull(src), exp)}

/*
Stuck here for now because it's used by multiple tests, and we don't want this
anywhere in the public API. This is useful for testing, but violates the
purpose of streams and should not be encouraged. Might move to `test.mjs`.

Doesn't `for .. of` over the stream because at the time of writing
it would work only in Deno, but not in Chrome where we also test.
*/
export async function readFull(src) {
  const read = src.getReader()
  let out = ``

  for (;;) {
    const {value, done} = await read.read()
    if (done) break
    out += l.reqStr(chunkToStr(value))
  }

  return out
}

function chunkToStr(val) {
  if (l.isInst(val, Uint8Array)) return new TextDecoder().decode(val)
  return l.reqStr(val)
}
