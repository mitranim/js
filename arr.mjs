import * as l from './lang.mjs'

/*
Subclass of `Array` with a better constructor signature, and with various method
overrides that prevent surprising semantics and amortize performance penalties.

See implementation notes in `arr_bench.mjs`.

Not recommended for actual use. Subclasses of `Array` have bad performance and
other issues. Prefer `Vec`.
*/
export class Arr extends Array {
  constructor(src) {
    if (l.isNum(src)) {
      super(src)
      return
    }

    src = l.toTrueArr(src)

    const len = src.length
    super(len)

    let ind = -1
    while (++ind < len) this[ind] = src[ind]
  }

  /* Overrides for standard behaviors. */

  lastIndexOf(val) {
    if (val !== val) return -1
    let ind = this.length
    while (--ind >= 0) if (this[ind] === val) return ind
    return ind
  }

  slice(...val) {
    const buf = this.toArray()
    return val.length ? buf.concat(...val) : buf
  }

  concat(...val) {
    const buf = this.toArray()
    return val.length ? buf.concat(...val) : buf
  }

  join(val) {return this.toArray().join(val)}

  reverse() {
    const len = this.length
    const max = (len / 2) | 0
    let ind = -1

    while (++ind < max) {
      const mir = len - 1 - ind
      const val = this[ind]

      this[ind] = this[mir]
      this[mir] = val
    }
    return this
  }

  flat(...val) {return this.toArray().flat(...val)}
  every(...val) {return this.toArray().every(...val)}
  filter(...val) {return this.toArray().filter(...val)}
  find(...val) {return this.toArray().find(...val)}
  findIndex(...val) {return this.toArray().findIndex(...val)}
  findLast(...val) {return this.toArray().findLast(...val)}
  findLastIndex(...val) {return this.toArray().findLastIndex(...val)}
  flatMap(...val) {return this.toArray().flatMap(...val)}
  forEach(...val) {return this.toArray().forEach(...val)}
  map(...val) {return this.toArray().map(...val)}
  reduce(...val) {return this.toArray().reduce(...val)}
  reduceRight(...val) {return this.toArray().reduceRight(...val)}
  some(...val) {return this.toArray().some(...val)}

  sort(fun) {
    const src = this.toArray().sort(fun)
    const len = src.length
    let ind = -1
    while (++ind < len) this[ind] = src[ind]
    return this
  }

  keys() {return this.toArray().keys()}
  values() {return this.toArray().values()}
  entries() {return this.toArray().entries()}
  [Symbol.iterator]() {return this.values()}

  static from(src, fun) {
    src = l.toTrueArr(src)

    const len = src.length
    const buf = this.make(len)
    let ind = -1

    if (l.optFun(fun)) while (++ind < len) buf[ind] = fun(src[ind], ind)
    else while (++ind < len) buf[ind] = src[ind]
    return buf
  }

  static of(...src) {return this.from(src)}

  /* Non-standard extensions. */

  add(val) {return this.push(val), this}

  setLen(val) {
    l.reqNum(val)
    if (this.length !== val) this.length = val
    return this
  }

  clear() {return this.setLen(0)}

  // Our amortizer and bottleneck. Our savior and destroyer.
  toArray() {
    const len = this.length
    const buf = Array(len)
    let ind = -1
    while (++ind < len) buf[ind] = this[ind]
    return buf
  }

  static make(len) {return new this(len)}
}
