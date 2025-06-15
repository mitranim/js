import * as l from './lang.mjs'
import * as o from './obj.mjs'
import * as d from './dom.mjs'
import * as ob from './obs.mjs'

export const PROP_REC = Symbol.for(`propRec`)
export const PROP_KEYS = Symbol.for(`propKeys`)

export const NS_HTML = `http://www.w3.org/1999/xhtml`
export const NS_SVG = `http://www.w3.org/2000/svg`
export const NS_MATH_ML = `http://www.w3.org/1998/Math/MathML`

/*
The specification postulates the concept, but where's the standard list?
Taken from non-authoritative sources.

  https://www.w3.org/TR/html52/infrastructure.html#boolean-attribute
*/
export const BOOL = new Set([`allowfullscreen`, `allowpaymentrequest`, `async`, `autofocus`, `autoplay`, `checked`, `controls`, `default`, `disabled`, `formnovalidate`, `hidden`, `ismap`, `itemscope`, `loop`, `multiple`, `muted`, `nomodule`, `novalidate`, `open`, `playsinline`, `readonly`, `required`, `reversed`, `selected`, `truespeed`])

/*
References:

  https://www.w3.org/TR/html52/
  https://www.w3.org/TR/html52/syntax.html#writing-html-documents-elements
*/
export const VOID = new Set([`area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`])

/*
Short for "renderer". Creates or mutates DOM elements. Compatible with native
DOM API and `dom_shim.mjs`.
*/
export class Ren extends o.MixMain(l.Emp) {
  constructor({env = globalThis, shed = ob.getUiShed()} = {}) {
    super()
    this.lax = false
    this.env = reqDomEnv(env)
    this.shed = ob.optQue(shed)
    this.E = this.E.bind(this)
    this.S = this.S.bind(this)
  }

  get doc() {return this.env.document}
  get Node() {return this.env.Node}
  get Comment() {return this.env.Comment}
  get Text() {return this.env.Text}
  get Frag() {return this.env.DocumentFragment}
  get RecPropFun() {return RecPropFun}
  get RecPropRef() {return RecPropRef}
  get RecNodeFun() {return o.pub(this, `RecNodeFun`, MixRecNodeFun(this.Text))}
  get RecNodeRef() {return o.pub(this, `RecNodeRef`, MixRecNodeRef(this.Text))}

  // All-purpose rendering function for HTML elements.
  E(tar, props, ...chi) {
    if (!l.isObj(tar)) return this.elemHtml(tar, props, ...chi)
    return this.mut(tar, props, ...chi)
  }

  // All-purpose rendering function for SVG elements.
  S(tar, props, ...chi) {
    if (!l.isObj(tar)) return this.elemSvg(tar, props, ...chi)
    return this.mut(tar, props, ...chi)
  }

  elemHtml(tag, props, ...chi) {
    if (l.isObj(tag)) return this.mut(tag, props, ...chi)
    if (!l.isStr(tag)) throw l.errConv(tag, `HTML element`)
    if (tag === `svg`) return this.elemHtmlSvg(tag, props, ...chi)
    if (!this.lax && this.isVoid(tag)) return this.elemVoid(tag, props, ...chi)
    return this.elem(tag, props, ...chi)
  }

  elemSvg(tag, props, ...chi) {
    if (l.isObj(tag)) return this.mut(tag, props, ...chi)
    if (l.isStr(tag)) return this.mut(this.makeElemSvg(tag, props), props, ...chi)
    throw l.errConv(tag, `SVG element`)
  }

  elem(tag, props, ...chi) {
    if (l.isObj(tag)) return this.mut(tag, props, ...chi)
    if (l.isStr(tag)) return this.mut(this.makeElem(tag, props), props, ...chi)
    throw l.errConv(tag, `element`)
  }

  makeElemHtml(tag, props) {
    if (tag === `svg`) return this.makeElemSvg(tag, props)
    return this.makeElemNs(NS_HTML, tag, l.deref(props))
  }

  makeElemSvg(tag, props) {
    return this.makeElemNs(NS_SVG, tag, l.deref(props))
  }

  makeElemNs(ns, tag, props) {
    return this.doc.createElementNS(l.reqStr(ns), l.reqStr(tag), l.deref(props))
  }

  makeElem(tag, props) {
    return this.doc.createElement(l.reqStr(tag), l.deref(props))
  }

