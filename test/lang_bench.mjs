/* eslint-disable no-self-assign */
// deno-lint-ignore-file no-self-assign

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'

/* Global */

const someInt = 123
const someFrac = 123.456
const someStr = `hello world`
const someDate = new Date(1024)
const someProm = Promise.resolve()

const emptyStr = ``
const emptyArr = []
const emptyPlainDict = {}
const emptyNpo = Object.create(null)
const emptyEmpNotFrozen = new l.Emp()
const emptyEmpFrozen = Object.freeze(new l.Emp())
const emptyGen = gen()
const emptyArgs = function args() {return arguments}()

class DateSub extends Date {
  constructor(...val) {
    super(...val)
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

/*
Word of warning: class prototypes are never null and never completely empty.
It's possible to use symbolic and private methods to avoid collision with
properties, but the prototype always has `.constructor`.
*/
class EmpSub extends l.Emp {}

class EqAlways extends l.Emp {eq() {return true}}
const someEqAlways0 = new EqAlways()
const someEqAlways1 = new EqAlways()

class EqNever extends l.Emp {eq() {return false}}
const someEqNever0 = new EqNever()
const someEqNever1 = new EqNever()

const someNonEq0 = Object.create(null)
const someNonEq1 = Object.create(null)

const prepared = Symbol.for(`prepared`)

/*
Shortcut for making symbol keys via property access.
Kinda slow, avoid in hotspots.
*/
const sym = new Proxy(l.npo(), new class SymPh extends l.Emp {
  get(_, key) {return l.isSym(key) ? key : Symbol.for(key)}
}())

class Symboled extends l.Emp {
  normal(val) {this[Symbol.for(`normal`)](val)}
  [Symbol.for(`normal`)]() {}

  proxied(val) {this[sym.proxied](val)}
  [sym.proxied]() {}

  prepared(val) {this[prepared](val)}
  [prepared]() {}
}

const symboled = new Symboled()

const isSafeInteger = Number.isSafeInteger

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

function reqStrDirect(val) {return l.isStr(val) ? val : l.throwErrFun(val, l.isStr)}
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

t.bench(function bench_reqInst_hit() {l.nop(l.reqInst(someProm, Promise))})

t.bench(function bench_isInt_nil() {l.nop(l.isInt())})
t.bench(function bench_isInt_miss_str() {l.nop(l.isInt(someStr))})
t.bench(function bench_isInt_miss_frac() {l.nop(l.isInt(someFrac))})
t.bench(function bench_isInt_hit() {l.nop(l.isInt(someInt))})

t.bench(function bench_Number_isSafeInteger_nil() {l.nop(Number.isSafeInteger())})
t.bench(function bench_Number_isSafeInteger_miss_str() {l.nop(Number.isSafeInteger(someStr))})
t.bench(function bench_Number_isSafeInteger_miss_frac() {l.nop(Number.isSafeInteger(someFrac))})
t.bench(function bench_Number_isSafeInteger_hit() {l.nop(Number.isSafeInteger(someInt))})

t.bench(function bench_isSafeInteger_nil() {l.nop(isSafeInteger())})
t.bench(function bench_isSafeInteger_miss_str() {l.nop(isSafeInteger(someStr))})
t.bench(function bench_isSafeInteger_miss_frac() {l.nop(isSafeInteger(someFrac))})
t.bench(function bench_isSafeInteger_hit() {l.nop(isSafeInteger(someInt))})

t.bench(function bench_isStr_nil() {l.nop(l.isStr())})
t.bench(function bench_isStr_miss() {l.nop(l.isStr(emptyArr))})
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

t.bench(function bench_isValidStr_nil() {l.nop(l.isValidStr())})
t.bench(function bench_isValidStr_miss_non_str() {l.nop(l.isValidStr(emptyArr))})
t.bench(function bench_isValidStr_miss_empty_str() {l.nop(l.isValidStr(emptyStr))})
t.bench(function bench_isValidStr_hit() {l.nop(l.isValidStr(someStr))})

t.bench(function bench_reqValidStr() {l.nop(l.isValidStr(someStr))})

t.bench(function bench_isFun_nil() {l.nop(l.isFun())})
t.bench(function bench_isFun_miss() {l.nop(l.isFun(someProm))})
t.bench(function bench_isFun_hit() {l.nop(l.isFun(l.isFun))})
t.bench(function bench_reqFun_nil() {l.nop(l.reqFun(l.reqFun))})

t.bench(function bench_isCls_nil() {l.nop(l.isCls())})
t.bench(function bench_isCls_miss() {l.nop(l.isCls(someProm))})
t.bench(function bench_isCls_hit() {l.nop(l.isCls(l.isCls))})
t.bench(function bench_reqCls_nil() {l.nop(l.reqCls(l.Emp))})

t.bench(function bench_isObj_nil() {l.nop(l.isObj())})
t.bench(function bench_isObj_miss_prim() {l.nop(l.isObj(`str`))})
t.bench(function bench_isObj_miss_fun() {l.nop(l.isObj(l.isObj))})
t.bench(function bench_isObj_hit_dict() {l.nop(l.isObj(emptyPlainDict))})
t.bench(function bench_isObj_hit_arr() {l.nop(l.isObj(emptyArr))})

t.bench(function bench_isComp_nil() {l.nop(l.isComp())})
t.bench(function bench_isComp_miss_prim() {l.nop(l.isComp(`str`))})
t.bench(function bench_isComp_hit_dict() {l.nop(l.isComp(emptyPlainDict))})
t.bench(function bench_isComp_hit_arr() {l.nop(l.isComp(emptyArr))})
t.bench(function bench_isComp_hit_fun() {l.nop(l.isComp(l.isComp))})

t.bench(function bench_isArr_native_nil() {l.nop(Array.isArray())})
t.bench(function bench_isArr_native_miss() {l.nop(Array.isArray(someProm))})
t.bench(function bench_isArr_native_hit() {l.nop(Array.isArray(emptyArr))})

// Note: this is incorrect and our tests verify that we don't do this.
t.bench(function bench_isArr_inst_nil() {l.nop(undefined instanceof Array)})
t.bench(function bench_isArr_inst_miss() {l.nop(someProm instanceof Array)})
t.bench(function bench_isArr_inst_hit() {l.nop(emptyArr instanceof Array)})

t.bench(function bench_isArr_nil() {l.nop(l.isArr())})
t.bench(function bench_isArr_miss() {l.nop(l.isArr(someProm))})
t.bench(function bench_isArr_hit() {l.nop(l.isArr(emptyArr))})

t.bench(function bench_isList_nil() {l.nop(l.isList())})
t.bench(function bench_isList_miss_prim() {l.nop(l.isList(`str`))})
t.bench(function bench_isList_miss_obj() {l.nop(l.isList(someProm))})
t.bench(function bench_isList_hit_arr() {l.nop(l.isList(emptyArr))})
t.bench(function bench_isList_hit_args() {l.nop(l.isList(emptyArgs))})

t.bench(function bench_isIter_nil() {l.nop(l.isIter())})
t.bench(function bench_isIter_miss_prim() {l.nop(l.isIter(`str`))})
t.bench(function bench_isIter_miss_obj() {l.nop(l.isIter(someProm))})
t.bench(function bench_isIter_hit_arr() {l.nop(l.isIter(emptyArr))})
t.bench(function bench_isIter_hit_args() {l.nop(l.isIter(emptyArgs))})

t.bench(function bench_isStruct_nil() {l.nop(l.isStruct())})
t.bench(function bench_isStruct_miss() {l.nop(l.isStruct(emptyArr))})
t.bench(function bench_isStruct_hit() {l.nop(l.isStruct(someDate))})

t.bench(function bench_isPromise_asm_nil() {l.nop(isPromiseAsm())})
t.bench(function bench_isPromise_asm_miss() {l.nop(isPromiseAsm(emptyArr))})
t.bench(function bench_isPromise_asm_hit() {l.nop(isPromiseAsm(someProm))})

t.bench(function bench_isPromise_nil() {l.nop(l.isPromise())})
t.bench(function bench_isPromise_miss_prim() {l.nop(l.isPromise(someStr))})
t.bench(function bench_isPromise_miss_obj() {l.nop(l.isPromise(emptyArr))})
t.bench(function bench_isPromise_hit() {l.nop(l.isPromise(someProm))})

t.bench(function bench_isEqable_nil() {l.nop(l.isEqable())})
t.bench(function bench_isEqable_miss_prim() {l.nop(l.isEqable(`str`))})
t.bench(function bench_isEqable_miss_obj() {l.nop(l.isEqable(someProm))})
t.bench(function bench_isEqable_hit() {l.nop(l.isEqable(someEqAlways0))})

t.bench(function bench_hasMeth_nil() {l.nop(l.hasMeth(undefined, `toISOString`))})
t.bench(function bench_hasMeth_miss_prim() {l.nop(l.hasMeth(someStr, `toISOString`))})
t.bench(function bench_hasMeth_miss_fun() {l.nop(l.hasMeth(l.nop, `toISOString`))})
t.bench(function bench_hasMeth_miss_obj() {l.nop(l.hasMeth(emptyArr, `toISOString`))})
t.bench(function bench_hasMeth_hit_inherit() {l.nop(l.hasMeth(someDate, `toISOString`))})
t.bench(function bench_hasMeth_hit_own() {l.nop(l.hasMeth(someDateSub, `toISOString`))})
t.bench(function bench_hasMeth_hit_own_shallow() {l.nop(l.hasMeth(shallow, `toISOString`))})

t.bench(function bench_hasIn_nil() {l.nop(l.hasIn(undefined, `toISOString`))})
t.bench(function bench_hasIn_miss_prim() {l.nop(l.hasIn(someStr, `toISOString`))})
t.bench(function bench_hasIn_miss_fun() {l.nop(l.hasIn(l.nop, `toISOString`))})
t.bench(function bench_hasIn_miss_obj() {l.nop(l.hasIn(emptyArr, `toISOString`))})
t.bench(function bench_hasIn_hit_inherit() {l.nop(l.hasIn(someDate, `toISOString`))})
t.bench(function bench_hasIn_hit_own() {l.nop(l.hasIn(someDateSub, `toISOString`))})
t.bench(function bench_hasIn_hit_own_shallow() {l.nop(l.hasIn(shallow, `toISOString`))})

t.bench(function bench_hasOwn_nil() {l.nop(l.hasOwn(undefined, `toISOString`))})
t.bench(function bench_hasOwn_miss_prim() {l.nop(l.hasOwn(someStr, `toISOString`))})
t.bench(function bench_hasOwn_miss_fun() {l.nop(l.hasOwn(l.nop, `toISOString`))})
t.bench(function bench_hasOwn_miss_obj() {l.nop(l.hasOwn(emptyArr, `toISOString`))})
t.bench(function bench_hasOwn_miss_inherit() {l.nop(l.hasOwn(someDate, `toISOString`))})
t.bench(function bench_hasOwn_hit() {l.nop(l.hasOwn(someDateSub, `toISOString`))})

t.bench(function bench_hasOwnEnum_nil() {l.nop(l.hasOwnEnum(undefined, `toISOString`))})
t.bench(function bench_hasOwnEnum_miss_prim() {l.nop(l.hasOwnEnum(someStr, `toISOString`))})
t.bench(function bench_hasOwnEnum_miss_fun() {l.nop(l.hasOwnEnum(l.nop, `toISOString`))})
t.bench(function bench_hasOwnEnum_miss_obj() {l.nop(l.hasOwnEnum(emptyArr, `toISOString`))})
t.bench(function bench_hasOwnEnum_miss_inherit() {l.nop(l.hasOwnEnum(someDate, `toISOString`))})
t.bench(function bench_hasOwnEnum_hit() {l.nop(l.hasOwnEnum(someDateSub, `toISOString`))})

t.bench(function bench_reqGet_hit_inherit() {l.nop(l.reqGet(someDate, `toISOString`))})
t.bench(function bench_reqGet_hit_own() {l.nop(l.reqGet(someDateSub, `toISOString`))})
t.bench(function bench_reqGet_hit_own_shallow() {l.nop(l.reqGet(shallow, `toISOString`))})

const funs = [l.isNum, l.isStr, l.isFun, l.isBool]
t.bench(function bench_reqOneOf() {l.nop(l.reqOneOf(false, funs))})

t.bench(function bench_show_dict() {l.nop(l.show(emptyPlainDict))})
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

t.bench(function bench_keys_empty_dumb() {l.nop(keysDumb(emptyPlainDict))})
t.bench(function bench_keys_empty_tricky() {l.nop(keysTricky(emptyPlainDict))})

t.bench(function bench_empty_Object_create_null() {l.nop(Object.create(null))})
t.bench(function bench_empty_Object_create_Object_create_null() {l.nop(Object.create(emptyNpo))})
t.bench(function bench_empty_npo() {l.nop(l.npo())})
t.bench(function bench_empty_Emp_new() {l.nop(new l.Emp())})
t.bench(function bench_empty_Emp_sub_new() {l.nop(new EmpSub())})

t.bench(function bench_Object_isFrozen_miss() {l.nop(Object.isFrozen(emptyEmpNotFrozen))})
t.bench(function bench_Object_isFrozen_hit() {l.nop(Object.isFrozen(emptyEmpFrozen))})

t.bench(function bench_eq_miss_prim_nil() {l.nop(l.eq(undefined, null))})
t.bench(function bench_eq_hit_prim_nil() {l.nop(l.eq())})

t.bench(function bench_eq_miss_prim_str() {l.nop(l.eq(`one`, `two`))})
t.bench(function bench_eq_hit_prim_str() {l.nop(l.eq(`one`, `one`))})

t.bench(function bench_eq_miss_prim_num() {l.nop(l.eq(10, 20))})
t.bench(function bench_eq_hit_prim_num() {l.nop(l.eq(10, 10))})

t.bench(function bench_eq_miss_obj_and_prim() {l.nop(l.eq(someProm, undefined))})
t.bench(function bench_eq_miss_prim_and_obj() {l.nop(l.eq(undefined, someProm))})
t.bench(function bench_eq_miss_obj_and_obj_no_eq() {l.nop(l.eq(someNonEq0, someNonEq1))})
t.bench(function bench_eq_miss_obj_and_obj_different_constructor() {l.nop(l.eq(someEqAlways0, someEqNever0))})

t.bench(function bench_eq_hit_obj_same_no_eq() {l.nop(l.eq(someNonEq0, someNonEq0))})
t.bench(function bench_eq_hit_obj_same_has_eq() {l.nop(l.eq(someEqAlways0, someEqAlways0))})
t.bench(function bench_eq_hit_obj_diff_eq_true() {l.nop(l.eq(someEqAlways0, someEqAlways1))})
t.bench(function bench_eq_hit_obj_diff_eq_false() {l.nop(l.eq(someEqNever0, someEqNever1))})

t.bench(function bench_symbol_for_normal() {l.nop(Symbol.for(`hardcoded`))})
t.bench(function bench_symbol_for_proxied() {l.nop(sym.proxied)})

t.bench(function bench_symbol_method_normal() {l.nop(symboled.normal())})
t.bench(function bench_symbol_method_proxied() {l.nop(symboled.proxied())})
t.bench(function bench_symbol_method_prepared() {l.nop(symboled.prepared())})

if (import.meta.main) t.deopt(), t.benches()
