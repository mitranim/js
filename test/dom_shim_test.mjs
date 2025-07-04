import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as p from '../prax.mjs'
import * as ds from '../dom_shim.mjs'
import {eqm} from './prax_test.mjs'

/* Utils */

const dom = ds.document.implementation
function unreachable() {throw Error(`unreachable`)}
const unstringablesLax = [{}, [], Promise.resolve(), unreachable]
const unstringablesStrict = [undefined, null, ...unstringablesLax]

function failUnstringable(fun, src = unstringablesStrict) {
  for (const val of src) {
    t.throws(() => {fun(val)}, TypeError, `unable to convert ${l.show(val)} to string`)
  }
}

function fragOf(...val) {
  const buf = new ds.DocumentFragment()
  buf.append(...val)
  return buf
}

function textOf(tar, src) {
  const out = new ds.Text(src)
  out.parentNode = tar
  return out
}

function toTextContent(src) {return l.reqStr(src.textContent)}

/* Tests */

t.test(function test_Node_empty() {
  const tar = new ds.Node()

  t.no(tar.isConnected)
  t.is(tar.parentNode, null)
  t.is(tar.parentElement, null)
  t.eq(tar.childNodes, [])
  t.is(tar.childNodes, tar.childNodes)
  t.is(tar.firstChild, null)
  t.is(tar.lastChild, null)
  t.is(tar.previousSibling, null)
  t.is(tar.nextSibling, null)
  t.is(tar.ownerDocument, null)
  t.is(tar.nodeName, null)
  t.is(tar.nodeType, null)
  t.is(tar.nodeValue, null)
})

t.test(function test_owner_document() {
  function test(cls) {
    const node = new cls()
    t.is(node.ownerDocument, null)

    ds.document.adoptNode(node)
    t.is(node.ownerDocument, ds.document)
  }

  test(ds.Node)
  test(ds.Text)
  test(ds.Comment)

  t.is(ds.document.createElement(`div`).ownerDocument, ds.document)
})

t.test(function test_Node_childNodes() {
  const tar = new ds.Node()
  const nodes = tar.childNodes
  t.eq(nodes, [])

  t.is(tar.childNodes, nodes)
  t.is(tar.childNodes, nodes)

  nodes.push(10)
  t.eq(tar.childNodes, [10])
})

t.test(function test_Node_hasChildNodes() {
  const tar = new ds.Node()
  t.no(tar.hasChildNodes())

  t.is(tar.childNodes.length, 0)
  t.no(tar.hasChildNodes())

  const chi = new ds.Text(NaN)
  t.is(chi.data, `NaN`)

  t.is(tar.appendChild(chi), chi)
  t.ok(tar.hasChildNodes())
  t.is(chi.parentNode, tar)

  tar.removeChild(chi)
  t.no(tar.hasChildNodes())
  t.is(chi.parentNode, null)
})

t.test(function test_Node_contains() {
  const tar = new ds.Node()
  const one = new ds.Text()
  const two = new ds.Text(`two`)

  t.no(tar.contains(one))
  t.no(tar.contains(two))

  tar.childNodes.push(one)

  t.ok(tar.contains(one))
  t.no(tar.contains(two))

  t.is(one.parentNode, null)
  t.is(two.parentNode, null)

  tar.childNodes.push(two)
  t.ok(tar.contains(one))
  t.ok(tar.contains(two))

  t.is(one.parentNode, null)
  t.is(two.parentNode, null)
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
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)
  const three = new ds.Comment(`three`)

  t.throws(() => tar.appendChild(), TypeError, `expected variant of isNode, got undefined`)
  t.throws(() => tar.appendChild(10), TypeError, `expected variant of isNode, got 10`)
  t.throws(() => tar.appendChild(`one`), TypeError, `expected variant of isNode, got "one"`)

  t.eq(tar.childNodes, [])

  t.is(tar.appendChild(one), one)
  t.eq(tar.childNodes, [one])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, null)
  t.is(three.parentNode, null)

  t.is(tar.appendChild(one), one)
  t.eq(tar.childNodes, [one])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, null)
  t.is(three.parentNode, null)

  t.is(tar.appendChild(two), two)
  t.eq(tar.childNodes, [one, two])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, null)

  t.is(tar.appendChild(three), three)
  t.eq(tar.childNodes, [one, two, three])
  t.is(three.parentNode, tar)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, tar)

  t.is(tar.appendChild(three), three)
  t.eq(tar.childNodes, [one, two, three])
  t.is(three.parentNode, tar)

  t.is(tar.appendChild(one), one)
  t.is(one.parentNode, tar)
  t.eq(tar.childNodes, [two, three, one])

  t.is(tar.appendChild(three), three)
  t.is(three.parentNode, tar)
  t.eq(tar.childNodes, [two, one, three])

  t.is(tar.parentNode, null)

  // Verify that the test tool compares them properly.
  t.notEq(tar.childNodes, [one, two, three])
  t.notEq(tar.childNodes, [one, three, two])
})

