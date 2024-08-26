import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'

/* Util */

function args() {return arguments}
function unreachable() {throw Error(`unreachable`)}
function* gen() {unreachable()}
async function* agen() {unreachable()}
const inherit = Object.create
function True() {return true}
function False() {return false}
class EqAlways extends l.Emp {eq() {return true}}
class EqNever extends l.Emp {eq() {return false}}

/* Test */

// Tested first because used in most assertions.
t.test(function test_show() {
  function test(src, exp) {t.is(l.show(src), exp)}

  test(undefined,                                 `undefined`)
  test(null,                                      `null`)
  test(0,                                         `0`)
  test(NaN,                                       `NaN`)
  test(Infinity,                                  `Infinity`)
  test(-10,                                       `-10`)
  test(10,                                        `10`)
  test(``,                                        `""`)
  test(`str`,                                     `"str"`)
  test(Symbol(`str`),                             `Symbol(str)`)
  test({},                                        `{}`)
  test(inherit(null),                             `{}`)
  test(inherit(inherit(null)),                    `{}`)
  test(inherit({one: `two`}),                     `{}`)
  test({one: `two`, three: `four`},               `{one: "two", three: "four"}`)
  test([],                                        `[]`)
  test([10, `str`],                               `[10, "str"]`)
  test(args,                                      `[function args]`)
  test(gen(),                                     `[object Generator]`)
  test(agen(),                                    `[object AsyncGenerator]`)
  test(new Set(),                                 `[object Set]`)
  test(new Map(),                                 `[object Map]`)
  test(class Cls {},                              `[function Cls]`)
  test(new class {}(),                            `{}`)
  test(new class extends Array {}(),              `[]`)
  test(new class extends Array {}(10, `str`),     `[10, "str"]`)
  test(new class Cls extends Array {}(),          `[]`)
  test(new class Cls extends Array {}(10, `str`), `[10, "str"]`)
  test(Error(`msg`),                              `Error: msg`)
  test(TypeError(`msg`),                          `TypeError: msg`)
  test(SyntaxError(`msg`),                        `SyntaxError: msg`)

  function testCls(cls) {test(new cls(), `[object Cls]`)}

  testCls(class Cls {})
  testCls(class Cls extends Set {})
  testCls(class Cls extends Map {})

  testCls(class Cls               {get [Symbol.toStringTag]() {return this.constructor.name}})
  testCls(class Cls extends Set   {get [Symbol.toStringTag]() {return this.constructor.name}})
  testCls(class Cls extends Map   {get [Symbol.toStringTag]() {return this.constructor.name}})

  testCls(class Cls               {toString() {unreachable()}})
  testCls(class Cls extends Set   {toString() {unreachable()}})
  testCls(class Cls extends Map   {toString() {unreachable()}})

  testCls(class Cls               {toString() {unreachable()} get [Symbol.toStringTag]() {return this.constructor.name}})
  testCls(class Cls extends Set   {toString() {unreachable()} get [Symbol.toStringTag]() {return this.constructor.name}})
  testCls(class Cls extends Map   {toString() {unreachable()} get [Symbol.toStringTag]() {return this.constructor.name}})

  {
    const one = Object.create(null)
    const two = Object.create(null)
    one.one = one
    one.two = two
    two.one = one
    two.two = two
    test(one, `{one: [cyclic 1], two: {one: [cyclic 1], two: [cyclic 2]}}`)
  }

  // For comparison, inane built-in behavior we dislike:
  t.is(String({}), `[object Object]`)
  t.is(String([]), ``)
  t.is(String(new class Cls extends Set {}()), `[object Set]`)
  t.is(String(new class Cls extends Map {}()), `[object Map]`)
})

t.test(function test_render() {
  t.throws(() => l.render(), TypeError, `unable to convert undefined to string`)
  t.throws(() => l.render(undefined), TypeError, `unable to convert undefined to string`)
  t.throws(() => l.render(null), TypeError, `unable to convert null to string`)

  testRender(l.render)
})

t.test(function test_renderOpt() {
  function empty(val) {t.is(l.renderOpt(val), undefined)}

  empty()
  empty(undefined)
  empty(null)

  // SYNC[testRenderInvalid]
  empty({})
  empty(inherit(null))
  empty(inherit(inherit(null)))
  empty({one: `two`, three: `four`})
  empty([])
  empty([10, `str`])
  empty(args)
  empty(gen())
  empty(agen())
  empty(class Cls {})
  empty(new class {})
  empty(new class Cls {})
  empty(new class Cls extends Array {})

  testRenderValid(l.renderOpt)
})

t.test(function test_renderLax() {
  function empty(val) {t.is(l.renderLax(val), ``)}

  empty()
  empty(undefined)
  empty(null)

  testRender(l.renderLax)
})

function testRender(fun) {
  testRenderInvalid(fun)
  testRenderValid(fun)
}

// SYNC[testRenderInvalid]
function testRenderInvalid(fun) {
  t.throws(() => fun(Symbol(`str`)), TypeError, `unable to convert Symbol(str) to string`)
  t.throws(() => fun({}), TypeError, `unable to convert {} to string`)
  t.throws(() => fun(inherit(null)), TypeError, `unable to convert {} to string`)
  t.throws(() => fun(inherit(inherit(null))), TypeError, `unable to convert {} to string`)
  t.throws(() => fun({one: `two`, three: `four`}), TypeError, `unable to convert {one: "two", three: "four"} to string`)
  t.throws(() => fun([]), TypeError, `unable to convert [] to string`)
  t.throws(() => fun([10, `str`]), TypeError, `unable to convert [10, "str"] to string`)
  t.throws(() => fun(args), TypeError, `unable to convert [function args] to string`)
  t.throws(() => fun(gen()), TypeError, `unable to convert [object Generator] to string`)
  t.throws(() => fun(agen()), TypeError, `unable to convert [object AsyncGenerator] to string`)
  t.throws(() => fun(class Cls {}), TypeError, `unable to convert [function Cls] to string`)
  t.throws(() => fun(new class {}), TypeError, `unable to convert {} to string`)
  t.throws(() => fun(new class Cls {}), TypeError, `unable to convert [object Cls] to string`)
  t.throws(() => fun(new class Cls extends Array {}), TypeError, `unable to convert [] to string`)
}

function testRenderValid(fun) {
  t.is(fun(0), `0`)
  t.is(fun(NaN), `NaN`)
  t.is(fun(Infinity), `Infinity`)
  t.is(fun(-10), `-10`)
  t.is(fun(10), `10`)
  t.is(fun(``), ``)
  t.is(fun(`str`), `str`)
  t.is(fun(new Date(1024)), `1970-01-01T00:00:01.024Z`)
  t.is(fun({toString() {return `blah`}}), `blah`)

  class Cents extends Number {
    toString() {
      return (this / 100).toLocaleString(`en-US`, {useGrouping: false})
    }
  }

  t.is(fun(new Cents(100)), `1`)
  t.is(fun(new Cents(2000)), `20`)
  t.is(fun(new Cents(3400)), `34`)
}

t.test(function test_toTrueArr() {
  t.throws(() => l.toTrueArr(10), TypeError, `expected variant of isIter, got 10`)
  t.throws(() => l.toTrueArr(`str`), TypeError, `expected variant of isIter, got "str"`)
  t.throws(() => l.toTrueArr({}), TypeError, `expected variant of isIter, got {}`)

  function same(src) {t.is(l.toTrueArr(src), src)}

  function copy(src) {
    const out = l.toTrueArr(src)

    t.isnt(out, src)
    t.isnt(l.toTrueArr(src), l.toTrueArr(src))

    t.ok(l.isTrueArr(out))
    t.eq(out, [...src])
  }

  t.eq(l.toTrueArr(), [])

  same([])
  same([10])
  same([10, 20])

  class Arr extends Array {}

  copy(Arr.of())
  copy(Arr.of(10))
  copy(Arr.of(10, 20))
})

t.test(function test_truthy() {
  t.is(l.truthy(), !!(undefined))
  t.is(l.truthy(0), !!(0))
  t.is(l.truthy(``), !!(``))
  t.is(l.truthy(10), !!(10))
})

t.test(function test_falsy() {
  t.is(l.falsy(), !undefined)
  t.is(l.falsy(0), !0)
  t.is(l.falsy(``), !``)
  t.is(l.falsy(10), !10)
})

t.test(function test_is() {
  t.no(l.is(`one`, `two`))
  t.no(l.is({}, {}))

  t.ok(l.is())
  t.ok(l.is(NaN, NaN))
  t.ok(l.is(-0, +0))
  t.ok(l.is(`one`, `one`))
})

t.test(function test_isNil() {
  t.no(l.isNil(false))

  t.ok(l.isNil())
  t.ok(l.isNil(null))
  t.ok(l.isNil(undefined))
})

