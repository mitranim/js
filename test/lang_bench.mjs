/* eslint-disable no-self-assign */
// deno-lint-ignore-file no-self-assign

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'

/* Global */

const someIntNat = 123
const someIntNeg = -123
const someFrac = 123.456
const someStr = `hello world`
const someDate = new Date(1024)
const somePromNative = Promise.resolve()

class Prom extends l.Emp {then() {return new this.constructor()}}

const somePromCustom = new Prom()

class IterSimple extends l.Emp {
  [Symbol.iterator]() {throw Error(`unreachable`)}
}

const emptyStr = ``
const emptyArr = []
const emptyPlainDict = {}
const emptyNpo = Object.create(null)
const emptyEmpNotFrozen = new l.Emp()
const emptyEmpFrozen = Object.freeze(new l.Emp())
const emptyGen = gen()
const emptyArgs = function args() {return arguments}()
const emptySet = new Set()
const emptyIterSimple = new IterSimple()

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

const symPrepared = Symbol.for(`prepared`)

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

  prepared(val) {this[symPrepared](val)}
  [symPrepared]() {}
}

const symboled = new Symboled()

const someSymbol0 = Symbol.for(`some_symbol_0`)
const someSymbol1 = Symbol.for(`some_symbol_1`)
const someSymbol2 = Symbol.for(`some_symbol_0`) // Not a typo. See the test below.

const isSafeInteger = Number.isSafeInteger

function isPromiseInst(val) {return l.isInst(val, Promise)}

const miscVals = [
  emptyStr,
  emptyArr,
  emptyPlainDict,
  emptyNpo,
  emptyEmpNotFrozen,
  emptyEmpFrozen,
  emptyGen,
  emptyArgs,
  emptySet,
  emptyIterSimple,
  somePromCustom,
  somePromNative,
  someDateSub,
  someDateSub,
  symPrepared,
  someEqAlways0,
  someEqAlways1,
  someEqNever0,
  someEqNever1,
  someNonEq0,
  someNonEq1,
  shallow,
  symboled,
  Object.create(emptyArr),
  Object.create(l.npo),
]

/* Util */

function* gen(iter) {if (iter) for (const val of iter) yield val}

function isInstChecked(val, cls) {
  return val != null && typeof val === `object` && val instanceof cls
}

function isInstUnchecked(val, cls) {return val instanceof cls}

function isPromiseAsm(val) {
  return (
    (val != null) &&
    ((typeof val) === `object`) &&
    (`then` in val) &&
    ((typeof val.then) === `function`)
  )
}


function reqStrDirect(val) {return l.isStr(val) ? val : l.throwErrFun(val, l.isStr)}
function reqStrIndirect(val) {return l.req(val, l.isStr)}

function keysDumb(val) {return Object.keys(l.laxStruct(val))}
function keysTricky(val) {return l.isNil(val) ? [] : Object.keys(l.reqStruct(val))}

/* Bench */

t.bench(function bench_is_Object_is() {l.nop(Object.is(123, 456))})
t.bench(function bench_is_globalThis_Object_is() {l.nop(globalThis.Object.is(123, 456))})
t.bench(function bench_is_our_is() {l.nop(l.is(123, 456))})

t.bench(function bench_isInst_inline_nil() {l.nop(undefined instanceof Promise)})
t.bench(function bench_isInst_inline_miss() {l.nop(somePromNative instanceof Array)})
t.bench(function bench_isInst_inline_hit() {l.nop(somePromNative instanceof Promise)})

t.bench(function bench_isInst_checked_nil() {l.nop(isInstChecked(undefined, Promise))})
t.bench(function bench_isInst_checked_miss() {l.nop(isInstChecked(somePromNative, Array))})
t.bench(function bench_isInst_checked_hit() {l.nop(isInstChecked(somePromNative, Promise))})

t.bench(function bench_isInst_unchecked_nil() {l.nop(isInstUnchecked(undefined, Promise))})
t.bench(function bench_isInst_unchecked_miss() {l.nop(isInstUnchecked(somePromNative, Array))})
t.bench(function bench_isInst_unchecked_hit() {l.nop(isInstUnchecked(somePromNative, Promise))})

