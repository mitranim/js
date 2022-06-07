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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.27/str.mjs'

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

  * [`const RE_WORD`](../str.mjs#L6)
  * [`const RE_EMBED`](../str.mjs#L7)
  * [`function isBlank`](../str.mjs#L9)
  * [`function isAscii`](../str.mjs#L11)
  * [`function isAsciiPrint`](../str.mjs#L13)
  * [`function isNarrow`](../str.mjs#L15)
  * [`function isUni`](../str.mjs#L21)
  * [`function isEveryCharCode`](../str.mjs#L23)
  * [`function isCodeAscii`](../str.mjs#L32)
  * [`function isCodeAsciiPrint`](../str.mjs#L36)
  * [`function lenStr`](../str.mjs#L40)
  * [`function lenUni`](../str.mjs#L42)
  * [`function ell`](../str.mjs#L49)
  * [`function trunc`](../str.mjs#L51)
  * [`function trim`](../str.mjs#L73)
  * [`function words`](../str.mjs#L75)
  * [`class Words`](../str.mjs#L84)
  * [`function lower`](../str.mjs#L145)
  * [`function upper`](../str.mjs#L146)
  * [`function title`](../str.mjs#L149)
  * [`function strMap`](../str.mjs#L155)
  * [`class StrMap`](../str.mjs#L168)
  * [`function regTest`](../str.mjs#L261)
  * [`function boolOpt`](../str.mjs#L266)
  * [`function bool`](../str.mjs#L273)
  * [`function finOpt`](../str.mjs#L275)
  * [`function fin`](../str.mjs#L280)
  * [`function intOpt`](../str.mjs#L282)
  * [`function int`](../str.mjs#L287)
  * [`function natOpt`](../str.mjs#L289)
  * [`function nat`](../str.mjs#L294)
  * [`function inter`](../str.mjs#L296)
  * [`function maybeInter`](../str.mjs#L306)
  * [`function stripPre`](../str.mjs#L317)
  * [`function stripSuf`](../str.mjs#L325)
  * [`function optPre`](../str.mjs#L332)
  * [`function optSuf`](../str.mjs#L338)
  * [`function maybePre`](../str.mjs#L344)
  * [`function maybeSuf`](../str.mjs#L350)
  * [`function split`](../str.mjs#L356)
  * [`function splitMap`](../str.mjs#L361)
  * [`function lines`](../str.mjs#L384)
  * [`function trimLines`](../str.mjs#L385)
  * [`function joinBy`](../str.mjs#L387)
  * [`function joinOptBy`](../str.mjs#L397)
  * [`function join`](../str.mjs#L407)
  * [`function joinLax`](../str.mjs#L408)
  * [`function joinOpt`](../str.mjs#L409)
  * [`function joinOptLax`](../str.mjs#L410)
  * [`function joinLines`](../str.mjs#L412)
  * [`function joinLinesLax`](../str.mjs#L413)
  * [`function joinLinesOpt`](../str.mjs#L414)
  * [`function joinLinesOptLax`](../str.mjs#L415)
  * [`function spaced`](../str.mjs#L417)
  * [`function dashed`](../str.mjs#L418)
  * [`function isSubpath`](../str.mjs#L421)
  * [`function rndHex`](../str.mjs#L431)
  * [`function arrHex`](../str.mjs#L437)
  * [`function uuid`](../str.mjs#L449)
  * [`function uuidArr`](../str.mjs#L452)
  * [`function draftParse`](../str.mjs#L466)
  * [`function draftRender`](../str.mjs#L467)
  * [`function draftRenderAsync`](../str.mjs#L468)
  * [`class Draft`](../str.mjs#L479)
  * [`function isRen`](../str.mjs#L509)
  * [`class Embed`](../str.mjs#L512)
  * [`function str`](../str.mjs#L535)
  * [`function strLax`](../str.mjs#L541)
  * [`function strConcat`](../str.mjs#L547)
  * [`function strConcatLax`](../str.mjs#L551)
  * [`function san`](../str.mjs#L559)
  * [`function sanLax`](../str.mjs#L561)
  * [`function interpolate`](../str.mjs#L564)
