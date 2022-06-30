import './internal_test_init.mjs'
import * as l from '../lang.mjs'
import * as t from '../test.mjs'
import * as i from '../iter.mjs'
import * as s from '../str.mjs'

/* Util */

// Just most of the printables. Might consider full ASCII later.
const ASCII = (
  `ABCDEFGHIJKLMNOPQRSTUVWXYZ` +
  `abcdefghijklmnopqrstuvwxyz` +
  `0123456789` +
  `-=\\[];',./~!@#$%^&*()_+|{}:"<>? \n\r\t\v` +
  '`'
)

const NARROW = ASCII + `…µ←↓↑→`
const UNI = `🙂😁😛`
const BLANK = ` \t\v\r\n`

function isHexStr(val) {
  return l.isStr(val) && /^\p{Hex_Digit}*$/u.test(val)
}

function testHex(val, len) {
  l.req(val, isHexStr)
  t.is(val.length, len * 2)
}

function testMap(src, exp) {
  l.reqInst(src, s.StrMap)
  t.eq([...src], exp)
}

/*
TODO consider moving to `test.mjs` and upgrading. The purpose is to verify that
while the structure is identical, there are NO shared mutable references at any
depth. May require a more flexible implementation of `equal`.
*/
function testEquiv(one, two) {
  t.isnt(one, two)
  t.eq(one, two)
}

// TODO consider moving to `test.mjs`.
function mockInst(cls, ...val) {
  return Object.assign(Object.create(cls.prototype), ...val)
}

/* Test */

t.test(function test_isBlank() {
  t.no(s.isBlank(BLANK + `_`))

  t.ok(s.isBlank(BLANK))
})

t.test(function test_isAscii() {
  t.no(s.isAscii(NARROW))
  t.no(s.isAscii(UNI))

  t.ok(s.isAscii(ASCII))
})

t.test(function test_isNarrow() {
  t.no(s.isNarrow(UNI))

  t.ok(s.isNarrow(ASCII))
  t.ok(s.isNarrow(NARROW))
})

t.test(function test_isUni() {
  t.no(s.isUni(ASCII))
  t.no(s.isUni(NARROW))

  t.ok(s.isUni(UNI))
})

t.test(function test_lenStr() {
  t.is(s.lenStr(``), 0)
  t.is(s.lenStr(`one two three`), 13)
  t.is(s.lenStr(`🐒🐴🦖🦔🐲🐈`), 12)
  t.is(s.lenStr(`🐒a🐴b🦖c🦔d🐲e🐈`), 17)
})

t.test(function test_lenUni() {
  t.is(s.lenUni(``), 0)
  t.is(s.lenUni(`one two three`), 13)
  t.is(s.lenUni(`🐒🐴🦖🦔🐲🐈`), 6)
  t.is(s.lenUni(`🐒a🐴b🦖c🦔d🐲e🐈`), 11)
})

t.test(function test_ell() {
  function test(src, len, exp) {t.is(s.ell(src, len), exp)}

  t.test(function test_narrow() {
    const src = `one two`
    test(src, 0, ``)
    test(src, 1, `…`)
    test(src, 2, `o…`)
    test(src, 3, `on…`)
    test(src, 4, `one…`)
    test(src, 5, `one …`)
    test(src, 6, `one t…`)
    test(src, 7, `one two`)
    test(src, 8, `one two`)
    test(src, 9, `one two`)
  })

  t.test(function test_uni() {
    const src = `🐒🐴🦖🦔🐲🐈`
    test(src, 0, ``)
    test(src, 1, `…`)
    test(src, 2, `🐒…`)
    test(src, 3, `🐒🐴…`)
    test(src, 4, `🐒🐴🦖…`)
    test(src, 5, `🐒🐴🦖🦔…`)
    test(src, 6, `🐒🐴🦖🦔🐲🐈`)
    test(src, 7, `🐒🐴🦖🦔🐲🐈`)
    test(src, 8, `🐒🐴🦖🦔🐲🐈`)
    test(src, 9, `🐒🐴🦖🦔🐲🐈`)
  })

  t.test(function test_mix() {
    const src = `🐒a🐴b🦖c🦔d🐲e🐈`
    test(src, 0, ``)
    test(src, 1, `…`)
    test(src, 2, `🐒…`)
    test(src, 3, `🐒a…`)
    test(src, 4, `🐒a🐴…`)
    test(src, 5, `🐒a🐴b…`)
    test(src, 6, `🐒a🐴b🦖…`)
    test(src, 7, `🐒a🐴b🦖c…`)
    test(src, 8, `🐒a🐴b🦖c🦔…`)
    test(src, 9, `🐒a🐴b🦖c🦔d…`)
    test(src, 10, `🐒a🐴b🦖c🦔d🐲…`)
    test(src, 11, `🐒a🐴b🦖c🦔d🐲e🐈`)
    test(src, 12, `🐒a🐴b🦖c🦔d🐲e🐈`)
    test(src, 13, `🐒a🐴b🦖c🦔d🐲e🐈`)
  })
})

// TODO test Unicode.
t.test(function test_words() {
  function test(src, exp) {t.eq(s.words(src), s.Words.from(exp))}

  test(``, [])
  test(` `, [])

  test(`one`, [`one`])
  test(`one two`, [`one`, `two`])
  test(`one two three`, [`one`, `two`, `three`])
  test(`one  two  three`, [`one`, `two`, `three`])
  test(`One Two Three`, [`One`, `Two`, `Three`])
  test(`ONE TWO THREE`, [`ONE`, `TWO`, `THREE`])
  test(`one12 two34 three56`, [`one12`, `two34`, `three56`])
  test(`One12 Two34 Three56`, [`One12`, `Two34`, `Three56`])
  test(`ONE12 TWO34 THREE56`, [`ONE12`, `TWO34`, `THREE56`])

  test(`one_two_three`, [`one`, `two`, `three`])
  test(`one_Two_Three`, [`one`, `Two`, `Three`])
  test(`One_Two_Three`, [`One`, `Two`, `Three`])
  test(`ONE_TWO_THREE`, [`ONE`, `TWO`, `THREE`])
  test(`one12_two34_three56`, [`one12`, `two34`, `three56`])
  test(`one12_Two34_Three56`, [`one12`, `Two34`, `Three56`])
  test(`One12_Two34_Three56`, [`One12`, `Two34`, `Three56`])
  test(`ONE12_TWO34_THREE56`, [`ONE12`, `TWO34`, `THREE56`])

  test(`oneTwoThree`, [`one`, `Two`, `Three`])
  test(`OneTwoThree`, [`One`, `Two`, `Three`])
  test(`one12Two34Three56`, [`one12`, `Two34`, `Three56`])
  test(`One12Two34Three56`, [`One12`, `Two34`, `Three56`])

  test(`one-two-three`, [`one`, `two`, `three`])
  test(`one-Two-Three`, [`one`, `Two`, `Three`])
  test(`One-Two-Three`, [`One`, `Two`, `Three`])
  test(`ONE-TWO-THREE`, [`ONE`, `TWO`, `THREE`])
  test(`one12-two34-three56`, [`one12`, `two34`, `three56`])
  test(`one12-Two34-Three56`, [`one12`, `Two34`, `Three56`])
  test(`One12-Two34-Three56`, [`One12`, `Two34`, `Three56`])
  test(`ONE12-TWO34-THREE56`, [`ONE12`, `TWO34`, `THREE56`])
})

