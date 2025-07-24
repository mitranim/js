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

/*
Word of warning: class prototypes are never null and never completely empty.
It's possible to use symbolic and private methods to avoid collision with
properties, but the prototype always has `.constructor`.
*/
class EmpSub extends l.Emp {}

const emptyStr = ``
const emptyArr = []
const emptyDict = {}
const emptyNpo = Object.create(null)
const emptyEmpSub = new EmpSub()
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
const sym = new Proxy(l.Emp(), new class SymPh extends l.Emp {
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

class CallableRegular extends l.Emp {call(...src) {return src}}
const callableRegular = new CallableRegular()
t.eq(callableRegular.call(10, 20), [10, 20])

class CallablePh extends l.Emp {
  constructor(tar) {super().tar = tar}

  /* Special behaviors. */

  apply(fun, _, args) {return fun.apply(this.tar, args)}
  has(_, key) {return key === `name` || key in this.tar}
  get(fun, key) {
    const {tar} = this
    if (key === `name` && !(key in tar)) return fun[key]
    return tar[key]
  }

  /* Simple forwarding. */

  set(_, key, val) {return this.tar[key] = val, true}
  deleteProperty(_, key) {return delete this.tar[key]}
  defineProperty(_, key, val) {return Reflect.defineProperty(this.tar, key, val), true}
  ownKeys() {return Reflect.ownKeys(this.tar)}
  getOwnPropertyDescriptor(_, key) {return Reflect.getOwnPropertyDescriptor(this.tar, key)}
  isExtensible() {return Reflect.isExtensible(this.tar)}
  preventExtensions() {return Reflect.preventExtensions(this.tar), true}
  getPrototypeOf() {return Reflect.getPrototypeOf(this.tar)}
  setPrototypeOf(_, val) {return Reflect.setPrototypeOf(this.tar, val), true}
}

class CallableByProxy extends l.Emp {
  constructor() {
    super()
    return new Proxy(this.call, new CallablePh(this))
  }
  call(...src) {return src}
}

const callableByProxy = new CallableByProxy()

t.eq(callableByProxy(10, 20), [10, 20])

class CallableFun extends Function {
  constructor() {
    super(`...src`, `return this.call(...src)`)
    return this.bind(this)
  }

  call(...src) {return src}
}

const callableFun = new CallableFun()

t.eq(callableFun(10, 20), [10, 20])

const someSymbol0 = Symbol.for(`some_symbol_0`)
const someSymbol1 = Symbol.for(`some_symbol_1`)
const someSymbol2 = Symbol.for(`some_symbol_0`) // Not a typo. See the test below.

const isSafeInteger = Number.isSafeInteger

function isPromiseInst(val) {return l.isInst(val, Promise)}

function getPrototype(val) {return Object.getPrototypeOf(val)}

const textEnc = new TextEncoder()

const miscVals = [
  emptyStr,
  emptyArr,
  emptyDict,
  emptyNpo,
  emptyEmpSub,
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
  textEnc,
  Object.create(emptyArr),
  Object.create(l.Emp), // Not a typo. The object's prototype is the function.
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

function keysDumb(val) {return Object.keys(l.laxRec(val))}
function keysTricky(val) {return l.isNil(val) ? [] : Object.keys(l.reqRec(val))}

/*
This function has been removed from the API and forbidden because in some cases
it causes noticeable deoptimization and doesn't save all that much typing.
Unfortunately, after moving it to the benchmark module, the deoptimization
disappeared from the benchmark, presumably because we don't provide enough
varied inputs here. Which makes it harder to demonstrate the issue or detect
if it's gone in future JS engines.
*/
function hasIn(val, key) {return l.isComp(val) && key in val}

// We're interested in how well JS engines optimize `[...] = [...]`.
function swapperInline(tar, fun) {
  if (l.isFun(tar)) [tar, fun] = [fun, tar]
  l.reqSome(tar)
  l.reqFun(fun)
}

function swapperReceiving(tar, fun) {
  [tar, fun] = swapperReturning(tar, fun)
  l.reqSome(tar)
  l.reqFun(fun)
}

function swapperReturning(tar, fun) {
  return l.isFun(fun) ? [tar, fun] : [fun, tar]
}

/* Bench */

t.bench(function bench_is_Object_is() {l.nop(Object.is(123, 456))})
t.bench(function bench_is_globalThis_Object_is() {l.nop(globalThis.Object.is(123, 456))})
t.bench(function bench_is_our_is() {l.nop(l.is(123, 456))})

miscVals.forEach(getPrototype)
t.bench(function bench_getPrototypeOf_arr() {l.nop(getPrototype(emptyArr))})
t.bench(function bench_getPrototypeOf_dict() {l.nop(getPrototype(emptyDict))})
t.bench(function bench_getPrototypeOf_npo() {l.nop(getPrototype(emptyNpo))})
t.bench(function bench_getPrototypeOf_prom_custom() {l.nop(getPrototype(somePromCustom))})
t.bench(function bench_getPrototypeOf_prom_native() {l.nop(getPrototype(somePromNative))})

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
t.bench(function bench_reqFun_hit() {l.nop(l.reqFun(l.reqFun))})

miscVals.forEach(l.isCls)
t.bench(function bench_isCls_nil() {l.nop(l.isCls())})
t.bench(function bench_isCls_miss() {l.nop(l.isCls(somePromNative))})
t.bench(function bench_isCls_hit() {l.nop(l.isCls(l.isCls))})
t.bench(function bench_reqCls_hit() {l.nop(l.reqFun(Object))})

miscVals.forEach(l.isComp)
t.bench(function bench_isComp_nil() {l.nop(l.isComp())})
t.bench(function bench_isComp_miss_prim() {l.nop(l.isComp(`str`))})
t.bench(function bench_isComp_hit_dict() {l.nop(l.isComp(emptyDict))})
t.bench(function bench_isComp_hit_arr() {l.nop(l.isComp(emptyArr))})
t.bench(function bench_isComp_hit_fun() {l.nop(l.isComp(l.isComp))})

miscVals.forEach(l.isObj)
t.bench(function bench_isObj_nil() {l.nop(l.isObj())})
t.bench(function bench_isObj_miss_prim() {l.nop(l.isObj(`str`))})
t.bench(function bench_isObj_miss_fun() {l.nop(l.isObj(l.isObj))})
t.bench(function bench_isObj_hit_dict() {l.nop(l.isObj(emptyDict))})
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
t.bench(function bench_isDict_miss_emp_sub() {l.nop(l.isDict(emptyEmpSub))})
t.bench(function bench_isDict_hit_dict() {l.nop(l.isDict(emptyDict))})
t.bench(function bench_isDict_hit_npo() {l.nop(l.isDict(emptyNpo))})

miscVals.forEach(l.isRec)
t.bench(function bench_isRec_nil() {l.nop(l.isRec())})
t.bench(function bench_isRec_miss() {l.nop(l.isRec(emptyArr))})
t.bench(function bench_isRec_hit() {l.nop(l.isRec(someDate))})

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
t.bench(function bench_isPromise_inst_miss_dict() {l.nop(isPromiseInst(emptyDict))})
t.bench(function bench_isPromise_inst_miss_npo() {l.nop(isPromiseInst(emptyNpo))})
t.bench(function bench_isPromise_inst_miss_custom() {l.nop(isPromiseInst(somePromCustom))})
t.bench(function bench_isPromise_inst_hit_native() {l.nop(isPromiseInst(somePromNative))})

miscVals.forEach(isPromiseAsm)
t.bench(function bench_isPromise_asm_nil() {l.nop(isPromiseAsm())})
t.bench(function bench_isPromise_asm_miss_prim() {l.nop(isPromiseAsm(someStr))})
t.bench(function bench_isPromise_asm_miss_arr() {l.nop(isPromiseAsm(emptyArr))})
t.bench(function bench_isPromise_asm_miss_dict() {l.nop(isPromiseAsm(emptyDict))})
t.bench(function bench_isPromise_asm_miss_npo() {l.nop(isPromiseAsm(emptyNpo))})
t.bench(function bench_isPromise_asm_hit_custom() {l.nop(isPromiseAsm(somePromCustom))})
t.bench(function bench_isPromise_asm_hit_native() {l.nop(isPromiseAsm(somePromNative))})

miscVals.forEach(l.isPromise)
t.bench(function bench_isPromise_nil() {l.nop(l.isPromise())})
t.bench(function bench_isPromise_miss_prim() {l.nop(l.isPromise(someStr))})
t.bench(function bench_isPromise_miss_arr() {l.nop(l.isPromise(emptyArr))})
t.bench(function bench_isPromise_miss_dict() {l.nop(l.isPromise(emptyDict))})
t.bench(function bench_isPromise_miss_npo() {l.nop(l.isPromise(emptyNpo))})
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

t.bench(function bench_hasIn_ours_nil() {l.nop(hasIn(undefined, `toISOString`))})
t.bench(function bench_hasIn_ours_miss_prim() {l.nop(hasIn(someStr, `toISOString`))})
t.bench(function bench_hasIn_ours_miss_fun() {l.nop(hasIn(l.nop, `toISOString`))})
t.bench(function bench_hasIn_ours_miss_obj() {l.nop(hasIn(emptyArr, `toISOString`))})
t.bench(function bench_hasIn_ours_hit_inherit() {l.nop(hasIn(someDate, `toISOString`))})
t.bench(function bench_hasIn_ours_hit_own() {l.nop(hasIn(someDateSub, `toISOString`))})
t.bench(function bench_hasIn_ours_hit_own_shallow() {l.nop(hasIn(shallow, `toISOString`))})

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

t.bench(function bench_show_dict() {l.nop(l.show(emptyDict))})
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

t.bench(function bench_keys_empty_dumb() {l.nop(keysDumb(emptyDict))})
t.bench(function bench_keys_empty_tricky() {l.nop(keysTricky(emptyDict))})

t.bench(function bench_empty_Object_create_null() {l.nop(Object.create(null))})
t.bench(function bench_empty_Object_create_Object_create_null() {l.nop(Object.create(emptyNpo))})
t.bench(function bench_empty_Emp() {l.nop(l.Emp())})
t.bench(function bench_empty_Emp_new() {l.nop(new l.Emp())})
t.bench(function bench_empty_Emp_sub_new() {l.nop(new EmpSub())})

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

t.bench(function bench_object_from_block_iife() {l.nop((() => {
  const one = 10
  const two = 20
  const three = 30
  const four = 40
  return {one, two, three, four}
})())})

t.bench(function bench_object_inline() {l.nop({
  one: 10,
  two: 20,
  three: 30,
  four: 40,
})})

t.bench(function bench_delete_unchecked_miss_dict_prealloc() {delete emptyDict.one})
t.bench(function bench_delete_unchecked_miss_npo_prealloc() {delete emptyNpo.one})
t.bench(function bench_delete_unchecked_miss_emp_sub_prealloc() {delete emptyEmpSub.one})
t.bench(function bench_delete_unchecked_miss_dict_new() {delete {}.one})
t.bench(function bench_delete_unchecked_miss_npo_new() {delete Object.create(null).one})
t.bench(function bench_delete_unchecked_miss_emp_sub_new() {delete new EmpSub().one})
t.bench(function bench_delete_unchecked_hit_dict_new() {delete {one: 10}.one})
t.bench(function bench_delete_unchecked_hit_npo_new() {
  const tar = Object.create(null)
  tar.one = 10
  delete tar.one
})
t.bench(function bench_delete_unchecked_hit_emp_sub_new() {
  const tar = new EmpSub()
  tar.one = 10
  delete tar.one
})

t.bench(function bench_delete_checked_miss_dict_prealloc() {
  if (`one` in emptyDict) delete emptyDict.one
})
t.bench(function bench_delete_checked_miss_npo_prealloc() {
  if (`one` in emptyNpo) delete emptyNpo.one
})
t.bench(function bench_delete_checked_miss_emp_sub_prealloc() {
  if (`one` in emptyEmpSub) delete emptyEmpSub.one
})
t.bench(function bench_delete_checked_miss_dict_new() {
  const tar = {}
  if (`one` in tar) delete tar.one
})
t.bench(function bench_delete_checked_miss_npo_new() {
  const tar = Object.create(null)
  if (`one` in tar) delete tar.one
})
t.bench(function bench_delete_checked_miss_emp_sub_new() {
  const tar = new EmpSub()
  if (`one` in tar) delete tar.one
})
t.bench(function bench_delete_checked_hit_dict_new() {
  const tar = {one: 10}
  if (`one` in tar) delete tar.one
})
t.bench(function bench_delete_checked_hit_npo_new() {
  const tar = Object.create(null)
  tar.one = 10
  if (`one` in tar) delete tar.one
})
t.bench(function bench_delete_checked_hit_emp_sub_new() {
  const tar = new EmpSub()
  tar.one = 10
  if (`one` in tar) delete tar.one
})

// At the time of writing, the benchmark indicates no measurable cost in V8.
for (const val of miscVals) swapperInline(val, l.nop)
for (const val of miscVals) swapperInline(l.nop, val)
t.bench(function bench_swapper_inline_obj_fun() {swapperInline(emptyNpo, l.nop)})
t.bench(function bench_swapper_inline_fun_obj() {swapperInline(l.nop, emptyNpo)})
t.bench(function bench_swapper_inline_fun_fun() {swapperInline(l.nop, l.nop)})

// At the time of writing, the benchmark indicates a tiny measurable cost in V8.
for (const val of miscVals) swapperReceiving(val, l.nop)
for (const val of miscVals) swapperReceiving(l.nop, val)
t.bench(function bench_swapper_receiving_obj_fun() {swapperReceiving(emptyNpo, l.nop)})
t.bench(function bench_swapper_receiving_fun_obj() {swapperReceiving(l.nop, emptyNpo)})
t.bench(function bench_swapper_receiving_fun_fun() {swapperReceiving(l.nop, l.nop)})

// No special overhead.
t.bench(function bench_callable_regular_construct() {l.nop(new CallableRegular())})
t.bench(function bench_callable_regular_call() {l.nop(callableRegular.call(10, 20))})

// Minor overhead (single digit nanoseconds).
t.bench(function bench_callable_proxy_construct() {l.nop(new CallableByProxy())})

// Minor overhead (10+ nanoseconds).
t.bench(function bench_callable_proxy_call() {l.nop(callableByProxy.call(10, 20))})

// Major overhead (270+ nanoseconds).
t.bench(function bench_callable_fun_construct() {l.nop(new CallableFun())})

// No special overhead.
t.bench(function bench_callable_fun_call() {l.nop(callableFun.call(10, 20))})

// Not much difference in Deno or Node; much difference in Bun.
t.bench(function bench_text_encoder_new() {new TextEncoder().encode()})
t.bench(function bench_text_encoder_old() {textEnc.encode()})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
