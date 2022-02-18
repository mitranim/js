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
const shallowStrict = o.strict(new Shallow())

function isEven(val) {return !(val % 2)}

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

t.bench(function bench_assign_Object_assign() {l.reqDict(Object.assign(l.npo(), itc.numDict))})
t.bench(function bench_assign_our_assign() {l.reqDict(o.assign(l.npo(), itc.numDict))})
t.bench(function bench_assign_our_patch() {l.reqDict(o.patch(l.npo(), itc.numDict))})
t.bench(function bench_assign_lodash_assign() {l.reqDict(lo.assign(l.npo(), itc.numDict))})

itc.deoptDictHof(o.mapDict)
itc.deoptDictHof(lo.mapValues)
itc.deoptDictHof(o.pick)
itc.deoptDictHof(lo.pickBy)
itc.deoptDictHof(o.omit)
itc.deoptDictHof(lo.omitBy)
t.bench(function bench_map_dict_our_mapDict() {l.reqDict(o.mapDict(itc.numDict, l.inc))})
t.bench(function bench_map_dict_lodash_mapValues() {l.reqDict(lo.mapValues(itc.numDict, l.inc))})
t.bench(function bench_pick_our_pick() {l.reqDict(o.pick(itc.numDict, isEven))})
t.bench(function bench_pick_lodash_pickBy() {l.reqDict(lo.pickBy(itc.numDict, isEven))})
t.bench(function bench_omit_our_omit() {l.reqDict(o.omit(itc.numDict, isEven))})
t.bench(function bench_omit_lodash_omitBy() {l.reqDict(lo.omitBy(itc.numDict, isEven))})

t.bench(function bench_pickKeys_our_pickKeys() {l.reqDict(o.pickKeys(itc.numDict, itc.knownKeys))})
t.bench(function bench_pickKeys_lodash_pick() {l.reqDict(lo.pick(itc.numDict, itc.knownKeys))})
t.bench(function bench_omitKeys_our_omitKeys() {l.reqDict(o.omitKeys(itc.numDict, itc.knownKeys))})
t.bench(function bench_omitKeys_lodash_omit() {l.reqDict(lo.omit(itc.numDict, itc.knownKeys))})

const frozen = freeze({})
t.bench(function bench_object_freeze_new() {l.nop(freeze({}))})
t.bench(function bench_object_freeze_frozen() {l.nop(freeze(frozen))})

if (import.meta.main) t.deopt(), t.benches()
