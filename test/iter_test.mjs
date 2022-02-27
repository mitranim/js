import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as i from '../iter.mjs'

/* Util */

function args() {return arguments}
function arrgs(...val) {return val}
function toArgs(val) {return args(...(val ?? []))}
function unreachable() {throw Error(`unreachable`)}
async function* agen() {unreachable()}
function* copygen(val) {for (val of val) yield val}
function fail() {unreachable()}

function testSeqs(src, fun) {
  t.ok(Array.isArray(src))
  fun(function make() {return src.slice()})
  fun(function make() {return new Set(src)})
  fun(function make() {return args(...src)})
  fun(function make() {return copygen(src)})
}

function testMaps(src, fun) {
  fun(function make() {return Object.fromEntries(Object.entries(src))})
  fun(function make() {return new Map(Object.entries(src))})
}

function testColls(list, dict, fun) {
  testSeqs(list, fun)
  testMaps(dict, fun)
}

function testDictFunBasics(fun) {
  t.throws(() => fun({}), TypeError, `expected variant of isFun, got undefined`)
  t.throws(() => fun([], l.nop), TypeError, `expected variant of isStruct, got []`)
  t.throws(() => fun(`str`, l.nop), TypeError, `expected variant of isStruct, got "str"`)
  t.is(Object.getPrototypeOf(fun(undefined, l.nop)), null)
}

/* Test */

t.test(function test_arrOf() {
  t.throws(i.arrOf,                      TypeError, `expected variant of isFun, got undefined`)
  t.throws(() => i.arrOf(null, 10),      TypeError, `expected variant of isFun, got 10`)
  t.throws(() => i.arrOf([], 10),        TypeError, `expected variant of isFun, got 10`)
  t.throws(() => i.arrOf({}, l.True),    TypeError, `unable to convert {} to array`)
  t.throws(() => i.arrOf([10], l.False), TypeError, `expected variant of False, got 10`)

  t.eq(i.arrOf(undefined, l.True), [])
  t.eq(i.arrOf(null, l.True), [])
  t.eq(i.arrOf([10, 20, 30], l.True), [10, 20, 30])
})

t.test(function test_more() {
  const iter = copygen([10, 20, 30])
  t.ok(i.more(iter))
  t.ok(i.more(iter))
  t.ok(i.more(iter))
  t.no(i.more(iter))
  t.no(i.more(iter))
  t.eq([...iter], [])
})

t.test(function test_alloc() {
  t.throws(() => i.alloc(), TypeError, `expected variant of isNat, got undefined`)
  t.throws(() => i.alloc(`10`), TypeError, `expected variant of isNat, got "10"`)

  t.eq(i.alloc(0), Array(0))
  t.eq(i.alloc(1), Array(1))
  t.eq(i.alloc(2), Array(2))
})

t.test(function test_arr() {
  t.test(function test_invalid() {
    testNoAsyncIterator(i.arr)
    t.throws(() => i.arr(10),        TypeError, `unable to convert 10 to array`)
    t.throws(() => i.arr(`str`),     TypeError, `unable to convert "str" to array`)
    t.throws(() => i.arr(l.nop),     TypeError, `unable to convert [function nop] to array`)
    t.throws(() => i.arr({}),        TypeError, `unable to convert {} to array`)
    t.throws(() => i.arr(new Map()), TypeError, `unable to convert [object Map] to array`)
  })

  t.test(function test_nil() {
    function test(val) {t.eq(i.arr(val), [])}
    test(undefined)
    test(null)
  })

  testSeqs(
    [10, 20, 30],
    function testSeq(make) {
      const src = make()
      const out = i.arr(src)
      t.isnt(src, out)
      t.eq(out, [10, 20, 30])
    },
  )

  // This is considered a list.
  t.eq(i.arr(new String(`str`)), [`s`, `t`, `r`])
})

t.test(function test_slice() {
  t.throws(() => i.slice([], `str`), TypeError, `expected variant of isInt, got "str"`)
  t.throws(() => i.slice([], 0, `str`), TypeError, `expected variant of isInt, got "str"`)
  t.throws(() => i.slice({}), TypeError, `unable to convert {} to array`)
  t.throws(() => i.slice(10), TypeError, `unable to convert 10 to array`)
  t.throws(() => i.slice(`str`), TypeError, `unable to convert "str" to array`)
  t.throws(() => i.slice(new Map()), TypeError, `unable to convert [object Map] to array`)

  t.eq(i.slice(undefined), [])
  t.eq(i.slice(null), [])

  testSeqs([], function testSeq(make) {
    t.eq(i.slice(make(), 1, 2), [])
  })

  testSeqs([10, 20, 30], function testSeq(make) {
    t.eq(i.slice(make()), [10, 20, 30])
  })

  testSeqs([10, 20, 30], function testSeq(make) {
    t.eq(i.slice(make(), 1, 2), [20])
  })

  testSeqs([10, 20, 30, 40, 50], function testSeq(make) {
    t.eq(i.slice(make(), 1, 3), [20, 30])
  })
})

