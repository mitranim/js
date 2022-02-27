import './internal_test_init.mjs'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as rb from '../ren_base.mjs'
import {A, P} from '../ren_base.mjs'

/* Util */

function isBool(key) {return key === `allowfullscreen` || key === `allowpaymentrequest` || key === `async` || key === `autofocus` || key === `autoplay` || key === `checked` || key === `controls` || key === `default` || key === `disabled` || key === `formnovalidate` || key === `hidden` || key === `ismap` || key === `itemscope` || key === `loop` || key === `multiple` || key === `muted` || key === `nomodule` || key === `novalidate` || key === `open` || key === `playsinline` || key === `readonly` || key === `required` || key === `reversed` || key === `selected` || key === `truespeed`}

const attrs = [`multiple`, `readonly`, `disabled`, `class`, `style`]

const empty = Object.freeze({})
const prop0 = Object.freeze({one: 10, class: `one`})
const prop1 = Object.freeze({two: 20, class: `two`})
const prop2 = Object.freeze({three: 30, class: `three`})
const longDict = Object.freeze(makeDictInline())
const emptyPropBui = P()
const longPropBui = Object.freeze(P(longDict))

itc.deoptDictHof(each)
function each(val, fun) {
  if (l.isNil(val)) return
  for (const key of Object.keys(val)) fun(val[key], key)
}

function makeDictInline() {return {one: 10, two: 20, three: 30, class: `one two three`}}
function makeDictSpread() {return {...prop0, ...prop1, ...prop2}}

function makePropBuiMutOne() {return P().mut(longDict)}
function makePropBuiMutMany() {return P().mut(prop0).mut(prop1).mut(prop2)}

function makePropBuiBuildPartial() {
  return P({one: 10, two: 20, three: 30, class: `one`}).cls(`two three`)
}

function makePropBuiBuildFull() {
  return P().set(`one`, 10).set(`two`, 20).set(`three`, 30).cls(`one two three`)
}

/* Bench */

t.bench(function bench_is_bool_attr_set() {for (const val of attrs) l.nop(rb.BOOL_ATTRS.has(val))})
t.bench(function bench_is_bool_attr_fun() {for (const val of attrs) l.nop(isBool(val))})

t.bench(function bench_props_P_from_nil() {l.nop(P())})
t.bench(function bench_props_P_from_empty() {l.nop(P(empty))})
t.bench(function bench_props_P_from_PropBui() {l.nop(P(longPropBui))})
t.bench(function bench_props_P_from_dict() {l.nop(P(longDict))})

t.bench(function bench_A_mutable() {l.nop(A.mutable())})
t.bench(function bench_A_mutable_set() {l.nop(A.href(`/one`))})

t.bench(function bench_props_dict_inline() {l.nop(makeDictInline())})
t.bench(function bench_props_dict_spread() {l.nop(makeDictSpread())})
t.bench(function bench_props_PropBui_mut_one() {l.nop(makePropBuiMutOne())})
t.bench(function bench_props_PropBui_mut_many() {l.nop(makePropBuiMutMany())})
t.bench(function bench_props_PropBui_build_partial() {l.nop(makePropBuiBuildPartial())})
t.bench(function bench_props_PropBui_build_full() {l.nop(makePropBuiBuildFull())})

t.bench(function bench_props_walk_static_empty_dict() {each(empty, l.nop)})
t.bench(function bench_props_walk_static_empty_PropBui() {each(emptyPropBui.$, l.nop)})
t.bench(function bench_props_walk_static_dict() {each(longDict, l.nop)})
t.bench(function bench_props_walk_static_PropBui() {each(longPropBui.$, l.nop)})
t.bench(function bench_props_walk_dynamic_dict() {each(makeDictSpread(), l.nop)})
t.bench(function bench_props_walk_dynamic_PropBui() {each(makePropBuiBuildFull().$, l.nop)})

if (import.meta.main) t.deopt(), t.benches()
