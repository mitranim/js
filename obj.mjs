import * as l from './lang.mjs'
import * as i from './iter.mjs'

export function fixProto(ref, cls) {
  if (Object.getPrototypeOf(ref) !== cls.prototype) {
    Object.setPrototypeOf(ref, cls.prototype)
  }
}

export function assign(tar, src) {
  l.reqStruct(tar)
  for (const key of l.structKeys(src)) tar[key] = src[key]
  return tar
}

export function patch(tar, src) {
  l.reqStruct(tar)
  for (const key of l.structKeys(src)) {
    if (!(key in tar) || l.hasOwnEnum(tar, key)) tar[key] = src[key]
  }
  return tar
}

export function mapDict(val, fun) {
  l.reqFun(fun)
  const out = l.npo()
  for (const key of l.structKeys(val)) out[key] = fun(val[key])
  return out
}

export function pick(val, fun) {
  l.reqFun(fun)
  const out = l.npo()
  for (const key of l.structKeys(val)) {
    const elem = val[key]
    if (fun(elem)) out[key] = elem
  }
  return out
}

export function omit(val, fun) {return pick(val, l.not(fun))}

export function pickKeys(val, keys) {
  val = l.laxStruct(val)
  const out = l.npo()
  for (const key of i.values(keys)) if (l.hasOwnEnum(val, key)) out[key] = val[key]
  return out
}

export function omitKeys(val, keys) {
  val = l.laxStruct(val)
  keys = i.set(keys)
  const out = l.npo()
  for (const key of l.structKeys(val)) if (!keys.has(key)) out[key] = val[key]
  return out
}

/*
Short for "strict proxy handler". This handler traps "get" operations, causing
exceptions when accessing properties/methods not present in the target object.
This behavior is similar to Python classes.

The "get" trap is similar to `l.reqGet(tar, key)`, with a key difference: it
invokes inherited getters on the proxy rather than on the target object. This
ensures compatibility with `memGet` and `MemGet`, which tend to invoke getters
in a chain. For slightly better performance we assume that own properties
aren't getters, but the difference is much lower than the overhead of the proxy
trap.

At the time of writing, in V8, the overhead of generating the object descriptor
is fairly low and eclipsed by the cost of searching the prototype chain
manually, as opposed to letting the engine do it.

Needs tests. Needs more profiling and tuning.
*/
export class StrictPh {
  get(tar, key, pro) {
    if (l.hasOwn(tar, key)) return tar[key]

    /*
    Asinine special case for compatibility with asinine implementations or
    specification of async/await. JS engines don't seem to check if the object
    has this property, they just try to get it.
    */
    if (key === `then`) return tar[key]

    const desc = descIn(tar, key)
    if (!desc) throw l.errIn(tar, key)
    if (desc.get) return desc.get.call(pro)
    return desc.value
  }

  get [Symbol.toStringTag]() {return this.constructor.name}
}

StrictPh.main = /* @__PURE__ */ new StrictPh()

export function strict(val) {return new Proxy(val, StrictPh.main)}

export class Strict {
  constructor() {return strict(this)}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class MemGet extends Strict {
  constructor() {memGet(new.target), super()}
}

export function memGet(cls) {return MemTag.main.get(cls)}

export class MemTag extends WeakSet {
  get(cls) {
    if (!this.has(cls)) {
      patchCls(cls, memGetAt)
      this.add(cls)
    }
    return cls
  }

  get [Symbol.toStringTag]() {return this.constructor.name}
}

MemTag.main = /* @__PURE__ */ new MemTag()

/* Internal */

function patchCls(cls, fun) {
  const proto = l.req(cls, l.isCls).prototype
  const descs = Object.getOwnPropertyDescriptors(proto)

  for (const key of Object.keys(descs)) {
    if (key === `constructor`) continue
    fun(proto, key, descs[key])
  }
  return cls
}

function pub(ref, key, val) {
  Object.defineProperty(ref, key, {
    value: val,
    writable: true,
    enumerable: true,
    configurable: true,
  })
  return val
}

function memGetAt(ref, key, desc) {
  const {get} = desc
  if (!get || desc.set || !desc.configurable) return

  desc.get = function memGet() {return pub(this, key, get.call(this))}
  desc.set = function memSet(val) {pub(this, key, val)}

  Object.defineProperty(ref, key, desc)
}

function descIn(ref, key) {
  while (ref) {
    const val = Object.getOwnPropertyDescriptor(ref, key)
    if (val) return val
    ref = Object.getPrototypeOf(ref)
  }
  return undefined
}