/*
Doesn't use `testColls` or `testSeqs` because list "keys" are indexes
while set "keys" are values.
*/
t.test(function test_keys() {
  testFunEmptyList(i.keys)
  testNoIterator(i.keys)

  function test(src, exp) {t.eq(i.keys(src), exp)}

  test([10, 20],                      [0, 1])
  test(args(10, 20),                  [0, 1])
  test(new Set([10, 20]),             [10, 20])
  test({one: 10, two: 20},            [`one`, `two`])
  test(new Map([[10, 20], [30, 40]]), [10, 30])

  function keys() {return [10, 20]}

  test({keys}, [`keys`])
  test({keys, [Symbol.iterator]: l.nop}, [10, 20])
})

t.test(function test_values() {
  testValues(i.values, l.nop)

  t.test(function test_reference() {
    function same(val) {t.is(i.values(val), val)}
    function diff(val) {t.isnt(i.values(val), val)}

    same([])
    same([10, 20])

    diff(new class extends Array {}())
  })
})

t.test(function test_valuesCopy() {
  testValues(i.valuesCopy, t.isnt)
})

function testValues(fun, backref) {
  testFunEmptyList(fun)
  testNoAsyncIterator(fun)

  t.test(function test_all() {
    function test(src, exp) {t.eq(fun(src), exp)}

    testColls(
      [10, 20],
      {one: 10, two: 20},
      function testColl(make) {
        const src = make()
        const out = fun(src)
        t.eq(out, [10, 20])
        backref(out, src)
      }
    )

    function values() {return [10, 20]}

    test({values}, [values])
    test({values, [Symbol.iterator]: l.nop}, [10, 20])
  })
}

/*
Doesn't use `testColls` or `testSeqs` because different sequences have different
"keys". See `test_keys`. Also for iterators we simply collect their values.
*/
t.test(function test_entries() {
  testFunEmptyList(i.entries)
  testNoAsyncIterator(i.entries)

  function test(src, exp) {t.eq(i.entries(src), exp)}

  test([10, 20],                      [[0, 10], [1, 20]])
  test(args(10, 20),                  [[0, 10], [1, 20]])
  test(copygen([10, 20]),             [10, 20])
  test(new Set([10, 20]),             [[10, 10], [20, 20]])
  test({one: 10, two: 20},            [[`one`, 10], [`two`, 20]])
  test(new Map([[10, 20], [30, 40]]), [[10, 20], [30, 40]])

  function entries() {return [[10, 20], [30, 40]]}

  test({entries}, [[`entries`, entries]])
  test({entries, [Symbol.iterator]: l.nop}, [[10, 20], [30, 40]])
})

t.test(function test_reify() {
  t.is(i.reify(), undefined)
  t.is(i.reify(null), null)
  t.is(i.reify(0), 0)
  t.is(i.reify(false), false)
  t.is(i.reify(NaN), NaN)
  t.is(i.reify(``), ``)
  t.eq(i.reify([]), [])
  t.eq(i.reify([10, 20, 30]), [10, 20, 30])
  t.eq(i.reify([10, 20, 30].values()), [10, 20, 30])
  t.eq(i.reify(copygen([10, 20, 30])), [10, 20, 30])
  t.eq(i.reify([[10], [20], [30]]), [[10], [20], [30]])
  t.eq(i.reify([[10, 20].keys(), [30, 40].values(), [40, 50].entries()]), [[0, 1], [30, 40], [[0, 40], [1, 50]]])
  t.eq(i.reify([[10, 20].keys(), [30, 40].values(), [40, 50].entries()].values()), [[0, 1], [30, 40], [[0, 40], [1, 50]]])

  const ref = [10, [20], [[30]]]
  t.eq(i.reify(ref), [10, [20], [[30]]])
  t.is(i.reify(ref), ref)
  t.is(ref[0], i.reify(ref)[0])
  t.is(ref[1], i.reify(ref)[1])
  t.is(ref[1], i.reify(ref)[1])
  t.is(ref[2], i.reify(ref)[2])
  t.is(ref[2][0], i.reify(ref)[2][0])
})

