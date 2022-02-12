import '../cli_emptty.mjs'
import * as cl from '../cli.mjs'
import * as t from '../test.mjs'

Error.stackTraceLimit = Infinity

export const cli = cl.Flag.os()
export const run = cli.get(`run`)
export const verb = cli.boolOpt(`verb`)
export const more = cli.boolOpt(`more`)
export const prec = cli.boolOpt(`prec`)

t.conf.testFilterFrom(run)
t.conf.benchFilterFrom(run)
if (verb) t.conf.testRep = t.conf.benchRep

// Opt-in for benchmarks that require more precision than whole nanoseconds.
if (prec) t.conf.benchRep = t.ConsoleAvgReporter.with(t.tsPico)

// Indicates benchmark accuracy. Should be single digit nanoseconds.
t.bench(function bench_baseline() {})
