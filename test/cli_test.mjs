import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as i from '../iter.mjs'
import * as cl from '../cli.mjs'

// TODO test various methods.
t.test(function test_Flag() {
  function test(src, expFlags, expArgs) {
    const cli = new cl.Flag(src)
    t.eq(new Map(cli), expFlags)
    t.eq(cli.args, expArgs)
  }

  test([],                         i.mapFrom(),                         [])
  test([`-a`],                     i.mapFrom(`a`, [``]),                [])
  test([`-one`],                   i.mapFrom(`one`, [``]),              [])
  test([`--a`],                    i.mapFrom(`a`, [``]),                [])
  test([`--one`],                  i.mapFrom(`one`, [``]),              [])
  test([`-one`, `two`],            i.mapFrom(`one`, [`two`]),           [])
  test([`-one=two`],               i.mapFrom(`one`, [`two`]),           [])
  test([`--one`, `two`],           i.mapFrom(`one`, [`two`]),           [])
  test([`--one=two`],              i.mapFrom(`one`, [`two`]),           [])
  test([`-=`],                     i.mapFrom(``, [``]),                 [])
  test([`--=`],                    i.mapFrom(``, [``]),                 [])
  test([`-=two`],                  i.mapFrom(``, [`two`]),              [])
  test([`--=two`],                 i.mapFrom(``, [`two`]),              [])
  test([`-one`, `two`, `three`],   i.mapFrom(`one`, [`two`]),           [`three`])
  test([`-one=two`, `three`],      i.mapFrom(`one`, [`two`]),           [`three`])
  test([`three`, `-one=two`],      i.mapFrom(`one`, [`two`]),           [`three`])
  test([`three`, `-one`, `two`],   i.mapFrom(`one`, [`two`]),           [`three`])
  test([`two`, `-one`],            i.mapFrom(`one`, [``]),              [`two`])
  test([`three`, `-one`, `--two`], i.mapFrom(`one`, [``], `two`, [``]), [`three`])

  test(
    [`-one`, `two`, `--three=four`, `-f`, `-s`, `seven`, `-e`, `nine`, `eleven`, `-e`, `ten`, `twelve`],
    i.mapFrom(`one`, [`two`], `three`, [`four`], `f`, [``], `s`, [`seven`], `e`, [`nine`, `ten`]),
    [`eleven`, `twelve`],
  )
})

if (import.meta.main) console.log(`[test] ok!`)