  mut(tar, props, ...chi) {
    d.reqNode(tar)
    if (l.isSome(props)) this.replaceProps(tar, props)
    if (chi.length) this.replaceChi(tar, chi)
    return tar
  }

  replaceProps(tar, src) {
    if (l.isFun(src)) return this.replacePropsFun(tar, src)
    if (ob.isObsRef(src)) return this.replacePropsRef(tar, src)
    return this.replacePropsDict(tar, l.deref(src))
  }

  replacePropsFun(tar, src) {
    const {shed} = this
    if (!shed) return this.replaceProps(tar, src.call(tar, tar))
    return this.RecPropFun.init(this, tar, src), tar
  }

  replacePropsRef(tar, src) {
    const {shed} = this
    if (!shed) return this.replaceProps(tar, l.derefAll(src))
    return this.RecPropRef.init(this, tar, src), tar
  }

  replacePropsDict(tar, src) {
    d.reqElement(tar)
    if (l.isNil(src)) return tar

    const prev = tar[PROP_KEYS]
    const dict = l.reqRec(src)
    const list = l.recKeys(src)

    for (const key of list) this.mutProp(tar, key, src[key])

    tar[PROP_KEYS] = list
    if (!prev) return tar

    for (const key of prev) if (!l.hasOwn(dict, key)) this.mutProp(tar, key)
    return tar
  }

  mutProp(tar, key, val) {
    if (key === `innerHTML`) return this.mutInnerHtml(tar, val)
    if (key === `attributes`) return this.mutAttrs(tar, val)
    if (key === `class`) return this.mutCls(tar, val, key)
    if (key === `className`) return this.mutCls(tar, val, key)
    if (key === `style`) return this.mutStyle(tar, val)
    if (key === `dataset`) return this.mutDataset(tar, val)
    return this.mutPropAny(tar, key, val)
  }

  mutInnerHtml(tar, val) {
    d.reqElement(tar).innerHTML = l.laxStr(this.renderOpt(val))
    return tar
  }

  mutAttrs(tar, val) {return this.loop(tar, val, this.mutAttr)}

  mutAttr(tar, key, val) {
    if (this.isBool(key)) return this.mutAttrBool(tar, key, val)
    return this.mutAttrAny(tar, key, val)
  }

  mutAttrBool(tar, key, val) {
    l.reqStr(key)
    if (optAt(key, val, l.isBool)) return tar.setAttribute(key, ``)
    return tar.removeAttribute(key)
  }

  mutAttrAny(tar, key, val) {
    l.reqStr(key)
    val = this.renderOpt(val, key)
    if (l.isNil(val)) return tar.removeAttribute(key)
    return tar.setAttribute(key, val)
  }

  mutCls(tar, val, key) {
    val = l.laxStr(this.renderOpt(val, key || `class`))
    if (val !== l.laxStr(tar.getAttribute(`class`))) {
      tar.setAttribute(`class`, val)
    }
  }

  mutStyle(tar, val) {
    if (l.isNil(val) || l.isStr(val)) return this.mutAttrAny(tar, `style`, val)
    if (l.isRec(val)) return this.mutStyleRec(tar, val)
    throw l.errConv(val, `style`)
  }

  mutStyleRec(tar, val) {
    this.loop(tar.style, val, this.mutStyleProp)
    return tar
  }

  mutStyleProp(tar, key, val) {
    val = l.laxStr(optAt(key, val, l.isStr))
    if (key.startsWith(`--`)) {
      if (l.isNil(val)) tar.removeProperty(key)
      else tar.setProperty(key, val)
    }
    else {
      tar[key] = l.laxStr(optAt(key, val, l.isStr))
    }
  }

  mutDataset(tar, val) {
    this.loop(tar.dataset, val, this.mutDatasetProp)
    return tar
  }

  mutDatasetProp(tar, key, val) {
    val = this.renderOpt(val, key)
    if (l.isNil(val)) delete tar[key]
    else tar[key] = val
  }