t.test(function test_isSome() {
  t.no(l.isSome())
  t.no(l.isSome(null))
  t.no(l.isSome(undefined))

  t.ok(l.isSome(false))
})

t.test(function test_isBool() {
  t.no(l.isBool())
  t.no(l.isBool(null))
  t.no(l.isBool(Boolean))

  t.ok(l.isBool(true))
  t.ok(l.isBool(false))
})

t.test(function test_isNum() {
  t.no(l.isNum())
  t.no(l.isNum(null))
  t.no(l.isNum(`10`))
  t.no(l.isNum([]))
  t.no(l.isNum([0]))

  t.ok(l.isNum(10))
  t.ok(l.isNum(NaN))
  t.ok(l.isNum(Infinity))
})

t.test(function test_isFin() {
  t.no(l.isFin())
  t.no(l.isFin(NaN))
  t.no(l.isFin(Infinity))
  t.no(l.isFin(-Infinity))
  t.no(l.isFin(null))
  t.no(l.isFin(`10`))
  t.no(l.isFin([]))
  t.no(l.isFin([0]))

  t.ok(l.isFin(10))
  t.ok(l.isFin(10.20))
  t.ok(l.isFin(-10.20))
})

t.test(function test_isFinNeg() {
  t.no(l.isFinNeg())
  t.no(l.isFinNeg(`-10`))
  t.no(l.isFinNeg(`10`))
  t.no(l.isFinNeg([]))
  t.no(l.isFinNeg([0]))

  t.no(l.isFinNeg(NaN))
  t.no(l.isFinNeg(Infinity))
  t.no(l.isFinNeg(-Infinity))

  t.no(l.isFinNeg(-0))
  t.no(l.isFinNeg(0))
  t.no(l.isFinNeg(10))
  t.no(l.isFinNeg(10.20))

  t.ok(l.isFinNeg(-10))
  t.ok(l.isFinNeg(-10.20))
})

t.test(function test_isFinPos() {
  t.no(l.isFinPos())
  t.no(l.isFinPos(`-10`))
  t.no(l.isFinPos(`10`))
  t.no(l.isFinPos([]))
  t.no(l.isFinPos([0]))

  t.no(l.isFinPos(NaN))
  t.no(l.isFinPos(Infinity))
  t.no(l.isFinPos(-Infinity))

  t.no(l.isFinPos(0))
  t.no(l.isFinPos(-0))
  t.no(l.isFinPos(-10))
  t.no(l.isFinPos(-10.20))

  t.ok(l.isFinPos(10))
  t.ok(l.isFinPos(10.20))
})

t.test(function test_isInt() {
  t.no(l.isInt())
  t.no(l.isInt(10.20))
  t.no(l.isInt(-10.20))
  t.no(l.isInt(NaN))
  t.no(l.isInt(Infinity))
  t.no(l.isInt(-Infinity))
  t.no(l.isInt(null))
  t.no(l.isInt(`10`))
  t.no(l.isInt([]))
  t.no(l.isInt([0]))

  t.ok(l.isInt(0))
  t.ok(l.isInt(10))
  t.ok(l.isInt(10))
  t.ok(l.isInt(-10))
  t.ok(l.isInt(-10))
})

t.test(function test_isNat() {
  t.no(l.isNat())
  t.no(l.isNat(-1))
  t.no(l.isNat(-10))
  t.no(l.isNat(10.20))
  t.no(l.isNat(-10.20))
  t.no(l.isNat(NaN))
  t.no(l.isNat(Infinity))
  t.no(l.isNat(-Infinity))
  t.no(l.isNat(null))
  t.no(l.isNat(`10`))
  t.no(l.isNat([]))
  t.no(l.isNat([0]))

  t.ok(l.isNat(0))
  t.ok(l.isNat(1))
  t.ok(l.isNat(10))
})

t.test(function test_isIntNeg() {
  t.no(l.isIntNeg())
  t.no(l.isIntNeg(null))
  t.no(l.isIntNeg(`10`))
  t.no(l.isIntNeg(`-10`))
  t.no(l.isIntNeg(NaN))
  t.no(l.isIntNeg(Infinity))
  t.no(l.isIntNeg(-Infinity))
  t.no(l.isIntNeg(0))
  t.no(l.isIntNeg(-0))
  t.no(l.isIntNeg(10))
  t.no(l.isIntNeg(20))
  t.no(l.isIntNeg(10.20))
  t.no(l.isIntNeg(-10.20))

  t.ok(l.isIntNeg(-10))
  t.ok(l.isIntNeg(-20))
})

t.test(function test_isIntPos() {
  t.no(l.isIntPos())
  t.no(l.isIntPos(null))
  t.no(l.isIntPos(`10`))
  t.no(l.isIntPos(`-10`))
  t.no(l.isIntPos(NaN))
  t.no(l.isIntPos(Infinity))
  t.no(l.isIntPos(-Infinity))
  t.no(l.isIntPos(0))
  t.no(l.isIntPos(-0))
  t.no(l.isIntPos(-10))
  t.no(l.isIntPos(-20))
  t.no(l.isIntPos(10.20))
  t.no(l.isIntPos(-10.20))

  t.ok(l.isIntPos(10))
  t.ok(l.isIntPos(20))
})

t.test(function test_isNaN() {
  t.no(l.isNaN())
  t.no(l.isNaN(-Infinity))
  t.no(l.isNaN(Infinity))
  t.no(l.isNaN(-10))
  t.no(l.isNaN(10))
  t.no(l.isNaN(0))
  t.no(l.isNaN(`0`))
  t.no(l.isNaN(`NaN`))
  t.no(l.isNaN([]))
  t.no(l.isNaN({}))

  t.ok(l.isNaN(NaN))
})

t.test(function test_isInf() {
  t.no(l.isInf())
  t.no(l.isInf(NaN))
  t.no(l.isInf(undefined))
  t.no(l.isInf(10))
  t.no(l.isInf(-10))
  t.no(l.isInf(`Infinity`))
  t.no(l.isInf(`-Infinity`))
  t.no(l.isInf([]))
  t.no(l.isInf({}))

  t.ok(l.isInf(Infinity))
  t.ok(l.isInf(-Infinity))
})

t.test(function test_isBigInt() {
  t.no(l.isBigInt(0))
  t.no(l.isBigInt(10))
  t.no(l.isBigInt(-10))
  t.no(l.isBigInt(10.20))
  t.no(l.isBigInt(-10.20))
  t.no(l.isBigInt(NaN))
  t.no(l.isBigInt(Infinity))
  t.no(l.isBigInt(new Number(10)))
  t.no(l.isBigInt(`10`))

  t.ok(l.isBigInt(0n))
  t.ok(l.isBigInt(10n))
  t.ok(l.isBigInt(-10n))
  t.ok(l.isBigInt(BigInt(0)))
  t.ok(l.isBigInt(BigInt(10)))
  t.ok(l.isBigInt(BigInt(-10)))
})

t.test(function test_isStr() {
  t.no(l.isStr())
  t.no(l.isStr(new String(``)))

  t.ok(l.isStr(``))
  t.ok(l.isStr(` `))
  t.ok(l.isStr(`str`))
})

t.test(function test_isValidStr() {
  t.no(l.isValidStr())
  t.no(l.isValidStr(new String(``)))

  t.no(l.isValidStr(``))
  t.ok(l.isValidStr(` `))
  t.ok(l.isValidStr(`str`))
})

t.test(function test_isSym() {
  t.no(l.isSym())
  t.no(l.isSym(`Symbol(blah)`))

  t.ok(l.isSym(Symbol(`blah`)))
})

t.test(function test_isKey() {
  t.no(l.isKey(null))
  t.no(l.isKey(undefined))
  t.no(l.isKey(NaN))
  t.no(l.isKey(Infinity))
  t.no(l.isKey(-Infinity))
  t.no(l.isKey({}))
  t.no(l.isKey([]))

  t.ok(l.isKey(``))
  t.ok(l.isKey(0))
  t.ok(l.isKey(-10))
  t.ok(l.isKey(10))
  t.ok(l.isKey(10.20))
  t.ok(l.isKey(Symbol(`blah`)))
  t.ok(l.isKey(true))
  t.ok(l.isKey(10n))
  t.ok(l.isKey(-10n))
})

t.test(function test_isPk() {
  t.no(l.isPk(null))
  t.no(l.isPk(undefined))
  t.no(l.isPk(true))
  t.no(l.isPk(NaN))
  t.no(l.isPk(Infinity))
  t.no(l.isPk(-Infinity))
  t.no(l.isPk(``))
  t.no(l.isPk(0))
  t.no(l.isPk(-10))
  t.no(l.isPk(10.20))
  t.no(l.isPk(10n))
  t.no(l.isPk(-10n))
  t.no(l.isPk(Symbol(`blah`)))
  t.no(l.isPk({}))
  t.no(l.isPk([]))

  t.ok(l.isPk(10))
  t.ok(l.isPk(`str`))
})

