import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as p from '../prax.mjs'
import * as ds from '../dom_shim.mjs'
import {eqm} from './prax_test.mjs'

function fragOf(...val) {
  const buf = new ds.DocumentFragment()
  buf.append(...val)
  return buf
}

t.test(function test_Node_empty() {
  const node = new ds.Node()

  t.no(node.isConnected)
  t.is(node.parentNode, null)
  t.is(node.parentElement, null)
  t.eq(node.childNodes, [])
  t.is(node.childNodes, node.childNodes)
  t.is(node.firstChild, null)
  t.is(node.lastChild, null)
  t.is(node.previousSibling, null)
  t.is(node.nextSibling, null)
  t.is(node.ownerDocument, null)
  t.is(node.nodeName, null)
  t.is(node.nodeType, null)
  t.is(node.nodeValue, null)
})

t.test(function test_Node_childNodes() {
  const node = new ds.Node()
  const nodes = node.childNodes
  t.eq(nodes, [])

  t.is(node.childNodes, nodes)
  t.is(node.childNodes, nodes)

  nodes.push(10)
  t.eq(node.childNodes, [10])
})

t.test(function test_Node_hasChildNodes() {
  const node = new ds.Node()
  t.no(node.hasChildNodes())

  t.is(node.childNodes.length, 0)
  t.no(node.hasChildNodes())

  node.appendChild(NaN)
  t.ok(node.hasChildNodes())

  node.removeChild(NaN)
  t.no(node.hasChildNodes())
})

t.test(function test_Node_contains() {
  const node = new ds.Node()
  t.no(node.contains(10))
  t.no(node.contains(NaN))

  node.childNodes.push(10)
  t.ok(node.contains(10))
  t.no(node.contains(NaN))

  node.childNodes.push(NaN)
  t.ok(node.contains(10))
  t.ok(node.contains(NaN))
})

/*
Our implementation allows parents to store arbitrary values in `.childNodes`,
without requiring children to subclass the `Node` class or satisfy a
particular interface. Our DOM shim is geared towards eventual serialization
via `.outerHTML`. Many children are primitives such as strings or numbers, or
other arbitrary stringables. Converting them into `Text` nodes is certainly
possible, but would be unnecessarily wasteful and restrictive.

Known defect: doesn't detect cyclic references.
*/
t.test(function test_Node_appendChild() {
  const top = new ds.Node()
  const one = new ds.Text(`one`)
  const two = `two`
  const three = new ds.Comment(`three`)

  t.eq(top.childNodes, [])

  t.is(top.appendChild(one), one)
  t.eq(top.childNodes, [one])
  t.is(one.parentNode, top)

  t.is(top.appendChild(one), one)
  t.eq(top.childNodes, [one])
  t.is(one.parentNode, top)

  t.is(top.appendChild(two), two)
  t.eq(top.childNodes, [one, two])

  t.is(top.appendChild(three), three)
  t.eq(top.childNodes, [one, two, three])
  t.is(three.parentNode, top)

  t.is(top.appendChild(three), three)
  t.eq(top.childNodes, [one, two, three])
  t.is(three.parentNode, top)

  t.is(top.appendChild(one), one)
  t.is(one.parentNode, top)
  t.eq(top.childNodes, [two, three, one])

  t.is(top.appendChild(three), three)
  t.is(three.parentNode, top)
  t.eq(top.childNodes, [two, one, three])

  t.is(top.parentNode, null)
})

t.test(function test_Node_removeChild() {
  const top = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Comment(`two`)

  // Intentionally not implemented.
  //
  // t.throws(() => top.removeChild(one), Error, `missing child [object Text]`)

  top.appendChild(one)
  t.is(one.parentNode, top)

  top.appendChild(two)
  t.is(two.parentNode, top)

  t.eq(top.childNodes, [one, two])

  top.removeChild(one)
  t.is(one.parentNode, null)
  t.eq(top.childNodes, [two])

  top.removeChild(two)
  t.is(two.parentNode, null)
  t.eq(top.childNodes, [])
})

t.test(function test_Node_removeChild_prim() {
  const top = new ds.Node()
  const one = 10
  const two = NaN
  const three = `str`
  const four = false

  // Intentionally not implemented.
  //
  // t.throws(() => top.removeChild(one), Error, `missing child 10`)

  top.appendChild(one)
  top.appendChild(two)
  top.appendChild(three)
  top.appendChild(four)
  t.eq(top.childNodes, [one, two, three, four])

  t.is(top.removeChild(two), two)
  t.eq(top.childNodes, [one, three, four])

  t.is(top.removeChild(three), three)
  t.eq(top.childNodes, [one, four])

  t.is(top.removeChild(one), one)
  t.eq(top.childNodes, [four])

  t.is(top.removeChild(four), four)
  t.eq(top.childNodes, [])
})

t.test(function test_Node_replaceChild() {
  const top = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)
  const three = new ds.Text(`three`)

  t.is(top.appendChild(one), one)
  t.is(top.appendChild(two), two)

  t.eq(top.childNodes, [one, two])
  t.is(one.parentNode, top)
  t.is(two.parentNode, top)
  t.is(three.parentNode, null)

  t.throws(() => top.replaceChild(`four`, three), Error, `missing child [object Text]`)

  t.is(top.replaceChild(three, one), one)

  t.eq(top.childNodes, [three, two])
  t.is(one.parentNode, null)
  t.is(two.parentNode, top)
  t.is(three.parentNode, top)

  t.is(top.replaceChild(one, two), two)

  t.eq(top.childNodes, [three, one])
  t.is(one.parentNode, top)
  t.is(two.parentNode, null)
  t.is(three.parentNode, top)
})

