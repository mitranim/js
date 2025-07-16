## Overview

{{codeHead}} provides functions for FS paths. Features:

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
{{toc}}

## Usage

Using a specific implementation:

```js
import * as pt from '{{featUrl path}}'

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

{{api}}
