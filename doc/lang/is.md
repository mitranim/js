Identity test: same as `===`, but considers `NaN` equal to `NaN`. Equivalent to [_SameValueZero_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero) as defined by the language spec. Used internally for all identity tests.

Note that [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) implements [_SameValue_](https://www.ecma-international.org/ecma-262/6.0/#sec-samevalue), which treats `-0` and `+0` as _distinct values_. This is typically undesirable. As a result, you should prefer `l.is` over `===` or `Object.is` unless you _know_ you intend to differentiate `-0` and `+0`.

```js
import * as l from '{{featUrl lang}}'

l.is(1, '1')
// false

l.is(NaN, NaN)
// true
```
