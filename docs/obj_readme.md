## Overview

[obj.mjs](../obj.mjs) provides tools for manipulating JS objects in weird ways.

## TOC

  * [#`function assign`](#function-assign)
  * [#`function patch`](#function-patch)
  * [#`class Struct`](#class-struct)
  * [#`function memGet`](#function-memget)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/obj.mjs'
```

## API

### `function assign`

Links: [source](../obj.mjs#L6); [test/example](../test/obj_test.mjs#L34).

Signature: `(tar, src) => tar`.

Similar to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). Differences:

  * Much faster.
  * Takes only two args.
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

Links: [source](../obj.mjs#L23); [test/example](../test/obj_test.mjs#L188).

Superclass for "model"/"data"/"record" classes. Features:

  * Can be instantiated from any [struct](lang_readme.md#function-isstruct).
    * Behaves similar to [#`patch`](#function-patch), rather than `Object.assign`.
    * Avoids conflicts with inherited methods and getters.
  * Can be deeply mutated by calling `.mut`, which calls `.mut` on fields that implement [#this](#function-ismut), and reassigns other fields.
  * Optional type checking, with declarative type definition.
    * Type checking is performed:
      * When creating instances via `new`, which automatically calls `.mut`.
      * When calling `.mut`.
    * Type checking is _not_ performed when assigning fields via `=`.
    * Individual type assertions such as `l.reqStr`, when hardcoded, are very performant. However, this machinery has overheads that far eclipse the cost of actual type-checking. Avoid in hotspots.
    * You don't pay for what you don't use.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/lang.mjs'
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/obj.mjs'

class Person extends o.Struct {
  static fields = {
    ...super.fields,
    id: l.reqFin,
    name: l.reqStr,
  }
}

// Satisfies the type checks.
new Person({id: 10, name: `Mira`})
/* Person { id: 10, name: "Mira" } */

// Fails the type checks and causes an exception.
new Person({id: `Mira`, name: 10})
/* Uncaught TypeError */

// By design, unknown fields are assigned as-is, without checks.
new Person({id: 20, name: `Kara`, title: `director`})
/* Person { id: 20, name: `Kara`, title: `director` } */
```

### `function memGet`

Links: [source](../obj.mjs#L280); [test/example](../test/obj_test.mjs#L481).

Takes a class and hacks its prototype, converting all non-inherited getters to lazy/memoizing versions of themselves that only execute _once_. The resulting value replaces the getter. Inherited getters are unaffected.

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/obj.mjs'

class Bucket {
  static {o.memGet(this)}
  get one() {return new o.Struct()}
  get two() {return new o.Struct()}
}

const ref = new Bucket()
// Bucket {}

ref.one
ref
// Bucket { one: Struct {} }

ref.one.three = 30
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
  * [`class StructType`](../obj.mjs#L46)
  * [`class StructField`](../obj.mjs#L114)
  * [`function MixMain`](../obj.mjs#L195)
  * [`class Strict`](../obj.mjs#L206)
  * [`class BlankStaticPh`](../obj.mjs#L219)
  * [`class StrictStaticPh`](../obj.mjs#L253)
  * [`class WeakTag`](../obj.mjs#L271)
  * [`class MemTag`](../obj.mjs#L282)
  * [`class Cache`](../obj.mjs#L286)
  * [`class WeakCache`](../obj.mjs#L294)
  * [`class MakerPh`](../obj.mjs#L303)
  * [`class Dyn`](../obj.mjs#L312)
  * [`const parentNodeKey`](../obj.mjs#L321)
  * [`function MixChild`](../obj.mjs#L323)
  * [`class MixChildCache`](../obj.mjs#L325)
  * [`function mixin`](../obj.mjs#L339)
  * [`function pub`](../obj.mjs#L352)
  * [`function priv`](../obj.mjs#L362)
  * [`function final`](../obj.mjs#L372)
  * [`function getter`](../obj.mjs#L382)
  * [`function setter`](../obj.mjs#L384)
  * [`function getSet`](../obj.mjs#L386)
