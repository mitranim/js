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
function args(...val) {return val}

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

t.test(function test_bset() {
  t.eq(co.bset(), new co.Bset())
  t.eq(co.bset([10, 20]), new co.Bset().add(10).add(20))
})

t.test(function test_bsetOf() {
  t.eq(co.bsetOf(), co.bset())
  t.eq(co.bsetOf(10), co.bset().add(10))
  t.eq(co.bsetOf(10, 20), co.bset().add(10).add(20))
})

t.test(function test_Bset() {
  // Delegates to `.mut` which is tested separately. This is a sanity check.
  t.test(function test_constructor() {
    t.throws(() => co.bset(10), TypeError, `unable to convert 10 to Bset`)
    t.throws(() => co.bset({}), TypeError, `unable to convert {} to Bset`)

    t.eq(co.bset(), co.bset())
    t.eq(co.bset([10, 20]), co.bset().add(10).add(20))
    t.eq(co.bset([`one`, `two`]), co.bset().add(`one`).add(`two`))
  })

  t.test(function test_mut() {
    t.test(function test_mut_from_nil() {
      t.eq(co.bset().mut(), co.bset())
      t.eq(co.bsetOf(10, 20).mut(), co.bsetOf(10, 20))
    })

    t.test(function test_mut_from_arr() {
      t.eq(co.bset().mut([10]), co.bsetOf(10))
      t.eq(co.bset().mut([10, 20]), co.bsetOf(10, 20))
      t.eq(co.bsetOf(10).mut([20]), co.bsetOf(10, 20))
    })

    t.test(function test_mut_from_set() {
      t.eq(co.bset().mut(co.bsetOf(10)), co.bsetOf(10))
      t.eq(co.bset().mut(co.bsetOf(10, 20)), co.bsetOf(10, 20))
      t.eq(co.bsetOf(10).mut(co.bsetOf(20)), co.bsetOf(10, 20))
    })
  })

  t.test(function test_map() {
    t.throws(() => co.bset().map(), TypeError, `expected variant of isFun, got undefined`)
    t.throws(() => co.bset().map(10), TypeError, `expected variant of isFun, got 10`)

    t.eq(co.bset().map(l.id), [])

    const ref = co.bsetOf(10, 20)
    t.eq(ref.map(args), [[10, 10, ref], [20, 20, ref]])
  })

  t.test(function test_filter() {
    t.throws(() => co.bset().filter(), TypeError, `expected variant of isFun, got undefined`)
    t.throws(() => co.bset().filter(10), TypeError, `expected variant of isFun, got 10`)

    t.eq(co.bsetOf(10, 20).filter(l.False), [])

    t.eq(co.bsetOf(10, 20).filter(l.True), [10, 20])

    t.eq(
      co.bsetOf(10, 20).filter((val, key) => val === 10 && key === 10),
      [10],
    )

    t.eq(
      co.bsetOf(10, 20).filter((val, key) => val === 20 && key === 20),
      [20],
    )
  })

  t.test(function test_toArray() {
    function test(src, exp) {
      t.eq(co.bset(src).toArray(), exp)
    }

    test(undefined, [])
    test([], [])
    test([10, 20], [10, 20])
    test([10, 20, 10, 20, 30], [10, 20, 30])
  })

  t.test(function test_toJSON() {
    function test(src, exp) {
      t.is(JSON.stringify(co.bset(src)), JSON.stringify(exp))
    }

    test(undefined, [])
    test([], [])
    test([10, 20], [10, 20])
    test([10, 20, 10, 20, 30], [10, 20, 30])
  })
})

t.test(function test_bmap() {
  t.eq(co.bmap(), new co.Bmap())
  t.eq(co.bmap([[10, 20], [30, 40]]), new co.Bmap().set(10, 20).set(30, 40))
})

t.test(function test_bmapOf() {
  t.eq(co.bmapOf(), co.bmap())

  t.eq(
    co.bmapOf(10, 20, 30, 40),
    co.bmap().set(10, 20).set(30, 40),
  )

  t.eq(
    [...co.bmapOf(10, 20, 30, 40)],
    [[10, 20], [30, 40]],
  )
})

