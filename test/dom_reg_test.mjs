import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'
import * as d from '../dom.mjs'
import * as dr from '../dom_reg.mjs'

/* Util */

function testCerMatch(cer, cls, tag) {
  t.ok(cer.hasTag(tag))
  t.ok(cer.hasCls(cls))
  t.is(cer.clsTag(cls), tag)
  t.is(cer.tagCls(tag), cls)
}

function testCerSize(cer, len) {
  t.is(cer.clsToTag.size, len)
  t.is(cer.tagToCls.size, len)
}

/*
Not part of public module because it would be a waste of code.
This "inheritance" between registries is relevant only for testing.
*/
function makeCer() {
  const out = new dr.CustomElementRegistry()
  out.baseTags = new Map(dr.cer.baseTags)
  return out
}

/* Test */

/*
TODO: consider testing all base classes exported by this package. Can probably
find them by iterating module exports.
*/
t.test(function test_HTMLElement() {
  class Sub extends dr.HTMLElement {}
  l.nop(new Sub())
  testCerMatch(dr.cer, Sub, `a-sub`)

  /*
  Verifies registration via global `customElements`.
  Without it, calling `new` would produce an exception.
  */
  if (d.HAS_DOM) {
    t.is(new Sub().outerHTML, `<a-sub></a-sub>`)
  }
})

/*
`CustomElementRegistry..reg` is checked more thoroughly below.
This is a sanity check to verify that the global function uses
this on the default instance.
*/
t.test(function test_reg() {
  class SomeDetails extends dr.HTMLDetailsElement {}
  dr.reg(SomeDetails)
  testCerMatch(dr.cer, SomeDetails, `some-details`)
})


// `CustomElementRegistry` is tested below. This is a sanity check.
t.test(function test_cer() {
  l.reqInst(dr.cer, dr.CustomElementRegistry)
})

t.test(function test_CustomElementRegistry() {
  t.test(function test_misc() {
    const cer = makeCer()

    class SomeLink extends dr.HTMLAnchorElement {}

    function test() {
      t.is(cer.clsTag(SomeLink), undefined)
      t.is(cer.clsTagSalted(SomeLink), `some-link`)
      t.eq(cer.clsOpt(SomeLink), {extends: `a`})
    }

    test()
    cer.clear()
    test()
  })

  t.test(function test_define() {
    const cer = makeCer()

    class Elem {}
    cer.define(`some-elem`, Elem)

    testCerMatch(cer, Elem, `some-elem`)
    testCerSize(cer, 1)

    t.throws(() => cer.define(`some-elem`, Elem), Error, `redundant registration of "some-elem"`)
    t.throws(() => cer.define(`some-elem`, Object), Error, `redundant registration of "some-elem"`)
  })

  t.test(function test_reg() {
    t.test(function test_multiple_sequential_regs() {
      const cer = makeCer()

      class Details extends dr.HTMLDetailsElement {}

      function test0() {
        cer.reg(Details)
        testCerMatch(cer, Details, `a-details`)
        testCerSize(cer, 1)
      }

      test0()
      test0()
      test0()

      class SomeBtn extends dr.HTMLButtonElement {}

      function test1() {
        cer.reg(SomeBtn)
        testCerMatch(cer, SomeBtn, `some-btn`)
        testCerSize(cer, 2)
      }

      test1()
      test1()
      test1()

      t.throws(() => cer.define(`some-btn`, SomeBtn), Error, `redundant registration of "some-btn"`)

      class SubBtn123 extends SomeBtn {}

      function test2() {
        cer.reg(SubBtn123)
        testCerMatch(cer, SubBtn123, `sub-btn123`)
        testCerSize(cer, 3)
      }

      test2()
      test2()
      test2()
    })

    t.test(function test_salting() {
      const cer = makeCer()

      {
        class SomeBtn extends dr.HTMLButtonElement {}
        cer.reg(SomeBtn)

        testCerMatch(cer, SomeBtn, `some-btn`)
        testCerSize(cer, 1)
      }

      {
        class SomeBtn extends dr.HTMLButtonElement {}
        cer.reg(SomeBtn)

        testCerMatch(cer, SomeBtn, `some-btn-0`)
        testCerSize(cer, 2)
      }

      {
        class SomeBtn extends dr.HTMLButtonElement {}
        cer.reg(SomeBtn)

        testCerMatch(cer, SomeBtn, `some-btn-1`)
        testCerSize(cer, 3)
      }
    })
  })

  // Very similar to `.reg`. We only need minimal sanity checks.
  t.test(function test_regAs() {
    const cer = makeCer()

    class SomeBtn extends dr.HTMLButtonElement {
      static {cer.regAs(this, `one-two-three`)}
    }

    testCerMatch(cer, SomeBtn, `one-two-three`)
    testCerSize(cer, 1)

    l.nop(new SomeBtn())

    testCerMatch(cer, SomeBtn, `one-two-three`)
    testCerSize(cer, 1)
  })

  t.test(function test_tag_ambiguity() {
    const cer = makeCer()

    class SomeBodyCell extends dr.HTMLTableCellElement {}
    class SomeHeadCell extends dr.HTMLTableCellElement {static tag = `th`}

    t.is(cer.clsTagBase(SomeBodyCell), `td`)
    t.eq(cer.clsOpt(SomeBodyCell), {extends: `td`})

    t.is(cer.clsTagBase(SomeHeadCell), `th`)
    t.eq(cer.clsOpt(SomeHeadCell), {extends: `th`})
  })

  t.test(function test_setDefiner() {
    const cer = makeCer()
    cer.setDefiner()

    class Cls0 extends dr.HTMLElement {}
    class Cls1 extends dr.HTMLElement {}
    class Cls2 extends dr.HTMLElement {}

    cer.reg(Cls0)
    cer.reg(Cls1)

    t.is(cer.ref, undefined)

    t.eq(cer.tagToCls, i.mapOf(
      `a-cls0`, Cls0,
      `a-cls1`, Cls1,
    ))

    t.eq(cer.clsToTag, i.mapOf(
      Cls0, `a-cls0`,
      Cls1, `a-cls1`,
    ))

    class Definer extends Array {
      define(tag, cls, opt) {
        this.push([tag, cls, opt])
        if (tag === `a-cls0`) cer.reg(Cls2)
      }
    }

    const def = new Definer()
    cer.setDefiner(def)

    t.eq(def, Definer.of(
      [`a-cls0`, Cls0, undefined],
      [`a-cls2`, Cls2, undefined],
      [`a-cls1`, Cls1, undefined],
    ))
  })
})

if (import.meta.main) console.log(`[test] ok!`)
