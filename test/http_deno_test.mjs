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

if (import.meta.main) console.log(`[test] ok!`)