// TODO test Unicode.
t.test(function test_Words() {
  function src() {return s.words(`one two three`)}

  t.eq(s.words(`one two`).lower(), s.Words.from([`one`, `two`]))
  t.eq(s.words(`One Two`).lower(), s.Words.from([`one`, `two`]))
  t.eq(s.words(`ONE TWO`).lower(), s.Words.from([`one`, `two`]))

  t.is(src().spaced(), `one two three`)
  t.is(src().snake(), `one_two_three`)
  t.is(src().kebab(), `one-two-three`)
  t.is(src().solid(), `onetwothree`)

  t.eq(src().lower(), s.Words.from([`one`, `two`, `three`]))
  t.eq(src().upper(), s.Words.from([`ONE`, `TWO`, `THREE`]))
  t.eq(src().title(), s.Words.from([`One`, `Two`, `Three`]))
  t.eq(src().sentence(), s.Words.from([`One`, `two`, `three`]))
  t.eq(src().camel(), s.Words.from([`one`, `Two`, `Three`]))

  t.is(src().lower().spaced(), `one two three`)
  t.is(src().lower().snake(), `one_two_three`)
  t.is(src().lower().kebab(), `one-two-three`)
  t.is(src().lower().solid(), `onetwothree`)

  t.is(src().upper().spaced(), `ONE TWO THREE`)
  t.is(src().upper().snake(), `ONE_TWO_THREE`)
  t.is(src().upper().kebab(), `ONE-TWO-THREE`)
  t.is(src().upper().solid(), `ONETWOTHREE`)

  t.is(src().title().spaced(), `One Two Three`)
  t.is(src().title().snake(), `One_Two_Three`)
  t.is(src().title().kebab(), `One-Two-Three`)
  t.is(src().title().solid(), `OneTwoThree`)

  t.is(src().sentence().spaced(), `One two three`)
  t.is(src().sentence().snake(), `One_two_three`)
  t.is(src().sentence().kebab(), `One-two-three`)
  t.is(src().sentence().solid(), `Onetwothree`)

  t.is(src().camel().spaced(), `one Two Three`)
  t.is(src().camel().snake(), `one_Two_Three`)
  t.is(src().camel().kebab(), `one-Two-Three`)
  t.is(src().camel().solid(), `oneTwoThree`)

  t.is(src().lowerSpaced(), `one two three`)
  t.is(src().upperSpaced(), `ONE TWO THREE`)
  t.is(src().titleSpaced(), `One Two Three`)
  t.is(src().sentenceSpaced(), `One two three`)
  t.is(src().camelSpaced(), `one Two Three`)

  t.is(src().lowerSnake(), `one_two_three`)
  t.is(src().upperSnake(), `ONE_TWO_THREE`)
  t.is(src().titleSnake(), `One_Two_Three`)
  t.is(src().senteSnake(), `One_two_three`)
  t.is(src().camelSnake(), `one_Two_Three`)

  t.is(src().lowerKebab(), `one-two-three`)
  t.is(src().upperKebab(), `ONE-TWO-THREE`)
  t.is(src().titleKebab(), `One-Two-Three`)
  t.is(src().senteKebab(), `One-two-three`)
  t.is(src().camelKebab(), `one-Two-Three`)

  t.is(src().lowerCamel(), `oneTwoThree`)
  t.is(src().titleCamel(), `OneTwoThree`)
})

t.test(function test_lower() {
  t.is(s.lower(``), ``)
  t.is(s.lower(`one two three`), `one two three`)
  t.is(s.lower(`ONE TWO THREE`), `one two three`)
  t.is(s.lower(`ενα δυο τρια`), `ενα δυο τρια`)
  t.is(s.lower(`ΕΝΑ ΔΥΟ ΤΡΙΑ`), `ενα δυο τρια`)
  t.is(s.lower(`раз два три`), `раз два три`)
  t.is(s.lower(`РАЗ ДВА ТРИ`), `раз два три`)
  t.is(s.lower(`🐒🐴🦖🦔🐲🐈`), `🐒🐴🦖🦔🐲🐈`)
  t.is(s.lower(`🐒A🐴B🦖C🦔D🐲E🐈`), `🐒a🐴b🦖c🦔d🐲e🐈`)
  t.is(s.lower(`🐒a🐴b🦖c🦔d🐲e🐈`), `🐒a🐴b🦖c🦔d🐲e🐈`)
})

t.test(function test_upper() {
  t.is(s.upper(``), ``)
  t.is(s.upper(`one two three`), `ONE TWO THREE`)
  t.is(s.upper(`ONE TWO THREE`), `ONE TWO THREE`)
  t.is(s.upper(`ενα δυο τρια`), `ΕΝΑ ΔΥΟ ΤΡΙΑ`)
  t.is(s.upper(`ΕΝΑ ΔΥΟ ΤΡΙΑ`), `ΕΝΑ ΔΥΟ ΤΡΙΑ`)
  t.is(s.upper(`раз два три`), `РАЗ ДВА ТРИ`)
  t.is(s.upper(`РАЗ ДВА ТРИ`), `РАЗ ДВА ТРИ`)
  t.is(s.upper(`🐒🐴🦖🦔🐲🐈`), `🐒🐴🦖🦔🐲🐈`)
  t.is(s.upper(`🐒A🐴B🦖C🦔D🐲E🐈`), `🐒A🐴B🦖C🦔D🐲E🐈`)
  t.is(s.upper(`🐒a🐴b🦖c🦔d🐲e🐈`), `🐒A🐴B🦖C🦔D🐲E🐈`)
})

