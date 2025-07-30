import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ds from '../dom_shim.mjs'

const someDict = {}
const someArr = {}
const someNode = new ds.Node()
const someText = new ds.Node(`text`)
const someComment = new ds.Comment(`comment`)

const elemSimple = makeElemSimple()

function makeElemSimple() {return ds.document.createElement(`unknown`)}

const elemComplex = makeElemComplex()

function makeElemComplex() {
  const val = ds.document.createElement(`unknown`)
  val.className = `one`
  val.id = `one`
  val.hidden = true
  val.setAttribute(`two`, `three`)
  val.dataset.four = `five`
  val.style.display = `seven`

  val.append(
    `text0`, `text1`, `text2`, `text3`, `text4`, `text5`,
    `text6`, `text7`, `text8`, `text9`, `text10`, `text11`,
  )
  return val
}

const attrComplex = new ds.Attrs(elemComplex[ds.ATTRS].entries())

const style = new ds.Style(new ds.Element())
style.decode(`one: two; three: four; five: six`)
t.eq(style.dict, {one: `two`, three: `four`, five: `six`})

const miscVals = [
  false,
  10,
  `str`,
  Symbol(),
  l.Emp(),
  new Set(),
  new Map(),
  Promise.resolve(),
  new Date(),
  someDict,
  someArr,
  someNode,
  someText,
]

/* Bench */

// Deoptimize for benching.
miscVals.forEach(ds.isNode)
t.bench(function bench_isNode_miss_nil() {l.nop(ds.isNode())})
t.bench(function bench_isNode_miss_str() {l.nop(ds.isNode(`str`))})
t.bench(function bench_isNode_miss_num() {l.nop(ds.isNode(10))})
t.bench(function bench_isNode_miss_dict() {l.nop(ds.isNode(someDict))})
t.bench(function bench_isNode_miss_arr() {l.nop(ds.isNode(someArr))})
t.bench(function bench_isNode_hit_node() {l.nop(ds.isNode(someNode))})
t.bench(function bench_isNode_hit_text() {l.nop(ds.isNode(someText))})

t.bench(function bench_isElement_nil() {l.nop(ds.isElement())})
t.bench(function bench_isElement_miss_string() {l.nop(ds.isElement(`str`))})
t.bench(function bench_isElement_miss_number() {l.nop(ds.isElement(123))})
t.bench(function bench_isElement_miss_dict() {l.nop(ds.isElement(someDict))})
t.bench(function bench_isElement_miss_node() {l.nop(ds.isElement(someNode))})
t.bench(function bench_isElement_hit() {l.nop(ds.isElement(elemSimple))})

t.bench(function bench_document_domShim_baseClassByTag() {
  l.nop(ds.document.domShim_baseClassByTag(`span`))
})

t.bench(function bench_node_new_Node() {l.nop(new ds.Node())})
t.bench(function bench_node_hasChildNodes_empty() {l.nop(someNode.hasChildNodes())})

t.bench(function bench_new_Text() {l.nop(new ds.Text(`str`))})
t.bench(function bench_document_createTextNode() {l.nop(ds.document.createTextNode(`str`))})
t.bench(function bench_Text_textContent() {l.nop(someText.textContent)})
t.bench(function bench_Text_outerHTML() {l.nop(someText.outerHTML)})

t.bench(function bench_new_Comment() {l.nop(new ds.Comment(`str`))})
t.bench(function bench_document_createCommentNode() {l.nop(ds.document.createComment(`str`))})
t.bench(function bench_Comment_textContent() {l.nop(someComment.textContent)})
t.bench(function bench_Comment_outerHTML() {l.nop(someComment.outerHTML)})

t.bench(function bench_new_DocumentFragment() {l.nop(new ds.DocumentFragment())})
t.bench(function bench_document_createDocumentFragment() {l.nop(ds.document.createDocumentFragment())})

t.bench(function bench_NamedNodeMap_toString() {l.nop(attrComplex.toString())})

t.bench(function bench_Style_new() {l.nop(new ds.Style(elemSimple))})
t.bench(function bench_Style_encode() {l.nop(style.encode())})

t.bench(function bench_new_Element_simple_with_localName() {
  new ds.Element().localName = `unknown`
})

// Kinda slow, but faster than native DOM implementations at the time of writing.
t.bench(function bench_document_createElement_simple() {
  l.nop(ds.document.createElement(`unknown`))
})

t.bench(function bench_Element_style() {l.nop(new ds.Element().style)})

t.bench(function bench_elem_make_simple() {l.nop(makeElemSimple())})
t.bench(function bench_elem_outerHTML_simple() {l.nop(elemSimple.outerHTML)})
t.bench(function bench_elem_make_outerHTML_simple() {l.nop(makeElemSimple().outerHTML)})

t.bench(function bench_elem_make_complex() {l.nop(makeElemComplex())})
t.bench(function bench_elem_outerHTML_complex() {l.nop(elemComplex.outerHTML)})
t.bench(function bench_elem_make_outerHTML_complex() {l.nop(makeElemComplex().outerHTML)})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
