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

t.test(function test_StructType() {
  class Type extends o.StructType {
    init() {}
    reinit() {}
  }

  class Tar extends o.Struct {
    static get Type() {return Type}

    static Spec = class extends super.Spec {
      id = l.reqIntPos
      name = l.reqStr
    }
  }

  // Some later tests rely on this.
  t.test(function test_statics() {
    t.is(o.Struct.Type, o.StructType)
    t.inst(o.Struct.getType(), o.StructType)

    t.is(o.StructLax.Type, o.StructTypeLax)
    t.inst(o.StructLax.getType(), o.StructTypeLax)

    t.inst(Tar.getSpec(), Tar.Spec)
    t.inst(Tar.getType(), Tar.Type)
    t.is(Tar.getSpec(), Tar.getSpec())
    t.is(Tar.getType(), Tar.getType())
  })

  t.test(function test_reset() {
    const type = Tar.getType()
    const tar = new Tar()

    testStructTypeReset(tar, type.reset.bind(type))

    type.reset(tar, {id: 30, name: `two`, undeclared0: 40, undeclared1: 50, constructor: 60})
    t.own(tar, {id: 30, name: `two`})
  })

  t.test(function test_patch() {
    const type = Tar.getType()
    const tar = new Tar()

    type.patch(tar)
    t.own(tar, {})

    type.patch(tar, {})
    t.own(tar, {})

    type.patch(tar, {id: 30, name: `two`, undeclared0: 40, undeclared1: 50, constructor: 60})
    t.own(tar, {undeclared0: 40, undeclared1: 50})
  })

  t.test(function test_mut() {
    const type = Tar.getType()
    const tar = new Tar()

    testStructTypeReset(tar, type.mut.bind(type))

    type.mut(tar, {id: 30, name: `two`, undeclared0: 40, undeclared1: 50, constructor: 60})
    t.own(tar, {id: 30, name: `two`, undeclared0: 40, undeclared1: 50})
  })

  t.test(function test_fallback() {
    class Tar extends o.Struct {
      static get Type() {return Type}

      static Spec = class extends super.Spec {
        id = l.reqIntPos
        static any(val) {return val + 1}
      }
    }

    const type = Tar.getType()
    const tar = new Tar()

    type.patch(tar, {id: 10, undeclared0: 20, undeclared1: 30})
    t.own(tar, {undeclared0: 21, undeclared1: 31})

    type.mut(tar, {id: 10, undeclared0: 40, undeclared1: 50})
    t.own(tar, {id: 10, undeclared0: 41, undeclared1: 51})
  })

  t.test(function test_fields_implementing_isMut() {
    class SubDeclared extends o.StructLax {}
    class SubUndeclared extends o.StructLax {}

    class Tar extends o.Struct {
      static get Type() {return Type}

      static Spec = class extends super.Spec {
        id(val) {return l.reqIntPos(val)}
        declared(val) {return l.toInstOpt(val, SubDeclared)}
        static any(val) {return l.toInstOpt(val, SubUndeclared)}
      }
    }

    const type = Tar.getType()
    const tar = new Tar()

    type.mut(tar, {id: 10, declared: {one: 20}, undeclared: {two: 30}})
    const {declared, undeclared} = tar
    t.own(tar, {id: 10, declared, undeclared})
    t.is(tar.id, 10)
    t.inst(declared, SubDeclared)
    t.own(declared, {one: 20})
    t.inst(undeclared, SubUndeclared)
    t.own(undeclared, {two: 30})

    function unmodified() {
      t.own(declared, {one: 20, three: 50})
      t.own(undeclared, {two: 30, four: 60})
    }

    type.mut(tar, {id: 40, declared: {three: 50}, undeclared: {four: 60}})
    t.own(tar, {id: 40, declared, undeclared})
    t.is(tar.declared, declared)
    t.is(tar.undeclared, undeclared)
    unmodified()

    t.throws(() => type.mut(tar, {id: 40, declared: 50}), TypeError, `expected variant of isStruct, got 50`)
    t.throws(() => type.mut(tar, {id: 40, declared: {}, undeclared: 50}), TypeError, `expected variant of isStruct, got 50`)
    t.own(tar, {id: 40, declared, undeclared})
    t.is(tar.declared, declared)
    t.is(tar.undeclared, undeclared)
    unmodified()

    type.mut(tar, {id: 70})
    t.own(tar, {id: 70, declared: undefined, undeclared})
    t.is(tar.undeclared, undeclared)
    unmodified()

    type.mut(tar, {id: 70, undeclared: undefined})
    // t.own(tar, {id: 70, declared: undefined, undeclared: undefined})
    t.own(tar, {id: 70, declared: undefined, undeclared})
    t.is(tar.undeclared, undeclared)
    unmodified()
  })
})

