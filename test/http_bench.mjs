import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as h from '../http.mjs'
import * as s from '../str.mjs'

/* Global */

const {freeze} = Object

const structEmpty = freeze({})
const structLong = freeze({one: `two`, three: `four`, five: `six`})

const arrEmpty = freeze([])
const arrLong = freeze([[`one`, `two`], [`three`, `four`], [`five`, `six`]])

const headersEmpty = freeze(new Headers())
const headersLong = freeze(new Headers(structLong))

const mapEmpty = freeze(s.strMap())
const mapLong = freeze(s.strMap(arrLong))

const reqBuiNoHead = freeze(h.reqBui())
const reqBuiEmptyHead = freeze(h.reqBui().headSet(`one`, ``).headDelete(`one`))
const reqBuiLongHead = freeze(h.reqBui().headAdd(structLong))

/* Bench */

t.bench(function bench_headers_empty() {l.nop(new Headers())})
t.bench(function bench_headers_from_struct_empty() {l.nop(new Headers(structEmpty))})
t.bench(function bench_headers_from_struct_long() {l.nop(new Headers(structLong))})
t.bench(function bench_headers_from_arr_empty() {l.nop(new Headers(arrEmpty))})
t.bench(function bench_headers_from_arr_long() {l.nop(new Headers(arrLong))})
t.bench(function bench_headers_from_headers_empty() {l.nop(new Headers(headersEmpty))})
t.bench(function bench_headers_from_headers_long() {l.nop(new Headers(headersLong))})
t.bench(function bench_headers_from_map_empty() {l.nop(new Headers(mapEmpty))})
t.bench(function bench_headers_from_map_long() {l.nop(new Headers(mapLong))})

t.bench(function bench_map_empty() {l.nop(s.strMap())})
t.bench(function bench_map_from_struct() {l.nop(s.strMap(structLong))})
t.bench(function bench_map_from_arr() {l.nop(s.strMap(arrLong))})
t.bench(function bench_map_from_headers() {l.nop(s.strMap(headersLong))})
t.bench(function bench_map_from_map() {l.nop(s.strMap(mapLong))})
t.bench(function bench_map_to_dict() {l.nop(mapLong.dict())})
t.bench(function bench_map_to_dictAll() {l.nop(mapLong.dictAll())})

t.bench(function bench_reqBui_empty() {l.nop(h.reqBui())})
t.bench(function bench_reqBui_head_from_struct() {l.nop(h.reqBui().headAdd(structLong))})
t.bench(function bench_reqBui_head_from_arr() {l.nop(h.reqBui().headAdd(arrLong))})
t.bench(function bench_reqBui_head_from_headers() {l.nop(h.reqBui().headAdd(headersLong))})
t.bench(function bench_reqBui_head_from_map() {l.nop(h.reqBui().headAdd(mapLong))})
t.bench(function bench_reqBui_head_to_headers() {l.nop(new Headers(reqBuiLongHead.headers))})
t.bench(function bench_reqBui_head_idemp() {l.nop(reqBuiEmptyHead.heads())})

t.bench(function bench_reqBui_headers_has_miss() {l.nop(headersEmpty.has(`one`))})
t.bench(function bench_reqBui_headers_has_hit() {l.nop(headersLong.has(`one`))})

t.bench(function bench_reqBui_headers_get_miss() {l.nop(headersEmpty.get(`one`))})
t.bench(function bench_reqBui_headers_get_hit() {l.nop(headersLong.get(`one`))})

t.bench(function bench_reqBui_head_has_nil() {l.nop(reqBuiNoHead.headHas(`one`))})
t.bench(function bench_reqBui_head_has_miss() {l.nop(reqBuiEmptyHead.headHas(`one`))})
t.bench(function bench_reqBui_head_has_hit() {l.nop(reqBuiLongHead.headHas(`one`))})

t.bench(function bench_reqBui_head_get_nil() {l.nop(reqBuiNoHead.headGet(`one`))})
t.bench(function bench_reqBui_head_get_miss() {l.nop(reqBuiEmptyHead.headGet(`one`))})
t.bench(function bench_reqBui_head_get_hit() {l.nop(reqBuiLongHead.headGet(`one`))})

t.bench(function bench_reqBui_literal() {
  l.nop(h.reqBui({
    url: `https://example.com`,
    method: h.POST,
    body: `null`,
    headers: {
      [h.CONTENT_TYPE]: h.TYPE_JSON,
      'x-session-id': `a4c187abf0ba4a5f94f50ed991da6225`,
    },
  }))
})

t.bench(function bench_reqBui_chained() {
  l.nop(
    h.reqBui()
    .to(`https://example.com`)
    .post()
    .json()
    .headSet(`x-session-id`, `a4c187abf0ba4a5f94f50ed991da6225`),
  )
})

t.bench(function bench_request_with_native_api_headers_struct() {
  l.nop(new Request(`https://example.com`, {
    method: h.POST,
    headers: {
      [h.CONTENT_TYPE]: h.TYPE_JSON,
      'x-session-id': `a4c187abf0ba4a5f94f50ed991da6225`,
    },
    body: JSON.stringify(null),
  }))
})

t.bench(function bench_request_with_native_api_headers_arr() {
  l.nop(new Request(`https://example.com`, {
    method: h.POST,
    headers: [
      [h.CONTENT_TYPE, h.TYPE_JSON],
      [`x-session-id`, `a4c187abf0ba4a5f94f50ed991da6225`],
    ],
    body: JSON.stringify(null),
  }))
})

t.bench(function bench_request_with_native_api_headers_headers() {
  l.nop(new Request(`https://example.com`, {
    method: h.POST,
    headers: new Headers({
      [h.CONTENT_TYPE]: h.TYPE_JSON,
      'x-session-id': `a4c187abf0ba4a5f94f50ed991da6225`,
    }),
    body: JSON.stringify(null),
  }))
})

t.bench(function bench_request_with_ReqBui() {
  l.nop(
    h.reqBui()
    .to(`https://example.com`)
    .post()
    .json()
    .headSet(`x-session-id`, `a4c187abf0ba4a5f94f50ed991da6225`)
    .req()
  )
})

if (import.meta.main) t.deopt(), t.benches()
