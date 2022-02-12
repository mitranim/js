import * as l from './lang.mjs'
import * as i from './iter.mjs'

// Short for "primary key optional".
export function pkOpt(val) {return l.hasMeth(val, `pk`) ? val.pk() : undefined}

// Short for "primary key".
export function pk(val) {
  const key = pkOpt(val)
  if (l.isSome(key)) return key
  throw TypeError(`unable to get primary key of ${l.show(val)}`)
}

export class Coll extends Map {
  constructor(val) {
    super()
    if (l.isSome(val)) this.add(val)
  }

  add(val) {
    for (val of i.values(val)) this.push(val)
    return this
  }

  push(val) {
    this.set(pk(val), val)
    return this
  }

  pushOpt(val) {
    const key = pkOpt(val)
    if (l.isSome(key)) this.set(key, val)
    return this
  }

  [Symbol.iterator]() {return super.values()}
  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class ClsColl extends Coll {
  get cls() {return Object}
  push(val) {return super.push(l.toInst(val, this.cls))}
  pushOpt(val) {return super.pushOpt(l.toInst(val, this.cls))}
  set(key, val) {return super.set(key, l.reqInst(val, this.cls))}
}
