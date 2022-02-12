import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'

/* Global */

const someArr = []
const someProm = Promise.resolve()
const someDate = new Date(1024)
const dictEmpty = Object.freeze(l.npo())
const someStr = `hello world`

class DateSub extends Date {
  constructor(val) {
    super(val)

    // eslint-disable-next-line no-self-assign
    // deno-lint-ignore no-self-assign
    this.toISOString = this.toISOString
  }
}

const someDateSub = new DateSub(1024)

class Shallow {
  constructor() {
    this.toISOString = Date.prototype.toISOString
  }
}

const shallow = new Shallow()

/* Util */

function* gen(iter) {if (iter) for (const val of iter) yield val}

function isInstChecked(val, cls) {
  return val != null && typeof val === `object` && val instanceof cls
}

function isInstUnchecked(val, cls) {return val instanceof cls}

function isPromiseAsm(val) {
  return (
    val != null &&
    typeof val === `object` &&
    `then` in val &&
    typeof val.then === `function`
  )
}

function reqStrDirect(val) {return l.isStr(val) ? val : l.convFun(val, l.isStr)}
function reqStrIndirect(val) {return l.req(val, l.isStr)}

function keysDumb(val) {return Object.keys(l.laxStruct(val))}
function keysTricky(val) {return l.isNil(val) ? [] : Object.keys(l.reqStruct(val))}

/* Bench */

t.bench(function bench_isInst_inline_nil() {l.nop(undefined instanceof Promise)})
t.bench(function bench_isInst_inline_miss() {l.nop(someProm instanceof Array)})
t.bench(function bench_isInst_inline_hit() {l.nop(someProm instanceof Promise)})

t.bench(function bench_isInst_checked_nil() {l.nop(isInstChecked(undefined, Promise))})
t.bench(function bench_isInst_checked_miss() {l.nop(isInstChecked(someProm, Array))})
t.bench(function bench_isInst_checked_hit() {l.nop(isInstChecked(someProm, Promise))})

t.bench(function bench_isInst_unchecked_nil() {l.nop(isInstUnchecked(undefined, Promise))})
t.bench(function bench_isInst_unchecked_miss() {l.nop(isInstUnchecked(someProm, Array))})
t.bench(function bench_isInst_unchecked_hit() {l.nop(isInstUnchecked(someProm, Promise))})

t.bench(function bench_isInst_nil() {l.nop(l.isInst(undefined, Promise))})
t.bench(function bench_isInst_miss() {l.nop(l.isInst(someProm, Array))})
t.bench(function bench_isInst_hit() {l.nop(l.isInst(someProm, Promise))})

t.bench(function bench_isStr_nil() {l.nop(l.isStr())})
t.bench(function bench_isStr_miss() {l.nop(l.isStr(someArr))})
t.bench(function bench_isStr_hit() {l.nop(l.isStr(someStr))})

/*
This benchmark may be misleading. The "indirect" version seems to perform almost
as well when defined in the same module as the benchmark. When moved to another
module, it gets slower by several nanoseconds, which can make it ≈10 times
slower than the direct version.
*/
t.bench(function bench_reqStrIndirect() {l.nop(reqStrIndirect(someStr))})
t.bench(function bench_reqStrDirect() {l.nop(reqStrDirect(someStr))})
t.bench(function bench_reqStr() {l.nop(l.reqStr(someStr))})

t.bench(function bench_isArr_native_nil() {l.nop(Array.isArray())})
t.bench(function bench_isArr_native_miss() {l.nop(Array.isArray(someProm))})
t.bench(function bench_isArr_native_hit() {l.nop(Array.isArray(someArr))})

// Note: this is incorrect and our tests verify that we don't do this.
t.bench(function bench_isArr_inst_nil() {l.nop(undefined instanceof Array)})
t.bench(function bench_isArr_inst_miss() {l.nop(someProm instanceof Array)})
t.bench(function bench_isArr_inst_hit() {l.nop(someArr instanceof Array)})

t.bench(function bench_isArr_nil() {l.nop(l.isArr())})
t.bench(function bench_isArr_miss() {l.nop(l.isArr(someProm))})
t.bench(function bench_isArr_hit() {l.nop(l.isArr(someArr))})

t.bench(function bench_isList_nil() {l.nop(l.isList())})
t.bench(function bench_isList_miss() {l.nop(l.isList(someProm))})
t.bench(function bench_isList_hit() {l.nop(l.isList(someArr))})

t.bench(function bench_isPromise_asm_nil() {l.nop(isPromiseAsm())})
t.bench(function bench_isPromise_asm_miss() {l.nop(isPromiseAsm(someArr))})
t.bench(function bench_isPromise_asm_hit() {l.nop(isPromiseAsm(someProm))})

t.bench(function bench_isPromise_nil() {l.nop(l.isPromise())})
t.bench(function bench_isPromise_miss_prim() {l.nop(l.isPromise(someStr))})
t.bench(function bench_isPromise_miss_obj() {l.nop(l.isPromise(someArr))})
t.bench(function bench_isPromise_hit() {l.nop(l.isPromise(someProm))})

