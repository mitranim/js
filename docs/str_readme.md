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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.77/str.mjs'

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
  * [`function isAscii`](../str.mjs#L8)
  * [`function isAsciiPrint`](../str.mjs#L9)
  * [`function isNarrow`](../str.mjs#L11)
  * [`function isUni`](../str.mjs#L17)
  * [`function isEveryCharCode`](../str.mjs#L19)
  * [`function isCodeAscii`](../str.mjs#L28)
  * [`function isCodeAsciiPrint`](../str.mjs#L32)
  * [`function lenStr`](../str.mjs#L36)
  * [`function lenUni`](../str.mjs#L38)
  * [`function ell`](../str.mjs#L45)
  * [`function trunc`](../str.mjs#L47)
  * [`function trim`](../str.mjs#L69)
  * [`function words`](../str.mjs#L71)
  * [`class Words`](../str.mjs#L80)
  * [`function lower`](../str.mjs#L141)
  * [`function upper`](../str.mjs#L142)
  * [`function title`](../str.mjs#L150)
  * [`function strMap`](../str.mjs#L156)
  * [`class StrMap`](../str.mjs#L169)
  * [`function regTest`](../str.mjs#L264)
  * [`function regEsc`](../str.mjs#L270)
  * [`function boolOpt`](../str.mjs#L274)
  * [`function bool`](../str.mjs#L281)
  * [`function finOpt`](../str.mjs#L283)
  * [`function fin`](../str.mjs#L288)
  * [`function intOpt`](../str.mjs#L290)
  * [`function int`](../str.mjs#L295)
  * [`function natOpt`](../str.mjs#L297)
  * [`function nat`](../str.mjs#L302)
  * [`function inter`](../str.mjs#L304)
  * [`function maybeInter`](../str.mjs#L314)
  * [`function stripPre`](../str.mjs#L324)
  * [`function stripPreAll`](../str.mjs#L331)
  * [`function stripSuf`](../str.mjs#L336)
  * [`function stripSufAll`](../str.mjs#L343)
  * [`function optPre`](../str.mjs#L348)
  * [`function optSuf`](../str.mjs#L354)
  * [`function maybePre`](../str.mjs#L360)
  * [`function maybeSuf`](../str.mjs#L366)
  * [`function split`](../str.mjs#L372)
  * [`function splitMap`](../str.mjs#L377)
  * [`function lines`](../str.mjs#L400)
  * [`function trimLines`](../str.mjs#L401)
  * [`function joinBy`](../str.mjs#L403)
  * [`function joinOptBy`](../str.mjs#L413)
  * [`function join`](../str.mjs#L423)
  * [`function joinLax`](../str.mjs#L424)
  * [`function joinOpt`](../str.mjs#L425)
  * [`function joinOptLax`](../str.mjs#L426)
  * [`function joinLines`](../str.mjs#L428)
  * [`function joinLinesLax`](../str.mjs#L429)
  * [`function joinLinesOpt`](../str.mjs#L430)
  * [`function joinLinesOptLax`](../str.mjs#L431)
  * [`function spaced`](../str.mjs#L435)
  * [`function dashed`](../str.mjs#L437)
  * [`function rndHex`](../str.mjs#L439)
  * [`function arrHex`](../str.mjs#L444)
  * [`function uuid`](../str.mjs#L458)
  * [`function uuidArr`](../str.mjs#L466)
  * [`function draftParse`](../str.mjs#L480)
  * [`function draftRender`](../str.mjs#L481)
  * [`function draftRenderAsync`](../str.mjs#L482)
  * [`class Draft`](../str.mjs#L497)
  * [`function isRen`](../str.mjs#L527)
  * [`class Embed`](../str.mjs#L530)
  * [`function str`](../str.mjs#L553)
  * [`function strLax`](../str.mjs#L559)
  * [`function strConcat`](../str.mjs#L565)
  * [`function strConcatLax`](../str.mjs#L569)
  * [`function san`](../str.mjs#L577)
  * [`function sanLax`](../str.mjs#L579)
  * [`function interpolate`](../str.mjs#L582)
  * [`class Str`](../str.mjs#L601)
  * [`function replaceAll`](../str.mjs#L611)
  * [`function commonPrefixLen`](../str.mjs#L631)
  * [`function commonPrefix`](../str.mjs#L643)
