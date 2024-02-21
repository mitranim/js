Signature: `(Iter<[Key, A]>) => {[Key: A]}`.

Similar to [`Object.fromEntries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries). Differences:

  * Takes an arbitrary iterable compatible with {{link iter values}} (more flexible).
    * Each value of this iterable must be a key-value pair.
  * Ignores entries where the first element is not a {{link lang isKey valid_key}}.
  * Returns a {{link lang Emp null_prototype_object}}.
  * Slightly slower.
