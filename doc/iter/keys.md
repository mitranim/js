Takes an arbitrary input and returns an array of its keys:

  * For non-objects: always `[]`.
  * For {{link lang isIter iterables}} with `.keys()`: equivalent to converting the output of `.keys()` to an array. Implementation varies for performance.
    * Examples: `Array`, `Set`, `Map`, and more.
  * For {{link lang isList lists}}: equivalent to above for arrays.
  * For {{link lang isIterator iterators}}: exhausts the iterator, returning an array of indexes equivalent to `i.span(i.len(iterator))`. See {{link iter span}} and {{link iter len}}.
  * For {{link lang isRec records}}: equivalent to [`Object.keys`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).
