import * as l from './lang.mjs'
import * as o from './obj.mjs'
import * as dr from './dom_reg.mjs'
import * as p from './prax.mjs'
import * as u from './url.mjs'

/* Vars */

export const refKey = Symbol.for(`ref`)
export const dataKey = Symbol.for(`data`)
export const nameKey = Symbol.for(`name`)
export const valueKey = Symbol.for(`value`)
export const styleKey = Symbol.for(`style`)
export const doctypeKey = Symbol.for(`doctype`)
export const datasetKey = Symbol.for(`dataset`)
export const publicIdKey = Symbol.for(`publicId`)
export const systemIdKey = Symbol.for(`systemId`)
export const classListKey = Symbol.for(`classList`)
export const localNameKey = Symbol.for(`localName`)
export const attributesKey = Symbol.for(`attributes`)
export const parentNodeKey = Symbol.for(`parentNode`)
export const childNodesKey = Symbol.for(`childNodes`)
export const namespaceURIKey = Symbol.for(`namespaceURI`)
export const ownerDocumentKey = Symbol.for(`ownerDocument`)
export const implementationKey = Symbol.for(`implementation`)
export const documentElementKey = Symbol.for(`documentElement`)

/* Interfaces */

export function isChildNode(val) {return l.hasIn(val, `parentNode`)}
export function reqChildNode(val) {return l.req(val, isChildNode)}
export function optChildNode(val) {return l.opt(val, isChildNode)}

export function isParentNode(val) {return l.hasIn(val, `childNodes`)}
export function reqParentNode(val) {return l.req(val, isParentNode)}
export function optParentNode(val) {return l.opt(val, isParentNode)}

export function isElement(val) {return hasNodeType(val, Node.ELEMENT_NODE)}
export function reqElement(val) {return l.req(val, isElement)}
export function optElement(val) {return l.opt(val, isElement)}

export function isAttr(val) {return hasNodeType(val, Node.ATTRIBUTE_NODE)}
export function reqAttr(val) {return l.req(val, isAttr)}
export function optAttr(val) {return l.opt(val, isAttr)}

export function isText(val) {return hasNodeType(val, Node.TEXT_NODE)}
export function reqText(val) {return l.req(val, isText)}
export function optText(val) {return l.opt(val, isText)}

export function isComment(val) {return hasNodeType(val, Node.COMMENT_NODE)}
export function reqComment(val) {return l.req(val, isComment)}
export function optComment(val) {return l.opt(val, isComment)}

export function isDocument(val) {return hasNodeType(val, Node.DOCUMENT_NODE)}
export function reqDocument(val) {return l.req(val, isDocument)}
export function optDocument(val) {return l.opt(val, isDocument)}

export function isDocumentType(val) {return hasNodeType(val, Node.DOCUMENT_TYPE_NODE)}
export function reqDocumentType(val) {return l.req(val, isDocumentType)}
export function optDocumentType(val) {return l.opt(val, isDocumentType)}

export function isFragment(val) {return hasNodeType(val, Node.DOCUMENT_FRAGMENT_NODE)}
export function reqFragment(val) {return l.req(val, isFragment)}
export function optFragment(val) {return l.opt(val, isFragment)}

export function isDomImpl(val) {return l.hasMeth(val, `createDocument`)}
export function reqDomImpl(val) {return l.req(val, isDomImpl)}
export function optDomImpl(val) {return l.opt(val, isDomImpl)}

/* Standard classes */

export class Node extends l.Emp {
  /* Standard behaviors. */

  static get ELEMENT_NODE() {return 1}
  static get ATTRIBUTE_NODE() {return 2}
  static get TEXT_NODE() {return 3}
  static get CDATA_SECTION_NODE() {return 4}
  static get ENTITY_REFERENCE_NODE() {return 5}
  static get ENTITY_NODE() {return 6}
  static get PROCESSING_INSTRUCTION_NODE() {return 7}
  static get COMMENT_NODE() {return 8}
  static get DOCUMENT_NODE() {return 9}
  static get DOCUMENT_TYPE_NODE() {return 10}
  static get DOCUMENT_FRAGMENT_NODE() {return 11}
  static get NOTATION_NODE() {return 12}

  static get DOCUMENT_POSITION_DISCONNECTED() {return 1}
  static get DOCUMENT_POSITION_PRECEDING() {return 2}
  static get DOCUMENT_POSITION_FOLLOWING() {return 4}
  static get DOCUMENT_POSITION_CONTAINS() {return 8}
  static get DOCUMENT_POSITION_CONTAINED_BY() {return 16}
  static get DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC() {return 32}

