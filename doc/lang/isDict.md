True for a "plain object" created in any of the following ways:
* `{...someFields}`
* `{__proto__: null, ...someFields}`
* `Object.create(null)`

False for any other input, including instances of any class other than `Object`, or even for `Object.create(Object.create(null))`.

See {{link lang isRec}} for a more general definition of a non-iterable object.
