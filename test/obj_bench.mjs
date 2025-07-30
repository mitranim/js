// deno-lint-ignore-file getter-return

import './internal_test_init.mjs'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as o from '../obj.mjs'

const lo = globalThis.Deno
  ? (await import(`npm:lodash`)).default
  : await import(`lodash`)

/* Global */

const emptyNpoNotFrozen = Object.create(null)
const emptyNpoFrozen = Object.freeze(Object.create(null))

const emptyDictNotFrozen = {}
const emptyDictFrozen = Object.freeze({})

const emptyEmpNotFrozen = new l.Emp()
const emptyEmpFrozen = Object.freeze(new l.Emp())

class MemGet {
  static {o.memGet(this)}
  get one() {}
  get two() {}
  get three() {}
}

const memGet = new MemGet()
l.nop(memGet.one)
Object.freeze(memGet)

class Shallow {
  constructor() {
    this.one = 10
    this.two = 20
    this.three = 30
  }
}

const shallowLax = new Shallow()

class NonEnumDefprop {
  constructor(val) {
    Object.defineProperty(this, `key`, {
      value: val,
      writable: true,
      enumerable: false,
      configurable: true,
    })
  }

  set(val) {return (this.key = val), this}
  get() {return this.key}
}

const keySym = Symbol.for(`key`)

class NonEnumSym {
  constructor(val) {this[keySym] = val}
  set(val) {return (this[keySym] = val), this}
  get() {return this[keySym]}
}

class NonEnumPriv {
  #val = undefined
  constructor(val) {this.#val = val}
  set(val) {return (this.#val = val), this}
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

const structSpec = {
  one: l.reqNum,
  two: l.reqStr,
  three: l.reqNum,
  four: l.reqStr,
  five: l.reqNum,
  six: l.reqStr,
}

class StructLax extends o.MixStructLax(l.Emp) {}

t.own(new StructLax(structSrc), structSrc)

class StructDeclaredLax extends StructLax {static spec = structSpec}

t.own(new StructDeclaredLax(structSrc), structSrc)

class StructDeclared extends o.MixStruct(l.Emp) {static spec = structSpec}

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
const resource = Function(`return {use() {}, deinit() {}}`)()

/* Bench */

t.bench(function bench_cls_def() {
  l.nop(class {
    get one() {}
    get two() {}
    get three() {}
  })
})

t.bench(function bench_memGet_init_call() {
  l.nop(o.memGet(class MemGet {
    get one() {}
    get two() {}
    get three() {}
  }))
})

t.bench(function bench_memGet_init_static_block() {
  l.nop(class MemGet {
    static {o.memGet(this)}
    get one() {}
    get two() {}
    get three() {}
  })
})

t.bench(function bench_memGet_new() {l.nop(new MemGet())})
t.bench(function bench_memGet_replace() {l.nop(new MemGet().one)})
t.bench(function bench_memGet_access_replaced() {l.nop(memGet.one)})

t.bench(function bench_Object_getOwnPropertyDescriptor_miss() {
  l.nop(Object.getOwnPropertyDescriptor(shallowLax, `four`))
})

t.bench(function bench_Object_getOwnPropertyDescriptor_hit() {
  l.nop(Object.getOwnPropertyDescriptor(shallowLax, `one`))
})

t.bench(function bench_Object_getPrototypeOf() {
  l.nop(Object.getPrototypeOf(shallowLax))
})

/*
- Deno 2.4.2: our `assign` is far faster than the other options.
- Bun 1.2.19: `Object.assign` is fastest by far (faster than the above).
*/
t.bench(function bench_assign_object_spread() {l.reqRec({...itc.numDict})})
t.bench(function bench_assign_Object_assign() {l.reqRec(Object.assign(Object.create(null), itc.numDict))})
t.bench(function bench_assign_lodash_assign() {l.reqRec(lo.assign(Object.create(null), itc.numDict))})
t.bench(function bench_assign_our_assign() {l.reqRec(o.assign(Object.create(null), itc.numDict))})
t.bench(function bench_assign_our_patch() {l.reqRec(o.patch(Object.create(null), itc.numDict))})

t.bench(function bench_Object_isFrozen_miss_npo() {l.nop(Object.isFrozen(emptyNpoNotFrozen))})
t.bench(function bench_Object_isFrozen_miss_dict() {l.nop(Object.isFrozen(emptyDictNotFrozen))})
t.bench(function bench_Object_isFrozen_miss_emp() {l.nop(Object.isFrozen(emptyEmpNotFrozen))})

t.bench(function bench_Object_isFrozen_hit_npo() {l.nop(Object.isFrozen(emptyNpoFrozen))})
t.bench(function bench_Object_isFrozen_hit_dict() {l.nop(Object.isFrozen(emptyDictFrozen))})
t.bench(function bench_Object_isFrozen_hit_emp() {l.nop(Object.isFrozen(emptyEmpFrozen))})

t.bench(function bench_Object_freeze_npo_new() {l.nop(Object.freeze(Object.create(null)))})
t.bench(function bench_Object_freeze_dict_new() {l.nop(Object.freeze({}))})
t.bench(function bench_Object_freeze_emp_new() {l.nop(Object.freeze(new l.Emp()))})

t.bench(function bench_Object_freeze_npo_frozen() {l.nop(Object.freeze(emptyNpoFrozen))})
t.bench(function bench_Object_freeze_dict_frozen() {l.nop(Object.freeze(emptyDictFrozen))})
t.bench(function bench_Object_freeze_emp_frozen() {l.nop(Object.freeze(emptyEmpFrozen))})

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

t.bench(function bench_struct_new_undeclared_lax() {l.nop(new StructLax(structSrc))})
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

t.bench(function bench_deinit_resource_try_finally() {
  try {resource.use()}
  finally {resource.deinit()}
})

t.bench(function bench_deinit_resource_for_of() {
  for (const _ of o.resource(resource));
})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
