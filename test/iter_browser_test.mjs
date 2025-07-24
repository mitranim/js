/* global document, NodeList, HTMLCollection, DocumentFragment */

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'

// Also see `iter_test.mjs`.`test_arr`.
t.test(function test_arr() {
  t.test(function test_arr_from_NodeList() {
    const src = makeNodeList(`one`, `two`, `three`)
    t.inst(src, NodeList)
    const tar = i.arr(src)

    t.ok(l.isTrueArr(tar))
    t.eq(tar.map(toTextContent), [`one`, `two`, `three`])
  })

  t.test(function test_arr_from_HTMLCollection() {
    const src = makeHtmlCollection(`one`, `two`, `three`)
    t.inst(src, HTMLCollection)
    const tar = i.arr(src)

    t.ok(l.isTrueArr(tar))
    t.eq(tar.map(toTextContent), [`one`, `two`, `three`])
  })
})

function toTextContent(val) {return val.textContent}

function makeNodeList(...src) {
  const tar = new DocumentFragment()
  tar.append(...src)
  return tar.childNodes
}

function makeHtmlCollection(...src) {
  const tar = new DocumentFragment()
  tar.append(...src.map(toSpan))
  return tar.children
}

function toSpan(src) {
  const tar = document.createElement(`span`)
  tar.textContent = src
  return tar
}
