Signature: `(val, test) => val` where `test: val => bool`.

Short for "require". Minification-friendly assertion. If `!test(val)`, throws an informative `TypeError`. Otherwise, returns `val` as-is.

```js
import * as l from '{{featUrl lang}}'

l.req({one: `two`}, l.isObj)
// {one: `two`}

l.req(`str`, l.isFun)
// Uncaught TypeError: expected variant of isFun, got "str"
```
