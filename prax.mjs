import * as l from './lang.mjs'
import * as o from './obj.mjs'

export const nsHtml = `http://www.w3.org/1999/xhtml`
export const nsSvg = `http://www.w3.org/2000/svg`
export const nsMathMl = `http://www.w3.org/1998/Math/MathML`

/*
The specification postulates the concept, but where's the standard list?
Taken from non-authoritative sources.

  https://www.w3.org/TR/html52/infrastructure.html#boolean-attribute
*/
export const BOOL = /* @__PURE__ */ new Set([`allowfullscreen`, `allowpaymentrequest`, `async`, `autofocus`, `autoplay`, `checked`, `controls`, `default`, `disabled`, `formnovalidate`, `hidden`, `ismap`, `itemscope`, `loop`, `multiple`, `muted`, `nomodule`, `novalidate`, `open`, `playsinline`, `readonly`, `required`, `reversed`, `selected`, `truespeed`])

/*
References:

  https://www.w3.org/TR/html52/
  https://www.w3.org/TR/html52/syntax.html#writing-html-documents-elements
*/
export const VOID = /* @__PURE__ */ new Set([`area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`])

/*
Creates or mutates DOM elements with a convenient React-inspired syntax.
Shared component of HTML and SVG renderers.
*/
export class Ren extends l.Emp {
  constructor(doc) {
    super()
    this.doc = reqDocument(doc)
    this.elemHtml = this.elemHtml.bind(this)
    this.elemSvg = this.elemSvg.bind(this)
    this.elem = this.elem.bind(this)
    this.frag = this.frag.bind(this)
  }

  /*
  Short for "element". This lazily-initialized property is a "namespace" where
  accessing an arbitrary property "X" is equivalent to calling `ren.elemHtml`
  with the same tag "X". The elements are created in the HTML namespace, with
  the exception of the `svg` tag which is created in the SVG namespace.
  */
  get E() {return o.priv(this, `E`, new Proxy(this, new RenHtmlPh()))}

  /*
  Short for "SVG element". This lazily-initialized property is a "namespace"
  where accessing an arbitrary property "X" is equivalent to calling
  `ren.elemSvg` with the same tag "X". The elements are created in the SVG
  namespace.
  */
  get S() {return o.priv(this, `S`, new Proxy(this, new RenSvgPh()))}

  /*
  Short for "mixin". This lazily-initialized method takes a class and creates a
  subclass with additional methods `.props` and `.chi`, which are shortcuts for
  mutating properties and child nodes by using this renderer.
  */
  get Mix() {return o.priv(this, `Mix`, o.weakCache(this.MixRen.bind(this)))}

  elemHtml(tag, props, ...chi) {
    if (tag === `svg`) {
      return this.alignNs(this.elemSvg(tag, props, ...chi))
    }
    if (this.isVoid(tag) && chi.length) {
      this.throwVoidChi(tag, chi)
    }
    return this.elem(tag, props, ...chi)
  }

  elemSvg(tag, props, ...chi) {
    return this.mut(this.makeSvg(tag, props), props, ...chi)
  }

  elem(tag, props, ...chi) {
    return this.mut(this.make(tag, props), props, ...chi)
  }

  frag(...val) {return this.appendSeq(this.doc.createDocumentFragment(), val)}

  makeHtml(tag, props) {return this.makeNs(nsHtml, tag, deref(props))}

  makeSvg(tag, props) {return this.makeNs(nsSvg, tag, deref(props))}

  makeNs(ns, tag, props) {
    return this.doc.createElementNS(l.reqStr(ns), l.reqStr(tag), deref(props))
  }

  make(tag, props) {
    return this.doc.createElement(l.reqStr(tag), deref(props))
  }

  makeBuf(src) {
    const ns = l.get(src, `namespaceURI`)
    return ns ? this.makeNs(ns, `span`) : this.make(`span`)
  }

  mut(tar, props, ...chi) {
    this.mutProps(tar, props)
    this.mutChi(tar, ...chi)
    return tar
  }

  mutProps(tar, val) {return this.loop(reqElement(tar), val, this.mutProp)}

