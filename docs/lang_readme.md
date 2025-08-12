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
  * [#`function isRecKey`](#function-isreckey)
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
  * [#`function isRec`](#function-isrec)
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
  * [#`function isRef`](#function-isref)
  * [#`function isEmpty`](#function-isempty)
  * [#`function isInst`](#function-isinst)
  * [#`function opt`](#function-opt)
  * [#`function req`](#function-req)
  * [#`function only`](#function-only)
  * [#`function optInst`](#function-optinst)
  * [#`function reqInst`](#function-reqinst)
  * [#`function onlyInst`](#function-onlyinst)
  * [#`function render`](#function-render)
  * [#`function renderLax`](#function-renderlax)
  * [#`function toTrueArr`](#function-totruearr)
  * [#`function deref`](#function-deref)
  * [#`function reset`](#function-reset)
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
  * [#`function hasInherited`](#function-hasinherited)
  * [#`function hasMeth`](#function-hasmeth)
  * [#`function setProto`](#function-setproto)
  * [#`function Emp`](#function-emp)
  * [#`function show`](#function-show)
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
  * [#`function round`](#function-round)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'
```

## API

### `function isNil`

Links: [source](../lang.mjs#L9); [test/example](../test/lang_test.mjs#L266).

True for `null` and `undefined`. Same as `value == null`. Incidentally, these are the only values that produce an exception when attempting to read a property: `null.someProperty`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

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

Links: [source](../lang.mjs#L14); [test/example](../test/lang_test.mjs#L274).

Inverse of [#`isNil`](#function-isnil). False for `null` and `undefined`, true for other values.

### `function isBool`

Links: [source](../lang.mjs#L19); [test/example](../test/lang_test.mjs#L282).

Same as `typeof val === 'boolean'`.

### `function isNum`

Links: [source](../lang.mjs#L25); [test/example](../test/lang_test.mjs#L291).

Same as `typeof val === 'number'`. True if the value is a primitive number, _including_ `NaN` and `±Infinity`. In most cases you should use [#`isFin`](#function-isfin) instead.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

l.isNum(1)
// true

l.isNum(`1`)
// false

l.isNum(NaN)
// true <-- WTF
```

### `function isFin`

Links: [source](../lang.mjs#L31); [test/example](../test/lang_test.mjs#L303).

Same as ES2015's [`Number.isFinite`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite). True if `val` is a primitive number and is _not_ `NaN` or `±Infinity`. In most cases you should prefer `isFin` over `isNum`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

l.isFin(1)
// true

l.isFin(`1`)
// false

l.isFin(NaN)
// false
```

### `function isFinNeg`

Links: [source](../lang.mjs#L37); [test/example](../test/lang_test.mjs#L318).

True if the value is finite (via [#`isFin`](#function-isfin)) and < 0.

### `function isFinPos`

Links: [source](../lang.mjs#L42); [test/example](../test/lang_test.mjs#L338).

True if the value is finite (via [#`isFin`](#function-isfin)) and > 0.

### `function isInt`

Links: [source](../lang.mjs#L48); [test/example](../test/lang_test.mjs#L358).

True if the value is an integer: finite via [#`isFin`](#function-isfin), without a fractional part.

### `function isNat`

Links: [source](../lang.mjs#L54); [test/example](../test/lang_test.mjs#L377).

True if the value is a natural number: integer >= 0. Also see [#`isIntPos`](#function-isintpos).

### `function isIntNeg`

Links: [source](../lang.mjs#L60); [test/example](../test/lang_test.mjs#L396).

True if the value is integer < 0. Also see [#`isFinNeg`](#function-isfinneg).

### `function isIntPos`

Links: [source](../lang.mjs#L65); [test/example](../test/lang_test.mjs#L415).

True if the value is integer > 0. Also see [#`isNat`](#function-isnat), [#`isFinPos`](#function-isfinpos).

### `function isNaN`

Links: [source](../lang.mjs#L70); [test/example](../test/lang_test.mjs#L434).

Same as ES2015's [`Number.isNaN`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN). True if the value is _actually_ `NaN`. Doesn't coerce non-numbers to numbers, unlike global `isNaN`.

### `function isInf`

Links: [source](../lang.mjs#L75); [test/example](../test/lang_test.mjs#L449).

True if the value is `-Infinity` or `Infinity`.

### `function isBigInt`

Links: [source](../lang.mjs#L80); [test/example](../test/lang_test.mjs#L464).

True if the value is a primitive [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). False for all other inputs, including `BigInt` object wrappers.

### `function isStr`

Links: [source](../lang.mjs#L86); [test/example](../test/lang_test.mjs#L483).

Same as `typeof val === 'string'`. True if the value is a primitive string.

### `function isSym`

Links: [source](../lang.mjs#L98); [test/example](../test/lang_test.mjs#L501).

Same as `typeof val === 'symbol'`. True if the value is a primitive symbol.

### `function isKey`

Links: [source](../lang.mjs#L104); [test/example](../test/lang_test.mjs#L508).

True if the value is primitive and usable as a map key. True for all primitives excluding garbage values via [#`isJunk`](#function-isjunk).

### `function isRecKey`

Links: [source](../lang.mjs#L109); [test/example](../test/lang_test.mjs#L528).

Short for "is record key".

True if the value qualifies as an object property key: either a string or a symbol.

Uses the term "record" for consistency with [#`isRec`](#function-isrec) which defines what is a record (a non-iterable object).

### `function isPk`

Links: [source](../lang.mjs#L114); [test/example](../test/lang_test.mjs#L548).

True for objects that implement method `.pk` which must return a valid [#primary key](#function-ispk). This interface is used internally by [`Coll`](coll_readme.md#class-coll).

### `function isJunk`

Links: [source](../lang.mjs#L119); [test/example](../test/lang_test.mjs#L569).

True for garbage values: [#nil](#function-isnil), [#NaN](#function-isnan), [#±Infinity](#function-isinf).

### `function isComp`

Links: [source](../lang.mjs#L124); [test/example](../test/lang_test.mjs#L584).

True if the value is "composite" / "compound" / "complex". Opposite of [#`isPrim`](#function-isprim). Definition:

```js
function isComp(val) {return isObj(val) || isFun(val)}
```

### `function isPrim`

Links: [source](../lang.mjs#L129); [test/example](../test/lang_test.mjs#L598).

True if the value is a JS primitive: not an object, not a function. Opposite of [#`isComp`](#function-iscomp).

### `function isFun`

Links: [source](../lang.mjs#L134); [test/example](../test/lang_test.mjs#L612).

Same as `typeof val === 'function'`. True if the value is any function, regardless of its type (arrow, async, generator, etc.).

### `function isFunSync`

Links: [source](../lang.mjs#L139); [test/example](../test/lang_test.mjs#L636).

True if the input is a normal sync function. False for generator functions or async functions.

### `function isFunGen`

Links: [source](../lang.mjs#L144); [test/example](../test/lang_test.mjs#L646).

True if the input is a sync generator function. False for normal sync functions and async functions.

### `function isFunAsync`

Links: [source](../lang.mjs#L149); [test/example](../test/lang_test.mjs#L656).

True if the input is an async non-generator function. False for sync functions, generator functions, or async generator functions.

### `function isFunAsyncGen`

Links: [source](../lang.mjs#L154); [test/example](../test/lang_test.mjs#L666).

True if the input is an async generator function. False for sync functions and async non-generator functions.

### `function isObj`

Links: [source](../lang.mjs#L159); [test/example](../test/lang_test.mjs#L676).

Same as `typeof val === 'object' && val !== null`. True for any JS object: plain dict, array, various other classes. Doesn't include functions, even though JS functions are extensible objects.

* Compare [#`isComp`](#function-iscomp) which returns true for objects _and_ functions.
* For plain objects used as dictionaries, see [#`isDict`](#function-isdict).
* For fancy non-list objects, see [#`isRec`](#function-isrec).

### `function isDict`

Links: [source](../lang.mjs#L170); [test/example](../test/lang_test.mjs#L708).

True for a "plain object" created in any of the following ways:
* `{...someFields}`
* `{__proto__: null, ...someFields}`
* `Object.create(null)`

False for any other input, including instances of any class other than `Object`, or even for `Object.create(Object.create(null))`.

See [#`isRec`](#function-isrec) for a more general definition of a non-iterable object.

### `function isRec`

Links: [source](../lang.mjs#L183); [test/example](../test/lang_test.mjs#L726).

Short for "is record".

True if the value is a non-iterable object. Excludes both [#sync_iterables](#function-isiter) and [#async_iterables](#function-isiterasync). Note that [#dicts](#function-isdict) are automatically records, but not all records are dicts.

Technically, promises would qualify as records under this definition. But as a
special case, instances of `Promise` are excluded to help detect the common
case of forgetting `await`. The overhead on that check should be virtually
unmeasurable.

### `function isArr`

Links: [source](../lang.mjs#L191); [test/example](../test/lang_test.mjs#L753).

Alias for [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray). Used internally for all array checks.

True if the value is an instance of [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) or its subclass. False for all other values, including non-array objects whose prototype is an array.

### `function isTrueArr`

Links: [source](../lang.mjs#L201); [test/example](../test/lang_test.mjs#L765).

Similar to [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) and [#`isArr`](#function-isarr), but returns true only for instances of the _exact_ `Array` class, false for instances of subclasses.

At the time of writing, subclasses of `Array` suffer horrible performance penalties in V8, and possibly in other engines. Using them can also cause deoptimization of code that would otherwise run much faster. We sometimes prioritize or even enforce "true" arrays for consistent performance.

### `function isReg`

Links: [source](../lang.mjs#L207); [test/example](../test/lang_test.mjs#L780).

True if the value is an instance of [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) or its subclass.

### `function isDate`

Links: [source](../lang.mjs#L212); [test/example](../test/lang_test.mjs#L788).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Most of the time you should prefer [#`isValidDate`](#function-isvaliddate).

### `function isValidDate`

Links: [source](../lang.mjs#L217); [test/example](../test/lang_test.mjs#L796).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) and its timestamp is [#finite](#function-isfin) rather than `NaN` or `Infinity`.

### `function isInvalidDate`

Links: [source](../lang.mjs#L222); [test/example](../test/lang_test.mjs#L803).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) representing an invalid date whose timestamp is `NaN`.

### `function isSet`

Links: [source](../lang.mjs#L227); [test/example](../test/lang_test.mjs#L810).

True if the value is an instance of [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) or its subclass.

### `function isMap`

Links: [source](../lang.mjs#L233); [test/example](../test/lang_test.mjs#L820).

True if the value is an instance of [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or its subclass.

### `function isPromise`

Links: [source](../lang.mjs#L239); [test/example](../test/lang_test.mjs#L830).

True if the value satisfies the ES2015 [promise interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### `function isIter`

Links: [source](../lang.mjs#L244); [test/example](../test/lang_test.mjs#L839).

True if the value satisfies the ES2015 [sync iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterator_ rather than _iterable_, use [#`isIterator`](#function-isiterator).

### `function isIterAsync`

Links: [source](../lang.mjs#L249); [test/example](../test/lang_test.mjs#L865).

True if the value satisfies the ES2015 [async iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterator_ rather than _iterable_, use [#`isIteratorAsync`](#function-isiteratorasync).

### `function isIterator`

Links: [source](../lang.mjs#L254); [test/example](../test/lang_test.mjs#L882).

True if the value satisfies the ES2015 [sync iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterable_ rather than _iterator_, use [#`isIter`](#function-isiter).

### `function isIteratorAsync`

Links: [source](../lang.mjs#L259); [test/example](../test/lang_test.mjs#L908).

True if the value satisfies the ES2015 [async iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterable_ rather than _iterator_, use [#`isIterAsync`](#function-isiterasync).

### `function isGen`

Links: [source](../lang.mjs#L264); [test/example](../test/lang_test.mjs#L934).

True if the value is a [#sync_iterator](#function-isiterator) created by calling a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).

### `function isCls`

Links: [source](../lang.mjs#L269); [test/example](../test/lang_test.mjs#L994).

True if the input is a function with a prototype, suitable for `instanceof` checks. False for arrow functions such as `() => {}`, which don't have a prototype.

### `function isList`

Links: [source](../lang.mjs#L299); [test/example](../test/lang_test.mjs#L1058).

True for any array-like such as: `[]`, `arguments`, `TypedArray`, `NodeList`, etc. Used internally for most list checks. Note that _primitive strings are not considered lists_.

### `function isSeq`

Links: [source](../lang.mjs#L305); [test/example](../test/lang_test.mjs#L1074).

True for any of:

  * [#Array](#function-isarr)
  * [#List](#function-islist)
  * [#Set](#function-isset)
  * [#Iterator](#function-isiterator)

Many functions in `iter.mjs` support arbitrary data structures compatible with [`values`](iter_readme.md#function-values), but some functions such as [`arr`](iter_readme.md#function-arr) allow only sequences, for sanity checking.

### `function isVac`

Links: [source](../lang.mjs#L310); [test/example](../test/lang_test.mjs#L1103).

Short for "is vacuous" or "is vacated". Could also be called "is falsy deep". True if the input is [#`falsy`](#function-falsy) or a [#list](#function-islist) where all values are vacuous, recursively. Does not iterate non-lists. Also see complementary function [#`vac`](#function-vac).

### `function isScalar`

Links: [source](../lang.mjs#L315); [test/example](../test/lang_test.mjs#L1141).

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

### `function isRef`

Links: [source](../lang.mjs#L351); [test/example](../test/lang_test.mjs#L2110).

Defines a "reference" interface which is consistently across all modules in this library. A "reference" is something that can be [#`deref`](#function-deref) into an underlying value. Any object can implement this interface by providing a symbolic property `Symbol.for("val")`.

References are used via the functions [#`deref`](#function-deref) and [#`reset`](#function-reset).

The most notable reference types are observables provided by the module [`obs`](obs_readme.md).

The names `deref` and `reset` for this interface are lifted from Clojure.

Combined example:

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/obs.mjs'

l.isRef(10) // false
l.isRef({}) // false

const obs = ob.obsRef(10)

l.isRef(obs) // true
l.deref(obs) // 10
l.reset(obs, 20)
l.deref(obs) // 20
```

### `function isEmpty`

Links: [source](../lang.mjs#L375); [test/example](../test/lang_test.mjs#L1226).

True if the input is an empty collection such as list, set, map, or a primitive such as `null`. False for any other non-primitive. Treating primitives as "empty" is consistent with various functions in `iter.mjs` that operate on collections.

### `function isInst`

Links: [source](../lang.mjs#L382); [test/example](../test/lang_test.mjs#L1178).

Signature: `(val, Cls) => bool`.

Same as `instanceof` but _does not_ implicitly convert the operand to an object. True only if the operand is already an instance of the given class. Also unlike `instanceof`, this is always false for functions.

### `function opt`

Links: [source](../lang.mjs#L387); [test/example](../test/lang_test.mjs#L1503).

Short for "optional". If `val` is [#non_nil](#function-issome), uses [#`req`](#function-req) to validate it. Returns `val` as-is.

### `function req`

Links: [source](../lang.mjs#L392); [test/example](../test/lang_test.mjs#L1444).

Signature: `(val, test) => val` where `test: val => bool`.

Short for "require". Minification-friendly assertion. If `!test(val)`, throws an informative `TypeError`. Otherwise, returns `val` as-is.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

l.req({one: `two`}, l.isObj)
// {one: `two`}

l.req(`str`, l.isFun)
// Uncaught TypeError: expected variant of isFun, got "str"
```

### `function only`

Links: [source](../lang.mjs#L397); [test/example](../test/lang_test.mjs#L1597).

Signature: `(val, test) => val` where `test: val => bool`.

Type filtering utility. If `val` satisfies the given test function, returns `val` as-is. Otherwise returns `undefined`.

### `function optInst`

Links: [source](../lang.mjs#L408); [test/example](../test/lang_test.mjs#L1558).

Short for "optional instance". If `val` is [#non_nil](#function-issome), uses [#`reqInst`](#function-reqinst) to validate it. Returns `val` as-is.

### `function reqInst`

Links: [source](../lang.mjs#L410); [test/example](../test/lang_test.mjs#L1541).

Signature: `(val, Cls) => val`.

Short for "require instance". Asserts that `val` is an instance of the given class. Returns `val` as-is.

### `function onlyInst`

Links: [source](../lang.mjs#L415); [test/example](../test/lang_test.mjs#L1624).

Signature: `(val, Cls) => val?`.

Type filtering utility. If `val` is an instance of `Cls`, returns `val` as-is. Otherwise returns `undefined`.

### `function render`

Links: [source](../lang.mjs#L422); [test/example](../test/lang_test.mjs#L124).

Renders a value for user display. Counterpart to [#`show`](#function-show), which renders a value for debug purposes. Intended only for [#scalar](#function-isscalar) values. Rules:

  * [#Date](#function-isdate) with default `.toString` → use `.toISOString`. This overrides the insane JS default stringification of dates, defaulting to the _reversible_ machine-decodable representation used for JSON.
  * Other [#non-nil](#function-issome) [#scalars](#function-isscalar) → default JS stringification.
  * All other inputs including [#nil](#function-isnil) → `TypeError` exception.

### `function renderLax`

Links: [source](../lang.mjs#L435); [test/example](../test/lang_test.mjs#L157).

Renders a value for user display. Intended only for [#scalar](#function-isscalar) values. Unlike [#`render`](#function-render), this allows nil. Rules:

  * [#Nil](#function-isnil) → `''`.
  * Otherwise → [#`render`](#function-render).

### `function toTrueArr`

Links: [source](../lang.mjs#L437); [test/example](../test/lang_test.mjs#L212).

Idempotent conversion to a [#true array](#function-istruearr). Allowed inputs:

  * [#Nil](#function-isnil) → return `[]`.
  * [#True array](#function-istruearr) → return as-is.
  * [#Iterable](#function-isiter) → convert to `Array`.
  * Otherwise → `TypeError` exception.

### `function deref`

Links: [source](../lang.mjs#L445); [test/example](../test/lang_test.mjs#L2130).

Dereferences any [#reference](#function-isref). Returns non-references as-is.

See [#`isRef`](#function-isref) for a usage example.

See [#`reset`](#function-reset) for the opposite operation: writing rather than reading.

### `function reset`

Links: [source](../lang.mjs#L448); [test/example](../test/lang_test.mjs#L2161).

Replaces the current value of any [#reference](#function-isref) by setting its `Symbol.for("val")` property.

See [#`isRef`](#function-isref) for a usage example.

See [#`deref`](#function-deref) for the opposite operation: reading rather than writing.

### `function is`

Links: [source](../lang.mjs#L465); [test/example](../test/lang_test.mjs#L256).

Identity test: same as `===`, but considers `NaN` equal to `NaN`. Equivalent to [_SameValueZero_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero) as defined by the language spec. Used internally for all identity tests.

Note that [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) implements [_SameValue_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevalue), which treats `-0` and `+0` as _distinct values_. This is typically undesirable. As a result, you should prefer `l.is` over `===` or `Object.is` unless you _know_ you intend to differentiate `-0` and `+0`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

l.is(1, '1')
// false

l.is(NaN, NaN)
// true
```

### `function truthy`

Links: [source](../lang.mjs#L466); [test/example](../test/lang_test.mjs#L242).

Same as `!!` or `Boolean`. Sometimes useful with higher-order functions.

### `function falsy`

Links: [source](../lang.mjs#L467); [test/example](../test/lang_test.mjs#L249).

Same as `!`. Sometimes useful with higher-order functions.

### `function nop`

Links: [source](../lang.mjs#L468); [test/example](../test/lang_test.mjs#L1840).

Empty function. Functional equivalent of `;` or `undefined`. Sometimes useful with higher-order functions.

### `function id`

Links: [source](../lang.mjs#L469); [test/example](../test/lang_test.mjs#L1846).

Identity function: returns its first argument unchanged. Sometimes useful with higher-order functions.

### `function val`

Links: [source](../lang.mjs#L470); [test/example](../test/lang_test.mjs#L1853).

Takes a value and creates a function that always returns that value. Sometimes useful with higher order functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

const constant = l.val(1)

constant()
// 1

constant(`this input is ignored`)
// 1
```

### `function panic`

Links: [source](../lang.mjs#L471); [test/example](../test/lang_test.mjs#L1867).

Same as `throw` but an expression rather than a statement. Also sometimes useful with higher-order functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

const x = someTest ? someValue : l.panic(Error(`unreachable`))
```

### `function vac`

Links: [source](../lang.mjs#L474); [test/example](../test/lang_test.mjs#L2046).

Complements [#`isVac`](#function-isvac). Returns `undefined` if the input is vacuous, otherwise returns the input as-is.

### `function bind`

Links: [source](../lang.mjs#L476); [test/example](../test/lang_test.mjs#L1811).

Like [`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind), but instead of taking `this` as an argument, takes it contextually. By default `this` is `undefined`. To set it, use `l.bind.call`.

Returns a new function that represents [partial application](https://en.wikipedia.org/wiki/Partial_application) of the given function, a common tool in functional programming. When called, it joins arguments from both calls and invokes the original function. Think of it like splitting a function call in two, or more. Performance is inferior to closures; avoid in hotspots.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

const inc = l.bind(l.add, 1)

inc(2)
// 3
```

Note: we don't provide facilities for currying. Experience has shown it to be extremely error prone. Currying, as seen in purely functional languages such as Haskell, tends to care about the amount of arguments. Calling a curried function may either create a new function, or call the underlying function (possibly side-effectful). This approach works reasonably well in statically typed languages, but not in JS where all functions are variadic and it's conventional to sometimes pass extra utility arguments "just in case", which the callee may or may not care about. `bind` is different because the created function will always call the original function, regardless of how many arguments were passed.

### `function not`

Links: [source](../lang.mjs#L478); [test/example](../test/lang_test.mjs#L1830).

Returns a new function that negates the result of the given function, like a delayed `!`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

function eq(a, b) {return a === b}

const different = l.not(eq)

different(10, 20)
// !eq(10, 20) = true

// equivalent:
function different(a, b) {return !eq(a, b)}
```

### `function hasOwn`

Links: [source](../lang.mjs#L483); [test/example](../test/lang_test.mjs#L1243).

Same as [`Object.prototype.hasOwnProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) but shorter and safe to call on primitives. Always false for primitives.

### `function hasOwnEnum`

Links: [source](../lang.mjs#L484); [test/example](../test/lang_test.mjs#L1257).

Same as [`Object.prototype.propertyIsEnumerable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable) but shorter and safe to call on primitives. Always false for primitives.

### `function hasInherited`

Links: [source](../lang.mjs#L485); [test/example](../test/lang_test.mjs#L1288).

Returns `true` if the target is [#non-primitive](#function-iscomp) and has the given property on its prototype. As a consequence, this returns `false` if the target is a primitive, or has the given property as an "own" property, either enumerable or not.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

l.hasInherited([10, 20, 30], `length`)
// false

l.hasInherited([10, 20, 30], `1`)
// false

l.hasInherited([10, 20, 30], `toString`)
// true
```

### `function hasMeth`

Links: [source](../lang.mjs#L486); [test/example](../test/lang_test.mjs#L1324).

True if the the given value has the given named method. Safe to call on primitives such as `null`. Always false for primitives.

### `function setProto`

Links: [source](../lang.mjs#L495); [test/example](../test/lang_test.mjs#L1393).

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

### `function Emp`

Links: [source](../lang.mjs#L501); [test/example](../test/lang_test.mjs#L1409).

Short for "empty". Hybrid function / superclass for empty objects.

In function mode, `Emp()` returns `Object.create(null)`, with no measurable overhead. Basically a syntactic shortcut.

Calling `new Emp()` also returns `Object.create(null)`. This is pointless and should be avoided.

Subclassing `Emp` creates a class with the cleanest possible `.prototype`, which is `null`-based, sharing no common ancestry with anything.

```js
class Empty extends l.Emp {}
Object.getPrototypeOf(Empty.prototype) === null

// Instantiation and inheritance works as expected.
const val = new Empty()
val instanceof Empty
val.constructor === Empty

// `Object` stuff is not inherited.
!(val instanceof Object)
!(`toString` in val)
```

### `function show`

Links: [source](../lang.mjs#L504); [test/example](../test/lang_test.mjs#L25).

Renders a value for debug purposes. Counterpart to [#`render`](#function-render), which renders a value for user display. Convenient for interpolating things into error messages. Used internally in assertion functions such as [#`req`](#function-req). Approximate rules:

  * String → use `JSON.stringify`.
  * Function → `[function ${val.name || val}]`.
    * For named functions, this shorter representation is usually preferable to printing the entire source code.
  * Object →
    * Plain `{}` or `[]` → use `JSON.stringify`.
    * Otherwise `[object <name>]`, prioritizing constructor name over `Symbol.toStringTag`.
      * Exact opposite of default behavior for `Object.prototype.toString`.
  * Otherwise → default JS stringification.

### `function add`

Links: [source](../lang.mjs#L637); [test/example](../test/lang_test.mjs#L1910).

Same as `+`.

### `function sub`

Links: [source](../lang.mjs#L638); [test/example](../test/lang_test.mjs#L1916).

Same as `-`.

### `function mul`

Links: [source](../lang.mjs#L639); [test/example](../test/lang_test.mjs#L1922).

Same as `*`.

### `function div`

Links: [source](../lang.mjs#L640); [test/example](../test/lang_test.mjs#L1928).

Same as `/`.

### `function rem`

Links: [source](../lang.mjs#L641); [test/example](../test/lang_test.mjs#L1934).

Same as `%`.

### `function lt`

Links: [source](../lang.mjs#L642); [test/example](../test/lang_test.mjs#L1942).

Same as `<`.

### `function gt`

Links: [source](../lang.mjs#L643); [test/example](../test/lang_test.mjs#L1953).

Same as `>`.

### `function lte`

Links: [source](../lang.mjs#L644); [test/example](../test/lang_test.mjs#L1964).

Same as `<=`.

### `function gte`

Links: [source](../lang.mjs#L645); [test/example](../test/lang_test.mjs#L1975).

Same as `>=`.

### `function neg`

Links: [source](../lang.mjs#L646); [test/example](../test/lang_test.mjs#L1986).

Arithmetic negation. Same as unary `-`.

### `function inc`

Links: [source](../lang.mjs#L647); [test/example](../test/lang_test.mjs#L1998).

Increments by `1`.

### `function dec`

Links: [source](../lang.mjs#L648); [test/example](../test/lang_test.mjs#L2006).

Decrements by `1`.

### `function round`

Links: [source](../lang.mjs#L651); [test/example](../test/lang_test.mjs#L2014).

Rounding half away from zero. Has one difference from [`Math.round`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round): when the number is negative and the fraction is exactly `.5`, this rounds away from zero. This behavior is more consistent with the default rounding function in many other languages, including Go.

Examples:

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/lang.mjs'

l.round(-12.5) // -13
l.round(12.5) // 13

Math.round(-12.5) // -12
Math.round(12.5) // 13
```

### Undocumented

The following APIs are exported but undocumented. Check [lang.mjs](../lang.mjs).

  * [`const VAL`](../lang.mjs#L3)
  * [`const DISPOSE`](../lang.mjs#L4)
  * [`const ASYNC_DISPOSE`](../lang.mjs#L5)
  * [`function reqNil`](../lang.mjs#L10)
  * [`function optNil`](../lang.mjs#L11)
  * [`function onlyNil`](../lang.mjs#L12)
  * [`function reqSome`](../lang.mjs#L15)
  * [`function optSome`](../lang.mjs#L16)
  * [`function onlySome`](../lang.mjs#L17)
  * [`function reqBool`](../lang.mjs#L20)
  * [`function optBool`](../lang.mjs#L21)
  * [`function onlyBool`](../lang.mjs#L22)
  * [`function laxBool`](../lang.mjs#L23)
  * [`function reqNum`](../lang.mjs#L26)
  * [`function optNum`](../lang.mjs#L27)
  * [`function onlyNum`](../lang.mjs#L28)
  * [`function laxNum`](../lang.mjs#L29)
  * [`function reqFin`](../lang.mjs#L32)
  * [`function optFin`](../lang.mjs#L33)
  * [`function onlyFin`](../lang.mjs#L34)
  * [`function laxFin`](../lang.mjs#L35)
  * [`function reqFinNeg`](../lang.mjs#L38)
  * [`function optFinNeg`](../lang.mjs#L39)
  * [`function onlyFinNeg`](../lang.mjs#L40)
  * [`function reqFinPos`](../lang.mjs#L43)
  * [`function optFinPos`](../lang.mjs#L44)
  * [`function onlyFinPos`](../lang.mjs#L45)
  * [`function reqInt`](../lang.mjs#L49)
  * [`function optInt`](../lang.mjs#L50)
  * [`function onlyInt`](../lang.mjs#L51)
  * [`function laxInt`](../lang.mjs#L52)
  * [`function reqNat`](../lang.mjs#L55)
  * [`function optNat`](../lang.mjs#L56)
  * [`function onlyNat`](../lang.mjs#L57)
  * [`function laxNat`](../lang.mjs#L58)
  * [`function reqIntNeg`](../lang.mjs#L61)
  * [`function optIntNeg`](../lang.mjs#L62)
  * [`function onlyIntNeg`](../lang.mjs#L63)
  * [`function reqIntPos`](../lang.mjs#L66)
  * [`function optIntPos`](../lang.mjs#L67)
  * [`function onlyIntPos`](../lang.mjs#L68)
  * [`function reqNaN`](../lang.mjs#L71)
  * [`function optNaN`](../lang.mjs#L72)
  * [`function onlyNaN`](../lang.mjs#L73)
  * [`function reqInf`](../lang.mjs#L76)
  * [`function optInf`](../lang.mjs#L77)
  * [`function onlyInf`](../lang.mjs#L78)
  * [`function reqBigInt`](../lang.mjs#L81)
  * [`function optBigInt`](../lang.mjs#L82)
  * [`function onlyBigInt`](../lang.mjs#L83)
  * [`function laxBigInt`](../lang.mjs#L84)
  * [`function reqStr`](../lang.mjs#L87)
  * [`function optStr`](../lang.mjs#L88)
  * [`function onlyStr`](../lang.mjs#L89)
  * [`function laxStr`](../lang.mjs#L90)
  * [`function isValidStr`](../lang.mjs#L93)
  * [`function reqValidStr`](../lang.mjs#L94)
  * [`function optValidStr`](../lang.mjs#L95)
  * [`function onlyValidStr`](../lang.mjs#L96)
  * [`function reqSym`](../lang.mjs#L99)
  * [`function optSym`](../lang.mjs#L100)
  * [`function onlySym`](../lang.mjs#L101)
  * [`function reqKey`](../lang.mjs#L105)
  * [`function optKey`](../lang.mjs#L106)
  * [`function onlyKey`](../lang.mjs#L107)
  * [`function reqRecKey`](../lang.mjs#L110)
  * [`function optRecKey`](../lang.mjs#L111)
  * [`function onlyRecKey`](../lang.mjs#L112)
  * [`function reqPk`](../lang.mjs#L115)
  * [`function optPk`](../lang.mjs#L116)
  * [`function onlyPk`](../lang.mjs#L117)
  * [`function reqJunk`](../lang.mjs#L120)
  * [`function optJunk`](../lang.mjs#L121)
  * [`function onlyJunk`](../lang.mjs#L122)
  * [`function reqComp`](../lang.mjs#L125)
  * [`function optComp`](../lang.mjs#L126)
  * [`function onlyComp`](../lang.mjs#L127)
  * [`function reqPrim`](../lang.mjs#L130)
  * [`function optPrim`](../lang.mjs#L131)
  * [`function onlyPrim`](../lang.mjs#L132)
  * [`function reqFun`](../lang.mjs#L135)
  * [`function optFun`](../lang.mjs#L136)
  * [`function onlyFun`](../lang.mjs#L137)
  * [`function reqFunSync`](../lang.mjs#L140)
  * [`function optFunSync`](../lang.mjs#L141)
  * [`function onlyFunSync`](../lang.mjs#L142)
  * [`function reqFunGen`](../lang.mjs#L145)
  * [`function optFunGen`](../lang.mjs#L146)
  * [`function onlyFunGen`](../lang.mjs#L147)
  * [`function reqFunAsync`](../lang.mjs#L150)
  * [`function optFunAsync`](../lang.mjs#L151)
  * [`function onlyFunAsync`](../lang.mjs#L152)
  * [`function reqFunAsyncGen`](../lang.mjs#L155)
  * [`function optFunAsyncGen`](../lang.mjs#L156)
  * [`function onlyFunAsyncGen`](../lang.mjs#L157)
  * [`function reqObj`](../lang.mjs#L160)
  * [`function optObj`](../lang.mjs#L161)
  * [`function onlyObj`](../lang.mjs#L162)
  * [`function isNpo`](../lang.mjs#L164)
  * [`function reqNpo`](../lang.mjs#L165)
  * [`function optNpo`](../lang.mjs#L166)
  * [`function onlyNpo`](../lang.mjs#L167)
  * [`function laxNpo`](../lang.mjs#L168)
  * [`function reqDict`](../lang.mjs#L178)
  * [`function optDict`](../lang.mjs#L179)
  * [`function onlyDict`](../lang.mjs#L180)
  * [`function laxDict`](../lang.mjs#L181)
  * [`function reqRec`](../lang.mjs#L186)
  * [`function optRec`](../lang.mjs#L187)
  * [`function onlyRec`](../lang.mjs#L188)
  * [`function laxRec`](../lang.mjs#L189)
  * [`function reqArr`](../lang.mjs#L192)
  * [`function optArr`](../lang.mjs#L193)
  * [`function onlyArr`](../lang.mjs#L194)
  * [`function laxArr`](../lang.mjs#L195)
  * [`function reqTrueArr`](../lang.mjs#L202)
  * [`function optTrueArr`](../lang.mjs#L203)
  * [`function onlyTrueArr`](../lang.mjs#L204)
  * [`function laxTrueArr`](../lang.mjs#L205)
  * [`function reqReg`](../lang.mjs#L208)
  * [`function optReg`](../lang.mjs#L209)
  * [`function onlyReg`](../lang.mjs#L210)
  * [`function reqDate`](../lang.mjs#L213)
  * [`function optDate`](../lang.mjs#L214)
  * [`function onlyDate`](../lang.mjs#L215)
  * [`function reqValidDate`](../lang.mjs#L218)
  * [`function optValidDate`](../lang.mjs#L219)
  * [`function onlyValidDate`](../lang.mjs#L220)
  * [`function reqInvalidDate`](../lang.mjs#L223)
  * [`function optInvalidDate`](../lang.mjs#L224)
  * [`function onlyInvalidDate`](../lang.mjs#L225)
  * [`function reqSet`](../lang.mjs#L228)
  * [`function optSet`](../lang.mjs#L229)
  * [`function onlySet`](../lang.mjs#L230)
  * [`function laxSet`](../lang.mjs#L231)
  * [`function reqMap`](../lang.mjs#L234)
  * [`function optMap`](../lang.mjs#L235)
  * [`function onlyMap`](../lang.mjs#L236)
  * [`function laxMap`](../lang.mjs#L237)
  * [`function reqPromise`](../lang.mjs#L240)
  * [`function optPromise`](../lang.mjs#L241)
  * [`function onlyPromise`](../lang.mjs#L242)
  * [`function reqIter`](../lang.mjs#L245)
  * [`function optIter`](../lang.mjs#L246)
  * [`function onlyIter`](../lang.mjs#L247)
  * [`function reqIterAsync`](../lang.mjs#L250)
  * [`function optIterAsync`](../lang.mjs#L251)
  * [`function onlyIterAsync`](../lang.mjs#L252)
  * [`function reqIterator`](../lang.mjs#L255)
  * [`function optIterator`](../lang.mjs#L256)
  * [`function onlyIterator`](../lang.mjs#L257)
  * [`function reqIteratorAsync`](../lang.mjs#L260)
  * [`function optIteratorAsync`](../lang.mjs#L261)
  * [`function onlyIteratorAsync`](../lang.mjs#L262)
  * [`function reqGen`](../lang.mjs#L265)
  * [`function optGen`](../lang.mjs#L266)
  * [`function onlyGen`](../lang.mjs#L267)
  * [`function reqCls`](../lang.mjs#L281)
  * [`function optCls`](../lang.mjs#L282)
  * [`function onlyCls`](../lang.mjs#L283)
  * [`function isSubCls`](../lang.mjs#L286)
  * [`function reqSubCls`](../lang.mjs#L294)
  * [`function reqList`](../lang.mjs#L300)
  * [`function optList`](../lang.mjs#L301)
  * [`function onlyList`](../lang.mjs#L302)
  * [`function laxList`](../lang.mjs#L303)
  * [`function reqSeq`](../lang.mjs#L306)
  * [`function optSeq`](../lang.mjs#L307)
  * [`function onlySeq`](../lang.mjs#L308)
  * [`function reqVac`](../lang.mjs#L311)
  * [`function optVac`](../lang.mjs#L312)
  * [`function onlyVac`](../lang.mjs#L313)
  * [`function reqScalar`](../lang.mjs#L322)
  * [`function optScalar`](../lang.mjs#L323)
  * [`function onlyScalar`](../lang.mjs#L324)
  * [`function isScalarOpt`](../lang.mjs#L326)
  * [`function reqScalarOpt`](../lang.mjs#L327)
  * [`function optScalarOpt`](../lang.mjs#L328)
  * [`function onlyScalarOpt`](../lang.mjs#L329)
  * [`function isArrble`](../lang.mjs#L331)
  * [`function reqArrble`](../lang.mjs#L332)
  * [`function optArrble`](../lang.mjs#L333)
  * [`function onlyArrble`](../lang.mjs#L334)
  * [`function isEqable`](../lang.mjs#L336)
  * [`function reqEqable`](../lang.mjs#L337)
  * [`function optEqable`](../lang.mjs#L338)
  * [`function onlyEqable`](../lang.mjs#L339)
  * [`function isClearable`](../lang.mjs#L341)
  * [`function reqClearable`](../lang.mjs#L342)
  * [`function optClearable`](../lang.mjs#L343)
  * [`function onlyClearable`](../lang.mjs#L344)
  * [`function isErr`](../lang.mjs#L346)
  * [`function reqErr`](../lang.mjs#L347)
  * [`function optErr`](../lang.mjs#L348)
  * [`function onlyErr`](../lang.mjs#L349)
  * [`function optRef`](../lang.mjs#L352)
  * [`function onlyRef`](../lang.mjs#L353)
  * [`function reqRef`](../lang.mjs#L354)
  * [`function isArrOf`](../lang.mjs#L356)
  * [`function reqArrOf`](../lang.mjs#L362)
  * [`function optArrOf`](../lang.mjs#L368)
  * [`function isInstOpt`](../lang.mjs#L383)
  * [`function optOneOf`](../lang.mjs#L399)
  * [`function reqOneOf`](../lang.mjs#L403)
  * [`function toInst`](../lang.mjs#L419)
  * [`function toInstOpt`](../lang.mjs#L420)
  * [`function renderOpt`](../lang.mjs#L428)
  * [`function derefAll`](../lang.mjs#L446)
  * [`function resetOpt`](../lang.mjs#L453)
  * [`function swap`](../lang.mjs#L459)
  * [`function True`](../lang.mjs#L472)
  * [`function False`](../lang.mjs#L473)
  * [`function eq`](../lang.mjs#L488)
  * [`class Show`](../lang.mjs#L506)
  * [`function symPoly`](../lang.mjs#L626)
  * [`const CLASSES`](../lang.mjs#L658)
  * [`function errType`](../lang.mjs#L675)
  * [`function msgType`](../lang.mjs#L676)
  * [`function errFun`](../lang.mjs#L678)
  * [`function msgFun`](../lang.mjs#L679)
  * [`function throwErrFun`](../lang.mjs#L680)
  * [`function errConv`](../lang.mjs#L682)
  * [`function errSynt`](../lang.mjs#L683)
  * [`function msgConv`](../lang.mjs#L684)
  * [`function errConvInst`](../lang.mjs#L686)
  * [`function msgConvInst`](../lang.mjs#L687)
  * [`function errInst`](../lang.mjs#L689)
  * [`function msgInst`](../lang.mjs#L690)
  * [`function errIn`](../lang.mjs#L692)
  * [`function msgIn`](../lang.mjs#L693)
  * [`function errImpl`](../lang.mjs#L695)
  * [`function msgImpl`](../lang.mjs#L696)
  * [`function errTrans`](../lang.mjs#L698)
  * [`function errWrap`](../lang.mjs#L706)
  * [`function errCause`](../lang.mjs#L711)
  * [`function errSkip`](../lang.mjs#L716)
  * [`const WeakRef`](../lang.mjs#L726)
  * [`const FinalizationRegistry`](../lang.mjs#L732)
  * [`function convType`](../lang.mjs#L750)
  * [`function convSynt`](../lang.mjs#L755)
  * [`function showFunName`](../lang.mjs#L761)
  * [`function get`](../lang.mjs#L776)
  * [`function getOwn`](../lang.mjs#L780)
  * [`function reqGet`](../lang.mjs#L782)
  * [`function recKeys`](../lang.mjs#L795)
