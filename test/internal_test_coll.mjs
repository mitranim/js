import * as l from '../lang.mjs'
import * as i from '../iter.mjs'

export const size = 1024
export const numList = makeNumList(size)
export const dictList = makeDictList(numList)
export const mapList = makeMapList(numList)
export const numDict = makeNumDict(size)
export const numSet = new Set(numList)
export const numMap = makeNumMap(size)
export const numArgs = function() {return arguments}(...numList)
export const knownKeys = Object.keys(numList.slice(0, numList.length/2))
export const numEntries = Object.entries(numDict)

function makeNumList(len) {
  const out = Array(len)
  let ind = -1
  while (++ind < out.length) out[ind] = (ind % 2) * ind
  return out
}

function makeDictList(vals) {
  const out = Array(vals.length)
  let ind = -1
  while (++ind < vals.length) out[ind] = {val: vals[ind]}
  return out
}

function makeMapList(vals) {
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

function nop() {}

export function* gen(iter) {if (iter) for (const val of iter) yield val}

export function deoptDictHof(fun) {
  i.reify(fun(numDict, l.nop))
  i.reify(fun(numDict, nop))
  i.reify(fun({}, l.nop))
  i.reify(fun({}, nop))
}

export function deoptListHof(fun) {
  i.reify(fun(numList, l.nop))
  i.reify(fun(numList, nop))
}

// Semantically distinct. Implementation matches by accident.
export function deoptSeqFun(fun) {deoptSeqHof(fun)}

export function deoptSeqHof(fun) {
  deoptListHof(fun)
  i.reify(fun(numList.values(), l.nop))
  i.reify(fun(numList.values(), nop))
  i.reify(fun(numList.keys(), l.nop))
  i.reify(fun(numList.keys(), nop))
  i.reify(fun(gen(), l.nop))
  i.reify(fun(gen(), nop))
}

// Semantically distinct. Implementation matches by accident.
export function deoptCollFun(fun) {deoptCollHof(fun)}

export function deoptCollHof(fun) {
  deoptSeqHof(fun)
  i.reify(fun(numDict, l.nop))
  i.reify(fun(numDict, nop))
  i.reify(fun(numMap, l.nop))
  i.reify(fun(numMap, nop))
  i.reify(fun(numMap.values(), l.nop))
  i.reify(fun(numMap.values(), nop))
  i.reify(fun(numMap.keys(), l.nop))
  i.reify(fun(numMap.keys(), nop))
  i.reify(fun(numMap.entries(), l.nop))
  i.reify(fun(numMap.entries(), nop))
}

export function deoptNativeListHof(fun) {
  fun.call(numList, l.nop)
  fun.call(numList, nop)
  fun.call(dictList, l.nop)
  fun.call(dictList, nop)
  fun.call(knownKeys, l.nop)
  fun.call(knownKeys, nop)
}

export function deoptWith(fun) {
  i.reify(fun(l.add))
  i.reify(fun(l.sub))
  i.reify(fun(l.id))
}

export function deoptArrayFrom(cls) {
  l.reqArr(cls.from(numList, l.inc))
  l.reqArr(cls.from(numList, l.dec))
  l.reqArr(cls.from(numList, l.id))
  l.reqArr(cls.from(numList, l.nop))

  l.reqArr(cls.from(numSet, l.inc))
  l.reqArr(cls.from(numSet, l.dec))
  l.reqArr(cls.from(numSet, l.id))
  l.reqArr(cls.from(numSet, l.nop))
}

export function deoptHofFun(ctx, fun) {
  fun(ctx, l.inc)
  fun(ctx, l.dec)
  fun(ctx, l.id)
}

export function deoptHofMeth(ctx, fun) {
  fun.call(ctx, l.inc)
  fun.call(ctx, l.dec)
  fun.call(ctx, l.id)
}
