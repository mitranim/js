## Overview

[str.mjs](../str.mjs) provides tools for string manipulation. Stuff missing from JS built-ins. Some of the features:

* Unicode-aware word splitting and case conversion.
* Unicode-aware truncation and ellipsis.
* Sanity-checked parsing of booleans and numbers.
  * Unlike built-in `parseFloat` and `parseInt`, this library requires an entire string to be a valid input, without truncating the rest.

## TOC

* [#Perf](#perf)
* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Perf

Written carefully and with benchmarks, but doesn't claim to be optimal at what it does. When in doubt, measure and compare.

## Usage

Example case conversion:

```js
import * as s from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.11/str.mjs'

s.words(`oneTwoThree`).title().snake() === `One_Two_Three`

s.words(`ΕΝΑ_ΔΥΟ_ΤΡΙΑ`).lower().kebab() === `ενα-δυο-τρια`
```

## Misc

Nil tolerance rules:

  * Funs that take and return strings allow nil input.
  * Funs that answer questions about strings require strings.

## API

### Undocumented

The following APIs are exported but undocumented. Check [str.mjs](../str.mjs).

  * [`const RE_WORD`](../str.mjs#L4)
  * [`const RE_EMBED`](../str.mjs#L5)
  * [`function isBlank`](../str.mjs#L7)
  * [`function isAscii`](../str.mjs#L9)
  * [`function isAsciiPrint`](../str.mjs#L11)
  * [`function isNarrow`](../str.mjs#L13)
  * [`function isUni`](../str.mjs#L19)
  * [`function isEveryCharCode`](../str.mjs#L21)
  * [`function isCodeAscii`](../str.mjs#L30)
  * [`function isCodeAsciiPrint`](../str.mjs#L34)
  * [`function lenStr`](../str.mjs#L38)
  * [`function lenUni`](../str.mjs#L40)
  * [`function ell`](../str.mjs#L47)
  * [`function trunc`](../str.mjs#L49)
  * [`function trim`](../str.mjs#L71)
  * [`function words`](../str.mjs#L73)
  * [`class Words`](../str.mjs#L82)
  * [`function lower`](../str.mjs#L143)
  * [`function upper`](../str.mjs#L144)
  * [`function title`](../str.mjs#L147)
  * [`function strMap`](../str.mjs#L153)
  * [`class StrMap`](../str.mjs#L166)
  * [`function regTest`](../str.mjs#L259)
  * [`function boolOpt`](../str.mjs#L264)
  * [`function bool`](../str.mjs#L271)
  * [`function finOpt`](../str.mjs#L273)
  * [`function fin`](../str.mjs#L278)
  * [`function intOpt`](../str.mjs#L280)
  * [`function int`](../str.mjs#L285)
  * [`function natOpt`](../str.mjs#L287)
  * [`function nat`](../str.mjs#L292)
  * [`function inter`](../str.mjs#L294)
  * [`function maybeInter`](../str.mjs#L304)
  * [`function stripPre`](../str.mjs#L315)
  * [`function stripSuf`](../str.mjs#L323)
  * [`function optPre`](../str.mjs#L330)
  * [`function optSuf`](../str.mjs#L336)
  * [`function maybePre`](../str.mjs#L342)
  * [`function maybeSuf`](../str.mjs#L348)
  * [`function split`](../str.mjs#L354)
  * [`function splitMap`](../str.mjs#L359)
  * [`function lines`](../str.mjs#L382)
  * [`function trimLines`](../str.mjs#L383)
  * [`function joinBy`](../str.mjs#L385)
  * [`function joinOptBy`](../str.mjs#L395)
  * [`function join`](../str.mjs#L405)
  * [`function joinLax`](../str.mjs#L406)
  * [`function joinOpt`](../str.mjs#L407)
  * [`function joinOptLax`](../str.mjs#L408)
  * [`function joinLines`](../str.mjs#L410)
  * [`function joinLinesLax`](../str.mjs#L411)
  * [`function joinLinesOpt`](../str.mjs#L412)
  * [`function joinLinesOptLax`](../str.mjs#L413)
  * [`function spaced`](../str.mjs#L415)
  * [`function dashed`](../str.mjs#L416)
  * [`function isSubpath`](../str.mjs#L419)
  * [`function rndHex`](../str.mjs#L424)
  * [`function arrHex`](../str.mjs#L430)
  * [`function uuid`](../str.mjs#L442)
  * [`function uuidArr`](../str.mjs#L445)
  * [`function draftParse`](../str.mjs#L459)
  * [`function draftRender`](../str.mjs#L460)
  * [`function draftRenderAsync`](../str.mjs#L461)
  * [`class Draft`](../str.mjs#L472)
  * [`function isRen`](../str.mjs#L502)
  * [`class Embed`](../str.mjs#L505)
  * [`function str`](../str.mjs#L528)
  * [`function strLax`](../str.mjs#L534)
  * [`function strConcat`](../str.mjs#L540)
  * [`function strConcatLax`](../str.mjs#L544)
  * [`function san`](../str.mjs#L552)
  * [`function sanLax`](../str.mjs#L554)
  * [`function interpolate`](../str.mjs#L557)
