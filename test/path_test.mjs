import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as p from '../path.mjs'

t.test(function test_isPath() {
  t.no(p.isPath())
  t.no(p.isPath(10))
  t.no(p.isPath(true))
  t.no(p.isPath({}))
  t.no(p.isPath([]))

  t.ok(p.isPath(``))
  t.ok(p.isPath(`str`))
  t.ok(p.isPath(new URL(`file:`)))
})

t.test(function test_toPosix() {
  t.throws(p.toPosix, TypeError, `unable to convert undefined to string`)

  function test(src, exp) {t.is(p.toPosix(src), exp)}
  function same(val) {test(val, val)}

  same(`/`)
  same(`//`)
  same(`one/two`)
  same(`one://two.three/four/five`)

  test(`\\`, `/`)
  test(`\\\\`, `//`)
  test(`one\\two`, `one/two`)
  test(`one://two.three/four\\five`, `one://two.three/four/five`)
})

// Sanity check. See tests for `Paths`.
t.test(function test_PathsPosix() {
  const paths = new p.PathsPosix()
  t.is(paths.join(`one`, `two`, `three`), `one/two/three`)
})

// Sanity check. See tests for `Paths`.
t.test(function test_PathsWindows() {
  const paths = new p.PathsWindows()
  t.is(paths.join(`one`, `two`, `three`), `one\\two\\three`)
})

// Sanity check. See tests for `Paths`.
t.test(function test_posix() {
  t.is(p.posix.join(`one`, `two`, `three`), `one/two/three`)
})

// Sanity check. See tests for `Paths`.
t.test(function test_windows() {
  t.is(p.windows.join(`one`, `two`, `three`), `one\\two\\three`)
})