t.test(function test_Node_replaceChild_prim() {
  const top = new ds.Node()
  const one = 10
  const two = NaN
  const three = 20

  t.is(top.appendChild(one), one)
  t.is(top.appendChild(two), two)
  t.eq(top.childNodes, [one, two])

  t.throws(() => top.replaceChild(40, three), Error, `missing child 20`)

  t.is(top.replaceChild(three, one), one)
  t.eq(top.childNodes, [three, two])

  t.is(top.replaceChild(one, two), two)
  t.eq(top.childNodes, [three, one])
})

t.test(function test_Node_insertBefore() {
  const top = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)
  const three = new ds.Text(`three`)

  t.throws(() => top.insertBefore(`four`, two), Error, `missing child [object Text]`)

  t.is(top.insertBefore(one, null), one)
  t.eq(top.childNodes, [one])
  t.is(one.parentNode, top)

  t.is(top.insertBefore(two, null), two)
  t.eq(top.childNodes, [one, two])
  t.is(one.parentNode, top)
  t.is(two.parentNode, top)

  t.is(top.insertBefore(three, two), three)
  t.eq(top.childNodes, [one, three, two])
  t.is(one.parentNode, top)
  t.is(two.parentNode, top)
  t.is(three.parentNode, top)

  t.is(top.insertBefore(three, one), three)
  t.eq(top.childNodes, [three, one, two])
  t.is(one.parentNode, top)
  t.is(two.parentNode, top)
  t.is(three.parentNode, top)
})

// Uses `.appendChild`, this is just a sanity check.
t.test(function test_Node_append() {
  const top = new ds.Node()
  const one = new ds.Text(`one`)
  const two = `two`
  const three = new ds.Comment(`three`)

  t.is(top.append(one, two, three), undefined)
  t.eq(top.childNodes, [one, two, three])
  t.is(one.parentNode, top)
  t.is(two.parentNode, undefined)
  t.is(three.parentNode, top)
})

t.test(function test_Node_remove() {
  const top = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Comment(`two`)
  const three = new ds.Text(`three`)

  top.append(one, two, three)
  t.eq(top.childNodes, [one, two, three])
  t.is(one.parentNode, top)
  t.is(two.parentNode, top)
  t.is(three.parentNode, top)

  two.remove()
  t.eq(top.childNodes, [one, three])
  t.is(one.parentNode, top)
  t.is(two.parentNode, null)
  t.is(three.parentNode, top)

  three.remove()
  t.eq(top.childNodes, [one])
  t.is(one.parentNode, top)
  t.is(two.parentNode, null)
  t.is(three.parentNode, null)

  one.remove()
  t.eq(top.childNodes, [])
  t.is(one.parentNode, null)
  t.is(two.parentNode, null)
  t.is(three.parentNode, null)
})

t.test(function test_Node_getRootNode() {
  const top = new ds.Element()
  t.is(top.getRootNode(), top)

  const mid = new ds.Node()
  t.is(mid.getRootNode(), mid)

  const bot = new ds.Text(`str`)
  t.is(bot.getRootNode(), bot)

  top.appendChild(mid)
  mid.appendChild(bot)

  t.is(top.getRootNode(), top)
  t.is(mid.getRootNode(), top)
  t.is(bot.getRootNode(), top)
})

t.test(function test_Node_isConnected() {
  const child = new ds.Node()
  t.no(child.isConnected)

  const parent = new ds.Element()
  t.no(parent.isConnected)

  parent.appendChild(child)
  t.no(child.isConnected)
  t.no(parent.isConnected)

  const doc = ds.dom.createHTMLDocument()
  t.ok(doc.isConnected)

  doc.body.appendChild(parent)

  t.is(doc.getRootNode(), doc)
  t.is(parent.getRootNode(), doc)
  t.is(child.getRootNode(), doc)

  t.ok(parent.isConnected)
  t.ok(child.isConnected)
})

t.test(function test_Node_parentElement() {
  const text = new ds.Text(`str`)
  t.is(text.parentElement, null)

  const node = new ds.Node()
  t.is(node.parentElement, null)

  const elem = new ds.Element()
  t.is(elem.parentElement, null)

  node.appendChild(text)
  t.is(text.parentElement, null)
  t.is(node.parentElement, null)

  elem.appendChild(node)
  t.is(text.parentElement, null)
  t.is(node.parentElement, elem)
  t.is(elem.parentElement, null)

  elem.appendChild(text)
  t.is(text.parentElement, elem)
  t.is(node.parentElement, elem)
  t.is(elem.parentElement, null)
})

t.test(function test_Node_firstChild() {
  const tar = new ds.Node()
  t.is(tar.firstChild, null)

  tar.appendChild(`one`)
  t.is(tar.firstChild, `one`)

  tar.appendChild(`two`)
  t.is(tar.firstChild, `one`)
})

t.test(function test_Node_lastChild() {
  const tar = new ds.Node()
  t.is(tar.lastChild, null)

  tar.appendChild(`one`)
  t.is(tar.lastChild, `one`)

  tar.appendChild(`two`)
  t.is(tar.lastChild, `two`)
})

t.test(function test_Node_previousSibling_nextSibling() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)
  const three = new ds.Text(`three`)

  t.is(one.previousSibling, null)
  t.is(two.previousSibling, null)
  t.is(three.previousSibling, null)

  t.is(one.nextSibling, null)
  t.is(two.nextSibling, null)
  t.is(three.nextSibling, null)

  tar.appendChild(one)
  tar.appendChild(two)
  tar.appendChild(three)

  t.is(one.previousSibling, null)
  t.is(two.previousSibling, one)
  t.is(three.previousSibling, two)

  t.is(one.nextSibling, two)
  t.is(two.nextSibling, three)
  t.is(three.nextSibling, null)
})