  get [Symbol.toStringTag]() {return this.constructor.name}
  get isConnected() {return isDocument(this.getRootNode())}
  get parentElement() {return norm(l.only(this.parentNode, isElement))}
  get childNodes() {return this[childNodesKey] || (this[childNodesKey] = this.NodeList())}
  set childNodes(val) {this[childNodesKey] = l.reqArr(val)}
  get firstChild() {return norm(head(this[childNodesKey]))}
  get lastChild() {return norm(last(this[childNodesKey]))}
  get previousSibling() {return this.siblingAt(-1)}
  get nextSibling() {return this.siblingAt(1)}
  get ownerDocument() {return norm(this[ownerDocumentKey])}
  set ownerDocument(val) {this[ownerDocumentKey] = optDocument(val)}
  get nodeName() {return null}
  get nodeType() {return null}
  get nodeValue() {return null}
  get parentNode() {return norm(this[parentNodeKey])}
  set parentNode(val) {this[parentNodeKey] = val}

  getRootNode() {
    const val = this.parentNode
    if (!val) return this
    if (`getRootNode` in val) return val.getRootNode()
    return val
  }

  hasChildNodes() {return !!this[childNodesKey]?.length}

  contains(val) {return !!this[childNodesKey]?.includes(val)}

  /*
  Intentional deviation: we append fragments like they were normal nodes,
  instead of stealing children. This is far simpler, more efficient,
  and serves our purposes well enough. When traversing children for
  serialization, we treat fragments as arrays of children, which we
  also traverse recursively.
  */
  appendChild(val) {
    remove(val)
    this.childNodes.push(val)
    adopt(val, this)
    return val
  }

  /*
  Intentional deviation: attempting to remove a missing child doesn't throw,
  but simply returns the missing node.
  */
  removeChild(val) {
    const nodes = this.childNodes
    const ind = indexOf(nodes, val)
    if (!(ind >= 0)) return val

    nodes.splice(ind, 1)
    adopt(val, null)
    return val
  }

  replaceChild(next, prev) {
    if (l.is(next, prev)) return prev

    // May shift our children, must run first.
    remove(next)

    const nodes = this.childNodes
    const ind = indexOf(nodes, prev)
    if (!(ind >= 0)) {
      throw Error(`unable to replace missing child ${l.show(prev)}`)
    }

    nodes[ind] = null
    adopt(prev, null)

    nodes[ind] = next
    adopt(next, this)
    return prev
  }

  insertBefore(next, prev) {
    if (l.isNil(prev)) return this.appendChild(next)

    const nodes = this.childNodes
    const ind = indexOf(nodes, prev)
    if (!(ind >= 0)) {
      throw Error(`unable to insert before missing child ${l.show(prev)}`)
    }

    remove(next)
    nodes.splice(ind, 0, next)
    adopt(next, this)
    return next
  }

  append(...val) {val.forEach(this.appendChild, this)}

  remove() {
    const par = this.parentNode
    if (l.hasIn(par, `removeChild`)) par.removeChild(this)
    if (this[parentNodeKey]) this.parentNode = null
  }

  /* Non-standard extensions. */

  /*
  TODO: use a structure with good combinatorial complexity for all relevant
  operations: push/pop/unshift/shift/splice. JS arrays have decent pop/push.
  At small sizes, they may also outperform other structures on
  shift/unshift/splice. However, at large sizes, their shift/unshift/splice
  can be horrendous.
  */
  NodeList() {return []}

  siblingAt(shift) {
    l.reqInt(shift)

    const nodes = this.parentNode?.childNodes
    if (!nodes) return null

    const ind = indexOf(nodes, this)
    return ind >= 0 ? norm(nodes[ind + shift]) : null
  }

  owned(doc) {return this[ownerDocumentKey] = doc, this}
}

// Non-standard.
export class Textable extends Node {
  get textContent() {return this.foldTextContent(``, this[childNodesKey])}

  set textContent(val) {
    val = l.renderLax(val)
    const nodes = this.childNodes
    nodes.length = 0
    if (val) nodes.push(val)
  }

  // Non-standard.
  foldTextContent(acc, val) {
    if (l.isNil(val) || isComment(val)) return acc
    if (l.isScalar(val)) return acc + l.render(val)
    if (`textContent` in val) return acc + l.laxStr(val.textContent)
    if (isFragment(val)) return this.foldTextContent(acc, val.childNodes)
    if (p.isSeq(val)) for (val of val) acc = this.foldTextContent(acc, val)
    return acc
  }
}

export class DocumentFragment extends Textable {
  get nodeType() {return Node.DOCUMENT_FRAGMENT_NODE}
  get nodeName() {return `#document-fragment`}
}

// Non-standard.
export class Void extends Node {
  appendChild() {throw errIllegal()}
  removeChild() {throw errIllegal()}
  replaceChild() {throw errIllegal()}
  insertBefore() {throw errIllegal()}
  append() {throw errIllegal()}
}

// Non-standard.
export class Data extends Void {
  constructor(val) {super().data = val}
  get data() {return l.laxStr(this[dataKey])}
  set data(val) {this[dataKey] = l.renderLax(val)}
}

export class CharacterData extends Data {
  get textContent() {return this.data}
  set textContent(val) {this.data = val}
  get nodeValue() {return this.data}
  set nodeValue(val) {this.data = val}
  get length() {return this.data.length}

