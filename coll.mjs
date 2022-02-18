import * as l from './lang.mjs'

export function bset(val) {return new Bset(val)}
export function bsetOf(...val) {return Bset.of(...val)}

export class Bset extends Set {
  constructor(val) {super().mut(val)}

  mut(val) {
    if (l.isNil(val)) return this
    if (l.isIter(val)) return this.mutFromIter(val)
    throw l.errInst(val, this)
  }

  mutFromIter(src) {
    for (const val of l.reqIter(src)) this.add(val)
    return this
  }

  map(fun, self) {
    l.reqFun(fun)
    const out = []
    for (const val of this.values()) {
      out.push(fun.call(self, val, val, this))
    }
    return out
  }

  filter(fun, self) {
    l.reqFun(fun)
    const out = []
    for (const val of this.values()) {
      if (fun.call(self, val, val, this)) out.push(val)
    }
    return out
  }

  toArray() {
    const out = []
    for (const val of this.values()) out.push(val)
    return out
  }

  toJSON() {return this.toArray()}

  static of(...val) {return new this(val)}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class ClsSet extends Bset {
  get cls() {return Object}
  add(val) {return super.add(l.toInst(val, this.cls))}
}

export function bmap(val) {return new Bmap(val)}
export function bmapOf(...val) {return Bmap.of(...val)}

export class Bmap extends Map {
  constructor(val) {super().mut(val)}

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

  map(fun, self) {
    l.reqFun(fun)
    const out = []
    for (const [key, val] of this.entries()) {
      out.push(fun.call(self, val, key, this))
    }
    return out
  }

  filter(fun, self) {
    l.reqFun(fun)
    const out = []
    for (const [key, val] of this.entries()) {
      if (fun.call(self, val, key, this)) out.push(val)
    }
    return out
  }

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

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class ClsMap extends Bmap {
  get cls() {return Object}
  set(key, val) {super.set(key, l.toInst(val, this.cls))}
}

// Short for "primary key optional".
export function pkOpt(val) {return l.hasMeth(val, `pk`) ? val.pk() : undefined}

// Short for "primary key".
export function pk(val) {
  const key = pkOpt(val)
  if (l.isSome(key)) return key
  throw TypeError(`unable to get primary key of ${l.show(val)}`)
}

export class Coll extends Bmap {
  mut(val) {
    if (l.isSome(val)) for (val of l.reqIter(val)) this.add(val)
    return this
  }

  add(val) {
    this.set(pk(val), val)
    return this
  }

  addOpt(val) {
    const key = pkOpt(val)
    if (l.isSome(key)) this.set(key, val)
    return this
  }

  [Symbol.iterator]() {return super.values()}
}

export class ClsColl extends Coll {
  get cls() {return Object}
  set(key, val) {return super.set(key, l.reqInst(val, this.cls))}
  add(val) {return super.add(l.toInst(val, this.cls))}
  addOpt(val) {return super.addOpt(l.toInst(val, this.cls))}
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

  get [Symbol.toStringTag]() {return this.constructor.name}
}
