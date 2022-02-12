Converts an arbitrary {{link lang isSeq sequence}} to an array. Allows the following inputs:

  * {{link lang isNil Nil}}: return `[]`.
  * {{link lang isArr Array}}: return as-is.
  * {{link lang isList List}}: convert via `Array.prototype.slice`.
  * {{link lang isSet Set}} or arbitrary {{link lang isIterator iterator}}: convert to array by iterating.

Unlike {{link iter values}}, `arr` rejects other inputs such as non-nil primitives, dicts, maps, arbitrary iterables, ensuring that the input is always a sequence.
