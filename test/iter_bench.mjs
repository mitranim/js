import './internal_test_init.mjs'
import * as lo from 'https://cdn.jsdelivr.net/npm/lodash-es/lodash.js'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'
import * as c from '../coll.mjs'

class Nop {}

/*
At the time of writing, this doesn't seem to perform any better than an
implementation of `span` that creates an array.
*/
class SpanIter extends l.Emp {
  constructor(len) {
    super()
    this.len = l.reqNat(len)
    this.ind = -1
    this.done = false
  }

  [Symbol.iterator]() {return this}

  next() {
    if (this.ind < this.len) this.ind++
    else this.done = true
    return this
  }
}

class VecWithEntries extends c.Vec {
  entries() {return this.toArray().entries()}
}

const numVecWithEntries = VecWithEntries.from(itc.numVec)

function reverseUsingLodash(val) {return lo.reverse(i.valuesCopy(val))}
function reverseUsingNative(val) {return i.valuesCopy(val).reverse()}
function reverseUsingOurs(val) {return i.reverseMut(i.valuesCopy(val))}

t.bench(function bench_arr_spread_native() {l.reqArr([...itc.numArgs])})
t.bench(function bench_arr_gen_spread_native() {l.reqArr([...itc.gen(itc.numArgs)])})

itc.deoptSeqHof(i.arr)
t.bench(function bench_arr_our_arr_from_array_nums() {i.arr(itc.numArr)})
t.bench(function bench_arr_our_arr_from_array_dicts() {i.arr(itc.dictArr)})
t.bench(function bench_arr_our_arr_from_arguments() {i.arr(itc.numArgs)})
t.bench(function bench_arr_our_arr_from_gen() {i.arr(itc.gen(itc.numArgs))})

itc.deoptSeqHof(i.arrCopy)
t.bench(function bench_arr_our_arrCopy_from_array_nums() {i.arrCopy(itc.numArr)})
t.bench(function bench_arr_our_arrCopy_from_array_dicts() {i.arrCopy(itc.dictArr)})
t.bench(function bench_arr_our_arrCopy_from_arguments() {i.arrCopy(itc.numArgs)})
t.bench(function bench_arr_our_arrCopy_from_gen() {i.arrCopy(itc.gen(itc.numArgs))})

itc.deoptKeysFun(i.keys)
t.bench(function bench_keys_array_native_spread() {l.reqArr([...itc.numArr.keys()])})
t.bench(function bench_keys_array_native_our_arr() {i.arrCopy(itc.numArr.keys())})
t.bench(function bench_keys_array_lodash() {l.reqArr(lo.keys(itc.numArr))})
t.bench(function bench_keys_array_our_keys() {l.reqArr(i.keys(itc.numArr))})

t.bench(function bench_keys_dict_native() {l.reqArr(Object.keys(itc.numDict))})
t.bench(function bench_keys_dict_lodash() {l.reqArr(lo.keys(itc.numDict))})
t.bench(function bench_keys_dict_by_for_in() {l.reqArr(recKeysByForIn(itc.numDict))})
t.bench(function bench_keys_dict_our_keys() {l.reqArr(i.keys(itc.numDict))})

t.bench(function bench_keys_dict_empty_native() {l.reqArr(Object.keys({}))})
t.bench(function bench_keys_dict_empty_lang_recKeys() {l.reqArr(l.recKeys({}))})
t.bench(function bench_keys_dict_empty_iter_keys() {l.reqArr(i.keys({}))})

t.bench(function bench_keys_set_native() {l.reqArr([...itc.numSet.keys()])})
t.bench(function bench_keys_set_our_keys() {l.reqArr(i.keys(itc.numSet))})

t.bench(function bench_keys_map_native() {l.reqArr([...itc.numMap.keys()])})
t.bench(function bench_keys_map_our_keys() {l.reqArr(i.keys(itc.numMap))})

itc.deoptSeqHof(i.values)
t.bench(function bench_values_array_native() {i.arr(itc.numArr.values())})
t.bench(function bench_values_array_lodash() {l.reqArr(lo.values(itc.numArr))})
t.bench(function bench_values_array_our_values() {l.reqArr(i.values(itc.numArr))})

t.bench(function bench_values_dict_native() {l.reqArr(Object.values(itc.numDict))})
t.bench(function bench_values_dict_by_for_in() {l.reqArr(recValuesByForIn(itc.numDict))})
t.bench(function bench_values_dict_by_key_list() {l.reqArr(recValuesByKeyList(itc.numDict))})
t.bench(function bench_values_dict_lodash() {l.reqArr(lo.values(itc.numDict))})
t.bench(function bench_values_dict_our_values() {l.reqArr(i.values(itc.numDict))})

t.bench(function bench_values_set_native() {i.arr(itc.numSet.values())})
t.bench(function bench_values_set_specialized() {l.reqArr(valuesFromSetSpecialized(itc.numSet))})
t.bench(function bench_values_set_spread() {l.reqArr([...itc.numSet])})
t.bench(function bench_values_set_our_values() {l.reqArr(i.values(itc.numSet))})

