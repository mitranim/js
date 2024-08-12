## Overview

{{codeHead}} simply exports `global = globalThis`. It's a counterpart to {{featLink dom_global_shim}}. When writing code to run in both non-DOM and DOM environments, configure your bundler or importmap to import {{featLink dom_global_shim}} in non-browsers, and {{featLink dom_global_native}} in browsers.

In code intended only for browsers, simply use DOM globals. In code intended only for Deno or Node, simply import {{featLink dom_global_shim}}.

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
