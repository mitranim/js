Signature: `({[Key: A]}, A => B) => {[Key: B]}`.

Similar to {{link iter map}} but for dicts.

* The input must be either {{link lang isNil nil}} or a {{link lang isRec record}}. Nil is considered `{}`.
* The output is always a {{link lang Emp plain dict}} with the same keys but altered values.
* The mapping function receives only one argument: each value.

```js
import * as i from '{{featUrl iter}}'
import * as l from '{{featUrl lang}}'

i.mapDict({one: 10, two: 20}, l.inc)
// {one: 11, two: 21}
```

Performance note: dictionary iteration is much slower than array iteration, and should be avoided or minimized.
