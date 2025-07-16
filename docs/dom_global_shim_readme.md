## Overview

[dom_global_shim.mjs](../dom_global_shim.mjs) re-exports `global` from [`dom_shim`](dom_shim_readme.md). It's a counterpart to [`dom_global_native`](dom_global_native_readme.md). When writing code to run in both non-DOM and DOM environments, configure your bundler or importmap to import [`dom_global_shim`](dom_global_shim_readme.md) in non-browsers, and [`dom_global_native`](dom_global_native_readme.md) in browsers.

In code intended only for non-browser environments, simply import [`dom_global_shim`](dom_global_shim_readme.md) instead.

## TOC

* [#Usage](#usage)
* [#API](#api)


## Usage

```js
/*
Use a bundler or importmap to alias this import to one of:
  https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.77/dom_global_native.mjs
  https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.77/dom_global_shim.mjs
*/
import * as dg from 'dom_global'

console.log(dg.global)
```

## API