t.bench(function bench_values_map_native() {i.arr(itc.numMap.values())})
t.bench(function bench_values_map_specialized() {l.reqArr(valuesFromMapSpecialized(itc.numMap))})
t.bench(function bench_values_map_spread_values() {l.reqArr([...itc.numMap.values()])})
t.bench(function bench_values_map_our_values() {l.reqArr(i.values(itc.numMap))})

// Must avoid allocations/copying. The entire cost must be in type checks.
t.bench(function bench_values_vec_toArray() {i.arr(itc.numVec.toArray())})
t.bench(function bench_values_vec_our_values() {l.reqArr(i.values(itc.numVec))})

t.bench(function bench_values_walk_array_as_is() {for (const val of itc.numArr) l.nop(val)})
t.bench(function bench_values_walk_array_values_native() {for (const val of itc.numArr.values()) l.nop(val)})
t.bench(function bench_values_walk_dict_by_for_in() {for (const key in itc.numDict) l.nop(itc.numDict[key])})
t.bench(function bench_values_walk_map_values_native() {for (const val of itc.numMap.values()) l.nop(val)})
t.bench(function bench_values_walk_set_direct() {for (const val of itc.numSet) l.nop(val)})
t.bench(function bench_values_walk_set_forEach() {itc.numSet.forEach(l.nop)})

// Note: the behavior below is not entirely equivalent; lodash uses string keys.
itc.deoptSeqHof(i.entries)
itc.deoptSeqHof(lo.entries)
t.bench(function bench_entries_array_native() {i.arr(itc.numArr.entries())})
t.bench(function bench_entries_array_lodash() {l.reqArr(lo.entries(itc.numArr))})
t.bench(function bench_entries_array_our_entries() {l.reqArr(i.entries(itc.numArr))})

t.bench(function bench_entries_dict_native() {l.reqArr(Object.entries(itc.numDict))})
t.bench(function bench_entries_dict_lodash() {l.reqArr(lo.entries(itc.numDict))})
t.bench(function bench_entries_dict_dumb() {l.reqArr(recEntriesDumb(itc.numDict))})
t.bench(function bench_entries_dict_our_entries() {l.reqArr(i.entries(itc.numDict))})

t.bench(function bench_entries_set_native() {i.arr(itc.numSet.entries())})
t.bench(function bench_entries_set_our_entries() {l.reqArr(i.entries(itc.numSet))})

t.bench(function bench_entries_map_native() {i.arr(itc.numMap.entries())})
t.bench(function bench_entries_map_our_entries() {l.reqArr(i.entries(itc.numMap))})

t.bench(function bench_entries_walk_array_inline() {
  let ind = -1
  while (++ind < itc.numArr.length) l.nop(ind, itc.numArr[ind])
})

t.bench(function bench_entries_walk_array_entries_native() {for (const [key, val] of itc.numArr.entries()) l.nop(key, val)})
t.bench(function bench_entries_walk_dict_by_for_in() {for (const key in itc.numDict) l.nop(key, itc.numDict[key])})
t.bench(function bench_entries_walk_map_entries_native() {for (const [key, val] of itc.numMap.entries()) l.nop(key, val)})

// TODO deopt `i.slice` and `lo.slice`.
t.bench(function bench_slice_array_native() {l.reqArr(itc.numArr.slice())})
t.bench(function bench_slice_array_lodash_slice() {l.reqArr(lo.slice(itc.numArr))})
t.bench(function bench_slice_array_our_slice() {l.reqArr(i.slice(itc.numArr))})

t.bench(function bench_slice_set_native_spread() {l.reqArr([...itc.numSet])})
t.bench(function bench_slice_set_our_slice() {l.reqArr(i.slice(itc.numSet))})

t.bench(function bench_indexOf_native() {l.reqNat(itc.numArr.indexOf(701))})
t.bench(function bench_indexOf_lodash() {l.reqNat(lo.indexOf(itc.numArr, 701))})
t.bench(function bench_indexOf_ours() {l.reqNat(i.indexOf(itc.numArr, 701))})

t.bench(function bench_includes_native() {l.reqBool(itc.numArr.includes(701))})
t.bench(function bench_includes_lodash() {l.reqBool(lo.includes(itc.numArr, 701))})
t.bench(function bench_includes_index_of() {l.reqBool(includesWithIndexOf(itc.numArr, 701))})
t.bench(function bench_includes_our_includes() {l.reqBool(i.includes(itc.numArr, 701))})

const includeValues = [0, 11, 101, 201, 301, 401, 501, 601, 701, 801, 901, 1001]
t.bench(function bench_includes_mul_native() {for (const val of includeValues) l.reqBool(itc.numArr.includes(val))})
t.bench(function bench_includes_mul_lodash() {for (const val of includeValues) l.reqBool(lo.includes(itc.numArr, val))})
t.bench(function bench_includes_mul_index_of() {for (const val of includeValues) l.reqBool(includesWithIndexOf(itc.numArr, val))})
t.bench(function bench_includes_mul_our_includes() {for (const val of includeValues) l.reqBool(i.includes(itc.numArr, val))})

t.bench(function bench_concat_array_0_lodash() {l.reqArr(lo.concat())})
t.bench(function bench_concat_array_0_ours() {l.reqArr(i.concat())})

t.bench(function bench_concat_array_1_native() {l.reqArr(itc.numArr.concat())})
t.bench(function bench_concat_array_1_lodash() {l.reqArr(lo.concat(itc.numArr))})
t.bench(function bench_concat_array_1_ours() {l.reqArr(i.concat(itc.numArr))})

