export const VAL = Symbol.for(`val`)

/* Typing */

export function isNil(val) {return val == null}
export function reqNil(val) {return isNil(val) ? val : throwErrFun(val, isNil)}
export function optNil(val) {return isNil(val) ? val : reqNil(val)}
export function onlyNil(val) {return isNil(val) ? val : undefined}

export function isSome(val) {return val != null}
export function reqSome(val) {return isSome(val) ? val : throwErrFun(val, isSome)}
export function optSome(val) {return isNil(val) ? val : reqSome(val)}
export function onlySome(val) {return isSome(val) ? val : undefined}

export function isBool(val) {return typeof val === `boolean`}
export function reqBool(val) {return isBool(val) ? val : throwErrFun(val, isBool)}
export function optBool(val) {return isNil(val) ? val : reqBool(val)}
export function onlyBool(val) {return isBool(val) ? val : undefined}
export function laxBool(val) {return isNil(val) ? false : reqBool(val)}

export function isNum(val) {return typeof val === `number`}
export function reqNum(val) {return isNum(val) ? val : throwErrFun(val, isNum)}
export function optNum(val) {return isNil(val) ? val : reqNum(val)}
export function onlyNum(val) {return isNum(val) ? val : undefined}
export function laxNum(val) {return isNil(val) ? 0 : reqNum(val)}

export function isFin(val) {return Number.isFinite(val)}
export function reqFin(val) {return isFin(val) ? val : throwErrFun(val, isFin)}
export function optFin(val) {return isNil(val) ? val : reqFin(val)}
export function onlyFin(val) {return isFin(val) ? val : undefined}
export function laxFin(val) {return isNil(val) ? 0 : reqFin(val)}

export function isFinNeg(val) {return isNum(val) && val < 0 && val > -Infinity}
export function reqFinNeg(val) {return isFinNeg(val) ? val : throwErrFun(val, isFinNeg)}
export function optFinNeg(val) {return isNil(val) ? val : reqFinNeg(val)}
export function onlyFinNeg(val) {return isFinNeg(val) ? val : undefined}

export function isFinPos(val) {return isNum(val) && val > 0 && val < Infinity}
export function reqFinPos(val) {return isFinPos(val) ? val : throwErrFun(val, isFinPos)}
export function optFinPos(val) {return isNil(val) ? val : reqFinPos(val)}
export function onlyFinPos(val) {return isFinPos(val) ? val : undefined}

// TODO: simply use `Number.isSafeInteger`.
export function isInt(val) {return isNum(val) && ((val % 1) === 0)}
export function reqInt(val) {return isInt(val) ? val : throwErrFun(val, isInt)}
export function optInt(val) {return isNil(val) ? val : reqInt(val)}
export function onlyInt(val) {return isInt(val) ? val : undefined}
export function laxInt(val) {return isNil(val) ? 0 : reqInt(val)}

export function isNat(val) {return isInt(val) && val >= 0}
export function reqNat(val) {return isNat(val) ? val : throwErrFun(val, isNat)}
export function optNat(val) {return isNil(val) ? val : reqNat(val)}
export function onlyNat(val) {return isNat(val) ? val : undefined}
export function laxNat(val) {return isNil(val) ? 0 : reqNat(val)}

export function isIntNeg(val) {return isInt(val) && val < 0}
export function reqIntNeg(val) {return isIntNeg(val) ? val : throwErrFun(val, isIntNeg)}
export function optIntNeg(val) {return isNil(val) ? val : reqIntNeg(val)}
export function onlyIntNeg(val) {return isIntNeg(val) ? val : undefined}

export function isIntPos(val) {return isInt(val) && val > 0}
export function reqIntPos(val) {return isIntPos(val) ? val : throwErrFun(val, isIntPos)}
export function optIntPos(val) {return isNil(val) ? val : reqIntPos(val)}
export function onlyIntPos(val) {return isIntPos(val) ? val : undefined}

export function isNaN(val) {return val !== val}
export function reqNaN(val) {return isNaN(val) ? val : throwErrFun(val, isNaN)}
export function optNaN(val) {return isNil(val) ? val : reqNaN(val)}
export function onlyNaN(val) {return isNaN(val) ? val : undefined}

