import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ti from '../time.mjs'

/* Util */

const DUR_LONG = `P12Y23M34DT45H56M67S`
const DATE_STR = `1234-05-06T07:08:09Z`
const durLong = Object.freeze(ti.dur(DUR_LONG))
const durDict = {...durLong}
const dateShort = new ti.DateShort(`1234-05-06`)
const sec = new ti.Sec(1024)
const dateNow = new Date()
const dateTimeNow = new ti.DateTime()
const tsNow = Date.now()

/* Bench */

t.bench(function bench_date_now_timestamp() {l.nop(Date.now())})
t.bench(function bench_date_now_Date() {l.nop(new Date())})
t.bench(function bench_date_now_DateTime() {l.nop(new ti.DateTime())})

/*
Pretty slow in Deno 2.4.2 (V8 13: ≈100ns), but not in Bun 1.2.19 (JSC: ≈10ns).

JSC's number is close to what's possible for a well optimized parser,
as long as the other overheads are negligible.

For comparison, on the same machine, in Go 1.24.0:
- Same ISO 8601 date-time string as ours: ≈20ns via stdlib.
- Same ISO 8601 interval string as ours: ≈18.5-19ns via the following parser:
  https://github.com/mitranim/gt/blob/0b2e32bb80b7d7b9150de04cbbbc37e511e8ffc8/gt_interval_parse.go

It's possible that our benchmarks are off by some nanoseconds. Our benchmark
engine works differently from the Go one: all the loops are in the library
code, and there's no user-visible loop in the functions provided by user code.
Cases do exist where adding an inner loop changes the measurement. We should
consider supporting inner loops in benchmarks.
*/
t.bench(function bench_date_from_str_Date() {l.nop(new Date(DATE_STR))})
t.bench(function bench_date_from_str_DateTime() {l.nop(new ti.DateTime(DATE_STR))})

t.bench(function bench_date_from_timestamp_Date() {l.nop(new Date(tsNow))})
t.bench(function bench_date_from_timestamp_DateTime() {l.nop(new ti.DateTime(tsNow))})

// Seems about equivalent to "from timestamp", as you'd expect.
t.bench(function bench_date_from_Date() {l.nop(new Date(dateNow))})
t.bench(function bench_date_from_DateTime() {l.nop(new ti.DateTime(dateTimeNow))})

t.bench(function bench_date_to_timestamp_Date() {l.nop(dateNow.valueOf())})
t.bench(function bench_date_to_timestamp_DateTime() {l.nop(dateTimeNow.valueOf())})

t.bench(function bench_date_DateShort_to_string() {l.nop(dateShort.toString())})

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

if (import.meta.main) {
  t.deopt()
  t.benches()
}
