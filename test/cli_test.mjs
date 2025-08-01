import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as cl from '../cli.mjs'

// TODO test various methods.
t.test(function test_Flag() {
  function test(src, expFlags, expArgs) {
    const cli = new cl.Flag(src)
    t.eq(new Map(cli), expFlags)
    t.eq(cli.args, expArgs)
  }

  test([],                         new Map(),                                       [])
  test([`-a`],                     new Map().set(`-a`,    [``]),                    [])
  test([`-one`],                   new Map().set(`-one`,  [``]),                    [])
  test([`--a`],                    new Map().set(`--a`,   [``]),                    [])
  test([`--one`],                  new Map().set(`--one`, [``]),                    [])
  test([`-one`, `two`],            new Map().set(`-one`,  [`two`]),                 [])
  test([`-one=two`],               new Map().set(`-one`,  [`two`]),                 [])
  test([`--one`, `two`],           new Map().set(`--one`, [`two`]),                 [])
  test([`--one=two`],              new Map().set(`--one`, [`two`]),                 [])
  test([`-=`],                     new Map().set(`-`,     [``]),                    [])
  test([`--=`],                    new Map().set(`--`,    [``]),                    [])
  test([`-=two`],                  new Map().set(`-`,     [`two`]),                 [])
  test([`--=two`],                 new Map().set(`--`,    [`two`]),                 [])
  test([`-one`, `two`, `three`],   new Map().set(`-one`,  [`two`]),                 [`three`])
  test([`-one=two`, `three`],      new Map().set(`-one`,  [`two`]),                 [`three`])
  test([`three`, `-one=two`],      new Map().set(`-one`,  [`two`]),                 [`three`])
  test([`three`, `-one`, `two`],   new Map().set(`-one`,  [`two`]),                 [`three`])
  test([`two`, `-one`],            new Map().set(`-one`,  [``]),                    [`two`])
  test([`three`, `-one`, `--two`], new Map().set(`-one`,  [``]).set(`--two`, [``]), [`three`])

  test(
    [`-one`, `two`, `--three=four`, `-f`, `-s`, `seven`, `-e`, `nine`, `eleven`, `-e`, `ten`, `twelve`],
    new Map()
      .set(`-one`, [`two`])
      .set(`--three`, [`four`])
      .set(`-f`, [``])
      .set(`-s`, [`seven`])
      .set(`-e`, [`nine`, `ten`]),
    [`eleven`, `twelve`],
  )
})

t.test(function test_EnvMap() {
  t.test(function test_set() {
    const map = new cl.EnvMap()

    t.throws(() => map.set(10, `val`), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => map.set(`key`, undefined), TypeError, `unable to convert undefined to string`)
    t.throws(() => map.set(`key`, {}), TypeError, `unable to convert {} to string`)
    t.throws(() => map.set(`key`, []), TypeError, `unable to convert [] to string`)
  })

  t.test(function test_lines() {
    function test(src, exp) {
      t.eq(new cl.EnvMap().lines(src), exp)
    }

    test(``, [])

    test(`
# one
  # two
`, [])

    test(`one=two`, [`one=two`])
    test(`    one=two    `, [`one=two`])

    test(`
one=
# two
  three=
  #four
five=six
  # seven
`, [
      `one=`,
      `three=`,
      `five=six`,
    ])
  })

  t.test(function test_addLine() {
    t.test(function test_invalid() {
      const map = new cl.EnvMap()

      function test(val) {
        t.throws(() => map.addLine(val), SyntaxError, `expected valid env/properties line, got ${l.show(val)}`)
      }

      test(``)
      test(`# one`)
      test(`  # one`)
      test(`one`)
      test(`one =`)
      test(`one = two`)
      test(`=two`)
      test(`  =two`)
    })

    t.test(function test_valid() {
      function test(src, exp) {t.eq(new cl.EnvMap().addLine(src).toDict(), exp)}

      test(`one=`, {one: ``})
      test(`one= `, {one: ` `})
      test(`one=  `, {one: `  `})
      test(`one=two`, {one: `two`})
      test(`one=#two`, {one: `#two`})
      test(`one=# two`, {one: `# two`})
      test(`one=two#three`, {one: `two#three`})
      test(`one="two"`, {one: `"two"`})
    })
  })

  // Delegates to `Bmap` which supports mut from dicts or arbitrary iterables.
  // We only need to check string parsing here.
  t.test(function test_mut_from_str() {
    function test(src, exp) {t.eq(new cl.EnvMap().mut(src).toDict(), exp)}

    test(``, {})
    test(`     `, {})
    test(`# one`, {})
    test(`one=`, {one: ``})
    test(`one=two`, {one: `two`})

    test(`
# one
two=
# three
four=five
# six
    seven=#eight#nine
`, {
      two: ``,
      four: `five`,
      seven: `#eight#nine`,
    })

    t.eq(
      new cl.EnvMap()
        .mut(`one=two`)
        .mut(`three=four`)
        .toDict(),
      {one: `two`, three: `four`},
    )
  })
})

if (import.meta.main) console.log(`[test] ok!`)
