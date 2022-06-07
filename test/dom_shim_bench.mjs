import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as ds from '../dom_shim.mjs'

const text = new ds.Text(`str`)
const comment = new ds.Comment(`str`)

const elemSimple = makeSimple()

function makeSimple() {return ds.document.createElement(`unknown`)}

const elemComplex = makeComplex()

// At the time of writing, `style` is the bottleneck, followed by `dataset`.
function makeComplex() {
  const val = ds.document.createElement(`unknown`)
  val.className = `one`
  val.id = `one`
  val.hidden = true
  val.setAttribute(`two`, `three`)
  val.dataset.four = `five`
  val.style.display = `seven`
  val.textContent = `eight`
  return val
}

const attrComplex = new ds.NamedNodeMap(elemComplex.attributes.entries())

const style = new ds.StylePh(new ds.Element())
style.decode(`one: two; three: four; five: six`)
t.eq(style.buf, {one: `two`, three: `four`, five: `six`})

/* Bench */

t.bench(function bench_document_baseClassByTag() {
  l.nop(ds.document.baseClassByTag(`span`))
})

t.bench(function bench_new_Node() {l.nop(new ds.Node())})

t.bench(function bench_new_Text() {l.nop(new ds.Text(`str`))})
t.bench(function bench_document_createTextNode() {l.nop(ds.document.createTextNode(`str`))})
t.bench(function bench_Text_textContent() {l.nop(text.textContent)})
t.bench(function bench_Text_outerHTML() {l.nop(text.outerHTML)})

t.bench(function bench_new_Comment() {l.nop(new ds.Comment(`str`))})
t.bench(function bench_document_createCommentNode() {l.nop(ds.document.createComment(`str`))})
t.bench(function bench_Comment_textContent() {l.nop(comment.textContent)})
t.bench(function bench_Comment_outerHTML() {l.nop(comment.outerHTML)})

t.bench(function bench_new_DocumentFragment() {l.nop(new ds.DocumentFragment())})
t.bench(function bench_document_createDocumentFragment() {l.nop(ds.document.createDocumentFragment())})

t.bench(function bench_NamedNodeMap_toString() {l.nop(attrComplex.toString())})

t.bench(function bench_StylePh_new() {l.nop(new ds.StylePh(elemSimple))})
t.bench(function bench_StylePh_encode() {l.nop(style.encode())})

t.bench(function bench_new_Element_simple_with_localName() {
  new ds.Element().localName = `unknown`
})

// Kinda slow, but faster than native DOM implementations at the time of writing.
t.bench(function bench_document_createElement_simple() {
  l.nop(ds.document.createElement(`unknown`))
})

t.bench(function bench_Element_style() {l.nop(new ds.Element().style)})

t.bench(function bench_elem_make_simple() {l.nop(makeSimple())})
t.bench(function bench_elem_outerHTML_simple() {l.nop(elemSimple.outerHTML)})
t.bench(function bench_elem_make_outerHTML_simple() {l.nop(makeSimple().outerHTML)})

t.bench(function bench_elem_make_complex() {l.nop(makeComplex())})
t.bench(function bench_elem_outerHTML_complex() {l.nop(elemComplex.outerHTML)})
t.bench(function bench_elem_make_outerHTML_complex() {l.nop(makeComplex().outerHTML)})

if (import.meta.main) t.deopt(), t.benches()
