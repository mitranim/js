Superclass for classes representing a "struct"/"model"/"record". Also see {{link obj StructLax}}. Features:

  * Supports property declarations, with validation/transformation functions.

  * Can be instantiated or mutated from any {{link lang isStruct struct}} (any dict-like object).

  * Assigns and checks all declared properties when instantiating via `new`. Ignores undeclared properties.

  * Assigns and checks all declared properties when mutating via `.mut` with a {{link lang isSome non-nil}} argument. Ignores undeclared properties.

  * When mutating an existing struct via `.mut`, supports calling method `.mut` on existing property values which implement {{link obj isMut the mutation interface}}. This allows deep/recursive mutation.

  * Uses regular JS properties. Does not use getters/setters, proxies, private properties, non-enumerable properties, symbols, or anything else "strange". Declared properties are simply assigned via `=`.

Performance characteristics:

  * The cost of instantiating or mutating depends only on declared properties, not on provided properties.

  * When the number of declared properties is similar to the number of provided properties, this tends to be slightly slower than `Object.assign` or {{link obj assign}}.

  * When the number of declared properties is significantly smaller than the number of provided properties, this tends to be faster than the aforementioned assignment functions.

```js
import * as l from '{{featUrl lang}}'
import * as o from '{{featUrl obj}}'

class Person extends o.Struct {
  static Spec = class extends super.Spec {
    id = l.reqFin
    name = l.reqStr
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

// Ignores undeclared properties.
new Person({id: 10, name: `Mira`, slug: `mira`, gender: `female`})
/* Person { id: 10, name: "Mira" } */
```
