import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as rb from '../ren_base.mjs'
import {A, P} from '../ren_base.mjs'
import * as dr from '../dom_reg.mjs'

/* Util */

function* gen(...vals) {for (const val of vals) yield val}

function testDerefOwn(src, exp) {t.own(src.$, exp)}

// Short for "equal markup".
export function eqm(val, exp) {
  l.reqStr(exp)
  t.ok(rb.isRaw(val))
  t.is(val.outerHTML, exp)
}

/* Shared */

// Shared component of "str" and "dom" tests.
export function testCommon(r) {
  const {E, S} = r

  t.throws(() => E(`link`, {}, null), SyntaxError, `expected void element "link" to have no children, got [null]`)

  t.test(function test_invalid() {
    t.test(function test_invalid_tag() {
      t.throws(E,                                    TypeError, `expected variant of isTag, got undefined`)
      t.throws(() => E(E),                           TypeError, `expected variant of isTag, got [function E]`)
      t.throws(() => E({}),                          TypeError, `expected variant of isTag, got {}`)
      t.throws(() => E({toString() {return `div`}}), TypeError, `expected variant of isTag, got {}`)
    })

    t.test(function test_invalid_props() {
      t.throws(() => E(`div`, 10),                          TypeError, `expected variant of isObj, got 10`)
      t.throws(() => E(`div`, `str`),                       TypeError, `expected variant of isObj, got "str"`)
      t.throws(() => E(`div`, {nop: l.nop}),                TypeError, `unable to convert [function nop] to string`)
      t.throws(() => E(`div`, []),                          TypeError, `expected variant of isStruct, got []`)
      t.throws(() => E(`div`, E),                           TypeError, `expected variant of isObj, got [function E]`)
      t.throws(() => E(`div`, new String()),                TypeError, `expected variant of isStruct, got [object String]`)
      t.throws(() => E(`div`, new r.Raw()),                 TypeError, `expected variant of isStruct, got [object Raw]`)
      t.throws(() => E(`div`, {attributes: 10}),            TypeError, `expected variant of isObj, got 10`)
      t.throws(() => E(`div`, {attributes: `str`}),         TypeError, `expected variant of isObj, got "str"`)
      t.throws(() => E(`div`, {attributes: []}),            TypeError, `expected variant of isStruct, got []`)
      t.throws(() => E(`div`, {class: []}),                 TypeError, `unable to convert [] to string`)
      t.throws(() => E(`div`, {className: []}),             TypeError, `unable to convert [] to string`)
      t.throws(() => E(`div`, {class: {}}),                 TypeError, `unable to convert {} to string`)
      t.throws(() => E(`div`, {className: {}}),             TypeError, `unable to convert {} to string`)
      t.throws(() => E(`div`, {class: new class {}()}),     TypeError, `unable to convert [object Object] to string`)
      t.throws(() => E(`div`, {className: new class {}()}), TypeError, `unable to convert [object Object] to string`)
      t.throws(() => E(`div`, {style: 10}),                 TypeError, `unable to convert 10 to style`)
      t.throws(() => E(`div`, {style: []}),                 TypeError, `unable to convert [] to style`)
      t.throws(() => E(`div`, {dataset: 10}),               TypeError, `expected variant of isObj, got 10`)
      t.throws(() => E(`div`, {dataset: `str`}),            TypeError, `expected variant of isObj, got "str"`)
      t.throws(() => E(`div`, {dataset: []}),               TypeError, `expected variant of isStruct, got []`)
    })
  })

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
        eqm(E(`area`), `<area/>`)
        eqm(E(`base`), `<base/>`)
        eqm(E(`br`), `<br/>`)
        eqm(E(`col`), `<col/>`)
        eqm(E(`embed`), `<embed/>`)
        eqm(E(`hr`), `<hr/>`)
        eqm(E(`img`), `<img/>`)
        eqm(E(`input`), `<input/>`)
        eqm(E(`link`), `<link/>`)
        eqm(E(`meta`), `<meta/>`)
        eqm(E(`param`), `<param/>`)
        eqm(E(`source`), `<source/>`)
        eqm(E(`track`), `<track/>`)
        eqm(E(`wbr`), `<wbr/>`)

        eqm(E(`link`, {}), `<link/>`)
        eqm(E(`link`, null), `<link/>`)
        eqm(E(`link`, undefined), `<link/>`)
      })
    })

    t.test(function test_normal_elems() {
      eqm(E(`div`), `<div></div>`)
      eqm(E(`a-elem`), `<a-elem></a-elem>`)
    })
  })

  t.test(function test_props() {
    t.test(function test_void_elem_attrs() {
      eqm(
        E(`link`, {rel: `stylesheet`, href: `main.css`}),
        `<link rel="stylesheet" href="main.css"/>`,
      )

      // Doesn't work in browsers because `value` doesn't become an attribute.
      // eqm(
      //   E(`input`, {type: `num`, value: `10`}),
      //   `<input type="num" value="10">`,
      // )
    })

    t.test(function test_attr_val_encoding() {
      t.test(function test_attr_non_scalar() {
        testNonScalarPropStrict(E)
        r.ren.lax = true
        testNonScalarPropLax(E, eqm)
        r.ren.lax = false
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
      // Recommendation: prefer `class`.
      eqm(E(`div`, {class:     `one`}), `<div class="one"></div>`)
      eqm(E(`div`, {className: `one`}), `<div class="one"></div>`)

      t.test(function test_class_escaping() {
        eqm(
          E(`div`, {class: `<one>&"</one>`}),
          `<div class="<one>&amp;&quot;</one>"></div>`,
        )
      })
    })

    t.test(function test_style() {
      t.throws(() => E(`div`, {style: 10}),           TypeError, `unable to convert 10 to style`)
      t.throws(() => E(`div`, {style: []}),           TypeError, `unable to convert [] to style`)
      t.throws(() => E(`div`, {style: new r.Raw()}),  TypeError, `unable to convert [object Raw] to style`)
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

    t.test(function test_aria_attrs() {
      // Not supported.
      //
      // t.test(function test_aria_props_camel() {
      //   eqm(
      //     E(`div`, {ariaCurrent: null, ariaChecked: undefined}),
      //     `<div></div>`,
      //   )
      //
      //   eqm(
      //     E(`a`, {ariaCurrent: `page`, ariaChecked: `mixed`}),
      //     `<a aria-current="page" aria-checked="mixed"></a>`,
      //   )
      // })

      t.test(function test_aria_attrs_kebab() {
        eqm(
          E(`div`, {'aria-current': null, 'aria-checked': undefined}),
          `<div></div>`,
        )

        eqm(
          E(`a`, {'aria-current': `page`, 'aria-checked': `mixed`}),
          `<a aria-current="page" aria-checked="mixed"></a>`,
        )
      })

      // Not supported.
      //
      // t.test(function test_aria_mixed() {
      //   eqm(
      //     E(`div`, {ariaCurrent: null, 'aria-checked': undefined}),
      //     `<div></div>`,
      //   )
      //
      //   eqm(
      //     E(`a`, {ariaCurrent: `page`, 'aria-checked': `mixed`}),
      //     `<a aria-current="page" aria-checked="mixed"></a>`,
      //   )
      // })

      // Not supported.
      //
      // t.test(function test_aria_multi_humped_camel() {
      //   eqm(
      //     E(`a`, {ariaAutoComplete: `page`}, `text`),
      //     `<a aria-autocomplete="page">text</a>`,
      //   )
      // })
    })

    t.test(function test_bool_attrs() {
      t.throws(() => E(`input`, {hidden: ``}), TypeError, `invalid property "hidden": expected variant of isBool, got ""`)
      t.throws(() => E(`input`, {hidden: 10}), TypeError, `invalid property "hidden": expected variant of isBool, got 10`)

      eqm(
        E(`input`, {autofocus: true, disabled: true, hidden: true}),
        `<input autofocus="" disabled="" hidden=""/>`,
      )

      eqm(
        E(`input`, {hidden: false, autofocus: false, disabled: true}),
        `<input disabled=""/>`,
      )

      eqm(
        E(`input`, {hidden: true, autofocus: null, disabled: undefined}),
        `<input hidden=""/>`,
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
      eqm(E(`meta`, {httpEquiv: `content-type`}), `<meta http-equiv="content-type"/>`)

      eqm(E(`meta`, {'http-equiv': `content-type`}), `<meta http-equiv="content-type"/>`)

      eqm(
        E(`meta`, {httpEquiv: `X-UA-Compatible`, content: `IE=edge,chrome=1`}),
        `<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>`,
      )
    })
  })

  t.test(function test_children() {
    t.test(function test_child_non_scalar() {
      testNonScalarChiStrict(E)
      r.ren.lax = true
      testNonScalarChiLax(E, eqm)
      r.ren.lax = false
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
            E(`outer`, {}, new r.Raw(`<inner>text</inner>`)),
            `<outer><inner>text</inner></outer>`,
          )

          eqm(
            E(`div`, {}, new r.Raw(`<a>one</a><b>two</b><c>three</c>`)),
            `<div><a>one</a><b>two</b><c>three</c></div>`,
          )
        })

        // TODO: verify use of SVG namespace when rendering DOM.
        t.test(function test_svg() {
          eqm(
            S(`svg`, {}, new r.Raw(`<line x1="12" y1="8" x2="12" y2="12"></line>`)),
            `<svg><line x1="12" y1="8" x2="12" y2="12"></line></svg>`,
          )
        })
      })
    })

    // Fragment's type and structure is different between `str.mjs` and
    // `dom.mjs`, and tested separately.
    t.test(function test_fragment() {
      function F(...val) {return r.ren.F(...val)}

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

  // TODO better name, better tests.
  t.test(function test_dom_reg_and_element_mixins() {
    t.test(function test_simple() {
      class SomeElem extends dr.MixReg(r.elems.HTMLElement) {
        init() {return this.props(A.cls(`theme-prim`)).chi(`some text`)}
      }

      l.nop(new SomeElem())
      t.is(SomeElem.localName, `some-elem`)
      t.is(SomeElem.options, undefined)

      t.is(new SomeElem().outerHTML, `<some-elem></some-elem>`)
      t.is(new SomeElem().init().outerHTML, `<some-elem class="theme-prim">some text</some-elem>`)
    })

    t.test(function test_extended() {
      class TestBtn extends dr.MixReg(r.elems.HTMLButtonElement) {
        init() {return this.props(A.cls(`theme-prim`)).chi(`click me`)}
      }

      l.nop(new TestBtn())
      t.is(TestBtn.localName, `test-btn`)
      t.eq(TestBtn.options, {extends: `button`})

      t.is(new TestBtn().outerHTML, `<button is="test-btn"></button>`)
      t.is(new TestBtn().init().outerHTML, `<button is="test-btn" class="theme-prim">click me</button>`)
    })
  })
}

function testNonScalarChiStrict(E) {
  t.throws(() => E(`div`, {}, Symbol(`str`)),       TypeError, `unable to convert Symbol(str) to string`)
  t.throws(() => E(`div`, {}, {}),                  TypeError, `unable to convert {} to string`)
  t.throws(() => E(`div`, {}, l.npo()),             TypeError, `unable to convert {} to string`)
  t.throws(() => E(`div`, {}, new class {}()),      TypeError, `unable to convert [object Object] to string`)
  t.throws(() => E(`div`, {}, () => {}),            TypeError, `unable to convert [function () => {}] to string`)
  t.throws(() => E(`div`, {}, function fun() {}),   TypeError, `unable to convert [function fun] to string`)
  t.throws(() => E(`div`, {}, Promise.resolve()),   TypeError, `unable to convert [object Promise] to string`)
}

function testNonScalarChiLax(E, eqm) {
  eqm(E(`div`, {}, Symbol(`str`)), `<div></div>`)
  eqm(E(`div`, {}, {}), `<div></div>`)
  eqm(E(`div`, {}, l.npo()), `<div></div>`)
  eqm(E(`div`, {}, new class {}()), `<div></div>`)
  eqm(E(`div`, {}, () => {}), `<div></div>`)
  eqm(E(`div`, {}, function fun() {}), `<div></div>`)
  eqm(E(`div`, {}, Promise.resolve()), `<div></div>`)
}

function testNonScalarPropStrict(E) {
  t.throws(() => E(`div`, {one: Symbol(`str`)}),       TypeError, `unable to convert Symbol(str) to string`)
  t.throws(() => E(`div`, {one: {}}),                  TypeError, `unable to convert {} to string`)
  t.throws(() => E(`div`, {one: l.npo()}),             TypeError, `unable to convert {} to string`)
  t.throws(() => E(`div`, {one: new class {}()}),      TypeError, `unable to convert [object Object] to string`)
  t.throws(() => E(`div`, {}, () => {}),               TypeError, `unable to convert [function () => {}] to string`)
  t.throws(() => E(`div`, {}, function fun() {}),      TypeError, `unable to convert [function fun] to string`)
  t.throws(() => E(`div`, {}, Promise.resolve()),      TypeError, `unable to convert [object Promise] to string`)

  // Banned specifically in attrs, but allowed in children.
  t.throws(() => E(`div`, {one: []}), TypeError, `unable to convert [] to string`)
  t.throws(() => E(`div`, {one: new class extends Array {}()}), TypeError, `unable to convert [] to string`)
}

function testNonScalarPropLax(E, eqm) {
  eqm(E(`div`, {one: Symbol(`str`)}), `<div></div>`)
  eqm(E(`div`, {one: {}}), `<div></div>`)
  eqm(E(`div`, {one: l.npo()}), `<div></div>`)
  eqm(E(`div`, {one: new class {}()}), `<div></div>`)
  eqm(E(`div`, {}, () => {}), `<div></div>`)
  eqm(E(`div`, {}, function fun() {}), `<div></div>`)
  eqm(E(`div`, {}, Promise.resolve()), `<div></div>`)
  eqm(E(`div`, {one: [10, 20]}), `<div></div>`)
  eqm(E(`div`, {one: new class extends Array {}(10, 20)}), `<div></div>`)
}

/* Test */

function testPropBuiConstructor(fun) {
  function test(src) {
    const out = fun(src)

    t.inst(out, rb.PropBui)
    t.isnt(out, src)

    t.own(out, {})
    testDerefOwn(out, src)
  }

  test({})
  test({one: 10})
  test({one: 10, two: 20})
}

t.test(function test_PropBui() {
  testPropBuiConstructor(val => new rb.PropBui(val))

  t.test(function test_set() {
    const ref = new rb.PropBui()

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
    t.throws(() => new rb.PropBui().cls(10), TypeError, `expected variant of isStr, got 10`)

    t.is(new rb.PropBui().cls().$, undefined)

    testDerefOwn(new rb.PropBui().cls(`one`), {class: `one`})
    testDerefOwn(new rb.PropBui().cls(``).cls(`one`), {class: `one`})
    testDerefOwn(new rb.PropBui().cls(``).cls(`one`).cls(``), {class: `one`})
    testDerefOwn(new rb.PropBui().cls(`one`).cls(`two`), {class: `one two`})
  })

  t.test(function test_href() {
    testDerefOwn(new rb.PropBui().href(), {href: undefined})
    testDerefOwn(new rb.PropBui().href(`/one`), {href: `/one`})
  })

  t.test(function test_tarblan() {
    testDerefOwn(new rb.PropBui().tarblan(), {target: `_blank`, rel: `noopener noreferrer`})
  })
})

t.test(function test_A() {
  t.inst(A, rb.PropBui)

  t.test(function test_setter_methods() {
    function test(val, exp) {
      t.isnt(val, A)
      t.inst(val, rb.PropBui)
      testDerefOwn(val, exp)

      // Further method calls mutate the same instance.
      t.is(val.set(`994d2e`, `cac5c0`), val)
    }

    test(A.href(`/one`), {href: `/one`})
    test(A.cls(`two`), {class: `two`})
    test(A.href(`/one`).cls(`two`), {href: `/one`, class: `two`})
  })

  t.test(function test_mut() {
    function test(src) {
      const out = A.mut(src)
      t.isnt(out, A)
      testDerefOwn(out, {...src})
    }

    test()
    test({})
    test({one: 10})
    test({one: 10, two: 20})
  })
})

t.test(function test_P() {
  testPropBuiConstructor(P)

  t.test(function test_same_reference() {
    function test(val) {t.is(P(val), val)}

    test(P())
    test(new rb.PropBui())
    test(P({one: 10}))
    test(new rb.PropBui({one: 10}))
  })
})

if (import.meta.main) console.log(`[test] ok!`)
