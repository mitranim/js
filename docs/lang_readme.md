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
  * [#`function reset`](#function-reset)
  * [#`function deref`](#function-deref)
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
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'
```

## API

### `function isNil`

Links: [source](../lang.mjs#L7); [test/example](../test/lang_test.mjs#L261).

True for `null` and `undefined`. Same as `value == null`. Incidentally, these are the only values that produce an exception when attempting to read a property: `null.someProperty`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

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

Links: [source](../lang.mjs#L12); [test/example](../test/lang_test.mjs#L269).

Inverse of [#`isNil`](#function-isnil). False for `null` and `undefined`, true for other values.

### `function isBool`

Links: [source](../lang.mjs#L17); [test/example](../test/lang_test.mjs#L277).

Same as `typeof val === 'boolean'`.

### `function isNum`

Links: [source](../lang.mjs#L23); [test/example](../test/lang_test.mjs#L286).

Same as `typeof val === 'number'`. True if the value is a primitive number, _including_ `NaN` and `±Infinity`. In most cases you should use [#`isFin`](#function-isfin) instead.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

l.isNum(1)
// true

l.isNum(`1`)
// false

l.isNum(NaN)
// true <-- WTF
```

### `function isFin`

Links: [source](../lang.mjs#L29); [test/example](../test/lang_test.mjs#L298).

Same as ES2015's [`Number.isFinite`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite). True if `val` is a primitive number and is _not_ `NaN` or `±Infinity`. In most cases you should prefer `isFin` over `isNum`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

l.isFin(1)
// true

l.isFin(`1`)
// false

l.isFin(NaN)
// false
```

### `function isFinNeg`

Links: [source](../lang.mjs#L35); [test/example](../test/lang_test.mjs#L313).

True if the value is finite (via [#`isFin`](#function-isfin)) and < 0.

### `function isFinPos`

Links: [source](../lang.mjs#L40); [test/example](../test/lang_test.mjs#L333).

True if the value is finite (via [#`isFin`](#function-isfin)) and > 0.

### `function isInt`

Links: [source](../lang.mjs#L46); [test/example](../test/lang_test.mjs#L353).

True if the value is an integer: finite via [#`isFin`](#function-isfin), without a fractional part.

### `function isNat`

Links: [source](../lang.mjs#L52); [test/example](../test/lang_test.mjs#L372).

True if the value is a natural number: integer >= 0. Also see [#`isIntPos`](#function-isintpos).

### `function isIntNeg`

Links: [source](../lang.mjs#L58); [test/example](../test/lang_test.mjs#L391).

True if the value is integer < 0. Also see [#`isFinNeg`](#function-isfinneg).

### `function isIntPos`

Links: [source](../lang.mjs#L63); [test/example](../test/lang_test.mjs#L410).

True if the value is integer > 0. Also see [#`isNat`](#function-isnat), [#`isFinPos`](#function-isfinpos).

### `function isNaN`

Links: [source](../lang.mjs#L68); [test/example](../test/lang_test.mjs#L429).

Same as ES2015's [`Number.isNaN`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN). True if the value is _actually_ `NaN`. Doesn't coerce non-numbers to numbers, unlike global `isNaN`.

### `function isInf`

Links: [source](../lang.mjs#L73); [test/example](../test/lang_test.mjs#L444).

True if the value is `-Infinity` or `Infinity`.

### `function isBigInt`

Links: [source](../lang.mjs#L78); [test/example](../test/lang_test.mjs#L459).

True if the value is a primitive [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). False for all other inputs, including `BigInt` object wrappers.

### `function isStr`

Links: [source](../lang.mjs#L84); [test/example](../test/lang_test.mjs#L478).

Same as `typeof val === 'string'`. True if the value is a primitive string.

### `function isSym`

Links: [source](../lang.mjs#L96); [test/example](../test/lang_test.mjs#L496).

Same as `typeof val === 'symbol'`. True if the value is a primitive symbol.

### `function isKey`

Links: [source](../lang.mjs#L102); [test/example](../test/lang_test.mjs#L503).

True if the value is primitive and usable as a map key. True for all primitives excluding garbage values via [#`isJunk`](#function-isjunk).

### `function isRecKey`

Links: [source](../lang.mjs#L107); [test/example](../test/lang_test.mjs#L523).

Short for "is record key".

True if the value qualifies as an object property key: either a string or a symbol.

Uses the term "record" for consistency with [#`isRec`](#function-isrec) which defines what is a record (a non-iterable object).

### `function isPk`

Links: [source](../lang.mjs#L112); [test/example](../test/lang_test.mjs#L543).

True for objects that implement method `.pk` which must return a valid [#primary key](#function-ispk). This interface is used internally by [`Coll`](coll_readme.md#class-coll).

### `function isJunk`

Links: [source](../lang.mjs#L117); [test/example](../test/lang_test.mjs#L564).

True for garbage values: [#nil](#function-isnil), [#NaN](#function-isnan), [#±Infinity](#function-isinf).

### `function isComp`

Links: [source](../lang.mjs#L122); [test/example](../test/lang_test.mjs#L579).

True if the value is "composite" / "compound" / "complex". Opposite of [#`isPrim`](#function-isprim). Definition:

```js
function isComp(val) {return isObj(val) || isFun(val)}
```

### `function isPrim`

Links: [source](../lang.mjs#L127); [test/example](../test/lang_test.mjs#L593).

True if the value is a JS primitive: not an object, not a function. Opposite of [#`isComp`](#function-iscomp).

### `function isFun`

Links: [source](../lang.mjs#L132); [test/example](../test/lang_test.mjs#L607).

Same as `typeof val === 'function'`. True if the value is any function, regardless of its type (arrow, async, generator, etc.).

### `function isFunSync`

Links: [source](../lang.mjs#L137); [test/example](../test/lang_test.mjs#L631).

True if the input is a normal sync function. False for generator functions or async functions.

### `function isFunGen`

Links: [source](../lang.mjs#L142); [test/example](../test/lang_test.mjs#L641).

True if the input is a sync generator function. False for normal sync functions and async functions.

### `function isFunAsync`

Links: [source](../lang.mjs#L147); [test/example](../test/lang_test.mjs#L651).

True if the input is an async non-generator function. False for sync functions, generator functions, or async generator functions.

### `function isFunAsyncGen`

Links: [source](../lang.mjs#L152); [test/example](../test/lang_test.mjs#L661).

True if the input is an async generator function. False for sync functions and async non-generator functions.

### `function isObj`

Links: [source](../lang.mjs#L157); [test/example](../test/lang_test.mjs#L671).

Same as `typeof val === 'object' && val !== null`. True for any JS object: plain dict, array, various other classes. Doesn't include functions, even though JS functions are extensible objects.

* Compare [#`isComp`](#function-iscomp) which returns true for objects _and_ functions.
* For plain objects used as dictionaries, see [#`isDict`](#function-isdict).
* For fancy non-list objects, see [#`isRec`](#function-isrec).

### `function isDict`

Links: [source](../lang.mjs#L168); [test/example](../test/lang_test.mjs#L703).

True for a "plain object" created via `{...}` or `Object.create(null)`. False for any other input, including instances of any class other than `Object`.

See [#`isRec`](#function-isrec) for a more general definition of a non-iterable object.

### `function isRec`

Links: [source](../lang.mjs#L181); [test/example](../test/lang_test.mjs#L721).

Short for "is record".

True if the value is a non-iterable object. Excludes both [#sync_iterables](#function-isiter) and [#async_iterables](#function-isiterasync). Note that [#dicts](#function-isdict) are automatically records, but not all records are dicts.

Technically, promises would qualify as records under this definition. But as a
special case, instances of `Promise` are excluded to help detect the common
case of forgetting `await`. The overhead on that check should be virtually
unmeasurable.

### `function isArr`

Links: [source](../lang.mjs#L189); [test/example](../test/lang_test.mjs#L748).

Alias for [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray). Used internally for all array checks.

True if the value is an instance of [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) or its subclass. False for all other values, including non-array objects whose prototype is an array.

### `function isTrueArr`

Links: [source](../lang.mjs#L199); [test/example](../test/lang_test.mjs#L760).

Similar to [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) and [#`isArr`](#function-isarr), but returns true only for instances of the _exact_ `Array` class, false for instances of subclasses.

At the time of writing, subclasses of `Array` suffer horrible performance penalties in V8, and possibly in other engines. Using them can also cause deoptimization of code that would otherwise run much faster. We sometimes prioritize or even enforce "true" arrays for consistent performance.

### `function isReg`

Links: [source](../lang.mjs#L205); [test/example](../test/lang_test.mjs#L775).

True if the value is an instance of [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) or its subclass.

### `function isDate`

Links: [source](../lang.mjs#L210); [test/example](../test/lang_test.mjs#L783).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Most of the time you should prefer [#`isValidDate`](#function-isvaliddate).

### `function isValidDate`

Links: [source](../lang.mjs#L215); [test/example](../test/lang_test.mjs#L791).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) and its timestamp is [#finite](#function-isfin) rather than `NaN` or `Infinity`.

### `function isInvalidDate`

Links: [source](../lang.mjs#L220); [test/example](../test/lang_test.mjs#L798).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) representing an invalid date whose timestamp is `NaN`.

### `function isSet`

Links: [source](../lang.mjs#L225); [test/example](../test/lang_test.mjs#L805).

True if the value is an instance of [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) or its subclass.

### `function isMap`

Links: [source](../lang.mjs#L231); [test/example](../test/lang_test.mjs#L815).

True if the value is an instance of [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or its subclass.

### `function isPromise`

Links: [source](../lang.mjs#L237); [test/example](../test/lang_test.mjs#L825).

True if the value satisfies the ES2015 [promise interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### `function isIter`

Links: [source](../lang.mjs#L242); [test/example](../test/lang_test.mjs#L834).

True if the value satisfies the ES2015 [sync iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterator_ rather than _iterable_, use [#`isIterator`](#function-isiterator).

### `function isIterAsync`

Links: [source](../lang.mjs#L247); [test/example](../test/lang_test.mjs#L860).

True if the value satisfies the ES2015 [async iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterator_ rather than _iterable_, use [#`isIteratorAsync`](#function-isiteratorasync).

### `function isIterator`

Links: [source](../lang.mjs#L252); [test/example](../test/lang_test.mjs#L877).

True if the value satisfies the ES2015 [sync iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterable_ rather than _iterator_, use [#`isIter`](#function-isiter).

### `function isIteratorAsync`

Links: [source](../lang.mjs#L257); [test/example](../test/lang_test.mjs#L903).

True if the value satisfies the ES2015 [async iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterable_ rather than _iterator_, use [#`isIterAsync`](#function-isiterasync).

### `function isGen`

Links: [source](../lang.mjs#L262); [test/example](../test/lang_test.mjs#L929).

True if the value is a [#sync_iterator](#function-isiterator) created by calling a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).

### `function isCls`

Links: [source](../lang.mjs#L267); [test/example](../test/lang_test.mjs#L989).

True if the input is a function with a prototype, suitable for `instanceof` checks. False for arrow functions such as `() => {}`, which don't have a prototype.

### `function isList`

Links: [source](../lang.mjs#L297); [test/example](../test/lang_test.mjs#L1019).

True for any array-like such as: `[]`, `arguments`, `TypedArray`, `NodeList`, etc. Used internally for most list checks. Note that _primitive strings are not considered lists_.

### `function isSeq`

Links: [source](../lang.mjs#L303); [test/example](../test/lang_test.mjs#L1035).

True for any of:

  * [#Array](#function-isarr)
  * [#List](#function-islist)
  * [#Set](#function-isset)
  * [#Iterator](#function-isiterator)

Many functions in `iter.mjs` support arbitrary data structures compatible with [`values`](iter_readme.md#function-values), but some functions such as [`arr`](iter_readme.md#function-arr) allow only sequences, for sanity checking.

### `function isVac`

Links: [source](../lang.mjs#L308); [test/example](../test/lang_test.mjs#L1058).

Short for "is vacuous" or "is vacated". Could also be called "is falsy deep". True if the input is [#`falsy`](#function-falsy) or a [#list](#function-islist) where all values are vacuous, recursively. Does not iterate non-lists. Also see complementary function [#`vac`](#function-vac).

### `function isScalar`

Links: [source](../lang.mjs#L313); [test/example](../test/lang_test.mjs#L1096).

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

Links: [source](../lang.mjs#L349); [test/example](../test/lang_test.mjs#L2051).

Defines a "reference" interface which is consistently across all modules in this library. A "reference" is something that can be [#`deref`](#function-deref) into an underlying value. Any object can implement this interface by providing a symbolic property `Symbol.for("val")`.

References are used via the functions [#`deref`](#function-deref) and [#`reset`](#function-reset).

The most notable reference types are observables provided by the module [`obs`](obs_readme.md).

The names `deref` and `reset` for this interface are lifted from Clojure.

Combined example:

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obs.mjs'

l.isRef(10) // false
l.isRef({}) // false

const obs = ob.obsRef(10)

l.isRef(obs) // true
l.deref(obs) // 10
l.reset(obs, 20)
l.deref(obs) // 20
```

### `function isEmpty`

Links: [source](../lang.mjs#L373); [test/example](../test/lang_test.mjs#L1181).

True if the input is an empty collection such as list, set, map, or a primitive such as `null`. False for any other non-primitive. Treating primitives as "empty" is consistent with various functions in `iter.mjs` that operate on collections.

### `function isInst`

Links: [source](../lang.mjs#L380); [test/example](../test/lang_test.mjs#L1133).

Signature: `(val, Cls) => bool`.

Same as `instanceof` but _does not_ implicitly convert the operand to an object. True only if the operand is already an instance of the given class. Also unlike `instanceof`, this is always false for functions.

### `function opt`

Links: [source](../lang.mjs#L384); [test/example](../test/lang_test.mjs#L1444).

Short for "optional". If `val` is [#non_nil](#function-issome), uses [#`req`](#function-req) to validate it. Returns `val` as-is.

### `function req`

Links: [source](../lang.mjs#L389); [test/example](../test/lang_test.mjs#L1385).

Signature: `(val, test) => val` where `test: val => bool`.

Short for "require". Minification-friendly assertion. If `!test(val)`, throws an informative `TypeError`. Otherwise, returns `val` as-is.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

l.req({one: `two`}, l.isObj)
// {one: `two`}

l.req(`str`, l.isFun)
// Uncaught TypeError: expected variant of isFun, got "str"
```

### `function only`

Links: [source](../lang.mjs#L394); [test/example](../test/lang_test.mjs#L1538).

Signature: `(val, test) => val` where `test: val => bool`.

Type filtering utility. If `val` satisfies the given test function, returns `val` as-is. Otherwise returns `undefined`.

### `function optInst`

Links: [source](../lang.mjs#L405); [test/example](../test/lang_test.mjs#L1499).

Short for "optional instance". If `val` is [#non_nil](#function-issome), uses [#`reqInst`](#function-reqinst) to validate it. Returns `val` as-is.

### `function reqInst`

Links: [source](../lang.mjs#L407); [test/example](../test/lang_test.mjs#L1482).

Signature: `(val, Cls) => val`.

Short for "require instance". Asserts that `val` is an instance of the given class. Returns `val` as-is.

### `function onlyInst`

Links: [source](../lang.mjs#L412); [test/example](../test/lang_test.mjs#L1565).

Signature: `(val, Cls) => val?`.

Type filtering utility. If `val` is an instance of `Cls`, returns `val` as-is. Otherwise returns `undefined`.

### `function render`

Links: [source](../lang.mjs#L419); [test/example](../test/lang_test.mjs#L119).

Renders a value for user display. Counterpart to [#`show`](#function-show), which renders a value for debug purposes. Intended only for [#scalar](#function-isscalar) values. Rules:

  * [#Date](#function-isdate) with default `.toString` → use `.toISOString`. This overrides the insane JS default stringification of dates, defaulting to the _reversible_ machine-decodable representation used for JSON.
  * Other [#non-nil](#function-issome) [#scalars](#function-isscalar) → default JS stringification.
  * All other inputs including [#nil](#function-isnil) → `TypeError` exception.

### `function renderLax`

Links: [source](../lang.mjs#L432); [test/example](../test/lang_test.mjs#L152).

Renders a value for user display. Intended only for [#scalar](#function-isscalar) values. Unlike [#`render`](#function-render), this allows nil. Rules:

  * [#Nil](#function-isnil) → `''`.
  * Otherwise → [#`render`](#function-render).

### `function toTrueArr`

Links: [source](../lang.mjs#L434); [test/example](../test/lang_test.mjs#L207).

Idempotent conversion to a [#true array](#function-istruearr). Allowed inputs:

  * [#Nil](#function-isnil) → return `[]`.
  * [#True array](#function-istruearr) → return as-is.
  * [#Iterable](#function-isiter) → convert to `Array`.
  * Otherwise → `TypeError` exception.

### `function reset`

Links: [source](../lang.mjs#L442); [test/example](../test/lang_test.mjs#L2102).

Replaces the current value of any [#reference](#function-isref) by setting its `Symbol.for("val")` property.

See [#`isRef`](#function-isref) for a usage example.

See [#`deref`](#function-deref) for the opposite operation: reading rather than writing.

### `function deref`

Links: [source](../lang.mjs#L443); [test/example](../test/lang_test.mjs#L2071).

Dereferences any [#reference](#function-isref). Returns non-references as-is.

See [#`isRef`](#function-isref) for a usage example.

See [#`reset`](#function-reset) for the opposite operation: writing rather than reading.

### `function is`

Links: [source](../lang.mjs#L452); [test/example](../test/lang_test.mjs#L251).

Identity test: same as `===`, but considers `NaN` equal to `NaN`. Equivalent to [_SameValueZero_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero) as defined by the language spec. Used internally for all identity tests.

Note that [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) implements [_SameValue_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevalue), which treats `-0` and `+0` as _distinct values_. This is typically undesirable. As a result, you should prefer `l.is` over `===` or `Object.is` unless you _know_ you intend to differentiate `-0` and `+0`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

l.is(1, '1')
// false

l.is(NaN, NaN)
// true
```

### `function truthy`

Links: [source](../lang.mjs#L453); [test/example](../test/lang_test.mjs#L237).

Same as `!!` or `Boolean`. Sometimes useful with higher-order functions.

### `function falsy`

Links: [source](../lang.mjs#L454); [test/example](../test/lang_test.mjs#L244).

Same as `!`. Sometimes useful with higher-order functions.

### `function nop`

Links: [source](../lang.mjs#L455); [test/example](../test/lang_test.mjs#L1781).

Empty function. Functional equivalent of `;` or `undefined`. Sometimes useful with higher-order functions.

### `function id`

Links: [source](../lang.mjs#L456); [test/example](../test/lang_test.mjs#L1787).

Identity function: returns its first argument unchanged. Sometimes useful with higher-order functions.

### `function val`

Links: [source](../lang.mjs#L457); [test/example](../test/lang_test.mjs#L1794).

Takes a value and creates a function that always returns that value. Sometimes useful with higher order functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

const constant = l.val(1)

constant()
// 1

constant(`this input is ignored`)
// 1
```

### `function panic`

Links: [source](../lang.mjs#L458); [test/example](../test/lang_test.mjs#L1808).

Same as `throw` but an expression rather than a statement. Also sometimes useful with higher-order functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

const x = someTest ? someValue : l.panic(Error(`unreachable`))
```

### `function vac`

Links: [source](../lang.mjs#L461); [test/example](../test/lang_test.mjs#L1987).

Complements [#`isVac`](#function-isvac). Returns `undefined` if the input is vacuous, otherwise returns the input as-is.

### `function bind`

Links: [source](../lang.mjs#L462); [test/example](../test/lang_test.mjs#L1752).

Like [`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind), but instead of taking `this` as an argument, takes it contextually. By default `this` is `undefined`. To set it, use `l.bind.call`.

Returns a new function that represents [partial application](https://en.wikipedia.org/wiki/Partial_application) of the given function, a common tool in functional programming. When called, it joins arguments from both calls and invokes the original function. Think of it like splitting a function call in two, or more. Performance is inferior to closures; avoid in hotspots.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

const inc = l.bind(l.add, 1)

inc(2)
// 3
```

Note: we don't provide facilities for currying. Experience has shown it to be extremely error prone. Currying, as seen in purely functional languages such as Haskell, tends to care about the amount of arguments. Calling a curried function may either create a new function, or call the underlying function (possibly side-effectful). This approach works reasonably well in statically typed languages, but not in JS where all functions are variadic and it's conventional to sometimes pass extra utility arguments "just in case", which the callee may or may not care about. `bind` is different because the created function will always call the original function, regardless of how many arguments were passed.

### `function not`

Links: [source](../lang.mjs#L464); [test/example](../test/lang_test.mjs#L1771).

Returns a new function that negates the result of the given function, like a delayed `!`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

function eq(a, b) {return a === b}

const different = l.not(eq)

different(10, 20)
// !eq(10, 20) = true

// equivalent:
function different(a, b) {return !eq(a, b)}
```

### `function hasOwn`

Links: [source](../lang.mjs#L469); [test/example](../test/lang_test.mjs#L1198).

Same as [`Object.prototype.hasOwnProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) but shorter and safe to call on primitives. Always false for primitives.

### `function hasOwnEnum`

Links: [source](../lang.mjs#L470); [test/example](../test/lang_test.mjs#L1212).

Same as [`Object.prototype.propertyIsEnumerable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable) but shorter and safe to call on primitives. Always false for primitives.

### `function hasInherited`

Links: [source](../lang.mjs#L471); [test/example](../test/lang_test.mjs#L1226).

Returns `true` if the target is [#non-primitive](#function-iscomp) and has the given property on its prototype. As a consequence, this returns `false` if the target is a primitive, or has the given property as an "own" property, either enumerable or not.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

l.hasInherited([10, 20, 30], `length`)
// false

l.hasInherited([10, 20, 30], `1`)
// false

l.hasInherited([10, 20, 30], `toString`)
// true
```

### `function hasMeth`

Links: [source](../lang.mjs#L472); [test/example](../test/lang_test.mjs#L1265).

True if the the given value has the given named method. Safe to call on primitives such as `null`. Always false for primitives.

### `function setProto`

Links: [source](../lang.mjs#L481); [test/example](../test/lang_test.mjs#L1334).

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

Links: [source](../lang.mjs#L487); [test/example](../test/lang_test.mjs#L1350).

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

Links: [source](../lang.mjs#L490); [test/example](../test/lang_test.mjs#L20).

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

Links: [source](../lang.mjs#L615); [test/example](../test/lang_test.mjs#L1851).

Same as `+`.

### `function sub`

Links: [source](../lang.mjs#L616); [test/example](../test/lang_test.mjs#L1857).

Same as `-`.

### `function mul`

Links: [source](../lang.mjs#L617); [test/example](../test/lang_test.mjs#L1863).

Same as `*`.

### `function div`

Links: [source](../lang.mjs#L618); [test/example](../test/lang_test.mjs#L1869).

Same as `/`.

### `function rem`

Links: [source](../lang.mjs#L619); [test/example](../test/lang_test.mjs#L1875).

Same as `%`.

### `function lt`

Links: [source](../lang.mjs#L620); [test/example](../test/lang_test.mjs#L1883).

Same as `<`.

### `function gt`

Links: [source](../lang.mjs#L621); [test/example](../test/lang_test.mjs#L1894).

Same as `>`.

### `function lte`

Links: [source](../lang.mjs#L622); [test/example](../test/lang_test.mjs#L1905).

Same as `<=`.

### `function gte`

Links: [source](../lang.mjs#L623); [test/example](../test/lang_test.mjs#L1916).

Same as `>=`.

### `function neg`

Links: [source](../lang.mjs#L624); [test/example](../test/lang_test.mjs#L1927).

Arithmetic negation. Same as unary `-`.

### `function inc`

Links: [source](../lang.mjs#L625); [test/example](../test/lang_test.mjs#L1939).

Increments by `1`.

### `function dec`

Links: [source](../lang.mjs#L626); [test/example](../test/lang_test.mjs#L1947).

Decrements by `1`.

### `function round`

Links: [source](../lang.mjs#L629); [test/example](../test/lang_test.mjs#L1955).

Rounding half away from zero. Has one difference from [`Math.round`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round): when the number is negative and the fraction is exactly `.5`, this rounds away from zero. This behavior is more consistent with the default rounding function in many other languages, including Go.

Examples:

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'

l.round(-12.5) // -13
l.round(12.5) // 13

Math.round(-12.5) // -12
Math.round(12.5) // 13
```

### Undocumented

The following APIs are exported but undocumented. Check [lang.mjs](../lang.mjs).

  * [`const VAL`](../lang.mjs#L3)
  * [`function reqNil`](../lang.mjs#L8)
  * [`function optNil`](../lang.mjs#L9)
  * [`function onlyNil`](../lang.mjs#L10)
  * [`function reqSome`](../lang.mjs#L13)
  * [`function optSome`](../lang.mjs#L14)
  * [`function onlySome`](../lang.mjs#L15)
  * [`function reqBool`](../lang.mjs#L18)
  * [`function optBool`](../lang.mjs#L19)
  * [`function onlyBool`](../lang.mjs#L20)
  * [`function laxBool`](../lang.mjs#L21)
  * [`function reqNum`](../lang.mjs#L24)
  * [`function optNum`](../lang.mjs#L25)
  * [`function onlyNum`](../lang.mjs#L26)
  * [`function laxNum`](../lang.mjs#L27)
  * [`function reqFin`](../lang.mjs#L30)
  * [`function optFin`](../lang.mjs#L31)
  * [`function onlyFin`](../lang.mjs#L32)
  * [`function laxFin`](../lang.mjs#L33)
  * [`function reqFinNeg`](../lang.mjs#L36)
  * [`function optFinNeg`](../lang.mjs#L37)
  * [`function onlyFinNeg`](../lang.mjs#L38)
  * [`function reqFinPos`](../lang.mjs#L41)
  * [`function optFinPos`](../lang.mjs#L42)
  * [`function onlyFinPos`](../lang.mjs#L43)
  * [`function reqInt`](../lang.mjs#L47)
  * [`function optInt`](../lang.mjs#L48)
  * [`function onlyInt`](../lang.mjs#L49)
  * [`function laxInt`](../lang.mjs#L50)
  * [`function reqNat`](../lang.mjs#L53)
  * [`function optNat`](../lang.mjs#L54)
  * [`function onlyNat`](../lang.mjs#L55)
  * [`function laxNat`](../lang.mjs#L56)
  * [`function reqIntNeg`](../lang.mjs#L59)
  * [`function optIntNeg`](../lang.mjs#L60)
  * [`function onlyIntNeg`](../lang.mjs#L61)
  * [`function reqIntPos`](../lang.mjs#L64)
  * [`function optIntPos`](../lang.mjs#L65)
  * [`function onlyIntPos`](../lang.mjs#L66)
  * [`function reqNaN`](../lang.mjs#L69)
  * [`function optNaN`](../lang.mjs#L70)
  * [`function onlyNaN`](../lang.mjs#L71)
  * [`function reqInf`](../lang.mjs#L74)
  * [`function optInf`](../lang.mjs#L75)
  * [`function onlyInf`](../lang.mjs#L76)
  * [`function reqBigInt`](../lang.mjs#L79)
  * [`function optBigInt`](../lang.mjs#L80)
  * [`function onlyBigInt`](../lang.mjs#L81)
  * [`function laxBigInt`](../lang.mjs#L82)
  * [`function reqStr`](../lang.mjs#L85)
  * [`function optStr`](../lang.mjs#L86)
  * [`function onlyStr`](../lang.mjs#L87)
  * [`function laxStr`](../lang.mjs#L88)
  * [`function isValidStr`](../lang.mjs#L91)
  * [`function reqValidStr`](../lang.mjs#L92)
  * [`function optValidStr`](../lang.mjs#L93)
  * [`function onlyValidStr`](../lang.mjs#L94)
  * [`function reqSym`](../lang.mjs#L97)
  * [`function optSym`](../lang.mjs#L98)
  * [`function onlySym`](../lang.mjs#L99)
  * [`function reqKey`](../lang.mjs#L103)
  * [`function optKey`](../lang.mjs#L104)
  * [`function onlyKey`](../lang.mjs#L105)
  * [`function reqRecKey`](../lang.mjs#L108)
  * [`function optRecKey`](../lang.mjs#L109)
  * [`function onlyRecKey`](../lang.mjs#L110)
  * [`function reqPk`](../lang.mjs#L113)
  * [`function optPk`](../lang.mjs#L114)
  * [`function onlyPk`](../lang.mjs#L115)
  * [`function reqJunk`](../lang.mjs#L118)
  * [`function optJunk`](../lang.mjs#L119)
  * [`function onlyJunk`](../lang.mjs#L120)
  * [`function reqComp`](../lang.mjs#L123)
  * [`function optComp`](../lang.mjs#L124)
  * [`function onlyComp`](../lang.mjs#L125)
  * [`function reqPrim`](../lang.mjs#L128)
  * [`function optPrim`](../lang.mjs#L129)
  * [`function onlyPrim`](../lang.mjs#L130)
  * [`function reqFun`](../lang.mjs#L133)
  * [`function optFun`](../lang.mjs#L134)
  * [`function onlyFun`](../lang.mjs#L135)
  * [`function reqFunSync`](../lang.mjs#L138)
  * [`function optFunSync`](../lang.mjs#L139)
  * [`function onlyFunSync`](../lang.mjs#L140)
  * [`function reqFunGen`](../lang.mjs#L143)
  * [`function optFunGen`](../lang.mjs#L144)
  * [`function onlyFunGen`](../lang.mjs#L145)
  * [`function reqFunAsync`](../lang.mjs#L148)
  * [`function optFunAsync`](../lang.mjs#L149)
  * [`function onlyFunAsync`](../lang.mjs#L150)
  * [`function reqFunAsyncGen`](../lang.mjs#L153)
  * [`function optFunAsyncGen`](../lang.mjs#L154)
  * [`function onlyFunAsyncGen`](../lang.mjs#L155)
  * [`function reqObj`](../lang.mjs#L158)
  * [`function optObj`](../lang.mjs#L159)
  * [`function onlyObj`](../lang.mjs#L160)
  * [`function isNpo`](../lang.mjs#L162)
  * [`function reqNpo`](../lang.mjs#L163)
  * [`function optNpo`](../lang.mjs#L164)
  * [`function onlyNpo`](../lang.mjs#L165)
  * [`function laxNpo`](../lang.mjs#L166)
  * [`function reqDict`](../lang.mjs#L176)
  * [`function optDict`](../lang.mjs#L177)
  * [`function onlyDict`](../lang.mjs#L178)
  * [`function laxDict`](../lang.mjs#L179)
  * [`function reqRec`](../lang.mjs#L184)
  * [`function optRec`](../lang.mjs#L185)
  * [`function onlyRec`](../lang.mjs#L186)
  * [`function laxRec`](../lang.mjs#L187)
  * [`function reqArr`](../lang.mjs#L190)
  * [`function optArr`](../lang.mjs#L191)
  * [`function onlyArr`](../lang.mjs#L192)
  * [`function laxArr`](../lang.mjs#L193)
  * [`function reqTrueArr`](../lang.mjs#L200)
  * [`function optTrueArr`](../lang.mjs#L201)
  * [`function onlyTrueArr`](../lang.mjs#L202)
  * [`function laxTrueArr`](../lang.mjs#L203)
  * [`function reqReg`](../lang.mjs#L206)
  * [`function optReg`](../lang.mjs#L207)
  * [`function onlyReg`](../lang.mjs#L208)
  * [`function reqDate`](../lang.mjs#L211)
  * [`function optDate`](../lang.mjs#L212)
  * [`function onlyDate`](../lang.mjs#L213)
  * [`function reqValidDate`](../lang.mjs#L216)
  * [`function optValidDate`](../lang.mjs#L217)
  * [`function onlyValidDate`](../lang.mjs#L218)
  * [`function reqInvalidDate`](../lang.mjs#L221)
  * [`function optInvalidDate`](../lang.mjs#L222)
  * [`function onlyInvalidDate`](../lang.mjs#L223)
  * [`function reqSet`](../lang.mjs#L226)
  * [`function optSet`](../lang.mjs#L227)
  * [`function onlySet`](../lang.mjs#L228)
  * [`function laxSet`](../lang.mjs#L229)
  * [`function reqMap`](../lang.mjs#L232)
  * [`function optMap`](../lang.mjs#L233)
  * [`function onlyMap`](../lang.mjs#L234)
  * [`function laxMap`](../lang.mjs#L235)
  * [`function reqPromise`](../lang.mjs#L238)
  * [`function optPromise`](../lang.mjs#L239)
  * [`function onlyPromise`](../lang.mjs#L240)
  * [`function reqIter`](../lang.mjs#L243)
  * [`function optIter`](../lang.mjs#L244)
  * [`function onlyIter`](../lang.mjs#L245)
  * [`function reqIterAsync`](../lang.mjs#L248)
  * [`function optIterAsync`](../lang.mjs#L249)
  * [`function onlyIterAsync`](../lang.mjs#L250)
  * [`function reqIterator`](../lang.mjs#L253)
  * [`function optIterator`](../lang.mjs#L254)
  * [`function onlyIterator`](../lang.mjs#L255)
  * [`function reqIteratorAsync`](../lang.mjs#L258)
  * [`function optIteratorAsync`](../lang.mjs#L259)
  * [`function onlyIteratorAsync`](../lang.mjs#L260)
  * [`function reqGen`](../lang.mjs#L263)
  * [`function optGen`](../lang.mjs#L264)
  * [`function onlyGen`](../lang.mjs#L265)
  * [`function reqCls`](../lang.mjs#L279)
  * [`function optCls`](../lang.mjs#L280)
  * [`function onlyCls`](../lang.mjs#L281)
  * [`function isSubCls`](../lang.mjs#L284)
  * [`function reqSubCls`](../lang.mjs#L292)
  * [`function reqList`](../lang.mjs#L298)
  * [`function optList`](../lang.mjs#L299)
  * [`function onlyList`](../lang.mjs#L300)
  * [`function laxList`](../lang.mjs#L301)
  * [`function reqSeq`](../lang.mjs#L304)
  * [`function optSeq`](../lang.mjs#L305)
  * [`function onlySeq`](../lang.mjs#L306)
  * [`function reqVac`](../lang.mjs#L309)
  * [`function optVac`](../lang.mjs#L310)
  * [`function onlyVac`](../lang.mjs#L311)
  * [`function reqScalar`](../lang.mjs#L320)
  * [`function optScalar`](../lang.mjs#L321)
  * [`function onlyScalar`](../lang.mjs#L322)
  * [`function isScalarOpt`](../lang.mjs#L324)
  * [`function reqScalarOpt`](../lang.mjs#L325)
  * [`function optScalarOpt`](../lang.mjs#L326)
  * [`function onlyScalarOpt`](../lang.mjs#L327)
  * [`function isArrble`](../lang.mjs#L329)
  * [`function reqArrble`](../lang.mjs#L330)
  * [`function optArrble`](../lang.mjs#L331)
  * [`function onlyArrble`](../lang.mjs#L332)
  * [`function isEqable`](../lang.mjs#L334)
  * [`function reqEqable`](../lang.mjs#L335)
  * [`function optEqable`](../lang.mjs#L336)
  * [`function onlyEqable`](../lang.mjs#L337)
  * [`function isClearable`](../lang.mjs#L339)
  * [`function reqClearable`](../lang.mjs#L340)
  * [`function optClearable`](../lang.mjs#L341)
  * [`function onlyClearable`](../lang.mjs#L342)
  * [`function isErr`](../lang.mjs#L344)
  * [`function reqErr`](../lang.mjs#L345)
  * [`function optErr`](../lang.mjs#L346)
  * [`function onlyErr`](../lang.mjs#L347)
  * [`function optRef`](../lang.mjs#L350)
  * [`function onlyRef`](../lang.mjs#L351)
  * [`function reqRef`](../lang.mjs#L352)
  * [`function isArrOf`](../lang.mjs#L354)
  * [`function reqArrOf`](../lang.mjs#L360)
  * [`function optArrOf`](../lang.mjs#L366)
  * [`function optOneOf`](../lang.mjs#L396)
  * [`function reqOneOf`](../lang.mjs#L400)
  * [`function toInst`](../lang.mjs#L416)
  * [`function toInstOpt`](../lang.mjs#L417)
  * [`function renderOpt`](../lang.mjs#L425)
  * [`function derefAll`](../lang.mjs#L444)
  * [`function swap`](../lang.mjs#L446)
  * [`function True`](../lang.mjs#L459)
  * [`function False`](../lang.mjs#L460)
  * [`function eq`](../lang.mjs#L474)
  * [`class Show`](../lang.mjs#L492)
  * [`function errType`](../lang.mjs#L653)
  * [`function msgType`](../lang.mjs#L654)
  * [`function errFun`](../lang.mjs#L656)
  * [`function msgFun`](../lang.mjs#L657)
  * [`function throwErrFun`](../lang.mjs#L658)
  * [`function errConv`](../lang.mjs#L660)
  * [`function errSynt`](../lang.mjs#L661)
  * [`function msgConv`](../lang.mjs#L662)
  * [`function errConvInst`](../lang.mjs#L664)
  * [`function msgConvInst`](../lang.mjs#L665)
  * [`function errInst`](../lang.mjs#L667)
  * [`function msgInst`](../lang.mjs#L668)
  * [`function errIn`](../lang.mjs#L670)
  * [`function msgIn`](../lang.mjs#L671)
  * [`function errImpl`](../lang.mjs#L673)
  * [`function msgImpl`](../lang.mjs#L674)
  * [`function errTrans`](../lang.mjs#L676)
  * [`function errWrap`](../lang.mjs#L684)
  * [`function errCause`](../lang.mjs#L689)
  * [`const WeakRef`](../lang.mjs#L698)
  * [`const FinalizationRegistry`](../lang.mjs#L704)
  * [`function convType`](../lang.mjs#L723)
  * [`function convSynt`](../lang.mjs#L728)
  * [`function showFunName`](../lang.mjs#L734)
  * [`function get`](../lang.mjs#L749)
  * [`function getOwn`](../lang.mjs#L753)
  * [`function reqGet`](../lang.mjs#L755)
  * [`function recKeys`](../lang.mjs#L768)
