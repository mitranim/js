## Overview

{{codeHead}} provides functions for FS paths. Features:

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
{{toc}}

## Usage

Using a specific implementation:

```js
import * as p from '{{featUrl path}}'

console.log(p.posix.join(`one`, `two`))
// 'one/two'

console.log(p.windows.join(`one`, `two`))
// 'one\\two'
```

Using the default implementation for the current OS:

```js
import {paths as p} from '{{url}}/io_deno.mjs'

console.log(p.join(`one`, `two`))
// 'one/two' or 'one\\two' depending on your OS
```

## API

{{api}}
