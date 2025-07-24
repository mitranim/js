// deno-lint-ignore-file no-array-constructor

/*
`a.Arr` is meant to solve the following `Array` issues:

  * Provide a sensible constructor signature.
  * Minimize performance penalties for subclasses.

The default constructor signature of `Array` is just the kind of horror you'd
expect from JavaScript. Passing a single number makes a "sparse" array with the
given length. Otherwise, the constructor is variadic and equivalent to
`Array.of`. The variadic constructor is completely unusable because of the
ambiguity between passing one element that happens to be a number, and passing
length for prealloc. In addition, the variadic constructor is inconsistent with
newer collection classes such as `Set` and `Map` which have an unary
constructor. Our `a.Arr` provides a non-standard unary constructor. The
argument must be either nil, length for prealloc, or an iterable. For
simplicity reasons, we would prefer to drop support for prealloc, but we're
unable because it's used by native methods such as `.splice`.

We have various benchmarks to show the performance impact of subclassing
`Array`. At the time of writing, in V8 9+, native methods of `Array` have
horrifically bad performance for subclass instances. The fundamental structure
of an array doesn't seem to be affected. Instantiation, prealloc, length,
reading and setting values via bracket notation, all seem to be fine. But many
built-in methods are completely fucked. For `List`, we observe between x10 and
x500 slower depending on the method and dataset. This includes both instance
and static methods.

By reimplementing all methods in JS, it seems possible to rectify the problem
partially, but not fully. Depending on the method and dataset, we can be
several times faster or several times slower. In all cases, it requires a lot
of additional code. While entertaining, this is not worth the code size.

Setting performance aside, the semantics of `Array` methods are not entirely
compatible with subclassing. Many native array methods assume that the array
has no additional semantics and no additional properties, and automatically
make new instances of the same class for various purposes. For example,
`.splice` returns an array of deleted items, which is instantiated from the
same class as the parent array. Similarly, `.map` allocates a new instance of
the same array class. The latter could be problematic if the class has
additional semantics such as enforcing a specific type for its elements, which
would often fail for the outputs of the mapping function. This is one of the
reasons we don't provide `ClsArr`, even though we have `ClsVec`. (The main
reason is the inability to override square-bracket get/set in a performant
way.)

We minimize these problems by automatically converting from array subclasses
to "true" arrays. This introduces a predictable small overhead, which is MUCH
lower than the overhead of calling `Array` methods on a subclass instance, and
avoids semantic surprises.

The following overrides are knowingly skipped:

  * `.at`: skip because subclasses have normal performance. The native
    implementation of `.at` is actually stupidly slow on true arrays as well as
    subclasses, but that's not really our problem. (Native is tens of
    nanoseconds; custom is single digit nanoseconds.)
  * `.includes`: not worth the code. True arrays seem to employ weird caching in
    V8 to "look good" in benchmarks. Subclasses don't have this caching, but
    seem to perform well regardless.
  * `.indexOf`: same as `.includes`.
  * `.copyWithin`: not worth the code.
  * `.fill`: subclasses have normal performance.
  * `.splice`: not worth the code.
  * `.pop`: not worth the code.
  * `.push`: not worth the code.
  * `.shift`: unoptimizable, avoid.
  * `.unshift`: unoptimizable, avoid.

The following overrides are included only for semantics:

  * `.flat`: performance for true arrays is just as horrible as for subclasses;
    we convert to a plain array to minimize semantic surprises.
  * `.flatMap`: same as `.flat`.

Overall conclusion: give up on array subclassing, use `Vec`.
*/

import './internal_test_init.mjs'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'
import * as a from '../arr.mjs'

/* Util */

const numArray = l.reqTrueArr(itc.numArr)

/*
At the time of writing, this is a hidden threshold used by V8, where
`new Array(len))` is much cheaper for `len <= thresh` than `len > thresh`.
*/
const small = 16

const half = (itc.size / 2) | 0
const numMissing = l.reqNat(Number.MAX_SAFE_INTEGER - 1)
const indFound = half + 1
const numFound = numArray[indFound]

t.no(numArray.includes(numMissing))
t.ok(numArray.includes(numFound))

function stable() {return 0}

/*
This dumb subclass is the "control group" for our testing.
In V8, it has horrible performance for many native methods.
*/
class List extends Array {}