t.test(function test_Node_removeChild() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Comment(`two`)

  // Intentionally not implemented.
  //
  // t.throws(() => tar.removeChild(one), Error, `missing child [object Text]`)

  tar.appendChild(one)
  t.is(one.parentNode, tar)

  tar.appendChild(two)
  t.is(two.parentNode, tar)

  t.eq(tar.childNodes, [one, two])

  tar.removeChild(one)
  t.is(one.parentNode, null)
  t.eq(tar.childNodes, [two])

  tar.removeChild(two)
  t.is(two.parentNode, null)
  t.eq(tar.childNodes, [])
})

t.test(function test_Node_replaceChild() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)
  const three = new ds.Text(`three`)

  t.is(tar.appendChild(one), one)
  t.is(tar.appendChild(two), two)

  t.eq(tar.childNodes, [one, two])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, null)

  function fail(val) {
    t.throws(() => tar.replaceChild(val, three), TypeError, `expected variant of isNode, got ` + l.show(val))
  }

  fail(undefined)
  fail(null)
  fail(false)
  fail(true)
  fail(10)
  fail(`one`)

  t.is(tar.replaceChild(three, one), one)

  t.eq(tar.childNodes, [three, two])
  t.is(one.parentNode, null)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, tar)

  t.is(tar.replaceChild(one, two), two)

  t.eq(tar.childNodes, [three, one])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, null)
  t.is(three.parentNode, tar)
})

t.test(function test_Node_insertBefore() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)
  const three = new ds.Text(`three`)

  function fail(val) {
    t.throws(() => tar.insertBefore(val, three), TypeError, `expected variant of isNode, got ` + l.show(val))
  }

  fail(undefined)
  fail(null)
  fail(false)
  fail(true)
  fail(10)
  fail(`one`)

  t.is(tar.insertBefore(one, null), one)
  t.eq(tar.childNodes, [one])
  t.is(one.parentNode, tar)

  t.is(tar.insertBefore(two, null), two)
  t.eq(tar.childNodes, [one, two])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)

  t.is(tar.insertBefore(three, two), three)
  t.eq(tar.childNodes, [one, three, two])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, tar)

  t.is(tar.insertBefore(three, one), three)
  t.eq(tar.childNodes, [three, one, two])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, tar)
})

// Uses `.appendChild`, this is just a sanity check.
t.test(function test_Node_append() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const three = new ds.Comment(`three`)

  t.is(tar.append(one, `two`, three), undefined)

  t.is(one.parentNode, tar)
  t.is(three.parentNode, tar)

  t.eq(tar.childNodes, [one, textOf(tar, `two`), three])
})

t.test(function test_Node_prepend() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = textOf(tar, `two`)
  const three = new ds.Comment(`three`)
  const four = new ds.Comment(`four`)

  t.is(tar.prepend(one, `two`), undefined)
  t.eq(tar.childNodes, [one, two])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)

  t.is(tar.prepend(three, four), undefined)
  t.eq(tar.childNodes, [three, four, one, two])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, tar)
  t.is(four.parentNode, tar)

  t.is(tar.prepend(...tar.childNodes), undefined)
  t.eq(tar.childNodes, [three, four, one, two])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, tar)
  t.is(four.parentNode, tar)
})

