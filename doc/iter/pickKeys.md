Signature: `({[Key: A]}, Iter<Key>) => {[Key: A]}`.

Similar to `{{link iter pick}}` but uses keys instead of a function.

* The input must be either {{link lang isNil nil}} or a {{link lang isStruct struct}}. Nil is considered `{}`.
* The output is always a {{link lang npo plain dict}}. It mirrors the original, but has only "known" given keys, excluding any other.

Performance note: dictionary iteration is much slower than array iteration, and should be avoided or minimized.
