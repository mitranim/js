import * as l from './lang.mjs'

export function isObjKey(val) {return l.isStr(val) || l.isSym(val)}
export function reqObjKey(val) {return isObjKey(val) ? val : l.throwErrFun(val, isObjKey)}

export function isMut(val) {return l.isObj(val) && l.isFun(val.mut)}
export function reqMut(val) {return isMut(val) ? val : l.throwErrFun(val, isMut)}

export function assign(tar, src) {
  l.reqRec(tar)
  for (const key of l.recKeys(src)) tar[key] = src[key]
  return tar
}

export function patch(tar, src) {
  l.reqRec(tar)
  for (const key of l.recKeys(src)) {
    if (canSet(tar, key)) tar[key] = src[key]
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

/*
Short for "dynamic variable". Represents a dynamically scoped variable,
in contrast to regular lexically scoped variables.

Somewhat comparable to the Async Context proposal, but synchronous only.
Reference:

  https://tc39.es/proposal-async-context/
*/
export class DynVar extends l.Emp {
  constructor(val) {super().set(val)}
  set(val) {return !l.is(this[l.VAL], (this[l.VAL] = val))}
  get() {return this[l.VAL]}

  swap(next) {
    const prev = this.get()
    this.set(next)
    return prev
  }

  with(val, fun, ...src) {
    const prev = this.swap(val)
    try {return fun(...src)}
    finally {this.swap(prev)}
  }
}

export class TypedDynVar extends DynVar {
  reqVal() {throw l.errImpl()}
  set(val) {return super.set(this.reqVal(val))}
}

export class Cache extends l.Emp {
  static get Map() {return Map}

  static make() {}

  static get(key) {
    const map = this.getMap()
    if (map.has(key)) return map.get(key)
    const val = this.make(key)
    map.set(key, val)
    return val
  }

  static getMap() {
    return l.hasOwn(this, `map`) ? this.map : this.map = new this.Map()
  }
}

export class WeakCache extends Cache {static get Map() {return WeakMap}}

export class Mixin extends WeakCache {
  static get Set() {return WeakSet}

  static get(src) {
    const map = this.getMap()
    if (map.has(src)) return map.get(src)

    const set = this.getSet()
    let mid = src
    while (l.isComp(mid)) {
      if (set.has(mid)) return src
      mid = Object.getPrototypeOf(mid)
    }

    const out = this.make(src)
    set.add(out)
    map.set(src, out)
    return out
  }

  static getSet() {
    return l.hasOwn(this, `set`) ? this.set : this.set = new this.Set()
  }
}

export function memGet(cls) {return MemGet.get(cls)}

export class MemGet extends WeakCache {
  static make(cls) {return memPatch(cls), cls}
}

export const MAIN = Symbol.for(`main`)

/*
Tool for classes that define a default singleton.
By default, instantiates the class with no arguments.
Subclasses may override `static default()` to customize.
*/
export function MixMain(cls) {return MixinMain.get(cls)}

export class MixinMain extends Mixin {
  static make(cls) {
    return class Main extends cls {
      static get main() {
        return l.hasOwn(this, MAIN) ? this[MAIN] : this[MAIN] = this.default()
      }
      static default() {return new this()}
    }
  }
}

export const SPEC = Symbol.for(`spec`)

export function isStruct(val) {
  if (!l.isRec(val)) return false
  const con = val.constructor
  return l.isFun(con) && l.isFun(con.Spec)
}

export function structSpec(src) {
  if (l.isNil(src)) return undefined
  if (!l.isFun(src)) src = l.reqFun(src.constructor)
  if (l.hasOwn(src, SPEC)) return src[SPEC]
  return pub(src, SPEC, new src.Spec(src))
}

export function structConstruct(tar, src) {
  return structSpec(tar).construct(tar, src)
}

export function structMut(tar, src) {
  return structSpec(tar).mut(tar, src)
}

export function MixStruct(val) {return MixinStruct.get(val)}

export class MixinStruct extends Mixin {
  static make(cls) {
    return class Struct extends cls {
      static get Spec() {return StructSpec}
      constructor(...src) {structSpec(new.target).construct(super(...src), src[0])}
    }
  }
}

export function MixStructLax(val) {return MixinStructLax.get(val)}

export class MixinStructLax extends Mixin {
  static make(cls) {
    return class StructLax extends cls {
      static get Spec() {return StructSpecLax}
      constructor(...src) {structSpec(new.target).construct(super(...src), src[0])}
    }
  }
}

export function MixStructMut(val) {return MixinStructMut.get(val)}

export class MixinStructMut extends Mixin {
  static make(cls) {
    return class StructMut extends cls {
      mut(src) {return structMut(this, src)}
    }
  }
}

export class StructSpec extends l.Emp {
  get FieldSpec() {return FieldSpec}

  constructor(cls) {
    super()
    this.cls = l.reqCls(cls)
    this.list = []
    this.dict = l.Emp()
    this.initFieldSpecs()
  }

  initFieldSpecs() {
    const spec = l.optRec(this.cls.spec)
    if (!spec) return
    for (const [key, desc] of descriptors(spec)) this.initField(key, desc)
  }

  initField(key, desc) {
    const {cls, list, dict} = this
    const val = desc.value
    if (l.isNil(val)) return

    if (!l.isFun(val)) {
      throw TypeError(`invalid definition of ${l.show(key)} in ${l.show(cls)}: expected nil or function, got ${l.show(val)}`)
    }
    if (key in cls.prototype) {
      throw TypeError(`property collision on ${l.show(key)} in ${l.show(cls)}`)
    }
    list.push(dict[key] = new this.FieldSpec(key, val))
  }

  construct(tar, src) {
    l.reqRec(tar)
    this.init(tar, src)
    this.validate(tar)
    return tar
  }

  mut(tar, src) {
    l.reqRec(tar)
    if (l.isNil(src)) return tar
    this.reinit(tar, src)
    this.validate(tar)
    return tar
  }

  init(tar, src) {
    l.optRec(src)
    for (const field of this.list) field.setFrom(tar, src)
  }

  reinit(tar, src) {
    l.reqRec(src)
    for (const field of this.list) {
      const {key} = field
      if (l.hasOwn(src, key)) field.setFrom(tar, src)
    }
  }

  validate(tar) {this.cls.validate?.(tar)}
}

export class StructSpecLax extends StructSpec {
  constructor(cls) {
    super(cls)
    this.hasAny = l.hasMeth(cls, `any`)
  }

  init(tar, src) {
    super.init(tar, src)
    for (const key of l.recKeys(src)) {
      const field = this.dict[key]
      if (!field) this.setAny(tar, key, src[key])
    }
  }

  reinit(tar, src) {
    for (const key of l.recKeys(src)) {
      const field = this.dict[key]
      if (field) field.setFrom(tar, src)
      else this.setAny(tar, key, src[key])
    }
  }

  /*
  Must mimic the semantics of `obj.mjs`.`patch` (not `assign`), with
  additional support for calling `.mut` on properties that implement
  `isMut`, and using the spec's validate/transform method.
  */
  setAny(tar, key, val) {
    const hadIn = key in tar
    const src = tar[key]
    if (hadIn && !l.hasOwn(tar, key)) return
    if (mutated(src, val)) return
    tar[key] = this.any(val, key)
  }

  any(val, key) {return this.hasAny ? this.cls.any(val, key) : val}
}

export class FieldSpec extends l.Emp {
  constructor(key, fun) {
    super()
    this.key = l.reqStr(key)
    this.fun = l.reqFun(fun)
  }

  val(val, tar) {
    try {return this.fun.call(tar, val)}
    catch (err) {throw l.errTrans(err, TypeError, `invalid property ${l.show(this.key)}`)}
  }

  setFrom(tar, src) {return this.setVal(tar, src?.[this.key])}

  /*
  Must mimic the semantics of `obj.mjs`.`assign` (not `patch`), with
  additional support for calling `.mut` on properties that implement
  `isMut`, and using the spec's validate/transform method.
  */
  setVal(tar, val) {
    const {key} = this
    const src = tar[key]
    if (mutated(src, val)) return
    tar[key] = this.val(val, tar)
  }
}

/* Internal */

export function descIn(tar, key) {
  while (tar) {
    const val = Object.getOwnPropertyDescriptor(tar, key)
    if (val) return val
    tar = Object.getPrototypeOf(tar)
  }
  return undefined
}

function descriptors(val) {
  return Object.entries(Object.getOwnPropertyDescriptors(val))
}

function memPatch(cls) {
  const tar = l.reqCls(cls).prototype

  for (const [key, desc] of descriptors(tar)) {
    const {get} = desc
    if (!get || desc.set || !desc.configurable) continue

    desc.get = function memGet() {return pub(this, key, get.call(this))}
    desc.set = function memSet(val) {pub(this, key, val)}

    Object.defineProperty(tar, key, desc)
  }

  return cls
}

function mutated(tar, src) {
  return (
    (isMut(tar) && (tar.mut(src), true)) ||
    (isStruct(tar) && (structMut(tar, src), true))
  )
}

function canSet(val, key) {return l.hasOwnEnum(val, key) || !(key in val)}
