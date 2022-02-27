import * as t from '../test.mjs'
import * as hs from '../http_srv.mjs'

await t.test(async function test_WritableReadableStream() {
  await t.test(async function test_without_signal() {
    const src = new hs.WritableReadableStream()

    src.write(`hello world!`)
    src.close()

    t.is(await readFull(src), `hello world!`)
  })

  await t.test(async function test_idempotent_deinit() {
    const src = new hs.WritableReadableStream()

    src.deinit()
    src.deinit()
    src.deinit()

    t.is(await readFull(src), ``)
  })

  await t.test(async function test_error() {
    const src = new hs.WritableReadableStream()
    src.error(TypeError(`something illegal`))

    await t.throws(async () => src.getReader().read(), TypeError, `something illegal`)
    await t.throws(async () => src.write(``), TypeError, `cannot close or enqueue`)

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

      await testAborted(async () => readFull(src))
    })
  })
})

function testAborted(fun) {
  return t.throws(fun, DOMException, `signal has been aborted`)
}

/*
Not part of public API because it violates the purpose of streams
and should not be encouraged.
*/
async function readFull(src) {
  let out = ``
  for await (const val of src) out += val
  return out
}

if (import.meta.main) console.log(`[test] ok!`)
