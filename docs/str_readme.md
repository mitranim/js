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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.51/str.mjs'

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
  * [`function title`](../str.mjs#L158)
  * [`function strMap`](../str.mjs#L164)
  * [`class StrMap`](../str.mjs#L177)
  * [`function regTest`](../str.mjs#L272)
  * [`function regEsc`](../str.mjs#L278)
  * [`function boolOpt`](../str.mjs#L282)
  * [`function bool`](../str.mjs#L289)
  * [`function finOpt`](../str.mjs#L291)
  * [`function fin`](../str.mjs#L296)
  * [`function intOpt`](../str.mjs#L298)
  * [`function int`](../str.mjs#L303)
  * [`function natOpt`](../str.mjs#L305)
  * [`function nat`](../str.mjs#L310)
  * [`function inter`](../str.mjs#L312)
  * [`function maybeInter`](../str.mjs#L322)
  * [`function stripPre`](../str.mjs#L332)
  * [`function stripPreAll`](../str.mjs#L339)
  * [`function stripSuf`](../str.mjs#L344)
  * [`function stripSufAll`](../str.mjs#L351)
  * [`function optPre`](../str.mjs#L356)
  * [`function optSuf`](../str.mjs#L362)
  * [`function maybePre`](../str.mjs#L368)
  * [`function maybeSuf`](../str.mjs#L374)
  * [`function split`](../str.mjs#L380)
  * [`function splitMap`](../str.mjs#L385)
  * [`function lines`](../str.mjs#L408)
  * [`function trimLines`](../str.mjs#L409)
  * [`function joinBy`](../str.mjs#L411)
  * [`function joinOptBy`](../str.mjs#L421)
  * [`function join`](../str.mjs#L431)
  * [`function joinLax`](../str.mjs#L432)
  * [`function joinOpt`](../str.mjs#L433)
  * [`function joinOptLax`](../str.mjs#L434)
  * [`function joinLines`](../str.mjs#L436)
  * [`function joinLinesLax`](../str.mjs#L437)
  * [`function joinLinesOpt`](../str.mjs#L438)
  * [`function joinLinesOptLax`](../str.mjs#L439)
  * [`function spaced`](../str.mjs#L443)
  * [`function dashed`](../str.mjs#L445)
  * [`function isSubpath`](../str.mjs#L448)
  * [`function rndHex`](../str.mjs#L458)
  * [`function arrHex`](../str.mjs#L464)
  * [`function uuid`](../str.mjs#L476)
  * [`function uuidArr`](../str.mjs#L484)
  * [`function draftParse`](../str.mjs#L498)
  * [`function draftRender`](../str.mjs#L499)
  * [`function draftRenderAsync`](../str.mjs#L500)
  * [`class Draft`](../str.mjs#L515)
  * [`function isRen`](../str.mjs#L545)
  * [`class Embed`](../str.mjs#L548)
  * [`function str`](../str.mjs#L571)
  * [`function strLax`](../str.mjs#L577)
  * [`function strConcat`](../str.mjs#L583)
  * [`function strConcatLax`](../str.mjs#L587)
  * [`function san`](../str.mjs#L595)
  * [`function sanLax`](../str.mjs#L597)
  * [`function interpolate`](../str.mjs#L600)
  * [`class Str`](../str.mjs#L619)
  * [`function replaceAll`](../str.mjs#L629)
  * [`function commonPrefixLen`](../str.mjs#L649)
  * [`function commonPrefix`](../str.mjs#L661)
