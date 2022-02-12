import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as co from '../coll.mjs'

/* Util */

class Person {
  constructor({name}) {this.name = l.reqStr(name)}
  pk() {return this.name}
}

class Persons extends co.ClsColl {
  get cls() {return Person}
}

function toMap(val) {return new Map(val.entries())}

/* Test */

t.test(function test_pkOpt() {
  function test(val, exp) {t.is(co.pkOpt(val), exp)}
  function none(val) {test(val, undefined)}

  none(undefined)
  none(null)
  none(10)
  none(false)
  none(`str`)
  none({})
  none([])
  none({pk: 10})

  test({pk() {return 10}}, 10)
  test({pk() {return `str`}}, `str`)
})

t.test(function test_pk() {
  t.throws(() => co.pk(), TypeError, `unable to get primary key of undefined`)
  t.throws(() => co.pk(10), TypeError, `unable to get primary key of 10`)
  t.throws(() => co.pk({}), TypeError, `unable to get primary key of {}`)
  t.throws(() => co.pk({pk: 10}), TypeError, `unable to get primary key of {"pk":10}`)
  t.throws(() => co.pk({pk() {return null}}), TypeError, `unable to get primary key of {}`)

  function test(val, exp) {t.is(co.pk(val), exp)}
  test({pk() {return 10}}, 10)
  test({pk() {return `str`}}, `str`)
})

t.test(function test_Coll() {
  function test(val, exp) {t.eq(toMap(val), exp)}

  function none(val) {
    t.throws(() => new co.Coll().push(val), TypeError, `unable to get primary key of ${l.show(val)}`)
    test(new co.Coll().pushOpt(val), new Map())
  }

  none(undefined)
  none(null)
  none(10)
  none(`str`)
  none([])
  none({})
  none({pk: 10})
  none({pk() {return undefined}})

  const one = new Person({name: `Mira`})
  const two = new Person({name: `Kara`})

  test(
    new co.Coll().push(one).push(two),
    new Map().set(`Mira`, one).set(`Kara`, two),
  )
})

t.test(function test_ClsColl() {
  t.eq(
    toMap(new Persons().push({name: `Mira`}).push({name: `Kara`})),
    new Map()
      .set(`Mira`, new Person({name: `Mira`}))
      .set(`Kara`, new Person({name: `Kara`})),
  )
})

if (import.meta.main) console.log(`[test] ok!`)
