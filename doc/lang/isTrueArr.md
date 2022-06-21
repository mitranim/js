Similar to [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) and {{link lang isArr}}, but returns true only for instances of the _exact_ `Array` class, false for instances of subclasses.

At the time of writing, subclasses of `Array` suffer horrible performance penalties in V8, and possibly in other engines. Using them can also cause deoptimization of code that would otherwise run much faster. We sometimes prioritize or even enforce "true" arrays for consistent performance.
