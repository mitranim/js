Variant of {{link coll Vec}} where values must belong to a specific class, determined by its getter `cls`. The default element class is `Object`. Override it when subclassing `ClsVec`. Elements added with `.add` are idempotently instantiated.

Also see {{link coll ClsColl}}.

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

class Persons extends c.ClsVec {
  get cls() {return Person}
}

const coll = new Persons()
  .add({name: `Mira`})
  .add({name: `Kara`})

console.log(coll)

/*
Persons {
  Symbol(val): [
    Person {name: "Mira"},
    Person {name: "Kara"},
  ]
}
*/
```
