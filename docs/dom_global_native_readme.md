## Overview

[dom_global_native.mjs](../dom_global_native.mjs) simply exports `global = globalThis`. It's a counterpart to [`dom_global_shim`](dom_global_shim_readme.md). When writing code to run in both non-DOM and DOM environments, configure your bundler or importmap to import [`dom_global_shim`](dom_global_shim_readme.md) in non-browsers, and [`dom_global_native`](dom_global_native_readme.md) in browsers.

In code intended only for browsers, simply use DOM globals. In code intended only for Deno or Node, simply import [`dom_global_shim`](dom_global_shim_readme.md).

## TOC

* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

```js
/*
Use a bundler or importmap to alias this import to one of:
  https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.56/dom_global_native.mjs
  https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.56/dom_global_shim.mjs
*/
import * as dg from 'dom_global'

console.log(dg.global)
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [dom_global_native.mjs](../dom_global_native.mjs).

  * [`const global`](../dom_global_native.mjs#L6)