t.bench(function bench_concat_array_2_native() {l.reqArr(itc.numArr.concat(itc.dictArr))})
t.bench(function bench_concat_array_2_lodash() {l.reqArr(lo.concat(itc.numArr, itc.dictArr))})
t.bench(function bench_concat_array_2_ours() {l.reqArr(i.concat(itc.numArr, itc.dictArr))})

t.bench(function bench_concat_array_3_native() {l.reqArr(itc.numArr.concat(itc.dictArr, itc.numArr))})
t.bench(function bench_concat_array_3_lodash() {l.reqArr(lo.concat(itc.numArr, itc.dictArr, itc.numArr))})
t.bench(function bench_concat_array_3_ours() {l.reqArr(i.concat(itc.numArr, itc.dictArr, itc.numArr))})

t.bench(function bench_concat_spread_arr() {l.reqArr(concatSpreadArr(itc.numArr, itc.dictArr))})
t.bench(function bench_concat_spread_values() {l.reqArr(concatSpreadValues(itc.numArr, itc.dictArr))})

t.bench(function bench_append_nil() {l.reqArr(i.append(undefined, 10))})
t.bench(function bench_append_nil_spread_arr() {l.reqArr(appendSpreadArr(undefined, 10))})
t.bench(function bench_append_nil_spread_values() {l.reqArr(appendSpreadValues(undefined, 10))})

t.bench(function bench_append_big() {l.reqArr(i.append(itc.numArr, 10))})
t.bench(function bench_append_big_spread_arr() {l.reqArr(appendSpreadArr(itc.numArr, 10))})
t.bench(function bench_append_big_spread_values() {l.reqArr(appendSpreadValues(itc.numArr, 10))})

t.bench(function bench_prepend() {l.reqArr(i.prepend(itc.numArr, 10))})
t.bench(function bench_prepend_spread_arr() {l.reqArr(prependSpreadArr(itc.numArr, 10))})
t.bench(function bench_prepend_spread_values() {l.reqArr(prependSpreadValues(itc.numArr, 10))})

t.bench(function bench_array_push_from_empty() {[].push(...itc.numArr)})

t.bench(function bench_array_push_from_empty_comparison() {
  [].push(...itc.numArr)
  l.nop(itc.numArr.slice())
})

t.bench(function bench_array_push_from_long() {
  itc.numArr.slice().push(...itc.numArr)
})

t.bench(function bench_array_unshift_from_empty() {[].unshift(...itc.numArr)})

t.bench(function bench_array_unshift_from_empty_comparison() {
  [].unshift(...itc.numArr)
  l.nop(itc.numArr.slice())
})

t.bench(function bench_array_unshift_from_long() {
  itc.numArr.slice().unshift(...itc.numArr)
})

t.eq(itc.numArr.slice(), itc.numArr.concat())
t.bench(function bench_copy_arr_flat_slice() {l.reqArr(itc.numArr.slice())})
t.bench(function bench_copy_arr_flat_concat() {l.reqArr(itc.numArr.concat())})

t.eq(itc.numArrNested.slice(), itc.numArrNested.concat())
t.bench(function bench_copy_arr_nested_slice() {l.reqArr(itc.numArrNested.slice())})
t.bench(function bench_copy_arr_nested_concat() {l.reqArr(itc.numArrNested.concat())})

itc.deoptWith(fun => l.reqInt(itc.numArr.reduce(fun, 0)))
itc.deoptWith(fun => l.reqInt(foldArrayDumb(itc.numArr, 0, fun)))
itc.deoptWith(fun => l.reqInt(i.fold(itc.numArr, 0, fun)))
itc.deoptWith(fun => l.reqInt(lo.reduce(itc.numArr, fun, 0)))
itc.deoptWith(fun => l.reqInt(foldForOfWithValues(itc.numArr, 0, fun)))
itc.deoptWith(fun => l.reqInt(foldForOfNaive(itc.numArr, 0, fun)))
itc.deoptWith(fun => l.reqInt(foldDictDumb(itc.numDict, 0, fun)))
itc.deoptWith(fun => l.reqInt(i.fold(itc.numDict, 0, fun)))
itc.deoptWith(fun => l.reqInt(lo.reduce(itc.numDict, fun, 0)))
t.bench(function bench_fold_array_native() {l.reqInt(itc.numArr.reduce(l.add, 0))})
t.bench(function bench_fold_array_lodash() {l.reqInt(lo.reduce(itc.numArr, l.add, 0))})
t.bench(function bench_fold_array_with_for_of_our_values() {l.reqInt(foldForOfWithValues(itc.numArr, 0, l.add))})
t.bench(function bench_fold_array_with_for_of_naive() {l.reqInt(foldForOfNaive(itc.numArr, 0, l.add))})
t.bench(function bench_fold_array_dumb() {l.reqInt(foldArrayDumb(itc.numArr, 0, l.add))})
t.bench(function bench_fold_array_our_fold() {l.reqInt(i.fold(itc.numArr, 0, l.add))})

