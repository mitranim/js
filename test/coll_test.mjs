import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as c from '../coll.mjs'

/* Util */

class Person {
  constructor({name}) {this.name = l.reqStr(name)}
  pk() {return this.name}
}

class PersonColl extends c.ClsColl {
  get cls() {return Person}
}

function toMap(val) {return new Map(val.entries())}
function testMap(val, exp) {t.eq(toMap(val), exp)}
function testSeq(val, exp) {t.eq([...val], exp)}

/* Test */

t.test(function test_bset() {
  t.eq(c.bset(), new c.Bset())
  t.eq(c.bset([10, 20]), new c.Bset().add(10).add(20))
})

t.test(function test_bsetOf() {
  t.eq(c.bsetOf(), c.bset())
  t.eq(c.bsetOf(10), c.bset().add(10))
  t.eq(c.bsetOf(10, 20), c.bset().add(10).add(20))
})

t.test(function test_Bset() {testBset(c.Bset)})

t.test(function test_TypedSet() {
  t.test(function test_not_implemented() {
    const tar = new c.TypedSet()
    t.throws(() => tar.reqVal(), TypeError, `not implemented`)
  })

  t.test(function test_any() {
    testBset(class AnySet extends c.TypedSet {reqVal(val) {return val}})
  })

  t.test(function test_specific() {
    class NatSet extends c.TypedSet {
      reqVal(val) {return l.reqNat(val)}
    }

    t.throws(() => NatSet.of(-10), TypeError, `expected variant of isNat, got -10`)
    t.throws(() => new NatSet().add(-10), TypeError, `expected variant of isNat, got -10`)

    testSeq(new NatSet([10, 20]), [10, 20])
    testSeq(NatSet.of(10, 20), [10, 20])
    testSeq(new NatSet().add(10).add(20), [10, 20])
  })
})

function testBset(cls) {
  // Delegates to `.mut` which is tested separately. This is a sanity check.
  t.test(function test_constructor() {
    t.throws(() => new cls(10), TypeError, `unable to convert 10 to ${cls.name}`)
    t.throws(() => new cls({}), TypeError, `unable to convert {} to ${cls.name}`)

    testSeq(new cls([10, 20]), [10, 20])
    testSeq(new cls([10, 20, 20, 10]), [10, 20])
    testSeq(new cls([`one`, `two`]), [`one`, `two`])
    testSeq(new cls([`one`, `two`, `two`, `one`]), [`one`, `two`])
  })

  t.test(function test_add() {
    testSeq(new cls().add(10), [10])
    testSeq(new cls().add(10).add(20), [10, 20])
    testSeq(new cls().add(10).add(20).add(10), [10, 20])
  })

  t.test(function test_mut() {
    t.test(function test_mut_from_nil() {
      t.eq(new cls().mut(), new cls())
      t.eq(new cls([10, 20]).mut(), new cls().add(10).add(20))
    })

    t.test(function test_mut_from_arr() {
      t.eq(new cls().mut([10]), new cls().add(10))
      t.eq(new cls().mut([10, 20]), new cls().add(10).add(20))
      t.eq(new cls().add(10).mut([20]), new cls().add(10).add(20))
    })

    t.test(function test_mut_from_set() {
      t.eq(new cls().mut(new cls().add(10)), new cls().add(10))
      t.eq(new cls().mut(new cls().add(10).add(20)), new cls().add(10).add(20))
      t.eq(new cls().add(10).mut(new cls().add(20)), new cls().add(10).add(20))
    })
  })

  t.test(function test_toArray() {
    function test(src, exp) {
      t.eq(new cls(src).toArray(), exp)
    }

    test(undefined, [])
    test([], [])
    test([10, 20], [10, 20])
    test([10, 20, 10, 20, 30], [10, 20, 30])
  })

  t.test(function test_toJSON() {
    function test(src, exp) {
      t.is(JSON.stringify(new cls(src)), JSON.stringify(exp))
    }

    test(undefined, [])
    test([], [])
    test([10, 20], [10, 20])
    test([10, 20, 10, 20, 30], [10, 20, 30])
  })
}

