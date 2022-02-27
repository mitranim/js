import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as o from '../obj.mjs'

/* Util */

function unreachable() {throw Error(`unreachable`)}

const inherit = Object.create

class Simple {}

class Fat {
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

/*
May revise and move to `test.mjs`.
A lot of our class tests want something similar.
*/
function testStructure(ref, cls, exp) {
  t.ok(ref instanceof cls)
  t.is(ref.constructor, cls)
  t.is(Object.getPrototypeOf(ref), cls.prototype)
  t.own(ref, exp)
}

/* Test */

t.test(function test_assign() {
  testMut(o.assign)

  function mutate(tar, src) {t.is(o.assign(tar, src), tar)}

  t.test(function test_shadowing() {
    t.test(function test_getters_and_setters() {
      t.throws(() => o.assign(new Fat(), {getter: 10}), TypeError, `Cannot set property getter of #<Fat> which has only a getter`)
      t.throws(() => o.assign(new Fat(), {getterSetter: 10}), Error, `unreachable`)
    })

    const tar = new Fat()

    const src = {
      constructor: 70,
      toString: 80,
      method: 90,
      two: 100,
      three: 110,
      four: 120,
    }

    mutate(tar, src)

    t.eq(
      Object.getOwnPropertyNames(tar),
      [...new Set([
        ...Object.getOwnPropertyNames(new Fat()),
        ...Object.keys(src),
      ])],
    )

    // This doesn't include `.three` which is non-enumerable.
    t.eq({...tar}, {
      ...new Fat(),
      constructor: 70,
      toString: 80,
      method: 90,
      two: 100,
      four: 120,
    })

    // Has to be checked separately because non-enumerable.
    t.is(tar.three, src.three)
  })
})

// Commonalities between `assign` and `patch`.
function testMut(fun) {
  t.test(function test_invalid() {
    t.throws(() => fun(),             TypeError, `expected variant of isStruct`)
    t.throws(() => fun(null, {}),     TypeError, `expected variant of isStruct`)
    t.throws(() => fun(10, {}),       TypeError, `expected variant of isStruct`)
    t.throws(() => fun(`one`, {}),    TypeError, `expected variant of isStruct`)
    t.throws(() => fun(`one`, `one`), TypeError, `expected variant of isStruct`)
    t.throws(() => fun([], {}),       TypeError, `expected variant of isStruct`)
    t.throws(() => fun([], []),       TypeError, `expected variant of isStruct`)
    t.throws(() => fun(l.nop, {}),    TypeError, `expected variant of isStruct`)
    t.throws(() => fun(l.nop, l.nop), TypeError, `expected variant of isStruct`)
    t.throws(() => fun({}, 10),       TypeError, `expected variant of isStruct`)
    t.throws(() => fun({}, `one`),    TypeError, `expected variant of isStruct`)
    t.throws(() => fun({}, []),       TypeError, `expected variant of isStruct`)
    t.throws(() => fun({}, l.nop),    TypeError, `expected variant of isStruct`)
    t.throws(() => fun({}, []),       TypeError, `expected variant of isStruct`)
  })

  function mutate(tar, src) {t.is(fun(tar, src), tar)}

  t.test(function test_returns_target() {
    mutate({})
    mutate({}, {})
    mutate(new class Simple {}(), {})
  })

  t.test(function test_from_nil() {
    function test(val) {
      const tar = new Simple()
      mutate(tar, val)
      t.eq({...tar}, {...val})
    }

    test(null)
    test(undefined)
  })

  t.test(function test_from_npo() {
    const tar = new Simple()
    mutate(tar, inherit(null, {one: {value: 10, enumerable: true}}))
    t.eq({...tar}, {one: 10})
  })

  t.test(function test_from_dict() {
    const tar = new Simple()
    mutate(tar, {one: 10})
    t.eq({...tar}, {one: 10})
  })

  t.test(function test_from_subclass() {
    class Sup {}
    const tar = new Sup()

    class Sub extends Sup {}
    const src = Object.assign(new Sub(), {one: 10})

    mutate(tar, src)
    t.eq({...tar}, {one: 10})
  })
}

t.test(function test_patch() {
  testMut(o.patch)

  function mutate(tar, src) {t.is(o.patch(tar, src), tar)}

  t.test(function test_no_shadowing() {
    t.test(function test_plain_object() {
      const tar = {one: 10, two: 20}

      mutate(tar, {constructor: 30, toString: 40, two: 50, three: 60})

      t.eq(Object.getOwnPropertyNames(tar), [`one`, `two`, `three`])
      t.eq(tar, {one: 10, two: 50, three: 60})

      t.is(tar.constructor, Object)
      t.is(tar.toString, Object.prototype.toString)
    })

    t.test(function test_custom_class() {
      const tar = new Fat()

      mutate(tar, {
        constructor:  70,
        toString:     80,
        method:       90,
        getter:       100,
        getterSetter: 110,
        two:          120,
        three:        130,
        four:         140,
      })

      t.eq(Object.getOwnPropertyNames(tar), [`one`, `two`, `three`, `four`])
      t.eq({...tar}, {one: 10, two: 120, four: 140})

      t.is(tar.constructor, Fat)
      t.is(tar.toString, Object.prototype.toString)
      t.is(tar.three, 30)
      t.is(tar.method(), 40)
      t.is(tar.getter, 50)
      t.is(tar.getterSetter, 60)
    })
  })
})

t.test(function test_Dict() {
  t.throws(() => o.Dict(), TypeError, `cannot be invoked without 'new'`)
  t.throws(() => new o.Dict(10), TypeError, `expected variant of isStruct, got 10`)

  t.test(function test_constructor() {
    function test(src, exp) {
      testStructure(new o.Dict(src), o.Dict, exp)
    }

    test(undefined, {})

    test({one: 10}, {one: 10})

    test({one: 10, two: 20}, {one: 10, two: 20})

    test(
      {one: 10, two: 20, toString: 30},
      {one: 10, two: 20, toString: 30},
    )

    test(
      {[Symbol.for(`one`)]: 10, constructor: 20, mut: 30, [Symbol.toStringTag]: 40},
      {[Symbol.for(`one`)]: 10},
    )
  })

  t.test(function test_mut() {
    t.throws(() => new o.Dict().mut(10), TypeError, `expected variant of isStruct, got 10`)

    function test(src, inp, exp) {
      const tar = new o.Dict(src)
      t.is(tar.mut(inp), tar)
      testStructure(tar, o.Dict, exp)
    }

    test(undefined, undefined, {})
    test(undefined, {one: 10}, {one: 10})
    test({one: 10}, undefined, {one: 10})
    test({one: 10}, {two: 20}, {one: 10, two: 20})
    test({one: 10}, {one: 30, two: 20}, {one: 30, two: 20})

    test(undefined, {mut: 10}, {})
    test({one: 10}, {mut: 20}, {one: 10})
  })
})

t.test(function test_memGet() {
  t.test(function test_only_ancestor() {
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

  t.test(function test_only_descendant() {
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

  t.test(function test_all() {
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

  t.test(function test_set() {
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

t.test(function test_ClsFunPh() {
  class Cls {constructor(...val) {this.val = val}}

  t.throws(() => Cls(), TypeError, `Class constructor Cls cannot be invoked without 'new'`)

  const cls = o.ClsFunPh.of(Cls)

  function test(ref) {
    t.inst(ref, Cls)
    t.own(ref, {val: [10, 20, 30]})
  }

  test(new Cls(10, 20, 30))
  test(new cls(10, 20, 30))
  test(cls(10, 20, 30))
})

t.test(function test_ClsInstPh() {
  class Cls {
    constructor(val) {this.val = val}
    set(val) {return this.val = val, this}
  }

  t.throws(() => Cls(), TypeError, `Class constructor Cls cannot be invoked without 'new'`)
  t.throws(() => Cls.set(), TypeError, `Cls.set is not a function`)

  const cls = o.ClsInstPh.of(Cls)

  function test(ref) {
    t.inst(ref, Cls)
    t.own(ref, {val: 20})
  }

  test(new Cls(20))
  test(new Cls(10).set(20))
  test(new cls(20))
  test(new cls(10).set(20))
  test(cls(20))
  test(cls(10).set(20))
  test(cls.set(20))
  test(cls.set(10).set(20))
})

if (import.meta.main) console.log(`[test] ok!`)
