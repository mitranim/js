Short for "primary key". Similar to {{link coll pkOpt}}, but the input _must_ produce a non-nil primary key, otherwise this panics. This is used internally by {{link coll Coll}} and {{link coll ClsColl}}.

```js
c.pk({})
// Uncaught TypeError: unable to get primary key of {}

class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

c.pk(new Person({name: `Mira`}))
// 'Mira'
```
