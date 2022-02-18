import './internal_test_init.mjs'
import * as lo from 'https://cdn.jsdelivr.net/npm/lodash-es/lodash.js'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'

itc.deoptSeqHof(i.arr)
t.bench(function bench_arr_spread_native() {l.reqArr([...itc.numArgs])})
t.bench(function bench_arr_gen_spread_native() {l.reqArr([...itc.gen(itc.numArgs)])})
t.bench(function bench_arr_our_arr_from_array_nums() {i.arr(itc.numList)})
t.bench(function bench_arr_our_arr_from_array_dicts() {i.arr(itc.dictList)})
t.bench(function bench_arr_our_arr_from_arguments() {i.arr(itc.numArgs)})
t.bench(function bench_arr_our_arr_from_gen() {i.arr(itc.gen(itc.numArgs))})

itc.deoptSeqHof(i.keys)
t.bench(function bench_keys_array_native_spread() {l.reqArr([...itc.numList.keys()])})
t.bench(function bench_keys_array_native_our_arr() {i.arr(itc.numList.keys())})
t.bench(function bench_keys_array_our_keys() {l.reqArr(i.keys(itc.numList))})
t.bench(function bench_keys_array_lodash() {l.reqArr(lo.keys(itc.numList))})
t.bench(function bench_keys_dict_native() {l.reqArr(Object.keys(itc.numDict))})
t.bench(function bench_keys_dict_by_for_in() {l.reqArr(structKeysByForIn(itc.numDict))})
t.bench(function bench_keys_dict_our_keys() {l.reqArr(i.keys(itc.numDict))})
t.bench(function bench_keys_dict_lodash() {l.reqArr(lo.keys(itc.numDict))})
t.bench(function bench_keys_set_native() {l.reqArr([...itc.numSet.keys()])})
t.bench(function bench_keys_set_our_keys() {l.reqArr(i.keys(itc.numSet))})
t.bench(function bench_keys_map_native() {l.reqArr([...itc.numMap.keys()])})
t.bench(function bench_keys_map_our_keys() {l.reqArr(i.keys(itc.numMap))})

itc.deoptSeqHof(i.values)
t.bench(function bench_values_array_native() {i.arr(itc.numList.values())})
t.bench(function bench_values_array_our_values() {l.reqArr(i.values(itc.numList))})
t.bench(function bench_values_array_lodash() {l.reqArr(lo.values(itc.numList))})
t.bench(function bench_values_dict_native() {l.reqArr(Object.values(itc.numDict))})
t.bench(function bench_values_dict_by_for_in() {l.reqArr(structValuesByForIn(itc.numDict))})
t.bench(function bench_values_dict_by_key_list() {l.reqArr(structValuesByKeyList(itc.numDict))})
t.bench(function bench_values_dict_our_values() {l.reqArr(i.values(itc.numDict))})
t.bench(function bench_values_dict_lodash() {l.reqArr(lo.values(itc.numDict))})
t.bench(function bench_values_set_native() {i.arr(itc.numSet.values())})
t.bench(function bench_values_set_specialized() {l.reqArr(valuesFromSetSpecialized(itc.numSet))})
t.bench(function bench_values_set_our_values() {l.reqArr(i.values(itc.numSet))})
t.bench(function bench_values_map_native() {i.arr(itc.numMap.values())})
t.bench(function bench_values_map_specialized() {l.reqArr(valuesFromMapSpecialized(itc.numMap))})
t.bench(function bench_values_map_our_values() {l.reqArr(i.values(itc.numMap))})

t.bench(function bench_values_walk_array_as_is() {for (const val of itc.numList) l.nop(val)})
t.bench(function bench_values_walk_array_values_native() {for (const val of itc.numList.values()) l.nop(val)})
t.bench(function bench_values_walk_dict_by_for_in() {for (const key in itc.numDict) l.nop(itc.numDict[key])})
t.bench(function bench_values_walk_map_values_native() {for (const val of itc.numMap.values()) l.nop(val)})

