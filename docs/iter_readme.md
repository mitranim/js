## Overview

[iter.mjs](../iter.mjs) provides tiny utils for iteration and functional programming. Lightweight replacement for Lodash. Features:

  * Higher-order functions for data structures.
    * Common FP tools like `map`, `filter`, and many more.
    * Compatible with arbitrary iterables such as lists, sets, maps, dicts.

Differences from Lodash:

  * Supports arbitrary iterables and iterators, including sets and maps.
  * Much smaller and simpler.

## TOC

* [#Usage](#usage)
* [#Perf](#perf)
* [#API](#api)
  * [#`function arrOf`](#function-arrof)
  * [#`function more`](#function-more)
  * [#`function alloc`](#function-alloc)
  * [#`function arr`](#function-arr)
  * [#`function arrCopy`](#function-arrcopy)
  * [#`function slice`](#function-slice)
  * [#`function keys`](#function-keys)
  * [#`function values`](#function-values)
  * [#`function valuesCopy`](#function-valuescopy)
  * [#`function entries`](#function-entries)
  * [#`function reify`](#function-reify)
  * [#`function vac`](#function-vac)
  * [#`function indexOf`](#function-indexof)
  * [#`function includes`](#function-includes)
  * [#`function concat`](#function-concat)
  * [#`function append`](#function-append)
  * [#`function prepend`](#function-prepend)
  * [#`function len`](#function-len)
  * [#`function hasLen`](#function-haslen)
  * [#`function each`](#function-each)
  * [#`function map`](#function-map)
  * [#`function mapMut`](#function-mapmut)
  * [#`function mapCompact`](#function-mapcompact)
  * [#`function filter`](#function-filter)
  * [#`function reject`](#function-reject)
  * [#`function compact`](#function-compact)
  * [#`function remove`](#function-remove)
  * [#`function fold`](#function-fold)
  * [#`function find`](#function-find)
  * [#`function procure`](#function-procure)
  * [#`function every`](#function-every)
  * [#`function some`](#function-some)
  * [#`function head`](#function-head)
  * [#`function last`](#function-last)
  * [#`function init`](#function-init)
  * [#`function tail`](#function-tail)
  * [#`function take`](#function-take)
  * [#`function count`](#function-count)
  * [#`function compare`](#function-compare)
  * [#`function compareFin`](#function-comparefin)
  * [#`function sort`](#function-sort)
  * [#`function reverse`](#function-reverse)
  * [#`function index`](#function-index)
  * [#`function group`](#function-group)
  * [#`function partition`](#function-partition)
  * [#`function sum`](#function-sum)
  * [#`function zip`](#function-zip)
  * [#`function mapFrom`](#function-mapfrom)
  * [#`function range`](#function-range)
  * [#`function span`](#function-span)
  * [#`function times`](#function-times)
  * [#`function repeat`](#function-repeat)
  * [#`function set`](#function-set)
  * [#`function setCopy`](#function-setcopy)

## Usage

```js
import * as i from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.0/iter.mjs'
```

## Perf

Carefully tuned for performance. Functions covered by benchmarks appear comparable to their native or Lodash equivalents. Many appear significantly faster.

JS performance is complicated and _very_ unstable, Our benchmark suite is limited and checked only in V8. When in doubt, measure in your particular environment.

## API

### `function arrOf`

Links: [source](../iter.mjs#L3); [test/example](../test/iter_test.mjs#L36).

Signature: `(seq<A>, test) => A[]` where `test: A => true`.

Shortcut. Converts the input to an array via [#`arr`](#function-arr) and asserts that every element satisfies the given test function. Returns the resulting array.

### `function more`

Links: [source](../iter.mjs#L10); [test/example](../test/iter_test.mjs#L48).

Takes an [iterator](lang_readme.md#function-isiterator), consumes one value, and returns true if the iterator is not yet finished. Shortcut for `val.next().done === false`.

### `function alloc`

Links: [source](../iter.mjs#L11); [test/example](../test/iter_test.mjs#L58).

Shortcut for allocating an array with a sanity check. Same as `Array(N)` but ensures that the input is a [natural_number](lang_readme.md#function-isnat) suitable for array length. Avoids unintentionally passing any non-natural input such as `Array(-1)`. Allows [nil](lang_readme.md#function-isnil), replacing it with `0`.

### `function arr`

Links: [source](../iter.mjs#L12); [test/example](../test/iter_test.mjs#L67).

Converts an arbitrary [sequence](lang_readme.md#function-isseq) to an array. Allows the following inputs:

  * [Nil](lang_readme.md#function-isnil): return `[]`.
  * [Array](lang_readme.md#function-isarr): return as-is.
  * [List](lang_readme.md#function-islist): convert via `Array.prototype.slice`.
  * [Set](lang_readme.md#function-isset) or arbitrary [iterator](lang_readme.md#function-isiterator): convert to array by iterating.

Unlike [#`values`](#function-values), `arr` rejects other inputs such as non-nil primitives, dicts, maps, arbitrary iterables, ensuring that the input is always a sequence.

### `function arrCopy`

Links: [source](../iter.mjs#L13); [test/example](../test/iter_test.mjs#L99).

Like [#`arr`](#function-arr), converts an arbitrary sequence to an array. Unlike `arr,` always makes a copy. Mutating the output doesn't affect the original.

### `function slice`

Links: [source](../iter.mjs#L18); [test/example](../test/iter_test.mjs#L113).

Like [`Array.prototype.slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) but allows arbitrary [sequences](lang_readme.md#function-isseq) compatible with [#`arr`](#function-arr).

### `function keys`

Links: [source](../iter.mjs#L27); [test/example](../test/iter_test.mjs#L145).

Takes an arbitrary input and returns an array of its keys:

  * For non-objects: always `[]`.
  * For [iterables](lang_readme.md#function-isiter) with `.keys()`: equivalent to converting the output of `.keys()` to an array. Implementation varies for performance.
    * Examples: `Array`, `Set`, `Map`, and more.
  * For [lists](lang_readme.md#function-islist): equivalent to above for arrays.
  * For [iterators](lang_readme.md#function-isiterator): exhausts the iterator, returning an array of indexes equivalent to `f.span(f.len(iterator))`. See [#`span`](#function-span) and [#`len`](#function-len).
  * For [structs](lang_readme.md#function-isstruct): equivalent to [`Object.keys`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).

### `function values`

Links: [source](../iter.mjs#L43); [test/example](../test/iter_test.mjs#L168).

Takes an arbitrary input and returns an array of its values:

  * For non-objects: always `[]`.
  * For [arrays](lang_readme.md#function-isarr): **returns as-is without copying**.
  * For [lists](lang_readme.md#function-islist): slice to array.
  * For [iterables](lang_readme.md#function-isiter) with `.values()`: equivalent to converting the output of `.values()` to an array. Implementation varies for performance.
    * Examples: `Set`, `Map`, and more.
  * For [iterators](lang_readme.md#function-isiterator): equivalent to `[...iterator]`.
  * For [structs](lang_readme.md#function-isstruct): equivalent to [`Object.values`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values).

### `function valuesCopy`

Links: [source](../iter.mjs#L66); [test/example](../test/iter_test.mjs#L188).

Variant of [#`values`](#function-values) that always makes a copy. Mutating the output doesn't affect the original.

### `function entries`

Links: [source](../iter.mjs#L68); [test/example](../test/iter_test.mjs#L210).

Takes an arbitrary input and returns an array of its entries (key-value tuples):

  * For non-objects: always `[]`.
  * For [iterables](lang_readme.md#function-isiter) with `.entries()`: equivalent to converting the output of `.entries()` to an array. Implementation varies for performance.
    * Examples: `Set`, `Map`, and more.
  * For [lists](lang_readme.md#function-islist): equivalent to above for arrays.
  * For [iterators](lang_readme.md#function-isiterator): exhausts the iterator, returning an array of entries where keys are indexes starting with 0.
  * For [structs](lang_readme.md#function-isstruct): equivalent to [`Object.entries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries).

### `function reify`

Links: [source](../iter.mjs#L94); [test/example](../test/iter_test.mjs#L229).

Takes an arbitrary value and attempts to deeply materialize it. Any [iterators](lang_readme.md#function-isiterator), or [lists](lang_readme.md#function-islist) that contain iterators, or lists that contain lists that contain iterators, etc., are converted to arrays. Does not inspect other data structures such as [sets](lang_readme.md#function-isset) or [dicts](lang_readme.md#function-isdict).

### `function vac`

Links: [source](../iter.mjs#L98); [test/example](../test/iter_test.mjs#L254).

Complements [`isVac`](lang_readme.md#function-isvac). Returns `undefined` if the input is vacuous, otherwise returns the input as-is.

### `function indexOf`

Links: [source](../iter.mjs#L100); [test/example](../test/iter_test.mjs#L293).

Like [`Array.prototype.indexOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf). Differences:

  * Uses [`is`](lang_readme.md#function-is) rather than `===`, therefore able to detect `NaN`.
  * Input may be [nil](lang_readme.md#function-isnil) or any [list](lang_readme.md#function-islist).

### `function includes`

Links: [source](../iter.mjs#L108); [test/example](../test/iter_test.mjs#L314).

Like [`Array.prototype.includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes). Differences:

  * Supports arbitrary iterables compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.

### `function concat`

Links: [source](../iter.mjs#L109); [test/example](../test/iter_test.mjs#L333).

Like [`Array.prototype.concat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat). Differences:

  * Takes two arguments, without rest/spread.
  * Supports arbitrary iterables compatible with [#`values`](#function-values).
  * Iterables may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.

Note: for individual elements, use [#`append`](#function-append) and
[#`prepend`](#function-prepend).

### `function append`

Links: [source](../iter.mjs#L110); [test/example](../test/iter_test.mjs#L351).

Takes an arbitrary iterable compatible with [#`values`](#function-values) and appends an arbitrary value, returning the resulting array.

### `function prepend`

Links: [source](../iter.mjs#L111); [test/example](../test/iter_test.mjs#L366).

Takes an arbitrary iterable compatible with [#`values`](#function-values) and prepends an arbitrary value, returning the resulting array.

### `function len`

Links: [source](../iter.mjs#L113); [test/example](../test/iter_test.mjs#L401).

Universal length measurement:

  * For non-objects: always 0.
  * For iterables:
    * For [lists](lang_readme.md#function-islist): same as `.length`.
    * For ES2015 collections such as `Set`: same as `.size`.
    * For iterators: exhausts the iterator, returning element count.
  * For [structs](lang_readme.md#function-isstruct): equivalent to `Object.keys(val).length`.

### `function hasLen`

Links: [source](../iter.mjs#L137); [test/example](../test/iter_test.mjs#L405).

Shortcut for [#`len`](#function-len) > 0.

### `function each`

Links: [source](../iter.mjs#L139); [test/example](../test/iter_test.mjs#L437).

Signature: `(Iter<A>, A => void) => void`.

Similar to `Array.prototype.forEach`, `Set.prototype.forEach`, `Map.prototype.forEach`, and so on. Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Doesn't support `this` or additional arguments.

### `function map`

Links: [source](../iter.mjs#L144); [test/example](../test/iter_test.mjs#L458).

Signature: `(Iter<A>, A => B) => B[]`.

Similar to [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Doesn't support `this` or additional arguments.

### `function mapMut`

Links: [source](../iter.mjs#L146); [test/example](../test/iter_test.mjs#L491).

Similar to [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map). Differences:

  * Mutates the input (which must be an array).
  * Doesn't support `this` or additional arguments.

For a non-mutating version, see [#`map`](#function-map).

### `function mapCompact`

Links: [source](../iter.mjs#L154); [test/example](../test/iter_test.mjs#L507).

Equivalent to `f.compact(f.map(val, fun))`. See [#`map`](#function-map) and [#`compact`](#function-compact).

### `function filter`

Links: [source](../iter.mjs#L156); [test/example](../test/iter_test.mjs#L520).

Signature: `(Iter<A>, A => bool) => A[]`.

Similar to [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Doesn't support `this` or additional arguments.

### `function reject`

Links: [source](../iter.mjs#L163); [test/example](../test/iter_test.mjs#L536).

Opposite of [#`filter`](#function-filter). Equivalent to `f.filter(val, f.not(fun))`.

### `function compact`

Links: [source](../iter.mjs#L165); [test/example](../test/iter_test.mjs#L552).

Equivalent to `f.filter(val, f.id)`. Takes an arbitrary iterable and returns an array of its truthy [#`values`](#function-values), discarding falsy values.

### `function remove`

Links: [source](../iter.mjs#L171); [test/example](../test/iter_test.mjs#L564).

Signature: `(Iter<A>, A) => A[]`.

Takes an arbitrary iterable and an element to remove. Returns an array of the iterable's [#`values`](#function-values), discarding each occurrence of this element, comparing via [`is`](lang_readme.md#function-is).

### `function fold`

Links: [source](../iter.mjs#L175); [test/example](../test/iter_test.mjs#L581).

Signature: `(src: Iter<A>, acc: B, fun: (B, A) => B) => B`.

Similar to [`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Arguments are `(src, acc, fun)` rather than `(fun, acc)`.
  * Accumulator argument is mandatory.
  * Doesn't support `this`.
  * Iterator function receives exactly two arguments: accumulator and next value.

### `function find`

Links: [source](../iter.mjs#L181); [test/example](../test/iter_test.mjs#L597).

Signature: `(Iter<A>, A => bool) => A`.

Similar to [`Array.prototype.find`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Doesn't support `this` or additional arguments.

### `function procure`

Links: [source](../iter.mjs#L187); [test/example](../test/iter_test.mjs#L612).

Signature: `(src: Iter<A>, fun: A => B) => B`.

Similar to [#`find`](#function-find), but returns the first truthy result of calling the iterator function, rather than the corresponding element. Equivalent to `f.find(f.map(src, fun), f.id)` but more efficient.

### `function every`

Links: [source](../iter.mjs#L193); [test/example](../test/iter_test.mjs#L629).

Signature: `(Iter<A>, A => bool) => bool`.

Similar to [`Array.prototype.every`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Doesn't support `this` or additional arguments.

### `function some`

Links: [source](../iter.mjs#L199); [test/example](../test/iter_test.mjs#L648).

Signature: `(Iter<A>, A => bool) => bool`.

Similar to [`Array.prototype.some`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Doesn't support `this` or additional arguments.

### `function head`

Links: [source](../iter.mjs#L205); [test/example](../test/iter_test.mjs#L667).

Takes an arbitrary iterable compatible with [#`values`](#function-values) and returns its first element or `undefined`.

### `function last`

Links: [source](../iter.mjs#L214); [test/example](../test/iter_test.mjs#L677).

Takes an arbitrary iterable compatible with [#`values`](#function-values) and returns its last element or `undefined`.

### `function init`

Links: [source](../iter.mjs#L215); [test/example](../test/iter_test.mjs#L687).

Short for "initial". Takes an arbitrary iterable compatible with [#`values`](#function-values) and returns an array of all its values except last.

### `function tail`

Links: [source](../iter.mjs#L216); [test/example](../test/iter_test.mjs#L697).

Takes an arbitrary iterable compatible with [#`values`](#function-values) and returns an array of all its values except first.

### `function take`

Links: [source](../iter.mjs#L217); [test/example](../test/iter_test.mjs#L707).

Takes an arbitrary iterable compatible with [#`values`](#function-values) and returns N values from the start.

### `function count`

Links: [source](../iter.mjs#L219); [test/example](../test/iter_test.mjs#L739).

Signature: `(src: Iter<A>, fun: A => B) => nat`.

Takes an arbitrary iterable compatible with [#`values`](#function-values), calls the given function for each value, and returns the count of truthy results. The count is between 0 and iterable length.

### `function compare`

Links: [source](../iter.mjs#L227); [test/example](../test/iter_test.mjs#L754).

Signature: `(a, b) => -1 | 0 | 1`.

Equivalent to the [default JS sort comparison algorithm](https://tc39.github.io/ecma262/#sec-sortcompare). Sometimes useful for sorting via [`Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) or [#`sort`](#function-sort), as a fallback.

### `function compareFin`

Links: [source](../iter.mjs#L238); [test/example](../test/iter_test.mjs#L764).

Signature: `(a, b) => -1 | 0 | 1` where arguments are [nil](lang_readme.md#function-isnil) or [finite](lang_readme.md#function-isfin).

Sort comparison for finite numbers. Usable for [`Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) or [#`sort`](#function-sort). Throws on non-nil, non-finite arguments.

### `function sort`

Links: [source](../iter.mjs#L246); [test/example](../test/iter_test.mjs#L776).

Signature: `(src: Iter<A>, fun?: (prev: A, next: A) => -1 | 0 | 1) => A[]`.

Similar to [`Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Always creates a new array. Does not mutate the input.

The comparison function is optional. If omitted, default JS sorting is used.

### `function reverse`

Links: [source](../iter.mjs#L247); [test/example](../test/iter_test.mjs#L808).

Similar to [`Array.prototype.reverse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values).
  * Iterable may be [nil](lang_readme.md#function-isnil), equivalent to `[]`.
  * Always creates a new array. Does not mutate the input.

### `function index`

Links: [source](../iter.mjs#L249); [test/example](../test/iter_test.mjs#L826).

Signature: `(Iter<A>, A => Key | any) => {[Key: A]}`.

Takes an arbitrary iterable compatible with [#`values`](#function-values) and returns an index where its values are _keyed_ by the given function, hence the name. The function is called for each value. If the function returns a [valid_key](lang_readme.md#function-iskey), the key-value pair is added to the index. Invalid keys are ignored. If the function returns the same key for multiple values, previous values are lost.

Similar to Lodash's `_.keyBy`. Compare [#`group`](#function-group) which keeps all values for each group, rather than only the last.

### `function group`

Links: [source](../iter.mjs#L259); [test/example](../test/iter_test.mjs#L871).

Signature: `(Iter<A>, A => Key | any) => {[Key: A[]]}`.

Takes an arbitrary iterable compatible with [#`values`](#function-values) and groups its values by keys generated by the given function. The function is called for each value. If the function returns a [valid_key](lang_readme.md#function-iskey), the value is added to the index under that key. Invalid keys are ignored.

Compare [#`index`](#function-index), which keeps only the last value for each group.

### `function partition`

Links: [source](../iter.mjs#L269); [test/example](../test/iter_test.mjs#L897).

Signature: `(Iter<A>, A => bool) => [A[], A[]]`.

Partitions the [#`values`](#function-values) of a given iterable, returning a tuple of two groups: values that satisfy the predicate and the remainder.

### `function sum`

Links: [source](../iter.mjs#L277); [test/example](../test/iter_test.mjs#L914).

Signature: `(Iter<A>) => fin`.

Sums all finite [#`values`](#function-values) of an arbitrary iterable, ignoring all non-finite values.

### `function zip`

Links: [source](../iter.mjs#L282); [test/example](../test/iter_test.mjs#L925).

Signature: `(Iter<[Key, A]>) => {[Key: A]}`.

Similar to [`Object.fromEntries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries). Differences:

  * Takes an arbitrary iterable compatible with [#`values`](#function-values) (more flexible).
    * Each value of this iterable must be a key-value pair.
  * Ignores entries where the first element is not a [valid_key](lang_readme.md#function-iskey).
  * Returns a [null_prototype_object](lang_readme.md#function-npo).
  * Slightly slower.

### `function mapFrom`

Links: [source](../iter.mjs#L289); [test/example](../test/iter_test.mjs#L942).

Syntactic shortcut for creating a `Map` with inline keys and values. Shorter and less noisy than either `new Map` with an array of entries or chained `.set` calls.

### `function range`

Links: [source](../iter.mjs#L296); [test/example](../test/iter_test.mjs#L949).

Signature: `(min: int, max: int) => int[]`.

Returns an array of contiguous integers in the range of `[min, max)`. The first value is `min`, the last value is `max - 1`.

### `function span`

Links: [source](../iter.mjs#L307); [test/example](../test/iter_test.mjs#L964).

Signature: `nat => nat[]`.

Returns an array of the given length, where values are integers from 0. Shortcut for `f.range(0, length)`. Nil length is equivalent to 0.

### `function times`

Links: [source](../iter.mjs#L308); [test/example](../test/iter_test.mjs#L975).

Signature: `(len: nat, fun: nat => A) => A[]`.

Takes an array length and a mapping function. Returns an array of the given length, where each element is the result of calling the given function, passing the element's index, starting with 0. Equivalent to `f.mapMut(f.span(len), fun)`.

### `function repeat`

Links: [source](../iter.mjs#L309); [test/example](../test/iter_test.mjs#L996).

Signature: `(len: nat, val: A) => A[]`.

Returns an array of the given length where each element is the given value. Equivalent to `f.alloc(len).fill(val)`.

### `function set`

Links: [source](../iter.mjs#L310); [test/example](../test/iter_test.mjs#L1008).

Converts an arbitrary input to a native [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set). Similar to `new Set`. Differences:

  * If input is already a set: **return as-is without copying**.
  * Otherwise, create a set of the input's [#`values`](#function-values).
    * [Maps](lang_readme.md#function-ismap) and [structs](lang_readme.md#function-isstruct) are treated as collections of their values rather than key-value entries.

### `function setCopy`

Links: [source](../iter.mjs#L311); [test/example](../test/iter_test.mjs#L1032).

Similar to [#`set`](#function-set): converts an arbitrary input to a set. Difference: always makes a copy. If the original was a set, it's unaffected by mutations of the output.