t.test(function test_Node_ownerDocument() {
  const node = new ds.Node()
  t.is(node.ownerDocument, null)

  const doc = ds.dom.createHTMLDocument()

  doc.body.appendChild(node)
  t.is(node.ownerDocument, null)

  node.ownerDocument = doc
  t.is(node.ownerDocument, doc)
})

t.test(function test_Text() {testCharacterData(ds.Text, l.id)})

t.test(function test_Comment() {testCharacterData(ds.Comment, commentStr)})

function commentStr(src) {return `<!--` + l.reqStr(src) + `-->`}

function testCharacterData(Cls, fun) {
  t.test(function test_void() {
    const tar = new Cls(`str`)
    const chi = new ds.Node()
    t.throws(() => tar.appendChild(chi), TypeError, `illegal invocation`)
  })

  t.throws(() => new Cls({}), TypeError, `unable to convert {} to string`)

  function valid(node, src, exp) {
    l.reqInst(node, Cls)
    l.reqStr(src)
    l.reqStr(exp)

    t.is(node.data, src)
    t.is(node.nodeValue, src)
    t.is(node.textContent, src)
    t.is(node.length, src.length)
    t.is(node.outerHTML, fun(exp))
  }

  function test(src, exp) {
    valid(new Cls(src), l.renderLax(src), exp)

    {
      const tar = new Cls()
      tar.data = src
      valid(tar, l.renderLax(src), exp)
    }

    {
      const tar = new Cls()
      tar.nodeValue = src
      valid(tar, l.renderLax(src), exp)
    }

    {
      const tar = new Cls()
      tar.textContent = src
      valid(tar, l.renderLax(src), exp)
    }
  }

  test(undefined, ``)
  test(null, ``)
  test(``, ``)
  test(`str`, `str`)
  test(10, `10`)
  test(new URL(`https://example.com`), `https://example.com/`)
  test(`<script>alert("hacked")</script>`, `&lt;script&gt;alert("hacked")&lt;/script&gt;`)
}

t.test(function test_NamedNodeMap() {
  function make() {
    return new ds.NamedNodeMap().set(`one`, `two`).set(`three`, `four`)
  }

  /*
  These APIs are both inefficient and inconvenient. We implement them for
  compatibility reasons, but none of our code relies on them, and application
  code shouldn't need them either. Our implementation is not entirely
  standards-compliant.
  */
  t.test(function test_standard_behaviors() {
    t.test(function test_getNamedItem() {
      test_NamedNodeMap_getNamedItem(make())
    })

    t.test(function test_setNamedItem() {
      const tar = new ds.NamedNodeMap()

      t.throws(() => tar.setNamedItem(), TypeError, `expected variant of isObj, got undefined`)
      t.throws(() => tar.setNamedItem(10), TypeError, `expected variant of isObj, got 10`)

      tar.setNamedItem({name: `one`, value: `two`})
      tar.setNamedItem({name: `three`, value: `four`})

      test_NamedNodeMap_getNamedItem(tar)
    })

    t.test(function test_removeNamedItem() {
      const tar = make()
      tar.setNamedItem({name: `five`, value: `six`})
      tar.removeNamedItem(`five`)
      test_NamedNodeMap_getNamedItem(tar)
    })

    t.test(function test_iter() {
      const tar = make()
      t.eq([...tar], [tar.getNamedItem(`one`), tar.getNamedItem(`three`)])
      t.eq([...tar].map(val => val.name), [`one`, `three`])
    })
  })

  t.test(function test_set() {
    const tar = new ds.NamedNodeMap()

    t.throws(() => tar.set(10, `str`), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => tar.set(`str`), TypeError, `unable to convert undefined to string`)
    t.throws(() => tar.set(`str`, {}), TypeError, `unable to convert {} to string`)

    tar.set(`one`, 10)
    tar.set(`two`, new URL(`https://example.com`))

    t.eq([...tar.entries()], [[`one`, `10`], [`two`, `https://example.com/`]])
  })

  t.test(function test_toString() {
    t.is(new ds.NamedNodeMap().toString(), ``)

    t.is(make().toString(), ` one="two" three="four"`)

    /*
    At the moment, we escape attribute values, which often come from untrusted
    sources, without validating attribute names which are assumed to be
    hardcoded. In the future, we may also add validation of attribute names.
    */
    t.is(
      new ds.NamedNodeMap()
      .set(
        `one`,
        `"><script>alert("two")</script><span `
      ).toString(),
      ` one="&quot;><script>alert(&quot;two&quot;)</script><span "`,
    )
  })

  t.test(function test_item_mutation() {
    const tar = make()
    t.eq([...tar.entries()], [[`one`, `two`], [`three`, `four`]])

    {
      const item = tar.getNamedItem(`one`)
      t.is(item.name, `one`)
      t.is(item.value, `two`)

      item.value = `five`
      t.eq([...tar.entries()], [[`one`, `five`], [`three`, `four`]])
    }

    {
      const item = tar.getNamedItem(`three`)
      t.is(item.name, `three`)
      t.is(item.value, `four`)

      item.value = `six`
      t.eq([...tar.entries()], [[`one`, `five`], [`three`, `six`]])
    }
  })
})

function test_NamedNodeMap_getNamedItem(tar) {
  t.is(tar.getNamedItem(`five`), undefined)

  function test(key, val) {
    const item = tar.getNamedItem(key)

    t.is(item.name, key)
    t.is(item.value, val)
    t.is(item.value, tar.get(key))
  }

  test(`one`, `two`)
  test(`three`, `four`)
}

t.test(function test_Element_localName() {
  const tar = new ds.Element()
  t.is(tar.localName, null)

  tar.localName = `span`
  t.is(tar.localName, `span`)
})

t.test(function test_Element_tagName() {
  const tar = new ds.Element()
  t.is(tar.tagName, null)

  tar.localName = `span`
  t.is(tar.tagName, `SPAN`)
})