t.test(function test_isJunk() {
  t.no(l.isJunk(0))
  t.no(l.isJunk(false))
  t.no(l.isJunk(``))
  t.no(l.isJunk([]))
  t.no(l.isJunk({}))

  t.ok(l.isJunk())
  t.ok(l.isJunk(undefined))
  t.ok(l.isJunk(null))
  t.ok(l.isJunk(NaN))
  t.ok(l.isJunk(Infinity))
  t.ok(l.isJunk(-Infinity))
})

t.test(function test_isComp() {
  t.no(l.isComp())
  t.no(l.isComp(null))
  t.no(l.isComp(10))
  t.no(l.isComp(``))
  t.no(l.isComp(Symbol()))
  t.no(l.isComp(true))

  t.ok(l.isComp({}))
  t.ok(l.isComp([]))
  t.ok(l.isComp(l.nop))
  t.ok(l.isComp(/_/))
})

t.test(function test_isPrim() {
  t.no(l.isPrim({}))
  t.no(l.isPrim([]))
  t.no(l.isPrim(l.nop))
  t.no(l.isPrim(/_/))

  t.ok(l.isPrim())
  t.ok(l.isPrim(null))
  t.ok(l.isPrim(10))
  t.ok(l.isPrim(``))
  t.ok(l.isPrim(Symbol()))
  t.ok(l.isPrim(true))
})

t.test(function test_isFun() {
  t.no(l.isFun())
  t.no(l.isFun(true))
  t.no(l.isFun(10))
  t.no(l.isFun(`str`))
  t.no(l.isFun([]))
  t.no(l.isFun({}))

  // `val instanceof Function` would have returned `true` here.
  t.no(l.isFun(inherit(() => {})))
  t.no(l.isFun(inherit(function() {})))
  t.no(l.isFun(inherit(function*() {})))
  t.no(l.isFun(inherit(async () => {})))
  t.no(l.isFun(inherit(async function() {})))
  t.no(l.isFun(inherit(async function*() {})))

  t.ok(l.isFun(() => {}))
  t.ok(l.isFun(function() {}))
  t.ok(l.isFun(function*() {}))
  t.ok(l.isFun(async () => {}))
  t.ok(l.isFun(async function() {}))
  t.ok(l.isFun(async function*() {}))
})

t.test(function test_isFunSync() {
  t.no(l.isFunSync(function*() {}))
  t.no(l.isFunSync(async () => {}))
  t.no(l.isFunSync(async function() {}))
  t.no(l.isFunSync(async function*() {}))

  t.ok(l.isFunSync(() => {}))
  t.ok(l.isFunSync(function() {}))
})

t.test(function test_isFunGen() {
  t.no(l.isFunGen(() => {}))
  t.no(l.isFunGen(function() {}))
  t.no(l.isFunGen(async () => {}))
  t.no(l.isFunGen(async function() {}))
  t.no(l.isFunGen(async function*() {}))

  t.ok(l.isFunGen(function*() {}))
})

t.test(function test_isFunAsync() {
  t.no(l.isFunAsync(() => {}))
  t.no(l.isFunAsync(function() {}))
  t.no(l.isFunAsync(function*() {}))
  t.no(l.isFunAsync(async function*() {}))

  t.ok(l.isFunAsync(async () => {}))
  t.ok(l.isFunAsync(async function() {}))
})

t.test(function test_isFunAsyncGen() {
  t.no(l.isFunAsyncGen(() => {}))
  t.no(l.isFunAsyncGen(function() {}))
  t.no(l.isFunAsyncGen(function*() {}))
  t.no(l.isFunAsyncGen(async () => {}))
  t.no(l.isFunAsyncGen(async function() {}))

  t.ok(l.isFunAsyncGen(async function*() {}))
})

t.test(function test_isObj() {
  t.no(l.isObj())
  t.no(l.isObj(null))
  t.no(l.isObj(``))
  t.no(l.isObj(l.nop))

  t.ok(l.isObj({}))
  t.ok(l.isObj([]))
  t.ok(l.isObj(/_/))
  t.ok(l.isObj(inherit(null)))
  t.ok(l.isObj(inherit(inherit(null))))
  t.ok(l.isObj(inherit({})))
  t.ok(l.isObj(new String()))
  t.ok(l.isObj(new Number()))
  t.ok(l.isObj(new Boolean()))
})

t.test(function test_isNpo() {
  t.no(l.isNpo(undefined))
  t.no(l.isNpo(null))
  t.no(l.isNpo(``))
  t.no(l.isNpo(l.nop))
  t.no(l.isNpo([]))
  t.no(l.isNpo(/_/))
  t.no(l.isNpo({}))
  t.no(l.isNpo(inherit({})))
  t.no(l.isNpo(inherit(inherit({}))))
  t.no(l.isNpo(inherit(inherit(null))))

  t.ok(l.isNpo(inherit(null)))
})

t.test(function test_isDict() {
  t.no(l.isDict(undefined))
  t.no(l.isDict(null))
  t.no(l.isDict(``))
  t.no(l.isDict(l.nop))
  t.no(l.isDict([]))
  t.no(l.isDict(/_/))
  t.no(l.isDict(inherit({})))
  t.no(l.isDict(inherit(inherit({}))))
  t.no(l.isDict(inherit(inherit(null))))
  t.no(l.isDict(l.isDict.prototype))
  t.no(l.isDict(l.nop.prototype))

  t.ok(l.isDict(inherit(null)))
  t.ok(l.isDict({}))
  t.ok(l.isDict({constructor: undefined}))
})

t.test(function test_isStruct() {
  t.no(l.isStruct())
  t.no(l.isStruct(null))
  t.no(l.isStruct(``))
  t.no(l.isStruct(l.nop))
  t.no(l.isStruct([]))
  t.no(l.isStruct(new String()))
  t.no(l.isStruct(gen()))

  t.ok(l.isStruct(/_/))
  t.ok(l.isStruct({}))
  t.ok(l.isStruct(inherit({})))
  t.ok(l.isStruct(inherit(inherit({}))))
  t.ok(l.isStruct(inherit(inherit(null))))
  t.ok(l.isStruct(new Number()))
  t.ok(l.isStruct(new Boolean()))
  t.ok(l.isStruct(l.isStruct.prototype))
  t.ok(l.isStruct(l.nop.prototype))

  /*
  Most of the code using `isStruct` doesn't care about this,
  and would be slowed down. Code that does care has to opt in.
  */
  t.ok(l.isStruct(agen()))
})

t.test(function test_isArr() {
  class Arr extends Array {}

  t.no(l.isArr())
  t.no(l.isArr(``))
  t.no(l.isArr(args(10, 20)))
  t.no(l.isArr(inherit([])))

  t.ok(l.isArr([]))
  t.ok(l.isArr(new Arr()))
})

t.test(function test_isTrueArr() {
  class Arr extends Array {}

  t.no(l.isTrueArr())
  t.no(l.isTrueArr(``))
  t.no(l.isTrueArr(args(10, 20)))
  t.no(l.isTrueArr(inherit([])))

  t.no(l.isTrueArr(new Arr()))
  t.no(l.isTrueArr(Arr.of()))

  t.ok(l.isTrueArr([]))
  t.ok(l.isTrueArr(Array.of()))
})

t.test(function test_isReg() {
  t.no(l.isReg())
  t.no(l.isReg({}))

  t.ok(l.isReg(/_/))
  t.ok(l.isReg(inherit(/_/)))
})

t.test(function test_isDate() {
  t.no(l.isDate())
  t.no(l.isDate(Date.now()))
  t.no(l.isDate(new Date().toString()))

  t.ok(l.isDate(new Date()))
})

t.test(function test_isValidDate() {
  t.no(l.isValidDate())
  t.no(l.isValidDate(new Date(NaN)))

  t.ok(l.isValidDate(new Date()))
})

t.test(function test_isInvalidDate() {
  t.no(l.isInvalidDate())
  t.no(l.isInvalidDate(new Date()))

  t.ok(l.isInvalidDate(new Date(NaN)))
})

t.test(function test_isSet() {
  t.no(l.isSet())
  t.no(l.isSet(new Map()))
  t.no(l.isSet([]))
  t.no(l.isSet({}))

  t.ok(l.isSet(new Set()))
  t.ok(l.isSet(new class extends Set {}()))
})

t.test(function test_isMap() {
  t.no(l.isMap())
  t.no(l.isMap(new Set()))
  t.no(l.isMap([]))
  t.no(l.isMap({}))

  t.ok(l.isMap(new Map()))
  t.ok(l.isMap(new class extends Map {}()))
})

