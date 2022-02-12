import './internal_test_init.mjs'
import * as t from '../test.mjs'

t.bench(function bench_now() {t.now()})

if (import.meta.main) t.deopt(), t.benches()