t.test(function test_indexOf() {
  t.test(function test_invalid() {
    t.throws(() => i.indexOf(`str`), TypeError, `expected variant of isList, got "str"`)
  })

  function test(src, val, exp) {
    t.is(i.indexOf(src, val), exp)
    t.is(i.indexOf(toArgs(src), val), exp)
  }

  test(undefined,              undefined, -1)
  test([],                     undefined, -1)
  test([10, NaN, 20, NaN, 30], undefined, -1)
  test([10, NaN, 20, NaN, 30], 0,         -1)
  test([10, NaN, 20, NaN, 30], 10,        +0)
  test([10, NaN, 20, NaN, 30], NaN,       +1)
  test([10, NaN, 20, NaN, 30], 20,        +2)
  test([10, NaN, 20, NaN, 30], 30,        +4)
  test([10, NaN, 20, NaN, 30], 40,        -1)
})

t.test(function test_includes() {
  function test(src, val, exp) {
    t.is(i.includes(src, val), exp)
    t.is(i.includes(args(...(src ?? [])), val), exp)
  }

  t.no(i.includes(`str`, `s`))

  test(undefined,              undefined, false)
  test([],                     undefined, false)
  test([10, NaN, 20, NaN, 30], undefined, false)
  test([10, NaN, 20, NaN, 30], 0,         false)
  test([10, NaN, 20, NaN, 30], 10,        true)
  test([10, NaN, 20, NaN, 30], NaN,       true)
  test([10, NaN, 20, NaN, 30], 20,        true)
  test([10, NaN, 20, NaN, 30], 30,        true)
  test([10, NaN, 20, NaN, 30], 40,        false)
})

t.test(function test_concat() {
  testFunEmptyList(i.concat)

  testColls(
    [10, 20],
    {one: 10, two: 20},
    function prev(prev) {
      testColls(
        [20, [30]],
        {two: 20, three: [30]},
        function next(next) {
          t.eq(i.concat(prev(), next()), [10, 20, 20, [30]])
        }
      )
    }
  )
})

t.test(function test_append() {
  testFunEmpty(
    function test(val) {return i.append(val, 10)},
    [10],
  )

  testColls(
    [10, 20, 30],
    {one: 10, two: 20, three: 30},
    function testColl(make) {
      t.eq(i.append(make(), 40), [10, 20, 30, 40])
    },
  )
})

t.test(function test_prepend() {
  testFunEmpty(
    function test(val) {return i.prepend(val, 10)},
    [10],
  )

  testColls(
    [10, 20, 30],
    {one: 10, two: 20, three: 30},
    function testColl(make) {
      t.eq(i.prepend(make(), 40), [40, 10, 20, 30])
    },
  )
})

function testFunEmptyList(fun) {testFunEmpty(fun, [])}
function testFunEmptyDict(fun) {testFunEmpty(fun, {})}
function testFunEmptySet(fun) {testFunEmpty(fun, new Set())}

function testFunEmpty(fun, zero) {
  t.eq(fun(), zero)
  t.eq(fun(null), zero)
  t.eq(fun(false), zero)
  t.eq(fun(10), zero)
  t.eq(fun(`str`), zero)
  t.eq(fun(fun), zero)
  t.eq(fun([]), zero)
  t.eq(fun(new Set()), zero)
  t.eq(fun(new Map()), zero)
}

function testNoIterator(fun) {
  testNoSyncIterator(fun)
  testNoAsyncIterator(fun)
}

function testNoSyncIterator(fun) {
  t.throws(() => fun(copygen([])), TypeError, `unable to convert [object Generator]`)
}

function testNoAsyncIterator(fun) {
  t.throws(() => fun(agen()), TypeError, `unable to convert [object AsyncGenerator]`)
}

t.test(function test_len() {
  testLen(function test(val, len) {t.is(i.len(val), len)})
})

t.test(function test_hasLen() {
  testLen(function test(val, len) {t.is(i.hasLen(val), len > 0)})
})

function testLen(test) {
  test(undefined, 0)
  test(null, 0)
  test(10, 0)
  test(true, 0)
  test(``, 0)
  test(`str`, 0)
  test(new String(``), 0)
  test(new String(`str`), 3)
  test(i.len, 0)
  test([], 0)
  test([10], 1)
  test([10, 20], 2)
  test({}, 0)
  test({one: 10}, 1)
  test({one: 10, two: 20}, 2)
  test(new Set(), 0)
  test(new Set([10, 20]), 2)
  test(new Map(), 0)
  test(new Map([[10, 20], [20, 30]]), 2)
  test(args(), 0)
  test(args(10), 1)
  test(args(10, 20), 2)
  test(copygen([]), 0)
  test(copygen([10]), 1)
  test(copygen([10, 20]), 2)
}

t.test(function test_each() {
  function test(src, exp) {
    const out = []
    i.each(src, val => out.push(val))
    t.eq(out, exp)
  }

  test(undefined, [])
  test(null, [])
  test(10, [])
  test(`str`, [])

  testColls([], {}, function testEmpty(make) {
    test(make(), [])
  })

  testColls([10, 20], {one: 10, two: 20}, function testFull(make) {
    test(make(), [10, 20])
  })
})

