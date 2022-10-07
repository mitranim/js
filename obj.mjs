import * as l from './lang.mjs'

export function isObjKey(val) {return l.isStr(val) || l.isSym(val)}
export function reqObjKey(val) {return isObjKey(val) ? val : l.throwErrFun(val, isObjKey)}

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
export function reqMut(val) {return isMut(val) ? val : l.throwErrFun(val, isMut)}

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
    // TODO convert from getter to method.
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

// Note: proxy target should be `l.npo()`.
export class MakerPh extends l.Emp {
  get(tar, key) {return key in tar ? tar[key] : (tar[key] = this.make(key, tar))}
  make(val) {return val}
}

/*
Short for "dynamic". Represents a dynamically scoped variable, as opposed to
regular lexically scoped variables.
*/
export class Dyn extends l.Emp {
  constructor(val) {super().set(val)}
  get() {return this.$}
  set(val) {this.$ = val}
  has() {return l.isSome(this.get())}
  swap(val) {try {return this.get()} finally {this.set(val)}}
}

export class TypedDyn extends Dyn {
  reqVal() {throw l.errImpl()}
  set(val) {return super.set(this.reqVal(val))}
}

export class WeakTag extends WeakSet {
  goc(val) {
    if (!this.has(val)) {
      this.add(val)
      this.tag(val)
    }
    return val
  }

  // TODO better name.
  // Some subclasses may want a more general term.
  tag() {}
}

export function memGet(cls) {return MemTag.goc(cls)}

export class MemTag extends MixMain(WeakTag) {
  tag(cls) {memPatch(cls)}
  static goc(key) {return this.main.goc(key)}
}

export class Cache extends MixMain(Map) {
  goc(key) {return goc(this, this, key)}
  make(val) {return val}
  static goc(val) {return this.main.goc(val)}
}

export class WeakCache extends MixMain(WeakMap) {
  goc(key) {return goc(this, this, key)}
  make(val) {return val}
  static goc(val) {return this.main.goc(val)}
}

export class StaticCache extends l.Emp {
  static get Map() {return Map}
  static ownCache() {return this.optCache() || (this.cache = new this.Map())}
  static optCache() {return l.getOwn(this, `cache`)}
  static goc(key) {return goc(this, this.ownCache(), key)}
  static make() {throw l.errImpl()}
}

export class StaticWeakCache extends StaticCache {
  static get Map() {return WeakMap}
}

export class MixinCache extends StaticWeakCache {
  static goc(cls) {return l.reqCls(super.goc(l.reqCls(cls)))}
}

// TODO tests.
export class DedupMixinCache extends MixinCache {
  static get Set() {return Set}
  static ownTags() {return this.optTags() || (this.tags = new this.Set())}
  static optTags() {return l.getOwn(this, `tags`)}
  static tag(cls) {return this.ownTags().add(l.reqCls(cls)), cls}
  static goc(cls) {return this.isTagged(cls) ? cls : this.tag(super.goc(cls))}

  static isTagged(val) {
    const tags = this.optTags()
    if (!tags) return false

    while (l.isComp(val)) {
      if (tags.has(val)) return true
      val = Object.getPrototypeOf(val)
    }
    return false
  }
}

// Must match `dom_shim.mjs`.
export const parentNodeKey = Symbol.for(`parentNode`)

export function MixChild(val) {return MixChildCache.goc(val)}

export class MixChildCache extends DedupMixinCache {
  static make(cls) {
    return class MixChildCls extends cls {
      /*
      Would prefer the name ".parent", but matching the DOM API seems more
      important.

      We support `super.parentNode` for compatibility with native DOM classes,
      prioritizing a native getter (if available) over custom storage. We must
      support it here instead of leaving it to subclasses, because subclasses
      have no way to access `super.parentNode` relative to this class, only
      relative to subclass.

      When used with DOM element classes, the `.parentNode` getter and setter
      affect only JS code, without affecting native operations. Native DOM
      implementations completely bypass both.
      */
      get parentNode() {return super.parentNode || this[parentNodeKey]}
      set parentNode(val) {this[parentNodeKey] = val}

      getParent() {return this.parentNode}
      setParent(val) {return this.parentNode = val, this}
    }
  }
}

/*
Monkeypatching tool. Mutates the target class and its prototype, adding
descriptors from the source classes and their prototypes.

EXTREMELY dirty. AVOID at many costs. Prototype patching makes it much harder to
track down method definitions and has broken semantics. For example, it breaks
access to "super" methods. Additionally, the current implementation skips
pre-existing descriptors, which may lead to quiet conflicts and bugs.

Prefer `DedupMixinCache` whenever possible.
*/
export function mixMut(tar, ...src) {
  l.reqCls(tar)
  for (src of src) {
    l.reqCls(src)
    mixMutDescriptors(tar, src)
    mixMutDescriptors(tar.prototype, src.prototype)
  }
  return tar
}

// TODO better name.
export function mixMutDescriptors(tar, src) {
  l.reqComp(tar)
  l.reqComp(src)

  while (src) {
    for (const [key, val] of descriptors(src)) {
      if (!(key in tar)) Object.defineProperty(tar, key, val)
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

function goc(maker, cache, key) {
  if (cache.has(key)) return cache.get(key)
  const val = maker.make(key)
  cache.set(key, val)
  return val
}
