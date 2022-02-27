Short for "vector". Thin wrapper around a plain array. Features:

  * Implements the [iterable interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
  * Compatible with spread (`...` operator).
  * Compatible with `for..of`.
  * JSON-encodes like an array.
  * Can wrap a pre-existing array.

Differences and advantages over `Array`:

  * Better constructor signature.
    * Constructor takes exactly one argument, which is either {{link lang isNil nil}} or an {{link lang isArr array}}.
    * For comparison, the `Array` constructor has special cases that make subclassing difficult.
  * Can be subclassed without trashing performance.
    * At the time of writing, subclasses of `Array` suffer horrible deoptimization in V8.
    * `Vec` always uses a plain array, avoiding this problem.

The overhead of the wrapper is insignificant.