  mutProp(tar, key, val) {
    if (key === `is`) return undefined
    if (key === `attributes`) return this.mutAttrs(tar, val)
    if (key === `class`) return this.mutCls(tar, val)
    if (key === `className`) return this.mutCls(tar, val)
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
    val = this.strOpt(val)
    if (l.isNil(val)) return tar.removeAttribute(key)
    return tar.setAttribute(key, val)
  }

  mutCls(tar, val) {
    val = this.strLax(val)
    if (val !== l.laxStr(tar.getAttribute(`class`))) {
      tar.setAttribute(`class`, val)
    }
  }

  mutStyle(tar, val) {
    if (l.isNil(val) || l.isStr(val)) return this.mutAttrAny(tar, `style`, val)
    if (l.isStruct(val)) return this.mutStyleStruct(tar, val)
    throw l.errConv(val, `style`)
  }

  mutStyleStruct(tar, val) {
    this.loop(tar.style, val, this.mutStyleProp)
    return tar
  }

  mutStyleProp(tar, key, val) {
    tar[key] = l.laxStr(optAt(key, val, l.isStr))
  }

  mutDataset(tar, val) {
    this.loop(tar.dataset, val, this.mutDatasetProp)
    return tar
  }

  mutDatasetProp(tar, key, val) {
    val = this.strOpt(val)
    if (l.isNil(val)) delete tar[key]
    else tar[key] = val
  }

