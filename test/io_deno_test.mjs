import * as iti from './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as io from '../io_deno.mjs'

function stream(src) {return new Response(src).body}

// Incomplete. TODO test stream deinit.
await t.test(async function test_ConcatStreamSource() {
  async function test(src, exp) {
    await iti.testStream(io.ConcatStreamSource.stream(...src), exp)
  }

  test([], ``)
  test([``], ``)
  test([``, undefined], ``)
  test([`one`], `one`)
  test([`one`, `two`], `onetwo`)
  test([`one`, `two`, `three`], `onetwothree`)
  test([`one`, undefined, ``, `two`], `onetwo`)
  test([stream(`one`)], `one`)
  test([stream(`one`), stream(`two`)], `onetwo`)
  test([stream(`one`), `two`], `onetwo`)
  test([`one`, stream(`two`)], `onetwo`)
  test([stream(`one`), `two`, stream(`three`)], `onetwothree`)
  test([io.ConcatStreamSource.stream(`one`)], `one`)
  test([io.ConcatStreamSource.stream(io.ConcatStreamSource.stream(`one`))], `one`)

  test([
    io.ConcatStreamSource.stream(`one`),
    io.ConcatStreamSource.stream(
      io.ConcatStreamSource.stream(`two`),
      io.ConcatStreamSource.stream(`three`),
    ),
    new TextEncoder().encode(`four`),
  ], `onetwothreefour`)
})

if (import.meta.main) console.log(`[test] ok!`)