t.bench(function bench_isInst_nil() {l.nop(l.isInst(undefined, Promise))})
t.bench(function bench_isInst_miss() {l.nop(l.isInst(somePromNative, Array))})
t.bench(function bench_isInst_hit() {l.nop(l.isInst(somePromNative, Promise))})

t.bench(function bench_reqInst_hit() {l.nop(l.reqInst(somePromNative, Promise))})

miscVals.forEach(l.isFin)
t.bench(function bench_isFin_nil() {l.nop(l.isFin())})
t.bench(function bench_isFin_miss_str() {l.nop(l.isFin(someStr))})
t.bench(function bench_isFin_miss_frac() {l.nop(l.isFin(someFrac))})
t.bench(function bench_isFin_hit() {l.nop(l.isFin(someIntNat))})

miscVals.forEach(l.isInt)
t.bench(function bench_isInt_nil() {l.nop(l.isInt())})
t.bench(function bench_isInt_miss_str() {l.nop(l.isInt(someStr))})
t.bench(function bench_isInt_miss_frac() {l.nop(l.isInt(someFrac))})
t.bench(function bench_isInt_hit() {l.nop(l.isInt(someIntNat))})

miscVals.forEach(l.isNat)
t.bench(function bench_isNat_nil() {l.nop(l.isNat())})
t.bench(function bench_isNat_miss_str() {l.nop(l.isNat(someStr))})
t.bench(function bench_isNat_miss_frac() {l.nop(l.isNat(someFrac))})
t.bench(function bench_isNat_miss_int_neg() {l.nop(l.isNat(someIntNeg))})
t.bench(function bench_isNat_hit() {l.nop(l.isNat(someIntNat))})

t.bench(function bench_Number_isSafeInteger_nil() {l.nop(Number.isSafeInteger())})
t.bench(function bench_Number_isSafeInteger_miss_str() {l.nop(Number.isSafeInteger(someStr))})
t.bench(function bench_Number_isSafeInteger_miss_frac() {l.nop(Number.isSafeInteger(someFrac))})
t.bench(function bench_Number_isSafeInteger_hit() {l.nop(Number.isSafeInteger(someIntNat))})

miscVals.forEach(isSafeInteger)
t.bench(function bench_isSafeInteger_nil() {l.nop(isSafeInteger())})
t.bench(function bench_isSafeInteger_miss_str() {l.nop(isSafeInteger(someStr))})
t.bench(function bench_isSafeInteger_miss_frac() {l.nop(isSafeInteger(someFrac))})
t.bench(function bench_isSafeInteger_hit() {l.nop(isSafeInteger(someIntNat))})

miscVals.forEach(l.isStr)
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

miscVals.forEach(l.isValidStr)
t.bench(function bench_isValidStr_nil() {l.nop(l.isValidStr())})
t.bench(function bench_isValidStr_miss_non_str() {l.nop(l.isValidStr(emptyArr))})
t.bench(function bench_isValidStr_miss_empty_str() {l.nop(l.isValidStr(emptyStr))})
t.bench(function bench_isValidStr_hit() {l.nop(l.isValidStr(someStr))})

t.bench(function bench_reqValidStr() {l.nop(l.isValidStr(someStr))})

miscVals.forEach(l.isFun)
t.bench(function bench_isFun_nil() {l.nop(l.isFun())})
t.bench(function bench_isFun_miss() {l.nop(l.isFun(somePromNative))})
t.bench(function bench_isFun_hit() {l.nop(l.isFun(l.isFun))})
t.bench(function bench_reqFun_nil() {l.nop(l.reqFun(l.reqFun))})

miscVals.forEach(l.isCls)
t.bench(function bench_isCls_nil() {l.nop(l.isCls())})
t.bench(function bench_isCls_miss() {l.nop(l.isCls(somePromNative))})
t.bench(function bench_isCls_hit() {l.nop(l.isCls(l.isCls))})
t.bench(function bench_reqCls_nil() {l.nop(l.reqCls(l.Emp))})

