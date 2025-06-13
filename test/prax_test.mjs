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
const F = ren.frag.bind(ren)
const A = new p.PropBui().frozen()
const {Text, Comment} = env

function* gen(...vals) {for (const val of vals) yield val}
function testDerefOwn(src, exp) {t.own(src[l.VAL], exp)}

// Short for "equal markup".
export function eqm(val, exp) {
  t.ok(p.isRaw(val))
  l.reqStr(exp)
  t.is(val.outerHTML, exp)
}

export function eqm2(val, native, shimmed) {
  t.ok(p.isRaw(val))
  l.reqStr(native)
  l.reqStr(shimmed)

  if (ob.HAS_DOM) {
    t.is(val.outerHTML, native)
  }
  else {
    t.is(val.outerHTML, shimmed)
  }
}

/* Test */

t.test(function test_Raw() {
  t.throws(() => new p.Raw({}), TypeError, `unable to convert {} to string`)
  t.throws(() => new p.Raw([]), TypeError, `unable to convert [] to string`)

  function test(src, exp) {
    const tar = new p.Raw(src)
    t.ok(p.isRaw(tar))
    t.is(tar.outerHTML, exp)
  }

  test(undefined, ``)
  test(null, ``)
  test(``, ``)
  test(10, `10`)
  test(`str`, `str`)
  test(`<script>alert("hacked")</script>`, `<script>alert("hacked")</script>`)
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

  t.test(function test_mut() {
    function none(src) {
      const out = A.mut(src)
      t.is(out, A)
      t.is(out[l.VAL], undefined)
    }

    none()
    none(undefined)
    none(null)

    function some(src) {
      const out = A.mut(src)
      t.isnt(out, A)
      testDerefOwn(out, {...src})
    }

    some({})
    some({one: 10})
    some({one: 10, two: 20})
  })
})

t.test(function test_Ren_elemHtml_invalid() {
  t.test(function test_invalid_tag() {
    function fail(src, exp) {t.throws(() => ren.elemHtml(src), TypeError, exp)}

    fail(undefined, `unable to convert undefined to HTML element`)
    fail(null, `unable to convert null to HTML element`)
    fail(true, `unable to convert true to HTML element`)
    fail(123, `unable to convert 123 to HTML element`)
    fail(E, `unable to convert [function bound E] to HTML element`)
    fail({}, `expected variant of isNode, got {}`)
    fail({one: 123}, `expected variant of isNode, got {one: 123}`)
    fail({toString() {return `div`}}, `expected variant of isNode, got {toString: [function toString]}`)
  })

  t.test(function test_invalid_props() {
    t.throws(() => ren.elemHtml(`div`, 10),                          TypeError, `expected variant of isRec, got 10`)
    t.throws(() => ren.elemHtml(`div`, `str`),                       TypeError, `expected variant of isRec, got "str"`)
    t.throws(() => ren.elemHtml(`div`, {nop: l.nop}),                TypeError, `unable to convert property "nop" [function nop] to string`)
    t.throws(() => ren.elemHtml(`div`, []),                          TypeError, `expected variant of isRec, got []`)
    t.throws(() => ren.elemHtml(`div`, new String()),                TypeError, `expected variant of isRec, got [object String ""]`)
    t.throws(() => ren.elemHtml(`div`, {attributes: 10}),            TypeError, `expected variant of isRec, got 10`)
    t.throws(() => ren.elemHtml(`div`, {attributes: `str`}),         TypeError, `expected variant of isRec, got "str"`)
    t.throws(() => ren.elemHtml(`div`, {attributes: []}),            TypeError, `expected variant of isRec, got []`)
    t.throws(() => ren.elemHtml(`div`, {class: []}),                 TypeError, `unable to convert property "class" [] to string`)
    t.throws(() => ren.elemHtml(`div`, {className: []}),             TypeError, `unable to convert property "className" [] to string`)
    t.throws(() => ren.elemHtml(`div`, {class: {}}),                 TypeError, `unable to convert property "class" {} to string`)
    t.throws(() => ren.elemHtml(`div`, {className: {}}),             TypeError, `unable to convert property "className" {} to string`)
    t.throws(() => ren.elemHtml(`div`, {class: new class {}()}),     TypeError, `unable to convert property "class" [object] to string`)
    t.throws(() => ren.elemHtml(`div`, {className: new class {}()}), TypeError, `unable to convert property "className" [object] to string`)
    t.throws(() => ren.elemHtml(`div`, {style: 10}),                 TypeError, `unable to convert 10 to style`)
    t.throws(() => ren.elemHtml(`div`, {style: []}),                 TypeError, `unable to convert [] to style`)
    t.throws(() => ren.elemHtml(`div`, {dataset: 10}),               TypeError, `expected variant of isRec, got 10`)
    t.throws(() => ren.elemHtml(`div`, {dataset: `str`}),            TypeError, `expected variant of isRec, got "str"`)
    t.throws(() => ren.elemHtml(`div`, {dataset: []}),               TypeError, `expected variant of isRec, got []`)
  })
})

