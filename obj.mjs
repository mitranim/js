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

export function isMut(val) {return l.isObj(val) && `mut` in val && l.isFun(val.mut)}
export function reqMut(val) {return isMut(val) ? val : l.convFun(val, isMut)}

export class Struct extends l.Emp {
  constructor(src) {
    super()
    this.mut(src)
    if (this.constructor.strict) this.constructor.type.validate(this)
  }

  mut(src) {
    this.constructor.type.mutate(this, src)
    return this
  }

  static get type() {
    if (!l.hasOwn(this, `structType`)) {
      this.structType = new this.StructType(this, this.fields)
    }
    return this.structType
  }

  static get StructType() {return StructType}
}

// Internal tool for `Struct` type checking.
export class StructType extends l.Emp {
  constructor(cls, fields) {
    super()
    priv(this, `cls`, l.reqCls(cls))
    this.dict = l.npo()
    this.list = []
    this.addFields(fields)
  }

  addFields(src) {
    for (const key of l.structKeys(src)) this.addField(key, src[key])
    return this
  }

  addField(key, val) {
    const {dict} = this
    if (key in dict) throw Error(`redundant field ${l.show(key)}`)
    this.list.push(dict[key] = new this.StructField(this, key, val))
  }

  validate(tar) {for (const field of this.list) field.validate(tar)}

  mutate(tar, src) {
    for (const key of l.structKeys(src)) this.set(tar, key, src[key])
  }

  set(tar, key, val) {
    const {dict} = this
    if (key in dict) dict[key].set(tar, val)
    else this.setAny(tar, key, val)
  }

  setAny(tar, key, val) {
    if (l.hasOwn(tar, key)) {
      this.mutOrAssignAny(tar, key, val)
      return
    }

    if (!(key in tar)) {
      this.assignAny(tar, key, val)
      return
    }

    // May execute a mem getter.
    l.nop(tar[key])
    if (!l.hasOwn(tar, key)) return

    this.mutOrAssignAny(tar, key, val)
  }

  mutOrAssignAny(tar, key, val) {
    const prev = tar[key]
    if (isMut(prev)) prev.mut(val)
    else this.assignAny(tar, key, val)
  }

  assignAny(tar, key, val) {tar[key] = this.any(val, key)}

  any(val, key) {
    const {cls} = this
    if (`any` in cls) return cls.any(val, key)
    return val
  }

  get StructField() {return StructField}
}

// Field definition used by `StructType`.
export class StructField extends l.Emp {
  constructor(typ, key, fun) {
    super()
    priv(this, `typ`, l.reqInst(typ, StructType))
    this.key = l.reqStr(key)
    this.fun = l.reqFun(fun)
    this.desc = descIn(typ.cls.prototype, key)
  }

  set(tar, val) {
    const {key, desc} = this

    if (l.hasOwn(tar, key)) {
      this.mutOrAssign(tar, val)
      return
    }

    if (!desc) {
      this.assign(tar, val)
      return
    }

    if (!desc.get) return

    if (desc.set) {
      this.assign(tar, val)
      return
    }

    // May execute a mem getter.
    l.nop(tar[key])

    if (l.hasOwn(tar, key)) {
      this.mutOrAssign(tar, val)
      return
    }

    pub(tar, key, this.val(tar, val))
  }

  mutOrAssign(tar, val) {
    const prev = tar[this.key]
    if (isMut(prev)) prev.mut(val)
    else this.assign(tar, val)
  }

  assign(tar, val) {tar[this.key] = this.val(tar, val)}

  val(tar, val) {
    const {key, fun} = this
    try {
      return fun.call(tar, val)
    }
    catch (err) {
      throw l.errWrap(err, TypeError, `invalid field ${l.show(key)} for ${l.show(tar)}`)
    }
  }

  validate(tar) {
    l.reqObj(tar)

    const {key, fun} = this
    const prev = key in tar ? tar[key] : undefined

    let next
    try {
      next = fun.call(tar, prev)
    }
    catch (err) {
      throw l.errWrap(err, TypeError, `invalid field ${l.show(key)} on ${l.show(tar)}`)
    }

    if (!l.is(prev, next)) tar[key] = next
  }
}

/*
Tool for classes that define a default singleton.
By default, instantiates the class with no arguments.
Subclasses may override `static default()` to customize.
*/
export function MixMain(cls) {
  return class MixMainCls extends cls {
    static get main() {
      const key = Symbol.for(`main`)
      return l.hasOwn(this, key) ? this[key] : this[key] = this.default()
    }

    static default() {return new this()}
  }
}

export class Strict extends l.Emp {
  constructor() {
    super()
    return new Proxy(this, this.Ph)
  }

  get Ph() {return StrictStaticPh}
}

/*
Static proxy handler that hides and/or forbids everything by default.
To allow a specific operation, override the corresponding method.
*/
export class BlankStaticPh extends l.Emp {
  static apply() {throw l.errImpl()}
  static construct() {throw l.errImpl()}
  static defineProperty() {return false}
  static deleteProperty() {return false}
  static get() {}
  static getOwnPropertyDescriptor() {}
  static getPrototypeOf() {return null}
  static has() {return false}
  static isExtensible() {return false}
  static ownKeys() {return []}
  static preventExtensions() {return false}
  static set() {return false}
  static setPrototypeOf() {return false}
}

/*
Short for "strict static proxy handler". This handler traps "get" operations,
causing exceptions when accessing properties/methods not present in the target
object. This behavior is similar to Python classes.

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
export class StrictStaticPh extends l.Emp {
  static get(tar, key, pro) {
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

// Note: proxy target should be `l.npo()`.
export class MakerPh extends l.Emp {
  get(tar, key) {return key in tar ? tar[key] : (tar[key] = this.make(key, tar))}
  make() {}
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

// Must match `dom_shim.mjs`.
export const parentNodeKey = Symbol.for(`parentNode`)

export function MixChild(val) {return MixChildCache.main.goc(val)}

export class MixChildCache extends WeakCache {
  make(cls) {
    return class MixChildCls extends cls {
      // Would prefer the name ".parent", but it seems preferable to match
      // the DOM API. We're using the exact same concept, after all.
      get parentNode() {return this[parentNodeKey]}
      set parentNode(val) {this[parentNodeKey] = val}

      getParent() {return this.parentNode}
      setParent(val) {return this.parentNode = val, this}
    }
  }
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
