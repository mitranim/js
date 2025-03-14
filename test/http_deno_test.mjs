/*
Incomplete. Missing tests:

  * Various Dir features.
    * Path resolving.
    * Path filtering.
    * Finding files.
  * Content type detection.
  * File streaming.
  * Reliable file closing.
*/

import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as hd from '../http_deno.mjs'

t.test(function test_DirRel() {
  const dir = new hd.DirRel(`target`)
  t.is(dir.urlPathToFsPath(`/one%20two`), `target/one two`)
  t.is(dir.urlPathToFsPath(`/scripts/one%20two`), `target/scripts/one two`)
  t.is(dir.urlPathToFsPath(`../one%20two`), undefined)
  t.is(dir.urlPathToFsPath(`/scripts/../one%20two`), undefined)
})

t.test(function test_DirRelFil() {
  const dir = new hd.DirRelFil(`target`, /^scripts[/]/)
  t.is(dir.urlPathToFsPath(`/one%20two`), undefined)
  t.is(dir.urlPathToFsPath(`/target/scripts/one%20two`), undefined)
  t.is(dir.urlPathToFsPath(`/scripts/one%20two`), `target/scripts/one two`)
  t.is(dir.urlPathToFsPath(`/scripts/../one`), undefined)
})

t.test(function test_guessContentType() {
  t.throws(() => hd.guessContentType(), TypeError, `unable to convert undefined to string`)
  t.throws(() => hd.guessContentType(10), TypeError, `unable to convert 10 to string`)
  t.throws(() => hd.guessContentType({}), TypeError, `unable to convert {} to string`)
  t.throws(() => hd.guessContentType([]), TypeError, `unable to convert [] to string`)

  function test(src, exp) {
    t.is(hd.guessContentType(src), exp)
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

if (import.meta.main) console.log(`[test] ok!`)
