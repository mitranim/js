import * as iit from './internal_test_init.mjs'
import * as l from '../lang.mjs'
import * as t from '../test.mjs'
import * as u from '../url.mjs'

/* Global */

const {freeze} = Object

const searchLong = `one=two&one=three&four=five&five=six&seven=eight&nine=ten&nine=eleven`
const searchEncLong = `one=two+three&four=five?six&seven=eight%20nine`

const queryRecLong = freeze({one: [`two`, `three`], four: `five`, five: `six`, seven: `eight`, nine: [`ten`, `eleven`]})

const urlLong = `https://user:pass@one.two.three/four/five/six?one=two&one=three&four=five&five=six&seven=eight&nine=ten&nine=eleven#hash`
const urlShort = `https://example.com`

const uriSafeLong = `one_two_one_three_four_five_five_six_seven_eight_nine_ten_nine_eleven`
const uriUnsafeLong = searchLong
const uriUnescapedLong = searchLong
const uriEscapedLong = encodeURIComponent(uriUnsafeLong)

const decParamsLong = new URLSearchParams(searchLong)
const decQueryLong = u.query(searchLong)
const decURLLong = new URL(urlLong)
const decUrlLong = u.url(urlLong)
const decUrlLongUnsearched = freeze(u.url(urlLong))
const decUrlShort = u.url(urlShort)
const undecQueryLong = freeze(u.query(searchLong))

const mutQuery = u.query()
const mutUrl = u.url()

/* Util */

class Match extends l.Emp {
  constructor(val) {
    super()
    this.scheme = val.scheme
    this.slash = val.slash
    this.username = val.username
    this.password = val.password
    this.hostname = val.hostname
    this.port = val.port
    this.pathname = val.pathname
    this.query = val.query
    this.hash = val.hash
  }
}

/* Bench */

if (iit.more) {
  t.bench(function bench_encodeURIComponent_miss() {l.nop(encodeURIComponent(uriSafeLong))})
  t.bench(function bench_encodeURIComponent_hit() {l.nop(encodeURIComponent(uriUnsafeLong))})
  t.bench(function bench_decodeURIComponent_miss() {l.nop(decodeURIComponent(uriUnescapedLong))})
  t.bench(function bench_decodeURIComponent_hit() {l.nop(decodeURIComponent(uriEscapedLong))})
}

t.bench(function bench_new_query_empty_Params() {l.nop(new URLSearchParams())})
t.bench(function bench_new_query_empty_Query() {l.nop(u.query())})

t.bench(function bench_new_query_long_Params() {l.nop(new URLSearchParams(searchLong))})
t.bench(function bench_new_query_long_Query() {l.nop(new u.Query(searchLong))})

t.bench(function bench_new_empty_URL() {l.nop(new URL(`a:`))}) // Unfair but blame the dumb API.
t.bench(function bench_new_empty_Url() {l.nop(u.url())})

t.bench(function bench_Query_reset_str() {l.nop(mutQuery.reset(searchLong))})
t.bench(function bench_Query_reset_Params() {l.nop(mutQuery.reset(decParamsLong))})
t.bench(function bench_Query_reset_Query() {l.nop(mutQuery.reset(decQueryLong))})
t.bench(function bench_Query_reset_rec() {l.nop(mutQuery.reset(queryRecLong))})

t.bench(function bench_Query_mut_str() {l.nop(mutQuery.mut(searchLong))})
t.bench(function bench_Query_mut_Params() {l.nop(mutQuery.mut(decParamsLong))})
t.bench(function bench_Query_mut_Query() {l.nop(mutQuery.mut(decQueryLong))})
t.bench(function bench_Query_mut_rec() {l.nop(mutQuery.mut(queryRecLong))})

t.bench(function bench_query_decode_Params() {l.nop(new URLSearchParams(searchLong))})
t.bench(function bench_query_decode_Query() {l.nop(u.query(searchLong))})

t.bench(function bench_query_encode_Params() {l.nop(decParamsLong.toString())})
t.bench(function bench_query_encode_Query() {l.nop(decQueryLong.toString())})
t.bench(function bench_query_encode_Query_toStringFull() {l.nop(decQueryLong.toStringFull())})

const mutParamsForUpdate = new URLSearchParams(searchLong)
const mutQueryForUpdate = u.query(searchLong)
t.bench(function bench_query_update_Params() {l.nop(mutParamsForUpdate.append(`one`, `two`))})
t.bench(function bench_query_update_Query() {l.nop(mutQueryForUpdate.append(`one`, `two`))})

