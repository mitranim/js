import * as l from './lang.mjs'

export function arrOf(seq, fun) {
  l.reqFun(fun)
  seq = arr(seq)
  for (const val of seq) l.req(val, fun)
  return seq
}

export function more(val) {return val.next().done === false}

export function alloc(len) {return Array(l.reqNat(len))}

export function arr(val) {
  if (l.isNil(val)) return []
  if (isTrueArr(val)) return val.slice()
  if (l.isList(val)) return arrFromList(val)
  if (l.isArrble(val)) return arrFromList(val.toArray())
  if (l.isSeq(val)) return values(val)
  throw l.errConv(val, `array`)
}

function arrFromList(val) {
  if (isTrueArr(val)) return val.slice()
  if (l.isArr(val)) return [].concat(val)
  return Array.prototype.slice.call(val)
}

function arrFromIter(val) {
  const out = []
  for (val of val) out.push(val)
  return out
}

export function slice(val, start, next) {
  l.opt(start, l.isInt)
  l.opt(next, l.isInt)
  if (!start && !next) return arr(val)
  return arr(val).slice(start, next)
}

export function keys(val) {
  if (!l.isObj(val)) return []
  if (l.isList(val)) return span(val.length)
  if (l.isIter(val) && l.hasMeth(val, `keys`)) return arrFromIter(val.keys())
  if (isStructSync(val)) return Object.keys(val)
  throw l.errConv(val, `keys`)
}

export function values(val) {
  if (isTrueArr(val)) return val
  return valuesCopy(val)
}

export function valuesCopy(val) {
  if (!l.isObj(val)) return []
  if (l.isList(val)) return arrFromList(val)
  if (l.isArrble(val)) return arrFromList(val.toArray())
  if (l.isSet(val)) return withBuf(val, copySet)
  if (l.isMap(val)) return withBuf(val, copyMap)
  if (l.isIter(val) && l.hasMeth(val, `values`)) return arrFromIter(val.values())
  if (l.isIterator(val)) return arrFromIter(val)
  if (isStructSync(val)) return valuesFromStruct(val)
  throw l.errConv(val, `values`)
}

function withBuf(src, fun) {const out = []; fun(src, out); return out}
function copySet(val, out) {for (val of l.reqSet(val).values()) out.push(val)}
function copyMap(val, out) {for (val of l.reqMap(val).values()) out.push(val)}

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
  if (l.isIter(val) && l.hasMeth(val, `entries`)) return arrFromIter(val.entries())
  if (l.isIterator(val)) return arrFromIter(val)
  if (isStructSync(val)) return structEntries(val)
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
function structEntries(src) {
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
  const len = l.reqList(src).length
  let ind = -1
  while (++ind < len) if (l.is(src[ind], val)) return ind
  return -1
}

export function findIndex(src, fun) {
  l.reqFun(fun)
  if (l.opt(src, l.isList)) {
    const len = src.length
    let ind = -1
    while (++ind < len) if (fun(src[ind])) return ind
  }
  return -1
}

export function includes(src, val) {
  return l.isSet(src) ? src.has(val) : values(src).includes(val)
}

export function append(src, val) {return values(src).concat([val])}

export function prepend(src, val) {return [val].concat(values(src))}

export function concat(...val) {
  switch (val.length) {
    case 0: return []
    case 1: return values(val[0])
    case 2: return values(val[0]).concat(values(val[1]))
    default: return [].concat(...mapMut(val, values))
  }
}

export function len(val) {
  if (!l.isObj(val)) return 0

  if (l.isIter(val)) {
    const len = getLength(val)
    if (l.isNat(len)) return len

    const size = getSize(val)
    if (l.isNat(size)) return size

    return iterLen(iter(val))
  }

  if (isStructSync(val)) return Object.keys(val).length
  throw TypeError(`unable to measure length of ${l.show(val)}`)
}

function iterLen(val) {
  let out = 0
  while (more(val)) out++
  return out
}

export function hasLen(val) {return len(val) > 0}

export function each(val, fun) {
  l.reqFun(fun)
  for (val of values(val)) fun(val)
}

export function map(val, fun) {return mapMut(valuesCopy(val), fun)}

export function mapMut(val, fun) {
  val = reqTrueArr(val)
  l.reqFun(fun)
  const len = val.length
  let ind = -1
  while (++ind < len) val[ind] = fun(val[ind])
  return val
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

export function flat(val) {
  val = arr(val)
  for (const elem of val) if (l.isArr(elem)) return val.flat(Infinity)
  return val
}

export function head(val) {
  if (!l.isObj(val)) return undefined
  if (l.isList(val)) return val[0]
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

export function compareFin(one, two) {
  one = l.laxFin(one)
  two = l.laxFin(two)
  if (one < two) return -1
  if (one > two) return 1
  return 0
}

export function sort(val, fun) {return valuesCopy(val).sort(fun)}
export function reverse(val) {return valuesCopy(val).reverse()}

export function index(val, fun) {
  l.reqFun(fun)
  const out = l.npo()
  for (val of values(val)) {
    const key = fun(val)
    if (l.isKey(key)) out[key] = val
  }
  return out
}

export function group(val, fun) {
  l.reqFun(fun)
  const out = l.npo()
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
  const out = l.npo()
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
  const out = l.npo()
  for (const key of l.structKeys(val)) out[key] = fun(val[key])
  return out
}

// Antipattern, should probably remove.
export function pick(val, fun) {
  l.reqFun(fun)
  const out = l.npo()
  for (const key of l.structKeys(val)) {
    const elem = val[key]
    if (fun(elem)) out[key] = elem
  }
  return out
}

// Antipattern, should probably remove.
export function omit(val, fun) {return pick(val, l.not(fun))}

// Antipattern, should probably remove.
export function pickKeys(val, keys) {
  val = l.laxStruct(val)
  const out = l.npo()
  for (const key of values(keys)) if (l.hasOwnEnum(val, key)) out[key] = val[key]
  return out
}

// Antipattern, should probably remove.
export function omitKeys(val, keys) {
  val = l.laxStruct(val)
  keys = setFrom(keys)
  const out = l.npo()
  for (const key of l.structKeys(val)) if (!keys.has(key)) out[key] = val[key]
  return out
}

/* Internal */

function getLength(val) {return l.get(val, `length`)}
function getSize(val) {return l.get(val, `size`)}
function isStructSync(val) {return l.isStruct(val) && !(Symbol.asyncIterator in val)}

// At the time of writing, in V8, array subclasses have inferior performance.
// We enforce plain arrays for consistent performance.
export function isTrueArr(val) {return l.isArr(val) && val.constructor === Array}
export function reqTrueArr(val) {return l.req(val, isTrueArr)}