t.test(function test_map() {
  testFunIterInit(i.map)

  function test(src, fun, exp) {
    const out = i.map(src, fun)
    t.isnt(out, src) // Precaution due to internal use of `mapMut`.
    t.eq(out, exp)
  }

  testColls([], {}, function testEmpty(make) {
    test(make(), l.inc, [])
  })

  testColls(
    [0, false, NaN],
    {one: 0, two: false, three: NaN},
    function testInc(make) {
      test(make(), l.inc, [1, 1, NaN])
    },
  )

  testColls(
    [10, 20, 30],
    {one: 10, two: 20, three: 30},
    function testLong(make) {
      test(make(), l.inc, [11, 21, 31])
      test(make(), l.dec, [9, 19, 29])
    },
  )
})

// We only need to check the basics.
// `map` uses `mapMut` and has a more thorough test.
t.test(function test_mapMut() {
  t.throws(() => i.mapMut(undefined, l.id), TypeError, `expected variant of isArr, got undefined`)

  function test(src, fun, exp) {
    t.is(i.mapMut(src, fun), src)
    t.eq(src, exp)
  }

  test([10, 20, 30], l.inc, [11, 21, 31])
})

function testFunIterInit(fun) {
  l.reqFun(fun)
  t.throws(() => fun([], `str`), TypeError, `expected variant of isFun, got "str"`)
}

t.test(function test_mapCompact() {
  testFunIterInit(i.mapCompact)
  testFunEmptyList(function test(val) {return i.mapCompact(val, l.id)})

  testColls(
    [-11, -2, -1, 0, 1, 2, 11],
    {one: -11, two: -2, three: -1, four: 0, five: 1, six: 2, seven: 11},
    function testColl(make) {
      t.eq(i.mapCompact(make(), l.dec), [-12, -3, -2, -1, 1, 10])
    },
  )
})

t.test(function test_filter() {
  testFunIterInit(i.filter)
  testFunEmptyList(function test(val) {return i.filter(val, l.id)})

  testColls(
    [10, 0, NaN, 20, false, 30],
    {one: 10, two: 0, three: NaN, four: 20, five: false, six: 30},
    function testColl(make) {
      t.eq(i.filter(make(), l.False), [])
      t.eq(i.filter(make(), l.True), [10, 0, NaN, 20, false, 30])
      t.eq(i.filter(make(), l.id), [10, 20, 30])
      t.eq(i.filter(make(), l.isFin), [10, 0, 20, 30])
    },
  )
})

t.test(function test_reject() {
  testFunIterInit(i.reject)
  testFunEmptyList(function test(val) {return i.reject(val, l.id)})

  testColls(
    [10, 0, NaN, 20, false, 30],
    {one: 10, two: 0, three: NaN, four: 20, five: false, six: 30},
    function testColl(make) {
      t.eq(i.reject(make(), l.False), [10, 0, NaN, 20, false, 30])
      t.eq(i.reject(make(), l.True), [])
      t.eq(i.reject(make(), l.id), [0, NaN, false])
      t.eq(i.reject(make(), l.isFin), [NaN, false])
    },
  )
})

t.test(function test_compact() {
  testFunEmptyList(i.compact)

  testColls(
    [10, 0, NaN, 20, false, 30, ``, [`str`]],
    {one: 10, two: 0, three: NaN, four: 20, five: false, six: 30, seven: ``, eight: [`str`]},
    function testColl(make) {
      t.eq(i.compact(make()), [10, 20, 30, [`str`]])
    },
  )
})

t.test(function test_remove() {
  testFunEmptyList(i.remove)

  t.eq(i.remove([10, NaN, 10, NaN, 20], 10), [NaN, NaN, 20])
  t.eq(i.remove([10, NaN, 10, NaN, 20], NaN), [10, 10, 20])

  testColls(
    [10, NaN, 20, false, 30, `str`],
    {one: 10, two: NaN, three: 20, four: false, five: 30, six: `str`},
    function testColl(make) {
      t.eq(i.remove(make(), NaN), [10, 20, false, 30, `str`])
      t.eq(i.remove(make(), 10), [NaN, 20, false, 30, `str`])
      t.eq(i.remove(make(), 20), [10, NaN, false, 30, `str`])
    },
  )
})

