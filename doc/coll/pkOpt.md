Short for "primary key optional". Takes an arbitrary value and returns its "primary key". This is used internally by {{link coll Coll}} and {{link coll ClsColl}}.

Currently this uses the following interface:

```ts
interface Pkable {pk(): any}
```

Example use:

```js
class Person {
  constructor({name}) {this.name = name}
  pk() {return this.name}
}

console.log(co.pkOpt(new Person({name: `Kara`})))
// 'Kara'
```