export function isInf(val) {return val === Infinity || val === -Infinity}
export function reqInf(val) {return isInf(val) ? val : throwErrFun(val, isInf)}
export function optInf(val) {return isNil(val) ? val : reqInf(val)}
export function onlyInf(val) {return isInf(val) ? val : undefined}

export function isBigInt(val) {return typeof val === `bigint`}
export function reqBigInt(val) {return isBigInt(val) ? val : throwErrFun(val, isBigInt)}
export function optBigInt(val) {return isNil(val) ? val : reqBigInt(val)}
export function onlyBigInt(val) {return isBigInt(val) ? val : undefined}
export function laxBigInt(val) {return isNil(val) ? BigInt(0) : reqBigInt(val)}

export function isStr(val) {return typeof val === `string`}
export function reqStr(val) {return isStr(val) ? val : throwErrFun(val, isStr)}
export function optStr(val) {return isNil(val) ? val : reqStr(val)}
export function onlyStr(val) {return isStr(val) ? val : undefined}
export function laxStr(val) {return isNil(val) ? `` : reqStr(val)}

// TODO shorter name.
export function isValidStr(val) {return isStr(val) && !!val}
export function reqValidStr(val) {return isValidStr(val) ? val : throwErrFun(val, isValidStr)}
export function optValidStr(val) {return isNil(val) ? val : reqValidStr(val)}
export function onlyValidStr(val) {return isValidStr(val) ? val : undefined}

export function isSym(val) {return typeof val === `symbol`}
export function reqSym(val) {return isSym(val) ? val : throwErrFun(val, isSym)}
export function optSym(val) {return isNil(val) ? val : reqSym(val)}
export function onlySym(val) {return isSym(val) ? val : undefined}

// TODO tune perf.
export function isKey(val) {return isPrim(val) && !isJunk(val)}
export function reqKey(val) {return isKey(val) ? val : throwErrFun(val, isKey)}
export function optKey(val) {return isNil(val) ? val : reqKey(val)}
export function onlyKey(val) {return isKey(val) ? val : undefined}

export function isRecKey(val) {return isStr(val) || isSym(val)}
export function reqRecKey(val) {return isRecKey(val) ? val : throwErrFun(val, isKey)}
export function optRecKey(val) {return isNil(val) ? val : reqRecKey(val)}
export function onlyRecKey(val) {return isRecKey(val) ? val : undefined}

export function isPk(val) {return isValidStr(val) || isIntPos(val)}
export function reqPk(val) {return isPk(val) ? val : throwErrFun(val, isPk)}
export function optPk(val) {return isNil(val) ? val : reqPk(val)}
export function onlyPk(val) {return isPk(val) ? val : undefined}

export function isJunk(val) {return isNil(val) || isNaN(val) || isInf(val)}
export function reqJunk(val) {return isJunk(val) ? val : throwErrFun(val, isJunk)}
export function optJunk(val) {return isNil(val) ? val : reqJunk(val)}
export function onlyJunk(val) {return isJunk(val) ? val : undefined}

export function isComp(val) {return isObj(val) || isFun(val)}
export function reqComp(val) {return isComp(val) ? val : throwErrFun(val, isComp)}
export function optComp(val) {return isNil(val) ? val : reqComp(val)}
export function onlyComp(val) {return isComp(val) ? val : undefined}

export function isPrim(val) {return !isComp(val)}
export function reqPrim(val) {return isPrim(val) ? val : throwErrFun(val, isPrim)}
export function optPrim(val) {return isNil(val) ? val : reqPrim(val)}
export function onlyPrim(val) {return isPrim(val) ? val : undefined}

export function isFun(val) {return typeof val === `function`}
export function reqFun(val) {return isFun(val) ? val : throwErrFun(val, isFun)}
export function optFun(val) {return isNil(val) ? val : reqFun(val)}
export function onlyFun(val) {return isFun(val) ? val : undefined}

export function isFunSync(val) {return isFunType(val, `Function`)}
export function reqFunSync(val) {return isFunSync(val) ? val : throwErrFun(val, isFunSync)}
export function optFunSync(val) {return isNil(val) ? val : reqFunSync(val)}
export function onlyFunSync(val) {return isFunSync(val) ? val : undefined}

