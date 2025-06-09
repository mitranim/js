import * as l from './lang.mjs'
import * as o from './obj.mjs'
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
  get Text() {return this.env.Text}
  get RecPropFun() {return RecPropFun}
  get RecPropRef() {return RecPropRef}
  get RecNodeFun() {return o.pub(this, `RecNodeFun`, MixRecNodeFun(this.Text))}
  get RecNodeRef() {return o.pub(this, `RecNodeRef`, MixRecNodeRef(this.Text))}

  // All-purpose rendering function for HTML elements.
  E(tar, props, ...chi) {
    if (!l.isObj(tar)) return this.elemHtml(tar, props, ...chi)
    this.mutProps(tar, props)
    if (chi.length) this.mutChi(tar, ...chi)
    return tar
  }

  // All-purpose rendering function for SVG elements.
  S(tar, props, ...chi) {
    if (!l.isObj(tar)) return this.elemSvg(tar, props, ...chi)
    this.mutProps(tar, props)
    if (chi.length) this.mutChi(tar, ...chi)
    return tar
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

  frag(...val) {
    const tar = this.doc.createDocumentFragment()
    this.appendList(tar, val)
    return tar
  }

  node(...val) {
    if (val.length === 0) return null
    if (val.length === 1 && isNode(val[0])) return val[0]
    return this.frag(...val)
  }

  mut(tar, props, ...chi) {
    this.mutProps(tar, props)
    this.mutChi(tar, ...chi)
    return tar
  }

  mutProps(tar, src) {
    if (l.isFun(src)) return this.mutPropsFun(tar, src)
    if (ob.isObsRef(src)) return this.mutPropsRef(tar, src)
    return this.mutPropsRec(tar, l.deref(src))
  }

  mutPropsFun(tar, src) {
    const {shed} = this
    if (!shed) return this.mutProps(tar, src.call(tar, tar))
    return this.RecPropFun.init(this, tar, src), tar
  }

  mutPropsRef(tar, src) {
    const {shed} = this
    if (!shed) return this.mutProps(tar, l.derefAll(src))
    return this.RecPropRef.init(this, tar, src), tar
  }

  mutPropsRec(tar, src) {
    l.reqRec(tar)
    if (l.isNil(src)) return tar

    const prev = tar[PROP_KEYS]
    const dict = src
    const list = l.recKeys(src)

    for (const key of list) this.mutProp(tar, key, src[key])

    tar[PROP_KEYS] = list
    if (!prev) return tar

    for (const key of prev) if (!l.hasOwn(dict, key)) this.mutProp(tar, key)
    return tar
  }

  // TODO consider supporting `innerHTML` prop.
  mutProp(tar, key, val) {
    if (key === `attributes`) return this.mutAttrs(tar, val)
    if (key === `class`) return this.mutCls(tar, val, key)
    if (key === `className`) return this.mutCls(tar, val, key)
    if (key === `style`) return this.mutStyle(tar, val)
    if (key === `dataset`) return this.mutDataset(tar, val)
    return this.mutPropAny(tar, key, val)
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

  mutChi(tar, ...chi) {
    reqNode(tar)

    if (!chi.length) {
      this.clear(tar)
      return tar
    }

    if (!tar.hasChildNodes()) {
      for (chi of chi) this.appendChi(tar, chi)
      return tar
    }

    const frag = this.frag(...chi)
    this.clear(tar)
    tar.appendChild(frag)
    return tar
  }

  appendChi(tar, src) {
    if (l.isFun(src)) return this.appendFun(tar, src)
    if (ob.isObsRef(src)) return this.appendRef(tar, src)
    if (isNodable(src)) src = src.toNode()
    if (l.isNil(src)) return tar
    if (l.isStr(src)) return tar.append(src), tar
    if (isNode(src)) return tar.appendChild(src), tar
    if (isRaw(src)) return this.appendRaw(tar, src), tar
    if (isSeq(src)) {
      if (l.isList(src)) return this.appendList(tar, src), tar
      return this.appendSeq(tar, src), tar
    }
    return this.appendChi(tar, this.renderOpt(src)), tar
  }

  appendFun(tar, src) {
    const {shed} = this
    if (!shed) return src.call(tar, tar)
    return this.RecNodeFun.init(this, tar, src), tar
  }

  appendRef(tar, src) {
    const {shed} = this
    if (!shed) return l.derefAll(src)
    return this.RecNodeRef.init(this, tar, src), tar
  }

  /*
  This strange-looking code implements support for passing an element's
  `.childNodes` to a rendering call where that same element is the target
  of mutation, and having it work correctly, when using our DOM shim,
  where `.childNodes` is just a simple array internally.
  */
  appendList(tar, src) {
    l.reqList(src)
    let ind = 0

    for (;;) {
      const len = src.length
      if (!(ind >= 0 && ind < len)) return tar

      this.appendChi(tar, src[ind])

      ind += 1
      ind -= Math.max(0, len - src.length)
    }
  }

  appendSeq(tar, src) {
    for (src of src) this.appendChi(tar, src)
    return tar
  }

  /*
  Might be stupidly inefficient. Need benchmarks.
  Might not be compatible with SVG rendering. Needs SVG testing.
  */
  appendRaw(tar, src) {
    if (!tar.hasChildNodes() && `innerHTML` in tar) {
      tar.innerHTML = l.laxStr(src.outerHTML)
      return tar
    }

    const ns = l.get(src, `namespaceURI`)
    const buf = ns ? this.makeElemNs(ns, `span`) : this.makeElem(`span`)

    buf.innerHTML = l.laxStr(src.outerHTML)
    return this.move(tar, buf)
  }

  mutText(tar, src) {
    reqNode(tar)
    setOpt(tar, `textContent`, tar.textContent, l.laxStr(this.renderOpt(src)))
    return tar
  }

  replace(tar, ...chi) {
    reqNode(tar)
    tar.parentNode.replaceChild(this.frag(...chi), tar)
  }

  clear(tar) {
    while (tar.hasChildNodes()) tar.removeChild(tar.lastChild)
    return tar
  }

  move(tar, src) {
    if (src !== tar) {
      while (src.hasChildNodes()) tar.appendChild(src.removeChild(src.firstChild))
    }
    return tar
  }

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
    if (l.isNil(val)) return undefined

    const out = l.renderOpt(val)
    if (l.isSome(out)) return out
    if (this.lax) return undefined

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

// Marks "raw text" which must be preserved as-is without escaping.
export class Raw extends l.Emp {
  constructor(val) {super().outerHTML = l.renderLax(val)}
}

export function MixInitRun(cls) {return MixinInitRun.get(cls)}

export class MixinInitRun extends o.Mixin {
  static make(cls) {
    return class MixinInitRun extends cls {
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
  constructor(ren, tar, fun) {super(ren.shed, tar, fun).ren = ren}
  onRun() {this.ren.mutProps(this.tar, super.onRun())}
  sameKey(key) {return key === this.fun}
}

export class RecPropRef extends MixInitRun(ob.RunRef) {
  constructor(ren, tar, ref) {
    super(tar)
    this.ref = ref
    this.ren = ren
    this.shedRef = new ob.ShedRef(this)
  }

  run() {
    const tar = this.deref()
    if (!tar) return

    const {ren, ref, shedRef} = this
    ren.mutProps(tar, l.derefAll(ref))

    ob.getQue(ref).enque(shedRef.init())
  }

  eq(key) {return key === this.ref}
  depth() {return ob.nodeDepth(this.deref())}
  schedule() {this.ren.shed.enque(this.init())}
}

export function MixRecNode(cls) {return MixinRecNode.get(cls)}

export class MixinRecNode extends o.Mixin {
  static make(Text) {
    return class MixinRecNode extends Text {
      ren = undefined
      tar = undefined
      chi = undefined

      constructor(ren, tar) {
        super()
        this.ren = ren
        this.tar = tar
      }

      deref() {}

      run() {
        let val = this.deref()
        this.clear()

        if (l.isArr(val) && val.length <= 1) val = val[0]
        if (l.isNil(val)) return

        if (l.isScalar(val)) {
          this.textContent = l.renderLax(val)
          return
        }

        const frag = this.ren.frag(val)
        this.chi = [...frag.childNodes]

        const par = this.parentNode
        if (!isNode(par)) return

        par.insertBefore(frag, this.nextSibling)

        /*
        For the DOM shim. Unfortunately, in this case we waste performance on
        the snapshot above, which is required for correctness in "proper" DOM
        environments. The overhead is minimal and only applies to the shim.
        */
        if (this.nextSibling === frag) this.chi = frag
      }

      clearChi() {
        const {chi, parentNode: par} = this
        if (!chi || !par) return

        if (l.isArr(chi)) {
          while (chi.length) par.removeChild(chi.pop())
          return
        }

        if (l.isInst(chi, this.ren.Node)) par.removeChild(chi)
      }

      clear() {
        this.clearChi()
        this.textContent = ``
      }

      static init(ren, tar, src) {
        const out = new this(ren, tar, src)
        tar.appendChild(out)
        out.run()
        return out
      }
    }
  }
}

export function MixRecNodeFun(cls) {return MixinRecNodeFun.get(cls)}

export class MixinRecNodeFun extends o.Mixin {
  static make(Text) {
    return class MixinRecNodeFun extends MixRecNode(Text) {
      get Recur() {return ob.FunRecur}

      fun = undefined
      rec = undefined

      constructor(ren, tar, fun) {
        super(ren, tar)
        this.fun = l.reqFun(fun)
        this.rec = new this.Recur(ren.shed, this, this.onRun)
      }

      deref() {
        const {tar, fun} = this
        return fun.call(tar, tar)
      }

      run() {this.rec.run()}
      onRun() {super.run()}
      deinit() {this.rec.deinit()}
    }
  }
}

export function MixRecNodeRef(cls) {return MixinRecNodeRef.get(cls)}

export class MixinRecNodeRef extends o.Mixin {
  static make(Text) {
    return class MixinRecNodeRef extends MixRecNode(Text) {
      ref = undefined

      constructor(ren, tar, ref) {
        super(ren, tar)
        this.ref = ref
        this.runRef = new ob.RunRef(this)
        this.shedRef = new ob.ShedRef(this)
      }

      deref() {return l.derefAll(this.ref)}

      run() {
        super.run()
        ob.getQue(this.ref).enque(this.shedRef.init())
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

Using `l.Emp()` for the inner dict would reduce our performance in
benchmarks. Using an object with a clean but non-null prototype, via `Emp`,
avoids that. Unclear if this makes any difference in actual apps.

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

/*
Much more restrictive than `lang.mjs`.`isSeq`. Designed to prevent programmer
errors such as accidentally passing a `Set` as an element child.
*/
export function isSeq(val) {
  return l.isObj(val) && !l.isScalar(val) && (l.isList(val) || l.isIterator(val))
}

export function isNodable(val) {return l.isComp(val) && l.isFun(val.toNode)}
export function reqNodable(val) {return l.req(val, isNodable)}

export function isRaw(val) {return l.isObj(val) && `outerHTML` in val}
export function reqRaw(val) {return l.req(val, isRaw)}

export function isNode(val) {return l.isObj(val) && `parentNode` in val && `childNodes` in val}
export function reqNode(val) {return l.req(val, isNode)}

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
    l.isCls(val.Text)
  )
}
export function optDomEnv(val) {return l.opt(val, isDomEnv)}
export function reqDomEnv(val) {return l.req(val, isDomEnv)}

export function isNamespaced(val) {return l.isObj(val) && `namespaceURI` in val}

/*
In many DOM APIs only `null` is considered nil/missing, while `undefined` is
stringified to `'undefined'`.
*/
function norm(val) {return val ?? null}

function errMismatch(tar, key, val, src) {
  return TypeError(`unable to set ${l.show(key)} ${l.show(val)} on ${l.show(tar)}: type mismatch with ${l.show(src)}`)
}

// Sometimes avoids slow style/layout recalculations.
function setOpt(tar, key, prev, next) {if (!l.is(prev, next)) tar[key] = next}

function spaced(one, two) {
  one = l.laxStr(one)
  two = l.laxStr(two)
  return one + (one && two && ` `) + two
}

function optAt(key, val, fun) {
  if (l.isNil(val) || fun(val)) return val
  throw TypeError(`invalid property ${l.show(key)}: ` + l.msgType(val, l.showFunName(fun)))
}