  appendChild() {throw errIllegal()}
  removeChild() {throw errIllegal()}
  replaceChild() {throw errIllegal()}
  insertBefore() {throw errIllegal()}
  append() {throw errIllegal()}
}

export class Text extends CharacterData {
  get nodeType() {return Node.TEXT_NODE}
  get nodeName() {return `#text`}
  get outerHTML() {return escapeText(this.data)}
  toJSON() {return this.outerHTML}
}

export class Comment extends CharacterData {
  get nodeType() {return Node.COMMENT_NODE}
  get nodeName() {return `#comment`}
  get outerHTML() {return `<!--` + escapeText(this.data) + `-->`}
  toJSON() {return this.outerHTML}
}

/*
Note: `.parentNode` must be `NamedNodeMap`, otherwise reading and setting the
value doesn't work. As a result, `document.createAttribute` is currently not
fully implemented because the resulting attribute is not linked to a map.
*/
export class Attr extends Node {
  constructor(key) {super()[nameKey] = l.reqStr(key)}

  get name() {return this[nameKey]}
  get value() {return l.laxStr(this.parentNode.get(this.name))}
  set value(val) {this.parentNode.set(this.name, l.render(val))}
  get nodeName() {return this.name}
  get nodeType() {return Node.ATTRIBUTE_NODE}
}

export class NamedNodeMap extends Map {
  /* Standard behaviors. */

  getNamedItem(key) {return this.has(key) ? this.Attr(key) : undefined}
  setNamedItem(val) {this.set(l.reqObj(val).name, val.value)}
  removeNamedItem(key) {this.delete(key)}

  // Extremely inefficient. Production code should never use this.
  *[Symbol.iterator]() {
    for (const key of this.keys()) yield this.getNamedItem(key)
  }

  /* Non-standard extensions. */

  get(key) {return norm(super.get(key))}
  set(key, val) {return super.set(l.reqStr(key), l.render(val))}

  Attr(key) {
    const tar = new Attr(key)
    tar.parentNode = this
    return tar
  }

  toString() {
    let out = ``
    for (const [key, val] of this.entries()) {
      out += this.constructor.attr(key, val)
    }
    return out
  }

  static attr(key, val) {
    if (!key) return ``
    return ` ` + l.reqStr(key) + `="` + escapeAttr(val) + `"`
  }
}

export class Element extends Textable {
  /* Standard behaviors. */

  get nodeType() {return Node.ELEMENT_NODE}

  /*
  A `localName` can be acquired in multiple ways.

  When creating an element via `document.createElement` or
  `document.createElementNS`, the DOM implementation determines which class to
  use, makes an instance, and assigns the given local name to the instance. One
  class, such as `HTMLElement`, may be used with multiple different local
  names. In a native DOM API, built-in element classes can't be instantiated
  via `new`, as there is no 1-1 mapping from classes to local names.

  Custom elements work differently. Any element class registered via
  `customElements` acquires a local name and its own custom name.
  In "autonomous" custom elements, local name and custom name are identical,
  and custom name doesn't need to be serialized. In "customized built-in"
  custom elements, the names are distinct, and custom name must be serialized
  via the "is" attribute. Unlike built-in elements, registered custom elements
  can be instantiated via `new`. Instantiating them via
  `document.createElement` also works. In either case, the resulting instance
  knows its local name and custom name, and can be correctly serialized.

  Our `dom_reg` assigns `localName` and `customName` to each registered class, as
  static properties. Our shim classes rely on these properties.
  */
  get localName() {return norm(this[localNameKey] ?? this.constructor.localName)}
  set localName(val) {this[localNameKey] = l.optStr(val)}

  get tagName() {return norm(this.localName?.toUpperCase())}

  get namespaceURI() {return norm(this[namespaceURIKey])}
  set namespaceURI(val) {this[namespaceURIKey] = l.optStr(val)}

  get parentNode() {return super.parentNode}

  set parentNode(val) {
    const con = `connectedCallback` in this
    const dis = `disconnectedCallback` in this

    if (!con && !dis) {
      super.parentNode = val
      return
    }

    const was = this.isConnected
    super.parentNode = val
    if (!was && con && this.isConnected) this.connectedCallback()
    else if (was && dis && !this.isConnected) this.disconnectedCallback()
  }

  get children() {return this[childNodesKey]?.filter(isElement) || []}
  get attributes() {return this[attributesKey] || (this[attributesKey] = this.Attributes())}

  get id() {return l.laxStr(this.getAttribute(`id`))}
  set id(val) {this.setAttribute(`id`, val)}

  get style() {return (this[styleKey] || (this[styleKey] = this.Style())).pro}

  set style(val) {
    if (l.isNil(val)) {
      this.removeAttribute(`style`)
      return
    }

    if (l.isStr(val)) {
      this.setAttribute(`style`, val)
      return
    }

    if (l.isStruct(val)) {
      this[styleKey] = val
      this.removeAttribute(`style`)
      return
    }

    this.style = l.render(val)
  }