function testStructTypeReset(tar, fun) {
  t.throws(() => fun(tar), TypeError, `invalid property "id"`)
  t.own(tar, {})

  t.throws(() => fun(tar, {id: undefined}), TypeError, `invalid property "id"`)
  t.own(tar, {})

  t.throws(() => fun(tar, {id: 10}), TypeError, `invalid property "name"`)
  t.own(tar, {id: 10})

  t.throws(() => fun(tar, {id: 10, name: undefined}), TypeError, `invalid property "name"`)
  t.own(tar, {id: 10})

  t.throws(() => fun(tar, {name: `str`}), TypeError, `invalid property "id"`)
  t.own(tar, {id: 10})

  fun(tar, {id: 20, name: `one`})
  t.own(tar, {id: 20, name: `one`})
}

t.test(function test_Struct() {
  t.test(function test_undeclared() {
    class Tar extends o.Struct {}

    const tar = new Tar({one: 10, two: 20})
    t.own(tar, {})

    tar.mut({three: 30, four: 40})
    t.own(tar, {})
  })

  /*
  Subclasses of `Struct` inherit exactly two properties: `.constructor` and
  `.mut`. By default, we don't shadow any inherited properties, in accordance
  with `patch` semantics. However, we allow to explicitly define fields that
  override/shadow inherited properties.
  */
  t.test(function test_opt_in_shadowing() {
    class Tar extends o.Struct {
      static Spec = class extends super.Spec {
        mut = l.reqIntPos
        one = l.reqIntPos
      }
      two() {}
    }

    const tar = new Tar({mut: 10, one: 20, two: 30, three: 40})
    t.own(tar, {mut: 10, one: 20})
  })

  t.test(function test_declared() {
    class Tar extends o.Struct {
      static Spec = class extends super.Spec {
        one = l.reqIntPos
        two = l.laxBool
        three = l.optStr
      }
    }

    testStructDeclaredProperties(Tar)

    t.own(new Tar({one: 10, undeclared: 20}), {one: 10, two: false, three: undefined})
    t.own(new Tar({one: 10}).mut({one: 20, undeclared: 30}), {one: 20, two: false, three: undefined})
  })
})

t.test(function test_StructLax() {
  t.test(function test_undeclared() {
    class Tar extends o.StructLax {}

    const tar = new Tar({one: 10, two: 20})
    t.own(tar, {one: 10, two: 20})

    tar.mut({three: 30, four: 40})
    t.own(tar, {one: 10, two: 20, three: 30, four: 40})
  })

  /*
  Subclasses of `StructLax` inherit exactly two properties: `.constructor` and
  `.mut`. By default, we don't shadow any inherited properties, in accordance
  with `patch` semantics. However, we allow to explicitly define fields that
  override/shadow inherited properties.
  */
  t.test(function test_no_accidental_shadowing() {
    class Tar extends o.StructLax {}
    t.own(new Tar({constructor: 10, mut: 20, one: 30}), {one: 30})
  })

  t.test(function test_opt_in_shadowing() {
    class Tar extends o.StructLax {
      static Spec = class extends super.Spec {
        mut = l.reqIntPos
        one = l.reqIntPos
      }
      two() {}
    }

    const tar = new Tar({mut: 10, one: 20, two: 30, three: 40})
    t.own(tar, {mut: 10, one: 20, three: 40})
  })

  t.test(function test_declared() {
    class Tar extends o.StructLax {
      static Spec = class extends super.Spec {
        one = l.reqIntPos
        two = l.laxBool
        three = l.optStr
      }
    }

    testStructDeclaredProperties(Tar)

    t.own(new Tar({one: 10, undeclared: 20}), {one: 10, two: false, three: undefined, undeclared: 20})
    t.own(new Tar({one: 10}).mut({one: 20, undeclared: 30}), {one: 20, two: false, three: undefined, undeclared: 30})
  })
})

