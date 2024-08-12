## Overview

[url.mjs](../url.mjs) provides URL and query implementations for JS. Like built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) but actually usable. Features:

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
  * [#`function query`](#function-query)
  * [#`function toQuery`](#function-toquery)
  * [#`function url`](#function-url)
  * [#`function toUrl`](#function-tourl)
  * [#`function urlJoin`](#function-urljoin)
  * [#`class Query`](#class-query)
  * [#`class Url`](#class-url)
  * [#Undocumented](#undocumented)

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
import * as u from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.57/url.mjs'
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

### `function query`

Links: [source](../url.mjs#L23); [test/example](../test/url_test.mjs#L8).

Same as `new` [#`Query`](#class-query) but syntactically shorter and a function.

### `function toQuery`

Links: [source](../url.mjs#L24); [test/example](../test/url_test.mjs#L10).

Idempotently converts input to [#`Query`](#class-query) via [`toInst`](lang_readme.md#function-toinst). If already an instance, returns as-is. Otherwise uses `new`. Should be used when you don't intend to mutate the output.

### `function url`

Links: [source](../url.mjs#L26); [test/example](../test/url_test.mjs#L31).

Same as `new` [#`Url`](#class-url) but syntactically shorter and a function.

### `function toUrl`

Links: [source](../url.mjs#L27); [test/example](../test/url_test.mjs#L33).

Idempotently converts input to [#`Url`](#class-url) via [`toInst`](lang_readme.md#function-toinst). If already an instance, returns as-is. Otherwise uses `new`. Should be used when you don't intend to mutate the output.

### `function urlJoin`

Links: [source](../url.mjs#L29); [test/example](../test/url_test.mjs#L54).

Shortcut for `Url.join`. Correctly appends to URL path without mangling the other components.

```js
u.urlJoin(`/persons?key=val#hash`, `3f55a4`, `get`)

/*
Url {
  pathname: `/persons/3f55a4/get`,
  search: `key=val`,
  hash: `hash`,
}
*/
```

### `class Query`

Links: [source](../url.mjs#L31); [test/example](../test/url_test.mjs#L67).

Like [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) but much better. See [#Overview](#overview) for some differences.

```ts
type StrLike       = boolean | number | string
type StrDictLax    = Record<string, string | string[]>
type StrDictSingle = Record<string, string>
type StrDictMulti  = Record<string, string[]>
type QueryLike     = string | Query | URLSearchParams | StrDictLax

class Query extends Map<string, string[]> {
  constructor(src?: QueryLike)

  /*
  Similar to the corresponding methods of `URLSearchParams`, but with stricter
  input validation. In addition, instead of returning void, they return the
  same reference for chaining. A nil key is considered missing, and the
  operation is a nop. A nil val is considered to be ''.
  */
  has(key: string): boolean
  get(key: string): string | undefined
  getAll(key: string): string[]
  set(key: string, val?: StrLike): Query
  append(key: string, val?: StrLike): Query
  delete(key: string): boolean

  /*
  Common-sense methods missing from `URLSearchParams`.
  Names and signatures are self-explanatory.
  */
  setAll(key: string, vals?: StrLike[]): Query
  setAny(key: string, val?: StrLike | StrLike[]): Query
  appendAll(key: string, vals?: StrLike[]): Query
  appendAny(key: string, val?: StrLike | StrLike[]): Query

  /*
  Reinitializes the `Query` object from the input.
  Mutates and returns the same reference.
  Passing nil is equivalent to `.clear`.
  */
  reset(src?: QueryLike): Query

  /*
  Appends the input's content to the current `Query` object.
  Mutates and returns the same reference.
  */
  mut(src?: QueryLike): Query

  /*
  Combination of `.get` and type conversion.
  Non-opt versions panic if conversion is unsuccessful.
  */
  boolOpt(key: string): boolean | undefined
  intOpt(key: string): number | undefined
  finOpt(key: string): number | undefined
  natOpt(key: string): number | undefined
  bool(key: string): boolean
  int(key: string): number
  fin(key: string): number
  nat(key: string): number

  // Conversion to a traditional "query dictionary".
  toDict(): StrDictSingle
  toDictAll(): StrDictMulti

  /*
  Returns a cloned version.
  Future mutations are not shared.
  Cheaper than reparsing.
  */
  clone(): Query

  /*
  Converts to built-in search params.
  Note that `new URLSearchParams(<u.Query>)` should be avoided.
  */
  toURLSearchParams(): URLSearchParams

  // Same as `.toString` but prepends '?' when non-empty.
  toStringFull(): string

  /*
  Encodes to a string like 'key=val'.
  Enables automatic JS stringification.
  */
  toString(): string

  /*
  Enables automatic JSON string encoding.
  As a special case, empty url is considered null.
  */
  toJSON(): string | null
}
```

Warning: while `Query` is mostly compatible with `URLSearchParams`, it has different iteration methods. The iteration methods of `URLSearchParams` are something bizarre and made-up just for this type:

```js
[...new URLSearchParams(`one=two&one=three&four=five`)]
// [[`one`, `two`], [`one`, `three`], [`four`, `five`]]
```

Meanwhile `Query` is `Map<string, string[]>`:

```js
[...new u.Query(`one=two&one=three&four=five`)]
// [[`one`, [`two`, `three`]], [`four`, [`five`]]]
```

The following works properly:

```js
new u.Query(new URLSearchParams(`one=two&one=three&four=five`))
new u.Query(`one=two&one=three&four=five`).toURLSearchParams()
```

But the following **does not work properly** and should be avoided:

```js
new URLSearchParams(new u.Query(`one=two&one=three&four=five`))
```

### `class Url`

Links: [source](../url.mjs#L82); [test/example](../test/url_test.mjs#L331).

Like [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) but much better. See [#Overview](#overview) for some differences.

```ts
type UrlLike    = string | Url | URL | Location
type StrLike    = boolean | number | string
type StrDictLax = Record<string, string | string[]>
type QueryLike  = string | Query | URLSearchParams | StrDictLax

class Url {
  constructor(src?: UrlLike)

  // All of the following are getter/setters.
  // Many are covariant with each other.
  scheme:       string // Without ':' or '//'.
  slash:        string // Either '' or '//'.
  username:     string // Without '@'.
  password:     string // Without ':' or '@'.
  hostname:     string
  port:         string
  pathname:     string
  search:       string // Without leading '?'.
  searchParams: Query
  query:        Query
  hash:         string // Without leading '#'.
  protocol:     string
  host:         string
  origin:       string
  href:         string

  // All of the following set the corresponding property,
  // mutating and returning the same `Url` reference.
  // Passing nil clears the corresponding property.
  setScheme       (val?: string): Url
  setSlash        (val?: string): Url
  setUsername     (val?: string): Url
  setPassword     (val?: string): Url
  setHostname     (val?: string): Url
  setPort         (val?: number | string): Url
  setPathname     (val?: string): Url
  setSearch       (val?: string): Url
  setSearchParams (val?: QueryLike): Url
  setQuery        (val?: QueryLike): Url
  setHash         (val?: string): Url
  setHashExact    (val?: string): Url
  setProtocol     (val?: string): Url
  setHost         (val?: string): Url
  setOrigin       (val?: string): Url
  setHref         (val?: string): Url

  // All of these return a clone with the corresponding property updated.
  withScheme       (val?: string): Url
  withSlash        (val?: string): Url
  withUsername     (val?: string): Url
  withPassword     (val?: string): Url
  withHostname     (val?: string): Url
  withPort         (val?: number | string): Url
  withPathname     (val?: string): Url
  withSearch       (val?: string): Url
  withSearchParams (val?: QueryLike): Url
  withQuery        (val?: QueryLike): Url
  withHash         (val?: string): Url
  withHashExact    (val?: string): Url
  withProtocol     (val?: string): Url
  withHost         (val?: string): Url
  withOrigin       (val?: string): Url
  withHref         (val?: string): Url

  // Replace `.pathname` with slash-separated segments.
  // Empty or non-stringable segments cause an exception.
  setPath(...val: StrLike[]): Url

  // Like `.setPath` but appends to an existing path.
  addPath(...val: StrLike[]): Url

  // Reinitializes the `Url` object from the input.
  // Mutates and returns the same reference.
  // Passing nil is equivalent to `.clear`.
  reset(src?: UrlLike): Url

  // Clears all properties. Mutates and returns the same reference.
  clear(): Url

  // Returns a cloned version.
  // Future mutations are not shared.
  // Cheaper than reparsing.
  clone(): Url

  // Converts to built-in `URL`, for compatibility with APIs that require it.
  toURL(): URL

  // Same as `.href`. Enables automatic JS stringification.
  toString(): string

  // Enables automatic JSON string encoding.
  // As a special case, empty url is considered null.
  toJSON(): string | null

  // Equivalent to `.toString()`. This object may be considered
  // a primitive/scalar, equivalent to a string in some contexts.
  valueOf(): string

  // Class used internally for instantiating `.searchParams`.
  // Can override in subclass.
  get Query(): {new(): Query}

  // Shortcut for `new this(val).setPath(...vals)`.
  static join(val: UrlLike, ...vals: StrLike[]): Url
}
```

Warning: this library does not support parsing bare-domain URLs like `example.com` without a scheme. They cannot be syntactically distinguished from a bare pathname, which is a more important use case. However, `Url` does provide a shortcut for generating a string like this:

```js
u.url(`https://example.com/path`).hostPath() === `example.com/path`
u.url(`scheme://host:123/path?key=val#hash`).hostPath() === `host:123/path`
```

### Undocumented

The following APIs are exported but undocumented. Check [url.mjs](../url.mjs).

  * [`const RE_URL`](../url.mjs#L10)
  * [`const RE_SCHEME`](../url.mjs#L11)
  * [`const RE_SLASH`](../url.mjs#L12)
  * [`const RE_PROTOCOL`](../url.mjs#L13)
  * [`const RE_USERNAME`](../url.mjs#L14)
  * [`const RE_PASSWORD`](../url.mjs#L15)
  * [`const RE_HOSTNAME`](../url.mjs#L16)
  * [`const RE_PORT`](../url.mjs#L17)
  * [`const RE_HOST`](../url.mjs#L18)
  * [`const RE_ORIGIN`](../url.mjs#L19)
  * [`const RE_PATHNAME`](../url.mjs#L20)
  * [`const RE_HASH`](../url.mjs#L21)
  * [`function loc`](../url.mjs#L346)
  * [`function toLoc`](../url.mjs#L347)
  * [`class Loc`](../url.mjs#L357)
  * [`const stateKey`](../url.mjs#L421)
  * [`const titleKey`](../url.mjs#L422)
  * [`const schemeKey`](../url.mjs#L424)
  * [`const slashKey`](../url.mjs#L425)
  * [`const usernameKey`](../url.mjs#L426)
  * [`const passwordKey`](../url.mjs#L427)
  * [`const hostnameKey`](../url.mjs#L428)
  * [`const portKey`](../url.mjs#L429)
  * [`const pathnameKey`](../url.mjs#L430)
  * [`const queryKey`](../url.mjs#L431)
  * [`const hashKey`](../url.mjs#L432)
  * [`function urlParse`](../url.mjs#L434)
  * [`function queryDec`](../url.mjs#L494)
  * [`function queryEnc`](../url.mjs#L500)
