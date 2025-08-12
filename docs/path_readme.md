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
import * as pt from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.84/path.mjs'

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

  * [`const SEP_WINDOWS`](../path.mjs#L18)
  * [`const SEP_POSIX`](../path.mjs#L19)
  * [`const SEP_ENV`](../path.mjs#L20)
  * [`const EXT_SEP`](../path.mjs#L21)
  * [`const CWD_REL`](../path.mjs#L22)
  * [`const PAR_REL`](../path.mjs#L23)
  * [`function toPosix`](../path.mjs#L25)
  * [`function toWindows`](../path.mjs#L29)
  * [`function norm`](../path.mjs#L33)
  * [`function clean`](../path.mjs#L34)
  * [`function isRoot`](../path.mjs#L35)
  * [`function isCwdRel`](../path.mjs#L36)
  * [`function isAbs`](../path.mjs#L37)
  * [`function isRel`](../path.mjs#L38)
  * [`function isRelExplicit`](../path.mjs#L39)
  * [`function isRelImplicit`](../path.mjs#L40)
  * [`function isDirLike`](../path.mjs#L41)
  * [`function join`](../path.mjs#L42)
  * [`function isSubOf`](../path.mjs#L43)
  * [`function strictRelTo`](../path.mjs#L44)
  * [`function relTo`](../path.mjs#L45)
  * [`function dirLike`](../path.mjs#L46)
  * [`function dir`](../path.mjs#L47)
  * [`function volume`](../path.mjs#L48)
  * [`function hasVolume`](../path.mjs#L49)
  * [`function name`](../path.mjs#L50)
  * [`function ext`](../path.mjs#L51)
  * [`function hasExt`](../path.mjs#L52)
  * [`function stem`](../path.mjs#L53)
  * [`function replaceSep`](../path.mjs#L54)
  * [`class Paths`](../path.mjs#L62)
  * [`default paths`](../path.mjs#L290)
