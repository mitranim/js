import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as cl from '../cli.mjs'

const args = [`-one`, `two`, `--three=four`, `-f`, `-s`, `seven`, `-e`, `nine`, `eleven`, `-e`, `ten`, `twelve`]

t.bench(function bench_Flag() {l.nop(new cl.Flag(args))})

if (import.meta.main) t.deopt(), t.benches()
