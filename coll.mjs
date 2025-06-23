import * as l from './lang.mjs'

export function bset(val) {return new Bset(val)}
export function bsetOf(...val) {return Bset.of(...val)}

export class Bset extends Set {
  constructor(...val) {super().mut(...val)}

  mut(val) {
    if (l.isNil(val)) return this
    if (l.isIter(val)) return this.mutFromIter(val)
    throw l.errConvInst(val, this)
  }

  mutFromIter(src) {
    for (const val of l.reqIter(src)) this.add(val)
    return this
  }

  addOpt(val) {
    if (l.isSome(val)) this.add(val)
    return this
  }

  added(val) {return !this.has(val) && (this.add(val), true)}
  reset(src) {return this.clear(), this.mut(src)}
  clear() {return (super.size && super.clear()), this}
  clone() {return new this.constructor(this)}
  toArray() {return [...this.values()]}
  toJSON() {return this.toArray()}

  static of(...val) {return new this(val)}
  static from(val) {return new this(l.optIter(val))}
}

// TODO doc.
export class TypedSet extends Bset {
  reqVal() {throw l.errImpl()}
  add(val) {return super.add(this.reqVal(val))}
}

export class ClsSet extends Bset {
  get cls() {return Object}
  add(val) {return super.add(this.make(val))}
  make(val) {return l.toInst(val, this.cls)}
}

export function bmap(val) {return new Bmap(val)}
export function bmapOf(...val) {return Bmap.of(...val)}

export class Bmap extends Map {
  constructor(...val) {super().mut(...val)}

  mut(val) {
    if (l.isNil(val)) return this
    if (l.isIter(val)) return this.mutFromIter(val)
    if (l.isRec(val)) return this.mutFromRec(val)
    throw l.errConvInst(val, this)
  }

  mutFromIter(src) {
    for (const [key, val] of l.reqIter(src)) this.set(key, val)
    return this
  }

  mutFromRec(val) {
    for (const key of l.recKeys(val)) this.set(key, val[key])
    return this
  }

  setOpt(key, val) {
    if (l.isSome(key) && l.isSome(val)) this.set(key, val)
    return this
  }

  setted(key, val) {return this.set(key, val).get(key)}
  reset(src) {return this.clear(), this.mut(src)}
  clear() {return (super.size && super.clear()), this}
  clone() {return new this.constructor(this)}

  toDict() {
    const out = l.Emp()
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

export class TypedMap extends Bmap {
  reqKey() {throw l.errImpl()}
  reqVal() {throw l.errImpl()}
  set(key, val) {return super.set(this.reqKey(key), this.reqVal(val))}
}

export class ClsMap extends TypedMap {
  get cls() {return Object}
  reqVal(val) {return l.toInst(val, this.cls)}
}

// Short for "primary key optional".
// TODO move to `lang.mjs`.
export function pkOpt(val) {return l.hasMeth(val, `pk`) ? val.pk() : undefined}

// Short for "primary key".
// TODO move to `lang.mjs`.
export function pk(val) {return reqPkOf(pkOpt(val), val)}

function reqPkOf(key, val) {
  if (l.isPk(key)) return key
  throw TypeError(`expected ${l.show(val)} to provide key, got ${l.show(key)}`)
}

export class Coll extends TypedMap {
  mut(val) {
    if (l.isSome(val)) for (val of l.reqIter(val)) this.add(val)
    return this
  }

  getKey(val) {return reqPkOf(this.getKeyOpt(val), val)}
  getKeyOpt(val) {return pkOpt(val)}
  reqKey(key) {return l.reqPk(key)}
  reqVal(val) {return val}
  hasItem(val) {return this.has(this.getKeyOpt(val))}
  add(val) {return this.set(this.getKey(val), val)}
  addOpt(val) {return this.setOpt(this.getKeyOpt(val), val)}

  added(val) {
    const key = this.getKey(val)
    const got = this.has(key)
    this.set(key, val)
    return got
  }

  toArray() {return [...this.values()]}
  toJSON() {return this.toArray()}
  [Symbol.iterator]() {return this.values()}
}

export class ClsColl extends Coll {
  get cls() {return Object}
  reqVal(val) {return l.reqInst(val, this.cls)}
  add(val) {return (val = this.make(val)), this.set(this.getKey(val), val)}
  addOpt(val) {return l.isSome(val) ? super.addOpt(this.make(val)) : this}
  added(val) {return super.added(this.make(val))}
  make(val) {return l.toInst(val, this.cls)}
}

export class Vec extends l.Emp {
  constructor(val) {super()[l.VAL] = l.laxTrueArr(val)}
  mut(val) {return this.clear(), this.addFrom(val)}
  add(val) {return this[l.VAL].push(val), this}

  addFrom(val) {
    if (l.optIter(val)) for (val of val) this.add(val)
    return this
  }

  clear() {
    if (this[l.VAL].length) this[l.VAL].length = 0
    return this
  }

  at(ind) {return this[l.VAL][l.reqInt(ind)]}
  sort(fun) {return this[l.VAL].sort(fun), this}
  clone() {return new this.constructor(this[l.VAL].slice())}
  toArray() {return this[l.VAL]} // Used by `iter.mjs`.
  toJSON() {return this.toArray()}
  get size() {return this[l.VAL].length}
  [Symbol.iterator]() {return this[l.VAL].values()}

  static make(len) {return new this(Array(l.reqNat(len)))}
  static from(val) {return new this(l.toTrueArr(val))}
  static of(...val) {return new this(val)}
}

// TODO test, doc.
export class TypedVec extends Vec {
  constructor(...val) {
    super(...val)
    this.validate()
  }

  add(val) {return super.add(this.reqVal(val))}
  reqVal() {throw l.errImpl()}
  validate() {mapMut(this[l.VAL], this.reqVal, this)}
}

function mapMut(arr, fun, ctx) {
  l.reqTrueArr(arr)
  l.reqFun(fun)

  let ind = -1
  while (++ind < arr.length) {
    const prev = arr[ind]
    const next = fun.call(ctx, prev)
    if (!l.is(prev, next)) arr[ind] = next
  }
}

// Short for "class vector".
export class ClsVec extends TypedVec {
  get cls() {return Object}
  constructor(src) {super().mut(src)}
  reqVal(val) {return l.reqInst(val, this.cls)}
  add(val) {return super.add(this.make(val))}
  make(val) {return l.toInst(val, this.cls)}
}