export function isFunGen(val) {return isFunType(val, `GeneratorFunction`)}
export function reqFunGen(val) {return isFunGen(val) ? val : throwErrFun(val, isFunGen)}
export function optFunGen(val) {return isNil(val) ? val : reqFunGen(val)}
export function onlyFunGen(val) {return isFunGen(val) ? val : undefined}

export function isFunAsync(val) {return isFunType(val, `AsyncFunction`)}
export function reqFunAsync(val) {return isFunAsync(val) ? val : throwErrFun(val, isFunAsync)}
export function optFunAsync(val) {return isNil(val) ? val : reqFunAsync(val)}
export function onlyFunAsync(val) {return isFunAsync(val) ? val : undefined}

export function isFunAsyncGen(val) {return isFunType(val, `AsyncGeneratorFunction`)}
export function reqFunAsyncGen(val) {return isFunAsyncGen(val) ? val : throwErrFun(val, isFunAsyncGen)}
export function optFunAsyncGen(val) {return isNil(val) ? val : reqFunAsyncGen(val)}
export function onlyFunAsyncGen(val) {return isFunAsyncGen(val) ? val : undefined}

export function isObj(val) {return isSome(val) && typeof val === `object`}
export function reqObj(val) {return isObj(val) ? val : throwErrFun(val, isObj)}
export function optObj(val) {return isNil(val) ? val : reqObj(val)}
export function onlyObj(val) {return isObj(val) ? val : undefined}

export function isNpo(val) {return isObj(val) && isNil(Object.getPrototypeOf(val))}
export function reqNpo(val) {return isNpo(val) ? val : throwErrFun(val, isNpo)}
export function optNpo(val) {return isNil(val) ? val : reqNpo(val)}
export function onlyNpo(val) {return isNpo(val) ? val : undefined}
export function laxNpo(val) {return isNil(val) ? Emp() : reqNpo(val)}

export function isDict(val) {
  if (!isObj(val)) return false
  const pro = Object.getPrototypeOf(val)
  return isNil(pro) || (
    pro === Object.prototype
    && (!own.call(val, `constructor`) || enu.call(val, `constructor`))
  )
}
export function reqDict(val) {return isDict(val) ? val : throwErrFun(val, isDict)}
export function optDict(val) {return isNil(val) ? val : reqDict(val)}
export function onlyDict(val) {return isDict(val) ? val : undefined}
export function laxDict(val) {return isNil(val) ? Emp() : reqDict(val)}

export function isRec(val) {return isObj(val) && !(Symbol.iterator in val)}
export function reqRec(val) {return isRec(val) ? val : throwErrFun(val, isRec)}
export function optRec(val) {return isNil(val) ? val : reqRec(val)}
export function onlyRec(val) {return isRec(val) ? val : undefined}
export function laxRec(val) {return isNil(val) ? Emp() : reqRec(val)}

export function isArr(val) {return Array.isArray(val)}
export function reqArr(val) {return isArr(val) ? val : throwErrFun(val, isArr)}
export function optArr(val) {return isNil(val) ? val : reqArr(val)}
export function onlyArr(val) {return isArr(val) ? val : undefined}
export function laxArr(val) {return isNil(val) ? [] : reqArr(val)}

/*
At the time of writing, in V8, array subclasses perform MUCH worse than true
arrays. In some hotspots we enforce true arrays for consistent performance.
*/
export function isTrueArr(val) {return isArr(val) && val.constructor === Array}
export function reqTrueArr(val) {return isTrueArr(val) ? val : throwErrFun(val, isTrueArr)}
export function optTrueArr(val) {return isNil(val) ? val : reqTrueArr(val)}
export function onlyTrueArr(val) {return isTrueArr(val) ? val : undefined}
export function laxTrueArr(val) {return isNil(val) ? [] : reqTrueArr(val)}

export function isReg(val) {return isInst(val, RegExp)}
export function reqReg(val) {return isReg(val) ? val : throwErrFun(val, isReg)}
export function optReg(val) {return isNil(val) ? val : reqReg(val)}
export function onlyReg(val) {return isReg(val) ? val : undefined}

