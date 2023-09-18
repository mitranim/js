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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.47/str.mjs'

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
  * [`function regEsc`](../str.mjs#L276)
  * [`function boolOpt`](../str.mjs#L280)
  * [`function bool`](../str.mjs#L287)
  * [`function finOpt`](../str.mjs#L289)
  * [`function fin`](../str.mjs#L294)
  * [`function intOpt`](../str.mjs#L296)
  * [`function int`](../str.mjs#L301)
  * [`function natOpt`](../str.mjs#L303)
  * [`function nat`](../str.mjs#L308)
  * [`function inter`](../str.mjs#L310)
  * [`function maybeInter`](../str.mjs#L320)
  * [`function stripPre`](../str.mjs#L330)
  * [`function stripPreAll`](../str.mjs#L337)
  * [`function stripSuf`](../str.mjs#L342)
  * [`function stripSufAll`](../str.mjs#L349)
  * [`function optPre`](../str.mjs#L354)
  * [`function optSuf`](../str.mjs#L360)
  * [`function maybePre`](../str.mjs#L366)
  * [`function maybeSuf`](../str.mjs#L372)
  * [`function split`](../str.mjs#L378)
  * [`function splitMap`](../str.mjs#L383)
  * [`function lines`](../str.mjs#L406)
  * [`function trimLines`](../str.mjs#L407)
  * [`function joinBy`](../str.mjs#L409)
  * [`function joinOptBy`](../str.mjs#L419)
  * [`function join`](../str.mjs#L429)
  * [`function joinLax`](../str.mjs#L430)
  * [`function joinOpt`](../str.mjs#L431)
  * [`function joinOptLax`](../str.mjs#L432)
  * [`function joinLines`](../str.mjs#L434)
  * [`function joinLinesLax`](../str.mjs#L435)
  * [`function joinLinesOpt`](../str.mjs#L436)
  * [`function joinLinesOptLax`](../str.mjs#L437)
  * [`function spaced`](../str.mjs#L439)
  * [`function dashed`](../str.mjs#L440)
  * [`function isSubpath`](../str.mjs#L443)
  * [`function rndHex`](../str.mjs#L453)
  * [`function arrHex`](../str.mjs#L459)
  * [`function uuid`](../str.mjs#L471)
  * [`function uuidArr`](../str.mjs#L479)
  * [`function draftParse`](../str.mjs#L493)
  * [`function draftRender`](../str.mjs#L494)
  * [`function draftRenderAsync`](../str.mjs#L495)
  * [`class Draft`](../str.mjs#L510)
  * [`function isRen`](../str.mjs#L540)
  * [`class Embed`](../str.mjs#L543)
  * [`function str`](../str.mjs#L566)
  * [`function strLax`](../str.mjs#L572)
  * [`function strConcat`](../str.mjs#L578)
  * [`function strConcatLax`](../str.mjs#L582)
  * [`function san`](../str.mjs#L590)
  * [`function sanLax`](../str.mjs#L592)
  * [`function interpolate`](../str.mjs#L595)
  * [`class Str`](../str.mjs#L614)
  * [`function replaceAll`](../str.mjs#L624)
