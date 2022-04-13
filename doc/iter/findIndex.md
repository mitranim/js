Signature: `(List<A>, A => bool) => int`.

Like [`Array.prototype.findIndex`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex). Differences:

  * Input may be {{link lang isNil nil}} or any {{link lang isList list}}.
  * Doesn't support `this` or additional arguments.
