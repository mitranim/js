## Overview

{{codeHead}} provides URL and query implementations for JS. Like built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) but actually usable. Features:

* Somewhat aligned with `URL` API.
* Almost everything is optional. In particular:
  * `.protocol` is optional.
  * `.pathname` is optional.
* Various common-sense shortcuts.
  * Fluent builder-style API.
  * Support for correctly joining/appending URL paths.
  * Support for traditional "query dictionaries" like `{key: ['val']}`.
  * Support for patching/merging queries.
* Better compatibility with custom URL schemes.
* Less information loss.
  * No magic defaults, fallbacks, automatic appending, or automatic prepending.
  * `.pathname` is preserved from input _exactly_ as-is.
  * Empty `.origin` is `''`, not `'null'`.
* Stricter validation of input types and string formats.
  * Nil is considered `''`, _not_ `'null'` or `'undefined'`.
  * Accidental stringification of junk like `'[object Object]'` is forbidden and causes exceptions.
  * Query keys must be strings.
  * Invalid inputs for various URL components cause exceptions instead of being silently converted to garbage, truncated, or ignored.
* Subclassable.
  * Can subclass `Query` and override it for your `Url` variant.
  * Can override any getter, setter, or method.
  * Compatible with proxies and `Object.create`.
  * No "illegal invocation" exceptions.
* No special cases for "known" URL schemes.
* `Query` is `Map<string, string[]>` as it should be.
* Automatically stringable as it should be.
* Decent test coverage.
* Decent benchmark coverage.
* Tuned for [#performance](#perf).
* Browser compatibility: evergreen, Safari 11+.

Ported and reworked from https://github.com/mitranim/ur which is also available separately.

## TOC

* [#Why](#why)
* [#Perf](#perf)
* [#Usage](#usage)
* [#Limitations](#limitations)
* [#API](#api)
{{toc}}

## Why

The JS built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) implementation is insane. I have no other words for it.

Various issues:

* Requires `.protocol`. WTF! In real app code, both on client and server, many URLs are relative to website origin, without a protocol.
  * This alone can force app authors to either avoid `URL`, or use hacks involving a fake protocol like `file:`.
* Empty `.origin` is `'null'` rather than `''`. WTF!
  * Even worse: `.origin` is `'null'` for any custom scheme. It works only for a small special-cased whitelist.
* Unwanted garbage by default:
  * Forces empty `.pathname` for some schemes to be `'/'` rather than `''`.
    * But only for _some_ schemes!
  * Non-empty `.hash` starts with `#`, which is often undesirable.
  * Non-empty `.search` starts with `?`, which is often undesirable.
  * I always end up with utility functions for stripping this away.
  * But non-empty `.port` doesn't start with `:` because lolgic!
* `URL` property setters and `URLSearchParams` methods stringify nil values as some junk rather than `''`. `null` becomes `'null'`, `undefined` becomes `'undefined'`. In JS, where nil is an _automatic fallback_ for a missing value, this is asinine. Nil should be considered `''`.
* No support for appending path segments, which is an _extremely_ common use case. WTF!
  * `new URL(<path>, <base>)` ***is not good enough***. It requires `<base>` to have an origin (real website links often don't), and works _only_ if path and base begin/end with the right amount of slashes, forcing app authors to write utility functions for stripping/appending/prepending slashes.
* Made-up component `.protocol` is unusable.
  * The URI standard defines "scheme" which _does not_ include `:` or `//`. The JS `URL` lacks `.scheme`; its `.protocol` includes `:` but not `//`, which is the worst possible choice.
  * The lack of `//` makes it impossible to programmatically differentiate protocols like `http://` from protocols like `mailto:` without a special-case whitelist, which is of course _not exposed_ by this implementation. URLs are a general-purpose structured data format which is _extensible_, and custom protocols are frequently used. Special-case whitelists _should not be required_ for using your API, or at the very least they _must be exposed_.
  * The no-less-atrocious Go `net/url.URL` correctly uses a "scheme" field without `:`, but makes the same mistake of hiding the knowledge of whether the original string had `//` in its protocol.
* `URLSearchParams` is nearly unusable:
  * Garbage inputs → garbage outputs. Nil is converted to `'null'` or `'undefined'`. Various non-stringable objects are converted to `'[object Object]'`. This insanity has to stop.
  * Lacks support for traditional "query dictionaries" which are extremely popular in actual apps.
  * Lacks support for patching and merging. Can be emulated by spreading `.entries()` into constructors which is bulky and inefficient.
  * Lacks various common-sense methods: `.setAll`, `.appendAll`, `.clear`.
  * Can't override `url.searchParams` with a custom subclass.
  * Instead of being a normal `Map<string, string[]>`, its iteration methods are bizarre and made-up just for this. Nobody needs this weirdness. This just makes things slower and more surprising.
* Many operations are much slower than possible.

## Perf

* Checked with [benchmarks](../test/url_bench.mjs).
* Most operations seem to perform significantly better than corresponding built-ins in Deno 1.17 / V8 9.7+.

## Usage

Import:

```js
import * as u from '{{featUrl url}}'
```

Example parsing:

```js
const url = u.url(`https://example.com/path?key=val#hash`)

url.pathname          // '/path'
url.search            // 'key=val'
url.hash              // 'hash'
url.query.get(`key`)  // 'val'
url.query.toDict()    // {key: 'val'}
url.query.toDictAll() // {key: ['val']}
```

Example segmented path:

```js
u.url(`https://example.com`).setPath(`/api/msgs`, 123, `get`).toString()
// 'https://example.com/api/msgs/123/get'
```

Example without scheme/protocol:

```js
u.url(`/api`).addPath(`msgs`, 123, `get`).toString()
// '/api/msgs/123/get'
```

Example query dict support:

```js
u.url(`/profile`).queryMut({action: `edit`}).toString()
// `'/profile?action=edit'
```

## Limitations

* `Url` lacks support for optional base URL. Constructor takes only 1 value.
* `Query` iterates as `Map<string, string[]>`, not as `URLSearchParams`.

## API

{{api}}