t.test(function test_Element_namespaceURI() {
  const tar = new ds.Element()
  t.is(tar.namespaceURI, null)

  tar.ownerDocument = ds.document
  t.is(tar.namespaceURI, null)

  tar.namespaceURI = p.nsSvg
  t.is(tar.namespaceURI, `http://www.w3.org/2000/svg`)
})

t.test(function test_Element_parentNode_and_lifecycle() {
  class Counted extends ds.Element {
    con = 0
    dis = 0
  }

  function test(tar, par, con, dis) {
    t.inst(tar, Counted)
    t.is(tar.parentNode, par)
    t.own(tar, {con, dis})
  }

  const body = ds.dom.createHTMLDocument().body

  t.test(function test_only_connectedCallback() {
    class Elem extends Counted {connectedCallback() {this.con++}}

    const tar = new Elem()
    test(tar, null, 0, 0)

    const node = new ds.Node()
    node.appendChild(tar)
    test(tar, node, 0, 0)

    const elem = new ds.Element()
    elem.appendChild(tar)
    test(tar, elem, 0, 0)

    body.appendChild(tar)
    test(tar, body, 1, 0)

    tar.remove()
    test(tar, null, 1, 0)

    body.appendChild(tar)
    test(tar, body, 2, 0)

    node.appendChild(tar)
    test(tar, node, 2, 0)
  })

  t.test(function test_only_disconnectedCallback() {
    class Elem extends Counted {disconnectedCallback() {this.dis++}}

    const tar = new Elem()
    test(tar, null, 0, 0)

    const node = new ds.Node()
    node.appendChild(tar)
    test(tar, node, 0, 0)

    const elem = new ds.Element()
    elem.appendChild(tar)
    test(tar, elem, 0, 0)

    body.appendChild(tar)
    test(tar, body, 0, 0)

    tar.remove()
    test(tar, null, 0, 1)

    body.appendChild(tar)
    test(tar, body, 0, 1)

    node.appendChild(tar)
    test(tar, node, 0, 2)
  })

  t.test(function test_both_callbacks() {
    class Elem extends Counted {
      connectedCallback() {this.con++}
      disconnectedCallback() {this.dis++}
    }

    const tar = new Elem()
    test(tar, null, 0, 0)

    const node = new ds.Node()
    node.appendChild(tar)
    test(tar, node, 0, 0)

    const elem = new ds.Element()
    elem.appendChild(tar)
    test(tar, elem, 0, 0)

    body.appendChild(tar)
    test(tar, body, 1, 0)

    tar.remove()
    test(tar, null, 1, 1)

    body.appendChild(tar)
    test(tar, body, 2, 1)

    node.appendChild(tar)
    test(tar, node, 2, 2)
  })
})

t.test(function test_Element_children() {
  const top = new ds.Element()
  top.localName = `top`

  const one = new ds.Text(`one`)

  const two = new ds.Element()
  two.localName = `two`

  const three = new ds.Comment(`three`)

  const four = new ds.Element()
  four.localName = `four`

  t.eq(top.children, [])

  top.appendChild(one)
  t.eq(top.children, [])

  top.appendChild(two)
  t.eq(top.children, [two])

  top.appendChild(three)
  t.eq(top.children, [two])

  top.appendChild(four)
  t.eq(top.children, [two, four])
})

t.test(function test_Element_attributes() {
  const tar = new ds.Element()

  t.throws(() => tar.setAttribute(undefined, `val`), TypeError, `expected variant of isStr, got undefined`)
  t.throws(() => tar.setAttribute(10, `val`), TypeError, `expected variant of isStr, got 10`)
  t.throws(() => tar.setAttribute({}, `val`), TypeError, `expected variant of isStr, got {}`)

  t.throws(() => tar.setAttribute(`key`), TypeError, `unable to convert undefined to string`)
  t.throws(() => tar.setAttribute(`key`, {}), TypeError, `unable to convert {} to string`)

  {
    t.no(tar.hasAttribute(`one`))
    t.is(tar.getAttribute(`one`), null)

    t.no(tar.hasAttribute(`three`))
    t.is(tar.getAttribute(`three`), null)

    t.eq(tar.attributes, new ds.NamedNodeMap())
  }

  {
    tar.setAttribute(`one`, `two`)

    t.ok(tar.hasAttribute(`one`))
    t.is(tar.getAttribute(`one`), `two`)

    t.no(tar.hasAttribute(`three`))
    t.is(tar.getAttribute(`three`), null)

    t.eq(tar.attributes, new ds.NamedNodeMap().set(`one`, `two`))
  }

  {
    tar.setAttribute(`three`, `four`)

    t.ok(tar.hasAttribute(`one`))
    t.is(tar.getAttribute(`one`), `two`)

    t.ok(tar.hasAttribute(`three`))
    t.is(tar.getAttribute(`three`), `four`)

    t.eq(tar.attributes, new ds.NamedNodeMap().set(`one`, `two`).set(`three`, `four`))
  }

  {
    tar.removeAttribute(`one`)

    t.no(tar.hasAttribute(`one`))
    t.is(tar.getAttribute(`one`), null)

    t.ok(tar.hasAttribute(`three`))
    t.is(tar.getAttribute(`three`), `four`)

    t.eq(tar.attributes, new ds.NamedNodeMap().set(`three`, `four`))
  }

  {
    tar.removeAttribute(`three`)
    t.eq(tar.attributes, new ds.NamedNodeMap())
  }

  {
    t.ok(tar.toggleAttribute(`one`))
    t.eq(tar.attributes, new ds.NamedNodeMap().set(`one`, ``))
  }

  {
    t.no(tar.toggleAttribute(`one`))
    t.eq(tar.attributes, new ds.NamedNodeMap())
  }

  {
    t.ok(tar.toggleAttribute(`one`, true))
    t.eq(tar.attributes, new ds.NamedNodeMap().set(`one`, ``))
  }

  {
    t.ok(tar.toggleAttribute(`one`, true))
    t.eq(tar.attributes, new ds.NamedNodeMap().set(`one`, ``))
  }

  {
    t.no(tar.toggleAttribute(`one`, false))
    t.eq(tar.attributes, new ds.NamedNodeMap())
  }

  {
    t.no(tar.toggleAttribute(`one`, false))
    t.eq(tar.attributes, new ds.NamedNodeMap())
  }
})

