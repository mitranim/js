import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'
import * as dr from '../dom_reg.mjs'
import * as ds from '../dom_shim.mjs'

class Empty extends l.Emp {}

// `Reg` is tested below. This is a sanity check.
t.test(function test_cer() {l.reqInst(dr.Reg.main, dr.Reg)})

/*
`Reg..reg` is checked more thoroughly below.
This is a sanity check to verify that the global function uses
this on the default instance.
*/
t.test(function test_reg() {
  class SomeDetails extends ds.global.HTMLDetailsElement {}
  dr.reg(SomeDetails)
  testCerMatch(dr.Reg.main, SomeDetails, `details`, `some-details`)
})

t.test(function test_CustomElementRegistry() {
  const reg = new dr.CustomElementRegistry()
  reg.define(`one-two`, Empty)

  t.test(function test_invalid() {
    t.throws(() => reg.define(), TypeError, `expected variant of isCustomName, got undefined`)
    t.throws(() => reg.define(`one`, Empty), TypeError, `expected variant of isCustomName, got "one"`)
    t.throws(() => reg.define(`one-two`, 10), TypeError, `expected variant of isCls, got 10`)
  })

  t.test(function test_redundant() {
    t.throws(() => reg.define(`one-two`, l.nop), Error, `redundant registration of "one-two"`)
    t.throws(() => reg.define(`two-three`, Empty), Error, `redundant registration of [function Empty]`)
  })

  t.test(function test_get() {
    t.is(reg.get(`one-two`), Empty)
    t.is(reg.get(`two-three`), undefined)
  })
})

t.test(function test_Reg() {
  t.test(function test_misc() {
    const reg = new dr.Reg()
    class SomeLink extends ds.global.HTMLAnchorElement {}

    t.no(reg.hasCls(SomeLink))
    t.no(reg.hasTag(`some-link`))

    reg.reg(SomeLink)
    testCerMatch(reg, SomeLink, `a`, `some-link`)
  })

  t.test(function test_with_localName() {
    const reg = new dr.Reg()
    class SomeLink extends ds.global.HTMLAnchorElement {
      static customName = `my-link`
    }
    reg.reg(SomeLink)
    testCerMatch(reg, SomeLink, `a`, `my-link`)
  })

  t.test(function test_reg() {
    t.test(function test_multiple_sequential_regs() {
      const reg = new dr.Reg()

      class Details extends ds.global.HTMLDetailsElement {}

      function test0() {
        reg.reg(Details)
        testCerMatch(reg, Details, `details`, `a-details`)
      }

      test0()
      test0()
      test0()

      class SomeBtn extends ds.global.HTMLButtonElement {}

      function test1() {
        reg.reg(SomeBtn)
        testCerMatch(reg, SomeBtn, `button`, `some-btn`)
      }

      test1()
      test1()
      test1()

      class SubBtn123 extends SomeBtn {}

      function test2() {
        reg.reg(SubBtn123)
        testCerMatch(reg, SubBtn123, `button`, `sub-btn123`)
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
        testCerMatch(reg, SomeBtn, `button`, `some-btn`)
      }

      {
        class SomeBtn extends ds.global.HTMLButtonElement {}
        reg.reg(SomeBtn)
        testCerMatch(reg, SomeBtn, `button`, `some-btn-1`)
      }

      {
        class SomeBtn extends ds.global.HTMLButtonElement {}
        reg.reg(SomeBtn)
        testCerMatch(reg, SomeBtn, `button`, `some-btn-2`)
      }
    })
  })

  t.test(function test_tag_ambiguity() {
    const reg = new dr.Reg()

    class HeadCell extends ds.global.HTMLTableCellElement {
      static localName = `th`
    }

    class BodyCell extends ds.global.HTMLTableCellElement {
      static localName = `td`
    }

    t.is(dr.ClsToTag.main.localName(HeadCell), undefined)
    t.is(dr.ClsToTag.main.localName(BodyCell), undefined)

    reg.reg(HeadCell)
    reg.reg(BodyCell)

    testCerMatch(reg, HeadCell, `th`, `head-cell`)
    testCerMatch(reg, BodyCell, `td`, `body-cell`)
  })

  t.test(function test_setDefiner() {
    const reg = new dr.Reg()
    reg.setDefiner()
    t.is(reg.definer, undefined)

    class Cls0 extends ds.global.HTMLElement {}
    class Cls1 extends ds.global.HTMLElement {}
    class Cls2 extends ds.global.HTMLElement {}

    reg.reg(Cls0)
    reg.reg(Cls1)

    t.eq(reg.tagToCls, i.mapOf(
      `a-cls0`, Cls0,
      `a-cls1`, Cls1,
    ))

    t.eq(reg.clsToTag, i.mapOf(
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

function testCerMatch(reg, cls, local, custom) {
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
