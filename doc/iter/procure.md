Signature: `(src: Iter<A>, fun: A => B) => B`.

Similar to {{link iter find}}, but returns the first truthy result of calling the iterator function, rather than the corresponding element. Equivalent to `f.find(f.map(src, fun), f.id)` but more efficient.
