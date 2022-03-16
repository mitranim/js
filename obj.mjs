import * as l from './lang.mjs'

export function assign(tar, src) {
  l.reqStruct(tar)
  for (const key of l.structKeys(src)) tar[key] = src[key]
  return tar
}

export function patch(tar, src) {
  l.reqStruct(tar)
  for (const key of l.structKeys(src)) {
    if (!l.hasInherited(tar, key)) tar[key] = src[key]
  }
  return tar
}

export function patchInstances(tar, src, cls) {
  l.reqStruct(tar)
  for (const key of l.structKeys(src)) {
    if (!l.hasInherited(tar, key)) tar[key] = l.toInst(src[key], cls)
  }
  return tar
}

export class Dict extends l.Emp {
  constructor(val) {super().mut(val)}
  mut(val) {return this.mutFromStruct(val), this.reinit(), this}
  mutFromStruct(val) {return patch(this, val)}
  reinit() {}
}

export class ClsDict extends Dict {
  get cls() {return Object}
  mutFromStruct(val) {return patchInstances(this, val, this.cls)}
}

export class Strict extends l.Emp {
  constructor() {
    super()
    return this.StrictPh.of(this)
  }

  get StrictPh() {return StrictPh}
}

/*
Short for "proxy handler". Simple shortcut for stateless proxy handler classes.
Static method `.of` idempotently creates and reuses one "main" instance.
Might export later.
*/
class Ph extends l.Emp {
  static of(val) {
    if (!l.hasOwn(this, `main`)) this.main = new this()
    return new Proxy(val, this.main)
  }
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
export class StrictPh extends Ph {
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
}

export class WeakTag extends WeakSet {
  goc(val) {
    if (!this.has(val)) this.make(val), this.add(val)
    return val
  }

  make() {}
}

export function memGet(cls) {return MemTag.main.goc(cls)}

export class MemTag extends WeakTag {
  make(cls) {patchCls(cls, memGetAt)}
}

export class MemGet extends Strict {
  constructor() {memGet(new.target), super()}
}
MemTag.main = /* @__PURE__ */ new MemTag()

/*
When used to proxy a class, this allows to call that class as a function,
omitting `new`.
*/
export class ClsFunPh extends Ph {
  apply(tar, _, args) {return new tar(...args)}

  static of(val) {return super.of(l.reqCls(val))}
}

/*
This is the blackest of magicks.

  * This is a proxy to a class.

  * Unlike normal classes, this can be called as a function.

  * Calling an INSTANCE method on the CLASS automatically makes a new instance
    and calls the instance method on it.
*/
export class ClsInstPh extends ClsFunPh {
  get(tar, key) {
    if (key in tar.prototype && !(key in tar)) {
      const ref = new tar()
      return ref[key].bind(ref)
    }
    return tar[key]
  }

  apply(tar, _self, args) {
    if (l.isInst(args[0], tar)) return args[0]
    return new tar(...args)
  }
}

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

function memGetAt(ref, key, desc) {
  const {get} = desc
  if (!get || desc.set || !desc.configurable) return

  desc.get = function memGet() {return pub(this, key, get.call(this))}
  desc.set = function memSet(val) {pub(this, key, val)}

  Object.defineProperty(ref, key, desc)
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

function descIn(ref, key) {
  while (ref) {
    const val = Object.getOwnPropertyDescriptor(ref, key)
    if (val) return val
    ref = Object.getPrototypeOf(ref)
  }
  return undefined
}