// Note: the behavior below is not entirely equivalent; lodash uses string keys.
itc.deoptSeqHof(i.entries)
itc.deoptSeqHof(lo.entries)
t.bench(function bench_entries_array_native() {i.arr(itc.numList.entries())})
t.bench(function bench_entries_array_our_entries() {l.reqArr(i.entries(itc.numList))})
t.bench(function bench_entries_array_lodash() {l.reqArr(lo.entries(itc.numList))})
t.bench(function bench_entries_dict_native() {l.reqArr(Object.entries(itc.numDict))})
t.bench(function bench_entries_dict_our_entries() {l.reqArr(i.entries(itc.numDict))})
t.bench(function bench_entries_dict_dumb() {l.reqArr(structEntriesDumb(itc.numDict))})
t.bench(function bench_entries_dict_lodash() {l.reqArr(lo.entries(itc.numDict))})
t.bench(function bench_entries_set_native() {i.arr(itc.numSet.entries())})
t.bench(function bench_entries_set_our_entries() {l.reqArr(i.entries(itc.numSet))})
t.bench(function bench_entries_map_native() {i.arr(itc.numMap.entries())})
t.bench(function bench_entries_map_our_entries() {l.reqArr(i.entries(itc.numMap))})

t.bench(function bench_entries_walk_array_inline() {
  let ind = -1
  while (++ind < itc.numList.length) l.nop(ind, itc.numList[ind])
})

t.bench(function bench_entries_walk_array_entries_native() {for (const [key, val] of itc.numList.entries()) l.nop(key, val)})
t.bench(function bench_entries_walk_dict_by_for_in() {for (const key in itc.numDict) l.nop(key, itc.numDict[key])})
t.bench(function bench_entries_walk_map_entries_native() {for (const [key, val] of itc.numMap.entries()) l.nop(key, val)})

// TODO deopt `i.slice` and `lo.slice`.
t.bench(function bench_slice_array_native() {l.reqArr(itc.numList.slice())})
t.bench(function bench_slice_array_our_slice() {l.reqArr(i.slice(itc.numList))})
t.bench(function bench_slice_array_lodash_slice() {l.reqArr(lo.slice(itc.numList))})
t.bench(function bench_slice_set_native_spread() {l.reqArr([...itc.numSet])})
t.bench(function bench_slice_set_our_slice() {l.reqArr(i.slice(itc.numSet))})

// Currently suboptimal, TODO fix.
t.bench(function bench_indexOf_ours() {l.reqNat(i.indexOf(itc.numList, 701))})
t.bench(function bench_indexOf_lodash() {l.reqNat(lo.indexOf(itc.numList, 701))})
t.bench(function bench_indexOf_native() {l.reqNat(itc.numList.indexOf(701))})

t.bench(function bench_includes_our_includes() {l.reqBool(i.includes(itc.numList, 701))})
t.bench(function bench_includes_index_of() {l.reqBool(includesWithIndexOf(itc.numList, 701))})
t.bench(function bench_includes_native() {l.reqBool(itc.numList.includes(701))})
t.bench(function bench_includes_lodash() {l.reqBool(lo.includes(itc.numList, 701))})
t.bench(function bench_concat_array_ours() {l.reqArr(i.concat(itc.numList, itc.dictList))})
t.bench(function bench_concat_array_native() {l.reqArr(itc.numList.concat(itc.dictList))})
t.bench(function bench_concat_array_lodash() {l.reqArr(lo.concat(itc.numList, itc.dictList))})
t.bench(function bench_concat_spread_arr() {l.reqArr(concatSpreadArr(itc.numList, itc.dictList))})
t.bench(function bench_concat_spread_values() {l.reqArr(concatSpreadValues(itc.numList, itc.dictList))})
t.bench(function bench_append() {l.reqArr(i.append(itc.numList, 10))})
t.bench(function bench_append_spread_arr() {l.reqArr(appendSpreadArr(itc.numList, 10))})
t.bench(function bench_append_spread_values() {l.reqArr(appendSpreadValues(itc.numList, 10))})
t.bench(function bench_prepend() {l.reqArr(i.prepend(itc.numList, 10))})
t.bench(function bench_prepend_spread_arr() {l.reqArr(prependSpreadArr(itc.numList, 10))})
t.bench(function bench_prepend_spread_values() {l.reqArr(prependSpreadValues(itc.numList, 10))})

