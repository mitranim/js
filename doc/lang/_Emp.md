Empty class that inherits from `null` rather than `Object`. Intended for subclassing, giving you a "cleaner" class.

```js
class Empty extends l.Emp {}

const ref = new Empty()

// Instantiation works as expected.
ref.constructor === Empty
ref instanceof Empty === true

// `Object` stuff is not inherited.
ref instanceof Object === false
ref.toString === undefined
```