t.test(function test_Ren_E_basic() {
  t.test(function test_tag_string() {
    eqm(E(`span`),                        `<span></span>`)
    eqm(E(`span`, null),                  `<span></span>`)
    eqm(E(`span`, null, null),            `<span></span>`)
    eqm(E(`span`, null, null, null),      `<span></span>`)
    eqm(E(`span`, null, `one`),           `<span>one</span>`)
    eqm(E(`span`, null, `one`, `two`),    `<span>onetwo</span>`)
    eqm(E(`span`, {one: `two`}),          `<span one="two"></span>`)
    eqm(E(`span`, {one: `two`}, `three`), `<span one="two">three</span>`)
  })

  t.test(function test_element_mut_props_or_chi() {
    eqm(E(E(`span`)), `<span></span>`)

    eqm(E(E(E(`span`))), `<span></span>`)

    const node = E(`span`)
    eqm(node, `<span></span>`)

    t.is(E(node, {one: `two`}), node)
    eqm(node, `<span one="two"></span>`)

    t.is(E(node, {three: `four`}), node)
    eqm(node, `<span three="four"></span>`)

    t.is(E(node, {one: `two`, three: `four`}), node)
    eqm(node, `<span three="four" one="two"></span>`)

    t.is(E(node, undefined), node)
    eqm(node, `<span three="four" one="two"></span>`)

    t.is(E(node, undefined, `five`), node)
    eqm(node, `<span three="four" one="two">five</span>`)

    t.is(E(node, {six: `seven`}), node)
    eqm(node, `<span six="seven">five</span>`)

    t.is(E(node, undefined, undefined), node)
    eqm(node, `<span six="seven"></span>`)

    t.is(E(node, null, `eight`), node)
    eqm(node, `<span six="seven">eight</span>`)

    t.is(E(node, {}, undefined), node)
    eqm(node, `<span></span>`)
  })
})

