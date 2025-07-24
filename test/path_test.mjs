import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as p from '../path.mjs'

t.test(function test_const() {
  t.is(p.default.dirSep, `/`)
  t.is(p.default.extSep, `.`)
  t.is(p.default.cwdRel, `.`)
  t.is(p.default.relPre, `./`)
  t.is(p.default.parRelPre, `../`)
})

t.test(function test_norm() {
  function fail(src) {t.throws(() => p.norm(src), TypeError, `unable to convert ${l.show(src)} to string`)}
  function test(src, exp) {t.is(p.norm(src), exp, src)}

  fail({})
  fail([])

  test(undefined, ``)
  test(10, `10`)
  test(``, ``)
  test(`.`, `.`)
  test(`./`, `./`)
  test(`..`, `..`)
  test(`../`, `../`)
  test(`\\`, `/`)
  test(`\\\\`, `//`)
  test(`one`, `one`)
  test(`/one`, `/one`)
  test(`\\one`, `/one`)
  test(`one/two`, `one/two`)
  test(`one\\two`, `one/two`)
  test(`one/two/three`, `one/two/three`)
  test(`one\\two\\three`, `one/two/three`)
  test(`/one/two/three`, `/one/two/three`)
  test(`\\one\\two\\three`, `/one/two/three`)
  test(`one://two.three/four/five`, `one://two.three/four/five`)
  test(`one://two.three/four\\five`, `one://two.three/four/five`)
  test(`file:///one`, `/one`)
  test(`file://C:/one`, `C:/one`)
  test(`file://C:\\one`, `C:/one`)
  test(new URL(`file:///one`), `/one`)
  test(new URL(`file:///one?two`), `/one`)
  test(new URL(`file:///one?two#three`), `/one`)

  // TODO: how is this supposed to work?
  // test(new URL(`file://C:/one`), `/C:/one`)

  test(`C:`, `C:`)
  test(`C:/`, `C:/`)
  test(`C:\\`, `C:/`)
  test(`C:/one`, `C:/one`)
  test(`C:\\one`, `C:/one`)
  test(`C:/one/`, `C:/one/`)
  test(`C:\\one\\`, `C:/one/`)
  test(`C:/one/two`, `C:/one/two`)
  test(`C:\\one\\two`, `C:/one/two`)
})

t.test(function test_volume() {
  function test(src, exp) {t.is(p.volume(src), exp, src)}

  test(`/`, ``)
  test(`/one`, ``)
  test(`\\one`, ``)
  test(`//one`, ``)
  test(`\\\\one`, ``)
  test(`C:`, `C:`)
  test(`C:/one`, `C:`)
  test(`C:\\one`, `C:`)
  test(`C://one`, `C:`)
  test(`C:\\\\one`, `C:`)
  test(`file:///example`, ``)
  test(new URL(`file:///example`), ``)
})

t.test(function test_isAbs() {
  function miss(val) {t.no(p.isAbs(val))}
  function hit(val) {t.ok(p.isAbs(val))}

  miss(``)
  miss(`.`)
  miss(`..`)
  miss(`./`)
  miss(`../`)
  miss(`one`)
  miss(`one/two`)
  miss(`./one`)
  miss(`../one`)
  miss(`file://one`)
  miss(`file://one/two`)

  hit(`/`)
  hit(`\\`)
  hit(`/one`)
  hit(`\\one`)
  hit(`/one/two`)
  hit(`\\one\\two`)
  hit(`C:`)
  hit(`C:/`)
  hit(`C:\\`)
  hit(`C:/one`)
  hit(`C:\\one`)
  hit(`C:one`)    // TODO review.
  hit(`C:./one`)  // TODO review.
  hit(`C:.\\one`) // TODO review.
  hit(`file:///one`)
  hit(`file:///one/two`)
  hit(new URL(`file://one`))
  hit(new URL(`file://one/two`))
  hit(new URL(`file:///one`))
  hit(new URL(`file:///one/two`))
})

// Uses `!isAbs`, we only need a sanity check.
t.test(function test_isRel() {
  function miss(val) {t.no(p.isRel(val))}
  function hit(val) {t.ok(p.isRel(val))}

  miss(`/`)
  miss(`\\`)
  miss(`/one`)
  miss(`\\one`)
  miss(`file:///one`)
  miss(`file://\\one`)
  miss(new URL(`file:///one`))
  miss(new URL(`file://one`))
  miss(`C:`)
  miss(`C:/`)
  miss(`C:\\`)
  miss(`C:/one`)
  miss(`C:\\one`)
  miss(`C:one`) // TODO review.

  hit(`.`)
  hit(`..`)
  hit(`./`)
  hit(`../`)
  hit(`one`)
  hit(`./one`)
  hit(`../one`)
  hit(`one/two`)
  hit(`./one/two`)
  hit(`../one/two`)
})

