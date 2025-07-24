// deno-lint-ignore-file getter-return

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

class One extends l.Emp {
  constructor(val) {super().val = val}
  mut(val) {this.val = val}
}

class Two extends l.Emp {
  constructor(val) {super().val = val}
  mut(val) {this.val = val}
}

/* Test */

t.test(function test_assign() {
  testMut(o.assign)

  function mutate(tar, src) {t.is(o.assign(tar, src), tar)}

  t.test(function test_shadowing() {
    t.test(function test_getters_and_setters() {
      {
        const msg = globalThis.Bun ? `assign to readonly property` : `Cannot set property getter of #<Fat> which has only a getter`
        t.throws(() => o.assign(new Fat(), {getter: 10}), TypeError, msg)
      }
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
    t.throws(() => fun(),             TypeError, `expected variant of isRec`)
    t.throws(() => fun(null, {}),     TypeError, `expected variant of isRec`)
    t.throws(() => fun(10, {}),       TypeError, `expected variant of isRec`)
    t.throws(() => fun(`one`, {}),    TypeError, `expected variant of isRec`)
    t.throws(() => fun(`one`, `one`), TypeError, `expected variant of isRec`)
    t.throws(() => fun([], {}),       TypeError, `expected variant of isRec`)
    t.throws(() => fun([], []),       TypeError, `expected variant of isRec`)
    t.throws(() => fun(l.nop, {}),    TypeError, `expected variant of isRec`)
    t.throws(() => fun(l.nop, l.nop), TypeError, `expected variant of isRec`)
    t.throws(() => fun({}, 10),       TypeError, `expected variant of isRec`)
    t.throws(() => fun({}, `one`),    TypeError, `expected variant of isRec`)
    t.throws(() => fun({}, []),       TypeError, `expected variant of isRec`)
    t.throws(() => fun({}, l.nop),    TypeError, `expected variant of isRec`)
    t.throws(() => fun({}, []),       TypeError, `expected variant of isRec`)
  })

  function mutate(tar, ...src) {t.is(fun(tar, ...src), tar)}

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

  t.test(function test_variadic() {
    let tar = l.Emp()
    mutate(tar, {one: 10}, {two: 20})
    t.eq({...tar}, {one: 10, two: 20})

    tar = l.Emp()
    mutate(tar, {one: 10}, {two: 20}, {three: 30})
    t.eq({...tar}, {one: 10, two: 20, three: 30})
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

t.test(function test_Mixin() {
  t.test(function test_nop() {
    class TestMixin extends o.Mixin {static make(src) {return src}}

    t.is(TestMixin.get(l.Emp), l.Emp)
    t.is(TestMixin.get(l.Emp), l.Emp)
    t.is(TestMixin.get(l.Emp), l.Emp)
  })

  t.test(function test_level_one() {
    class TestMixin extends o.Mixin {
      static make(src) {return class Test extends src {get() {return 10}}}
    }

    const Cls = TestMixin.get(l.Emp)
    t.isnt(Cls, l.Emp)
    l.reqSubCls(Cls, l.Emp)

    t.is(TestMixin.get(l.Emp), Cls)
    t.is(TestMixin.get(l.Emp), Cls)
    t.is(TestMixin.get(l.Emp), Cls)

    // Deduplication: mixin only occurs once in the prototype chain.
    t.is(TestMixin.get(Cls), Cls)
    t.is(TestMixin.get(Cls), Cls)
    t.is(TestMixin.get(Cls), Cls)

    t.is(new Cls().get(), 10)
  })

  t.test(function test_level_two() {
    class TestMixin0 extends o.Mixin {
      static make(src) {return class Test0 extends src {get() {return 10}}}
    }

    class TestMixin1 extends o.Mixin {
      static make(src) {return class Test1 extends src {get() {return 20}}}
    }

    const Cls0 = TestMixin0.get(l.Emp)
    t.isnt(Cls0, l.Emp)
    l.reqSubCls(Cls0, l.Emp)

    t.is(TestMixin0.get(l.Emp), Cls0)
    t.is(TestMixin0.get(l.Emp), Cls0)
    t.is(TestMixin0.get(l.Emp), Cls0)

    const val0 = new Cls0()
    t.inst(val0, Cls0)
    t.is(val0.get(), 10)

    const Cls1 = TestMixin1.get(Cls0)
    t.isnt(Cls1, l.Emp)
    t.isnt(Cls1, Cls0)
    l.reqSubCls(Cls1, Cls0)

    t.is(TestMixin1.get(Cls0), Cls1)
    t.is(TestMixin1.get(Cls0), Cls1)
    t.is(TestMixin1.get(Cls0), Cls1)

    // Deduplication: mixin only occurs once in the prototype chain.
    t.is(TestMixin1.get(Cls1), Cls1)
    t.is(TestMixin1.get(Cls1), Cls1)
    t.is(TestMixin1.get(Cls1), Cls1)

    const val1 = new Cls1()
    t.inst(val1, Cls1)
    t.is(val1.get(), 20)

    class Cls2 extends Cls0 {}

    // Deduplication: mixin only occurs once in the prototype chain.
    t.is(TestMixin0.get(Cls2), Cls2)
    t.is(TestMixin0.get(Cls2), Cls2)
    t.is(TestMixin0.get(Cls2), Cls2)

    class Cls3 extends Cls1 {}

    // Deduplication: mixin only occurs once in the prototype chain.
    t.is(TestMixin0.get(Cls3), Cls3)
    t.is(TestMixin0.get(Cls3), Cls3)
    t.is(TestMixin0.get(Cls3), Cls3)

    // Deduplication: mixin only occurs once in the prototype chain.
    t.is(TestMixin1.get(Cls3), Cls3)
    t.is(TestMixin1.get(Cls3), Cls3)
    t.is(TestMixin1.get(Cls3), Cls3)
  })
})

// Actual spec behavior is tested below.
t.test(function test_MixStruct() {
  testMixStructSubclassing(o.MixStruct, o.StructSpec)
})

// Actual spec behavior is tested below.
t.test(function test_MixStructLax() {
  testMixStructSubclassing(o.MixStructLax, o.StructSpecLax)
})

function testMixStructSubclassing(Mix, Spec) {
  const Cls = Mix(l.Emp)

  t.isnt(Cls, l.Emp)
  l.reqCls(Cls)
  l.reqSubCls(Cls, l.Emp)

  l.reqNpo(Cls.prototype)

  t.is(Mix(l.Emp), Cls)
  t.is(Mix(l.Emp), Cls)
  t.is(Mix(l.Emp), Cls)

  const spec0 = o.structSpec(Cls)
  t.inst(spec0, Spec)

  t.is(o.structSpec(Cls), spec0)
  t.is(o.structSpec(Cls), spec0)
  t.is(o.structSpec(new Cls()), spec0)
  t.is(o.structSpec(new Cls()), spec0)

  t.is(Cls[o.SPEC], spec0)

  class Sub extends Cls {}

  const spec1 = o.structSpec(Sub)
  t.inst(spec1, Spec)
  t.isnt(spec1, spec0)

  t.is(o.structSpec(Sub), spec1)
  t.is(o.structSpec(Sub), spec1)
  t.is(o.structSpec(new Sub()), spec1)
  t.is(o.structSpec(new Sub()), spec1)

  t.is(Sub[o.SPEC], spec1)
  t.is(Cls[o.SPEC], spec0)
}

t.test(function test_struct_specs() {
  t.test(function test_invalid() {
    function fail(Spec, val) {
      function failing() {
        class Cls extends l.Emp {static spec = {one: val}}
        l.nop(new Spec(Cls))
      }

      t.throws(
        failing,
        TypeError,
        `invalid definition of "one" in [function Cls {spec: {one: ${l.show(val)}}}]: expected nil or function, got ` + l.show(val),
      )
    }

    function fails(Spec) {
      fail(Spec, 10)
      fail(Spec, `str`)
      fail(Spec, true)
      fail(Spec, {one: 10})
      fail(Spec, [10])
    }

    fails(o.StructSpec)
    fails(o.StructSpecLax)
  })

  class Cls extends l.Emp {
    static spec = {
      id: l.reqIntPos,
      name: l.reqStr,
    }
  }

  function testSpec(spec) {
    t.is(spec.cls, Cls)

    t.eq(spec.list, [
      new o.FieldSpec(`id`, l.reqIntPos),
      new o.FieldSpec(`name`, l.reqStr),
    ])

    t.eq(spec.dict, {
      id: new o.FieldSpec(`id`, l.reqIntPos),
      name: new o.FieldSpec(`name`, l.reqStr),
    })
  }

  function testSpecValidate(Spec) {
    class Sub extends Cls {
      static validate(tar) {
        if (l.isValidStr(tar.name)) return
        throw TypeError(`missing name`)
      }
    }

    const spec = new Spec(Sub)

    {
      const tar = l.Emp()
      t.is(spec.construct(tar, {id: 10, name: `one`}), tar)
      t.own(tar, {id: 10, name: `one`})
      Sub.validate(tar)
      spec.validate(tar)
    }

    {
      const tar = l.Emp()
      t.throws(
        () => spec.construct(tar, {id: 10, name: ``}),
        TypeError,
        `missing name`,
      )
      t.own(tar, {id: 10, name: ``})

      t.throws(() => spec.validate(tar), TypeError, `missing name`)
      t.own(tar, {id: 10, name: ``})

      t.throws(() => Sub.validate(tar), TypeError, `missing name`)
      t.own(tar, {id: 10, name: ``})
    }
  }

  t.test(function test_StructSpec() {
    const Spec = o.StructSpec
    const spec = new Spec(Cls)
    testSpec(spec)

    t.test(function test_construct() {
      testSpecConstruct(spec)

      const tar = l.Emp()
      t.is(spec.construct(tar, {id: 20, name: `two`, three: `four`}), tar)
      t.own(tar, {id: 20, name: `two`})
    })

    t.test(function test_mut() {
      testSpecMut(spec)

      const tar = l.Emp()
      t.is(spec.mut(tar, {three: `four`}), tar)
      t.own(tar, {})

      spec.construct(tar, {id: 20, name: `two`})
      t.is(spec.mut(tar, {three: `four`}), tar)
      t.own(tar, {id: 20, name: `two`})
    })

    testSpecValidate(Spec)
  })

  t.test(function test_StructSpecLax() {
    const Spec = o.StructSpecLax
    const spec = new Spec(Cls)
    testSpec(spec)

    t.test(function test_construct() {
      testSpecConstruct(spec)

      const tar = l.Emp()
      t.is(spec.construct(tar, {id: 20, name: `two`, three: `four`}), tar)
      t.own(tar, {id: 20, name: `two`, three: `four`})
    })

    t.test(function test_mut() {
      testSpecMut(spec)

      const tar = l.Emp()
      t.is(spec.mut(tar, {one: `two`}), tar)
      t.own(tar, {one: `two`})

      t.is(spec.mut(tar, {one: `three`, two: `four`}), tar)
      t.own(tar, {one: `three`, two: `four`})
    })

    t.test(function test_with_any() {
      class Sub extends Cls {static any(val, key) {return [val, key]}}
      const spec = new Spec(Sub)

      const tar = l.Emp()
      spec.construct(tar, {id: 10, name: `one`, two: `three`})
      t.own(tar, {id: 10, name: `one`, two: [`three`, `two`]})
    })

    testSpecValidate(Spec)
  })

  t.test(function test_field_mut() {
    testSpecFieldMut(o.StructSpec)
    testSpecFieldMut(o.StructSpecLax)
  })

  t.test(function test_field_mut_implicit() {
    testSpecFieldMutImplicit(o.StructSpec)
    testSpecFieldMutImplicit(o.StructSpecLax)
  })

  t.test(function test_field_collision() {
    testSpecFieldCollision(o.StructSpec)
    testSpecFieldCollision(o.StructSpecLax)
  })
})

function testSpecConstruct(spec) {
  function fail(src, msg) {
    const tar = l.Emp()
    t.throws(() => spec.construct(tar, src), TypeError, msg)
  }

  fail(undefined, `invalid property "id": expected variant of isIntPos, got undefined`)
  fail(10, `expected variant of isRec, got 10`)
  fail({id: -10}, `invalid property "id": expected variant of isIntPos, got -10`)
  fail({id: 10}, `invalid property "name": expected variant of isStr, got undefined`)
  fail({id: 10, name: 20}, `invalid property "name": expected variant of isStr, got 20`)
  fail({id: -10, name: `one`}, `invalid property "id": expected variant of isIntPos, got -10`)

  const tar = l.Emp()
  t.is(spec.construct(tar, {id: 10, name: `one`}), tar)
  t.own(tar, {id: 10, name: `one`})
}

function testSpecMut(spec) {
  const tar = l.Emp()

  t.is(spec.mut(tar), tar)
  t.own(tar, {})

  t.throws(
    () => spec.mut(tar, {id: `one`}),
    TypeError,
    `invalid property "id": expected variant of isIntPos, got "one"`,
  )
  t.own(tar, {})

  t.throws(
    () => spec.mut(tar, {name: 10}),
    TypeError,
    `invalid property "name": expected variant of isStr, got 10`,
  )
  t.own(tar, {})

  t.is(spec.mut(tar, {id: 10}), tar)
  t.own(tar, {id: 10})

  t.is(spec.mut(tar, {name: `one`}), tar)
  t.own(tar, {id: 10, name: `one`})

  t.is(spec.mut(tar, {id: 20}), tar)
  t.own(tar, {id: 20, name: `one`})

  t.is(spec.mut(tar, {name: `two`}), tar)
  t.own(tar, {id: 20, name: `two`})
}

function testSpecFieldMut(Spec) {
  class Cls extends l.Emp {
    static spec = {
      one: val => l.toInst(val, One),
      two: val => l.toInst(val, Two),
    }
  }

  const spec = new Spec(Cls)
  const tar = l.Emp()

  spec.construct(tar, {one: 10, two: 20})
  t.eq(tar, {one: new One(10), two: new Two(20)})

  const one = tar.one
  const two = tar.two

  spec.construct(tar, {one: 30, two: 40})
  t.eq(tar, {one: new One(30), two: new Two(40)})

  t.is(tar.one, one)
  t.is(tar.two, two)

  spec.mut(tar, {one: 50})
  t.eq(tar, {one: new One(50), two: new Two(40)})
  t.is(tar.one, one)
  t.is(tar.two, two)

  spec.mut(tar, {two: 60})
  t.eq(tar, {one: new One(50), two: new Two(60)})
  t.is(tar.one, one)
  t.is(tar.two, two)

  if (!l.isSubCls(Spec, o.StructSpecLax)) return

  t.test(function test_field_mut_undeclared() {
    class Cls extends l.Emp {
      static spec = {one: val => l.toInst(val, One)}
      static any(val) {return l.toInst(val, Two)}
    }

    const spec = new Spec(Cls)
    const tar = l.Emp()

    spec.mut(tar, {one: 10, two: 20})
    t.eq(tar, {one: new One(10), two: new Two(20)})

    const {one, two} = tar

    spec.mut(tar, {one: 30, two: 40, three: 50})
    t.eq(tar, {one: new One(30), two: new Two(40), three: new Two(50)})

    t.is(tar.one, one)
    t.is(tar.two, two)
  })
}

function testSpecFieldMutImplicit(Spec) {
  class Cls extends o.MixStruct(l.Emp) {
    static get Spec() {return Spec}

    static spec = {
      one: val => l.toInst(val, StructOne),
      two: val => l.toInst(val, StructTwo),
    }
  }

  class StructOne extends o.MixStruct(l.Emp) {
    static spec = {val: l.reqIntPos}
  }

  class StructTwo extends o.MixStructLax(l.Emp) {
    static spec = {val: l.reqIntPos}
  }

  const tar = new Cls({one: {val: 10}, two: {val: 20}})

  const {one, two} = tar
  t.inst(one, StructOne)
  t.inst(two, StructTwo)

  o.structMut(tar, {one: {val: 30}})

  t.own(tar, {one: new StructOne({val: 30}), two: new StructTwo({val: 20})})

  t.eq(one, new StructOne({val: 30}))
  t.eq(two, new StructTwo({val: 20}))

  t.is(tar.one, one)
  t.is(tar.two, two)
}

function testSpecFieldCollision(Spec) {
  class One extends l.Emp {
    static spec = {one: l.reqIntPos}
    one() {return `three`}
  }

  t.throws(
    () => new Spec(One),
    TypeError,
    `property collision on "one" in [function One {spec: {one: [function reqIntPos]}}]`,
  )

  class Two extends One {}

  t.throws(
    () => new Spec(Two),
    TypeError,
    `property collision on "one" in [function Two]`,
  )

  class Three extends One {static spec = super.spec}

  t.throws(
    () => new Spec(Three),
    TypeError,
    `property collision on "one" in [function Three {spec: {one: [function reqIntPos]}}]`,
  )

  class Four extends One {static spec = {
    one: undefined,
    two: l.reqIntPos,
  }}

  const spec = new Spec(Four)
  t.eq(spec.list, [new o.FieldSpec(`two`, l.reqIntPos)])

  const val = new Four({two: 10})
  t.is(val.one(), `three`)

  class Five extends l.Emp {
    static spec = {one: l.reqIntPos}
    get one() {}
  }

  t.throws(
    () => new Spec(Five),
    TypeError,
    `property collision on "one" in [function Five {spec: {one: [function reqIntPos]}}]`,
  )

  class Six extends l.Emp {
    static spec = {one: l.reqIntPos}
    set one(_) {}
  }

  t.throws(
    () => new Spec(Six),
    TypeError,
    `property collision on "one" in [function Six {spec: {one: [function reqIntPos]}}]`,
  )
}

t.test(function test_StructSpecLax_with_mem_getter() {
  class Cls extends o.MixStructLax(l.Emp) {
    static spec = {three: l.reqInt}
    static {o.memGet(this)}
    get one() {return new One()}
    get two() {return new Two()}
  }

  t.test(function test_construct() {
    t.own(new Cls({three: 10}), {three: 10})
    t.own(new Cls({three: 10, one: 20}), {three: 10, one: new One(20)})
    t.own(new Cls({three: 10, one: 20, two: 30}), {three: 10, one: new One(20), two: new Two(30)})
  })

  t.test(function test_mut() {
    const tar = new Cls({three: 10})
    t.own(tar, {three: 10})

    o.structMut(tar, {one: 20})
    t.own(tar, {three: 10, one: new One(20)})

    const {one} = tar
    o.structMut(tar, {one: 30})
    t.own(tar, {three: 10, one: new One(30)})
    t.is(tar.one, one)

    const {two} = tar
    o.structMut(tar, {two: 40})
    t.own(tar, {three: 10, one: new One(30), two: new Two(40)})
    t.is(tar.one, one)
    t.is(tar.two, two)
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
  for (const Cls of classes) {
    t.eq(Object.keys(Cls.prototype), [])
  }
}

t.test(function test_MixMain() {
  class Super extends o.MixMain(l.Emp) {}
  class Sub extends Super {}

  t.inst(Super.main, Super)
  t.is(Super.main, Super.main)

  t.inst(Sub.main, Sub)
  t.is(Sub.main, Sub.main)
  t.isnt(Sub.main, Super.main)
})

if (import.meta.main) console.log(`[test] ok!`)
