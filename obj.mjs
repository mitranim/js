import * as l from './lang.mjs'

export function isObjKey(val) {return l.isStr(val) || l.isSym(val)}
export function reqObjKey(val) {return isObjKey(val) ? val : l.convFun(val, isObjKey)}

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

// TODO: patching should support `.mut` on fields that implement this interface.
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

/*
Tool for classes that define a default singleton.
By default, instantiates the class with no arguments.
Subclasses may override `static get default` to customize.
*/
export function MixMain(cls) {
  return class MixMainCls extends cls {
    static get main() {
      const key = Symbol.for(`main`)
      return l.hasOwn(this, key) ? this[key] : this[key] = this.default
    }

    static get default() {return new this()}
  }
}

export class Strict extends l.Emp {
  constructor() {
    super()
    return this.StrictPh.of(this)
  }

  get StrictPh() {return StrictPh}
}

/*
Proxy handler that hides and/or forbids everything by default.
To allow a specific operation, override the corresponding method.
*/
export class BlankPh extends l.Emp {
  apply() {throw l.errImpl()}
  construct() {throw l.errImpl()}
  defineProperty() {return false}
  deleteProperty() {return false}
  get() {}
  getOwnPropertyDescriptor() {}
  getPrototypeOf() {return null}
  has() {return false}
  isExtensible() {return false}
  ownKeys() {return []}
  preventExtensions() {return false}
  set() {return false}
  setPrototypeOf() {return false}
}

/*
Short for "proxy handler". Simple shortcut for stateless proxy handler classes.
Static method `.of` idempotently creates and reuses one "main" instance.
Might export later.
*/
class Ph extends MixMain(l.Emp) {
  static of(val) {return new Proxy(val, this.main)}
}

/*
Short for "strict proxy handler". This handler traps "get" operations, causing
exceptions when accessing properties/methods not present in the target object.
This behavior is similar to Python classes.

The "get" trap is similar to `l.reqGet(tar, key)`, with a key difference: it
invokes inherited getters on the proxy rather than on the target object. This
ensures compatibility with `memGet`, which may invoke a getter than invokes
another getter, etc. For slightly better performance we assume that own
properties aren't getters, but the difference is much lower than the overhead
of the proxy trap.

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

export class MemTag extends MixMain(WeakTag) {
  make(cls) {return memPatch(cls)}
}

export class CallPh extends Ph {
  apply(tar, self, args) {return tar.call.apply(self, args)}
}

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

export class Cache extends MixMain(Map) {
  goc(key) {
    if (!this.has(key)) this.set(key, this.make(key))
    return this.get(key)
  }
  make() {}
}

export class WeakCache extends MixMain(WeakMap) {
  goc(key) {
    if (!this.has(key)) this.set(key, this.make(key))
    return this.get(key)
  }
  make() {}
}

// Should be used with null-prototype targets. Create via static `.new`.
export class MakerPh extends l.Emp {
  get(tar, key) {return key in tar ? tar[key] : (tar[key] = this.make(key, tar))}
  make() {}
  static new(...val) {return new Proxy(l.npo(), new this(...val))}
}

/*
Short for "dynamic". Represents a dynamically scoped variable, as opposed to
regular lexically scoped variables.
*/
export class Dyn extends l.Emp {
  constructor($) {super().$ = $}
  has() {return l.isSome(this.$)}
  get() {return this.$}
  set($) {this.$ = $}
  swap($) {try {return this.$} finally {this.$ = $}}
}

export function mixin(tar, src) {
  const pro = l.reqCls(tar).prototype
  src = l.reqCls(src).prototype

  while (src) {
    for (const [key, val] of descriptors(src)) {
      if (!(key in pro)) Object.defineProperty(pro, key, val)
    }
    src = Object.getPrototypeOf(src)
  }
  return tar
}

export function pub(tar, key, val) {
  Object.defineProperty(tar, reqObjKey(key), {
    value: val,
    writable: true,
    enumerable: true,
    configurable: true,
  })
  return val
}

export function priv(tar, key, val) {
  Object.defineProperty(tar, reqObjKey(key), {
    value: val,
    writable: true,
    enumerable: false,
    configurable: true,
  })
  return val
}

export function final(tar, key, val) {
  Object.defineProperty(tar, reqObjKey(key), {
    value: val,
    writable: false,
    enumerable: true,
    configurable: true,
  })
  return val
}

export function getter(tar, key, get) {return getSet(tar, key, get)}

export function setter(tar, key, set) {return getSet(tar, key, undefined, set)}

export function getSet(tar, key, get, set) {
  Object.defineProperty(tar, reqObjKey(key), {
    get,
    set,
    enumerable: false,
    configurable: true,
  })
}

/* Internal */

function descriptors(val) {
  return Object.entries(Object.getOwnPropertyDescriptors(val))
}

function memPatch(cls) {
  const tar = l.reqCls(cls).prototype

  for (const [key, desc] of descriptors(tar)) {
    if (key === `constructor`) continue

    const {get} = desc
    if (!get || desc.set || !desc.configurable) continue

    desc.get = function memGet() {return pub(this, key, get.call(this))}
    desc.set = function memSet(val) {pub(this, key, val)}

    Object.defineProperty(tar, key, desc)
  }

  return cls
}

function descIn(tar, key) {
  while (tar) {
    const val = Object.getOwnPropertyDescriptor(tar, key)
    if (val) return val
    tar = Object.getPrototypeOf(tar)
  }
  return undefined
}
