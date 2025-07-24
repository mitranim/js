import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as p from '../prax.mjs'
import * as dr from '../dom_reg.mjs'
import * as ds from '../dom_shim.mjs'
import * as ob from '../obs.mjs'

/* Util */

const env = ob.HAS_DOM ? globalThis : ds.global
const ren = new p.Ren({env})
const E = ren.E
const A = new p.PropBui().frozen()

function args() {return arguments}
function testDerefOwn(src, exp) {t.own(src[l.VAL], exp)}

// Short for "equal markup".
export function eqm(val, exp) {t.is(l.reqStr(val.outerHTML), l.reqStr(exp))}

export function eqm2(val, native, shimmed) {
  l.reqStr(native)
  l.reqStr(shimmed)

  if (ob.HAS_DOM) eqm(val, native)
  else eqm(val, shimmed)
}

const ESC_SRC = `<one>&"</one>`

// See comment on `ds.escapeAttr`.
const ESC_OUT_ATTR = `&lt;one&gt;&amp;&quot;&lt;/one&gt;`

// See comment on `ds.escapeText`.
const ESC_OUT_TEXT = `&lt;one&gt;&amp;"&lt;/one&gt;`

/* Test */

t.test(function test_escaping_attr() {
  t.is(ds.escapeAttr(ESC_SRC), ESC_OUT_ATTR)
})

t.test(function test_escaping_text() {
  t.is(ds.escapeText(ESC_SRC), ESC_OUT_TEXT)
})

t.test(function test_PropBui() {
  testPropBuiConstructor(val => new p.PropBui(val))

  t.test(function test_set() {
    const ref = new p.PropBui()

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
    t.throws(() => new p.PropBui().cls(10), TypeError, `expected variant of isStr, got 10`)

    t.is(new p.PropBui().cls()[l.VAL], undefined)

    testDerefOwn(new p.PropBui().cls(`one`), {class: `one`})
    testDerefOwn(new p.PropBui().cls(``).cls(`one`), {class: `one`})
    testDerefOwn(new p.PropBui().cls(``).cls(`one`).cls(``), {class: `one`})
    testDerefOwn(new p.PropBui().cls(`one`).cls(`two`), {class: `one two`})
  })

  t.test(function test_href() {
    testDerefOwn(new p.PropBui().href(), {href: undefined})
    testDerefOwn(new p.PropBui().href(`/one`), {href: `/one`})
  })

  t.test(function test_tarblan() {
    testDerefOwn(new p.PropBui().tarblan(), {target: `_blank`, rel: `noopener noreferrer`})
  })
})

function testPropBuiConstructor(fun) {
  function test(src) {
    const out = fun(src)
    t.inst(out, p.PropBui)
    t.isnt(out, src)

    t.own(out, {[l.VAL]: src, [Symbol.for(`frozen`)]: false})
    testDerefOwn(out, src)
  }

  test({})
  test({one: 10})
  test({one: 10, two: 20})
}

t.test(function test_PropBui_of() {
  const P = p.PropBui.of.bind(p.PropBui)

  testPropBuiConstructor(P)

  t.test(function test_same_reference() {
    function test(val) {t.is(P(val), val)}

    test(P())
    test(new p.PropBui())
    test(P({one: 10}))
    test(new p.PropBui({one: 10}))
  })
})

t.test(function test_PropBui_A() {
  t.inst(A, p.PropBui)

  t.test(function test_setter_methods() {
    function test(val, exp) {
      t.isnt(val, A)
      t.inst(val, p.PropBui)
      testDerefOwn(val, exp)

      // Further method calls mutate the same instance.
      t.is(val.set(`994d2e`, `cac5c0`), val)
    }

    test(A.href(`/one`), {href: `/one`})
    test(A.cls(`two`), {class: `two`})
    test(A.href(`/one`).cls(`two`), {href: `/one`, class: `two`})
  })

  t.test(function test_with() {
    function none(src) {
      const out = A.with(src)
      t.is(out, A)
      t.is(out[l.VAL], undefined)
    }

    none()
    none(undefined)
    none(null)

    function some(src) {
      const out = A.with(src)
      t.isnt(out, A)
      testDerefOwn(out, {...src})
    }

    some({})
    some({one: 10})
    some({one: 10, two: 20})

    function copy(src) {
      const one = A.with(src)
      const two = A.with(one)
      t.isnt(one, A)
      t.isnt(two, A)
      t.isnt(one, two)
      testDerefOwn(one, {...src})
      testDerefOwn(two, {...src})
      t.isnt(l.deref(one), l.deref(two))
    }

    copy({})
    copy({one: 10})
    copy({one: 10, two: 20})

    function fail(src) {
      t.throws(
        () => A.with(src),
        TypeError,
        `expected variant of isRec, got ${l.show(src)}`,
      )
    }

    fail(true)
    fail(10)
    fail(`one`)
    fail([])
  })
})

t.test(function test_Ren_elem_invalid() {
  t.test(function test_invalid_tag() {
    function fail(src) {
      t.throws(
        () => ren.elem(src),
        TypeError,
        `expected variant of isStr, got ${l.show(src)}`,
      )
    }

    fail(undefined)
    fail(null)
    fail(true)
    fail(1230)
    fail(E)
    fail({})
    fail({one: 123})
    fail({toString() {return `div`}})
  })

  t.test(function test_invalid_props() {
    t.throws(() => ren.elem(`div`, 10),                          TypeError, `expected variant of isRec, got 10`)
    t.throws(() => ren.elem(`div`, `str`),                       TypeError, `expected variant of isRec, got "str"`)
    t.throws(() => ren.elem(`div`, []),                          TypeError, `expected variant of isRec, got []`)
    t.throws(() => ren.elem(`div`, new String()),                TypeError, `expected variant of isRec, got [object String ""]`)
    t.throws(() => ren.elem(`div`, {attributes: 10}),            TypeError, `expected variant of isRec, got 10`)
    t.throws(() => ren.elem(`div`, {attributes: `str`}),         TypeError, `expected variant of isRec, got "str"`)
    t.throws(() => ren.elem(`div`, {attributes: []}),            TypeError, `expected variant of isRec, got []`)
    t.throws(() => ren.elem(`div`, {class: []}),                 TypeError, `unable to convert property "class" [] to string`)
    t.throws(() => ren.elem(`div`, {className: []}),             TypeError, `unable to convert property "className" [] to string`)
    t.throws(() => ren.elem(`div`, {class: {}}),                 TypeError, `unable to convert property "class" {} to string`)
    t.throws(() => ren.elem(`div`, {className: {}}),             TypeError, `unable to convert property "className" {} to string`)
    t.throws(() => ren.elem(`div`, {class: new class {}()}),     TypeError, `unable to convert property "class" [object] to string`)
    t.throws(() => ren.elem(`div`, {className: new class {}()}), TypeError, `unable to convert property "className" [object] to string`)
    t.throws(() => ren.elem(`div`, {style: 10}),                 TypeError, `unable to convert 10 to style`)
    t.throws(() => ren.elem(`div`, {style: []}),                 TypeError, `unable to convert [] to style`)
    t.throws(() => ren.elem(`div`, {dataset: 10}),               TypeError, `expected variant of isRec, got 10`)
    t.throws(() => ren.elem(`div`, {dataset: `str`}),            TypeError, `expected variant of isRec, got "str"`)
    t.throws(() => ren.elem(`div`, {dataset: []}),               TypeError, `expected variant of isRec, got []`)
  })
})

