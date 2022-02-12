Like [`Array.prototype.indexOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf). Differences:

  * Uses {{link lang is}} rather than `===`, therefore able to detect `NaN`.
  * Input may be {{link lang isNil nil}} or any {{link lang isList list}}.
