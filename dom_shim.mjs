import * as l from './lang.mjs'
import * as o from './obj.mjs'
import * as dr from './dom_reg.mjs'
import * as p from './prax.mjs'
import * as u from './url.mjs'
import * as s from './str.mjs'
import * as c from './coll.mjs'
import * as ds from './dom_shim.mjs'

/* Vars */

export const REF = Symbol.for(`ref`)
export const DATA = Symbol.for(`data`)
export const NAME = Symbol.for(`name`)
export const VALUE = Symbol.for(`value`)
export const STYLE = Symbol.for(`style`)
export const DOCTYPE = Symbol.for(`doctype`)
export const DATASET = Symbol.for(`dataset`)
export const PUBLIC_ID = Symbol.for(`publicId`)
export const SYSTEM_ID = Symbol.for(`systemId`)
export const CLASS_LIST = Symbol.for(`classList`)
export const LOCAL_NAME = Symbol.for(`localName`)
export const ATTRIBUTES = Symbol.for(`attributes`)
export const PARENT_NODE = Symbol.for(`parentNode`)
export const CHILD_NODES = Symbol.for(`childNodes`)
export const NAMESPACE_URI = Symbol.for(`namespaceURI`)
export const OWNER_DOCUMENT = Symbol.for(`ownerDocument`)
export const IMPLEMENTATION = Symbol.for(`implementation`)
export const DOCUMENT_ELEMENT = Symbol.for(`documentElement`)

/* Interfaces */

/*
TODO fully consolidate these with `dom.mjs`.
(We're trying to avoid unnecessary imports.)
*/

export function isChildNode(val) {return l.isObj(val) && `parentNode` in val}
export function reqChildNode(val) {return l.req(val, isChildNode)}
export function optChildNode(val) {return l.opt(val, isChildNode)}

export function isParentNode(val) {return l.isObj(val) && `childNodes` in val}
export function reqParentNode(val) {return l.req(val, isParentNode)}
export function optParentNode(val) {return l.opt(val, isParentNode)}

export function isNode(val) {return l.isObj(val) && `nodeType` in val}
export function reqNode(val) {return l.req(val, isNode)}
export function optNode(val) {return l.opt(val, isNode)}

export function isElement(val) {return l.isObj(val) && val.nodeType === Node.ELEMENT_NODE}
export function reqElement(val) {return l.req(val, isElement)}
export function optElement(val) {return l.opt(val, isElement)}

export function isAttr(val) {return l.isObj(val) && val.nodeType === Node.ATTRIBUTE_NODE}
export function reqAttr(val) {return l.req(val, isAttr)}
export function optAttr(val) {return l.opt(val, isAttr)}

export function isText(val) {return l.isObj(val) && val.nodeType === Node.TEXT_NODE}
export function reqText(val) {return l.req(val, isText)}
export function optText(val) {return l.opt(val, isText)}

export function isComment(val) {return l.isObj(val) && val.nodeType === Node.COMMENT_NODE}
export function reqComment(val) {return l.req(val, isComment)}
export function optComment(val) {return l.opt(val, isComment)}

export function isDocument(val) {return l.isObj(val) && val.nodeType === Node.DOCUMENT_NODE}
export function reqDocument(val) {return l.req(val, isDocument)}
export function optDocument(val) {return l.opt(val, isDocument)}

export function isDocumentType(val) {return l.isObj(val) && val.nodeType === Node.DOCUMENT_TYPE_NODE}
export function reqDocumentType(val) {return l.req(val, isDocumentType)}
export function optDocumentType(val) {return l.opt(val, isDocumentType)}