t.test(function test_Ren_E_basic() {
  t.test(function test_tag_string() {
    eqm(E(`span`),                             `<span></span>`)
    eqm(E(`span`, null),                       `<span></span>`)
    eqm(E(`span`, {chi: `one`}),               `<span>one</span>`)
    eqm(E(`span`, {children: `one`}),          `<span>one</span>`)
    eqm(E(`span`, {chi: [`one`, `two`]}),      `<span>onetwo</span>`)
    eqm(E(`span`, {one: `two`}),               `<span one="two"></span>`)
    eqm(E(`span`, {one: `two`, chi: `three`}), `<span one="two">three</span>`)
  })

  t.test(function test_element_mut_props_or_chi() {
    eqm(E(E(`span`)), `<span></span>`)

    eqm(E(E(E(`span`))), `<span></span>`)

    const node = E(`span`)
    eqm(node, `<span></span>`)

    t.is(E(node, {one: `two`}), node)
    eqm(node, `<span one="two"></span>`)

    t.is(E(node, {three: `four`}), node)
    eqm(node, `<span one="two" three="four"></span>`)

    // No change.
    t.is(E(node, {one: `two`, three: `four`}), node)
    eqm(node, `<span one="two" three="four"></span>`)

    // No change.
    t.is(E(node, undefined), node)
    eqm(node, `<span one="two" three="four"></span>`)

    t.is(E(node, {one: undefined}), node)
    eqm(node, `<span three="four"></span>`)

    t.is(E(node, {chi: [`five`]}), node)
    eqm(node, `<span three="four">five</span>`)

    // No change.
    t.is(E(node, {}), node)
    eqm(node, `<span three="four">five</span>`)

    t.is(E(node, {chi: `eight`}), node)
    eqm(node, `<span three="four">eight</span>`)

    t.is(E(node, {three: undefined, chi: []}), node)
    eqm(node, `<span></span>`)
  })

  /*
  Unlike many other JS rendering frameworks, ours considers only nil and
  empty strings to be truly empty. Booleans are rendered to string.
  */
  t.test(function test_falsy() {
    eqm(E(`span`, {chi: undefined}), `<span></span>`)
    eqm(E(`span`, {chi: null}), `<span></span>`)
    eqm(E(`span`, {chi: ``}), `<span></span>`)

    eqm(E(`span`, {chi: 0}), `<span>0</span>`)
    eqm(E(`span`, {chi: NaN}), `<span>NaN</span>`)
    eqm(E(`span`, {chi: false}), `<span>false</span>`)

    // Not falsy but included for completeness.
    eqm(E(`span`, {chi: true}), `<span>true</span>`)
  })
})

t.test(function test_Ren_chi() {
  // `ren.chi` requires a target node for reactivity-related reasons.
  const node = ren.doc.createElement(`div`)
  function empty() {eqm(node, `<div></div>`)}

  t.eq(ren.chi(node, []), [])

  t.eq(ren.chi(node, [undefined]), [])
  t.eq(ren.chi(node, [undefined, [[]]]), [])
  t.eq(ren.chi(node, [undefined, [[]], [null], ``, [[[``]]]]), [])
  empty()

  t.eq(ren.chi(node, [`one`]), [`one`])
  t.eq(ren.chi(node, [[`one`]]), [`one`])
  t.eq(ren.chi(node, [[[`one`]]]), [`one`])
  t.eq(ren.chi(node, [[], [[[`one`]]], []]), [`one`])
  empty()

  // Must concatenate adjacent primitives.
  t.eq(
    ren.chi(node, [
      10, null, [[20]], [undefined], [[[`one`]]],
      E(`three`),
      [30], [null], [[`four`]], undefined, [[[40]]],
    ]),
    [
      `1020one`,
      E(`three`),
      `30four40`,
    ],
  )
  empty()

  t.eq(
    ren.chi(node, [
      `one`,
      [[10, [20]]],
      E(`two`),
      [undefined, [[[null], ``]]],
      args(args(args(`four`))),
    ]),
    [`one1020`, E(`two`), `four`],
  )
  empty()
})

t.test(function test_Ren_E_chi_flattening() {
  const elem = E(`outer`, {chi: [
    undefined,
    [[[``]]],
    [[[`one`]]],
    [
      null,
      E(`mid`, {chi: [
        undefined,
        [`two`, [E(`inner`, {chi: [[[`three`]], undefined]})]],
        null,
        `four`,
      ]}),
    ],
    ``,
    `five`,
  ]})

  t.is(
    elem.textContent,
    `onetwothreefourfive`,
  )

  eqm(
    elem,
    `<outer>one<mid>two<inner>three</inner>four</mid>five</outer>`,
  )
})

