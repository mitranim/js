Signature: `(Iter<A>, A => B[]) => B[]`.

Similar to [`Array.prototype.flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap). Differences:

  * Takes an arbitrary iterable compatible with {{link iter values}}.
  * Iterable may be {{link lang isNil nil}}, equivalent to `[]`.
  * Doesn't support `this` or additional arguments.

This function is equivalent to `i.flat(i.map(val, fun))`. See {{link iter map}} and {{link iter flat}}.