t.bench(function bench_query_walk_Params() {
  for (const [key, val] of decParamsLong) l.nop(key, val)
})

t.bench(function bench_query_walk_Query() {
  for (const [key, val] of decQueryLong) l.nop(key, val)
})

t.bench(function bench_Url_reset_str() {l.nop(mutUrl.reset(urlLong))})
t.bench(function bench_Url_reset_URL() {l.nop(mutUrl.reset(decURLLong))})
t.bench(function bench_Url_reset_Url() {l.nop(mutUrl.reset(decUrlLong))})

t.bench(function bench_url_decode_long_URL() {l.nop(new URL(urlLong))})
t.bench(function bench_url_decode_long_Url() {l.nop(u.url(urlLong))})
t.bench(function bench_url_decode_long_re_match() {l.nop(urlLong.match(u.RE_URL))})

t.bench(function bench_url_decode_short_URL() {l.nop(new URL(urlShort))})
t.bench(function bench_url_decode_short_Url() {l.nop(u.url(urlShort))})
t.bench(function bench_url_decode_short_re_match() {l.nop(urlShort.match(u.RE_URL))})

l.nop(decUrlLong.searchParams.toString())
t.bench(function bench_url_encode_URL() {l.nop(decURLLong.toString())})
t.bench(function bench_url_encode_Url_searched() {l.nop(decUrlLong.toString())})
t.bench(function bench_url_encode_Url_unsearched() {l.nop(decUrlLongUnsearched.toString())})

t.bench(function bench_url_setPath() {l.nop(mutUrl.setPath(`one`, `two`, `three`))})

t.bench(function bench_url_set_pathname_encode() {l.nop(u.url().setPathname(`/one`).toString())})
t.bench(function bench_url_set_search_encode() {l.nop(u.url().setSearch(`one=two`).toString())})
t.bench(function bench_url_set_hash_encode() {l.nop(u.url().setHash(`#one`).toString())})

t.bench(function bench_url_decode_set_pathname_encode_with_URL() {
  const val = new URL(urlLong)
  val.pathname = `/one`
  l.nop(val.toString())
})

t.bench(function bench_url_decode_set_search_encode_with_URL() {
  const val = new URL(urlLong)
  val.search = `one=two`
  l.nop(val.toString())
})

t.bench(function bench_url_decode_set_hash_encode_with_URL() {
  const val = new URL(urlLong)
  val.hash = `one`
  l.nop(val.toString())
})

t.bench(function bench_url_decode_set_pathname_encode_with_Url() {
  l.nop(u.url(urlLong).setPathname(`/one`).toString())
})

t.bench(function bench_url_decode_set_search_encode_with_Url() {
  l.nop(u.url(urlLong).setSearch(`one=two`).toString())
})

t.bench(function bench_url_decode_set_hash_encode_with_Url() {
  l.nop(u.url(urlLong).setHash(`#one`).toString())
})

t.bench(function bench_pathname_with_URL() {l.nop(new URL(urlLong).pathname)})
t.bench(function bench_pathname_with_Url() {l.nop(u.url(urlLong).pathname)})
t.bench(function bench_pathname_with_re() {l.nop(urlLong.match(u.RE_URL).groups.pathname)})

const groups = urlLong.match(u.RE_URL).groups
const match = new Match(groups)
const dict = urlLong.match(u.RE_URL).groups
const map = new Map(Object.entries(dict))
t.bench(function bench_clone_query_Params() {l.nop(new URLSearchParams(decParamsLong))})
t.bench(function bench_clone_query_Query_decoded() {l.nop(decQueryLong.clone())})
t.bench(function bench_clone_query_Query_undecoded() {l.nop(undecQueryLong.clone())})
t.bench(function bench_clone_url_URL() {l.nop(new URL(decURLLong))})
t.bench(function bench_clone_url_Url() {l.nop(decUrlLong.clone())})
t.bench(function bench_clone_match() {l.nop(new Match(match))})
t.bench(function bench_clone_map() {l.nop(new Map(map))})