t.test(function test_serialization() {
  t.test(function test_tag_closing() {
    t.test(function test_void_elems() {
      eqm2(E(`area`), `<area>`, `<area />`)
      eqm2(E(`base`), `<base>`, `<base />`)
      eqm2(E(`br`), `<br>`, `<br />`)
      eqm2(E(`col`), `<col>`, `<col />`)
      eqm2(E(`embed`), `<embed>`, `<embed />`)
      eqm2(E(`hr`), `<hr>`, `<hr />`)
      eqm2(E(`img`), `<img>`, `<img />`)
      eqm2(E(`input`), `<input>`, `<input />`)
      eqm2(E(`link`), `<link>`, `<link />`)
      eqm2(E(`meta`), `<meta>`, `<meta />`)
      eqm2(E(`param`), `<param>`, `<param />`)
      eqm2(E(`source`), `<source>`, `<source />`)
      eqm2(E(`track`), `<track>`, `<track />`)
      eqm2(E(`wbr`), `<wbr>`, `<wbr />`)

      eqm2(E(`link`, {}), `<link>`, `<link />`)
      eqm2(E(`link`, null), `<link>`, `<link />`)
      eqm2(E(`link`, undefined), `<link>`, `<link />`)
    })

    t.test(function test_normal_elems() {
      const node = E(`div`)
      t.eq([...node.attributes], [])
      t.eq([...node.childNodes], [])

      eqm(E(`div`), `<div></div>`)
      eqm(E(`a-elem`), `<a-elem></a-elem>`)
    })
  })

  t.test(function test_props() {
    t.test(function test_void_elem_attrs() {
      eqm2(
        E(`link`, {rel: `stylesheet`, href: `main.css`}),
        `<link rel="stylesheet" href="main.css">`,
        `<link rel="stylesheet" href="main.css" />`,
      )
    })

    t.test(function test_attr_val_encoding() {
      t.test(function test_attr_non_scalar() {
        testNonScalarPropStrict(E)
        ren.lax = true
        testNonScalarPropLax(E, eqm)
        ren.lax = false
        testNonScalarPropStrict(E)
      })

      t.test(function test_nil_encoding() {
        eqm(E(`div`, {one: null, two: undefined}), `<div></div>`)
      })

      t.test(function test_prim_encoding() {
        eqm(
          E(`div`, {one: ``, two: `10`, three: 0, four: false}),
          `<div one="" two="10" three="0" four="false"></div>`,
        )
      })

      t.test(function test_attr_scalar() {
        eqm(
          E(`div`, {one: new URL(`https://example.com`)}),
          `<div one="https://example.com/"></div>`,
        )
      })

      t.test(function test_attr_val_escaping() {
        eqm(
          E(`div`, {attr: ESC_SRC}),
          `<div attr="${ESC_OUT_ATTR}"></div>`,
        )

        eqm(
          E(`outer`, {chi: E(`inner`, {attr: ESC_SRC})}),
          `<outer><inner attr="${ESC_OUT_ATTR}"></inner></outer>`,
        )
      })

      t.test(function test_attr_PropBui() {
        eqm(
          E(`a`, A.href(`/`).cls(`link`).chi(`text`)),
          `<a href="/" class="link">text</a>`,
        )
      })
    })

    t.test(function test_class() {
      // Recommendation: prefer `class`, consider using `PropBui`/`A`.
      t.test(function test_class_vs_class_name() {
        eqm(E(`div`, {class: `one`, className: `two`}), `<div class="two"></div>`)
        eqm(E(`div`, {className: `one`, class: `two`}), `<div class="two"></div>`)
      })

      t.test(function test_class_escaping() {
        eqm(
          E(`div`, {class: ESC_SRC}),
          `<div class="${ESC_OUT_ATTR}"></div>`,
        )
      })

      t.test(function test_class_PropBui() {
        eqm(
          E(`div`, A.cls(`one`).cls(`two`)),
          `<div class="one two"></div>`,
        )
      })
    })

    t.test(function test_style() {
      t.throws(() => E(`div`, {style: 10}),           TypeError, `unable to convert 10 to style`)
      t.throws(() => E(`div`, {style: []}),           TypeError, `unable to convert [] to style`)
      t.throws(() => E(`div`, {style: {margin: 10}}), TypeError, `invalid property "margin": expected variant of isStr, got 10`)

      eqm(
        E(`div`, {style: `margin: 1rem; padding: 1rem`}),
        `<div style="margin: 1rem; padding: 1rem"></div>`,
      )

      eqm(
        E(`div`, {style: {margin: `1rem`, padding: `1rem`}}),
        `<div style="margin: 1rem; padding: 1rem;"></div>`,
      )

      t.test(function test_style_non_strings() {
        t.throws(() => E(`div`, {style: {margin: 10}}), TypeError, `invalid property "margin": expected variant of isStr, got 10`)

        eqm(E(`div`, {style: {margin: null}}), `<div></div>`)
        eqm(E(`div`, {style: {margin: undefined}}), `<div></div>`)
      })

      /*
      This style property is technically invalid, and should be ignored in
      browsers. In our shim, when a style is provided as a string, we don't
      parse or validate it, but we must ensure proper escaping.
      */
      t.test(function test_style_escaping() {
        eqm(
          E(`div`, {style: ESC_SRC}),
          `<div style="${ESC_OUT_ATTR}"></div>`,
        )
      })
    })

    t.test(function test_data_attrs() {
      t.test(function test_data_attrs_basic() {
        eqm(E(`div`, {'data-one': null}), `<div></div>`)
        eqm(E(`div`, {'data-one': undefined}), `<div></div>`)
        eqm(E(`div`, {'data-one': ``}), `<div data-one=""></div>`)
        eqm(E(`div`, {'data-one': `str`}), `<div data-one="str"></div>`)
        eqm(E(`div`, {'data-one': 0}), `<div data-one="0"></div>`)
        eqm(E(`div`, {'data-one': false}), `<div data-one="false"></div>`)

        eqm(
          E(`div`, {'data-one': ``, 'data-two': 0, 'data-three': false}),
          `<div data-one="" data-two="0" data-three="false"></div>`,
        )
      })

      t.test(function test_dataset_basic() {
        eqm(E(`div`, {dataset: {one: null}}), `<div></div>`)
        eqm(E(`div`, {dataset: {one: undefined}}), `<div></div>`)
        eqm(E(`div`, {dataset: {one: ``}}), `<div data-one=""></div>`)
        eqm(E(`div`, {dataset: {one: `str`}}), `<div data-one="str"></div>`)
        eqm(E(`div`, {dataset: {one: 0}}), `<div data-one="0"></div>`)
        eqm(E(`div`, {dataset: {one: false}}), `<div data-one="false"></div>`)

        eqm(
          E(`div`, {dataset: {one: ``, two: 0, three: false, four: null, five: undefined}}),
          `<div data-one="" data-two="0" data-three="false"></div>`,
        )
      })

      t.test(function test_dataset_prop_name_to_attr_name() {
        eqm(E(`div`, {dataset: {one: ``}}), `<div data-one=""></div>`)
        eqm(E(`div`, {dataset: {One: ``}}), `<div data--one=""></div>`)
        eqm(E(`div`, {dataset: {oneTwo: ``}}), `<div data-one-two=""></div>`)
        eqm(E(`div`, {dataset: {OneTwo: ``}}), `<div data--one-two=""></div>`)
        eqm(E(`div`, {dataset: {oneTWO: ``}}), `<div data-one-t-w-o=""></div>`)
        eqm(E(`div`, {dataset: {OneTWO: ``}}), `<div data--one-t-w-o=""></div>`)
        eqm(E(`div`, {dataset: {ONE: ``}}), `<div data--o-n-e=""></div>`)
      })

      t.test(function test_data_attr_escaping() {
        eqm(
          E(`div`, {'data-attr': ESC_SRC}),
          `<div data-attr="${ESC_OUT_ATTR}"></div>`,
        )
        eqm(
          E(`div`, {dataset: {attr: ESC_SRC}}),
          `<div data-attr="${ESC_OUT_ATTR}"></div>`,
        )
      })
    })

    /*
    The DOM standard defines various aria getters/setters for the `Element`
    interface, such as `.ariaCurrent` and more. Our DOM shim doesn't define
    them because Firefox doesn't implement them, or at least didn't at the time
    of writing the shim. It would be a compatibility footgun, leading to code
    that works with a shim and in various environments, but breaks in FF.
    */
    t.test(function test_aria_attrs() {
      // This test would work with shim and in Chrome, but not in FF.
      //
      // eqm(
      //   E(`span`, {ariaCurrent: `page`, ariaChecked: `mixed`}),
      //   `<span ariaCurrent="page" ariaChecked="mixed"></span>`,
      // )

      eqm(
        E(`span`, {'aria-current': null, 'aria-checked': undefined}),
        `<span></span>`,
      )

      eqm(
        E(`span`, {'aria-current': `page`, 'aria-checked': `mixed`}),
        `<span aria-current="page" aria-checked="mixed"></span>`,
      )
    })

    t.test(function test_bool_attrs() {
      t.throws(() => E(`input`, {hidden: ``}), TypeError, `invalid property "hidden": expected variant of isBool, got ""`)
      t.throws(() => E(`input`, {hidden: 10}), TypeError, `invalid property "hidden": expected variant of isBool, got 10`)

      eqm2(
        E(`input`, {autofocus: true, disabled: true, hidden: true}),
        `<input autofocus="" disabled="" hidden="">`,
        `<input autofocus="" disabled="" hidden="" />`,
      )

      eqm2(
        E(`input`, {hidden: false, autofocus: false, disabled: true}),
        `<input disabled="">`,
        `<input disabled="" />`,
      )

      eqm2(
        E(`input`, {hidden: true, autofocus: null, disabled: undefined}),
        `<input hidden="">`,
        `<input hidden="" />`,
      )

      t.ok(E(`input`, {type: `checkbox`, checked: true}).checked)
      t.no(E(`input`, {type: `checkbox`, checked: false}).checked)
    })

    t.test(function test_attributes_prop() {
      t.throws(() => E(`div`, {attributes: {hidden: 10}}), TypeError, `invalid property "hidden": expected variant of isBool, got 10`)

      eqm(
        E(`div`, {attributes: {nonbool: `one`, hidden: true, disabled: false}}),
        `<div nonbool="one" hidden=""></div>`,
      )

      t.test(function test_attributes_prop_escaping() {
        eqm(
          E(`div`, {attributes: {attr: ESC_SRC}}),
          `<div attr="${ESC_OUT_ATTR}"></div>`,
        )
      })
    })

    t.test(function test_unknown_weird_attrs() {
      eqm(
        E(`div`, {'one-two': `three`, 'four.five': `six`}),
        `<div one-two="three" four.five="six"></div>`,
      )
    })

    t.test(function test_meta_attrs() {
      eqm2(
        E(`meta`, {httpEquiv: `content-type`}),
        `<meta http-equiv="content-type">`,
        `<meta http-equiv="content-type" />`,
      )

      eqm2(
        E(`meta`, {'http-equiv': `content-type`}),
        `<meta http-equiv="content-type">`,
        `<meta http-equiv="content-type" />`,
      )

      eqm2(
        E(`meta`, {httpEquiv: `X-UA-Compatible`, content: `IE=edge,chrome=1`}),
        `<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">`,
        `<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />`,
      )
    })

    t.test(function test_innerHTML() {
      function fail(src, msg) {
        t.throws(() => E(`div`, {innerHTML: src}), TypeError, msg)
      }

      fail([], `unable to convert [] to string`)
      fail({}, `unable to convert {} to string`)

      function test(src, exp) {
        const tar = E(`div`, {innerHTML: src})
        t.is(tar.innerHTML, exp)
        eqm(tar, `<div>${exp}</div>`)
      }

      function same(src) {test(src, src)}

      test(undefined, ``)
      test(null, ``)
      test(10, `10`)
      test({toString() {return `one`}}, `one`)

      same(``)
      same(`one`)
      same(`<script>alert("hacked")</script>`)
      same(`<div><a>one</a><b>two</b><c>three</c></div>`)
    })
  })

  t.test(function test_children() {
    t.test(function test_child_non_scalar() {
      testNonScalarChiStrict(E)
      ren.lax = true
      testNonScalarChiLax(E, eqm)
      ren.lax = false
      testNonScalarChiStrict(E)
    })

    t.test(function test_prim_children() {
      eqm(E(`div`, {chi: null}), `<div></div>`)
      eqm(E(`div`, {chi: undefined}), `<div></div>`)
      eqm(E(`div`, {chi: 0}), `<div>0</div>`)
      eqm(E(`div`, {chi: 10}), `<div>10</div>`)
      eqm(E(`div`, {chi: NaN}), `<div>NaN</div>`)
      eqm(E(`div`, {chi: Infinity}), `<div>Infinity</div>`)
      eqm(E(`div`, {chi: -Infinity}), `<div>-Infinity</div>`)
      eqm(E(`div`, {chi: true}), `<div>true</div>`)
      eqm(E(`div`, {chi: false}), `<div>false</div>`)
      eqm(E(`div`, {chi: `str`}), `<div>str</div>`)

      eqm(
        E(`div`, {chi: [
          null,
          undefined,
          0,
          10,
          NaN,
          Infinity,
          -Infinity,
          true,
          false,
          `str`,
        ]}),
        `<div>010NaNInfinity-Infinitytruefalsestr</div>`,
      )
    })

    t.test(function test_child_scalar() {
      eqm(E(`div`, {chi: new URL(`https://example.com`)}), `<div>https://example.com/</div>`)
    })

    t.test(function test_child_escaping() {
      eqm(
        E(`span`, {chi: `console.log('</script>')`}),
        `<span>console.log('&lt;/script&gt;')</span>`,
      )

      /*
      However, `HTMLScriptElement` is a special case!

      This example, if printed as HTML, would produce broken markup with a
      broken script inside. Users must escape script content in an
      appropriate language-specific way and then use `Raw`. We might be
      unable to provide a generic solution because `<script>` allows an open
      set of languages/syntaxes. Even just for JS and JSON, the correct way
      to escape </script> depends on the syntactic context.
      */
      eqm(
        E(`script`, {chi: `console.log('</script>')`}),
        `<script>console.log('</script>')</script>`,
      )

      eqm(
        E(`div`, {chi: ESC_SRC}),
        `<div>${ESC_OUT_TEXT}</div>`,
      )

      eqm(
        E(`div`, {chi: `<script></script>`}),
        `<div>&lt;script&gt;&lt;/script&gt;</div>`,
      )

      eqm(
        E(`outer`, {chi: E(`inner`, {chi: ESC_SRC})}),
        `<outer><inner>${ESC_OUT_TEXT}</inner></outer>`,
      )

      eqm(
        E(`div`, {chi: {toString() {return `<script></script>`}}}),
        `<div>&lt;script&gt;&lt;/script&gt;</div>`,
      )
    })

    t.test(function test_svg() {
      t.test(function test_svg_strict_mode() {
        t.throws(() => E(`svg`), SyntaxError, `namespace mismatch for element "svg": expected "http://www.w3.org/2000/svg", found "http://www.w3.org/1999/xhtml"`)
      })

      t.test(function test_svg_lax_mode() {
        ren.lax = true

        t.is(E(`svg`).namespaceURI, `http://www.w3.org/2000/svg`)

        const tar = E(`svg`, {chi:
          E(`line`, {x1: `12`, y1: `8`, x2: `12`, y2: `12`}),
        })

        eqm(tar, `<svg><line x1="12" y1="8" x2="12" y2="12"></line></svg>`)
        t.is(tar.namespaceURI, l.reqValidStr(p.NS_SVG))

        if (ob.HAS_DOM) {
          t.is(tar.firstChild.namespaceURI, l.reqValidStr(p.NS_SVG))
        }
        else {
          t.eq(
            tar.firstChild,
            new ds.RawText(`<line x1="12" y1="8" x2="12" y2="12"></line>`),
          )
        }

        ren.lax = false
      })
    })

    t.test(function test_fragment() {
      const frag = new ren.Frag()

      E(frag, {chi: [
        null, `one`, undefined, [[`_`]], [`two`], [[[]]],
        new env.Comment(`three`),
      ]})

      t.is(frag.textContent, `one_two`)

      eqm(
        E(`div`, {chi: frag}),
        `<div>one_two<!--three--></div>`
      )

      // An unfortunate deviation which is not worth fixing.
      if (ob.HAS_DOM) {
        t.is(frag.textContent, ``)
      }
      else {
        t.is(frag.textContent, `one_two`)
      }
    })
  })

  // TODO better tests.
  t.test(function test_custom_elements() {
    t.test(function test_simple() {
      class SomeElem extends env.HTMLElement {
        static customName = `elem-35e92d`
        static {dr.reg(this)}
        init() {return E(this, A.cls(`theme-prim`).chi(`some text`))}
      }

      l.nop(new SomeElem())
      t.is(SomeElem.localName, `elem-35e92d`)
      t.is(SomeElem.customName, `elem-35e92d`)

      t.is(new SomeElem().outerHTML, `<elem-35e92d></elem-35e92d>`)
      t.is(new SomeElem().init().outerHTML, `<elem-35e92d class="theme-prim">some text</elem-35e92d>`)
    })

    t.test(function test_extended() {
      class TestBtn extends env.HTMLButtonElement {
        static customName = `elem-4873e3`
        static {dr.reg(this)}
        init() {return E(this, A.cls(`theme-prim`).chi(`click me`))}
      }

      l.nop(new TestBtn())
      t.eq(TestBtn.localName, `button`)
      t.is(TestBtn.customName, `elem-4873e3`)

      t.is(new TestBtn().outerHTML, `<button is="elem-4873e3"></button>`)
      t.is(new TestBtn().init().outerHTML, `<button is="elem-4873e3" class="theme-prim">click me</button>`)
    })
  })
})

