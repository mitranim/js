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
    if (canSet(tar, key)) tar[key] = src[key]
  }
  return tar
}

export function isMut(val) {return l.isObj(val) && `mut` in val && l.isFun(val.mut)}
export function reqMut(val) {return isMut(val) ? val : l.throwErrFun(val, isMut)}

export class Struct extends l.Emp {
  constructor(src) {
    super()
    this.constructor.getType().init(this, src)
  }

  mut(src) {
    this.constructor.getType().reinit(this, src)
    return this
  }

  static get Spec() {return StructSpec}

  static getSpec() {
    own(this, `spec`)
    return this.spec ??= new this.Spec(this)
  }

  static get Type() {return StructType}

  static getType() {
    own(this, `type`)
    return this.type ??= new this.Type(this)
  }
}

export class StructLax extends Struct {
  static get Type() {return StructTypeLax}
}

export const clsKey = Symbol.for(`cls`)

export class StructSpec extends l.Emp {
  // Allows a spec to access its class. Note that we ignore symbolic properties
  // and getters of a spec when initializing `StructType` from `StructSpec`.
  constructor(val) {super()[clsKey] = l.reqCls(val)}

  static validate() {}
  static any(val) {return val}
  static getCls(tar) {return l.reqInst(tar, this)[clsKey]}
}

// Internal tool for type checking in structs.
export class StructType extends l.Emp {
  constructor(cls) {
    super()
    this[clsKey] = l.reqCls(cls)
    this.list = []
    this.dict = l.npo()
    this.spec = l.reqInst(cls.getSpec(), StructSpec)
    this.initFromSpec()
  }

  get Spec() {return this.spec.constructor}

  getCls() {return this[clsKey]}

  // Called after `.init`/`.reinit`.
  // Subclasses may override this.
  // TODO test.
  validate(tar) {this.Spec.validate(tar)}

  // Used by `Struct..constructor`. Subclasses may override this.
  init(tar, src) {
    this.reset(tar, src)
    this.validate(tar)
  }

  // Used by `Struct..mut`. Subclasses may override this.
  reinit(tar, src) {if (l.isSome(src)) this.init(tar, src)}

  mut(tar, src) {
    this.reset(tar, src)
    this.patch(tar, src)
  }

  mutOpt(tar, src) {if (l.isSome(src)) this.mut(tar, src)}
  reset(tar, src) {for (const field of this.list) field.reset(tar, src)}
  resetOpt(tar, src) {if (l.isSome(src)) this.reset(tar, src)}
  patch(tar, src) {for (const key of l.structKeys(src)) this.set(tar, key, src[key])}

  // Must mimic the semantics of `obj.mjs`.`patch` (not `assign`), with
  // additional support for calling `.mut` on properties that implement
  // `isMut`, and using the spec's validate/transform method.
  set(tar, key, val) {
    if (this.isDeclared(key)) return false
    touch(tar, key)
    if (mutated(tar, key, val)) return true
    if (!canSet(tar, key)) return false
    tar[key] = this.Spec.any(val, key)
    return true
  }

  isDeclared(key) {return l.reqStr(key) in this.dict}

  initFromSpec() {
    const {dict, list, spec} = this
    const proto = this.getCls().prototype
    const visited = new Set()
    let src = spec

    do {
      for (const [key, desc] of descriptors(src)) {
        if (key === `constructor` || visited.has(key)) continue

        visited.add(key)

        if (hasOnlyGetter(proto, key)) continue

        if (l.isFun(desc.value)) {
          list.push(dict[key] = new this.Field(this, key))
        }
      }
    }
    while ((src = Object.getPrototypeOf(src)))
  }

  get Field() {return StructField}
}

export class StructTypeLax extends StructType {
  init(tar, src) {
    this.mut(tar, src)
    this.validate(tar)
  }
}

// Field definition used by `StructType`.
export class StructField extends l.Emp {
  constructor(typ, key) {
    l.reqInst(typ, StructType)
    l.reqStr(key)

    super()

    priv(this, `typ`, typ)
    this.key = key

    if (!l.isFun(typ.spec[key])) {
      throw TypeError(`invalid property ${l.show(key)}: missing validator function in spec`)
    }
  }

  val(val) {
    const key = l.reqStr(this.key)
    try {return this.typ.spec[key](val)}
    catch (err) {throw l.errTrans(err, TypeError, `invalid property ${l.show(key)}`)}
  }