t.test(function test_isRelExplicit() {
  function miss(val) {t.no(p.isRelExplicit(val))}
  function hit(val) {t.ok(p.isRelExplicit(val))}

  miss(``)
  miss(`one`)
  miss(`one/`)
  miss(`one\\`)
  miss(`one/two`)
  miss(`one\\two`)
  miss(`one/two/`)
  miss(`one\\two\\`)

  miss(`/`)
  miss(`/one`)
  miss(`/one/`)
  miss(`/one/two`)
  miss(`/one/two/`)

  miss(`\\`)
  miss(`\\one`)
  miss(`\\one\\`)
  miss(`\\one\\two`)
  miss(`\\one\\two\\`)

  miss(`C:`)
  miss(`C:/`)
  miss(`C://`)
  miss(`C://one`)
  miss(`C://one/`)

  miss(`C:`)
  miss(`C:\\`)
  miss(`C:\\\\`)
  miss(`C:\\\\one`)
  miss(`C:\\\\one\\`)

  hit(`.`)
  hit(`./`)
  hit(`./one`)
  hit(`./one/`)
  hit(`./one/two`)
  hit(`./one/two/`)

  hit(`.`)
  hit(`.\\`)
  hit(`.\\one`)
  hit(`.\\one\\`)
  hit(`.\\one\\two`)
  hit(`.\\one\\two\\`)
})

t.test(function test_isRelImplicit() {
  function miss(val) {t.no(p.isRelImplicit(val), val)}
  function hit(val) {t.ok(p.isRelImplicit(val), val)}

  miss(`/`)
  miss(`/one`)
  miss(`/one/`)
  miss(`/one/two`)
  miss(`/one/two/`)

  miss(`.`)
  miss(`./`)
  miss(`./one`)
  miss(`./one/`)
  miss(`./one/two`)
  miss(`./one/two/`)

  miss(`\\`)
  miss(`\\one`)
  miss(`\\one\\`)
  miss(`\\one\\two`)
  miss(`\\one\\two\\`)

  miss(`.`)
  miss(`.\\`)
  miss(`.\\one`)
  miss(`.\\one\\`)
  miss(`.\\one\\two`)
  miss(`.\\one\\two\\`)

  miss(`C:`)
  miss(`C:/`)
  miss(`C:/one`)
  miss(`C:/one/two`)

  miss(`C:`)
  miss(`C:\\`)
  miss(`C:\\one`)
  miss(`C:\\one\\two`)

  miss(`C://`)
  miss(`C://one`)
  miss(`C://one/`)
  miss(`C:\\\\`)
  miss(`C:\\\\one`)
  miss(`C:\\\\one\\`)

  hit(``)
  hit(`one`)
  hit(`one/`)
  hit(`one/two`)
  hit(`one/two/`)

  hit(``)
  hit(`one`)
  hit(`one\\`)
  hit(`one\\two`)
  hit(`one\\two\\`)
})

t.test(function test_isDirLike() {
  function miss(val) {t.no(p.isDirLike(val), val)}
  function hit(val) {t.ok(p.isDirLike(val), val)}

  miss(`one`)

  miss(`/one`)
  miss(`\\one`)

  miss(`one/two`)
  miss(`one\\two`)

  miss(`/one/two`)
  miss(`\\one\\two`)

  miss(`C:/one`)
  miss(`C:\\one`)

  miss(`file://one`)
  miss(`file://one/two`)
  miss(`file://one\\two`)

  miss(`file:///one`)
  miss(`file:///one/two`)
  miss(`file:///one\\two`)

  hit(``)
  hit(`.`)
  hit(`./`)
  hit(`..`)
  hit(`../`)
  hit(`/`)
  hit(`\\`)
  hit(`one/`)
  hit(`one\\`)
  hit(`C:`)
  hit(`C:/`)
  hit(`C:\\`)
  hit(`C:/one/`)
  hit(`C:\\one\\`)

  hit(`file://one/`)
  hit(`file:///one/`)

  hit(`file://one\\`)
  hit(`file:///one\\`)

  hit(new URL(`file://one/`))
  hit(new URL(`file:///one/`))
})

t.test(function test_isRoot() {
  function miss(val) {t.no(p.isRoot(val), val)}
  function hit(val) {t.ok(p.isRoot(val), val)}

  miss(``)
  miss(`one`)
  miss(`.`)
  miss(`./`)
  miss(`..`)
  miss(`../`)
  miss(`one/`)
  miss(`/one`)
  miss(`/one/`)
  miss(`one/two`)
  miss(`one/two/`)
  miss(`/one/two`)
  miss(`/one/two/`)
  miss(`C:`) // Can be same as `.` if current CWD is in that volume.
  miss(`C:/one`)
  miss(`C:\\one`)
  miss(`C:one`)
  miss(`//`)
  miss(`\\\\`)
  miss(`file://`)
  miss(`file://one`)
  miss(`file:///one`)
  miss(new URL(`file:///one`))

  hit(`/`)
  hit(`\\`)
  hit(`C:/`)
  hit(`C:\\`)
  hit(`file:///`)
  hit(new URL(`file://`))
  hit(new URL(`file:///`))
})