/*
The test mostly verifies serialization behaviors common between DOM and non-DOM
environments. For DOM-specific behaviors (native or shimmed), see other tests.
*/
t.test(function test_Ren_serialization() {
  t.throws(() => E(`link`, {}, null), SyntaxError, `expected void element "link" to have no children, got [null]`)
  t.throws(() => E(`link`, null, null), SyntaxError, `expected void element "link" to have no children, got [null]`)
  t.throws(() => E(`link`, null, undefined), SyntaxError, `expected void element "link" to have no children, got [undefined]`)
  t.throws(() => E(`link`, null, 123), SyntaxError, `expected void element "link" to have no children, got [123]`)

  t.test(function test_tag_closing() {
    t.test(function test_void_elems() {
      t.test(function test_void_elems_with_children() {
        for (const tag of [`link`, `img`]) {
          for (const child of [null, ``, [], {}]) {
            t.throws(() => E(tag, {}, child), Error, `expected void element ${l.show(tag)} to have no children, got [${l.show(child)}]`)
          }
        }
      })

      t.test(function test_empty_void_elem_self_closing() {
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
          E(`div`, {attr: `<one>&"</one>`}),
          `<div attr="<one>&amp;&quot;</one>"></div>`,
        )

        eqm(
          E(`outer`, {}, E(`inner`, {attr: `<one>&"</one>`})),
          `<outer><inner attr="<one>&amp;&quot;</one>"></inner></outer>`,
        )
      })

      t.test(function test_attr_PropBui() {
        eqm(
          E(`a`, A.href(`/`).cls(`link`), `text`),
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
          E(`div`, {class: `<one>&"</one>`}),
          `<div class="<one>&amp;&quot;</one>"></div>`,
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
          E(`div`, {style: `<one>&"</one>`}),
          `<div style="<one>&amp;&quot;</one>"></div>`,
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
          E(`div`, {'data-attr': `<one>&"</one>`}),
          `<div data-attr="<one>&amp;&quot;</one>"></div>`,
        )
        eqm(
          E(`div`, {dataset: {attr: `<one>&"</one>`}}),
          `<div data-attr="<one>&amp;&quot;</one>"></div>`,
        )
      })
    })

    /*
    The DOM standard defines various aria getters/setters for the `Element`
    interface, such as `.ariaCurrent` and more. We don't implement them because
    Firefox doesn't implement them. It would be a compatibility footgun,
    leading to code that works with a shim and in various environments, but
    breaks in FF.
    */
    t.test(function test_aria_attrs() {
      // This test would work with shim and in FF, but not in Chrome.
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
    })

    t.test(function test_attributes_prop() {
      t.throws(() => E(`div`, {attributes: {hidden: 10}}), TypeError, `invalid property "hidden": expected variant of isBool, got 10`)

      eqm(
        E(`div`, {attributes: {nonbool: `one`, hidden: true, disabled: false}}),
        `<div nonbool="one" hidden=""></div>`,
      )

      t.test(function test_attributes_prop_escaping() {
        eqm(
          E(`div`, {attributes: {attr: `<one>&"</one>`}}),
          `<div attr="<one>&amp;&quot;</one>"></div>`,
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
      eqm(E(`div`, {}, null), `<div></div>`)
      eqm(E(`div`, {}, undefined), `<div></div>`)
      eqm(E(`div`, {}, 0), `<div>0</div>`)
      eqm(E(`div`, {}, 10), `<div>10</div>`)
      eqm(E(`div`, {}, NaN), `<div>NaN</div>`)
      eqm(E(`div`, {}, Infinity), `<div>Infinity</div>`)
      eqm(E(`div`, {}, -Infinity), `<div>-Infinity</div>`)
      eqm(E(`div`, {}, true), `<div>true</div>`)
      eqm(E(`div`, {}, false), `<div>false</div>`)
      eqm(E(`div`, {}, `str`), `<div>str</div>`)

      eqm(
        E(`div`, {},
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
        ),
        `<div>010NaNInfinity-Infinitytruefalsestr</div>`,
      )
    })

    t.test(function test_child_scalar() {
      eqm(E(`div`, {}, new URL(`https://example.com`)), `<div>https://example.com/</div>`)
    })

    t.test(function test_child_flattening() {
      eqm(
        E(`outer`, {},
          undefined,
          [[[]]],
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
          `five`,
        ),
        `<outer>one<mid>two<inner>three</inner>four</mid>five</outer>`,
      )

      eqm(
        E(`outer`, {}, gen(
          undefined,
          gen(gen(gen([]))),
          gen(gen(gen(`one`))),
          gen(
            null,
            E(`mid`, {}, gen(
              undefined,
              gen(`two`, gen(E(`inner`, {}, gen(gen([`three`]), undefined)))),
              null,
              [`four`],
            )),
          ),
          `five`,
        )),
        `<outer>one<mid>two<inner>three</inner>four</mid>five</outer>`,
      )
    })

    t.test(function test_child_escaping() {
      t.test(function test_escape_non_raw() {
        eqm(
          E(`span`, {}, `console.log('</script>')`),
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
          E(`script`, {}, `console.log('</script>')`),
          `<script>console.log('</script>')</script>`,
        )

        t.test(function test_dont_escape_raw() {
          eqm(
            E(`outer`, {}, new p.Raw(`<one>two</one>`)),
            `<outer><one>two</one></outer>`,
          )
        })

        eqm(
          E(`div`, {}, `<one>&"</one>`),
          `<div>&lt;one&gt;&amp;"&lt;/one&gt;</div>`,
        )

        eqm(
          E(`div`, {}, `<script></script>`),
          `<div>&lt;script&gt;&lt;/script&gt;</div>`,
        )

        eqm(
          E(`outer`, {}, E(`inner`, {}, `<one>&"</one>`)),
          `<outer><inner>&lt;one&gt;&amp;"&lt;/one&gt;</inner></outer>`,
        )

        eqm(
          E(`div`, {}, {toString() {return `<script></script>`}}),
          `<div>&lt;script&gt;&lt;/script&gt;</div>`,
        )
      })

      t.test(function test_dont_escape_raw() {
        t.test(function test_html() {
          eqm(
            E(`outer`, {}, new p.Raw(`<inner>text</inner>`)),
            `<outer><inner>text</inner></outer>`,
          )

          eqm(
            E(`div`, {}, new p.Raw(`<a>one</a><b>two</b><c>three</c>`)),
            `<div><a>one</a><b>two</b><c>three</c></div>`,
          )
        })

        t.test(function test_svg_in_strict_mode() {
          t.throws(() => E(`svg`), SyntaxError, `namespace mismatch for element "svg": expected "http://www.w3.org/2000/svg", found "http://www.w3.org/1999/xhtml"`)
        })

        t.test(function test_svg_in_lax_mode() {
          ren.lax = true

          t.is(E(`svg`).namespaceURI, `http://www.w3.org/2000/svg`)

          eqm(
            E(`svg`, {}, new p.Raw(`<line x1="12" y1="8" x2="12" y2="12"></line>`)),
            `<svg><line x1="12" y1="8" x2="12" y2="12"></line></svg>`,
          )

          ren.lax = false
        })
      })
    })

    // Fragment's type and structure is different between `str.mjs` and
    // `dom.mjs`, and tested separately.
    t.test(function test_fragment() {
      t.test(function test_fragment_as_child() {
        eqm(
          E(`div`, {}, F(null, `one`, undefined, [`two`], [])),
          `<div>onetwo</div>`,
        )

        eqm(
          E(`outer`, {}, F(F(F(E(`inner`, {}, `text`))))),
          `<outer><inner>text</inner></outer>`,
        )
      })
    })
  })

  // TODO better tests.
  t.test(function test_custom_elements() {
    t.test(function test_simple() {
      class SomeElem extends env.HTMLElement {
        static customName = `elem-35e92d`
        static {dr.reg(this)}
        init() {return E(this, A.cls(`theme-prim`), `some text`)}
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
        init() {return E(this, A.cls(`theme-prim`), `click me`)}
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
  t.throws(() => E(`div`, {}, Symbol(`str`)),       TypeError, `unable to convert Symbol(str) to string`)
  t.throws(() => E(`div`, {}, {}),                  TypeError, `unable to convert {} to string`)
  t.throws(() => E(`div`, {}, Object.create(null)),             TypeError, `unable to convert {} to string`)
  t.throws(() => E(`div`, {}, Promise.resolve()),   TypeError, `unable to convert [object Promise] to string`)
}

function testNonScalarChiLax(E, eqm) {
  eqm(E(`div`, {}, Symbol(`str`)), `<div></div>`)
  eqm(E(`div`, {}, {}), `<div></div>`)
  eqm(E(`div`, {}, Object.create(null)), `<div></div>`)
  eqm(E(`div`, {}, new class {}()), `<div></div>`)
  eqm(E(`div`, {}, () => {}), `<div></div>`)
  eqm(E(`div`, {}, function fun() {}), `<div></div>`)
  eqm(E(`div`, {}, Promise.resolve()), `<div></div>`)
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

t.test(function test_Ren_dom_behaviors() {
  t.test(function test_fragment() {
    t.inst(F(), env.DocumentFragment)

    t.is(
      F(`one`, [10], E(`div`, {}, `two`, new Comment(`three`))).textContent,
      `one10two`,
    )
  })

  // Parts of this function are tested elsewhere.
  // We only need a sanity check here.
  t.test(function test_mutProps_basic() {
    t.throws(() => ren.mutProps(), TypeError, `expected variant of isObj, got undefined`)

    t.test(function test_identity() {
      const node = E(`div`)
      t.is(ren.mutProps(node), node)
    })

    const node = E(`div`, {class: `one`}, `two`)
    eqm(node, `<div class="one">two</div>`)

    t.is(ren.mutProps(node, {class: `three`}), node)
    eqm(node, `<div class="three">two</div>`)
  })

  t.test(function test_mutProps_fun() {
    const obs = ob.obsRef(`one`)

    ren.shed = undefined

    {
      const node = E(`div`, () => ({class: obs.val}), `two`)
      eqm(node, `<div class="one">two</div>`)
      obs.val = `three`
      eqm(node, `<div class="one">two</div>`)
    }

    ren.shed = ob.ShedSync.main

    {
      const node = E(`div`, () => ({class: obs.val}), `two`)
      eqm(node, `<div class="three">two</div>`)
      obs.val = `four`
      eqm(node, `<div class="four">two</div>`)
    }

    ren.shed = ob.getUiShed()
  })

  t.test(function test_mutProps_obs() {
    ren.shed = undefined

    {
      const obs = ob.obsRef({class: `one`})
      const node = E(`div`, obs, `two`)
      eqm(node, `<div class="one">two</div>`)
      obs.val = {class: `three`}
      eqm(node, `<div class="one">two</div>`)
    }

    ren.shed = ob.ShedSync.main

    {
      const obs = ob.obsRef({class: `one`})
      const node = E(`div`, obs, `two`)
      eqm(node, `<div class="one">two</div>`)
      obs.val = {class: `three`, style: `display: flex`}
      eqm(node, `<div class="three" style="display: flex">two</div>`)
    }

    {
      const obs = ob.obs({class: `one`})
      const node = E(`div`, obs, `two`)
      eqm(node, `<div class="one">two</div>`)
      ren.shed.pause()
      try {
        obs.class = `three`
        obs.style = `display: flex`
      }
      finally {ren.shed.flush()}
      eqm(node, `<div class="three" style="display: flex">two</div>`)
    }

    ren.shed = ob.getUiShed()
  })

  // Parts of this function are tested elsewhere.
  // We only need a sanity check here.
  t.test(function test_mut() {
    t.throws(() => ren.mut(), TypeError, `expected variant of isObj, got undefined`)

    t.test(function test_mut_identity() {
      const node = E(`div`)
      t.is(ren.mut(node), node)
    })

    t.test(function test_mut_removes_children() {
      eqm(
        ren.mut(E(`div`, {class: `one`}, `two`), {class: `three`}),
        `<div class="three"></div>`,
      )
    })

    t.test(function test_mut_replaces_children() {
      eqm(
        ren.mut(E(`div`, {class: `one`}, `two`), {class: `three`}, `four`),
        `<div class="three">four</div>`,
      )
    })
  })

  t.test(function test_child_stealing() {
    t.test(function test_stealing_from_self() {
      const one = new Text(`one`)
      const two = new Text(`two`)
      const three = new Text(`three`)

      const tar = E(`div`)
      tar.appendChild(one)
      tar.appendChild(two)
      tar.appendChild(three)

      // Flat structure is important for this test.
      t.eq([...tar.childNodes], [one, two, three])

      ren.mutChi(tar, three, tar.childNodes)

      eqm(tar, `<div>threeonetwo</div>`)
    })

    t.test(function test_stealing_from_another() {
      const one = new Text(`one`)
      const two = new Text(`two`)
      const three = new Text(`three`)

      const prev = E(`div`, {}, one, two, three)
      const next = E(`p`, {}, prev.childNodes)

      eqm(prev, `<div></div>`)
      eqm(next, `<p>onetwothree</p>`)
    })
  })

  t.test(function test_mutText() {
    t.throws(() => ren.mutText(), TypeError, `expected variant of isNode, got undefined`)

    const node = E(`div`, {class: `one`}, `two`)
    eqm(node, `<div class="one">two</div>`)

    t.throws(() => ren.mutText(node, {}), TypeError, `unable to convert {} to string`)
    t.throws(() => ren.mutText(node, []), TypeError, `unable to convert [] to string`)
    t.throws(() => ren.mutText(node, new p.Raw()), TypeError, `unable to convert [object Raw {outerHTML: ""}] to string`)

    t.is(ren.mutText(node), node)
    eqm(node, `<div class="one"></div>`)

    t.is(ren.mutText(node, `three`), node)
    eqm(node, `<div class="one">three</div>`)

    t.is(ren.mutText(node, new String(`<four></four>`)), node)
    eqm(node, `<div class="one">&lt;four&gt;&lt;/four&gt;</div>`)
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

    t.is(
      elem.textContent,
      `onetwothreefourfive`,
    )

    eqm(
      elem,
      `<outer>one<mid>two<inner>three</inner>four</mid>five</outer>`,
    )
  })

  t.test(function test_replace() {
    t.throws(() => ren.replace(), TypeError, `expected variant of isNode, got undefined`)
    t.throws(() => ren.replace(E(`div`)), TypeError, `properties of null`)

    {
      const tar = E(`div`, {}, new Text(`text`))
      eqm(tar, `<div>text</div>`)
      ren.replace(tar.firstChild, undefined)
      eqm(tar, `<div></div>`)
    }

    {
      const one = E(`one`)
      const two = E(`two`)
      const three = E(`three`)
      const tar = E(`div`, {}, one, two, three)

      eqm(tar, `<div><one></one><two></two><three></three></div>`)

      ren.replace(two, `four`, null, `five`)
      eqm(tar, `<div><one></one>fourfive<three></three></div>`)
    }
  })

  t.test(function test_chi_fun_obs() {
    const obs0 = ob.obsRef()

    t.test(function test_fun_non_reactive() {
      ren.shed = undefined

      const tar = E(`div`, {}, () => obs0.val)
      eqm(tar, `<div></div>`)
      obs0.val = 10
      eqm(tar, `<div></div>`)

      ren.shed = ob.getUiShed()
    })

    t.test(function test_obs_non_reactive() {
      ren.shed = undefined

      const tar = E(`div`, {}, obs0)
      eqm(tar, `<div></div>`)
      obs0.val = 10
      eqm(tar, `<div></div>`)

      ren.shed = ob.getUiShed()
    })

    t.test(function test_reactive() {
      ren.shed = ob.ShedSync.main
      obs0.val = undefined

      const tar = E(`div`, {}, () => obs0.val)
      eqm(tar, `<div></div>`)

      t.inst(tar.childNodes[0], ren.RecNodeFun)
      t.is(tar.childNodes.length, 1)

      obs0.val = 10
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

      const obs1 = ob.obs({val: [`_`, 40, `_`, 50]})

      E(tar, {}, obs0, () => obs1.val)
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

      E(tar, {}, obs0, obs1)

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

t.test(function test_Ren_custom_element() {
  class SomeElem extends env.HTMLElement {
    static customName = `elem-a5425a`
    static {dr.reg(this)}
    init() {return E(this, {id: `one`, class: `two`}, `three`)}
  }

  eqm(
    new SomeElem().init(),
    `<elem-a5425a id="one" class="two">three</elem-a5425a>`,
  )
})

t.test(function test_Ren_node() {
  t.is(ren.node(), null)

  function same(val) {
    t.is(ren.node(val), val)
    t.isnt(ren.node(val, val), val)
  }

  same(new Text(`one`))
  same(new Comment(`one`))
  same(ren.elemHtml(`span`))
  same(ren.frag())

  function frag(src, exp) {
    const tar = ren.node(...src)
    t.inst(tar, env.DocumentFragment)
    t.is(tar.textContent, exp)
  }

  frag([undefined], ``)
  frag([undefined, null], ``)
  frag([``], ``)
  frag([`one`], `one`)
  frag([`one`, ``], `one`)
  frag([`one`, `_`], `one_`)
  frag([`one`, `_`, `two`], `one_two`)
})

t.test(function test_overview_html_document() {
  t.is(
    p.DOCTYPE_HTML + E(`html`, null,
      E(`head`, null, E(`title`, null, `test`)),
      E(`body`, A.cls(`page`),
        E(`main`, null,
          E(`a`, A.href(`/`).cls(`link`), `Home`),
        ),
      ),
    ).outerHTML,
    `<!doctype html><html><head><title>test</title></head><body class="page"><main><a href="/" class="link">Home</a></main></body></html>`,
  )
})

if (import.meta.main) console.log(`[test] ok!`)
