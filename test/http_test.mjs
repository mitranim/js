import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as s from '../str.mjs'
import * as h from '../http.mjs'
import * as u from '../url.mjs'

/* Util */

const URL_LONG = `scheme://user:pass@host:123/path?key=val#hash`

function mockInst(cls, ...vals) {return Object.assign(Object.create(cls.prototype), ...vals)}
function mockReqBui(...vals) {return mockInst(h.ReqBui, ...vals)}
function mockReq() {return new Request(URL_LONG, {method: h.POST})}
function mockRou() {return new h.Rou(mockReq())}
function simpleReq(url, meth) {return new Request(url, {method: meth})}
function testHead(bui, exp) {t.eq(bui.heads(), exp)}
function unreachable() {throw Error(`unreachable`)}
function args(...val) {return val}

/*
Needs better support from our testing library.
Full `Response` equality is not always desirable.
Sometimes you want to compare only a subset of fields.
*/
function testRes(res, exp) {
  l.reqInst(res, Response)
  for (const key of Object.keys(l.reqDict(exp))) {
    t.eq(res[key], exp[key])
  }
}

/* Test */

t.test(function test_GET() {t.is(h.GET, `GET`)})
t.test(function test_HEAD() {t.is(h.HEAD, `HEAD`)})
t.test(function test_OPTIONS() {t.is(h.OPTIONS, `OPTIONS`)})
t.test(function test_POST() {t.is(h.POST, `POST`)})
t.test(function test_PUT() {t.is(h.PUT, `PUT`)})
t.test(function test_PATCH() {t.is(h.PATCH, `PATCH`)})
t.test(function test_DELETE() {t.is(h.DELETE, `DELETE`)})
t.test(function test_CONTENT_TYPE() {t.is(h.CONTENT_TYPE, `content-type`)})
t.test(function test_TYPE_HTML() {t.is(h.TYPE_HTML, `text/html`)})
t.test(function test_TYPE_JSON() {t.is(h.TYPE_JSON, `application/json`)})
t.test(function test_TYPE_FORM() {t.is(h.TYPE_FORM, `application/x-www-form-urlencoded`)})
t.test(function test_TYPE_MULTI() {t.is(h.TYPE_MULTI, `multipart/form-data`)})

t.test(function test_jsonDecode() {
  t.throws(() => h.jsonDecode(10), TypeError, `expected variant of isStr, got 10`)
  t.throws(() => h.jsonDecode(`blah`), SyntaxError, `Unexpected token`)

  t.is(h.jsonDecode(), null)
  t.is(h.jsonDecode(undefined), null)
  t.is(h.jsonDecode(null), null)
  t.is(h.jsonDecode(``), null)
  t.is(h.jsonDecode(`null`), null)
  t.is(h.jsonDecode(`10`), 10)
  t.is(h.jsonDecode(`true`), true)
  t.is(h.jsonDecode(`"str"`), `str`)
  t.eq(h.jsonDecode(`[10, 20]`), [10, 20])
})

t.test(function test_jsonEncode() {
  // Insanity.
  t.is(JSON.stringify(), undefined)
  t.is(JSON.stringify(null), `null`)
  t.is(JSON.stringify({}), `{}`)
  t.is(JSON.stringify(``), `""`)

  // Sanity.
  t.is(h.jsonEncode(), `null`)
  t.is(h.jsonEncode(null), `null`)
  t.is(h.jsonEncode({}), `{}`)
  t.is(h.jsonEncode(``), `""`)
})

t.test(function test_Err() {
  t.throws(() => new h.Err(10, 20), TypeError, `expected variant of isStr, got 10`)
  t.throws(() => new h.Err(``, `str`), TypeError, `expected variant of isNat, got "str"`)
  t.throws(() => new h.Err(``, 0, `str`), TypeError, `expected instance of Response, got "str"`)

  t.is(new h.Err(``, 0).name, `Err`)
  t.is(new h.Err(`one`, 0).message, `one`)
  t.is(new h.Err(`one`, 20).message, `20: one`)
})

