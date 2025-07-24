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
