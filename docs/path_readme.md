## Overview

[path.mjs](../path.mjs) provides functions for FS paths. Features:

* Various common operations such as path joining, relativity, getting dirname / filename / extension, and more.
* Only string operations, no IO.
* OS-agnostic.
  * Supports Windows volumes.
  * Always normalizes `\` to `/`.
* Tiny, no external dependencies.
* Can be customized via subclassing.

Known limitations:

* Insufficient documentation.
* Immature. Tests may be incomplete.
* Performance has not been optimized.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

Using a specific implementation:

```js
import * as pt from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.78/path.mjs'

console.log(pt.join(`one`, `two`, `three.four`))
// 'one/two/three.four'

console.log(pt.dir(`one/two/three.four`))
// 'one/two'

console.log(pt.name(`one/two/three.four`))
// 'three.four'

console.log(pt.stem(`one/two/three.four`))
// 'three'
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [path.mjs](../path.mjs).

  * [`const FS_SEP_WINDOWS`](../path.mjs#L18)
  * [`const FS_SEP_POSIX`](../path.mjs#L19)
  * [`function toPosix`](../path.mjs#L21)
  * [`function toWindows`](../path.mjs#L25)
  * [`function norm`](../path.mjs#L29)
  * [`function clean`](../path.mjs#L30)
  * [`function isRoot`](../path.mjs#L31)
  * [`function isCwdRel`](../path.mjs#L32)
  * [`function isAbs`](../path.mjs#L33)
  * [`function isRel`](../path.mjs#L34)
  * [`function isRelExplicit`](../path.mjs#L35)
  * [`function isRelImplicit`](../path.mjs#L36)
  * [`function isDirLike`](../path.mjs#L37)
  * [`function join`](../path.mjs#L38)
  * [`function isSubOf`](../path.mjs#L39)
  * [`function strictRelTo`](../path.mjs#L40)
  * [`function relTo`](../path.mjs#L41)
  * [`function dirLike`](../path.mjs#L42)
  * [`function dir`](../path.mjs#L43)
  * [`function volume`](../path.mjs#L44)
  * [`function hasVolume`](../path.mjs#L45)
  * [`function name`](../path.mjs#L46)
  * [`function ext`](../path.mjs#L47)
  * [`function hasExt`](../path.mjs#L48)
  * [`function stem`](../path.mjs#L49)
  * [`function replaceSep`](../path.mjs#L50)
  * [`class Paths`](../path.mjs#L58)
  * [`default paths`](../path.mjs#L290)
