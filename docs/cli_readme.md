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
import * as cl from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.4/cli.mjs'

const cli = cl.Flag.os()

console.log(...cli.entries())
console.log(...cli.args)
```

Console clearing:

```js
import * as cl from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.4/cli.mjs'

cl.emptty()
```

Clearing the console only once, before running your code:

```js
import 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.4/cli_emptty.mjs'
```

## API

### `class Flag`

Links: [source](../cli.mjs#L74); [test/example](../test/cli_test.mjs#L8).

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

  * [`function args`](../cli.mjs#L6)
  * [`function arg`](../cli.mjs#L11)
  * [`function consoleCols`](../cli.mjs#L13)
  * [`function emptty`](../cli.mjs#L33)
  * [`class EnvMap`](../cli.mjs#L141)
  * [`const esc`](../cli.mjs#L174)
  * [`const clearSoft`](../cli.mjs#L175)
  * [`const clearScroll`](../cli.mjs#L176)
  * [`const clearHard`](../cli.mjs#L177)
  * [`function clearSoftArr`](../cli.mjs#L184)
  * [`function clearScrollArr`](../cli.mjs#L185)
  * [`function clearHardArr`](../cli.mjs#L186)
  * [`function timed`](../cli.mjs#L188)
