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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.32/str.mjs'

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

  * [`const RE_WORD`](../str.mjs#L12)
  * [`const RE_EMBED`](../str.mjs#L13)
  * [`function isBlank`](../str.mjs#L15)
  * [`function isAscii`](../str.mjs#L17)
  * [`function isAsciiPrint`](../str.mjs#L19)
  * [`function isNarrow`](../str.mjs#L21)
  * [`function isUni`](../str.mjs#L27)
  * [`function isEveryCharCode`](../str.mjs#L29)
  * [`function isCodeAscii`](../str.mjs#L38)
  * [`function isCodeAsciiPrint`](../str.mjs#L42)
  * [`function lenStr`](../str.mjs#L46)
  * [`function lenUni`](../str.mjs#L48)
  * [`function ell`](../str.mjs#L55)
  * [`function trunc`](../str.mjs#L57)
  * [`function trim`](../str.mjs#L79)
  * [`function words`](../str.mjs#L81)
  * [`class Words`](../str.mjs#L90)
  * [`function lower`](../str.mjs#L151)
  * [`function upper`](../str.mjs#L152)
  * [`function title`](../str.mjs#L155)
  * [`function strMap`](../str.mjs#L161)
  * [`class StrMap`](../str.mjs#L174)
  * [`function regTest`](../str.mjs#L251)
  * [`function boolOpt`](../str.mjs#L256)
  * [`function bool`](../str.mjs#L263)
  * [`function finOpt`](../str.mjs#L265)
  * [`function fin`](../str.mjs#L270)
  * [`function intOpt`](../str.mjs#L272)
  * [`function int`](../str.mjs#L277)
  * [`function natOpt`](../str.mjs#L279)
  * [`function nat`](../str.mjs#L284)
  * [`function inter`](../str.mjs#L286)
  * [`function maybeInter`](../str.mjs#L296)
  * [`function stripPre`](../str.mjs#L307)
  * [`function stripSuf`](../str.mjs#L315)
  * [`function optPre`](../str.mjs#L322)
  * [`function optSuf`](../str.mjs#L328)
  * [`function maybePre`](../str.mjs#L334)
  * [`function maybeSuf`](../str.mjs#L340)
  * [`function split`](../str.mjs#L346)
  * [`function splitMap`](../str.mjs#L351)
  * [`function lines`](../str.mjs#L374)
  * [`function trimLines`](../str.mjs#L375)
  * [`function joinBy`](../str.mjs#L377)
  * [`function joinOptBy`](../str.mjs#L387)
  * [`function join`](../str.mjs#L397)
  * [`function joinLax`](../str.mjs#L398)
  * [`function joinOpt`](../str.mjs#L399)
  * [`function joinOptLax`](../str.mjs#L400)
  * [`function joinLines`](../str.mjs#L402)
  * [`function joinLinesLax`](../str.mjs#L403)
  * [`function joinLinesOpt`](../str.mjs#L404)
  * [`function joinLinesOptLax`](../str.mjs#L405)
  * [`function spaced`](../str.mjs#L407)
  * [`function dashed`](../str.mjs#L408)
  * [`function isSubpath`](../str.mjs#L411)
  * [`function rndHex`](../str.mjs#L421)
  * [`function arrHex`](../str.mjs#L427)
  * [`function uuid`](../str.mjs#L439)
  * [`function uuidArr`](../str.mjs#L442)
  * [`function draftParse`](../str.mjs#L456)
  * [`function draftRender`](../str.mjs#L457)
  * [`function draftRenderAsync`](../str.mjs#L458)
  * [`class Draft`](../str.mjs#L469)
  * [`function isRen`](../str.mjs#L499)
  * [`class Embed`](../str.mjs#L502)
  * [`function str`](../str.mjs#L525)
  * [`function strLax`](../str.mjs#L531)
  * [`function strConcat`](../str.mjs#L537)
  * [`function strConcatLax`](../str.mjs#L541)
  * [`function san`](../str.mjs#L549)
  * [`function sanLax`](../str.mjs#L551)
  * [`function interpolate`](../str.mjs#L554)
