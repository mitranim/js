Signature: `({[Key: A]}, A => bool) => {[Key: A]}`.

Similar to {{link iter filter}} but for dicts.

* The input must be either {{link lang isNil nil}} or a {{link lang isStruct struct}}. Nil is considered `{}`.
* The output is always a {{link lang npo plain dict}}. It has only the key-values from the original input for which the given function returned a truthy result.
* The mapping function receives each value.

```js
import * as i from '{{featUrl iter}}'
import * as l from '{{featUrl lang}}'

i.pick({one: -20, two: -10, three: 10, four: 20}, l.isFinPos)
// {three: 10, four: 20}
```

Performance note: dictionary iteration is much slower than array iteration, and should be avoided or minimized.
