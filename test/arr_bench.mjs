// deno-lint-ignore-file no-array-constructor

/*
This benchmark shows the performance impact of subclassing `Array`. At the time
of writing, in V8 9+, subclasses of `Array` have horrifically bad performance.
The fundamental structure doesn't seem to be significantly affected.
Instantiation, prealloc, length, reading and setting values via bracket
notation, all seem to be fine. But various built-in methods are completely
fucked. In this benchmark we can observe between x10 and x500 slower depending
on the method and dataset. This includes both instance and static methods.

By reimplementing all methods in JS, it seems possible to rectify the problem
partially, but not fully. Depending on the method and dataset, we can be
several times faster or several times slower. In all cases, it requires a lot
of additional code. While entertaining, this is not worth the code size, so for
now we recommend to avoid subclassing `Array`. This benchmark might tell us
when this changes.
*/

import './internal_test_init.mjs'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'

/* Util */

/*
At the time of writing, this is a hidden threshold used by V8.
`new Array(len))` is much cheaper for `len <= thresh` than `len > thresh`.
*/
const small = 16

const half = (itc.size / 2) | 0

class ArrSub extends Array {}

// Note: this behaves incorrectly with 1 argument, but we test with more.
class ArrOfNew extends Array {static of() {return new this(...arguments)}}

class ArrOfFrom extends Array {static of(...val) {return this.from(val)}}

class Arr extends Array {
  constructor(val) {
    if (l.isNat(val)) super(val)
    else super()
  }

  at(ind) {
    l.reqNat(ind)
    const len = this.length
    if (ind < 0) ind += len
    if (ind >= 0 && ind < len) return this[ind]
    return undefined
  }

  concat(...val) {
    const buf = new this.constructor(this.length + count(val))

    let ind = -1
    while (++ind < this.length) buf[ind] = this[ind]

    for (val of val) {
      if (l.isArr(val)) for (val of val) buf[ind++] = val
      else buf[ind++] = val
    }

    reqLenMatch(ind, buf.length)
    return buf
  }

  every(fun, self) {
    l.reqFun(fun)
    let ind = -1
    while (++ind < this.length) {
      if (!(fun.call(self, this[ind], ind, this))) return false
    }
    return true
  }

  // Oversimplified for the benchmark.
  slice() {return this.concat()}

  pushed() {
    this.push(...arguments)
    return this
  }

  pushMany(val) {
    if (l.isNil(val)) return this
    if (l.isArr(val)) return this.push(...val), this
    return this.push(...l.reqIter(val)), this
  }

  reset(val) {
    if (l.isNil(val)) return this.clear()
    if (l.isArr(val)) return this.resetFromArr(val)
    return this.resetFromIter(val)
  }

  resetFromArr(val) {
    l.reqArr(val)
    this.length = val.length
    let ind = -1
    while (++ind < val.length) this[ind] = val[ind]
    return this
  }

  resetFromIter(val) {
    let ind = 0
    for (val of l.reqIter(val)) this[ind++] = val
    return this.setLen(ind)
  }

  setLen(val) {
    val = l.reqNat(val)
    if (this.length !== val) this.length = val
    return this
  }

  mapMut(fun) {
    l.reqFun(fun)
    let ind = -1
    while (++ind < this.length) this[ind] = fun(this[ind], ind)
    return this
  }

  mapMutOpt(fun) {return l.optFun(fun) ? this.mapMut(fun) : this}

  clear() {return this.setLen(0)}

  // Rectify performance for subclasses.
  // Faster is possible but not worth the lines.
  static of(...val) {return new this(val.length).resetFromArr(val)}

  // Rectify performance for subclasses.
  static from(val, fun) {
    return (
      l.isNil(val) ? new this() :
      l.isArr(val) ? new this(val.length).resetFromArr(val) :
      new this().resetFromIter(val)
    ).mapMutOpt(fun)
  }
}

function count(val) {
  let out = 0
  for (val of val) out += l.isArr(val) ? val.length : 1
  return out
}

function reqLenMatch(exp, act) {
  if (exp !== act) {
    throw Error(`internal error, length mismatch: expected ${exp}, got ${act}`)
  }
}

const numArrSub = ArrSub.from(itc.numArr)
t.eq([...numArrSub], itc.numArr)
t.ok(l.isArr(numArrSub))

const numArr = Arr.from(itc.numArr)
t.eq([...numArr], itc.numArr)
t.ok(l.isArr(numArr))

/* Bench */

t.bench(function bench_array_new_empty_Array() {l.nop(new Array())})
t.bench(function bench_array_new_empty_ArrSub() {l.nop(new ArrSub())})
t.bench(function bench_array_new_empty_Arr() {l.nop(new Arr())})

t.bench(function bench_array_new_full_Array() {l.nop(new Array(10, 20, 30, 40))})
t.bench(function bench_array_new_full_ArrSub() {l.nop(new ArrSub(10, 20, 30, 40))})

t.bench(function bench_array_prealloc_small_new_Array() {l.nop(new Array(small))})
t.bench(function bench_array_prealloc_small_new_ArrSub() {l.nop(new ArrSub(small))})
t.bench(function bench_array_prealloc_small_new_Arr() {l.nop(new Arr(small))})

t.bench(function bench_array_prealloc_small_length_Array() {l.nop(new Array().length = small)})
t.bench(function bench_array_prealloc_small_length_ArrSub() {l.nop(new ArrSub().length = small)})
t.bench(function bench_array_prealloc_small_length_Arr() {l.nop(new Arr().length = small)})

t.bench(function bench_array_prealloc_big_new_Array() {l.nop(new Array(itc.size))})
t.bench(function bench_array_prealloc_big_new_ArrSub() {l.nop(new ArrSub(itc.size))})
t.bench(function bench_array_prealloc_big_new_Arr() {l.nop(new Arr(itc.size))})

