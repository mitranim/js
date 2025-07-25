import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as h from '../http.mjs'
import * as s from '../str.mjs'

/* Global */

const {freeze} = Object

const dictEmpty = freeze({})
const dictLong = freeze({one: `two`, three: `four`, five: `six`})

const arrEmpty = freeze([])
const arrLong = freeze([[`one`, `two`], [`three`, `four`], [`five`, `six`]])

const headersEmpty = new Headers()
const headersLong = new Headers(dictLong)

const mapEmpty = freeze(s.strMap())
const mapLong = freeze(s.strMap(arrLong))

const cookMut = new h.Cookie()

/* Bench */

t.bench(function bench_headers_empty() {l.nop(new Headers())})
t.bench(function bench_headers_from_dict_empty() {l.nop(new Headers(dictEmpty))})
t.bench(function bench_headers_from_dict_long() {l.nop(new Headers(dictLong))})
t.bench(function bench_headers_from_arr_empty() {l.nop(new Headers(arrEmpty))})
t.bench(function bench_headers_from_arr_long() {l.nop(new Headers(arrLong))})
t.bench(function bench_headers_from_headers_empty() {l.nop(new Headers(headersEmpty))})
t.bench(function bench_headers_from_headers_long() {l.nop(new Headers(headersLong))})
t.bench(function bench_headers_from_map_empty() {l.nop(new Headers(mapEmpty))})
t.bench(function bench_headers_from_map_long() {l.nop(new Headers(mapLong))})

t.bench(function bench_map_empty() {l.nop(s.strMap())})
t.bench(function bench_map_from_dict() {l.nop(s.strMap(dictLong))})
t.bench(function bench_map_from_arr() {l.nop(s.strMap(arrLong))})
t.bench(function bench_map_from_headers() {l.nop(s.strMap(headersLong))})
t.bench(function bench_map_from_map() {l.nop(s.strMap(mapLong))})
t.bench(function bench_map_toDict() {l.nop(mapLong.toDict())})
t.bench(function bench_map_toDictAll() {l.nop(mapLong.toDictAll())})

t.bench(function bench_request_with_prealloc_header_dict() {
  l.nop(new Request(`https://example.com`, {
    method: h.POST,
    headers: dictLong,
  }))
})

t.bench(function bench_request_with_prealloc_header_arr() {
  l.nop(new Request(`https://example.com`, {
    method: h.POST,
    headers: arrLong,
  }))
})

t.bench(function bench_request_with_prealloc_header_cls() {
  l.nop(new Request(`https://example.com`, {
    method: h.POST,
    headers: headersLong,
  }))
})

t.bench(function bench_response_empty() {l.nop(new Response())})

/*
Our routing pattern encourages passing regexps to methods. This verifies that
using a regexp literal doesn't have a huge instantiation cost. Regexp literals
are not immutable constants. Each regexp is stateful via `.lastIndex` and
possibly more. But they seem to be lightweight. The actual regexp state is
probably created once per literal, not per instance.
*/
t.bench(function bench_RegExp_inline() {l.nop(/^[/]test[/]?/)})
t.bench(function bench_RegExp_source() {l.nop(/^[/]test[/]?/.source)})

t.bench(function bench_Cookie_build() {
  l.nop(h.cook().setName(`one`).setValue(`two`).lax().durable())
})

t.bench(function bench_Cookie_build_toString() {
  l.nop(h.cook().setName(`one`).setValue(`two`).lax().durable().toString())
})

t.bench(function bench_Cookie_setPair() {
  l.nop(cookMut.setPair(`one two=three four`))
})

t.bench(function bench_Cookies_from_string() {
  l.nop(new h.Cookies(`one=two; three=four; five=six`))
})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