t.test(function test_Element_id() {
  const tar = new ds.Element()
  t.is(tar.id, ``)
  t.no(tar.hasAttribute(`id`))
  t.is(tar.getAttribute(`id`), null)

  t.throws(() => tar.id = {}, TypeError, `unable to convert {} to string`)

  tar.id = `one`
  t.is(tar.id, `one`)
  t.ok(tar.hasAttribute(`id`))
  t.is(tar.getAttribute(`id`), `one`)

  tar.id = 10
  t.is(tar.id, `10`)
  t.ok(tar.hasAttribute(`id`))
  t.is(tar.getAttribute(`id`), `10`)

  tar.id = ``
  t.is(tar.id, ``)
  t.ok(tar.hasAttribute(`id`))
  t.is(tar.getAttribute(`id`), ``)

  tar.id = NaN
  t.is(tar.id, `NaN`)
  tar.removeAttribute(`id`)
  t.is(tar.id, ``)
  t.no(tar.hasAttribute(`id`))
  t.is(tar.getAttribute(`id`), null)
})

// Indirectly tests `StylePh`.
t.test(function test_Element_style() {
  const tar = new ds.Element()

  t.is(tar.style.cssText, ``)
  t.is(tar.getAttribute(`style`), null)

  function test(val) {
    t.is(tar.style.cssText, val)
    t.is(tar.getAttribute(`style`), val)
  }

  tar.style = `color: red`
  test(`color: red`)

  tar.style.cssText = `background: blue`
  test(`background: blue`)

  tar.setAttribute(`style`, `display: flex`)
  test(`display: flex`)

  tar.style.flexDirection = `column`
  test(`display: flex; flex-direction: column;`)

  tar.style.color = `gold`
  test(`display: flex; flex-direction: column; color: gold;`)

  tar.style.color = ``
  test(`display: flex; flex-direction: column;`)

  tar.style.display = `block`
  test(`display: block; flex-direction: column;`)

  tar.style.flexDirection = `row`
  test(`display: block; flex-direction: row;`)

  delete tar.style.display
  test(`flex-direction: row;`)

  t.is(tar.style, tar.style)
  t.is(tar.style, tar.style)
})

t.test(function test_Element_dataset() {
  const tar = new ds.Element()

  function test(own, attr) {
    t.own(tar.dataset, own)
    t.is(tar.attributes.toString(), attr)
  }

  test({}, ``)

  tar.dataset.one = `two`
  test({one: `two`}, ` data-one="two"`)

  tar.dataset.threeFour = `five`
  test({one: `two`, threeFour: `five`}, ` data-one="two" data-three-four="five"`)

  delete tar.dataset.one
  test({threeFour: `five`}, ` data-three-four="five"`)

  tar.removeAttribute(`data-three-four`)
  test({}, ``)

  tar.setAttribute(`data-six`, `seven`)
  test({six: `seven`}, ` data-six="seven"`)

  tar.setAttribute(`data-eight-nine`, `ten`)
  test({six: `seven`, eightNine: `ten`}, ` data-six="seven" data-eight-nine="ten"`)

  t.is(tar.dataset, tar.dataset)
  t.is(tar.dataset, tar.dataset)
})

t.test(function test_Element_className() {
  const tar = new ds.Element()

  t.throws(() => tar.className = undefined, TypeError, `unable to convert undefined to string`)
  t.throws(() => tar.className = null, TypeError, `unable to convert null to string`)
  t.throws(() => tar.className = {}, TypeError, `unable to convert {} to string`)

  function none() {
    t.is(tar.className, ``)
    t.is(tar.getAttribute(`class`), null)
  }

  none()

  function test(val) {
    t.is(tar.className, val)
    t.is(tar.getAttribute(`class`), val)
  }

  tar.className = ``
  test(``)

  tar.className = 10
  test(`10`)

  tar.className = `str`
  test(`str`)

  tar.setAttribute(`class`, `one two three`)
  test(`one two three`)

  tar.removeAttribute(`class`)
  none()
})

t.test(function test_Element_classList() {
  const tar = new ds.Element()

  t.is(tar.classList, tar.classList)
  t.is(tar.classList, tar.classList)

  function test(str, arr) {
    t.is(tar.getAttribute(`class`) ?? ``, str)
    t.is(tar.className, str)
    t.is(tar.classList.value, str)
    t.eq([...tar.classList], arr)
  }

  test(``, [])

  tar.className = `one`
  test(`one`, [`one`])

  tar.className = `one two`
  test(`one two`, [`one`, `two`])

  tar.classList.value = `three    four`
  test(`three    four`, [`three`, `four`])

  tar.setAttribute(`class`, ` five six   seven `)
  test(` five six   seven `, [`five`, `six`, `seven`])

  tar.classList.remove(`five`)
  test(`six seven`, [`six`, `seven`])

  tar.classList.remove(`five`)
  test(`six seven`, [`six`, `seven`])

  tar.classList.remove(`six`)
  test(`seven`, [`seven`])

  tar.classList.remove(`six`)
  test(`seven`, [`seven`])

  tar.classList.remove(`seven`)
  test(``, [])

  tar.classList.add(`one`)
  test(`one`, [`one`])

  tar.classList.add(`one`)
  test(`one`, [`one`])

  tar.classList.add(`two`)
  test(`one two`, [`one`, `two`])

  tar.classList.add(`two`)
  test(`one two`, [`one`, `two`])

  t.no(tar.classList.toggle(`two`))
  test(`one`, [`one`])

  t.ok(tar.classList.toggle(`two`))
  test(`one two`, [`one`, `two`])

  t.ok(tar.classList.toggle(`two`, true))
  test(`one two`, [`one`, `two`])

  t.ok(tar.classList.toggle(`three`, true))
  test(`one two three`, [`one`, `two`, `three`])

  t.no(tar.classList.toggle(`two`, false))
  test(`one three`, [`one`, `three`])

  t.no(tar.classList.toggle(`two`, false))
  test(`one three`, [`one`, `three`])
})

