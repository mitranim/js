Signature: `(Iter<A>, {new(A): B}) => B[]`.

Similar to {{link iter map}}, but instead of taking an arbitrary function, takes a class and calls it with `new` for each element.

```js
import * as i from '{{featUrl iter}}'
import * as o from '{{featUrl obj}}'

class Model extends o.Dict {pk() {return this.id}}
class Person extends Model {}

console.log(i.mapCls(
  [
    {id: 1, name: `Mira`},
    {id: 2, name: `Kara`},
  ],
  Person,
))

/*
[
  Person { id: 1, name: "Mira" },
  Person { id: 2, name: "Kara" },
]
*/
```