t.bench(function bench_fold_dict_dumb() {l.reqInt(foldDictDumb(itc.numDict, 0, l.add))})
t.bench(function bench_fold_dict_lodash() {l.reqInt(lo.reduce(itc.numDict, l.add, 0))})
t.bench(function bench_fold_dict_our_fold() {l.reqInt(i.fold(itc.numDict, 0, l.add))})

// Native seems significantly faster than ours, TODO review.
itc.deoptNativeListHof(itc.numArr.find)
itc.deoptSeqHof(lo.find)
itc.deoptCollHof(i.find)
itc.deoptSeqHof(findForOfNaive)
t.bench(function bench_find_array_native() {l.reqInt(itc.numArr.find(val => val === 501))})
t.bench(function bench_find_array_lodash() {l.reqInt(lo.find(itc.numArr, val => val === 501))})
t.bench(function bench_find_array_for_of_naive() {l.reqInt(findForOfNaive(itc.numArr, val => val === 501))})
t.bench(function bench_find_array_our_find() {l.reqInt(i.find(itc.numArr, val => val === 501))})

itc.deoptCollHof(i.procure)
t.bench(function bench_procure_nil() {l.nop(i.procure(undefined, l.False))})
t.bench(function bench_procure_empty() {l.nop(i.procure(itc.arrEmpty, l.False))})
t.bench(function bench_procure_arr_miss() {l.nop(i.procure(itc.numArr, l.False))})
t.bench(function bench_procure_arr_hit() {l.nop(i.procure(itc.numArr, l.True))})

t.bench(function bench_procure_arr_hit_inline() {
  for (const src of itc.numArr) {
    const val = l.True(src)
    if (val) return val
  }
  return undefined
})

itc.deoptNativeListHof(itc.numArr.map)
itc.deoptSeqHof(lo.map)
itc.deoptListHof(mapDumb)
itc.deoptListHof(mapWithMapMutSpecialized)
itc.deoptListHof(mapWithMapMutShared)
itc.deoptCollHof(i.map)
itc.deoptDictHof(mapDictValuesSpecialized)
t.bench(function bench_map_array_native() {l.reqArr(itc.numArr.map(l.inc))})
t.bench(function bench_map_array_lodash() {l.reqArr(lo.map(itc.numArr, l.inc))})
t.bench(function bench_map_array_dumb() {l.reqArr(mapDumb(itc.numArr, l.inc))})
t.bench(function bench_map_array_map_mut_specialized() {l.reqArr(mapWithMapMutSpecialized(itc.numArr, l.inc))})
t.bench(function bench_map_array_map_mut_shared() {l.reqArr(mapWithMapMutShared(itc.numArr, l.inc))})
t.bench(function bench_map_array_our_map() {l.reqArr(i.map(itc.numArr, l.inc))})

t.bench(function bench_map_dict_values_specialized() {l.reqArr(mapDictValuesSpecialized(itc.numDict, l.inc))})
t.bench(function bench_map_dict_values_our_map() {l.reqArr(i.map(itc.numDict, l.inc))})
t.bench(function bench_map_set_with_our_map() {l.reqArr(i.map(itc.numSet, l.inc))})

itc.deoptCollClsHof(mapClsDumb)
itc.deoptCollClsHof(mapClsClosure)
itc.deoptCollClsHof(i.mapCls)
t.bench(function bench_mapCls_array_dumb() {l.reqArr(mapClsDumb(itc.numArr, Nop))})
t.bench(function bench_mapCls_array_closure() {l.reqArr(mapClsClosure(itc.numArr, Nop))})
t.bench(function bench_mapCls_array_actual() {l.reqArr(i.mapCls(itc.numArr, Nop))})

itc.deoptSeqHof(mapCompactDumb)
itc.deoptSeqHof(i.mapCompact)
t.bench(function bench_mapCompact_with_native_map_and_filter() {l.reqArr(itc.numArr.map(l.id).filter(l.id))})
t.bench(function bench_mapCompact_with_lodash_chain() {l.reqArr(lo.chain(itc.numArr).map(l.id).compact().value())})
t.bench(function bench_mapCompact_with_lodash_map_and_compact() {l.reqArr(lo.compact(lo.map(itc.numArr, l.id)))})
t.bench(function bench_mapCompact_dumb() {l.reqArr(mapCompactDumb(itc.numArr, l.id))})
t.bench(function bench_mapCompact_with_our_mapCompact() {l.reqArr(i.mapCompact(itc.numArr, l.id))})

itc.deoptNativeListHof(itc.numArr.filter)
itc.deoptSeqHof(lo.filter)
itc.deoptSeqHof(genFilter)
itc.deoptSeqHof(filterDumb)
itc.deoptCollHof(i.filter)
t.bench(function bench_filter_nums_native() {l.reqArr(itc.numArr.filter(l.id))})
t.bench(function bench_filter_nums_lodash() {l.reqArr(lo.filter(itc.numArr, l.id))})
t.bench(function bench_filter_nums_gen() {i.arr(genFilter(itc.numArr, l.id))})
t.bench(function bench_filter_nums_dumb() {l.reqArr(filterDumb(itc.numArr, l.id))})
t.bench(function bench_filter_nums_our_filter() {l.reqArr(i.filter(itc.numArr, l.id))})

