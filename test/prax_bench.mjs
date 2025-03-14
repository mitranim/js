import './internal_test_init.mjs'
import * as itc from './internal_test_coll.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as p from '../prax.mjs'
import * as o from '../obj.mjs'
import * as ds from '../dom_shim.mjs'

/* Util */

const ren = new p.Ren(ds.document)
const E = ren.E.bind(ren)
const A = p.PropBui.main

function P(val) {return p.PropBui.of(val)}

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

const empty = Object.freeze({})
const prop0 = Object.freeze({one: 10, class: `one`})
const prop1 = Object.freeze({two: 20, class: `two`})
const prop2 = Object.freeze({three: 30, class: `three`})
const longDict = Object.freeze(makeDictInline())
const emptyPropBui = P()
const longPropBui = Object.freeze(P(longDict))

/* Bench */

t.bench(function bench_props_PropBui_from_nil() {l.nop(P())})
t.bench(function bench_props_PropBui_from_empty() {l.nop(P(empty))})
t.bench(function bench_props_PropBui_from_PropBui() {l.nop(P(longPropBui))})
t.bench(function bench_props_PropBui_from_dict() {l.nop(P(longDict))})

t.bench(function bench_props_A_mutable() {l.nop(A.mutable())})
t.bench(function bench_props_A_mutable_set() {l.nop(A.href(`/one`))})

t.bench(function bench_props_make_dict_inline() {l.nop(makeDictInline())})
t.bench(function bench_props_make_dict_spread() {l.nop(makeDictSpread())})
t.bench(function bench_props_make_PropBui_mut_one() {l.nop(makePropBuiMutOne())})
t.bench(function bench_props_make_PropBui_mut_many() {l.nop(makePropBuiMutMany())})
t.bench(function bench_props_make_PropBui_build_partial() {l.nop(makePropBuiBuildPartial())})
t.bench(function bench_props_make_PropBui_build_full() {l.nop(makePropBuiBuildFull())})

t.bench(function bench_props_walk_static_empty_dict() {each(empty, l.nop)})
t.bench(function bench_props_walk_static_empty_PropBui() {each(emptyPropBui.$, l.nop)})
t.bench(function bench_props_walk_static_dict() {each(longDict, l.nop)})
t.bench(function bench_props_walk_static_PropBui() {each(longPropBui.$, l.nop)})
t.bench(function bench_props_walk_dynamic_dict() {each(makeDictSpread(), l.nop)})
t.bench(function bench_props_walk_dynamic_PropBui() {each(makePropBuiBuildFull().$, l.nop)})

/*
The following code allows an alternative syntax for constructing and mutating
elements in Prax markup. See examples in the benchmarks below. The proxy acts
as a "namespace" where accessing any property creates an element with that tag
name. Patching the element prototype allows to mutate props / attrs and
children on any element by calling methods `.props` and `.chi`, chainable.

This approach has been removed from the Prax module because it provides little
value over `ren.elem` and similar methods, creates learning barriers due to
being very magical, and pollutes native prototypes, creating dangers of
collisions in the future.
*/

class Ph_Ren_makeElemHtml extends o.BlankStaticPh {
  static get(ren, key) {return ren.makeElem(key)}
}

const EP = new Proxy(ren, Ph_Ren_makeElemHtml)

o.priv(ds.Element.prototype, `ren`, ren)

o.priv(ds.Element.prototype, `props`, function props(src) {
  return this.ren.mutProps(this, src)
})

o.priv(ds.Element.prototype, `chi`, function chi(...src) {
  return this.ren.mutChi(this, ...src)
})

t.bench(function bench_Ren_elem_make_normal() {l.nop(ren.makeElemHtml(`span`))})
t.bench(function bench_Ren_elem_make_proxy() {l.nop(EP.span)})

t.bench(function bench_Ren_elem_empty_normal() {l.nop(ren.elemHtml(`span`))})
t.bench(function bench_Ren_elem_empty_bound() {l.nop(E(`span`))})
t.bench(function bench_Ren_elem_empty_proxy() {l.nop(EP.span)})

t.bench(function bench_Ren_elem_props_normal() {l.nop(ren.elemHtml(`span`, {class: `cls`}))})
t.bench(function bench_Ren_elem_props_bound() {l.nop(E(`span`, {class: `cls`}))})
t.bench(function bench_Ren_elem_props_proxy() {l.nop(EP.span.props({class: `cls`}))})

t.bench(function bench_Ren_elem_chi_normal() {l.nop(ren.elemHtml(`span`, undefined, `text`))})
t.bench(function bench_Ren_elem_chi_bound() {l.nop(E(`span`, undefined, `text`))})
t.bench(function bench_Ren_elem_chi_proxy() {l.nop(EP.span.chi(`text`))})

t.bench(function bench_Ren_elem_props_chi_normal() {l.nop(ren.elemHtml(`span`, {class: `cls`}, `text`))})
t.bench(function bench_Ren_elem_props_chi_bound() {l.nop(E(`span`, {class: `cls`}, `text`))})
t.bench(function bench_Ren_elem_props_chi_proxy() {l.nop(EP.span.props({class: `cls`}).chi(`text`))})

if (import.meta.main) t.deopt(), t.benches()