t.test(function test_isPromise() {
  t.no(l.isPromise())
  t.no(l.isPromise({}))

  t.ok(l.isPromise(Promise.resolve()))
  t.ok(l.isPromise({then() {}}))
  t.ok(l.isPromise({then() {}, catch() {}}))
})

t.test(function test_isIter() {
  t.no(l.isIter())
  t.no(l.isIter(null))
  t.no(l.isIter(10))
  t.no(l.isIter(true))
  t.no(l.isIter(gen))
  t.no(l.isIter(agen))
  t.no(l.isIter(agen()))
  t.no(l.isIter(``))
  t.no(l.isIter(`str`))
  t.no(l.isIter({length: 0}))
  t.no(l.isIter({size: 0}))
  t.no(l.isIter({}))
  t.no(l.isIter({next: l.nop}))
  t.no(l.isIter({[Symbol.asyncIterator]: l.nop}))

  t.ok(l.isIter(gen()))
  t.ok(l.isIter([]))
  t.ok(l.isIter(new Set()))
  t.ok(l.isIter(new Map()))
  t.ok(l.isIter(args()))
  t.ok(l.isIter(new String()))
  t.ok(l.isIter(new String(`str`)))
  t.ok(l.isIter({[Symbol.iterator]: l.nop}))
})

t.test(function test_isIterAsync() {
  t.no(l.isIterAsync())
  t.no(l.isIterAsync(null))
  t.no(l.isIterAsync(`str`))
  t.no(l.isIterAsync(gen))
  t.no(l.isIterAsync(gen()))
  t.no(l.isIterAsync([]))
  t.no(l.isIterAsync(new Set()))
  t.no(l.isIterAsync(new Map()))
  t.no(l.isIterAsync(args()))
  t.no(l.isIterAsync(agen))
  t.no(l.isIterAsync({[Symbol.iterator]: l.nop}))

  t.ok(l.isIterAsync(agen()))
  t.ok(l.isIterAsync({[Symbol.asyncIterator]: l.nop}))
})

t.test(function test_isIterator() {
  t.no(l.isIterator())
  t.no(l.isIterator(null))
  t.no(l.isIterator(10))
  t.no(l.isIterator(true))
  t.no(l.isIterator(gen))
  t.no(l.isIterator([]))
  t.no(l.isIterator(new Set()))
  t.no(l.isIterator(new Map()))
  t.no(l.isIterator(args()))
  t.no(l.isIterator(``))
  t.no(l.isIterator(new String()))
  t.no(l.isIterator({length: 0}))
  t.no(l.isIterator({size: 0}))
  t.no(l.isIterator({}))
  t.no(l.isIterator({next: l.nop}))
  t.no(l.isIterator({[Symbol.iterator]: l.nop}))
  t.no(l.isIterator({[Symbol.asyncIterator]: l.nop}))
  t.no(l.isIterator({[Symbol.asyncIterator]: l.nop, next: l.nop}))
  t.no(l.isIterator(agen))
  t.no(l.isIterator(agen()))

  t.ok(l.isIterator(gen()))
  t.ok(l.isIterator({[Symbol.iterator]: l.nop, next: l.nop}))
})

t.test(function test_isIteratorAsync() {
  t.no(l.isIteratorAsync())
  t.no(l.isIteratorAsync(null))
  t.no(l.isIteratorAsync(10))
  t.no(l.isIteratorAsync(true))
  t.no(l.isIteratorAsync(gen))
  t.no(l.isIteratorAsync([]))
  t.no(l.isIteratorAsync(new Set()))
  t.no(l.isIteratorAsync(new Map()))
  t.no(l.isIteratorAsync(args()))
  t.no(l.isIteratorAsync(``))
  t.no(l.isIteratorAsync(new String()))
  t.no(l.isIteratorAsync({length: 0}))
  t.no(l.isIteratorAsync({size: 0}))
  t.no(l.isIteratorAsync({}))
  t.no(l.isIteratorAsync({next: l.nop}))
  t.no(l.isIteratorAsync({[Symbol.iterator]: l.nop}))
  t.no(l.isIteratorAsync({[Symbol.asyncIterator]: l.nop}))
  t.no(l.isIteratorAsync({[Symbol.iterator]: l.nop, next: l.nop}))
  t.no(l.isIteratorAsync(agen))
  t.no(l.isIteratorAsync(gen()))

  t.ok(l.isIteratorAsync(agen()))
  t.ok(l.isIteratorAsync({[Symbol.asyncIterator]: l.nop, next: l.nop}))
})

t.test(function test_isGen() {
  t.no(l.isGen())
  t.no(l.isGen(null))
  t.no(l.isGen(10))
  t.no(l.isGen(true))
  t.no(l.isGen(gen))
  t.no(l.isGen(agen))
  t.no(l.isGen(agen()))
  t.no(l.isGen([]))
  t.no(l.isGen(new Set()))
  t.no(l.isGen(new Map()))
  t.no(l.isGen(args()))
  t.no(l.isGen(``))
  t.no(l.isGen(new String()))
  t.no(l.isGen({length: 0}))
  t.no(l.isGen({size: 0}))
  t.no(l.isGen({}))
  t.no(l.isGen({next: l.nop}))
  t.no(l.isGen({[Symbol.iterator]: l.nop}))

  t.no(l.isGen({
    [Symbol.iterator]: l.nop,
    next: l.nop,
  }))

  t.no(l.isGen({
    [Symbol.iterator]: l.nop,
    next: l.nop,
    return: l.nop,
  }))

  t.no(l.isGen({
    [Symbol.iterator]: l.nop,
    next: l.nop,
    throw: l.nop,
  }))

  t.no(l.isGen({
    [Symbol.iterator]: l.nop,
    return: l.nop,
    throw: l.nop,
  }))

  t.no(l.isGen({
    [Symbol.asyncIterator]: l.nop,
    next: l.nop,
    return: l.nop,
    throw: l.nop,
  }))

  t.ok(l.isGen(gen()))

  t.ok(l.isGen({
    [Symbol.iterator]: l.nop,
    next: l.nop,
    return: l.nop,
    throw: l.nop,
  }))
})

t.test(function test_isCls() {
  t.no(l.isCls(undefined))
  t.no(l.isCls({}))
  t.no(l.isCls(() => {}))
  t.no(l.isCls({}.toString))
  t.no(l.isCls(`str`))

  t.ok(l.isCls(Object))
  t.ok(l.isCls(function Cls() {}))
  t.ok(l.isCls(class Cls {}))
})

t.test(function test_isList() {
  t.no(l.isList(undefined))
  t.no(l.isList(null))
  t.no(l.isList(``))
  t.no(l.isList({length: 0}))
  t.no(l.isList(gen()))
  t.no(l.isList(new Set()))
  t.no(l.isList(new Map()))

  t.ok(l.isList([]))
  t.ok(l.isList(inherit([])))
  t.ok(l.isList(args(10, 20)))
  t.ok(l.isList(new String(``)))
})

// Also see `lang_browser_test.mjs`.`test_isSeq`.
t.test(function test_isSeq() {
  t.no(l.isSeq(undefined))
  t.no(l.isSeq(null))
  t.no(l.isSeq(10))
  t.no(l.isSeq(`str`))
  t.no(l.isSeq(false))
  t.no(l.isSeq({}))
  t.no(l.isSeq({length: 0}))
  t.no(l.isSeq(new Map()))
  t.no(l.isSeq(new URLSearchParams()))

  t.ok(l.isSeq([]))
  t.ok(l.isSeq(args()))
  t.ok(l.isSeq(gen()))
  t.ok(l.isSeq(new String(``)))
  t.ok(l.isSeq(new Set()))

  // TODO: currently not supported for technical reasons.
  // Simplest way to implement an iterable in JS.
  // Should also be considered a sequence.
  // t.ok(l.isSeq({[Symbol.iterator]: unreachable}))
})

t.test(function test_isVac() {
  function test(val, exp) {t.is(l.isVac(val), exp)}
  function empty(val) {test(val, true)}
  function full(val) {test(val, false)}
  testVac(empty, full)
})

function testVac(empty, full) {
  empty()
  empty(null)
  empty(false)
  empty(0)
  empty(NaN)
  empty(``)
  empty([])
  empty([``])
  empty([0])
  empty([NaN])
  empty([false])
  empty([[]])
  empty([[[]]])
  empty([[[], NaN]])
  empty([[[]], false])
  empty([[[0]], false])
  empty([[[0], NaN], false])

  full(true)
  full(10)
  full(`str`)
  full({})
  full([10])
  full([true])
  full([{}])
  full([[], {}])
  full([[[true]]])
  full([[], [[true]]])
}