itc.deoptNativeListHof(itc.dictArr.filter)
t.bench(function bench_filter_dicts_with_native_filter() {
  l.reqArr(itc.dictArr.filter(val => val.val === 0))
})

itc.deoptSeqHof(lo.filter)
t.bench(function bench_filter_dicts_with_lodash_filter() {
  l.reqArr(lo.filter(itc.dictArr, val => val.val === 0))
})

itc.deoptSeqHof(genFilter)
t.bench(function bench_filter_dicts_with_gen() {
  i.arr(genFilter(itc.dictArr, val => val.val === 0))
})

itc.deoptCollHof(i.filter)
t.bench(function bench_filter_dicts_with_our_filter() {
  l.reqArr(i.filter(itc.dictArr, val => val.val === 0))
})

itc.deoptNativeListHof(itc.mapArr.filter)
t.bench(function bench_filter_maps_with_native_filter() {
  l.reqArr(itc.mapArr.filter(val => val.get(`val`) === 0))
})

itc.deoptSeqHof(lo.filter)
t.bench(function bench_filter_maps_with_lodash_filter() {
  l.reqArr(lo.filter(itc.mapArr, val => val.get(`val`) === 0))
})

itc.deoptSeqHof(genFilter)
t.bench(function bench_filter_maps_with_gen() {
  i.arr(genFilter(itc.mapArr, val => val.get(`val`) === 0))
})

itc.deoptSeqHof(filterDumb)
t.bench(function bench_filter_maps_with_dumb_filter() {
  l.reqArr(filterDumb(itc.mapArr, val => val.get(`val`) === 0))
})

itc.deoptCollHof(i.filter)
t.bench(function bench_filter_maps_with_our_filter() {
  l.reqArr(i.filter(itc.mapArr, val => val.get(`val`) === 0))
})

// TODO add deopt.
t.bench(function bench_compact_native_filter() {l.reqArr(itc.numArr.filter(l.id))})
t.bench(function bench_compact_lodash_compact() {l.reqArr(lo.compact(itc.numArr))})
t.bench(function bench_compact_dumb() {l.reqArr(compactDumb(itc.numArr))})
t.bench(function bench_compact_our_filter() {l.reqArr(i.filter(itc.numArr, l.id))})
t.bench(function bench_compact_our_compact() {l.reqArr(i.compact(itc.numArr))})

t.bench(function bench_map_and_fold_nums_with_gen() {
  l.reqInt(i.fold(genMap(itc.numArr, l.inc), 0, l.add))
})

t.bench(function bench_map_and_fold_nums_with_our_map() {
  l.reqInt(i.fold(i.map(itc.numArr, l.inc), 0, l.add))
})

t.bench(function bench_filter_and_map_and_fold_nums_with_native() {
  l.reqInt(itc.numArr.filter(l.id).map(l.inc).reduce(l.add, 0))
})

t.bench(function bench_filter_and_map_and_fold_nums_with_lodash_lazy() {
  l.reqInt(lo.chain(itc.numArr).filter(l.id).map(l.inc).reduce(l.add, 0).value())
})

t.bench(function bench_filter_and_map_and_fold_nums_with_lodash_eager() {
  l.reqInt(lo.reduce(lo.map(lo.filter(itc.numArr, l.id), l.inc), l.add, 0))
})

t.bench(function bench_filter_and_map_and_fold_nums_with_ours() {
  l.reqInt(i.fold(i.map(i.filter(itc.numArr, l.id), l.inc), 0, l.add))
})

// Seems horribly slow with or without this call.
itc.deoptArrayFrom(Array)
t.bench(function bench_array_from_simple_native() {l.reqArr(Array.from(itc.numArr))})
t.bench(function bench_array_from_simple_ours_arr() {l.reqArr(i.arr(itc.numArr))})
t.bench(function bench_array_from_simple_ours_slice() {l.reqArr(i.slice(itc.numArr))})

t.bench(function bench_array_from_mapped_native() {l.reqArr(Array.from(itc.numArr, l.inc))})
t.bench(function bench_array_from_mapped_ours() {l.reqArr(i.map(itc.numArr, l.inc))})

t.bench(function bench_array_fill_native() {l.reqArr(Array(itc.size).fill(123))})
t.bench(function bench_array_fill_repeat() {l.reqArr(repeat(itc.size, 123))})

itc.deoptNativeListHof(itc.numArr.forEach)
itc.deoptCollHof(lo.each)
itc.deoptListHof(arrayEachDumb)
itc.deoptCollHof(i.each)
t.bench(function bench_each_array_inline() {for (const val of itc.numArr) l.nop(val)})
t.bench(function bench_each_array_native_forEach() {itc.numArr.forEach(l.nop)})
t.bench(function bench_each_array_lodash_each() {lo.each(itc.numArr, l.nop)})
t.bench(function bench_each_array_dumb() {arrayEachDumb(itc.numArr, l.nop)})
t.bench(function bench_each_array_our_each() {i.each(itc.numArr, l.nop)})

t.bench(function bench_each_entries_array_inline() {
  for (const [key, val] of itc.numArr.entries()) l.nop(key, val)
})

t.bench(function bench_each_entries_array_almost_indirect() {
  for (const [key, val] of numVecWithEntries.toArray().entries()) l.nop(key, val)
})