  mutPropAny(tar, key, val) {
    if (!(key in tar)) return this.mutAttr(tar, key, val)

    const src = tar[key]
    if (l.isNil(src)) return setOpt(tar, key, src, norm(val))
    if (l.isStr(src)) return setOpt(tar, key, src, l.laxStr(this.renderOpt(val, key)))

    if (l.isPrim(src)) {
      if (l.isPrim(val)) {
        if (this.isBool(key)) optAt(key, val, l.isBool)
        return setOpt(tar, key, src, norm(val))
      }

      throw errMismatch(tar, key, val, src)
    }

    if (l.isFun(src)) {
      if (l.isNil(val) || l.isFun(val)) return setOpt(tar, key, src, norm(val))
      throw errMismatch(tar, key, val, src)
    }

    return this.mutAttr(tar, key, val)
  }

  mutText(tar, src) {
    d.reqNode(tar).textContent = l.laxStr(this.renderOpt(src))
    return tar
  }

  replaceChi(tar, chi) {
    d.reqNode(tar)
    l.reqArr(chi)

    if (isVac(chi)) {
      this.clear(tar)
      return tar
    }

    const list = this.chi(tar, chi)
    this.clear(tar)
    tar.append(...list)
    return tar
  }

  clear(tar) {
    d.reqNode(tar).textContent = ``
    return tar
  }

  chi(tar, chi) {
    const buf = []
    this.appendChi(buf, tar, chi)
    return buf
  }

  appendChi(buf, tar, src) {
    if (l.isFun(src)) return void this.appendFun(buf, tar, src)
    if (ob.isObsRef(src)) return void this.appendRef(buf, tar, src)
    if (isNodable(src)) src = src.toNode()
    if (d.isNode(src)) return void buf.push(src)
    if (l.isList(src)) return void this.appendList(buf, tar, src)

    src = this.renderOpt(src)
    if (!src) return undefined

    const ind = buf.length - 1
    if (l.isStr(buf[ind])) return void (buf[ind] += src)
    return void buf.push(src)
  }

  appendFun(buf, tar, src) {
    const {shed} = this
    if (!shed) return this.appendChi(buf, tar, src.call(tar, tar))
    return this.appendRecNode(buf, tar, src, this.RecNodeFun)
  }

  appendRef(buf, tar, src) {
    const {shed} = this
    if (!shed) return this.appendChi(buf, tar, l.derefAll(src))
    return this.appendRecNode(buf, tar, src, this.RecNodeRef)
  }

  appendRecNode(buf, tar, src, cls) {
    const out = new cls(this, tar, src)
    const chi = out.init()
    buf.push(out)
    if (chi) buf.push(...chi)
  }

  appendList(buf, tar, src) {for (src of src) this.appendChi(buf, tar, src)}

  loop(tar, src, fun) {
    if (l.isNil(src)) return tar
    for (const key of l.recKeys(src)) {
      fun.call(this, tar, key, src[key])
    }
    return tar
  }

  isHtml(tar) {return tar.namespaceURI === NS_HTML}
  isSvg(tar) {return tar.namespaceURI === NS_SVG}

  // Similar to `l.render` and `l.renderOpt` with slightly different rules.
  renderOpt(val, key) {
    if (l.isNil(val)) return null

    const out = l.renderOpt(val)
    if (l.isSome(out)) return out
    if (this.lax) return null

    if (key) {
      throw TypeError(`unable to convert property ${l.show(l.reqStr(key))} ${l.show(val)} to string`)
    }
    throw l.errConv(val, `string`)
  }

  isBool(key) {return BOOL.has(key)}
  isVoid(tag) {return VOID.has(tag)}

  elemHtmlSvg(tag, props, ...chi) {
    if (this.lax) return this.alignNs(this.elemSvg(tag, props, ...chi))
    throw SyntaxError(`namespace mismatch for element ${l.show(tag)}: expected ${l.show(NS_SVG)}, found ${l.show(NS_HTML)})`)
  }

  /*
  Inefficient adapter for incorrectly-written code that renders SVG elements in
  the HTML namespace. Sometimes useful for migrating code from other rendering
  systems. Can be avoided by creating elements with the correct namespace from
  the start.
  */
  alignNs(tar) {
    if (!isNamespaced(tar)) return tar

    const chi = tar.firstChild
    if (!isNamespaced(chi)) return tar

    const ns = tar.namespaceURI
    if (!ns) return tar

    // eslint-disable-next-line no-self-assign
    if (ns !== chi.namespaceURI) tar.innerHTML = tar.innerHTML
    return tar
  }

  elemVoid(tag, props, ...chi) {
    if (!chi.length) return this.elem(tag, props)
    throw SyntaxError(`expected void element ${l.show(tag)} to have no children, got ${l.show(chi)}`)
  }
}