t.test(function test_isScalar() {
  t.no(l.isScalar())
  t.no(l.isScalar(null))
  t.no(l.isScalar(Symbol()))
  t.no(l.isScalar(inherit(null)))
  t.no(l.isScalar({}))
  t.no(l.isScalar([]))
  t.no(l.isScalar(gen()))
  t.no(l.isScalar(agen()))
  t.no(l.isScalar(new class Cls {}()))
  t.no(l.isScalar(new Map()))
  t.no(l.isScalar(new Set()))
  t.no(l.isScalar(Promise.resolve()))
  t.no(l.isScalar(l.nop))
  t.no(l.isScalar(class Cls {}))

  t.ok(l.isScalar(false))
  t.ok(l.isScalar(true))
  t.ok(l.isScalar(0))
  t.ok(l.isScalar(NaN))
  t.ok(l.isScalar(Infinity))
  t.ok(l.isScalar(10))
  t.ok(l.isScalar(10n))
  t.ok(l.isScalar(``))
  t.ok(l.isScalar(`str`))
  t.ok(l.isScalar(new Boolean()))
  t.ok(l.isScalar(new Number()))
  t.ok(l.isScalar(new String()))
  t.ok(l.isScalar(new URL(`https://example.com`)))
  t.ok(l.isScalar({toString: unreachable}))
  t.ok(l.isScalar(new class Cls {toString() {unreachable()}} ()))
  t.ok(l.isScalar(new class Cls extends Array {toString() {unreachable()}} ()))
  t.ok(l.isScalar(new class Cls extends Map {toString() {unreachable()}} ()))
  t.ok(l.isScalar(new class Cls extends Set {toString() {unreachable()}} ()))
  t.ok(l.isScalar(new class Cls extends URL {} (`https://example.com`)))
})

t.test(function test_isInst() {
  // The `reqCls` assertion has been removed for performance reasons.
  //
  // t.throws(l.isInst, TypeError, `expected variant of isCls, got undefined`)
  // t.throws(() => l.isInst({}), TypeError, `expected variant of isCls, got undefined`)
  // t.throws(() => l.isInst({}, `str`), TypeError, `expected variant of isCls, got "str"`)
  // t.throws(() => l.isInst({}, () => {}), TypeError, `expected variant of isCls, got [function () => {}]`)
  // t.throws(() => l.isInst(l.nop, Function), TypeError, `expected variant of isCls, got [function Function]`)

  t.no(l.isInst(null,   Object))
  t.no(l.isInst(Object, Object))
  t.no(l.isInst({},     Array))

  t.ok(l.isInst([], Object))
  t.ok(l.isInst([], Array))
  t.ok(l.isInst({}, Object))
})

t.test(function test_isEqable() {
  t.no(l.isEqable())
  t.no(l.isEqable({}))
  t.no(l.isEqable(EqAlways))
  t.no(l.isEqable(EqNever))

  t.ok(l.isEqable(new EqAlways()))
  t.ok(l.isEqable(new EqNever()))
})

t.test(function test_isArrOf() {
  t.throws(() => l.isArrOf(),          TypeError, `expected variant of isFun, got undefined`)
  t.throws(() => l.isArrOf([]),        TypeError, `expected variant of isFun, got undefined`)
  t.throws(() => l.isArrOf([], 10),    TypeError, `expected variant of isFun, got 10`)
  t.throws(() => l.isArrOf([], `str`), TypeError, `expected variant of isFun, got "str"`)

  t.no(l.isArrOf(10,             l.isStr))
  t.no(l.isArrOf(null,           l.isStr))
  t.no(l.isArrOf(undefined,      l.isStr))
  t.no(l.isArrOf(`str`,          l.isStr))
  t.no(l.isArrOf({},             l.isStr))
  t.no(l.isArrOf([10],           l.isStr))
  t.no(l.isArrOf([`one`, 10],    l.isStr))
  t.no(l.isArrOf([`one`, 10],    l.isFin))

  t.ok(l.isArrOf([],             l.isStr))
  t.ok(l.isArrOf([`one`, `two`], l.isStr))
  t.ok(l.isArrOf([10, 20],       l.isFin))
})

t.test(function test_isEmpty() {
  t.no(l.isEmpty([0]))
  t.no(l.isEmpty([[]]))
  t.no(l.isEmpty({}))
  t.no(l.isEmpty({length: 0}))
  t.no(l.isEmpty({size: 0}))
  t.no(l.isEmpty(args(0)))

  t.ok(l.isEmpty())
  t.ok(l.isEmpty(10))
  t.ok(l.isEmpty(`str`))
  t.ok(l.isEmpty([]))
  t.ok(l.isEmpty(new Set()))
  t.ok(l.isEmpty(new Map()))
  t.ok(l.isEmpty(args()))
})

t.test(function test_hasOwn() {
  t.no(l.hasOwn(undefined,               `toString`))
  t.no(l.hasOwn(10,                      `toString`))
  t.no(l.hasOwn(`str`,                   `toString`))
  t.no(l.hasOwn({},                      `toString`))
  t.ok(l.hasOwn({toString: 10},          `toString`))
  t.no(l.hasOwn(inherit({toString: 10}), `toString`))

  t.ok(l.hasOwn(inherit(null, {toString: {value: 10, enumerable: true}}), `toString`))
  t.ok(l.hasOwn(inherit(null, {toString: {value: 10, enumerable: false}}), `toString`))
  t.no(l.hasOwn(inherit(inherit(null, {toString: {value: 10, enumerable: true}})), `toString`))
  t.no(l.hasOwn(inherit(inherit(null, {toString: {value: 10, enumerable: false}})), `toString`))
})

t.test(function test_hasOwnEnum() {
  t.no(l.hasOwnEnum(undefined,               `toString`))
  t.no(l.hasOwnEnum(10,                      `toString`))
  t.no(l.hasOwnEnum(`str`,                   `toString`))
  t.no(l.hasOwnEnum({},                      `toString`))
  t.ok(l.hasOwnEnum({toString: 10},          `toString`))
  t.no(l.hasOwnEnum(inherit({toString: 10}), `toString`))

  t.ok(l.hasOwnEnum(inherit(null, {toString: {value: 10, enumerable: true}}), `toString`))
  t.no(l.hasOwnEnum(inherit(null, {toString: {value: 10, enumerable: false}}), `toString`))
  t.no(l.hasOwnEnum(inherit(inherit(null, {toString: {value: 10, enumerable: true}})), `toString`))
  t.no(l.hasOwnEnum(inherit(inherit(null, {toString: {value: 10, enumerable: false}})), `toString`))
})

t.test(function test_hasInherited() {
  t.no(l.hasInherited(undefined,         `toString`))
  t.ok(l.hasInherited(Object(undefined), `toString`))

  t.no(l.hasInherited(10,         `toString`))
  t.ok(l.hasInherited(Object(10), `toString`))

  t.no(l.hasInherited(`str`,         `toString`))
  t.ok(l.hasInherited(Object(`str`), `toString`))

  t.no(l.hasInherited([], `length`))
  t.ok(l.hasOwn([],       `length`))
  t.no(l.hasOwnEnum([],   `length`))

  t.ok(l.hasInherited(inherit([]), `length`))
  t.no(l.hasOwn(inherit([]),       `length`))
  t.no(l.hasOwnEnum(inherit([]),   `length`))

  t.no(l.hasInherited({length: undefined},          `length`))
  t.no(l.hasInherited({length: 0},                  `length`))
  t.no(l.hasInherited({length: 10},                 `length`))
  t.ok(l.hasInherited(inherit({length: undefined}), `length`))

  t.no(l.hasInherited([10, 20, 30], 0))
  t.no(l.hasInherited([10, 20, 30], `0`))
  t.ok(l.hasOwnEnum([10, 20, 30], 0))
  t.ok(l.hasOwnEnum([10, 20, 30], `0`))

  t.no(l.hasInherited([10, 20, 30], 1))
  t.no(l.hasInherited([10, 20, 30], `1`))
  t.ok(l.hasOwnEnum([10, 20, 30], 1))
  t.ok(l.hasOwnEnum([10, 20, 30], `1`))

  t.no(l.hasInherited([10, 20, 30], 3))
  t.no(l.hasInherited([10, 20, 30], `3`))
  t.no(l.hasOwnEnum([10, 20, 30], 3))
  t.no(l.hasOwnEnum([10, 20, 30], `3`))
})

