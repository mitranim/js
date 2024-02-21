/* eslint-disable getter-return */
// deno-lint-ignore-file getter-return

import './internal_test_init.mjs'
import * as lo from 'https://cdn.jsdelivr.net/npm/lodash-es/lodash.js'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as o from '../obj.mjs'

/* Global */

const {freeze} = Object

class MemGet {
  get one() {}
  get two() {}
  get three() {}
}
o.memGet(MemGet)

const memGet = new MemGet()
l.nop(memGet.one)
freeze(memGet)

class Shallow {
  constructor() {
    this.one = 10
    this.two = 20
    this.three = 30
  }
}

const shallowLax = new Shallow()
const shallowStrict = new Proxy(new Shallow(), o.StrictStaticPh)

class NonEnumDefprop {
  constructor(val) {
    Object.defineProperty(this, `key`, {
      value: val,
      writable: true,
      enumerable: false,
      configurable: true,
    })
  }

  set(val) {return this.key = val, this}
  get() {return this.key}
}

const keySym = Symbol.for(`key`)

class NonEnumSym {
  constructor(val) {this[keySym] = val}
  set(val) {return this[keySym] = val, this}
  get() {return this[keySym]}
}

class NonEnumPriv {
  #val = undefined
  constructor(val) {this.#val = val}
  set(val) {return this.#val = val, this}
  get() {return this.#val}
}

const nonEnumDefprop = new NonEnumDefprop(10).set(20).set(30)
const nonEnumSym = new NonEnumSym(10).set(20).set(30)
const nonEnumPriv = new NonEnumPriv(10).set(20).set(30)

const structSrc = {
  one: 10,
  two: `20`,
  three: 30,
  four: `40`,
  five: 50,
  six: `60`,
}

t.own(new o.StructLax(structSrc), structSrc)

class StructSpec extends o.StructSpec {
  one   = l.reqNum
  two   = l.reqStr
  three = l.reqNum
  four  = l.reqStr
  five  = l.reqNum
  six   = l.reqStr
}

class StructDeclaredLax extends o.StructLax {
  static get Spec() {return StructSpec}
}

t.own(new StructDeclaredLax(structSrc), structSrc)

class StructDeclared extends o.Struct {
  static get Spec() {return StructSpec}
}

t.own(new StructDeclared(structSrc), structSrc)

const descriptorDict = {
  one: {
    value: 10,
    writable: true,
    enumerable: true,
    configurable: true,
  },
  two: {
    value: 10,
    writable: true,
    enumerable: false,
    configurable: true,
  },
}

const descriptorList = [
  {
    key: `one`,
    value: 10,
    writable: true,
    enumerable: true,
    configurable: true,
  },
  {
    key: `two`,
    value: 10,
    writable: true,
    enumerable: false,
    configurable: true,
  },
]

const empty = Object.freeze(Object.create(null))

/* Bench */

t.bench(function bench_cls_def() {
  l.nop(class {
    get one() {}
    get two() {}
    get three() {}
  })
})

t.bench(function bench_memGet_init() {
  l.nop(o.memGet(class MemGet {
    get one() {}
    get two() {}
    get three() {}
  }))
})

t.bench(function bench_memGet_new() {l.nop(new MemGet())})
t.bench(function bench_memGet_replace() {l.nop(new MemGet().one)})
t.bench(function bench_memGet_access_replaced() {l.nop(memGet.one)})

t.bench(function bench_property_get_unchecked() {l.nop(shallowLax.one)})
t.bench(function bench_property_get_checked_manual() {l.nop(l.reqGet(shallowLax, `one`))})
t.bench(function bench_property_get_checked_by_proxy_own() {l.nop(shallowStrict.one)})
t.bench(function bench_property_get_checked_by_proxy_inherit() {l.nop(shallowStrict.toString)})

t.bench(function bench_Object_getOwnPropertyDescriptor_miss() {
  l.nop(Object.getOwnPropertyDescriptor(shallowLax, `four`))
})

t.bench(function bench_Object_getOwnPropertyDescriptor_hit() {
  l.nop(Object.getOwnPropertyDescriptor(shallowLax, `one`))
})

t.bench(function bench_Object_getPrototypeOf() {
  l.nop(Object.getPrototypeOf(shallowLax))
})

t.bench(function bench_assign_Object_assign() {l.reqStruct(Object.assign(Object.create(null), itc.numDict))})
t.bench(function bench_assign_lodash_assign() {l.reqStruct(lo.assign(Object.create(null), itc.numDict))})
t.bench(function bench_assign_our_assign() {l.reqStruct(o.assign(Object.create(null), itc.numDict))})
t.bench(function bench_assign_our_patch() {l.reqStruct(o.patch(Object.create(null), itc.numDict))})

const frozen = freeze({})
t.bench(function bench_object_freeze_new() {l.nop(freeze({}))})
t.bench(function bench_object_freeze_frozen() {l.nop(freeze(frozen))})

/*
Results in V8 at the time of writing:

  * `Object.defineProperty` is incredibly slow to execute.
  * Other differences are insignificant.

Conclusion: hide fields via symbols or #private, not `Object.defineProperty`.
*/
t.bench(function bench_non_enum_construct_defprop() {l.nop(new NonEnumDefprop(10))})
t.bench(function bench_non_enum_construct_sym() {l.nop(new NonEnumSym(10))})
t.bench(function bench_non_enum_construct_priv() {l.nop(new NonEnumPriv(10))})

t.bench(function bench_non_enum_set_defprop() {l.nop(nonEnumDefprop.set(40))})
t.bench(function bench_non_enum_set_sym() {l.nop(nonEnumSym.set(40))})
t.bench(function bench_non_enum_set_priv() {l.nop(nonEnumPriv.set(40))})

t.bench(function bench_non_enum_get_defprop() {l.nop(nonEnumDefprop.get())})
t.bench(function bench_non_enum_get_sym() {l.nop(nonEnumSym.get())})
t.bench(function bench_non_enum_get_priv() {l.nop(nonEnumPriv.get())})

t.bench(function bench_non_enum_construct_get_defprop() {l.nop(new NonEnumDefprop(10).get())})
t.bench(function bench_non_enum_construct_get_sym() {l.nop(new NonEnumSym(10).get())})
t.bench(function bench_non_enum_construct_get_priv() {l.nop(new NonEnumPriv(10).get())})

t.bench(function bench_non_enum_construct_set_get_defprop() {l.nop(new NonEnumDefprop(10).set(20).get())})
t.bench(function bench_non_enum_construct_set_get_sym() {l.nop(new NonEnumSym(10).set(20).get())})
t.bench(function bench_non_enum_construct_set_get_priv() {l.nop(new NonEnumPriv(10).set(20).get())})

t.bench(function bench_struct_new_undeclared_lax() {l.nop(new o.StructLax(structSrc))})
t.bench(function bench_struct_new_declared_lax() {l.nop(new StructDeclaredLax(structSrc))})
t.bench(function bench_struct_new_declared() {l.nop(new StructDeclared(structSrc))})

// For comparison with `Struct` instantiation.
t.bench(function bench_struct_assign_Object_assign() {l.nop(Object.assign(Object.create(null), structSrc))})
t.bench(function bench_struct_assign_lodash_assign() {l.nop(lo.assign(Object.create(null), structSrc))})
t.bench(function bench_struct_assign_our_assign() {l.nop(o.assign(Object.create(null), structSrc))})
t.bench(function bench_struct_assign_our_patch() {l.nop(o.patch(Object.create(null), structSrc))})

t.bench(function bench_define_properties_from_dict_empty() {
  Object.defineProperties(Object.create(null), empty)
})

t.bench(function bench_define_properties_from_dict() {
  Object.defineProperties(Object.create(null), descriptorDict)
})

t.bench(function bench_define_properties_from_list() {
  const tar = Object.create(null)
  for (const desc of descriptorList) Object.defineProperty(tar, desc.key, desc)
})

if (import.meta.main) t.deopt(), t.benches()
