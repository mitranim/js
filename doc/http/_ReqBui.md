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
