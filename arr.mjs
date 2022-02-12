// deno-lint-ignore-file constructor-super

import * as l from './lang.mjs'

/*
Variant of `Array` intended for subclassing. Patches various flaws in the
superclass. Work in progress, not documented or exported by default.
See below why.

### Flaws already patched

**Simpler constructor signature**. If the first argument is
{{link lang isNat natural}}, it's used for prealloc.
All other cases are ignored. To instantiate with specific elements,
use static methods `.of` and `.from`.

**Rectifies performance of static methods** `.of` and `.from`, which otherwise
perform horribly in V8, _especially_ for subclasses.

**Provides various missing methods** such as `.clear`, `.setLen`, `.mapMut`,
and others.

### Flaws not patched yet

In V8, many (possibly all) instance methods of `Array` have horrifically bad
performance for any subclass. We may have to override and replace most
(possibly all) methods with custom implementations. If this requires too much
code, we may entirely give up array subclassing.

### Array constructor

The length-argument constructor makes subclassing tricky, but is supported for
the following reasons:

  * Built-in methods such as `slice` and `map` automatically use it for
    subclasses. We'd have to override everything to avoid this.

  * Other external code may assume that for any `Array` subclass,
    `new val.constructor(len)` behaves exactly like it does for `Array`.

  * Prealloc via `super` is more efficient than via `.length = N`.

Consider using the following pattern:

```js
import * as l from '{{url}}/lang.mjs'
import * as co from '{{url}}/coll.mjs'

class MyArr extends co.Arr {
  constructor(val) {
    super(val)

    // Additional fields should be always initialized.
    this.someField = `some_value`

    // Constructor arguments should be used only when not preallocating.
    if (!l.isNat(val)) this.add(val)
  }

  add(val) {
    // perform initialization using `val`
  }
}
```
*/
export class Arr extends Array {
  constructor(val) {
    if (l.isNat(val)) super(val)
    else super()
  }

  pushed() {
    this.push(...arguments)
    return this
  }

  pushMany(val) {
    if (l.isNil(val)) return this
    if (l.isArr(val)) return this.push(...val), this
    return this.push(...l.reqIter(val)), this
  }

  setMany(val) {
    if (l.isNil(val)) return this.clear()
    if (l.isArr(val)) return this.setArr(val)
    return this.setIter(val)
  }

  setArr(val) {
    l.reqArr(val)
    this.length = val.length
    let ind = -1
    while (++ind < val.length) this[ind] = val[ind]
    return this
  }

  setIter(val) {
    let ind = 0
    for (val of l.reqIter(val)) this[ind++] = val
    return this.setLen(ind)
  }

  setLen(val) {
    val = l.reqNat(val)
    if (this.length !== val) this.length = val
    return this
  }

  mapMut(fun) {
    l.reqFun(fun)
    let ind = -1
    while (++ind < this.length) this[ind] = fun(this[ind], ind)
    return this
  }

  mapMutOpt(fun) {return l.optFun(fun) ? this.mapMut(fun) : this}

  clear() {return this.setLen(0)}

  // Rectify performance for subclasses.
  // Faster is possible but not worth the lines.
  static of(...args) {return new this(args.length).setArr(args)}

  // Rectify performance for subclasses.
  static from(val, fun) {
    return (
      l.isNil(val) ? new this() :
      l.isArr(val) ? new this(val.length).setArr(val) :
      new this().setIter(val)
    ).mapMutOpt(fun)
  }

  get [Symbol.toStringTag]() {return this.constructor.name}
}
