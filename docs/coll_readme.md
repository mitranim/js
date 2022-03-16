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
  * [#`function pkOpt`](#function-pkopt)
  * [#`function pk`](#function-pk)
  * [#`class Coll`](#class-coll)
  * [#`class ClsColl`](#class-clscoll)
  * [#`class Vec`](#class-vec)
  * [#`class ClsVec`](#class-clsvec)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as co from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.6/coll.mjs'
```

## API

### `function bset`

Links: [source](../coll.mjs#L3); [test/example](../test/coll_test.mjs#L21).

Same as `new` [#`Bset`](#class-bset) but syntactically shorter and a function.

### `function bsetOf`

Links: [source](../coll.mjs#L4); [test/example](../test/coll_test.mjs#L26).

Same as [#`Bset`](#class-bset) `.of` but syntactically shorter and a function. The following is equivalent:

```js
co.bsetOf(10, 20, 30)
co.Bset.of(10, 20, 30)
new co.Bset([10, 20, 30])
new co.Bset().add(10).add(20).add(30)
```

### `class Bset`

Links: [source](../coll.mjs#L6); [test/example](../test/coll_test.mjs#L32).

Short for "better set". Variant of built-in `Set` with additional common-sense behaviors:

  * Supports JSON encoding, behaving like an array.
  * Supports adding other collections at any time by calling `.mut`, not just in the constructor.
  * Has additional instantiation shortcuts such as static `.of`.

### `function bmap`

Links: [source](../coll.mjs#L37); [test/example](../test/coll_test.mjs#L85).

Same as `new` [#`Bmap`](#class-bmap) but syntactically shorter and a function.

### `function bmapOf`

Links: [source](../coll.mjs#L38); [test/example](../test/coll_test.mjs#L90).

Same as [#`Bmap`](#class-bmap) `.of` but syntactically shorter and a function. The following is equivalent:

```js
co.bmapOf(10, 20, 30, 40)
co.Bmap.of(10, 20, 30, 40)
new co.Bmap([[10, 20], [30, 40]])
new co.Bmap().set(10, 20).set(30, 40)
```

### `class Bmap`

Links: [source](../coll.mjs#L40); [test/example](../test/coll_test.mjs#L104).

Short for "better map". Variant of built-in `Map` with additional common-sense behaviors:

  * Supports [plain_dicts](lang_readme.md#function-isdict):
    * Can be instantiated from a dict.
    * Can be patched by a dict by calling `.mut`.
    * Can be converted to a dict by calling `.toDict`.
    * Behaves like a dict in JSON.
  * Supports JSON encoding. Only entries with string keys are sent to JSON, other entries are ignored.
  * Adding entries from another collection can be done any time by calling `.mut`, not just in the constructor.
  * Has additional instantiation shortcuts such as static `.of`.

### `function pkOpt`

Links: [source](../coll.mjs#L86); [test/example](../test/coll_test.mjs#L175).

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

Links: [source](../coll.mjs#L89); [test/example](../test/coll_test.mjs#L192).

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

Links: [source](../coll.mjs#L95); [test/example](../test/coll_test.mjs#L204).

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

Links: [source](../coll.mjs#L115); [test/example](../test/coll_test.mjs#L230).

Variant of [#`Coll`](#class-coll) where values must belong to a specific class, determined by its getter `cls`. The default element class is `Object`. Override it when subclassing `ClsColl`. Elements added with `.add` are idempotently instantiated.

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

Links: [source](../coll.mjs#L122); [test/example](../test/coll_test.mjs#L239).

Short for "vector". Thin wrapper around a plain array. Features:

  * Implements the [iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
  * Compatible with spread (`...` operator).
  * Compatible with `for..of`.
  * JSON-encodes like an array.
  * Can wrap a pre-existing array.

Differences and advantages over `Array`:

  * Better constructor signature.
    * Constructor takes exactly one argument, which is either [nil](lang_readme.md#function-isnil) or an [array](lang_readme.md#function-isarr).
    * For comparison, the `Array` constructor has special cases that make subclassing difficult.
  * Can be subclassed without trashing performance.
    * At the time of writing, subclasses of `Array` suffer horrible deoptimization in V8.
    * `Vec` always uses a plain array, avoiding this problem.

The overhead of the wrapper is insignificant.

### `class ClsVec`

Links: [source](../coll.mjs#L145); [test/example](../test/coll_test.mjs#L347).

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

  * [`class ClsSet`](../coll.mjs#L32)
  * [`class ClsMap`](../coll.mjs#L80)
  * [`class Que`](../coll.mjs#L158)
