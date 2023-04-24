Signature: `(src: Iter<A>, fun: (A, A) => A) => A`.

Similar to {{link iter fold}} but instead of taking an accumulator argument, uses the first element of the iterable as the initial accumulator value. If the iterable is empty, returns `undefined`.

Similar to [`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) when invoked without an accumulator argument.
