Signature: `(tar, src) => tar`.

Similar to [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). Differences:

  * Much faster.
  * Takes only two args.
  * Sanity-checked:
    * Target must be a {{link lang isStruct struct}}.
    * Source must be nil or a {{link lang isStruct struct}}.
    * Throws on invalid inputs.
    * Does not override inherited properties.
    * Does not override own non-enumerable properties.

When overriding inherited and non-enumerable properties is desirable, use {{link obj assign}}.
