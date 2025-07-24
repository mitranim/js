import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as dr from '../dom_reg.mjs'
import * as ds from '../dom_shim.mjs'

// `Reg` is tested below. This is a sanity check.
t.test(function test_Reg() {l.reqInst(dr.Reg.main, dr.Reg)})

/*
`Reg..reg` is checked more thoroughly below.
This is a sanity check to verify that the global function uses
this on the default instance.
*/
t.test(function test_reg() {
  class SomeDetails extends ds.global.HTMLDetailsElement {}
  dr.reg(SomeDetails)
  testRegMatch(dr.Reg.main, SomeDetails, `details`, `some-details`)
})

t.test(function test_Reg() {
  t.test(function test_misc() {
    const reg = new dr.Reg()
    class SomeLink extends ds.global.HTMLAnchorElement {}

    t.no(reg.hasCls(SomeLink))
    t.no(reg.hasTag(`some-link`))

    reg.reg(SomeLink)
    testRegMatch(reg, SomeLink, `a`, `some-link`)
  })

  t.test(function test_with_localName() {
    const reg = new dr.Reg()
    class SomeLink extends ds.global.HTMLAnchorElement {
      static customName = `my-link`
    }
    reg.reg(SomeLink)
    testRegMatch(reg, SomeLink, `a`, `my-link`)
  })

  t.test(function test_reg() {
    t.test(function test_autonomous_elements() {
      const reg = new dr.Reg()

      class One extends ds.global.HTMLElement {}
      reg.reg(One)
      testRegMatch(reg, One, `a-one`, `a-one`)

      // Degenerate case which prevents this element from actually being custom,
      // but we define this case anyway.
      class Two extends One {static localName = `two`}
      reg.reg(Two)
      testRegMatch(reg, Two, `two`, `a-two`)

      class Three extends Two {}
      reg.reg(Three)
      testRegMatch(reg, Three, `two`, `a-three`)

      class Four extends Three {
        static localName = `four`
        static customName = `four-five`
      }
      reg.reg(Four)
      testRegMatch(reg, Four, `four`, `four-five`)
    })

    t.test(function test_multiple_sequential_regs() {
      const reg = new dr.Reg()

      class Details extends ds.global.HTMLDetailsElement {}

      function test0() {
        reg.reg(Details)
        testRegMatch(reg, Details, `details`, `a-details`)
      }

      test0()
      test0()
      test0()

      class SomeBtn extends ds.global.HTMLButtonElement {}

      function test1() {
        reg.reg(SomeBtn)
        testRegMatch(reg, SomeBtn, `button`, `some-btn`)
      }

      test1()
      test1()
      test1()

      class SubBtn123 extends SomeBtn {}

      function test2() {
        reg.reg(SubBtn123)
        testRegMatch(reg, SubBtn123, `button`, `sub-btn123`)
      }

      test2()
      test2()
      test2()
    })

    t.test(function test_salting() {
      const reg = new dr.Reg()

      {
        class SomeBtn extends ds.global.HTMLButtonElement {}
        reg.reg(SomeBtn)
        testRegMatch(reg, SomeBtn, `button`, `some-btn`)
      }

      {
        class SomeBtn extends ds.global.HTMLButtonElement {}
        reg.reg(SomeBtn)
        testRegMatch(reg, SomeBtn, `button`, `some-btn-1`)
      }

      {
        class SomeBtn extends ds.global.HTMLButtonElement {}
        reg.reg(SomeBtn)
        testRegMatch(reg, SomeBtn, `button`, `some-btn-2`)
      }
    })
  })

  t.test(function test_tag_ambiguity() {
    const reg = new dr.Reg()

    t.is(dr.clsLocalName(ds.global.HTMLTableCellElement), undefined)

    t.is(dr.clsLocalName(
      class Cell extends ds.global.HTMLTableCellElement {}
    ), undefined)

    class HeadCell extends ds.global.HTMLTableCellElement {
      static localName = `th`
    }

    class BodyCell extends ds.global.HTMLTableCellElement {
      static localName = `td`
    }

    t.is(dr.clsLocalName(HeadCell), `th`)
    t.is(dr.clsLocalName(BodyCell), `td`)

    reg.reg(HeadCell)
    reg.reg(BodyCell)

    testRegMatch(reg, HeadCell, `th`, `head-cell`)
    testRegMatch(reg, BodyCell, `td`, `body-cell`)
  })

  t.test(function test_setDefiner() {
    const reg = new dr.Reg()
    reg.setDefiner()
    t.is(reg.definer, undefined)

    class Cls0 extends ds.global.HTMLElement {}
    class Cls1 extends ds.global.HTMLElement {}
    class Cls2 extends Cls1 {}
    class Cls3 extends ds.global.HTMLButtonElement {}
    class Cls4 extends Cls3 {}

    reg.reg(Cls0)
    reg.reg(Cls0)
    reg.reg(Cls1)
    reg.reg(Cls1)

    t.eq(
      reg.tagToCls,
      new Map().set(`a-cls0`, Cls0).set(`a-cls1`, Cls1),
    )

    t.eq(
      reg.clsToTag,
      new Map().set(Cls0, `a-cls0`).set(Cls1, `a-cls1`),
    )

    const defined = []
    const def = l.Emp()
    def.define = function define(tag, cls, opt) {defined.push([tag, cls, opt])}
    reg.setDefiner(def)
    t.is(reg.definer, def)

    t.eq(defined, [
      [`a-cls0`, Cls0, undefined],
      [`a-cls1`, Cls1, undefined],
    ])

    reg.reg(Cls2)

    t.eq(defined, [
      [`a-cls0`, Cls0, undefined],
      [`a-cls1`, Cls1, undefined],
      [`a-cls2`, Cls2, undefined],
    ])

    reg.reg(Cls3)
    reg.reg(Cls4)

    t.eq(defined, [
      [`a-cls0`, Cls0, undefined],
      [`a-cls1`, Cls1, undefined],
      [`a-cls2`, Cls2, undefined],
      [`a-cls3`, Cls3, {extends: `button`}],
      [`a-cls4`, Cls4, {extends: `button`}],
    ])
  })
})

t.test(function test_MixReg() {
  class SomeElem extends dr.MixReg(ds.global.HTMLElement) {
    static customName = `elem-47bd69`
  }

  t.no(dr.Reg.main.hasCls(SomeElem))
  t.no(dr.Reg.main.hasTag(`elem-47bd69`))
  t.is(dr.Reg.main.clsTag(SomeElem), undefined)
  t.is(dr.Reg.main.tagCls(`elem-47bd69`), undefined)

  l.nop(new SomeElem())

  t.ok(dr.Reg.main.hasCls(SomeElem))
  t.ok(dr.Reg.main.hasTag(`elem-47bd69`))
  t.is(dr.Reg.main.clsTag(SomeElem), `elem-47bd69`)
  t.is(dr.Reg.main.tagCls(`elem-47bd69`), SomeElem)

  l.nop(new SomeElem())
  l.nop(new SomeElem())
})

/* Util */

function testRegMatch(reg, cls, local, custom) {
  t.ok(reg.hasCls(cls))
  t.ok(reg.hasTag(custom))

  t.is(reg.clsTag(cls), custom)
  t.is(reg.tagCls(custom), cls)

  t.ok(l.hasOwn(cls, `localName`))
  t.is(cls.localName, local)

  t.ok(l.hasOwn(cls, `customName`))
  t.is(cls.customName, custom)
}

if (import.meta.main) console.log(`[test] ok!`)
