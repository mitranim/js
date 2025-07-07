## Overview

[obj.mjs](../obj.mjs) provides tools for manipulating JS objects in weird ways.

## TOC

  * [#`function assign`](#function-assign)
  * [#`function patch`](#function-patch)
  * [#`function memGet`](#function-memget)
  * [#`function MixStruct`](#function-mixstruct)
  * [#`function MixStructLax`](#function-mixstructlax)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obj.mjs'
```

## API

### `function assign`

Links: [source](../obj.mjs#L9); [test/example](../test/obj_test.mjs#L47).

Signature: `(tar, src) => tar`.

Similar to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). Differences:

  * Much faster.
  * Exactly two parameters, not variadic.
  * Sanity-checked:
    * Target must be a [r](lang_readme.md#function-isrec).
    * Source must be nil or a [r](lang_readme.md#function-isrec).
    * Throws on invalid inputs.

Similar to [#`patch`](#function-patch) but doesn't check for inherited and non-enumerable properties. Simpler, dumber, faster.

### `function patch`

Links: [source](../obj.mjs#L17); [test/example](../test/obj_test.mjs#L166).

Signature: `(tar, src) => tar`.

Similar to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). Differences:

  * Much faster.
  * Takes only two args.
  * Sanity-checked:
    * Target must be a [r](lang_readme.md#function-isrec).
    * Source must be nil or a [r](lang_readme.md#function-isrec).
    * Throws on invalid inputs.
    * Does not override inherited properties.
    * Does not override own non-enumerable properties.

When overriding inherited and non-enumerable properties is desirable, use [#`assign`](#function-assign).

### `function memGet`

Links: [source](../obj.mjs#L147); [test/example](../test/obj_test.mjs#L751).

Takes a class and hacks its prototype, converting all non-inherited getters to lazy/memoizing versions of themselves that only execute _once_. The resulting value replaces the getter. Inherited getters are unaffected.

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obj.mjs'

class StructLax extends o.MixStruct(l.Emp) {}

class Bucket {
  static {o.memGet(this)}
  get one() {return new StructLax()}
  get two() {return new StructLax()}
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

### `function MixStruct`

Links: [source](../obj.mjs#L196); [test/example](../test/obj_test.mjs#L302).

Mixin for classes representing a "struct" / "model" / "record". Also see [#`MixStructLax`](#function-mixstructlax). Features:

* Supports explicit specs with validation / transformation functions.

* Can be instantiated or mutated from any [r](lang_readme.md#function-isrec) (any dict-like object); each field is validated by the user-defined spec.

* Assigns and checks all declared fields when instantiating via `new`. Ignores undeclared fields.

* Supports partial updates via the associated function `structMut` (not a method), which assigns and validates known fields provided in the input.

* Supports deep mutation: when updating a struct, automatically detects sub-structs and mutates them, and invokes `.mut` on any object that implements this method.

* Uses regular JS fields. Does not use getters / setters, proxies, private fields, non-enumerable fields, symbols, or anything else "strange". Declared fields are simply assigned via `=`.

Performance characteristics:

* The cost of instantiating or mutating depends only on declared fields, not on provided fields.

* When the number of declared fields is similar to the number of provided fields, this tends to be slightly slower than `Object.assign` or [#`assign`](#function-assign).

* When the number of declared fields is significantly smaller than the number of provided fields, this tends to be faster than the aforementioned assignment functions.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obj.mjs'

class Person extends o.Struct {
  static spec = {
    id: l.reqFin,
    name: l.reqStr,
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

// Ignores undeclared fields.
new Person({id: 10, name: `Mira`, slug: `mira`, gender: `female`})
/* Person { id: 10, name: "Mira" } */
```

### `function MixStructLax`

Links: [source](../obj.mjs#L207); [test/example](../test/obj_test.mjs#L307).

Mixin for classes representing a "struct" / "model" / "record". Similar to [#`MixStruct`](#function-mixstruct), with additional support for undeclared fields.

Differences from [#`MixStruct`](#function-mixstruct):

* When instantiating via `new` or mutating via `structMut`, in addition to assigning and validating all declared fields, this also copies any undeclared fields present in the source data.

  * Behaves similarly to [#`patch`](#function-patch), and differently from `Object.assign` or [#`assign`](#function-assign). Avoids accidentally shadowing inherited or non-enumerable fields.

  * Just like for declared fields, supports deep mutation for undeclared fields.

* Has slightly worse performance.

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/lang.mjs'
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obj.mjs'

class Person extends o.StructLax {
  static spec = {
    id: l.reqFin,
    name: l.reqStr,
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

// Assigns undeclared fields in addition to declared fields.
new Person({id: 10, name: `Mira`, slug: `mira`, gender: `female`})
/* Person { id: 10, name: "Mira", slug: "mira", gender: "female" } */
```

### Undocumented

The following APIs are exported but undocumented. Check [obj.mjs](../obj.mjs).

  * [`function isObjKey`](../obj.mjs#L3)
  * [`function reqObjKey`](../obj.mjs#L4)
  * [`function isMut`](../obj.mjs#L6)
  * [`function reqMut`](../obj.mjs#L7)
  * [`function pub`](../obj.mjs#L27)
  * [`function priv`](../obj.mjs#L37)
  * [`function final`](../obj.mjs#L47)
  * [`function getter`](../obj.mjs#L57)
  * [`function setter`](../obj.mjs#L59)
  * [`function getSet`](../obj.mjs#L61)
  * [`class DynVar`](../obj.mjs#L79)
  * [`class TypedDynVar`](../obj.mjs#L97)
  * [`class Cache`](../obj.mjs#L102)
  * [`class WeakCache`](../obj.mjs#L120)
  * [`class Mixin`](../obj.mjs#L122)
  * [`class MemGet`](../obj.mjs#L149)
  * [`const MAIN`](../obj.mjs#L153)
  * [`function MixMain`](../obj.mjs#L160)
  * [`class MixinMain`](../obj.mjs#L162)
  * [`const SPEC`](../obj.mjs#L173)
  * [`function isStruct`](../obj.mjs#L175)
  * [`function structSpec`](../obj.mjs#L181)
  * [`function structConstruct`](../obj.mjs#L188)
  * [`function structMut`](../obj.mjs#L192)
  * [`class MixinStruct`](../obj.mjs#L198)
  * [`class MixinStructLax`](../obj.mjs#L209)
  * [`function MixStructMut`](../obj.mjs#L218)
  * [`class MixinStructMut`](../obj.mjs#L220)
  * [`class StructSpec`](../obj.mjs#L228)
  * [`class StructSpecLax`](../obj.mjs#L289)
  * [`class FieldSpec`](../obj.mjs#L327)
  * [`function mutated`](../obj.mjs#L355)
  * [`function descIn`](../obj.mjs#L364)
