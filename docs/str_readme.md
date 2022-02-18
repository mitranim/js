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
import * as s from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/str.mjs'

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
  * [`function regTest`](../str.mjs#L252)
  * [`function boolOpt`](../str.mjs#L257)
  * [`function bool`](../str.mjs#L264)
  * [`function finOpt`](../str.mjs#L266)
  * [`function fin`](../str.mjs#L271)
  * [`function intOpt`](../str.mjs#L273)
  * [`function int`](../str.mjs#L278)
  * [`function natOpt`](../str.mjs#L280)
  * [`function nat`](../str.mjs#L285)
  * [`function inter`](../str.mjs#L287)
  * [`function maybeInter`](../str.mjs#L297)
  * [`function stripPre`](../str.mjs#L307)
  * [`function stripSuf`](../str.mjs#L314)
  * [`function optPre`](../str.mjs#L321)
  * [`function optSuf`](../str.mjs#L327)
  * [`function maybePre`](../str.mjs#L333)
  * [`function maybeSuf`](../str.mjs#L339)
  * [`function split`](../str.mjs#L345)
  * [`function lines`](../str.mjs#L346)
  * [`function trimLines`](../str.mjs#L347)
  * [`function joinBy`](../str.mjs#L349)
  * [`function joinOptBy`](../str.mjs#L359)
  * [`function join`](../str.mjs#L369)
  * [`function joinLax`](../str.mjs#L370)
  * [`function joinOpt`](../str.mjs#L371)
  * [`function joinOptLax`](../str.mjs#L372)
  * [`function joinLines`](../str.mjs#L374)
  * [`function joinLinesLax`](../str.mjs#L375)
  * [`function joinLinesOpt`](../str.mjs#L376)
  * [`function joinLinesOptLax`](../str.mjs#L377)
  * [`function spaced`](../str.mjs#L379)
  * [`function dashed`](../str.mjs#L380)
  * [`function isSubpath`](../str.mjs#L382)
  * [`function rndHex`](../str.mjs#L387)
  * [`function arrHex`](../str.mjs#L393)
  * [`function uuid`](../str.mjs#L401)
  * [`function uuidArr`](../str.mjs#L404)
  * [`function draftParse`](../str.mjs#L418)
  * [`function draftRender`](../str.mjs#L419)
  * [`function draftRenderAsync`](../str.mjs#L420)
  * [`class Draft`](../str.mjs#L431)
  * [`function isRen`](../str.mjs#L480)
  * [`class Embed`](../str.mjs#L483)
  * [`function str`](../str.mjs#L507)
  * [`function strConcat`](../str.mjs#L513)
  * [`function strLax`](../str.mjs#L517)
  * [`function strConcatLax`](../str.mjs#L523)
  * [`function san`](../str.mjs#L528)
  * [`function sanLax`](../str.mjs#L530)
  * [`function interpolate`](../str.mjs#L533)
