Signature: `(Iter<A>, A => bool) => A[]`.

Similar to [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter). Differences:

  * Takes an arbitrary iterable compatible with {{link iter values}}.
  * Iterable may be {{link lang isNil nil}}, equivalent to `[]`.
  * Doesn't support `this` or additional arguments.
