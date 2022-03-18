## Overview

[path.mjs](../path.mjs) provides functions for FS paths. Features:

  * Various common operations such as path joining, relativity, getting dirname/filename/extension, and more.
  * Only string operations, no IO.
  * OS-unaware. Provides separate implementations for Posix and Windows.
  * Tiny, no external dependencies.

Known limitations:

  * Insufficient documentation.
  * Immature. Tests may be incomplete.
  * Performance has not been optimized.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#API](#api)
  * [#`function toPosix`](#function-toposix)
  * [#`const posix`](#const-posix)
  * [#`const windows`](#const-windows)
  * [#Undocumented](#undocumented)

## Usage

Using a specific implementation:

```js
import * as p from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.9/path.mjs'

console.log(p.posix.join(`one`, `two`))
// 'one/two'

console.log(p.windows.join(`one`, `two`))
// 'one\\two'
```

Using the default implementation for the current OS:

```js
import {paths as p} from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.9/io_deno.mjs'

console.log(p.join(`one`, `two`))
// 'one/two' or 'one\\two' depending on your OS
```

## API

### `function toPosix`

Links: [source](../path.mjs#L33); [test/example](../test/path_test.mjs#L17).

Idempotently converts a path from Windows-style to Posix-style. Useful in some edge case scenarios.

```js
import * as p from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.9/path.mjs'

console.log(p.toPosix(`one\\two\\three`))
// 'one/two/three'

console.log(p.toPosix(`one/two/three`))
// 'one/two/three'
```

### `const posix`

Links: [source](../path.mjs#L240); [test/example](../test/path_test.mjs#L47).

Implements various functions for Posix-style FS paths.

### `const windows`

Links: [source](../path.mjs#L241); [test/example](../test/path_test.mjs#L52).

Implements various functions for Windows-style FS paths.

### Undocumented

The following APIs are exported but undocumented. Check [path.mjs](../path.mjs).

  * [`const SEP_WINDOWS`](../path.mjs#L21)
  * [`const SEP_POSIX`](../path.mjs#L22)
  * [`function isPath`](../path.mjs#L29)
  * [`function reqPath`](../path.mjs#L30)
  * [`function optPath`](../path.mjs#L31)
  * [`class Paths`](../path.mjs#L50)
  * [`class PathsPosix`](../path.mjs#L211)
  * [`class PathsWindows`](../path.mjs#L222)
