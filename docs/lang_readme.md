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
  * [#`function hasIn`](#function-hasin)
  * [#`function hasOwn`](#function-hasown)
  * [#`function hasOwnEnum`](#function-hasownenum)
  * [#`function hasInherited`](#function-hasinherited)
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
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'
```

## API

### `function isNil`

Links: [source](../lang.mjs#L3); [test/example](../test/lang_test.mjs#L219).

True for `null` and `undefined`. Same as `value == null`. Incidentally, these are the only values that produce an exception when attempting to read a property: `null.someProperty`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

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

Links: [source](../lang.mjs#L8); [test/example](../test/lang_test.mjs#L227).

Inverse of [#`isNil`](#function-isnil). False for `null` and `undefined`, true for other values.

### `function isBool`

Links: [source](../lang.mjs#L13); [test/example](../test/lang_test.mjs#L235).

Same as `typeof val === 'boolean'`.

### `function isNum`

Links: [source](../lang.mjs#L19); [test/example](../test/lang_test.mjs#L244).

Same as `typeof val === 'number'`. True if the value is a primitive number, _including_ `NaN` and `±Infinity`. In most cases you should use [#`isFin`](#function-isfin) instead.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

l.isNum(1)
// true

l.isNum('1')
// false

l.isNum(NaN)
// true <-- WTF
```

### `function isFin`

Links: [source](../lang.mjs#L25); [test/example](../test/lang_test.mjs#L256).

Same as ES2015's [`Number.isFinite`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite). True if `val` is a primitive number and is _not_ `NaN` or `±Infinity`. In most cases you should prefer `isFin` over `isNum`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

l.isFin(1)
// true

l.isFin('1')
// false

l.isFin(NaN)
// false
```

### `function isFinNeg`

Links: [source](../lang.mjs#L31); [test/example](../test/lang_test.mjs#L271).

True if value is finite (via [#`isFin`](#function-isfin)) and < 0.

### `function isFinPos`

Links: [source](../lang.mjs#L36); [test/example](../test/lang_test.mjs#L291).

True if value is finite (via [#`isFin`](#function-isfin)) and > 0.

### `function isInt`

Links: [source](../lang.mjs#L42); [test/example](../test/lang_test.mjs#L311).

True if value is an integer: finite via [#`isFin`](#function-isfin), without a fractional part.

### `function isNat`

Links: [source](../lang.mjs#L48); [test/example](../test/lang_test.mjs#L330).

True if value is a natural number: integer >= 0. Also see [#`isIntPos`](#function-isintpos).

### `function isIntNeg`

Links: [source](../lang.mjs#L54); [test/example](../test/lang_test.mjs#L349).

True if value is integer < 0. Also see [#`isFinNeg`](#function-isfinneg).

### `function isIntPos`

Links: [source](../lang.mjs#L59); [test/example](../test/lang_test.mjs#L368).

True if value is integer > 0. Also see [#`isNat`](#function-isnat), [#`isFinPos`](#function-isfinpos).

### `function isNaN`

Links: [source](../lang.mjs#L64); [test/example](../test/lang_test.mjs#L387).

Same as ES2015's [`Number.isNaN`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN). True if value is _actually_ `NaN`. Doesn't coerce non-numbers to numbers, unlike global `isNaN`.

### `function isInf`

Links: [source](../lang.mjs#L69); [test/example](../test/lang_test.mjs#L402).

True if value is `-Infinity` or `Infinity`.

### `function isBigInt`

Links: [source](../lang.mjs#L74); [test/example](../test/lang_test.mjs#L417).

True if value is a primitive [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). False for all other inputs, including `BigInt` object wrappers.

### `function isStr`

Links: [source](../lang.mjs#L80); [test/example](../test/lang_test.mjs#L436).

Same as `typeof val === 'string'`. True if value is a primitive string.

### `function isSym`

Links: [source](../lang.mjs#L92); [test/example](../test/lang_test.mjs#L454).

Same as `typeof val === 'symbol'`. True if value is a primitive symbol.

### `function isKey`

Links: [source](../lang.mjs#L98); [test/example](../test/lang_test.mjs#L461).

True if value qualifies as a dictionary key. True for all primitives excluding garbage values via [#`isJunk`](#function-isjunk).

### `function isPk`

Links: [source](../lang.mjs#L103); [test/example](../test/lang_test.mjs#L481).

True for objects that implement method `.pk` which must return a valid [#primary](#function-ispk). This interface is used internally by [`Coll`](coll_readme.md#class-coll).

### `function isJunk`

Links: [source](../lang.mjs#L108); [test/example](../test/lang_test.mjs#L502).

True for garbage values: [#nil](#function-isnil), [#NaN](#function-isnan), [#±Infinity](#function-isinf).

### `function isComp`

Links: [source](../lang.mjs#L113); [test/example](../test/lang_test.mjs#L517).

True if value is "composite" / "compound" / "complex". Opposite of [#`isPrim`](#function-isprim). Definition:

```js
function isComp(val) {return isObj(val) || isFun(val)}
```

### `function isPrim`

Links: [source](../lang.mjs#L118); [test/example](../test/lang_test.mjs#L531).

True if value is a JS primitive: not an object, not a function. Opposite of [#`isComp`](#function-iscomp).

### `function isFun`

Links: [source](../lang.mjs#L123); [test/example](../test/lang_test.mjs#L545).

Same as `typeof val === 'function'`. True if value is any function, regardless of its type (arrow, async, generator, etc.).

### `function isFunSync`

Links: [source](../lang.mjs#L128); [test/example](../test/lang_test.mjs#L569).

True if the input is a normal sync function. False for generator functions or async functions.

### `function isFunGen`

Links: [source](../lang.mjs#L133); [test/example](../test/lang_test.mjs#L579).

True if the input is a sync generator function. False for normal sync functions and async functions.

### `function isFunAsync`

Links: [source](../lang.mjs#L138); [test/example](../test/lang_test.mjs#L589).

True if the input is an async non-generator function. False for sync functions, generator functions, or async generator functions.

### `function isFunAsyncGen`

Links: [source](../lang.mjs#L143); [test/example](../test/lang_test.mjs#L599).

True if the input is an async generator function. False for sync functions and async non-generator functions.

### `function isObj`

Links: [source](../lang.mjs#L148); [test/example](../test/lang_test.mjs#L609).

Same as `typeof val === 'object' && val !== null`. True for any JS object: plain dict, array, various other classes. Doesn't include functions, even though JS functions are extensible objects.

* Compare [#`isComp`](#function-iscomp) which returns true for objects _and_ functions.
* For plain objects used as dictionaries, see [#`isDict`](#function-isdict).
* For fancy non-list objects, see [#`isStruct`](#function-isstruct).

### `function isDict`

Links: [source](../lang.mjs#L159); [test/example](../test/lang_test.mjs#L641).

True for a "plain object" created via `{...}` or `Object.create(null)`. False for any other input, including instances of any class other than `Object`.

See [#`isStruct`](#function-isstruct) for a more general definition of a non-iterable object.

### `function isStruct`

Links: [source](../lang.mjs#L172); [test/example](../test/lang_test.mjs#L659).

True if value is a non-iterable object. Excludes both [#sync_iterables](#function-isiter) and [#async_iterables](#function-isiterasync). Note that [#dicts](#function-isdict) are automatically structs, but not all structs are dicts.

### `function isArr`

Links: [source](../lang.mjs#L178); [test/example](../test/lang_test.mjs#L685).

Alias for [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray). Used internally for all array checks.

True if value is an instance of [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) or its subclass. False for all other values, including non-array objects whose prototype is an array.

### `function isTrueArr`

Links: [source](../lang.mjs#L188); [test/example](../test/lang_test.mjs#L697).

Similar to [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) and [#`isArr`](#function-isarr), but returns true only for instances of the _exact_ `Array` class, false for instances of subclasses.

At the time of writing, subclasses of `Array` suffer horrible performance penalties in V8, and possibly in other engines. Using them can also cause deoptimization of code that would otherwise run much faster. We sometimes prioritize or even enforce "true" arrays for consistent performance.

### `function isReg`

Links: [source](../lang.mjs#L194); [test/example](../test/lang_test.mjs#L712).

True if value is an instance of [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) or its subclass.

### `function isDate`

Links: [source](../lang.mjs#L199); [test/example](../test/lang_test.mjs#L720).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Most of the time you should prefer [#`isValidDate`](#function-isvaliddate).

### `function isValidDate`

Links: [source](../lang.mjs#L204); [test/example](../test/lang_test.mjs#L728).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) and its timestamp is [#finite](#function-isfin) rather than `NaN` or `Infinity`.

### `function isInvalidDate`

Links: [source](../lang.mjs#L209); [test/example](../test/lang_test.mjs#L735).

True of value is an instance of [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) representing an invalid date whose timestamp is `NaN`.

### `function isSet`

Links: [source](../lang.mjs#L214); [test/example](../test/lang_test.mjs#L742).

True if value is an instance of [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) or its subclass.

### `function isMap`

Links: [source](../lang.mjs#L220); [test/example](../test/lang_test.mjs#L752).

True if value is an instance of [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or its subclass.

### `function isPromise`

Links: [source](../lang.mjs#L226); [test/example](../test/lang_test.mjs#L762).

True if the value satisfies the ES2015 [promise interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### `function isIter`

Links: [source](../lang.mjs#L231); [test/example](../test/lang_test.mjs#L771).

True if the value satisfies the ES2015 [sync iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterator_ rather than _iterable_, use [#`isIterator`](#function-isiterator).

### `function isIterAsync`

Links: [source](../lang.mjs#L236); [test/example](../test/lang_test.mjs#L797).

True if the value satisfies the ES2015 [async iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterator_ rather than _iterable_, use [#`isIteratorAsync`](#function-isiteratorasync).

### `function isIterator`

Links: [source](../lang.mjs#L241); [test/example](../test/lang_test.mjs#L814).

True if the value satisfies the ES2015 [sync iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). For _iterable_ rather than _iterator_, use [#`isIter`](#function-isiter).

### `function isIteratorAsync`

Links: [source](../lang.mjs#L246); [test/example](../test/lang_test.mjs#L840).

True if the value satisfies the ES2015 [async iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of). For _iterable_ rather than _iterator_, use [#`isIterAsync`](#function-isiterasync).

### `function isGen`

Links: [source](../lang.mjs#L251); [test/example](../test/lang_test.mjs#L866).

True if value is a [#sync_iterator](#function-isiterator) created by calling a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).

### `function isCls`

Links: [source](../lang.mjs#L257); [test/example](../test/lang_test.mjs#L926).

True if the input is a function with a prototype, likely to be a class. False for arrow functions such as `() => {}`, which don't have a prototype.

### `function isList`

Links: [source](../lang.mjs#L271); [test/example](../test/lang_test.mjs#L938).

True for any array-like such as: `[]`, `arguments`, `TypedArray`, `NodeList`, etc. Used internally for most list checks. Note that _primitive strings are not considered lists_.

### `function isSeq`

Links: [source](../lang.mjs#L277); [test/example](../test/lang_test.mjs#L954).

True for any of:

  * [#Array](#function-isarr)
  * [#List](#function-islist)
  * [#Set](#function-isset)
  * [#Iterator](#function-isiterator)

Many functions in `iter.mjs` support arbitrary data structures compatible with [`values`](iter_readme.md#function-values), but some functions such as [`arr`](iter_readme.md#function-arr) allow only sequences, for sanity checking.

### `function isVac`

Links: [source](../lang.mjs#L282); [test/example](../test/lang_test.mjs#L977).

Short for "is vacuous" or "is vacated". Could also be called "is falsy deep". True if the input is [#`falsy`](#function-falsy) or a [#list](#function-islist) where all values are vacuous, recursively. Does not iterate non-lists. Also see complementary function [#`vac`](#function-vac).

### `function isScalar`

Links: [source](../lang.mjs#L287); [test/example](../test/lang_test.mjs#L1015).

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

### `function isEmpty`

Links: [source](../lang.mjs#L339); [test/example](../test/lang_test.mjs#L1100).

True if the input is an empty collection such as list, set, map, or a primitive such as `null`. False for any other non-primitive. Treating primitives as "empty" is consistent with various functions in `iter.mjs` that operate on collections.

### `function isInst`

Links: [source](../lang.mjs#L346); [test/example](../test/lang_test.mjs#L1052).

Signature: `(val, Cls) => bool`.

Same as `instanceof` but _does not_ implicitly convert the operand to an object. True only if the operand is already an instance of the given class. Also unlike `instanceof`, this is always false for functions, avoiding the insanity of `fun instanceof Function` being true.

### `function req`

Links: [source](../lang.mjs#L350); [test/example](../test/lang_test.mjs#L1326).

Signature: `(val, test) => val` where `test: val => bool`.

Short for "require". Minification-friendly assertion. If `!test(val)`, throws an informative `TypeError`. Otherwise, returns `val` as-is.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

l.req({one: `two`}, l.isObj)
// {one: `two`}

l.req('str', l.isFun)
// Uncaught TypeError: expected variant of isFun, got "str"
```

### `function opt`

Links: [source](../lang.mjs#L360); [test/example](../test/lang_test.mjs#L1385).

Short for "optional". If `val` is [#non_nil](#function-issome), uses [#`req`](#function-req) to validate it. Returns `val` as-is.

### `function reqInst`

Links: [source](../lang.mjs#L369); [test/example](../test/lang_test.mjs#L1423).

Signature: `(val, Cls) => val`.

Short for "require instance". Asserts that `val` is an instance of the given class. Returns `val` as-is.

### `function optInst`

Links: [source](../lang.mjs#L374); [test/example](../test/lang_test.mjs#L1440).

Short for "optional instance". If `val` is [#non_nil](#function-issome), uses [#`reqInst`](#function-reqinst) to validate it. Returns `val` as-is.

### `function only`

Links: [source](../lang.mjs#L379); [test/example](../test/lang_test.mjs#L1472).

Signature: `(val, test) => val` where `test: val => bool`.

Type filtering utility. If `val` satisfies the given test function, returns `val` as-is. Otherwise returns `undefined`.

### `function onlyInst`

Links: [source](../lang.mjs#L381); [test/example](../test/lang_test.mjs#L1499).

Signature: `(val, Cls) => val?`.

Type filtering utility. If `val` is an instance of `Cls`, returns `val` as-is. Otherwise returns `undefined`.

### `function render`

Links: [source](../lang.mjs#L388); [test/example](../test/lang_test.mjs#L77).

Renders a value for user display. Counterpart to [#`show`](#function-show), which renders a value for debug purposes. Intended only for [#scalar](#function-isscalar) values. Rules:

  * [#Date](#function-isdate) with default `.toString` → use `.toISOString`. This overrides the insane JS default stringification of dates, defaulting to the _reversible_ machine-decodable representation used for JSON.
  * Other [#non-nil](#function-issome) [#scalars](#function-isscalar) → default JS stringification.
  * All other inputs including [#nil](#function-isnil) → `TypeError` exception.

### `function renderLax`

Links: [source](../lang.mjs#L401); [test/example](../test/lang_test.mjs#L110).

Renders a value for user display. Intended only for [#scalar](#function-isscalar) values. Unlike [#`render`](#function-render), this allows nil. Rules:

  * [#Nil](#function-isnil) → `''`.
  * Otherwise → [#`render`](#function-render).

### `function show`

Links: [source](../lang.mjs#L403); [test/example](../test/lang_test.mjs#L20).

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

Links: [source](../lang.mjs#L411); [test/example](../test/lang_test.mjs#L165).

Idempotent conversion to a [#true](#function-istruearr). Allowed inputs:

  * [#Nil](#function-isnil) → return `[]`.
  * [#True](#function-istruearr) → return as-is.
  * [#Iterable](#function-isiter) → convert to `Array`.
  * Otherwise → `TypeError` exception.

### `function is`

Links: [source](../lang.mjs#L419); [test/example](../test/lang_test.mjs#L209).

Identity test: same as `===`, but considers `NaN` equal to `NaN`. Equivalent to [_SameValueZero_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero) as defined by the language spec. Used internally for all identity tests.

Note that [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) implements [_SameValue_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevalue), which treats `-0` and `+0` as _distinct values_. This is typically undesirable. As a result, you should prefer `l.is` over `===` or `Object.is`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

l.is(1, '1')
// false

l.is(NaN, NaN)
// true
```

### `function truthy`

Links: [source](../lang.mjs#L420); [test/example](../test/lang_test.mjs#L195).

Same as `!!` or `Boolean`. Sometimes useful with higher-order functions.

### `function falsy`

Links: [source](../lang.mjs#L421); [test/example](../test/lang_test.mjs#L202).

Same as `!`. Sometimes useful with higher-order functions.

### `function nop`

Links: [source](../lang.mjs#L422); [test/example](../test/lang_test.mjs#L1715).

Empty function. Functional equivalent of `;` or `undefined`. Sometimes useful with higher-order functions.

### `function id`

Links: [source](../lang.mjs#L423); [test/example](../test/lang_test.mjs#L1721).

Identity function: returns its first argument unchanged. Sometimes useful with higher-order functions.

### `function val`

Links: [source](../lang.mjs#L424); [test/example](../test/lang_test.mjs#L1728).

Takes a value and creates a function that always returns that value. Sometimes useful with higher order functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

const constant = l.val(1)

constant()
// 1

constant(`this input is ignored`)
// 1
```

### `function panic`

Links: [source](../lang.mjs#L425); [test/example](../test/lang_test.mjs#L1742).

Same as `throw` but an expression rather than a statement. Also sometimes useful with higher-order functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

const x = someTest ? someValue : l.panic(Error(`unreachable`))
```

### `function vac`

Links: [source](../lang.mjs#L428); [test/example](../test/lang_test.mjs#L1889).

Complements [#`isVac`](#function-isvac). Returns `undefined` if the input is vacuous, otherwise returns the input as-is.

### `function bind`

Links: [source](../lang.mjs#L429); [test/example](../test/lang_test.mjs#L1686).

Like [`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind), but instead of taking `this` as an argument, takes it contextually. By default `this` is `undefined`. To set it, use `l.bind.call`.

Returns a new function that represents [partial application](https://en.wikipedia.org/wiki/Partial_application) of the given function, a common tool in functional programming. When called, it joins arguments from both calls and invokes the original function. Think of it like splitting a function call in two, or more. Performance is inferior to closures; avoid in hotspots.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

const inc = l.bind(l.add, 1)

inc(2)
// 3
```

Note: we don't provide facilities for currying. Experience has shown it to be extremely error prone. Currying, as seen in purely functional languages such as Haskell, tends to care about the amount of arguments. Calling a curried function may either create a new function, or call the underlying function (possibly side-effectful). This approach works reasonably well in statically typed languages, but not in JS where all functions are variadic and it's conventional to sometimes pass extra utility arguments "just in case", which the callee may or may not care about. `bind` is different because the created function will always call the original function, regardless of how many arguments were passed.

### `function not`

Links: [source](../lang.mjs#L431); [test/example](../test/lang_test.mjs#L1705).

Returns a new function that negates the result of the given function, like a delayed `!`.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

function eq(a, b) {return a === b}

const different = l.not(eq)

different(10, 20)
// !eq(10, 20) = true

// equivalent:
function different(a, b) {return !eq(a, b)}
```

### `function hasIn`

Links: [source](../lang.mjs#L436); [test/example](../test/lang_test.mjs#L1117).

Same as the `in` operator, but returns `false` for [#primitives](#function-isprim) instead of throwing an exception:

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

l.hasIn(new Number(10), `toString`)
// true

l.hasIn(10, `toString`)
// false

`toString` in 10
// Uncaught TypeError
```

### `function hasOwn`

Links: [source](../lang.mjs#L437); [test/example](../test/lang_test.mjs#L1131).

Same as [`Object.prototype.hasOwnProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) but shorter and safe to call on primitives. Always false for primitives.

### `function hasOwnEnum`

Links: [source](../lang.mjs#L438); [test/example](../test/lang_test.mjs#L1145).

Same as [`Object.prototype.propertyIsEnumerable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable) but shorter and safe to call on primitives. Always false for primitives.

### `function hasInherited`

Links: [source](../lang.mjs#L439); [test/example](../test/lang_test.mjs#L1159).

Returns `true` if the target is [#non-primitive](#function-iscomp) and has the given property on its prototype. As a consequence, this returns `false` if the target is a primitive, or has the given property as an "own" property, either enumerable or not.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.52/lang.mjs'

l.hasInherited([10, 20, 30], `length`)
// false

l.hasInherited([10, 20, 30], `1`)
// false

l.hasInherited([10, 20, 30], `toString`)
// true
```

### `function hasMeth`

Links: [source](../lang.mjs#L440); [test/example](../test/lang_test.mjs#L1198).

True if the the given value has the given named method. Safe to call on primitives such as `null`. Always false for primitives.

### `function setProto`

Links: [source](../lang.mjs#L451); [test/example](../test/lang_test.mjs#L1266).

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

Links: [source](../lang.mjs#L457); [test/example](../test/lang_test.mjs#L1282).

Short for "null-prototype object". Syntactic shortcut for `Object.create(null)`. The following are equivalent:

```js
Object.create(null)
l.npo()
```

Compare [#`Emp`](#class-emp) which is intended for subclassing.

### `class Emp`

Links: [source](../lang.mjs#L462); [test/example](../test/lang_test.mjs#L1292).

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

Links: [source](../lang.mjs#L467); [test/example](../test/lang_test.mjs#L1785).

Same as `+`.

### `function sub`

Links: [source](../lang.mjs#L468); [test/example](../test/lang_test.mjs#L1791).

Same as `-`.

### `function mul`

Links: [source](../lang.mjs#L469); [test/example](../test/lang_test.mjs#L1797).

Same as `*`.

### `function div`

Links: [source](../lang.mjs#L470); [test/example](../test/lang_test.mjs#L1803).

Same as `/`.

### `function rem`

Links: [source](../lang.mjs#L471); [test/example](../test/lang_test.mjs#L1809).

Same as `%`.

### `function lt`

Links: [source](../lang.mjs#L472); [test/example](../test/lang_test.mjs#L1817).

Same as `<`.

### `function gt`

Links: [source](../lang.mjs#L473); [test/example](../test/lang_test.mjs#L1828).

Same as `>`.

### `function lte`

Links: [source](../lang.mjs#L474); [test/example](../test/lang_test.mjs#L1839).

Same as `<=`.

### `function gte`

Links: [source](../lang.mjs#L475); [test/example](../test/lang_test.mjs#L1850).

Same as `>=`.

### `function neg`

Links: [source](../lang.mjs#L476); [test/example](../test/lang_test.mjs#L1861).

Arithmetic negation. Same as unary `-`.

### `function inc`

Links: [source](../lang.mjs#L477); [test/example](../test/lang_test.mjs#L1873).

Increments by `1`.

### `function dec`

Links: [source](../lang.mjs#L478); [test/example](../test/lang_test.mjs#L1881).

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
  * [`function reqSym`](../lang.mjs#L93)
  * [`function optSym`](../lang.mjs#L94)
  * [`function onlySym`](../lang.mjs#L95)
  * [`function reqKey`](../lang.mjs#L99)
  * [`function optKey`](../lang.mjs#L100)
  * [`function onlyKey`](../lang.mjs#L101)
  * [`function reqPk`](../lang.mjs#L104)
  * [`function optPk`](../lang.mjs#L105)
  * [`function onlyPk`](../lang.mjs#L106)
  * [`function reqJunk`](../lang.mjs#L109)
  * [`function optJunk`](../lang.mjs#L110)
  * [`function onlyJunk`](../lang.mjs#L111)
  * [`function reqComp`](../lang.mjs#L114)
  * [`function optComp`](../lang.mjs#L115)
  * [`function onlyComp`](../lang.mjs#L116)
  * [`function reqPrim`](../lang.mjs#L119)
  * [`function optPrim`](../lang.mjs#L120)
  * [`function onlyPrim`](../lang.mjs#L121)
  * [`function reqFun`](../lang.mjs#L124)
  * [`function optFun`](../lang.mjs#L125)
  * [`function onlyFun`](../lang.mjs#L126)
  * [`function reqFunSync`](../lang.mjs#L129)
  * [`function optFunSync`](../lang.mjs#L130)
  * [`function onlyFunSync`](../lang.mjs#L131)
  * [`function reqFunGen`](../lang.mjs#L134)
  * [`function optFunGen`](../lang.mjs#L135)
  * [`function onlyFunGen`](../lang.mjs#L136)
  * [`function reqFunAsync`](../lang.mjs#L139)
  * [`function optFunAsync`](../lang.mjs#L140)
  * [`function onlyFunAsync`](../lang.mjs#L141)
  * [`function reqFunAsyncGen`](../lang.mjs#L144)
  * [`function optFunAsyncGen`](../lang.mjs#L145)
  * [`function onlyFunAsyncGen`](../lang.mjs#L146)
  * [`function reqObj`](../lang.mjs#L149)
  * [`function optObj`](../lang.mjs#L150)
  * [`function onlyObj`](../lang.mjs#L151)
  * [`function isNpo`](../lang.mjs#L153)
  * [`function reqNpo`](../lang.mjs#L154)
  * [`function optNpo`](../lang.mjs#L155)
  * [`function onlyNpo`](../lang.mjs#L156)
  * [`function laxNpo`](../lang.mjs#L157)
  * [`function reqDict`](../lang.mjs#L167)
  * [`function optDict`](../lang.mjs#L168)
  * [`function onlyDict`](../lang.mjs#L169)
  * [`function laxDict`](../lang.mjs#L170)
  * [`function reqStruct`](../lang.mjs#L173)
  * [`function optStruct`](../lang.mjs#L174)
  * [`function onlyStruct`](../lang.mjs#L175)
  * [`function laxStruct`](../lang.mjs#L176)
  * [`function reqArr`](../lang.mjs#L179)
  * [`function optArr`](../lang.mjs#L180)
  * [`function onlyArr`](../lang.mjs#L181)
  * [`function laxArr`](../lang.mjs#L182)
  * [`function reqTrueArr`](../lang.mjs#L189)
  * [`function optTrueArr`](../lang.mjs#L190)
  * [`function onlyTrueArr`](../lang.mjs#L191)
  * [`function laxTrueArr`](../lang.mjs#L192)
  * [`function reqReg`](../lang.mjs#L195)
  * [`function optReg`](../lang.mjs#L196)
  * [`function onlyReg`](../lang.mjs#L197)
  * [`function reqDate`](../lang.mjs#L200)
  * [`function optDate`](../lang.mjs#L201)
  * [`function onlyDate`](../lang.mjs#L202)
  * [`function reqValidDate`](../lang.mjs#L205)
  * [`function optValidDate`](../lang.mjs#L206)
  * [`function onlyValidDate`](../lang.mjs#L207)
  * [`function reqInvalidDate`](../lang.mjs#L210)
  * [`function optInvalidDate`](../lang.mjs#L211)
  * [`function onlyInvalidDate`](../lang.mjs#L212)
  * [`function reqSet`](../lang.mjs#L215)
  * [`function optSet`](../lang.mjs#L216)
  * [`function onlySet`](../lang.mjs#L217)
  * [`function laxSet`](../lang.mjs#L218)
  * [`function reqMap`](../lang.mjs#L221)
  * [`function optMap`](../lang.mjs#L222)
  * [`function onlyMap`](../lang.mjs#L223)
  * [`function laxMap`](../lang.mjs#L224)
  * [`function reqPromise`](../lang.mjs#L227)
  * [`function optPromise`](../lang.mjs#L228)
  * [`function onlyPromise`](../lang.mjs#L229)
  * [`function reqIter`](../lang.mjs#L232)
  * [`function optIter`](../lang.mjs#L233)
  * [`function onlyIter`](../lang.mjs#L234)
  * [`function reqIterAsync`](../lang.mjs#L237)
  * [`function optIterAsync`](../lang.mjs#L238)
  * [`function onlyIterAsync`](../lang.mjs#L239)
  * [`function reqIterator`](../lang.mjs#L242)
  * [`function optIterator`](../lang.mjs#L243)
  * [`function onlyIterator`](../lang.mjs#L244)
  * [`function reqIteratorAsync`](../lang.mjs#L247)
  * [`function optIteratorAsync`](../lang.mjs#L248)
  * [`function onlyIteratorAsync`](../lang.mjs#L249)
  * [`function reqGen`](../lang.mjs#L252)
  * [`function optGen`](../lang.mjs#L253)
  * [`function onlyGen`](../lang.mjs#L254)
  * [`function reqCls`](../lang.mjs#L258)
  * [`function optCls`](../lang.mjs#L259)
  * [`function onlyCls`](../lang.mjs#L260)
  * [`function isSubCls`](../lang.mjs#L263)
  * [`function reqSubCls`](../lang.mjs#L266)
  * [`function reqList`](../lang.mjs#L272)
  * [`function optList`](../lang.mjs#L273)
  * [`function onlyList`](../lang.mjs#L274)
  * [`function laxList`](../lang.mjs#L275)
  * [`function reqSeq`](../lang.mjs#L278)
  * [`function optSeq`](../lang.mjs#L279)
  * [`function onlySeq`](../lang.mjs#L280)
  * [`function reqVac`](../lang.mjs#L283)
  * [`function optVac`](../lang.mjs#L284)
  * [`function onlyVac`](../lang.mjs#L285)
  * [`function reqScalar`](../lang.mjs#L294)
  * [`function optScalar`](../lang.mjs#L295)
  * [`function onlyScalar`](../lang.mjs#L296)
  * [`function isScalarOpt`](../lang.mjs#L298)
  * [`function reqScalarOpt`](../lang.mjs#L299)
  * [`function optScalarOpt`](../lang.mjs#L300)
  * [`function onlyScalarOpt`](../lang.mjs#L301)
  * [`function isArrble`](../lang.mjs#L304)
  * [`function reqArrble`](../lang.mjs#L305)
  * [`function optArrble`](../lang.mjs#L306)
  * [`function onlyArrble`](../lang.mjs#L307)
  * [`function isEqable`](../lang.mjs#L309)
  * [`function reqEqable`](../lang.mjs#L310)
  * [`function optEqable`](../lang.mjs#L311)
  * [`function onlyEqable`](../lang.mjs#L312)
  * [`function isClearable`](../lang.mjs#L314)
  * [`function reqClearable`](../lang.mjs#L315)
  * [`function optClearable`](../lang.mjs#L316)
  * [`function onlyClearable`](../lang.mjs#L317)
  * [`function isErr`](../lang.mjs#L319)
  * [`function reqErr`](../lang.mjs#L320)
  * [`function optErr`](../lang.mjs#L321)
  * [`function onlyErr`](../lang.mjs#L322)
  * [`function isArrOf`](../lang.mjs#L324)
  * [`function reqArrOf`](../lang.mjs#L330)
  * [`function optArrOf`](../lang.mjs#L335)
  * [`function reqOneOf`](../lang.mjs#L355)
  * [`function optOneOf`](../lang.mjs#L365)
  * [`function toInst`](../lang.mjs#L385)
  * [`function toInstOpt`](../lang.mjs#L386)
  * [`function renderOpt`](../lang.mjs#L394)
  * [`function True`](../lang.mjs#L426)
  * [`function False`](../lang.mjs#L427)
  * [`function eq`](../lang.mjs#L442)
  * [`function errType`](../lang.mjs#L496)
  * [`function msgType`](../lang.mjs#L497)
  * [`function errFun`](../lang.mjs#L499)
  * [`function msgFun`](../lang.mjs#L500)
  * [`function throwErrFun`](../lang.mjs#L501)
  * [`function errConv`](../lang.mjs#L503)
  * [`function errSynt`](../lang.mjs#L504)
  * [`function msgConv`](../lang.mjs#L505)
  * [`function errConvInst`](../lang.mjs#L507)
  * [`function msgConvInst`](../lang.mjs#L508)
  * [`function errInst`](../lang.mjs#L510)
  * [`function msgInst`](../lang.mjs#L511)
  * [`function errIn`](../lang.mjs#L513)
  * [`function msgIn`](../lang.mjs#L514)
  * [`function errImpl`](../lang.mjs#L516)
  * [`function msgImpl`](../lang.mjs#L517)
  * [`function errTrans`](../lang.mjs#L519)
  * [`function errWrap`](../lang.mjs#L527)
  * [`function errCause`](../lang.mjs#L532)
  * [`function convType`](../lang.mjs#L550)
  * [`function convSynt`](../lang.mjs#L555)
  * [`function showFunName`](../lang.mjs#L562)
  * [`function get`](../lang.mjs#L606)
  * [`function getOwn`](../lang.mjs#L608)
  * [`function reqGet`](../lang.mjs#L610)
  * [`function structKeys`](../lang.mjs#L626)