function testNonScalarChiStrict(E) {
  t.throws(() => E(`div`, {chi: Symbol(`str`)}),       TypeError, `unable to convert Symbol(str) to string`)
  t.throws(() => E(`div`, {chi: {}}),                  TypeError, `unable to convert {} to string`)
  t.throws(() => E(`div`, {chi: Object.create(null)}), TypeError, `unable to convert {} to string`)
  t.throws(() => E(`div`, {chi: new class {}()}),      TypeError, `unable to convert [object] to string`)
  t.throws(() => E(`div`, {chi: Promise.resolve()}),   TypeError, `unable to convert [object Promise] to string`)
}

function testNonScalarChiLax(E, eqm) {
  eqm(E(`div`, {chi: Symbol(`str`)}), `<div></div>`)
  eqm(E(`div`, {chi: {}}), `<div></div>`)
  eqm(E(`div`, {chi: Object.create(null)}), `<div></div>`)
  eqm(E(`div`, {chi: new class {}()}), `<div></div>`)
  eqm(E(`div`, {chi: () => {}}), `<div></div>`)
  eqm(E(`div`, {chi: function fun() {}}), `<div></div>`)
  eqm(E(`div`, {chi: Promise.resolve()}), `<div></div>`)
}

function testNonScalarPropStrict(E) {
  t.throws(() => E(`div`, {one: Symbol(`str`)}),       TypeError, `unable to convert property "one" Symbol(str) to string`)
  t.throws(() => E(`div`, {one: {}}),                  TypeError, `unable to convert property "one" {} to string`)
  t.throws(() => E(`div`, {one: l.Emp()}),             TypeError, `unable to convert property "one" {} to string`)
  t.throws(() => E(`div`, {one: new class {}()}),      TypeError, `unable to convert property "one" [object] to string`)
  t.throws(() => E(`div`, {one() {}}),                 TypeError, `unable to convert property "one" [function one] to string`)
  t.throws(() => E(`div`, {one: Promise.resolve()}),   TypeError, `unable to convert property "one" [object Promise] to string`)

  // Banned specifically in attrs, but allowed in children.
  t.throws(() => E(`div`, {one: []}), TypeError, `unable to convert property "one" [] to string`)
  t.throws(() => E(`div`, {one: new class extends Array {}()}), TypeError, `unable to convert property "one" [] to string`)
}

