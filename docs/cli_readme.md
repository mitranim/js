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
import * as cl from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.2/cli.mjs'

const cli = cl.Flag.os()

console.log(...cli.entries())
console.log(...cli.args)
```

Console clearing:

```js
import * as cl from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.2/cli.mjs'

cl.emptty()
```

Clearing the console only once, before running your code:

```js
import 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.2/cli_emptty.mjs'
```

## API

### `class Flag`

Links: [source](../cli.mjs#L73); [test/example](../test/cli_test.mjs#L7).

Parser for CLI args. Features:

  * Supports flags prefixed with `-`, `--`.
  * Supports `=` pairs.
  * Separates flags from unflagged args.
  * Parses flags into a map.
  * Stores remaining args as an array.
  * On-demand parsing of booleans and numbers.

```js
const cli = cl.Flag.os()
const args = cli.args
const watch = cli.boolOpt(`w`)
```

### Undocumented

The following APIs are exported but undocumented. Check [cli.mjs](../cli.mjs).

  * [`function args`](../cli.mjs#L5)
  * [`function arg`](../cli.mjs#L10)
  * [`function consoleCols`](../cli.mjs#L12)
  * [`function emptty`](../cli.mjs#L32)
  * [`const esc`](../cli.mjs#L138)
  * [`const clearSoft`](../cli.mjs#L139)
  * [`const clearScroll`](../cli.mjs#L140)
  * [`const clearHard`](../cli.mjs#L141)
  * [`function clearSoftArr`](../cli.mjs#L148)
  * [`function clearScrollArr`](../cli.mjs#L149)
  * [`function clearHardArr`](../cli.mjs#L150)
  * [`function timed`](../cli.mjs#L152)
