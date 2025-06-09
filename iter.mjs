import * as l from './lang.mjs'

export function arrOf(seq, fun) {
  l.reqFun(fun)
  seq = arr(seq)
  for (const val of seq) l.req(val, fun)
  return seq
}

export function more(val) {return val.next().done === false}

export function alloc(len) {return Array(l.reqNat(len))}

export function arr(val) {return l.isTrueArr(val) ? val : arrCopy(val)}

export function arrOpt(val) {return l.isNil(val) ? val : arr(val)}

export function arrCopy(val) {
  if (l.isNil(val)) return []
  if (l.isTrueArr(val)) return val.slice()
  if (l.isArr(val)) return [].concat(val)
  if (l.isArrble(val)) return listToArr(toArray(val))
  if (l.isSet(val)) return [...val]
  if (l.isSeq(val)) return iterToArr(val)
  throw l.errConv(val, `array`)
}

function toArray(val) {return l.reqArr(val.toArray())}

function listToArr(val) {
  if (l.isTrueArr(val)) return val.slice()
  if (l.isArr(val)) return [].concat(val)
  return Array.prototype.slice.call(val)
}

function iterToArr(val) {
  const out = []
  for (val of val) out.push(val)
  return out
}

export function slice(val, start, next) {
  return arr(val).slice(l.optInt(start), l.optInt(next))
}

export function keys(val) {
  if (!l.isObj(val)) return []
  if (l.isList(val)) return span(val.length)
  if (l.isSet(val)) return [...val]
  if (l.isMap(val)) return [...val.keys()]
  if (l.isIter(val) && l.hasMeth(val, `keys`)) return iterToArr(val.keys())
  if (l.isIterator(val)) return span(iterLen(val))
  if (l.isArrble(val)) return span(l.onlyNat(getSize(val)) ?? toArray(val).length)
  if (isRecSync(val)) return Object.keys(val)
  throw l.errConv(val, `keys`)
}

export function values(val) {
  if (l.isTrueArr(val)) return val
  if (l.isArrble(val)) return values(toArray(val))
  return valuesCopy(val)
}

export function valuesCopy(val) {
  if (!l.isObj(val)) return []
  if (l.isArrble(val)) return listToArr(toArray(val))
  if (l.isList(val)) return listToArr(val)
  if (l.isSet(val)) return [...val]
  if (l.isMap(val)) return [...val.values()]
  if (l.isIter(val) && l.hasMeth(val, `values`)) return iterToArr(val.values())
  if (l.isIterator(val)) return iterToArr(val)
  if (isRecSync(val)) return valuesFromStruct(val)
  throw l.errConv(val, `values`)
}

function valuesFromStruct(src) {
  const out = Object.keys(src)
  const len = out.length
  let ind = -1
  while (++ind < len) out[ind] = src[out[ind]]
  return out
}

export function entries(val) {
  if (!l.isObj(val)) return []
  if (l.isList(val)) return entriesFromList(val)
  if (l.isIter(val) && l.hasMeth(val, `entries`)) return iterToArr(val.entries())
  if (l.isIterator(val)) return iterToArr(val)
  if (l.isArrble(val)) return entriesFromList(toArray(val))
  if (isRecSync(val)) return recEntries(val)
  throw l.errConv(val, `entries`)
}

function entriesFromList(val) {
  const out = alloc(val.length)
  const len = val.length
  let ind = -1
  while (++ind < len) out[ind] = [ind, val[ind]]
  return out
}

// Like `Object.entries` but much faster.
function recEntries(src) {
  const out = Object.keys(src)
  const len = out.length
  let ind = -1
  while (++ind < len) out[ind] = [out[ind], src[out[ind]]]
  return out
}

export function reify(val) {return hasIter(val) ? map(val, reify) : val}

function hasIter(val) {return l.isList(val) ? some(val, hasIter) : l.isIterator(val)}

export function indexOf(src, val) {
  if (l.isNil(src)) return -1
  src = l.reqList(src)

  const len = src.length
  let ind = -1
  while (++ind < len) if (l.is(src[ind], val)) return ind
  return -1
}

export function findIndex(src, fun) {
  l.reqFun(fun)
  if (l.optList(src)) {
    const len = src.length
    let ind = -1
    while (++ind < len) if (fun(src[ind])) return ind
  }
  return -1
}

export function includes(src, val) {
  return l.hasMeth(src, `has`) ? src.has(val) : values(src).includes(val)
}

