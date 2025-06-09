Signature: `({[Key: A]}, Iter<Key>) => {[Key: A]}`.

Similar to `{{link iter omit}}` but uses keys instead of a function.

* The input must be either {{link lang isNil nil}} or a {{link lang isRec record}}. Nil is considered `{}`.
* The output is always a {{link lang Emp plain dict}}. It mirrors the original, but has only "unknown" keys, excluding any given keys.

Performance note: dictionary iteration is much slower than array iteration, and should be avoided or minimized.
