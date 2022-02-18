import './internal_test_init.mjs'
import * as itc from './internal_test_coll.mjs'
import * as l from '../lang.mjs'
import * as t from '../test.mjs'
import * as co from '../coll.mjs'
import * as i from '../iter.mjs'

/* Global */

const bsetLong = co.bset(itc.numList)

/* Bench */

t.bench(function bench_set_new_Array_empty() {l.nop(Array.of())})
t.bench(function bench_set_new_Set_empty() {l.nop(new Set())})
t.bench(function bench_set_new_Bset_empty() {l.nop(co.bset())})

t.bench(function bench_set_new_Array_long() {l.nop(Array.from(itc.numSet))})
t.bench(function bench_set_new_Set_long() {l.nop(new Set(itc.numSet))})
t.bench(function bench_set_new_Bset_long() {l.nop(co.bset(itc.numSet))})

t.bench(function bench_set_to_arr_Set_spread() {l.nop([...itc.numSet])})
t.bench(function bench_set_to_arr_Set_iter_values() {l.nop(i.values(itc.numSet))})
t.bench(function bench_set_to_arr_Bset_spread() {l.nop([...bsetLong])})
t.bench(function bench_set_to_arr_Bset_spread_values() {l.nop([...bsetLong.values()])})
t.bench(function bench_set_to_arr_Bset_toArray() {l.nop(bsetLong.toArray())})
t.bench(function bench_set_to_arr_Bset_iter_values() {l.nop(i.values(bsetLong))})

t.bench(function bench_set_walk_Set() {for (const val of itc.numSet) l.nop(val)})
t.bench(function bench_set_walk_Bset() {for (const val of bsetLong) l.nop(val)})
t.bench(function bench_set_walk_Bset_values() {for (const val of bsetLong.values()) l.nop(val)})

// Note: the behavior is not equivalent.
itc.deoptHofMeth(bsetLong, bsetLong.map)
t.bench(function bench_set_map_Set_iter() {l.nop(i.map(itc.numSet, l.inc))})
t.bench(function bench_set_map_Bset_iter() {l.nop(i.map(bsetLong, l.inc))})
t.bench(function bench_set_map_Bset_map() {l.nop(bsetLong.map(l.inc))})

// Note: the behavior is not equivalent.
itc.deoptHofMeth(bsetLong, bsetLong.filter)
t.bench(function bench_set_filter_Set_iter() {l.nop(i.filter(itc.numSet, l.id))})
t.bench(function bench_set_filter_Bset_iter() {l.nop(i.filter(bsetLong, l.id))})
t.bench(function bench_set_filter_Bset_filter() {l.nop(bsetLong.filter(l.id))})

t.bench(function bench_map_new_empty() {l.nop(co.bmap())})

t.bench(function bench_map_new_bmapOf() {
  l.nop(co.bmapOf(
    `aa73d89ab2b64ffe90bd861fa049b13e`, `bc2c5ecdb93d41228ed1549cc376d2ff`,
    `9ab72f88537f4fca8a5aeee0d7671f38`, `9bf233614e6f408f8e438315bfd4fdc1`,
    `578a0b1c185c454da779b8df490d0b23`, `37ae9e155dbc4eb9a192d72eadc77488`,
    `b33aab2066f94f8c9c2c8650132eb820`, `0b1d5512ab5c4e7a84a414c49baead45`,
    `e4ff4b326998422ebc9d11b15ec581dd`, `15d858282c094e34a9aad4541be085af`,
    `e36a91cb98d744df8dcbb5bf7a687076`, `fbbd61b32872444784f336cc9e1aff1c`,
    `f39f835ef54f4516a6f36c5191e6cb92`, `c09256f23789476eba0620fe9640e69a`,
    `b46f6e8ab43245a9a83f9384055d373e`, `f2ba20160aa5404086e458bb02b2498f`,
  ))
})

t.bench(function bench_map_new_chained() {
  l.nop(
    co.bmap()
    .set(`aa73d89ab2b64ffe90bd861fa049b13e`, `bc2c5ecdb93d41228ed1549cc376d2ff`)
    .set(`9ab72f88537f4fca8a5aeee0d7671f38`, `9bf233614e6f408f8e438315bfd4fdc1`)
    .set(`578a0b1c185c454da779b8df490d0b23`, `37ae9e155dbc4eb9a192d72eadc77488`)
    .set(`b33aab2066f94f8c9c2c8650132eb820`, `0b1d5512ab5c4e7a84a414c49baead45`)
    .set(`e4ff4b326998422ebc9d11b15ec581dd`, `15d858282c094e34a9aad4541be085af`)
    .set(`e36a91cb98d744df8dcbb5bf7a687076`, `fbbd61b32872444784f336cc9e1aff1c`)
    .set(`f39f835ef54f4516a6f36c5191e6cb92`, `c09256f23789476eba0620fe9640e69a`)
    .set(`b46f6e8ab43245a9a83f9384055d373e`, `f2ba20160aa5404086e458bb02b2498f`)
  )
})

t.bench(function bench_map_new_from_dict() {
  l.nop(co.bmap({
    [`aa73d89ab2b64ffe90bd861fa049b13e`]: `bc2c5ecdb93d41228ed1549cc376d2ff`,
    [`9ab72f88537f4fca8a5aeee0d7671f38`]: `9bf233614e6f408f8e438315bfd4fdc1`,
    [`578a0b1c185c454da779b8df490d0b23`]: `37ae9e155dbc4eb9a192d72eadc77488`,
    [`b33aab2066f94f8c9c2c8650132eb820`]: `0b1d5512ab5c4e7a84a414c49baead45`,
    [`e4ff4b326998422ebc9d11b15ec581dd`]: `15d858282c094e34a9aad4541be085af`,
    [`e36a91cb98d744df8dcbb5bf7a687076`]: `fbbd61b32872444784f336cc9e1aff1c`,
    [`f39f835ef54f4516a6f36c5191e6cb92`]: `c09256f23789476eba0620fe9640e69a`,
    [`b46f6e8ab43245a9a83f9384055d373e`]: `f2ba20160aa5404086e458bb02b2498f`,
  }))
})

// Nearly free. Baseline for "map from dict".
t.bench(function bench_map_new_plain_dict() {
  l.nop({
    [`aa73d89ab2b64ffe90bd861fa049b13e`]: `bc2c5ecdb93d41228ed1549cc376d2ff`,
    [`9ab72f88537f4fca8a5aeee0d7671f38`]: `9bf233614e6f408f8e438315bfd4fdc1`,
    [`578a0b1c185c454da779b8df490d0b23`]: `37ae9e155dbc4eb9a192d72eadc77488`,
    [`b33aab2066f94f8c9c2c8650132eb820`]: `0b1d5512ab5c4e7a84a414c49baead45`,
    [`e4ff4b326998422ebc9d11b15ec581dd`]: `15d858282c094e34a9aad4541be085af`,
    [`e36a91cb98d744df8dcbb5bf7a687076`]: `fbbd61b32872444784f336cc9e1aff1c`,
    [`f39f835ef54f4516a6f36c5191e6cb92`]: `c09256f23789476eba0620fe9640e69a`,
    [`b46f6e8ab43245a9a83f9384055d373e`]: `f2ba20160aa5404086e458bb02b2498f`,
  })
})

if (import.meta.main) t.deopt(), t.benches()