itc.deoptWith(fun => l.reqInt(itc.numList.reduce(fun, 0)))
itc.deoptWith(fun => l.reqInt(foldArrayDumb(itc.numList, 0, fun)))
itc.deoptWith(fun => l.reqInt(i.fold(itc.numList, 0, fun)))
itc.deoptWith(fun => l.reqInt(lo.reduce(itc.numList, fun, 0)))
itc.deoptWith(fun => l.reqInt(foldForOfWithValues(itc.numList, 0, fun)))
itc.deoptWith(fun => l.reqInt(foldForOfNaive(itc.numList, 0, fun)))
itc.deoptWith(fun => l.reqInt(foldDictDumb(itc.numDict, 0, fun)))
itc.deoptWith(fun => l.reqInt(i.fold(itc.numDict, 0, fun)))
itc.deoptWith(fun => l.reqInt(lo.reduce(itc.numDict, fun, 0)))
t.bench(function bench_fold_array_native() {l.reqInt(itc.numList.reduce(l.add, 0))})
t.bench(function bench_fold_array_dumb() {l.reqInt(foldArrayDumb(itc.numList, 0, l.add))})
t.bench(function bench_fold_array_our_fold() {l.reqInt(i.fold(itc.numList, 0, l.add))})
t.bench(function bench_fold_array_lodash() {l.reqInt(lo.reduce(itc.numList, l.add, 0))})
t.bench(function bench_fold_array_with_for_of_our_values() {l.reqInt(foldForOfWithValues(itc.numList, 0, l.add))})
t.bench(function bench_fold_array_with_for_of_naive() {l.reqInt(foldForOfNaive(itc.numList, 0, l.add))})
t.bench(function bench_fold_dict_dumb() {l.reqInt(foldDictDumb(itc.numDict, 0, l.add))})
t.bench(function bench_fold_dict_our_fold() {l.reqInt(i.fold(itc.numDict, 0, l.add))})
t.bench(function bench_fold_dict_lodash() {l.reqInt(lo.reduce(itc.numDict, l.add, 0))})

// Native seems significantly faster than ours, TODO review.
itc.deoptNativeListHof(itc.numList.find)
itc.deoptCollHof(i.find)
itc.deoptSeqHof(lo.find)
itc.deoptSeqHof(findForOfNaive)
t.bench(function bench_find_array_native() {l.reqInt(itc.numList.find(val => val === 501))})
t.bench(function bench_find_array_our_find() {l.reqInt(i.find(itc.numList, val => val === 501))})
t.bench(function bench_find_array_lodash() {l.reqInt(lo.find(itc.numList, val => val === 501))})
t.bench(function bench_find_array_for_of_naive() {l.reqInt(findForOfNaive(itc.numList, val => val === 501))})

itc.deoptNativeListHof(itc.numList.map)
itc.deoptSeqHof(mapDumb)
itc.deoptListHof(mapWithMapMutSpecialized)
itc.deoptListHof(mapWithMapMutShared)
itc.deoptCollHof(i.map)
itc.deoptSeqHof(lo.map)
itc.deoptDictHof(mapDictValuesSpecialized)
t.bench(function bench_map_array_native() {l.reqArr(itc.numList.map(l.inc))})
t.bench(function bench_map_array_dumb() {l.reqArr(mapDumb(itc.numList, l.inc))})
t.bench(function bench_map_array_map_mut_specialized() {l.reqArr(mapWithMapMutSpecialized(itc.numList, l.inc))})
t.bench(function bench_map_array_map_mut_shared() {l.reqArr(mapWithMapMutShared(itc.numList, l.inc))})
t.bench(function bench_map_array_our_map() {l.reqArr(i.map(itc.numList, l.inc))})
t.bench(function bench_map_array_lodash() {l.reqArr(lo.map(itc.numList, l.inc))})
t.bench(function bench_map_dict_values_specialized() {l.reqArr(mapDictValuesSpecialized(itc.numDict, l.inc))})
t.bench(function bench_map_dict_values_our_map() {l.reqArr(i.map(itc.numDict, l.inc))})
t.bench(function bench_map_set_with_our_map() {l.reqArr(i.map(itc.numSet, l.inc))})

itc.deoptSeqHof(mapCompactDumb)
itc.deoptSeqHof(i.mapCompact)
t.bench(function bench_mapCompact_dumb() {l.reqArr(mapCompactDumb(itc.numList, l.id))})
t.bench(function bench_mapCompact_with_our_mapCompact() {l.reqArr(i.mapCompact(itc.numList, l.id))})
t.bench(function bench_mapCompact_with_native_map_and_filter() {l.reqArr(itc.numList.map(l.id).filter(l.id))})
t.bench(function bench_mapCompact_with_lodash_map_and_compact() {l.reqArr(lo.compact(lo.map(itc.numList, l.id)))})
t.bench(function bench_mapCompact_with_lodash_chain() {l.reqArr(lo.chain(itc.numList).map(l.id).compact().value())})

