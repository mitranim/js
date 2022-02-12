True for a value that could be considered a single scalar, rather than a collection / data structure:

  * Any {{link lang isPrim primitive}}.
  * Any {{link lang isObj object}} with a custom `.toString` method, distinct from both `Object.prototype.toString` and `Array.prototype.toString`.
