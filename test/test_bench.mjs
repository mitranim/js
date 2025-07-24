import './internal_test_init.mjs'
import * as t from '../test.mjs'

const run0 = new t.Run(`run0`)
const run1 = new t.Run(`run1`, run0)
const run2 = new t.Run(`run2`, run1)
const filterEmpty = [/run0/, /run1/, /run2/, /run3/]
const filterFull = [/run0/, /run1/, /run2/, /run3/]

t.bench(function bench_now() {t.now()})
t.bench(function bench_Run_allow_empty() {run2.allow(filterEmpty)})
t.bench(function bench_Run_allow_full() {run2.allow(filterFull)})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
