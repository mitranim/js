/*
Incomplete. Missing tests:

  * Various `HttpDir` features.
    * Path resolving.
    * Path filtering.
    * Finding files.
  * Content type detection.
  * Reliable file closing.
  * File resolution caching.
  * Compression.
  * Compression artifact caching.
*/

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as h from '#http'

t.test(function test_HttpDir() {
  function test(dir, src, exp) {
    let out
    out = dir.urlPathToFsPath(src)
    out = dir.allow(out) ? out : undefined
    t.is(out, exp, src)
  }

  t.test(function test_without_filtering() {
    const dir = new h.HttpDir({fsPath: `target`})
    test(dir, `/one%20two`, `target/one two`)
    test(dir, `/scripts/one%20two`, `target/scripts/one two`)
    test(dir, `../one%20two`, undefined)
    test(dir, `/../one%20two`, undefined)
    test(dir, `/scripts/../one%20two`, undefined)
  })

  t.test(function test_with_filtering() {
    const dir = new h.HttpDir({fsPath: `target`, filter: /^target[/]scripts[/]/})
    test(dir, `/one%20two`, undefined)
    test(dir, `/target/scripts/one%20two`, undefined)
    test(dir, `/scripts/one%20two`, `target/scripts/one two`)
    test(dir, `/scripts/../one`, undefined)
  })
})

await t.test(async function test_HttpCompressor() {
  const comp = new h.HttpCompressor()

  /*
  Also see `test_decodeAcceptEncoding`. The compressor method is different,
  because it returns an intersection of decoded and supported algos, in the
  compressor's preferred order.
  */
  t.test(function test_requestEncodings() {
    function test(src, exp) {
      const req = {headers: new Headers([[h.HEADER_NAME_ACCEPT_ENCODING, src]])}
      t.eq(comp.requestEncodings(req), exp, src)
    }

    const all = [`zstd`, `br`, `gzip`, `deflate`]

    test(`zstd, br, gzip, deflate`, all)
    test(`zstd;q=1.0, br;q=0.9, gzip;q=0.8, deflate;q=0.7`, all)
    test(`deflate, gzip, br, zstd`, all)
    test(`deflate;q=1.0, gzip;q=0.9, br;q=0.8, zstd;q=0.7`, all)
    test(`unknown, deflate, gzip, br, zstd`, all)
    test(`unknown;q=2.0, deflate;q=1.0, gzip;q=0.9, br;q=0.8, zstd;q=0.7`, all)

    test(`br, gzip, deflate`, [`br`, `gzip`, `deflate`])
    test(`deflate, gzip, br`, [`br`, `gzip`, `deflate`])

    test(`gzip, deflate`, [`gzip`, `deflate`])
    test(`deflate, gzip`, [`gzip`, `deflate`])
  })

  const enc = new TextEncoder()
  const dec = new TextDecoder()
  const srcText = `hello world`

  /*
  `TextEncoder` produces a `Uint8Array`. For `t.eq`, we need it to be a
  `Buffer`, which is also an instance of `Uint8Array`, otherwise equality
  checks will fail due to having different constructors.
  */
  const srcBytes = globalThis.Buffer.from(enc.encode(srcText))

  function testCompDecomp(src, out, algo) {
    t.inst(src, Uint8Array)
    t.inst(out, Uint8Array)
    t.eq(out, srcBytes, `algo: ${algo}`)
    t.is(dec.decode(out), srcText, `algo: ${algo}`)
  }

  await t.test(async function test_compress_decompress() {
    async function test(algo) {
      const compressed = await comp.compress({algo, body: srcText})
      const decompressed = await comp.decompress({algo, body: compressed})
      testCompDecomp(compressed, decompressed, algo)
    }

    if (!globalThis.Deno) await test(`zstd`)
    await test(`br`)
    await test(`gzip`)
    await test(`deflate`)
  })

  await t.test(async function test_response() {
    async function test(algo) {
      const status = 345
      const req = codedReq({algo, status})
      const res = await comp.response({req, body: srcText, resOpt: {status}})

      t.is(res.status, status)
      t.is(res.headers.get(h.HEADER_NAME_CONTENT_ENCODING), algo)

      const compressed = await res.bytes()
      const decompressed = await comp.decompress({algo, body: compressed})
      testCompDecomp(compressed, decompressed, algo)
    }

    if (!globalThis.Deno) await test(`zstd`)
    await test(`br`)
    await test(`gzip`)
    await test(`deflate`)
  })

  await t.test(async function test_response_unsupported() {
    const status = 345
    const req = codedReq({status})
    const res = await comp.response({req, body: srcText, resOpt: {status}})

    t.is(res.status, status)
    t.is(res.headers.get(h.HEADER_NAME_CONTENT_ENCODING), null)
    t.is((await res.text()), srcText)
  })
})

function codedReq({algo, status}) {
  return new Request(`https://example.com`, {
    headers: algo ? [[h.HEADER_NAME_ACCEPT_ENCODING, algo]] : undefined,
    status,
  })
}