t.test(function test_hasMeth() {
  t.no(l.hasMeth())
  t.no(l.hasMeth(undefined, `toString`))
  t.no(l.hasMeth(inherit(null), `toString`))
  t.no(l.hasMeth(10, `toString`))
  t.no(l.hasMeth(`str`, `toString`))
  t.no(l.hasMeth({}, `call`))
  t.no(l.hasMeth({}, `bind`))
  t.no(l.hasMeth({key: `val`}, `key`))

  t.ok(l.hasMeth({}, `toString`))
  t.ok(l.hasMeth([], `toString`))
  t.ok(l.hasMeth(new Number(10), `toString`))
  t.ok(l.hasMeth(new String(`str`), `toString`))
  t.ok(l.hasMeth(l.nop, `toString`))
  t.ok(l.hasMeth(l.nop, `call`))
  t.ok(l.hasMeth(l.nop, `bind`))
  t.ok(l.hasMeth({key() {}}, `key`))
})

t.test(function test_eq() {
  /*
  Note: `l.eq` does NOT perform a structural comparison, which would be
  expensive and often incorrect. It uses referential equality via `l.is`,
  falling back on custom `.eq()` in classes that implement this interface.
  This approach is not universal, but avoids: ludicrous inefficienties
  such as walking arbitrarily large structs; semantic errors such as
  considering all promises to be equal.
  */
  t.test(function test_different() {
    function test(one, two) {t.no(l.eq(one, two))}

    test(undefined, null)
    test(undefined, NaN)
    test([], [])
    test({}, {})
    test(Object.create(null), Object.create(null))
    test(l.Emp(), l.Emp())
    test(new EqNever(), new EqNever())
  })

  t.test(function test_same() {
    t.test(function test_one() {
      function test(val) {t.ok(l.eq(val, val))}

      test()
      test(null)
      test(false)
      test(true)
      test(NaN)
      test(10)
      test(-10)
      test(``)
      test(`str`)
      test(l.nop)
      test(new EqAlways())
      test(new EqNever())
    })

    t.test(function test_two() {
      function test(one, two) {t.ok(l.eq(one, two))}

      test(l.nop, l.nop)
      test(-0, +0)
      test(new EqAlways(), new EqAlways())
    })
  })
})

t.test(function test_setProto() {
  class BrokenSuper {
    constructor() {return inherit(BrokenSuper.prototype)}
  }

  class UnfixedSub extends BrokenSuper {}

  class FixedSub extends BrokenSuper {
    constructor() {l.setProto(super(), new.target)}
  }

  t.is(Object.getPrototypeOf(new BrokenSuper()), BrokenSuper.prototype)
  t.is(Object.getPrototypeOf(new UnfixedSub()), BrokenSuper.prototype)
  t.is(Object.getPrototypeOf(new FixedSub()), FixedSub.prototype)
})

t.test(function test_Emp() {
  testNpo(l.Emp())
  testNpo(new l.Emp())

  t.throws(
    () => new l.Emp() instanceof l.Emp,
    TypeError,
    `Function has non-object prototype 'null' in instanceof check`,
  )

  class Sub extends l.Emp {}

  t.is(Object.getPrototypeOf(Sub.prototype), null)

  t.eq(Object.getOwnPropertyDescriptors(Sub.prototype), {
    constructor: {
      value: Sub,
      writable: true,
      enumerable: false,
      configurable: true,
    },
  })

  t.inst(new Sub(), Sub)
  testEmpty(new Sub())
})

function testNpo(val) {
  t.is(Object.getPrototypeOf(val), null)
  testEmpty(val)
}

function testEmpty(val) {
  t.no(val instanceof Object)
  t.own(val, {})
  t.no(`toString` in val)
}

t.test(function test_req() {
  t.test(function test_invalid() {
    t.throws(() => l.req(true, null), TypeError, `expected validator function, got null`)
    t.throws(() => l.req(true, 10), TypeError, `expected validator function, got 10`)
  })

  t.test(function test_rejected() {
    t.throws(() => l.req(10, False), TypeError, `expected variant of False, got 10`)
    t.throws(() => l.req(`str`, False), TypeError, `expected variant of False, got "str"`)
  })

  t.test(function test_valid() {
    function test(val, fun) {t.is(l.req(val, fun), val)}
    test(null, True)
    test(10, True)
    test(`str`, True)
    test([], True)
    test({}, True)
  })
})

t.test(function test_reqOneOf() {
  testOneOf(l.reqOneOf)

  t.throws(() => l.reqOneOf(undefined, []), TypeError, `expected variant of [], got undefined`)
  t.throws(() => l.reqOneOf(undefined, [l.isStr]), TypeError, `expected variant of [isStr], got undefined`)
})

function testOneOf(fun) {
  t.throws(() => fun(10), TypeError, `expected variant of isArr, got undefined`)
  t.throws(() => fun(10, {}), TypeError, `expected variant of isArr, got {}`)
  t.throws(() => fun(10, []), TypeError, `expected variant of [], got 10`)
  t.throws(() => fun(10, [l.isStr]), TypeError, `expected variant of [isStr], got 10`)
  t.throws(() => fun(10, [l.isStr, l.isBool]), TypeError, `expected variant of [isStr, isBool], got 10`)

  function test(val, funs) {t.is(fun(val, funs), val)}

  test(undefined, [l.isNil])
  test(10, [l.isNum])
  test(`str`, [l.isStr])
  test({}, [l.isObj])

  for (const val of [undefined, null]) {
    for (const funs of [[l.isNil], [l.isNil, l.isStr], [l.isStr, l.isNil]]) {
      test(val, funs)
    }
  }

  for (const val of [10, `str`, {}]) {
    for (const funs of [
      [l.isStr, l.isNum, l.isObj],
      [l.isStr, l.isObj, l.isNum],
      [l.isObj, l.isStr, l.isNum],
    ]) {
      test(val, funs)
    }
  }
}

t.test(function test_opt() {
  t.test(function test_invalid() {
    t.throws(() => l.opt(10, undefined), TypeError, `expected validator function, got undefined`)
    t.throws(() => l.opt(undefined, 10), TypeError, `expected validator function, got 10`)
  })

  t.test(function test_rejected() {
    t.throws(() => l.opt(10,    False), TypeError, `expected variant of False, got 10`)
    t.throws(() => l.opt(`str`, False), TypeError, `expected variant of False, got "str"`)
  })

  t.test(function test_nil() {
    t.is(l.opt(undefined, False), undefined)
    t.is(l.opt(null,      False), null)
  })

  t.test(function test_valid() {
    function test(val, fun) {t.is(l.opt(val, fun), val)}
    test(null,  True)
    test(10,    True)
    test(`str`, True)
    test([],    True)
    test({},    True)
  })
})

t.test(function test_optOneOf() {
  testOneOf(l.optOneOf)

  function test(val, funs) {t.is(l.optOneOf(val, funs), val)}

  for (const val of [undefined, null]) {
    for (const funs of [undefined, [], [l.isStr]]) {
      test(val, funs)
    }
  }
})

t.test(function test_reqInst() {
  t.test(function test_rejected() {
    t.throws(() => l.reqInst(undefined, Object), TypeError, `expected instance of Object, got undefined`)
    t.throws(() => l.reqInst(`str`,     String), TypeError, `expected instance of String, got "str"`)
    t.throws(() => l.reqInst({},        String), TypeError, `expected instance of String, got instance of Object {}`)
  })

  t.test(function test_valid() {
    function test(val, cls) {t.is(l.reqInst(val, cls), val)}
    test({},             Object)
    test([],             Object)
    test([],             Array)
    test(new String(``), Object)
    test(new String(``), String)
  })
})

t.test(function test_optInst() {
  t.test(function test_invalid() {
    t.throws(l.optInst,           TypeError, `expected variant of isCls, got undefined`)
    t.throws(() => l.optInst({}), TypeError, `expected variant of isCls, got undefined`)
  })

  t.test(function test_rejected() {
    t.throws(() => l.optInst(`str`, Object), TypeError, `expected instance of Object, got "str"`)
    t.throws(() => l.optInst(`str`, String), TypeError, `expected instance of String, got "str"`)
    t.throws(() => l.optInst({},    String), TypeError, `expected instance of String, got instance of Object {}`)
  })

  t.test(function test_nil() {
    function test(val) {
      t.is(l.optInst(val, Object), val)
      t.is(l.optInst(val, Array), val)
      t.is(l.optInst(val, String), val)
    }
    test(undefined)
    test(null)
  })

  t.test(function test_valid() {
    function test(val, cls) {t.is(l.optInst(val, cls), val)}
    test({},             Object)
    test([],             Object)
    test([],             Array)
    test(new String(``), Object)
    test(new String(``), String)
  })
})

t.test(function test_only() {
  t.test(function test_invalid() {
    t.throws(l.only,                         TypeError, `expected validator function, got undefined`)
    t.throws(() => l.only(undefined, `str`), TypeError, `expected validator function, got "str"`)
  })

  t.test(function test_empty() {
    function test(val) {t.is(l.only(val, False), undefined)}

    test(true)
    test(`str`)
    test(10)
    test({one: 10})
    test([10, 20, 30])
  })

  t.test(function test_full() {
    function test(val) {t.is(l.only(val, True), val)}

    test(true)
    test(`str`)
    test(10)
    test({one: 10})
    test([10, 20, 30])
  })
})