t.test(function test_Node_remove() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Comment(`two`)
  const three = new ds.Text(`three`)

  tar.append(one, two, three)
  t.eq(tar.childNodes, [one, two, three])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, tar)
  t.is(three.parentNode, tar)

  two.remove()
  t.eq(tar.childNodes, [one, three])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, null)
  t.is(three.parentNode, tar)

  three.remove()
  t.eq(tar.childNodes, [one])
  t.is(one.parentNode, tar)
  t.is(two.parentNode, null)
  t.is(three.parentNode, null)

  one.remove()
  t.eq(tar.childNodes, [])
  t.is(one.parentNode, null)
  t.is(two.parentNode, null)
  t.is(three.parentNode, null)
})

t.test(function test_Node_after() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)
  const three = new ds.Text(`three`)
  const four = new ds.Text(`four`)

  function test(...exp) {
    t.is(tar.textContent, exp.map(toTextContent).join(``))
    t.eq(tar.childNodes, exp)

    tar.append(one, two, three, four)
    t.is(tar.textContent, `onetwothreefour`)
    t.eq(tar.childNodes, [one, two, three, four])
  }

  tar.append(one, two, three, four)
  test(one, two, three, four)

  failUnstringable(val => one.after(val))

  one.after()
  test(one, two, three, four)

  one.after(one)
  test(one, two, three, four)

  one.after(one, one)
  test(one, two, three, four)

  one.after(two)
  test(one, two, three, four)

  one.after(two, two)
  test(one, two, three, four)

  one.after(two, three)
  test(one, two, three, four)

  one.after(two, two, three, three)
  test(one, two, three, four)

  one.after(two, three, two, three)
  test(one, two, three, four)

  one.after(two, three, two, three, two, three)
  test(one, two, three, four)

  one.after(two, three, four)
  test(one, two, three, four)

  one.after(three)
  test(one, three, two, four)

  one.after(three, three)
  test(one, three, two, four)

  one.after(three, two)
  test(one, three, two, four)

  one.after(three, three, two, two)
  test(one, three, two, four)

  one.after(three, two, three, two)
  test(one, three, two, four)

  one.after(three, four)
  test(one, three, four, two)

  one.after(three, four, three, four)
  test(one, three, four, two)

  one.after(three, three, four, four)
  test(one, three, four, two)

  one.after(four)
  test(one, four, two, three)

  one.after(four, four)
  test(one, four, two, three)

  one.after(four, two)
  test(one, four, two, three)

  one.after(four, four, two, two)
  test(one, four, two, three)

  one.after(four, two, four, two)
  test(one, four, two, three)

  two.after()
  test(one, two, three, four)

  two.after(two)
  test(one, two, three, four)

  two.after(two, two)
  test(one, two, three, four)

  two.after(two, three)
  test(one, two, three, four)

  two.after(two, three, three)
  test(one, two, three, four)

  two.after(two, two, three, three)
  test(one, two, three, four)

  two.after(two, three, two, three)
  test(one, two, three, four)

  two.after(two, three, four)
  test(one, two, three, four)

  two.after(one)
  test(two, one, three, four)

  two.after(one, one)
  test(two, one, three, four)

  two.after(two, one)
  test(two, one, three, four)

  two.after(two, two, one, one)
  test(two, one, three, four)

  two.after(two, one, two, one)
  test(two, one, three, four)

  two.after(one, two)
  test(one, two, three, four)

  two.after(one, one, two, two)
  test(one, two, three, four)

  two.after(one, two, one, two)
  test(one, two, three, four)

  three.after()
  test(one, two, three, four)

  three.after(three)
  test(one, two, three, four)

  three.after(one)
  test(two, three, one, four)

  three.after(one, two)
  test(three, one, two, four)

  three.after(one, two, four)
  test(three, one, two, four)

  three.after(four)
  test(one, two, three, four)

  four.after()
  test(one, two, three, four)

  four.after(four)
  test(one, two, three, four)

  four.after(four, four)
  test(one, two, three, four)

  four.after(one)
  test(two, three, four, one)

  four.after(one, one)
  test(two, three, four, one)

  four.after(one, two)
  test(three, four, one, two)

  four.after(one, one, two, two)
  test(three, four, one, two)

  four.after(one, two, three)
  test(four, one, two, three)

  four.after(three, two, one)
  test(four, three, two, one)
})

