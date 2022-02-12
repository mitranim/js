import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as dr from '../dom_reg.mjs'

t.test(function test_cer() {
  class Elem {}
  dr.cer.define(`some-elem`, Elem)

  testCerMatch(Elem, `some-elem`)
  testCerSize(1)

  t.throws(() => dr.cer.define(`some-elem`, Elem), Error, `redundant registration of "some-elem"`)
  t.throws(() => dr.cer.define(`some-elem`, Object), Error, `redundant registration of "some-elem"`)
})

// The test is incomplete: in environments that support the `customElements`
// global, we should also verify that this re-exports it _and_ patches it.
t.test(function test_customElements() {
  t.is(dr.customElements, globalThis.customElements ?? dr.cer)
})

t.test(function test_reg() {
  dr.cer.clear()

  t.test(function test_nop_for_base() {
    dr.reg(dr.HTMLElement)
    t.no(dr.cer.hasCls(dr.HTMLElement))

    dr.reg(dr.HTMLDetailsElement)
    t.no(dr.cer.hasCls(dr.HTMLDetailsElement))
  })

  t.test(function test_multiple_sequential_regs() {
    class Details extends dr.HTMLDetailsElement {}

    function test0() {
      dr.reg(Details)
      testCerMatch(Details, `a-details`)
      testCerSize(1)
    }

    test0()
    test0()
    test0()

    class SomeBtn extends dr.HTMLButtonElement {}

    function test1() {
      l.nop(new SomeBtn())
      testCerMatch(SomeBtn, `some-btn`)
      testCerSize(2)
    }

    test1()
    test1()
    test1()

    t.throws(() => dr.customElements.define(`some-btn`, SomeBtn), Error, `redundant registration of "some-btn"`)

    class SubBtn123 extends SomeBtn {}

    function test2() {
      l.nop(new SubBtn123())
      testCerMatch(SubBtn123, `sub-btn123`)
      testCerSize(3)
    }

    test2()
    test2()
    test2()
  })

  t.test(function test_salting() {
    dr.cer.clear()
    testCerSize(0)

    {
      class SomeBtn extends dr.HTMLButtonElement {}
      dr.reg(SomeBtn)

      testCerMatch(SomeBtn, `some-btn`)
      testCerSize(1)
    }

    {
      class SomeBtn extends dr.HTMLButtonElement {}
      dr.reg(SomeBtn)

      testCerMatch(SomeBtn, `some-btn-0`)
      testCerSize(2)
    }

    {
      class SomeBtn extends dr.HTMLButtonElement {}
      dr.reg(SomeBtn)

      testCerMatch(SomeBtn, `some-btn-1`)
      testCerSize(3)
    }
  })
})

function testCerMatch(cls, tag) {
  t.ok(dr.cer.hasTag(tag))
  t.ok(dr.cer.hasCls(cls))
  t.is(dr.cer.clsTag(cls), tag)
  t.is(dr.cer.tagCls(tag), cls)
}

function testCerSize(len) {
  t.is(dr.cer.clsToTag.size, len)
  t.is(dr.cer.tagToCls.size, len)
}

// TODO: test all base classes exported by this package. Can probably find them
// by iterating module exports.
t.test(function test_HTMLElement() {
  dr.cer.clear()

  class Sub extends dr.HTMLElement {}
  l.nop(new Sub())

  testCerMatch(Sub, `a-sub`)
  testCerSize(1)
})

if (import.meta.main) console.log(`[test] ok!`)