/*
Technically, on Windows the name of the volume where the current working
directory is located, usually `C:` or `D:` or similar, is equivalent to `.`.
For example, when the CWD is inside volume `D:`, using `D:` is equivalent to
`.`, while using `C:` is equivalent to `C:\`. This cannot be determined
syntactically. You have to know the CWD to determine if the path refers to CWD
or to the root of another volume. Since our path module doesn't perform OS IO,
we simply do not consider such paths to be CWD references, and besides, having
a volume letter makes them not exactly relative.
*/
t.test(function test_isCwdRel() {
  function miss(val) {t.no(p.isCwdRel(val), val)}
  function hit(val) {t.ok(p.isCwdRel(val), val)}

  miss(`/`)
  miss(`\\`)
  miss(`..`)
  miss(`../`)
  miss(`..\\`)
  miss(`~`)
  miss(`C:`)
  miss(`D:`)
  miss(`C:\\`)
  miss(`C:\\one`)
  miss(`C:/`)
  miss(`C://`)
  miss(`one`)
  miss(`./one`)

  hit(``)
  hit(`.`)
  hit(`./`)
})

t.test(function test_clean() {
  function test(src, exp) {t.is(p.clean(src), exp, src)}

  test(``, ``)
  test(`.`, ``)
  test(`./`, ``)
  test(`.\\`, ``)

  test(`/`, `/`)
  test(`\\`, `/`)
  test(`//`, `/`)
  test(`\\/`, `/`)
  test(`/\\`, `/`)
  test(`\\\\`, `/`)
  test(`///`, `/`)
  test(`/\\/`, `/`)
  test(`\\\\\\`, `/`)

  test(`.one`, `.one`)
  test(`..one`, `..one`)
  test(`./one`, `one`)
  test(`.\\one`, `one`)
  test(`./one/`, `one`)
  test(`./one//`, `one`)
  test(`./one\\`, `one`)
  test(`./one\\\\`, `one`)
  test(`.\\one\\`, `one`)
  test(`./one/two`, `one/two`)
  test(`.\\one\\two`, `one/two`)
  test(`./one/two/`, `one/two`)
  test(`.\\one\\two\\`, `one/two`)
  test(`./one/two//`, `one/two`)
  test(`.\\one\\two\\\\`, `one/two`)

  test(`one/`, `one`)
  test(`one\\`, `one`)
  test(`one//`, `one`)
  test(`one\\\\`, `one`)
  test(`/one`, `/one`)
  test(`\\one`, `/one`)
  test(`/one/`, `/one`)
  test(`\\one\\`, `/one`)
  test(`//one`, `/one`)
  test(`\\\\one`, `/one`)
  test(`//one/`, `/one`)
  test(`\\\\one\\`, `/one`)
  test(`one/two`, `one/two`)
  test(`one\\two`, `one/two`)
  test(`one//two`, `one//two`)
  test(`one\\\\two`, `one//two`)
  test(`one///two`, `one///two`)
  test(`one\\\\\\two`, `one///two`)
  test(`one/two/`, `one/two`)
  test(`one\\two\\`, `one/two`)
  test(`/one/two`, `/one/two`)
  test(`\\one\\two`, `/one/two`)
  test(`/one/two/`, `/one/two`)
  test(`\\one\\two\\`, `/one/two`)

  test(`C:`, `C:`)
  test(`C:/`, `C:/`)
  test(`C:\\`, `C:/`)
  test(`C://`, `C:/`)
  test(`C:\\\\`, `C:/`)
  test(`C:/one`, `C:/one`)
  test(`C:\\one`, `C:/one`)
  test(`C:/one/`, `C:/one`)
  test(`C:\\one\\`, `C:/one`)
})