export function MixInitRun(cls) {return MixinInitRun.get(cls)}

export class MixinInitRun extends o.Mixin {
  static make(cls) {
    return class InitRun extends cls {
      static init(ctx, tar, key) {
        const prev = tar[PROP_REC]

        if (prev) {
          if (prev.sameKey?.(key)) return prev
          prev.deinit()
        }

        const next = tar[PROP_REC] = new this(ctx, tar, key)
        next.run()
        return next
      }
    }
  }
}

export class RecPropFun extends MixInitRun(ob.FunRecur) {
  constructor(ren, tar, fun) {super(tar, fun).setShed(ren.shed).ren = ren}
  onRun() {this.ren.replaceProps(this.tar, super.onRun())}
  sameKey(key) {return key === this.fun}
}

export class RecPropRef extends MixInitRun(ob.RunRef) {
  constructor(ren, tar, ref) {
    super(tar, l.nop)
    this.ref = ref
    this.ren = ren
    this.shedRef = new ob.RunRef(this, this.schedule)
  }

  run() {
    const tar = this.deref()
    if (!tar) return

    const {ren, ref, shedRef} = this
    ren.replaceProps(tar, l.derefAll(ref))

    ob.getQue(ref).enque(shedRef.init())
  }

  eq(key) {return key === this.ref}
  depth() {return ob.nodeDepth(this.deref())}
  schedule() {this.ren.shed.enque(this.init())}
}

export function MixRecNode(cls) {return MixinRecNode.get(cls)}

export class MixinRecNode extends o.Mixin {
  static make(Text) {
    return class RecNode extends Text {
      ren = undefined
      tar = undefined
      edge = undefined
      prev = undefined
      next = undefined

      constructor(ren, tar) {
        super()
        this.ren = ren
        this.tar = d.reqNode(tar)
      }

      deref() {}

      init() {
        const chi = this.chi()
        if (!chi) return chi
        const frag = new this.ren.Frag()
        frag.append(...chi)
        return this.prev = new Set(frag.childNodes)
      }

      chi() {
        const chi = this.ren.chi(this.tar, this.deref())
        if (chi.length <= 1 && l.isPrim(chi[0])) {
          this.ren.mutText(this, chi[0])
          return undefined
        }
        this.textContent = ``
        return chi
      }

      run() {
        const chi = this.chi()
        if (!chi) {
          this.clearChi()
          return
        }

        const prev = this.prev ??= new Set()
        const next = this.next ??= new Set()
        next.clear()

        const edge = this.edge ??= new this.ren.Comment()
        chi.push(edge)
        this.after(...chi)

        let val = this
        while ((val = val.nextSibling) && val !== edge) {
          prev.delete(val)
          next.add(val)
        }

        this.clearChi()

        this.prev = next
        this.next = prev
      }

      clearChi() {
        const {tar, edge, prev} = this
        if (prev) for (const val of prev) removeLax(tar, val)
        edge?.remove()
      }
    }
  }
}

export function MixRecNodeFun(cls) {return MixinRecNodeFun.get(cls)}

export class MixinRecNodeFun extends o.Mixin {
  static make(Text) {
    return class RecNodeFun extends MixRecNode(Text) {
      get Recur() {return ob.FunRecur}

      fun = undefined
      rec = undefined

      constructor(ren, tar, fun) {
        super(ren, tar)
        this.fun = l.reqFun(fun)
        this.rec = new this.Recur(this, this.run).setShed(ren.shed)
      }

      deref() {
        const {tar, fun} = this
        return fun.call(tar, tar)
      }

      init() {return this.rec.run(this, super.init)}
      deinit() {this.rec.deinit()}
    }
  }
}

export function MixRecNodeRef(cls) {return MixinRecNodeRef.get(cls)}

export class MixinRecNodeRef extends o.Mixin {
  static make(Text) {
    return class RecNodeRef extends MixRecNode(Text) {
      ref = undefined

      constructor(ren, tar, ref) {
        super(ren, tar)
        this.ref = ref
        this.runRef = new ob.RunRef(this, this.run)
        this.shedRef = new ob.RunRef(this, this.schedule)
      }

      deref() {return l.derefAll(this.ref)}

      run() {
        super.run()
        ob.getQue(this.ref).enque(this.shedRef.init())
      }

      init() {
        const out = super.init()
        ob.getQue(this.ref).enque(this.shedRef.init())
        return out
      }

      depth() {return ob.nodeDepth(this.tar)}
      schedule() {this.ren.shed.enque(this.runRef.init())}

      deinit() {
        this.shedRef.deinit()
        this.runRef.deinit()
      }
    }
  }
}