t.test(function test_Element_hidden() {
  const tar = new ds.Element()

  t.throws(() => tar.hidden = [], TypeError, `expected variant of isBool, got []`)
  t.throws(() => tar.hidden = {}, TypeError, `expected variant of isBool, got {}`)

  function test(prop, attr) {
    t.is(tar.hidden, prop)
    t.is(tar.getAttribute(`hidden`), attr)
  }

  test(false, null)

  tar.hidden = true
  test(true, ``)

  tar.hidden = false
  test(false, null)

  tar.hidden = undefined
  test(false, null)

  tar.hidden = null
  test(false, null)

  tar.setAttribute(`hidden`, ``)
  test(true, ``)

  // This is NOT a valid way to set `.hidden`.
  tar.setAttribute(`hidden`, `false`)
  test(true, `false`)

  tar.removeAttribute(`hidden`)
  test(false, null)
})

t.test(function test_Element_tabIndex() {
  const tar = new ds.Element()

  t.throws(() => tar.tabIndex = [], TypeError, `unable to convert [] to string`)
  t.throws(() => tar.tabIndex = {}, TypeError, `unable to convert {} to string`)

  function test(prop, attr) {
    t.is(tar.tabIndex, prop)
    t.is(tar.getAttribute(`tabindex`), attr)
  }

  test(0, null)

  tar.tabIndex = 0
  test(0, `0`)

  tar.tabIndex = -0
  test(0, `0`)

  tar.tabIndex = 1
  test(1, `1`)

  tar.tabIndex = -1
  test(-1, `-1`)

  tar.tabIndex = 1.2
  test(1, `1`)

  tar.tabIndex = 2.3
  test(2, `2`)

  tar.tabIndex = -2.3
  test(-2, `-2`)

  tar.setAttribute(`tabindex`, `12.34`)
  test(12, `12.34`)

  tar.setAttribute(`tabindex`, `-23.45`)
  test(-23, `-23.45`)

  tar.removeAttribute(`tabindex`)
  test(0, null)
})

// Minor sanity check. Full test for `Element` below.
t.test(function test_DocumentFragment_textContent() {
  const tar = new ds.DocumentFragment()
  tar.append(`one`, new ds.Text(`two`), new ds.Comment(`three`))
  t.is(tar.textContent, `onetwo`)
})

t.test(function test_Element_textContent() {
  const tar = new ds.Element()

  t.throws(() => tar.textContent = {}, TypeError, `unable to convert {} to string`)
  t.throws(() => tar.textContent = [], TypeError, `unable to convert [] to string`)

  function none() {
    t.is(tar.textContent, ``)
    t.eq(tar.childNodes, [])
  }

  function some(val) {
    t.is(tar.textContent, val)
    t.eq(tar.childNodes, [val])
  }

  function reset(...val) {
    tar.textContent = undefined
    none()
    tar.append(...val)
  }

  none()

  tar.appendChild(`<script>alert("one")</script>`)
  some(`<script>alert("one")</script>`)

  tar.textContent = ``
  none()

  tar.appendChild(`two`)
  some(`two`)

  tar.textContent = undefined
  none()

  tar.appendChild(`three`)
  some(`three`)

  tar.textContent = null
  none()

  reset(10, null, 20, undefined, 30)
  t.is(tar.textContent, `102030`)

  reset(new URL(`https://example.com`))
  t.is(tar.textContent, `https://example.com/`)

  reset(new p.Raw(`str`))
  t.is(tar.textContent, ``)

  reset(`one `, new p.Raw(`two`), `three`)
  t.is(tar.textContent, `one three`)

  reset(new ds.Text(`<script>alert("four")</script>`))
  t.is(tar.textContent, `<script>alert("four")</script>`)

  reset(new ds.Comment(`comment`))
  t.is(tar.textContent, ``)

  reset({}, [], [{}, l.npo])
  t.is(tar.textContent, ``)

  reset({}, [], [{}, l.npo], `one`)
  t.is(tar.textContent, `one`)

  reset(fragOf(10), [fragOf(20, 30)])
  t.is(tar.textContent, `102030`)

  const inner = new ds.HTMLElement()
  inner.localName = `span`
  inner.append(
    `one `,
    [[new ds.Text(`two`)]],
    [` three`],
    new ds.Comment(`four`),
  )

  reset(inner)
  t.is(tar.textContent, `one two three`)
})