// Missing feature: `..` flattening.
t.test(function test_join() {
  function fun(...val) {return p.join(...val)}

  function failAbs(one, two) {
    t.throws(
      () => fun(one, two),
      Error,
      `unable to append absolute path ${l.show(two)}`,
    )
  }

  failAbs(``, `/`)
  failAbs(``, `\\`)
  failAbs(``, `/two`)
  failAbs(``, `\\two`)
  failAbs(`.`, `/two`)
  failAbs(`.`, `\\two`)
  failAbs(`./`, `/two`)
  failAbs(`.\\`, `\\two`)
  failAbs(`one`, `/two`)
  failAbs(`one`, `\\two`)
  failAbs(`one`, `C:`)
  failAbs(`one`, `C:\\`)

  t.is(fun(), ``)
  t.is(fun(``), ``)
  t.is(fun(`.`), ``)
  t.is(fun(`./`), ``)
  t.is(fun(`.\\`), ``)
  t.is(fun(`/`), `/`)
  t.is(fun(`\\`), `/`)
  t.is(fun(`one`), `one`)
  t.is(fun(`/one`), `/one`)
  t.is(fun(`\\one`), `/one`)

  t.is(fun(``, `one`), `one`)
  t.is(fun(`.`, `one`), `one`)
  t.is(fun(`./`, `one`), `one`)
  t.is(fun(`.\\`, `one`), `one`)

  t.is(fun(``, `one`, `two`), `one/two`)
  t.is(fun(`.`, `one`, `two`), `one/two`)
  t.is(fun(`./`, `one`, `two`), `one/two`)
  t.is(fun(`.\\`, `one`, `two`), `one/two`)

  t.is(fun(``, `one/`, `two`), `one/two`)
  t.is(fun(`.`, `one/`, `two`), `one/two`)
  t.is(fun(`./`, `one/`, `two`), `one/two`)

  t.is(fun(`one`, ``), `one`)
  t.is(fun(`one`, `.`), `one`)
  t.is(fun(`one`, `./`), `one`)
  t.is(fun(`one`, `.\\`), `one`)
  t.is(fun(`one`, ``, `two`), `one/two`)
  t.is(fun(`one`, `.`, `two`), `one/two`)
  t.is(fun(`one`, `./`, `two`), `one/two`)
  t.is(fun(`one`, `.\\`, `two`), `one/two`)

  t.is(fun(`/one`, `.`), `/one`)
  t.is(fun(`\\one`, `.`), `/one`)
  t.is(fun(`/one`, `./`), `/one`)
  t.is(fun(`\\one`, `.\\`), `/one`)
  t.is(fun(`/one`, ``), `/one`)
  t.is(fun(`\\one`, ``), `/one`)

  t.is(fun(`/one/`, `.`), `/one`)
  t.is(fun(`\\one\\`, `.`), `/one`)
  t.is(fun(`/one/`, `./`), `/one`)
  t.is(fun(`\\one\\`, `.\\`), `/one`)
  t.is(fun(`/one/`, ``), `/one`)
  t.is(fun(`\\one\\`, ``), `/one`)

  t.is(fun(`/one`, `.`, `two`), `/one/two`)
  t.is(fun(`\\one`, `.`, `two`), `/one/two`)
  t.is(fun(`/one`, `./`, `two`), `/one/two`)
  t.is(fun(`\\one`, `.\\`, `two`), `/one/two`)
  t.is(fun(`/one`, ``, `two`), `/one/two`)
  t.is(fun(`\\one`, ``, `two`), `/one/two`)

  t.is(fun(`/one/`, `.`, `two`), `/one/two`)
  t.is(fun(`\\one\\`, `.`, `two`), `/one/two`)
  t.is(fun(`/one/`, `./`, `two`), `/one/two`)
  t.is(fun(`\\one\\`, `.\\`, `two`), `/one/two`)
  t.is(fun(`/one/`, ``, `two`), `/one/two`)
  t.is(fun(`\\one\\`, ``, `two`), `/one/two`)

  t.is(fun(`/one`, `two`), `/one/two`)
  t.is(fun(`\\one`, `two`), `/one/two`)
  t.is(fun(`/one`, `two/`), `/one/two`)
  t.is(fun(`\\one`, `two\\`), `/one/two`)
  t.is(fun(`/one/`, `two`), `/one/two`)
  t.is(fun(`\\one\\`, `two`), `/one/two`)
  t.is(fun(`/one/`, `two/`), `/one/two`)
  t.is(fun(`\\one\\`, `two\\`), `/one/two`)

  t.is(fun(`/one`, `two`, `three`), `/one/two/three`)
  t.is(fun(`\\one`, `two`, `three`), `/one/two/three`)
  t.is(fun(`/one`, `two/`, `three`), `/one/two/three`)
  t.is(fun(`\\one`, `two\\`, `three`), `/one/two/three`)
  t.is(fun(`/one/`, `two`, `three`), `/one/two/three`)
  t.is(fun(`\\one\\`, `two`, `three`), `/one/two/three`)
  t.is(fun(`/one/`, `two/`, `three`), `/one/two/three`)
  t.is(fun(`\\one\\`, `two\\`, `three`), `/one/two/three`)

  t.is(fun(`C:`), `C:`)
  t.is(fun(`C:`, `one`), `C:/one`)
  t.is(fun(`C:\\`, `one`), `C:/one`)
  t.is(fun(`C:`, `one`, `two`), `C:/one/two`)
  t.is(fun(`C:`, `one\\`, `two`), `C:/one/two`)
})

