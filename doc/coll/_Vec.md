Short for "vector". Thin wrapper around a plain array. Features:

  * Implements the [iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
  * Compatible with spread operator `...`.
  * Compatible with `for of`.
  * JSON-encodes like an array.
  * Can wrap a pre-existing array.

Differences and advantages over `Array`:

  * Better constructor signature.
    * Constructor takes exactly one argument, which is either {{link lang isNil nil}} or an {{link lang isTrueArr array}}.
    * For comparison, the `Array` constructor has special cases that make subclassing difficult.
  * Can be subclassed without trashing performance.
    * At the time of writing, subclasses of `Array` suffer horrible deoptimization in V8.
    * `Vec` always wraps a {{link lang isTrueArr true array}}, avoiding this problem.

The overhead of the wrapper is insignificant.

```js
import * as c from '{{featUrl coll}}'

console.log(new c.Vec())
// Vec{$: []}

console.log(new c.Vec([10, 20, 30]))
// Vec{$: [10, 20, 30]}

console.log(c.Vec.of(10, 20, 30))
// Vec{$: [10, 20, 30]}

console.log(c.Vec.from(new Set([10, 20, 30])))
// Vec{$: [10, 20, 30]}

for (const val of c.Vec.of(10, 20, 30)) console.log(val)
// 10 20 30
```