t.test(function test_bmap() {
  t.eq(c.bmap(), new c.Bmap())
  t.eq(c.bmap([[10, 20], [30, 40]]), new c.Bmap().set(10, 20).set(30, 40))
})

t.test(function test_bmapOf() {
  t.eq(c.bmapOf(), c.bmap())

  t.eq(
    c.bmapOf(10, 20, 30, 40),
    c.bmap().set(10, 20).set(30, 40),
  )

  t.eq(
    [...c.bmapOf(10, 20, 30, 40)],
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

t.test(function test_Bmap() {testBmap(c.Bmap)})

t.test(function test_TypedMap() {
  t.test(function test_not_implemented() {
    const tar = new c.TypedMap()
    t.throws(() => tar.reqKey(), TypeError, `not implemented`)
    t.throws(() => tar.reqVal(), TypeError, `not implemented`)
  })

  t.test(function test_any() {
    testBmap(class AnyMap extends c.TypedMap {
      reqKey(key) {return key}
      reqVal(val) {return val}
    })
  })

  t.test(function test_specific() {
    class StrNatMap extends c.TypedMap {
      reqKey(key) {return l.reqStr(key)}
      reqVal(val) {return l.reqNat(val)}
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
  function test(val, exp) {t.is(c.pkOpt(val), exp)}
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
  t.throws(() => c.pk(), TypeError, `expected undefined to provide key, got undefined`)
  t.throws(() => c.pk(10), TypeError, `expected 10 to provide key, got undefined`)
  t.throws(() => c.pk({}), TypeError, `expected {} to provide key, got undefined`)
  t.throws(() => c.pk({pk: 10}), TypeError, `expected {pk: 10} to provide key, got undefined`)
  t.throws(() => c.pk({pk() {return null}}), TypeError, `expected {pk: [function pk]} to provide key, got null`)

  function test(val, exp) {t.is(c.pk(val), exp)}
  test({pk() {return 10}}, 10)
  test({pk() {return `str`}}, `str`)
})

t.test(function test_Coll() {
  t.test(function test_addOpt() {
    function test(val) {
      t.throws(() => new c.Coll().add(val), TypeError, `expected ${l.show(val)} to provide key, got undefined`)
      testMap(new c.Coll().addOpt(val), new Map())
    }

    test(undefined)
    test(null)
    test(10)
    test(`str`)
    test([])
    test({})
    test({pk: 10})
    test({pk() {}})
  })

  t.test(function test_add() {
    const one = new Person({name: `Mira`})
    const two = new Person({name: `Kara`})

    testMap(
      new c.Coll().add(one).add(two),
      new Map().set(`Mira`, one).set(`Kara`, two),
    )
  })

  t.test(function test_toJSON() {
    t.is(
      JSON.stringify(
        new c.Coll([
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
    t.throws(() => new c.Vec(`str`), TypeError, `expected variant of isTrueArr, got "str"`)

    t.test(function test_reuse() {
      function test(src) {t.is(new c.Vec(src)[l.VAL], src)}

      test([])
      test([10, 20, 30])
    })

    t.eq(new c.Vec()[l.VAL], [])
    t.isnt(new c.Vec()[l.VAL], new c.Vec()[l.VAL])
  })

  t.test(function test_size() {
    t.is(new c.Vec().size, 0)
    t.is(new c.Vec([10, 20, 30]).size, 3)

    const arr = [10, 20, 30]
    const vec = new c.Vec(arr)
    t.is(vec.size, 3)

    arr.length = 2
    t.is(vec.size, 2)

    arr.length = 1
    t.is(vec.size, 1)
  })

  t.test(function test_iterator() {
    t.eq([...new c.Vec()], [])
    t.eq([...new c.Vec([10, 20, 30])], [10, 20, 30])
  })

  t.test(function test_add() {
    const vec = new c.Vec()
    t.eq(vec[l.VAL], [])

    t.is(vec.add(10), vec)
    t.eq(vec[l.VAL], [10])

    t.is(vec.add(20), vec)
    t.eq(vec[l.VAL], [10, 20])
  })

  t.test(function test_clear() {
    const vec = new c.Vec([10, 20, 30])
    t.eq(vec[l.VAL], [10, 20, 30])

    t.is(vec.clear(), vec)
    t.eq(vec[l.VAL], [])
  })

  t.test(function test_at() {
    const vec = new c.Vec([10, 20, 30])

    t.throws(() => vec.at(), TypeError, `expected variant of isInt, got undefined`)
    t.throws(() => vec.at(`0`), TypeError, `expected variant of isInt, got "0"`)
    t.throws(() => vec.at(`-1`), TypeError, `expected variant of isInt, got "-1"`)
    t.throws(() => vec.at(`1`), TypeError, `expected variant of isInt, got "1"`)
    t.throws(() => vec.at(1.1), TypeError, `expected variant of isInt, got 1.1`)

    t.is(vec.at(-1), undefined)
    t.is(vec.at(0), 10)
    t.is(vec.at(1), 20)
    t.is(vec.at(2), 30)
    t.is(vec.at(3), undefined)
  })

  t.test(function test_clone() {
    const arr = [10, 20, 30]
    const vec = new c.Vec(arr)
    t.is(vec[l.VAL], arr)

    const out = vec.clone()
    t.eq(out, vec)
    t.eq(out[l.VAL], arr)
    t.isnt(out, vec)
    t.isnt(out[l.VAL], arr)
  })

  t.test(function test_toArray() {
    const arr = [10, 20, 30]
    t.is(new c.Vec(arr).toArray(), arr)
  })

  t.test(function test_toJSON() {
    function test(arr) {
      t.is(new c.Vec(arr).toJSON(), arr)
      t.is(JSON.stringify(new c.Vec(arr)), JSON.stringify(arr))
    }

    test([])
    test([10])
    test([10, 20])
    test([10, 20, 30])
  })

  t.test(function test_of() {
    t.eq(c.Vec.of()[l.VAL], [])
    t.eq(c.Vec.of(10)[l.VAL], [10])
    t.eq(c.Vec.of(10, 20)[l.VAL], [10, 20])
    t.eq(c.Vec.of(10, 20, [30])[l.VAL], [10, 20, [30]])
  })

  t.test(function test_from() {
    t.throws(() => c.Vec.from(`str`), TypeError, `expected variant of isIter, got "str"`)

    t.eq(c.Vec.from()[l.VAL], [])
    t.eq(c.Vec.from([10, 20, 30])[l.VAL], [10, 20, 30])
    t.eq(c.Vec.from([10, 20, 30])[l.VAL], [10, 20, 30])
  })

  t.test(function test_make() {
    function test(len) {t.eq(c.Vec.make(len)[l.VAL], Array(len))}

    test(0)
    test(1)
    test(2)
    test(3)
  })

  t.test(function test_mut() {
    function test(src, inp, exp) {
      const tar = new c.Vec(src)
      t.is(tar.mut(inp), tar)
      t.eq(tar[l.VAL], exp)
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
  class PersonVec extends c.ClsVec {get cls() {return Person}}

  const vecs = [
    new PersonVec([{name: `Mira`}, {name: `Kara`}]),

    new PersonVec().add({name: `Mira`}).add({name: `Kara`}),

    new PersonVec([
      new Person({name: `Mira`}),
      new Person({name: `Kara`}),
    ]),

    Object.assign(new PersonVec(), {[l.VAL]: [
      new Person({name: `Mira`}),
      new Person({name: `Kara`}),
    ]}),

    PersonVec.of({name: `Mira`}, {name: `Kara`}),

    PersonVec.of(new Person({name: `Mira`}), new Person({name: `Kara`})),
  ]

  for (const one of vecs) for (const two of vecs) t.eq(one, two)
})

if (import.meta.main) console.log(`[test] ok!`)
