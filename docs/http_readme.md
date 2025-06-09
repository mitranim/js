## Overview

[http.mjs](../http.mjs) provides essential tools for HTTP servers and clients:

* Shortcuts for making requests via native `fetch`.
* Cookie decoding and encoding.
* URL-based routing for SSR and SPA apps.

Also see [`http_deno`](http_deno_readme.md) for Deno HTTP servers, [`http_srv`](http_srv_readme.md) for generic tools for HTTP servers using native stream APIs, and [`live_deno`](live_deno_readme.md) for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
  * [#`function resOk`](#function-resok)
  * [#`function jsonDecode`](#function-jsondecode)
  * [#`function jsonEncode`](#function-jsonencode)
  * [#`class ErrHttp`](#class-errhttp)
  * [#`class Rou`](#class-rou)
  * [#`class Ctx`](#class-ctx)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.68/http.mjs'

const reqBody = {msg: `hello world`}
const resBody = await h.reqBui().to(`/api`).post().json(reqBody).fetchOkJson()
```

## API

### `function resOk`

Links: [source](../http.mjs#L61); [test/example](../test/http_test.mjs#L49).

Signature: `(res: Response | Promise<Response>) => Promise<Response>`.

Missing feature of the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). If the response is OK (HTTP code between 200 and 299, `.ok === true`), the resulting promise resolves to that response as-is. Otherwise the resulting promise is rejected with a descriptive [#`ErrHttp`](#class-errhttp) which includes the response status code, the response body (if any) as the error message, and the response itself for introspection if needed.

```js
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.68/http.mjs'

// If response is unsuccessful, this will throw `h.ErrHttp`.
const res = await h.resOk(await fetch(someUrl, someOpt))

const body = res.json()
```

### `function jsonDecode`

Links: [source](../http.mjs#L69); [test/example](../test/http_test.mjs#L73).

Sanity-checking wrapper for [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse). If the input is nil or an empty string, returns `null`. Otherwise the input must be a primitive string. Throws on other inputs, without trying to stringify them.

### `function jsonEncode`

Links: [source](../http.mjs#L73); [test/example](../test/http_test.mjs#L88).

Sanity-checking wrapper for [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify). Equivalent to `JSON.stringify(val ?? null)`. If the input is `undefined`, returns `'null'` (string) rather than `undefined` (nil). Output is _always_ a valid JSON string.

### `class ErrHttp`

Links: [source](../http.mjs#L100); [test/example](../test/http_test.mjs#L102).

Subclass of `Error` for HTTP responses. The error message includes the HTTP status code, if any.

```ts
class ErrHttp extends Error {
  message: string
  status: int
  res?: Response

  constructor(message: string, status: int, res?: Response)
}
```

### `class Rou`

Links: [source](../http.mjs#L130); [test/example](../test/http_test.mjs#L143).

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
import * as h from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.68/http.mjs'
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.68/lang.mjs'

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

### `class Ctx`

Links: [source](../http.mjs#L239); [test/example](../test/http_test.mjs#L282).

Subclass of built-in [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController). Features:

  * Support for chaining/linking, like in Go.
  * Subclassable without further breakage.
    * Has workarounds for Safari bugs.
  * Implements our "standard" interface `.deinit()`.
    * Enables automatic cleanup when using our [proxies](obs_readme.md) for deinitables and observables.

Optional chaining/linking:

```js
const parent = new AbortController()
const child = new h.Ctx(parent.signal)

parent.abort()
parent.signal.aborted === true
child.signal.aborted === true
```

### Undocumented

The following APIs are exported but undocumented. Check [http.mjs](../http.mjs).

  * [`const GET`](../http.mjs#L15)
  * [`const HEAD`](../http.mjs#L16)
  * [`const OPTIONS`](../http.mjs#L17)
  * [`const POST`](../http.mjs#L18)
  * [`const PUT`](../http.mjs#L19)
  * [`const PATCH`](../http.mjs#L20)
  * [`const DELETE`](../http.mjs#L21)
  * [`const HEADER_NAME_CACHE_CONTROL`](../http.mjs#L23)
  * [`const HEADER_NAME_CONTENT_TYPE`](../http.mjs#L24)
  * [`const HEADER_NAME_ACCEPT`](../http.mjs#L25)
  * [`const HEADER_NAME_ETAG`](../http.mjs#L26)
  * [`const HEADER_NAME_ORIGIN`](../http.mjs#L27)
  * [`const HEADER_NAME_HOST`](../http.mjs#L28)
  * [`const HEADER_NAME_CORS_CREDENTIALS`](../http.mjs#L29)
  * [`const HEADER_NAME_CORS_HEADERS`](../http.mjs#L30)
  * [`const HEADER_NAME_CORS_METHODS`](../http.mjs#L31)
  * [`const HEADER_NAME_CORS_ORIGIN`](../http.mjs#L32)
  * [`const MIME_TYPE_TEXT`](../http.mjs#L34)
  * [`const MIME_TYPE_HTML`](../http.mjs#L35)
  * [`const MIME_TYPE_JSON`](../http.mjs#L36)
  * [`const MIME_TYPE_FORM`](../http.mjs#L37)
  * [`const MIME_TYPE_MULTI`](../http.mjs#L38)
  * [`const HEADER_TEXT`](../http.mjs#L40)
  * [`const HEADER_HTML`](../http.mjs#L41)
  * [`const HEADER_JSON`](../http.mjs#L42)
  * [`const HEADER_JSON_ACCEPT`](../http.mjs#L44)
  * [`const HEADERS_JSON_INOUT`](../http.mjs#L45)
  * [`const HEADERS_CORS_PROMISCUOUS`](../http.mjs#L47)
  * [`function isStatusInfo`](../http.mjs#L76)
  * [`function isStatusOk`](../http.mjs#L79)
  * [`function isStatusRedir`](../http.mjs#L82)
  * [`function isStatusClientErr`](../http.mjs#L85)
  * [`function isStatusServerErr`](../http.mjs#L88)
  * [`function hasStatus`](../http.mjs#L91)
  * [`function getStatus`](../http.mjs#L92)
  * [`function isErrAbort`](../http.mjs#L98)
  * [`class AbortError`](../http.mjs#L122)
  * [`function toRou`](../http.mjs#L127)
  * [`function toReqRou`](../http.mjs#L173)
  * [`class ReqRou`](../http.mjs#L176)
  * [`function cookieSplitPairs`](../http.mjs#L276)
  * [`function cookieSplitPair`](../http.mjs#L282)
  * [`function cook`](../http.mjs#L295)
  * [`class Cookie`](../http.mjs#L297)
  * [`class Cookies`](../http.mjs#L405)
