Signature: `(Iter<A>, A => void) => void`.

Similar to `Array.prototype.forEach`, `Set.prototype.forEach`, `Map.prototype.forEach`, and so on. Differences:

  * Takes an arbitrary iterable compatible with {{link iter values}}.
  * Iterable may be {{link lang isNil nil}}, equivalent to `[]`.
  * Doesn't support `this` or additional arguments.
