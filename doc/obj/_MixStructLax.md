Mixin for classes representing a "struct" / "model" / "record". Similar to {{link obj MixStruct}}, with additional support for undeclared fields.

Differences from {{link obj MixStruct}}:

* When instantiating via `new` or mutating via `structMut`, in addition to assigning and validating all declared fields, this also copies any undeclared fields present in the source data.

  * Behaves similarly to {{link obj patch}}, and differently from `Object.assign` or {{link obj assign}}. Avoids accidentally shadowing inherited or non-enumerable fields.

  * Just like for declared fields, supports deep mutation for undeclared fields.

* Has slightly worse performance.

```js
import * as l from '{{featUrl lang}}'
import * as o from '{{featUrl obj}}'

class Person extends o.StructLax {
  static spec = {
    id: l.reqFin,
    name: l.reqStr,
  }
}

// Fails the type check.
new Person({id: 10})
/* Uncaught TypeError: invalid property "name" */

// Fails the type check.
new Person({name: `Mira`})
/* Uncaught TypeError: invalid property "id" */

// Satisfies the type check.
new Person({id: 10, name: `Mira`})
/* Person { id: 10, name: "Mira" } */

// Assigns undeclared fields in addition to declared fields.
new Person({id: 10, name: `Mira`, slug: `mira`, gender: `female`})
/* Person { id: 10, name: "Mira", slug: "mira", gender: "female" } */
```
