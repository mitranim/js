import * as l from './lang.mjs'

export function arrOf(seq, fun) {
  l.reqFun(fun)
  seq = arr(seq)
  for (const val of seq) l.req(val, fun)
  return seq
}

export function more(val) {return val.next().done === false}
export function alloc(len) {return Array(l.laxNat(len))}

export function arr(val) {
  if (l.isNil(val)) return []
  if (l.isArr(val)) return val
  return slice(val)
}

export function arrCopy(val) {return maybeCopy(val, arr(val))}

function maybeCopy(src, out) {return l.is(src, out) ? reslice(out) : out}
function reslice(val) {return Array.prototype.slice.call(val)}

export function slice(val, start, next) {
  l.opt(start, l.isInt)
  l.opt(next, l.isInt)
  if (l.isNil(val)) return []
  if (l.isList(val)) return Array.prototype.slice.call(val, start, next)
  if (l.isSet(val) || l.isIterator(val)) return values(val).slice(start, next)
  throw l.errConv(val, `array`)
}

export function keys(val) {
  if (!l.isObj(val)) return []
  if (l.isList(val)) return span(val.length)
  if (l.isSet(val)) return copy(val, setValues)
  if (l.isMap(val)) return copy(val, mapKeys)
  if (l.isIterator(val)) return span(iterLen(val))
  if (l.isIter(val) && l.hasMeth(val, `keys`)) return arr(val.keys())
  if (l.isStruct(val)) return Object.keys(val)
  throw l.errConv(val, `keys`)
}

// Doesn't prealloc because performance improvement would be minimal.
function copy(src, fun) {const out = []; fun(src, out); return out}
function setValues(val, out) {for (val of val.values()) out.push(val)}
function mapKeys(val, out) {for (val of val.keys()) out.push(val)}

export function values(val) {
  if (!l.isObj(val)) return []
  if (l.isArr(val)) return val
  if (l.isList(val)) return Array.prototype.slice.call(val)
  if (l.isSet(val)) return copy(val, setValues)
  if (l.isMap(val)) return copy(val, mapValues)
  if (l.isIterator(val)) return copy(val, iterValues)
  if (l.isIter(val) && l.hasMeth(val, `values`)) return arr(val.values())
  if (l.isStruct(val)) return structValues(val)
  throw l.errConv(val, `values`)
}

function mapValues(val, out) {for (val of val.values()) out.push(val)}
function iterValues(val, out) {for (val of val) out.push(val)}

// Like `Object.values` but much faster.
function structValues(src) {
  const out = Object.keys(src)
  let ind = -1
  while (++ind < out.length) out[ind] = src[out[ind]]
  return out
}

export function valuesCopy(val) {return maybeCopy(val, values(val))}

export function entries(val) {
  if (!l.isObj(val)) return []
  if (l.isArr(val)) return copy(val, arrEntries)
  if (l.isList(val)) return copy(val, listEntries)
  if (l.isSet(val)) return copy(val, setEntries)
  if (l.isMap(val)) return copy(val, mapEntries)
  if (l.isIterator(val)) return copy(val, iterEntries)
  if (l.isIter(val) && l.hasMeth(val, `entries`)) return arr(val.entries())
  if (l.isStruct(val)) return structEntries(val)
  throw l.errConv(val, `entries`)
}

function arrEntries(val, out, ind = -1) {for (val of val) out.push([++ind, val])}
function listEntries(val, out, ind = -1) {for (val of val) out.push([++ind, val])}
function setEntries(val, out) {for (val of val.entries()) out.push(val)}
function mapEntries(val, out) {for (val of val.entries()) out.push(val)}
function iterEntries(val, out, ind = -1) {for (val of val) out.push([++ind, val])}

// Like `Object.entries` but much faster.
function structEntries(src) {
  const out = Object.keys(src)
  let ind = -1
  while (++ind < out.length) out[ind] = [out[ind], src[out[ind]]]
  return out
}

export function reify(val) {return hasIter(val) ? map(val, reify) : val}

function hasIter(val) {return l.isList(val) ? some(val, hasIter) : l.isIterator(val)}

export function indexOf(val, elem) {
  if (l.opt(val, l.isList)) {
    let ind = -1
    while (++ind < val.length) if (l.is(val[ind], elem)) return ind
  }
  return -1
}

export function includes(val, elem) {return values(val).includes(elem)}
export function concat(one, two) {return values(one).concat(values(two))}
export function append(val, elem) {return values(val).concat([elem])}
export function prepend(val, elem) {return [elem].concat(values(val))}

export function len(val) {
  if (!l.isObj(val)) return 0

  if (l.isIter(val)) {
    const len = getLength(val)
    if (l.isNat(len)) return len

    const size = getSize(val)
    if (l.isNat(size)) return size

    if (l.isIterator(val)) return iterLen(val)
    return 0
  }

  if (l.isStruct(val)) return Object.keys(val).length
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
  l.reqArr(val)
  l.reqFun(fun)
  let ind = -1
  while (++ind < val.length) val[ind] = fun(val[ind])
  return val
}

export function mapCompact(val, fun) {return compact(map(val, fun))}

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

export function head(val) {
  if (!l.isObj(val)) return undefined
  if (l.isList(val)) return val[0]
  if (l.isIter(val)) return iter(val).next().value
  return val[keys(val)[0]]
}

function iter(val) {return l.hasMeth(val, `values`) ? val.values() : val[Symbol.iterator]()}

export function last(val) {return val = values(val), val[val.length - 1]}
export function init(val) {return values(val).slice(0, -1)}
export function tail(val) {return values(val).slice(1)}
export function take(val, len) {return values(val).slice(0, l.laxNat(len))}

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

export function mapOf(...args) {
  const out = new Map()
  let ind = 0
  while (ind < args.length) out.set(args[ind++], args[ind++])
  return out
}

export function range(min, max) {
  min = l.laxInt(min)
  max = l.laxInt(max)
  if (!(max >= min)) throw Error(`invalid range [${min},${max})`)

  const out = alloc(max - min)
  let ind = -1
  while (++ind < out.length) out[ind] = min + ind
  return out
}

export function span(len) {return range(0, l.laxNat(len))}
export function times(len, fun) {return mapMut(span(len), fun)}
export function repeat(len, val) {return alloc(len).fill(val)}
export function set(val) {return l.isSet(val) ? val : new Set(values(val))}
export function setCopy(val) {return new Set(values(val))}

function getLength(val) {return l.get(val, `length`)}
function getSize(val) {return l.get(val, `size`)}
