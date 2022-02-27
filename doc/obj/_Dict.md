Short for "dictionary". Tiny superclass for "model"/"data"/"record" classes. Makes it "safe" to assign arbitrary properties from JSON or other unknown inputs, avoiding conflicts with predefined getters and methods.

Consider the following naive implementation:

```js
class Model {
  constructor(src) {this.mut(src)}
  mut(src) {return Object.assign(this, src)}
  someMethod() {}
}
```

`Object.assign` will overwrite your own methods and getters with properties from the input. A "bad" input breaks your code, possibly late in production:

```js
const ref = new Model({id: `<id>`, someMethod: `str`})
/*
Model { id: "<id>", someMethod: "str" }
*/

ref.someMethod()
// Uncaught TypeError: ref.someMethod is not a function
```

`Object.assign` will try to convert _anything_ to a bag of properties. Even a string. Under no contrived circumstance is this useful. This should be a `TypeError` exception, plain and simple:

```js
new Model(`str`)
/*
Model { "0": "s", "1": "t", "2": "r" }
*/
```

`Dict` avoids all of those issues by using {{link obj patch}} instead of `Object.assign`.

```js
/*
Let's say this was fetched from a server.
Has collisions with inherited properties and methods of our JS classes.
*/
const input = JSON.parse(`{
  "one": 10,
  "two": 20,
  "constructor": 30,
  "toString": 40,
  "someMethod": 50
}`)

class Model extends o.Dict {
  someMethod() {return `someVal`}
}

const ref = new Model(input)

/*
Non-conflicting properties were assigned.
Conflicting properties were ignored.

Model {
  one: 10,
  two: 20,
  toString: 40,
}
*/
```

In addition, it type-checks the inputs:

```js
new Model(`str`)
// Uncaught TypeError: expected variant of isStruct, got "str"
```