const FROZEN = Symbol.for(`frozen`)

/*
Short for "props builder". Provides various shortcuts for building and merging
HTML/DOM props. Can be instantiated with a plain dict; see `.with` and
`.snapshot`.

The combination of wrapper object and inner object provides separate namespaces
for methods and properties. This gives us an extensible, subclassable namespace
for various shortcuts such as `.cls` and `.tarblan`. It also encourages the
user to separate HTML/DOM attributes from the inputs to their own JS
functions/classes. Mixing everything into "props" is a fundamental design
mistake.

We could also get a separate "namespace" by subclassing `Map` or wrapping an
array, but using an inner dict keeps our renderer code compatible with plain
dicts, preserving compatibility with JSX.

Implementation notes.

Subclassing `Map` would also give us a separate "namespace" without wrapping.
Performance would be very similar, both for building and for iterating.
It would require special adaptations in renderer code, either giving up
compatibility with plain dicts, or implementing polymorphic iteration, which
requires extra code and has fragile performance.

We could get significantly better performance by using an associative array
instead of a dictionary, but the renderer code would have to be specialized for
that, giving up compatibility with plain dicts.

Constructing props via "builder" methods is slower than via inline object
literals, but easily compensates for the overhead by encouraging the user to
avoid object rest/spread and providing more efficient "merge" shortcuts such as
`.cls`.

The cost of the wrapper is insignificant; the main cost is giving up object
literals which are nearly free to construct.

Custom frozen marker has much better performance than `Object.freeze` and
`Object.isFrozen`.
*/
export class PropBui extends l.Emp {
  constructor(val) {
    super()
    this[l.VAL] = l.deref(val)
    this[FROZEN] = false
  }

  has(key) {
    l.reqStr(key)
    const src = this[l.VAL]
    return !!src && key in src
  }

  get(key) {
    l.reqStr(key)
    return this[l.VAL]?.[key]
  }

  set(key, val) {
    const self = this.mutable()
    return self[l.VAL][l.reqStr(key)] = val, self
  }

  delete(key) {
    const tar = this[l.VAL]
    if (l.hasOwn(tar, key)) delete tar[key]
    return this
  }

  /*
  The names of the following methods match 1-1 with known properties
  or attributes. For "custom" shortcuts, see below.
  */

  alt(val) {return this.set(`alt`, val)}
  as(val) {return this.set(`as`, val)}
  charset(val) {return this.set(`charset`, val)}
  checked(val) {return this.set(`checked`, !!val)}
  class(val) {return this.set(`class`, val)}
  content(val) {return this.set(`content`, val)}
  crossorigin(val) {return this.set(`crossorigin`, val)}
  dataset(val) {return this.set(`dataset`, val)}
  disabled(val) {return this.set(`disabled`, !!val)}
  for(val) {return this.set(`for`, val)}
  height(val) {return this.set(`height`, val)}
  hidden(val) {return this.set(`hidden`, !!val)}
  href(val) {return this.set(`href`, val)}
  httpEquiv(val) {return this.set(`http-equiv`, val)}
  id(val) {return this.set(`id`, val)}
  is(val) {return this.set(`is`, val)}
  lang(val) {return this.set(`lang`, val)}
  method(val) {return this.set(`method`, val)}
  name(val) {return this.set(`name`, val)}
  onchange(val) {return this.set(`onchange`, val)}
  onclick(val) {return this.set(`onclick`, val)}
  oninput(val) {return this.set(`oninput`, val)}
  onkeydown(val) {return this.set(`onkeydown`, val)}
  onkeypress(val) {return this.set(`onkeypress`, val)}
  onkeyup(val) {return this.set(`onkeyup`, val)}
  onsubmit(val) {return this.set(`onsubmit`, val)}
  pattern(val) {return this.set(`pattern`, val)}
  placeholder(val) {return this.set(`placeholder`, val)}
  rel(val) {return this.set(`rel`, val)}
  required(val) {return this.set(`required`, !!val)}
  role(val) {return this.set(`role`, val)}
  selected(val) {return this.set(`selected`, !!val)}
  src(val) {return this.set(`src`, val)}
  style(val) {return this.set(`style`, val)}
  tabIndex(val) {return this.set(`tabIndex`, val)}
  target(val) {return this.set(`target`, val)}
  title(val) {return this.set(`title`, val)}
  type(val) {return this.set(`type`, val)}
  value(val) {return this.set(`value`, val)}
  width(val) {return this.set(`width`, val)}

