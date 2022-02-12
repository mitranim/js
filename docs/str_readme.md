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
import * as s from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.0/str.mjs'

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

  * [`const RE_WORD`](../str.mjs#L3)
  * [`const RE_EMBED`](../str.mjs#L4)
  * [`function isBlank`](../str.mjs#L6)
  * [`function isAscii`](../str.mjs#L8)
  * [`function isNarrow`](../str.mjs#L15)
  * [`function isUni`](../str.mjs#L21)
  * [`function lenStr`](../str.mjs#L23)
  * [`function lenUni`](../str.mjs#L25)
  * [`function ell`](../str.mjs#L32)
  * [`function trunc`](../str.mjs#L34)
  * [`function trim`](../str.mjs#L56)
  * [`function words`](../str.mjs#L58)
  * [`class Words`](../str.mjs#L67)
  * [`function lower`](../str.mjs#L134)
  * [`function upper`](../str.mjs#L135)
  * [`function title`](../str.mjs#L138)
  * [`function strMap`](../str.mjs#L144)
  * [`class StrMap`](../str.mjs#L157)
  * [`function regTest`](../str.mjs#L256)
  * [`function boolOpt`](../str.mjs#L261)
  * [`function bool`](../str.mjs#L268)
  * [`function finOpt`](../str.mjs#L270)
  * [`function fin`](../str.mjs#L275)
  * [`function intOpt`](../str.mjs#L277)
  * [`function int`](../str.mjs#L282)
  * [`function natOpt`](../str.mjs#L284)
  * [`function nat`](../str.mjs#L289)
  * [`function inter`](../str.mjs#L291)
  * [`function maybeInter`](../str.mjs#L301)
  * [`function stripPre`](../str.mjs#L311)
  * [`function stripSuf`](../str.mjs#L318)
  * [`function optPre`](../str.mjs#L325)
  * [`function optSuf`](../str.mjs#L331)
  * [`function maybePre`](../str.mjs#L337)
  * [`function maybeSuf`](../str.mjs#L343)
  * [`function split`](../str.mjs#L349)
  * [`function lines`](../str.mjs#L350)
  * [`function trimLines`](../str.mjs#L351)
  * [`function joinBy`](../str.mjs#L353)
  * [`function joinOptBy`](../str.mjs#L363)
  * [`function join`](../str.mjs#L373)
  * [`function joinLax`](../str.mjs#L374)
  * [`function joinOpt`](../str.mjs#L375)
  * [`function joinOptLax`](../str.mjs#L376)
  * [`function joinLines`](../str.mjs#L378)
  * [`function joinLinesLax`](../str.mjs#L379)
  * [`function joinLinesOpt`](../str.mjs#L380)
  * [`function joinLinesOptLax`](../str.mjs#L381)
  * [`function spaced`](../str.mjs#L383)
  * [`function isSubpath`](../str.mjs#L385)
  * [`function arrHex`](../str.mjs#L391)
  * [`function rndHex`](../str.mjs#L399)
  * [`function uuid`](../str.mjs#L404)
  * [`function uuidArr`](../str.mjs#L407)
  * [`function draftRender`](../str.mjs#L421)
  * [`function draftRenderAsync`](../str.mjs#L426)
  * [`function draftParse`](../str.mjs#L431)
  * [`class Draft`](../str.mjs#L444)
  * [`function isRen`](../str.mjs#L489)
  * [`class Embed`](../str.mjs#L492)
  * [`function str`](../str.mjs#L516)
  * [`function strConcat`](../str.mjs#L522)
  * [`function strLax`](../str.mjs#L526)
  * [`function strConcatLax`](../str.mjs#L532)
  * [`function san`](../str.mjs#L537)
  * [`function sanLax`](../str.mjs#L539)
  * [`function interpolate`](../str.mjs#L542)