  get dataset() {return (this[datasetKey] || (this[datasetKey] = this.Dataset())).pro}
  get className() {return l.laxStr(this.getAttribute(`class`))}
  set className(val) {this.setAttribute(`class`, val)}
  get classList() {return this[classListKey] || (this[classListKey] = this.ClassList())}

  get hidden() {return this.hasAttribute(`hidden`)}
  set hidden(val) {this.toggleAttribute(`hidden`, l.laxBool(val))}

  // TODO: default -1 for non-interactive elements.
  get tabIndex() {return this.getAttribute(`tabindex`) | 0}

  set tabIndex(val) {
    this.setAttribute(`tabindex`, (l.isNum(val) ? val : l.render(val)) | 0)
  }

  get innerHTML() {return this.foldInnerHTML(``, this[childNodesKey])}

  /*
  Known limitation: the resulting element has incorrect `.textContent` because
  we don't parse the given HTML.
  */
  set innerHTML(val) {
    val = l.render(val)
    const nodes = this.childNodes
    nodes.length = 0
    if (val) nodes.push(new p.Raw(val))
  }

  get outerHTML() {
    if (outerHtmlDyn.has()) return this.outerHtml()

    outerHtmlDyn.set(this)
    try {return this.outerHtml()}
    finally {outerHtmlDyn.set()}
  }

  hasAttribute(key) {return !!this[attributesKey]?.has(key)}

  getAttribute(key) {return norm(this[attributesKey]?.get(key))}

  removeAttribute(key) {
    this[attributesKey]?.delete(key)

    if (this.isStyleChange(key)) {
      this[styleKey] = undefined
    }
    else if (this.isDatasetChange(key)) {
      this[datasetKey]?.attrDel(key)
    }
  }

  setAttribute(key, val) {
    val = l.render(val)
    this.attributes.set(key, val)

    if (this.isStyleChange(key)) {
      this[styleKey]?.dec()
    }
    else if (this.isDatasetChange(key)) {
      this[datasetKey]?.attrSet(key, val)
    }
  }

  toggleAttribute(key, force) {
    if (l.optBool(force) || (l.isNil(force) && !this.hasAttribute(key))) {
      this.setAttribute(key, ``)
      return true
    }
    this.removeAttribute(key)
    return false
  }

  /* Non-standard extensions. */

  Style() {return new StylePh(this)}
  Dataset() {return new DatasetPh(this)}
  ClassList() {return new ClassList(this)}
  Attributes() {return new NamedNodeMap()}

  toJSON() {return this.outerHTML}

  // See explanation on `localName` getter.
  get customName() {return this.constructor.customName}

  attrSet(key, val) {
    if (l.isNil(val)) this.removeAttribute(key)
    else this.setAttribute(key, val)
  }

  isStyleChange(key) {return key === `style` && styleKey in this}

  isDatasetChange(key) {return key.startsWith(`data-`) && datasetKey in this}

  outerHtml() {
    const tag = this.tagString()
    if (!tag) throw Error(`missing localName`)

    return (
      `<` + tag + this.attrPrefix() + this.attrString() + `>` +
      l.laxStr(this.innerHTML) +
      `</` + tag + `>`
    )
  }

  foldInnerHTML(acc, val) {
    if (l.isNil(val)) return acc
    if (p.isRaw(val)) return acc + l.laxStr(val.outerHTML)
    if (l.isScalar(val)) return acc + escapeText(l.render(val))
    if (isFragment(val)) return this.foldInnerHTML(acc, val.childNodes)
    if (p.isSeq(val)) for (val of val) acc = this.foldInnerHTML(acc, val)
    return acc
  }

  isVoid() {return p.VOID.has(this.localName)}

  tagString() {return l.laxStr(this.localName)}

  attrString() {return l.laxStr(this[attributesKey]?.toString())}

  attrPrefix() {return this.attrIs() + this.attrXmlns()}

  attrIs() {
    const is = this.customName
    if (!is || is === this.localName || this[attributesKey]?.has(`is`)) return ``
    return NamedNodeMap.attr(`is`, is)
  }

  attrXmlns() {
    if (this[attributesKey]?.has(`xmlns`)) return ``

    const chiNs = this[namespaceURIKey]
    if (!chiNs) return ``

    const doc = this[ownerDocumentKey]
    if (isHtmlDoc(doc)) return ``

    const parNs = l.get(this.parentNode, `namespaceURI`)
    if (parNs && parNs !== chiNs) return NamedNodeMap.attr(`xmlns`, chiNs)

    if (outerHtmlDyn.get() !== this) return ``
    return NamedNodeMap.attr(`xmlns`, chiNs)
  }
}

export class HTMLElement extends Element {
  get namespaceURI() {return super.namespaceURI || p.nsHtml}
  set namespaceURI(val) {super.namespaceURI = val}

