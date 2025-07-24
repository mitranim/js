/* global document */

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as d from '../dom.mjs'
import * as ds from '../dom_shim.mjs'

t.test(function test_isElement() {
  testIsElement(d.isElement)
  testIsElement(ds.isElement)
})

function testIsElement(fun) {
  t.no(fun(undefined))
  t.no(fun(`str`))
  t.no(fun(10))
  t.no(fun({}))
  t.no(fun([]))
  t.no(fun(Promise.resolve()))
  t.no(fun(document))
  t.no(fun(l.nop))

  t.no(fun(document.createComment(`str`)))
  t.no(fun(document.createTextNode(`str`)))
  t.no(fun(document.createDocumentFragment()))

  t.no(fun(ds.document.createComment(`str`)))
  t.no(fun(ds.document.createTextNode(`str`)))
  t.no(fun(ds.document.createDocumentFragment()))

  t.ok(fun(document.body))
  t.ok(fun(document.createElement(`div`)))

  // Causes an "illegal invocation" error when accessing `.nodeType`.
  // t.ok(fun(Element.prototype))

  t.ok(fun(ds.document.body))
  t.ok(fun(ds.document.createElement(`div`)))
  t.ok(fun(ds.Element.prototype))
}