/*
Known limitation: the resulting element has incorrect `.textContent` because we
don't parse the given HTML.
*/
t.test(function test_Element_innerHTML() {
  const tar = new ds.Element()

  t.throws(() => tar.innerHTML = undefined, TypeError, `unable to convert undefined to string`)
  t.throws(() => tar.innerHTML = null, TypeError, `unable to convert null to string`)
  t.throws(() => tar.innerHTML = {}, TypeError, `unable to convert {} to string`)

  function none() {
    t.is(tar.innerHTML, ``)
    t.eq(tar.childNodes, [])
  }

  function reset(...val) {
    tar.innerHTML = ``
    none()
    tar.append(...val)
  }

  none()

  tar.textContent = `<script>alert("one")</script>`
  t.is(tar.innerHTML, `&lt;script&gt;alert("one")&lt;/script&gt;`)

  tar.innerHTML = `<script>alert("three")</script>`
  t.is(tar.innerHTML, `<script>alert("three")</script>`)

  reset()
  t.is(tar.innerHTML, ``)

  reset(undefined)
  t.is(tar.innerHTML, ``)

  reset(null)
  t.is(tar.innerHTML, ``)

  reset(``)
  t.is(tar.innerHTML, ``)

  reset([null, [undefined], ``])
  t.is(tar.innerHTML, ``)

  reset(fragOf(10), [fragOf(20, 30)])
  t.is(tar.innerHTML, `102030`)

  reset([null, [[[new ds.Comment(`comment`)], ``], undefined]])
  t.is(tar.innerHTML, `<!--comment-->`)

  reset(new ds.Text(`text`))
  t.is(tar.innerHTML, `text`)

  reset(`one `, new ds.Text(`two`), new p.Raw(` three`))
  t.is(tar.innerHTML, `one two three`)

  const inner = new ds.Element()
  inner.localName = `ins`
  inner.className = `cls`
  inner.append(new ds.Text(`one `), new p.Raw(`two`))
  t.is(inner.innerHTML, `one two`)

  reset(`three `, inner, ` `, 10)
  t.is(tar.innerHTML, `three <ins class="cls">one two</ins> 10`)
})

t.test(function test_Element_outerHTML() {
  const tar = new ds.Element()

  t.throws(() => tar.outerHTML, Error, `missing localName`)

  tar.localName = `span`
  eqm(tar, `<span></span>`)

  tar.id = `one`
  eqm(tar, `<span id="one"></span>`)

  tar.style = `two: three`
  eqm(tar, `<span id="one" style="two: three"></span>`)

  tar.style.four = `five`
  eqm(tar, `<span id="one" style="two: three; four: five;"></span>`)

  tar.className = `six`
  eqm(tar, `<span id="one" style="two: three; four: five;" class="six"></span>`)

  tar.dataset.seven = `eight`
  eqm(tar, `<span id="one" style="two: three; four: five;" class="six" data-seven="eight"></span>`)

  tar.hidden = true
  eqm(tar, `<span id="one" style="two: three; four: five;" class="six" data-seven="eight" hidden=""></span>`)

  tar.textContent = `nine`
  eqm(tar, `<span id="one" style="two: three; four: five;" class="six" data-seven="eight" hidden="">nine</span>`)

  const inner = new ds.Element()
  inner.localName = `ten`
  inner.className = `eleven`
  inner.textContent = `twelve`
  eqm(inner, `<ten class="eleven">twelve</ten>`)

  tar.append(` `, inner)
  eqm(tar, `<span id="one" style="two: three; four: five;" class="six" data-seven="eight" hidden="">nine <ten class="eleven">twelve</ten></span>`)
})

t.test(function test_xmlns_standalone() {
  const tar = new ds.Element()
  testNsExisting(tar)
})

t.test(function test_xmlns_inside_Document() {
  const tar = new ds.Element()
  tar.ownerDocument = ds.dom.createDocument(p.nsHtml, null, null)
  testNsExisting(tar)
})

t.test(function test_xmlns_inside_HTMLDocument() {
  const tar = new ds.Element()

  tar.ownerDocument = ds.document
  testNsMissing(tar)

  tar.ownerDocument = ds.dom.createHTMLDocument()
  testNsMissing(tar)
})

function testNsExisting(tar) {
  tar.localName = `one`

  tar.namespaceURI = p.nsHtml
  eqm(tar, `<one xmlns="http://www.w3.org/1999/xhtml"></one>`)

  tar.namespaceURI = p.nsSvg
  eqm(tar, `<one xmlns="http://www.w3.org/2000/svg"></one>`)

  tar.namespaceURI = p.nsMathMl
  eqm(tar, `<one xmlns="http://www.w3.org/1998/Math/MathML"></one>`)
}

function testNsMissing(tar) {
  tar.localName = `one`

  tar.namespaceURI = p.nsHtml
  eqm(tar, `<one></one>`)

  tar.namespaceURI = p.nsSvg
  eqm(tar, `<one></one>`)

  tar.namespaceURI = p.nsMathMl
  eqm(tar, `<one></one>`)
}

t.test(function test_xmlns_inside_parent() {
  const par = new ds.Element()
  par.localName = `parent`

  const chi = new ds.Element()
  chi.localName = `child`

  par.appendChild(chi)

  par.namespaceURI = p.nsHtml
  chi.namespaceURI = p.nsHtml
  eqm(par, `<parent xmlns="http://www.w3.org/1999/xhtml"><child></child></parent>`)

  par.namespaceURI = p.nsHtml
  chi.namespaceURI = p.nsSvg
  eqm(par, `<parent xmlns="http://www.w3.org/1999/xhtml"><child xmlns="http://www.w3.org/2000/svg"></child></parent>`)

  par.namespaceURI = p.nsSvg
  chi.namespaceURI = p.nsHtml
  eqm(par, `<parent xmlns="http://www.w3.org/2000/svg"><child xmlns="http://www.w3.org/1999/xhtml"></child></parent>`)

  par.namespaceURI = p.nsSvg
  chi.namespaceURI = p.nsSvg
  eqm(par, `<parent xmlns="http://www.w3.org/2000/svg"><child></child></parent>`)
})

