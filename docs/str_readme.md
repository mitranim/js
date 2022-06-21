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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.33/str.mjs'

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
  * [`function title`](../str.mjs#L153)
  * [`function strMap`](../str.mjs#L159)
  * [`class StrMap`](../str.mjs#L172)
  * [`function regTest`](../str.mjs#L249)
  * [`function boolOpt`](../str.mjs#L254)
  * [`function bool`](../str.mjs#L261)
  * [`function finOpt`](../str.mjs#L263)
  * [`function fin`](../str.mjs#L268)
  * [`function intOpt`](../str.mjs#L270)
  * [`function int`](../str.mjs#L275)
  * [`function natOpt`](../str.mjs#L277)
  * [`function nat`](../str.mjs#L282)
  * [`function inter`](../str.mjs#L284)
  * [`function maybeInter`](../str.mjs#L294)
  * [`function stripPre`](../str.mjs#L305)
  * [`function stripSuf`](../str.mjs#L313)
  * [`function optPre`](../str.mjs#L320)
  * [`function optSuf`](../str.mjs#L326)
  * [`function maybePre`](../str.mjs#L332)
  * [`function maybeSuf`](../str.mjs#L338)
  * [`function split`](../str.mjs#L344)
  * [`function splitMap`](../str.mjs#L349)
  * [`function lines`](../str.mjs#L372)
  * [`function trimLines`](../str.mjs#L373)
  * [`function joinBy`](../str.mjs#L375)
  * [`function joinOptBy`](../str.mjs#L385)
  * [`function join`](../str.mjs#L395)
  * [`function joinLax`](../str.mjs#L396)
  * [`function joinOpt`](../str.mjs#L397)
  * [`function joinOptLax`](../str.mjs#L398)
  * [`function joinLines`](../str.mjs#L400)
  * [`function joinLinesLax`](../str.mjs#L401)
  * [`function joinLinesOpt`](../str.mjs#L402)
  * [`function joinLinesOptLax`](../str.mjs#L403)
  * [`function spaced`](../str.mjs#L405)
  * [`function dashed`](../str.mjs#L406)
  * [`function isSubpath`](../str.mjs#L409)
  * [`function rndHex`](../str.mjs#L419)
  * [`function arrHex`](../str.mjs#L425)
  * [`function uuid`](../str.mjs#L437)
  * [`function uuidArr`](../str.mjs#L440)
  * [`function draftParse`](../str.mjs#L454)
  * [`function draftRender`](../str.mjs#L455)
  * [`function draftRenderAsync`](../str.mjs#L456)
  * [`class Draft`](../str.mjs#L467)
  * [`function isRen`](../str.mjs#L497)
  * [`class Embed`](../str.mjs#L500)
  * [`function str`](../str.mjs#L523)
  * [`function strLax`](../str.mjs#L529)
  * [`function strConcat`](../str.mjs#L535)
  * [`function strConcatLax`](../str.mjs#L539)
  * [`function san`](../str.mjs#L547)
  * [`function sanLax`](../str.mjs#L549)
  * [`function interpolate`](../str.mjs#L552)
