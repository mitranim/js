## Overview

{{codeHead}} simply exports `global = globalThis`. This is a counterpart to {{featLink dom_global_shim}}.

When writing code which should isomorphically run in both DOM and non-DOM environments, import the pseudo-module `dom_global`, which should be auto-resolved to {{featLink dom_global_native}} in browsers, and to {{featLink dom_global_shim}} in non-browsers.

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
