True for a value that could be considered a single scalar, rather than a collection / data structure. Currently this is equivalent to the concept of an _intentionally stringable_ value. In the future, we may consider renaming this function or splitting the concepts.

The following are included:

  * Any {{link lang isPrim primitive}} except for those which are excluded below.
    * Examples: {{link lang isBool bool}}, {{link lang isStr string}}, {{link lang isNum number}}, {{link lang isBigInt bigint}}.
  * Any {{link lang isObj object}} with a special `.toString` method, distinct from both `Object.prototype.toString` and `Array.prototype.toString`. Examples include {{link lang isDate dates}}, `URL`, and many more.

The following are excluded:

  * Any {{link lang isNil nil}}.
  * Any {{link lang isSym symbol}}.
  * Any object _without_ a special `.toString` method.

To include nil, use {{link lang isScalarOpt}}.