t.bench(function bench_url_setScheme() {l.nop(mutUrl.setScheme(``))})
t.bench(function bench_url_setSlash() {l.nop(mutUrl.setSlash(``))})
t.bench(function bench_url_setUsername() {l.nop(mutUrl.setUsername(``))})
t.bench(function bench_url_setPassword() {l.nop(mutUrl.setPassword(``))})
t.bench(function bench_url_setHostname() {l.nop(mutUrl.setHostname(``))})
t.bench(function bench_url_setPort() {l.nop(mutUrl.setPort(``))})
t.bench(function bench_url_setPathname() {l.nop(mutUrl.setPathname(``))})
t.bench(function bench_url_setSearch() {l.nop(mutUrl.setSearch(``))})
t.bench(function bench_url_setSearchParams() {l.nop(mutUrl.setSearchParams(``))})
t.bench(function bench_url_setQuery() {l.nop(mutUrl.setQuery(``))})
t.bench(function bench_url_setHash() {l.nop(mutUrl.setHash(``))})
t.bench(function bench_url_setHashExact() {l.nop(mutUrl.setHashExact(``))})
t.bench(function bench_url_setProtocol() {l.nop(mutUrl.setProtocol(``))})
t.bench(function bench_url_setHost() {l.nop(mutUrl.setHost(``))})
t.bench(function bench_url_setOrigin() {l.nop(mutUrl.setOrigin(``))})
t.bench(function bench_url_setHref() {l.nop(mutUrl.setHref(``))})

t.bench(function bench_url_short_withScheme() {l.nop(decUrlShort.withScheme(``))})
t.bench(function bench_url_short_withSlash() {l.nop(decUrlShort.withSlash(``))})
t.bench(function bench_url_short_withUsername() {l.nop(decUrlShort.withUsername(``))})
t.bench(function bench_url_short_withPassword() {l.nop(decUrlShort.withPassword(``))})
t.bench(function bench_url_short_withHostname() {l.nop(decUrlShort.withHostname(``))})
t.bench(function bench_url_short_withPort() {l.nop(decUrlShort.withPort(``))})
t.bench(function bench_url_short_withPathname() {l.nop(decUrlShort.withPathname(``))})
t.bench(function bench_url_short_withSearch() {l.nop(decUrlShort.withSearch(``))})
t.bench(function bench_url_short_withSearchParams() {l.nop(decUrlShort.withSearchParams(``))})
t.bench(function bench_url_short_withQuery() {l.nop(decUrlShort.withQuery(``))})
t.bench(function bench_url_short_withHash() {l.nop(decUrlShort.withHash(``))})
t.bench(function bench_url_short_withHashExact() {l.nop(decUrlShort.withHashExact(``))})
t.bench(function bench_url_short_withProtocol() {l.nop(decUrlShort.withProtocol(``))})
t.bench(function bench_url_short_withHost() {l.nop(decUrlShort.withHost(``))})
t.bench(function bench_url_short_withOrigin() {l.nop(decUrlShort.withOrigin(``))})
t.bench(function bench_url_short_withHref() {l.nop(decUrlShort.withHref(``))})

t.bench(function bench_url_long_withScheme() {l.nop(decUrlLong.withScheme(``))})
t.bench(function bench_url_long_withSlash() {l.nop(decUrlLong.withSlash(``))})
t.bench(function bench_url_long_withUsername() {l.nop(decUrlLong.withUsername(``))})
t.bench(function bench_url_long_withPassword() {l.nop(decUrlLong.withPassword(``))})
t.bench(function bench_url_long_withHostname() {l.nop(decUrlLong.withHostname(``))})
t.bench(function bench_url_long_withPort() {l.nop(decUrlLong.withPort(``))})
t.bench(function bench_url_long_withPathname() {l.nop(decUrlLong.withPathname(``))})
t.bench(function bench_url_long_withSearch() {l.nop(decUrlLong.withSearch(``))})
t.bench(function bench_url_long_withSearchParams() {l.nop(decUrlLong.withSearchParams(``))})
t.bench(function bench_url_long_withQuery() {l.nop(decUrlLong.withQuery(``))})
t.bench(function bench_url_long_withHash() {l.nop(decUrlLong.withHash(``))})
t.bench(function bench_url_long_withHashExact() {l.nop(decUrlLong.withHashExact(``))})
t.bench(function bench_url_long_withProtocol() {l.nop(decUrlLong.withProtocol(``))})
t.bench(function bench_url_long_withHost() {l.nop(decUrlLong.withHost(``))})
t.bench(function bench_url_long_withOrigin() {l.nop(decUrlLong.withOrigin(``))})
t.bench(function bench_url_long_withHref() {l.nop(decUrlLong.withHref(``))})

t.bench(function bench_query_encode_idemp() {l.nop(encodeURI(searchEncLong))})

if (import.meta.main) t.deopt(), t.benches()
