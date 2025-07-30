/* global TextEncoderStream */

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as hs from '../http_srv.mjs'

t.test(function test_guessContentType() {
  t.throws(() => hs.guessContentType({}), TypeError, `unable to convert {} to string`)
  t.throws(() => hs.guessContentType([]), TypeError, `unable to convert [] to string`)

  function test(src, exp) {
    t.is(hs.guessContentType(src), exp)
  }

  test(``, undefined)

  test(`css`, undefined)
  test(`.css`, undefined)
  test(`one.css`, `text/css`)
  test(`one two.css`, `text/css`)
  test(`one/two.css`, `text/css`)
  test(`one/two three.css`, `text/css`)
  test(`one two/three.css`, `text/css`)

  test(`html`, undefined)
  test(`.html`, undefined)
  test(`one.html`, `text/html`)
  test(`one two.html`, `text/html`)
  test(`one/two.html`, `text/html`)
  test(`one/two three.html`, `text/html`)
  test(`one two/three.html`, `text/html`)

  test(`wtf`, undefined)
  test(`.wtf`, undefined)
  test(`one.wtf`, undefined)
})

await t.test(async function test_WritableReadableStream() {
  await t.test(async function test_basic() {
    const src = new hs.WritableReadableStream()

    src.write(`hello `)
    src.write(`world!`)
    src.close()

    await testStream(src.pipeThrough(new TextEncoderStream()), `hello world!`)
  })

  await t.test(async function test_idempotent_deinit() {
    const src = new hs.WritableReadableStream()

    src.deinit()
    src.deinit()
    src.deinit()

    await testStream(src, ``)
  })

  await t.test(async function test_error() {
    const src = new hs.WritableReadableStream()
    src.error(TypeError(`custom error text`))

    await t.throws(async () => src.getReader().read(), TypeError, `custom error text`)

    {
      const msg = globalThis.Bun ? `already closed` : `enqueue`
      await t.throws(async () => src.write(``), TypeError, msg)
    }

    src.deinit()
  })
})

async function testStream(src, exp) {t.is(await readFull(src), exp)}

function readFull(src) {return new Response(src).text()}

// Incomplete. TODO test stream deinit.
await t.test(async function test_concatStreams() {
  async function test(src, exp) {
    await testStream(hs.concatStreams(...src), exp)
  }

  await test([], ``)
  await test([``], ``)
  await test([``, undefined], ``)
  await test([`one`], `one`)
  await test([`one`, `two`], `onetwo`)
  await test([`one`, `two`, `three`], `onetwothree`)
  await test([`one`, undefined, ``, `two`], `onetwo`)
  await test([stream(`one`)], `one`)
  await test([stream(`one`), stream(`two`)], `onetwo`)
  await test([stream(`one`), `two`], `onetwo`)
  await test([`one`, stream(`two`)], `onetwo`)
  await test([stream(`one`), `two`, stream(`three`)], `onetwothree`)
  await test([hs.concatStreams(`one`)], `one`)
  await test([hs.concatStreams(hs.concatStreams(`one`))], `one`)

  await test([
    hs.concatStreams(`one`),
    hs.concatStreams(
      hs.concatStreams(`two`),
      hs.concatStreams(`three`),
    ),
    new TextEncoder().encode(`four`),
  ], `onetwothreefour`)
})

t.test(function test_decodeAcceptEncoding() {
  function test(src, exp) {t.eq(hs.decodeAcceptEncoding(src), exp, src)}

  test(``, [])
  test(`zstd`, [`zstd`])
  test(`zstd;q=1.0`, [`zstd`])
  test(`zstd; q=1.0`, [`zstd`])
  test(`br`, [`br`])
  test(`br;q=1.0`, [`br`])
  test(`br; q=1.0`, [`br`])
  test(`gzip`, [`gzip`])
  test(`deflate`, [`deflate`])
  test(`zstd, br`, [`zstd`, `br`])
  test(`zstd, br, gzip`, [`zstd`, `br`, `gzip`])
  test(`zstd, br, gzip, deflate`, [`zstd`, `br`, `gzip`, `deflate`])
  test(`zstd;q=1.0, br;q=0.9, gzip;q=0.8, deflate;q=0.7`, [`zstd`, `br`, `gzip`, `deflate`])
})

function stream(src) {return new Response(src).body}

if (import.meta.main) console.log(`[test] ok!`)
