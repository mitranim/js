import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ti from '../time.mjs'

/* Util */

const DUR_LONG = `P12Y23M34DT45H56M67S`
const durLong = Object.freeze(ti.dur(DUR_LONG))
const durDict = {...durLong}
const dateShort = new ti.DateShort(`1234-05-06`)
const sec = new ti.Sec(1024)

/* Bench */

t.bench(function bench_Dur_from_nil() {l.nop(ti.dur())})

/*
Seems ≈10-20 times slower than my optimized Go implementation in
`https://github.com/mitranim/gt`, but very similar to an equivalent
regexp-based Go implementation. JS engines don't expose sufficiently
low-level APIs for proper optimization. UTF-16 strings might also slow down
ASCII parsing compared to UTF-8 used by Go.
*/
t.bench(function bench_Dur_from_str() {l.nop(ti.dur(`P12Y23M34DT45H56M67S`))})

t.bench(function bench_Dur_from_dur() {l.nop(ti.dur(durLong))})
t.bench(function bench_Dur_from_dict() {l.nop(ti.dur(durDict))})
t.bench(function bench_Dur_clone() {l.nop(durLong.clone())})

t.bench(function bench_Dur_build_full() {
  l.nop(
    ti.dur()
      .setYears(1).setMonths(2).setDays(3)
      .setHours(4).setMinutes(5).setSeconds(6)
  )
})

t.bench(function bench_Dur_toString() {l.nop(durLong.toString())})

t.bench(function bench_date_short_to_string() {l.nop(dateShort.toString())})

t.bench(function bench_new_Pico() {l.nop(new ti.Pico(1024))})
t.bench(function bench_new_Nano() {l.nop(new ti.Nano(1024))})
t.bench(function bench_new_Micro() {l.nop(new ti.Micro(1024))})
t.bench(function bench_new_Milli() {l.nop(new ti.Milli(1024))})
t.bench(function bench_new_Sec() {l.nop(new ti.Sec(1024))})

t.bench(function bench_new_Sec_pico() {l.nop(new ti.Sec(1024).pico())})
t.bench(function bench_new_Sec_nano() {l.nop(new ti.Sec(1024).nano())})
t.bench(function bench_new_Sec_micro() {l.nop(new ti.Sec(1024).micro())})
t.bench(function bench_new_Sec_milli() {l.nop(new ti.Sec(1024).milli())})

t.bench(function bench_new_Pico_toString() {l.nop(new ti.Pico(1024).toString())})
t.bench(function bench_new_Nano_toString() {l.nop(new ti.Nano(1024).toString())})
t.bench(function bench_new_Micro_toString() {l.nop(new ti.Micro(1024).toString())})
t.bench(function bench_new_Milli_toString() {l.nop(new ti.Milli(1024).toString())})
t.bench(function bench_new_Sec_toString() {l.nop(new ti.Sec(1024).toString())})

t.bench(function bench_sec_dur() {l.nop(sec.dur())})
t.bench(function bench_new_Sec_dur() {l.nop(new ti.Sec(1024).dur())})

if (import.meta.main) t.deopt(), t.benches()