t.test(function test_title() {
  t.is(s.title(``), ``)
  t.is(s.title(`one two three`), `One two three`)
  t.is(s.title(`ONE TWO THREE`), `One two three`)
  t.is(s.title(`ενα δυο τρια`), `Ενα δυο τρια`)
  t.is(s.title(`ΕΝΑ ΔΥΟ ΤΡΙΑ`), `Ενα δυο τρια`)
  t.is(s.title(`раз два три`), `Раз два три`)
  t.is(s.title(`РАЗ ДВА ТРИ`), `Раз два три`)
  t.is(s.title(`🐒🐴🦖🦔🐲🐈`), `🐒🐴🦖🦔🐲🐈`)
  t.is(s.title(`🐒A🐴B🦖C🦔D🐲E🐈`), `🐒a🐴b🦖c🦔d🐲e🐈`)
  t.is(s.title(`🐒a🐴b🦖c🦔d🐲e🐈`), `🐒a🐴b🦖c🦔d🐲e🐈`)
  t.is(s.title(`a🐴b🦖c🦔d🐲e🐈`), `A🐴b🦖c🦔d🐲e🐈`)
})

const nonBools = [``, `0`, `1`, `10`, `str`, `FALSE`, `TRUE`, `false `, `true `]

t.test(function test_boolOpt() {testBoolOpt(s.boolOpt)})
t.test(function test_bool() {testBool(s.bool)})

function testBoolOpt(make) {
  function none(src) {t.is(make(src), undefined)}
  testBoolAny(none, make)
}

function testBool(make) {
  function none(src) {
    t.throws(() => make(src), SyntaxError, `unable to convert ${l.show(src)} to bool`)
  }
  testBoolAny(none, make)
}

function testBoolAny(none, make) {
  nonBools.forEach(none)
  t.is(make(`false`), false)
  t.is(make(`true`), true)
}

const floats = [
  `10.20`,
  `-10.20`,
  `2e3`,
  `2e+3`,
  `2e-3`,
  `-2e3`,
  `-2e+3`,
  `-2e-3`,
  `2.3e4`,
  `2.3e+4`,
  `2.3e-4`,
  `-2.3e4`,
  `-2.3e+4`,
  `-2.3e-4`,
  `10.20`,
  `-10.20`,
  `2e3`,
  `2e+3`,
  `2e-3`,
  `-2e3`,
  `-2e+3`,
  `-2e-3`,
  `2.3e4`,
  `2.3e+4`,
  `2.3e-4`,
  `-2.3e4`,
  `-2.3e+4`,
  `-2.3e-4`,
]

const nats = [`0`, `+0`, `10`, `+10`]
const negs = [`-0`, `-10`]
const ints = [...negs, ...nats]
const fins = [...floats, ...ints]

const nonNums = [
  ``,
  `0 `,
  `10 `,
  `-10 `,
  `0_0`,
  `10_0`,
  `-10_0`,
  `str`,
  `10str`,
  `false`,
  `true`,
  `NaN`,
  `Infinity`,
  `+Infinity`,
  `-Infinity`,
  ...fins.map(val => val + ` `),
  ...fins.map(val => ` ` + val),
]

t.test(function test_finOpt() {testFinOpt(s.finOpt)})
t.test(function test_fin() {testFin(s.fin)})

function testFinOpt(make) {
  function none(src) {t.is(make(src), undefined)}
  function some(src) {t.is(make(src), Number.parseFloat(src))}
  testFinAny(none, some)
}

function testFin(make) {
  function none(src) {
    t.throws(() => make(src), SyntaxError, `unable to convert ${l.show(src)} to fin`)
  }
  function some(src) {t.is(make(src), Number.parseFloat(src))}
  testFinAny(none, some)
}

function testFinAny(none, some) {
  nonNums.forEach(none)
  fins.forEach(some)
}

t.test(function test_intOpt() {testIntOpt(s.intOpt)})
t.test(function test_int() {testInt(s.int)})

function testIntOpt(make) {
  function none(src) {t.is(make(src), undefined)}
  function some(src) {t.is(make(src), Number.parseInt(src))}
  testIntAny(none, some)
}

function testInt(make) {
  function none(src) {
    t.throws(() => make(src), SyntaxError, `unable to convert ${l.show(src)} to int`)
  }
  function some(src) {t.is(make(src), Number.parseFloat(src))}
  testIntAny(none, some)
}

function testIntAny(none, some) {
  nonNums.forEach(none)
  floats.forEach(none)
  ints.forEach(some)
}

t.test(function test_natOpt() {testNatOpt(s.natOpt)})
t.test(function test_nat() {testNat(s.nat)})

function testNatOpt(make) {
  function none(src) {t.is(make(src), undefined)}
  function some(src) {t.is(make(src), Number.parseInt(src))}
  testNatAny(none, some)
}

function testNat(make) {
  function none(src) {
    t.throws(() => make(src), SyntaxError, `unable to convert ${l.show(src)} to nat`)
  }
  function some(src) {t.is(make(src), Number.parseInt(src))}
  testNatAny(none, some)
}

function testNatAny(none, some) {
  nonNums.forEach(none)
  floats.forEach(none)
  negs.forEach(none)
  nats.forEach(some)
}

t.test(function test_inter() {
  t.is(s.inter(undefined, ``, undefined), ``)
  t.is(s.inter(null, ``, null), ``)
  t.is(s.inter(``, ``, ``), ``)
  t.is(s.inter(`one`, ``, `two`), `onetwo`)
  t.is(s.inter(``, ``, `two`), `two`)
  t.is(s.inter(`one`, `/`, ``), `one`)
  t.is(s.inter(``, `/`, `two`), `two`)
  t.is(s.inter(`one`, ``, ``), `one`)
  t.is(s.inter(`one`, `/`, `two`), `one/two`)
  t.is(s.inter(`one`, `/`, `/two`), `one/two`)
  t.is(s.inter(`one/`, `/`, `two`), `one/two`)
  t.is(s.inter(`one/`, `/`, `/two`), `one/two`)
  t.is(s.inter(`/one`, `/`, `two`), `/one/two`)
  t.is(s.inter(`/one`, `/`, `/two`), `/one/two`)
  t.is(s.inter(`/one/`, `/`, `two`), `/one/two`)
  t.is(s.inter(`/one/`, `/`, `/two`), `/one/two`)
  t.is(s.inter(`one`, `/`, `two/`), `one/two/`)
  t.is(s.inter(`one`, `/`, `/two/`), `one/two/`)
  t.is(s.inter(`one/`, `/`, `two/`), `one/two/`)
  t.is(s.inter(`one/`, `/`, `/two/`), `one/two/`)
  t.is(s.inter(`/one`, `/`, `two/`), `/one/two/`)
  t.is(s.inter(`/one`, `/`, `/two/`), `/one/two/`)
  t.is(s.inter(`/one/`, `/`, `two/`), `/one/two/`)
  t.is(s.inter(`/one/`, `/`, `/two/`), `/one/two/`)
})

