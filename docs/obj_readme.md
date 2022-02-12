## Overview

[obj.mjs](../obj.mjs) provides tools for manipulating JS objects and plain dicts.

## TOC

  * [#`function fixProto`](#function-fixproto)
  * [#`function mut`](#function-mut)
  * [#`function mapDict`](#function-mapdict)
  * [#`function pick`](#function-pick)
  * [#`function omit`](#function-omit)
  * [#`function pickKeys`](#function-pickkeys)
  * [#`function omitKeys`](#function-omitkeys)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as o from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.0/obj.mjs'
```

## API

### `function fixProto`

Links: [source](../obj.mjs#L4); [test/example](../test/obj_test.mjs#L13).

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

### `function mut`

Links: [source](../obj.mjs#L12); [test/example](../test/obj_test.mjs#L33).

Signature: `(tar, src) => tar`.

Similar to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). Differences:

  * Supports only one source argument.
  * Much faster.
  * Has sanity checks:
    * Target must be a [struct](lang_readme.md#function-isstruct). Throws if target is a function or iterable.
    * Source must be nil or a struct. Throws if source is an iterable, non-nil primitive, etc.
    * Does not override inherited properties.
    * Does not override own non-enumerable properties.

The refusal to override inherited and non-enumerable properties is good for some use cases, and bad for others. This is not just a faster sanity-checking substitute for `Object.assign`. It has different behaviors. Pick the right one for your use case.

### `function mapDict`

Links: [source](../obj.mjs#L20); [test/example](../test/obj_test.mjs#L274).

Signature: `({[Key: A]}, A => B) => {[Key: B]}`.

Similar to [`map`](iter_readme.md#function-map) but for dicts. Creates a version of the given dict where values have been replaced by calling the given function for each value. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### `function pick`

Links: [source](../obj.mjs#L27); [test/example](../test/obj_test.mjs#L289).

Signature: `({[Key: A]}, A => bool) => {[Key: A]}`.

Similar to [`filter`](iter_readme.md#function-filter) but for dicts. Returns a version of the given dict with only the properties for which `fun` returned something truthy. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### `function omit`

Links: [source](../obj.mjs#L37); [test/example](../test/obj_test.mjs#L299).

Signature: `({[Key: A]}, A => bool) => {[Key: A]}`.

Similar to [`reject`](iter_readme.md#function-reject) but for dicts. Returns a version of the given dict without properties for which `fun` returned something truthy. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### `function pickKeys`

Links: [source](../obj.mjs#L39); [test/example](../test/obj_test.mjs#L309).

Signature: `({[Key: A]}, keys) => {[Key: A]}`.

Returns a version of the given dict, keeping only the given properties. Keys can be either a `Set` or an arbitrary [sequence](iter_readme.md#function-arr). Each key must satisfy [`isKey`](lang_readme.md#function-iskey). Existence is not required: missing properties are silently ignored. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### `function omitKeys`

Links: [source](../obj.mjs#L46); [test/example](../test/obj_test.mjs#L327).

Signature: `({[Key: A]}, keys) => {[Key: A]}`.

Returns a version of the given dict without the given properties. Keys must be an arbitrary sequence convertible to a `Set`. Returns an empty dict if the input is [nil](lang_readme.md#function-isnil).

### Undocumented

The following APIs are exported but undocumented. Check [obj.mjs](../obj.mjs).

  * [`class StrictPh`](../obj.mjs#L72)
  * [`const strictPh`](../obj.mjs#L92)
  * [`function strict`](../obj.mjs#L94)
  * [`class Strict`](../obj.mjs#L96)
  * [`class MemGet`](../obj.mjs#L102)
  * [`function memGet`](../obj.mjs#L109)