/*
At the time of writing, in V8 10.4.132.20, this is significantly slower (≈x2)
than "direct" use of a true array's `.entries` in the loop.
*/
t.bench(function bench_each_entries_array_actually_indirect() {
  for (const [key, val] of numVecWithEntries.entries()) l.nop(key, val)
})

t.bench(function bench_each_dict_inline() {for (const key in itc.numDict) l.nop(key, itc.numDict[key])})
t.bench(function bench_each_dict_lodash_each() {lo.each(itc.numDict, l.nop)})
t.bench(function bench_each_dict_our_each() {i.each(itc.numDict, l.nop)})

t.bench(function bench_each_set_inline() {for (const val of itc.numSet.values()) l.nop(val)})
t.bench(function bench_each_set_our_each() {i.each(itc.numSet, l.nop)})

t.bench(function bench_each_map_inline() {for (const val of itc.numMap.values()) l.nop(val)})
t.bench(function bench_each_map_our_each() {i.each(itc.numMap, l.nop)})

t.bench(function bench_each_vec_inline() {for (const val of itc.numVec) l.nop(val)})
t.bench(function bench_each_vec_our_each() {i.each(itc.numVec, l.nop)})

/*
At the time of writing, our version is around 20 times faster than the versions
using native and lodash reverse (in V8). All versions have the same overhead of
copying the array, which is several times faster than the fastest reversal.
*/
itc.deoptCollFun(reverseUsingLodash)
itc.deoptCollFun(reverseUsingNative)
itc.deoptCollFun(reverseUsingOurs)
t.bench(function bench_reverse_using_lodash() {l.nop(reverseUsingLodash(itc.numArr))})
t.bench(function bench_reverse_using_native() {l.nop(reverseUsingNative(itc.numArr))})
t.bench(function bench_reverse_using_ours() {l.nop(reverseUsingOurs(itc.numArr))})

itc.deoptSeqHof(lo.groupBy)
itc.deoptCollHof(i.group)
t.bench(function bench_group_with_lodash_groupBy() {l.reqRec(lo.groupBy(itc.numArr, l.id))})
t.bench(function bench_group_with_our_group() {l.reqRec(i.group(itc.numArr, l.id))})

itc.deoptSeqHof(lo.keyBy)
itc.deoptCollHof(i.index)
t.bench(function bench_index_with_lodash_keyBy() {l.reqRec(lo.keyBy(itc.numArr, l.id))})
t.bench(function bench_index_with_our_index() {l.reqRec(i.index(itc.numArr, l.id))})

t.bench(function bench_long_transform0_with_native() {
  l.reqArr(itc.numArr.map(l.inc).map(l.dec).map(double).filter(l.id))
})

t.bench(function bench_long_transform0_with_lodash_chain() {
  l.reqArr(lo.chain(itc.numArr).map(l.inc).map(l.dec).map(double).compact().value())
})

t.bench(function bench_long_transform0_with_lodash_eager() {
  l.reqArr(lo.compact(lo.map(lo.map(lo.map(itc.numArr, l.inc), l.dec), double)))
})

t.bench(function bench_long_transform0_with_our_eager() {
  l.reqArr(i.compact(i.map(i.map(i.map(itc.numArr, l.inc), l.dec), double)))
})

t.bench(function bench_long_transform1_with_native() {
  l.reqArr(itc.numArr.map(double).filter(l.id).map(String).filter(isKeyEven))
})

t.bench(function bench_long_transform1_with_lodash_chain() {
  l.reqArr(lo.chain(itc.numArr).map(double).compact().map(String).filter(isKeyEven).value())
})

t.bench(function bench_long_transform1_with_lodash_eager() {
  l.reqArr(lo.filter(lo.map(lo.compact(lo.map(itc.numArr, double)), String), isKeyEven))
})

t.bench(function bench_long_transform1_with_our_eager() {
  l.reqArr(i.map(i.filter(i.entries(i.map(i.compact(i.map(itc.numArr, double)), String)), isEntryKeyEven), entryVal))
})

t.bench(function bench_count_loop_inline_asc() {
  let ind = -1
  while (++ind <= itc.size) l.nop(ind)
})

t.bench(function bench_count_loop_inline_desc() {
  let rem = itc.size
  while (--rem > 0) l.nop(rem)
})

t.bench(function bench_count_loop_span_gen() {for (const val of genSpan(itc.size)) l.nop(val)})
t.bench(function bench_count_loop_span_dumb() {for (const val of spanDumb(itc.size)) l.nop(val)})
t.bench(function bench_count_loop_span_iter() {for (const val of new SpanIter(itc.size)) l.nop(val)})
t.bench(function bench_count_loop_span_our_span() {for (const val of i.span(itc.size)) l.nop(val)})

t.bench(function bench_zip_with_native() {l.reqRec(Object.fromEntries(itc.numEntries))})
t.bench(function bench_zip_with_ours() {l.reqRec(i.zip(itc.numEntries))})

// Stupidly expensive on records. May consider not supporting.
itc.deoptCollFun(headFromValues)
itc.deoptCollFun(i.head)
t.bench(function bench_head_arr_from_values() {l.nop(headFromValues(itc.numArr))})
t.bench(function bench_head_arr_with_our_head() {l.nop(i.head(itc.numArr))})