miscVals.forEach(l.isComp)
t.bench(function bench_isComp_nil() {l.nop(l.isComp())})
t.bench(function bench_isComp_miss_prim() {l.nop(l.isComp(`str`))})
t.bench(function bench_isComp_hit_dict() {l.nop(l.isComp(emptyPlainDict))})
t.bench(function bench_isComp_hit_arr() {l.nop(l.isComp(emptyArr))})
t.bench(function bench_isComp_hit_fun() {l.nop(l.isComp(l.isComp))})

miscVals.forEach(l.isObj)
t.bench(function bench_isObj_nil() {l.nop(l.isObj())})
t.bench(function bench_isObj_miss_prim() {l.nop(l.isObj(`str`))})
t.bench(function bench_isObj_miss_fun() {l.nop(l.isObj(l.isObj))})
t.bench(function bench_isObj_hit_dict() {l.nop(l.isObj(emptyPlainDict))})
t.bench(function bench_isObj_hit_arr() {l.nop(l.isObj(emptyArr))})

/*
Note: this approach is incorrect and our tests verify that we don't do this.
This produces false positives for `Object.create([])` and such.
*/
t.bench(function bench_isArr_inst_nil() {l.nop(undefined instanceof Array)})
t.bench(function bench_isArr_inst_miss() {l.nop(somePromNative instanceof Array)})
t.bench(function bench_isArr_inst_hit() {l.nop(emptyArr instanceof Array)})

miscVals.forEach(Array.isArray)
t.bench(function bench_isArr_native_nil() {l.nop(Array.isArray())})
t.bench(function bench_isArr_native_miss() {l.nop(Array.isArray(somePromNative))})
t.bench(function bench_isArr_native_hit() {l.nop(Array.isArray(emptyArr))})

miscVals.forEach(l.isArr)
t.bench(function bench_isArr_nil() {l.nop(l.isArr())})
t.bench(function bench_isArr_miss() {l.nop(l.isArr(somePromNative))})
t.bench(function bench_isArr_hit() {l.nop(l.isArr(emptyArr))})

miscVals.forEach(l.isList)
t.bench(function bench_isList_nil() {l.nop(l.isList())})
t.bench(function bench_isList_miss_prim() {l.nop(l.isList(`str`))})
t.bench(function bench_isList_miss_obj() {l.nop(l.isList(somePromNative))})
t.bench(function bench_isList_hit_arr() {l.nop(l.isList(emptyArr))})
t.bench(function bench_isList_hit_args() {l.nop(l.isList(emptyArgs))})

miscVals.forEach(l.isIter)
t.bench(function bench_isIter_nil() {l.nop(l.isIter())})
t.bench(function bench_isIter_miss_prim() {l.nop(l.isIter(`str`))})
t.bench(function bench_isIter_miss_obj() {l.nop(l.isIter(somePromNative))})
t.bench(function bench_isIter_hit_arr() {l.nop(l.isIter(emptyArr))})
t.bench(function bench_isIter_hit_args() {l.nop(l.isIter(emptyArgs))})

miscVals.forEach(l.isDict)
t.bench(function bench_isDict_nil() {l.nop(l.isDict())})
t.bench(function bench_isDict_miss_prim() {l.nop(l.isDict(`str`))})
t.bench(function bench_isDict_miss_fun() {l.nop(l.isDict(l.isDict))})
t.bench(function bench_isDict_miss_arr() {l.nop(l.isDict(emptyArr))})
t.bench(function bench_isDict_miss_obj() {l.nop(l.isDict(shallow))})
t.bench(function bench_isDict_hit_npo() {l.nop(l.isDict(emptyNpo))})
t.bench(function bench_isDict_hit_dict() {l.nop(l.isDict(emptyPlainDict))})

miscVals.forEach(l.isStruct)
t.bench(function bench_isStruct_nil() {l.nop(l.isStruct())})
t.bench(function bench_isStruct_miss() {l.nop(l.isStruct(emptyArr))})
t.bench(function bench_isStruct_hit() {l.nop(l.isStruct(someDate))})

