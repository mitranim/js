import * as l from './lang.mjs'

export function bset(val) {return new Bset(val)}
export function bsetOf(...val) {return Bset.of(...val)}

export class Bset extends Set {
  constructor(...val) {super().mut(...val)}

  mut(val) {
    if (l.isNil(val)) return this
    if (l.isIter(val)) return this.mutFromIter(val)
    throw l.errInst(val, this)
  }

  mutFromIter(src) {
    for (const val of l.reqIter(src)) this.add(val)
    return this
  }

  reset(src) {return this.clear(), this.mut(src)}

  clone() {return new this.constructor(this)}
  toArray() {return [...this.values()]}
  toJSON() {return this.toArray()}

  static of(...val) {return new this(val)}
}

export class ClsSet extends Bset {
  get cls() {return Object}
  add(val) {return super.add(l.toInst(val, this.cls))}
}

export function bmap(val) {return new Bmap(val)}
export function bmapOf(...val) {return Bmap.of(...val)}

export class Bmap extends Map {
  constructor(...val) {super().mut(...val)}

  mut(val) {
    if (l.isNil(val)) return this
    if (l.isIter(val)) return this.mutFromIter(val)
    if (l.isStruct(val)) return this.mutFromStruct(val)
    throw l.errInst(val, this)
  }

  mutFromIter(src) {
    for (const [key, val] of l.reqIter(src)) this.set(key, val)
    return this
  }

  mutFromStruct(val) {
    for (const key of l.structKeys(val)) this.set(key, val[key])
    return this
  }

  reset(src) {return this.clear(), this.mut(src)}
  clear() {return (super.size && super.clear()), this}
  clone() {return new this.constructor(this)}

  toDict() {
    const out = l.npo()
    for (const [key, val] of this.entries()) {
      if (l.isStr(key)) out[key] = val
    }
    return out
  }

  toJSON() {return this.toDict()}

  // Mirror of `iter.mjs` → `mapOf`.
  static of(...val) {
    const out = new this()
    let ind = 0
    while (ind < val.length) out.set(val[ind++], val[ind++])
    return out
  }
}

export class ClsMap extends Bmap {
  get cls() {return Object}
  set(key, val) {super.set(key, l.toInst(val, this.cls))}
}

// Short for "primary key optional".
export function pkOpt(val) {return l.hasMeth(val, `pk`) ? val.pk() : undefined}

// Short for "primary key".
export function pk(val) {return pkOf(pkOpt(val), val)}

export function pkOf(key, src) {
  if (l.isPk(key)) return key
  throw TypeError(`expected primary key of ${l.show(src)}, got ${l.show(key)}`)
}

export class Coll extends Bmap {
  mut(val) {
    if (l.isSome(val)) for (val of l.reqIter(val)) this.add(val)
    return this
  }

  add(val) {
    this.set(pkOf(this.getKey(val), val), val)
    return this
  }

  addOpt(val) {
    const key = this.getKey(val)
    if (l.isPk(key)) this.set(key, val)
    return this
  }

  getKey(val) {return pkOpt(val)}
  toArray() {return [...this.values()]}
  toJSON() {return this.toArray()}
  [Symbol.iterator]() {return this.values()}
}

export class ClsColl extends Coll {
  get cls() {return Object}
  set(key, val) {return super.set(key, l.reqInst(val, this.cls))}
  add(val) {return super.add(l.toInst(val, this.cls))}
  addOpt(val) {return super.addOpt(l.toInst(val, this.cls))}
}

export class Vec extends l.Emp {
  constructor(val) {super().$ = l.laxArr(val)}

  add(val) {return this.$.push(val), this}

  addFrom(val) {
    if (l.optIter(val)) for (val of val) this.add(val)
    return this
  }

  clear() {return this.$.length = 0, this}
  clone() {return new this.constructor(this.$.slice())}
  toArray() {return this.$} // Used by `iter.mjs`.
  toJSON() {return this.toArray()}

  get size() {return this.$.length}

  [Symbol.iterator]() {return this.$.values()}

  static of(...val) {return new this(Array.of(...val))}

  static from(val) {
    if (l.isNil(val)) return new this()
    return new this(Array.from(l.reqIter(val)))
  }

  static make(len) {return new this(Array(l.reqNat(len)))}
}

// Short for "class vector".
export class ClsVec extends Vec {
  constructor(val) {
    super(val)
    if (!this.$.every(selfIsInst, this)) {
      this.$ = this.$.map(selfToInst, this)
    }
  }

  add(val) {return super.add(l.toInst(val, this.cls))}

  get cls() {return Object}
}

export class Que extends Set {
  constructor(val) {
    super(val)
    this.flushing = false
  }

  add(fun) {
    l.reqFun(fun)
    if (this.flushing) fun()
    else super.add(fun)
    return this
  }

  open() {return this.flushing = true, this.run()}

  close() {return this.flushing = false, this}

  run() {
    if (this.size) for (const fun of this.values()) this.delete(fun), fun()
    return this
  }
}

/* Internal */

function selfIsInst(val) {return l.isInst(val, this.cls)}
function selfToInst(val) {return l.toInst(val, this.cls)}
