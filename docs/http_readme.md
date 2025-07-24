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
  * [#`class ErrHttp`](#class-errhttp)
  * [#`class Ctx`](#class-ctx)
  * [#`class Rou`](#class-rou)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.78/http.mjs'

const reqBody = {msg: `hello world`}
const resBody = await h.reqBui().to(`/api`).post().json(reqBody).fetchOkJson()
```

## API

### `function resOk`

Links: [source](../http.mjs#L60); [test/example](../test/http_test.mjs#L49).

Signature: `(res: Response | Promise<Response>) => Promise<Response>`.

Missing feature of the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). If the response is OK (HTTP code between 200 and 299, `.ok === true`), the resulting promise resolves to that response as-is. Otherwise the resulting promise is rejected with a descriptive [#`ErrHttp`](#class-errhttp) which includes the response status code, the response body (if any) as the error message, and the response itself for introspection if needed.

```js
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.78/http.mjs'

// If response is unsuccessful, this will throw `h.ErrHttp`.
const res = await h.resOk(await fetch(someUrl, someOpt))

const body = res.json()
```

### `function jsonDecode`

Links: [source](../http.mjs#L68); [test/example](../test/http_test.mjs#L73).

Sanity-checking wrapper for [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse). If the input is nil or an empty string, returns `null`. Otherwise the input must be a primitive string. Throws on other inputs, without trying to stringify them.

### `function jsonEncode`

Links: [source](../http.mjs#L72); [test/example](../test/http_test.mjs#L88).

Sanity-checking wrapper for [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify). Equivalent to `JSON.stringify(val ?? null)`. If the input is `undefined`, returns `'null'` (string) rather than `undefined` (nil). Output is _always_ a valid JSON string.

### `class ErrHttp`

Links: [source](../http.mjs#L93); [test/example](../test/http_test.mjs#L102).

Subclass of `Error` for HTTP responses. The error message includes the HTTP status code, if any.

```ts
class ErrHttp extends Error {
  message: string
  status: int
  res?: Response

  constructor(message: string, status: int, res?: Response)
}
```

### `class Ctx`

Links: [source](../http.mjs#L125); [test/example](../test/http_test.mjs#L283).

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

Links: [source](../http.mjs#L160); [test/example](../test/http_test.mjs#L143).

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
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.78/http.mjs'
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.78/lang.mjs'

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

  * [`const GET`](../http.mjs#L14)
  * [`const HEAD`](../http.mjs#L15)
  * [`const OPTIONS`](../http.mjs#L16)
  * [`const POST`](../http.mjs#L17)
  * [`const PUT`](../http.mjs#L18)
  * [`const PATCH`](../http.mjs#L19)
  * [`const DELETE`](../http.mjs#L20)
  * [`const HEADER_NAME_CACHE_CONTROL`](../http.mjs#L22)
  * [`const HEADER_NAME_CONTENT_TYPE`](../http.mjs#L23)
  * [`const HEADER_NAME_ACCEPT`](../http.mjs#L24)
  * [`const HEADER_NAME_ETAG`](../http.mjs#L25)
  * [`const HEADER_NAME_ORIGIN`](../http.mjs#L26)
  * [`const HEADER_NAME_HOST`](../http.mjs#L27)
  * [`const HEADER_NAME_CORS_CREDENTIALS`](../http.mjs#L28)
  * [`const HEADER_NAME_CORS_HEADERS`](../http.mjs#L29)
  * [`const HEADER_NAME_CORS_METHODS`](../http.mjs#L30)
  * [`const HEADER_NAME_CORS_ORIGIN`](../http.mjs#L31)
  * [`const MIME_TYPE_TEXT`](../http.mjs#L33)
  * [`const MIME_TYPE_HTML`](../http.mjs#L34)
  * [`const MIME_TYPE_JSON`](../http.mjs#L35)
  * [`const MIME_TYPE_FORM`](../http.mjs#L36)
  * [`const MIME_TYPE_MULTI`](../http.mjs#L37)
  * [`const HEADER_TEXT`](../http.mjs#L39)
  * [`const HEADER_HTML`](../http.mjs#L40)
  * [`const HEADER_JSON`](../http.mjs#L41)
  * [`const HEADER_JSON_ACCEPT`](../http.mjs#L43)
  * [`const HEADERS_JSON_INOUT`](../http.mjs#L44)
  * [`const HEADERS_CORS_PROMISCUOUS`](../http.mjs#L46)
  * [`function isStatusInfo`](../http.mjs#L75)
  * [`function isStatusOk`](../http.mjs#L78)
  * [`function isStatusRedir`](../http.mjs#L81)
  * [`function isStatusClientErr`](../http.mjs#L84)
  * [`function isStatusServerErr`](../http.mjs#L87)
  * [`function hasStatus`](../http.mjs#L90)
  * [`function getStatus`](../http.mjs#L91)
  * [`function isErrAbort`](../http.mjs#L107)
  * [`class AbortError`](../http.mjs#L117)
  * [`function linkAbort`](../http.mjs#L139)
  * [`function toRou`](../http.mjs#L154)
  * [`function toReqRou`](../http.mjs#L203)
  * [`class ReqRou`](../http.mjs#L209)
  * [`function notFound`](../http.mjs#L267)
  * [`function cookieSplitPairs`](../http.mjs#L274)
  * [`function cookieSplitPair`](../http.mjs#L280)
  * [`function cook`](../http.mjs#L293)
  * [`class Cookie`](../http.mjs#L295)
  * [`class Cookies`](../http.mjs#L403)
