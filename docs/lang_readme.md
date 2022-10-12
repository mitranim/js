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
  * [#`function isPk`](#function-ispk)
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
  * [#`function isTrueArr`](#function-istruearr)
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
  * [#`function isEq`](#function-iseq)
  * [#`function isEmpty`](#function-isempty)
  * [#`function isInst`](#function-isinst)
  * [#`function req`](#function-req)
  * [#`function opt`](#function-opt)
  * [#`function reqInst`](#function-reqinst)
  * [#`function optInst`](#function-optinst)
  * [#`function only`](#function-only)
  * [#`function onlyInst`](#function-onlyinst)
  * [#`function render`](#function-render)
  * [#`function renderLax`](#function-renderlax)
  * [#`function show`](#function-show)
  * [#`function toTrueArr`](#function-totruearr)
  * [#`function is`](#function-is)
  * [#`function truthy`](#function-truthy)
  * [#`function falsy`](#function-falsy)
  * [#`function nop`](#function-nop)
  * [#`function id`](#function-id)
  * [#`function val`](#function-val)
  * [#`function panic`](#function-panic)
  * [#`function vac`](#function-vac)
  * [#`function bind`](#function-bind)
  * [#`function not`](#function-not)
  * [#`function hasOwn`](#function-hasown)
  * [#`function hasOwnEnum`](#function-hasownenum)
  * [#`function hasMeth`](#function-hasmeth)
  * [#`function setProto`](#function-setproto)
  * [#`function npo`](#function-npo)
  * [#`class Emp`](#class-emp)
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
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'
```

## API

### `function isNil`

Links: [source](../lang.mjs#L3); [test/example](../test/lang_test.mjs#L182).

True for `null` and `undefined`. Same as `value == null`. Incidentally, these are the only values that produce an exception when attempting to read a property: `null.someProperty`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

// Definition
function isNil(value) {return value == null}

l.isNil(null)
// true

l.isNil(undefined)
// true

l.isNil(false)
// false
```

### `function isSome`

Links: [source](../lang.mjs#L8); [test/example](../test/lang_test.mjs#L190).

Inverse of [#`isNil`](#function-isnil). False for `null` and `undefined`, true for other values.

### `function isBool`

Links: [source](../lang.mjs#L13); [test/example](../test/lang_test.mjs#L198).

Same as `typeof val === 'boolean'`.

### `function isNum`

Links: [source](../lang.mjs#L19); [test/example](../test/lang_test.mjs#L207).

Same as `typeof val === 'number'`. True if the value is a primitive number, _including_ `NaN` and `±Infinity`. In most cases you should use [#`isFin`](#function-isfin) instead.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

l.isNum(1)
// true

l.isNum('1')
// false

l.isNum(NaN)
// true <-- WTF
```

### `function isFin`

Links: [source](../lang.mjs#L25); [test/example](../test/lang_test.mjs#L218).

Same as ES2015's [`Number.isFinite`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite). True if `val` is a primitive number and is _not_ `NaN` or `±Infinity`. In most cases you should prefer `isFin` over `isNum`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

l.isFin(1)
// true

l.isFin('1')
// false

l.isFin(NaN)
// false
```

### `function isFinNeg`

Links: [source](../lang.mjs#L31); [test/example](../test/lang_test.mjs#L232).

True if value is finite (via [#`isFin`](#function-isfin)) and < 0.

### `function isFinPos`

Links: [source](../lang.mjs#L36); [test/example](../test/lang_test.mjs#L251).

True if value is finite (via [#`isFin`](#function-isfin)) and > 0.

### `function isInt`

Links: [source](../lang.mjs#L42); [test/example](../test/lang_test.mjs#L270).

True if value is an integer: finite via [#`isFin`](#function-isfin), without a fractional part.

### `function isNat`

Links: [source](../lang.mjs#L48); [test/example](../test/lang_test.mjs#L288).

True if value is a natural number: integer >= 0. Also see [#`isIntPos`](#function-isintpos).

### `function isIntNeg`

Links: [source](../lang.mjs#L54); [test/example](../test/lang_test.mjs#L306).

True if value is integer < 0. Also see [#`isFinNeg`](#function-isfinneg).

### `function isIntPos`

Links: [source](../lang.mjs#L59); [test/example](../test/lang_test.mjs#L325).

True if value is integer > 0. Also see [#`isNat`](#function-isnat), [#`isFinPos`](#function-isfinpos).

### `function isNaN`

Links: [source](../lang.mjs#L64); [test/example](../test/lang_test.mjs#L344).

Same as ES2015's [`Number.isNaN`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN). True if value is _actually_ `NaN`. Doesn't coerce non-numbers to numbers, unlike global `isNaN`.

### `function isInf`

Links: [source](../lang.mjs#L69); [test/example](../test/lang_test.mjs#L359).

True if value is `-Infinity` or `Infinity`.

### `function isBigInt`

Links: [source](../lang.mjs#L74); [test/example](../test/lang_test.mjs#L374).

True if value is a primitive [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). False for all other inputs, including `BigInt` object wrappers.

### `function isStr`

Links: [source](../lang.mjs#L80); [test/example](../test/lang_test.mjs#L393).

Same as `typeof val === 'string'`. True if value is a primitive string.

### `function isSym`

Links: [source](../lang.mjs#L93); [test/example](../test/lang_test.mjs#L411).

Same as `typeof val === 'symbol'`. True if value is a primitive symbol.

### `function isKey`

Links: [source](../lang.mjs#L99); [test/example](../test/lang_test.mjs#L418).

True if value qualifies as a dictionary key. True for all primitives excluding garbage values via [#`isJunk`](#function-isjunk).

### `function isPk`

Links: [source](../lang.mjs#L104); [test/example](../test/lang_test.mjs#L438).

True for objects that implement method `.pk` which must return a valid [#primary](#function-ispk). This interface is used internally by [`Coll`](coll_readme.md#class-coll).

### `function isJunk`

Links: [source](../lang.mjs#L109); [test/example](../test/lang_test.mjs#L459).

True for garbage values: [#nil](#function-isnil), [#NaN](#function-isnan), [#±Infinity](#function-isinf).

### `function isComp`

Links: [source](../lang.mjs#L114); [test/example](../test/lang_test.mjs#L474).

True if value is "composite" / "compound" / "complex". Opposite of [#`isPrim`](#function-isprim). Definition:

```js
function isComp(val) {return isObj(val) || isFun(val)}
```

### `function isPrim`

Links: [source](../lang.mjs#L119); [test/example](../test/lang_test.mjs#L488).

True if value is a JS primitive: not an object, not a function. Opposite of [#`isComp`](#function-iscomp).

### `function isFun`

Links: [source](../lang.mjs#L124); [test/example](../test/lang_test.mjs#L502).

Same as `typeof val === 'function'`. True if value is any function, regardless of its type (arrow, async, generator, etc.).

### `function isFunSync`

Links: [source](../lang.mjs#L129); [test/example](../test/lang_test.mjs#L526).

True if the input is a normal sync function. False for generator functions or async functions.

### `function isFunGen`

Links: [source](../lang.mjs#L134); [test/example](../test/lang_test.mjs#L536).

True if the input is a sync generator function. False for normal sync functions and async functions.

### `function isFunAsync`

Links: [source](../lang.mjs#L139); [test/example](../test/lang_test.mjs#L546).

True if the input is an async non-generator function. False for sync functions, generator functions, or async generator functions.

### `function isFunAsyncGen`

Links: [source](../lang.mjs#L144); [test/example](../test/lang_test.mjs#L556).

True if the input is an async generator function. False for sync functions and async non-generator functions.

### `function isObj`

Links: [source](../lang.mjs#L149); [test/example](../test/lang_test.mjs#L566).

Same as `typeof val === 'object' && val !== null`. True for any JS object: plain dict, array, various other classes. Doesn't include functions, even though JS functions are extensible objects.

* Compare [#`isComp`](#function-iscomp) which returns true for objects _and_ functions.
* For plain objects used as dictionaries, see [#`isDict`](#function-isdict).
* For fancy non-list objects, see [#`isStruct`](#function-isstruct).

### `function isDict`

Links: [source](../lang.mjs#L154); [test/example](../test/lang_test.mjs#L857).

True for a "plain object" created via `{...}` or `Object.create(null)`. False for any other input, including instances of any class other than `Object`.

See [#`isStruct`](#function-isstruct) for a more general definition of a non-iterable object.

### `function isStruct`

Links: [source](../lang.mjs#L160); [test/example](../test/lang_test.mjs#L582).

True if value is a non-iterable object. Excludes both [#sync_iterables](#function-isiter) and [#async_iterables](#function-isiterasync). Note that [#dicts](#function-isdict) are automatically structs, but not all structs are dicts.

### `function isArr`

Links: [source](../lang.mjs#L166); [test/example](../test/lang_test.mjs#L604).

Alias for [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray). Used internally for all array checks.

True if value is an instance of [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) or its subclass. False for all other values, including non-array objects whose prototype is an array.

### `function isTrueArr`

Links: [source](../lang.mjs#L176); [test/example](../test/lang_test.mjs#L616).

Similar to [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) and [#`isArr`](#function-isarr), but returns true only for instances of the _exact_ `Array` class, false for instances of subclasses.

At the time of writing, subclasses of `Array` suffer horrible performance penalties in V8, and possibly in other engines. Using them can also cause deoptimization of code that would otherwise run much faster. We sometimes prioritize or even enforce "true" arrays for consistent performance.

### `function isReg`

Links: [source](../lang.mjs#L182); [test/example](../test/lang_test.mjs#L631).

True if value is an instance of [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) or its subclass.

### `function isDate`

Links: [source](../lang.mjs#L187); [test/example](../test/lang_test.mjs#L639).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Most of the time you should prefer [#`isValidDate`](#function-isvaliddate).

### `function isValidDate`

Links: [source](../lang.mjs#L192); [test/example](../test/lang_test.mjs#L647).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) and its timestamp is [#finite](#function-isfin) rather than `NaN` or `Infinity`.

### `function isInvalidDate`

Links: [source](../lang.mjs#L197); [test/example](../test/lang_test.mjs#L654).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) representing an invalid date whose timestamp is `NaN`.

### `function isSet`

Links: [source](../lang.mjs#L202); [test/example](../test/lang_test.mjs#L661).

True if value is an instance of [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) or its subclass.

### `function isMap`

Links: [source](../lang.mjs#L208); [test/example](../test/lang_test.mjs#L671).

True if value is an instance of [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or its subclass.

### `function isPromise`

Links: [source](../lang.mjs#L214); [test/example](../test/lang_test.mjs#L681).

True if the value satisfies the ES2015 [promise interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### `function isIter`

Links: [source](../lang.mjs#L221); [test/example](../test/lang_test.mjs#L690).

True if the value satisfies the ES2015 [sync iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterator_ rather than _iterable_, use [#`isIterator`](#function-isiterator).

### `function isIterAsync`

Links: [source](../lang.mjs#L228); [test/example](../test/lang_test.mjs#L716).

True if the value satisfies the ES2015 [async iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterator_ rather than _iterable_, use [#`isIteratorAsync`](#function-isiteratorasync).

### `function isIterator`

Links: [source](../lang.mjs#L233); [test/example](../test/lang_test.mjs#L733).

True if the value satisfies the ES2015 [sync iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterable_ rather than _iterator_, use [#`isIter`](#function-isiter).

### `function isIteratorAsync`

Links: [source](../lang.mjs#L238); [test/example](../test/lang_test.mjs#L759).

True if the value satisfies the ES2015 [async iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterable_ rather than _iterator_, use [#`isIterAsync`](#function-isiterasync).

### `function isGen`

Links: [source](../lang.mjs#L243); [test/example](../test/lang_test.mjs#L785).

True if value is a [#sync_iterator](#function-isiterator) created by calling a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).

### `function isCls`

Links: [source](../lang.mjs#L249); [test/example](../test/lang_test.mjs#L845).

True if the input is a function with a prototype, likely to be a class. False for arrow functions such as `() => {}`, which don't have a prototype.

### `function isList`

Links: [source](../lang.mjs#L260); [test/example](../test/lang_test.mjs#L870).

True for any array-like such as: `[]`, `arguments`, `TypedArray`, `NodeList`, etc. Used internally for most list checks. Note that _primitive strings are not considered lists_.

### `function isSeq`

Links: [source](../lang.mjs#L266); [test/example](../test/lang_test.mjs#L885).

True for any of:

  * [#Array](#function-isarr)
  * [#List](#function-islist)
  * [#Set](#function-isset)
  * [#Iterator](#function-isiterator)

Many functions in `iter.mjs` support arbitrary data structures compatible with [`values`](iter_readme.md#function-values), but some functions such as [`arr`](iter_readme.md#function-arr) allow only sequences, for sanity checking.

### `function isVac`

Links: [source](../lang.mjs#L271); [test/example](../test/lang_test.mjs#L902).

Short for "is vacuous" or "is vacated". Could also be called "is falsy deep". True if the input is [#`falsy`](#function-falsy) or a [#list](#function-islist) where all values are vacuous, recursively. Does not iterate non-lists. Also see complementary function [#`vac`](#function-vac).

### `function isScalar`

Links: [source](../lang.mjs#L276); [test/example](../test/lang_test.mjs#L940).

True for a value that could be considered a single scalar, rather than a collection / data structure. Currently this is equivalent to the concept of an _intentionally stringable_ value. In the future, we may consider renaming this function or splitting the concepts.

The following are included:

  * Any [#primitive](#function-isprim) except for those which are excluded below.
    * Examples: [#bool](#function-isbool), [#string](#function-isstr), [#number](#function-isnum), [#bigint](#function-isbigint).
  * Any [#object](#function-isobj) with a special `.toString` method, distinct from both `Object.prototype.toString` and `Array.prototype.toString`. Examples include [#dates](#function-isdate), `URL`, and many more.

The following are excluded:

  * Any [#nil](#function-isnil).
  * Any [#symbol](#function-issym).
  * Any object _without_ a special `.toString` method.

To include nil, use [#`isScalarOpt`](#function-isscalaropt).

### `function isEq`

Links: [source](../lang.mjs#L298); [test/example](../test/lang_test.mjs#L995).

True for objects that implement method `.eq` which must take another object and compare for equality. This is a made-up interface implemented by some types in this library, such as [`DateTime`](time_readme.md#class-datetime) and [`Url`](url_readme.md#class-url).

### `function isEmpty`

Links: [source](../lang.mjs#L323); [test/example](../test/lang_test.mjs#L1025).

True if the input is an empty collection such as list, set, map, or a primitive such as `null`. False for any other non-primitive. Treating primitives as "empty" is consistent with various functions in `iter.mjs` that operate on collections.

### `function isInst`

Links: [source](../lang.mjs#L330); [test/example](../test/lang_test.mjs#L977).

Signature: `(val, Cls) => bool`.

Same as `instanceof` but _does not_ implicitly convert the operand to an object. True only if the operand is already an instance of the given class. Also unlike `instanceof`, this is always false for functions, avoiding the insanity of `fun instanceof Function` being true.

### `function req`

Links: [source](../lang.mjs#L334); [test/example](../test/lang_test.mjs#L1198).

Signature: `(val, test) => val` where `test: val => bool`.

Short for "require". Minification-friendly assertion. If `!test(val)`, throws an informative `TypeError`. Otherwise, returns `val` as-is.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

l.req({one: `two`}, l.isObj)
// {one: `two`}

l.req('str', l.isFun)
// Uncaught TypeError: expected variant of isFun, got "str"
```

### `function opt`

Links: [source](../lang.mjs#L344); [test/example](../test/lang_test.mjs#L1257).

Short for "optional". If `val` is [#non_nil](#function-issome), uses [#`req`](#function-req) to validate it. Returns `val` as-is.

### `function reqInst`

Links: [source](../lang.mjs#L353); [test/example](../test/lang_test.mjs#L1295).

Signature: `(val, Cls) => val`.

Short for "require instance". Asserts that `val` is an instance of the given class. Returns `val` as-is.

### `function optInst`

Links: [source](../lang.mjs#L358); [test/example](../test/lang_test.mjs#L1312).

Short for "optional instance". If `val` is [#non_nil](#function-issome), uses [#`reqInst`](#function-reqinst) to validate it. Returns `val` as-is.

### `function only`

Links: [source](../lang.mjs#L363); [test/example](../test/lang_test.mjs#L1344).

Signature: `(val, test) => val` where `test: val => bool`.

Type filtering utility. If `val` satisfies the given test function, returns `val` as-is. Otherwise returns `undefined`.

### `function onlyInst`

Links: [source](../lang.mjs#L365); [test/example](../test/lang_test.mjs#L1371).

Signature: `(val, Cls) => val?`.

Type filtering utility. If `val` is an instance of `Cls`, returns `val` as-is. Otherwise returns `undefined`.

### `function render`

Links: [source](../lang.mjs#L372); [test/example](../test/lang_test.mjs#L77).

Renders a value for user display. Counterpart to [#`show`](#function-show), which renders a value for debug purposes. Intended only for [#scalar](#function-isscalar) values. Rules:

  * [#Date](#function-isdate) with default `.toString` → use `.toISOString`. This overrides the insane JS default stringification of dates, defaulting to the _reversible_ machine-decodable representation used for JSON.
  * Other [#non-nil](#function-issome) [#scalars](#function-isscalar) → default JS stringification.
  * All other inputs including nils → `TypeError` exception.

### `function renderLax`

Links: [source](../lang.mjs#L379); [test/example](../test/lang_test.mjs#L85).

Renders a value for user display. Intended only for [#scalar](#function-isscalar) values. Unlike [#`render`](#function-render), this allows nil. Rules:

  * [#Nil](#function-isnil) → `''`.
  * Otherwise → [#`render`](#function-render).

### `function show`

Links: [source](../lang.mjs#L381); [test/example](../test/lang_test.mjs#L20).

Renders a value for debug purposes. Counterpart to [#`render`](#function-render), which renders a value for user display. Convenient for interpolating things into error messages. Used internally in assertion functions such as [#`req`](#function-req). Approximate rules:

  * String → use `JSON.stringify`.
  * Function → `[function ${val.name || val}]`.
    * For named functions, this shorter representation is usually preferable to printing the entire source code.
  * Object →
    * Plain `{}` or `[]` → use `JSON.stringify`.
    * Otherwise `[object <name>]`, prioritizing constructor name over `Symbol.toStringTag`.
      * Exact opposite of default behavior for `Object.prototype.toString`.
  * Otherwise → default JS stringification.

### `function toTrueArr`

Links: [source](../lang.mjs#L389); [test/example](../test/lang_test.mjs#L128).

Idempotent conversion to a [#true](#function-istruearr). Allowed inputs:

  * [#Nil](#function-isnil) → return `[]`.
  * [#True](#function-istruearr) → return as-is.
  * [#Iterable](#function-isiter) → convert to `Array`.
  * Otherwise → `TypeError` exception.

### `function is`

Links: [source](../lang.mjs#L397); [test/example](../test/lang_test.mjs#L172).

Identity test: same as `===`, but considers `NaN` equal to `NaN`. Equivalent to [_SameValueZero_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero) as defined by the language spec. Used internally for all identity tests.

Note that [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) implements [_SameValue_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevalue), which treats `-0` and `+0` as _distinct values_. This is typically undesirable. As a result, you should prefer `l.is` over `===` or `Object.is`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

l.is(1, '1')
// false

l.is(NaN, NaN)
// true
```

### `function truthy`

Links: [source](../lang.mjs#L398); [test/example](../test/lang_test.mjs#L158).

Same as `!!` or `Boolean`. Sometimes useful with higher-order functions.

### `function falsy`

Links: [source](../lang.mjs#L399); [test/example](../test/lang_test.mjs#L165).

Same as `!`. Sometimes useful with higher-order functions.

### `function nop`

Links: [source](../lang.mjs#L400); [test/example](../test/lang_test.mjs#L1587).

Empty function. Functional equivalent of `;` or `undefined`. Sometimes useful with higher-order functions.

### `function id`

Links: [source](../lang.mjs#L401); [test/example](../test/lang_test.mjs#L1593).

Identity function: returns its first argument unchanged. Sometimes useful with higher-order functions.

### `function val`

Links: [source](../lang.mjs#L402); [test/example](../test/lang_test.mjs#L1600).

Takes a value and creates a function that always returns that value. Sometimes useful with higher order functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

const constant = l.val(1)

constant()
// 1

constant(`this input is ignored`)
// 1
```

### `function panic`

Links: [source](../lang.mjs#L403); [test/example](../test/lang_test.mjs#L1614).

Same as `throw` but an expression rather than a statement. Also sometimes useful with higher-order functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

const x = someTest ? someValue : l.panic(Error(`unreachable`))
```

### `function vac`

Links: [source](../lang.mjs#L406); [test/example](../test/lang_test.mjs#L1761).

Complements [#`isVac`](#function-isvac). Returns `undefined` if the input is vacuous, otherwise returns the input as-is.

### `function bind`

Links: [source](../lang.mjs#L408); [test/example](../test/lang_test.mjs#L1558).

Like [`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind), but instead of taking `this` as an argument, takes it contextually. By default `this` is `undefined`. To set it, use `l.bind.call`.

Returns a new function that represents [partial application](https://en.wikipedia.org/wiki/Partial_application) of the given function, a common tool in functional programming. When called, it joins arguments from both calls and invokes the original function. Think of it like splitting a function call in two, or more. Performance is inferior to closures; avoid in hotspots.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

const inc = l.bind(l.add, 1)

inc(2)
// 3
```

Note: we don't provide facilities for currying. Experience has shown it to be extremely error prone. Currying, as seen in purely functional languages such as Haskell, tends to care about the amount of arguments. Calling a curried function may either create a new function, or call the underlying function (possibly side-effectful). This approach works reasonably well in statically typed languages, but not in JS where all functions are variadic and it's conventional to sometimes pass extra utility arguments "just in case", which the callee may or may not care about. `bind` is different because the created function will always call the original function, regardless of how many arguments were passed.

### `function not`

Links: [source](../lang.mjs#L410); [test/example](../test/lang_test.mjs#L1577).

Returns a new function that negates the result of the given function, like a delayed `!`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'

function eq(a, b) {return a === b}

const different = l.not(eq)

different(10, 20)
// !eq(10, 20) = true

// equivalent:
function different(a, b) {return !eq(a, b)}
```

### `function hasOwn`

Links: [source](../lang.mjs#L416); [test/example](../test/lang_test.mjs#L1042).

Same as [`Object.prototype.hasOwnProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) but shorter and safe to call on primitives. Always false for primitives.

### `function hasOwnEnum`

Links: [source](../lang.mjs#L417); [test/example](../test/lang_test.mjs#L1056).

Same as [`Object.prototype.propertyIsEnumerable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable) but shorter and safe to call on primitives. Always false for primitives.

### `function hasMeth`

Links: [source](../lang.mjs#L419); [test/example](../test/lang_test.mjs#L1070).

True if the the given value has the given named method. Safe to call on primitives such as `null`. Always false for primitives.

### `function setProto`

Links: [source](../lang.mjs#L430); [test/example](../test/lang_test.mjs#L1138).

Workaround for bugs related to subclassing.

In some Safari versions, when instantiating a subclass of various recent
built-in classes such as `Request`/`Response`/`URL`, the engine incorrectly
uses the prototype of the superclass rather than the subclass. Occurs in Safari
12-14+, both desktop and mobile. This seems to fix that. Example:

```js
class Abort extends AbortController {
  constructor() {
    super()
    l.setProto(this, new.target)
  }
}
```

The following version is shorter but more confusing if you don't know full semantics of JS classes:

```js
class Abort extends AbortController {
  constructor() {l.setProto(super(), new.target)}
}
```

### `function npo`

Links: [source](../lang.mjs#L436); [test/example](../test/lang_test.mjs#L1154).

Short for "null-prototype object". Syntactic shortcut for `Object.create(null)`. The following are equivalent:

```js
Object.create(null)
l.npo()
```

Compare [#`Emp`](#class-emp) which is intended for subclassing.

### `class Emp`

Links: [source](../lang.mjs#L441); [test/example](../test/lang_test.mjs#L1164).

Empty class that inherits from `null` rather than `Object`. Intended for subclassing, giving you a "cleaner" class. The only inherited property is `.constructor`, which is unavoidable in JS classes.

```js
class Empty extends l.Emp {}

const ref = new Empty()

// Instantiation and inheritance works as expected.
ref.constructor === Empty
ref instanceof Empty === true

// `Object` stuff is not inherited.
ref instanceof Object === false
ref.toString === undefined
```

### `function add`

Links: [source](../lang.mjs#L446); [test/example](../test/lang_test.mjs#L1657).

Same as `+`.

### `function sub`

Links: [source](../lang.mjs#L447); [test/example](../test/lang_test.mjs#L1663).

Same as `-`.

### `function mul`

Links: [source](../lang.mjs#L448); [test/example](../test/lang_test.mjs#L1669).

Same as `*`.

### `function div`

Links: [source](../lang.mjs#L449); [test/example](../test/lang_test.mjs#L1675).

Same as `/`.

### `function rem`

Links: [source](../lang.mjs#L450); [test/example](../test/lang_test.mjs#L1681).

Same as `%`.

### `function lt`

Links: [source](../lang.mjs#L451); [test/example](../test/lang_test.mjs#L1689).

Same as `<`.

### `function gt`

Links: [source](../lang.mjs#L452); [test/example](../test/lang_test.mjs#L1700).

Same as `>`.

### `function lte`

Links: [source](../lang.mjs#L453); [test/example](../test/lang_test.mjs#L1711).

Same as `<=`.

### `function gte`

Links: [source](../lang.mjs#L454); [test/example](../test/lang_test.mjs#L1722).

Same as `>=`.

### `function neg`

Links: [source](../lang.mjs#L455); [test/example](../test/lang_test.mjs#L1733).

Arithmetic negation. Same as unary `-`.

### `function inc`

Links: [source](../lang.mjs#L456); [test/example](../test/lang_test.mjs#L1745).

Increments by `1`.

### `function dec`

Links: [source](../lang.mjs#L457); [test/example](../test/lang_test.mjs#L1753).

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
  * [`function reqInt`](../lang.mjs#L43)
  * [`function optInt`](../lang.mjs#L44)
  * [`function onlyInt`](../lang.mjs#L45)
  * [`function laxInt`](../lang.mjs#L46)
  * [`function reqNat`](../lang.mjs#L49)
  * [`function optNat`](../lang.mjs#L50)
  * [`function onlyNat`](../lang.mjs#L51)
  * [`function laxNat`](../lang.mjs#L52)
  * [`function reqIntNeg`](../lang.mjs#L55)
  * [`function optIntNeg`](../lang.mjs#L56)
  * [`function onlyIntNeg`](../lang.mjs#L57)
  * [`function reqIntPos`](../lang.mjs#L60)
  * [`function optIntPos`](../lang.mjs#L61)
  * [`function onlyIntPos`](../lang.mjs#L62)
  * [`function reqNaN`](../lang.mjs#L65)
  * [`function optNaN`](../lang.mjs#L66)
  * [`function onlyNaN`](../lang.mjs#L67)
  * [`function reqInf`](../lang.mjs#L70)
  * [`function optInf`](../lang.mjs#L71)
  * [`function onlyInf`](../lang.mjs#L72)
  * [`function reqBigInt`](../lang.mjs#L75)
  * [`function optBigInt`](../lang.mjs#L76)
  * [`function onlyBigInt`](../lang.mjs#L77)
  * [`function laxBigInt`](../lang.mjs#L78)
  * [`function reqStr`](../lang.mjs#L81)
  * [`function optStr`](../lang.mjs#L82)
  * [`function onlyStr`](../lang.mjs#L83)
  * [`function laxStr`](../lang.mjs#L84)
  * [`function isValidStr`](../lang.mjs#L87)
  * [`function reqValidStr`](../lang.mjs#L88)
  * [`function optValidStr`](../lang.mjs#L89)
  * [`function onlyValidStr`](../lang.mjs#L90)
  * [`function laxValidStr`](../lang.mjs#L91)
  * [`function reqSym`](../lang.mjs#L94)
  * [`function optSym`](../lang.mjs#L95)
  * [`function onlySym`](../lang.mjs#L96)
  * [`function reqKey`](../lang.mjs#L100)
  * [`function optKey`](../lang.mjs#L101)
  * [`function onlyKey`](../lang.mjs#L102)
  * [`function reqPk`](../lang.mjs#L105)
  * [`function optPk`](../lang.mjs#L106)
  * [`function onlyPk`](../lang.mjs#L107)
  * [`function reqJunk`](../lang.mjs#L110)
  * [`function optJunk`](../lang.mjs#L111)
  * [`function onlyJunk`](../lang.mjs#L112)
  * [`function reqComp`](../lang.mjs#L115)
  * [`function optComp`](../lang.mjs#L116)
  * [`function onlyComp`](../lang.mjs#L117)
  * [`function reqPrim`](../lang.mjs#L120)
  * [`function optPrim`](../lang.mjs#L121)
  * [`function onlyPrim`](../lang.mjs#L122)
  * [`function reqFun`](../lang.mjs#L125)
  * [`function optFun`](../lang.mjs#L126)
  * [`function onlyFun`](../lang.mjs#L127)
  * [`function reqFunSync`](../lang.mjs#L130)
  * [`function optFunSync`](../lang.mjs#L131)
  * [`function onlyFunSync`](../lang.mjs#L132)
  * [`function reqFunGen`](../lang.mjs#L135)
  * [`function optFunGen`](../lang.mjs#L136)
  * [`function onlyFunGen`](../lang.mjs#L137)
  * [`function reqFunAsync`](../lang.mjs#L140)
  * [`function optFunAsync`](../lang.mjs#L141)
  * [`function onlyFunAsync`](../lang.mjs#L142)
  * [`function reqFunAsyncGen`](../lang.mjs#L145)
  * [`function optFunAsyncGen`](../lang.mjs#L146)
  * [`function onlyFunAsyncGen`](../lang.mjs#L147)
  * [`function reqObj`](../lang.mjs#L150)
  * [`function optObj`](../lang.mjs#L151)
  * [`function onlyObj`](../lang.mjs#L152)
  * [`function reqDict`](../lang.mjs#L155)
  * [`function optDict`](../lang.mjs#L156)
  * [`function onlyDict`](../lang.mjs#L157)
  * [`function laxDict`](../lang.mjs#L158)
  * [`function reqStruct`](../lang.mjs#L161)
  * [`function optStruct`](../lang.mjs#L162)
  * [`function onlyStruct`](../lang.mjs#L163)
  * [`function laxStruct`](../lang.mjs#L164)
  * [`function reqArr`](../lang.mjs#L167)
  * [`function optArr`](../lang.mjs#L168)
  * [`function onlyArr`](../lang.mjs#L169)
  * [`function laxArr`](../lang.mjs#L170)
  * [`function reqTrueArr`](../lang.mjs#L177)
  * [`function optTrueArr`](../lang.mjs#L178)
  * [`function onlyTrueArr`](../lang.mjs#L179)
  * [`function laxTrueArr`](../lang.mjs#L180)
  * [`function reqReg`](../lang.mjs#L183)
  * [`function optReg`](../lang.mjs#L184)
  * [`function onlyReg`](../lang.mjs#L185)
  * [`function reqDate`](../lang.mjs#L188)
  * [`function optDate`](../lang.mjs#L189)
  * [`function onlyDate`](../lang.mjs#L190)
  * [`function reqValidDate`](../lang.mjs#L193)
  * [`function optValidDate`](../lang.mjs#L194)
  * [`function onlyValidDate`](../lang.mjs#L195)
  * [`function reqInvalidDate`](../lang.mjs#L198)
  * [`function optInvalidDate`](../lang.mjs#L199)
  * [`function onlyInvalidDate`](../lang.mjs#L200)
  * [`function reqSet`](../lang.mjs#L203)
  * [`function optSet`](../lang.mjs#L204)
  * [`function onlySet`](../lang.mjs#L205)
  * [`function laxSet`](../lang.mjs#L206)
  * [`function reqMap`](../lang.mjs#L209)
  * [`function optMap`](../lang.mjs#L210)
  * [`function onlyMap`](../lang.mjs#L211)
  * [`function laxMap`](../lang.mjs#L212)
  * [`function reqPromise`](../lang.mjs#L215)
  * [`function optPromise`](../lang.mjs#L216)
  * [`function onlyPromise`](../lang.mjs#L217)
  * [`function reqIter`](../lang.mjs#L222)
  * [`function optIter`](../lang.mjs#L223)
  * [`function onlyIter`](../lang.mjs#L224)
  * [`function reqIterAsync`](../lang.mjs#L229)
  * [`function optIterAsync`](../lang.mjs#L230)
  * [`function onlyIterAsync`](../lang.mjs#L231)
  * [`function reqIterator`](../lang.mjs#L234)
  * [`function optIterator`](../lang.mjs#L235)
  * [`function onlyIterator`](../lang.mjs#L236)
  * [`function reqIteratorAsync`](../lang.mjs#L239)
  * [`function optIteratorAsync`](../lang.mjs#L240)
  * [`function onlyIteratorAsync`](../lang.mjs#L241)
  * [`function reqGen`](../lang.mjs#L244)
  * [`function optGen`](../lang.mjs#L245)
  * [`function onlyGen`](../lang.mjs#L246)
  * [`function reqCls`](../lang.mjs#L250)
  * [`function optCls`](../lang.mjs#L251)
  * [`function onlyCls`](../lang.mjs#L252)
  * [`function isSubCls`](../lang.mjs#L255)
  * [`function reqSubCls`](../lang.mjs#L256)
  * [`function optSubCls`](../lang.mjs#L257)
  * [`function onlySubCls`](../lang.mjs#L258)
  * [`function reqList`](../lang.mjs#L261)
  * [`function optList`](../lang.mjs#L262)
  * [`function onlyList`](../lang.mjs#L263)
  * [`function laxList`](../lang.mjs#L264)
  * [`function reqSeq`](../lang.mjs#L267)
  * [`function optSeq`](../lang.mjs#L268)
  * [`function onlySeq`](../lang.mjs#L269)
  * [`function reqVac`](../lang.mjs#L272)
  * [`function optVac`](../lang.mjs#L273)
  * [`function onlyVac`](../lang.mjs#L274)
  * [`function reqScalar`](../lang.mjs#L283)
  * [`function optScalar`](../lang.mjs#L284)
  * [`function onlyScalar`](../lang.mjs#L285)
  * [`function isScalarOpt`](../lang.mjs#L287)
  * [`function reqScalarOpt`](../lang.mjs#L288)
  * [`function optScalarOpt`](../lang.mjs#L289)
  * [`function onlyScalarOpt`](../lang.mjs#L290)
  * [`function isArrble`](../lang.mjs#L293)
  * [`function reqArrble`](../lang.mjs#L294)
  * [`function optArrble`](../lang.mjs#L295)
  * [`function onlyArrble`](../lang.mjs#L296)
  * [`function reqEq`](../lang.mjs#L299)
  * [`function optEq`](../lang.mjs#L300)
  * [`function onlyEq`](../lang.mjs#L301)
  * [`function isErr`](../lang.mjs#L303)
  * [`function reqErr`](../lang.mjs#L304)
  * [`function optErr`](../lang.mjs#L305)
  * [`function onlyErr`](../lang.mjs#L306)
  * [`function isArrOf`](../lang.mjs#L308)
  * [`function reqArrOf`](../lang.mjs#L314)
  * [`function optArrOf`](../lang.mjs#L319)
  * [`function reqOneOf`](../lang.mjs#L339)
  * [`function optOneOf`](../lang.mjs#L349)
  * [`function toInst`](../lang.mjs#L369)
  * [`function toInstOpt`](../lang.mjs#L370)
  * [`function True`](../lang.mjs#L404)
  * [`function False`](../lang.mjs#L405)
  * [`function hasIn`](../lang.mjs#L415)
  * [`function hasInherited`](../lang.mjs#L418)
  * [`function eq`](../lang.mjs#L421)
  * [`function errType`](../lang.mjs#L473)
  * [`function msgType`](../lang.mjs#L474)
  * [`function errFun`](../lang.mjs#L476)
  * [`function msgFun`](../lang.mjs#L477)
  * [`function throwErrFun`](../lang.mjs#L478)
  * [`function errConv`](../lang.mjs#L480)
  * [`function errSynt`](../lang.mjs#L481)
  * [`function msgConv`](../lang.mjs#L482)
  * [`function errConvInst`](../lang.mjs#L484)
  * [`function msgConvInst`](../lang.mjs#L485)
  * [`function errInst`](../lang.mjs#L487)
  * [`function msgInst`](../lang.mjs#L488)
  * [`function errIn`](../lang.mjs#L490)
  * [`function msgIn`](../lang.mjs#L491)
  * [`function errImpl`](../lang.mjs#L493)
  * [`function msgImpl`](../lang.mjs#L494)
  * [`function errWrap`](../lang.mjs#L501)
  * [`function errCause`](../lang.mjs#L514)
  * [`function convType`](../lang.mjs#L521)
  * [`function convSynt`](../lang.mjs#L526)
  * [`function showFunName`](../lang.mjs#L533)
  * [`function get`](../lang.mjs#L564)
  * [`function getOwn`](../lang.mjs#L566)
  * [`function reqGet`](../lang.mjs#L568)
  * [`function structKeys`](../lang.mjs#L584)
  * [`const sym`](../lang.mjs#L592)
