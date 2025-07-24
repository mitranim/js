## Overview

[dom_global_native.mjs](../dom_global_native.mjs) simply exports `global = globalThis`. This is a counterpart to [`dom_global_shim`](dom_global_shim_readme.md).

When writing code which should isomorphically run in both DOM and non-DOM environments, import the pseudo-module `dom_global`, which should be auto-resolved to [`dom_global_native`](dom_global_native_readme.md) in browsers, and to [`dom_global_shim`](dom_global_shim_readme.md) in non-browsers.

## TOC

* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as dg from '@mitranim/js/dom_global'
console.log(dg.global)
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [dom_global_native.mjs](../dom_global_native.mjs).

  * [`const global`](../dom_global_native.mjs#L6)
