import * as t from '../test.mjs'

await import(`./internal_test_init.mjs`)
await import(`./lang_bench.mjs`)
await import(`./obj_bench.mjs`)
await import(`./iter_bench.mjs`)
await import(`./str_bench.mjs`)
await import(`./coll_bench.mjs`)
await import(`./arr_bench.mjs`)
await import(`./time_bench.mjs`)
await import(`./url_bench.mjs`)
await import(`./http_bench.mjs`)
await import(`./cli_bench.mjs`)
await import(`./test_bench.mjs`)
await import(`./dom_shim_bench.mjs`)
await import(`./prax_bench.mjs`)

if (import.meta.main) {
  t.deopt()
  t.benches()
}