  outerHtml() {
    if (this.isVoid()) {
      if (this.innerHTML) {
        throw Error(`unexpected innerHTML in void element ${this.localName}`)
      }
      return `<` + this.tagString() + this.attrPrefix() + this.attrString() + ` />`
    }
    return super.outerHtml()
  }
}

export class HTMLMetaElement extends HTMLElement {
  get httpEquiv() {return this.getAttribute(`http-equiv`)}
  set httpEquiv(val) {this.attrSet(`http-equiv`, val)}
}

export class HTMLAnchorElement extends HTMLElement {
  get protocol() {return u.url(this.href).protocol}
  get origin() {return u.url(this.href).origin}
  get username() {return u.url(this.href).username}
  get password() {return u.url(this.href).password}
  get hostname() {return u.url(this.href).hostname}
  get host() {return u.url(this.href).host}
  get port() {return u.url(this.href).port}
  get pathname() {return u.url(this.href).pathname}
  get search() {return u.url(this.href).search}
  get hash() {return u.url(this.href).hash}

  get href() {return l.laxStr(this.getAttribute(`href`))}
  set href(val) {this.setAttribute(`href`, val)}

  get target() {return l.laxStr(this.getAttribute(`target`))}
  set target(val) {this.setAttribute(`target`, val)}

  get rel() {return l.laxStr(this.getAttribute(`rel`))}
  set rel(val) {this.setAttribute(`rel`, val)}
}

class ToggleElement extends HTMLElement {
  get disabled() {return this.hasAttribute(`disabled`)}
  set disabled(val) {this.toggleAttribute(`disabled`, l.laxBool(val))}
}

export class HTMLButtonElement extends ToggleElement {}

class TextInputElement extends ToggleElement {
  get name() {return l.laxStr(this.getAttribute(`name`))}
  set name(val) {this.setAttribute(`name`, val)}

  get type() {return l.laxStr(this.getAttribute(`type`))}
  set type(val) {this.setAttribute(`type`, val)}

  get value() {return l.laxStr(this.getAttribute(`value`))}
  set value(val) {this.setAttribute(`value`, val)}

  get required() {return this.hasAttribute(`required`)}
  set required(val) {this.toggleAttribute(`required`, l.laxBool(val))}

  get checked() {return this.hasAttribute(`checked`)}
  set checked(val) {this.toggleAttribute(`checked`, l.laxBool(val))}

  get readOnly() {return this.hasAttribute(`readonly`)}
  set readOnly(val) {this.toggleAttribute(`readonly`, l.laxBool(val))}
}

export class HTMLInputElement extends TextInputElement {
  // Match bizarre standard behavior.
  get value() {
    if (this.type === `checkbox` && !this.hasAttribute(`value`)) return `on`
    return super.value
  }
  set value(val) {this.setAttribute(`value`, val)}

  get multiple() {return this.hasAttribute(`multiple`)}
  set multiple(val) {this.toggleAttribute(`multiple`, l.laxBool(val))}
}

export class HTMLTextAreaElement extends TextInputElement {}

export class HTMLScriptElement extends HTMLElement {
  /*
  Difference from all other elements: inner text is not escaped. We have to
  duplicate the special case for `isRaw` because it has precedence over scalars.
  */
  foldInnerHTML(acc, val) {
    if (isText(val)) return acc + l.laxStr(val.textContent)
    if (p.isRaw(val)) return acc + l.laxStr(val.outerHTML)
    if (l.isScalar(val)) return acc + l.render(val)
    return super.foldInnerHTML(acc, val)
  }
}

/*
Has various deviations from the standard. For example, in a standard
`SVGElement`, the property `.className` is an object rather than a string.
Our implementation doesn't support any of that for now.
*/
export class SVGElement extends Element {
  get namespaceURI() {return super.namespaceURI || p.nsSvg}
  set namespaceURI(val) {super.namespaceURI = val}
}

export class DocumentType extends Node {
  constructor(name, pub, sys) {
    super()
    this.name = l.reqStr(name)
    this.publicId = pub
    this.systemId = sys
  }

  get nodeType() {return Node.DOCUMENT_TYPE_NODE}
  get nodeName() {return this.name}

  get name() {return this[nameKey]}
  set name(val) {this[nameKey] = l.optStr(val)}

  get publicId() {return l.laxStr(this[publicIdKey])}
  set publicId(val) {this[publicIdKey] = l.optStr(val)}

  get systemId() {return l.laxStr(this[systemIdKey])}
  set systemId(val) {this[systemIdKey] = l.optStr(val)}

  get outerHTML() {return `<!doctype ${l.reqStr(this.name)}>`}
}

export class Document extends Node {
  /* Standard behaviors. */

  get nodeType() {return Node.DOCUMENT_NODE}
  get nodeName() {return `#document`}

  get implementation() {return this[implementationKey]}
  set implementation(val) {this[implementationKey] = optDomImpl(val)}

