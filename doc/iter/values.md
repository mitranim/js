Takes an arbitrary input and returns an array of its values:

  * For non-objects: always `[]`.
  * For {{link lang isArr arrays}}: **returns as-is without copying**.
  * For {{link lang isList lists}}: slice to array.
  * For {{link lang isIter iterables}} with `.values()`: equivalent to converting the output of `.values()` to an array. Implementation varies for performance.
    * Examples: `Set`, `Map`, and more.
  * For {{link lang isIterator iterators}}: equivalent to `[...iterator]`.
  * For {{link lang isStruct structs}}: equivalent to [`Object.values`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values).
