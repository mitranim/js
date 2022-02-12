import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as ti from '../time.mjs'

/* Util */

const DUR_LONG = `P12Y23M34DT45H56M67S`
const durLong = Object.freeze(ti.dur(DUR_LONG))
const durDict = {...durLong}

function nop() {}

/* Bench */

t.bench(function bench_Dur_from_nil() {nop(ti.dur())})

/*
Seems ≈10-20 times slower than my optimized Go implementation in
`https://github.com/mitranim/gt`, but very similar to an equivalent
regexp-based Go implementation. JS engines don't expose sufficiently
low-level APIs for proper optimization. UTF-16 strings might also slow down
ASCII parsing compared to UTF-8 used by Go.
*/
t.bench(function bench_Dur_from_str() {nop(ti.dur(`P12Y23M34DT45H56M67S`))})

t.bench(function bench_Dur_from_dur() {nop(ti.dur(durLong))})
t.bench(function bench_Dur_from_dict() {nop(ti.dur(durDict))})
t.bench(function bench_Dur_clone() {nop(durLong.clone())})

t.bench(function bench_new_Ts() {nop(new ti.Ts(1024))})
t.bench(function bench_new_Pico() {nop(new ti.Pico(1024))})
t.bench(function bench_new_Nano() {nop(new ti.Nano(1024))})
t.bench(function bench_new_Micro() {nop(new ti.Micro(1024))})
t.bench(function bench_new_Milli() {nop(new ti.Milli(1024))})

t.bench(function bench_new_Ts_toString() {nop(new ti.Ts(1024).toString())})
t.bench(function bench_new_Pico_toString() {nop(new ti.Pico(1024).toString())})
t.bench(function bench_new_Nano_toString() {nop(new ti.Nano(1024).toString())})
t.bench(function bench_new_Micro_toString() {nop(new ti.Micro(1024).toString())})
t.bench(function bench_new_Milli_toString() {nop(new ti.Milli(1024).toString())})

if (import.meta.main) t.deopt(), t.benches()
