import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'
import * as dr from '../dom_reg.mjs'
import * as r from '../ren_xml.mjs'

// `Reg` is tested below. This is a sanity check.
t.test(function test_cer() {l.reqInst(dr.Reg.main, dr.Reg)})

/*
`Reg..reg` is checked more thoroughly below.
This is a sanity check to verify that the global function uses
this on the default instance.
*/
t.test(function test_reg() {
  class SomeDetails extends r.elems.HTMLDetailsElement {}
  dr.reg(SomeDetails)
  testCerMatch(dr.Reg.main, SomeDetails, `some-details`, {extends: `details`})
})

t.test(function test_Reg() {
  t.test(function test_misc() {
    const reg = new dr.Reg()
    class SomeLink extends r.elems.HTMLAnchorElement {}

    t.no(reg.clsHas(SomeLink))
    t.no(reg.tagHas(`some-link`))

    reg.reg(SomeLink)
    testCerMatch(reg, SomeLink, `some-link`, {extends: `a`})
  })

  t.test(function test_with_localName() {
    const reg = new dr.Reg()
    class SomeLink extends r.elems.HTMLAnchorElement {
      static localName = `my-link`
    }
    reg.reg(SomeLink)
    testCerMatch(reg, SomeLink, `my-link`, {extends: `a`})
  })

  t.test(function test_reg() {
    t.test(function test_multiple_sequential_regs() {
      const reg = new dr.Reg()

      class Details extends r.elems.HTMLDetailsElement {}

      function test0() {
        reg.reg(Details)
        testCerMatch(reg, Details, `a-details`, {extends: `details`})
      }

      test0()
      test0()
      test0()

      class SomeBtn extends r.elems.HTMLButtonElement {}

      function test1() {
        reg.reg(SomeBtn)
        testCerMatch(reg, SomeBtn, `some-btn`, {extends: `button`})
      }

      test1()
      test1()
      test1()

      class SubBtn123 extends SomeBtn {}

      function test2() {
        reg.reg(SubBtn123)
        testCerMatch(reg, SubBtn123, `sub-btn123`, {extends: `button`})
      }

      test2()
      test2()
      test2()
    })

    t.test(function test_salting() {
      const reg = new dr.Reg()

      {
        class SomeBtn extends r.elems.HTMLButtonElement {}
        reg.reg(SomeBtn)
        testCerMatch(reg, SomeBtn, `some-btn`, {extends: `button`})
      }

      {
        class SomeBtn extends r.elems.HTMLButtonElement {}
        reg.reg(SomeBtn)
        testCerMatch(reg, SomeBtn, `some-btn-1`, {extends: `button`})
      }

      {
        class SomeBtn extends r.elems.HTMLButtonElement {}
        reg.reg(SomeBtn)
        testCerMatch(reg, SomeBtn, `some-btn-2`, {extends: `button`})
      }
    })
  })

  t.test(function test_tag_ambiguity() {
    const reg = new dr.Reg()

    class HeadCell extends r.elems.HTMLTableCellElement {
      static options = {extends: `th`}
    }

    class BodyCell extends r.elems.HTMLTableCellElement {}

    t.is(dr.BaseTags.main.find(HeadCell), `td`)
    t.is(dr.BaseTags.main.find(BodyCell), `td`)

    reg.reg(HeadCell)
    reg.reg(BodyCell)

    testCerMatch(reg, HeadCell, `head-cell`, {extends: `th`})
    testCerMatch(reg, BodyCell, `body-cell`, {extends: `td`})
  })

  t.test(function test_setDefiner() {
    const reg = new dr.Reg()
    reg.setDefiner()
    t.is(reg.definer, undefined)

    class Cls0 extends r.elems.HTMLElement {}
    class Cls1 extends r.elems.HTMLElement {}
    class Cls2 extends r.elems.HTMLElement {}

    reg.reg(Cls0)
    reg.reg(Cls1)

    t.eq(reg.localNameToCls, i.mapOf(
      `a-cls0`, Cls0,
      `a-cls1`, Cls1,
    ))

    t.eq(reg.clsToLocalName, i.mapOf(
      Cls0, `a-cls0`,
      Cls1, `a-cls1`,
    ))

    class Definer extends Array {
      define(tag, cls, opt) {
        this.push([tag, cls, opt])
        if (tag === `a-cls0`) reg.reg(Cls2)
      }
    }

    const def = new Definer()
    reg.setDefiner(def)
    t.is(reg.definer, def)

    t.eq(def, Definer.of(
      [`a-cls0`, Cls0, undefined],
      [`a-cls2`, Cls2, undefined],
      [`a-cls1`, Cls1, undefined],
    ))
  })
})

/* Util */

function testCerMatch(reg, cls, tag, opt) {
  t.ok(reg.clsHas(cls))
  t.ok(reg.tagHas(tag))

  t.is(reg.clsTag(cls), tag)
  t.is(reg.tagCls(tag), cls)

  t.ok(l.hasOwn(cls, `localName`))
  t.is(cls.localName, tag)

  if (opt) {
    t.ok(l.hasOwn(cls, `options`))
    t.eq(cls.options, opt)
  }
  else {
    t.no(l.hasOwn(cls, `options`))
  }
}

if (import.meta.main) console.log(`[test] ok!`)
