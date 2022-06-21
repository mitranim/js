Converts an arbitrary {{link lang isSeq sequence}} to an array. Supports the following inputs:

  * {{link lang isNil Nil}}: return `[]`.
  * {{link lang isTrueArr Array}}: return as-is.
  * {{link lang isList List}}: convert via `Array.prototype.slice`.
  * {{link lang isSet Set}} or arbitrary {{link lang isIterator iterator}}: convert to array by iterating.

Unlike {{link iter values}}, this function rejects other inputs such as non-nil primitives, dicts, maps, arbitrary iterables, ensuring that the input is always a sequence.

The input may or may not be a copy. To ensure copying, use {{link iter arrCopy}}.