miscVals.forEach(l.isSeq)
t.bench(function bench_isSeq_nil() {l.nop(l.isSeq())})
t.bench(function bench_isSeq_miss() {l.nop(l.isSeq(somePromNative))})
t.bench(function bench_isSeq_hit_arr() {l.nop(l.isSeq(emptyArr))})
t.bench(function bench_isSeq_hit_set() {l.nop(l.isSeq(emptySet))})
t.bench(function bench_isSeq_hit_iter() {l.nop(l.isSeq(emptyIterSimple))})

miscVals.forEach(isPromiseInst)
t.bench(function bench_isPromise_inst_nil() {l.nop(isPromiseInst())})
t.bench(function bench_isPromise_inst_miss_prim() {l.nop(isPromiseInst(someStr))})
t.bench(function bench_isPromise_inst_miss_arr() {l.nop(isPromiseInst(emptyArr))})
t.bench(function bench_isPromise_inst_miss_dict() {l.nop(isPromiseInst(emptyPlainDict))})
t.bench(function bench_isPromise_inst_miss_custom() {l.nop(isPromiseInst(somePromCustom))})
t.bench(function bench_isPromise_inst_hit_native() {l.nop(isPromiseInst(somePromNative))})

miscVals.forEach(isPromiseAsm)
t.bench(function bench_isPromise_asm_nil() {l.nop(isPromiseAsm())})
t.bench(function bench_isPromise_asm_miss_prim() {l.nop(isPromiseAsm(someStr))})
t.bench(function bench_isPromise_asm_miss_arr() {l.nop(isPromiseAsm(emptyArr))})
t.bench(function bench_isPromise_asm_miss_dict() {l.nop(isPromiseAsm(emptyPlainDict))})
t.bench(function bench_isPromise_asm_hit_custom() {l.nop(isPromiseAsm(somePromCustom))})
t.bench(function bench_isPromise_asm_hit_native() {l.nop(isPromiseAsm(somePromNative))})

miscVals.forEach(l.isPromise)
t.bench(function bench_isPromise_nil() {l.nop(l.isPromise())})
t.bench(function bench_isPromise_miss_prim() {l.nop(l.isPromise(someStr))})
t.bench(function bench_isPromise_miss_arr() {l.nop(l.isPromise(emptyArr))})
t.bench(function bench_isPromise_miss_dict() {l.nop(l.isPromise(emptyPlainDict))})
t.bench(function bench_isPromise_hit_custom() {l.nop(l.isPromise(somePromCustom))})
t.bench(function bench_isPromise_hit_native() {l.nop(l.isPromise(somePromNative))})

miscVals.forEach(l.isEqable)
t.bench(function bench_isEqable_nil() {l.nop(l.isEqable())})
t.bench(function bench_isEqable_miss_prim() {l.nop(l.isEqable(`str`))})
t.bench(function bench_isEqable_miss_obj() {l.nop(l.isEqable(somePromNative))})
t.bench(function bench_isEqable_hit() {l.nop(l.isEqable(someEqAlways0))})

t.bench(function bench_hasMeth_nil() {l.nop(l.hasMeth(undefined, `toISOString`))})
t.bench(function bench_hasMeth_miss_prim() {l.nop(l.hasMeth(someStr, `toISOString`))})
t.bench(function bench_hasMeth_miss_fun() {l.nop(l.hasMeth(l.nop, `toISOString`))})
t.bench(function bench_hasMeth_miss_obj() {l.nop(l.hasMeth(emptyArr, `toISOString`))})
t.bench(function bench_hasMeth_hit_inherit() {l.nop(l.hasMeth(someDate, `toISOString`))})
t.bench(function bench_hasMeth_hit_own() {l.nop(l.hasMeth(someDateSub, `toISOString`))})
t.bench(function bench_hasMeth_hit_own_shallow() {l.nop(l.hasMeth(shallow, `toISOString`))})