  get childNodes() {return [this.doctype, this.documentElement].filter(l.id)}

  get doctype() {return norm(this[doctypeKey])}

  set doctype(val) {
    if ((this[doctypeKey] = optDocumentType(val))) {
      remove(val)
      adopt(val, this)
      val.ownerDocument = this
    }
  }

  get documentElement() {return norm(this[documentElementKey])}

  set documentElement(val) {
    if ((this[documentElementKey] = optElement(val))) {
      remove(val)
      adopt(val, this)
      val.ownerDocument = this
    }
  }

  get head() {return norm(this.documentElement?.childNodes?.find(isHead))}
  set head(val) {this.documentElement?.replaceChild(val, this.head)}

  get body() {return norm(this.documentElement?.childNodes?.find(isBody))}
  set body(val) {this.documentElement?.replaceChild(val, this.body)}

  get title() {return l.laxStr(this.titleNode()?.textContent)}

  set title(val) {
    const node = this.titleNode()
    if (node) node.textContent = l.render(val)
  }

  createAttribute(key) {return new Attr(key).owned(this)}

  createAttributeNS(ns, key) {
    l.reqStr(ns)
    const tar = this.createAttribute(key)
    if (ns !== this.namespaceURI) tar.namespaceURI = ns
    return tar
  }

  createDocumentFragment() {return new DocumentFragment().owned(this)}
  createTextNode(val) {return new Text(val).owned(this)}
  createComment(val) {return new Comment(val).owned(this)}

  createElement(localName, opt) {
    l.reqStr(localName)

    const is = l.optStr(l.get(opt, `is`))
    const cls = this.customElements.get(is || localName) || this.baseClassByTag(localName)
    const tar = new cls()

    tar.owned(this)
    tar.localName = localName
    if (is) tar.setAttribute(`is`, is)
    return tar
  }

  createElementNS(ns, localName) {
    l.reqStr(ns)
    l.reqStr(localName)

    const cls = this.baseClassByTag(localName)
    if (!cls) throw Error(`unable to find class for ${l.show(localName)}`)

    const tar = new cls()
    tar.owned(this)
    tar.localName = localName
    tar.namespaceURI = ns
    return tar
  }

  /* Non-standard extensions. */

  get customElements() {return this.implementation.customElements}
  titleNode() {return norm(this.head?.childNodes?.find(isTitle))}
  baseClassByTag() {return Element}
}

export class HTMLDocument extends Document {
  createElement(localName, opt) {
    const tar = super.createElement(localName, opt)
    tar.namespaceURI = p.nsHtml
    return tar
  }

  createElementNS(ns, localName, opt) {
    if (ns === p.nsHtml) return this.createElement(localName, opt)
    return super.createElementNS(ns, localName, opt)
  }

  baseClassByTag(tag) {
    return glob[l.reqStr(dr.TagToCls.main.get(tag) || `HTMLElement`)]
  }
}

export class DOMImplementation extends l.Emp {
  /* Standard behaviors. */

  createDocumentType(...val) {return new DocumentType(...val)}

  // Browser implementations appear to ignore the namespace.
  createDocument(_ns, name, typ) {
    const doc = new this.Document()
    doc.implementation = this
    if (optDocumentType(typ)) doc.doctype = typ
    if (l.laxStr(name)) doc.documentElement = doc.createElement(name)
    return doc
  }

  createHTMLDocument(title) {
    const doc = new this.HTMLDocument()
    doc.implementation = this
    doc.doctype = this.createDocumentType(`html`, ``, ``)
    doc.documentElement = doc.createElement(`html`)
    doc.documentElement.appendChild(doc.createElement(`head`))
    doc.documentElement.appendChild(doc.createElement(`body`))
    if (l.isSome(title)) doc.title = title
    return doc
  }

  /* Non-standard extensions. */

  get Document() {return Document}
  get HTMLDocument() {return HTMLDocument}
  get customElements() {return dr.CustomElementRegistry.main}
}

/* Non-standard classes */

export class DictPh extends l.Emp {
  constructor(tar) {
    super()
    this.tar = l.reqInst(tar, Element)
    this.buf = l.npo()
    this.pro = new Proxy(this.buf, this)
    this.dec()
  }

  dec() {}
}

// Analogous to `CSSStyleDeclaration`.
export class StylePh extends DictPh {
  /* Proxy handler traps. */

  get(buf, key) {
    if (!l.isStr(key) || key === `constructor`) return undefined
    if (key === `cssText`) return l.laxStr(this.attrGet())
    return l.laxStr(buf[this.styleToCss(key)])
  }

  set(buf, key, val) {
    if (key === `cssText`) {
      this.attrSet(val)
      this.clear()
    }
    else {
      buf[this.styleToCss(key)] = l.render(val)
      this.enc()
    }
    return true
  }

  deleteProperty(buf, key) {
    if (!l.isStr(key)) return true
    key = this.styleToCss(key)
    if (key in buf) delete buf[key], this.enc()
    return true
  }