t.test(function test_stripPre() {
  function test(src, pre, exp) {t.is(s.stripPre(src, pre), exp)}

  test(undefined, ``, ``)
  test(null, ``, ``)
  test(``, ``, ``)

  test(`/`, ``, `/`)
  test(`//`, ``, `//`)
  test(`///`, ``, `///`)

  test(`/`, `/`, ``)
  test(`//`, `/`, ``)
  test(`///`, `/`, ``)

  test(`one/`, `/`, `one/`)
  test(`/one/`, `/`, `one/`)
  test(`//one/`, `/`, `one/`)
  test(`///one/`, `/`, `one/`)

  test(`one`, ``, `one`)
  test(`/one`, ``, `/one`)
  test(`//one`, ``, `//one`)
  test(`///one`, ``, `///one`)

  test(`one`, `/`, `one`)
  test(`/one`, `/`, `one`)
  test(`//one`, `/`, `one`)
  test(`///one`, `/`, `one`)

  test(`one`, `//`, `one`)
  test(`/one`, `//`, `/one`)
  test(`//one`, `//`, `one`)
  test(`///one`, `//`, `/one`)
})

t.test(function test_stripSuf() {
  function test(src, suf, exp) {t.is(s.stripSuf(src, suf), exp)}

  test(undefined, ``, ``)
  test(null, ``, ``)
  test(``, ``, ``)

  test(`/`, ``, `/`)
  test(`//`, ``, `//`)
  test(`///`, ``, `///`)

  test(`/`, `/`, ``)
  test(`//`, `/`, ``)
  test(`///`, `/`, ``)

  test(`/one`, `/`, `/one`)
  test(`/one/`, `/`, `/one`)
  test(`/one//`, `/`, `/one`)
  test(`/one///`, `/`, `/one`)

  test(`one`, ``, `one`)
  test(`one/`, ``, `one/`)
  test(`one//`, ``, `one//`)
  test(`one///`, ``, `one///`)

  test(`one`, `/`, `one`)
  test(`one/`, `/`, `one`)
  test(`one//`, `/`, `one`)
  test(`one///`, `/`, `one`)

  test(`one`, `//`, `one`)
  test(`one/`, `//`, `one/`)
  test(`one//`, `//`, `one`)
  test(`one///`, `//`, `one/`)
})

t.test(function test_split() {
  function test(src, sep, exp) {t.eq(s.split(src, sep), exp)}

  test(``, ``, [])
  test(``, /(?:)/g, [])
  test(``, `/`, [])
  test(`one`, `/`, [`one`])
  test(`one/two`, `/`, [`one`, `two`])
  test(`one/two/three`, `/`, [`one`, `two`, `three`])
})

t.test(function test_lines() {
  function test(src, exp) {t.eq(s.lines(src), exp)}

  test(``, [])
  test(`\n`, [``, ``])
  test(`one\ntwo`, [`one`, `two`])
  test(`\rone\ntwo`, [``, `one`, `two`])
  test(`one\ntwo\r\n`, [`one`, `two`, ``])
  test(`\rone\ntwo\r\n`, [``, `one`, `two`, ``])
  test(`one\rtwo`, [`one`, `two`])
  test(`one\r\ntwo`, [`one`, `two`])
  test(`one\r\n\ntwo`, [`one`, ``, `two`])
  test(`one\r\ntwo\rthree\nfour`, [`one`, `two`, `three`, `four`])
  test(`one\r\ntwo\rthree\nfour\n`, [`one`, `two`, `three`, `four`, ``])
  test(`one two\tthree\vfour`, [`one two\tthree\vfour`])
})

t.test(function test_trimLines() {
  function test(src, exp) {t.is(s.trimLines(src), exp)}

  test(``, ``)
  test(`       `, ``)
  test(`  one  `, `one`)
  test(` \t\vone \t\v`, `one`)

  test(
    `
    one         \t
    two         \v
    three
    `,
`one
two
three`,
  )
})

t.test(function test_isSubpath() {
  t.no(s.isSubpath(`/one`, `/onetwo`))
  t.no(s.isSubpath(`/one/two`, `/one`))
  t.no(s.isSubpath(`/onetwo`, `/one`))

  t.ok(s.isSubpath(`/`, `/`))
  t.ok(s.isSubpath(`/one`, `/one`))
  t.ok(s.isSubpath(`/one`, `/one/two`))
})

t.test(function test_spaced() {
  t.is(s.spaced(), ``)
  t.is(s.spaced(``, undefined, ``, null, ``), ``)
  t.is(s.spaced(`one`, `two`, `three`), `one two three`)
  t.is(s.spaced(10, 20, 30), `10 20 30`)
})

t.test(function test_arrHex() {
  function test(src, exp) {t.is(s.arrHex(new Uint8Array(src)), exp)}

  test(undefined, ``)
  test([], ``)
  test([0x00], `00`)
  test([0xff], `ff`)
  test([0x01], `01`)
  test([0x10], `10`)
  test([0x00, 0xff], `00ff`)
  test([0xff, 0x01], `ff01`)
  test([0x01, 0x10], `0110`)
  test([0x10, 0x00], `1000`)
})

// Incomplete. Should also test entropy.
t.test(function test_rndHex() {
  t.throws(s.rndHex, TypeError, `expected variant of isNat, got undefined`)

  t.is(s.rndHex(0), ``)

  for (const len of i.range(0, 128)) {
    testHex(s.rndHex(len), len)
  }

  for (const len of i.range(128, 256)) {
    testHex(s.rndHex(len), len)
    t.isnt(s.rndHex(len), s.rndHex(len))
  }
})

// Incomplete. Should also test entropy, bit fiddling, only hex.
t.test(function test_uuid() {
  l.reqStr(s.uuid())

  testHex(s.uuid(), 16)
  testHex(s.uuid(), 16)

  t.is(s.uuid().length, 32)
  t.is(s.uuid().length, 32)

  t.isnt(s.uuid(), s.uuid())
  t.isnt(s.uuid(), s.uuid())
  t.isnt(s.uuid(), s.uuid())
})

