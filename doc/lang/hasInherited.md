Returns `true` if the target is {{link lang isComp non-primitive}} and has the given property on its prototype. As a consequence, this returns `false` if the target is a primitive, or has the given property as an "own" property, either enumerable or not.

```js
import * as l from '{{featUrl lang}}'

l.hasInherited([10, 20, 30], `length`)
// false

l.hasInherited([10, 20, 30], `1`)
// false

l.hasInherited([10, 20, 30], `toString`)
// true
```
