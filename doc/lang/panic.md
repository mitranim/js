Same as `throw` but an expression rather than a statement. Also sometimes useful with higher-order functions.

```js
import * as l from '{{featUrl lang}}'

const x = someTest ? someValue : l.panic(Error(`unreachable`))
```
