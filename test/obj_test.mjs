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

t.test(function test_Struct() {
  t.test(function test_untyped() {
    class Cls extends o.Struct {}

    t.test(function test_no_shadowing() {
      t.own(new Cls({one: 10, constructor: 20, mut: 30}), {one: 10})
    })

    t.test(function test_unknown() {
      t.own(new Cls(), {})
      t.own(new Cls({id: 10}), {id: 10})
      t.own(new Cls({name: `Mira`}), {name: `Mira`})
      t.own(new Cls({id: 10, name: `Mira`}), {id: 10, name: `Mira`})
    })
  })

  t.test(function test_typed() {
    class Person extends o.Struct {
      static strict = true

      static fields = {
        ...super.fields,
        id: l.reqFin,
        name: l.reqStr,
      }
    }

    // TODO test error causes, which is currently not supported by `test.mjs`.
    t.test(function test_missing_or_invalid() {
      t.throws(() => new Person(), TypeError, `invalid field "id"`)
      t.throws(() => new Person({id: `one`, name: `two`}), TypeError, `invalid field "id"`)
      t.throws(() => new Person({id: 10, name: 20}), TypeError, `invalid field "name"`)
    })

    t.test(function test_valid() {
      t.own(new Person({id: 10, name: `Mira`}), {id: 10, name: `Mira`})
      t.own(new Person({id: 10, name: `Mira`, one: `two`}), {id: 10, name: `Mira`, one: `two`})
    })

    t.test(function test_no_shadowing() {
      t.own(new Person({id: 10, name: `Mira`, constructor: 10, mut: 20}), {id: 10, name: `Mira`})
    })

    t.test(function test_mut() {
      const tar = new Person({id: 10, name: `Mira`})
      t.own(tar, {id: 10, name: `Mira`})

      t.throws(() => tar.mut({id: `str`}), TypeError, `invalid field "id"`)
      t.own(tar, {id: 10, name: `Mira`})

      t.throws(() => tar.mut({name: 20}), TypeError, `invalid field "name"`)
      t.own(tar, {id: 10, name: `Mira`})

      tar.mut()
      t.own(tar, {id: 10, name: `Mira`})

      tar.mut({})
      t.own(tar, {id: 10, name: `Mira`})

      tar.mut({id: 20})
      t.own(tar, {id: 20, name: `Mira`})

      tar.mut({name: `Kara`})
      t.own(tar, {id: 20, name: `Kara`})
    })
  })

  t.test(function test_inheritance() {
    t.test(function test_define_then_instantiate() {
      class One extends o.Struct {
        static fields = {...super.fields, one: l.reqFin}
      }

      class Two extends One {
        static fields = {...super.fields, two: l.reqStr}
      }

      t.throws(() => new One({one: `10`}), TypeError, `invalid field "one"`)
      t.own(new One({one: 10, two: 20}), {one: 10, two: 20})

      t.throws(() => new Two({one: 10, two: 20}), TypeError, `invalid field "two"`)
      t.own(new Two({one: 10, two: `20`}), {one: 10, two: `20`})

      t.eq(One.type, new o.StructType(One, One.fields))
      t.eq(Two.type, new o.StructType(Two, Two.fields))
    })

    t.test(function test_instantiate_then_define() {
      class One extends o.Struct {
        static fields = {...super.fields, one: l.reqFin}
      }

      t.throws(() => new One({one: `10`}), TypeError, `invalid field "one"`)
      t.own(new One({one: 10, two: 20}), {one: 10, two: 20})

      class Two extends One {
        static fields = {...super.fields, two: l.reqStr}
      }

      t.throws(() => new Two({one: 10, two: 20}), TypeError, `invalid field "two"`)
      t.own(new Two({one: 10, two: `20`}), {one: 10, two: `20`})

      t.eq(One.type, new o.StructType(One, One.fields))
      t.eq(Two.type, new o.StructType(Two, Two.fields))
    })
  })

  t.test(function test_recursive_mut() {
    t.test(function test_untyped() {
      class Inner extends o.Struct {}
      class Middle extends o.Struct {}
      class Outer extends o.Struct {}

      const inner = new Inner({one: 10})
      const middle = new Middle({two: 20, inner})
      const outer = new Outer({three: 30, middle})

      t.is(outer.middle, middle)
      t.is(middle.inner, inner)
      t.eq(inner, new Inner({one: 10}))
      t.eq(middle, new Middle({two: 20, inner}))
      t.eq(outer, new Outer({three: 30, middle}))

      outer.mut({
        three: 40,
        middle: {two: 50, inner: {one: 60, four: 70}},
        five: {six: 80},
      })

      t.is(outer.middle, middle)
      t.is(middle.inner, inner)
      t.eq(inner, new Inner({one: 60, four: 70}))
      t.eq(middle, new Middle({two: 50, inner: new Inner({one: 60, four: 70})}))

      t.eq(outer, new Outer({
        three: 40,
        middle: new Middle({two: 50, inner: new Inner({one: 60, four: 70})}),
        five: {six: 80},
      }))
    })

    t.test(function test_typed() {
      class Inner extends o.Struct {
        static fields = {
          ...super.fields,
          one: l.reqFin,
        }
      }

      class Middle extends o.Struct {
        static fields = {
          ...super.fields,
          two: l.reqFin,
          inner(val) {return l.toInstOpt(val, Inner)},
        }
      }

      class Outer extends o.Struct {
        static fields = {
          ...super.fields,
          three: l.reqFin,
          middle(val) {return l.toInstOpt(val, Middle)},
        }
      }

      const outer = new Outer({three: 30, middle: {two: 20, inner: {one: 10}}})
      const middle = outer.middle
      const inner = middle.inner

      t.eq(inner, new Inner({one: 10}))
      t.eq(middle, new Middle({two: 20, inner}))
      t.eq(outer, new Outer({three: 30, middle}))

      outer.mut({
        three: 40,
        middle: {two: 50, inner: {one: 60, four: 70}},
        five: {six: 80},
      })

      t.is(outer.middle, middle)
      t.is(middle.inner, inner)
      t.eq(inner, new Inner({one: 60, four: 70}))
      t.eq(middle, new Middle({two: 50, inner: new Inner({one: 60, four: 70})}))

      t.eq(outer, new Outer({
        three: 40,
        middle: new Middle({two: 50, inner: new Inner({one: 60, four: 70})}),
        five: {six: 80},
      }))
    })
  })

  t.test(function test_with_mem_getter() {
    class Inner extends o.Struct {}

    class Outer extends o.Struct {
      static {o.memGet(this)}
      get inner() {return new Inner()}
    }

    function testWithMemGetter(make) {
      const outer = make()
      const inner = outer.inner

      t.inst(inner, Inner)
      t.eq({...inner}, {two: 20})

      t.inst(outer, Outer)
      t.eq({...outer}, {one: 10, inner})

      outer.mut({inner: {two: 30}})

      t.is(outer.inner, inner)
      t.eq(inner, new Inner({two: 30}))
    }

    t.test(function test_constructor() {
      testWithMemGetter(function make() {
        return new Outer({one: 10, inner: {two: 20}})
      })
    })

    t.test(function test_mut() {
      testWithMemGetter(function make() {
        return new Outer().mut({one: 10, inner: {two: 20}})
      })
    })
  })

  // Incomplete: tests only constructor without `.mut`. TODO test `.mut`.
  t.test(function test_getter_override() {
    function testDefault(cls) {
      t.eq({...new cls({one: 10})}, {one: 10})
      t.is(new cls({one: 10}).inner, `inner`)
    }

    function testNoOverride(cls) {
      t.eq(
        {...new cls({one: 10, inner: 20})},
        {one: 10},
      )
    }

    t.test(function test_untyped_only_getter() {
      class Cls extends o.Struct {
        get inner() {return `inner`}
      }

      testDefault(Cls)
      testNoOverride(Cls)
    })

    t.test(function test_untyped_getter_setter() {
      class Cls extends o.Struct {
        get inner() {return `inner`}
        set inner(_) {throw l.errImpl()}
      }

      testDefault(Cls)
      testNoOverride(Cls)
    })

    t.test(function test_typed_only_getter() {
      class Cls extends o.Struct {
        static fields = {...super.fields, inner: l.laxFin}
        get inner() {return `inner`}
      }

      testDefault(Cls)

      t.eq(
        {...new Cls({one: 10, inner: 20})},
        {one: 10, inner: 20},
      )
    })

    t.test(function test_typed_getter_setter() {
      class Cls extends o.Struct {
        static fields = {...super.fields, inner: l.laxFin}
        get inner() {return `inner`}
        set inner(val) {o.pub(this, `inner`, val * 2)}
      }

      testDefault(Cls)

      t.eq(
        {...new Cls({one: 10, inner: 20})},
        {one: 10, inner: 40},
      )
    })
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
