/*
Incomplete. Missing tests:

  * Various `HttpDir` features.
    * Path resolving.
    * Path filtering.
    * Finding files.
  * Content type detection.
  * File streaming.
  * Reliable file closing.

TODO we also need the same tests for `http_bun.mjs`.
*/

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as hd from '../http_deno.mjs'

t.test(function test_HttpDir() {
  function test(dir, src, exp) {
    let out
    out = dir.urlPathToFsPath(src)
    out = dir.allow(out) ? out : undefined
    t.is(out, exp, src)
  }

  t.test(function test_without_filtering() {
    const dir = new hd.HttpDir(`target`)
    test(dir, `/one%20two`, `target/one two`)
    test(dir, `/scripts/one%20two`, `target/scripts/one two`)
    test(dir, `../one%20two`, undefined)
    test(dir, `/../one%20two`, undefined)
    test(dir, `/scripts/../one%20two`, undefined)
  })

  t.test(function test_with_filtering() {
    const dir = new hd.HttpDir(`target`, /^target[/]scripts[/]/)
    test(dir, `/one%20two`, undefined)
    test(dir, `/target/scripts/one%20two`, undefined)
    test(dir, `/scripts/one%20two`, `target/scripts/one two`)
    test(dir, `/scripts/../one`, undefined)
  })
})

if (import.meta.main) console.log(`[test] ok!`)
