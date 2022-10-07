Similar to [`Array.prototype.flat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat). Differences:

  * Takes an arbitrary iterable compatible with {{link iter values}}.
  * Always flattens to infinite depth.

Currently flattens only children and descendants that are {{link lang isTrueArr plain arrays}}, preserving other nested iterables as-is.
