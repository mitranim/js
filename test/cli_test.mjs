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

  test([],                         i.mapOf(),                         [])
  test([`-a`],                     i.mapOf(`a`, [``]),                [])
  test([`-one`],                   i.mapOf(`one`, [``]),              [])
  test([`--a`],                    i.mapOf(`a`, [``]),                [])
  test([`--one`],                  i.mapOf(`one`, [``]),              [])
  test([`-one`, `two`],            i.mapOf(`one`, [`two`]),           [])
  test([`-one=two`],               i.mapOf(`one`, [`two`]),           [])
  test([`--one`, `two`],           i.mapOf(`one`, [`two`]),           [])
  test([`--one=two`],              i.mapOf(`one`, [`two`]),           [])
  test([`-=`],                     i.mapOf(``, [``]),                 [])
  test([`--=`],                    i.mapOf(``, [``]),                 [])
  test([`-=two`],                  i.mapOf(``, [`two`]),              [])
  test([`--=two`],                 i.mapOf(``, [`two`]),              [])
  test([`-one`, `two`, `three`],   i.mapOf(`one`, [`two`]),           [`three`])
  test([`-one=two`, `three`],      i.mapOf(`one`, [`two`]),           [`three`])
  test([`three`, `-one=two`],      i.mapOf(`one`, [`two`]),           [`three`])
  test([`three`, `-one`, `two`],   i.mapOf(`one`, [`two`]),           [`three`])
  test([`two`, `-one`],            i.mapOf(`one`, [``]),              [`two`])
  test([`three`, `-one`, `--two`], i.mapOf(`one`, [``], `two`, [``]), [`three`])

  test(
    [`-one`, `two`, `--three=four`, `-f`, `-s`, `seven`, `-e`, `nine`, `eleven`, `-e`, `ten`, `twelve`],
    i.mapOf(`one`, [`two`], `three`, [`four`], `f`, [``], `s`, [`seven`], `e`, [`nine`, `ten`]),
    [`eleven`, `twelve`],
  )
})

if (import.meta.main) console.log(`[test] ok!`)
