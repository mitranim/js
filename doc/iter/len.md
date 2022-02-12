Universal length measurement:

  * For non-objects: always 0.
  * For iterables:
    * For {{link lang isList lists}}: same as `.length`.
    * For ES2015 collections such as `Set`: same as `.size`.
    * For iterators: exhausts the iterator, returning element count.
  * For {{link lang isStruct structs}}: equivalent to `Object.keys(val).length`.
