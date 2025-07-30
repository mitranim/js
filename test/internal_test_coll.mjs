import * as l from '../lang.mjs'
import * as i from '../iter.mjs'
import * as c from '../coll.mjs'

/*
Implementation notes.

The "make" functions in this module should avoid calling native array methods.
When creating arrays, we should use only `Array(N)`, `.length`, and the bracket
notation. This avoids accidental deoptimization or specialization of native
methods. Some of our test modules unconditionally deoptimize them anyway, but
only when running `all_bench.mjs`. Directly running a specific benchmark file
allows to opt out of that.

We would prefer to freeze global values to prevent accidental misuse, but
freezing arrays makes some native iteration methods dramatically slower.
*/
export const SIZE_BIG = 1024
export const SIZE_SMALL = 8

class SubArr extends Array {}

export const arrEmpty = []
export const arrShort = [10, 20, 30]
export const arrShortNested = makeArrNested(arrShort)

export const numArr = makeNumArr(SIZE_BIG)
export const numArrNested = makeArrNested(numArr)
export const numArrSub = SubArr.from(numArr)

export const dictArr = makeDictArr(numArr)
export const mapArr = makeMapArr(numArr)
export const numDict = makeNumDict(SIZE_BIG)
export const numSet = new Set(numArr)
export const numVec = c.Vec.from(numArr)
export const numMap = makeNumMap(SIZE_BIG)
export const numArgs = function() {return arguments}(...numArr)
export const knownKeys = Object.keys(numArr.slice(0, numArr.length/2))
export const numEntries = Object.entries(numDict)

export const strArrSmall = makeNumArr(SIZE_SMALL).map(String)
export const strSetSmall = new Set(strArrSmall)
export const numDictSmall = makeNumDict(SIZE_SMALL)

function makeNumArr(len) {
  const out = Array(len)
  let ind = -1
  while (++ind < out.length) out[ind] = (ind % 2) * ind
  return out
}

function makeDictArr(vals) {
  const out = Array(vals.length)
  let ind = -1
  while (++ind < vals.length) out[ind] = {val: vals[ind]}
  return out
}

function makeMapArr(vals) {
  const out = Array(vals.length)
  let ind = -1
  while (++ind < vals.length) out[ind] = new Map().set(`val`, vals[ind])
  return out
}

function makeNumDict(len) {
  const out = Object.create(null)
  let ind = -1
  while (++ind < len) out[ind] = (ind % 2) * ind
  return out
}

function makeNumMap(len) {
  const out = new Map()
  let ind = -1
  while (++ind < len) out.set(ind, (ind % 2) * ind)
  return out
}

function makeArrNested(src) {
  const out = Array(src.length)
  let ind = -1
  while (++ind < src.length) out[ind] = [src[ind]]
  return out
}

/*
Not redundant with `l.nop`. We use referentially different functions to increase
the likelihood of deoptimization, which is useful for benchmarking.
*/
function nop1() {}

class Cls0 {}
class Cls1 extends Array {}

export function* gen(iter) {if (iter) for (const val of iter) yield val}

export function deoptDictHof(fun) {
  i.reify(fun(numDict, l.nop))
  i.reify(fun(numDict, nop1))
  i.reify(fun({}, l.nop))
  i.reify(fun({}, nop1))
}

export function deoptListHof(fun) {
  i.reify(fun(numArr, l.nop))
  i.reify(fun(numArr, nop1))
  i.reify(fun(numArgs, l.nop))
  i.reify(fun(numArgs, nop1))
}

// Semantically distinct. Implementation matches by accident.
export function deoptSeqFun(fun) {deoptSeqHof(fun)}

export function deoptSeqHof(fun) {
  deoptListHof(fun)
  i.reify(fun(numArr.values(), l.nop))
  i.reify(fun(numArr.values(), nop1))
  i.reify(fun(numArr.keys(), l.nop))
  i.reify(fun(numArr.keys(), nop1))
  i.reify(fun(gen(), l.nop))
  i.reify(fun(gen(), nop1))
}

export function deoptKeysFun(fun) {
  i.reify(fun(numArr))
  i.reify(fun(numSet))
  i.reify(fun(numMap))
  i.reify(fun(numDict))
}

// Semantically distinct. Implementation matches by accident.
export function deoptCollFun(fun) {deoptCollHof(fun)}

export function deoptCollHof(fun) {
  deoptSeqHof(fun)
  i.reify(fun(numDict, l.nop))
  i.reify(fun(numDict, nop1))
  i.reify(fun(numMap, l.nop))
  i.reify(fun(numMap, nop1))
  i.reify(fun(numMap.values(), l.nop))
  i.reify(fun(numMap.values(), nop1))
  i.reify(fun(numMap.keys(), l.nop))
  i.reify(fun(numMap.keys(), nop1))
  i.reify(fun(numMap.entries(), l.nop))
  i.reify(fun(numMap.entries(), nop1))
}

export function deoptCollClsHof(fun) {
  // deoptListHof
  i.reify(fun(numArr, Cls0))
  i.reify(fun(numArr, Cls1))
  i.reify(fun(numArgs, Cls0))
  i.reify(fun(numArgs, Cls1))

  // deoptSeqHof
  i.reify(fun(numArr.values(), Cls0))
  i.reify(fun(numArr.values(), Cls1))
  i.reify(fun(numArr.keys(), Cls0))
  i.reify(fun(numArr.keys(), Cls1))
  i.reify(fun(gen(), Cls0))
  i.reify(fun(gen(), Cls1))

  // deoptCollHof
  i.reify(fun(numDict, Cls0))
  i.reify(fun(numDict, Cls1))
  i.reify(fun(numMap, Cls0))
  i.reify(fun(numMap, Cls1))
  i.reify(fun(numMap.values(), Cls0))
  i.reify(fun(numMap.values(), Cls1))
  i.reify(fun(numMap.keys(), Cls0))
  i.reify(fun(numMap.keys(), Cls1))
  i.reify(fun(numMap.entries(), Cls0))
  i.reify(fun(numMap.entries(), Cls1))
}

export function deoptNativeListHof(fun) {
  fun.call(numArr, l.nop)
  fun.call(numArr, nop1)
  fun.call(dictArr, l.nop)
  fun.call(dictArr, nop1)
  fun.call(knownKeys, l.nop)
  fun.call(knownKeys, nop1)
}

export function deoptWith(fun) {
  i.reify(fun(l.add))
  i.reify(fun(l.sub))
  i.reify(fun(l.id))
}

export function deoptArrayFrom(cls) {
  l.reqArr(cls.from(numArr, l.inc))
  l.reqArr(cls.from(numArr, l.dec))
  l.reqArr(cls.from(numArr, l.id))
  l.reqArr(cls.from(numArr, l.nop))

  l.reqArr(cls.from(numSet, l.inc))
  l.reqArr(cls.from(numSet, l.dec))
  l.reqArr(cls.from(numSet, l.id))
  l.reqArr(cls.from(numSet, l.nop))
}

export function deoptHofFun(self, fun) {
  fun(self, l.inc)
  fun(self, l.dec)
  fun(self, l.id)
}

export function deoptHofMeth(self, fun) {
  fun.call(self, l.inc)
  fun.call(self, l.dec)
  fun.call(self, l.id)
}
