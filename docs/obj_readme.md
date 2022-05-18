## Overview

[obj.mjs](../obj.mjs) provides tools for manipulating JS objects in weird ways.

## TOC

  * [#`function assign`](#function-assign)
  * [#`function patch`](#function-patch)
  * [#`class Dict`](#class-dict)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.21/obj.mjs'
```

## API

### `function assign`

Links: [source](../obj.mjs#L6); [test/example](../test/obj_test.mjs#L45).

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

Links: [source](../obj.mjs#L12); [test/example](../test/obj_test.mjs#L154).

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

### `class Dict`

Links: [source](../obj.mjs#L28); [test/example](../test/obj_test.mjs#L199).

Short for "dictionary". Tiny superclass for "model"/"data"/"record" classes. Makes it "safe" to assign arbitrary properties from JSON or other unknown inputs, avoiding conflicts with predefined getters and methods.

Consider the following naive implementation:

```js
class Model {
  constructor(src) {this.mut(src)}
  mut(src) {return Object.assign(this, src)}
  someMethod() {}
}
```

`Object.assign` will overwrite your own methods and getters with properties from the input. A "bad" input breaks your code, possibly late in production:

```js
const ref = new Model({id: `<id>`, someMethod: `str`})
/*
Model { id: "<id>", someMethod: "str" }
*/

ref.someMethod()
// Uncaught TypeError: ref.someMethod is not a function
```

`Object.assign` will try to convert _anything_ to a bag of properties. Even a string. Under no contrived circumstance is this useful. This should be a `TypeError` exception, plain and simple:

```js
new Model(`str`)
/*
Model { "0": "s", "1": "t", "2": "r" }
*/
```

`Dict` avoids all of those issues by using [#`patch`](#function-patch) instead of `Object.assign`.

```js
/*
Let's say this was fetched from a server.
Has collisions with inherited properties and methods of our JS classes.
*/
const input = JSON.parse(`{
  "one": 10,
  "two": 20,
  "constructor": 30,
  "toString": 40,
  "someMethod": 50
}`)

class Model extends o.Dict {
  someMethod() {return `someVal`}
}

const ref = new Model(input)

/*
Non-conflicting properties were assigned.
Conflicting properties were ignored.

Model {
  one: 10,
  two: 20,
  toString: 40,
}
*/
```

In addition, it type-checks the inputs:

```js
new Model(`str`)
// Uncaught TypeError: expected variant of isStruct, got "str"
```

### Undocumented

The following APIs are exported but undocumented. Check [obj.mjs](../obj.mjs).

  * [`function isObjKey`](../obj.mjs#L3)
  * [`function reqObjKey`](../obj.mjs#L4)
  * [`function patchInstances`](../obj.mjs#L20)
  * [`class ClsDict`](../obj.mjs#L35)
  * [`class Strict`](../obj.mjs#L40)
  * [`class StrictPh`](../obj.mjs#L79)
  * [`class WeakTag`](../obj.mjs#L97)
  * [`function memGet`](../obj.mjs#L106)
  * [`class MemTag`](../obj.mjs#L108)
  * [`class MemGet`](../obj.mjs#L112)
  * [`class ClsFunPh`](../obj.mjs#L121)
  * [`class ClsInstPh`](../obj.mjs#L137)
  * [`function pub`](../obj.mjs#L152)
  * [`function priv`](../obj.mjs#L162)
