## Overview

{{codeHead}} provides essential tools for JS CLI apps. Features:

  * Platform-agnostic OS args.
    * Works in Deno.
    * Works in Node.
    * Always empty in browsers.
  * Platform-agnostic console clearing.
  * Parsing of CLI flags.
  * Tiny, no external dependencies.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#API](#api)
{{toc}}

## Usage

CLI args:

```js
import * as cl from '{{featUrl cli}}'

const cli = cl.Flag.os()

console.log(...cli.entries())
console.log(...cli.args)
```

Console clearing:

```js
import * as cl from '{{featUrl cli}}'

cl.emptty()
```

Clearing the console only once, before running your code:

```js
import '{{url}}/cli_emptty.mjs'
```

## API

{{api}}
