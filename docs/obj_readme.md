## Overview

[obj.mjs](../obj.mjs) provides tools for manipulating JS objects and plain dicts.

Port and rework of https://github.com/mitranim/fpx.

## TOC

  * [#`function fixProto`](#function-fixproto)
  * [#`function assign`](#function-assign)
  * [#`function patch`](#function-patch)
  * [#`function mapDict`](#function-mapdict)
  * [#`function pick`](#function-pick)
  * [#`function omit`](#function-omit)
  * [#`function pickKeys`](#function-pickkeys)
  * [#`function omitKeys`](#function-omitkeys)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as o from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/obj.mjs'
```

## API

### `function fixProto`

Links: [source](../obj.mjs#L4); [test/example](../test/obj_test.mjs#L34).

Workaround for subclass bugs in some engines.

In some Safari versions, when instantiating a subclass of various recent
built-in classes such as `Request`/`Response`/`URL`, the engine incorrectly
uses the prototype of the superclass rather than the subclass. Occurs in Safari
12-14, both desktop and mobile. This seems to fix that. Example:

```js
class Abort extends AbortController {
  constructor() {
    super()
    o.fixProto(this, new.target)
  }
}
```

The following version is shorter but more confusing if you don't know full semantics of JS classes:

```js
class Abort extends AbortController {
  constructor() {o.fixProto(super(), new.target)}
}
```

### `function assign`

Links: [source](../obj.mjs#L10); [test/example](../test/obj_test.mjs#L50).

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

Links: [source](../obj.mjs#L16); [test/example](../test/obj_test.mjs#L159).

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

### `function mapDict`

Links: [source](../obj.mjs#L24); [test/example](../test/obj_test.mjs#L322).

Signature: `({[Key: A]}, A => B) => {[Key: B]}`.

Similar to [`map`](iter_readme.md#function-map) but for dicts. Creates a version of the given dict where values have been replaced by calling the given function for each value. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### `function pick`

Links: [source](../obj.mjs#L31); [test/example](../test/obj_test.mjs#L337).

Signature: `({[Key: A]}, A => bool) => {[Key: A]}`.

Similar to [`filter`](iter_readme.md#function-filter) but for dicts. Returns a version of the given dict with only the properties for which `fun` returned something truthy. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### `function omit`

Links: [source](../obj.mjs#L41); [test/example](../test/obj_test.mjs#L347).

Signature: `({[Key: A]}, A => bool) => {[Key: A]}`.

Similar to [`reject`](iter_readme.md#function-reject) but for dicts. Returns a version of the given dict without properties for which `fun` returned something truthy. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### `function pickKeys`

Links: [source](../obj.mjs#L43); [test/example](../test/obj_test.mjs#L357).

Signature: `({[Key: A]}, keys) => {[Key: A]}`.

Returns a version of the given dict, keeping only the given properties. Keys can be either a `Set` or an arbitrary [sequence](iter_readme.md#function-arr). Each key must satisfy [`isKey`](lang_readme.md#function-iskey). Existence is not required: missing properties are silently ignored. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### `function omitKeys`

Links: [source](../obj.mjs#L50); [test/example](../test/obj_test.mjs#L375).

Signature: `({[Key: A]}, keys) => {[Key: A]}`.

Returns a version of the given dict without the given properties. Keys must be an arbitrary sequence convertible to a `Set`. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### Undocumented

The following APIs are exported but undocumented. Check [obj.mjs](../obj.mjs).

  * [`class StrictPh`](../obj.mjs#L76)
  * [`function strict`](../obj.mjs#L98)
  * [`class Strict`](../obj.mjs#L100)
  * [`class MemGet`](../obj.mjs#L106)
  * [`function memGet`](../obj.mjs#L110)
  * [`class MemTag`](../obj.mjs#L112)
