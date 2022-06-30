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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.34/str.mjs'

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

  * [`const RE_WORD`](../str.mjs#L10)
  * [`const RE_EMBED`](../str.mjs#L11)
  * [`function isBlank`](../str.mjs#L13)
  * [`function isAscii`](../str.mjs#L15)
  * [`function isAsciiPrint`](../str.mjs#L17)
  * [`function isNarrow`](../str.mjs#L19)
  * [`function isUni`](../str.mjs#L25)
  * [`function isEveryCharCode`](../str.mjs#L27)
  * [`function isCodeAscii`](../str.mjs#L36)
  * [`function isCodeAsciiPrint`](../str.mjs#L40)
  * [`function lenStr`](../str.mjs#L44)
  * [`function lenUni`](../str.mjs#L46)
  * [`function ell`](../str.mjs#L53)
  * [`function trunc`](../str.mjs#L55)
  * [`function trim`](../str.mjs#L77)
  * [`function words`](../str.mjs#L79)
  * [`class Words`](../str.mjs#L88)
  * [`function lower`](../str.mjs#L149)
  * [`function upper`](../str.mjs#L150)
  * [`function title`](../str.mjs#L156)
  * [`function strMap`](../str.mjs#L162)
  * [`class StrMap`](../str.mjs#L175)
  * [`function regTest`](../str.mjs#L253)
  * [`function boolOpt`](../str.mjs#L258)
  * [`function bool`](../str.mjs#L265)
  * [`function finOpt`](../str.mjs#L267)
  * [`function fin`](../str.mjs#L272)
  * [`function intOpt`](../str.mjs#L274)
  * [`function int`](../str.mjs#L279)
  * [`function natOpt`](../str.mjs#L281)
  * [`function nat`](../str.mjs#L286)
  * [`function inter`](../str.mjs#L288)
  * [`function maybeInter`](../str.mjs#L298)
  * [`function stripPre`](../str.mjs#L309)
  * [`function stripSuf`](../str.mjs#L317)
  * [`function optPre`](../str.mjs#L324)
  * [`function optSuf`](../str.mjs#L330)
  * [`function maybePre`](../str.mjs#L336)
  * [`function maybeSuf`](../str.mjs#L342)
  * [`function split`](../str.mjs#L348)
  * [`function splitMap`](../str.mjs#L353)
  * [`function lines`](../str.mjs#L376)
  * [`function trimLines`](../str.mjs#L377)
  * [`function joinBy`](../str.mjs#L379)
  * [`function joinOptBy`](../str.mjs#L389)
  * [`function join`](../str.mjs#L399)
  * [`function joinLax`](../str.mjs#L400)
  * [`function joinOpt`](../str.mjs#L401)
  * [`function joinOptLax`](../str.mjs#L402)
  * [`function joinLines`](../str.mjs#L404)
  * [`function joinLinesLax`](../str.mjs#L405)
  * [`function joinLinesOpt`](../str.mjs#L406)
  * [`function joinLinesOptLax`](../str.mjs#L407)
  * [`function spaced`](../str.mjs#L409)
  * [`function dashed`](../str.mjs#L410)
  * [`function isSubpath`](../str.mjs#L413)
  * [`function rndHex`](../str.mjs#L423)
  * [`function arrHex`](../str.mjs#L429)
  * [`function uuid`](../str.mjs#L441)
  * [`function uuidArr`](../str.mjs#L444)
  * [`function draftParse`](../str.mjs#L458)
  * [`function draftRender`](../str.mjs#L459)
  * [`function draftRenderAsync`](../str.mjs#L460)
  * [`class Draft`](../str.mjs#L471)
  * [`function isRen`](../str.mjs#L501)
  * [`class Embed`](../str.mjs#L504)
  * [`function str`](../str.mjs#L527)
  * [`function strLax`](../str.mjs#L533)
  * [`function strConcat`](../str.mjs#L539)
  * [`function strConcatLax`](../str.mjs#L543)
  * [`function san`](../str.mjs#L551)
  * [`function sanLax`](../str.mjs#L553)
  * [`function interpolate`](../str.mjs#L556)
  * [`class Str`](../str.mjs#L575)