t.bench(function bench_hasIn_inline_nil() {l.nop(l.isComp(undefined) && `toISOString` in undefined)})
t.bench(function bench_hasIn_inline_miss_prim() {l.nop(l.isComp(someStr) && `toISOString` in someStr)})
t.bench(function bench_hasIn_inline_miss_fun() {l.nop(l.isComp(l.nop) && `toISOString` in l.nop)})
t.bench(function bench_hasIn_inline_miss_obj() {l.nop(l.isComp(emptyArr) && `toISOString` in emptyArr)})
t.bench(function bench_hasIn_inline_hit_inherit() {l.nop(l.isComp(someDate) && `toISOString` in someDate)})
t.bench(function bench_hasIn_inline_hit_own() {l.nop(l.isComp(someDateSub) && `toISOString` in someDateSub)})
t.bench(function bench_hasIn_inline_hit_own_shallow() {l.nop(l.isComp(shallow) && `toISOString` in shallow)})

t.bench(function bench_hasIn_ours_nil() {l.nop(l.hasIn(undefined, `toISOString`))})
t.bench(function bench_hasIn_ours_miss_prim() {l.nop(l.hasIn(someStr, `toISOString`))})
t.bench(function bench_hasIn_ours_miss_fun() {l.nop(l.hasIn(l.nop, `toISOString`))})
t.bench(function bench_hasIn_ours_miss_obj() {l.nop(l.hasIn(emptyArr, `toISOString`))})
t.bench(function bench_hasIn_ours_hit_inherit() {l.nop(l.hasIn(someDate, `toISOString`))})
t.bench(function bench_hasIn_ours_hit_own() {l.nop(l.hasIn(someDateSub, `toISOString`))})
t.bench(function bench_hasIn_ours_hit_own_shallow() {l.nop(l.hasIn(shallow, `toISOString`))})

t.bench(function bench_hasOwn_inline_miss_fun() {l.nop(Object.hasOwnProperty.call(l.nop, `toISOString`))})
t.bench(function bench_hasOwn_inline_miss_obj() {l.nop(Object.hasOwnProperty.call(emptyArr, `toISOString`))})
t.bench(function bench_hasOwn_inline_miss_inherit() {l.nop(Object.hasOwnProperty.call(someDate, `toISOString`))})
t.bench(function bench_hasOwn_inline_hit() {l.nop(Object.hasOwnProperty.call(someDateSub, `toISOString`))})

t.bench(function bench_hasOwn_ours_nil() {l.nop(l.hasOwn(undefined, `toISOString`))})
t.bench(function bench_hasOwn_ours_miss_prim() {l.nop(l.hasOwn(someStr, `toISOString`))})
t.bench(function bench_hasOwn_ours_miss_fun() {l.nop(l.hasOwn(l.nop, `toISOString`))})
t.bench(function bench_hasOwn_ours_miss_obj() {l.nop(l.hasOwn(emptyArr, `toISOString`))})
t.bench(function bench_hasOwn_ours_miss_inherit() {l.nop(l.hasOwn(someDate, `toISOString`))})
t.bench(function bench_hasOwn_ours_hit() {l.nop(l.hasOwn(someDateSub, `toISOString`))})

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
t.bench(function bench_show_prom() {l.nop(l.show(somePromNative))})
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

t.bench(function bench_eq_miss_obj_and_prim() {l.nop(l.eq(somePromNative, undefined))})
t.bench(function bench_eq_miss_prim_and_obj() {l.nop(l.eq(undefined, somePromNative))})
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

t.bench(function bench_symbol_equality_miss() {l.nop(someSymbol0 === someSymbol1)})
t.bench(function bench_symbol_equality_hit() {l.nop(someSymbol0 === someSymbol2)})

t.bench(function bench_symbol_description() {l.nop(someSymbol0.description)})

const throwable = `some_err`
t.bench(function bench_throw_inline() {try {throw throwable} catch {}})
t.bench(function bench_throw_panic() {try {l.panic(throwable)} catch {}})
t.bench(function bench_throw_inline_iife() {try {void function panic(err){throw err}(throwable)} catch {}})

if (import.meta.main) t.deopt(), t.benches()