function testStructDeclaredProperties(Tar) {
  t.throws(() => new Tar(), TypeError, `invalid property "one"`)
  t.throws(() => new Tar({one: undefined}), TypeError, `invalid property "one"`)
  t.throws(() => new Tar({one: 10, two: 20}), TypeError, `invalid property "two"`)
  t.throws(() => new Tar({one: 10, three: 30}), TypeError, `invalid property "three"`)

  const tar = new Tar({one: 10})
  t.own(tar, {one: 10, two: false, three: undefined})

  tar.mut()
  t.own(tar, {one: 10, two: false, three: undefined})

  t.throws(() => tar.mut({one: undefined}), TypeError, `invalid property "one"`)
  t.own(tar, {one: 10, two: false, three: undefined})

  t.throws(() => tar.mut({one: 10, two: 20}), TypeError, `invalid property "two"`)
  t.own(tar, {one: 10, two: false, three: undefined})

  t.throws(() => tar.mut({one: 10, three: 30}), TypeError, `invalid property "three"`)
  t.own(tar, {one: 10, two: false, three: undefined})

  tar.mut({one: 20})
  t.own(tar, {one: 20, two: false, three: undefined})

  tar.mut({one: 20, two: true, three: ``})
  t.own(tar, {one: 20, two: true, three: ``})
}

t.test(function test_StructLax_inheritance() {
  t.test(function test_define_then_instantiate() {
    class Tar0 extends o.StructLax {
      static Spec = class extends super.Spec {one = l.reqIntPos}
    }

    class Tar1 extends Tar0 {
      static Spec = class extends super.Spec {two = l.reqStr}
    }

    t.throws(() => new Tar0({one: `10`}), TypeError, `invalid property "one"`)
    t.own(new Tar0({one: 10, two: 20}), {one: 10, two: 20})

    t.throws(() => new Tar1({one: 10, two: 20}), TypeError, `invalid property "two"`)
    t.own(new Tar1({one: 10, two: `20`}), {one: 10, two: `20`})

    t.inst(Tar0.getSpec(), Tar0.Spec)
    t.inst(Tar1.getSpec(), Tar1.Spec)
  })

  t.test(function test_instantiate_then_define() {
    class Tar0 extends o.StructLax {
      static Spec = class extends super.Spec {one = l.reqIntPos}
    }

    t.throws(() => new Tar0({one: `10`}), TypeError, `invalid property "one"`)
    t.own(new Tar0({one: 10, two: 20}), {one: 10, two: 20})

    class Tar1 extends Tar0 {
      static Spec = class extends super.Spec {two = l.reqStr}
    }

    t.throws(() => new Tar1({one: 10, two: 20}), TypeError, `invalid property "two"`)
    t.own(new Tar1({one: 10, two: `20`}), {one: 10, two: `20`})

    t.inst(Tar0.getSpec(), Tar0.Spec)
    t.inst(Tar1.getSpec(), Tar1.Spec)
  })
})

t.test(function test_Struct_inheritance_remove_declared_property() {
  class Tar0 extends o.Struct {
    static Spec = class extends super.Spec {
      one = l.reqIntPos
      two = l.reqIntPos
    }
  }

  class Tar1 extends Tar0 {
    static Spec = class extends super.Spec {
      two = undefined
    }
  }

  t.throws(() => new Tar0({one: 10}), TypeError, `invalid property "two"`)
  t.own(new Tar0({one: 10, two: 20, three: 30}), {one: 10, two: 20})

  t.own(new Tar1({one: 10}), {one: 10})
  t.own(new Tar1({one: 10, two: 20}), {one: 10})
  t.own(new Tar1({one: 10, two: `20`}), {one: 10})
})

