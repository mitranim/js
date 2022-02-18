/*
Semi-placeholder. This doesn't check browser-specific behaviors. Our `test.mjs`
is browser-compatible, but we haven't setup browser benching yet.
*/

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as rd from '../ren_dom.mjs'

/* Util */

const boolAttrs = new Set([
  `allowfullscreen`, `allowpaymentrequest`, `async`,    `autofocus`,
  `autoplay`,        `checked`,             `controls`, `default`,
  `disabled`,        `formnovalidate`,      `hidden`,   `ismap`,
  `itemscope`,       `loop`,                `multiple`, `muted`,
  `nomodule`,        `novalidate`,          `open`,     `playsinline`,
  `readonly`,        `required`,            `reversed`, `selected`,
  `truespeed`,
])

function isBoolAttr(key) {
  return key === `allowfullscreen` || key === `allowpaymentrequest` || key === `async` || key === `autofocus` || key === `autoplay` || key === `checked` || key === `controls` || key === `default` || key === `disabled` || key === `formnovalidate` || key === `hidden` || key === `ismap` || key === `itemscope` || key === `loop` || key === `multiple` || key === `muted` || key === `nomodule` || key === `novalidate` || key === `open` || key === `playsinline` || key === `readonly` || key === `required` || key === `reversed` || key === `selected` || key === `truespeed`
}

const attrs = [`multiple`, `readonly`, `disabled`, `class`, `style`]

/* Bench */

t.bench(function bench_is_bool_attr_set() {
  for (const val of attrs) l.nop(boolAttrs.has(val))
})

t.bench(function bench_is_bool_attr_fun() {
  for (const val of attrs) l.nop(isBoolAttr(val))
})

const prop0 = Object.freeze({one: 10, class: `one`})
const prop1 = Object.freeze({two: 20, class: `two`})
const prop2 = Object.freeze({three: 30, class: `three`})
t.bench(function bench_merge_empty() {l.nop(rd.merge())})
t.bench(function bench_merge_one() {l.nop(rd.merge(prop0))})
t.bench(function bench_merge_two() {l.nop(rd.merge(prop0, prop1))})
t.bench(function bench_merge_three() {l.nop(rd.merge(prop0, prop1, prop2))})

if (import.meta.main) t.deopt(), t.benches()
