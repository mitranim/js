## Overview

[http.mjs](../http.mjs) provides tiny syntactic shortcuts for native `Request`/`Response`/`Headers`/`fetch`.

* Fluent builder-style API.
* Interoperable with built-ins.
* Shortcuts for common actions, such as:
  * Building HTTP requests via [#`ReqBui`](#class-reqbui).
    * A builder-style API is more concise and flexible than the native one.
  * Handling HTTP errors in responses via [#`Res`](#class-res).
    * Constructing descriptive exceptions with HTTP status and response text.
  * Routing incoming HTTP requests via [#`Rou`](#class-rou).

HTTP request/response utils are ported and reworked from https://github.com/mitranim/xhttp. Routing utils are ported and reworked from https://github.com/mitranim/imperouter.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
  * [#`function jsonDecode`](#function-jsondecode)
  * [#`function jsonEncode`](#function-jsonencode)
  * [#`class HttpErr`](#class-httperr)
  * [#`function reqBui`](#function-reqbui)
  * [#`class ReqBui`](#class-reqbui)
  * [#`class Res`](#class-res)
  * [#`class Rou`](#class-rou)
  * [#`class ReqRou`](#class-reqrou)
  * [#`class Ctx`](#class-ctx)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as h from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.13/http.mjs'

const reqBody = {msg: `hello world`}
const resBody = await h.reqBui().to(`/api`).post().json(reqBody).fetchOkJson()
```

## API

### `function jsonDecode`

Links: [source](../http.mjs#L33); [test/example](../test/http_test.mjs#L60).

Sanity-checking wrapper for [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse). If the input is nil or an empty string, returns `null`. Otherwise the input must be a primitive string. Throws on other inputs, without trying to stringify them.

### `function jsonEncode`

Links: [source](../http.mjs#L34); [test/example](../test/http_test.mjs#L75).

Sanity-checking wrapper for [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify). Equivalent to `JSON.stringify(val ?? null)`. If the input is `undefined`, returns `'null'` (string) rather than `undefined` (nil). Output is _always_ a valid JSON string.

### `class HttpErr`

Links: [source](../http.mjs#L64); [test/example](../test/http_test.mjs#L89).

Subclass of `Error` for HTTP responses. The error message includes the HTTP status code, if any.

```ts
class HttpErr extends Error {
  message: string
  status: int
  res?: Response

  constructor(message: string, status: int, res?: Response)
}
```

### `function reqBui`

Links: [source](../http.mjs#L199); [test/example](../test/http_test.mjs#L437).

Same as `new` [#`ReqBui`](#class-reqbui) but syntactically shorter and a function.

### `class ReqBui`

Links: [source](../http.mjs#L201); [test/example](../test/http_test.mjs#L450).

Request builder. Does _not_ subclass `Request`. Call `.req()` to create a native request, or the various `.fetchX()` methods to immediately execute. Unlike the native request, the body is not always a stream. This means `ReqBui` can be stored and reused several times.

`RequestInit` and `BodyInit` are referenced from Deno typedefs.

```ts
class ReqBui extends RequestInit {
  // Uses native `fetch` and constructs `Res` from the resulting response.
  fetch(): Promise<Res>

  /*
  Returns the resulting `Res` if the response is OK. If the response is
  received, but HTTP status code is non-OK, throws a descriptive `HttpErr`.

  Shortcut for `(await this.fetch()).okRes()`.
  */
  fetchOk(): Promise<Res>

  // Shortcut for `(await this.fetch()).okText()`.
  fetchOkText(): Promise<string>

  // Shortcut for `(await this.fetch()).okJson()`.
  fetchOkJson(): Promise<any>

  /*
  Mutates the request by applying the given options and returns the same
  reference. Automatically merges headers.
  */
  mut(init?: RequestInit): ReqBui

  // Shortcut for `new Request(this.url, this)`.
  req(): Request

  // Sets `.url` and returns the same reference.
  to(val: string | {toString(): string}): ReqBui

  // Sets `.signal` and returns the same reference.
  sig(val?: AbortSignal): ReqBui

  // Sets `.method` and returns the same reference.
  meth(val: string): ReqBui

  // Sets `.body` and returns the same reference. Short for "input".
  inp(val: BodyInit): ReqBui

  /*
  JSON-encodes the input, sets `.body`, and sets JSON request headers.
  Does NOT set the `accept` header. Returns the same reference.

  ALWAYS sets both the header `content-type: application/json` and the body,
  protecting you from the mistake of setting only the header. If the body is
  not provided, it will be `'null'` rather than empty. This means the resulting
  request is always valid decodable JSON, avoiding EOF errors on the server
  side.
  */
  json(val?: any): ReqBui

  // Shortcuts for setting the corresponding HTTP method.
  get(): ReqBui
  post(): ReqBui
  put(): ReqBui
  patch(): ReqBui
  delete(): ReqBui

  // Shortcuts for modifying the `content-type` header.
  type(val: string): ReqBui
  typeJson(): ReqBui
  typeForm(): ReqBui
  typeMulti(): ReqBui

  // Idempotently sets `.headers` and returns the resulting reference.
  heads(): Record<string, string>

  // Shortcuts for modifying the headers. All mutate and return the request.
  headHas(key: string): boolean
  headGet(key: string): string | undefined
  headSet(key: string, val?: string): ReqBui
  headSetAll(key: string, val?: string[]): ReqBui
  headSetAny(key: string, val?: string | string[]): ReqBui
  headSetOpt(key: string, val?: string): ReqBui
  headAppend(key: string, val?: string): ReqBui
  headAppendAll(key: string, val?: string[]): ReqBui
  headAppendAny(key: string, val?: string | string[]): ReqBui
  headMut(src: Headers | Record<string, string>): ReqBui
  headDelete(key: string): ReqBui

  // Class used for responses. Can override in subclass.
  get Res(): {new(): Res}
}
```

### `class Res`

Links: [source](../http.mjs#L282); [test/example](../test/http_test.mjs#L578).

Subclass of `Response` with additional shortcuts for response handling. Always wraps a native response received from another source. [#`ReqBui`](#class-reqbui) automatically uses this for responses. You don't need to construct this.

The following getters are always deferred to the wrapped original: `.redirected`, `.type`, `.url`.

```ts
class Res extends Response {
  constructor(res: Response)
  constructor(body: BodyInit | null, init?: ResponseInit)

  // Wrapped response.
  res: Response

  /*
  If `res.ok`, returns the response as-is. Otherwise throws an instance of
  `HttpErr` with the status code and response text in its error message.
  */
  okRes(): Promise<Res>

  /*
  Shortcut for `(await this.okRes()).text()`. On unsuccessful response,
  throws a descriptive error. On success, returns response text.
  */
  okText(): Promise<string>

  /*
  Shortcut for `(await this.okRes()).json()`. On unsuccessful response,
  throws a descriptive error. On success, returns decoded JSON.
  */
  okJson(): Promise<any>

  // Class used for response errors. Can override in subclass.
  get Err(): {new(): HttpErr}
}
```

### `class Rou`

Links: [source](../http.mjs#L324); [test/example](../test/http_test.mjs#L606).

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
import * as h from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.13/http.mjs'
import * as l from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.13/lang.mjs'

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

### `class ReqRou`

Links: [source](../http.mjs#L369); [test/example](../test/http_test.mjs#L652).

Short for "request router" or "request-response router". Advanced version of [#`Rou`](#class-rou). Suitable for servers and SSR/SPA hybrid apps.

Routing can be shared between SSR and SPA:

```js
import * as h from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.13/http.mjs'

function route(rou) {
  l.reqInst(rou, h.ReqRou)

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

SSR uses incoming requests:

```js
function response(req) {
  return htmlRes(route(new h.ReqRou(req)))
}

// Consider also using `h.ResBui`.
function htmlRes(body) {
  return new Response(body, {headers: {[h.HEAD_CONTENT_TYPE]: h.TYPE_HTML}})
}
```

SPA uses current URL:

```js
const page = route(h.ReqRou.from(window.location))
```

For SSR/SPA isomorphic rendering, use the pair of "ren" modules: [`ren_str`](ren_str_readme.md) on the server and [`ren_dom`](ren_dom_readme.md) in browsers.

### `class Ctx`

Links: [source](../http.mjs#L430); [test/example](../test/http_test.mjs#L745).

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

  * [`const GET`](../http.mjs#L12)
  * [`const HEAD`](../http.mjs#L13)
  * [`const OPTIONS`](../http.mjs#L14)
  * [`const POST`](../http.mjs#L15)
  * [`const PUT`](../http.mjs#L16)
  * [`const PATCH`](../http.mjs#L17)
  * [`const DELETE`](../http.mjs#L18)
  * [`const HEAD_CACHE_CONTROL`](../http.mjs#L20)
  * [`const HEAD_CONTENT_TYPE`](../http.mjs#L21)
  * [`const HEAD_ETAG`](../http.mjs#L22)
  * [`const HEAD_ACCEPT`](../http.mjs#L23)
  * [`const HEAD_ORIGIN`](../http.mjs#L24)
  * [`const HEAD_HOST`](../http.mjs#L25)
  * [`const TYPE_TEXT`](../http.mjs#L27)
  * [`const TYPE_HTML`](../http.mjs#L28)
  * [`const TYPE_JSON`](../http.mjs#L29)
  * [`const TYPE_FORM`](../http.mjs#L30)
  * [`const TYPE_MULTI`](../http.mjs#L31)
  * [`function isStatusInfo`](../http.mjs#L37)
  * [`function isStatusOk`](../http.mjs#L40)
  * [`function isStatusRedir`](../http.mjs#L43)
  * [`function isStatusClientErr`](../http.mjs#L46)
  * [`function isStatusServerErr`](../http.mjs#L49)
  * [`function hasStatus`](../http.mjs#L52)
  * [`function getStatus`](../http.mjs#L53)
  * [`function isErrAbort`](../http.mjs#L59)
  * [`class AbortError`](../http.mjs#L86)
  * [`class HttpBui`](../http.mjs#L95)
  * [`function resBui`](../http.mjs#L227)
  * [`class ResBui`](../http.mjs#L230)
  * [`function toRou`](../http.mjs#L322)
  * [`function toReqRou`](../http.mjs#L367)
  * [`function cookieSplitPairs`](../http.mjs#L462)
  * [`function cookieSplitPair`](../http.mjs#L468)
  * [`function cook`](../http.mjs#L481)
  * [`class Cookie`](../http.mjs#L483)
  * [`function reqBody`](../http.mjs#L611)
  * [`function optBody`](../http.mjs#L612)
  * [`const bodyFuns`](../http.mjs#L613)


## Misc

`Req..headers` is a null-prototype dict, rather than `Headers`, for performance and compatibility reasons. In Deno, many operations involving `Headers` are stupidly slow. Using plain dicts for headers seems to performs better, and is automatically compatible with object rest/spread and `Object.assign`.

Each header is stored as a single string. When appending, values are joined with `, `. This matches the limitations of the `Headers` and `fetch` APIs, which don't seem to support multiple occurrences of the same header.