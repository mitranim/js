import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as p from '../prax.mjs'
import * as dr from '../dom_reg.mjs'
import * as dg from '../dom_glob_shim.mjs'

/* Util */

const ren = p.Ren.from(dg.glob)
const E = ren.E
const A = p.PropBui.main
const Text = dg.glob.Text
const NATIVE = ren.doc === globalThis.document

function* gen(...vals) {for (const val of vals) yield val}
function testDerefOwn(src, exp) {t.own(src.$, exp)}

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

  if (NATIVE) {
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

    t.is(new p.PropBui().cls().$, undefined)

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

    t.own(out, {})
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

/*
Adapted from a "shared" test for the defunct "ren" feature. The test mostly
verifies serialization behaviors common between DOM and non-DOM environments.
For DOM-specific behaviors (native or shimmed), see other tests.
*/
t.test(function test_Ren_serialization() {
  function E(...val) {return ren.elemHtml(...val)}
  function F(...val) {return ren.frag(...val)}

  t.throws(() => E(`link`, {}, null), SyntaxError, `expected void element "link" to have no children, got [null]`)

  t.test(function test_invalid() {
    t.test(function test_invalid_tag() {
      t.throws(E, TypeError, `expected variant of isStr, got undefined`)
      t.throws(() => E(E), TypeError, `expected variant of isStr, got [function E]`)
      t.throws(() => E({}), TypeError, `expected variant of isStr, got {}`)
      t.throws(() => E({toString() {return `div`}}), TypeError, `expected variant of isStr, got {"toString": [function toString]}`)
    })

    t.test(function test_invalid_props() {
      t.throws(() => E(`div`, 10),                          TypeError, `expected variant of isObj, got 10`)
      t.throws(() => E(`div`, `str`),                       TypeError, `expected variant of isObj, got "str"`)
      t.throws(() => E(`div`, {nop: l.nop}),                TypeError, `unable to convert [function nop] to string`)
      t.throws(() => E(`div`, []),                          TypeError, `expected variant of isStruct, got []`)
      t.throws(() => E(`div`, E),                           TypeError, `expected variant of isObj, got [function E]`)
      t.throws(() => E(`div`, new String()),                TypeError, `expected variant of isStruct, got [object String]`)
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

        t.test(function test_svg() {
          t.is(E(`svg`).namespaceURI, `http://www.w3.org/2000/svg`)

          eqm(
            E(`svg`, {}, new p.Raw(`<line x1="12" y1="8" x2="12" y2="12"></line>`)),
            `<svg><line x1="12" y1="8" x2="12" y2="12"></line></svg>`,
          )
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
      class SomeElem extends dg.glob.HTMLElement {
        static customName = `elem-35e92d`
        static {dr.reg(this)}
        init() {return this.props(A.cls(`theme-prim`)).chi(`some text`)}
      }

      l.nop(new SomeElem())
      t.is(SomeElem.localName, `elem-35e92d`)
      t.is(SomeElem.customName, `elem-35e92d`)

      t.is(new SomeElem().outerHTML, `<elem-35e92d></elem-35e92d>`)
      t.is(new SomeElem().init().outerHTML, `<elem-35e92d class="theme-prim">some text</elem-35e92d>`)
    })

    t.test(function test_extended() {
      class TestBtn extends dg.glob.HTMLButtonElement {
        static customName = `elem-4873e3`
        static {dr.reg(this)}
        init() {return this.props(A.cls(`theme-prim`)).chi(`click me`)}
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

t.test(function test_Ren_dom_behaviors() {
  const E = ren.elemHtml
  const F = ren.frag

  t.test(function test_fragment() {
    t.inst(F(), dg.glob.DocumentFragment)

    t.is(
      F(`one`, [10], E(`div`, {}, `two`, new dg.glob.Comment(`three`))).textContent,
      `one10two`,
    )
  })

  // Parts of this function are tested elsewhere.
  // We only need a sanity check here.
  t.test(function test_mutProps() {
    t.throws(() => ren.mutProps(), TypeError, `expected variant of isElement, got undefined`)

    t.test(function test_identity() {
      const node = E(`div`)
      t.is(ren.mutProps(node), node)
    })

    eqm(
      ren.mutProps(E(`div`, {class: `one`}, `two`), {class: `three`}),
      `<div class="three">two</div>`,
    )
  })

  // Parts of this function are tested elsewhere.
  // We only need a sanity check here.
  t.test(function test_mut() {
    t.throws(() => ren.mut(), TypeError, `expected variant of isElement, got undefined`)

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
    t.throws(() => ren.mutText(node, new p.Raw()), TypeError, `unable to convert [object Raw] to string`)

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
})

t.test(function test_Ren_overview_elemHtml() {
  const E = ren.elemHtml

  function test(src) {
    eqm(src, `<span id="one" class="two">three</span>`)
  }

  test(E(`span`, {id: `one`, class: `two`}, `three`))
  test(E(`span`).props({id: `one`, class: `two`}).chi(`three`))
  test(E(`span`).props({id: `one`}).props({class: `two`}).chi(`three`))
})

t.test(function test_Ren_overview_E() {
  function test(src) {
    eqm(src, `<span id="one" class="two">three</span>`)
  }

  test(E.span.props({id: `one`, class: `two`}).chi(`three`))
  test(E.span.props({id: `one`}).props({class: `two`}).chi(`three`))
})

t.test(function test_Ren_custom_element() {
  class SomeElem extends dg.glob.HTMLElement {
    static customName = `elem-a5425a`
    static {dr.reg(this)}
    init() {return this.props({id: `one`, class: `two`}).chi(`three`)}
  }

  eqm(
    new SomeElem().init(),
    `<elem-a5425a id="one" class="two">three</elem-a5425a>`,
  )
})

t.test(function test_renderDocument() {
  t.throws(() => p.renderDocument({}), TypeError, `unable to convert {} to document`)
  t.throws(() => p.renderDocument([]), TypeError, `unable to convert [] to document`)

  function test(src, exp) {t.is(p.renderDocument(src), exp)}

  test(undefined, ``)
  test(null, ``)
  test(``, ``)
  test(`<html></html>`, `<!doctype html><html></html>`)

  test(
    E.html.chi(
      E.head.chi(E.title.chi(`test`)),
      E.body.props({class: `page`}).chi(
        E.main.chi(
          E.a.props(A.href(`/`).cls(`link`)).chi(`Home`),
        ),
      ),
    ),
    `<!doctype html><html><head><title>test</title></head><body class="page"><main><a href="/" class="link">Home</a></main></body></html>`,
  )
})

if (import.meta.main) console.log(`[test] ok!`)