export function isDate(val) {return isInst(val, Date)}
export function reqDate(val) {return isDate(val) ? val : throwErrFun(val, isDate)}
export function optDate(val) {return isNil(val) ? val : reqDate(val)}
export function onlyDate(val) {return isDate(val) ? val : undefined}

export function isValidDate(val) {return isDate(val) && isFin(val.valueOf())}
export function reqValidDate(val) {return isValidDate(val) ? val : throwErrFun(val, isValidDate)}
export function optValidDate(val) {return isNil(val) ? val : reqValidDate(val)}
export function onlyValidDate(val) {return isValidDate(val) ? val : undefined}

export function isInvalidDate(val) {return isDate(val) && !isValidDate(val)}
export function reqInvalidDate(val) {return isInvalidDate(val) ? val : throwErrFun(val, isInvalidDate)}
export function optInvalidDate(val) {return isNil(val) ? val : reqInvalidDate(val)}
export function onlyInvalidDate(val) {return isInvalidDate(val) ? val : undefined}

export function isSet(val) {return isInst(val, Set)}
export function reqSet(val) {return isSet(val) ? val : throwErrFun(val, isSet)}
export function optSet(val) {return isNil(val) ? val : reqSet(val)}
export function onlySet(val) {return isSet(val) ? val : undefined}
export function laxSet(val) {return isNil(val) ? new Set() : reqSet(val)}

export function isMap(val) {return isInst(val, Map)}
export function reqMap(val) {return isMap(val) ? val : throwErrFun(val, isMap)}
export function optMap(val) {return isNil(val) ? val : reqMap(val)}
export function onlyMap(val) {return isMap(val) ? val : undefined}
export function laxMap(val) {return isNil(val) ? new Map() : reqMap(val)}

export function isPromise(val) {return isComp(val) && isFun(val.then)}
export function reqPromise(val) {return isPromise(val) ? val : throwErrFun(val, isPromise)}
export function optPromise(val) {return isNil(val) ? val : reqPromise(val)}
export function onlyPromise(val) {return isPromise(val) ? val : undefined}

export function isIter(val) {return isObj(val) && Symbol.iterator in val}
export function reqIter(val) {return isIter(val) ? val : throwErrFun(val, isIter)}
export function optIter(val) {return isNil(val) ? val : reqIter(val)}
export function onlyIter(val) {return isIter(val) ? val : undefined}

export function isIterAsync(val) {return isObj(val) && Symbol.asyncIterator in val}
export function reqIterAsync(val) {return isIterAsync(val) ? val : throwErrFun(val, isIterAsync)}
export function optIterAsync(val) {return isNil(val) ? val : reqIterAsync(val)}
export function onlyIterAsync(val) {return isIterAsync(val) ? val : undefined}

export function isIterator(val) {return isIter(val) && hasNext(val)}
export function reqIterator(val) {return isIterator(val) ? val : throwErrFun(val, isIterator)}
export function optIterator(val) {return isNil(val) ? val : reqIterator(val)}
export function onlyIterator(val) {return isIterator(val) ? val : undefined}

export function isIteratorAsync(val) {return isIterAsync(val) && hasNext(val)}
export function reqIteratorAsync(val) {return isIteratorAsync(val) ? val : throwErrFun(val, isIteratorAsync)}
export function optIteratorAsync(val) {return isNil(val) ? val : reqIteratorAsync(val)}
export function onlyIteratorAsync(val) {return isIteratorAsync(val) ? val : undefined}

export function isGen(val) {return isIterator(val) && hasMeth(val, `return`) && hasMeth(val, `throw`)}
export function reqGen(val) {return isGen(val) ? val : throwErrFun(val, isGen)}
export function optGen(val) {return isNil(val) ? val : reqGen(val)}
export function onlyGen(val) {return isGen(val) ? val : undefined}

// TODO add `isErrCls`.
export function isCls(val) {return isFun(val) && !!val.prototype}
export function reqCls(val) {return isCls(val) ? val : throwErrFun(val, isCls)}
export function optCls(val) {return isNil(val) ? val : reqCls(val)}
export function onlyCls(val) {return isCls(val) ? val : undefined}

