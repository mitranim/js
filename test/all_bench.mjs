import './internal_test_init.mjs'
import './lang_bench.mjs'
import './obj_bench.mjs'
import './iter_bench.mjs'
import './str_bench.mjs'
import './coll_bench.mjs'
import './arr_bench.mjs'
import './time_bench.mjs'
import './url_bench.mjs'
import './http_bench.mjs'
import './cli_bench.mjs'
import './test_bench.mjs'
import './dom_shim_bench.mjs'
import './prax_bench.mjs'

import * as t from '../test.mjs'

if (import.meta.main) {
  t.deopt()
  t.benches()
}