/*
Currently this tests the base class indirectly, by testing global instances.
May reconsider later.
*/
t.test(function test_Paths() {
  t.test(function test_dirSep() {
    t.is(p.posix.dirSep, `/`)
    t.is(p.windows.dirSep, `\\`)
  })

  t.test(function test_extSep() {
    t.is(p.posix.extSep, `.`)
    t.is(p.windows.extSep, `.`)
  })

  t.test(function test_cwdRel() {
    t.is(p.posix.cwdRel, `.`)
    t.is(p.windows.cwdRel, `.`)
  })

  t.test(function test_relPre() {
    t.is(p.posix.relPre(), `./`)
    t.is(p.windows.relPre(), `.\\`)
  })

  t.test(function test_vol() {
    t.is(p.posix.vol(`/`), ``)
    t.is(p.posix.vol(`/one`), ``)
    t.is(p.posix.vol(`//one`), ``)
    t.is(p.posix.vol(`\\one`), ``)
    t.is(p.posix.vol(`\\\\one`), ``)
    t.is(p.posix.vol(`C://one`), ``)

    t.is(p.windows.vol(`/`), ``)
    t.is(p.windows.vol(`/one`), ``)
    t.is(p.windows.vol(`//one`), ``)
    t.is(p.windows.vol(`\\one`), ``)
    t.is(p.windows.vol(`\\\\one`), ``)
    t.is(p.windows.vol(`C:`), `C:`)
    t.is(p.windows.vol(`C:\\one`), `C:`)
  })

  t.test(function test_isAbs() {
    const miss = [``, `.`, `..`, `./`, `../`, `one`, `one/two`]
    const hitPos = [`/`, `/one`, `/one/two`]
    const hitWin = [`\\`, `\\one`, `\\one/two`, `C:`, `C:/one`, `C:\\one`]

    t.test(function test_posix() {
      for (const val of miss) t.no(p.posix.isAbs(val), val)
      for (const val of hitPos) t.ok(p.posix.isAbs(val), val)
      for (const val of hitWin) t.no(p.posix.isAbs(val), val)
    })

    t.test(function test_windows() {
      for (const val of miss) t.no(p.windows.isAbs(val), val)

      // Probably incorrect. We might need to support `/` on Windows.
      for (const val of hitPos) t.no(p.windows.isAbs(val), val)

      for (const val of hitWin) t.ok(p.windows.isAbs(val), val)
    })
  })

  // Uses `!isAbs`, we only need a sanity check.
  t.test(function test_isRel() {
    t.no(p.posix.isRel(`/`))
    t.no(p.posix.isRel(`/one`))

    t.ok(p.posix.isRel(`C:`))
    t.ok(p.posix.isRel(`\\`))
    t.ok(p.posix.isRel(`one`))

    t.no(p.windows.isRel(`C:`))
    t.no(p.windows.isRel(`\\`))

    t.ok(p.windows.isRel(`/one`))
    t.ok(p.windows.isRel(`one`))
  })

  t.test(function test_isRelExplicit() {
    t.test(function test_posix() {
      t.no(p.posix.isRelExplicit(``))
      t.no(p.posix.isRelExplicit(`one`))
      t.no(p.posix.isRelExplicit(`one/`))
      t.no(p.posix.isRelExplicit(`one/two`))
      t.no(p.posix.isRelExplicit(`one/two/`))

      t.no(p.posix.isRelExplicit(`/`))
      t.no(p.posix.isRelExplicit(`/one`))
      t.no(p.posix.isRelExplicit(`/one/`))
      t.no(p.posix.isRelExplicit(`/one/two`))
      t.no(p.posix.isRelExplicit(`/one/two/`))

      t.no(p.posix.isRelExplicit(`C:`))
      t.no(p.posix.isRelExplicit(`C:/`))
      t.no(p.posix.isRelExplicit(`C://`))
      t.no(p.posix.isRelExplicit(`C://one`))
      t.no(p.posix.isRelExplicit(`C://one/`))

      t.ok(p.posix.isRelExplicit(`.`))
      t.ok(p.posix.isRelExplicit(`./`))
      t.ok(p.posix.isRelExplicit(`./one`))
      t.ok(p.posix.isRelExplicit(`./one/`))
      t.ok(p.posix.isRelExplicit(`./one/two`))
      t.ok(p.posix.isRelExplicit(`./one/two/`))
    })

    t.test(function test_windows() {
      t.no(p.windows.isRelExplicit(``))
      t.no(p.windows.isRelExplicit(`one`))
      t.no(p.windows.isRelExplicit(`one\\`))
      t.no(p.windows.isRelExplicit(`one\\two`))
      t.no(p.windows.isRelExplicit(`one\\two\\`))

      t.no(p.windows.isRelExplicit(`\\`))
      t.no(p.windows.isRelExplicit(`\\one`))
      t.no(p.windows.isRelExplicit(`\\one\\`))
      t.no(p.windows.isRelExplicit(`\\one\\two`))
      t.no(p.windows.isRelExplicit(`\\one\\two\\`))

      t.no(p.windows.isRelExplicit(`C:`))
      t.no(p.windows.isRelExplicit(`C:\\`))
      t.no(p.windows.isRelExplicit(`C:\\\\`))
      t.no(p.windows.isRelExplicit(`C:\\\\one`))
      t.no(p.windows.isRelExplicit(`C:\\\\one\\`))

      t.ok(p.windows.isRelExplicit(`.`))
      t.ok(p.windows.isRelExplicit(`.\\`))
      t.ok(p.windows.isRelExplicit(`.\\one`))
      t.ok(p.windows.isRelExplicit(`.\\one\\`))
      t.ok(p.windows.isRelExplicit(`.\\one\\two`))
      t.ok(p.windows.isRelExplicit(`.\\one\\two\\`))
    })
  })

  t.test(function test_isRelImplicit() {
    t.test(function test_posix() {
      t.ok(p.posix.isRelImplicit(``))
      t.ok(p.posix.isRelImplicit(`one`))
      t.ok(p.posix.isRelImplicit(`one/`))
      t.ok(p.posix.isRelImplicit(`one/two`))
      t.ok(p.posix.isRelImplicit(`one/two/`))

      t.no(p.posix.isRelImplicit(`/`))
      t.no(p.posix.isRelImplicit(`/one`))
      t.no(p.posix.isRelImplicit(`/one/`))
      t.no(p.posix.isRelImplicit(`/one/two`))
      t.no(p.posix.isRelImplicit(`/one/two/`))

      t.no(p.posix.isRelImplicit(`.`))
      t.no(p.posix.isRelImplicit(`./`))
      t.no(p.posix.isRelImplicit(`./one`))
      t.no(p.posix.isRelImplicit(`./one/`))
      t.no(p.posix.isRelImplicit(`./one/two`))
      t.no(p.posix.isRelImplicit(`./one/two/`))

      /*
      This is considered an implicitly relative path under Posix because
      `scheme:` is a valid file name or beginning of file name, and there
      is no special detection/treatment for URL schemes or Windows-like
      volume letters.
      */
      t.ok(p.posix.isRelImplicit(`C:`))
      t.ok(p.posix.isRelImplicit(`C:/`))
      t.ok(p.posix.isRelImplicit(`C://`))
      t.ok(p.posix.isRelImplicit(`C://one`))
      t.ok(p.posix.isRelImplicit(`C://one/`))
    })

    t.test(function test_windows() {
      t.ok(p.windows.isRelImplicit(``))
      t.ok(p.windows.isRelImplicit(`one`))
      t.ok(p.windows.isRelImplicit(`one\\`))
      t.ok(p.windows.isRelImplicit(`one\\two`))
      t.ok(p.windows.isRelImplicit(`one\\two\\`))

      t.no(p.windows.isRelImplicit(`\\`))
      t.no(p.windows.isRelImplicit(`\\one`))
      t.no(p.windows.isRelImplicit(`\\one\\`))
      t.no(p.windows.isRelImplicit(`\\one\\two`))
      t.no(p.windows.isRelImplicit(`\\one\\two\\`))

      t.no(p.windows.isRelImplicit(`C:`))
      t.no(p.windows.isRelImplicit(`C:\\`))
      t.no(p.windows.isRelImplicit(`C:\\\\`))
      t.no(p.windows.isRelImplicit(`C:\\\\one`))
      t.no(p.windows.isRelImplicit(`C:\\\\one\\`))

      t.no(p.windows.isRelImplicit(`.`))
      t.no(p.windows.isRelImplicit(`.\\`))
      t.no(p.windows.isRelImplicit(`.\\one`))
      t.no(p.windows.isRelImplicit(`.\\one\\`))
      t.no(p.windows.isRelImplicit(`.\\one\\two`))
      t.no(p.windows.isRelImplicit(`.\\one\\two\\`))
    })
  })

  t.test(function test_isDirLike() {
    const miss = [`one`, `one/two`, `one\\two`]
    const hit = [``, `.`]
    const hitPos = [`/`, `//`, `./`, `../`, `one/`, `one/two/`]
    const hitWin = [`C:`, `C:\\`, `C:\\one\\`, `\\`, `\\\\`, `.\\`, `..\\`, `one\\`, `one\\two\\`]

    t.test(function test_posix() {
      for (const val of miss) t.no(p.posix.isDirLike(val), val)
      for (const val of hitWin) t.no(p.posix.isDirLike(val), val)

      for (const val of hit) t.ok(p.posix.isDirLike(val), val)
      for (const val of hitPos) t.ok(p.posix.isDirLike(val), val)
    })

    t.test(function test_windows() {
      for (const val of miss) t.no(p.windows.isDirLike(val), val)
      for (const val of hitPos) t.no(p.windows.isDirLike(val), val)

      for (const val of hit) t.ok(p.windows.isDirLike(val), val)
      for (const val of hitWin) t.ok(p.windows.isDirLike(val), val)
    })
  })

  t.test(function test_isRoot() {
    const miss = [
      ``, `one`, `.`, `./`, `..`, `../`,
      `one/`, `/one`, `/one/`,
      `one/two`, `one/two/`, `/one/two`, `/one/two/`,
      `C:one`, `C:\\one`, `C:/`, `C:/one`,
      `//`, `\\\\`,
    ]
    const hitPos = [`/`]
    const hitWin = [`C:`, `C:\\`]

    t.test(function test_posix() {
      for (const val of miss) t.no(p.posix.isRoot(val), val)
      for (const val of hitWin) t.no(p.posix.isRoot(val), val)
      for (const val of hitPos) t.ok(p.posix.isRoot(val), val)
    })

    t.test(function test_windows() {
      for (const val of miss) t.no(p.windows.isRoot(val), val)
      for (const val of hitPos) t.no(p.windows.isRoot(val), val)
      for (const val of hitWin) t.ok(p.windows.isRoot(val), val)
    })
  })

  /*
  Technically, on Windows the current volume is equivalent to `.`. For example,
  when the CWD is inside volume `D:`, using `D:` is equivalent to `.`, while
  using `C:` is equivalent to `C:\`. This cannot be determined syntactically.
  You have to know the CWD to determine if the path refers to CWD or to the
  root of another volume. Since our path module doesn't perform OS IO,
  we simply do not consider such paths to be CWD references.
  */
  t.test(function test_isCwdRel() {
    const miss = [
      `/`, `../`, `\\`, `..\\`,
      `C:`, `D:`, `C:\\`, `C:\\one`, `C:/`, `C://`,
      `~`, `one`, `./one`,
    ]
    const hit = [``, `.`]
    const hitPos = [`./`]
    const hitWin = [`.\\`]

    t.test(function test_posix() {
      for (const val of miss) t.no(p.posix.isCwdRel(val), val)
      for (const val of hitWin) t.no(p.posix.isCwdRel(val), val)

      for (const val of hit) t.ok(p.posix.isCwdRel(val), val)
      for (const val of hitPos) t.ok(p.posix.isCwdRel(val), val)
    })

    t.test(function test_windows() {
      for (const val of miss) t.no(p.windows.isCwdRel(val), val)
      for (const val of hitPos) t.no(p.windows.isCwdRel(val), val)

      for (const val of hit) t.ok(p.windows.isCwdRel(val), val)
      for (const val of hitWin) t.ok(p.windows.isCwdRel(val), val)
    })
  })

  t.test(function test_clean() {
    t.test(function test_posix() {
      function test(src, exp) {t.is(p.posix.clean(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`./`, ``)

      same(`/`)
      test(`//`, `/`)
      test(`///`, `//`)

      same(`.one`)
      same(`..one`)
      test(`./one`, `one`)
      test(`./one/`, `one`)
      test(`./one/two`, `one/two`)
      test(`./one/two/`, `one/two`)

      test(`one/`, `one`)
      test(`one//`, `one/`)
      same(`/one`)
      test(`/one/`, `/one`)
      same(`//one`)
      test(`//one/`, `//one`)
      same(`one/two`)
      same(`one//two`)
      same(`one///two`)
      test(`one/two/`, `one/two`)
      same(`/one/two`)
      test(`/one/two/`, `/one/two`)

      same(`\\`)
      same(`\\\\`)
      same(`.\\`)
      same(`C:`)
      same(`C:\\`)
    })

    t.test(function test_windows() {
      function test(src, exp) {t.is(p.windows.clean(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      same(`./`)
      test(`.`, ``)
      test(`.\\`, ``)

      same(`/`)
      same(`//`)
      same(`///`)
      same(`\\`)
      test(`\\\\`, `\\`)

      same(`.one`)
      same(`..one`)
      same(`./one`)
      same(`./one/`)
      same(`./one/two`)
      same(`./one/two/`)

      test(`.\\one`, `one`)
      test(`.\\one\\`, `one`)
      test(`.\\one\\two`, `one\\two`)
      test(`.\\one\\two\\`, `one\\two`)

      test(`one\\`, `one`)
      test(`one\\\\`, `one\\`)
      same(`\\one`)
      test(`\\one\\`, `\\one`)
      same(`\\\\one`)
      test(`\\\\one\\`, `\\\\one`)
      same(`one\\two`)
      same(`one\\\\two`)
      same(`one\\\\\\two`)
      test(`one\\two\\`, `one\\two`)
      same(`\\one\\two`)
      test(`\\one\\two\\`, `\\one\\two`)

      same(`C:`)
      same(`C:\\`)
      same(`C:\\one`)
      test(`C:\\one\\`, `C:\\one`)
    })
  })

  // Missing feature: `..` flattening.
  t.test(function test_join() {
    t.test(function test_posix() {
      function fun(...val) {return p.posix.join(...val)}

      t.test(function test_invalid() {
        t.throws(() => fun(10), TypeError, `expected variant of isStr, got 10`)
        t.throws(() => fun(``, `/`), Error, `unable to append absolute path "/" to ""`)
        t.throws(() => fun(``, `/two`), Error, `unable to append absolute path "/two" to ""`)
        t.throws(() => fun(`.`, `/two`), Error, `unable to append absolute path "/two" to ""`)
        t.throws(() => fun(`./`, `/two`), Error, `unable to append absolute path "/two" to ""`)
        t.throws(() => fun(`one`, `/two`), Error, `unable to append absolute path "/two" to "one"`)
      })

      t.is(fun(), ``)
      t.is(fun(``), ``)
      t.is(fun(`.`), ``)
      t.is(fun(`./`), ``)
      t.is(fun(`/`), `/`)
      t.is(fun(`one`), `one`)
      t.is(fun(`/one`), `/one`)

      t.is(fun(``, `one`), `one`)
      t.is(fun(`.`, `one`), `one`)
      t.is(fun(`./`, `one`), `one`)

      t.is(fun(``, `one`, `two`), `one/two`)
      t.is(fun(`.`, `one`, `two`), `one/two`)
      t.is(fun(`./`, `one`, `two`), `one/two`)

      t.is(fun(``, `one/`, `two`), `one/two`)
      t.is(fun(`.`, `one/`, `two`), `one/two`)
      t.is(fun(`./`, `one/`, `two`), `one/two`)

      t.is(fun(`one`, ``), `one`)
      t.is(fun(`one`, `.`), `one`)
      t.is(fun(`one`, `./`), `one`)
      t.is(fun(`one`, ``, `two`), `one/two`)
      t.is(fun(`one`, `.`, `two`), `one/two`)
      t.is(fun(`one`, `./`, `two`), `one/two`)

      t.is(fun(`/one`, `.`), `/one`)
      t.is(fun(`/one`, `./`), `/one`)
      t.is(fun(`/one`, ``), `/one`)

      t.is(fun(`/one/`, `.`), `/one`)
      t.is(fun(`/one/`, `./`), `/one`)
      t.is(fun(`/one/`, ``), `/one`)

      t.is(fun(`/one`, `.`, `two`), `/one/two`)
      t.is(fun(`/one`, `./`, `two`), `/one/two`)
      t.is(fun(`/one`, ``, `two`), `/one/two`)

      t.is(fun(`/one/`, `.`, `two`), `/one/two`)
      t.is(fun(`/one/`, `./`, `two`), `/one/two`)
      t.is(fun(`/one/`, ``, `two`), `/one/two`)

      t.is(fun(`/one`, `two`), `/one/two`)
      t.is(fun(`/one`, `two/`), `/one/two`)
      t.is(fun(`/one/`, `two`), `/one/two`)
      t.is(fun(`/one/`, `two/`), `/one/two`)

      t.is(fun(`/one`, `two`, `three`), `/one/two/three`)
      t.is(fun(`/one`, `two/`, `three`), `/one/two/three`)
      t.is(fun(`/one/`, `two`, `three`), `/one/two/three`)
      t.is(fun(`/one/`, `two/`, `three`), `/one/two/three`)
    })

    t.test(function test_windows() {
      function fun(...val) {return p.windows.join(...val)}

      t.test(function test_invalid() {
        t.throws(() => fun(10), TypeError, `expected variant of isStr, got 10`)
        t.throws(() => fun(``, `\\`), Error, `unable to append absolute path "\\\\" to ""`)
        t.throws(() => fun(``, `\\two`), Error, `unable to append absolute path "\\\\two" to ""`)
        t.throws(() => fun(`.`, `\\two`), Error, `unable to append absolute path "\\\\two" to ""`)
        t.throws(() => fun(`.\\`, `\\two`), Error, `unable to append absolute path "\\\\two" to ""`)
        t.throws(() => fun(`one`, `\\two`), Error, `unable to append absolute path "\\\\two" to "one"`)
        t.throws(() => fun(`one`, `C:`), Error, `unable to append absolute path "C:" to "one"`)
        t.throws(() => fun(`one`, `C:\\`), Error, `unable to append absolute path "C:\\\\" to "one"`)
      })

      t.is(fun(), ``)
      t.is(fun(``), ``)
      t.is(fun(`.`), ``)
      t.is(fun(`.\\`), ``)
      t.is(fun(`\\`), `\\`)
      t.is(fun(`one`), `one`)
      t.is(fun(`\\one`), `\\one`)

      t.is(fun(``, `one`), `one`)
      t.is(fun(`.`, `one`), `one`)
      t.is(fun(`.\\`, `one`), `one`)

      t.is(fun(``, `one`, `two`), `one\\two`)
      t.is(fun(`.`, `one`, `two`), `one\\two`)
      t.is(fun(`.\\`, `one`, `two`), `one\\two`)

      t.is(fun(``, `one\\`, `two`), `one\\two`)
      t.is(fun(`.`, `one\\`, `two`), `one\\two`)
      t.is(fun(`.\\`, `one\\`, `two`), `one\\two`)

      t.is(fun(`one`, ``), `one`)
      t.is(fun(`one`, `.`), `one`)
      t.is(fun(`one`, `.\\`), `one`)
      t.is(fun(`one`, ``, `two`), `one\\two`)
      t.is(fun(`one`, `.`, `two`), `one\\two`)
      t.is(fun(`one`, `.\\`, `two`), `one\\two`)

      t.is(fun(`\\one`, `.`), `\\one`)
      t.is(fun(`\\one`, `.\\`), `\\one`)
      t.is(fun(`\\one`, ``), `\\one`)

      t.is(fun(`\\one\\`, `.`), `\\one`)
      t.is(fun(`\\one\\`, `.\\`), `\\one`)
      t.is(fun(`\\one\\`, ``), `\\one`)

      t.is(fun(`\\one`, `.`, `two`), `\\one\\two`)
      t.is(fun(`\\one`, `.\\`, `two`), `\\one\\two`)
      t.is(fun(`\\one`, ``, `two`), `\\one\\two`)

      t.is(fun(`\\one\\`, `.`, `two`), `\\one\\two`)
      t.is(fun(`\\one\\`, `.\\`, `two`), `\\one\\two`)
      t.is(fun(`\\one\\`, ``, `two`), `\\one\\two`)

      t.is(fun(`\\one`, `two`), `\\one\\two`)
      t.is(fun(`\\one`, `two\\`), `\\one\\two`)
      t.is(fun(`\\one\\`, `two`), `\\one\\two`)
      t.is(fun(`\\one\\`, `two\\`), `\\one\\two`)

      t.is(fun(`\\one`, `two`, `three`), `\\one\\two\\three`)
      t.is(fun(`\\one`, `two\\`, `three`), `\\one\\two\\three`)
      t.is(fun(`\\one\\`, `two`, `three`), `\\one\\two\\three`)
      t.is(fun(`\\one\\`, `two\\`, `three`), `\\one\\two\\three`)

      t.is(fun(`C:`), `C:`)

      t.is(fun(`C:`, `one`), `C:\\one`)
      t.is(fun(`C:\\`, `one`), `C:\\one`)

      t.is(fun(`C:`, `one`, `two`), `C:\\one\\two`)
      t.is(fun(`C:`, `one\\`, `two`), `C:\\one\\two`)
    })
  })

  t.test(function test_isSubOf() {
    t.test(function test_posix() {
      function fun(...val) {return p.posix.isSubOf(...val)}

      t.no(fun(`/`, ``))
      t.no(fun(`/`, `.`))
      t.no(fun(`/`, `./`))
      t.no(fun(`/`, `one`))
      t.no(fun(`/`, `/one`))

      t.ok(fun(`/`, `/`))

      t.no(fun(`/one`, ``))
      t.no(fun(`/one`, `.`))
      t.no(fun(`/one`, `./`))
      t.no(fun(`/one`, `one`))
      t.no(fun(`/one`, `/one/two`))

      t.ok(fun(`/one`, `/`))
      t.ok(fun(`/one`, `/one`))
      t.ok(fun(`/one/two`, `/one`))

      t.no(fun(``, `one`))
      t.no(fun(`.`, `one`))
      t.no(fun(`./`, `one`))

      t.no(fun(``, `/one`))
      t.no(fun(`.`, `/one`))
      t.no(fun(`./`, `/one`))

      t.no(fun(`one`, `/one`))
      t.no(fun(`one/two`, `/one`))
      t.no(fun(`one`, `/one/two`))
      t.no(fun(`one/two`, `/one/two`))

      t.ok(fun(``, ``))
      t.ok(fun(`.`, ``))
      t.ok(fun(``, `.`))
      t.ok(fun(`./`, ``))
      t.ok(fun(``, `./`))

      t.ok(fun(`one`, ``))
      t.ok(fun(`one`, `.`))
      t.ok(fun(`one`, `./`))

      t.ok(fun(`one`, `one`))
      t.ok(fun(`one`, `one/`))
      t.ok(fun(`one/`, `one/`))
      t.ok(fun(`one/`, `one`))

      t.no(fun(`one`, `one/two`))
      t.ok(fun(`one/two`, `one`))
      t.ok(fun(`one/two`, `one/two`))
      t.ok(fun(`one/two/three`, `one`))
      t.ok(fun(`one/two/three`, `one/two`))
      t.ok(fun(`one/two/three`, `one/two/three`))
      t.ok(fun(`one/two/three/`, `one`))
      t.ok(fun(`one/two/three/`, `one/two`))
      t.ok(fun(`one/two/three/`, `one/two/three`))
      t.ok(fun(`one/two/three/`, `one/`))
      t.ok(fun(`one/two/three/`, `one/two/`))
      t.ok(fun(`one/two/three/`, `one/two/three/`))
    })

    t.test(function test_windows() {
      function fun(...val) {return p.windows.isSubOf(...val)}

      t.no(fun(`\\`, ``))
      t.no(fun(`\\`, `.`))
      t.no(fun(`\\`, `.\\`))
      t.no(fun(`\\`, `one`))
      t.no(fun(`\\`, `\\one`))

      t.ok(fun(`\\`, `\\`))

      t.no(fun(`\\one`, ``))
      t.no(fun(`\\one`, `.`))
      t.no(fun(`\\one`, `.\\`))
      t.no(fun(`\\one`, `one`))
      t.no(fun(`\\one`, `\\one\\two`))

      t.ok(fun(`\\one`, `\\`))
      t.ok(fun(`\\one`, `\\one`))
      t.ok(fun(`\\one\\two`, `\\one`))

      t.no(fun(``, `one`))
      t.no(fun(`.`, `one`))
      t.no(fun(`.\\`, `one`))

      t.no(fun(``, `\\one`))
      t.no(fun(`.`, `\\one`))
      t.no(fun(`.\\`, `\\one`))

      t.no(fun(`one`, `\\one`))
      t.no(fun(`one\\two`, `\\one`))
      t.no(fun(`one`, `\\one\\two`))
      t.no(fun(`one\\two`, `\\one\\two`))

      t.ok(fun(``, ``))
      t.ok(fun(`.`, ``))
      t.ok(fun(``, `.`))
      t.ok(fun(`.\\`, ``))
      t.ok(fun(``, `.\\`))

      t.ok(fun(`one`, ``))
      t.ok(fun(`one`, `.`))
      t.ok(fun(`one`, `.\\`))

      t.ok(fun(`one`, `one`))
      t.ok(fun(`one`, `one\\`))
      t.ok(fun(`one\\`, `one\\`))
      t.ok(fun(`one\\`, `one`))

      t.no(fun(`one`, `one\\two`))
      t.ok(fun(`one\\two`, `one`))
      t.ok(fun(`one\\two`, `one\\two`))
      t.ok(fun(`one\\two\\three`, `one`))
      t.ok(fun(`one\\two\\three`, `one\\two`))
      t.ok(fun(`one\\two\\three`, `one\\two\\three`))
      t.ok(fun(`one\\two\\three\\`, `one`))
      t.ok(fun(`one\\two\\three\\`, `one\\two`))
      t.ok(fun(`one\\two\\three\\`, `one\\two\\three`))
      t.ok(fun(`one\\two\\three\\`, `one\\`))
      t.ok(fun(`one\\two\\three\\`, `one\\two\\`))
      t.ok(fun(`one\\two\\three\\`, `one\\two\\three\\`))
    })
  })

  t.test(function test_strictRelTo() {
    t.test(function test_posix() {
      function fun(...val) {return p.posix.strictRelTo(...val)}
      function same(one, two) {t.is(fun(one, two), ``)}

      t.throws(() => fun(), Error, `unable to convert undefined to string`)
      t.throws(() => fun(`str`), Error, `unable to convert undefined to string`)
      t.throws(() => fun(`/one`, `/two`), Error, `unable to make "/one" strictly relative to "/two"`)
      t.throws(() => fun(`/one`, `/one/two`), Error, `unable to make "/one" strictly relative to "/one/two"`)

      same(``, ``)
      same(`.`, ``)
      same(``, `.`)
      same(`./`, `./`)
      same(`/`, `/`)

      t.is(fun(`one`, `./`), `one`)
      t.is(fun(`one/`, `./`), `one`)

      t.is(fun(`one/two`, `./`), `one/two`)
      t.is(fun(`one/two/`, `./`), `one/two`)

      same(`one`, `one`)
      same(`one`, `one/`)
      same(`one/`, `one`)
      same(`one/`, `one/`)

      same(`/one`, `/one`)
      same(`/one`, `/one/`)
      same(`/one/`, `/one`)
      same(`/one/`, `/one/`)

      same(`one/two`, `one/two`)
      same(`one/two`, `one/two/`)
      same(`one/two/`, `one/two`)
      same(`one/two/`, `one/two/`)

      same(`/one/two`, `/one/two`)
      same(`/one/two`, `/one/two/`)
      same(`/one/two/`, `/one/two`)
      same(`/one/two/`, `/one/two/`)

      t.is(fun(`one/two`, `one`), `two`)
      t.is(fun(`one/two`, `one/`), `two`)
      t.is(fun(`one/two/`, `one`), `two`)
      t.is(fun(`one/two/`, `one/`), `two`)

      t.is(fun(`/one/two`, `/one`), `two`)
      t.is(fun(`/one/two`, `/one/`), `two`)
      t.is(fun(`/one/two/`, `/one`), `two`)
      t.is(fun(`/one/two/`, `/one/`), `two`)

      t.is(fun(`one/two/three`, `one`), `two/three`)
      t.is(fun(`one/two/three`, `one/`), `two/three`)
      t.is(fun(`one/two/three/`, `one`), `two/three`)
      t.is(fun(`one/two/three/`, `one/`), `two/three`)

      t.is(fun(`/one/two/three`, `/one`), `two/three`)
      t.is(fun(`/one/two/three`, `/one/`), `two/three`)
      t.is(fun(`/one/two/three/`, `/one`), `two/three`)
      t.is(fun(`/one/two/three/`, `/one/`), `two/three`)
    })

    t.test(function test_windows() {
      function fun(...val) {return p.windows.strictRelTo(...val)}
      function same(one, two) {t.is(fun(one, two), ``)}

      t.throws(() => fun(), Error, `unable to convert undefined to string`)
      t.throws(() => fun(`str`), Error, `unable to convert undefined to string`)
      t.throws(() => fun(`\\one`, `\\two`), Error, `unable to make "\\\\one" strictly relative to "\\\\two"`)
      t.throws(() => fun(`\\one`, `\\one\\two`), Error, `unable to make "\\\\one" strictly relative to "\\\\one\\\\two"`)

      same(``, ``)
      same(`.`, ``)
      same(``, `.`)
      same(`.\\`, `.\\`)
      same(`\\`, `\\`)

      t.is(fun(`one`, `.\\`), `one`)
      t.is(fun(`one\\`, `.\\`), `one`)

      t.is(fun(`one\\two`, `.\\`), `one\\two`)
      t.is(fun(`one\\two\\`, `.\\`), `one\\two`)

      same(`one`, `one`)
      same(`one`, `one\\`)
      same(`one\\`, `one`)
      same(`one\\`, `one\\`)

      same(`\\one`, `\\one`)
      same(`\\one`, `\\one\\`)
      same(`\\one\\`, `\\one`)
      same(`\\one\\`, `\\one\\`)

      same(`one\\two`, `one\\two`)
      same(`one\\two`, `one\\two\\`)
      same(`one\\two\\`, `one\\two`)
      same(`one\\two\\`, `one\\two\\`)

      same(`\\one\\two`, `\\one\\two`)
      same(`\\one\\two`, `\\one\\two\\`)
      same(`\\one\\two\\`, `\\one\\two`)
      same(`\\one\\two\\`, `\\one\\two\\`)

      t.is(fun(`one\\two`, `one`), `two`)
      t.is(fun(`one\\two`, `one\\`), `two`)
      t.is(fun(`one\\two\\`, `one`), `two`)
      t.is(fun(`one\\two\\`, `one\\`), `two`)

      t.is(fun(`\\one\\two`, `\\one`), `two`)
      t.is(fun(`\\one\\two`, `\\one\\`), `two`)
      t.is(fun(`\\one\\two\\`, `\\one`), `two`)
      t.is(fun(`\\one\\two\\`, `\\one\\`), `two`)

      t.is(fun(`one\\two\\three`, `one`), `two\\three`)
      t.is(fun(`one\\two\\three`, `one\\`), `two\\three`)
      t.is(fun(`one\\two\\three\\`, `one`), `two\\three`)
      t.is(fun(`one\\two\\three\\`, `one\\`), `two\\three`)

      t.is(fun(`\\one\\two\\three`, `\\one`), `two\\three`)
      t.is(fun(`\\one\\two\\three`, `\\one\\`), `two\\three`)
      t.is(fun(`\\one\\two\\three\\`, `\\one`), `two\\three`)
      t.is(fun(`\\one\\two\\three\\`, `\\one\\`), `two\\three`)

      same(`C:`, `C:`)
      same(`C:\\`, `C:\\`)

      t.is(fun(`C:\\one`, `C:\\`), `one`)
      t.is(fun(`C:\\one\\`, `C:\\`), `one`)
      t.is(fun(`C:\\one\\two`, `C:\\`), `one\\two`)
      t.is(fun(`C:\\one\\two\\`, `C:\\`), `one\\two`)
      t.is(fun(`C:\\one\\two`, `C:\\one`), `two`)
      t.is(fun(`C:\\one\\two\\`, `C:\\one`), `two`)
      t.is(fun(`C:\\one\\two\\`, `C:\\one\\`), `two`)
    })
  })

  t.test(function test_relTo() {
    // TODO add test for `p.windows`.
    // TODO test absolute paths.
    //   * Both absolute.
    //   * Sub absolute.
    //   * Suf absolute.
    t.test(function test_posix() {
      function fun(...val) {return p.posix.relTo(...val)}

      t.throws(() => fun(), Error, `unable to convert undefined to string`)
      t.throws(() => fun(`str`), Error, `unable to convert undefined to string`)

      t.is(fun(``,              ``),              ``)
      t.is(fun(`one`,           ``),              `one`)
      t.is(fun(`one/two`,       ``),              `one/two`)
      t.is(fun(``,              `one`),           `..`)
      t.is(fun(``,              `one/two`),       `../..`)
      t.is(fun(`one`,           `two`),           `../one`)
      t.is(fun(`one/two`,       `three`),         `../one/two`)
      t.is(fun(`one`,           `two/three`),     `../../one`)
      t.is(fun(`one/two`,       `one/three`),     `../two`)
      t.is(fun(`one/two/three`, `one/two/four`),  `../three`)
      t.is(fun(`one/two/three`, `one/four/five`), `../../two/three`)
    })
  })

  t.test(function test_dirLike() {
    t.test(function test_posix() {
      function fun(val) {return p.posix.dirLike(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`./`, ``)

      same(`/`)
      same(`one/`)
      same(`one/two/`)

      test(`/one`, `/one/`)
      test(`one`, `one/`)
      test(`one/two`, `one/two/`)
      test(`/one/two`, `/one/two/`)
    })

    t.test(function test_windows() {
      function fun(val) {return p.windows.dirLike(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`.\\`, ``)

      same(`\\`)
      same(`one\\`)
      same(`one\\two\\`)

      test(`\\one`, `\\one\\`)
      test(`one`, `one\\`)
      test(`one\\two`, `one\\two\\`)
      test(`\\one\\two`, `\\one\\two\\`)

      same(`C:\\`, `C:\\`)
      test(`C:`, `C:\\`)
    })
  })

  t.test(function test_dir() {
    t.test(function test_posix() {
      function fun(val) {return p.posix.dir(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`./`, ``)

      same(`/`)
      test(`//`, `/`)
      test(`///`, `//`)
      test(`/one`, `/`)
      test(`/one/`, `/one`)
      test(`/one/two`, `/one`)
      test(`/one/two/`, `/one/two`)

      test(`one`, ``)
      test(`one/`, `one`)
      test(`./one`, ``)
      test(`./one/`, `one`)
      test(`one/two`, `one`)
      test(`./one/two`, `one`)
      test(`one/two/`, `one/two`)
      test(`./one/two/`, `one/two`)
    })

    t.test(function test_windows() {
      function fun(val) {return p.windows.dir(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`.\\`, ``)

      same(`\\`)
      test(`\\\\`, `\\`)
      test(`\\\\\\`, `\\\\`)
      test(`\\one`, `\\`)
      test(`\\one\\`, `\\one`)
      test(`\\one\\two`, `\\one`)
      test(`\\one\\two\\`, `\\one\\two`)

      test(`one`, ``)
      test(`one\\`, `one`)
      test(`.\\one`, ``)
      test(`.\\one\\`, `one`)
      test(`one\\two`, `one`)
      test(`.\\one\\two`, `one`)
      test(`one\\two\\`, `one\\two`)
      test(`.\\one\\two\\`, `one\\two`)

      same(`C:`)
      same(`C:\\`)
      test(`C:\\one`, `C:\\`)
    })
  })

  t.test(function test_base() {
    t.test(function test_posix() {
      function fun(val) {return p.posix.base(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`./`, ``)

      test(`/`, `/`)

      test(`/one`, `one`)
      test(`/one/`, `one`)

      test(`/one/two`, `two`)
      test(`/one/two/`, `two`)

      test(`/one/two/three`, `three`)
      test(`/one/two/three/`, `three`)

      test(`/one.two`, `one.two`)
      test(`/one.two/`, `one.two`)

      test(`/one.two.three`, `one.two.three`)
      test(`/one.two.three/`, `one.two.three`)

      test(`/one/two.three`, `two.three`)
      test(`/one/two.three/`, `two.three`)

      test(`/one/two/three.four`, `three.four`)
      test(`/one/two/three.four/`, `three.four`)
    })

    t.test(function test_windows() {
      function fun(val) {return p.windows.base(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`.\\`, ``)

      test(`\\`, `\\`)

      test(`\\one`, `one`)
      test(`\\one\\`, `one`)

      test(`\\one\\two`, `two`)
      test(`\\one\\two\\`, `two`)

      test(`\\one\\two\\three`, `three`)
      test(`\\one\\two\\three\\`, `three`)

      test(`\\one.two`, `one.two`)
      test(`\\one.two\\`, `one.two`)

      test(`\\one.two.three`, `one.two.three`)
      test(`\\one.two.three\\`, `one.two.three`)

      test(`\\one\\two.three`, `two.three`)
      test(`\\one\\two.three\\`, `two.three`)

      test(`\\one\\two\\three.four`, `three.four`)
      test(`\\one\\two\\three.four\\`, `three.four`)

      test(`C:`, `C:`)
      test(`C:\\`, `C:\\`)
      test(`C:\\one`, `one`)
      test(`C:\\one\\`, `one`)
      test(`C:\\one\\two`, `two`)
      test(`C:\\one\\two\\`, `two`)
    })
  })

  t.test(function test_ext() {
    t.test(function test_posix() {
      function fun(val) {return p.posix.ext(val)}
      function test(src, exp) {t.is(fun(src), exp)}
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

      test(`..one`, `.one`)
      test(`/..one`, `.one`)
      test(`one/..two`, `.two`)
      test(`/one/..two`, `.two`)

      test(`one.two`, `.two`)
      test(`/one.two`, `.two`)
      test(`.one.two`, `.two`)
      test(`/.one.two`, `.two`)

      test(`one..two`, `.two`)
      test(`/one..two`, `.two`)

      test(`one/two.three`, `.three`)
      test(`/one/two.three`, `.three`)

      test(`one/two..three`, `.three`)
      test(`/one/two..three`, `.three`)

      test(`one.two.three`, `.three`)
      test(`/one.two.three`, `.three`)

      test(`one/two.three.four`, `.four`)
      test(`/one/two.three.four`, `.four`)

      test(`one/two..three.four`, `.four`)
      test(`/one/two..three.four`, `.four`)

      test(`one/two..three..four`, `.four`)
      test(`/one/two..three..four`, `.four`)
    })

    t.test(function test_windows() {
      function fun(val) {return p.windows.ext(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function none(val) {test(val, ``)}

      none(``)
      none(`.`)
      none(`.\\`)
      none(`\\`)
      none(`one`)
      none(`\\one`)
      none(`one\\two`)
      none(`\\one\\two`)
      none(`.one`)
      none(`\\.one`)
      none(`one\\.two`)
      none(`\\one\\.two`)

      test(`..one`, `.one`)
      test(`\\..one`, `.one`)
      test(`one\\..two`, `.two`)
      test(`\\one\\..two`, `.two`)

      test(`one.two`, `.two`)
      test(`\\one.two`, `.two`)
      test(`.one.two`, `.two`)
      test(`\\.one.two`, `.two`)

      test(`one..two`, `.two`)
      test(`\\one..two`, `.two`)

      test(`one\\two.three`, `.three`)
      test(`\\one\\two.three`, `.three`)

      test(`one\\two..three`, `.three`)
      test(`\\one\\two..three`, `.three`)

      test(`one.two.three`, `.three`)
      test(`\\one.two.three`, `.three`)

      test(`one\\two.three.four`, `.four`)
      test(`\\one\\two.three.four`, `.four`)

      test(`one\\two..three.four`, `.four`)
      test(`\\one\\two..three.four`, `.four`)

      test(`one\\two..three..four`, `.four`)
      test(`\\one\\two..three..four`, `.four`)

      none(`C:`)
      none(`C:\\`)
      none(`C:\\one`)

      test(`C:\\one.two`, `.two`)
    })
  })

  t.test(function test_name() {
    t.test(function test_posix() {
      function fun(val) {return p.posix.name(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`./`, ``)

      test(`/`, `/`)

      test(`/one`, `one`)
      test(`/one/`, `one`)

      test(`/one/two`, `two`)
      test(`/one/two/`, `two`)

      test(`/one/two/three`, `three`)
      test(`/one/two/three/`, `three`)

      test(`/one.two`, `one`)
      test(`/one.two/`, `one`)

      test(`/one.two.three`, `one.two`)
      test(`/one.two.three/`, `one.two`)

      test(`/one/two.three`, `two`)
      test(`/one/two.three/`, `two`)

      test(`/one/two/three.four`, `three`)
      test(`/one/two/three.four/`, `three`)
    })

    t.test(function test_windows() {
      function fun(val) {return p.windows.name(val)}
      function test(src, exp) {t.is(fun(src), exp)}
      function same(val) {test(val, val)}

      same(``)
      test(`.`, ``)
      test(`.\\`, ``)

      test(`\\`, `\\`)

      test(`\\one`, `one`)
      test(`\\one\\`, `one`)

      test(`\\one\\two`, `two`)
      test(`\\one\\two\\`, `two`)

      test(`\\one\\two\\three`, `three`)
      test(`\\one\\two\\three\\`, `three`)

      test(`\\one.two`, `one`)
      test(`\\one.two\\`, `one`)

      test(`\\one.two.three`, `one.two`)
      test(`\\one.two.three\\`, `one.two`)

      test(`\\one\\two.three`, `two`)
      test(`\\one\\two.three\\`, `two`)

      test(`\\one\\two\\three.four`, `three`)
      test(`\\one\\two\\three.four\\`, `three`)

      test(`C:`, `C:`)
      test(`C:\\`, `C:\\`)
      test(`C:\\one`, `one`)
      test(`C:\\one.three`, `one`)
      test(`C:\\one\\`, `one`)
      test(`C:\\one.three\\`, `one`)
      test(`C:\\one\\two`, `two`)
      test(`C:\\one\\two.three`, `two`)
      test(`C:\\one\\two\\`, `two`)
      test(`C:\\one\\two.three\\`, `two`)
    })
  })
})

if (import.meta.main) console.log(`[test] ok!`)
