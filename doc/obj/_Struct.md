Superclass for "model"/"data"/"record" classes. Features:

  * Can be instantiated from any {{link lang isStruct struct}}.
    * Behaves similar to {{link obj patch}}, rather than `Object.assign`.
    * Avoids conflicts with inherited methods and getters.
  * Can be deeply mutated by calling `.mut`, which calls `.mut` on fields that implement {{link obj isMut this interface}}, and reassigns other fields.
  * Optional type checking, with declarative type definition.
    * Type checking is performed:
      * When creating instances via `new`, which automatically calls `.mut`.
      * When calling `.mut`.
    * Type checking is _not_ performed when assigning fields via `=`.
    * Individual type assertions such as `l.reqStr`, when hardcoded, are very performant. However, this machinery has overheads that far eclipse the cost of actual type-checking. Avoid in hotspots.
    * You don't pay for what you don't use.

```js
import * as l from '{{featUrl lang}}'
import * as o from '{{featUrl obj}}'

class Person extends o.Struct {
  static fields = {
    ...super.fields,
    id: l.reqFin,
    name: l.reqStr,
  }
}

// Satisfies the type checks.
new Person({id: 10, name: `Mira`})
/* Person { id: 10, name: "Mira" } */

// Fails the type checks and causes an exception.
new Person({id: `Mira`, name: 10})
/* Uncaught TypeError */

// By design, unknown fields are assigned as-is, without checks.
new Person({id: 20, name: `Kara`, title: `director`})
/* Person { id: 20, name: `Kara`, title: `director` } */
```