t.test(function test_isSubOf() {
  function miss(...val) {t.no(p.isSubOf(...val), ...val)}
  function hit(...val) {t.ok(p.isSubOf(...val), ...val)}

  hit(``, ``)
  hit(`.`, ``)
  hit(``, `.`)
  hit(`./`, ``)
  hit(`.\\`, ``)
  hit(``, `./`)
  hit(``, `.\\`)

  miss(`/`, ``)
  miss(`\\`, ``)

  miss(`/`, `.`)
  miss(`\\`, `.`)

  miss(`/`, `./`)
  miss(`\\`, `.\\`)

  miss(`/`, `one`)
  miss(`\\`, `one`)

  miss(`/`, `/one`)
  miss(`\\`, `\\one`)

  hit(`/`, `/`)
  hit(`\\`, `\\`)

  miss(`/one`, ``)
  miss(`\\one`, ``)

  miss(`/one`, `.`)
  miss(`\\one`, `.`)

  miss(`/one`, `./`)
  miss(`\\one`, `.\\`)

  miss(`/one`, `one`)
  miss(`\\one`, `one`)

  miss(`/one`, `/one/two`)
  miss(`\\one`, `\\one\\two`)

  hit(`/one`, `/`)
  hit(`\\one`, `\\`)

  hit(`/one`, `/one`)
  hit(`\\one`, `\\one`)

  hit(`/one/two`, `/one`)
  hit(`\\one\\two`, `\\one`)

  miss(``, `one`)
  miss(`.`, `one`)

  miss(`./`, `one`)
  miss(`.\\`, `one`)

  miss(``, `/one`)
  miss(``, `\\one`)

  miss(`.`, `/one`)
  miss(`.`, `\\one`)

  miss(`./`, `/one`)
  miss(`.\\`, `\\one`)

  miss(`one`, `/one`)
  miss(`one`, `\\one`)

  miss(`one/two`, `/one`)
  miss(`one\\two`, `\\one`)

  miss(`one`, `/one/two`)
  miss(`one`, `\\one\\two`)

  miss(`one/two`, `/one/two`)
  miss(`one\\two`, `\\one\\two`)

  hit(`one`, ``)
  hit(`one`, `.`)
  hit(`one`, `one`)

  hit(`one`, `./`)
  hit(`one`, `.\\`)

  hit(`one`, `one/`)
  hit(`one`, `one\\`)

  hit(`one/`, `one/`)
  hit(`one\\`, `one\\`)

  hit(`one/`, `one`)
  hit(`one\\`, `one`)

  miss(`one`, `one/two`)
  miss(`one`, `one\\two`)

  hit(`one/two`, `one`)
  hit(`one\\two`, `one`)

  hit(`one/two`, `one/two`)
  hit(`one\\two`, `one\\two`)

  hit(`one/two/three`, `one`)
  hit(`one\\two\\three`, `one`)

  hit(`one/two/three`, `one/two`)
  hit(`one\\two\\three`, `one\\two`)

  hit(`one/two/three`, `one/two/three`)
  hit(`one\\two\\three`, `one\\two\\three`)

  hit(`one/two/three/`, `one`)
  hit(`one\\two\\three\\`, `one`)

  hit(`one/two/three/`, `one/two`)
  hit(`one\\two\\three\\`, `one\\two`)

  hit(`one/two/three/`, `one/two/three`)
  hit(`one\\two\\three\\`, `one\\two\\three`)

  hit(`one/two/three/`, `one/`)
  hit(`one\\two\\three\\`, `one\\`)

  hit(`one/two/three/`, `one/two/`)
  hit(`one\\two\\three\\`, `one\\two\\`)

  hit(`one/two/three/`, `one/two/three/`)
  hit(`one\\two\\three\\`, `one\\two\\three\\`)
})