t.test(function test_Node_getRootNode() {
  const tar = new ds.Element()
  t.is(tar.getRootNode(), tar)

  const mid = new ds.Node()
  t.is(mid.getRootNode(), mid)

  const bot = new ds.Text(`str`)
  t.is(bot.getRootNode(), bot)

  tar.appendChild(mid)
  mid.appendChild(bot)

  t.is(tar.getRootNode(), tar)
  t.is(mid.getRootNode(), tar)
  t.is(bot.getRootNode(), tar)
})

t.test(function test_Node_isConnected() {
  const child = new ds.Node()
  t.no(child.isConnected)

  const parent = new ds.Element()
  t.no(parent.isConnected)

  parent.appendChild(child)
  t.no(child.isConnected)
  t.no(parent.isConnected)

  const doc = dom.createHTMLDocument()
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
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)

  t.is(tar.firstChild, null)

  tar.appendChild(one)
  t.is(tar.firstChild, one)

  tar.appendChild(two)
  t.is(tar.firstChild, one)
})

t.test(function test_Node_lastChild() {
  const tar = new ds.Node()
  const one = new ds.Text(`one`)
  const two = new ds.Text(`two`)

  t.is(tar.lastChild, null)

  tar.appendChild(one)
  t.is(tar.lastChild, one)

  tar.appendChild(two)
  t.is(tar.lastChild, two)
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

  const doc = dom.createHTMLDocument()

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

  failUnstringable(val => new Cls(val))

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
    valid(new Cls(src), l.render(src), exp)

    {
      const tar = new Cls()
      tar.data = src
      valid(tar, l.render(src), exp)
    }

    {
      const tar = new Cls()
      tar.nodeValue = src
      valid(tar, l.render(src), exp)
    }

    {
      const tar = new Cls()
      tar.textContent = src
      valid(tar, l.render(src), exp)
    }
  }

  valid(new Cls(), ``, ``)

  test(``, ``)
  test(false, `false`)
  test(true, `true`)
  test(NaN, `NaN`)
  test(-0, `0`)
  test(10, `10`)
  test(`one`, `one`)
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

    failUnstringable(val => tar.set(val, `str`))
    failUnstringable(val => tar.set(`str`, val))

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

    See comment on `ds.escapeAttr`.
    */
    t.is(
      new ds.NamedNodeMap([[
        `one`,
        `"><script>alert("two")</script><span `
      ]]).toString(),
      ` one="&quot;&gt;&lt;script&gt;alert(&quot;two&quot;)&lt;/script&gt;&lt;span "`,
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

  tar.namespaceURI = p.NS_SVG
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
    t.is(tar.con, con)
    t.is(tar.dis, dis)
  }

  const body = dom.createHTMLDocument().body

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
  const tar = new ds.Element()
  tar.localName = `tar`

  const one = new ds.Text(`one`)

  const two = new ds.Element()
  two.localName = `two`

  const three = new ds.Comment(`three`)

  const four = new ds.Element()
  four.localName = `four`

  t.eq(tar.children, [])

  tar.appendChild(one)
  t.eq(tar.children, [])

  tar.appendChild(two)
  t.eq(tar.children, [two])

  tar.appendChild(three)
  t.eq(tar.children, [two])

  tar.appendChild(four)
  t.eq(tar.children, [two, four])
})

