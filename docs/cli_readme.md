## Overview

[cli.mjs](../cli.mjs) provides essential tools for JS CLI apps. Features:

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
  * [#`class Flag`](#class-flag)
  * [#Undocumented](#undocumented)

## Usage

CLI args:

```js
import * as cl from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.82/cli.mjs'

const cli = cl.Flag.os()

console.log(...cli.entries())
console.log(...cli.args)
```

Console clearing:

```js
import * as cl from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.82/cli.mjs'

cl.emptty()
```

Clearing the console only once, before running your code:

```js
import 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.82/cli_emptty.mjs'
```

## API

### `class Flag`

Links: [source](../cli.mjs#L80); [test/example](../test/cli_test.mjs#L7).

Parser for CLI args. Features:

  * Supports flags prefixed with `-`, `--`.
  * Supports `=` pairs.
  * Separates flags from unflagged args.
  * Parses flags into a map.
  * Stores remaining args as an array.
  * On-demand parsing of booleans and numbers.

```js
const flags = cl.Flag.os()
const args = flags.args
const watch = flags.boolOpt(`-w`)
```

### Undocumented

The following APIs are exported but undocumented. Check [cli.mjs](../cli.mjs).

  * [`function args`](../cli.mjs#L6)
  * [`function arg`](../cli.mjs#L14)
  * [`function consoleCols`](../cli.mjs#L16)
  * [`function emptty`](../cli.mjs#L39)
  * [`class EnvMap`](../cli.mjs#L146)
  * [`const TERM_ESC`](../cli.mjs#L180)
  * [`const TERM_ESC_CSI`](../cli.mjs#L183)
  * [`const TERM_ESC_CUP`](../cli.mjs#L186)
  * [`const TERM_ESC_ERASE2`](../cli.mjs#L190)
  * [`const TERM_ESC_ERASE3`](../cli.mjs#L194)
  * [`const TERM_ESC_RESET`](../cli.mjs#L198)
  * [`const TERM_ESC_CLEAR_SOFT`](../cli.mjs#L202)
  * [`const TERM_ESC_CLEAR_HARD`](../cli.mjs#L205)
  * [`function arrClearSoft`](../cli.mjs#L210)
  * [`function arrClearHard`](../cli.mjs#L216)
  * [`function timed`](../cli.mjs#L221)
