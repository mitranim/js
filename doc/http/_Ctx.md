Subclass of built-in [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController). Features:

  * Support for chaining/linking, like in Go.
  * Subclassable without further breakage.
    * Has workarounds for Safari bugs.
  * Implements our "standard" interface `.deinit()`.
    * Enables automatic cleanup when using our {{featLink obs proxies}} for deinitables and observables.

Optional chaining/linking:

```js
const parent = new AbortController()
const child = new h.Ctx(parent.signal)

parent.abort()
parent.signal.aborted === true
child.signal.aborted === true
```