// TODO tests.
// export function isSubCls(sub, sup) {return isCls(sub) && (sub === sup || isInst(sub.prototype, sup))}

export function isSubCls(sub, sup) {
  return isFun(sub) && (sub === sup || Object.prototype.isPrototypeOf.call(sup, sub))
}

// TODO tests.
export function reqSubCls(sub, sup) {
  if (isSubCls(sub, sup)) return sub
  throw TypeError(`expected subclass of ${show(sup)}, found ${show(sub)}`)
}

export function isList(val) {return isSome(val) && (isArr(val) || (isIter(val) && isNat(val.length)))}
export function reqList(val) {return isList(val) ? val : throwErrFun(val, isList)}
export function optList(val) {return isNil(val) ? val : reqList(val)}
export function onlyList(val) {return isList(val) ? val : undefined}
export function laxList(val) {return isNil(val) ? [] : reqList(val)}

export function isSeq(val) {return isArr(val) || isSet(val) || isList(val) || isIterator(val)}
export function reqSeq(val) {return isSeq(val) ? val : throwErrFun(val, isSeq)}
export function optSeq(val) {return isNil(val) ? val : reqSeq(val)}
export function onlySeq(val) {return isSeq(val) ? val : undefined}

export function isVac(val) {return !val || (isArr(val) && (!val.length || val.every(isVac)))}
export function reqVac(val) {return isVac(val) ? val : throwErrFun(val, isVac)}
export function optVac(val) {return isNil(val) ? val : reqVac(val)}
export function onlyVac(val) {return isVac(val) ? val : undefined}

export function isScalar(val) {
  if (isObj(val)) {
    const fun = get(val, `toString`)
    return isFun(fun) && fun !== Object.prototype.toString && fun !== Array.prototype.toString
  }
  return !(isNil(val) || isSym(val) || isFun(val))
}
export function reqScalar(val) {return isScalar(val) ? val : throwErrFun(val, isScalar)}
export function optScalar(val) {return isNil(val) ? val : reqScalar(val)}
export function onlyScalar(val) {return isScalar(val) ? val : undefined}

export function isScalarOpt(val) {return isNil(val) || isScalar(val)}
export function reqScalarOpt(val) {return isScalarOpt(val) ? val : throwErrFun(val, isScalarOpt)}
export function optScalarOpt(val) {return isNil(val) ? val : reqScalarOpt(val)}
export function onlyScalarOpt(val) {return isScalarOpt(val) ? val : undefined}

export function isArrble(val) {return isIter(val) && isFun(val.toArray)}
export function reqArrble(val) {return isArrble(val) ? val : throwErrFun(val, isArrble)}
export function optArrble(val) {return isNil(val) ? val : reqArrble(val)}
export function onlyArrble(val) {return isArrble(val) ? val : undefined}

export function isEqable(val) {return isObj(val) && isFun(val.eq)}
export function reqEqable(val) {return isEqable(val) ? val : throwErrFun(val, isEqable)}
export function optEqable(val) {return isNil(val) ? val : reqEqable(val)}
export function onlyEqable(val) {return isEqable(val) ? val : undefined}

export function isClearable(val) {return isObj(val) && isFun(val.clear)}
export function reqClearable(val) {return isClearable(val) ? val : throwErrFun(val, isClearable)}
export function optClearable(val) {return isNil(val) ? val : reqClearable(val)}
export function onlyClearable(val) {return isClearable(val) ? val : undefined}

export function isErr(val) {return isInst(val, Error)}
export function reqErr(val) {return isErr(val) ? val : throwErrFun(val, isErr)}
export function optErr(val) {return isNil(val) ? val : reqErr(val)}
export function onlyErr(val) {return isErr(val) ? val : undefined}

export function isRef(val) {return isObj(val) && VAL in val}
export function optRef(val) {return opt(val, isRef)}
export function onlyRef(val) {return only(val, isRef)}
export function reqRef(val) {return req(val, isRef)}

export function isArrOf(val, fun) {
  reqValidator(fun)
  return isArr(val) && val.every(fun)
}