/*
At the time of writing, this insanity matches browser implementations.

XML namespaces ARE part of the DOM standard. Non-HTML elements ARE frequently
embedded in HTML elements. However, HTML documents, as opposed to XML
documents, DO NOT support explicit namespacing. When serializing elements that
belong to an HTML document, the `xmlns` attribute is NOT automatically
generated. When parsing an HTML document, the `xmlns` attribute is IGNORED.
Namespaces are supported only through special-cased tags such as `svg`.
*/
t.test(function test_xmlns_svg_inside_html_inside_HTMLDocument() {
  const one = ds.document.createElement(`one`)
  const two = ds.document.createElementNS(p.nsSvg, `two`)
  const three = ds.document.createElementNS(p.nsSvg, `three`)
  const four = ds.document.createElementNS(p.nsHtml, `four`)

  one.appendChild(two)
  two.appendChild(three)
  three.appendChild(four)

  eqm(one, `<one><two><three><four></four></three></two></one>`)
})

t.test(function test_xmlns_several_layers() {
  const doc = ds.dom.createDocument(p.nsHtml, null, null)

  const one = doc.createElementNS(p.nsHtml, `one`)
  const two = doc.createElementNS(p.nsHtml, `two`)
  const three = doc.createElementNS(p.nsSvg, `three`)
  const four = doc.createElementNS(p.nsSvg, `four`)
  const five = doc.createElementNS(p.nsHtml, `five`)
  const six = doc.createElementNS(p.nsHtml, `six`)

  t.is(one.namespaceURI, p.nsHtml)
  t.is(two.namespaceURI, p.nsHtml)
  t.is(three.namespaceURI, p.nsSvg)
  t.is(four.namespaceURI, p.nsSvg)
  t.is(five.namespaceURI, p.nsHtml)
  t.is(six.namespaceURI, p.nsHtml)

  eqm(one, `<one xmlns="http://www.w3.org/1999/xhtml"></one>`)
  eqm(two, `<two xmlns="http://www.w3.org/1999/xhtml"></two>`)
  eqm(three, `<three xmlns="http://www.w3.org/2000/svg"></three>`)
  eqm(four, `<four xmlns="http://www.w3.org/2000/svg"></four>`)
  eqm(five, `<five xmlns="http://www.w3.org/1999/xhtml"></five>`)
  eqm(six, `<six xmlns="http://www.w3.org/1999/xhtml"></six>`)

  one.appendChild(two)
  two.appendChild(three)
  three.appendChild(four)
  four.appendChild(five)
  five.appendChild(six)

  eqm(one, `<one xmlns="http://www.w3.org/1999/xhtml"><two><three xmlns="http://www.w3.org/2000/svg"><four><five xmlns="http://www.w3.org/1999/xhtml"><six></six></five></four></three></two></one>`)
  eqm(two, `<two xmlns="http://www.w3.org/1999/xhtml"><three xmlns="http://www.w3.org/2000/svg"><four><five xmlns="http://www.w3.org/1999/xhtml"><six></six></five></four></three></two>`)
  eqm(three, `<three xmlns="http://www.w3.org/2000/svg"><four><five xmlns="http://www.w3.org/1999/xhtml"><six></six></five></four></three>`)
  eqm(four, `<four xmlns="http://www.w3.org/2000/svg"><five xmlns="http://www.w3.org/1999/xhtml"><six></six></five></four>`)
  eqm(five, `<five xmlns="http://www.w3.org/1999/xhtml"><six></six></five>`)
  eqm(six, `<six xmlns="http://www.w3.org/1999/xhtml"></six>`)
})

/*
See the comment on `test_xmlns_svg_inside_html_inside_HTMLDocument` for the
explanation why `xmlns` is not rendered here.
*/
t.test(function test_xmlns_several_layers_inside_HTMLDocument() {
  const doc = ds.document
  const one = doc.createElementNS(p.nsHtml, `one`)
  const two = doc.createElementNS(p.nsHtml, `two`)
  const three = doc.createElementNS(p.nsSvg, `three`)
  const four = doc.createElementNS(p.nsSvg, `four`)
  const five = doc.createElementNS(p.nsHtml, `five`)
  const six = doc.createElementNS(p.nsHtml, `six`)

  t.is(one.namespaceURI, p.nsHtml)
  t.is(two.namespaceURI, p.nsHtml)
  t.is(three.namespaceURI, p.nsSvg)
  t.is(four.namespaceURI, p.nsSvg)
  t.is(five.namespaceURI, p.nsHtml)
  t.is(six.namespaceURI, p.nsHtml)

  eqm(one, `<one></one>`)
  eqm(two, `<two></two>`)
  eqm(three, `<three></three>`)
  eqm(four, `<four></four>`)
  eqm(five, `<five></five>`)
  eqm(six, `<six></six>`)

  one.appendChild(two)
  two.appendChild(three)
  three.appendChild(four)
  four.appendChild(five)
  five.appendChild(six)

  eqm(one, `<one><two><three><four><five><six></six></five></four></three></two></one>`)
})

t.test(function test_HTMLAnchorElement() {
  const tar = new ds.HTMLAnchorElement()

  t.is(tar.protocol, ``)
  t.is(tar.origin, ``)
  t.is(tar.username, ``)
  t.is(tar.password, ``)
  t.is(tar.hostname, ``)
  t.is(tar.host, ``)
  t.is(tar.port, ``)
  t.is(tar.pathname, ``)
  t.is(tar.search, ``)
  t.is(tar.hash, ``)
  t.is(tar.href, ``)

  tar.href = `one://two:three@four.five:123/six?seven#eight`

  t.is(tar.protocol, `one://`)
  t.is(tar.origin, `one://four.five:123`)
  t.is(tar.username, `two`)
  t.is(tar.password, `three`)
  t.is(tar.hostname, `four.five`)
  t.is(tar.host, `four.five:123`)
  t.is(tar.port, `123`)
  t.is(tar.pathname, `/six`)
  t.is(tar.search, `seven`)
  t.is(tar.hash, `eight`)
  t.is(tar.href, `one://two:three@four.five:123/six?seven#eight`)
})

if (import.meta.main) console.log(`[test] ok!`)