const numList = List.from(numArray)
t.eq([...numList], numArray)
t.ok(l.isArr(numList))

const numArrEmpty = new a.Arr()

const numArr = a.Arr.from(numArray)
t.eq([...numArr], numArray)
t.ok(l.isArr(numArr))

const strArray = numArray.map(String)
const strList = List.from(strArray)
const strArr = a.Arr.from(strArray)

t.ok(strArray.map(Number).every(l.isNat))

/*
Intended for idempotent mutation by various benchmarks.
Elements may be reordered, but size must remain constant.
*/
const mutArray = Array.from(numArray)
const mutList = List.from(numArray)
const mutArr = a.Arr.from(numArray)

/* Bench */

t.bench(function bench_array_new_empty_Array() {l.nop(new Array())})
t.bench(function bench_array_new_empty_List() {l.nop(new List())})
t.bench(function bench_array_new_empty_Arr() {l.nop(new a.Arr())})
t.bench(function bench_array_new_empty_Arr_make() {l.nop(a.Arr.make(0))})

t.bench(function bench_array_new_full_Array() {l.nop(new Array(10, 20, 30, 40))})
t.bench(function bench_array_new_full_List() {l.nop(new List(10, 20, 30, 40))})
t.bench(function bench_array_new_full_Arr() {l.nop(new a.Arr([10, 20, 30, 40]))})

t.bench(function bench_array_prealloc_small_Array() {l.nop(new Array(small))})
t.bench(function bench_array_prealloc_small_List() {l.nop(new List(small))})
t.bench(function bench_array_prealloc_small_Arr() {l.nop(new a.Arr(small))})
t.bench(function bench_array_prealloc_small_Arr_make() {l.nop(a.Arr.make(small))})

t.bench(function bench_array_prealloc_small_Array_length() {l.nop(new Array(0).length = small)})
t.bench(function bench_array_prealloc_small_List_length() {l.nop(new List(0).length = small)})
t.bench(function bench_array_prealloc_small_Arr_length() {l.nop(new a.Arr(0).length = small)})

t.bench(function bench_array_prealloc_big_Array() {l.nop(new Array(itc.size))})
t.bench(function bench_array_prealloc_big_List() {l.nop(new List(itc.size))})
t.bench(function bench_array_prealloc_big_Arr() {l.nop(new a.Arr(itc.size))})
t.bench(function bench_array_prealloc_big_Arr_make() {l.nop(a.Arr.make(itc.size))})

t.bench(function bench_array_prealloc_big_Array_length() {l.nop(new Array(0).length = itc.size)})
t.bench(function bench_array_prealloc_big_List_length() {l.nop(new List(0).length = itc.size)})
t.bench(function bench_array_prealloc_big_Arr_length() {l.nop(a.Arr.make(0).length = itc.size)})

t.bench(function bench_array_of_Array() {l.nop(Array.of(10, 20, 30, 40))})
t.bench(function bench_array_of_List() {l.nop(List.of(10, 20, 30, 40))})
t.bench(function bench_array_of_Arr() {l.nop(a.Arr.of(10, 20, 30, 40))})

t.bench(function bench_array_from_arr_simple_Array() {l.nop(Array.from(numArray))})
t.bench(function bench_array_from_arr_simple_List() {l.nop(List.from(numArray))})
t.bench(function bench_array_from_arr_simple_Arr() {l.nop(a.Arr.from(numArray))})

t.bench(function bench_array_from_set_simple_Array() {l.nop(Array.from(itc.numSet))})
t.bench(function bench_array_from_set_simple_List() {l.nop(List.from(itc.numSet))})
t.bench(function bench_array_from_set_simple_Arr() {l.nop(a.Arr.from(itc.numSet))})

itc.deoptArrayFrom(Array)
itc.deoptArrayFrom(List)
itc.deoptArrayFrom(a.Arr)
t.bench(function bench_array_from_arr_mapped_Array() {l.nop(Array.from(numArray, l.inc))})
t.bench(function bench_array_from_arr_mapped_List() {l.nop(List.from(numArray, l.inc))})
t.bench(function bench_array_from_arr_mapped_Arr() {l.nop(a.Arr.from(numArray, l.inc))})

