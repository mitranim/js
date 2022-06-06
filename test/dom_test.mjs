/* eslint-env browser */

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as p from '../prax.mjs'
import * as d from '../dom.mjs'

const ren = new p.Ren(document).patchProto(Element)
const {E} = ren

t.test(function test_DocHeadMut() {
  function mutHead(val) {return d.DocHeadMut.main.mut(val)}

  t.throws(mutHead, TypeError, `instance of HTMLHeadElement`)

  const prev = [...document.head.children]

  mutHead(E.head)
  t.eq([...document.head.children], prev)

  mutHead(E.head)
  t.eq([...document.head.children], prev)

  t.test(function test_reset_title() {
    t.eq(document.title, `test`)

    mutHead(E.head.chi(E.title.chi(`test title 0`)))
    t.eq([...document.head.children], prev)
    t.eq(document.title, `test title 0`)

    mutHead(E.head.chi(E.title.chi(`test title 1`)))
    t.eq([...document.head.children], prev)
    t.eq(document.title, `test title 1`)
  })

  t.test(function test_reset_nodes() {
    const nodes0 = [
      E.meta.props({name: `author`, content: `test author 0`}),
      E.meta.props({name: `description`, content: `test description 0`}),
    ]
    mutHead(E.head.chi(...nodes0))

    t.eq(
      [...document.head.children],
      [...prev, ...nodes0],
    )
    t.eq(document.title, `test title 1`)

    const nodes1 = [
      E.meta.props({name: `author`, content: `test author 1`}),
      E.link.props({rel: `icon`, href: `data:;base64,=`}),
    ]
    mutHead(E.head.chi(E.title.chi(`test title 2`), ...nodes1))

    t.eq(
      [...document.head.children],
      [...prev, ...nodes1],
    )
    t.eq(document.title, `test title 2`)
  })
})