t.test(function test_strictRelTo() {
  function fun(...val) {return p.strictRelTo(...val)}
  function test(one, two, exp) {t.is(fun(one, two), exp, one, two)}
  function same(one, two) {test(one, two, ``)}

  t.throws(() => fun(`/one`, `/two`), Error, `unable to make "/one" strictly relative to "/two"`)
  t.throws(() => fun(`/one`, `/one/two`), Error, `unable to make "/one" strictly relative to "/one/two"`)
  t.throws(() => fun(`\\one`, `\\two`), Error, `unable to make "/one" strictly relative to "/two"`)
  t.throws(() => fun(`\\one`, `\\one\\two`), Error, `unable to make "/one" strictly relative to "/one/two"`)

  same(``, ``)
  same(`.`, ``)
  same(``, `.`)
  same(`./`, `./`)
  same(`.\\`, `./`)
  same(`/`, `/`)
  same(`\\`, `/`)

  test(`one`, `./`, `one`)
  test(`one`, `.\\`, `one`)
  test(`one/`, `./`, `one`)
  test(`one\\`, `.\\`, `one`)
  test(`one/two`, `./`, `one/two`)
  test(`one\\two`, `.\\`, `one/two`)
  test(`one/two/`, `./`, `one/two`)
  test(`one\\two\\`, `.\\`, `one/two`)

  same(`one`, `one`)
  same(`one`, `one/`)
  same(`one`, `one\\`)
  same(`one/`, `one`)
  same(`one\\`, `one`)
  same(`one/`, `one/`)
  same(`one\\`, `one\\`)

  same(`/one`, `/one`)
  same(`\\one`, `\\one`)
  same(`/one`, `/one/`)
  same(`\\one`, `\\one\\`)
  same(`/one/`, `/one`)
  same(`\\one\\`, `\\one`)
  same(`/one/`, `/one/`)
  same(`\\one\\`, `\\one\\`)

  same(`one/two`, `one/two`)
  same(`one\\two`, `one\\two`)
  same(`one/two`, `one/two/`)
  same(`one\\two`, `one\\two\\`)
  same(`one/two/`, `one/two`)
  same(`one\\two\\`, `one\\two`)
  same(`one/two/`, `one/two/`)
  same(`one\\two\\`, `one\\two\\`)

  same(`/one/two`, `/one/two`)
  same(`\\one\\two`, `\\one\\two`)
  same(`/one/two`, `/one/two/`)
  same(`\\one\\two`, `\\one\\two\\`)
  same(`/one/two/`, `/one/two`)
  same(`\\one\\two\\`, `\\one\\two`)
  same(`/one/two/`, `/one/two/`)
  same(`\\one\\two\\`, `\\one\\two\\`)

  test(`one/two`, `one`, `two`)
  test(`one\\two`, `one`, `two`)
  test(`one/two`, `one/`, `two`)
  test(`one\\two`, `one\\`, `two`)
  test(`one/two/`, `one`, `two`)
  test(`one\\two\\`, `one`, `two`)
  test(`one/two/`, `one/`, `two`)
  test(`one\\two\\`, `one\\`, `two`)

  test(`/one/two`, `/one`, `two`)
  test(`\\one\\two`, `\\one`, `two`)
  test(`/one/two`, `/one/`, `two`)
  test(`\\one\\two`, `\\one\\`, `two`)
  test(`/one/two/`, `/one`, `two`)
  test(`\\one\\two\\`, `\\one`, `two`)
  test(`/one/two/`, `/one/`, `two`)
  test(`\\one\\two\\`, `\\one\\`, `two`)

  test(`one/two/three`, `one`, `two/three`)
  test(`one\\two\\three`, `one`, `two/three`)
  test(`one/two/three`, `one/`, `two/three`)
  test(`one\\two\\three`, `one\\`, `two/three`)
  test(`one/two/three/`, `one`, `two/three`)
  test(`one\\two\\three\\`, `one`, `two/three`)
  test(`one/two/three/`, `one/`, `two/three`)
  test(`one\\two\\three\\`, `one\\`, `two/three`)

  test(`/one/two/three`, `/one`, `two/three`)
  test(`\\one\\two\\three`, `\\one`, `two/three`)
  test(`/one/two/three`, `/one/`, `two/three`)
  test(`\\one\\two\\three`, `\\one\\`, `two/three`)
  test(`/one/two/three/`, `/one`, `two/three`)
  test(`\\one\\two\\three\\`, `\\one`, `two/three`)
  test(`/one/two/three/`, `/one/`, `two/three`)
  test(`\\one\\two\\three\\`, `\\one\\`, `two/three`)

  same(`C:`, `C:`)
  same(`C:\\`, `C:\\`)

  test(`C:\\one`, `C:\\`, `one`)
  test(`C:\\one\\`, `C:\\`, `one`)
  test(`C:\\one\\two`, `C:\\`, `one/two`)
  test(`C:\\one\\two\\`, `C:\\`, `one/two`)
  test(`C:\\one\\two`, `C:\\one`, `two`)
  test(`C:\\one\\two\\`, `C:\\one`, `two`)
  test(`C:\\one\\two\\`, `C:\\one\\`, `two`)
})

/*
TODO add test for Windows paths with volumes.

TODO test absolute paths.
  * Both absolute.
  * Sub absolute.
  * Suf absolute.
*/
t.test(function test_relTo() {
  function fun(...val) {return p.relTo(...val)}
  function test(one, two, exp) {t.is(fun(one, two), exp, one, two)}

  test(``,              ``,              ``)
  test(`one`,           ``,              `one`)
  test(`one/two`,       ``,              `one/two`)
  test(``,              `one`,           `..`)
  test(``,              `one/two`,       `../..`)
  test(`one`,           `two`,           `../one`)
  test(`one/two`,       `three`,         `../one/two`)
  test(`one`,           `two/three`,     `../../one`)
  test(`one/two`,       `one/three`,     `../two`)
  test(`one/two/three`, `one/two/four`,  `../three`)
  test(`one/two/three`, `one/four/five`, `../../two/three`)
})

