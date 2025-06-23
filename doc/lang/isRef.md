Defines a "reference" interface which is consistently across all modules in this library. A "reference" is something that can be {{link lang deref}} into an underlying value. Any object can implement this interface by providing a symbolic property `Symbol.for("val")`.

References are used via the functions {{link lang deref}} and {{link lang reset}}.

The most notable reference types are observables provided by the module {{featLink obs}}.

The names `deref` and `reset` for this interface are lifted from Clojure.

Combined example:

```js
import * as l from '{{featUrl lang}}'
import * as ob from '{{featUrl obs}}'

l.isRef(10) // false
l.isRef({}) // false

const obs = ob.obsRef(10)

l.isRef(obs) // true
l.deref(obs) // 10
l.reset(obs, 20)
l.deref(obs) // 20
```
