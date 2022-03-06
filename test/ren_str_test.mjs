import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as r from '../ren_str.mjs'
import {E, A} from '../ren_str.mjs'
import {testCommon} from './ren_base_test.mjs'

/* Util */

// Short for "equal markup".
function eqm(val, exp) {
  t.inst(val, r.Raw)
  l.reqStr(exp)
  t.is(val.valueOf(), exp)
}

/* Test */

testCommon(r, eqm)

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

t.test(function test_RenStr() {
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

  t.test(function test_frag() {
    function F(...val) {return r.ren.frag(...val)}

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
})

if (import.meta.main) console.log(`[test] ok!`)