t.test(function test_fold() {
  t.throws(() => i.fold([], 0, `str`), TypeError, `expected variant of isFun, got "str"`)
  testFunEmpty(src => i.fold(src, `acc`, fail), `acc`)

  testColls(
    [10, 20, 30],
    {one: 10, two: 20, three: 30},
    function testColl(make) {
      t.is(i.fold(make(), `acc`, l.id), `acc`)
      t.is(i.fold(make(), `acc`, l.add), `acc102030`)
      t.eq(i.fold(make(), 3,     arrgs), [[[3, 10], 20], 30])
      t.is(i.fold(make(), 3,     l.add), (3 + 10 + 20 + 30))
    },
  )
})

t.test(function test_find() {
  testFunIterInit(i.find)
  testFunEmpty(src => i.find(src, fail), undefined)

  testColls(
    [`10`, NaN, 20, 30],
    {one: `10`, two: NaN, three: 20, four: 30},
    function testColl(make) {
      t.is(i.find(make(), l.False), undefined)
      t.is(i.find(make(), l.True), `10`)
      t.is(i.find(make(), l.isFin), 20)
    },
  )
})

t.test(function test_procure() {
  testFunIterInit(i.procure)

  t.is(i.procure(undefined,         l.id), undefined)
  t.is(i.procure(undefined,         l.nop), undefined)
  t.is(i.procure([NaN, 10, 20, 30], l.id), 10)
  t.is(i.procure([NaN, 10, 20, 30], l.nop), undefined)

  testColls(
    [false, NaN, 10, 20, 30],
    {one: false, two: NaN, three: 10, four: 20, five: 30},
    function testColl(make) {
      t.is(i.procure(make(), l.neg), -10)
    },
  )
})

t.test(function test_every() {
  testFunIterInit(i.every)

  t.ok(i.every(undefined, l.True))
  t.ok(i.every(undefined, l.False))

  testColls(
    [10, 0],
    {one: 10, two: 0},
    function testOk(make) {t.ok(i.every(make(), l.isFin))},
  )

  testColls(
    [10, NaN],
    {one: 10, two: NaN},
    function testNo(make) {t.no(i.every(make(), l.isFin))},
  )
})

t.test(function test_some() {
  testFunIterInit(i.some)

  t.no(i.some(undefined, l.True))
  t.no(i.some(undefined, l.False))

  testColls(
    [NaN, 0],
    {one: NaN, two: 0},
    function testOk(make) {t.ok(i.some(make(), l.isFin))},
  )

  testColls(
    [NaN, `10`],
    {one: NaN, two: `10`},
    function testNo(make) {t.no(i.some(make(), l.isFin))},
  )
})

t.test(function test_head() {
  testFunEmpty(i.head)

  testColls(
    [10, 20, 30],
    {one: 10, two: 20},
    function testColl(make) {t.is(i.head(make()), 10)},
  )
})

t.test(function test_last() {
  testFunEmpty(i.last)

  testColls(
    [10, 20, 30],
    {one: 10, two: 20, three: 30},
    function testColl(make) {t.is(i.last(make()), 30)},
  )
})

t.test(function test_init() {
  testFunEmptyList(i.init)

  testColls(
    [10, 20, 30],
    {one: 10, two: 20, three: 30},
    function testColl(make) {t.eq(i.init(make()), [10, 20])}
  )
})

t.test(function test_tail() {
  testFunEmptyList(i.tail)

  testColls(
    [10, 20, 30],
    {one: 10, two: 20, three: 30},
    function testColl(make) {t.eq(i.tail(make()), [20, 30])},
  )
})

t.test(function test_take() {
  t.throws(() => i.take([], `str`), TypeError, `expected variant of isNat, got "str"`)

  testFunEmptyList(i.take)
  testFunEmptyList(function test(val) {return i.take(val, 0)})

  function done(val) {
    t.eq(i.take(val, undefined), [])
    t.eq(i.take(val, 0), [])
  }

  done([10, 20, 30])
  done(args(10, 20, 30))
  done(new Set([10, 20, 30]))
  done(new Map([[10, 20], [30, 40]]))
  done({one: 10, two: 20})

  function test(src, len, exp) {t.eq(i.take(src, len), exp)}

  testColls(
    [10, 20, 30],
    {one: 10, two: 20, three: 30},
    function testColl(make) {
      test(make(), 0, [])
      test(make(), 1, [10])
      test(make(), 2, [10, 20])
      test(make(), 3, [10, 20, 30])
      test(make(), 4, [10, 20, 30])
    },
  )
})

t.test(function test_count() {
  testFunIterInit(i.count)

  testColls(
    [NaN, 0, false, 10, `20`],
    {one: NaN, two: 0, three: false, four: 10, five: `20`},
    function testColl(make) {
      t.is(i.count(make(), l.True), 5)
      t.is(i.count(make(), l.False), 0)
      t.is(i.count(make(), l.isFin), 2)
    },
  )
})

