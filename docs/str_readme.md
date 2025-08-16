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
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.85/str.mjs'

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
  * [`class StrMap`](../str.mjs#L170)
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
  * [`function spaced`](../str.mjs#L441)
  * [`function dashed`](../str.mjs#L443)
  * [`function toByteArr`](../str.mjs#L445)
  * [`function rndHex`](../str.mjs#L450)
  * [`function byteArrHex`](../str.mjs#L455)
  * [`function uuid`](../str.mjs#L469)
  * [`function uuidByteArr`](../str.mjs#L477)
  * [`function draftParse`](../str.mjs#L491)
  * [`function draftRender`](../str.mjs#L492)
  * [`function draftRenderAsync`](../str.mjs#L493)
  * [`class Draft`](../str.mjs#L508)
  * [`function isRen`](../str.mjs#L538)
  * [`class Embed`](../str.mjs#L541)
  * [`function str`](../str.mjs#L564)
  * [`function strLax`](../str.mjs#L570)
  * [`function strConcat`](../str.mjs#L576)
  * [`function strConcatLax`](../str.mjs#L580)
  * [`function san`](../str.mjs#L588)
  * [`function sanLax`](../str.mjs#L590)
  * [`function interpolate`](../str.mjs#L593)
  * [`class Str`](../str.mjs#L612)
  * [`function replaceAll`](../str.mjs#L622)
  * [`function commonPrefixLen`](../str.mjs#L642)
  * [`function commonPrefix`](../str.mjs#L654)
