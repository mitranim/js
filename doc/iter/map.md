Signature: `(Iter<A>, A => B) => B[]`.

Similar to [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map). Differences:

  * Takes an arbitrary iterable compatible with {{link iter values}}.
  * Iterable may be {{link lang isNil nil}}, equivalent to `[]`.
  * Doesn't support `this`, and doesn't pass additional arguments. When you want support for additional arguments, use {{link iter values}} to convert an arbitrary iterable to an array, then use native `.map`.