itc.deoptNativeListHof(itc.numList.filter)
itc.deoptSeqHof(genFilter)
itc.deoptSeqHof(filterDumb)
itc.deoptCollHof(i.filter)
itc.deoptSeqHof(lo.filter)
t.bench(function bench_filter_nums_native() {l.reqArr(itc.numList.filter(l.id))})
t.bench(function bench_filter_nums_gen() {i.arr(genFilter(itc.numList, l.id))})
t.bench(function bench_filter_nums_dumb() {l.reqArr(filterDumb(itc.numList, l.id))})
t.bench(function bench_filter_nums_our_filter() {l.reqArr(i.filter(itc.numList, l.id))})
t.bench(function bench_filter_nums_lodash() {l.reqArr(lo.filter(itc.numList, l.id))})

itc.deoptSeqHof(genFilter)
t.bench(function bench_filter_dicts_with_gen() {
  i.arr(genFilter(itc.dictList, val => val.val === 0))
})

itc.deoptCollHof(i.filter)
t.bench(function bench_filter_dicts_with_our_filter() {
  l.reqArr(i.filter(itc.dictList, val => val.val === 0))
})

itc.deoptNativeListHof(itc.dictList.filter)
t.bench(function bench_filter_dicts_with_native_filter() {
  l.reqArr(itc.dictList.filter(val => val.val === 0))
})

itc.deoptSeqHof(lo.filter)
t.bench(function bench_filter_dicts_with_lodash_filter() {
  l.reqArr(lo.filter(itc.dictList, val => val.val === 0))
})

itc.deoptSeqHof(genFilter)
t.bench(function bench_filter_maps_with_gen() {
  i.arr(genFilter(itc.mapList, val => val.get(`val`) === 0))
})

itc.deoptCollHof(i.filter)
t.bench(function bench_filter_maps_with_our_filter() {
  l.reqArr(i.filter(itc.mapList, val => val.get(`val`) === 0))
})

itc.deoptNativeListHof(itc.mapList.filter)
t.bench(function bench_filter_maps_with_native_filter() {
  l.reqArr(itc.mapList.filter(val => val.get(`val`) === 0))
})

itc.deoptSeqHof(filterDumb)
t.bench(function bench_filter_maps_with_dumb_filter() {
  l.reqArr(filterDumb(itc.mapList, val => val.get(`val`) === 0))
})

itc.deoptSeqHof(lo.filter)
t.bench(function bench_filter_maps_with_lodash_filter() {
  l.reqArr(lo.filter(itc.mapList, val => val.get(`val`) === 0))
})

t.bench(function bench_compact_dumb() {l.reqArr(compactDumb(itc.numList))})
t.bench(function bench_compact_our_compact() {l.reqArr(i.compact(itc.numList))})
t.bench(function bench_compact_our_filter() {l.reqArr(i.filter(itc.numList, l.id))})
t.bench(function bench_compact_lodash_compact() {l.reqArr(lo.compact(itc.numList))})
t.bench(function bench_compact_native_filter() {l.reqArr(itc.numList.filter(l.id))})

t.bench(function bench_map_and_fold_nums_with_gen() {
  l.reqInt(i.fold(genMap(itc.numList, l.inc), 0, l.add))
})

t.bench(function bench_map_and_fold_nums_with_our_map() {
  l.reqInt(i.fold(i.map(itc.numList, l.inc), 0, l.add))
})

t.bench(function bench_filter_and_map_and_fold_nums_with_ours() {
  l.reqInt(i.fold(i.map(i.filter(itc.numList, l.id), l.inc), 0, l.add))
})

t.bench(function bench_filter_and_map_and_fold_nums_with_native() {
  l.reqInt(itc.numList.filter(l.id).map(l.inc).reduce(l.add, 0))
})

t.bench(function bench_filter_and_map_and_fold_nums_with_lodash_eager() {
  l.reqInt(lo.reduce(lo.map(lo.filter(itc.numList, l.id), l.inc), l.add, 0))
})

