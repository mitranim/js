Mixin for classes representing a "struct" / "model" / "record". Also see {{link obj MixStructLax}}. Features:

* Supports explicit specs with validation / transformation functions.

* Can be instantiated or mutated from any {{link lang isRec record}} (any dict-like object); each field is validated by the user-defined spec.

* Assigns and checks all declared fields when instantiating via `new`. Ignores undeclared fields.

* Supports partial updates via the associated function `structMut` (not a method), which assigns and validates known fields provided in the input.

* Supports deep mutation: when updating a struct, automatically detects sub-structs and mutates them, and invokes `.mut` on any object that implements this method.

* Uses regular JS fields. Does not use getters / setters, proxies, private fields, non-enumerable fields, symbols, or anything else "strange". Declared fields are simply assigned via `=`.

Performance characteristics:

* The cost of instantiating or mutating depends only on declared fields, not on provided fields.

* When the number of declared fields is similar to the number of provided fields, this tends to be slightly slower than `Object.assign` or {{link obj assign}}.

* When the number of declared fields is significantly smaller than the number of provided fields, this tends to be faster than the aforementioned assignment functions.

```js
import * as l from '{{featUrl lang}}'
import * as o from '{{featUrl obj}}'

class Person extends o.Struct {
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

// Ignores undeclared fields.
new Person({id: 10, name: `Mira`, slug: `mira`, gender: `female`})
/* Person { id: 10, name: "Mira" } */
```
