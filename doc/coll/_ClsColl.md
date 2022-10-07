Variant of {{link coll Coll}} where values must belong to a specific class, determined by its getter `cls`. The default element class is `Object`. Override it when subclassing. Elements added with `.add` are idempotently instantiated.

Also see {{link coll ClsVec}}.

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

class Persons extends c.ClsColl {
  get cls() {return Person}
}

const coll = new Persons()
  .add({name: `Mira`})
  .add({name: `Kara`})

console.log(coll)

/*
Persons {
  "Mira" => Person { name: "Mira" },
  "Kara" => Person { name: "Kara" },
}
*/
```