t.test(function test_dirLike() {
  function fun(val) {return p.dirLike(val)}
  function test(src, exp) {t.is(fun(src), exp, src)}

  test(``, ``)
  test(`.`, ``)
  test(`./`, ``)
  test(`.\\`, ``)

  test(`/`, `/`)
  test(`\\`, `/`)
  test(`one/`, `one/`)
  test(`one\\`, `one/`)
  test(`one/two/`, `one/two/`)
  test(`one\\two\\`, `one/two/`)

  test(`/one`, `/one/`)
  test(`\\one`, `/one/`)
  test(`one`, `one/`)
  test(`one`, `one/`)
  test(`one/two`, `one/two/`)
  test(`one\\two`, `one/two/`)
  test(`/one/two`, `/one/two/`)
  test(`\\one\\two`, `/one/two/`)

  test(`C:`, `C:/`)
  test(`C:/`, `C:/`)
  test(`C:\\`, `C:/`)
})

t.test(function test_dir() {
  function fun(val) {return p.dir(val)}
  function test(src, exp) {t.is(fun(src), exp, src)}

  test(``, ``)
  test(`.`, ``)
  test(`./`, ``)
  test(`.\\`, ``)

  test(`/`, `/`)
  test(`//`, `/`)
  test(`///`, `/`)
  test(`/one`, `/`)
  test(`/one/`, `/one`)
  test(`/one/two`, `/one`)
  test(`/one/two/`, `/one/two`)

  test(`\\`, `/`)
  test(`\\\\`, `/`)
  test(`\\\\\\`, `/`)
  test(`\\one`, `/`)
  test(`\\one\\`, `/one`)
  test(`\\one\\two`, `/one`)
  test(`\\one\\two\\`, `/one/two`)

  test(`one`, ``)
  test(`one/`, `one`)
  test(`./one`, ``)
  test(`./one/`, `one`)
  test(`one/two`, `one`)
  test(`./one/two`, `one`)
  test(`one/two/`, `one/two`)
  test(`./one/two/`, `one/two`)

  test(`one`, ``)
  test(`one\\`, `one`)
  test(`.\\one`, ``)
  test(`.\\one\\`, `one`)
  test(`one\\two`, `one`)
  test(`.\\one\\two`, `one`)
  test(`one\\two\\`, `one/two`)
  test(`.\\one\\two\\`, `one/two`)

  test(`C:`, `C:`)
  test(`C:/`, `C:/`)
  test(`C:\\`, `C:/`)
  test(`C:/one`, `C:/`)
  test(`C:\\one`, `C:/`)
})

t.test(function test_name() {
  function fun(val) {return p.name(val)}
  function test(src, exp) {t.is(fun(src), exp, src)}

  test(``, ``)
  test(`.`, ``)
  test(`./`, ``)
  test(`.\\`, ``)

  test(`/`, ``)
  test(`\\`, ``)

  test(`C:`, ``)
  test(`C:\\`, ``)

  test(`.one`, `.one`)
  test(`.one.two`, `.one.two`)

  test(`/one`, `one`)
  test(`/one/`, `one`)

  test(`\\one`, `one`)
  test(`\\one\\`, `one`)

  test(`/one/two`, `two`)
  test(`/one/two/`, `two`)

  test(`/one/.two`, `.two`)
  test(`/one/.two/`, `.two`)

  test(`/one/.two.three`, `.two.three`)
  test(`/one/.two.three/`, `.two.three`)

  test(`\\one\\two`, `two`)
  test(`\\one\\two\\`, `two`)

  test(`/one/two/three`, `three`)
  test(`/one/two/three/`, `three`)

  test(`\\one\\two\\three`, `three`)
  test(`\\one\\two\\three\\`, `three`)

  test(`/one.two`, `one.two`)
  test(`/one.two/`, `one.two`)

  test(`\\one.two`, `one.two`)
  test(`\\one.two\\`, `one.two`)

  test(`/one.two.three`, `one.two.three`)
  test(`/one.two.three/`, `one.two.three`)

  test(`\\one.two.three`, `one.two.three`)
  test(`\\one.two.three\\`, `one.two.three`)

  test(`/one/two.three`, `two.three`)
  test(`/one/two.three/`, `two.three`)

  test(`\\one\\two.three`, `two.three`)
  test(`\\one\\two.three\\`, `two.three`)

  test(`/one/two/three.four`, `three.four`)
  test(`/one/two/three.four/`, `three.four`)

  test(`\\one\\two\\three.four`, `three.four`)
  test(`\\one\\two\\three.four\\`, `three.four`)

  test(`C:\\one`, `one`)
  test(`C:\\one\\`, `one`)
  test(`C:\\one\\two`, `two`)
  test(`C:\\one\\two\\`, `two`)
})

