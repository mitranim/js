import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as a from '../arr.mjs'

/*
The test is incomplete because `arr.mjs` is unused, undocumented, and probably
not recommended.
*/

t.test(function test_Arr_reverse() {
  t.test(function test_native() {testReverse(Array)})
  t.test(function test_custom() {testReverse(a.Arr)})
})

function testReverse(cls) {
  function test(...src) {
    const exp = src.slice().reverse()

    const tar = cls.from(src)
    t.eq([...tar], src)

    t.is(tar.reverse(), tar)
    t.eq([...tar], exp)

    t.is(tar.reverse(), tar)
    t.eq([...tar], src)
  }

  test()
  test(10)
  test(10, 20)
  test(10, 20, 30)
  test(10, 20, 30, 40)
  test(10, 20, 30, 40, 50)
  test(10, NaN, 30, 40, 50)
  test(10, 20, 30, NaN, 50)
  test(10, 20, NaN, 40, 50)
}

t.test(function test_Arr_unshift() {
  t.test(function test_native() {testUnshift(Array)})
  t.test(function test_custom() {testUnshift(a.Arr)})
})

function testUnshift(cls) {
  function test(src, inc, exp) {
    const tar = cls.from(src)
    t.eq([...tar], src)

    const len = tar.unshift(...inc)

    t.eq([...tar], exp)
    t.is(len, tar.length)
  }

  test([], [], [])
  test([], [10], [10])
  test([], [10, 20], [10, 20])
  test([], [10, 20, 30], [10, 20, 30])
  test([10], [], [10])
  test([10, 20], [], [10, 20])
  test([10, 20, 30], [], [10, 20, 30])
  test([20, 30], [10], [10, 20, 30])
  test([30], [10, 20], [10, 20, 30])
  test([30, 40], [10, 20], [10, 20, 30, 40])
  test([40], [10, 20, 30], [10, 20, 30, 40])
  test([40, 50], [10, 20, 30], [10, 20, 30, 40, 50])
  test([30, 40, 50], [10, 20], [10, 20, 30, 40, 50])
  test([20, 30, 40, 50], [10], [10, 20, 30, 40, 50])
  test([10, 20, 30, 40, 50], [], [10, 20, 30, 40, 50])
}

if (import.meta.main) console.log(`[test] ok!`)
