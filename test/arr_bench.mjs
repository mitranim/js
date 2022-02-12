// deno-lint-ignore-file no-array-constructor

import './internal_test_init.mjs'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ar from '../arr.mjs'

/* Util */

/*
At the time of writing, this is a hidden threshold used by V8.
`new Array(len))` is much cheaper for `len <= thresh` than `len > thresh`.
*/
const small = 16

class ArrSub extends Array {}

// Note: this behaves incorrectly with 1 argument, but we test with more.
class ArrOfNew extends Array {static of() {return new this(...arguments)}}

class ArrOfFrom extends Array {static of(...args) {return this.from(args)}}

const numArrSub = ArrSub.from(itc.numList)
t.eq([...numArrSub], itc.numList)
t.ok(l.isArr(numArrSub))

const numArr = ar.Arr.from(itc.numList)
t.eq([...numArr], itc.numList)
t.ok(l.isArr(numArr))

/* Bench */

t.bench(function bench_array_new_empty_Array() {l.nop(new Array())})
t.bench(function bench_array_new_empty_ArrSub() {l.nop(new ArrSub())})
t.bench(function bench_array_new_empty_Arr() {l.nop(new ar.Arr())})

t.bench(function bench_array_new_full_Array() {l.nop(new Array(10, 20, 30, 40))})
t.bench(function bench_array_new_full_ArrSub() {l.nop(new ArrSub(10, 20, 30, 40))})

t.bench(function bench_array_prealloc_small_new_Array() {l.nop(new Array(small))})
t.bench(function bench_array_prealloc_small_new_ArrSub() {l.nop(new ArrSub(small))})
t.bench(function bench_array_prealloc_small_new_Arr() {l.nop(new ar.Arr(small))})

t.bench(function bench_array_prealloc_small_length_Array() {l.nop(new Array().length = small)})
t.bench(function bench_array_prealloc_small_length_ArrSub() {l.nop(new ArrSub().length = small)})
t.bench(function bench_array_prealloc_small_length_Arr() {l.nop(new ar.Arr().length = small)})

t.bench(function bench_array_prealloc_big_new_Array() {l.nop(new Array(itc.size))})
t.bench(function bench_array_prealloc_big_new_ArrSub() {l.nop(new ArrSub(itc.size))})
t.bench(function bench_array_prealloc_big_new_Arr() {l.nop(new ar.Arr(itc.size))})

t.bench(function bench_array_prealloc_big_length_Array() {l.nop(new Array().length = itc.size)})
t.bench(function bench_array_prealloc_big_length_ArrSub() {l.nop(new ArrSub().length = itc.size)})
t.bench(function bench_array_prealloc_big_length_Arr() {l.nop(new ar.Arr().length = itc.size)})

t.bench(function bench_array_of_Array() {l.nop(Array.of(10, 20, 30, 40))})
t.bench(function bench_array_of_ArrSub() {l.nop(ArrSub.of(10, 20, 30, 40))})
t.bench(function bench_array_of_ArrOfNew() {l.nop(ArrOfNew.of(10, 20, 30, 40))})
t.bench(function bench_array_of_ArrOfFrom() {l.nop(ArrOfFrom.of(10, 20, 30, 40))})
t.bench(function bench_array_of_Arr() {l.nop(ar.Arr.of(10, 20, 30, 40))})

t.bench(function bench_array_from_arr_simple_Array() {l.nop(Array.from(itc.numList))})
t.bench(function bench_array_from_arr_simple_Arr() {l.nop(ar.Arr.from(itc.numList))})

t.bench(function bench_array_from_set_simple_Array() {l.nop(Array.from(itc.numSet))})
t.bench(function bench_array_from_set_simple_Arr() {l.nop(ar.Arr.from(itc.numSet))})

itc.deoptArrayFrom(Array)
itc.deoptArrayFrom(ar.Arr)
t.bench(function bench_array_from_arr_mapped_Array() {l.nop(Array.from(itc.numList, l.inc))})
t.bench(function bench_array_from_arr_mapped_Arr() {l.nop(ar.Arr.from(itc.numList, l.inc))})

t.bench(function bench_array_from_set_mapped_Array() {l.nop(Array.from(itc.numSet, l.inc))})
t.bench(function bench_array_from_set_mapped_Arr() {l.nop(ar.Arr.from(itc.numSet, l.inc))})

t.bench(function bench_array_walk_Array() {for (const val of itc.numList) l.nop(val)})
t.bench(function bench_array_walk_ArrSub() {for (const val of numArrSub) l.nop(val)})
t.bench(function bench_array_walk_Arr() {for (const val of numArr) l.nop(val)})

t.bench(function bench_array_slice_Array() {l.nop(itc.numList.slice())})
t.bench(function bench_array_slice_ArrSub() {l.nop(numArrSub.slice())})
t.bench(function bench_array_slice_Arr() {l.nop(numArr.slice())})

// TODO deopt.
t.bench(function bench_array_map_Array_map() {l.nop(itc.numList.map(l.id))})
t.bench(function bench_array_map_Arr_map() {l.nop(numArr.map(l.id))})
t.bench(function bench_array_map_Arr_mapMut() {l.nop(numArr.mapMut(l.id))})

if (import.meta.main) t.deopt(), t.benches()