t.test(function test_Bmap() {
  // Delegates to `.mut` which is tested separately. This is a sanity check.
  t.test(function test_constructor() {
    t.throws(() => co.bmap(10), TypeError, `unable to convert 10 to Bmap`)

    t.eq(co.bmap(), co.bmap())
    t.eq(co.bmap([[10, 20]]), co.bmap().set(10, 20))
    t.eq(co.bmap([[`one`, `two`]]), co.bmap().set(`one`, `two`))
    t.eq(co.bmap({one: `two`}), co.bmap().set(`one`, `two`))
  })

  t.test(function test_mut() {
    t.test(function test_mut_from_nil() {
      t.eq(co.bmap().mut(), co.bmap())
      t.eq(co.bmapOf(10, 20).mut(), co.bmapOf(10, 20))
    })

    t.test(function test_mut_from_iter() {
      t.eq(co.bmap().mut([[10, 20]]), co.bmapOf(10, 20))
      t.eq(co.bmap().mut([[10, 20], [30, 40]]), co.bmapOf(10, 20, 30, 40))
      t.eq(co.bmapOf(10, 20).mut([[30, 40]]), co.bmapOf(10, 20, 30, 40))
      t.eq(co.bmapOf(10, 20).mut([[10, 30]]), co.bmapOf(10, 30))
    })

    t.test(function test_from_struct() {
      t.eq(co.bmap().mut({one: 10}), co.bmapOf(`one`, 10))
      t.eq(co.bmap().mut({one: 10, two: 20}), co.bmapOf(`one`, 10, `two`, 20))
      t.eq(co.bmap({one: 10}).mut({two: 20}), co.bmapOf(`one`, 10, `two`, 20))
      t.eq(co.bmap({one: 10}).mut({one: 20}), co.bmapOf(`one`, 20))
    })
  })

  t.test(function test_map() {
    t.throws(() => co.bmap().map(), TypeError, `expected variant of isFun, got undefined`)
    t.throws(() => co.bmap().map(10), TypeError, `expected variant of isFun, got 10`)

    t.eq(co.bmap().map(l.id), [])

    const ref = co.bmap({one: 10, two: 20})
    t.eq(ref.map(args), [[10, `one`, ref], [20, `two`, ref]])
  })

  t.test(function test_filter() {
    t.throws(() => co.bmap().filter(), TypeError, `expected variant of isFun, got undefined`)
    t.throws(() => co.bmap().filter(10), TypeError, `expected variant of isFun, got 10`)

    t.eq(co.bmap({one: 10, two: 20}).filter(l.False), [])

    t.eq(co.bmap({one: 10, two: 20}).filter(l.True), [10, 20])

    t.eq(
      co.bmap({one: 10, two: 20}).filter((val, key) => val === 10 && key === `one`),
      [10],
    )

    t.eq(
      co.bmap({one: 10, two: 20}).filter((val, key) => val === 20 && key === `two`),
      [20],
    )
  })

  t.test(function test_toDict() {
    t.test(function test_full() {
      function test(src) {t.eq(co.bmap(src).toDict(), src)}

      test({})
      test({one: 10})
      test({one: 10, two: 20})
      test({one: `two`})
      test({one: `two`, three: `four`})
    })

    t.test(function test_partial() {
      function test(src, exp) {t.eq(co.bmap(src).toDict(), exp)}

      test(undefined, {})
      test([[10, 20]], {})
      test([[10, 20], [`three`, 40], [50, 60], [{}, []]], {three: 40})
    })
  })

  t.test(function test_toJSON() {
    function test(src, exp) {
      t.is(JSON.stringify(co.bmap(src)), JSON.stringify(exp))
    }

    function same(src) {test(src, src)}

    same({})
    same({one: 10})
    same({one: 10, two: 20})
    same({one: `two`})
    same({one: `two`, three: `four`})

    test(undefined, {})
    test([[10, 20]], {})
    test([[10, 20], [`three`, 40], [50, 60], [{}, []]], {three: 40})
  })
})

t.test(function test_Coll() {
  function test(val, exp) {t.eq(toMap(val), exp)}

  function none(val) {
    t.throws(() => new co.Coll().add(val), TypeError, `unable to get primary key of ${l.show(val)}`)
    test(new co.Coll().addOpt(val), new Map())
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
    new co.Coll().add(one).add(two),
    new Map().set(`Mira`, one).set(`Kara`, two),
  )
})

t.test(function test_ClsColl() {
  t.eq(
    toMap(new Persons().add({name: `Mira`}).add({name: `Kara`})),
    new Map()
      .set(`Mira`, new Person({name: `Mira`}))
      .set(`Kara`, new Person({name: `Kara`})),
  )
})

t.test(function test_Que() {
  let count = 0
  function effect0() {count++}
  function effect1() {count++}

  t.test(function test_reject_invalid_inputs() {
    t.throws(() => new co.Que().add(),      TypeError, `expected variant of isFun, got undefined`)
    t.throws(() => new co.Que().add(null),  TypeError, `expected variant of isFun, got null`)
    t.throws(() => new co.Que().add(`one`), TypeError, `expected variant of isFun, got "one"`)
    t.throws(() => new co.Que().add(10),    TypeError, `expected variant of isFun, got 10`)
    t.throws(() => new co.Que().add([]),    TypeError, `expected variant of isFun, got []`)
    t.throws(() => new co.Que().add({}),    TypeError, `expected variant of isFun, got {}`)
  })

  const que = new co.Que()
  que.add(effect0)
  que.add(effect0)
  que.add(effect0)
  que.add(effect1)
  que.add(effect1)
  que.add(effect1)

  t.is(que.size, 2)
  t.is(count, 0)

  que.open()
  t.is(que.size, 0)
  t.is(count, 2)

  que.add(effect0)
  que.add(effect1)
  t.is(que.size, 0)
  t.is(count, 4)

  que.close()
  que.add(effect0)
  que.add(effect1)
  t.is(que.size, 2)
  t.is(count, 4)

  que.open()
  t.is(que.size, 0)
  t.is(count, 6)
})

if (import.meta.main) console.log(`[test] ok!`)