t.test(function test_StrMap() {
  // Delegates to `.mut` which is tested below. This is a sanity check.
  t.test(function test_constructor() {
    testStrMapReset(s.strMap)
  })

  // Mostly delegates to `.mut` which is tested below.
  t.test(function test_reset() {
    testStrMapReset(function make(val) {return s.strMap().reset(val)})
    testStrMapReset(function make(val) {return s.strMap({seven: `eight`}).reset(val)})

    testMap(s.strMap({one: `two`}).reset(), [])
    testMap(s.strMap({one: `two`}).reset({}), [])
    testMap(s.strMap({one: `two`}).reset([]), [])
    testMap(s.strMap({one: `two`}).reset(s.strMap()), [])
  })

  t.test(function test_mut() {
    testStrMapReset(function make(val) {return s.strMap().mut(val)})

    t.test(function test_empty() {
      function test(inp) {
        testMap(s.strMap({one: `two`}).mut(inp), [[`one`, [`two`]]])
      }

      test()
      test({})
      test([])
      test(s.strMap())
    })

    t.test(function test_full() {
      /*
      TODO consider changing the behavior from `.appendAny` to `.setAny`. For
      any key present in the input, the entire pre-existing entry should be
      removed. However, we must preserve ALL values present in the input, which
      is tricky in cases where the same key occurs multiple times with
      different values, which we support for compatibility with URL `Query`.
      This is trivial to solve by "remembering" new keys in a temporary set;
      the tricky part is doing this in a cleaner and more efficient way.

      Once implemented, the output should be this:

        [[`one`, [`six`]], [`three`, [`seven`]], [`eight`, [`nine`, `ten`]]]
      */
      function test(inp) {
        testMap(
          s.strMap({one: `two`, three: [`four`, `five`]}).mut(inp),
          [[`one`, [`two`, `six`]], [`three`, [`four`, `five`, `seven`]], [`eight`, [`nine`, `ten`]]],
        )
      }

      test([[`one`, `six`], [`three`, [`seven`]], [`eight`, `nine`], [`eight`, `ten`]])
      test({one: `six`, three: [`seven`], eight: [`nine`, `ten`]})
      test(new Map().set(`one`, `six`).set(`three`, [`seven`]).set(`eight`, [`nine`, `ten`]))
      test(s.strMap({one: `six`, three: [`seven`], eight: [`nine`, `ten`]}))
    })
  })

  t.test(function test_has() {
    t.no(s.strMap().has(`one`))
    t.no(s.strMap({one: `two`}).has(`two`))
    t.no(s.strMap({one: `two`}).has(`three`))
    t.no(s.strMap({one: `two`, three: `four`}).has(`two`))
    t.no(s.strMap({one: `two`, three: `four`}).has(`four`))

    t.ok(s.strMap({one: `two`}).has(`one`))
    t.ok(s.strMap({one: `two`, three: `four`}).has(`one`))
    t.ok(s.strMap({one: `two`, three: `four`}).has(`three`))
  })

  t.test(function test_get() {
    function none(val) {t.is(val, undefined)}

    none(s.strMap().get(`one`))
    none(s.strMap({one: `two`}).get(`two`))
    none(s.strMap({one: `two`}).get(`three`))
    none(s.strMap({one: `two`, three: `four`}).get(`two`))
    none(s.strMap({one: `two`, three: `four`}).get(`four`))

    t.is(s.strMap({one: `two`}).get(`one`), `two`)
    t.is(s.strMap({one: [`two`, `three`]}).get(`one`), `two`)
    t.is(s.strMap({one: [`two`, `five`], three: `four`}).get(`one`), `two`)
    t.is(s.strMap({one: `two`, three: `four`}).get(`three`), `four`)
    t.is(s.strMap({one: [`two`, `five`], three: [`four`, `six`]}).get(`three`), `four`)
  })

  t.test(function test_getAll() {
    function none(val) {t.is(val, undefined)}

    none(s.strMap().getAll(`one`))
    none(s.strMap({one: `two`}).getAll(`two`))
    none(s.strMap({one: `two`}).getAll(`three`))
    none(s.strMap({one: `two`, three: `four`}).getAll(`two`))
    none(s.strMap({one: `two`, three: `four`}).getAll(`four`))

    t.eq(s.strMap({one: `two`}).getAll(`one`), [`two`])
    t.eq(s.strMap({one: [`two`, `three`]}).getAll(`one`), [`two`, `three`])
    t.eq(s.strMap({one: [`two`, `five`], three: `four`}).getAll(`one`), [`two`, `five`])
    t.eq(s.strMap({one: `two`, three: `four`}).getAll(`three`), [`four`])
    t.eq(s.strMap({one: [`two`, `five`], three: [`four`, `six`]}).getAll(`three`), [`four`, `six`])
  })

  t.test(function test_set() {
    t.throws(() => s.strMap().set(undefined, ``), TypeError, `expected variant of isStr, got undefined`)
    t.throws(() => s.strMap().set(10, ``), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => s.strMap().set(`key`, {}), TypeError, `unable to convert {} to string`)
    t.throws(() => s.strMap().set(`key`, []), TypeError, `unable to convert [] to string`)

    testMap(s.strMap().set(``, undefined), [])
    testMap(s.strMap().set(``, null), [])

    testMap(s.strMap().set(``, ``), [[``, [``]]])
    testMap(s.strMap().set(``, `val`), [[``, [`val`]]])

    testMap(s.strMap().set(`key`, undefined), [])
    testMap(s.strMap().set(`key`, null), [])
    testMap(s.strMap().set(`key`, ``), [[`key`, [``]]])

    testMap(s.strMap({one: `two`}).set(`one`, undefined), [])
    testMap(s.strMap({one: `two`}).set(`one`, null), [])
    testMap(s.strMap({one: `two`}).set(`one`, ``), [[`one`, [``]]])

    testMap(s.strMap().set(`one`, false), [[`one`, [`false`]]])
    testMap(s.strMap().set(`one`, true), [[`one`, [`true`]]])
    testMap(s.strMap().set(`one`, `two`), [[`one`, [`two`]]])
    testMap(s.strMap().set(`one`, `two`).set(`one`, `three`), [[`one`, [`three`]]])
    testMap(s.strMap().set(`one`, `two`).set(`three`, `four`), [[`one`, [`two`]], [`three`, [`four`]]])
    testMap(s.strMap({one: `two`}).set(`one`, `three`), [[`one`, [`three`]]])
    testMap(s.strMap({one: `two`}).set(`three`, `four`), [[`one`, [`two`]], [`three`, [`four`]]])

    testMap(s.strMap().set(`🙂`, `😁`), [[`🙂`, [`😁`]]])
    testMap(s.strMap().set(`one`, 0), [[`one`, [`0`]]])
    testMap(s.strMap().set(`one`, 10), [[`one`, [`10`]]])
    testMap(s.strMap().set(`one`, 10.2), [[`one`, [`10.2`]]])
    testMap(s.strMap().set(`one`, 10n), [[`one`, [`10`]]])
    testMap(s.strMap().set(`one`, false), [[`one`, [`false`]]])
    testMap(s.strMap().set(`one`, true), [[`one`, [`true`]]])
    testMap(s.strMap().set(`one`, new Date(1024)), [[`one`, [`1970-01-01T00:00:01.024Z`]]])
    testMap(s.strMap().set(`one`, {toString() {return `three`}}), [[`one`, [`three`]]])
  })

  t.test(function test_setAll() {
    t.throws(() => s.strMap().setAll(undefined, []), TypeError, `expected variant of isStr, got undefined`)
    t.throws(() => s.strMap().setAll(`key`, 10), TypeError, `expected variant of isArr, got 10`)
    t.throws(() => s.strMap().setAll(`key`, `str`), TypeError, `expected variant of isArr, got "str"`)

    testMap(s.strMap().setAll(`one`), [])
    testMap(s.strMap().setAll(`one`, []), [])

    testMap(s.strMap({one: `two`}).setAll(`one`), [])
    testMap(s.strMap({one: `two`}).setAll(`one`, []), [])
    testMap(s.strMap({one: `two`}).setAll(`three`), [[`one`, [`two`]]])
    testMap(s.strMap({one: `two`}).setAll(`three`, []), [[`one`, [`two`]]])
    testMap(s.strMap({one: [`two`, `three`]}).setAll(`one`), [])
    testMap(s.strMap({one: [`two`, `three`]}).setAll(`one`, [`four`]), [[`one`, [`four`]]])
    testMap(s.strMap({one: [`two`, `three`]}).setAll(`one`, [`four`, `five`]), [[`one`, [`four`, `five`]]])
    testMap(s.strMap().setAll(`one`, [`two`, `three`]).setAll(`four`, [`five`, `six`]), [[`one`, [`two`, `three`]], [`four`, [`five`, `six`]]])

    testMap(s.strMap().setAll(`🙂`, [`😁`]), [[`🙂`, [`😁`]]])
  })

  t.test(function test_setAny() {
    t.throws(() => s.strMap().setAny(undefined, ``), TypeError, `expected variant of isStr, got undefined`)

    testMap(s.strMap().setAny(`one`, undefined), [])
    testMap(s.strMap().setAny(`one`, null), [])
    testMap(s.strMap().setAny(`one`, []), [])

    testMap(s.strMap({one: `two`}).setAny(`one`, undefined), [])
    testMap(s.strMap({one: `two`}).setAny(`one`, null), [])
    testMap(s.strMap({one: `two`}).setAny(`one`, []), [])

    testMap(s.strMap().setAny(`one`, `two`), [[`one`, [`two`]]])
    testMap(s.strMap().setAny(`one`, [`two`, `three`]), [[`one`, [`two`, `three`]]])
    testMap(s.strMap({one: `two`}).setAny(`one`, `three`), [[`one`, [`three`]]])
    testMap(s.strMap({one: `two`}).setAny(`three`, `four`), [[`one`, [`two`]], [`three`, [`four`]]])
    testMap(s.strMap({one: `two`}).setAny(`three`, [`four`, `five`]), [[`one`, [`two`]], [`three`, [`four`, `five`]]])
  })

  t.test(function test_append() {
    t.throws(() => s.strMap().append(undefined, ``), TypeError, `expected variant of isStr, got undefined`)

    testMap(s.strMap().append(`one`), [])
    testMap(s.strMap().append(`one`, `two`), [[`one`, [`two`]]])

    testMap(s.strMap({one: `two`}).append(`one`, `three`), [[`one`, [`two`, `three`]]])
    testMap(s.strMap({one: `two`}).append(`three`, `four`), [[`one`, [`two`]], [`three`, [`four`]]])
  })

  t.test(function test_appendAll() {
    t.throws(() => s.strMap().appendAll(undefined, []), TypeError, `expected variant of isStr, got undefined`)
    t.throws(() => s.strMap().appendAll(`key`, 10), TypeError, `expected variant of isArr, got 10`)
    t.throws(() => s.strMap().appendAll(`key`, `str`), TypeError, `expected variant of isArr, got "str"`)

    testMap(s.strMap().appendAll(`one`), [])
    testMap(s.strMap().appendAll(`one`, []), [])
    testMap(s.strMap({one: `two`}).appendAll(`one`), [[`one`, [`two`]]])
    testMap(s.strMap({one: `two`}).appendAll(`one`, []), [[`one`, [`two`]]])
    testMap(s.strMap().appendAll(`one`, [`two`]), [[`one`, [`two`]]])
    testMap(s.strMap().appendAll(`one`, [`two`, `three`]), [[`one`, [`two`, `three`]]])
    testMap(s.strMap({one: `two`}).appendAll(`one`, [`three`]), [[`one`, [`two`, `three`]]])
    testMap(s.strMap({one: `two`}).appendAll(`one`, [`three`, `four`]), [[`one`, [`two`, `three`, `four`]]])
    testMap(s.strMap({one: `two`}).appendAll(`three`, [`four`]), [[`one`, [`two`]], [`three`, [`four`]]])
    testMap(s.strMap({one: `two`}).appendAll(`three`, [`four`, `five`]), [[`one`, [`two`]], [`three`, [`four`, `five`]]])
  })

  t.test(function test_appendAny() {
    t.throws(() => s.strMap().appendAny(undefined, ``), TypeError, `expected variant of isStr, got undefined`)

    testMap(s.strMap().appendAny(``, undefined), [])
    testMap(s.strMap().appendAny(``, null), [])
    testMap(s.strMap().appendAny(``, ``), [[``, [``]]])

    testMap(s.strMap().appendAny(`one`, undefined), [])
    testMap(s.strMap().appendAny(`one`, null), [])
    testMap(s.strMap().appendAny(`one`, ``), [[`one`, [``]]])

    testMap(s.strMap().appendAny(`one`, `two`), [[`one`, [`two`]]])
    testMap(s.strMap().appendAny(`one`, [`two`, `three`]), [[`one`, [`two`, `three`]]])

    testMap(s.strMap({one: `two`}).appendAny(`one`, `three`), [[`one`, [`two`, `three`]]])
    testMap(s.strMap({one: `two`}).appendAny(`three`, `four`), [[`one`, [`two`]], [`three`, [`four`]]])
    testMap(s.strMap({one: `two`}).appendAny(`three`, [`four`, `five`]), [[`one`, [`two`]], [`three`, [`four`, `five`]]])
  })

  t.test(function test_delete() {
    function no(ref, key) {
      const exp = [...ref]
      t.no(ref.delete(key))
      testMap(ref, exp)
    }

    no(s.strMap(), `one`)
    no(s.strMap({one: `two`}), `two`)

    function ok(ref, key, exp) {
      t.ok(ref.delete(key))
      testMap(ref, exp)
    }

    ok(s.strMap({one: `two`}), `one`, [])
    ok(s.strMap({one: `two`, three: `four`}), `one`, [[`three`, [`four`]]])
    ok(s.strMap({one: `two`, three: `four`}), `three`, [[`one`, [`two`]]])
  })

  t.test(function test_clear() {
    function test(val) {testMap(val, [])}

    test(s.strMap().clear())
    test(s.strMap({one: `two`}).clear())
    test(s.strMap({one: `two`, three: `four`}).clear())
  })

  t.test(function test_toDict() {
    function test(val) {
      const out = s.strMap(val).toDict()
      t.is(Object.getPrototypeOf(out), null)
      t.eq(out, val)
    }

    test({})
    test({one: `two`})
    test({one: `two`, three: `four`})
  })

  t.test(function test_toDictAll() {
    function test(val) {
      const out = s.strMap(val).toDictAll()
      t.is(Object.getPrototypeOf(out), null)
      t.eq(out, val)
    }

    test({})
    test({one: [`two`]})
    test({one: [`two`], three: [`four`]})
  })

  t.test(function test_boolOpt() {testBoolOpt(function make(val) {return s.strMap({val}).boolOpt(`val`)})})
  t.test(function test_bool() {testBool(function make(val) {return s.strMap({val}).bool(`val`)})})
  t.test(function test_finOpt() {testFinOpt(function make(val) {return s.strMap({val}).finOpt(`val`)})})
  t.test(function test_fin() {testFin(function make(val) {return s.strMap({val}).fin(`val`)})})
  t.test(function test_intOpt() {testIntOpt(function make(val) {return s.strMap({val}).intOpt(`val`)})})
  t.test(function test_int() {testInt(function make(val) {return s.strMap({val}).int(`val`)})})
  t.test(function test_natOpt() {testNatOpt(function make(val) {return s.strMap({val}).natOpt(`val`)})})
  t.test(function test_nat() {testNat(function make(val) {return s.strMap({val}).nat(`val`)})})

  t.test(function test_clone() {
    const src = s.strMap({one: [`two`, `three`], four: [`five`, `six`]})
    const out = src.clone()

    testEquiv(out, src)
    testMap(src, [[`one`, [`two`, `three`]], [`four`, [`five`, `six`]]])
    testMap(out, [[`one`, [`two`, `three`]], [`four`, [`five`, `six`]]])

    for (const key of src.keys()) testEquiv(src.getAll(key), out.getAll(key))

    out.getAll(`four`).push(`seven`)
    testMap(src, [[`one`, [`two`, `three`]], [`four`, [`five`, `six`]]])
    testMap(out, [[`one`, [`two`, `three`]], [`four`, [`five`, `six`, `seven`]]])
  })

  t.test(function test_toJSON() {
    function test(src) {
      t.eq(s.strMap(src).toJSON(), s.strMap(src).toDictAll())
    }

    test()
    test({})
    test({one: `two`})
    test({one: `two`, three: [`four`, `five`]})
  })
})