  /*
  The following shortcuts are "custom". Their names should avoid collision with
  known properties or attributes.
  */

  cls(val) {return val ? this.set(`class`, spaced(this.get(`class`), val)) : this}
  button() {return this.type(`button`)}
  submit() {return this.type(`submit`)}
  tarblan() {return this.target(`_blank`).rel(`noopener noreferrer`)}

  bg(val) {
    val = l.renderLax(val)
    return val ? this.style(`background-image: url(${val})`) : this
  }

  link(val) {
    if (l.isNil(val)) return this.href()
    val = l.render(val)
    return hasScheme(val) ? this.href(val).tarblan() : this.href(val)
  }

  /*
  The following are internal methods. Subclasses shouldn't need to use them
  or to redefine them.
  */

  mut(val) {
    val = l.deref(val)
    return l.isSome(val) ? this.mutFromRec(val) : this
  }

  mutFromRec(val) {
    const self = this.mutable()
    const tar = self[l.VAL]
    for (const key of l.recKeys(val)) tar[key] = val[key]
    return self
  }

  with(val) {
    if (this[l.VAL]) return this.mut(val)
    const self = this.mutableOuter()
    self[l.VAL] = l.deref(val)
    return self
  }

  frozen() {return this[FROZEN] = true, this}
  snapshot(val) {return this.with(val).frozen()}
  mutable() {return this.mutableOuter().mutableInner()}
  mutableOuter() {return this[FROZEN] ? new this.constructor().mut(this[l.VAL]) : this}
  mutableInner() {return (this[l.VAL] ??= l.Emp()), this}

  static of(val) {
    if (l.isNil(val)) return new this()
    if (l.reqRec(val) instanceof this) return val
    return new this(val)
  }

  // For `obs.mjs`.`MixMain`.
  static default() {return new this().frozen()}
}

function hasScheme(val) {return /^\w+:/.test(l.laxStr(val))}

export const DOCTYPE_HTML = `<!doctype html>`

export function isNodable(val) {return l.isComp(val) && l.isFun(val.toNode)}
export function reqNodable(val) {return l.req(val, isNodable)}

export function isDocument(val) {
  return (
    l.isObj(val) &&
    `createElement` in val &&
    `createElementNS` in val &&
    `createDocumentFragment` in val
  )
}
export function optDocument(val) {return l.opt(val, isDocument)}
export function reqDocument(val) {return l.req(val, isDocument)}

export function isDomEnv(val) {
  return (
    l.isComp(val) &&
    isDocument(val.document) &&
    l.isCls(val.Node) &&
    l.isCls(val.Text) &&
    l.isCls(val.Comment)
  )
}
export function optDomEnv(val) {return l.opt(val, isDomEnv)}
export function reqDomEnv(val) {return l.req(val, isDomEnv)}

export function isNamespaced(val) {return l.isObj(val) && `namespaceURI` in val}

/*
In many DOM APIs only `null` is considered nil/missing, while `undefined` is
stringified to `"undefined"`.
*/
function norm(val) {return val ?? null}

function errMismatch(tar, key, val, src) {
  return TypeError(`unable to set ${l.show(key)} ${l.show(val)} on ${l.show(tar)}: type mismatch with ${l.show(src)}`)
}

function setOpt(tar, key, prev, next) {if (!l.is(prev, next)) tar[key] = next}
function removeLax(tar, val) {if (tar === val?.parentNode) val.remove()}

function spaced(one, two) {
  one = l.laxStr(one)
  two = l.laxStr(two)
  return one + (one && two && ` `) + two
}

function optAt(key, val, fun) {
  if (l.isNil(val) || fun(val)) return val
  throw TypeError(`invalid property ${l.show(key)}: ` + l.msgType(val, l.showFunName(fun)))
}

function isVac(src) {
  while (l.isArr(src) && src.length <= 1) src = src[0]
  return l.isNil(src) || src === ``
}