t.test(function test_StructLax_recursive_mut() {
  t.test(function test_undeclared() {
    class Inner extends o.StructLax {}
    class Middle extends o.StructLax {}
    class Outer extends o.StructLax {}

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

    function stable() {
      t.eq(outer, new Outer({
        three: 40,
        middle: new Middle({two: 50, inner: new Inner({one: 60, four: 70})}),
        five: {six: 80},
      }))
    }

    stable()

    // Note: `outer.middle.inner` implements `.mut`, which must be invoked here,
    // passing nil. As a result, the structure is unchanged.
    outer.mut({middle: {inner: undefined}})
    stable()

    // Note: `outer.middle` implements `.mut`, which must be invoked here,
    // passing nil. As a result, the structure is unchanged.
    outer.mut({middle: undefined})
    stable()
  })

  t.test(function test_declared() {
    class Inner extends o.StructLax {
      static Spec = class extends super.Spec {
        one = l.reqIntPos
      }
    }

    class Middle extends o.StructLax {
      static Spec = class extends super.Spec {
        two = l.reqIntPos
        inner(val) {return l.toInstOpt(val, Inner)}
      }
    }

    class Outer extends o.StructLax {
      static Spec = class extends super.Spec {
        three = l.reqIntPos
        middle(val) {return l.toInstOpt(val, Middle)}
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

t.test(function test_StructLax_with_mem_getter() {
  class Inner extends o.StructLax {}

  class Outer extends o.StructLax {
    static {o.memGet(this)}
    get inner() {return new Inner()}
  }

  function testWithMemGetter(make) {
    const outer = make()
    const inner = outer.inner

    t.inst(inner, Inner)
    t.own(inner, {two: 20})

    t.inst(outer, Outer)
    t.own(outer, {one: 10, inner})

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

// Incomplete: tests only `new` but not `.mut`. TODO test `.mut`.
t.test(function test_StructLax_getters_and_setters() {
  function testDefault(Tar) {
    t.own(new Tar({one: 10}), {one: 10})
    t.is(new Tar({one: 10}).inner, `default`)
  }

  function testNoOverride(Tar) {
    t.own(new Tar({one: 10, inner: 20}), {one: 10})
  }

  t.test(function test_undeclared_only_getter() {
    class Tar extends o.StructLax {
      get inner() {return `default`}
    }

    testDefault(Tar)
    testNoOverride(Tar)
  })

  t.test(function test_undeclared_getter_setter() {
    class Tar extends o.StructLax {
      get inner() {return `default`}
      set inner(_) {throw l.errImpl()}
    }

    testDefault(Tar)
    testNoOverride(Tar)
  })

  t.test(function test_declared_only_getter() {
    class Tar extends o.StructLax {
      static Spec = class extends super.Spec {
        inner = l.laxFin
      }

      get inner() {return `default`}
    }

    t.throws(() => new Tar(), TypeError, `Cannot set property inner`)
  })

  /*
  Intended behavior: our machinery should invoke the validate/transform function
  provided by the spec, then simply assign the resulting value, passing it to
  the setter.
  */
  t.test(function test_declared_getter_setter() {
    class Tar extends o.StructLax {
      static Spec = class extends super.Spec {
        inner = l.laxFin
      }

      get inner() {return this.secondary}
      set inner(val) {this.secondary = val + 1}
    }

    t.throws(() => new Tar({inner: `10`}), TypeError, `invalid property "inner"`)

    t.own(new Tar(), {secondary: 1})
    t.own(new Tar({one: 10}), {one: 10, secondary: 1})
    t.own(new Tar({one: 10, secondary: 20}), {one: 10, secondary: 20})
    t.own(new Tar({one: 10, inner: 20}), {one: 10, secondary: 21})
    t.own(new Tar({one: 10, inner: 20, secondary: 30}), {one: 10, secondary: 30})
  })
})

/*
The current implementation ignores symbol properties. This behavior is
accidental. We lock it down by a test for API stability, but we may consider
changing this in the future. Note that if we do change this, we may have to
modify the implementation of `StructSpec..parentNode` and
`StructSpec.getParent`.
*/
t.test(function test_StructLax_symbols() {
  const one = Symbol.for(`one`)
  const two = Symbol.for(`two`)

  class Tar extends o.StructLax {
    static Spec = class extends super.Spec {
      [one] = l.reqIntPos
    }
  }

  const tar = new Tar({[one]: 10, [two]: 20})
  t.own(tar, {})
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