t.test(function test_getStatus() {
  t.is(h.getStatus(), undefined)
  t.is(h.getStatus(Error()), undefined)
  t.is(h.getStatus(new h.Err(``, 0)), 0)
  t.is(h.getStatus(new h.Err(``, 400)), 400)
  t.is(h.getStatus({}), undefined)
  t.is(h.getStatus({status: 0}), 0)
  t.is(h.getStatus({status: 400}), 400)
  t.is(h.getStatus(new Response(``, {status: 400})), 400)
})

t.test(function test_hasStatus() {
  t.throws(() => h.hasStatus(Error(), `str`), TypeError, `expected variant of isNat, got "str"`)

  t.test(function test_none() {
    function test(val) {t.no(h.hasStatus(val, 400))}

    test(undefined)
    test(false)
    test(`str`)
    test(10)
    test(Error())
  })

  t.no(h.hasStatus(new h.Err(``, 0), 400))
  t.no(h.hasStatus(new Response(``, {status: 200}), 400))

  t.ok(h.hasStatus(new h.Err(``, 400), 400))
  t.ok(h.hasStatus(new Response(``, {status: 400}), 400))
})

t.test(function test_reqBui() {
  l.reqInst(h.reqBui(), h.ReqBui)
})

/*
TODO:

  * Test fetching from a local server in the same process.
  * Test instantiation of responses.

Requires async support from our testing library.
In the meantime, those features are tested in apps.
*/
t.test(function test_ReqBui() {
  // Constructor just calls `.add` which is tested below.
  t.test(function test_constructor() {
    t.is(h.reqBui().constructor, h.ReqBui)

    t.eq(h.reqBui(), mockReqBui())
    t.eq(h.reqBui({one: 10, two: 20}), mockReqBui({one: 10, two: 20}))

    t.eq(new h.ReqBui(), mockReqBui())
    t.eq(new h.ReqBui({one: 10, two: 20}), mockReqBui({one: 10, two: 20}))
  })

  t.test(function test_add() {
    t.test(function test_same_reference() {
      function test(src, val) {
        const ref = h.reqBui(src)
        t.is(ref.add(val), ref)
      }

      test(undefined, undefined)
      test(undefined, {two: 20})
      test({one: 10}, undefined)
      test({one: 10}, {two: 20})
    })

    t.test(function test_headers() {
      function test(src, add, exp) {
        if (add.headers) Object.freeze(add.headers)

        const ref = h.reqBui(src)
        const prev = ref.headers

        ref.add(add)
        const next = ref.headers

        t.eq(next, exp)
        if (prev) t.is(prev, next)
        if (next) {
          t.isnt(ref.headers, src.headers)
          t.isnt(ref.headers, add.headers)
          t.isnt(ref.headers, exp)
        }
      }

      // Delegates to `.headAdd`, which is tested separately.
      test({}, {}, undefined)
      test({headers: {}}, {}, undefined)
      test({headers: {one: `10`}}, {}, {one: `10`})
      test({headers: {one: `10`, two: `20`}}, {}, {one: `10`, two: `20`})
      test({}, {headers: {one: `10`, two: `20`}}, {one: `10`, two: `20`})
      test({headers: {one: `10`}}, {headers: {two: `20`}}, {one: `10`, two: `20`})
      test({headers: {one: `10`}}, {headers: {one: undefined}}, {one: `10`})
      test({headers: {one: `10`}}, {headers: {one: `20`}}, {one: `10, 20`})
    })

    t.eq(
      h.reqBui().add({one: 10, two: 20}),
      mockReqBui({one: 10, two: 20}),
    )

    t.eq(
      h.reqBui({one: 10}).add({two: 20}),
      mockReqBui({one: 10, two: 20}),
    )

    t.eq(
      h.reqBui({one: 10, two: 20}).add({two: 30, three: 40}),
      mockReqBui({one: 10, two: 30, three: 40}),
    )

    t.eq(
      h.reqBui({one: 10, headers: {two: `20`}}).add({three: 30, headers: {four: `40`}}),
      mockReqBui({one: 10, three: 30, headers: {two: `20`, four: `40`}}),
    )
  })

  t.test(function test_meth() {
    t.eq(h.reqBui().meth(), mockReqBui({method: undefined}))
    t.eq(h.reqBui().meth(``), mockReqBui({method: undefined}))
    t.eq(h.reqBui().meth(`GET`), mockReqBui({method: `GET`}))
    t.eq(h.reqBui().meth(`POST`), mockReqBui({method: `POST`}))
    t.eq(h.reqBui().meth(`GET`).meth(`POST`), mockReqBui({method: `POST`}))
    t.eq(h.reqBui().meth(`GET`).meth(), mockReqBui({method: undefined}))
    t.eq(h.reqBui().meth(`GET`).meth(``), mockReqBui({method: undefined}))
    t.eq(h.reqBui().meth().meth(`POST`), mockReqBui({method: `POST`}))
  })

  t.test(function test_methods() {
    t.eq(h.reqBui().get(), mockReqBui({method: `GET`}))
    t.eq(h.reqBui({method: `HEAD`}).get(), mockReqBui({method: `GET`}))

    t.eq(h.reqBui().post(), mockReqBui({method: `POST`}))
    t.eq(h.reqBui({method: `HEAD`}).post(), mockReqBui({method: `POST`}))

    t.eq(h.reqBui().put(), mockReqBui({method: `PUT`}))
    t.eq(h.reqBui({method: `HEAD`}).put(), mockReqBui({method: `PUT`}))

    t.eq(h.reqBui().patch(), mockReqBui({method: `PATCH`}))
    t.eq(h.reqBui({method: `HEAD`}).patch(), mockReqBui({method: `PATCH`}))

    t.eq(h.reqBui().delete(), mockReqBui({method: `DELETE`}))
    t.eq(h.reqBui({method: `HEAD`}).delete(), mockReqBui({method: `DELETE`}))
  })

  t.test(function test_to() {
    t.throws(() => h.reqBui().to({}), TypeError, `expected variant of isScalar, got {}`)

    t.eq(h.reqBui().to(), mockReqBui({url: undefined}))
    t.eq(h.reqBui().to(new URL(URL_LONG)), mockReqBui({url: new URL(URL_LONG)}))
    t.eq(h.reqBui().to(URL_LONG), mockReqBui({url: URL_LONG}))
    t.eq(h.reqBui().to().to(URL_LONG), mockReqBui({url: URL_LONG}))
    t.eq(h.reqBui().to(URL_LONG).to(), mockReqBui({url: undefined}))
  })

  t.test(function test_sig() {
    t.throws(() => h.reqBui().sig(`str`), TypeError, `expected instance of AbortSignal, got "str"`)

    const sig = new AbortController().signal

    t.eq(h.reqBui().sig(), mockReqBui({signal: undefined}))
    t.eq(h.reqBui().sig(sig), mockReqBui({signal: sig}))
    t.eq(h.reqBui().sig(sig).sig(), mockReqBui({signal: undefined}))
    t.is(h.reqBui().sig(sig).signal, sig)
  })

  t.test(function test_inp() {
    t.throws(() => h.reqBui().inp({}), TypeError, `expected variant of isBody, got {}`)

    t.eq(h.reqBui().inp(), mockReqBui({body: undefined}))
    t.eq(h.reqBui().inp(`str`), mockReqBui({body: `str`}))
    t.eq(h.reqBui().inp(`str`).inp(), mockReqBui({body: undefined}))
    t.eq(h.reqBui().inp(10), mockReqBui({body: 10}))
    t.eq(h.reqBui().inp(new Uint8Array()), mockReqBui({body: new Uint8Array()}))
  })

  t.test(function test_json() {
    t.eq(h.reqBui().json(), mockReqBui({body: `null`, headers: {'content-type': `application/json`}}))
    t.eq(h.reqBui().json(10), mockReqBui({body: `10`, headers: {'content-type': `application/json`}}))
    t.eq(h.reqBui().json(10).json(), mockReqBui({body: `null`, headers: {'content-type': `application/json`}}))
  })

  // Delegates to `.headSet` which is tested separately.
  t.test(function test_type() {
    t.eq(h.reqBui().type(), mockReqBui())
    t.eq(h.reqBui().type(`one`), mockReqBui({headers: {'content-type': `one`}}))
    t.eq(h.reqBui().type(`one`).type(), mockReqBui({headers: {}}))
  })

  t.test(function test_types() {
    t.eq(h.reqBui().typeJson(), mockReqBui({headers: {'content-type': `application/json`}}))
    t.eq(h.reqBui().typeJson().type(), mockReqBui({headers: {}}))

    t.eq(h.reqBui().typeForm(), mockReqBui({headers: {'content-type': `application/x-www-form-urlencoded`}}))
    t.eq(h.reqBui().typeForm().type(), mockReqBui({headers: {}}))

    t.eq(h.reqBui().typeMulti(), mockReqBui({headers: {'content-type': `multipart/form-data`}}))
    t.eq(h.reqBui().typeMulti().type(), mockReqBui({headers: {}}))
  })

  // Incomplete.
  t.test(function test_req() {
    t.throws(() => h.reqBui().req(), TypeError, `Invalid URL`)

    t.notEq(
      h.reqBui().to(`https://example.com`).req(),
      new Request(`https://example.com/one`),
    )

    t.eq(
      h.reqBui().to(`https://example.com`).req(),
      new Request(`https://example.com`),
    )

    t.eq(
      h.reqBui().to(`https://example.com`).post().req(),
      new Request(`https://example.com`, {method: `POST`}),
    )

    t.eq(
      h.reqBui().to(`https://example.com`).post().json().req(),
      new Request(`https://example.com`, {
        method: `POST`,
        headers: {'content-type': `application/json`},
        body: `null`,
      }),
    )
  })

  t.test(function test_heads() {
    const ref = h.reqBui()
    t.eq(ref.heads(), {})
    t.is(ref.heads(), ref.heads())
    t.is(ref.heads(), ref.headers)
    t.is(Object.getPrototypeOf(ref.heads()), null)
  })

  t.test(function test_headHas() {
    t.throws(() => h.reqBui().headHas(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headHas(10, ``), TypeError, `expected variant of isHeadKey, got 10`)

    function test(src, key, exp) {t.is(mockReqBui({headers: src}).headHas(key), exp)}
    function none(src, key) {test(src, key, false)}
    function some(src, key) {test(src, key, true)}

    none(undefined, `one`)
    none({}, `one`)
    none({one: ``}, `two`)
    none({one: ``, two: ``}, `three`)

    some({one: ``}, `one`)
    some({one: ``, two: ``}, `one`)
    some({one: ``, two: ``}, `two`)
  })

  t.test(function test_headGet() {
    t.throws(() => h.reqBui().headGet(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headGet(10, ``), TypeError, `expected variant of isHeadKey, got 10`)

    function test(src, key, exp) {t.is(mockReqBui({headers: src}).headGet(key), exp)}
    function none(src, key) {test(src, key, ``)}

    none(undefined, `one`)
    none({}, `one`)
    none({one: ``}, `one`)
    none({one: ``}, `two`)
    none({one: ``, two: ``}, `one`)
    none({one: ``, two: ``}, `two`)
    none({one: ``, two: ``}, `three`)
    none({one: `two`, three: `four`}, `five`)

    test({one: `two`}, `one`, `two`)
    test({one: `two`, three: `four`}, `one`, `two`)
    test({one: `two`, three: `four`}, `three`, `four`)
  })

  t.test(function test_headSet() {
    t.throws(() => h.reqBui().headSet(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headSet(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => h.reqBui().headSet(`one`, []), TypeError, `unable to convert [] to string`)

    testHead(h.reqBui().headSet(`one`), {})
    testHead(h.reqBui().headSet(`one`, ``), {one: ``})
    testHead(h.reqBui().headSet(`one`, ``).headSet(`one`), {})
    testHead(h.reqBui().headSet(`one`, `two`), {one: `two`})
    testHead(h.reqBui().headSet(`one`, `two`).headSet(`one`), {})
    testHead(h.reqBui().headSet(`one`, `two`).headSet(`three`, `four`), {one: `two`, three: `four`})
    testHead(h.reqBui().headSet(`one`, `two`).headSet(`three`, `four`).headSet(`one`), {three: `four`})

    testHead(h.reqBui().headSet(`one`, 10), {one: `10`})
    testHead(h.reqBui().headSet(`location`, u.url(URL_LONG)), {location: URL_LONG})
  })

  t.test(function test_headSetAll() {
    t.throws(() => h.reqBui().headSetAll(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headSetAll(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => h.reqBui().headSetAll(`one`, {}), TypeError, `expected variant of isArr, got {}`)

    testHead(h.reqBui().headSetAll(`one`), {})
    testHead(h.reqBui().headSetAll(`one`, [``]), {one: ``})
    testHead(h.reqBui().headSetAll(`one`, [``, ``, ``]), {one: ``})
    testHead(h.reqBui().headSetAll(`one`, [``, undefined, ``]), {one: ``})
    testHead(h.reqBui().headSetAll(`one`, [`two`]), {one: `two`})
    testHead(h.reqBui().headSetAll(`one`, [`two`, `three`]), {one: `two, three`})
    testHead(h.reqBui().headSetAll(`one`, [`two`, ``, `three`]), {one: `two, three`})
    testHead(h.reqBui().headSetAll(`one`, [`two`]).headSetAll(`one`), {})
    testHead(h.reqBui().headSetAll(`one`, [`two`]).headSetAll(`one`, []), {})
  })

  t.test(function test_headSetAny() {
    t.throws(() => h.reqBui().headSetAny(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headSetAny(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => h.reqBui().headSetAny(`one`, {}), TypeError, `unable to convert {} to string`)

    testHead(h.reqBui().headSetAny(`one`), {})
    testHead(h.reqBui().headSetAny(`one`, []), {})
    testHead(h.reqBui().headSetAny(`one`, ``), {one: ``})
    testHead(h.reqBui().headSetAny(`one`, [`two`]), {one: `two`})
    testHead(h.reqBui().headSetAny(`one`, [`two`, `three`]), {one: `two, three`})
    testHead(h.reqBui().headSetAny(`one`, [`two`, `three`]).headSetAny(`one`, `four`), {one: `four`})
  })

  t.test(function test_headSetOpt() {
    t.throws(() => h.reqBui().headSetOpt(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headSetOpt(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => h.reqBui().headSetOpt(`one`, []), TypeError, `unable to convert [] to string`)

    testHead(h.reqBui().headSetOpt(`one`, ``), {})
    testHead(h.reqBui().headSetOpt(`one`, `two`), {one: `two`})
    testHead(h.reqBui().headSet(`one`, `two`).headSetOpt(`one`, undefined), {one: `two`})
    testHead(h.reqBui().headSet(`one`, `two`).headSetOpt(`one`, ``), {one: `two`})
    testHead(h.reqBui().headSet(`one`, `two`).headSetOpt(`one`, `three`), {one: `two`})
  })

  t.test(function test_headAppend() {
    t.throws(() => h.reqBui().headAppend(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headAppend(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => h.reqBui().headAppend(`one`, []), TypeError, `unable to convert [] to string`)

    testHead(h.reqBui().headAppend(`one`), {})
    testHead(h.reqBui().headAppend(`one`, ``), {one: ``})
    testHead(h.reqBui().headAppend(`one`, ``).headAppend(`one`, ``), {one: ``})
    testHead(h.reqBui().headAppend(`one`, `two`).headAppend(`one`, ``), {one: `two`})
    testHead(h.reqBui().headAppend(`one`, ``).headAppend(`one`, `two`), {one: `two`})
    testHead(h.reqBui().headAppend(`one`, `two`).headAppend(`one`, `three`), {one: `two, three`})
  })

  t.test(function test_headAppendAll() {
    t.throws(() => h.reqBui().headAppendAll(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headAppendAll(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => h.reqBui().headAppendAll(`one`, {}), TypeError, `expected variant of isArr, got {}`)

    testHead(h.reqBui().headAppendAll(`one`), {})
    testHead(h.reqBui().headAppendAll(`one`, [``]), {one: ``})
    testHead(h.reqBui().headAppendAll(`one`, [``, ``, ``]), {one: ``})
    testHead(h.reqBui().headAppendAll(`one`, [``, undefined, ``]), {one: ``})
    testHead(h.reqBui().headAppendAll(`one`, [`two`]), {one: `two`})
    testHead(h.reqBui().headAppendAll(`one`, [`two`, `three`]), {one: `two, three`})
    testHead(h.reqBui().headAppendAll(`one`, [`two`, ``, `three`]), {one: `two, three`})
    testHead(h.reqBui().headAppendAll(`one`, [`two`]).headAppendAll(`one`), {one: `two`})
    testHead(h.reqBui().headAppendAll(`one`, [`two`]).headAppendAll(`one`, []), {one: `two`})
    testHead(h.reqBui().headAppendAll(`one`, [`two`]).headAppendAll(`one`, [`three`]), {one: `two, three`})
  })

  t.test(function test_headAppendAny() {
    t.throws(() => h.reqBui().headAppendAny(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headAppendAny(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => h.reqBui().headAppendAny(`one`, {}), TypeError, `unable to convert {} to string`)

    testHead(h.reqBui().headAppendAny(`one`), {})
    testHead(h.reqBui().headAppendAny(`one`, []), {})
    testHead(h.reqBui().headAppendAny(`one`, ``), {one: ``})
    testHead(h.reqBui().headAppendAny(`one`, [`two`]), {one: `two`})
    testHead(h.reqBui().headAppendAny(`one`, [`two`, `three`]), {one: `two, three`})
    testHead(h.reqBui().headAppendAny(`one`, [`two`, `three`]).headAppendAny(`one`, `four`), {one: `two, three, four`})
  })

  t.test(function test_headDelete() {
    t.throws(() => h.reqBui().headDelete(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => h.reqBui().headDelete(10, ``), TypeError, `expected variant of isHeadKey, got 10`)

    function test(src, key, exp) {
      t.eq(mockReqBui({headers: src}).headDelete(key).headers, exp)
    }

    test(undefined, `one`, undefined)
    test({}, `one`, {})
    test({one: `two`}, `one`, {})
    test({one: `two`, three: `four`}, `one`, {three: `four`})
  })

  t.test(function test_headAdd() {
    t.throws(() => h.reqBui().headAdd(10), TypeError, `unable to convert 10 to head`)
    t.throws(() => h.reqBui().headAdd(`str`), TypeError, `unable to convert "str" to head`)

    function test(src, add, exp) {
      const ref = mockReqBui({headers: src}).headAdd(add)
      t.eq(ref.headers, exp)
      if (ref.headers) t.isnt(ref.headers, exp)
    }

    test(undefined, undefined, undefined)
    test(undefined, {}, undefined)
    test(undefined, [], undefined)
    test(undefined, new Headers(), undefined)
    test(undefined, s.strMap(), undefined)

    test({}, undefined, {})
    test({}, {}, {})
    test({}, [], {})
    test({}, new Headers(), {})
    test({}, s.strMap(), {})

    test({}, {one: `two`}, {one: `two`})
    test({}, {one: `two`, three: [`four`, `five`]}, {one: `two`, three: `four, five`})
    test({one: `two`}, {three: `four`}, {one: `two`, three: `four`})
    test({one: `two`}, {one: `three`}, {one: `two, three`})
    test({one: `two`}, {one: [`three`, `four`]}, {one: `two, three, four`})

    test({}, [[`one`, `two`]], {one: `two`})
    test({}, [[`one`, `two`], [`three`, [`four`, `five`]]], {one: `two`, three: `four, five`})
    test({one: `two`}, [[`three`, `four`]], {one: `two`, three: `four`})
    test({one: `two`}, [[`one`, `three`]], {one: `two, three`})
    test({one: `two`}, [[`one`, [`three`, `four`]]], {one: `two, three, four`})

    test({}, new Headers([[`one`, `two`]]), {one: `two`})
    test({}, new Headers([[`one`, `two`], [`three`, `four`], [`three`, `five`]]), {one: `two`, three: `four, five`})
    test({one: `two`}, new Headers([[`three`, `four`]]), {one: `two`, three: `four`})
    test({one: `two`}, new Headers([[`one`, `three`]]), {one: `two, three`})
    test({one: `two`}, new Headers([[`one`, `three`], [`one`, `four`]]), {one: `two, three, four`})

    test({}, s.strMap({one: `two`}), {one: `two`})
    test({}, s.strMap({one: `two`, three: [`four`, `five`]}), {one: `two`, three: `four, five`})
    test({one: `two`}, s.strMap({three: `four`}), {one: `two`, three: `four`})
    test({one: `two`}, s.strMap({one: `three`}), {one: `two, three`})
    test({one: `two`}, s.strMap({one: [`three`, `four`]}), {one: `two, three, four`})
  })

  t.test(function test_chain() {
    t.eq(
      h.reqBui()
      .to(`https://example.com`)
      .post()
      .json()
      .headSet(`x-session-id`, `a4c187abf0ba4a5f94f50ed991da6225`),

      mockReqBui({
        url: `https://example.com`,
        method: h.POST,
        body: `null`,
        headers: {
          [h.CONTENT_TYPE]: h.TYPE_JSON,
          'x-session-id': `a4c187abf0ba4a5f94f50ed991da6225`,
        },
      }),
    )
  })
})

/*
TODO:

  * Test fetching from a local server in the same process.
  * Test instantiation of responses.
  * Test equality of body content by reading streams.
  * Test proxying of read-only fields that can't be instantiated manually.
  * Test various async "ok" methods.

Requires async support from our testing library.
In the meantime, those features are tested in apps.
*/
t.test(function test_Res() {
  t.test(function test_constructor() {
    const src = new Response(`hello world`, {status: 400})
    const tar = new h.Res(src)

    t.ok(!!tar.body)

    t.is(tar.res, src)
    t.is(tar.status, src.status)
    t.is(tar.status, 400)
    t.no(tar.ok)
  })
})

t.test(function test_Rou() {
  t.test(function test_new() {
    t.test(function test_invalid() {
      t.throws(() => new h.Rou(), TypeError, `expected instance of Request, got undefined`)
      t.throws(() => new h.Rou(10), TypeError, `expected instance of Request, got 10`)
      t.throws(() => new h.Rou(`str`), TypeError, `expected instance of Request, got "str"`)
      t.throws(() => new h.Rou(URL_LONG), TypeError, `expected instance of Request, got ${l.show(URL_LONG)}`)
      t.throws(() => new h.Rou({}), TypeError, `expected instance of Request, got instance of Object {}`)
      t.throws(() => new h.Rou([]), TypeError, `expected instance of Request, got instance of Array []`)
    })

    const req = mockReq()
    const rou = new h.Rou(req)

    t.is(rou.req, req)

    t.eq(rou, mockInst(h.Rou, {
      req,
      url: u.url(URL_LONG),
      groups: undefined,
    }))
  })

  t.test(function test_matchMeth() {
    const rou = mockRou()

    t.throws(() => rou.matchMeth(), TypeError, `expected variant of isMethod, got undefined`)
    t.throws(() => rou.matchMeth({}), TypeError, `expected variant of isMethod, got {}`)

    t.no(rou.matchMeth(h.GET))
    t.no(rou.matchMeth(h.HEAD))

    t.ok(rou.matchMeth(h.POST))
  })

  t.test(function test_matchPat() {
    const rou = mockRou()

    t.test(function test_invalid() {
      t.throws(() => rou.matchPat(), TypeError, `unable to convert undefined to pattern`)
      t.throws(() => rou.matchPat({}), TypeError, `unable to convert {} to pattern`)
    })

    t.test(function test_none() {
      function test(val) {
        t.no(val)
        t.eq(rou.groups, undefined)
      }

      test(rou.matchPat(`path`))
      test(rou.matchPat(`/path/`))
      test(rou.matchPat(`path/`))
      test(rou.matchPat(`/pat`))
      test(rou.matchPat(/path[/]/))
      test(rou.matchPat(/path_other/))
    })

    t.test(function test_some() {
      function test(val, exp) {
        t.ok(val)
        t.eq(rou.groups, exp)
      }

      test(rou.matchPat(`/path`), undefined)
      test(rou.matchPat(/^[/](?<val>path)$/), {val: `path`})
    })
  })

  t.test(function test_match() {
    const rou = mockRou()

    t.no(rou.match(h.GET, `/path`))
    t.no(rou.match(h.POST, `/pat`))

    function test(val, exp) {
      t.ok(val)
      t.eq(rou.groups, exp)
    }

    test(rou.match(h.POST, `/path`), undefined)
    test(rou.match(h.POST, /^[/](?<val>path)$/), {val: `path`})
  })

  t.test(function test_only() {
    const rou = mockRou()

    t.throws(() => rou.only({}), TypeError, `expected variant of isMethod, got {}`)
    t.throws(() => rou.only(h.GET, {}), TypeError, `expected variant of isMethod, got {}`)

    testRes(rou.only(), {status: 405})
    testRes(rou.only(h.HEAD), {status: 405})

    t.is(rou.only(h.POST), undefined)
    t.is(rou.only(h.POST, h.GET), undefined)
    t.is(rou.only(h.GET, h.POST), undefined)
  })

  t.test(function test_meth() {
    const rou = mockRou()

    t.test(function test_invalid() {
      t.throws(() => rou.meth(h.POST,    undefined, undefined), TypeError, `expected variant of isPattern, got undefined`)
      t.throws(() => rou.meth(h.POST,    `/`,       undefined), TypeError, `expected variant of isFun, got undefined`)
      t.throws(() => rou.meth(h.POST,    /(?:)/,    undefined), TypeError, `expected variant of isFun, got undefined`)
      t.throws(() => rou.meth(undefined, /(?:)/,    l.nop),     TypeError, `expected variant of isMethod, got undefined`)
    })

    t.test(function test_none() {
      function test(val) {t.is(val, undefined)}

      test(rou.meth(h.GET,  `/path`,      unreachable))
      test(rou.meth(h.POST, `/pat`,       unreachable))
      test(rou.meth(h.GET,  /(?:)/,       unreachable))
      test(rou.meth(h.POST, /path_other/, unreachable))
    })

    t.test(function test_some() {
      function test(val, exp) {
        t.eq(val, [rou])
        t.eq(rou.groups, exp)
      }

      test(rou.meth(h.POST, `/path`,             args), undefined)
      test(rou.meth(h.POST, /^[/]path$/,         args), undefined)
      test(rou.meth(h.POST, /^[/](?<key>path)$/, args), {key: `path`})
    })
  })

  // TODO test async fallback.
  t.test(function test_sub() {
    const rou = mockRou()

    t.test(function test_invalid() {
      t.throws(() => rou.sub(undefined, l.nop), TypeError, `unable to convert undefined to pattern`)
      t.throws(() => rou.sub(`/`,  undefined), TypeError, `expected variant of isFun, got undefined`)
    })

    t.test(function test_none() {
      function test(val) {t.is(val, undefined)}

      test(rou.sub(`/pat`, unreachable))
      test(rou.sub(/path_other/, unreachable))
    })

    t.test(function test_some() {
      function test(val, exp) {
        t.eq(val, [rou])
        t.eq(rou.groups, exp)
      }

      test(rou.sub(`/path`, args), undefined)
      test(rou.sub(/^[/](?<key>path)$/, args), {key: `path`})
    })

    t.test(function test_fallback() {
      testRes(rou.sub(/(?:)/, l.nop), {status: 404})
    })
  })

  t.test(function test_preflight() {
    t.test(function test_invalid() {
      t.throws(() => mockRou().preflight(null), TypeError, `expected variant of isFun, got null`)
      t.throws(() => mockRou().preflight(`str`), TypeError, `expected variant of isFun, got "str"`)
      t.throws(() => mockRou().preflight({}), TypeError, `expected variant of isFun, got {}`)
    })

    t.test(function test_default() {
      t.is(new h.Rou(simpleReq(URL_LONG, h.GET)).preflight(), undefined)
      t.is(new h.Rou(simpleReq(URL_LONG, h.POST)).preflight(), undefined)
      testRes(new h.Rou(simpleReq(URL_LONG, h.HEAD)).preflight(), {status: 200})
      testRes(new h.Rou(simpleReq(URL_LONG, h.OPTIONS)).preflight(), {status: 200})
    })

    t.test(function test_override() {
      function over() {return `override`}
      t.is(new h.Rou(simpleReq(URL_LONG, h.GET)).preflight(over), undefined)
      t.is(new h.Rou(simpleReq(URL_LONG, h.POST)).preflight(over), undefined)
      t.is(new h.Rou(simpleReq(URL_LONG, h.HEAD)).preflight(over), `override`)
      t.is(new h.Rou(simpleReq(URL_LONG, h.OPTIONS)).preflight(over), `override`)
    })
  })
})

if (import.meta.main) console.log(`[test] ok!`)