// TODO improve error message.
export function reqArrOf(val, fun) {
  reqValidator(fun)
  for (const elem of reqArr(val)) req(elem, fun)
  return val
}

export function optArrOf(val, fun) {
  reqValidator(fun)
  return isNil(val) ? val : reqArrOf(val, fun)
}

// TODO consolidate with `hasLen`.
// The two functions must be exactly inverse.
export function isEmpty(val) {
  if (!isObj(val)) return true
  if (isList(val)) return val.length === 0
  if (isIter(val)) return val.size === 0
  return false
}

export function isInst(val, cls) {return isObj(val) && val instanceof cls}

/* Assertions */

export function req(val, fun) {
  if (reqValidator(fun)(val)) return val
  throw errFun(val, fun)
}

export function reqOneOf(val, funs) {
  for (const fun of reqArr(funs)) if (fun(val)) return val
  throw errOneOf(val, funs)
}

export function opt(val, fun) {
  reqValidator(fun)
  return isNil(val) ? val : req(val, fun)
}

export function optOneOf(val, funs) {
  return isNil(val) ? val : reqOneOf(val, funs)
}

export function reqInst(val, cls) {
  if (isInst(val, cls)) return val
  throw errInst(val, cls)
}

export function optInst(val, cls) {
  reqCls(cls)
  return isNil(val) ? val : reqInst(val, cls)
}

export function only(val, fun) {return reqValidator(fun)(val) ? val : undefined}

export function onlyInst(val, cls) {return isInst(val, cls) ? val : undefined}

/* Conversions */

export function deref(val) {return isRef(val) ? val[VAL] : val}
export function derefAll(val) {while (val !== (val = deref(val))); return val}

export function toInst(val, cls) {return isInst(val, cls) ? val : new cls(val)}
export function toInstOpt(val, cls) {return isNil(val) ? val : toInst(val, cls)}

export function render(src) {
  const out = renderOpt(src)
  if (isSome(out)) return out
  throw errConv(src, `string`)
}

export function renderOpt(val) {
  if (isStr(val)) return val
  if (isDate(val)) return renderDate(val)
  if (isScalar(val)) return String(val)
  return undefined
}

export function renderLax(val) {return isNil(val) ? `` : render(val)}

export function toTrueArr(val) {
  if (isNil(val)) return []
  if (isTrueArr(val)) return val
  return [...reqIter(val)]
}

/* Misc */

export function is(one, two) {return one === two || (isNaN(one) && isNaN(two))}
export function truthy(val) {return !!val}
export function falsy(val) {return !val}
export function nop() {}
export function id(val) {return val}
export function val(src) {return function val() {return src}}
export function panic(val) {if (isSome(val)) throw val}
export function True() {return true}
export function False() {return false}
export function vac(val) {return isVac(val) ? undefined : val}
export function bind(fun, ...args) {return reqFun(fun).bind(this, ...args)}

export function not(fun) {
  reqFun(fun)
  return function not() {return !fun.apply(this, arguments)}
}

export function hasOwn(val, key) {return isComp(val) && own.call(val, key)}
export function hasOwnEnum(val, key) {return isComp(val) && enu.call(val, key)}
export function hasInherited(val, key) {return isComp(val) && key in val && !own.call(val, key)}
export function hasMeth(val, key) {return isComp(val) && key in val && isFun(val[key])}

export function eq(one, two) {
  if (is(one, two)) return true
  if (!isEqable(one)) return false
  const con = getCon(two)
  return !!con && (con === getCon(one)) && one.eq(two)
}

export function setProto(tar, cls) {
  if (Object.getPrototypeOf(tar) !== cls.prototype) {
    Object.setPrototypeOf(tar, cls.prototype)
  }
}

export function Emp() {return new.target && new.target !== Emp ? this : Object.create(null)}
Emp.prototype = null

export function show(val) {return new Show().any(val)}

