Signature: `(tar, src) => tar`.

Similar to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). Differences:

  * Much faster.
  * Exactly two parameters, not variadic.
  * Sanity-checked:
    * Target must be a {{link lang isRec record}}.
    * Source must be nil or a {{link lang isRec record}}.
    * Throws on invalid inputs.

Similar to {{link obj patch}} but doesn't check for inherited and non-enumerable properties. Simpler, dumber, faster.