t.bench(function bench_head_dict_from_values() {l.nop(headFromValues(itc.numDict))})
t.bench(function bench_head_dict_with_our_head() {l.nop(i.head(itc.numDict))})

t.bench(function bench_head_set_from_values() {l.nop(headFromValues(itc.numSet))})
t.bench(function bench_head_set_with_our_head() {l.nop(i.head(itc.numSet))})

t.bench(function bench_head_map_from_values() {l.nop(headFromValues(itc.numMap))})
t.bench(function bench_head_map_with_our_head() {l.nop(i.head(itc.numMap))})

t.bench(function bench_head_vec_from_values() {l.nop(headFromValues(itc.numVec))})
t.bench(function bench_head_vec_with_our_head() {l.nop(i.head(itc.numVec))})

// Stupidly expensive on any non-list. May consider supporting ONLY lists.
itc.deoptSeqFun(lo.last)
itc.deoptCollFun(i.last)
t.bench(function bench_last_arr_with_lodash() {l.nop(lo.last(itc.numArr))})
t.bench(function bench_last_arr_with_our_last() {l.nop(i.last(itc.numArr))})

t.bench(function bench_last_list_with_lodash() {l.nop(lo.last(itc.numArgs))})
t.bench(function bench_last_list_with_our_last() {l.nop(i.last(itc.numArgs))})

t.bench(function bench_last_dict_with_our_last() {l.nop(i.last(itc.numDict))})
t.bench(function bench_last_set_with_our_last() {l.nop(i.last(itc.numSet))})
t.bench(function bench_last_map_with_our_last() {l.nop(i.last(itc.numMap))})

t.bench(function bench_flat_arr_nil_ours() {l.nop(i.flat())})

t.bench(function bench_flat_arr_empty_native() {l.nop(itc.arrEmpty.flat(Infinity))})
t.bench(function bench_flat_arr_empty_lodash() {l.nop(lo.flatten(itc.arrEmpty))})
t.bench(function bench_flat_arr_empty_ours() {l.nop(i.flat(itc.arrEmpty))})

t.bench(function bench_flat_arr_short_flat_native() {l.nop(itc.arrShort.flat(Infinity))})
t.bench(function bench_flat_arr_short_flat_lodash() {l.nop(lo.flatten(itc.arrShort))})
t.bench(function bench_flat_arr_short_flat_ours() {l.nop(i.flat(itc.arrShort))})

t.bench(function bench_flat_arr_short_nested_native() {l.nop(itc.arrShortNested.flat(Infinity))})
t.bench(function bench_flat_arr_short_nested_lodash() {l.nop(lo.flatten(itc.arrShortNested))})
t.bench(function bench_flat_arr_short_nested_ours() {l.nop(i.flat(itc.arrShortNested))})

t.bench(function bench_flat_arr_long_flat_native() {l.nop(itc.numArr.flat(Infinity))})
t.bench(function bench_flat_arr_long_flat_lodash() {l.nop(lo.flatten(itc.numArr))})
t.bench(function bench_flat_arr_long_flat_ours() {l.nop(i.flat(itc.numArr))})

t.bench(function bench_flat_arr_long_nested_native() {l.nop(itc.numArrNested.flat(Infinity))})
t.bench(function bench_flat_arr_long_nested_lodash() {l.nop(lo.flatten(itc.numArrNested))})
t.bench(function bench_flat_arr_long_nested_ours() {l.nop(i.flat(itc.numArrNested))})

itc.deoptDictHof(lo.mapValues)
itc.deoptDictHof(i.mapDict)
t.bench(function bench_map_dict_lodash_mapValues() {l.reqRec(lo.mapValues(itc.numDict, l.inc))})
t.bench(function bench_map_dict_our_mapDict() {l.reqRec(i.mapDict(itc.numDict, l.inc))})

itc.deoptDictHof(lo.pickBy)
itc.deoptDictHof(i.pick)
t.bench(function bench_pick_lodash_pickBy() {l.reqRec(lo.pickBy(itc.numDict, isEven))})
t.bench(function bench_pick_our_pick() {l.reqRec(i.pick(itc.numDict, isEven))})

itc.deoptDictHof(lo.omitBy)
itc.deoptDictHof(i.omit)
t.bench(function bench_omit_lodash_omitBy() {l.reqRec(lo.omitBy(itc.numDict, isEven))})
t.bench(function bench_omit_our_omit() {l.reqRec(i.omit(itc.numDict, isEven))})

t.bench(function bench_pickKeys_lodash_pick() {l.reqRec(lo.pick(itc.numDict, itc.knownKeys))})
t.bench(function bench_pickKeys_our_pickKeys() {l.reqRec(i.pickKeys(itc.numDict, itc.knownKeys))})

t.bench(function bench_omitKeys_lodash_omit() {l.reqRec(lo.omit(itc.numDict, itc.knownKeys))})
t.bench(function bench_omitKeys_our_omitKeys() {l.reqRec(i.omitKeys(itc.numDict, itc.knownKeys))})

if (import.meta.main) t.deopt(), t.benches()

/* Util */

function foldArrayDumb(val, acc, fun) {
  let ind = -1
  while (++ind < val.length) acc = fun(acc, val[ind])
  return acc
}

