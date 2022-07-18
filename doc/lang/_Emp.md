Empty class that inherits from `null` rather than `Object`. Intended for subclassing, giving you a "cleaner" class. The only inherited property is `.constructor`, which is unavoidable in JS classes.

```js
class Empty extends l.Emp {}

const ref = new Empty()

// Instantiation and inheritance works as expected.
ref.constructor === Empty
ref instanceof Empty === true

// `Object` stuff is not inherited.
ref instanceof Object === false
ref.toString === undefined
```
