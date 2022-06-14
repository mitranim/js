import './internal_test_init.mjs'
import * as iti from './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as h from '../http.mjs'
import * as hs from '../http_srv.mjs'

await t.test(async function test_WritableReadableStream() {
  await t.test(async function test_without_signal() {
    const src = new hs.WritableReadableStream()

    src.write(`hello world!`)
    src.close()

    await iti.testStream(src, `hello world!`)
  })

  await t.test(async function test_idempotent_deinit() {
    const src = new hs.WritableReadableStream()

    src.deinit()
    src.deinit()
    src.deinit()

    await iti.testStream(src, ``)
  })

  await t.test(async function test_error() {
    const src = new hs.WritableReadableStream()
    src.error(TypeError(`custom error text`))

    await t.throws(async () => src.getReader().read(), TypeError, `custom error text`)

    // Deno and Chrome generate very different messages, this is the delta.
    await t.throws(async () => src.write(``), TypeError, `enqueue`)

    src.deinit()
  })

  await t.test(async function test_without_signal() {
    await t.test(async function test_pre_abort() {
      const abc = new AbortController()
      abc.abort()
      testAborted(() => new hs.WritableReadableStream(abc.signal))
    })

    await t.test(async function test_post_abort() {
      const abc = new AbortController()
      const src = new hs.WritableReadableStream(abc.signal)

      src.write(`hello world!`)
      abc.abort()

      await testAborted(async () => iti.readFull(src))
    })
  })
})

function testAborted(fun) {
  return t.throws(fun, h.AbortError, `signal has been aborted`)
}

if (import.meta.main) console.log(`[test] ok!`)
