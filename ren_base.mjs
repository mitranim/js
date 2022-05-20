/*
Shared component of our DOM and XML/string renderers. This needs a better and
more specific name; "rendering" is a very generic term. Our "ren" modules are
designed specifically for XML/HTML/DOM rendering with a React-inspired syntax
but simpler semantics and better performance.
*/

import * as l from './lang.mjs'

/*
The specification postulates the concept, but where's the standard list?
Taken from non-authoritative sources.

  https://www.w3.org/TR/html52/infrastructure.html#boolean-attribute
*/
export const BOOL_ATTRS = /* @__PURE__ */ new Set([`allowfullscreen`, `allowpaymentrequest`, `async`, `autofocus`, `autoplay`, `checked`, `controls`, `default`, `disabled`, `formnovalidate`, `hidden`, `ismap`, `itemscope`, `loop`, `multiple`, `muted`, `nomodule`, `novalidate`, `open`, `playsinline`, `readonly`, `required`, `reversed`, `selected`, `truespeed`])

/*
References:

  https://www.w3.org/TR/html52/
  https://www.w3.org/TR/html52/syntax.html#writing-html-documents-elements
*/
export const VOID_ELEMS = /* @__PURE__ */ new Set([`area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`])

// Short for "renderer". Base class used by DOM and XML/string renderers.
export class RenBase extends l.Emp {
  constructor() {super().lax = false}

  // Short for "element". Abbreviated for frequent use.
  E() {}

  // Used for adapting various "props" inputs.
  deref(val) {return deref(val)}

  // Slightly suboptimal, TODO tune.
  strLax(val) {return l.laxStr(this.strOpt(val))}

  // Wastes performance on double scalar check, TODO tune.
  strOpt(val) {
    if (l.isNil(val) || (this.lax && !l.isScalar(val))) return undefined
    return l.render(val)
  }

  reqTag(val) {return reqTag(val)}
  reqAttr(val) {return reqAttr(val)}

  /*
  All renderers have access to these HTML special cases, but not all renderers
  actually use them. May revise in the future.
  */
  isBool(key) {return BOOL_ATTRS.has(key)}
  isVoid(tag) {return VOID_ELEMS.has(tag)}

  voidErr(tag, chi) {
    return SyntaxError(`expected void element ${l.show(tag)} to have no children, got ${l.show(chi)}`)
  }

  get e() {return this[eKey] || (this[eKey] = new Proxy(this, new this.EPh()))}
  get en() {return this[enKey] || (this[enKey] = new Proxy(this, new this.EnPh()))}
  get EPh() {return EPh}
  get EnPh() {return EnPh}
}

const eKey = Symbol.for(`e`)
const enKey = Symbol.for(`en`)

export class CachePh extends Map {
  get(tar, key) {
    if (!super.has(key)) super.set(key, this.make(tar, key))
    return super.get(key)
  }

  has() {return false}
  ownKeys() {return []}
  make() {}
}

// Short for "E-binding proxy handler". Needs a better name.
export class EPh extends CachePh {
  make(tar, key) {return tar.E.bind(tar, key)}
}

// Short for "E-no-props-binding proxy handler". Needs a better name.
export class EnPh extends CachePh {
  make(tar, key) {return tar.E.bind(tar, key, undefined)}
}

export function isRaw(val) {return l.isInst(val, Raw)}
export function reqRaw(val) {return l.req(val, isRaw)}

/*
Marks "raw text" which shouldn't be escaped. In DOM rendering, this is included
as `.innerHTML`. In string rendering, this is included as-is.
*/
export class Raw extends String {
  constructor(val) {super(l.laxStr(val))}
}

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
    this[froKey] = false
  }

  get $() {return this[refKey]}

  has(key) {return key in this[refKey]}
  get(key) {return this[refKey] ? this[refKey][l.reqStr(key)] : undefined}

  set(key, val) {
    const self = this.mutable()
    return self.$[l.reqStr(key)] = val, self
  }

  /*
  The names of the following methods match 1-1 with known properties
  or attributes. For "custom" shortcuts, see below.
  */
  button() {return this.type(`button`)}
  charset(val) {return this.set(`charset`, val)}
  checked(val) {return this.set(`checked`, !!val)}
  class(val) {return this.set(`class`, val)}
  content(val) {return this.set(`content`, val)}
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
  cls(val) {return this.set(`class`, spaced(this.get(`class`), val))}
  submit() {return this.type(`submit`)} // Collides with <form> method.
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

  frozen() {return this[froKey] = true, this}
  snapshot(val) {return this.with(val).frozen()}
  mutable() {return this.mutableOuter().mutableInner()}
  mutableOuter() {return this[froKey] ? new this.constructor().mut(this.$) : this}
  mutableInner() {return (!this[refKey] && (this[refKey] = new l.Emp())), this}

  static of(val) {
    if (l.isNil(val)) return new this()
    if (l.reqObj(val) instanceof this) return val
    return new this(val)
  }
}

const refKey = Symbol.for(`$`)
const froKey = Symbol.for(`frozen`)

/*
Short for "attributes". Abbreviated for frequent use. This is a static instance,
considered "immutable". Any "mutating" method makes a new mutable instance.
Compare `P` which is a function.
*/
export const A = /* @__PURE__ */ new PropBui().frozen()

/*
Short for "props" or "props builder". Abbreviated for frequent use. Shortcut for
making or reusing a `PropBui` instance. Compare `A` which is a static instance.
*/
export function P(val) {return PropBui.of(val)}

export function optAt(key, val, fun) {
  if (l.isNil(val) || fun(val)) return val
  throw TypeError(`invalid property ${l.show(key)}: ` + l.msgType(val, l.showFunName(fun)))
}

/*
Should prevent accidental use of VERY invalid tag or attribute names,
without interfering with rare but valid cases such as non-ASCII XML.
This is relevant mostly for string rendering, but we also use this in
DOM rendering for consistency and easier shared testing.

References:

  https://www.w3.org/TR/html52/syntax.html#tag-name
  https://www.w3.org/TR/html52/infrastructure.html#alphanumeric-ascii-characters
  https://www.w3.org/TR/html52/syntax.html#elements-attributes

TODO profile and optimize. Might be one of the bottlenecks in string rendering.
*/
export function isName(val) {return l.isStr(val) && /^[^\s<>/\\"]+$/.test(val)}

export function isTag(val) {return isName(val)}
export function reqTag(val) {return isTag(val) ? val : l.convFun(val, isTag)}

export function isAttr(val) {return isName(val)}
export function reqAttr(val) {return isAttr(val) ? val : l.convFun(val, isAttr)}

function spaced(one, two) {
  one = l.laxStr(one), two = l.laxStr(two)
  return one + (one && two && ` `) + two
}

function deref(val) {
  if (!l.optObj(val)) return val
  if (`$` in val) return val.$
  return val
}
