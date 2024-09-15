Subclass of `Error` for HTTP responses. The error message includes the HTTP status code, if any.

```ts
class ErrHttp extends Error {
  message: string
  status: int
  res?: Response

  constructor(message: string, status: int, res?: Response)
}
```