t.bench(function bench_filter_and_map_and_fold_nums_with_lodash_lazy() {
  l.reqInt(lo.chain(itc.numList).filter(l.id).map(l.inc).reduce(l.add, 0).value())
})

// Seems horribly slow with or without this call.
itc.deoptArrayFrom(Array)
t.bench(function bench_array_from_simple_native() {l.reqArr(Array.from(itc.numList))})
t.bench(function bench_array_from_simple_ours() {l.reqArr(i.arrCopy(itc.numList))})
t.bench(function bench_array_from_mapped_native() {l.reqArr(Array.from(itc.numList, l.inc))})
t.bench(function bench_array_from_mapped_ours() {l.reqArr(i.map(itc.numList, l.inc))})

t.bench(function bench_array_fill_native() {l.reqArr(Array(itc.size).fill(123))})
t.bench(function bench_array_fill_repeat() {l.reqArr(repeat(itc.size, 123))})

itc.deoptNativeListHof(itc.numList.forEach)
itc.deoptListHof(arrayEachDumb)
itc.deoptCollHof(i.each)
itc.deoptCollHof(lo.each)
t.bench(function bench_each_array_forEach() {itc.numList.forEach(l.nop)})
t.bench(function bench_each_array_our_each() {i.each(itc.numList, l.nop)})
t.bench(function bench_each_array_dumb() {arrayEachDumb(itc.numList, l.nop)})
t.bench(function bench_each_array_lodash_each() {lo.each(itc.numList, l.nop)})
t.bench(function bench_each_dict_inline() {for (const key in itc.numDict) l.nop(key, itc.numDict[key])})
t.bench(function bench_each_dict_our_each() {i.each(itc.numDict, l.nop)})
t.bench(function bench_each_dict_lodash_each() {lo.each(itc.numDict, l.nop)})
t.bench(function bench_each_set_inline() {for (const val of itc.numSet.values()) l.nop(val)})
t.bench(function bench_each_set_our_each() {i.each(itc.numSet, l.nop)})
t.bench(function bench_each_map_inline() {for (const val of itc.numMap.values()) l.nop(val)})
t.bench(function bench_each_map_our_each() {i.each(itc.numMap, l.nop)})

itc.deoptCollHof(i.index)
itc.deoptSeqHof(lo.keyBy)
itc.deoptCollHof(i.group)
itc.deoptSeqHof(lo.groupBy)
t.bench(function bench_index_with_our_index() {l.reqDict(i.index(itc.numList, l.id))})
t.bench(function bench_index_with_lodash_keyBy() {l.reqDict(lo.keyBy(itc.numList, l.id))})
t.bench(function bench_group_with_our_group() {l.reqDict(i.group(itc.numList, l.id))})
t.bench(function bench_group_with_lodash_groupBy() {l.reqDict(lo.groupBy(itc.numList, l.id))})

t.bench(function bench_long_transform0_with_our_eager() {
  l.reqArr(i.compact(i.map(i.map(i.map(itc.numList, l.inc), l.dec), double)))
})

t.bench(function bench_long_transform0_with_native() {
  l.reqArr(itc.numList.map(l.inc).map(l.dec).map(double).filter(l.id))
})

t.bench(function bench_long_transform0_with_lodash_eager() {
  l.reqArr(lo.compact(lo.map(lo.map(lo.map(itc.numList, l.inc), l.dec), double)))
})

t.bench(function bench_long_transform0_with_lodash_chain() {
  l.reqArr(lo.chain(itc.numList).map(l.inc).map(l.dec).map(double).compact().value())
})

t.bench(function bench_long_transform1_with_our_eager() {
  l.reqArr(i.map(i.filter(i.entries(i.map(i.compact(i.map(itc.numList, double)), String)), isEntryKeyEven), entryVal))
})

t.bench(function bench_long_transform1_with_native() {
  l.reqArr(itc.numList.map(double).filter(l.id).map(String).filter(isKeyEven))
})

t.bench(function bench_long_transform1_with_lodash_eager() {
  l.reqArr(lo.filter(lo.map(lo.compact(lo.map(itc.numList, double)), String), isKeyEven))
})