// Semi-placeholder, TODO check if spec authors provide test cases.
t.test(function test_compare() {
  t.is(i.compare(), +0)
  t.is(i.compare(10, undefined), -1)
  t.is(i.compare(undefined, 20), +1)
  t.is(i.compare(10, 20), -1)
  t.is(i.compare(20, 10), +1)
  t.is(i.compare(`one`, `two`), -1)
  t.is(i.compare(`two`, `one`), +1)
})

t.test(function test_compareFin() {
  t.throws(() => i.compareFin(`str`, 10), TypeError, `expected variant of isFin, got "str"`)
  t.throws(() => i.compareFin(10, `str`), TypeError, `expected variant of isFin, got "str"`)

  t.is(i.compareFin(), +0)
  t.is(i.compareFin(10, undefined), +1)
  t.is(i.compareFin(-10, undefined), -1)
  t.is(i.compareFin(undefined, -20), +1)
  t.is(i.compareFin(10, 20), -1)
  t.is(i.compareFin(20, 10), +1)
})

t.test(function test_sort() {
  testFunEmptyList(i.sort)

  t.test(function test_sort_default() {
    function test(src, exp) {
      const out = i.sort(src)
      t.isnt(out, src)
      t.eq(out, exp)
    }

    testColls(
      [NaN, 0, false, 10, `20`],
      {one: NaN, two: 0, three: false, four: 10, five: `20`},
      function testColl(make) {
        test(make(), [0, 10, `20`, NaN, false])
      },
    )
  })

  t.test(function test_sort_compareFin() {
    function test(src, exp) {t.eq(i.sort(src, i.compareFin), exp)}

    /*
    We delegate to `Array.prototype.sort`, which automatically sorts `undefined`
    to the end of the resulting array without invoking our comparator.
    */
    testSeqs([null, 0, -20, 30, -10, undefined, 40], function testSeq(make) {
      test(make(), [-20, -10, null, 0, 30, 40, undefined])
    })
  })
})

t.test(function test_reverse() {
  testFunEmptyList(i.reverse)

  function test(src, exp) {
    const out = i.reverse(src)
    t.isnt(out, src)
    t.eq(out, exp)
  }

  testColls(
    [NaN, 0, false, 10, `20`],
    {one: NaN, two: 0, three: false, four: 10, five: `20`},
    function testColl(make) {
      test(make(), [`20`, 10, false, 0, NaN])
    },
  )
})

t.test(function test_index() {
  testFunIterInit(i.index)
  testFunEmptyDict(function init(val) {return i.index(val, l.id)})

  t.eq(i.index(undefined, l.val(`key`)), {})
  t.eq(i.index(null, l.val(`key`)), {})

  t.test(function test_with_invalid_key() {

    testColls(
      [false, NaN, 10, 20, 30],
      {one: false, two: NaN, three: 30, four: 40},
      function testColl(make) {
        t.eq(i.index(make(), l.nop), {})
        t.eq(i.index(make(), l.val({})), {})
        t.eq(i.index(make(), l.val(l.nop)), {})
      },
    )
  })

  t.test(function test_with_constant_key() {
    const key = () => `key`

    testColls(
      [false, NaN, 10, 20, 30],
      {one: false, two: NaN, three: 10, four: 20, five: 30},
      function testColl(make) {
        t.eq(i.index(make(), key), {key: 30})
      },
    )
  })

  t.test(function test_with_usable_key() {
    testColls(
      [false, NaN, 10, 20, 30],
      {one: false, two: NaN, three: 10, four: 20, five: 30},
      function testColl(make) {
        t.eq(i.index(make(), l.id), {false: false, 10: 10, 20: 20, 30: 30})
        t.eq(i.index(make(), l.neg), {0: false, [-10]: 10, [-20]: 20, [-30]: 30})
        t.eq(i.index(make(), l.inc), {1: false, 11: 10, 21: 20, 31: 30})
      },
    )
  })
})

t.test(function test_group() {
  testFunIterInit(i.group)

  t.test(function test_with_invalid_key() {
    testColls(
      [3, 5, 7, 11],
      {one: 3, two: 5, three: 7, four: 11},
      function testColl(make) {
        t.eq(i.group(make(), l.nop), {})
        t.eq(i.group(make(), l.val(NaN)), {})
        t.eq(i.group(make(), l.val({})), {})
      },
    )
  })

  testColls(
    [3, 6, 7, 14],
    {one: 3, two: 6, three: 7, four: 14},
    function testAny(make) {
      t.eq(i.group(make(), l.id), {3: [3], 6: [6], 7: [7], 14: [14]})
      t.eq(i.group(make(), l.inc), {4: [3], 7: [6], 8: [7], 15: [14]})
      t.eq(i.group(make(), val => val % 2), {1: [3, 7], 0: [6, 14]})
    },
  )
})

