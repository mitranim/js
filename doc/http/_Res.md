Subclass of `Response` with additional shortcuts for response handling. Always wraps a native response received from another source. {{link http ReqBui}} automatically uses this for responses. You don't need to construct this.

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