function foldDictDumb(val, acc, fun) {
  for (const key in val) acc = fun(acc, val[key])
  return acc
}

function foldForOfWithValues(val, acc, fun) {
  for (const elem of i.values(val)) acc = fun(acc, elem)
  return acc
}

function foldForOfNaive(val, acc, fun) {
  for (const elem of val) acc = fun(acc, elem)
  return acc
}

function findForOfNaive(val, fun) {
  for (const elem of val) if (fun(elem)) return elem
  return undefined
}

function mapCompactDumb(val, fun) {
  val = i.arr(val)
  l.reqFun(fun)

  const out = []
  let ind = -1
  while (++ind < val.length) {
    const elem = fun(val[ind])
    if (elem) out.push(elem)
  }
  return out
}

function* genFilter(vals, fun, ...args) {
  l.reqFun(fun)
  for (const val of i.values(vals)) if (fun(val, ...args)) yield val
}

function* genMap(vals, fun, ...args) {
  l.reqFun(fun)
  for (const val of i.values(vals)) yield fun(val, ...args)
}

function* genSpan(len) {
  l.reqNat(len)
  let i = -1
  while (++i < len) yield i
}

function filterDumb(val, fun) {
  val = i.arr(val)
  l.reqFun(fun)
  const out = []
  let ind = -1
  while (++ind < val.length) {
    const elem = val[ind]
    if (fun(elem)) out.push(elem)
  }
  return out
}

function mapDumb(val, fun) {
  const buf = Array(l.reqNat(val.length))
  l.reqFun(fun)
  let ind = -1
  while (++ind < val.length) buf[ind] = fun(val[ind], ind)
  return buf
}

function mapWithMapMutSpecialized(val, fun) {
  return mapMutSpecialized(Array.prototype.slice.call(val), fun)
}

function mapWithMapMutShared(val, fun) {
  return i.mapMut(Array.prototype.slice.call(val), fun)
}

function mapMutSpecialized(val, fun) {
  l.reqList(val)
  l.reqFun(fun)
  let ind = -1
  while (++ind < val.length) val[ind] = fun(val[ind], ind)
  return val
}

function mapDictValuesSpecialized(val, fun) {
  l.reqDict(val)
  l.reqFun(fun)
  const buf = Object.keys(val)
  let ind = -1
  while (++ind < buf.length) buf[ind] = fun(val[buf[ind]])
  return buf
}

function compactDumb(val) {
  l.reqList(val)
  const out = []
  let ind = -1
  while (++ind < val.length) {
    const elem = val[ind]
    if (elem) out.push(elem)
  }
  return out
}

function includesWithIndexOf(val, elem) {return i.indexOf(val, elem) >= 0}

function recKeysByForIn(src) {
  const out = []
  for (const key in src) out.push(key)
  return out
}

function recValuesByKeyList(src) {
  const buf = Object.keys(src)
  let ind = -1
  while (++ind < buf.length) buf[ind] = src[buf[ind]]
  return buf
}

function recValuesByForIn(src) {
  const out = []
  for (const key in src) out.push(src[key])
  return out
}

function recEntriesDumb(src) {
  const buf = Object.keys(src)
  let ind = -1
  while (++ind < buf.length) {
    const key = buf[ind]
    buf[ind] = [key, src[key]]
  }
  return buf
}

function spanDumb(len) {
  l.reqNat(len)
  const out = Array(len)
  let ind = -1
  while (++ind < len) out[ind] = ind
  return out
}

function arrayEachDumb(src, fun) {
  l.reqList(src)
  let ind = -1
  while (++ind < src.length) fun(src[ind])
}

function concatSpreadArr (one, two) {return [...i.arr(one), ...i.arr(two)]}
function concatSpreadValues (one, two) {return [...i.values(one), ...i.values(two)]}
function appendSpreadArr (val, elem) {return [...i.arr(val), elem]}
function appendSpreadValues (val, elem) {return [...i.values(val), elem]}
function prependSpreadArr (val, elem) {return [elem, ...i.arr(val)]}
function prependSpreadValues (val, elem) {return [elem, ...i.values(val)]}

function isKeyEven(_, key) {return !(key % 2)}
function isEntryKeyEven(val) {return !(val[0] % 2)}
function entryVal(val) {return val[1]}
function double(val) {return val * 2}

function valuesFromSetSpecialized(src) {
  l.reqInst(src, Set)
  const out = Array(src.size)
  let ind = -1
  for (const val of src.values()) out[++ind] = val
  return out
}

function valuesFromMapSpecialized(src) {
  l.reqInst(src, Map)
  const out = Array(src.size)
  let ind = -1
  for (const val of src.values()) out[++ind] = val
  return out
}

function repeat(len, val) {
  const buf = i.alloc(len)
  let ind = -1
  while (++ind < buf.length) buf[ind] = val
  return buf
}

function headFromValues(val) {return i.values(val)[0]}

function isEven(val) {return !(val % 2)}

function mapClsDumb(src, cls) {
  l.reqCls(cls)
  src = i.valuesCopy(src)
  const len = src.length
  let ind = -1
  while (++ind < len) src[ind] = new cls(src[ind])
  return src
}

function mapClsClosure(src, cls) {
  l.reqCls(cls)
  return i.map(src, function make(val) {return new cls(val)})
}
