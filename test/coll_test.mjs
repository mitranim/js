import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as co from '../coll.mjs'

/* Util */

class Person {
  constructor({name}) {this.name = l.reqStr(name)}
  pk() {return this.name}
}

class PersonColl extends co.ClsColl {
  get cls() {return Person}
}

function toMap(val) {return new Map(val.entries())}

function testMap(val, exp) {t.eq(toMap(val), exp)}

/* Test */

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

function testBmap(Cls) {
  // Delegates to `.mut` which is tested separately. This is a sanity check.
  t.test(function test_constructor() {
    t.throws(() => new Cls(10), TypeError, `unable to convert 10 to ${Cls.name}`)

    t.eq(new Cls(), new Cls())
    t.eq(new Cls([[10, 20]]), new Cls().set(10, 20))
    t.eq(new Cls([[`one`, `two`]]), new Cls().set(`one`, `two`))
    t.eq(new Cls({one: `two`}), new Cls().set(`one`, `two`))
  })

  t.test(function test_static_of() {
    t.eq(Cls.of(), new Cls())
    t.eq(Cls.of(10, 20), new Cls().set(10, 20))
    t.eq(Cls.of(10, 20, 30, 40), new Cls().set(10, 20).set(30, 40))
  })

  t.test(function test_mut() {
    t.test(function test_mut_from_nil() {
      t.eq(new Cls().mut(), new Cls())
      t.eq(Cls.of(10, 20).mut(), Cls.of(10, 20))
    })

    t.test(function test_mut_from_iter() {
      t.eq(new Cls().mut([[10, 20]]), Cls.of(10, 20))
      t.eq(new Cls().mut([[10, 20], [30, 40]]), Cls.of(10, 20, 30, 40))
      t.eq(Cls.of(10, 20).mut([[30, 40]]), Cls.of(10, 20, 30, 40))
      t.eq(Cls.of(10, 20).mut([[10, 30]]), Cls.of(10, 30))
    })

    t.test(function test_from_struct() {
      t.eq(new Cls().mut({one: 10}), Cls.of(`one`, 10))
      t.eq(new Cls().mut({one: 10, two: 20}), Cls.of(`one`, 10, `two`, 20))
      t.eq(new Cls({one: 10}).mut({two: 20}), Cls.of(`one`, 10, `two`, 20))
      t.eq(new Cls({one: 10}).mut({one: 20}), Cls.of(`one`, 20))
    })
  })

  t.test(function test_toDict() {
    t.test(function test_full() {
      function test(src) {t.eq(new Cls(src).toDict(), src)}

      test({})
      test({one: 10})
      test({one: 10, two: 20})
      test({one: `two`})
      test({one: `two`, three: `four`})
    })

    t.test(function test_partial() {
      function test(src, exp) {t.eq(new Cls(src).toDict(), exp)}

      test(undefined, {})
      test([[10, 20]], {})
      test([[10, 20], [`three`, 40], [50, 60], [{}, []]], {three: 40})
    })
  })

  t.test(function test_toJSON() {
    function test(src, exp) {
      t.is(JSON.stringify(new Cls(src)), JSON.stringify(exp))
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
}

t.test(function test_Bmap() {testBmap(co.Bmap)})

t.test(function test_TypedMap() {
  t.test(function test_not_implemented() {
    const tar = new co.TypedMap()
    t.throws(() => tar.key(), TypeError, `not implemented`)
    t.throws(() => tar.val(), TypeError, `not implemented`)
  })

  t.test(function test_any() {
    testBmap(class AnyMap extends co.TypedMap {
      key(key) {return key}
      val(val) {return val}
    })
  })

  t.test(function test_specific() {
    class StrNatMap extends co.TypedMap {
      key(key) {return l.reqStr(key)}
      val(val) {return l.reqNat(val)}
    }

    t.throws(() => StrNatMap.of(10, 20), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => new StrNatMap().set(10, 20), TypeError, `expected variant of isStr, got 10`)

    t.throws(() => StrNatMap.of(`one`, `two`), TypeError, `expected variant of isNat, got "two"`)
    t.throws(() => new StrNatMap().set(`one`, `two`), TypeError, `expected variant of isNat, got "two"`)

    t.eq(
      StrNatMap.of(`one`, 10),
      new StrNatMap().set(`one`, 10),
    )

    t.eq(
      StrNatMap.of(`one`, 10, `two`, 20),
      new StrNatMap().set(`one`, 10).set(`two`, 20),
    )
  })
})

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
  t.throws(() => co.pk(), TypeError, `expected primary key of undefined, got undefined`)
  t.throws(() => co.pk(10), TypeError, `expected primary key of 10, got undefined`)
  t.throws(() => co.pk({}), TypeError, `expected primary key of {}, got undefined`)
  t.throws(() => co.pk({pk: 10}), TypeError, `expected primary key of {"pk":10}, got undefined`)
  t.throws(() => co.pk({pk() {return null}}), TypeError, `expected primary key of {}, got null`)

  function test(val, exp) {t.is(co.pk(val), exp)}
  test({pk() {return 10}}, 10)
  test({pk() {return `str`}}, `str`)
})

t.test(function test_Coll() {
  t.test(function test_addOpt() {
    function test(val) {
      t.throws(() => new co.Coll().add(val), TypeError, `expected primary key of ${l.show(val)}, got undefined`)
      testMap(new co.Coll().addOpt(val), new Map())
    }

    test(undefined)
    test(null)
    test(10)
    test(`str`)
    test([])
    test({})
    test({pk: 10})
    test({pk() {return undefined}})
  })

  t.test(function test_add() {
    const one = new Person({name: `Mira`})
    const two = new Person({name: `Kara`})

    testMap(
      new co.Coll().add(one).add(two),
      new Map().set(`Mira`, one).set(`Kara`, two),
    )
  })

  t.test(function test_toJSON() {
    t.is(
      JSON.stringify(
        new co.Coll([
          new Person({name: `Mira`}),
          new Person({name: `Kara`}),
        ]),
      ),
      `[{"name":"Mira"},{"name":"Kara"}]`,
    )
  })
})

t.test(function test_ClsColl() {
  t.eq(
    toMap(new PersonColl().add({name: `Mira`}).add({name: `Kara`})),
    new Map()
      .set(`Mira`, new Person({name: `Mira`}))
      .set(`Kara`, new Person({name: `Kara`})),
  )
})

t.test(function test_Vec() {
  t.test(function test_constructor() {
    t.throws(() => new co.Vec(`str`), TypeError, `expected variant of isTrueArr, got "str"`)

    t.test(function test_reuse() {
      function test(src) {t.is(new co.Vec(src).$, src)}

      test([])
      test([10, 20, 30])
    })

    t.eq(new co.Vec().$, [])
    t.isnt(new co.Vec().$, new co.Vec().$)
  })

  t.test(function test_size() {
    t.is(new co.Vec().size, 0)
    t.is(new co.Vec([10, 20, 30]).size, 3)

    const arr = [10, 20, 30]
    const vec = new co.Vec(arr)
    t.is(vec.size, 3)

    arr.length = 2
    t.is(vec.size, 2)

    arr.length = 1
    t.is(vec.size, 1)
  })

  t.test(function test_iterator() {
    t.eq([...new co.Vec()], [])
    t.eq([...new co.Vec([10, 20, 30])], [10, 20, 30])
  })

  t.test(function test_add() {
    const vec = new co.Vec()
    t.eq(vec.$, [])

    t.is(vec.add(10), vec)
    t.eq(vec.$, [10])

    t.is(vec.add(20), vec)
    t.eq(vec.$, [10, 20])
  })

  t.test(function test_clear() {
    const vec = new co.Vec([10, 20, 30])
    t.eq(vec.$, [10, 20, 30])

    t.is(vec.clear(), vec)
    t.eq(vec.$, [])
  })

  t.test(function test_clone() {
    const arr = [10, 20, 30]
    const vec = new co.Vec(arr)
    t.is(vec.$, arr)

    const out = vec.clone()
    t.eq(out, vec)
    t.eq(out.$, arr)
    t.isnt(out, vec)
    t.isnt(out.$, arr)
  })

  t.test(function test_toArray() {
    const arr = [10, 20, 30]
    t.is(new co.Vec(arr).toArray(), arr)
  })

  t.test(function test_toJSON() {
    function test(arr) {
      t.is(new co.Vec(arr).toJSON(), arr)
      t.is(JSON.stringify(new co.Vec(arr)), JSON.stringify(arr))
    }

    test([])
    test([10])
    test([10, 20])
    test([10, 20, 30])
  })

  t.test(function test_of() {
    t.eq(co.Vec.of().$, [])
    t.eq(co.Vec.of(10).$, [10])
    t.eq(co.Vec.of(10, 20).$, [10, 20])
    t.eq(co.Vec.of(10, 20, [30]).$, [10, 20, [30]])
  })

  t.test(function test_from() {
    t.throws(() => co.Vec.from(`str`), TypeError, `expected variant of isIter, got "str"`)

    t.eq(co.Vec.from().$, [])
    t.eq(co.Vec.from([10, 20, 30]).$, [10, 20, 30])
    t.eq(co.Vec.from([10, 20, 30]).$, [10, 20, 30])
  })

  t.test(function test_make() {
    function test(len) {t.eq(co.Vec.make(len).$, Array(len))}

    test(0)
    test(1)
    test(2)
    test(3)
  })

  t.test(function test_mut() {
    function test(src, inp, exp) {
      const tar = new co.Vec(src)
      t.is(tar.mut(inp), tar)
      t.eq(tar.$, exp)
    }

    test([], [], [])
    test([], [10], [10])
    test([], [10, 20], [10, 20])
    test([10], [], [])
    test([10, 20], [], [])
    test([10], [20], [20])
    test([10], [20, 30], [20, 30])
    test([10, 20], [30, 40], [30, 40])
  })
})

t.test(function test_ClsVec() {
  class PersonVec extends co.ClsVec {get cls() {return Person}}

  const vecs = [
    new PersonVec([{name: `Mira`}, {name: `Kara`}]),

    new PersonVec().add({name: `Mira`}).add({name: `Kara`}),

    new PersonVec([
      new Person({name: `Mira`}),
      new Person({name: `Kara`}),
    ]),

    Object.assign(new PersonVec(), {$: [
      new Person({name: `Mira`}),
      new Person({name: `Kara`}),
    ]}),

    PersonVec.of({name: `Mira`}, {name: `Kara`}),

    PersonVec.of(new Person({name: `Mira`}), new Person({name: `Kara`})),
  ]

  for (const one of vecs) for (const two of vecs) t.eq(one, two)
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
