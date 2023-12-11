Same as the `in` operator, but returns `false` for {{link lang isPrim primitives}} instead of throwing an exception:

```js
import * as l from '{{featUrl lang}}'

l.hasIn(new Number(10), `toString`)
// true

l.hasIn(10, `toString`)
// false

`toString` in 10
// Uncaught TypeError
```
