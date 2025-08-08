## Overview

[http.mjs](../http.mjs) provides essential tools for HTTP servers and clients:

* Shortcuts for making requests via native `fetch`.
* Cookie decoding and encoding.
* URL-based routing for SSR and SPA apps.

Also see [`http_bun`](http_bun_readme.md) for Bun HTTP servers, [`http_deno`](http_deno_readme.md) for Deno HTTP servers, and [`http_live`](http_live_readme.md) for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
  * [#`function resOk`](#function-resok)
  * [#`function jsonDecode`](#function-jsondecode)
  * [#`function jsonEncode`](#function-jsonencode)
  * [#`class Ctx`](#class-ctx)
  * [#`class Rou`](#class-rou)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.83/http.mjs'

const reqBody = {msg: `hello world`}
const resBody = await h.reqBui().to(`/api`).post().json(reqBody).fetchOkJson()
```

## API

### `function resOk`

Links: [source](../http.mjs#L52); [test/example](../test/http_test.mjs#L49).

Signature: `(res: Response | Promise<Response>) => Promise<Response>`.

Missing feature of the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). If the response is OK (HTTP code between 200 and 299, `.ok === true`), the resulting promise resolves to that response as-is. Otherwise the resulting promise is rejected with a descriptive [#`ErrHttp`](#class-errhttp) which includes the response status code, the response body (if any) as the error message, and the response itself for introspection if needed.

```js
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.83/http.mjs'

// If response is unsuccessful, this will throw `h.ErrHttp`.
const res = await h.resOk(await fetch(someUrl, someOpt))

const body = res.json()
```

### `function jsonDecode`

Links: [source](../http.mjs#L60); [test/example](../test/http_test.mjs#L73).

Sanity-checking wrapper for [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse). If the input is nil or an empty string, returns `null`. Otherwise the input must be a primitive string. Throws on other inputs, without trying to stringify them.

### `function jsonEncode`

Links: [source](../http.mjs#L64); [test/example](../test/http_test.mjs#L88).

Sanity-checking wrapper for [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify). Equivalent to `JSON.stringify(val ?? null)`. If the input is `undefined`, returns `'null'` (string) rather than `undefined` (nil). Output is _always_ a valid JSON string.

### `class Ctx`

Links: [source](../http.mjs#L112); [test/example](../test/http_test.mjs#L284).

Subclass of built-in [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController). Features:

* Support for chaining / linking, like in Go.
  * When parent signal is aborted, every child is aborted.
* Subclassable without further breakage.
  * Has workarounds for Safari bugs.
* Implements our "standard" interface `.deinit()`.

Optional chaining/linking:

```js
const parent = new AbortController()
const child0 = new h.Ctx(parent.signal)
const child1 = new h.Ctx(child0.signal)

parent.abort()
parent.signal.aborted === true
child0.signal.aborted === true
child1.signal.aborted === true
```

### `class Rou`

Links: [source](../http.mjs#L148); [test/example](../test/http_test.mjs#L144).

Simple router that uses only URL and pathname. Suitable for SPA. For servers, use [#`ReqRou`](#class-reqrou) which supports requests and HTTP methods.

Basics:

```js
const rou = new h.Rou(`https://example.com/path?query#hash`)

rou.url // Url { https://example.com/path?query#hash }
rou.url.href === `https://example.com/path?query#hash`
rou.pathname === `/path`
rou.groups === undefined

rou.pat(`/`) === false
rou.pat(`/blah`) === false
rou.pat(`/path`) === true

rou.pat(/^[/](?<key>[^/]+)$/) === true
rou.groups // {key: `path`}
```

Routing is imperative:

```js
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.83/http.mjs'
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.83/lang.mjs'

const nextPage = route(window.location)

function route(loc) {
  const rou = new h.Rou(loc)

  if (rou.pat(`/`)) return PageIndex(rou)
  if (rou.pat(`/articles`)) return PageArticles(rou)
  if (rou.pat(/^[/]articles[/](?<key>[^/]+)$/)) return PageArticle(rou)
  return Page404(rou)
}

function PageArticle(rou) {
  const key = l.reqPk(rou.reqGroups().key)
  return `page for article ${key}`
}
```

### Undocumented

The following APIs are exported but undocumented. Check [http.mjs](../http.mjs).

  * [`const OPTIONS`](../http.mjs#L22)
  * [`const HEAD`](../http.mjs#L23)
  * [`const GET`](../http.mjs#L24)
  * [`const DELETE`](../http.mjs#L25)
  * [`const PUT`](../http.mjs#L26)
  * [`const POST`](../http.mjs#L27)
  * [`const PATCH`](../http.mjs#L28)
  * [`const HEADER_NAME_ACCEPT`](../http.mjs#L35)
  * [`const HEADER_NAME_CACHE_CONTROL`](../http.mjs#L36)
  * [`const HEADER_NAME_CONTENT_TYPE`](../http.mjs#L37)
  * [`const MIME_TYPE_TEXT`](../http.mjs#L39)
  * [`const MIME_TYPE_HTML`](../http.mjs#L40)
  * [`const MIME_TYPE_JSON`](../http.mjs#L41)
  * [`const MIME_TYPE_FORM`](../http.mjs#L42)
  * [`const MIME_TYPE_MULTI`](../http.mjs#L43)
  * [`const HEADER_TEXT`](../http.mjs#L45)
  * [`const HEADER_HTML`](../http.mjs#L46)
  * [`const HEADER_JSON`](../http.mjs#L47)
  * [`const HEADER_JSON_ACCEPT`](../http.mjs#L49)
  * [`const HEADERS_JSON_INOUT`](../http.mjs#L50)
  * [`function isStatusInfo`](../http.mjs#L66)
  * [`function isStatusOk`](../http.mjs#L67)
  * [`function isStatusRedir`](../http.mjs#L68)
  * [`function isStatusClientErr`](../http.mjs#L69)
  * [`function isStatusServerErr`](../http.mjs#L70)
  * [`function hasStatus`](../http.mjs#L73)
  * [`class ErrHttp`](../http.mjs#L75)
  * [`function isErrAbort`](../http.mjs#L92)
  * [`class AbortError`](../http.mjs#L104)
  * [`function linkAbort`](../http.mjs#L127)
  * [`function toRou`](../http.mjs#L142)
  * [`function toReqRou`](../http.mjs#L191)
  * [`class ReqRou`](../http.mjs#L198)
  * [`function notFound`](../http.mjs#L251)
  * [`function cookieSplitPairs`](../http.mjs#L259)
  * [`function cookieSplitPair`](../http.mjs#L265)
  * [`function cook`](../http.mjs#L278)
  * [`class Cookie`](../http.mjs#L280)
  * [`class Cookies`](../http.mjs#L388)
