Workaround for subclass bugs in some engines.

In some Safari versions, when instantiating a subclass of various recent
built-in classes such as `Request`/`Response`/`URL`, the engine incorrectly
uses the prototype of the superclass rather than the subclass. Occurs in Safari
12-14, both desktop and mobile. This seems to fix that. Example:

```js
class Abort extends AbortController {
  constructor() {
    super()
    o.fixProto(this, new.target)
  }
}
```

The following version is shorter but more confusing if you don't know full semantics of JS classes:

```js
class Abort extends AbortController {
  constructor() {o.fixProto(super(), new.target)}
}
```
