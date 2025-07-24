## Overview

[dom_global_shim.mjs](../dom_global_shim.mjs) re-exports `global` from [`dom_shim`](dom_shim_readme.md). This is a counterpart to [`dom_global_native`](dom_global_native_readme.md).

When writing code which should isomorphically run in both DOM and non-DOM environments, import the pseudo-module `dom_global`, which should be auto-resolved to [`dom_global_native`](dom_global_native_readme.md) in browsers, and to [`dom_global_shim`](dom_global_shim_readme.md) in non-browsers.

In code intended only for non-browser environments, simply import [`dom_global_shim`](dom_global_shim_readme.md) instead.

## TOC

* [#Usage](#usage)
* [#API](#api)


## Usage

```js
import * as dg from '@mitranim/js/dom_global'
console.log(dg.global)
```

## API