t.test(function test_ext() {
  function fun(val) {return p.ext(val)}
  function test(src, exp) {t.is(fun(src), exp, src)}
  function none(val) {test(val, ``)}

  none(``)
  none(`.`)
  none(`./`)
  none(`/`)
  none(`one`)
  none(`/one`)
  none(`one/two`)
  none(`/one/two`)
  none(`.one`)
  none(`/.one`)
  none(`one/.two`)
  none(`/one/.two`)

  none(`.\\`)
  none(`\\`)
  none(`\\one`)
  none(`one\\two`)
  none(`\\one\\two`)
  none(`\\.one`)
  none(`one\\.two`)
  none(`\\one\\.two`)

  test(`..one`, `.one`)

  test(`/..one`, `.one`)
  test(`\\..one`, `.one`)

  test(`one/..two`, `.two`)
  test(`one\\..two`, `.two`)

  test(`/one/..two`, `.two`)
  test(`\\one\\..two`, `.two`)

  test(`one.two`, `.two`)
  test(`.one.two`, `.two`)

  test(`/one.two`, `.two`)
  test(`\\one.two`, `.two`)

  test(`/.one.two`, `.two`)
  test(`\\.one.two`, `.two`)

  test(`one..two`, `.two`)

  test(`/one..two`, `.two`)
  test(`\\one..two`, `.two`)

  test(`one/two.three`, `.three`)
  test(`one\\two.three`, `.three`)

  test(`/one/two.three`, `.three`)
  test(`\\one\\two.three`, `.three`)

  test(`one/two..three`, `.three`)
  test(`one\\two..three`, `.three`)

  test(`/one/two..three`, `.three`)
  test(`\\one\\two..three`, `.three`)

  test(`one.two.three`, `.three`)

  test(`/one.two.three`, `.three`)
  test(`\\one.two.three`, `.three`)

  test(`one/two.three.four`, `.four`)
  test(`one\\two.three.four`, `.four`)

  test(`/one/two.three.four`, `.four`)
  test(`\\one\\two.three.four`, `.four`)

  test(`one/two..three.four`, `.four`)
  test(`one\\two..three.four`, `.four`)

  test(`/one/two..three.four`, `.four`)
  test(`\\one\\two..three.four`, `.four`)

  test(`one/two..three..four`, `.four`)
  test(`one\\two..three..four`, `.four`)

  test(`/one/two..three..four`, `.four`)
  test(`\\one\\two..three..four`, `.four`)

  none(`C:`)
  none(`C:/`)
  none(`C:\\`)
  none(`C:/one`)
  none(`C:\\one`)
  test(`C://one.two`, `.two`)
  test(`C:\\one.two`, `.two`)
})

t.test(function test_stem() {
  function fun(val) {return p.stem(val)}
  function test(src, exp) {t.is(fun(src), exp, src)}
  function same(val) {test(val, val)}

  same(``)
  test(`.`, ``)
  test(`./`, ``)
  test(`.\\`, ``)

  test(`/`, ``)
  test(`\\`, ``)

  test(`C:`, ``)
  test(`C:/`, ``)
  test(`C:\\`, ``)

  test(`/one`, `one`)
  test(`\\one`, `one`)

  test(`/one/`, `one`)
  test(`\\one\\`, `one`)

  test(`/one/two`, `two`)
  test(`\\one\\two`, `two`)

  test(`/one/two/`, `two`)
  test(`\\one\\two\\`, `two`)

  test(`/one/two/three`, `three`)
  test(`\\one\\two\\three`, `three`)

  test(`/one/two/three/`, `three`)
  test(`\\one\\two\\three\\`, `three`)

  test(`/one.two`, `one`)
  test(`\\one.two`, `one`)

  test(`/one.two/`, `one`)
  test(`\\one.two\\`, `one`)

  test(`/one.two.three`, `one.two`)
  test(`\\one.two.three`, `one.two`)

  test(`/one.two.three/`, `one.two`)
  test(`\\one.two.three\\`, `one.two`)

  test(`/one/two.three`, `two`)
  test(`\\one\\two.three`, `two`)

  test(`/one/two.three/`, `two`)
  test(`\\one\\two.three\\`, `two`)

  test(`/one/two/three.four`, `three`)
  test(`\\one\\two\\three.four`, `three`)

  test(`/one/two/three.four/`, `three`)
  test(`\\one\\two\\three.four\\`, `three`)

  test(`C:\\one`, `one`)
  test(`C:\\one.three`, `one`)
  test(`C:\\one\\`, `one`)
  test(`C:\\one.three\\`, `one`)
  test(`C:\\one\\two`, `two`)
  test(`C:\\one\\two.three`, `two`)
  test(`C:\\one\\two\\`, `two`)
  test(`C:\\one\\two.three\\`, `two`)
})

if (import.meta.main) console.log(`[test] ok!`)