  mutPropAny(tar, key, val) {
    if (!(key in tar)) return this.mutAttr(tar, key, val)

    const src = tar[key]
    if (l.isNil(src)) return setOpt(tar, key, src, norm(val))
    if (l.isStr(src)) return setOpt(tar, key, src, this.strLax(val))

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

  /*
  Implementation note. We buffer children in a temporary fragment BEFORE
  clearing the target node in order to handle the case when `tar.childNodes` is
  among the given children. Stealing the children before clearing the remaining
  ones ensures that we get to keep them and append them back.
  */
  mutChi(tar, ...chi) {
    reqNode(tar)

    if (tar.hasChildNodes()) {
      const frag = this.frag(...chi)
      this.clear(tar)
      tar.appendChild(frag)
    }
    else {
      this.appendSeq(tar, chi)
    }

    return tar
  }

  // TODO: test deoptimization with non-array iterators.
  appendSeq(tar, val) {
    for (val of val) this.appendChi(tar, val)
    return tar
  }

  appendChi(tar, val) {
    if (l.isNil(val)) return undefined
    if (l.isStr(val)) return void this.appendStr(tar, val)
    if (isNode(val)) return void tar.appendChild(val)
    if (isRaw(val)) return void this.appendRaw(tar, val)
    if (isSeq(val)) return void this.appendSeq(tar, val)
    return void this.appendChi(tar, this.strOpt(val))
  }

  appendStr(tar, val) {if (l.reqStr(val)) tar.append(val)}

  /*
  Might be stupidly inefficient. Need benchmarks.
  Might not be compatible with SVG rendering. Needs SVG testing.
  */
  appendRaw(tar, val) {
    if (!tar.hasChildNodes() && `innerHTML` in tar) {
      tar.innerHTML = l.laxStr(val.outerHTML)
      return
    }

    const buf = this.makeBuf(tar)
    buf.innerHTML = l.laxStr(val.outerHTML)
    this.move(buf, tar)
  }

  mutText(tar, val) {
    reqNode(tar)
    setOpt(tar, `textContent`, tar.textContent, this.strLax(val))
    return tar
  }

  replace(tar, ...chi) {
    reqNode(tar)
    tar.parentNode.replaceChild(this.frag(...chi), tar)
  }

  clear(tar) {
    while (tar.hasChildNodes()) tar.removeChild(tar.lastChild)
  }

  move(src, tar) {
    while (src.hasChildNodes()) tar.appendChild(src.removeChild(src.firstChild))
  }

  loop(tar, val, fun) {
    if ((val = deref(val))) {
      for (const key of l.structKeys(val)) {
        fun.call(this, tar, key, val[key])
      }
    }
    return tar
  }

  isHtml(tar) {return tar.namespaceURI === nsHtml}

  isSvg(tar) {return tar.namespaceURI === nsSvg}

  // Minor inefficiency. Can be avoided by creating elements with the
  // correct namespace from the start. Shouldn't be anyone's bottleneck.
  alignNs(tar) {
    if (!(isElement(tar) && isNamespaced(tar))) return tar

    const chi = tar.firstChild
    if (!isNamespaced(chi)) return tar

    const ns = tar.namespaceURI
    if (!ns) return tar

    // eslint-disable-next-line no-self-assign
    if (ns !== chi.namespaceURI) tar.innerHTML = tar.innerHTML
    return tar
  }

  // Slightly suboptimal, TODO tune.
  strLax(val) {return l.laxStr(this.strOpt(val))}

  // Wastes performance on double scalar check, TODO tune.
  strOpt(val) {
    if (l.isNil(val) || (this.lax && !l.isScalar(val))) return undefined
    return l.render(val)
  }

  isBool(key) {return BOOL.has(key)}

  isVoid(tag) {return VOID.has(tag)}

  throwVoidChi(tag, chi) {
    throw SyntaxError(`expected void element ${l.show(tag)} to have no children, got ${l.show(chi)}`)
  }

  patchProto(cls) {
    l.reqCls(cls)
    o.priv(cls.prototype, `props`, selfMutProps)
    o.priv(cls.prototype, `chi`, selfMutChi)
    o.priv(cls.prototype, `ren`, this)
    return this
  }

  // Short for "mixin with renderer support". See the `.Mix` getter.
  MixRen(cls) {
    class MixRen extends cls {
      props(val) {return this.ren.mutProps(this, val)}
      chi(...val) {return this.ren.mutChi(this, ...val)}
      get ren() {return this.constructor.ren}
    }
    MixRen.ren = this
    return MixRen
  }

  static native() {
    return new this(globalThis.document).patchProto(globalThis.Element)
  }
}

// Marks "raw text" which must be preserved as-is without escaping.
export class Raw extends l.Emp {
  constructor(val) {super().outerHTML = l.renderLax(val)}
}

export class RenPh extends o.BlankPh {
  get(ren, key) {return ren.make(key)}
}

export class RenHtmlPh extends o.BlankPh {
  get(ren, key) {return ren.makeHtml(key)}
}

export class RenSvgPh extends o.BlankPh {
  get(ren, key) {return ren.makeSvg(key)}
}

// Must match `dom_shim.mjs`.
const parentNodeKey = Symbol.for(`parentNode`)

/*
Takes a DOM element class and modifies the constructor signature, allowing early
access to the parent node.

Normally, node constructors are nullary. With this mixin, the constructor takes
an optional reference to a parent node. When given, the child-to-parent
relationship is established before the child is actually attached to the
parent. This can be convenient for application code that revolves around custom
elements and initializes children before attaching them. This allows children
to immediately traverse the ancestor chain to access "contextual" data
available on ancestors. Note that this doesn't establish parent-to-child
relations early.

When used with the native DOM, the `.parentNode` getter and setter affect only
JS code, without affecting native operations. Native DOM implementations
completely bypass both.
*/
export const MixChild = /* @__PURE__ */ o.weakCache(function MixChild(cls) {
  return class MixChild extends cls {
    constructor(val) {
      super()
      if (l.optObj(val)) this.parentNode = val
    }

    get parentNode() {return super.parentNode || norm(this[parentNodeKey])}
    set parentNode(val) {this[parentNodeKey] = val}
  }
})

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

Using `Object.create(null)` for the inner dict would reduce our performance in
benchmarks. Using an object with a clean but non-null prototype, via `Emp`,
avoids that. Unclear if this makes any difference in actual apps.

Custom frozen marker has much better performance than `Object.freeze` and
`Object.isFrozen`.
*/
export class PropBui extends l.Emp {
  constructor(val) {
    super()
    this[refKey] = deref(val)
    this[frozenKey] = false
  }

  get $() {return this[refKey]}

  has(key) {return l.hasIn(this[refKey], key)}
  get(key) {return this[refKey] ? this[refKey][l.reqStr(key)] : undefined}

  set(key, val) {
    const self = this.mutable()
    return self.$[l.reqStr(key)] = val, self
  }