function testStrMapReset(make) {
  t.throws(() => make(10), TypeError, `unable to convert 10 to StrMap`)
  t.throws(() => make(`str`), TypeError, `unable to convert "str" to StrMap`)

  testMap(make(undefined), [])
  testMap(make({}), [])
  testMap(make([]), [])
  testMap(make(new Map()), [])
  testMap(make(new Set()), [])
  testMap(make(s.strMap()), [])

  testMap(
    make([[`one`, [`two`]], [`three`, [`four`, `five`]]]),
    [[`one`, [`two`]], [`three`, [`four`, `five`]]],
  )

  testMap(
    make({one: `two`, three: [`four`, `five`]}),
    [[`one`, [`two`]], [`three`, [`four`, `five`]]],
  )

  testMap(
    make(new Map().set(`one`, `two`).set(`three`, [`four`, `five`])),
    [[`one`, [`two`]], [`three`, [`four`, `five`]]],
  )

  testMap(
    make(s.strMap().set(`one`, `two`).setAll(`three`, [`four`, `five`])),
    [[`one`, [`two`]], [`three`, [`four`, `five`]]],
  )
}

t.test(function test_Embed() {
  t.test(function test_invalid() {
    t.throws(() => new s.Embed(), SyntaxError, `missing key in undefined`)
    t.throws(() => new s.Embed(``), SyntaxError, `missing key in ""`)
    t.throws(() => new s.Embed(` `), SyntaxError, `missing key in " "`)
  })

  t.test(function test_parse() {
    t.eq(
      new s.Embed(`one`),
      mockInst(s.Embed, {key: `one`, args: []}),
    )

    t.eq(
      new s.Embed(`  one  `),
      mockInst(s.Embed, {key: `one`, args: []}),
    )

    t.eq(
      new s.Embed(`one two`),
      mockInst(s.Embed, {key: `one`, args: [`two`]}),
    )

    t.eq(
      new s.Embed(`  one  two  `),
      mockInst(s.Embed, {key: `one`, args: [`two`]}),
    )

    t.eq(
      new s.Embed(`one two three`),
      mockInst(s.Embed, {key: `one`, args: [`two`, `three`]}),
    )

    t.eq(
      new s.Embed(`  one  two  three  `),
      mockInst(s.Embed, {key: `one`, args: [`two`, `three`]}),
    )
  })

  t.test(function test_render() {
    t.throws(() => new s.Embed(`one`).render(), TypeError, `unable to find "one" in undefined`)
    t.throws(() => new s.Embed(`one`).render(10), TypeError, `unable to find "one" in 10`)
    t.throws(() => new s.Embed(`one`).render({}), TypeError, `unable to find "one" in {}`)
    t.throws(() => new s.Embed(`one two`).render({one: `two`}), SyntaxError, `property "one" doesn't expect args ["two"]`)
    t.throws(() => new s.Embed(`one two three`).render({one: `two`}), SyntaxError, `property "one" doesn't expect args ["two","three"]`)

    function toJson(...val) {return JSON.stringify(val)}

    t.is(new s.Embed(`one`).render({one: 10}), `10`)
    t.is(new s.Embed(`one`).render({get one() {return 10}}), `10`)
    t.is(new s.Embed(`one`).render({one() {return 10}}), `10`)
    t.is(new s.Embed(`one two`).render({one: toJson}), `["two"]`)
    t.is(new s.Embed(`one two three`).render({one: toJson}), `["two","three"]`)
  })
})

