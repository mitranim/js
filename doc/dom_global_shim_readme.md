## Overview

{{codeHead}} re-exports `global` from {{featLink dom_shim}}. This is a counterpart to {{featLink dom_global_native}}.

When writing code which should isomorphically run in both DOM and non-DOM environments, import the pseudo-module `dom_global`, which should be auto-resolved to {{featLink dom_global_native}} in browsers, and to {{featLink dom_global_shim}} in non-browsers.

In code intended only for non-browser environments, simply import {{featLink dom_global_shim}} instead.

## TOC

* [#Usage](#usage)
* [#API](#api)
{{toc}}

## Usage

```js
import * as dg from '@mitranim/js/dom_global'
console.log(dg.global)
```

## API

{{api}}