  reset(tar, src) {this.set(tar, src?.[this.key])}

  // Must mimic the semantics of `obj.mjs`.`assign` (not `patch`), with
  // additional support for calling `.mut` on properties that implement
  // `isMut`, and using the spec's validate/transform method.
  set(tar, val) {
    const key = l.reqStr(this.key)
    if (l.isSome(val) && mutated(tar, key, val)) return
    tar[key] = this.val(val)
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

// Should match `dom_shim.mjs`.
export const parentNodeKey = Symbol.for(`parentNode`)

/*
Short for "mixin: child". Support for establishing child-to-parent relations.

Implementation note. This uses the `get parentNode` and `set parentNode`
properties for consistency and compatibility with native DOM classes and our
own DOM shim. In addition to properties, we provide methods, because:

  * Methods are easier to override. Subclasses typically override only
    `.setParent` to add a type assertion. To correctly override
    `set parentNode`, a subclass must also explicitly define `get parentNode`,
    which takes more code and more error-prone.

  * Methods may return `this`, which is convenient for chaining.
*/
export function MixChild(val) {return MixChildCache.goc(val)}

export class MixChildCache extends DedupMixinCache {
  static make(cls) {
    const desc = descIn(cls.prototype, `parentNode`)

    if (!desc || !desc.get) {
      return class MixChildClsBase extends cls {
        get parentNode() {return this[parentNodeKey]}
        set parentNode(val) {this[parentNodeKey] = val}

        getParent() {return this.parentNode}
        setParent(val) {return this.parentNode = val, this}
      }
    }

    if (desc.set) {
      return class MixChildClsOnlyMethods extends cls {
        getParent() {return this.parentNode}
        setParent(val) {return this.parentNode = val, this}
      }
    }

    /**
    Native DOM classes operate in this mode. They define `.parentNode` getter
    without setter. DOM tree operations set this property magically, bypassing
    JS operations. We must prioritize the native getter over our property to
    ensure that when the element is attached to the DOM, the native parent
    takes priority over the grafted one.
    */
    return class MixChildClsCompat extends cls {
      get parentNode() {return super.parentNode ?? this[parentNodeKey]}
      set parentNode(val) {this[parentNodeKey] = val}

      getParent() {return this.parentNode}
      setParent(val) {return this.parentNode = val, this}
    }
  }
}

/*
Short for "mixin: child with constructor". Variant of `MixChild` that
automatically calls `.setParent` in the constructor if at least one argument
was provided. Convenient for code that heavily relies on child-to-parent
relations, which are particularly important when working with custom DOM
elements and using our `prax.mjs` and/or `dom_shim.mjs`.

Important note. Normally, DOM nodes establish child-to-parent relations when
children are attached to parents. With this mixin, the child-to-parent
relationship is established before the child is attached to the parent.
This allows children to immediately traverse the ancestor chain to
access "contextual" data available on ancestors. Note that this establishes
only child-to-parent relations, not parent-to-child. The latter become
available only after attaching the newly initialized children to the parent,
which is out of scope for this mixin.
*/
export function MixChildCon(val) {return MixChildConCache.goc(val)}

export class MixChildConCache extends MixChildCache {
  static make(cls) {
    return class MixChildConCls extends super.make(cls) {
      constructor(...val) {
        super()
        if (val.length) this.setParent(...val)
      }
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

function hasOnlyGetter(tar, key) {
  const desc = descIn(tar, key)
  return !!desc?.get && !desc?.set
}

function goc(maker, cache, key) {
  if (cache.has(key)) return cache.get(key)
  const val = maker.make(key)
  cache.set(key, val)
  return val
}

function own(tar, key, val) {
  if (!l.hasOwn(tar, key)) pub(tar, key, val)
  return val
}

/*
May execute a getter with side effects. Our `memGet` tool defines getters
that "replace" themselves by defining an own enumerable property under the
same key on the receiving instance.
*/
function touch(tar, key) {
  if (!l.hasOwnEnum(tar, key) && key in tar) l.nop(tar[key])
}

function mutated(tar, key, val) {
  if (!l.hasOwnEnum(tar, key)) return false
  const prev = tar[key]
  return isMut(prev) && (prev.mut(val), true)
}

function canSet(val, key) {return l.hasOwnEnum(val, key) || !(key in val)}
