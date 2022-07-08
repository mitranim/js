Same as `typeof val === 'number'`. True if the value is a primitive number, _including_ `NaN` and `±Infinity`. In most cases you should use {{link lang isFin}} instead.

```js
import * as l from '{{featUrl lang}}'

l.isNum(1)
// true

l.isNum('1')
// false

l.isNum(NaN)
// true <-- WTF
```
