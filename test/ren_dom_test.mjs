/*
Semi-placeholder. For now this has only tests runnable in Deno.

DOM-specific tests are to be ported from https://github.com/mitranim/prax.
*/

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as rd from '../ren_dom.mjs'

t.test(function test_merge() {
  t.eq(rd.merge(), {})
  t.eq(rd.merge(undefined), {class: undefined})
  t.eq(rd.merge(undefined, undefined), {class: undefined})

  t.eq(rd.merge({one: 10}), {one: 10, class: undefined})
  t.eq(rd.merge({one: 10}, {two: 20}), {one: 10, two: 20, class: undefined})
  t.eq(rd.merge({one: 10, class: `one`}, {two: 20}), {one: 10, two: 20, class: `one`})
  t.eq(rd.merge({one: 10, class: `one`}, {two: 20, class: `two`}), {one: 10, two: 20, class: `one two`})
  t.eq(rd.merge({one: 10, class: ``}, {two: 20, class: `two`}), {one: 10, two: 20, class: `two`})
  t.eq(rd.merge({one: 10, class: `one`}, {two: 20, class: ``}), {one: 10, two: 20, class: `one`})
})

if (import.meta.main) console.log(`[test] ok!`)
