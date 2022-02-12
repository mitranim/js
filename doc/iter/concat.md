Like [`Array.prototype.concat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat). Differences:

  * Takes two arguments, without rest/spread.
  * Supports arbitrary iterables compatible with {{link iter values}}.
  * Iterables may be {{link lang isNil nil}}, equivalent to `[]`.

Note: for individual elements, use {{link iter append}} and
{{link iter prepend}}.
