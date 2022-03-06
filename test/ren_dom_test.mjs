import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as d from '../dom.mjs'
import * as r from '../ren_dom.mjs'
import {E} from '../ren_dom.mjs'
import {testCommon} from './ren_base_test.mjs'

/* Util */

// Short for "equal markup".
function eqm(node, str) {t.is(node.outerHTML, str)}

function toChildTextTree(node) {
  d.reqNode(node)
  if (l.isInst(node, Text)) return node.textContent
  return [...node.childNodes].map(toChildTextTree)
}

/* Test */

testCommon(r, eqm)

t.test(function test_RenDom() {
  t.test(function test_frag() {
    const F = r.ren.frag.bind(r.ren)

    t.inst(F(), DocumentFragment)

    t.eq(toChildTextTree(F()), [])

    t.eq(
      toChildTextTree(F(`one`, [10], E(`div`, {}, `two`))),
      [`one`, `10`, [`two`]],
    )
  })

  // Parts of this function are tested elsewhere.
  // We only need a sanity check here.
  t.test(function test_mutProps() {
    t.throws(r.mutProps, TypeError, `expected variant of isElement, got undefined`)

    t.test(function test_identity() {
      const node = E(`div`)
      t.is(r.mutProps(node), node)
    })

    eqm(
      r.mutProps(E(`div`, {class: `one`}, `two`), {class: `three`}),
      `<div class="three">two</div>`,
    )
  })

  // Parts of this function are tested elsewhere.
  // We only need a sanity check here.
  t.test(function test_mut() {
    t.throws(r.mut, TypeError, `expected variant of isElement, got undefined`)

    t.test(function test_mut_identity() {
      const node = E(`div`)
      t.is(r.mut(node), node)
    })

    t.test(function test_mut_removes_children() {
      eqm(
        r.mut(E(`div`, {class: `one`}, `two`), {class: `three`}),
        `<div class="three"></div>`,
      )
    })

    t.test(function test_mut_replaces_children() {
      eqm(
        r.mut(E(`div`, {class: `one`}, `two`), {class: `three`}, `four`),
        `<div class="three">four</div>`,
      )
    })
  })

  t.test(function test_mutText() {
    t.throws(r.ren.mutText, TypeError, `expected variant of isNode, got undefined`)

    const node = E(`div`, {class: `one`}, `two`)
    eqm(node, `<div class="one">two</div>`)

    t.throws(() => r.ren.mutText(node, {}), TypeError, `unable to convert {} to string`)
    t.throws(() => r.ren.mutText(node, []), TypeError, `unable to convert [] to string`)

    t.is(r.ren.mutText(node), node)
    eqm(node, `<div class="one"></div>`)

    t.is(r.ren.mutText(node, `three`), node)
    eqm(node, `<div class="one">three</div>`)

    t.is(r.ren.mutText(node, new r.Raw(`<four></four>`)), node)
    eqm(node, `<div class="one">&lt;four&gt;&lt;/four&gt;</div>`)
  })

  t.test(function test_unknown_props_become_attrs() {
    eqm(E(`div`, {unknown: 10}), `<div unknown="10"></div>`)
  })

  t.test(function test_known_props_preserve_vals() {
    const node = E(`input`, {maxLength: 10})
    eqm(node, `<input maxlength="10">`)
    t.is(node.maxLength, 10)
  })

  // Recommendation: prefer `class`, consider using `PropBui`/`A`.
  t.test(function test_class_vs_class_name() {
    eqm(E(`div`, {class: `one`, className: `two`}), `<div class="two"></div>`)
    eqm(E(`div`, {className: `one`, class: `two`}), `<div class="two"></div>`)
  })

  t.test(function test_bool_attrs_as_props() {
    t.ok(E(`input`, {type: `checkbox`, checked: true}).checked)
    t.no(E(`input`, {type: `checkbox`, checked: false}).checked)
  })

  t.test(function test_child_flattening() {
    const elem = (
      E(`outer`, {},
        undefined,
        [[[``]]],
        [[[`one`]]],
        [
          null,
          E(`mid`, {},
            undefined,
            [`two`, [E(`inner`, {}, [[`three`]], undefined)]],
            null,
            `four`,
          ),
        ],
        ``,
        `five`,
      )
    )

    eqm(
      elem,
      `<outer>one<mid>two<inner>three</inner>four</mid>five</outer>`,
    )

    /*
    While most other tests just check the serialized HTML for ease of testing,
    this verifies the tree structure. We don't create text nodes for nil and
    empty strings.
    */
    t.eq(toChildTextTree(elem), [`one`, [`two`, [`three`], `four`], `five`])
  })

  t.test(function test_child_kidnapping() {
    const prev = E(`div`, {}, `one`, `two`, `three`)
    const next = E(`p`, {}, ...prev.childNodes)

    eqm(prev, `<div></div>`)
    eqm(next, `<p>onetwothree</p>`)

    t.eq(toChildTextTree(prev), [])
    t.eq(toChildTextTree(next), [`one`, `two`, `three`])
  })

  t.test(function test_replace() {
    t.throws(r.ren.replace, TypeError, `expected variant of isNode, got undefined`)
    t.throws(() => r.ren.replace(E(`div`)), TypeError, `properties of null`)
    t.is(r.ren.replace(E(`div`, {}, `text`).firstChild), undefined)

    const node = E(`div`, {}, E(`one`), E(`two`), E(`three`))
    eqm(node, `<div><one></one><two></two><three></three></div>`)

    t.is(r.ren.replace(node.childNodes[1], `four`, null, `five`), undefined)
    eqm(node, `<div><one></one>fourfive<three></three></div>`)
  })
})
