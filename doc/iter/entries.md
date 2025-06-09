Takes an arbitrary input and returns an array of its entries (key-value tuples):

  * For non-objects: always `[]`.
  * For {{link lang isIter iterables}} with `.entries()`: equivalent to converting the output of `.entries()` to an array. Implementation varies for performance.
    * Examples: `Set`, `Map`, and more.
  * For {{link lang isList lists}}: equivalent to above for arrays.
  * For {{link lang isIterator iterators}}: exhausts the iterator, returning an array of entries where keys are indexes starting with 0.
  * For {{link lang isRec records}}: equivalent to [`Object.entries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries).
