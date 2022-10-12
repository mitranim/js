## Overview

[coll.mjs](../coll.mjs) provides extended versions of JS data classes such as `Set` and `Map`, with better and/or additional APIs.

Port and rework of https://github.com/mitranim/jol.

## TOC

* [#Usage](#usage)
* [#API](#api)
  * [#`function bset`](#function-bset)
  * [#`function bsetOf`](#function-bsetof)
  * [#`class Bset`](#class-bset)
  * [#`function bmap`](#function-bmap)
  * [#`function bmapOf`](#function-bmapof)
  * [#`class Bmap`](#class-bmap)
  * [#`class TypedMap`](#class-typedmap)
  * [#`function pkOpt`](#function-pkopt)
  * [#`function pk`](#function-pk)
  * [#`class Coll`](#class-coll)
  * [#`class ClsColl`](#class-clscoll)
  * [#`class Vec`](#class-vec)
  * [#`class ClsVec`](#class-clsvec)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as c from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/coll.mjs'
```

## API

### `function bset`

Links: [source](../coll.mjs#L3); [test/example](../test/coll_test.mjs#L23).

Same as `new` [#`Bset`](#class-bset) but syntactically shorter and a function.

### `function bsetOf`

Links: [source](../coll.mjs#L4); [test/example](../test/coll_test.mjs#L28).

Same as [#`Bset`](#class-bset) `.of` but syntactically shorter and a function. The following is equivalent:

```js
c.bsetOf(10, 20, 30)
c.Bset.of(10, 20, 30)
new c.Bset([10, 20, 30])
new c.Bset().add(10).add(20).add(30)
```

### `class Bset`

Links: [source](../coll.mjs#L6); [test/example](../test/coll_test.mjs#L34).

Short for "better set". Variant of built-in `Set` with additional common-sense behaviors:

  * Supports JSON encoding, behaving like an array.
  * Supports adding other collections at any time by calling `.mut`, not just in the constructor.
  * Has additional instantiation shortcuts such as static `.of`.

### `function bmap`

Links: [source](../coll.mjs#L48); [test/example](../test/coll_test.mjs#L120).

Same as `new` [#`Bmap`](#class-bmap) but syntactically shorter and a function.

### `function bmapOf`

Links: [source](../coll.mjs#L49); [test/example](../test/coll_test.mjs#L125).

Same as [#`Bmap`](#class-bmap) `.of` but syntactically shorter and a function. The following is equivalent:

```js
c.bmapOf(10, 20, 30, 40)
c.Bmap.of(10, 20, 30, 40)
new c.Bmap([[10, 20], [30, 40]])
new c.Bmap().set(10, 20).set(30, 40)
```

### `class Bmap`

Links: [source](../coll.mjs#L51); [test/example](../test/coll_test.mjs#L216).

Short for "better map". Variant of built-in `Map` with additional common-sense behaviors:

  * Supports [plain_dicts](lang_readme.md#function-isdict):
    * Can be instantiated from a dict.
    * Can be patched by a dict by calling `.mut`.
    * Can be converted to a dict by calling `.toDict`.
    * Behaves like a dict in JSON.
  * Supports JSON encoding. Only entries with string keys are sent to JSON, other entries are ignored.
  * Adding entries from another collection can be done any time by calling `.mut`, not just in the constructor.
  * Has additional instantiation shortcuts such as static `.of`.

### `class TypedMap`

Links: [source](../coll.mjs#L100); [test/example](../test/coll_test.mjs#L218).

Variant of [#`Bmap`](#class-bmap) with support for key and value checks. Subclasses must override methods `.reqKey` and `.reqVal`. These methods are automatically called by `.set`. Method `.reqKey` must validate and return the given key, and method `.reqVal` must validate and return the given value. Use type assertions provided by [`lang`](lang_readme.md).

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/lang.mjs'
import * as c from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/coll.mjs'

class StrNatMap extends c.TypedMap {
  reqKey(key) {return l.reqStr(key)}
  reqVal(val) {return l.reqNat(val)}
}
```

### `function pkOpt`

Links: [source](../coll.mjs#L122); [test/example](../test/coll_test.mjs#L256).

Short for "primary key optional". Takes an arbitrary value and returns its "primary key". This is used internally by [#`Coll`](#class-coll) and [#`ClsColl`](#class-clscoll).

Currently this uses the following interface:

```ts
interface Pkable {pk(): any}
```

Example use:

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

console.log(c.pkOpt(new Person({name: `Kara`})))
// 'Kara'
```

### `function pk`

Links: [source](../coll.mjs#L126); [test/example](../test/coll_test.mjs#L273).

Short for "primary key". Similar to [#`pkOpt`](#function-pkopt), but the input _must_ produce a non-nil primary key, otherwise this panics. This is used internally by [#`Coll`](#class-coll) and [#`ClsColl`](#class-clscoll).

```js
c.pk({})
// Uncaught TypeError: unable to get primary key of {}

class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

c.pk(new Person({name: `Mira`}))
// 'Mira'
```

### `class Coll`

Links: [source](../coll.mjs#L132); [test/example](../test/coll_test.mjs#L285).

Short for "collection". Ordered map where values are indexed on their "primary key" determined by the function [#`pk`](#function-pk) which is also exported by this module. Unlike a normal JS map, this is considered a sequence of values, not a sequence of key-value pairs. Order is preserved, iterating the values is decently fast, and the index allows fast access by key without additional iteration.

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

const coll = new c.Coll()
  .add(new Person({name: `Mira`}))
  .add(new Person({name: `Kara`}))

console.log(coll)
/*
Coll {
  "Mira" => Person { name: "Mira" },
  "Kara" => Person { name: "Kara" },
}
*/

console.log([...coll])
/*
[
  Person { name: "Mira" },
  Person { name: "Kara" },
]
*/
```

### `class ClsColl`

Links: [source](../coll.mjs#L148); [test/example](../test/coll_test.mjs#L325).

Variant of [#`Coll`](#class-coll) where values must belong to a specific class, determined by its getter `cls`. The default element class is `Object`. Override it when subclassing. Elements added with `.add` are idempotently instantiated.

Also see [#`ClsVec`](#class-clsvec).

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

class Persons extends c.ClsColl {
  get cls() {return Person}
}

const coll = new Persons()
  .add({name: `Mira`})
  .add({name: `Kara`})

console.log(coll)

/*
Persons {
  "Mira" => Person { name: "Mira" },
  "Kara" => Person { name: "Kara" },
}
*/
```

### `class Vec`

Links: [source](../coll.mjs#L157); [test/example](../test/coll_test.mjs#L334).

Short for "vector". Thin wrapper around a plain array. Features:

  * Implements the [iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
  * Compatible with spread operator `...`.
  * Compatible with `for of`.
  * JSON-encodes like an array.
  * Can wrap a pre-existing array.

Differences and advantages over `Array`:

  * Better constructor signature.
    * Constructor takes exactly one argument, which is either [nil](lang_readme.md#function-isnil) or an [array](lang_readme.md#function-istruearr).
    * For comparison, the `Array` constructor has special cases that make subclassing difficult.
  * Can be subclassed without trashing performance.
    * At the time of writing, subclasses of `Array` suffer horrible deoptimization in V8.
    * `Vec` always wraps a [true](lang_readme.md#function-istruearr), avoiding this problem.

The overhead of the wrapper is insignificant.

```js
import * as c from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.39/coll.mjs'

console.log(new c.Vec())
// Vec{$: []}

console.log(new c.Vec([10, 20, 30]))
// Vec{$: [10, 20, 30]}

console.log(c.Vec.of(10, 20, 30))
// Vec{$: [10, 20, 30]}

console.log(c.Vec.from(new Set([10, 20, 30])))
// Vec{$: [10, 20, 30]}

for (const val of c.Vec.of(10, 20, 30)) console.log(val)
// 10 20 30
```

### `class ClsVec`

Links: [source](../coll.mjs#L211); [test/example](../test/coll_test.mjs#L475).

Variant of [#`Vec`](#class-vec) where values must belong to a specific class, determined by its getter `cls`. The default element class is `Object`. Override it when subclassing `ClsVec`. Elements added with `.add` are idempotently instantiated.

Also see [#`ClsColl`](#class-clscoll).

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

class Persons extends c.ClsVec {
  get cls() {return Person}
}

const coll = new Persons()
  .add({name: `Mira`})
  .add({name: `Kara`})

console.log(coll)

/*
Persons {
  "$": [
    Person { name: "Mira" },
    Person { name: "Kara" },
  ]
}
*/
```

### Undocumented

The following APIs are exported but undocumented. Check [coll.mjs](../coll.mjs).

  * [`class TypedSet`](../coll.mjs#L37)
  * [`class ClsSet`](../coll.mjs#L42)
  * [`class CompatMap`](../coll.mjs#L110)
  * [`class ClsMap`](../coll.mjs#L115)
  * [`class TypedVec`](../coll.mjs#L187)
  * [`class Que`](../coll.mjs#L219)
