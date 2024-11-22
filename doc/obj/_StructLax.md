Superclass for classes representing a "struct" / "model" / "record". Subclass of {{link obj Struct}} with added support for undeclared properties.

Differences from {{link obj Struct}}:

  * When instantiating via `new` or mutating via `.mut`, in addition to assigning and checking all declared properties, this also copies any undeclared properties present in the source data.

    * Behaves similarly to {{link obj patch}}, and differently from `Object.assign` or {{link obj assign}}. Avoids accidentally shadowing inherited or non-enumerable properties.

    * Just like with declared properties, copying undeclared properties supports deep/recursive mutation by calling `.mut` on any existing property values that implement {{link obj isMut the mutation interface}}.

  * Measurably worse performance.

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

// Assigns undeclared properties in addition to declared properties.
new Person({id: 10, name: `Mira`, slug: `mira`, gender: `female`})
/* Person { id: 10, name: "Mira", slug: "mira", gender: "female" } */
```
