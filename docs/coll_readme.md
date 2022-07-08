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
import * as co from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/coll.mjs'
```

## API

### `function bset`

Links: [source](../coll.mjs#L3); [test/example](../test/coll_test.mjs#L24).

Same as `new` [#`Bset`](#class-bset) but syntactically shorter and a function.

### `function bsetOf`

Links: [source](../coll.mjs#L4); [test/example](../test/coll_test.mjs#L29).

Same as [#`Bset`](#class-bset) `.of` but syntactically shorter and a function. The following is equivalent:

```js
co.bsetOf(10, 20, 30)
co.Bset.of(10, 20, 30)
new co.Bset([10, 20, 30])
new co.Bset().add(10).add(20).add(30)
```

### `class Bset`

Links: [source](../coll.mjs#L6); [test/example](../test/coll_test.mjs#L35).

Short for "better set". Variant of built-in `Set` with additional common-sense behaviors:

  * Supports JSON encoding, behaving like an array.
  * Supports adding other collections at any time by calling `.mut`, not just in the constructor.
  * Has additional instantiation shortcuts such as static `.of`.

### `function bmap`

Links: [source](../coll.mjs#L35); [test/example](../test/coll_test.mjs#L88).

Same as `new` [#`Bmap`](#class-bmap) but syntactically shorter and a function.

### `function bmapOf`

Links: [source](../coll.mjs#L36); [test/example](../test/coll_test.mjs#L93).

Same as [#`Bmap`](#class-bmap) `.of` but syntactically shorter and a function. The following is equivalent:

```js
co.bmapOf(10, 20, 30, 40)
co.Bmap.of(10, 20, 30, 40)
new co.Bmap([[10, 20], [30, 40]])
new co.Bmap().set(10, 20).set(30, 40)
```

### `class Bmap`

Links: [source](../coll.mjs#L38); [test/example](../test/coll_test.mjs#L184).

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

Links: [source](../coll.mjs#L81); [test/example](../test/coll_test.mjs#L186).

Variant of [#`Bmap`](#class-bmap) with support for key and value checks. Subclasses must override methods `.key` and `.val`. These methods are automatically called by `.set`. Method `.key` must validate and return the given key, and method `.val` must validate and return the given value. Use type assertions provided by [`lang`](lang_readme.md).

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/lang.mjs'
import * as co from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/coll.mjs'

class StrNatMap extends co.TypedMap {
  key(key) {return l.reqStr(key)}
  val(val) {return l.reqNat(val)}
}
```

### `function pkOpt`

Links: [source](../coll.mjs#L103); [test/example](../test/coll_test.mjs#L224).

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

console.log(co.pkOpt(new Person({name: `Kara`})))
// 'Kara'
```

### `function pk`

Links: [source](../coll.mjs#L106); [test/example](../test/coll_test.mjs#L241).

Short for "primary key". Similar to [#`pkOpt`](#function-pkopt), but the input _must_ produce a non-nil primary key, otherwise this panics. This is used internally by [#`Coll`](#class-coll) and [#`ClsColl`](#class-clscoll).

```js
co.pk({})
// Uncaught TypeError: unable to get primary key of {}

class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

co.pk(new Person({name: `Mira`}))
// 'Mira'
```

### `class Coll`

Links: [source](../coll.mjs#L113); [test/example](../test/coll_test.mjs#L253).

Short for "collection". Ordered map where values are indexed on their "primary key" determined by the function [#`pk`](#function-pk) which is also exported by this module. Unlike a normal JS map, this is considered a sequence of values, not a sequence of key-value pairs. Order is preserved, iterating the values is decently fast, and the index allows fast access by key without additional iteration.

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

const coll = new co.Coll()
  .add(new Person({name: `Mira`}))
  .add(new Person({name: `Kara`}))

console.log(coll)

/*
Coll {
  "Mira" => Person { name: "Mira" },
  "Kara" => Person { name: "Kara" },
}
*/
```

### `class ClsColl`

Links: [source](../coll.mjs#L137); [test/example](../test/coll_test.mjs#L293).

Variant of [#`Coll`](#class-coll) where values must belong to a specific class, determined by its getter `cls`. The default element class is `Object`. Override it when subclassing. Elements added with `.add` are idempotently instantiated.

Also see [#`ClsVec`](#class-clsvec).

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

class Persons extends co.ClsColl {
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

Links: [source](../coll.mjs#L145); [test/example](../test/coll_test.mjs#L302).

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
    * `Vec` always uses a [true](lang_readme.md#function-istruearr), avoiding this problem.

The overhead of the wrapper is insignificant.

### `class ClsVec`

Links: [source](../coll.mjs#L174); [test/example](../test/coll_test.mjs#L427).

Variant of [#`Vec`](#class-vec) where values must belong to a specific class, determined by its getter `cls`. The default element class is `Object`. Override it when subclassing `ClsVec`. Elements added with `.add` are idempotently instantiated.

Also see [#`ClsColl`](#class-clscoll).

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

class Persons extends co.ClsVec {
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

  * [`class ClsSet`](../coll.mjs#L29)
  * [`class CompatMap`](../coll.mjs#L91)
  * [`class ClsMap`](../coll.mjs#L96)
  * [`function pkOf`](../coll.mjs#L108)
  * [`class Que`](../coll.mjs#L181)
