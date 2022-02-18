## Overview

[lang.mjs](../lang.mjs) provides tools essential for all other code. Stuff that should be built into the language.

* Type checks and assertions.
  * Terse.
  * Performant.
  * Minifiable.
  * Descriptive.
* Sensible type conversions.

Port and rework of https://github.com/mitranim/fpx.

## TOC

* [#Usage](#usage)
* [#API](#api)
  * [#`function isNil`](#function-isnil)
  * [#`function isSome`](#function-issome)
  * [#`function isBool`](#function-isbool)
  * [#`function isNum`](#function-isnum)
  * [#`function isFin`](#function-isfin)
  * [#`function isFinNeg`](#function-isfinneg)
  * [#`function isFinPos`](#function-isfinpos)
  * [#`function isInt`](#function-isint)
  * [#`function isNat`](#function-isnat)
  * [#`function isIntNeg`](#function-isintneg)
  * [#`function isIntPos`](#function-isintpos)
  * [#`function isNaN`](#function-isnan)
  * [#`function isInf`](#function-isinf)
  * [#`function isBigInt`](#function-isbigint)
  * [#`function isStr`](#function-isstr)
  * [#`function isSym`](#function-issym)
  * [#`function isKey`](#function-iskey)
  * [#`function isJunk`](#function-isjunk)
  * [#`function isComp`](#function-iscomp)
  * [#`function isPrim`](#function-isprim)
  * [#`function isFun`](#function-isfun)
  * [#`function isFunSync`](#function-isfunsync)
  * [#`function isFunGen`](#function-isfungen)
  * [#`function isFunAsync`](#function-isfunasync)
  * [#`function isFunAsyncGen`](#function-isfunasyncgen)
  * [#`function isObj`](#function-isobj)
  * [#`function isDict`](#function-isdict)
  * [#`function isStruct`](#function-isstruct)
  * [#`function isArr`](#function-isarr)
  * [#`function isReg`](#function-isreg)
  * [#`function isDate`](#function-isdate)
  * [#`function isValidDate`](#function-isvaliddate)
  * [#`function isInvalidDate`](#function-isinvaliddate)
  * [#`function isSet`](#function-isset)
  * [#`function isMap`](#function-ismap)
  * [#`function isPromise`](#function-ispromise)
  * [#`function isIter`](#function-isiter)
  * [#`function isIterAsync`](#function-isiterasync)
  * [#`function isIterator`](#function-isiterator)
  * [#`function isIteratorAsync`](#function-isiteratorasync)
  * [#`function isGen`](#function-isgen)
  * [#`function isCls`](#function-iscls)
  * [#`function isList`](#function-islist)
  * [#`function isSeq`](#function-isseq)
  * [#`function isVac`](#function-isvac)
  * [#`function isScalar`](#function-isscalar)
  * [#`function isEmpty`](#function-isempty)
  * [#`function isInst`](#function-isinst)
  * [#`function req`](#function-req)
  * [#`function opt`](#function-opt)
  * [#`function reqInst`](#function-reqinst)
  * [#`function optInst`](#function-optinst)
  * [#`function only`](#function-only)
  * [#`function render`](#function-render)
  * [#`function show`](#function-show)
  * [#`function is`](#function-is)
  * [#`function truthy`](#function-truthy)
  * [#`function falsy`](#function-falsy)
  * [#`function nop`](#function-nop)
  * [#`function id`](#function-id)
  * [#`function val`](#function-val)
  * [#`function panic`](#function-panic)
  * [#`function npo`](#function-npo)
  * [#`function vac`](#function-vac)
  * [#`function bind`](#function-bind)
  * [#`function not`](#function-not)
  * [#`function hasOwn`](#function-hasown)
  * [#`function hasOwnEnum`](#function-hasownenum)
  * [#`function hasMeth`](#function-hasmeth)
  * [#`function add`](#function-add)
  * [#`function sub`](#function-sub)
  * [#`function mul`](#function-mul)
  * [#`function div`](#function-div)
  * [#`function rem`](#function-rem)
  * [#`function lt`](#function-lt)
  * [#`function gt`](#function-gt)
  * [#`function lte`](#function-lte)
  * [#`function gte`](#function-gte)
  * [#`function neg`](#function-neg)
  * [#`function inc`](#function-inc)
  * [#`function dec`](#function-dec)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as l from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/lang.mjs'
```

## API

### `function isNil`

Links: [source](../lang.mjs#L3); [test/example](../test/lang_test.mjs#L127).

True for `null` and `undefined`. Same as `value == null`. Incidentally, these are the only values that produce an exception when attempting to read a property: `null.someProperty`.

```js
// Definition
function isNil(value) {return value == null}

f.isNil(null)
// true

f.isNil(undefined)
// true

f.isNil(false)
// false
```

### `function isSome`

Links: [source](../lang.mjs#L8); [test/example](../test/lang_test.mjs#L135).

Inverse of [#`isNil`](#function-isnil). False for `null` and `undefined`, true for other values.

### `function isBool`

Links: [source](../lang.mjs#L13); [test/example](../test/lang_test.mjs#L143).

Same as `typeof val === 'boolean'`.

### `function isNum`

Links: [source](../lang.mjs#L19); [test/example](../test/lang_test.mjs#L152).

Same as `typeof val === 'number'`. True if the value is a primitive number, _including_ `NaN` and `±Infinity`. In most cases you should use `isFin` instead.

```js
f.isNum(1)
// true
f.isNum('1')
// false
f.isNum(NaN)
// true <-- WTF
```

### `function isFin`

Links: [source](../lang.mjs#L25); [test/example](../test/lang_test.mjs#L163).

Same as ES2015's [`Number.isFinite`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite). True if `val` is a primitive number and is _not_ `NaN` or `±Infinity`. In most cases you should prefer `isFin` over `isNum`.

```js
f.isFin(1)
// true
f.isFin('1')
// false
f.isFin(NaN)
// false
```

### `function isFinNeg`

Links: [source](../lang.mjs#L31); [test/example](../test/lang_test.mjs#L177).

True if value is finite (via [#`isFin`](#function-isfin)) and < 0.

### `function isFinPos`

Links: [source](../lang.mjs#L36); [test/example](../test/lang_test.mjs#L196).

True if value is finite (via [#`isFin`](#function-isfin)) and > 0.

### `function isInt`

Links: [source](../lang.mjs#L41); [test/example](../test/lang_test.mjs#L215).

True if value is an integer: finite via [#`isFin`](#function-isfin), without a fractional part.

### `function isNat`

Links: [source](../lang.mjs#L47); [test/example](../test/lang_test.mjs#L233).

True if value is a natural number: integer >= 0. Also see [#`isIntPos`](#function-isintpos).

### `function isIntNeg`

Links: [source](../lang.mjs#L53); [test/example](../test/lang_test.mjs#L251).

True if value is integer < 0. Also see [#`isFinNeg`](#function-isfinneg).

### `function isIntPos`

Links: [source](../lang.mjs#L58); [test/example](../test/lang_test.mjs#L270).

True if value is integer > 0. Also see [#`isNat`](#function-isnat), [#`isFinPos`](#function-isfinpos).

### `function isNaN`

Links: [source](../lang.mjs#L63); [test/example](../test/lang_test.mjs#L289).

Same as ES2015's [`Number.isNaN`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN). True if value is _actually_ `NaN`. Doesn't coerce non-numbers to numbers, unlike global `isNaN`.

### `function isInf`

Links: [source](../lang.mjs#L68); [test/example](../test/lang_test.mjs#L304).

True if value is `-Infinity` or `Infinity`.

### `function isBigInt`

Links: [source](../lang.mjs#L73); [test/example](../test/lang_test.mjs#L319).

True if value is a primitive [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). False for all other inputs, including `BigInt` object wrappers.

### `function isStr`

Links: [source](../lang.mjs#L80); [test/example](../test/lang_test.mjs#L338).

Same as `typeof val === 'string'`. True if value is a primitive string.

### `function isSym`

Links: [source](../lang.mjs#L86); [test/example](../test/lang_test.mjs#L345).

Same as `typeof val === 'symbol'`. True if value is a primitive symbol.

### `function isKey`

Links: [source](../lang.mjs#L91); [test/example](../test/lang_test.mjs#L352).

True if value qualifies as a dictionary key. True for all primitives excluding garbage values via [#`isJunk`](#function-isjunk).

### `function isJunk`

Links: [source](../lang.mjs#L96); [test/example](../test/lang_test.mjs#L372).

True for garbage values: [#nil](#function-isnil), [#NaN](#function-isnan), [#±Infinity](#function-isinf).

### `function isComp`

Links: [source](../lang.mjs#L101); [test/example](../test/lang_test.mjs#L387).

True if value is "composite" / "compound" / "complex". Opposite of [#`isPrim`](#function-isprim). Definition:

```js
function isComp(val) {return isObj(val) || isFun(val)}
```

### `function isPrim`

Links: [source](../lang.mjs#L106); [test/example](../test/lang_test.mjs#L401).

True if value is a JS primitive: not an object, not a function. Opposite of [#`isComp`](#function-iscomp).

### `function isFun`

Links: [source](../lang.mjs#L111); [test/example](../test/lang_test.mjs#L415).

Same as `typeof val === 'function'`. True if value is any function, regardless of its type (arrow, async, generator, etc.).

### `function isFunSync`

Links: [source](../lang.mjs#L116); [test/example](../test/lang_test.mjs#L439).

True if the input is a normal sync function. False for generator functions or async functions.

### `function isFunGen`

Links: [source](../lang.mjs#L121); [test/example](../test/lang_test.mjs#L449).

True if the input is a sync generator function. False for normal sync functions and async functions.

### `function isFunAsync`

Links: [source](../lang.mjs#L126); [test/example](../test/lang_test.mjs#L459).

True if the input is an async non-generator function. False for sync functions, generator functions, or async generator functions.

### `function isFunAsyncGen`

Links: [source](../lang.mjs#L131); [test/example](../test/lang_test.mjs#L469).

True if the input is an async generator function. False for sync functions and async non-generator functions.

### `function isObj`

Links: [source](../lang.mjs#L136); [test/example](../test/lang_test.mjs#L479).

Same as `typeof val === 'object' && val !== null`. True for any JS object: plain dict, array, various other classes. Doesn't include functions, even though JS functions are extensible objects.

Note: this is _not_ equivalent to Lodash's `_.isObject`, which counts functions as objects. Use [#`isComp`](#function-iscomp) for that.

For plain objects used as dictionaries, see [#`isDict`](#function-isdict). For fancy non-list objects, see [#`isStruct`](#function-isstruct).

### `function isDict`

Links: [source](../lang.mjs#L141); [test/example](../test/lang_test.mjs#L750).

True for a "plain object" created via `{...}` or `Object.create(null)`. False for any other input, including instances of any class other than `Object`. Roughly equivalent to Lodash's `_.isPlainObject`.

See [#`isStruct`](#function-isstruct) for a more general definition of a non-iterable object.

### `function isStruct`

Links: [source](../lang.mjs#L147); [test/example](../test/lang_test.mjs#L495).

True if value is a non-iterable object. Excludes both [#sync_iterables](#function-isiter) and [#async_iterables](#function-isiterasync). Note that [#dicts](#function-isdict) are automatically structs, but not all structs are dicts.

### `function isArr`

Links: [source](../lang.mjs#L153); [test/example](../test/lang_test.mjs#L512).

Alias for [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray). Used internally for all array checks.

True if value is an instance of [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) or its subclass. False for all other values, including non-array objects whose prototype is an array.

### `function isReg`

Links: [source](../lang.mjs#L159); [test/example](../test/lang_test.mjs#L524).

True if value is an instance of [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) or its subclass.

### `function isDate`

Links: [source](../lang.mjs#L164); [test/example](../test/lang_test.mjs#L532).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Most of the time you should prefer [#`isValidDate`](#function-isvaliddate).

### `function isValidDate`

Links: [source](../lang.mjs#L169); [test/example](../test/lang_test.mjs#L540).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) and its timestamp is [#finite](#function-isfin) rather than `NaN` or `Infinity`.

### `function isInvalidDate`

Links: [source](../lang.mjs#L174); [test/example](../test/lang_test.mjs#L547).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) representing an invalid date whose timestamp is `NaN`.

### `function isSet`

Links: [source](../lang.mjs#L179); [test/example](../test/lang_test.mjs#L554).

True if value is an instance of [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) or its subclass.

### `function isMap`

Links: [source](../lang.mjs#L185); [test/example](../test/lang_test.mjs#L564).

True if value is an instance of [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or its subclass.

### `function isPromise`

Links: [source](../lang.mjs#L191); [test/example](../test/lang_test.mjs#L574).

True if the value satisfies the ES2015 [promise interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### `function isIter`

Links: [source](../lang.mjs#L196); [test/example](../test/lang_test.mjs#L583).

True if the value satisfies the ES2015 [sync iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterator_ rather than _iterable_, use [#`isIterator`](#function-isiterator).

### `function isIterAsync`

Links: [source](../lang.mjs#L201); [test/example](../test/lang_test.mjs#L609).

True if the value satisfies the ES2015 [async iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterator_ rather than _iterable_, use [#`isIteratorAsync`](#function-isiteratorasync).

### `function isIterator`

Links: [source](../lang.mjs#L206); [test/example](../test/lang_test.mjs#L626).

True if the value satisfies the ES2015 [sync iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterable_ rather than _iterator_, use [#`isIter`](#function-isiter).

### `function isIteratorAsync`

Links: [source](../lang.mjs#L211); [test/example](../test/lang_test.mjs#L652).

True if the value satisfies the ES2015 [async iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterable_ rather than _iterator_, use [#`isIterAsync`](#function-isiterasync).

### `function isGen`

Links: [source](../lang.mjs#L216); [test/example](../test/lang_test.mjs#L678).

True if value is a [#sync_iterator](#function-isiterator) created by calling a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).

### `function isCls`

Links: [source](../lang.mjs#L222); [test/example](../test/lang_test.mjs#L738).

True if the input is a function with a prototype, likely to be a class. False for arrow functions such as `() => {}`, which don't have a prototype.

### `function isList`

Links: [source](../lang.mjs#L232); [test/example](../test/lang_test.mjs#L763).

True for any array-like such as: `[]`, `arguments`, `TypedArray`, `NodeList`, etc. Used internally for most list checks. Note that _primitive strings are not considered lists_.

### `function isSeq`

Links: [source](../lang.mjs#L238); [test/example](../test/lang_test.mjs#L778).

True for any of:

  * [#Array](#function-isarr)
  * [#List](#function-islist)
  * [#Set](#function-isset)
  * [#Iterator](#function-isiterator)

Many functions in `iter.mjs` support arbitrary data structures compatible with [`values`](iter_readme.md#function-values), but some functions such as [`arr`](iter_readme.md#function-arr) allow only sequences, for sanity checking.

### `function isVac`

Links: [source](../lang.mjs#L243); [test/example](../test/lang_test.mjs#L795).

Short for "is vacuous" or "is vacated". Could also be called "is falsy deep". True if the input is [#`falsy`](#function-falsy) or a [#list](#function-islist) where all values are vacuous, recursively. Does not iterate non-lists. Also see complementary function [#`vac`](#function-vac).

### `function isScalar`

Links: [source](../lang.mjs#L249); [test/example](../test/lang_test.mjs#L833).

True for a value that could be considered a single scalar, rather than a collection / data structure:

  * Any [#primitive](#function-isprim).
  * Any [#object](#function-isobj) with a custom `.toString` method, distinct from both `Object.prototype.toString` and `Array.prototype.toString`.

### `function isEmpty`

Links: [source](../lang.mjs#L273); [test/example](../test/lang_test.mjs#L906).

True if the input is an empty collection such as list, set, map, or a primitive such as `null`. False for any other non-primitive. Treating primitives as "empty" is consistent with various functions in `iter.mjs` that operate on collections.

### `function isInst`

Links: [source](../lang.mjs#L280); [test/example](../test/lang_test.mjs#L870).

Signature: `(val, Cls) => bool`.

Same as `instanceof` but _does not_ implicitly convert the operand to an object. True only if the operand is already an instance of the given class. Also unlike `instanceof`, this is always false for functions, avoiding the insanity of `fun instanceof Function` being true.

### `function req`

Links: [source](../lang.mjs#L284); [test/example](../test/lang_test.mjs#L971).

Signature: `(val, test) => val` where `test: val => bool`.

Short for "require". Minification-friendly assertion. If `!test(val)`, throws an informative `TypeError`. Otherwise, returns `val` as-is.

```js
f.req({one: `two`}, f.isObj)
// {one: `two`}

f.req('str', f.isFun)
// uncaught TypeError: expected "str" to satisfy test isFun
```

### `function opt`

Links: [source](../lang.mjs#L294); [test/example](../test/lang_test.mjs#L1030).

Short for "optional". If `val` is [#non_nil](#function-issome), uses [#`req`](#function-req) to validate it. Returns `val` as-is.

### `function reqInst`

Links: [source](../lang.mjs#L303); [test/example](../test/lang_test.mjs#L1068).

Signature: `(val, Cls) => val`.

Short for "require instance". Asserts that `val` is an instance of the given class. Returns `val` as-is.

### `function optInst`

Links: [source](../lang.mjs#L310); [test/example](../test/lang_test.mjs#L1085).

Short for "optional instance". If `val` is [#non_nil](#function-issome), uses [#`reqInst`](#function-reqinst) to validate it. Returns `val` as-is.

### `function only`

Links: [source](../lang.mjs#L315); [test/example](../test/lang_test.mjs#L1117).

Signature: `(val, test) => val` where `test: val => bool`.

Type filtering utility. If `val` satisfies the given test function, returns `val` as-is. Otherwise returns `undefined`.

### `function render`

Links: [source](../lang.mjs#L322); [test/example](../test/lang_test.mjs#L75).

Renders a value for user display. Counterpart to [#`show`](#function-show), which renders a value for debug purposes. Intended only for [#scalar](#function-isscalar) values. Rules:

  * [#Nil](#function-isnil) → `''`.
  * [#Scalar](#function-isscalar) → default JS stringification.
  * All other inputs → `TypeError` exception.

### `function show`

Links: [source](../lang.mjs#L331); [test/example](../test/lang_test.mjs#L19).

Renders a value for debug purposes. Counterpart to [#`render`](#function-render), which renders a value for user display. Convenient for interpolating things into error messages. Used internally in assertion functions such as [#`req`](#function-req). Approximate rules:

  * String → use `JSON.stringify`.
  * Function → `[function ${val.name || val}]`.
    * For named functions, this shorter representation is usually preferable to printing the entire source code.
  * Object →
    * Plain `{}` or `[]` → use `JSON.stringify`.
    * Otherwise `[object <name>]`, prioritizing constructor name over `Symbol.toStringTag`.
      * Exact opposite of default behavior for `Object.prototype.toString`.
  * Otherwise → default JS stringification.

### `function is`

Links: [source](../lang.mjs#L340); [test/example](../test/lang_test.mjs#L117).

Identity test: same as `===`, but considers `NaN` equal to `NaN`. Equivalent to [_SameValueZero_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero) as defined by the language spec. Used internally for all identity tests.

Note that [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) implements [_SameValue_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevalue), which treats `-0` and `+0` as _distinct values_. This is typically undesirable. As a result, you should prefer `f.is` over `===` or `Object.is`.

```js
f.is(1, '1')
// false

f.is(NaN, NaN)
// true
```

### `function truthy`

Links: [source](../lang.mjs#L341); [test/example](../test/lang_test.mjs#L103).

Same as `!!` or `Boolean`. Sometimes useful with higher-order functions.

### `function falsy`

Links: [source](../lang.mjs#L342); [test/example](../test/lang_test.mjs#L110).

Same as `!`. Sometimes useful with higher-order functions.

### `function nop`

Links: [source](../lang.mjs#L343); [test/example](../test/lang_test.mjs#L1336).

Empty function. Functional equivalent of `;` or `undefined`. Sometimes useful with higher-order functions.

### `function id`

Links: [source](../lang.mjs#L344); [test/example](../test/lang_test.mjs#L1342).

Identity function: returns its first argument unchanged. Sometimes useful with higher-order functions.

### `function val`

Links: [source](../lang.mjs#L345); [test/example](../test/lang_test.mjs#L1349).

Takes a value and creates a function that always returns that value. Sometimes useful with higher order functions.

```js
const constant = f.val(1)

constant()
// 1

constant(`this input is ignored`)
// 1
```

### `function panic`

Links: [source](../lang.mjs#L346); [test/example](../test/lang_test.mjs#L1363).

Same as `throw` but an expression rather than a statement. Also sometimes useful with higher-order functions.

```js
const x = someTest ? someValue : f.panic(Error(`unreachable`))
```

### `function npo`

Links: [source](../lang.mjs#L349); [test/example](../test/lang_test.mjs#L1505).

Short for "null-prototype object". Syntactic shortcut for `Object.create(null)`.

### `function vac`

Links: [source](../lang.mjs#L350); [test/example](../test/lang_test.mjs#L1511).

Complements [#`isVac`](#function-isvac). Returns `undefined` if the input is vacuous, otherwise returns the input as-is.

### `function bind`

Links: [source](../lang.mjs#L352); [test/example](../test/lang_test.mjs#L1307).

Like [`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind), but instead of taking `this` as an argument, takes it contextually. By default `this` is `undefined`. To set it, use `f.bind.call`.

Returns a new function that represents [partial application](https://en.wikipedia.org/wiki/Partial_application) of the given function, a common tool in functional programming. When called, it joins arguments from both calls and invokes the original function. Think of it like splitting a function call in two, or more. Performance is inferior to closures; avoid in hotspots.

```js
const inc = f.bind(f.add, 1)

inc(2)
// 3
```

Note: we don't provide facilities for currying. Experience has shown it to be extremely error prone. Currying, as seen in purely functional languages such as Haskell, tends to care about the amount of arguments. Calling a curried function may either create a new function, or call the underlying function (possibly side-effectful). This approach works reasonably well in statically typed languages, but not in JS where all functions are variadic and it's conventional to sometimes pass extra utility arguments "just in case", which the callee may or may not care about. `bind` is different because the created function will always call the original function, regardless of how many arguments were passed.

### `function not`

Links: [source](../lang.mjs#L354); [test/example](../test/lang_test.mjs#L1326).

Returns a new function that negates the result of the given function, like a delayed `!`.

```js
function eq(a, b) {return a === b}

const different = f.not(eq)

different(10, 20)
// !eq(10, 20) = true

// equivalent:
function different(a, b) {return !eq(a, b)}
```

### `function hasOwn`

Links: [source](../lang.mjs#L360); [test/example](../test/lang_test.mjs#L923).

Same as [`Object.prototype.hasOwnProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) but shorter and safe to call on primitives. Always false for primitives.

### `function hasOwnEnum`

Links: [source](../lang.mjs#L361); [test/example](../test/lang_test.mjs#L937).

Same as [`Object.prototype.propertyIsEnumerable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable) but shorter and safe to call on primitives. Always false for primitives.

### `function hasMeth`

Links: [source](../lang.mjs#L362); [test/example](../test/lang_test.mjs#L951).

True if the the given value has the given named method. Safe to call on primitives such as `null`. Always false for primitives.

### `function add`

Links: [source](../lang.mjs#L367); [test/example](../test/lang_test.mjs#L1401).

Same as `+`.

### `function sub`

Links: [source](../lang.mjs#L368); [test/example](../test/lang_test.mjs#L1407).

Same as `-`.

### `function mul`

Links: [source](../lang.mjs#L369); [test/example](../test/lang_test.mjs#L1413).

Same as `*`.

### `function div`

Links: [source](../lang.mjs#L370); [test/example](../test/lang_test.mjs#L1419).

Same as `/`.

### `function rem`

Links: [source](../lang.mjs#L371); [test/example](../test/lang_test.mjs#L1425).

Same as `%`.

### `function lt`

Links: [source](../lang.mjs#L372); [test/example](../test/lang_test.mjs#L1433).

Same as `<`.

### `function gt`

Links: [source](../lang.mjs#L373); [test/example](../test/lang_test.mjs#L1444).

Same as `>`.

### `function lte`

Links: [source](../lang.mjs#L374); [test/example](../test/lang_test.mjs#L1455).

Same as `<=`.

### `function gte`

Links: [source](../lang.mjs#L375); [test/example](../test/lang_test.mjs#L1466).

Same as `>=`.

### `function neg`

Links: [source](../lang.mjs#L376); [test/example](../test/lang_test.mjs#L1477).

Arithmetic negation. Same as unary `-`.

### `function inc`

Links: [source](../lang.mjs#L377); [test/example](../test/lang_test.mjs#L1489).

Increments by `1`.

### `function dec`

Links: [source](../lang.mjs#L378); [test/example](../test/lang_test.mjs#L1497).

Decrements by `1`.

### Undocumented

The following APIs are exported but undocumented. Check [lang.mjs](../lang.mjs).

  * [`function reqNil`](../lang.mjs#L4)
  * [`function optNil`](../lang.mjs#L5)
  * [`function onlyNil`](../lang.mjs#L6)
  * [`function reqSome`](../lang.mjs#L9)
  * [`function optSome`](../lang.mjs#L10)
  * [`function onlySome`](../lang.mjs#L11)
  * [`function reqBool`](../lang.mjs#L14)
  * [`function optBool`](../lang.mjs#L15)
  * [`function onlyBool`](../lang.mjs#L16)
  * [`function laxBool`](../lang.mjs#L17)
  * [`function reqNum`](../lang.mjs#L20)
  * [`function optNum`](../lang.mjs#L21)
  * [`function onlyNum`](../lang.mjs#L22)
  * [`function laxNum`](../lang.mjs#L23)
  * [`function reqFin`](../lang.mjs#L26)
  * [`function optFin`](../lang.mjs#L27)
  * [`function onlyFin`](../lang.mjs#L28)
  * [`function laxFin`](../lang.mjs#L29)
  * [`function reqFinNeg`](../lang.mjs#L32)
  * [`function optFinNeg`](../lang.mjs#L33)
  * [`function onlyFinNeg`](../lang.mjs#L34)
  * [`function reqFinPos`](../lang.mjs#L37)
  * [`function optFinPos`](../lang.mjs#L38)
  * [`function onlyFinPos`](../lang.mjs#L39)
  * [`function reqInt`](../lang.mjs#L42)
  * [`function optInt`](../lang.mjs#L43)
  * [`function onlyInt`](../lang.mjs#L44)
  * [`function laxInt`](../lang.mjs#L45)
  * [`function reqNat`](../lang.mjs#L48)
  * [`function optNat`](../lang.mjs#L49)
  * [`function onlyNat`](../lang.mjs#L50)
  * [`function laxNat`](../lang.mjs#L51)
  * [`function reqIntNeg`](../lang.mjs#L54)
  * [`function optIntNeg`](../lang.mjs#L55)
  * [`function onlyIntNeg`](../lang.mjs#L56)
  * [`function reqIntPos`](../lang.mjs#L59)
  * [`function optIntPos`](../lang.mjs#L60)
  * [`function onlyIntPos`](../lang.mjs#L61)
  * [`function reqNaN`](../lang.mjs#L64)
  * [`function optNaN`](../lang.mjs#L65)
  * [`function onlyNaN`](../lang.mjs#L66)
  * [`function reqInf`](../lang.mjs#L69)
  * [`function optInf`](../lang.mjs#L70)
  * [`function onlyInf`](../lang.mjs#L71)
  * [`function reqBigInt`](../lang.mjs#L74)
  * [`function optBigInt`](../lang.mjs#L75)
  * [`function onlyBigInt`](../lang.mjs#L76)
  * [`function laxBigInt`](../lang.mjs#L77)
  * [`function reqStr`](../lang.mjs#L81)
  * [`function optStr`](../lang.mjs#L82)
  * [`function onlyStr`](../lang.mjs#L83)
  * [`function laxStr`](../lang.mjs#L84)
  * [`function reqSym`](../lang.mjs#L87)
  * [`function optSym`](../lang.mjs#L88)
  * [`function onlySym`](../lang.mjs#L89)
  * [`function reqKey`](../lang.mjs#L92)
  * [`function optKey`](../lang.mjs#L93)
  * [`function onlyKey`](../lang.mjs#L94)
  * [`function reqJunk`](../lang.mjs#L97)
  * [`function optJunk`](../lang.mjs#L98)
  * [`function onlyJunk`](../lang.mjs#L99)
  * [`function reqComp`](../lang.mjs#L102)
  * [`function optComp`](../lang.mjs#L103)
  * [`function onlyComp`](../lang.mjs#L104)
  * [`function reqPrim`](../lang.mjs#L107)
  * [`function optPrim`](../lang.mjs#L108)
  * [`function onlyPrim`](../lang.mjs#L109)
  * [`function reqFun`](../lang.mjs#L112)
  * [`function optFun`](../lang.mjs#L113)
  * [`function onlyFun`](../lang.mjs#L114)
  * [`function reqFunSync`](../lang.mjs#L117)
  * [`function optFunSync`](../lang.mjs#L118)
  * [`function onlyFunSync`](../lang.mjs#L119)
  * [`function reqFunGen`](../lang.mjs#L122)
  * [`function optFunGen`](../lang.mjs#L123)
  * [`function onlyFunGen`](../lang.mjs#L124)
  * [`function reqFunAsync`](../lang.mjs#L127)
  * [`function optFunAsync`](../lang.mjs#L128)
  * [`function onlyFunAsync`](../lang.mjs#L129)
  * [`function reqFunAsyncGen`](../lang.mjs#L132)
  * [`function optFunAsyncGen`](../lang.mjs#L133)
  * [`function onlyFunAsyncGen`](../lang.mjs#L134)
  * [`function reqObj`](../lang.mjs#L137)
  * [`function optObj`](../lang.mjs#L138)
  * [`function onlyObj`](../lang.mjs#L139)
  * [`function reqDict`](../lang.mjs#L142)
  * [`function optDict`](../lang.mjs#L143)
  * [`function onlyDict`](../lang.mjs#L144)
  * [`function laxDict`](../lang.mjs#L145)
  * [`function reqStruct`](../lang.mjs#L148)
  * [`function optStruct`](../lang.mjs#L149)
  * [`function onlyStruct`](../lang.mjs#L150)
  * [`function laxStruct`](../lang.mjs#L151)
  * [`function reqArr`](../lang.mjs#L154)
  * [`function optArr`](../lang.mjs#L155)
  * [`function onlyArr`](../lang.mjs#L156)
  * [`function laxArr`](../lang.mjs#L157)
  * [`function reqReg`](../lang.mjs#L160)
  * [`function optReg`](../lang.mjs#L161)
  * [`function onlyReg`](../lang.mjs#L162)
  * [`function reqDate`](../lang.mjs#L165)
  * [`function optDate`](../lang.mjs#L166)
  * [`function onlyDate`](../lang.mjs#L167)
  * [`function reqValidDate`](../lang.mjs#L170)
  * [`function optValidDate`](../lang.mjs#L171)
  * [`function onlyValidDate`](../lang.mjs#L172)
  * [`function reqInvalidDate`](../lang.mjs#L175)
  * [`function optInvalidDate`](../lang.mjs#L176)
  * [`function onlyInvalidDate`](../lang.mjs#L177)
  * [`function reqSet`](../lang.mjs#L180)
  * [`function optSet`](../lang.mjs#L181)
  * [`function onlySet`](../lang.mjs#L182)
  * [`function laxSet`](../lang.mjs#L183)
  * [`function reqMap`](../lang.mjs#L186)
  * [`function optMap`](../lang.mjs#L187)
  * [`function onlyMap`](../lang.mjs#L188)
  * [`function laxMap`](../lang.mjs#L189)
  * [`function reqPromise`](../lang.mjs#L192)
  * [`function optPromise`](../lang.mjs#L193)
  * [`function onlyPromise`](../lang.mjs#L194)
  * [`function reqIter`](../lang.mjs#L197)
  * [`function optIter`](../lang.mjs#L198)
  * [`function onlyIter`](../lang.mjs#L199)
  * [`function reqIterAsync`](../lang.mjs#L202)
  * [`function optIterAsync`](../lang.mjs#L203)
  * [`function onlyIterAsync`](../lang.mjs#L204)
  * [`function reqIterator`](../lang.mjs#L207)
  * [`function optIterator`](../lang.mjs#L208)
  * [`function onlyIterator`](../lang.mjs#L209)
  * [`function reqIteratorAsync`](../lang.mjs#L212)
  * [`function optIteratorAsync`](../lang.mjs#L213)
  * [`function onlyIteratorAsync`](../lang.mjs#L214)
  * [`function reqGen`](../lang.mjs#L217)
  * [`function optGen`](../lang.mjs#L218)
  * [`function onlyGen`](../lang.mjs#L219)
  * [`function reqCls`](../lang.mjs#L223)
  * [`function optCls`](../lang.mjs#L224)
  * [`function onlyCls`](../lang.mjs#L225)
  * [`function isSubCls`](../lang.mjs#L227)
  * [`function reqSubCls`](../lang.mjs#L228)
  * [`function optSubCls`](../lang.mjs#L229)
  * [`function onlySubCls`](../lang.mjs#L230)
  * [`function reqList`](../lang.mjs#L233)
  * [`function optList`](../lang.mjs#L234)
  * [`function onlyList`](../lang.mjs#L235)
  * [`function laxList`](../lang.mjs#L236)
  * [`function reqSeq`](../lang.mjs#L239)
  * [`function optSeq`](../lang.mjs#L240)
  * [`function onlySeq`](../lang.mjs#L241)
  * [`function reqVac`](../lang.mjs#L244)
  * [`function optVac`](../lang.mjs#L245)
  * [`function onlyVac`](../lang.mjs#L246)
  * [`function reqScalar`](../lang.mjs#L256)
  * [`function optScalar`](../lang.mjs#L257)
  * [`function onlyScalar`](../lang.mjs#L258)
  * [`function isArrOf`](../lang.mjs#L260)
  * [`function reqArrOf`](../lang.mjs#L266)
  * [`function optArrOf`](../lang.mjs#L271)
  * [`function reqOneOf`](../lang.mjs#L289)
  * [`function optOneOf`](../lang.mjs#L299)
  * [`function toInst`](../lang.mjs#L319)
  * [`function toInstOpt`](../lang.mjs#L320)
  * [`function renderLax`](../lang.mjs#L329)
  * [`function True`](../lang.mjs#L347)
  * [`function False`](../lang.mjs#L348)
  * [`function hasIn`](../lang.mjs#L359)
  * [`function convFun`](../lang.mjs#L393)
  * [`function errFun`](../lang.mjs#L394)
  * [`function errType`](../lang.mjs#L395)
  * [`function errConv`](../lang.mjs#L396)
  * [`function errSynt`](../lang.mjs#L397)
  * [`function errInst`](../lang.mjs#L398)
  * [`function msgConv`](../lang.mjs#L399)
  * [`function msgType`](../lang.mjs#L400)
  * [`function errIn`](../lang.mjs#L401)
  * [`function convType`](../lang.mjs#L405)
  * [`function convSynt`](../lang.mjs#L410)
  * [`function get`](../lang.mjs#L433)
  * [`function reqIn`](../lang.mjs#L434)
  * [`function reqGet`](../lang.mjs#L435)
  * [`function structKeys`](../lang.mjs#L449)