  /* Non-traps. */

  dec() {this.decode(this.attrGet())}
  enc() {this.attrSet(this.encode())}
  clear() {for (const key of l.structKeys(this.buf)) delete this.buf[key]}

  attrGet() {return this.tar[attributesKey]?.get(`style`)}

  attrSet(val) {
    if (!val && !this.tar.attributes.has(`style`)) return
    this.tar.attributes.set(`style`, val)
  }

  decode(src) {
    if (!src) return

    for (src of split(src.trim(), /;\s*/g)) {
      const ind = src.indexOf(`:`)
      if (!(ind >= 0)) continue

      const key = src.slice(0, ind)
      if (!key) continue

      const val = src.slice(ind + 1).trimStart()
      if (val) this.buf[key] = val
    }
  }

  encode() {
    const {buf} = this
    let out = ``
    for (const key of l.structKeys(buf)) out += this.encodePair(key, buf[key])
    return out.trim()
  }

  encodePair(key, val) {
    if (!key || !val) return ``
    return ` ` + l.reqStr(key) + `: ` + l.reqStr(val) + `;`
  }

  styleToCss(key) {return styleToCssCache.goc(key)}
}

class DatasetPh extends DictPh {
  /* Proxy handler traps. */

  set(buf, key, val) {
    l.reqStr(key)
    val = l.render(val)

    buf[key] = val
    this.tar.attributes.set(this.camelToData(key), val)

    return true
  }

  deleteProperty(buf, key) {
    l.reqStr(key)
    delete buf[key]
    this.tar.attributes.delete(this.camelToData(key))
    return true
  }

  /* Non-traps. */

  dec() {
    const src = this.tar[attributesKey]
    if (!src) return
    for (const [key, val] of src.entries()) this.attrSet(key, val)
  }

  attrSet(key, val) {
    key = this.dataToCamel(key)
    if (key) this.buf[key] = l.reqStr(val)
  }

  attrDel(key) {
    key = this.dataToCamel(key)
    if (key) delete this.buf[key]
  }

  camelToData(key) {return camelToDataCache.goc(key)}
  dataToCamel(key) {return dataToCamelCache.goc(key)}
}

/*
Analogous to `DOMTokenList` but specialized for class manipulation.
For technical reasons, this doesn't implement the normal JS "list interface".
It implements only the getters/setters/methods specific to `DOMTokenList`
and the various iterable interfaces.
*/
export class ClassList extends l.Emp {
  constructor(val) {super().ref = val}

  /* Standard behaviors. */

  get value() {return this.ref.className}
  set value(val) {this.ref.className = val}

  item(ind) {return ind >= 0 ? norm(this.toArray()[ind]) : null}

  contains(val) {return this.toArray().includes(val)}

  add(...val) {
    if (!val.length) return

    const arr = this.toArray(val)
    const len = arr.length

    for (val of val) {
      val = l.render(val)
      if (!arr.includes(val)) arr.push(val)
    }
    if (arr.length !== len) this.value = join(arr)
  }

  remove(...src) {
    if (!src.length) return
    this.value = join(this.toArray().filter(notIncludes, src))
  }

  replace(prev, next) {
    prev = l.render(prev)
    next = l.render(next)
    if (prev === next) return true

    const arr = this.toArray()
    const ind = arr.indexOf(prev)
    if (!(ind >= 0)) return false

    arr[ind] = next
    this.value = join(arr)
    return true
  }

  toggle(val, force) {
    if (l.optBool(force) || (l.isNil(force) && !this.contains(val))) {
      return this.add(val), true
    }
    return this.remove(val), false
  }

  toString() {return this.value}

  keys() {return this.toArray().keys()}
  values() {return this.toArray().values()}
  entries() {return this.toArray().entries()}
  forEach(...val) {return this.toArray().forEach(...val)}
  [Symbol.iterator]() {return this.values()}

  /* Non-standard extensions. */

  get ref() {return this[refKey]}
  set ref(val) {this[refKey] = reqElement(val)}
  toArray() {return split(this.value.trim(), /\s+/g)}
}

/* Namespaces */

import * as self from './dom_shim.mjs'

export class GlobPh extends o.MakerPh {
  make(key) {
    if (!l.isStr(key)) return undefined
    if (key in self) return self[key]

    const cls = this.base(key)
    if (!cls) return undefined

    return class Element extends cls {static get name() {return key}}
  }

  base(key) {
    if (!key.endsWith(`Element`)) return undefined
    if (key.startsWith(`HTML`)) return HTMLElement
    if (key.startsWith(`SVG`)) return SVGElement
    return Element
  }
}

export const glob = new Proxy(l.npo(), new GlobPh())
export const document = new DOMImplementation().createHTMLDocument()
export const customElements = document.customElements

export function auto() {
  if (isDocument(l.get(globalThis, `document`))) return globalThis
  return glob
}

/* Misc */

