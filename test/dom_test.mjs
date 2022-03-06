import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as d from '../dom.mjs'
import {E} from '../ren_dom.mjs'

t.test(function test_DocHeadMut() {
  function mutHead(val) {return d.DocHeadMut.main.mut(val)}

  t.throws(mutHead, TypeError, `instance of HTMLHeadElement`)

  const prev = [...document.head.children]

  mutHead(E(`head`))
  t.eq([...document.head.children], prev)

  mutHead(E(`head`))
  t.eq([...document.head.children], prev)

  t.test(function test_reset_title() {
    t.eq(document.title, `test`)

    mutHead(E(`head`, {}, E(`title`, {}, `test title 0`)))
    t.eq([...document.head.children], prev)
    t.eq(document.title, `test title 0`)

    mutHead(E(`head`, {}, E(`title`, {}, `test title 1`)))
    t.eq([...document.head.children], prev)
    t.eq(document.title, `test title 1`)
  })

  t.test(function test_reset_nodes() {
    const nodes0 = [
      E(`meta`, {name: `author`, content: `test author 0`}),
      E(`meta`, {name: `description`, content: `test description 0`}),
    ]
    mutHead(E(`head`, {}, ...nodes0))

    t.eq(
      [...document.head.children],
      [...prev, ...nodes0],
    )
    t.eq(document.title, `test title 1`)

    const nodes1 = [
      E(`meta`, {name: `author`, content: `test author 1`}),
      E(`link`, {rel: `icon`, href: `data:;base64,=`}),
    ]
    mutHead(E(`head`, {}, E(`title`, {}, `test title 2`), ...nodes1))

    t.eq(
      [...document.head.children],
      [...prev, ...nodes1],
    )
    t.eq(document.title, `test title 2`)
  })
})