t.test(function test_Draft() {
  t.test(function test_parse() {
    t.eq(s.draftParse(), s.Draft.of())

    t.eq(
      s.draftParse(`one`),
      s.Draft.of(`one`),
    )

    t.eq(
      s.draftParse(`one two three`),
      s.Draft.of(`one two three`),
    )

    t.eq(
      s.draftParse(`{{one}}`),
      s.Draft.of(new s.Embed(`one`)),
    )

    t.eq(
      s.draftParse(`one {{two}} three`),
      s.Draft.of(`one `, new s.Embed(`two`), ` three`),
    )

    t.eq(
      s.draftParse(`one {{two}} three {{four five}} six`),
      s.Draft.of(
        `one `,
        new s.Embed(`two`),
        ` three `,
        new s.Embed(`four five`),
        ` six`,
      ),
    )
  })

  t.test(function test_render() {
    t.test(function test_invalid() {
      const ref = s.draftParse(`{{one}}`)
      t.throws(() => ref.render(), TypeError, `unable to find "one" in undefined`)
      t.throws(() => ref.render(10), TypeError, `unable to find "one" in 10`)
      t.throws(() => ref.render({}), TypeError, `unable to find "one" in {}`)
    })

    const ctx = new class {
      get two() {return `10`}
      four() {return `20`}
    }()

    t.is(s.draftParse().render(ctx), ``)
    t.is(s.draftParse(`one`).render(ctx), `one`)
    t.is(s.draftParse(`{{two}}`).render(ctx), `10`)
    t.is(s.draftParse(`{{four}}`).render(ctx), `20`)

    t.is(
      s.draftParse(`one {{two}} three {{four}} five`).render(ctx),
      `one 10 three 20 five`,
    )
  })
})

