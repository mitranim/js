## Overview

[coll.mjs](../coll.mjs) provides extended versions of JS data structure classes such as `Array`, `Set`, `Map`, providing better APIs or additional APIs.

This module is currently incomplete. It's being ported from `github.com/mitranim/jol`, with various changes along the way.

## TOC

* [#Usage](#usage)
* [#API](#api)
  * [#`function pkOpt`](#function-pkopt)
  * [#`function pk`](#function-pk)
  * [#`class Coll`](#class-coll)
  * [#`class ClsColl`](#class-clscoll)

## Usage

```js
import * as co from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.0/coll.mjs'
```

## API

### `function pkOpt`

Links: [source](../coll.mjs#L5); [test/example](../test/coll_test.mjs#L21).

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

Links: [source](../coll.mjs#L8); [test/example](../test/coll_test.mjs#L38).

Short for "primary key". Similar to [#`pkOpt`](#function-pkopt), but the input _must_ produce a non-nil primary key, otherwise this panics. This is used internally by [#`Coll`](#class-coll) and [#`ClsColl`](#class-clscoll).

```js
co.pk({})
// uncaught TypeError: unable to get primary key of {}

class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

co.pk(new Person({name: `Mira`}))
// 'Mira'
```

### `class Coll`

Links: [source](../coll.mjs#L14); [test/example](../test/coll_test.mjs#L50).

Short for "collection". Ordered map where values are indexed on their "primary key" determined by the function [#`pk`](#function-pk) which is also exported by this module. Unlike a normal JS map, this is considered a sequence of values, not a sequence of key-value pairs. Order is preserved, iterating the values is decently fast, and the index allows fast access by key without additional iteration.

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

const coll = new co.Coll()
  .push(new Person({name: `Mira`}))
  .push(new Person({name: `Kara`}))

console.log(coll)

/*
Coll {
  "Mira" => Person { name: "Mira" },
  "Kara" => Person { name: "Kara" },
}
*/
```

### `class ClsColl`

Links: [source](../coll.mjs#L40); [test/example](../test/coll_test.mjs#L76).

Version of [#`Coll`](#class-coll) where values must belong to a specific class, determined by its getter `cls`. The default element class is `Object`. Override it when subclassing `ClsColl`. Elements added with `.push` are idempotently instantiated.

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

class Persons extends co.ClsColl {
  get cls() {return Person}
}

const coll = new Persons()
  .push({name: `Mira`})
  .push({name: `Kara`})

console.log(coll)

/*
Persons {
  "Mira" => Person { name: "Mira" },
  "Kara" => Person { name: "Kara" },
}
*/
```