t.bench(function bench_array_from_set_mapped_Array() {l.nop(Array.from(itc.numSet, l.inc))})
t.bench(function bench_array_from_set_mapped_List() {l.nop(List.from(itc.numSet, l.inc))})
t.bench(function bench_array_from_set_mapped_Arr() {l.nop(a.Arr.from(itc.numSet, l.inc))})

t.bench(function bench_array_length_Array() {l.nop(numArray.length)})
t.bench(function bench_array_length_List() {l.nop(numList.length)})
t.bench(function bench_array_length_Arr() {l.nop(numArr.length)})

t.bench(function bench_array_index_Array() {l.nop(numArray[half])})
t.bench(function bench_array_index_List() {l.nop(numList[half])})
t.bench(function bench_array_index_Arr() {l.nop(numArr[half])})

t.bench(function bench_array_Arr_toArray_empty() {l.nop(numArrEmpty.toArray())})
t.bench(function bench_array_Arr_toArray_long() {l.nop(numArr.toArray())})

t.bench(function bench_array_at_Array() {l.nop(numArray.at(half))})
t.bench(function bench_array_at_List() {l.nop(numList.at(half))})
t.bench(function bench_array_at_Arr() {l.nop(numArr.at(half))})

t.bench(function bench_array_includes_Array_miss() {l.nop(numArray.includes(numMissing))})
t.bench(function bench_array_includes_List_miss() {l.nop(numList.includes(numMissing))})
t.bench(function bench_array_includes_Arr_miss() {l.nop(numArr.includes(numMissing))})

t.bench(function bench_array_includes_Array_hit() {l.nop(numArray.includes(numFound))})
t.bench(function bench_array_includes_List_hit() {l.nop(numList.includes(numFound))})
t.bench(function bench_array_includes_Arr_hit() {l.nop(numArr.includes(numFound))})

t.is(numArray.indexOf(numMissing), -1)
t.is(numList.indexOf(numMissing), -1)
t.is(numArr.indexOf(numMissing), -1)
t.bench(function bench_array_indexOf_Array_miss() {l.nop(numArray.indexOf(numMissing))})
t.bench(function bench_array_indexOf_List_miss() {l.nop(numList.indexOf(numMissing))})
t.bench(function bench_array_indexOf_Arr_miss() {l.nop(numArr.indexOf(numMissing))})

t.is(numArray.indexOf(numFound), indFound)
t.is(numList.indexOf(numFound), indFound)
t.is(numArr.indexOf(numFound), indFound)
t.bench(function bench_array_indexOf_Array_hit() {l.nop(numArray.indexOf(numFound))})
t.bench(function bench_array_indexOf_List_hit() {l.nop(numList.indexOf(numFound))})
t.bench(function bench_array_indexOf_Arr_hit() {l.nop(numArr.indexOf(numFound))})

t.is(numArray.lastIndexOf(numMissing), -1)
t.is(numList.lastIndexOf(numMissing), -1)
t.is(numArr.lastIndexOf(numMissing), -1)
t.bench(function bench_array_lastIndexOf_Array_miss() {l.nop(numArray.lastIndexOf(numMissing))})
t.bench(function bench_array_lastIndexOf_List_miss() {l.nop(numList.lastIndexOf(numMissing))})
t.bench(function bench_array_lastIndexOf_Arr_miss() {l.nop(numArr.lastIndexOf(numMissing))})

t.is(numArray.lastIndexOf(numFound), indFound)
t.is(numList.lastIndexOf(numFound), indFound)
t.is(numArr.lastIndexOf(numFound), indFound)
t.bench(function bench_array_lastIndexOf_Array_hit() {l.nop(numArray.lastIndexOf(numFound))})
t.bench(function bench_array_lastIndexOf_List_hit() {l.nop(numList.lastIndexOf(numFound))})
t.bench(function bench_array_lastIndexOf_Arr_hit() {l.nop(numArr.lastIndexOf(numFound))})

t.bench(function bench_array_slice_Array() {l.nop(numArray.slice())})
t.bench(function bench_array_slice_List() {l.nop(numList.slice())})
t.bench(function bench_array_slice_Arr() {l.nop(numArr.slice())})

t.bench(function bench_array_slice_iter_Array() {l.nop(i.slice(numArray))})
t.bench(function bench_array_slice_iter_List() {l.nop(i.slice(numList))})
t.bench(function bench_array_slice_iter_Arr() {l.nop(i.slice(numArr))})

