import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as pt from '../path.mjs'

/* Global */

// const longDirPathUnix = `/one/two/three/four/five/six/seven`
const longDirPathWindows = `vol:\\one\\two\\three\\four\\five\\six\\seven`

// const longFilePathUnix = `/one/two/three/four/five/six/seven.eight`
const longFilePathWindows = `vol:\\one\\two\\three\\four\\five\\six\\seven.eight`

/* Bench */

t.bench(function bench_hasExt_miss() {pt.hasExt(longDirPathWindows)})
t.bench(function bench_hasExt_hit() {pt.hasExt(longFilePathWindows)})
t.bench(function bench_ext_miss() {pt.ext(longDirPathWindows)})
t.bench(function bench_ext_hit() {pt.ext(longFilePathWindows)})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