export function append(src, val) {
  return l.isNil(src) ? [val] : values(src).concat([val])
}

export function prepend(src, val) {
  return l.isNil(src) ? [val] : [val].concat(values(src))
}

export function concat(...val) {
  return val.length ? Array.prototype.concat.call(...mapMut(val, values)) : []
}

// TODO move to `lang.mjs`.
export function len(val) {
  if (!l.isObj(val)) return 0

  if (l.isIter(val)) {
    const len = getLength(val)
    if (l.isNat(len)) return len

    const size = getSize(val)
    if (l.isNat(size)) return size

    return iterLen(iter(val))
  }

  if (isRecSync(val)) return Object.keys(val).length
  throw TypeError(`unable to measure length of ${l.show(val)}`)
}

function iterLen(val) {
  let out = 0
  while (more(val)) out++
  return out
}

// TODO rename to `isNotEmpty`.
// TODO move to `lang.mjs`.
export function hasLen(val) {return len(val) > 0}

// TODO test.
export function clear(tar) {
  if (l.isNil(tar)) return tar
  if (l.isArr(tar)) return tar.length = 0, tar
  if (l.isClearable(tar)) return tar.clear(), tar
  throw TypeError(`unable to clear ${l.show(tar)}`)
}

export function each(val, fun) {
  l.reqFun(fun)
  for (val of values(val)) fun(val)
}

export function map(val, fun) {return mapMut(valuesCopy(val), fun)}

export function mapMut(val, fun) {
  val = l.reqTrueArr(val)
  l.reqFun(fun)
  const len = val.length
  let ind = -1
  while (++ind < len) val[ind] = fun(val[ind])
  return val
}

export function mapCls(src, cls) {
  l.reqCls(cls)
  return map(src, function make(val) {return new cls(val)})
}

export function mapCompact(val, fun) {return compact(map(val, fun))}

export function mapFlat(val, fun) {return flat(map(val, fun))}

export function filter(val, fun) {
  l.reqFun(fun)
  const out = []
  for (val of values(val)) if (fun(val)) out.push(val)
  return out
}

export function reject(val, fun) {return filter(val, l.not(fun))}

export function compact(val) {
  const out = []
  for (val of values(val)) if (val) out.push(val)
  return out
}

export function remove(src, val) {
  return filter(src, function remove(elem) {return !l.is(val, elem)})
}

export function fold(val, acc, fun) {
  l.reqFun(fun)
  for (val of values(val)) acc = fun(acc, val)
  return acc
}

export function fold1(src, fun) {
  src = values(src)
  l.reqFun(fun)

  const len = src.length
  let acc = len ? src[0] : undefined
  let ind = 0
  while (++ind < len) acc = fun(acc, src[ind])
  return acc
}

export function find(val, fun) {
  l.reqFun(fun)
  for (val of values(val)) if (fun(val)) return val
  return undefined
}

export function procure(val, fun) {
  l.reqFun(fun)
  for (val of values(val)) if ((val = fun(val))) return val
  return undefined
}

export function every(val, fun) {
  l.reqFun(fun)
  for (val of values(val)) if (!fun(val)) return false
  return true
}

export function some(val, fun) {
  l.reqFun(fun)
  for (val of values(val)) if (fun(val)) return true
  return false
}

export function flat(src) {return flatAdd([], values(src))}

function flatAdd(tar, src) {
  if (l.isNil(src)) return tar

  if (l.isTrueArr(src)) {
    for (src of src) flatAdd(tar, src)
    return tar
  }

  tar.push(src)
  return tar
}

export function head(val) {
  if (!l.isObj(val)) return undefined
  if (l.isList(val)) return val[0]
  if (l.isArrble(val)) return head(toArray(val))
  if (l.isIter(val)) return iter(val).next().value
  return val[keys(val)[0]]
}

function iter(val) {return l.hasMeth(val, `values`) ? val.values() : val[Symbol.iterator]()}

/*
Suboptimal for non-list iterators, but even an "optimal" version would be
terrible. If user code needs to frequently pick the last value of some
sequence, the sequence should be stored in a way that makes this efficient.
Namely, it should be an array.
*/
export function last(val) {
  if (!l.isObj(val)) return undefined
  if (l.isList(val)) return val[val.length - 1]
  if (l.isArrble(val)) return last(toArray(val))
  if (l.isIter(val)) return last(values(val))
  return val[last(keys(val))]
}

export function init(val) {return values(val).slice(0, -1)}