t.test(function test_onlyInst() {
  function none(val, cls) {t.is(l.onlyInst(val, cls), undefined)}
  function same(val, cls) {t.is(l.onlyInst(val, cls), val)}

  none(undefined, Object)
  none(10, Object)
  none(10, Number)
  none(Object(10), String)
  none(Object(10), Array)
  none(`str`, Object)
  none(`str`, String)
  none(`str`, Number)
  none(`str`, Array)
  none(Object(`str`), Array)
  none({}, Array)

  same({}, Object)
  same(Object(10), Object)
  same(Object(10), Number)
  same(Object(`str`), Object)
  same(Object(`str`), String)
  same([], Array)
})

t.test(function test_reqPrim() {
  t.throws(() => l.reqPrim([]), TypeError, `expected variant of isPrim`)
  t.throws(() => l.reqPrim({}), TypeError, `expected variant of isPrim`)
  t.throws(() => l.reqPrim(l.reqPrim), TypeError, `expected variant of isPrim`)

  t.is(l.reqPrim(), undefined)
  t.is(l.reqPrim(undefined), undefined)
  t.is(l.reqPrim(null), null)
  t.is(l.reqPrim(`one`), `one`)
  t.is(l.reqPrim(10), 10)
  t.is(l.reqPrim(true), true)
  t.is(l.reqPrim(false), false)
  t.is(l.reqPrim(NaN), NaN)
  t.is(l.reqPrim(Infinity), Infinity)
  t.is(l.reqPrim(Symbol.for()), Symbol.for())
})

t.test(function test_laxBool() {
  t.throws(() => l.laxBool([]),            TypeError, `expected variant of isBool`)
  t.throws(() => l.laxBool({}),            TypeError, `expected variant of isBool`)
  t.throws(() => l.laxBool(0),             TypeError, `expected variant of isBool`)
  t.throws(() => l.laxBool(1),             TypeError, `expected variant of isBool`)
  t.throws(() => l.laxBool(`true`),        TypeError, `expected variant of isBool`)
  t.throws(() => l.laxBool(`false`),       TypeError, `expected variant of isBool`)
  t.throws(() => l.laxBool(new Boolean()), TypeError, `expected variant of isBool`)

  t.is(l.laxBool(), false)
  t.is(l.laxBool(null), false)
  t.is(l.laxBool(false), false)
  t.is(l.laxBool(true), true)
})

t.test(function test_laxNum() {
  t.throws(() => l.laxNum([]),           TypeError, `expected variant of isNum`)
  t.throws(() => l.laxNum({}),           TypeError, `expected variant of isNum`)
  t.throws(() => l.laxNum(`str`),        TypeError, `expected variant of isNum`)
  t.throws(() => l.laxNum(true),         TypeError, `expected variant of isNum`)
  t.throws(() => l.laxNum(new Number()), TypeError, `expected variant of isNum`)

  t.is(l.laxNum(), 0)
  t.is(l.laxNum(null), 0)
  t.is(l.laxNum(10), 10)
  t.is(l.laxNum(-10), -10)
  t.is(l.laxNum(NaN), NaN)
  t.is(l.laxNum(Infinity), Infinity)
  t.is(l.laxNum(-Infinity), -Infinity)
})

t.test(function test_laxFin() {
  t.throws(() => l.laxFin([]),           TypeError, `expected variant of isFin`)
  t.throws(() => l.laxFin({}),           TypeError, `expected variant of isFin`)
  t.throws(() => l.laxFin(`str`),        TypeError, `expected variant of isFin`)
  t.throws(() => l.laxFin(true),         TypeError, `expected variant of isFin`)
  t.throws(() => l.laxFin(new Number()), TypeError, `expected variant of isFin`)
  t.throws(() => l.laxFin(NaN),          TypeError, `expected variant of isFin`)
  t.throws(() => l.laxFin(Infinity),     TypeError, `expected variant of isFin`)
  t.throws(() => l.laxFin(-Infinity),    TypeError, `expected variant of isFin`)

  t.is(l.laxFin(), 0)
  t.is(l.laxFin(null), 0)
  t.is(l.laxFin(10), 10)
  t.is(l.laxFin(-10), -10)
})

t.test(function test_laxInt() {
  t.throws(() => l.laxInt([]),           TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt({}),           TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt(`str`),        TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt(true),         TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt(new Number()), TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt(NaN),          TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt(Infinity),     TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt(-Infinity),    TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt(0.1),          TypeError, `expected variant of isInt`)
  t.throws(() => l.laxInt(-0.1),         TypeError, `expected variant of isInt`)

  t.is(l.laxInt(), 0)
  t.is(l.laxInt(null), 0)
  t.is(l.laxInt(-10), -10)
  t.is(l.laxInt(0), 0)
  t.is(l.laxInt(10), 10)
})

t.test(function test_laxNat() {
  t.throws(() => l.laxNat([]),           TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat({}),           TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(`str`),        TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(true),         TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(new Number()), TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(NaN),          TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(Infinity),     TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(-Infinity),    TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(0.1),          TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(-0.1),         TypeError, `expected variant of isNat`)
  t.throws(() => l.laxNat(-10),          TypeError, `expected variant of isNat`)

  t.is(l.laxNat(), 0)
  t.is(l.laxNat(null), 0)
  t.is(l.laxNat(0), 0)
  t.is(l.laxNat(1), 1)
  t.is(l.laxNat(10), 10)
})

t.test(function test_laxStr() {
  t.throws(() => l.laxStr([]),           TypeError, `expected variant of isStr`)
  t.throws(() => l.laxStr({}),           TypeError, `expected variant of isStr`)
  t.throws(() => l.laxStr(true),         TypeError, `expected variant of isStr`)
  t.throws(() => l.laxStr(new String()), TypeError, `expected variant of isStr`)
  t.throws(() => l.laxStr(10),           TypeError, `expected variant of isStr`)

  t.is(l.laxStr(), ``)
  t.is(l.laxStr(null), ``)
  t.is(l.laxStr(``), ``)
  t.is(l.laxStr(`str`), `str`)
})

t.test(function test_laxDict() {
  t.throws(() => l.laxDict([]),                              TypeError, `expected variant of isDict`)
  t.throws(() => l.laxDict(inherit(inherit(inherit(null)))), TypeError, `expected variant of isDict`)
  t.throws(() => l.laxDict(true),                            TypeError, `expected variant of isDict`)
  t.throws(() => l.laxDict(10),                              TypeError, `expected variant of isDict`)
  t.throws(() => l.laxDict(`str`),                           TypeError, `expected variant of isDict`)
  t.throws(() => l.laxDict(new String()),                    TypeError, `expected variant of isDict`)

  t.is(Object.getPrototypeOf(l.laxDict()), null)
  t.eq(l.laxDict(), {})
  t.eq(l.laxDict(null), {})
  t.eq(l.laxDict(inherit(null)), {})
  t.eq(l.laxDict({one: 10}), {one: 10})

  const ref = {one: 10}
  t.is(l.laxDict(ref), ref)
})

t.test(function test_laxStruct() {
  t.throws(() => l.laxStruct([]),           TypeError, `expected variant of isStruct`)
  t.throws(() => l.laxStruct(true),         TypeError, `expected variant of isStruct`)
  t.throws(() => l.laxStruct(10),           TypeError, `expected variant of isStruct`)
  t.throws(() => l.laxStruct(`str`),        TypeError, `expected variant of isStruct`)
  t.throws(() => l.laxStruct(new String()), TypeError, `expected variant of isStruct`)

  t.is(Object.getPrototypeOf(l.laxStruct()), null)
  t.eq(l.laxStruct(), {})
  t.eq(l.laxStruct(null), {})
  t.eq(l.laxStruct(inherit(null)), {})
  t.eq(l.laxStruct({one: 10}), {one: 10})

  const ref = inherit(inherit({one: 10}))
  t.is(l.laxStruct(ref), ref)
})

t.test(function test_reqScalar() {
  t.throws(() => l.reqScalar({}), TypeError, `expected variant of isScalar, got {}`)
  t.throws(() => l.reqScalar([]), TypeError, `expected variant of isScalar, got []`)

  function test(val) {t.is(l.reqScalar(val), val)}

  test(10)
  test(true)
  test(`str`)
  test({toString: unreachable})
})

