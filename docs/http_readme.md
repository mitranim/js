## Overview

[http.mjs](../http.mjs) provides tiny syntactic shortcuts for native `Request`/`Response`/`Headers`/`fetch`.

* Fluent builder-style API.
* Interoperable with built-ins.
* Shortcuts for common actions, such as:
  * Building HTTP requests.
    * A builder-style API is more concise and flexible than the native one.
  * Handling HTTP errors in responses.
    * Constructing descriptive exceptions with HTTP status and response text.

## TOC

* [#Usage](#usage)
* [#Misc](#misc)
* [#API](#api)
  * [#`function jsonDecode`](#function-jsondecode)
  * [#`function jsonEncode`](#function-jsonencode)
  * [#`class Err`](#class-err)
  * [#`function reqBui`](#function-reqbui)
  * [#`class ReqBui`](#class-reqbui)
  * [#`class Res`](#class-res)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as h from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.0/http.mjs'

const reqBody = {msg: `hello world`}
const resBody = await h.reqBui().to(`/api`).post().json(reqBody).fetchOkJson()
```

## Misc

`Req..headers` is a null-prototype dict, rather than `Headers`, for performance and compatibility reasons. In Deno, many operations involving `Headers` are stupidly slow. Using plain dicts for headers seems to performs better, and is automatically compatible with object rest/spread and `Object.assign`.

Each header is stored as a single string. When appending, values are joined with `, `. This matches the limitations of the `Headers` and `fetch` APIs, which don't seem to support multiple occurrences of the same header.

## API

### `function jsonDecode`

Links: [source](../http.mjs#L18); [test/example](../test/http_test.mjs#L48).

Sanity-checking wrapper for [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse). If the input is nil or an empty string, returns `null`. Otherwise the input must be a primitive string. Throws on other inputs, without trying to stringify them.

### `function jsonEncode`

Links: [source](../http.mjs#L19); [test/example](../test/http_test.mjs#L63).

Sanity-checking wrapper for [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify). Equivalent to `JSON.stringify(val ?? null)`. If the input is `undefined`, returns `'null'` (string) rather than `undefined` (nil). Output is _always_ a valid JSON string.

### `class Err`

Links: [source](../http.mjs#L23); [test/example](../test/http_test.mjs#L77).

Subclass of `Error` for HTTP responses. The error message includes the HTTP status code, if any.

```ts
class Err extends Error {
  message: string
  status: int
  res?: Response

  constructor(message: string, status: int, res?: Response)
}
```

### `function reqBui`

Links: [source](../http.mjs#L37); [test/example](../test/http_test.mjs#L118).

Same as `new` [#`ReqBui`](#class-reqbui) but syntactically shorter.

### `class ReqBui`

Links: [source](../http.mjs#L39); [test/example](../test/http_test.mjs#L131).

Request builder. Does _not_ subclass `Request`. Call `.req()` to create a native request, or the various `.fetchX()` methods to immediately execute. Unlike the native request, the body is not always a stream. This means `ReqBui` can be stored and reused several times.

`RequestInit` and `BodyInit` are referenced from Deno typedefs.

```ts
class ReqBui extends RequestInit {
  // Uses native `fetch` and constructs `Res` from the resulting response.
  fetch(): Promise<Res>

  /*
  Returns the resulting `Res` if the response is OK. If the response is
  received, but HTTP status code is non-OK, throws a descriptive `Err`.

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
  add(init?: RequestInit): ReqBui

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
  headDelete(key: string): ReqBui
  headAdd(src: Headers | Record<string, string>): ReqBui

  // Class used for responses. Can override in subclass.
  get Res(): {new(): Res}
}
```

### `class Res`

Links: [source](../http.mjs#L160); [test/example](../test/http_test.mjs#L561).

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
  `Err` with the status code and response text in its error message.
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
  get Err(): {new(): Err}
}
```

### Undocumented

The following APIs are exported but undocumented. Check [http.mjs](../http.mjs).

  * [`const GET`](../http.mjs#L4)
  * [`const HEAD`](../http.mjs#L5)
  * [`const OPTIONS`](../http.mjs#L6)
  * [`const POST`](../http.mjs#L7)
  * [`const PUT`](../http.mjs#L8)
  * [`const PATCH`](../http.mjs#L9)
  * [`const DELETE`](../http.mjs#L10)
  * [`const CONTENT_TYPE`](../http.mjs#L12)
  * [`const TYPE_HTML`](../http.mjs#L13)
  * [`const TYPE_JSON`](../http.mjs#L14)
  * [`const TYPE_FORM`](../http.mjs#L15)
  * [`const TYPE_MULTI`](../http.mjs#L16)
  * [`function getStatus`](../http.mjs#L20)
  * [`function hasStatus`](../http.mjs#L21)
  * [`class Rou`](../http.mjs#L194)
  * [`function resNotAllowed`](../http.mjs#L287)
  * [`function resNotFound`](../http.mjs#L292)
  * [`function resEmpty`](../http.mjs#L297)
  * [`function resErr`](../http.mjs#L299)