export class Show extends Emp {
  any(src) {
    if (Object.is(src, -0)) return `-0`
    if (isStr(src)) return this.str(src)
    if (isSym(src)) return this.sym(src)
    if (isBigInt(src)) return this.bigInt(src)
    if (isFun(src)) return this.fun(src)
    if (!isObj(src)) return String(src)

    const out = this.cyclicOpt(src)
    if (out) return out

    if (isErr(src)) return this.err(src)
    if (isArr(src)) return this.arr(src)
    if (isDict(src)) return this.dict(src)
    if (isInst(src, WeakRef)) return this.weakRef(src, WeakRef.name)
    if (isInst(src, Boolean)) return this.obj(src, Boolean.name)
    if (isInst(src, Number)) return this.obj(src, Number.name)
    if (isInst(src, String)) return this.obj(src, String.name)
    if (isSet(src)) return this.obj(src, Set.name)
    if (isMap(src)) return this.obj(src, Map.name)
    return this.obj(src)
  }

  str(src) {return JSON.stringify(src)}
  sym(src) {return src.toString()}
  bigInt(src) {return src.toString() + `n`}
  fun(src) {return showFun(src)}
  arr(src) {return `[` + this.seq(src) + `]`}
  dict(src) {return `{` + this.fields(src) + `}`}

  obj(src, name, ...extra) {
    let out = `[object`
    out = spaced(out, this.name(src) || laxStr(name))
    for (const val of extra) out = spaced(out, val)
    out = spaced(out, this.scalarOpt(src))
    out = spaced(out, this.dictOpt(src))
    out = spaced(out, this.arrOpt(src))
    out += `]`
    return out
  }

  err(src) {
    const dict = this.dictOpt(src)
    if (!dict) return String(src)

    let out = `[` + this.name(src) || Error.name
    out = spaced(out, dict)
    out = inf(out, `: `, src.message)
    out += `]`
    return out
  }

  weakRef(src, name) {
    const val = src.deref()
    if (isNil(val)) return this.obj(src, name)
    return this.obj(src, name, this.any(val))
  }

  scalarOpt(src) {return isScalar(src) ? this.any(src.toString()) : ``}

  dictOpt(src) {
    src = this.fieldsOpt(src)
    return src && `{` + src + `}`
  }

  fieldsOpt(src) {return this.fields(src)}

  fields(src) {
    const buf = []
    for (const key of Object.keys(src)) {
      buf.push(this.field(key, src[key]))
    }
    return buf.join(`, `)
  }

  field(key, val) {return this.key(key) + `: ` + this.any(val)}

  key(src) {
    if (isSym(src)) return `[` + this.sym(src) + `]`
    if (/^(?:\d+|\d+\.\d+|\d+n|[A-Za-z_$][\w$]*)$/.test(reqStr(src))) {
      return src
    }
    return this.str(src)
  }

  arrOpt(src) {
    src = this.seqOpt(src)
    return src && `[` + src + `]`
  }

  seqOpt(src) {return isIter(src) && !isIterator(src) ? this.seq(src) : ``}

  seq(src) {
    const buf = []
    for (src of src) buf.push(this.any(src))
    return buf.join(`, `)
  }

  con(src) {return getCon(src)}
  name(src) {return this.con(src)?.name || src?.[Symbol.toStringTag]}
  cyclic(ind) {return `[cyclic ` + ind + `]`}

  cyclicOpt(val) {
    const vis = this.vis()
    const ind = vis.get(val)
    if (ind) return this.cyclic(ind)
    vis.set(val, vis.size + 1)
    return ``
  }

