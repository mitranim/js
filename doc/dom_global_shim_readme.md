## Overview

{{codeHead}} re-exports `global` from {{featLink dom_shim}}. It's a counterpart to {{featLink dom_global_native}}. When writing code to run in both non-DOM and DOM environments, configure your bundler or importmap to import {{featLink dom_global_shim}} in non-browsers, and {{featLink dom_global_native}} in browsers.

In code intended only for non-browser environments, simply import {{featLink dom_global_shim}} instead.

## TOC

* [#Usage](#usage)
* [#API](#api)
{{toc}}

## Usage

```js
/*
Use a bundler or importmap to alias this import to one of:
  {{featUrl dom_global_native}}
  {{featUrl dom_global_shim}}
*/
import * as dg from 'dom_global'

console.log(dg.global)
```

## API

{{api}}