t.test(function test_partition() {
  testFunIterInit(i.group)

  t.eq(i.partition(undefined, l.id), [[], []])

  testColls(
    [NaN, 0, false, 10, `20`],
    {one: NaN, two: 0, three: false, four: 10, five: `20`},
    function testColl(make) {
      t.eq(i.partition(make(), l.False), [[], [NaN, 0, false, 10, `20`]])
      t.eq(i.partition(make(), l.True), [[NaN, 0, false, 10, `20`], []])
      t.eq(i.partition(make(), l.isFin), [[0, 10], [NaN, false, `20`]])
      t.eq(i.partition(make(), l.isNum), [[NaN, 0, 10], [false, `20`]])
    },
  )
})

t.test(function test_sum() {
  testFunEmpty(i.sum, 0)
  testNoAsyncIterator(i.sum)

  testColls(
    [NaN, 0, false, 10, `20`, undefined, {}, -21],
    {one: NaN, two: 0, three: false, four: 10, five: `20`, six: undefined, seven: {}, eight: -21},
    function testColl(make) {t.is(i.sum(make()), -11)},
  )
})

t.test(function test_zip() {
  testNoAsyncIterator(i.zip)

  testSeqs(
    [[10, 20], [NaN, 30], [undefined, 40], [{}, 50], [60, 70]],
    function testSeq(make) {
      t.eq(i.zip(make()), {10: 20, 60: 70})
    },
  )

  const src = {one: NaN, two: 0, three: false, four: 10, five: `20`, six: undefined, seven: {}, eight: -21}

  testMaps(src, function testMap(make) {
    t.eq(i.zip(i.entries(make())), src)
  })
})

t.test(function test_mapOf() {
  t.eq(i.mapOf(), new Map())
  t.eq(i.mapOf(10, 20), new Map().set(10, 20))
  t.eq(i.mapOf(10, 20, 30), new Map().set(10, 20).set(30))
  t.eq(i.mapOf(10, 20, 30, 40), new Map().set(10, 20).set(30, 40))
})

t.test(function test_range() {
  t.eq(i.range(), [])
  t.eq(i.range(0, undefined), [])
  t.eq(i.range(undefined, 0), [])
  t.eq(i.range(0, 0), [])
  t.eq(i.range(-1, 0), [-1])
  t.eq(i.range(-2, -1), [-2])
  t.eq(i.range(-2, 0), [-2, -1])
  t.eq(i.range(0, 1), [0])
  t.eq(i.range(1, 2), [1])
  t.eq(i.range(-7, 0), [-7, -6, -5, -4, -3, -2, -1])
  t.eq(i.range(0, 8), [0, 1, 2, 3, 4, 5, 6, 7])
  t.eq(i.range(-3, 7), [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6])
})

t.test(function test_span() {
  t.throws(() => i.span(`10`), TypeError, `expected variant of isNat, got "10"`)
  t.throws(() => i.span(-1), TypeError, `expected variant of isNat, got -1`)

  t.eq(i.span(), [])
  t.eq(i.span(0), [])
  t.eq(i.span(1), [0])
  t.eq(i.span(2), [0, 1])
  t.eq(i.span(3), [0, 1, 2])
})

t.test(function test_times() {
  t.throws(() => i.times(`10`, l.nop), TypeError, `expected variant of isNat, got "10"`)
  t.throws(() => i.times(-1, l.nop), TypeError, `expected variant of isNat, got -1`)
  t.throws(() => i.times(0, `str`), TypeError, `expected variant of isFun, got "str"`)

  t.eq(i.times(undefined, l.nop), [])
  t.eq(i.times(0, l.nop), [])

  t.eq(i.times(0, l.id), [])
  t.eq(i.times(1, l.id), [0])
  t.eq(i.times(2, l.id), [0, 1])

  t.eq(i.times(0, l.inc), [])
  t.eq(i.times(1, l.inc), [1])
  t.eq(i.times(2, l.inc), [1, 2])

  t.eq(i.times(0, l.dec), [])
  t.eq(i.times(1, l.dec), [-1])
  t.eq(i.times(2, l.dec), [-1, 0])
})

t.test(function test_repeat() {
  t.throws(() => i.repeat(`str`), TypeError, `expected variant of isNat, got "str"`)
  t.throws(() => i.repeat(-1), TypeError, `expected variant of isNat, got -1`)

  t.eq(i.repeat(), [])
  t.eq(i.repeat(0), [])
  t.eq(i.repeat(0, `val`), [])
  t.eq(i.repeat(1, `val`), [`val`])
  t.eq(i.repeat(2, `val`), [`val`, `val`])
  t.eq(i.repeat(3, `val`), [`val`, `val`, `val`])
})

