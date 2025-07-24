import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as cl from '../cli.mjs'

const args = [`-one`, `two`, `--three=four`, `-f`, `-s`, `seven`, `-e`, `nine`, `eleven`, `-e`, `ten`, `twelve`]
const enc = new TextEncoder()

t.bench(function bench_Flag() {l.nop(new cl.Flag(args))})
t.bench(function bench_enc_static() {l.nop(enc.encode(cl.clearHard))})
t.bench(function bench_enc_new() {l.nop(new TextEncoder().encode(cl.clearHard))})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