t.test(function test_str() {
  t.throws(() => s.str(undefined), TypeError, `unable to convert undefined to string`)
  t.throws(() => s.str(null), TypeError, `unable to convert null to string`)
  t.throws(() => s.str(`one`, undefined), TypeError, `unable to convert undefined to string`)
  t.throws(() => s.str(`one`, null), TypeError, `unable to convert null to string`)

  testConc(s.str)
})

t.test(function test_strLax() {
  testConc(s.strLax)

  t.is(s.strLax(undefined), ``)
  t.is(s.strLax(null), ``)
  t.is(s.strLax(`one`, undefined, `two`, null, `three`), `onetwothree`)
})

function testConc(fun) {
  t.throws(() => fun([]), TypeError, `unable to convert [] to string`)
  t.throws(() => fun({}), TypeError, `unable to convert {} to string`)

  t.is(fun(), ``)
  t.is(fun(``), ``)
  t.is(fun(``, ``), ``)
  t.is(fun(``, ``, ``), ``)

  t.is(fun(), ``)
  t.is(fun(`one`), `one`)
  t.is(fun(`one`, `two`), `onetwo`)
  t.is(fun(`one`, ``, `two`), `onetwo`)
  t.is(fun(`one`, `two`, `three`), `onetwothree`)
  t.is(fun(`one`, ``, `two`, ``, `three`), `onetwothree`)

  t.is(fun(false), `false`)
  t.is(fun(false, true), `falsetrue`)

  t.is(fun(10), `10`)
  t.is(fun(10, 20), `1020`)
  t.is(fun(10, ``, 20), `1020`)
  t.is(fun(10, 20, 30), `102030`)
  t.is(fun(10, ``, 20, ``, 30), `102030`)
  t.is(fun(0), `0`)
  t.is(fun(0, 0), `00`)
  t.is(fun(10, 0, 20), `10020`)
}

t.test(function test_san() {
  t.throws(() => s.san`${undefined}`, TypeError, `unable to convert undefined to string`)
  t.throws(() => s.san`${null}`, TypeError, `unable to convert null to string`)
  t.throws(() => s.san`${[]}`, TypeError, `unable to convert [] to string`)
  t.throws(() => s.san`${{}}`, TypeError, `unable to convert {} to string`)
  t.throws(() => s.san`${`str`} ${undefined}`, TypeError, `unable to convert undefined to string`)
  t.throws(() => s.san`${`str`} ${null}`, TypeError, `unable to convert null to string`)
  t.throws(() => s.san`${`str`} ${[]}`, TypeError, `unable to convert [] to string`)
  t.throws(() => s.san`${`str`} ${{}}`, TypeError, `unable to convert {} to string`)

  testSan(s.san)
})

t.test(function test_sanLax() {
  testSan(s.sanLax)

  t.is(s.sanLax`${undefined}`, ``)
  t.is(s.sanLax`${null}`, ``)
  t.is(s.sanLax`one ${undefined}`, `one `)
  t.is(s.sanLax`one ${undefined} two`, `one  two`)
  t.is(s.sanLax`one ${undefined} two ${null} three`, `one  two  three`)
})

function testSan(fun) {
  t.is(fun``, ``)
  t.is(fun`one`, `one`)
  t.is(fun`${`one`}`, `one`)
  t.is(fun`one ${`two`}`, `one two`)
  t.is(fun`${`one`} two`, `one two`)
  t.is(fun`one ${`two`} three`, `one two three`)
  t.is(fun`one ${`two`} three ${`four`}`, `one two three four`)
  t.is(fun`one ${`two`} three ${`four`} five`, `one two three four five`)
  t.is(fun`one ${`two`} three ${40} five ${false} six`, `one two three 40 five false six`)
}

if (import.meta.main) console.log(`[test] ok!`)