/*
https://www.w3.org/TR/html52/syntax.html#escaping-a-string

We don't need to escape other chars like `'` because we always generate
double-quoted attributes. Single quotes or angle brackets don't "break out".
*/
export function escapeAttr(val) {
  val = l.reqStr(val)
  const re = /[\u00a0&"]/g
  return re.test(val) ? val.replace(re, escapeChar) : val
}

/*
https://www.w3.org/TR/html52/syntax.html#escaping-a-string

We don't need to escape other chars like `'` because we don't interpolate
unknown text into unknown parts of unknown markup. We generate valid markup
and use precise contextual escaping in the right places.
*/
export function escapeText(src) {
  src = l.laxStr(src)
  const re = /[\u00a0&<>]/g
  return re.test(src) ? src.replace(re, escapeChar) : src
}

// https://www.w3.org/TR/html52/syntax.html#escaping-a-string
export function escapeChar(char) {
  if (char === `&`) return `&amp;`
  if (char === `\u00a0`) return `&nbsp;`
  if (char === `"`) return `&quot;`
  if (char === `<`) return `&lt;`
  if (char === `>`) return `&gt;`
  return char
}

export function unescape(src) {
  return l.laxStr(src).replace(/&#(\d+);|&#x([\dA-Fa-f]+);|&(\w+);/ig, unescapeMatch)
}

export function unescapeMatch(str, dec, hex, exa) {
  if (dec) return fromCharCode(Number.parseInt(dec))
  if (hex) return fromCharCode(Number.parseInt(hex, 16))
  if (exa) {
    exa = exa.toLowerCase()
    if (exa === `lt`)   return `<`
    if (exa === `gt`)   return `>`
    if (exa === `amp`)  return `&`
    if (exa === `quot`) return `"`
    if (exa === `apos`) return `'`
    if (exa === `nbsp`) return `\u00a0`
  }
  return str
}

export const styleToCssCache = new class StyleKeys extends o.Cache {
  make(val) {return camelToKebab(val)}
}()

export const camelToDataCache = new class DataKeys extends o.Cache {
  make(val) {return camelToData(val)}
}()

export const dataToCamelCache = new class DataKeys extends o.Cache {
  make(val) {return dataToCamel(val)}
}()

export const outerHtmlDyn = new o.Dyn()

/* Internal */

function head(val) {return val?.[0]}
function last(val) {return val?.[val.length - 1]}
function hasNodeType(src, tar) {return l.get(src, `nodeType`) === tar}
function hasLocalName(src, tar) {return l.get(src, `localName`) === tar}
function errIllegal() {return TypeError(`illegal invocation`)}
function norm(val) {return val ?? null}
function notIncludes(val) {return !this.includes(val)}
function split(val, sep) {return l.laxStr(val) ? val.split(l.reqSome(sep)) : []}
function join(val) {return val.join(` `)}
function lower(val) {return val.toLowerCase()}
function isHead(val) {return isElement(val) && hasLocalName(val, `head`)}
function isBody(val) {return isElement(val) && hasLocalName(val, `body`)}
function isTitle(val) {return isElement(val) && hasLocalName(val, `title`)}
function isRemovable(val) {return l.hasIn(val, `remove`)}
function remove(val) {if (isRemovable(val)) val.remove()}
function fromCharCode(val) {return val ? String.fromCharCode(val) : ``}
function adopt(chi, par) {if (isChildNode(chi)) chi.parentNode = par}

/*
Reference:

  https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset#name_conversion

Suboptimal, should be cached.
*/
function camelToData(src) {
  l.reqStr(src)
  return `data-` + (/^[A-Z]/.test(src) ? `-` : ``) + camelToKebab(src)
}

// Suboptimal, should be cached.
function dataToCamel(src) {
  l.reqStr(src)

  const pre = `data-`
  if (!src.startsWith(pre)) return undefined

  const buf = src.slice(pre.length).split(`-`)
  let ind = 0
  while (++ind < buf.length) buf[ind] = title(buf[ind])
  return buf.join(``)
}

/*
Part of the dataset key algorithm. Seems to be okayish for CSS names,
but we may have to differentiate them later.

Suboptimal, should be cached.
*/
function camelToKebab(val) {return val.split(/(?=[A-Z])/g).map(lower).join(`-`)}

// Copied from `str.mjs` to avoid dependency.
function title(val) {
  val = lower(val)
  if (!val.length) return val
  return val[0].toUpperCase() + val.slice(1)
}

// Difference from `Array.prototype.indexOf`: supports `NaN`.
function indexOf(src, val) {
  l.reqArr(src)
  const len = src.length
  let ind = -1
  while (++ind < len) if (l.is(src[ind], val)) return ind
  return -1
}

/*
Questionable, TODO improve. Unable to use `.namespaceURI` because the `Document`
interface doesn't implement this, or expose the namespace in any other way.
*/
function isHtmlDoc(doc) {return l.isInst(doc, HTMLDocument)}
