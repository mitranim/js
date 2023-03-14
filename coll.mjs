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

  added(val) {return this.add(val), val}
  addedOpt(val) {return this.addOpt(val), val}
  reset(src) {return this.clear(), this.mut(src)}
  clear() {return (super.size && super.clear()), this}
  clone() {return new this.constructor(this)}
  toArray() {return [...this.values()]}
  toJSON() {return this.toArray()}

  static of(...val) {return new this(val)}
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
    if (l.isStruct(val)) return this.mutFromStruct(val)
    throw l.errConvInst(val, this)
  }

  mutFromIter(src) {
    for (const [key, val] of l.reqIter(src)) this.set(key, val)
    return this
  }

  mutFromStruct(val) {
    for (const key of l.structKeys(val)) this.set(key, val[key])
    return this
  }

  setOpt(key, val) {
    if (l.isSome(key) && l.isSome(val)) this.set(key, val)
    return this
  }

  setted(key, val) {return this.set(key, val), val}
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

export class TypedMap extends Bmap {
  reqKey() {throw l.errImpl()}
  reqVal() {throw l.errImpl()}
  set(key, val) {return super.set(this.reqKey(key), this.reqVal(val))}
  setted(key, val) {return super.setted(this.reqKey(key), this.reqVal(val))}
}

/*
TODO better name. Restricts key type to strings, for compatibility with plain
dicts, without restricting value types.
*/
export class CompatMap extends TypedMap {
  reqKey(key) {return l.reqStr(key)}
  reqVal(val) {return val}
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
export function pk(val) {
  const key = pkOpt(val)
  if (l.isPk(key)) return key
  throw TypeError(`expected primary key of ${l.show(val)}, got ${l.show(key)}`)
}

export class Coll extends TypedMap {
  mut(val) {
    if (l.isSome(val)) for (val of l.reqIter(val)) this.add(val)
    return this
  }

  reqKey(key) {return l.reqPk(key)}
  reqVal(val) {return val}
  add(val) {return this.set(pk(val), val)}
  addOpt(val) {return this.setOpt(pkOpt(val), val)}
  added(val) {return this.add(val), val}
  toArray() {return [...this.values()]}
  toJSON() {return this.toArray()}
  [Symbol.iterator]() {return this.values()}
}

export class ClsColl extends Coll {
  get cls() {return Object}
  reqVal(val) {return l.reqInst(val, this.cls)}
  add(val) {return super.add(this.make(val))}
  addOpt(val) {return l.isSome(val) ? super.addOpt(this.make(val)) : this}
  added(val) {return this.add((val = this.make(val))), val}
  make(val) {return l.toInst(val, this.cls)}
}

export class Vec extends l.Emp {
  constructor(val) {super().$ = l.laxTrueArr(val)}
  mut(val) {return this.clear(), this.addFrom(val)}
  add(val) {return this.$.push(val), this}

  // TODO rename to `.addVals`?
  addFrom(val) {
    if (l.optIter(val)) for (val of val) this.add(val)
    return this
  }

  clear() {
    if (this.$.length) this.$.length = 0
    return this
  }

  at(ind) {return this.$[l.reqInt(ind)]}
  sort(fun) {return this.$.sort(fun), this}
  clone() {return new this.constructor(this.$.slice())}
  toArray() {return this.$} // Used by `iter.mjs`.
  toJSON() {return this.toArray()}
  get size() {return this.$.length}
  [Symbol.iterator]() {return this.$.values()}

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
  validate() {mapMut(this.$, this.reqVal, this)}
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
