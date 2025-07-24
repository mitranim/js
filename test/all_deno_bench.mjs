import './all_bench.mjs'

import * as t from '../test.mjs'

if (import.meta.main) {
  t.deopt()
  t.benches()
}