t.test(function test_setFrom() {
  testFunEmptySet(i.setFrom)

  t.test(function test_same_reference() {
    function test(ref) {t.is(i.setFrom(ref), ref)}

    test(new Set())
    test(new Set([10, 20, 30]))
    test(new class SubSet extends Set {}())
    test(new class SubSet extends Set {}([10, 20, 30]))
  })

  t.test(function test_convert() {
    function test(src, exp) {t.eq(i.setFrom(src), exp)}

    testColls(
      [10, 20, 10, 30],
      {one: 10, two: 20, three: 10, four: 30},
      function testColl(make) {test(make(), new Set([10, 20, 30]))},
    )
  })
})

// Delegates to `i.setFrom`. We only need to test the copying.
t.test(function test_setCopy() {
  testFunEmptySet(i.setCopy)

  function test(src, exp) {
    const out = i.setCopy(src)
    t.isnt(src, out)
    t.eq(out, exp)
  }

  testColls(
    [10, 20, 10, 30],
    {one: 10, two: 20, three: 10, four: 30},
    function testColl(make) {test(make(), new Set([10, 20, 30]))},
  )
})

t.test(function test_mapDict() {
  testDictFunBasics(i.mapDict)

  t.eq(i.mapDict(undefined, l.id), {})
  t.eq(i.mapDict({}, l.id), {})
  t.eq(i.mapDict({one: 10, two: 20}, l.inc), {one: 11, two: 21})
})

t.test(function test_pick() {
  testDictFunBasics(i.pick)

  t.eq(i.pick(undefined,            l.True), {})
  t.eq(i.pick({},                   l.True), {})
  t.eq(i.pick({one: 10, two: 20},   l.True), {one: 10, two: 20})
  t.eq(i.pick({one: 10, two: 20},   l.False), {})
  t.eq(i.pick({one: 10, two: `20`}, l.isFin), {one: 10})
})

t.test(function test_omit() {
  testDictFunBasics(i.omit)

  t.eq(i.omit(undefined,            l.True), {})
  t.eq(i.omit({},                   l.True), {})
  t.eq(i.omit({one: 10, two: 20},   l.True), {})
  t.eq(i.omit({one: 10, two: 20},   l.False), {one: 10, two: 20})
  t.eq(i.omit({one: 10, two: `20`}, l.isFin), {two: `20`})
})

t.test(function test_pickKeys() {
  t.throws(() => i.pickKeys([]),    TypeError, `expected variant of isStruct, got []`)
  t.throws(() => i.pickKeys(`str`), TypeError, `expected variant of isStruct, got "str"`)

  t.is(Object.getPrototypeOf(i.pickKeys()), null)

  t.eq(i.pickKeys(), {})
  t.eq(i.pickKeys(undefined, []), {})
  t.eq(i.pickKeys({}, undefined), {})
  t.eq(i.pickKeys({}, []), {})

  t.eq(i.pickKeys({one: 10, two: 20, three: 30}, []), {})
  t.eq(i.pickKeys({one: 10, two: 20, three: 30}, [`one`]), {one: 10})
  t.eq(i.pickKeys({one: 10, two: 20, three: 30}, [`two`]), {two: 20})
  t.eq(i.pickKeys({one: 10, two: 20, three: 30}, [`three`]), {three: 30})
  t.eq(i.pickKeys({one: 10, two: 20, three: 30}, [`one`, `two`]), {one: 10, two: 20})
})

t.test(function test_omitKeys() {
  t.throws(() => i.omitKeys([]),    TypeError, `expected variant of isStruct, got []`)
  t.throws(() => i.omitKeys(`str`), TypeError, `expected variant of isStruct, got "str"`)

  t.is(Object.getPrototypeOf(i.omitKeys()), null)

  t.eq(i.omitKeys(), {})
  t.eq(i.omitKeys(undefined, []), {})
  t.eq(i.omitKeys({}, undefined), {})
  t.eq(i.omitKeys({}, []), {})

  t.eq(i.omitKeys({one: 10, two: 20, three: 30}, []), {one: 10, two: 20, three: 30})
  t.eq(i.omitKeys({one: 10, two: 20, three: 30}, [`one`]), {two: 20, three: 30})
  t.eq(i.omitKeys({one: 10, two: 20, three: 30}, [`two`]), {one: 10, three: 30})
  t.eq(i.omitKeys({one: 10, two: 20, three: 30}, [`three`]), {one: 10, two: 20})
  t.eq(i.omitKeys({one: 10, two: 20, three: 30}, [`one`, `two`]), {three: 30})
})

if (import.meta.main) console.log(`[test] ok!`)