t.bench(function bench_array_prealloc_big_length_Array() {l.nop(new Array().length = itc.size)})
t.bench(function bench_array_prealloc_big_length_ArrSub() {l.nop(new ArrSub().length = itc.size)})
t.bench(function bench_array_prealloc_big_length_Arr() {l.nop(new Arr().length = itc.size)})

t.bench(function bench_array_of_Array() {l.nop(Array.of(10, 20, 30, 40))})
t.bench(function bench_array_of_ArrSub() {l.nop(ArrSub.of(10, 20, 30, 40))})
t.bench(function bench_array_of_ArrOfNew() {l.nop(ArrOfNew.of(10, 20, 30, 40))})
t.bench(function bench_array_of_ArrOfFrom() {l.nop(ArrOfFrom.of(10, 20, 30, 40))})
t.bench(function bench_array_of_Arr() {l.nop(Arr.of(10, 20, 30, 40))})

t.bench(function bench_array_from_arr_simple_Array() {l.nop(Array.from(itc.numArr))})
t.bench(function bench_array_from_arr_simple_ArrSub() {l.nop(ArrSub.from(itc.numArr))})
t.bench(function bench_array_from_arr_simple_Arr() {l.nop(Arr.from(itc.numArr))})

t.bench(function bench_array_from_set_simple_Array() {l.nop(Array.from(itc.numSet))})
t.bench(function bench_array_from_set_simple_ArrSub() {l.nop(ArrSub.from(itc.numSet))})
t.bench(function bench_array_from_set_simple_Arr() {l.nop(Arr.from(itc.numSet))})

itc.deoptArrayFrom(Array)
itc.deoptArrayFrom(ArrSub)
itc.deoptArrayFrom(Arr)
t.bench(function bench_array_from_arr_mapped_Array() {l.nop(Array.from(itc.numArr, l.inc))})
t.bench(function bench_array_from_arr_mapped_ArrSub() {l.nop(ArrSub.from(itc.numArr, l.inc))})
t.bench(function bench_array_from_arr_mapped_Arr() {l.nop(Arr.from(itc.numArr, l.inc))})

t.bench(function bench_array_from_set_mapped_Array() {l.nop(Array.from(itc.numSet, l.inc))})
t.bench(function bench_array_from_set_mapped_ArrSub() {l.nop(ArrSub.from(itc.numSet, l.inc))})
t.bench(function bench_array_from_set_mapped_Arr() {l.nop(Arr.from(itc.numSet, l.inc))})

t.bench(function bench_array_length_Array() {l.nop(itc.numArr.length)})
t.bench(function bench_array_length_ArrSub() {l.nop(numArrSub.length)})
t.bench(function bench_array_length_Arr() {l.nop(numArr.length)})

t.bench(function bench_array_index_Array() {l.nop(itc.numArr[half])})
t.bench(function bench_array_index_ArrSub() {l.nop(numArrSub[half])})
t.bench(function bench_array_index_Arr() {l.nop(numArr[half])})

t.bench(function bench_array_at_Array() {l.nop(itc.numArr.at(half))})
t.bench(function bench_array_at_ArrSub() {l.nop(numArrSub.at(half))})
t.bench(function bench_array_at_Arr() {l.nop(numArr.at(half))})

t.bench(function bench_array_walk_Array() {for (const val of itc.numArr) l.nop(val)})
t.bench(function bench_array_walk_ArrSub() {for (const val of numArrSub) l.nop(val)})
t.bench(function bench_array_walk_Arr() {for (const val of numArr) l.nop(val)})

t.bench(function bench_array_concat_with_empty_Array() {l.nop(itc.numArr.concat())})
t.bench(function bench_array_concat_with_empty_ArrSub() {l.nop(numArrSub.concat())})
t.bench(function bench_array_concat_with_empty_Arr() {l.nop(numArr.concat())})

t.bench(function bench_array_concat_with_long_Array() {l.nop(itc.numArr.concat(itc.numArr))})
t.bench(function bench_array_concat_with_long_ArrSub() {l.nop(numArrSub.concat(numArrSub))})
t.bench(function bench_array_concat_with_long_Arr() {l.nop(numArr.concat(numArr))})

t.bench(function bench_array_slice_Array() {l.nop(itc.numArr.slice())})
t.bench(function bench_array_slice_ArrSub() {l.nop(numArrSub.slice())})
t.bench(function bench_array_slice_Arr() {l.nop(numArr.slice())})
t.bench(function bench_array_slice_iter_Array() {l.nop(i.slice(itc.numArr))})
t.bench(function bench_array_slice_iter_Arr() {l.nop(i.slice(numArr))})

t.bench(function bench_array_every_Array() {l.nop(itc.numArr.every(l.True))})
t.bench(function bench_array_every_ArrSub() {l.nop(numArrSub.every(l.True))})
t.bench(function bench_array_every_Arr() {l.nop(numArr.every(l.True))})
t.bench(function bench_array_every_iter_Array() {l.nop(i.every(itc.numArr, l.True))})
t.bench(function bench_array_every_iter_Arr() {l.nop(i.every(numArr, l.True))})

// Lacks deopt.
t.bench(function bench_array_map_Array_map() {l.nop(itc.numArr.map(l.id))})
t.bench(function bench_array_map_Arr_map() {l.nop(itc.numArr.map(l.id))})
t.bench(function bench_array_map_Arr_mapMut() {l.nop(numArr.mapMut(l.id))})
t.bench(function bench_array_map_iter_Array() {l.nop(i.map(itc.numArr, l.id))})
t.bench(function bench_array_map_iter_Arr() {l.nop(i.map(numArr, l.id))})

if (import.meta.main) t.deopt(), t.benches()