t.bench(function bench_array_concat_with_empty_Array() {l.nop(numArray.concat())})
t.bench(function bench_array_concat_with_empty_List() {l.nop(numList.concat())})
t.bench(function bench_array_concat_with_empty_Arr() {l.nop(numArr.concat())})

t.bench(function bench_array_concat_with_long_Array() {l.nop(numArray.concat(numArray))})
t.bench(function bench_array_concat_with_long_List() {l.nop(numList.concat(numArray))})
t.bench(function bench_array_concat_with_long_Arr() {l.nop(numArr.concat(numArray))})

t.bench(function bench_array_fill_Array_simple() {l.nop(Array(itc.size).fill(numMissing))})
t.bench(function bench_array_fill_List_simple() {l.nop(new List(itc.size).fill(numMissing))})
t.bench(function bench_array_fill_Arr_simple() {l.nop(a.Arr.make(itc.size).fill(numMissing))})

t.bench(function bench_array_fill_Array_partial() {l.nop(Array(itc.size).fill(numMissing, small, half))})
t.bench(function bench_array_fill_List_partial() {l.nop(new List(itc.size).fill(numMissing, small, half))})
t.bench(function bench_array_fill_Arr_partial() {l.nop(a.Arr.make(itc.size).fill(numMissing, small, half))})

t.bench(function bench_array_flat_Array() {l.nop(numArray.flat(Infinity))})
t.bench(function bench_array_flat_List() {l.nop(numList.flat(Infinity))})
t.bench(function bench_array_flat_Arr() {l.nop(numArr.flat(Infinity))})

t.bench(function bench_array_join_Array() {l.nop(strArray.join(` `))})
t.bench(function bench_array_join_List() {l.nop(strList.join(` `))})
t.bench(function bench_array_join_Arr() {l.nop(strArr.join(` `))})

t.bench(function bench_array_reverse_Array() {l.nop(mutArray.reverse())})
t.bench(function bench_array_reverse_List() {l.nop(mutList.reverse())})
t.bench(function bench_array_reverse_Arr() {l.nop(mutArr.reverse())})

t.bench(function bench_array_splice_Array() {
  l.nop(mutArray.splice(indFound, 1, numMissing))
  l.nop(mutArray.splice(indFound, 1, numFound))
})

t.bench(function bench_array_splice_List() {
  l.nop(mutList.splice(indFound, 1, numMissing))
  l.nop(mutList.splice(indFound, 1, numFound))
})

t.bench(function bench_array_splice_Arr() {
  l.nop(mutArr.splice(indFound, 1, numMissing))
  l.nop(mutArr.splice(indFound, 1, numFound))
})

t.bench(function bench_array_pop_push_Array_single() {l.nop(mutArray.push(mutArray.pop()))})
t.bench(function bench_array_pop_push_List_single() {l.nop(mutList.push(mutList.pop()))})
t.bench(function bench_array_pop_push_Arr_single() {l.nop(mutArr.push(mutArr.pop()))})

t.bench(function bench_array_pop_push_Array_multiple() {
  l.nop(mutArray.push(mutArray.pop(), mutArray.pop(), mutArray.pop()))
})

t.bench(function bench_array_pop_push_List_multiple() {
  l.nop(mutList.push(mutList.pop(), mutList.pop(), mutList.pop()))
})

t.bench(function bench_array_pop_push_Arr_multiple() {
  l.nop(mutArr.push(mutArr.pop(), mutArr.pop(), mutArr.pop()))
})

t.bench(function bench_array_shift_unshift_Array_single() {l.nop(mutArray.unshift(mutArray.shift()))})
t.bench(function bench_array_shift_unshift_List_single() {l.nop(mutList.unshift(mutList.shift()))})
t.bench(function bench_array_shift_unshift_Arr_single() {l.nop(mutArr.unshift(mutArr.shift()))})

t.bench(function bench_array_shift_unshift_Array_multiple() {
  l.nop(mutArray.unshift(mutArray.shift(), mutArray.shift(), mutArray.shift()))
})

t.bench(function bench_array_shift_unshift_List_multiple() {
  l.nop(mutList.unshift(mutList.shift(), mutList.shift(), mutList.shift()))
})

t.bench(function bench_array_shift_unshift_Arr_multiple() {
  l.nop(mutArr.unshift(mutArr.shift(), mutArr.shift(), mutArr.shift()))
})