t.test(function test_bind() {
  t.throws(l.bind, TypeError, `expected variant of isFun, got undefined`)

  t.is(l.bind(l.add)(10, 20), l.add(10, 20))
  t.is(l.bind(l.add, 10)(20), l.add(10, 20))
  t.is(l.bind(l.add, 10, 20)(), l.add(10, 20))

  t.test(function test_bind_this() {
    function self() {return this}
    function test(ref) {t.is(l.bind.call(ref, self)(), ref)}

    test()
    test(10)
    test(`str`)
    test({})
    test([])
  })
})

t.test(function test_not() {
  t.throws(l.not, TypeError, `expected variant of isFun, got undefined`)

  t.is(l.not(l.add)(10, 20), !l.add(10, 20))
  t.no(l.not(l.add)(10, 20))

  t.is(l.not(l.add)(-10, 10), !l.add(-10, 10))
  t.ok(l.not(l.add)(-10, 10))
})

t.test(function test_nop() {
  t.is(l.nop(), undefined)
  t.is(l.nop(10), undefined)
  t.is(l.nop(l.nop), undefined)
})

t.test(function test_id() {
  t.is(l.id(), undefined)
  t.is(l.id(null), null)
  t.is(l.id(10), 10)
  t.is(l.id(l.nop), l.nop)
})

t.test(function test_val() {
  function test(val) {
    const fun = l.val(val)
    t.is(fun(), val)
    t.is(fun(), val)
  }

  test()
  test(null)
  test([])
  test({})
  test(Symbol())
})

t.test(function test_panic() {
  t.test(function test_nil() {
    l.panic()
    l.panic(undefined)
    l.panic(null)
  })

  /*
  This doesn't use `t.throws` because it would enforce throwing instances of
  `Error`, while `l.panic` has no such restrictions.
  */
  function test(val) {
    try {
      l.panic(val)
      throw Error(`failed to panic`)
    }
    catch (err) {
      t.is(err, val)
      return
    }
  }

  test(10)
  test(`str`)
  test(Error(`err`))
})

t.test(function test_True() {
  t.ok(l.True())
  t.ok(l.True(true))
  t.ok(l.True(false))
  t.ok(l.True(0))
  t.ok(l.True(10))
})

t.test(function test_False() {
  t.no(l.False())
  t.no(l.False(true))
  t.no(l.False(false))
  t.no(l.False(0))
  t.no(l.False(10))
})

t.test(function test_add() {
  t.is(l.add(), undefined + undefined)
  t.is(l.add(`7`, 3), `7${3}`)
  t.is(l.add(7, 3), 7 + 3)
})

t.test(function test_sub() {
  t.is(l.sub(), undefined - undefined)
  t.is(l.sub(`7`, 3), `7` - 3)
  t.is(l.sub(7, 3), 7 - 3)
})

t.test(function test_mul() {
  t.is(l.mul(), undefined * undefined)
  t.is(l.mul(`7`, 3), `7` * 3)
  t.is(l.mul(7, 3), 7 * 3)
})

t.test(function test_div() {
  t.is(l.div(), undefined / undefined)
  t.is(l.div(`7`, 3), `7` / 3)
  t.is(l.div(7, 3), 7 / 3)
})

t.test(function test_rem() {
  t.is(l.rem(), undefined % undefined)
  t.is(l.rem(`1.1`, 1), `1.1` % 1)
  t.is(l.rem(1.1, 1), 1.1 % 1)
  t.is(l.rem(2.3, 1), 2.3 % 1)
  t.is(l.rem(33, 2), 33 % 2)
})

t.test(function test_lt() {
  t.is(l.lt(), undefined < undefined)
  t.is(l.lt(`10`, 20), `10` < 20)
  t.is(l.lt(10, 10), 10 < 10)
  t.is(l.lt(10, -10), 10 < -10)
  t.is(l.lt(10, 10.1), 10 < 10.1)
  t.is(l.lt(10.1, 10), 10.1 < 10)
  t.is(l.lt(10, 20), 10 < 20)
  t.is(l.lt(20, 10), 20 < 10)
})

t.test(function test_gt() {
  t.is(l.gt(), undefined > undefined)
  t.is(l.gt(`10`, 20), `10` > 20)
  t.is(l.gt(10, 10), 10 > 10)
  t.is(l.gt(10, -10), 10 > -10)
  t.is(l.gt(10, 10.1), 10 > 10.1)
  t.is(l.gt(10.1, 10), 10.1 > 10)
  t.is(l.gt(10, 20), 10 > 20)
  t.is(l.gt(20, 10), 20 > 10)
})

t.test(function test_lte() {
  t.is(l.lte(), undefined <= undefined)
  t.is(l.lte(`10`, 20), `10` <= 20)
  t.is(l.lte(10, 10), 10 <= 10)
  t.is(l.lte(10, -10), 10 <= -10)
  t.is(l.lte(10, 10.1), 10 <= 10.1)
  t.is(l.lte(10.1, 10), 10.1 <= 10)
  t.is(l.lte(10, 20), 10 <= 20)
  t.is(l.lte(20, 10), 20 <= 10)
})

t.test(function test_gte() {
  t.is(l.gte(), undefined >= undefined)
  t.is(l.gte(`10`, 20), `10` >= 20)
  t.is(l.gte(10, 10), 10 >= 10)
  t.is(l.gte(10, -10), 10 >= -10)
  t.is(l.gte(10, 10.1), 10 >= 10.1)
  t.is(l.gte(10.1, 10), 10.1 >= 10)
  t.is(l.gte(10, 20), 10 >= 20)
  t.is(l.gte(20, 10), 20 >= 10)
})

t.test(function test_neg() {
  t.is(l.neg(), NaN)
  t.is(l.neg(-1), 1)
  t.is(l.neg(0), -0) // WTF
  t.is(l.neg(1), -1)
  t.is(l.neg(-10), 10)
  t.is(l.neg(0), -0) // WTF
  t.is(l.neg(10), -10)
  t.is(l.neg(`str`), NaN)
  t.is(l.neg(`10`), -10)
})

t.test(function test_inc() {
  t.is(l.inc(), undefined + 1)
  t.is(l.inc(`one`), `one${1}`)
  t.is(l.inc(NaN), NaN + 1)
  t.is(l.inc(-2), -2 + 1)
  t.is(l.inc(1), 1 + 1)
})

t.test(function test_dec() {
  t.is(l.dec(), undefined - 1)
  t.is(l.dec(`one`), `one` - 1)
  t.is(l.dec(NaN), NaN - 1)
  t.is(l.dec(-2), -2 - 1)
  t.is(l.dec(2), 2 - 1)
})

t.test(function test_vac() {
  function test(val, exp) {t.is(l.vac(val), exp)}
  function empty(val) {test(val, undefined)}
  function full(val) {test(val, val)}
  testVac(empty, full)
})

t.test(function test_toInst() {
  t.test(function test_indirectly_reject_invalid_inputs() {
    class Mock {constructor() {unreachable()}}

    t.throws(() => l.toInst(),                TypeError, `not a constructor`)
    t.throws(() => l.toInst(`str`,     Mock), Error, `unreachable`)
    t.throws(() => l.toInst(10,        Mock), Error, `unreachable`)
    t.throws(() => l.toInst(l.nop,     Mock), Error, `unreachable`)
    t.throws(() => l.toInst([],        Mock), Error, `unreachable`)
    t.throws(() => l.toInst(new Set(), Mock), Error, `unreachable`)
  })

  t.test(function test_instantiate_from_dict() {
    class Mock {}
    t.ok(l.toInst({}, Mock) instanceof Mock)
  })

  t.test(function test_preserve_pre_instantiated() {
    class Mock {}
    const val = new Mock()
    t.is(l.toInst(val, Mock), val)
    t.is(l.toInst(l.toInst(val, Mock), Mock), val)
  })

  t.test(function test_upgrade_to_subclass() {
    class Sup {}
    class Sub extends Sup {}
    t.is(l.toInst(new Sup(), Sub).constructor, Sub)
  })
})

t.test(function test_get() {
  t.is(l.get(undefined, `toString`), undefined)
  t.is(l.get(undefined, 0), undefined)

  t.is(l.get(10, `toString`), undefined)
  t.is(l.get(10, 0), undefined)

  t.is(l.get(`str`, `toString`), undefined)
  t.is(l.get(`str`, 0), undefined)

  t.is(l.get({}, `key`), undefined)
  t.is(l.get({}, 0), undefined)

  t.is(l.get({}, `toString`), Object.prototype.toString)
  t.is(l.get({key: 10}, `key`), 10)
  t.is(l.get({0: 10}, `0`), 10)

  t.is(l.get([], `key`), undefined)
  t.is(l.get([], 0), undefined)
  t.is(l.get([], `0`), undefined)

  t.is(l.get([], `toString`), Array.prototype.toString)
  t.is(l.get([10, 20, 30], 0), 10)
  t.is(l.get([10, 20, 30], 1), 20)
})

if (import.meta.main) console.log(`[test] ok!`)
