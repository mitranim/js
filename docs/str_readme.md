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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.38/str.mjs'

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
  * [`function regTest`](../str.mjs#L270)
  * [`function boolOpt`](../str.mjs#L275)
  * [`function bool`](../str.mjs#L282)
  * [`function finOpt`](../str.mjs#L284)
  * [`function fin`](../str.mjs#L289)
  * [`function intOpt`](../str.mjs#L291)
  * [`function int`](../str.mjs#L296)
  * [`function natOpt`](../str.mjs#L298)
  * [`function nat`](../str.mjs#L303)
  * [`function inter`](../str.mjs#L305)
  * [`function maybeInter`](../str.mjs#L315)
  * [`function stripPre`](../str.mjs#L326)
  * [`function stripSuf`](../str.mjs#L334)
  * [`function optPre`](../str.mjs#L341)
  * [`function optSuf`](../str.mjs#L347)
  * [`function maybePre`](../str.mjs#L353)
  * [`function maybeSuf`](../str.mjs#L359)
  * [`function split`](../str.mjs#L365)
  * [`function splitMap`](../str.mjs#L370)
  * [`function lines`](../str.mjs#L393)
  * [`function trimLines`](../str.mjs#L394)
  * [`function joinBy`](../str.mjs#L396)
  * [`function joinOptBy`](../str.mjs#L406)
  * [`function join`](../str.mjs#L416)
  * [`function joinLax`](../str.mjs#L417)
  * [`function joinOpt`](../str.mjs#L418)
  * [`function joinOptLax`](../str.mjs#L419)
  * [`function joinLines`](../str.mjs#L421)
  * [`function joinLinesLax`](../str.mjs#L422)
  * [`function joinLinesOpt`](../str.mjs#L423)
  * [`function joinLinesOptLax`](../str.mjs#L424)
  * [`function spaced`](../str.mjs#L426)
  * [`function dashed`](../str.mjs#L427)
  * [`function isSubpath`](../str.mjs#L430)
  * [`function rndHex`](../str.mjs#L440)
  * [`function arrHex`](../str.mjs#L446)
  * [`function uuid`](../str.mjs#L458)
  * [`function uuidArr`](../str.mjs#L461)
  * [`function draftParse`](../str.mjs#L475)
  * [`function draftRender`](../str.mjs#L476)
  * [`function draftRenderAsync`](../str.mjs#L477)
  * [`class Draft`](../str.mjs#L488)
  * [`function isRen`](../str.mjs#L518)
  * [`class Embed`](../str.mjs#L521)
  * [`function str`](../str.mjs#L544)
  * [`function strLax`](../str.mjs#L550)
  * [`function strConcat`](../str.mjs#L556)
  * [`function strConcatLax`](../str.mjs#L560)
  * [`function san`](../str.mjs#L568)
  * [`function sanLax`](../str.mjs#L570)
  * [`function interpolate`](../str.mjs#L573)
  * [`class Str`](../str.mjs#L592)
