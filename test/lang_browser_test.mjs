/* global document */

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'

// Also see `lang_test.mjs`.`test_isSeq`.
t.test(function test_isSeq() {
  t.test(function test_isSeq_NodeList() {
    t.ok(l.isSeq(document.body.childNodes))
  })

  t.test(function test_isSeq_HTMLCollection() {
    t.ok(l.isSeq(document.body.children))
  })
})