function testNonScalarPropLax(E, eqm) {
  eqm(E(`div`, {one: Symbol(`str`)}), `<div></div>`)
  eqm(E(`div`, {one: {}}), `<div></div>`)
  eqm(E(`div`, {one: l.Emp()}), `<div></div>`)
  eqm(E(`div`, {one: new class {}()}), `<div></div>`)
  eqm(E(`div`, {one: () => {}}), `<div></div>`)
  eqm(E(`div`, {one: function fun() {}}), `<div></div>`)
  eqm(E(`div`, {one: Promise.resolve()}), `<div></div>`)
  eqm(E(`div`, {one: [10, 20]}), `<div></div>`)
  eqm(E(`div`, {one: new class extends Array {}(10, 20)}), `<div></div>`)
}

/*
TODO: also test cleanup on GC. Our `obs_test.mjs` covers the cleanup of all
features provided by that module, but in principle, it is possible for a
renderer to accidentally mess up GC by creating strong references in the wrong
places. Some manual testing was done. Automated testing is needed.
*/
t.test(function test_Ren_reactivity() {
  t.test(function test_props_fun() {
    ren.shed = undefined

    {
      const obs = ob.obsRef(`one`)
      const node = E(`div`, () => ({class: obs.val, chi: `two`}))
      eqm(node, `<div class="one">two</div>`)

      obs.val = `three`
      eqm(node, `<div class="one">two</div>`)
    }

    ren.shed = ob.ShedSync.main

    {
      const obs = ob.obsRef(`one`)
      const node = E(`div`, () => ({class: obs.val, chi: `two`}))
      eqm(node, `<div class="one">two</div>`)

      obs.val = `three`
      eqm(node, `<div class="three">two</div>`)

      obs.val = `four`
      eqm(node, `<div class="four">two</div>`)

      E(node, undefined)
      eqm(node, `<div class="four">two</div>`)

      obs.val = `five`
      eqm(node, `<div class="four">two</div>`)
    }

    {
      const obs0 = ob.obsRef(`one`)
      const node = E(`div`, () => ({class: l.deref(obs0), chi: `two`}))
      eqm(node, `<div class="one">two</div>`)

      l.reset(obs0, `three`)
      eqm(node, `<div class="three">two</div>`)

      const obs1 = ob.obsRef(`four`)
      E(node, () => ({class: `five`, chi: l.deref(obs1)}))
      eqm(node, `<div class="five">four</div>`)

      l.reset(obs0, `six`)
      eqm(node, `<div class="five">four</div>`)

      l.reset(obs1, `seven`)
      eqm(node, `<div class="five">seven</div>`)

      E(node, undefined)
      eqm(node, `<div class="five">seven</div>`)

      l.reset(obs0, `eight`)
      eqm(node, `<div class="five">seven</div>`)

      l.reset(obs1, `nine`)
      eqm(node, `<div class="five">seven</div>`)
    }

    ren.shed = ob.getUiShed()
  })

  t.test(function test_props_obs() {
    ren.shed = undefined

    {
      const obs = ob.obsRef({class: `one`, chi: `two`})
      const node = E(`div`, obs)
      eqm(node, `<div class="one">two</div>`)
      obs.val = {class: `three`, chi: `four`}
      eqm(node, `<div class="one">two</div>`)
    }

    ren.shed = ob.ShedSync.main

    {
      const obs = ob.obsRef({class: `one`, chi: `two`})
      const node = E(`div`, obs)
      eqm(node, `<div class="one">two</div>`)

      obs.val = {class: `three`, chi: `four`}
      eqm(node, `<div class="three">four</div>`)

      obs.val = {class: `five`, chi: `six`}
      eqm(node, `<div class="five">six</div>`)

      E(node, undefined)
      eqm(node, `<div class="five">six</div>`)

      obs.val = {class: `seven`, chi: `eight`}
      eqm(node, `<div class="five">six</div>`)
    }

    {
      const obs0 = ob.obs({class: `one`, chi: `two`})
      const node = E(`div`, obs0)
      eqm(node, `<div class="one">two</div>`)

      l.reset(obs0, {class: `three`, style: {display: `flex`}})
      eqm(node, `<div class="three" style="display: flex;">two</div>`)

      l.reset(obs0, {chi: `four`})
      eqm(node, `<div class="three" style="display: flex;">four</div>`)

      const obs1 = ob.obs({class: `five`, style: undefined, chi: `six`})
      E(node, obs1)
      eqm(node, `<div class="five">six</div>`)

      l.reset(obs0, {chi: `seven`})
      eqm(node, `<div class="five">six</div>`)

      l.reset(obs1, {chi: `eight`})
      eqm(node, `<div class="five">eight</div>`)

      E(node, undefined)
      eqm(node, `<div class="five">eight</div>`)

      l.reset(obs0, {chi: `nine`})
      eqm(node, `<div class="five">eight</div>`)

      l.reset(obs1, {chi: `ten`})
      eqm(node, `<div class="five">eight</div>`)
    }

    ren.shed = ob.getUiShed()
  })

  t.test(function test_individual_prop_fun() {
    ren.shed = undefined

    {
      const obs = ob.obsRef(`four`)
      const node = E(`div`, {one: `two`, three: () => obs.val})
      eqm(node, `<div one="two" three="four"></div>`)
      obs.val = `five`
      eqm(node, `<div one="two" three="four"></div>`)
    }

    ren.shed = ob.ShedSync.main

    {
      const obs = ob.obsRef(`four`)
      const node = E(`div`, {one: `two`, three: () => obs.val})
      eqm(node, `<div one="two" three="four"></div>`)

      obs.val = `five`
      eqm(node, `<div one="two" three="five"></div>`)

      obs.val = `six`
      eqm(node, `<div one="two" three="six"></div>`)

      E(node, {three: `seven`})
      eqm(node, `<div one="two" three="seven"></div>`)

      obs.val = `eight`
      eqm(node, `<div one="two" three="seven"></div>`)
    }

    {
      const obs = ob.obs({val: `four`})
      const node = E(`div`, {one: `two`, three: () => obs.val})
      eqm(node, `<div one="two" three="four"></div>`)

      obs.val = `five`
      eqm(node, `<div one="two" three="five"></div>`)

      obs.val = `six`
      eqm(node, `<div one="two" three="six"></div>`)

      E(node, {three: `seven`})
      eqm(node, `<div one="two" three="seven"></div>`)

      obs.val = `eight`
      eqm(node, `<div one="two" three="seven"></div>`)
    }

    {
      const obs = ob.obsRef(`four`)
      const node = E(`div`, {
        one: `two`,
        three: () => obs.val,
        chi: () => obs.val,
      })
      eqm(node, `<div one="two" three="four">four</div>`)

      obs.val = `five`
      eqm(node, `<div one="two" three="five">five</div>`)

      obs.val = `six`
      eqm(node, `<div one="two" three="six">six</div>`)

      E(node, {three: `seven`})
      eqm(node, `<div one="two" three="seven">six</div>`)

      obs.val = `eight`
      eqm(node, `<div one="two" three="seven">eight</div>`)

      E(node, {chi: `nine`})
      eqm(node, `<div one="two" three="seven">nine</div>`)

      obs.val = `ten`
      eqm(node, `<div one="two" three="seven">nine</div>`)
    }

    {
      const obs0 = ob.obsRef(`four`)
      const obs1 = ob.obs({val: `five`})
      const node = E(`div`, {
        one: `two`,
        three: () => obs0.val,
        chi: () => obs1.val,
      })
      eqm(node, `<div one="two" three="four">five</div>`)

      obs0.val = `six`
      eqm(node, `<div one="two" three="six">five</div>`)

      obs1.val = `seven`
      eqm(node, `<div one="two" three="six">seven</div>`)

      obs0.val = `eight`
      eqm(node, `<div one="two" three="eight">seven</div>`)

      obs1.val = `nine`
      eqm(node, `<div one="two" three="eight">nine</div>`)

      E(node, {
        three: () => obs1.val,
        chi: () => obs0.val,
      })
      eqm(node, `<div one="two" three="nine">eight</div>`)

      obs0.val = `ten`
      eqm(node, `<div one="two" three="nine">ten</div>`)

      obs1.val = `eleven`
      eqm(node, `<div one="two" three="eleven">ten</div>`)

      E(node, {three: undefined})
      eqm(node, `<div one="two">ten</div>`)

      obs1.val = `twelve`
      eqm(node, `<div one="two">ten</div>`)

      obs0.val = `thirteen`
      eqm(node, `<div one="two">thirteen</div>`)

      E(node, {chi: undefined})
      eqm(node, `<div one="two"></div>`)

      obs0.val = `fourteen`
      eqm(node, `<div one="two"></div>`)
    }

    ren.shed = ob.getUiShed()
  })

  t.test(function test_individual_prop_obs() {
    ren.shed = undefined

    {
      const obs = ob.obsRef(`four`)
      const node = E(`div`, {one: `two`, three: obs})
      eqm(node, `<div one="two" three="four"></div>`)
      obs.val = `five`
      eqm(node, `<div one="two" three="four"></div>`)
    }

    ren.shed = ob.ShedSync.main

    {
      const obs = ob.obsRef(`four`)
      const node = E(`div`, {one: `two`, three: obs})
      eqm(node, `<div one="two" three="four"></div>`)

      obs.val = `five`
      eqm(node, `<div one="two" three="five"></div>`)

      obs.val = `six`
      eqm(node, `<div one="two" three="six"></div>`)

      E(node, {three: `seven`})
      eqm(node, `<div one="two" three="seven"></div>`)

      obs.val = `eight`
      eqm(node, `<div one="two" three="seven"></div>`)
    }

    {
      const src = ob.obs({val: `four`})
      const obs = ob.calc(() => src.val)
      const node = E(`div`, {one: `two`, three: obs})
      eqm(node, `<div one="two" three="four"></div>`)

      src.val = `five`
      eqm(node, `<div one="two" three="five"></div>`)

      src.val = `six`
      eqm(node, `<div one="two" three="six"></div>`)

      E(node, {three: `seven`})
      eqm(node, `<div one="two" three="seven"></div>`)

      obs.val = `eight`
      eqm(node, `<div one="two" three="seven"></div>`)
    }

    {
      const obs = ob.obsRef(`four`)
      const node = E(`div`, {one: `two`, three: obs, chi: obs})
      eqm(node, `<div one="two" three="four">four</div>`)

      obs.val = `five`
      eqm(node, `<div one="two" three="five">five</div>`)

      obs.val = `six`
      eqm(node, `<div one="two" three="six">six</div>`)

      E(node, {three: `seven`})
      eqm(node, `<div one="two" three="seven">six</div>`)

      obs.val = `eight`
      eqm(node, `<div one="two" three="seven">eight</div>`)

      E(node, {chi: `nine`})
      eqm(node, `<div one="two" three="seven">nine</div>`)

      obs.val = `ten`
      eqm(node, `<div one="two" three="seven">nine</div>`)
    }

    {
      const obs0 = ob.obsRef(`four`)
      const obs1 = ob.obsRef(`five`)
      const node = E(`div`, {one: `two`, three: obs0, chi: obs1})
      eqm(node, `<div one="two" three="four">five</div>`)

      obs0.val = `six`
      eqm(node, `<div one="two" three="six">five</div>`)

      obs1.val = `seven`
      eqm(node, `<div one="two" three="six">seven</div>`)

      obs0.val = `eight`
      eqm(node, `<div one="two" three="eight">seven</div>`)

      obs1.val = `nine`
      eqm(node, `<div one="two" three="eight">nine</div>`)

      E(node, {three: obs1, chi: obs0})
      eqm(node, `<div one="two" three="nine">eight</div>`)

      obs0.val = `ten`
      eqm(node, `<div one="two" three="nine">ten</div>`)

      obs1.val = `eleven`
      eqm(node, `<div one="two" three="eleven">ten</div>`)

      E(node, {three: undefined})
      eqm(node, `<div one="two">ten</div>`)

      obs1.val = `twelve`
      eqm(node, `<div one="two">ten</div>`)

      obs0.val = `thirteen`
      eqm(node, `<div one="two">thirteen</div>`)

      E(node, {chi: undefined})
      eqm(node, `<div one="two"></div>`)

      obs0.val = `fourteen`
      eqm(node, `<div one="two"></div>`)
    }

    ren.shed = ob.getUiShed()
  })

  t.test(function test_chi_fun_obs() {
    t.test(function test_fun_non_reactive() {
      ren.shed = undefined

      const obs = ob.obsRef(10)
      const tar = E(`div`, {chi: () => obs.val})
      eqm(tar, `<div>10</div>`)

      obs.val = 20
      eqm(tar, `<div>10</div>`)

      ren.shed = ob.getUiShed()
    })

    t.test(function test_obs_non_reactive() {
      ren.shed = undefined

      const obs = ob.obsRef(10)
      const tar = E(`div`, {chi: obs})
      eqm(tar, `<div>10</div>`)

      obs.val = 20
      eqm(tar, `<div>10</div>`)

      ren.shed = ob.getUiShed()
    })

    t.test(function test_mixed_reactive() {
      ren.shed = ob.ShedSync.main

      const obs0 = ob.obsRef()
      const obs1 = ob.obs({val: undefined})

      // This is initialized as a "prop" recurrent, not as a child.
      // We're also testing that it will be cleaned up / replaced.
      const tar = E(`div`, {chi: () => obs1.val})
      eqm(tar, `<div></div>`)

      t.is(tar.childNodes[0], undefined)
      t.is(tar.childNodes.length, 0)

      obs1.val = `one`
      eqm(tar, `<div>one</div>`)

      t.inst(tar.childNodes[0], env.Text)
      t.is(tar.childNodes.length, 1)

      E(tar, {chi: [() => obs0.val]})
      eqm(tar, `<div></div>`)

      t.inst(tar.childNodes[0], ren.RecNodeFun)
      t.is(tar.childNodes.length, 1)

      obs0.val = 10
      eqm(tar, `<div>10</div>`)

      obs1.val = undefined
      eqm(tar, `<div>10</div>`)

      t.inst(tar.childNodes[0], ren.RecNodeFun)
      t.is(tar.childNodes.length, 1)

      obs0.val = `str`
      eqm(tar, `<div>str</div>`)

      t.inst(tar.childNodes[0], ren.RecNodeFun)
      t.is(tar.childNodes.length, 1)

      obs0.val = [10]
      eqm(tar, `<div>10</div>`)

      obs0.val = [10, `_`, 20]
      eqm(tar, `<div>10_20</div>`)

      obs0.val = [10, `_`, 20, `_`, 30]
      eqm(tar, `<div>10_20_30</div>`)

      obs1.val = [`_`, 40, `_`, 50]
      E(tar, {chi: [obs0, () => obs1.val]})
      eqm(tar, `<div>10_20_30_40_50</div>`)

      obs1.val = undefined
      eqm(tar, `<div>10_20_30</div>`)

      obs1.val = [`_`, 60, `_`, 70]
      eqm(tar, `<div>10_20_30_60_70</div>`)

      obs0.val = ``
      eqm(tar, `<div>_60_70</div>`)

      obs0.val = [10, `_`, 20, `_`, 30]
      eqm(tar, `<div>10_20_30_60_70</div>`)

      t.ok(ob.isObsRef(obs0))
      t.ok(ob.isObsRef(obs1))

      obs0.val = [10, `_`]
      obs1.toNode = () => [`_`, 20]

      E(tar, {chi: [obs0, obs1]})
      eqm(tar, `<div>10__20</div>`)

      ren.shed.pause()
      try {
        obs0.val = [30, `_`]
        obs1.toNode = () => [`_`, 40]
      }
      finally {ren.shed.flush()}
      eqm(tar, `<div>30__40</div>`)

      ren.shed = ob.getUiShed()
    })
  })
})