/*
TODO:
- Use actual IO in testing.
- Verify that file body is not read from disk more than once.
*/
await t.test(async function test_HttpDirs_caching() {
  class MockHttpFile extends h.HttpFile {
    static resolve(opt) {
      if (opt?.fsPath !== `existing.txt`) return undefined
      return new this(opt)
    }

    async getText() {return this.text ??= srcText}
    async getBytes() {return this.bytes ??= srcBytes}
  }

  class MockHttpDir extends h.HttpDir {get HttpFile() {return MockHttpFile}}

  function testHttpFile(file) {
    t.inst(file, MockHttpFile)
    t.is(file.fsPath, `existing.txt`)
    t.is(file.urlPath, `/existing.txt`)
    t.is(file.text, undefined)
    t.is(file.bytes, undefined)
  }

  function testHttpFileUncached(file) {
    testHttpFile(file)
    t.is(file.caching, undefined)
  }

  function testHttpFileCached(file) {
    testHttpFile(file)
    t.is(file.caching, true)
  }

  const dirs = h.HttpDirs.of(new MockHttpDir())
  const enc = new TextEncoder()
  const srcText = `hello world`
  const srcBytes = globalThis.Buffer.from(enc.encode(srcText))

  t.is((await dirs.resolve(`/missing.txt`)), undefined)

  const one = await dirs.resolve(`/existing.txt`)
  const two = await dirs.resolve(`/existing.txt`)
  t.isnt(one, two)

  testHttpFileUncached(one)
  testHttpFileUncached(two)

  t.no(dirs.caching)
  t.is(dirs.filesByFsPath, undefined)
  t.is(dirs.filesByUrlPath, undefined)
  t.is(dirs.notFoundFile, undefined)

  dirs.setOpt({caching: true})

  t.is((await dirs.resolve(`/missing.txt`)), undefined)

  const file = await dirs.resolve(`/existing.txt`)
  testHttpFileCached(file)

  t.is((await dirs.resolve(`/existing.txt`)), file)
  t.is((await dirs.resolve(`/existing.txt`)), file)
  t.is((await dirs.resolve(`/existing.txt`)), file)

  t.ok(dirs.caching)
  t.eq(dirs.filesByFsPath, {[`existing.txt`]: file})
  t.eq(dirs.filesByUrlPath, {[`/existing.txt`]: file})
  t.is(dirs.notFoundFile, undefined)

  await t.test(async function test_HttpFile_response() {
    file.getBytes()
    const res = await file.response()
    t.is(res.headers.get(h.HEADER_NAME_CONTENT_ENCODING), null)
    t.is((await res.text()), srcText)
  })

  await t.test(async function test_HttpFile_compression_caching() {
    class CountingHttpCompressor extends h.HttpCompressor {
      counts = {zstd: 0, br: 0, gzip: 0, deflate: 0}

      zstdCompress(...src) {
        this.counts.zstd++
        return super.zstdCompress(...src)
      }

      brotliCompress(...src) {
        this.counts.br++
        return super.brotliCompress(...src)
      }

      gzipCompress(...src) {
        this.counts.gzip++
        return super.gzipCompress(...src)
      }

      deflateCompress(...src) {
        this.counts.deflate++
        return super.deflateCompress(...src)
      }
    }

    const compNonCounting = new h.HttpCompressor()

    async function testCached(...algos) {
      t.eq(l.recKeys(file.compressed), algos)

      for (const algo of algos) {
        const src = file.compressed[algo]

        t.eq(src.body, await compNonCounting.compress({algo, body: srcBytes}))

        t.eq(l.recKeys(src.opt), [`headers`])

        t.eq(src.opt.headers, new Headers([
          [h.HEADER_NAME_CONTENT_TYPE, `text/plain`],
          [h.HEADER_NAME_CONTENT_ENCODING, algo],
          [h.HEADER_NAME_VARY, h.HEADER_NAME_ACCEPT_ENCODING],
        ]))
      }
    }

    const comp = new CountingHttpCompressor()
    await comp.init()

    t.is(file.compressed, undefined)

    async function testReqRes(algo) {
      const res = await h.fileResponse({
        req: codedReq({algo}),
        file,
        compressor: comp,
      })

      t.is(res.headers.get(h.HEADER_NAME_CONTENT_ENCODING), algo)
      let body = await res.bytes()
      body = await comp.decompress({algo, body})
      t.eq(body, srcBytes)
    }

    await testReqRes(`br`)
    t.eq(comp.counts, {zstd: 0, br: 1, gzip: 0, deflate: 0})
    await testCached(`br`)

    // Must reuse cached compressed data.
    await testReqRes(`br`)
    t.eq(comp.counts, {zstd: 0, br: 1, gzip: 0, deflate: 0})
    await testCached(`br`)

    await testReqRes(`gzip`)
    t.eq(comp.counts, {zstd: 0, br: 1, gzip: 1, deflate: 0})
    await testCached(`br`, `gzip`)

    await testReqRes(`gzip`)
    t.eq(comp.counts, {zstd: 0, br: 1, gzip: 1, deflate: 0})
    await testCached(`br`, `gzip`)

    await testReqRes(`deflate`)
    t.eq(comp.counts, {zstd: 0, br: 1, gzip: 1, deflate: 1})
    await testCached(`br`, `gzip`, `deflate`)

    await testReqRes(`deflate`)
    t.eq(comp.counts, {zstd: 0, br: 1, gzip: 1, deflate: 1})
    await testCached(`br`, `gzip`, `deflate`)
  })
})

if (import.meta.main) console.log(`[test] ok!`)
