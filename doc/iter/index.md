Signature: `(Iter<A>, A => Key | any) => {[Key: A]}`.

Takes an arbitrary iterable compatible with {{link iter values}} and returns an index where its values are _indexed_ by the given function, hence the name. The function is called for each value. If the function returns a {{link lang isKey valid_key}}, the key-value pair is added to the index. Invalid keys are ignored. If the function returns the same key for multiple values, previous values are lost.

Compare {{link iter group}} which keeps all values for each group, rather than only the last.