  #vis = undefined
  vis() {return this.#vis ??= new Map()}
}

/* Math */

// TODO consider type checking. `+` must require consistent types.
export function add(a, b) {return a + b}
export function sub(a, b) {return a - b}
export function mul(a, b) {return a * b}
export function div(a, b) {return a / b}
export function rem(a, b) {return a % b}
export function lt(a, b) {return a < b}
export function gt(a, b) {return a > b}
export function lte(a, b) {return a <= b}
export function gte(a, b) {return a >= b}
export function neg(val) {return -val}
export function inc(val) {return val + 1}
export function dec(val) {return val - 1}

// Non-insane variant of `Math.round`. Rounds away from 0, instead of up.
export function round(val) {
  reqNum(val)
  return val < 0 ? -Math.round(-val) : Math.round(val)
}

/* Internal */

const own = Object.prototype.hasOwnProperty
const enu = Object.prototype.propertyIsEnumerable

function isFunType(val, name) {return isFun(val) && val.constructor.name === name}
function instDesc(val) {return isFun(val) ? `instance of ${showFunName(val)} ` : ``}
function hasNext(val) {return isFun(val.next)}

function reqValidator(fun) {
  if (!isFun(fun)) {
    throw TypeError(`expected validator function, got ${show(fun)}`)
  }
  return fun
}

export function errType(val, msg) {return TypeError(msgType(val, msg))}
export function msgType(val, msg) {return `expected variant of ${msg}, got ${show(val)}`}

export function errFun(val, fun) {return TypeError(msgFun(val, fun))}
export function msgFun(val, fun) {return msgType(val, showFunName(fun))}
export function throwErrFun(val, fun) {throw errFun(val, fun)}

export function errConv(val, msg) {return TypeError(msgConv(val, msg))}
export function errSynt(val, msg) {return SyntaxError(msgConv(val, msg))}
export function msgConv(val, msg) {return `unable to convert ${show(val)} to ${msg}`}

export function errConvInst(val, inst) {return TypeError(msgConvInst(val, inst))}
export function msgConvInst(val, inst) {return msgConv(val, inst.constructor.name)}

export function errInst(val, cls) {return TypeError(msgInst(val, cls))}
export function msgInst(val, cls) {return `expected instance of ${showFunName(cls)}, got ${instDesc(getCon(val))}${show(val)}`}

export function errIn(val, key) {return TypeError(msgIn(val, key))}
export function msgIn(val, key) {return `unable to find ${show(key)} in ${show(val)}`}

export function errImpl() {return TypeError(msgImpl())}
export function msgImpl() {return `not implemented`}

export function errTrans(err, cls, msg) {
  err = toInst(err, cls)
  const pre = renderLax(msg)
  const suf = renderLax(err.message)
  err.message = pre && suf ? pre + `: ` + suf : pre || suf
  return err
}

export function errWrap(err, cls, msg) {
  if (isErrorCauseSupported()) return new cls(msg, {cause: err})
  return errTrans(err, cls, msg)
}

export function errCause(val) {
  if (isErrorCauseSupported()) while (isErr(val)) val = val.cause
  return val
}

/*
The feature is standard, but at the time of writing, has limited engine support.
Many engines, including Chrome, do not report causes unless explicitly asked
for, and Safari <15 does not support causes at all.
*/
function isErrorCauseSupported() {
  return ERROR_CAUSE ??= `cause` in Error(``, {cause: undefined})
}

let ERROR_CAUSE

function errOneOf(val, funs) {return TypeError(msgType(val, `[` + showFuns(funs) + `]`))}

export function convType(tar, src, msg) {
  if (isSome(tar)) return tar
  throw errConv(src, msg)
}

export function convSynt(tar, src, msg) {
  if (isSome(tar)) return tar
  throw errSynt(src, msg)
}

function showFun(val) {return `[function ${val.name || val}]`}
function showFuns(funs) {return funs.map(showFunName).join(`, `)}
export function showFunName(fun) {return fun.name || showFun(fun)}

function spaced(one, two) {return inf(one, ` `, two)}

function inf(one, inf, two) {
  optStr(one)
  reqStr(inf)
  optStr(two)
  return one && two ? (one + inf + two) : (one || two)
}

/*
Like `val?.[key]` but with sanity checks: works only on composite values and
avoids accessing the property unless it satisfies the `in` check.
*/
export function get(val, key) {
  return isComp(val) && key in val ? val[key] : undefined
}

export function getOwn(val, key) {return hasOwn(val, key) ? val[key] : undefined}

export function reqGet(val, key) {
  if (isComp(val) && key in val) return val[key]
  throw errIn(val, key)
}

function getCon(val) {return isComp(val) ? val.constructor : undefined}

// This is actually faster than default rendering.
function renderDate(val) {
  if (val.toString === Date.prototype.toString) return val.toISOString()
  return val.toString()
}

export function recKeys(val) {
  return isNil(val) ? [] : Object.keys(reqRec(val))
}
