import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as r from '../ren_xml.mjs'
import {E, S, A} from '../ren_xml.mjs'
import {eqm, testCommon} from './ren_base_test.mjs'

testCommon(r)

t.test(function test_overview() {
  const {e, en} = r.ren

  t.is(
    r.ren.doc(en.html(
      en.head(en.title(`test`)),
      e.body(
        {class: `page`},
        en.main(
          e.a(A.href(`/`).cls(`link`), `Home`),
        ),
      )
    )),
    `<!doctype html><html><head><title>test</title></head><body class="page"><main><a href="/" class="link">Home</a></main></body></html>`
  )
})

t.test(function test_RenXml() {
  // Recommendation: prefer `class`, consider using `PropBui`/`A`.
  t.test(function test_class_vs_class_name() {
    eqm(
      E(`div`, {class: `one`, className: `two`}),
      `<div class="one" class="two"></div>`,
    )

    eqm(
      E(`div`, {className: `one`, class: `two`}),
      `<div class="one" class="two"></div>`,
    )
  })

  /*
  This test is "str"-specific. This style property is technically invalid, and
  would be ignored in browsers. Our string rendering doesn't validate the
  syntax of style properties (difficult, expensive, pointless), but we must
  ensure proper escaping.
  */
  t.test(function test_style_escaping() {
    eqm(
      E(`div`, {style: {width: `<one>&"</one>`}}),
      `<div style="width: <one>&amp;&quot;</one>;"></div>`,
    )
  })

  t.test(function test_child_escaping() {
    /*
    This horribly breaks inline scripts... which might be a decent default.
    Users must escape them in an appropriate language-specific way and then use
    `Raw`. We might be unable to provide a generic solution because `<script>`
    allows an open set of languages/syntaxes. Even just for JS and JSON, the
    correct way to escape </script> depends on the syntactic context.
    */
    eqm(
      E(`script`, {}, `console.log('</script>')`),
      `<script>console.log('&lt;/script&gt;')</script>`,
    )

    /*
    This generates broken markup. The test simply demonstrates the possibility.
    For sane markup, see the corresponding "base" test.
    */
    t.test(function test_dont_escape_raw() {
      eqm(
        E(`outer`, {}, new r.Raw(`<<&>>`)),
        `<outer><<&>></outer>`,
      )
    })
  })

  t.test(function test_fragment() {
    function F(...val) {return r.ren.F(...val)}

    t.inst(F(), r.Raw)

    eqm(
      F(new r.Raw(`<!doctype html>`), E(`html`, {}, `text`)),
      `<!doctype html><html>text</html>`,
    )

    eqm(F(`<!doctype html>`), `&lt;!doctype html&gt;`)
  })

  t.test(function test_doc() {
    t.is(`<!doctype html>`, r.ren.doc(undefined))
    t.is(`<!doctype html>`, r.ren.doc(``))
    t.is(`<!doctype html><html>text</html>`, r.ren.doc(E(`html`, {}, `text`)))
  })

  t.test(function test_svg_in_html() {
    t.test(function test_E() {
      eqm(
        E(`button`, {},
          `one `,
          S(`svg`, {}, S(`polygon`)),
          ` two`,
        ),
        `<button>one <svg><polygon></polygon></svg> two</button>`,
      )
    })

    t.test(function test_custom_element_subclass() {
      class IconBtn extends r.elems.HTMLButtonElement {
        static localName = `icon-btn`
        static options = {extends: `button`}

        new() {
          return this.chi(
            `one `,
            S(`svg`, {}, S(`polygon`)),
            ` two`,
          )
        }
      }

      eqm(
        new IconBtn().new(),
        `<button is="icon-btn">one <svg><polygon></polygon></svg> two</button>`,
      )
    })
  })

  // Basic sanity check. TODO expand.
  t.test(function test_custom_element() {
    class SomeElem extends r.elems.HTMLElement {
      static localName = `one`
    }

    const tar = new SomeElem()
    tar.props({class: `two`})
    tar.chi(`three`)

    eqm(tar, `<one class="two">three</one>`)

    tar.chi(`four `, tar.childNodes)
    eqm(tar, `<one class="two">four three</one>`)

    tar.chi(tar.childNodes, ` five`)
    eqm(tar, `<one class="two">four three five</one>`)

    tar.props({id: `six`})
    eqm(tar, `<one class="two" id="six">four three five</one>`)
  })
})

if (import.meta.main) console.log(`[test] ok!`)
