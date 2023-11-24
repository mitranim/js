## Overview

[obj.mjs](../obj.mjs) provides tools for manipulating JS objects in weird ways.

## TOC

  * [#`function assign`](#function-assign)
  * [#`function patch`](#function-patch)
  * [#`class Struct`](#class-struct)
  * [#`class StructLax`](#class-structlax)
  * [#`function memGet`](#function-memget)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.48/obj.mjs'
```

## API

### `function assign`

Links: [source](../obj.mjs#L6); [test/example](../test/obj_test.mjs#L34).

Signature: `(tar, src) => tar`.

Similar to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). Differences:

  * Much faster.
  * Exactly two parameters, not variadic.
  * Sanity-checked:
    * Target must be a [struct](lang_readme.md#function-isstruct).
    * Source must be nil or a [struct](lang_readme.md#function-isstruct).
    * Throws on invalid inputs.

Similar to [#`patch`](#function-patch) but doesn't check for inherited and non-enumerable properties. Simpler, dumber, faster.

### `function patch`

Links: [source](../obj.mjs#L12); [test/example](../test/obj_test.mjs#L143).

Signature: `(tar, src) => tar`.

Similar to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). Differences:

  * Much faster.
  * Takes only two args.
  * Sanity-checked:
    * Target must be a [struct](lang_readme.md#function-isstruct).
    * Source must be nil or a [struct](lang_readme.md#function-isstruct).
    * Throws on invalid inputs.
    * Does not override inherited properties.
    * Does not override own non-enumerable properties.

When overriding inherited and non-enumerable properties is desirable, use [#`assign`](#function-assign).

### `class Struct`

Links: [source](../obj.mjs#L23); [test/example](../test/obj_test.mjs#L348).

Superclass for classes representing a "struct"/"model"/"record". Also see [#`StructLax`](#class-structlax). Features:

  * Supports property declarations, with validation/transformation functions.

  * Can be instantiated or mutated from any [struct](lang_readme.md#function-isstruct) (any dict-like object).

  * Assigns and checks all declared properties when instantiating via `new`. Ignores undeclared properties.

  * Assigns and checks all declared properties when mutating via `.mut` with a [non-nil](lang_readme.md#function-issome) argument. Ignores undeclared properties.

  * When mutating an existing struct via `.mut`, supports calling method `.mut` on existing property values which implement [#the](#function-ismut). This allows deep/recursive mutation.

  * Uses regular JS properties. Does not use getters/setters, proxies, private properties, non-enumerable properties, symbols, or anything else "strange". Declared properties are simply assigned via `=`.

Performance characteristics:

  * The cost of instantiating or mutating depends only on declared properties, not on provided properties.

  * When the number of declared properties is similar to the number of provided properties, this tends to be slightly slower than `Object.assign` or [#`assign`](#function-assign).

  * When the number of declared properties is significantly smaller than the number of provided properties, this tends to be faster than the aforementioned assignment functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.48/lang.mjs'
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.48/obj.mjs'

class Person extends o.Struct {
  static Spec = class extends super.Spec {
    id = l.reqFin
    name = l.reqStr
  }
}

// Fails the type check.
new Person({id: 10})
/* Uncaught TypeError: invalid property "name" */

// Fails the type check.
new Person({name: `Mira`})
/* Uncaught TypeError: invalid property "id" */

// Satisfies the type check.
new Person({id: 10, name: `Mira`})
/* Person { id: 10, name: "Mira" } */

// Ignores undeclared properties.
new Person({id: 10, name: `Mira`, slug: `mira`, gender: `female`})
/* Person { id: 10, name: "Mira" } */
```

### `class StructLax`

Links: [source](../obj.mjs#L49); [test/example](../test/obj_test.mjs#L394).

Superclass for classes representing a "struct"/"model"/"record". Subclass of [#`Struct`](#class-struct) with added support for undeclared properties.

Differences from [#`Struct`](#class-struct):

  * When instantiating via `new` or mutating via `.mut`, in addition to assigning and checking all declared properties, this also copies any undeclared properties present in the source data.

    * Behaves similarly to [#`patch`](#function-patch), and differently from `Object.assign` or [#`assign`](#function-assign). Avoids accidentally shadowing inherited or non-enumerable properties.

    * Just like with declared properties, copying undeclared properties supports deep/recursive mutation by calling `.mut` on any existing property values that implement [#the](#function-ismut).

  * Measurably worse performance.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.48/lang.mjs'
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.48/obj.mjs'

class Person extends o.StructLax {
  static Spec = class extends super.Spec {
    id = l.reqFin
    name = l.reqStr
  }
}

// Fails the type check.
new Person({id: 10})
/* Uncaught TypeError: invalid property "name" */

// Fails the type check.
new Person({name: `Mira`})
/* Uncaught TypeError: invalid property "id" */

// Satisfies the type check.
new Person({id: 10, name: `Mira`})
/* Person { id: 10, name: "Mira" } */

// Assigns undeclared properties in addition to declared properties.
new Person({id: 10, name: `Mira`, slug: `mira`, gender: `female`})
/* Person { id: 10, name: "Mira", slug: "mira", gender: "female" } */
```

### `function memGet`

Links: [source](../obj.mjs#L304); [test/example](../test/obj_test.mjs#L786).

Takes a class and hacks its prototype, converting all non-inherited getters to lazy/memoizing versions of themselves that only execute _once_. The resulting value replaces the getter. Inherited getters are unaffected.

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.48/obj.mjs'

class Bucket {
  static {o.memGet(this)}
  get one() {return new o.StructLax()}
  get two() {return new o.StructLax()}
}

const ref = new Bucket()
// Bucket {}

ref.one.three = 30
ref
// Bucket { one: Struct { three: 30 } }

ref.two.four = 40
ref
// Bucket { one: Struct { three: 30 }, two: Struct { four: 40 } }
```

### Undocumented

The following APIs are exported but undocumented. Check [obj.mjs](../obj.mjs).

  * [`function isObjKey`](../obj.mjs#L3)
  * [`function reqObjKey`](../obj.mjs#L4)
  * [`function isMut`](../obj.mjs#L20)
  * [`function reqMut`](../obj.mjs#L21)
  * [`const clsKey`](../obj.mjs#L53)
  * [`class StructSpec`](../obj.mjs#L55)
  * [`class StructType`](../obj.mjs#L66)
  * [`class StructTypeLax`](../obj.mjs#L144)
  * [`class StructField`](../obj.mjs#L152)
  * [`function MixMain`](../obj.mjs#L190)
  * [`class Strict`](../obj.mjs#L202)
  * [`class BlankStaticPh`](../obj.mjs#L215)
  * [`class StrictStaticPh`](../obj.mjs#L249)
  * [`class MakerPh`](../obj.mjs#L268)
  * [`class Dyn`](../obj.mjs#L277)
  * [`class TypedDyn`](../obj.mjs#L285)
  * [`class WeakTag`](../obj.mjs#L290)
  * [`class MemTag`](../obj.mjs#L306)
  * [`class Cache`](../obj.mjs#L311)
  * [`class WeakCache`](../obj.mjs#L317)
  * [`class StaticCache`](../obj.mjs#L323)
  * [`class StaticWeakCache`](../obj.mjs#L331)
  * [`class MixinCache`](../obj.mjs#L335)
  * [`class DedupMixinCache`](../obj.mjs#L340)
  * [`const parentNodeKey`](../obj.mjs#L360)
  * [`function MixChild`](../obj.mjs#L376)
  * [`class MixChildCache`](../obj.mjs#L378)
  * [`function MixChildCon`](../obj.mjs#L432)
  * [`class MixChildConCache`](../obj.mjs#L434)
  * [`function mixMut`](../obj.mjs#L456)
  * [`function mixMutDescriptors`](../obj.mjs#L467)
  * [`function pub`](../obj.mjs#L480)
  * [`function priv`](../obj.mjs#L490)
  * [`function final`](../obj.mjs#L500)
  * [`function getter`](../obj.mjs#L510)
  * [`function setter`](../obj.mjs#L512)
  * [`function getSet`](../obj.mjs#L514)
