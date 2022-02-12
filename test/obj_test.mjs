import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as o from '../obj.mjs'

/* Util */

function unreachable() {throw Error(`unreachable`)}
const inherit = Object.create

/* Test */

t.test(function test_fixProto() {
  class BrokenSuper {
    constructor() {return Object.create(BrokenSuper.prototype)}
  }

  class UnfixedSub extends BrokenSuper {}

  class FixedSub extends BrokenSuper {
    constructor() {
      super()
      o.fixProto(this, new.target)
    }
  }

  t.is(Object.getPrototypeOf(new BrokenSuper()), BrokenSuper.prototype)
  t.is(Object.getPrototypeOf(new UnfixedSub()), BrokenSuper.prototype)
  t.is(Object.getPrototypeOf(new FixedSub()), FixedSub.prototype)
})

// Adapted from `github.com/mitranim/jol`.
t.test(function test_mut() {
  t.test(function test_invalid() {
    t.throws(() => o.mut(),             TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut(null, {}),     TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut(10, {}),       TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut(`one`, {}),    TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut(`one`, `one`), TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut([], {}),       TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut([], []),       TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut(l.nop, {}),    TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut(l.nop, l.nop), TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut({}, 10),       TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut({}, `one`),    TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut({}, []),       TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut({}, l.nop),    TypeError, `expected variant of isStruct`)
    t.throws(() => o.mut({}, []),       TypeError, `expected variant of isStruct`)
  })

  t.test(function test_returns_target() {
    class Mock {}
    const tar = new Mock()
    t.is(o.mut(tar, {}), tar)
  })

  t.test(function test_allow_nil() {
    class Mock {}

    function test(val) {
      const tar = new Mock()
      t.is(o.mut(tar, val), tar)
      t.eq({}, {...tar})
    }

    test(null)
    test(undefined)
  })

  t.test(function test_allow_plainest_dict() {
    class Mock {}
    const tar = new Mock()
    t.is(o.mut(tar, inherit(null, {one: {value: 10, enumerable: true}})), tar)
    t.eq({one: 10}, {...tar})
  })

  t.test(function test_allow_plain_dict() {
    class Mock {}
    const tar = new Mock()
    t.is(o.mut(tar, {one: 10}), tar)
    t.eq({one: 10}, {...tar})
  })

  t.test(function test_allow_subclass() {
    class Sup {}
    const tar = new Sup()

    class Sub extends Sup {}
    const src = Object.assign(new Sub(), {one: 10})

    t.is(o.mut(tar, src), tar)
    t.eq({one: 10}, {...tar})
  })

  t.test(function test_no_shadowing() {
    t.test(function test_plain_object() {
      const ref = {one: 10, two: 20}

      t.is(o.mut(ref, {constructor: 30, toString: 40, two: 50, three: 60}), ref)

      t.eq(Object.getOwnPropertyNames(ref), [`one`, `two`, `three`])
      t.eq(ref, {one: 10, two: 50, three: 60})

      t.is(ref.constructor, Object)
      t.is(ref.toString, Object.prototype.toString)
    })

    t.test(function test_custom_class() {
      class Mock {
        constructor() {
          this.one = 10
          this.two = 20
          Object.defineProperty(this, `three`, {
            value: 30,
            writable: true,
            enumerable: false,
            configurable: true,
          })
        }

        method() {return 40}
        get getter() {return 50}
        get getterSetter() {return 60}
        set getterSetter(_) {unreachable()}
      }

      const ref = new Mock()

      t.is(
        o.mut(ref, {
          constructor:  70,
          toString:     80,
          method:       90,
          getter:       100,
          getterSetter: 110,
          two:          120,
          three:        130,
          four:         140,
        }),
        ref,
      )

      t.eq(Object.getOwnPropertyNames(ref), [`one`, `two`, `three`, `four`])
      t.eq({...ref}, {one: 10, two: 120, four: 140})

      t.is(ref.constructor, Mock)
      t.is(ref.toString, Object.prototype.toString)
      t.is(ref.three, 30)
      t.is(ref.method(), 40)
      t.is(ref.getter, 50)
      t.is(ref.getterSetter, 60)
    })
  })
})