t.bench(function bench_array_every_Array() {l.nop(numArray.every(l.True))})
t.bench(function bench_array_every_List() {l.nop(numList.every(l.True))})
t.bench(function bench_array_every_Arr() {l.nop(numArr.every(l.True))})

t.bench(function bench_array_filter_Array() {l.nop(numArray.filter(l.True))})
t.bench(function bench_array_filter_List() {l.nop(numList.filter(l.True))})
t.bench(function bench_array_filter_Arr() {l.nop(numArr.filter(l.True))})

t.bench(function bench_array_find_Array() {l.nop(numArray.find(l.False))})
t.bench(function bench_array_find_List() {l.nop(numList.find(l.False))})
t.bench(function bench_array_find_Arr() {l.nop(numArr.find(l.False))})

t.bench(function bench_array_findIndex_Array() {l.nop(numArray.findIndex(l.False))})
t.bench(function bench_array_findIndex_List() {l.nop(numList.findIndex(l.False))})
t.bench(function bench_array_findIndex_Arr() {l.nop(numArr.findIndex(l.False))})

t.bench(function bench_array_findLast_Array() {l.nop(numArray.findLast(l.False))})
t.bench(function bench_array_findLast_List() {l.nop(numList.findLast(l.False))})
t.bench(function bench_array_findLast_Arr() {l.nop(numArr.findLast(l.False))})

t.bench(function bench_array_findLastIndex_Array() {l.nop(numArray.findLastIndex(l.False))})
t.bench(function bench_array_findLastIndex_List() {l.nop(numList.findLastIndex(l.False))})
t.bench(function bench_array_findLastIndex_Arr() {l.nop(numArr.findLastIndex(l.False))})

t.bench(function bench_array_flatMap_Array() {l.nop(numArray.flatMap(l.id))})
t.bench(function bench_array_flatMap_List() {l.nop(numList.flatMap(l.id))})
t.bench(function bench_array_flatMap_Arr() {l.nop(numArr.flatMap(l.id))})

t.bench(function bench_array_forEach_Array() {l.nop(numArray.forEach(l.nop))})
t.bench(function bench_array_forEach_List() {l.nop(numList.forEach(l.nop))})
t.bench(function bench_array_forEach_Arr() {l.nop(numArr.forEach(l.nop))})

t.bench(function bench_array_map_Array() {l.nop(numArray.map(l.id))})
t.bench(function bench_array_map_List() {l.nop(numList.map(l.id))})
t.bench(function bench_array_map_Arr() {l.nop(numArr.map(l.id))})

t.bench(function bench_array_reduce_Array() {l.nop(numArray.reduce(l.id))})
t.bench(function bench_array_reduce_List() {l.nop(numList.reduce(l.id))})
t.bench(function bench_array_reduce_Arr() {l.nop(numArr.reduce(l.id))})

t.bench(function bench_array_reduceRight_Array() {l.nop(numArray.reduceRight(l.id))})
t.bench(function bench_array_reduceRight_List() {l.nop(numList.reduceRight(l.id))})
t.bench(function bench_array_reduceRight_Arr() {l.nop(numArr.reduceRight(l.id))})

t.bench(function bench_array_some_Array() {l.nop(numArray.some(l.False))})
t.bench(function bench_array_some_List() {l.nop(numList.some(l.False))})
t.bench(function bench_array_some_Arr() {l.nop(numArr.some(l.False))})

t.bench(function bench_array_sort_Array() {l.nop(mutArray.sort(stable))})
t.bench(function bench_array_sort_List() {l.nop(mutList.sort(stable))})
t.bench(function bench_array_sort_Arr() {l.nop(mutArr.sort(stable))})

t.bench(function bench_array_walk_Array() {for (const val of numArray) l.nop(val)})
t.bench(function bench_array_walk_List() {for (const val of numList) l.nop(val)})
t.bench(function bench_array_walk_Arr() {for (const val of numArr) l.nop(val)})

t.bench(function bench_array_walk_Array_values() {for (const val of numArray.values()) l.nop(val)})
t.bench(function bench_array_walk_List_values() {for (const val of numList.values()) l.nop(val)})
t.bench(function bench_array_walk_Arr_values() {for (const val of numArr.values()) l.nop(val)})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
