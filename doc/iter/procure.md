Signature: `(src: Iter<A>, fun: A => B) => B`.

Similar to {{link iter find}}, but returns the first truthy result of calling the iterator function, rather than the corresponding element. Equivalent to `i.find(i.map(src, fun), l.id)` but more efficient.
