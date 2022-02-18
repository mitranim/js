Short for "collection". Ordered map where values are indexed on their "primary key" determined by the function {{link coll pk}} which is also exported by this module. Unlike a normal JS map, this is considered a sequence of values, not a sequence of key-value pairs. Order is preserved, iterating the values is decently fast, and the index allows fast access by key without additional iteration.

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

const coll = new co.Coll()
  .add(new Person({name: `Mira`}))
  .add(new Person({name: `Kara`}))

console.log(coll)

/*
Coll {
  "Mira" => Person { name: "Mira" },
  "Kara" => Person { name: "Kara" },
}
*/
```