t.test(function test_Ren_moving_children() {
  t.test(function test_moving_between_one_node() {
    const one = new env.Text(`one`)
    const two = new env.Text(`two`)
    const three = new env.Text(`three`)

    const tar = E(`div`)
    tar.appendChild(one)
    tar.appendChild(two)
    tar.appendChild(three)

    t.eq([...tar.childNodes], [one, two, three])

    // This input is "ambiguous": the node `three` is provided more than once.
    ren.replaceChi(tar, [three, tar.childNodes])

    eqm(tar, `<div>onetwothree</div>`)
    t.eq([...tar.childNodes], [one, two, three])

    ren.replaceChi(tar, [tar.childNodes, one])

    eqm(tar, `<div>twothreeone</div>`)
    t.eq([...tar.childNodes], [two, three, one])
  })

  t.test(function test_moving_between_two_nodes() {
    const one = new env.Text(`one`)
    const two = new env.Text(`two`)
    const three = new env.Text(`three`)

    const prev = E(`div`, {chi: [one, two, three]})
    const next = E(`p`, {chi: prev.childNodes})

    eqm(prev, `<div></div>`)
    eqm(next, `<p>onetwothree</p>`)
  })
})

t.test(function test_Ren_replaceChi_preserve_prefix() {
  class SomeElem extends env.HTMLElement {
    static customName = `elem-ece9f0`
    static {dr.reg(this)}
    con = 0
    dis = 0
    connectedCallback() {this.con++}
    disconnectedCallback() {this.dis++}
  }

  const tar = E(`div`)
  const chi0 = new SomeElem()
  const chi1 = new SomeElem()
  const chi2 = new SomeElem()
  const chi3 = new SomeElem()

  env.document.body.appendChild(tar)

  try {
    E(tar, {chi: [chi0, chi1, chi2, chi3]})

    t.is(chi0.con, 1)
    t.is(chi1.con, 1)
    t.is(chi2.con, 1)
    t.is(chi3.con, 1)

    t.is(chi0.dis, 0)
    t.is(chi1.dis, 0)
    t.is(chi2.dis, 0)
    t.is(chi3.dis, 0)

    E(tar, {chi: [chi0, chi1, chi2, chi3]})

    t.is(chi0.con, 1)
    t.is(chi1.con, 1)
    t.is(chi2.con, 1)
    t.is(chi3.con, 1)

    t.is(chi0.dis, 0)
    t.is(chi1.dis, 0)
    t.is(chi2.dis, 0)
    t.is(chi3.dis, 0)

    E(tar, {chi: [chi0, chi1]})

    t.is(chi0.con, 1)
    t.is(chi1.con, 1)
    t.is(chi2.con, 1)
    t.is(chi3.con, 1)

    t.is(chi0.dis, 0)
    t.is(chi1.dis, 0)
    t.is(chi2.dis, 1)
    t.is(chi3.dis, 1)

    E(tar, {chi: []})
    t.no(tar.hasChildNodes())
    t.is(tar.childNodes.length, 0)

    t.is(chi0.con, 1)
    t.is(chi1.con, 1)
    t.is(chi2.con, 1)
    t.is(chi3.con, 1)

    t.is(chi0.dis, 1)
    t.is(chi1.dis, 1)
    t.is(chi2.dis, 1)
    t.is(chi3.dis, 1)

    E(tar, {chi: [chi0, chi1]})

    t.is(chi0.con, 2)
    t.is(chi1.con, 2)
    t.is(chi2.con, 1)
    t.is(chi3.con, 1)

    t.is(chi0.dis, 1)
    t.is(chi1.dis, 1)
    t.is(chi2.dis, 1)
    t.is(chi3.dis, 1)

    E(tar, {chi: [chi0, chi3, chi2, chi1]})

    t.is(chi0.con, 2)
    t.is(chi1.con, 3)
    t.is(chi2.con, 2)
    t.is(chi3.con, 2)

    t.is(chi0.dis, 1)
    t.is(chi1.dis, 2)
    t.is(chi2.dis, 1)
    t.is(chi3.dis, 1)
  }
  finally {tar.remove()}
})