  /*
  The names of the following methods match 1-1 with known properties
  or attributes. For "custom" shortcuts, see below.
  */
  as(val) {return this.set(`as`, val)}
  charset(val) {return this.set(`charset`, val)}
  checked(val) {return this.set(`checked`, !!val)}
  class(val) {return this.set(`class`, val)}
  content(val) {return this.set(`content`, val)}
  crossorigin(val) {return this.set(`crossorigin`, val)}
  dataset(val) {return this.set(`dataset`, val)}
  disabled(val) {return this.set(`disabled`, !!val)}
  for(val) {return this.set(`for`, val)}
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
  type(val) {return this.set(`type`, val)}
  value(val) {return this.set(`value`, val)}

  /*
  The following shortcuts are "custom". Their names should avoid collision with
  known properties or attributes.
  */
  aria(key, val) {return this.set(`aria-` + l.reqStr(key), val)}
  data(key, val) {return this.set(`data-` + l.reqStr(key), val)}
  cls(val) {return val ? this.set(`class`, spaced(this.get(`class`), val)) : this}
  button() {return this.type(`button`)}
  submit() {return this.type(`submit`)}
  tarblan() {return this.target(`_blank`).rel(`noopener noreferrer`)}

  mut(val) {
    val = deref(val)
    return val ? this.mutFromStruct(val) : this.mutable()
  }

  mutFromStruct(val) {
    const self = this.mutable()
    for (const key of l.structKeys(val)) self.$[key] = val[key]
    return self
  }

  with(val) {
    if (this[refKey]) return this.mut(val)
    const self = this.mutableOuter()
    self[refKey] = deref(val)
    return self
  }

  frozen() {return this[frozenKey] = true, this}
  snapshot(val) {return this.with(val).frozen()}
  mutable() {return this.mutableOuter().mutableInner()}
  mutableOuter() {return this[frozenKey] ? new this.constructor().mut(this.$) : this}
  mutableInner() {return (!this[refKey] && (this[refKey] = new l.Emp())), this}

  static of(val) {
    if (l.isNil(val)) return new this()
    if (l.reqObj(val) instanceof this) return val
    return new this(val)
  }
}

const refKey = Symbol.for(`$`)
const frozenKey = Symbol.for(`frozen`)

/*
Short for "attributes". Abbreviated for frequent use. This is a static instance,
considered "immutable". Any "mutating" method makes a new mutable instance.
Compare `P` which is a function.
*/
export const A = /* @__PURE__ */ new PropBui().frozen()

export function renderDocument(src) {
  const pre = `<!doctype html>`
  if (l.isNil(src)) return ``
  if (l.isStr(src)) return src && (pre + src)
  if (isRaw(src)) return renderDocument(src.outerHTML)
  if (l.isScalar(src)) return renderDocument(l.render(src))
  throw l.errConv(src, `document`)
}

export function isSeq(val) {
  return l.isObj(val) && !l.isScalar(val) && (l.isList(val) || l.isIter(val))
}

export function isRaw(val) {return l.hasIn(val, `outerHTML`)}
export function reqRaw(val) {return l.req(val, isRaw)}

// Dup from `dom.mjs` to avoid import.
export function isNode(val) {return l.isObj(val) && `parentNode` in val && `childNodes` in val}
export function reqNode(val) {return l.req(val, isNode)}

// Dup from `dom.mjs` to avoid import.
export function isElement(val) {return isNode(val) && `setAttribute` in val}
export function reqElement(val) {return l.req(val, isElement)}

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

export function isNamespaced(val) {return l.hasIn(val, `namespaceURI`)}

// Used for adapting various "props" inputs.
export function deref(val) {
  if (!l.optObj(val)) return val
  if (`$` in val) return val.$
  return val
}

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
  one = l.laxStr(one), two = l.laxStr(two)
  return one + (one && two && ` `) + two
}

function selfMutProps(val) {return this.ren.mutProps(this, val)}
function selfMutChi(...val) {return this.ren.mutChi(this, ...val)}

function optAt(key, val, fun) {
  if (l.isNil(val) || fun(val)) return val
  throw TypeError(`invalid property ${l.show(key)}: ` + l.msgType(val, l.showFunName(fun)))
}