t.bench(function bench_hasMeth_nil() {l.nop(l.hasMeth(undefined, `toISOString`))})
t.bench(function bench_hasMeth_miss_prim() {l.nop(l.hasMeth(someStr, `toISOString`))})
t.bench(function bench_hasMeth_miss_fun() {l.nop(l.hasMeth(l.nop, `toISOString`))})
t.bench(function bench_hasMeth_miss_obj() {l.nop(l.hasMeth(someArr, `toISOString`))})
t.bench(function bench_hasMeth_hit_inherit() {l.nop(l.hasMeth(someDate, `toISOString`))})
t.bench(function bench_hasMeth_hit_own() {l.nop(l.hasMeth(someDateSub, `toISOString`))})
t.bench(function bench_hasMeth_hit_own_shallow() {l.nop(l.hasMeth(shallow, `toISOString`))})

t.bench(function bench_hasIn_nil() {l.nop(l.hasIn(undefined, `toISOString`))})
t.bench(function bench_hasIn_miss_prim() {l.nop(l.hasIn(someStr, `toISOString`))})
t.bench(function bench_hasIn_miss_fun() {l.nop(l.hasIn(l.nop, `toISOString`))})
t.bench(function bench_hasIn_miss_obj() {l.nop(l.hasIn(someArr, `toISOString`))})
t.bench(function bench_hasIn_hit_inherit() {l.nop(l.hasIn(someDate, `toISOString`))})
t.bench(function bench_hasIn_hit_own() {l.nop(l.hasIn(someDateSub, `toISOString`))})
t.bench(function bench_hasIn_hit_own_shallow() {l.nop(l.hasIn(shallow, `toISOString`))})

t.bench(function bench_hasOwn_nil() {l.nop(l.hasOwn(undefined, `toISOString`))})
t.bench(function bench_hasOwn_miss_prim() {l.nop(l.hasOwn(someStr, `toISOString`))})
t.bench(function bench_hasOwn_miss_fun() {l.nop(l.hasOwn(l.nop, `toISOString`))})
t.bench(function bench_hasOwn_miss_obj() {l.nop(l.hasOwn(someArr, `toISOString`))})
t.bench(function bench_hasOwn_miss_inherit() {l.nop(l.hasOwn(someDate, `toISOString`))})
t.bench(function bench_hasOwn_hit() {l.nop(l.hasOwn(someDateSub, `toISOString`))})

t.bench(function bench_hasOwnEnum_nil() {l.nop(l.hasOwnEnum(undefined, `toISOString`))})
t.bench(function bench_hasOwnEnum_miss_prim() {l.nop(l.hasOwnEnum(someStr, `toISOString`))})
t.bench(function bench_hasOwnEnum_miss_fun() {l.nop(l.hasOwnEnum(l.nop, `toISOString`))})
t.bench(function bench_hasOwnEnum_miss_obj() {l.nop(l.hasOwnEnum(someArr, `toISOString`))})
t.bench(function bench_hasOwnEnum_miss_inherit() {l.nop(l.hasOwnEnum(someDate, `toISOString`))})
t.bench(function bench_hasOwnEnum_hit() {l.nop(l.hasOwnEnum(someDateSub, `toISOString`))})

t.bench(function bench_reqGet_hit_inherit() {l.nop(l.reqGet(someDate, `toISOString`))})
t.bench(function bench_reqGet_hit_own() {l.nop(l.reqGet(someDateSub, `toISOString`))})
t.bench(function bench_reqGet_hit_own_shallow() {l.nop(l.reqGet(shallow, `toISOString`))})

const emptyDict = {}
const emptyArr = []
const emptyGen = gen()
t.bench(function bench_show_dict() {l.nop(l.show(emptyDict))})
t.bench(function bench_show_arr() {l.nop(l.show(emptyArr))})
t.bench(function bench_show_gen() {l.nop(l.show(emptyGen))})
t.bench(function bench_show_prom() {l.nop(l.show(someProm))})
t.bench(function bench_show_prim() {l.nop(l.show(10))})
t.bench(function bench_show_fun() {l.nop(l.show(l.nop))})

t.bench(function bench_render_bool() {l.nop(l.render(true))})
t.bench(function bench_render_num() {l.nop(l.render(10))})
t.bench(function bench_render_str() {l.nop(l.render(`str`))})
t.bench(function bench_render_date() {l.nop(l.render(someDate))})

t.bench(function bench_keys_nil_dumb() {l.nop(keysDumb())})
t.bench(function bench_keys_nil_tricky() {l.nop(keysTricky())})

t.bench(function bench_keys_empty_dumb() {l.nop(keysDumb(dictEmpty))})
t.bench(function bench_keys_empty_tricky() {l.nop(keysTricky(dictEmpty))})

if (import.meta.main) t.deopt(), t.benches()