export function tail(val) {return values(val).slice(1)}

export function take(val, len) {
  return l.isNil(len) ? values(val) : values(val).slice(0, l.reqNat(len))
}

export function count(val, fun) {
  l.reqFun(fun)
  let out = 0
  for (val of values(val)) if (fun(val)) out++
  return out
}

// https://tc39.github.io/ecma262/#sec-sortcompare
export function compare(one, two) {
  if (one === undefined && two === undefined) return 0
  if (one === undefined) return 1
  if (two === undefined) return -1
  one += ``
  two += ``
  if (one < two) return -1
  if (two < one) return 1
  return 0
}

// Similar to sorting by `l.sub`, but more stringent with its inputs.
export function compareFin(one, two) {
  one = l.laxFin(one)
  two = l.laxFin(two)
  if (one < two) return -1
  if (one > two) return 1
  return 0
}

export function sort(val, fun) {return valuesCopy(val).sort(fun)}

export function reverse(val) {return reverseMut(valuesCopy(val))}

export function reverseMut(tar) {
  l.reqArr(tar)
  let ind0 = 0
  let ind1 = tar.length - 1
  while (ind0 < ind1) {
    [tar[ind0], tar[ind1]] = [tar[ind1], tar[ind0]]
    ind0++
    ind1--
  }
  return tar
}

export function index(val, fun) {
  l.reqFun(fun)
  const out = l.Emp()
  for (val of values(val)) {
    const key = fun(val)
    if (l.isKey(key)) out[key] = val
  }
  return out
}

export function group(val, fun) {
  l.reqFun(fun)
  const out = l.Emp()
  for (val of values(val)) {
    const key = fun(val)
    if (l.isKey(key)) (out[key] || (out[key] = [])).push(val)
  }
  return out
}

export function partition(val, fun) {
  l.reqFun(fun)
  const one = []
  const two = []
  for (val of values(val)) (fun(val) ? one : two).push(val)
  return [one, two]
}

export function sum(val) {return fold(val, 0, addFin)}

function addFin(acc, val) {return toFin(acc) + toFin(val)}
function toFin(val) {return l.isFin(val) ? val : 0}

export function zip(src) {
  const out = l.Emp()
  for (const [key, val] of values(src)) if (l.isKey(key)) out[key] = val
  return out
}

export function setOf(...val) {return new Set(val)}

export function setFrom(val) {return l.isSet(val) ? val : new Set(values(val))}

export function setCopy(val) {return new Set(values(val))}

export function mapOf(...val) {
  const out = new Map()
  let ind = 0
  while (ind < val.length) out.set(val[ind++], val[ind++])
  return out
}

export function range(min, max) {
  min = l.laxInt(min)
  max = l.laxInt(max)
  if (!(max >= min)) throw Error(`invalid range [${min},${max})`)

  const out = alloc(max - min)
  const len = out.length
  let ind = -1
  while (++ind < len) out[ind] = min + ind
  return out
}

export function span(len) {return range(0, l.laxNat(len))}
export function times(len, fun) {return mapMut(span(len), fun)}
export function repeat(len, val) {return alloc(l.laxNat(len)).fill(val)}

export function mapDict(val, fun) {
  l.reqFun(fun)
  const out = l.Emp()
  for (const key of l.recKeys(val)) out[key] = fun(val[key])
  return out
}

// Antipattern, should probably remove.
export function pick(val, fun) {
  l.reqFun(fun)
  const out = l.Emp()
  for (const key of l.recKeys(val)) {
    const elem = val[key]
    if (fun(elem)) out[key] = elem
  }
  return out
}

// Antipattern, should probably remove.
export function omit(val, fun) {return pick(val, l.not(fun))}

// Antipattern, should probably remove.
export function pickKeys(val, keys) {
  val = l.laxRec(val)
  const out = l.Emp()
  for (const key of values(keys)) if (l.hasOwnEnum(val, key)) out[key] = val[key]
  return out
}

// Antipattern, should probably remove.
export function omitKeys(val, keys) {
  val = l.laxRec(val)
  keys = setFrom(keys)
  const out = l.Emp()
  for (const key of l.recKeys(val)) if (!keys.has(key)) out[key] = val[key]
  return out
}

export function compactDict(val) {return pick(val, l.id)}

/* Internal */

function getLength(val) {return l.get(val, `length`)}
function getSize(val) {return l.get(val, `size`)}
function isRecSync(val) {return l.isRec(val) && !(Symbol.asyncIterator in val)}
