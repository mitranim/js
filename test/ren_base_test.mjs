import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as rb from '../ren_base.mjs'
import {A, P} from '../ren_base.mjs'

function testPropBuiConstructor(fun) {
  function test(src) {
    const out = fun(src)

    t.inst(out, rb.PropBui)
    t.isnt(out, src)

    t.own(out, {})
    testDerefOwn(out, src)
  }

  test({})
  test({one: 10})
  test({one: 10, two: 20})
}

function testDerefOwn(src, exp) {t.own(src.$, exp)}

t.test(function test_PropBui() {
  testPropBuiConstructor(val => new rb.PropBui(val))

  t.test(function test_set() {
    const ref = new rb.PropBui()

    t.throws(() => ref.set(), TypeError, `expected variant of isStr, got undefined`)
    t.throws(() => ref.set(10), TypeError, `expected variant of isStr, got 10`)

    t.is(ref.set(`one`, 10), ref)
    testDerefOwn(ref, {one: 10})

    t.is(ref.set(`two`, 20), ref)
    testDerefOwn(ref, {one: 10, two: 20})

    t.is(ref.set(`one`, 30), ref)
    testDerefOwn(ref, {one: 30, two: 20})
  })

  t.test(function test_cls() {
    t.throws(() => new rb.PropBui().cls(10), TypeError, `expected variant of isStr, got 10`)

    testDerefOwn(new rb.PropBui().cls(), {class: ``})
    testDerefOwn(new rb.PropBui().cls(`one`), {class: `one`})
    testDerefOwn(new rb.PropBui().cls(``).cls(`one`), {class: `one`})
    testDerefOwn(new rb.PropBui().cls(``).cls(`one`).cls(``), {class: `one`})
    testDerefOwn(new rb.PropBui().cls(`one`).cls(`two`), {class: `one two`})
  })

  t.test(function test_href() {
    testDerefOwn(new rb.PropBui().href(), {href: undefined})
    testDerefOwn(new rb.PropBui().href(`/one`), {href: `/one`})
  })

  t.test(function test_tarblan() {
    testDerefOwn(new rb.PropBui().tarblan(), {target: `_blank`, rel: `noopener noreferrer`})
  })
})

t.test(function test_A() {
  t.inst(A, rb.PropBui)

  t.test(function test_setter_methods() {
    function test(val, exp) {
      t.isnt(val, A)
      t.inst(val, rb.PropBui)
      testDerefOwn(val, exp)

      // Further method calls mutate the same instance.
      t.is(val.set(`994d2e`, `cac5c0`), val)
    }

    test(A.href(`/one`), {href: `/one`})
    test(A.cls(`two`), {class: `two`})
    test(A.href(`/one`).cls(`two`), {href: `/one`, class: `two`})
  })

  t.test(function test_mut() {
    function test(src) {
      const out = A.mut(src)
      t.isnt(out, A)
      testDerefOwn(out, {...src})
    }

    test()
    test({})
    test({one: 10})
    test({one: 10, two: 20})
  })
})

t.test(function test_P() {
  testPropBuiConstructor(P)

  t.test(function test_same_reference() {
    function test(val) {t.is(P(val), val)}

    test(P())
    test(new rb.PropBui())
    test(P({one: 10}))
    test(new rb.PropBui({one: 10}))
  })
})

if (import.meta.main) console.log(`[test] ok!`)