export function isFragment(val) {return l.isObj(val) && val.nodeType === Node.DOCUMENT_FRAGMENT_NODE}
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
  get childNodes() {return this[CHILD_NODES] ||= this.NodeList()}
  set childNodes(val) {this[CHILD_NODES] = l.reqArr(val)}
  get firstChild() {return norm(head(this[CHILD_NODES]))}
  get lastChild() {return norm(last(this[CHILD_NODES]))}
  get previousSibling() {return this.siblingAt(-1)}
  get nextSibling() {return this.siblingAt(1)}
  get ownerDocument() {return norm(this[OWNER_DOCUMENT])}
  set ownerDocument(val) {this[OWNER_DOCUMENT] = optDocument(val)}
  get nodeName() {return null}
  get nodeType() {return null}
  get nodeValue() {return null}
  get parentNode() {return norm(this[PARENT_NODE])}
  set parentNode(val) {this[PARENT_NODE] = val}

  get textContent() {
    return l.laxStr(this[CHILD_NODES]?.reduce(appendTextContent, ``))
  }

  set textContent(val) {
    val = l.render(val)
    const nodes = this.childNodes
    nodes.length = 0
    if (val) nodes.push(val)
  }

  getRootNode() {
    const val = this.parentNode
    if (!l.isObj(val)) return this
    if (`getRootNode` in val) return val.getRootNode()
    return val
  }

  hasChildNodes() {return !!this[CHILD_NODES]?.length}

  contains(val) {return !!this[CHILD_NODES]?.includes(val)}

  remove() {
    const par = this.parentNode
    if (l.isObj(par) && `removeChild` in par) par.removeChild(this)
    if (par) this.parentNode = null
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

  /*
  All our node-inserting methods have one notable deviation from the standard:
  we append fragments like they were normal nodes, instead of stealing their
  children. This is simpler, more performant, and serves our purposes well
  enough. When traversing children for serialization, we treat fragments as
  arrays of children, which we also traverse recursively.
  */
  appendChild(val) {
    reqNode(val)
    remove(val)
    this.childNodes.push(val)
    adopt(val, this)
    return val
  }

  replaceChild(next, prev) {
    if (l.is(next, prev)) return prev
    reqNode(next)

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
    reqNode(next)

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

  append(...val) {for (val of val) this.appendChild(this.valToNode(val))}

  prepend(...src) {
    for (const val of src) remove(val)
    src = src.map(this.valToNode, this)
    this.childNodes.unshift(...src)
    for (const val of src) adopt(val, this)
  }

  after(...src) {
    const par = this.parentNode
    if (!par) return

    const nodes = par.childNodes
    let ind = indexOf(nodes, this)
    if (!(ind >= 0)) return

    let cur = this
    for (src of src) {
      remove(src)

      /*
      This code assumes that the DOM tree does not include elements with a
      mischievous `.disconnectedCallback` with strange side effects like
      removing our cursor from the list or moving it forward in the list
      by prepending nodes. Handling would overcomplicate the algorithm.
      */
      if (src !== cur) {
        while (nodes[ind] !== cur && ind-- > 0) {}
        ind++
      }

      cur = par.valToNode(src)
      nodes.splice(ind, 0, cur)
      adopt(cur, par)
    }
  }

  /* Non-standard extensions. */

  /*
  TODO: use a structure with good combinatorial complexity for all relevant
  operations: push / pop / unshift / shift / splice. JS arrays have decent
  pop / push. At small sizes, they may also outperform other structures on
  shift / unshift / splice. However, at large sizes, their shift / unshift /
  splice can be horrendous. Benchmark first.
  */
  NodeList() {return []}

  siblingAt(off) {
    l.reqInt(off)

    const nodes = this.parentNode?.childNodes
    if (!nodes) return null

    const ind = indexOf(nodes, this)
    return ind >= 0 ? norm(nodes[ind + off]) : null
  }

  adoptDocument(doc) {return this[OWNER_DOCUMENT] = doc, this}

  valToNode(val) {
    if (!isNode(val)) val = new Text(val)
    this[OWNER_DOCUMENT]?.adoptNode(val)
    return val
  }
}

// Non-standard intermediary class for internal use.
export class ElementParent extends Node {
  get children() {return this[CHILD_NODES]?.filter(isElement) ?? []}
  get childElementCount() {return count(this[CHILD_NODES], isElement)}
  get firstElementChild() {return norm(this[CHILD_NODES]?.find(isElement))}
  get lastElementChild() {return norm(this[CHILD_NODES]?.findLast(isElement))}
}

export class DocumentFragment extends ElementParent {
  get nodeType() {return Node.DOCUMENT_FRAGMENT_NODE}
  get nodeName() {return `#document-fragment`}
}

export class CharacterData extends Node {
  constructor(val) {
    super()
    if (arguments.length) this.data = l.render(val)
  }

  get data() {return l.laxStr(this[DATA])}
  set data(val) {this[DATA] = l.render(val)}
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

// Non-standard class for internal use.
export class RawText extends CharacterData {
  get innerHTML() {return this.data}
  set innerHTML(val) {this.data = val}
  get outerHTML() {return this.data}
}

/*
Note: `.parentNode` must be `NamedNodeMap`, otherwise reading and setting the
value doesn't work. As a result, `document.createAttribute` is currently not
fully implemented because the resulting attribute is not linked to a map.
*/
export class Attr extends Node {
  constructor(key) {super()[NAME] = l.reqStr(key)}

  get name() {return this[NAME]}
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
  // In our rendering process, we simply iterate the map entries.
  *[Symbol.iterator]() {
    for (const key of this.keys()) yield this.getNamedItem(key)
  }

  /* Non-standard extensions. */

  get(key) {return norm(super.get(key))}
  set(key, val) {return super.set(l.render(key), l.render(val))}

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

export class Element extends ElementParent {
  /* Standard behaviors. */

  get nodeType() {return Node.ELEMENT_NODE}

  /*
  A `localName` can be acquired in multiple ways.

  When creating an element via `document.createElement` or
  `document.createElementNS`, the DOM implementation determines which class to
  use, makes an instance, and assigns the given local name to the instance.
  Instances of an element class, such as `HTMLElement`, may be created with
  different local names. In a native DOM API, built-in element classes can't
  be instantiated via `new`, as there is no 1-1 mapping from classes to local
  names.

  Custom elements work differently. Any element class registered via
  `customElements` acquires a local name and its own custom name.
  In "autonomous" custom elements, local name and custom name are identical,
  the custom name can be used
  and custom name doesn't need to be serialized. In "customized built-in"
  custom elements, the names are distinct, and custom name must be serialized
  via the "is" attribute. Unlike built-in elements, registered custom elements
  can be instantiated via `new`. Instantiating them via
  `document.createElement` also works. In either case, the resulting instance
  knows its local name and custom name, and can be correctly serialized.

  Our `dom_reg` assigns `localName` and `customName` to each registered class, as
  static properties. Our shim classes rely on these properties.
  */
  get localName() {return norm(this[LOCAL_NAME] ?? this.constructor.localName)}
  set localName(val) {this[LOCAL_NAME] = l.optStr(val)}

  get tagName() {return norm(this.localName?.toUpperCase())}

  get namespaceURI() {return norm(this[NAMESPACE_URI])}
  set namespaceURI(val) {this[NAMESPACE_URI] = l.optStr(val)}

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

  get attributes() {return this[ATTRIBUTES] ||= this.Attributes()}

  get id() {return l.laxStr(this.getAttribute(`id`))}
  set id(val) {this.setAttribute(`id`, val)}

  get style() {return (this[STYLE] ||= this.Style()).pro}

  set style(val) {
    if (l.isNil(val)) {
      this.removeAttribute(`style`)
      return
    }

    if (l.isStr(val)) {
      this.setAttribute(`style`, val)
      return
    }

    if (l.isRec(val)) {
      this[STYLE] = val
      this.removeAttribute(`style`)
      return
    }

    this.style = l.render(val)
  }

  get dataset() {return (this[DATASET] ||= this.Dataset()).pro}
  get className() {return l.laxStr(this.getAttribute(`class`))}
  set className(val) {this.setAttribute(`class`, val)}
  get classList() {return this[CLASS_LIST] ||= this.ClassList()}

  get hidden() {return this.hasAttribute(`hidden`)}
  set hidden(val) {this.toggleAttribute(`hidden`, l.laxBool(val))}

  // TODO: default -1 for non-interactive elements.
  get tabIndex() {return this.getAttribute(`tabindex`) | 0}

  // In the native DOM API, `.tabIndex = undefined` and `.tabIndex = null`
  // actually make it 0. We support the same.
  set tabIndex(val) {
    this.setAttribute(`tabindex`, (l.isNum(val) ? val : l.renderLax(val)) | 0)
  }

  get innerHTML() {return l.laxStr(this[CHILD_NODES]?.reduce(appendInnerHtml, ``))}

  set innerHTML(val) {
    val = l.render(val)
    const nodes = this.childNodes
    nodes.length = 0
    if (val) nodes.push(new RawText(val))
  }

  get outerHTML() {
    const prev = OUTER_HTML.get()
    if (l.isNil(prev)) OUTER_HTML.set(this)
    try {return this.outerHtml()}
    finally {OUTER_HTML.set(prev)}
  }

  hasAttribute(key) {return !!this[ATTRIBUTES]?.has(key)}
  getAttribute(key) {return norm(this[ATTRIBUTES]?.get(key))}

  removeAttribute(key) {
    this[ATTRIBUTES]?.delete(key)

    if (this.isStyleChange(key)) {
      this[STYLE] = undefined
    }
    else if (this.isDatasetChange(key)) {
      this[DATASET]?.attrDel(key)
    }
  }

  setAttribute(key, val) {
    val = l.render(val)
    this.attributes.set(key, val)

    if (this.isStyleChange(key)) {
      this[STYLE]?.dec()
    }
    else if (this.isDatasetChange(key)) {
      this[DATASET]?.attrSet(key, val)
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

  attrSet(key, val) {
    if (l.isNil(val)) this.removeAttribute(key)
    else this.setAttribute(key, val)
  }

  isStyleChange(key) {return key === `style` && STYLE in this}

  isDatasetChange(key) {return key.startsWith(`data-`) && DATASET in this}

  outerHtml() {
    const tag = this.tagString()
    if (!tag) throw Error(`missing localName on ${l.show(this)}`)

    return (
      `<` + tag + this.attrPrefix() + this.attrString() + `>` +
      l.laxStr(this.innerHTML) +
      `</` + tag + `>`
    )
  }

  isVoid() {return p.VOID.has(this.localName)}
  tagString() {return l.laxStr(this.localName)}
  attrString() {return l.laxStr(this[ATTRIBUTES]?.toString())}
  attrPrefix() {return this.attrIs() + this.attrXmlns()}

  attrIs() {
    const is = this.constructor.customName
    if (!is || is === this.localName || this[ATTRIBUTES]?.has(`is`)) return ``
    return NamedNodeMap.attr(`is`, is)
  }

  attrXmlns() {
    if (this[ATTRIBUTES]?.has(`xmlns`)) return ``

    const chiNs = this[NAMESPACE_URI]
    if (!chiNs) return ``

    const doc = this[OWNER_DOCUMENT]
    if (isHtmlDoc(doc)) return ``

    const parNs = l.get(this.parentNode, `namespaceURI`)
    if (parNs && parNs !== chiNs) return NamedNodeMap.attr(`xmlns`, chiNs)

    if (OUTER_HTML.get() !== this) return ``
    return NamedNodeMap.attr(`xmlns`, chiNs)
  }
}

export class HTMLElement extends Element {
  get namespaceURI() {return super.namespaceURI || p.NS_HTML}
  set namespaceURI(val) {super.namespaceURI = val}

  outerHtml() {
    if (this.isVoid()) {
      if (this.hasChildNodes()) {
        throw Error(`unexpected child nodes in void element ${this.localName}`)
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

export class HTMLLabelElement extends HTMLElement {
  get htmlFor() {return l.laxStr(this.getAttribute(`for`))}
  set htmlFor(val) {this.setAttribute(`for`, val)}
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

  get placeholder() {return l.laxStr(this.getAttribute(`placeholder`))}
  set placeholder(val) {this.setAttribute(`placeholder`, val)}
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

export class HTMLObjectElement extends HTMLElement {}

export class HTMLOutputElement extends HTMLElement {}

/*
Doesn't support the `.value` getter/setter because the correct way to render
pre-selection is via `HTMLOptionElement..selected`.
*/
export class HTMLSelectElement extends HTMLElement {
  get name() {return l.laxStr(this.getAttribute(`name`))}
  set name(val) {this.setAttribute(`name`, val)}

  get multiple() {return this.hasAttribute(`multiple`)}
  set multiple(val) {this.toggleAttribute(`multiple`, l.laxBool(val))}
}

export class HTMLOptionElement extends HTMLElement {
  get value() {return l.laxStr(this.getAttribute(`value`))}
  set value(val) {this.setAttribute(`value`, val)}

  get selected() {return this.hasAttribute(`selected`)}
  set selected(val) {this.toggleAttribute(`selected`, l.laxBool(val))}
}

export class HTMLFieldSetElement extends HTMLElement {}

export class HTMLFormElement extends HTMLElement {
  get elements() {return new HTMLFormControlsCollection(this)}
}

export class HTMLTableElement extends HTMLElement {
  get caption() {return this.childNodes?.find(isCaption)}
  get tHead() {return this.childNodes?.find(isTableHead)}
  get tBodies() {return this.childNodes?.filter(isTableBody) ?? []}
  get tFoot() {return this.childNodes?.find(isTableFoot)}
  // Incomplete. Known defects: not "live"; only body rows.
  get rows() {return this.childNodes?.find(isTableBody)?.childNodes?.filter(isTableRow) ?? []}
}

/*
Non-standard intermediary class for internal use.

When rendering the "raw text elements" `script` and `style` to HTML, their
`.textContent` is used as-is and not escaped.

  https://html.spec.whatwg.org/multipage/syntax.html#raw-text-elements
  https://html.spec.whatwg.org/multipage/scripting.html#the-script-element
  https://html.spec.whatwg.org/multipage/semantics.html#the-style-element
*/
export class RawTextElement extends HTMLElement {
  get innerHTML() {return l.laxStr(this[CHILD_NODES]?.reduce(appendInnerHtmlRaw, ``))}
  set innerHTML(val) {this.textContent = l.renderLax(val)}
}

export class HTMLScriptElement extends RawTextElement {}
export class HTMLStyleElement extends RawTextElement {}

/*
Has various deviations from the standard. For example, in a standard
`SVGElement`, the property `.className` is an object rather than a string.
Our implementation doesn't support any of that for now.
*/
export class SVGElement extends Element {
  get namespaceURI() {return super.namespaceURI || p.NS_SVG}
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

  get name() {return this[NAME]}
  set name(val) {this[NAME] = l.optStr(val)}

  get publicId() {return l.laxStr(this[PUBLIC_ID])}
  set publicId(val) {this[PUBLIC_ID] = l.optStr(val)}

  get systemId() {return l.laxStr(this[SYSTEM_ID])}
  set systemId(val) {this[SYSTEM_ID] = l.optStr(val)}

  // Non-standard.
  get outerHTML() {return `<!doctype ${l.reqStr(this.name)}>`}
}

export class Document extends Node {
  /* Standard behaviors. */

  get nodeType() {return Node.DOCUMENT_NODE}
  get nodeName() {return `#document`}

  get implementation() {return this[IMPLEMENTATION]}
  set implementation(val) {this[IMPLEMENTATION] = optDomImpl(val)}

  get childNodes() {return [this.doctype, this.documentElement].filter(l.id)}

  get doctype() {return norm(this[DOCTYPE])}

  set doctype(val) {
    if ((this[DOCTYPE] = optDocumentType(val))) {
      remove(val)
      adopt(val, this)
      val.ownerDocument = this
    }
  }

  get documentElement() {return norm(this[DOCUMENT_ELEMENT])}

  set documentElement(val) {
    if ((this[DOCUMENT_ELEMENT] = optElement(val))) {
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

  createAttribute(key) {return new Attr(key).adoptDocument(this)}

  createAttributeNS(ns, key) {
    l.reqStr(ns)
    const tar = this.createAttribute(key)
    if (ns !== this.namespaceURI) tar.namespaceURI = ns
    return tar
  }

  createDocumentFragment() {return new DocumentFragment().adoptDocument(this)}
  createTextNode(val) {return new Text(val).adoptDocument(this)}
  createComment(val) {return new Comment(val).adoptDocument(this)}

  createElement(localName, opt) {
    l.reqStr(localName)

    const is = l.onlyStr(l.get(opt, `is`))
    const cls = this.customElements.get(is || localName) || this.baseClassByTag(localName)
    const tar = new cls()

    tar.adoptDocument(this)
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
    this.adoptNode(tar)
    tar.localName = localName
    tar.namespaceURI = ns
    return tar
  }

  adoptNode(val) {val.adoptDocument?.(this)}

  /* Non-standard extensions. */

  get customElements() {return this.implementation.customElements}
  titleNode() {return norm(this.head?.childNodes?.find(isTitle))}
  baseClassByTag() {return Element}
}

export class HTMLDocument extends Document {
  createElement(localName, opt) {
    const tar = super.createElement(localName, opt)
    tar.namespaceURI = p.NS_HTML
    return tar
  }

  createElementNS(ns, localName, opt) {
    if (ns === p.NS_HTML) return this.createElement(localName, opt)
    return super.createElementNS(ns, localName, opt)
  }

  baseClassByTag(tag) {
    return global[l.reqStr(dr.TAG_TO_CLS[tag] || `HTMLElement`)]
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
  get customElements() {return CustomElementRegistry.main}
}

export class CustomElementRegistry extends o.MixMain(l.Emp) {
  constructor() {
    super()
    this.set = new Set()
    this.map = new Map()
  }

  get(val) {return this.map.get(val)}

  define(tag, cls, opt) {
    dr.reqCustomName(tag)
    l.reqCls(cls)
    l.optRec(opt)

    if (this.map.has(tag)) {
      throw Error(`redundant registration of ${l.show(tag)}`)
    }
    if (this.set.has(cls)) {
      throw Error(`redundant registration of ${l.show(cls)}`)
    }
    this.set.add(cls)
    this.map.set(tag, cls)
  }
}

/* Non-standard classes */

export class DictPh extends l.Emp {
  constructor(tar) {
    super()
    this.tar = l.reqInst(tar, Element)
    this.buf = l.Emp()
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
  clear() {for (const key of l.recKeys(this.buf)) delete this.buf[key]}

  attrGet() {return this.tar[ATTRIBUTES]?.get(`style`)}

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
    for (const key of l.recKeys(buf)) out += this.encodePair(key, buf[key])
    return out.trim()
  }

  encodePair(key, val) {
    if (!key || !val) return ``
    return ` ` + l.reqStr(key) + `: ` + l.reqStr(val) + `;`
  }

  styleToCss(key) {return STYLE_TO_CSS.get(key)}
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
    const src = this.tar[ATTRIBUTES]
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

  camelToData(key) {return CAMEL_TO_DATA.get(key)}
  dataToCamel(key) {return DATA_TO_CAMEL.get(key)}
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

  /*
  Technical note. In our shim, this object is iterable, but is not a list.
  We avoid having a `.length` getter to prevent this object from being
  accidentally mistaken for a list.
  */
  [Symbol.iterator]() {return this.values()}

  /* Non-standard extensions. */

  get ref() {return this[REF]}
  set ref(val) {this[REF] = reqElement(val)}
  toArray() {return split(this.value.trim(), /\s+/g)}
}

const arrKey = Symbol.for(`arr`)
const byIdKey = Symbol.for(`byId`)
const byNameKey = Symbol.for(`byName`)

/*
Shim for the native interface `HTMLFormControlsCollection` used for the getter
`HTMLFormElement..elements`. Or more like "sham", because for technical
reasons, this implements only part of the interface, and isn't "live".

Technical note. In violation of the standard DOM API, as well as basic sanity
and various conventions, we minimize the number of regular (non-symbolic)
properties on this object, whether own or inherited. It's also merely an
iterable and not a list. While this is a major inconsistency with the standard
implementations of this type, this is done in order to minimize bugs caused by
such inconsistencies, by pushing user code towards using `.namedItem` and
avoiding direct property access. Keeping the method `.namedItem` consistent
with the standard implementations is fairly straightforward and practical.
Keeping the set of own properties created by indexing controls by `.id` and/or
`.name` is far less straightforward due to property collisions. In the standard
API, this object is supposed to have an own enumerable property for each
non-empty `.id` and `.name` that occurs among the form controls, but skipping
any such properties that collide with inherited properties. This means in order
to have the same set of control-referencing properties as in the standard API,
we must also 100% match the set of inherited properties as in the standard API.
We're not prepared to commit to such accuracy.
*/
export class HTMLFormControlsCollection extends l.Emp {
  /* Standard behaviors. */

  namedItem(key) {
    return norm(this[byIdKey]?.get(key) ?? this[byNameKey]?.get(key))
  }

  [Symbol.iterator]() {return (this[arrKey] ?? []).values()}

  /* Non-standard extensions. */

  constructor(src) {
    super()
    this.constructor.addFrom(this, src)
  }

  static addFrom(tar, src) {
    l.reqInst(tar, this)

    if (!isParentNode(src)) return

    for (const val of src.childNodes) {
      this.addOpt(tar, val)
      this.addFrom(tar, val)
    }
  }

  static addOpt(tar, val) {
    l.reqInst(tar, this)

    if (!this.isControl(val)) return

    const arr = tar[arrKey] ??= []
    arr.push(val)

    const id = val.id
    if (l.isValidStr(id)) {
      const index = tar[byIdKey] ??= new FormControlMap()
      index.add(id, val)
    }

    const name = val.name
    if (l.isValidStr(name)) {
      const index = tar[byNameKey] ??= new FormControlMap()
      index.add(name, val)
    }
  }

  static isControl(val) {
    return l.isObj(val) && (
      false
      || val instanceof HTMLButtonElement
      || val instanceof HTMLFieldSetElement
      || val instanceof HTMLInputElement
      || val instanceof HTMLObjectElement
      || val instanceof HTMLOutputElement
      || val instanceof HTMLSelectElement
      || val instanceof HTMLTextAreaElement
    )
  }
}

// For internal use.
export class FormControlMap extends c.TypedMap {
  reqKey(key) {return l.reqValidStr(key)}
  reqVal(val) {return val}

  add(key, val) {
    l.reqValidStr(key)

    const prev = this.get(key)
    if (!prev) {
      this.set(key, val)
      return
    }

    if (l.isInst(prev, RadioNodeList)) {
      prev.push(val)
      return
    }

    this.set(key, RadioNodeList.of(prev, val))
  }
}

// Semi-placeholder for internal use.
export class RadioNodeList extends Array {}

/* Namespaces */

const PH_GLOB = l.Emp()

PH_GLOB.get = function get(tar, key) {
  if (key in tar) return tar[key]
  if (key in ds) return ds[key]
  if (!l.isStr(key)) return undefined

  const cls = (
    !key.endsWith(`Element`)
    ? undefined
    : key.startsWith(`HTML`)
    ? HTMLElement
    : key.startsWith(`SVG`)
    ? SVGElement
    : Element
  )

  return cls && class Element extends cls {static get name() {return key}}
}

export const global = new Proxy(l.Emp(), PH_GLOB)
export const document = new DOMImplementation().createHTMLDocument()
export const customElements = document.customElements

/* Misc */

/*
Spec:

  https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
  https://html.spec.whatwg.org/multipage/syntax.html#syntax-ambiguous-ampersand

In double-quoted attributes, the spec requires us to escape only double quotes
and ambiguous ampersands. In practice, everyone escapes ampersands by default.

We align our escaping implementation with Chromium because we test our
`.outerHTML` implementation against theirs. At some point, they were
escaping the following:

  \u00a0 -> &nbsp;
  &      -> &amp;
  "      -> &quot;

Then they started escaping even more:

  \u00a0 -> &nbsp;
  &      -> &amp;
  "      -> &quot;
  <      -> &lt;
  >      -> &gt;

At this point, their attribute escaping is a superset of element text escaping.
This is not mandated by the spec, and not necessary for proper HTML parsers
such as browsers.
*/
export function escapeAttr(src) {
  l.reqStr(src)
  const re = /[\u00a0&"<>]/g
  return re.test(src) ? src.replace(re, escapeChar) : src
}

/*
Spec:

  https://html.spec.whatwg.org/multipage/syntax.html#elements-2
*/
export function escapeText(src) {
  l.reqStr(src)
  const re = /[\u00a0&<>]/g
  return re.test(src) ? src.replace(re, escapeChar) : src
}

export function escapeChar(src) {
  if (src === `\u00a0`) return `&nbsp;`
  if (src === `&`) return `&amp;`
  if (src === `"`) return `&quot;`
  if (src === `<`) return `&lt;`
  if (src === `>`) return `&gt;`
  return src
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

export class STYLE_TO_CSS extends o.Cache {
  static make(val) {return camelToKebab(val)}
}

export class CAMEL_TO_DATA extends o.Cache {
  static make(val) {return camelToData(val)}
}

export class DATA_TO_CAMEL extends o.Cache {
  static make(val) {return dataToCamel(val)}
}

// Hidden context that allows to automatically set `xmlns` on XML elements.
export const OUTER_HTML = new o.DynVar()

/* Internal */

function head(val) {return val?.[0]}
function last(val) {return val?.[val.length - 1]}
function hasLocalName(val, name) {return isElement(val) && val.localName ===  name}
function errIllegal() {return TypeError(`illegal invocation`)}
function norm(val) {return val ?? null}
function notIncludes(val) {return !this.includes(val)}
function split(val, sep) {return l.laxStr(val) ? val.split(l.reqSome(sep)) : []}
function join(val) {return val.join(` `)}
function lower(val) {return val.toLowerCase()}
function isHead(val) {return hasLocalName(val, `head`)}
function isBody(val) {return hasLocalName(val, `body`)}
function isTitle(val) {return hasLocalName(val, `title`)}
function isCaption(val) {return hasLocalName(val, `caption`)}
function isTableHead(val) {return hasLocalName(val, `thead`)}
function isTableBody(val) {return hasLocalName(val, `tbody`)}
function isTableFoot(val) {return hasLocalName(val, `tfoot`)}
function isTableRow(val) {return hasLocalName(val, `tr`)}
function isRemovable(val) {return l.isObj(val) && `remove` in val}
function remove(val) {if (isRemovable(val)) val.remove()}
function adopt(chi, par) {reqNode(chi).parentNode = par}
function fromCharCode(val) {return val ? String.fromCharCode(val) : ``}

function appendTextContent(acc, src) {
  l.reqStr(acc)
  if (l.isNil(src) || isComment(src)) return acc
  if (l.isObj(src) && `textContent` in src) return acc + l.laxStr(src.textContent)
  if (l.isArr(src)) return src.reduce(appendTextContent, acc)
  return acc + l.renderLax(src)
}

function appendInnerHtml(acc, src) {
  l.reqStr(acc)
  if (l.isNil(src)) return acc
  if (l.isObj(src) && `outerHTML` in src) return acc + l.laxStr(src.outerHTML)
  if (isFragment(src)) return src.childNodes.reduce(appendInnerHtml, acc)
  if (l.isArr(src)) return src.reduce(appendInnerHtml, acc)
  return acc + escapeText(l.renderLax(src))
}

function appendInnerHtmlRaw(acc, src) {
  l.reqStr(acc)
  if (isText(src)) return acc + l.reqStr(src.textContent)
  const out = l.renderOpt(src)
  if (l.isSome(out)) return acc + out
  return appendInnerHtml(acc, src)
}

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
  while (++ind < buf.length) buf[ind] = s.title(buf[ind])
  return buf.join(``)
}

/*
Part of the dataset key algorithm. Seems to be okayish for CSS names,
but we may have to differentiate them later.

Suboptimal, should be cached.
*/
function camelToKebab(val) {return val.split(/(?=[A-Z])/g).map(lower).join(`-`)}

// Difference from `Array.prototype.indexOf`: supports `NaN`.
function indexOf(src, val) {
  l.reqArr(src)
  const len = src.length
  let ind = -1
  while (++ind < len) if (l.is(src[ind], val)) return ind
  return -1
}

// Duplicated from `iter.mjs` to avoid import.
function count(src, fun) {
  l.optArr(src)
  l.reqFun(fun)
  let out = 0
  if (src) for (src of src) if (fun(src)) out++
  return out
}

/*
Questionable, TODO improve. Unable to use `.namespaceURI` because the `Document`
interface doesn't implement this, or expose the namespace in any other way.
*/
function isHtmlDoc(doc) {return l.isInst(doc, HTMLDocument)}