t.bench(function bench_long_transform1_with_lodash_chain() {
  l.reqArr(lo.chain(itc.numList).map(double).compact().map(String).filter(isKeyEven).value())
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
t.bench(function bench_count_loop_span_our_span() {for (const val of i.span(itc.size)) l.nop(val)})

t.bench(function bench_zip_with_ours() {l.reqDict(i.zip(itc.numEntries))})
t.bench(function bench_zip_with_native() {l.reqDict(Object.fromEntries(itc.numEntries))})

// Stupidly expensive on structs. May consider not supporting.
itc.deoptCollFun(i.head)
itc.deoptCollFun(headFromValues)
t.bench(function bench_head_arr_with_our_head() {l.nop(i.head(itc.numList))})
t.bench(function bench_head_arr_from_values() {l.nop(headFromValues(itc.numList))})
t.bench(function bench_head_dict_with_our_head() {l.nop(i.head(itc.numDict))})
t.bench(function bench_head_dict_from_values() {l.nop(headFromValues(itc.numDict))})
t.bench(function bench_head_set_with_our_head() {l.nop(i.head(itc.numSet))})
t.bench(function bench_head_set_from_values() {l.nop(headFromValues(itc.numSet))})
t.bench(function bench_head_map_with_our_head() {l.nop(i.head(itc.numMap))})
t.bench(function bench_head_map_from_values() {l.nop(headFromValues(itc.numMap))})

// Stupidly expensive on any non-list. May consider supporting ONLY lists.
itc.deoptCollFun(i.last)
itc.deoptSeqFun(lo.last)
t.bench(function bench_last_arr_with_lodash() {l.nop(lo.last(itc.numList))})
t.bench(function bench_last_arr_with_our_last() {l.nop(i.last(itc.numList))})
t.bench(function bench_last_dict_with_our_last() {l.nop(i.last(itc.numDict))})
t.bench(function bench_last_set_with_our_last() {l.nop(i.last(itc.numSet))})
t.bench(function bench_last_map_with_our_last() {l.nop(i.last(itc.numMap))})

// Missing: benches for arrays which are actually nested.
const arrEmpty = []
const arrShort = [10]
t.bench(function bench_arr_flat_native_empty() {l.nop(arrEmpty.flat(Infinity))})
t.bench(function bench_arr_flat_native_short_flat() {l.nop(arrShort.flat(Infinity))})
t.bench(function bench_arr_flat_native_long_flat() {l.nop(itc.numList.flat(Infinity))})

if (import.meta.main) t.deopt(), t.benches()

/* Util */

function foldArrayDumb(val, acc, fun) {
  for (let i = 0; i < val.length; i++) acc = fun(acc, val[i])
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
  for (let i = 0; i < val.length; i++) {
    const elem = val[i]
    if (fun(elem)) out.push(elem)
  }
  return out
}

function mapDumb(val, fun) {
  val = i.slice(val)
  l.reqFun(fun)
  for (let i = 0; i < val.length; i++) val[i] = fun(val[i])
  return val
}

function mapWithMapMutSpecialized(val, fun) {
  return mapMutSpecialized(val.slice(), fun)
}

function mapWithMapMutShared(val, fun) {
  return i.mapMut(i.slice(val), fun)
}

function mapMutSpecialized(val, fun) {
  l.reqList(val)
  l.reqFun(fun)
  for (let i = 0; i < val.length; i++) val[i] = fun(val[i])
  return val
}

function mapDictValuesSpecialized(val, fun) {
  l.reqDict(val)
  l.reqFun(fun)
  const buf = Object.keys(val)
  for (let i = 0; i < buf.length; i++) buf[i] = fun(val[buf[i]])
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

function structKeysByForIn(src) {
  const out = []
  for (const key in src) out.push(key)
  return out
}

function structValuesByKeyList(src) {
  const buf = Object.keys(src)
  for (let i = 0; i < buf.length; i++) buf[i] = src[buf[i]]
  return buf
}

function structValuesByForIn(src) {
  const out = []
  for (const key in src) out.push(src[key])
  return out
}

function structEntriesDumb(src) {
  const buf = Object.keys(src)
  for (let i = 0; i < buf.length; i++) {
    const key = buf[i]
    buf[i] = [key, src[key]]
  }
  return buf
}

function spanDumb(len) {
  l.reqNat(len)
  const out = Array(len)
  for (let i = 0; i < out.length; i++) out[i] = i
  return out
}

function arrayEachDumb(src, fun) {
  l.reqList(src)
  for (let i = 0; i < src.length; i++) fun(src[i])
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