t.test(function test_Element_attributes() {
  const tar = new ds.Element()

  failUnstringable(val => tar.setAttribute(val, `str`))
  failUnstringable(val => tar.setAttribute(`str`, val))

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

  failUnstringable(val => tar.className = val)

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

  failUnstringable((val => tar.tabIndex = val), unstringablesLax)

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

  tar.tabIndex = undefined
  test(0, `0`)

  tar.removeAttribute(`tabindex`)
  test(0, null)

  tar.tabIndex = null
  test(0, `0`)

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

  /*
  In the actual DOM API, setting `.textContent = null` is equivalent to setting
  an empty string. But not `undefined`, which becomes `"undefined"`. Treating
  the two nil values differently is far too gotcha-prone, so we forbid both,
  just like everywhere else.
  */
  failUnstringable(val => tar.textContent = val)

  const text = l.bind(textOf, tar)

  function test(...src) {
    t.is(tar.textContent, src.map(l.render).join(``))
    t.eq(tar.childNodes, src.map(text))
  }

  function reset(...src) {
    tar.textContent = ``
    test()
    tar.append(...src)
  }

  test()

  tar.append(`<script>alert("one")</script>`)
  test(`<script>alert("one")</script>`)

  tar.textContent = ``
  test()

  tar.append(`t`, `w`, `o`)
  test(`t`, `w`, `o`)

  tar.textContent = ``
  test()

  tar.append(`three`)
  test(`three`)

  tar.append(`four`, `five`)
  test(`three`, `four`, `five`)

  reset()
  test()

  reset(10, 20, 30)
  t.is(tar.textContent, `102030`)

  reset(new URL(`https://example.com`))
  t.is(tar.textContent, `https://example.com/`)

  reset(`one`)
  t.is(tar.textContent, `one`)

  reset(`one`, `_`, `two`)
  t.is(tar.textContent, `one_two`)

  reset(new ds.Text(`<script>alert("one")</script>`))
  t.is(tar.textContent, `<script>alert("one")</script>`)

  reset(new ds.Comment(`comment`))
  t.is(tar.textContent, ``)

  reset(fragOf(10), fragOf(20, 30))
  t.is(tar.textContent, `102030`)

  const inner = new ds.global.HTMLElement()
  inner.localName = `span`

  inner.append(
    `one `,
    new ds.Text(`two`),
    ` three`,
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

  failUnstringable(val => tar.innerHTML = val)

  const text = l.bind(textOf, tar)

  function test(...src) {
    t.is(tar.innerHTML, src.map(l.render).join(``))
    t.eq(tar.childNodes, src.map(text))
  }

  function reset(...src) {
    tar.innerHTML = ``
    test()
    tar.append(...src)
  }

  test()

  tar.textContent = `<script>alert("one")</script>`
  t.is(tar.innerHTML, `&lt;script&gt;alert("one")&lt;/script&gt;`)

  tar.innerHTML = `<script>alert("three")</script>`
  t.is(tar.innerHTML, `<script>alert("three")</script>`)

  reset()
  t.is(tar.innerHTML, ``)

  reset(``)
  t.is(tar.innerHTML, ``)

  reset(fragOf(10), fragOf(20, 30))
  t.is(tar.innerHTML, `102030`)

  reset(new ds.Comment(`one`))
  t.is(tar.innerHTML, `<!--one-->`)

  reset(`one`, new ds.Comment(`two`), `three`, new ds.Comment(`four`))
  t.is(tar.innerHTML, `one<!--two-->three<!--four-->`)

  reset(new ds.Text(`text`))
  t.is(tar.innerHTML, `text`)

  reset(new ds.Text(`one`), `_`, new ds.Text(`two`))
  t.is(tar.innerHTML, `one_two`)

  const inner = new ds.Element()
  inner.localName = `ins`
  inner.className = `cls`
  inner.append(new ds.Text(`three`), new ds.Text(`_`), `four`)
  t.is(inner.innerHTML, `three_four`)

  reset(`one `, inner, ` `, 10)
  t.is(tar.innerHTML, `one <ins class="cls">three_four</ins> 10`)
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
  tar.ownerDocument = dom.createDocument(p.NS_HTML, null, null)
  testNsExisting(tar)
})

t.test(function test_xmlns_inside_HTMLDocument() {
  const tar = new ds.Element()

  tar.ownerDocument = ds.document
  testNsMissing(tar)

  tar.ownerDocument = dom.createHTMLDocument()
  testNsMissing(tar)
})

function testNsExisting(tar) {
  tar.localName = `one`

  tar.namespaceURI = p.NS_HTML
  eqm(tar, `<one xmlns="http://www.w3.org/1999/xhtml"></one>`)

  tar.namespaceURI = p.NS_SVG
  eqm(tar, `<one xmlns="http://www.w3.org/2000/svg"></one>`)

  tar.namespaceURI = p.NS_MATH_ML
  eqm(tar, `<one xmlns="http://www.w3.org/1998/Math/MathML"></one>`)
}

function testNsMissing(tar) {
  tar.localName = `one`

  tar.namespaceURI = p.NS_HTML
  eqm(tar, `<one></one>`)

  tar.namespaceURI = p.NS_SVG
  eqm(tar, `<one></one>`)

  tar.namespaceURI = p.NS_MATH_ML
  eqm(tar, `<one></one>`)
}

t.test(function test_xmlns_inside_parent() {
  const par = new ds.Element()
  par.localName = `parent`

  const chi = new ds.Element()
  chi.localName = `child`

  par.appendChild(chi)

  par.namespaceURI = p.NS_HTML
  chi.namespaceURI = p.NS_HTML
  eqm(par, `<parent xmlns="http://www.w3.org/1999/xhtml"><child></child></parent>`)

  par.namespaceURI = p.NS_HTML
  chi.namespaceURI = p.NS_SVG
  eqm(par, `<parent xmlns="http://www.w3.org/1999/xhtml"><child xmlns="http://www.w3.org/2000/svg"></child></parent>`)

  par.namespaceURI = p.NS_SVG
  chi.namespaceURI = p.NS_HTML
  eqm(par, `<parent xmlns="http://www.w3.org/2000/svg"><child xmlns="http://www.w3.org/1999/xhtml"></child></parent>`)

  par.namespaceURI = p.NS_SVG
  chi.namespaceURI = p.NS_SVG
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
  const two = ds.document.createElementNS(p.NS_SVG, `two`)
  const three = ds.document.createElementNS(p.NS_SVG, `three`)
  const four = ds.document.createElementNS(p.NS_HTML, `four`)

  one.appendChild(two)
  two.appendChild(three)
  three.appendChild(four)

  eqm(one, `<one><two><three><four></four></three></two></one>`)
})

t.test(function test_xmlns_several_layers() {
  const doc = dom.createDocument(p.NS_HTML, null, null)

  const one = doc.createElementNS(p.NS_HTML, `one`)
  const two = doc.createElementNS(p.NS_HTML, `two`)
  const three = doc.createElementNS(p.NS_SVG, `three`)
  const four = doc.createElementNS(p.NS_SVG, `four`)
  const five = doc.createElementNS(p.NS_HTML, `five`)
  const six = doc.createElementNS(p.NS_HTML, `six`)

  t.is(one.namespaceURI, p.NS_HTML)
  t.is(two.namespaceURI, p.NS_HTML)
  t.is(three.namespaceURI, p.NS_SVG)
  t.is(four.namespaceURI, p.NS_SVG)
  t.is(five.namespaceURI, p.NS_HTML)
  t.is(six.namespaceURI, p.NS_HTML)

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
  const one = doc.createElementNS(p.NS_HTML, `one`)
  const two = doc.createElementNS(p.NS_HTML, `two`)
  const three = doc.createElementNS(p.NS_SVG, `three`)
  const four = doc.createElementNS(p.NS_SVG, `four`)
  const five = doc.createElementNS(p.NS_HTML, `five`)
  const six = doc.createElementNS(p.NS_HTML, `six`)

  t.is(one.namespaceURI, p.NS_HTML)
  t.is(two.namespaceURI, p.NS_HTML)
  t.is(three.namespaceURI, p.NS_SVG)
  t.is(four.namespaceURI, p.NS_SVG)
  t.is(five.namespaceURI, p.NS_HTML)
  t.is(six.namespaceURI, p.NS_HTML)

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
  const tar = new ds.global.HTMLAnchorElement()

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

t.test(function test_CustomElementRegistry() {
  const reg = new ds.CustomElementRegistry()

  class Empty extends l.Emp {}
  reg.define(`one-two`, Empty)

  t.test(function test_invalid() {
    t.throws(() => reg.define(), TypeError, `expected variant of isCustomName, got undefined`)
    t.throws(() => reg.define(`one`, Empty), TypeError, `expected variant of isCustomName, got "one"`)
    t.throws(() => reg.define(`one-two`, 10), TypeError, `expected variant of isFun, got 10`)
  })

  t.test(function test_redundant() {
    t.throws(() => reg.define(`one-two`, Empty), Error, `redundant registration of "one-two"`)
    t.throws(() => reg.define(`two-three`, Empty), Error, `redundant registration of [function Empty]`)
  })

  t.test(function test_get() {
    t.is(reg.get(`one-two`), Empty)
    t.is(reg.get(`two-three`), undefined)
  })
})

if (import.meta.main) console.log(`[test] ok!`)