t.test(function test_Ren_mutText() {
  t.throws(() => ren.mutText(), TypeError, `expected variant of isNode, got undefined`)

  const node = E(`div`, {class: `one`, chi: `two`})
  eqm(node, `<div class="one">two</div>`)

  t.throws(() => ren.mutText(node, {}), TypeError, `unable to convert {} to string`)
  t.throws(() => ren.mutText(node, []), TypeError, `unable to convert [] to string`)

  t.is(ren.mutText(node), node)
  eqm(node, `<div class="one"></div>`)

  t.is(ren.mutText(node, `three`), node)
  eqm(node, `<div class="one">three</div>`)

  t.is(ren.mutText(node, `<four></four>`), node)
  eqm(node, `<div class="one">&lt;four&gt;&lt;/four&gt;</div>`)

  t.is(ren.mutText(node, new String(`<five></five>`)), node)
  eqm(node, `<div class="one">&lt;five&gt;&lt;/five&gt;</div>`)
})

t.test(function test_Ren_custom_element() {
  class SomeElem extends env.HTMLElement {
    static customName = `elem-a5425a`
    static {dr.reg(this)}
    init() {return E(this, {id: `one`, class: `two`, chi: `three`})}
  }

  eqm(
    new SomeElem().init(),
    `<elem-a5425a id="one" class="two">three</elem-a5425a>`,
  )
})

t.test(function test_html_document_basic() {
  t.is(
    p.DOCTYPE_HTML + E(`html`, {chi: [
      E(`head`, {chi: E(`title`, {chi: `test`})}),
      E(`body`, A.cls(`page`).chi(
        E(`main`, {chi: E(`a`, A.href(`/`).cls(`link`).chi(`Home`))}),
      )),
    ]}).outerHTML,
    `<!doctype html><html><head><title>test</title></head><body class="page"><main><a href="/" class="link">Home</a></main></body></html>`,
  )
})

if (import.meta.main) console.log(`[test] ok!`)
