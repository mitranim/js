Converts an arbitrary input to a native [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set). Similar to `new Set`. Differences:

  * If input is already a set: **return as-is without copying**.
  * Otherwise, create a set of the input's {{link iter values}}.
    * {{link lang isMap Maps}} and {{link lang isRec records}} are treated as collections of their values rather than key-value entries.