t.test(function test_mem() {
  t.test(function test_mem_only_ancestor() {
    const [Anc, Mid, Des] = testInitMem()
    o.memGet(Anc)

    const ref = new Des()
    t.eq(Object.keys(ref), [])

    t.is(ref.anc0, ref.anc0)
    t.eq(Object.keys(ref), [`anc0`])

    t.is(ref.anc1, ref.anc1)
    t.eq(Object.keys(ref), [`anc0`, `anc1`])

    t.isnt(ref.mid0, ref.mid0)
    t.isnt(ref.mid1, ref.mid1)

    t.isnt(ref.des0, ref.des0)
    t.isnt(ref.des1, ref.des1)

    testClearPrototype(Anc, Mid, Des)
  })

  t.test(function test_mem_only_descendant() {
    const [Anc, Mid, Des] = testInitMem()
    o.memGet(Des)

    const ref = new Des()
    t.eq(Object.keys(ref), [])

    t.isnt(ref.anc0, ref.anc0)
    t.isnt(ref.anc1, ref.anc1)

    t.isnt(ref.mid0, ref.mid0)
    t.isnt(ref.mid1, ref.mid1)

    t.is(ref.des0, ref.des0)
    t.eq(Object.keys(ref), [`des0`])

    t.is(ref.des1, ref.des1)
    t.eq(Object.keys(ref), [`des0`, `des1`])

    testClearPrototype(Anc, Mid, Des)
  })

  t.test(function test_mem_all() {
    const [Anc, Mid, Des] = testInitMem()
    o.memGet(Anc)
    o.memGet(Mid)
    o.memGet(Des)

    const ref = new Des()
    t.eq(Object.keys(ref), [])

    t.is(ref.anc0, ref.anc0)
    t.eq(Object.keys(ref), [`anc0`])

    t.is(ref.anc1, ref.anc1)
    t.eq(Object.keys(ref), [`anc0`, `anc1`])

    t.is(ref.mid0, ref.mid0)
    t.eq(Object.keys(ref), [`anc0`, `anc1`, `mid0`])

    t.is(ref.mid1, ref.mid1)
    t.eq(Object.keys(ref), [`anc0`, `anc1`, `mid0`, `mid1`])

    t.is(ref.des0, ref.des0)
    t.eq(Object.keys(ref), [`anc0`, `anc1`, `mid0`, `mid1`, `des0`])

    t.is(ref.des1, ref.des1)
    t.eq(Object.keys(ref), [`anc0`, `anc1`, `mid0`, `mid1`, `des0`, `des1`])

    testClearPrototype(Anc, Mid, Des)
  })

  t.test(function test_mem_set() {
    const [Anc, Mid, Des] = testInitMem()
    o.memGet(Anc)

    const ref = new Des()
    const manual = Symbol(`manual`)

    ref.anc0 = manual
    t.is(ref.anc0, manual)
    t.eq(Object.keys(ref), [`anc0`])

    t.is(ref.anc1, ref.anc1)
    t.eq(Object.keys(ref), [`anc0`, `anc1`])

    testClearPrototype(Anc, Mid, Des)
  })
})

function testInitMem() {
  class Anc {
    get anc0() {return Symbol(`anc0`)}
    get anc1() {return Symbol(`anc1`)}
  }

  class Mid extends Anc {
    get mid0() {return Symbol(`mid0`)}
    get mid1() {return Symbol(`mid1`)}
  }

  class Des extends Mid {
    get des0() {return Symbol(`des0`)}
    get des1() {return Symbol(`des1`)}
  }

  return [Anc, Mid, Des]
}

function testClearPrototype(...classes) {
  for (const cls of classes) {
    t.eq(Object.keys(cls.prototype), [])
  }
}

t.test(function test_mapDict() {
  testDictFunBasics(o.mapDict)

  t.eq(o.mapDict(undefined, l.id), {})
  t.eq(o.mapDict({}, l.id), {})
  t.eq(o.mapDict({one: 10, two: 20}, l.inc), {one: 11, two: 21})
})

function testDictFunBasics(fun) {
  t.throws(() => fun({}),           TypeError, `expected variant of isFun, got undefined`)
  t.throws(() => fun([], l.nop),    TypeError, `expected variant of isStruct, got []`)
  t.throws(() => fun(`str`, l.nop), TypeError, `expected variant of isStruct, got "str"`)
  t.is(Object.getPrototypeOf(fun(undefined, l.nop)), null)
}

t.test(function test_pick() {
  testDictFunBasics(o.pick)

  t.eq(o.pick(undefined,            l.True), {})
  t.eq(o.pick({},                   l.True), {})
  t.eq(o.pick({one: 10, two: 20},   l.True), {one: 10, two: 20})
  t.eq(o.pick({one: 10, two: 20},   l.False), {})
  t.eq(o.pick({one: 10, two: `20`}, l.isFin), {one: 10})
})

t.test(function test_omit() {
  testDictFunBasics(o.omit)

  t.eq(o.omit(undefined,            l.True), {})
  t.eq(o.omit({},                   l.True), {})
  t.eq(o.omit({one: 10, two: 20},   l.True), {})
  t.eq(o.omit({one: 10, two: 20},   l.False), {one: 10, two: 20})
  t.eq(o.omit({one: 10, two: `20`}, l.isFin), {two: `20`})
})

t.test(function test_pickKeys() {
  t.throws(() => o.pickKeys([]),    TypeError, `expected variant of isStruct, got []`)
  t.throws(() => o.pickKeys(`str`), TypeError, `expected variant of isStruct, got "str"`)

  t.is(Object.getPrototypeOf(o.pickKeys()), null)

  t.eq(o.pickKeys(), {})
  t.eq(o.pickKeys(undefined, []), {})
  t.eq(o.pickKeys({}, undefined), {})
  t.eq(o.pickKeys({}, []), {})

  t.eq(o.pickKeys({one: 10, two: 20, three: 30}, []), {})
  t.eq(o.pickKeys({one: 10, two: 20, three: 30}, [`one`]), {one: 10})
  t.eq(o.pickKeys({one: 10, two: 20, three: 30}, [`two`]), {two: 20})
  t.eq(o.pickKeys({one: 10, two: 20, three: 30}, [`three`]), {three: 30})
  t.eq(o.pickKeys({one: 10, two: 20, three: 30}, [`one`, `two`]), {one: 10, two: 20})
})

t.test(function test_omitKeys() {
  t.throws(() => o.omitKeys([]),    TypeError, `expected variant of isStruct, got []`)
  t.throws(() => o.omitKeys(`str`), TypeError, `expected variant of isStruct, got "str"`)

  t.is(Object.getPrototypeOf(o.omitKeys()), null)

  t.eq(o.omitKeys(), {})
  t.eq(o.omitKeys(undefined, []), {})
  t.eq(o.omitKeys({}, undefined), {})
  t.eq(o.omitKeys({}, []), {})

  t.eq(o.omitKeys({one: 10, two: 20, three: 30}, []), {one: 10, two: 20, three: 30})
  t.eq(o.omitKeys({one: 10, two: 20, three: 30}, [`one`]), {two: 20, three: 30})
  t.eq(o.omitKeys({one: 10, two: 20, three: 30}, [`two`]), {one: 10, three: 30})
  t.eq(o.omitKeys({one: 10, two: 20, three: 30}, [`three`]), {one: 10, two: 20})
  t.eq(o.omitKeys({one: 10, two: 20, three: 30}, [`one`, `two`]), {three: 30})
})

if (import.meta.main) console.log(`[test] ok!`)
