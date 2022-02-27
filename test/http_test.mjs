import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as s from '../str.mjs'
import * as h from '../http.mjs'
import * as u from '../url.mjs'

/* Util */

const URL_LONG = `scheme://user:pass@host:123/path?key=val#hash`

function mockInst(cls, ...val) {return Object.assign(Object.create(cls.prototype), ...val)}
function mockHttpBui(...val) {return mockInst(h.HttpBui, ...val)}
function mockReqBui(...val) {return mockInst(h.ReqBui, ...val)}
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

function testHttpBui(act, exp) {
  t.inst(act, h.HttpBui)
  t.own(act, exp)
}

function testReqBui(act, exp) {
  t.inst(act, h.ReqBui)
  t.own(act, exp)
}

// Dup from `http_srv_test.mjs`, TODO dedup. Not intended for public API.
async function readFull(src) {
  let out = ``
  for await (const val of src) out += toStr(val)
  return out
}

function toStr(val) {
  if (l.isInst(val, Uint8Array)) return new TextDecoder().decode(val)
  return l.reqStr(val)
}

function testStr(src, exp) {t.is(src.toString(), exp)}

/* Test */

t.test(function test_GET() {t.is(h.GET, `GET`)})
t.test(function test_HEAD() {t.is(h.HEAD, `HEAD`)})
t.test(function test_OPTIONS() {t.is(h.OPTIONS, `OPTIONS`)})
t.test(function test_POST() {t.is(h.POST, `POST`)})
t.test(function test_PUT() {t.is(h.PUT, `PUT`)})
t.test(function test_PATCH() {t.is(h.PATCH, `PATCH`)})
t.test(function test_DELETE() {t.is(h.DELETE, `DELETE`)})
t.test(function test_HEAD_CONTENT_TYPE() {t.is(h.HEAD_CONTENT_TYPE, `content-type`)})
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

t.test(function test_HttpBui() {
  // Constructor just calls `.mut` which is tested below.
  t.test(function test_constructor() {
    testHttpBui(new h.HttpBui(), {})
    testHttpBui(new h.HttpBui({one: 10, two: 20}), {one: 10, two: 20})
  })

  t.test(function test_mut() {
    t.test(function test_same_reference() {
      function test(src, val) {
        const ref = new h.HttpBui(src)
        t.is(ref.mut(val), ref)
      }

      test(undefined, undefined)
      test(undefined, {two: 20})
      test({one: 10}, undefined)
      test({one: 10}, {two: 20})
    })

    t.test(function test_headers() {
      function test(src, add, exp) {
        if (add.headers) Object.freeze(add.headers)

        const ref = new h.HttpBui(src)
        const prev = ref.headers

        ref.mut(add)
        const next = ref.headers

        t.eq(next, exp)
        if (prev) t.is(prev, next)
        if (next) {
          t.isnt(ref.headers, src.headers)
          t.isnt(ref.headers, add.headers)
          t.isnt(ref.headers, exp)
        }
      }

      // Delegates to `.headMut`, which is tested separately.
      test({}, {}, undefined)
      test({headers: {}}, {}, undefined)
      test({headers: {one: `10`}}, {}, {one: `10`})
      test({headers: {one: `10`, two: `20`}}, {}, {one: `10`, two: `20`})
      test({}, {headers: {one: `10`, two: `20`}}, {one: `10`, two: `20`})
      test({headers: {one: `10`}}, {headers: {two: `20`}}, {one: `10`, two: `20`})
      test({headers: {one: `10`}}, {headers: {one: undefined}}, {one: `10`})
      test({headers: {one: `10`}}, {headers: {one: `20`}}, {one: `10, 20`})
    })

    testHttpBui(
      new h.HttpBui().mut({one: 10, two: 20}),
      {one: 10, two: 20},
    )

    testHttpBui(
      new h.HttpBui({one: 10}).mut({two: 20}),
      {one: 10, two: 20},
    )

    testHttpBui(
      new h.HttpBui({one: 10, two: 20}).mut({two: 30, three: 40}),
      {one: 10, two: 30, three: 40},
    )

    testHttpBui(
      new h.HttpBui({one: 10, headers: {two: `20`}}).mut({three: 30, headers: {four: `40`}}),
      {one: 10, three: 30, headers: {two: `20`, four: `40`}},
    )
  })

  // Delegates to `.headSet` which is tested separately.
  t.test(function test_type() {
    testHttpBui(new h.HttpBui().type(), {})
    testHttpBui(new h.HttpBui().type(`one`), {headers: {'content-type': `one`}})
    testHttpBui(new h.HttpBui().type(`one`).type(), {headers: {}})
  })

  t.test(function test_types() {
    testHttpBui(new h.HttpBui().typeText(), {headers: {'content-type': `text/plain`}})
    testHttpBui(new h.HttpBui().typeText().type(), {headers: {}})

    testHttpBui(new h.HttpBui().typeHtml(), {headers: {'content-type': `text/html`}})
    testHttpBui(new h.HttpBui().typeHtml().type(), {headers: {}})

    testHttpBui(new h.HttpBui().typeJson(), {headers: {'content-type': `application/json`}})
    testHttpBui(new h.HttpBui().typeJson().type(), {headers: {}})

    testHttpBui(new h.HttpBui().typeForm(), {headers: {'content-type': `application/x-www-form-urlencoded`}})
    testHttpBui(new h.HttpBui().typeForm().type(), {headers: {}})

    testHttpBui(new h.HttpBui().typeMulti(), {headers: {'content-type': `multipart/form-data`}})
    testHttpBui(new h.HttpBui().typeMulti().type(), {headers: {}})
  })

  t.test(function test_heads() {
    const ref = new h.HttpBui()
    t.is(ref.heads(), ref.heads())
    t.is(ref.heads(), ref.headers)
    t.is(ref.headers, ref.heads())
    t.is(ref.headers, ref.headers)
    t.eq(ref.headers, {})
    t.is(Object.getPrototypeOf(ref.headers), null)
  })

  t.test(function test_headHas() {
    t.throws(() => new h.HttpBui().headHas(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headHas(10, ``), TypeError, `expected variant of isHeadKey, got 10`)

    function test(src, key, exp) {t.is(mockHttpBui({headers: src}).headHas(key), exp)}
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
    t.throws(() => new h.HttpBui().headGet(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headGet(10, ``), TypeError, `expected variant of isHeadKey, got 10`)

    function test(src, key, exp) {t.is(mockHttpBui({headers: src}).headGet(key), exp)}
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
    t.throws(() => new h.HttpBui().headSet(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headSet(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => new h.HttpBui().headSet(`one`, []), TypeError, `unable to convert [] to string`)

    testHead(new h.HttpBui().headSet(`one`), {})
    testHead(new h.HttpBui().headSet(`one`, ``), {one: ``})
    testHead(new h.HttpBui().headSet(`one`, ``).headSet(`one`), {})
    testHead(new h.HttpBui().headSet(`one`, `two`), {one: `two`})
    testHead(new h.HttpBui().headSet(`one`, `two`).headSet(`one`), {})
    testHead(new h.HttpBui().headSet(`one`, `two`).headSet(`three`, `four`), {one: `two`, three: `four`})
    testHead(new h.HttpBui().headSet(`one`, `two`).headSet(`three`, `four`).headSet(`one`), {three: `four`})

    testHead(new h.HttpBui().headSet(`one`, 10), {one: `10`})
    testHead(new h.HttpBui().headSet(`location`, u.url(URL_LONG)), {location: URL_LONG})
  })

  t.test(function test_headSetAll() {
    t.throws(() => new h.HttpBui().headSetAll(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headSetAll(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => new h.HttpBui().headSetAll(`one`, {}), TypeError, `expected variant of isArr, got {}`)

    testHead(new h.HttpBui().headSetAll(`one`), {})
    testHead(new h.HttpBui().headSetAll(`one`, [``]), {one: ``})
    testHead(new h.HttpBui().headSetAll(`one`, [``, ``, ``]), {one: ``})
    testHead(new h.HttpBui().headSetAll(`one`, [``, undefined, ``]), {one: ``})
    testHead(new h.HttpBui().headSetAll(`one`, [`two`]), {one: `two`})
    testHead(new h.HttpBui().headSetAll(`one`, [`two`, `three`]), {one: `two, three`})
    testHead(new h.HttpBui().headSetAll(`one`, [`two`, ``, `three`]), {one: `two, three`})
    testHead(new h.HttpBui().headSetAll(`one`, [`two`]).headSetAll(`one`), {})
    testHead(new h.HttpBui().headSetAll(`one`, [`two`]).headSetAll(`one`, []), {})
  })

  t.test(function test_headSetAny() {
    t.throws(() => new h.HttpBui().headSetAny(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headSetAny(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => new h.HttpBui().headSetAny(`one`, {}), TypeError, `unable to convert {} to string`)

    testHead(new h.HttpBui().headSetAny(`one`), {})
    testHead(new h.HttpBui().headSetAny(`one`, []), {})
    testHead(new h.HttpBui().headSetAny(`one`, ``), {one: ``})
    testHead(new h.HttpBui().headSetAny(`one`, [`two`]), {one: `two`})
    testHead(new h.HttpBui().headSetAny(`one`, [`two`, `three`]), {one: `two, three`})
    testHead(new h.HttpBui().headSetAny(`one`, [`two`, `three`]).headSetAny(`one`, `four`), {one: `four`})
  })

  t.test(function test_headSetOpt() {
    t.throws(() => new h.HttpBui().headSetOpt(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headSetOpt(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => new h.HttpBui().headSetOpt(`one`, []), TypeError, `unable to convert [] to string`)

    testHead(new h.HttpBui().headSetOpt(`one`, ``), {})
    testHead(new h.HttpBui().headSetOpt(`one`, `two`), {one: `two`})
    testHead(new h.HttpBui().headSet(`one`, `two`).headSetOpt(`one`, undefined), {one: `two`})
    testHead(new h.HttpBui().headSet(`one`, `two`).headSetOpt(`one`, ``), {one: `two`})
    testHead(new h.HttpBui().headSet(`one`, `two`).headSetOpt(`one`, `three`), {one: `two`})
  })

  t.test(function test_headAppend() {
    t.throws(() => new h.HttpBui().headAppend(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headAppend(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => new h.HttpBui().headAppend(`one`, []), TypeError, `unable to convert [] to string`)

    testHead(new h.HttpBui().headAppend(`one`), {})
    testHead(new h.HttpBui().headAppend(`one`, ``), {one: ``})
    testHead(new h.HttpBui().headAppend(`one`, ``).headAppend(`one`, ``), {one: ``})
    testHead(new h.HttpBui().headAppend(`one`, `two`).headAppend(`one`, ``), {one: `two`})
    testHead(new h.HttpBui().headAppend(`one`, ``).headAppend(`one`, `two`), {one: `two`})
    testHead(new h.HttpBui().headAppend(`one`, `two`).headAppend(`one`, `three`), {one: `two, three`})
  })

  t.test(function test_headAppendAll() {
    t.throws(() => new h.HttpBui().headAppendAll(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headAppendAll(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => new h.HttpBui().headAppendAll(`one`, {}), TypeError, `expected variant of isArr, got {}`)

    testHead(new h.HttpBui().headAppendAll(`one`), {})
    testHead(new h.HttpBui().headAppendAll(`one`, [``]), {one: ``})
    testHead(new h.HttpBui().headAppendAll(`one`, [``, ``, ``]), {one: ``})
    testHead(new h.HttpBui().headAppendAll(`one`, [``, undefined, ``]), {one: ``})
    testHead(new h.HttpBui().headAppendAll(`one`, [`two`]), {one: `two`})
    testHead(new h.HttpBui().headAppendAll(`one`, [`two`, `three`]), {one: `two, three`})
    testHead(new h.HttpBui().headAppendAll(`one`, [`two`, ``, `three`]), {one: `two, three`})
    testHead(new h.HttpBui().headAppendAll(`one`, [`two`]).headAppendAll(`one`), {one: `two`})
    testHead(new h.HttpBui().headAppendAll(`one`, [`two`]).headAppendAll(`one`, []), {one: `two`})
    testHead(new h.HttpBui().headAppendAll(`one`, [`two`]).headAppendAll(`one`, [`three`]), {one: `two, three`})
  })

  t.test(function test_headAppendAny() {
    t.throws(() => new h.HttpBui().headAppendAny(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headAppendAny(10, ``), TypeError, `expected variant of isHeadKey, got 10`)
    t.throws(() => new h.HttpBui().headAppendAny(`one`, {}), TypeError, `unable to convert {} to string`)

    testHead(new h.HttpBui().headAppendAny(`one`), {})
    testHead(new h.HttpBui().headAppendAny(`one`, []), {})
    testHead(new h.HttpBui().headAppendAny(`one`, ``), {one: ``})
    testHead(new h.HttpBui().headAppendAny(`one`, [`two`]), {one: `two`})
    testHead(new h.HttpBui().headAppendAny(`one`, [`two`, `three`]), {one: `two, three`})
    testHead(new h.HttpBui().headAppendAny(`one`, [`two`, `three`]).headAppendAny(`one`, `four`), {one: `two, three, four`})
  })

  t.test(function test_headDelete() {
    t.throws(() => new h.HttpBui().headDelete(undefined, ``), TypeError, `expected variant of isHeadKey, got undefined`)
    t.throws(() => new h.HttpBui().headDelete(10, ``), TypeError, `expected variant of isHeadKey, got 10`)

    function test(src, key, exp) {
      t.eq(mockHttpBui({headers: src}).headDelete(key).headers, exp)
    }

    test(undefined, `one`, undefined)
    test({}, `one`, {})
    test({one: `two`}, `one`, {})
    test({one: `two`, three: `four`}, `one`, {three: `four`})
  })

  t.test(function test_headMut() {
    t.throws(() => new h.HttpBui().headMut(10), TypeError, `unable to convert 10 to head`)
    t.throws(() => new h.HttpBui().headMut(`str`), TypeError, `unable to convert "str" to head`)

    function test(src, add, exp) {
      const ref = mockHttpBui({headers: src}).headMut(add)
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
  // Same as `HttpBui`. Just a sanity check.
  t.test(function test_constructor() {
    testReqBui(new h.ReqBui(), {})
    testReqBui(new h.ReqBui({one: 10, two: 20}), {one: 10, two: 20})
  })

  t.test(function test_meth() {
    testReqBui(h.reqBui().meth(), {method: undefined})
    testReqBui(h.reqBui().meth(``), {method: undefined})
    testReqBui(h.reqBui().meth(`GET`), {method: `GET`})
    testReqBui(h.reqBui().meth(`POST`), {method: `POST`})
    testReqBui(h.reqBui().meth(`GET`).meth(`POST`), {method: `POST`})
    testReqBui(h.reqBui().meth(`GET`).meth(), {method: undefined})
    testReqBui(h.reqBui().meth(`GET`).meth(``), {method: undefined})
    testReqBui(h.reqBui().meth().meth(`POST`), {method: `POST`})
  })

  t.test(function test_methods() {
    testReqBui(h.reqBui().get(), {method: `GET`})
    testReqBui(h.reqBui({method: `HEAD`}).get(), {method: `GET`})

    testReqBui(h.reqBui().post(), {method: `POST`})
    testReqBui(h.reqBui({method: `HEAD`}).post(), {method: `POST`})

    testReqBui(h.reqBui().put(), {method: `PUT`})
    testReqBui(h.reqBui({method: `HEAD`}).put(), {method: `PUT`})

    testReqBui(h.reqBui().patch(), {method: `PATCH`})
    testReqBui(h.reqBui({method: `HEAD`}).patch(), {method: `PATCH`})

    testReqBui(h.reqBui().delete(), {method: `DELETE`})
    testReqBui(h.reqBui({method: `HEAD`}).delete(), {method: `DELETE`})
  })

  t.test(function test_to() {
    t.throws(() => h.reqBui().to({}), TypeError, `expected variant of isScalar, got {}`)

    testReqBui(h.reqBui().to(), {url: undefined})
    testReqBui(h.reqBui().to(new URL(URL_LONG)), {url: new URL(URL_LONG)})
    testReqBui(h.reqBui().to(URL_LONG), {url: URL_LONG})
    testReqBui(h.reqBui().to().to(URL_LONG), {url: URL_LONG})
    testReqBui(h.reqBui().to(URL_LONG).to(), {url: undefined})
  })

  t.test(function test_sig() {
    t.throws(() => h.reqBui().sig(`str`), TypeError, `expected instance of AbortSignal, got "str"`)

    const sig = new AbortController().signal

    testReqBui(h.reqBui().sig(), {signal: undefined})
    testReqBui(h.reqBui().sig(sig), {signal: sig})
    testReqBui(h.reqBui().sig(sig).sig(), {signal: undefined})
    t.is(h.reqBui().sig(sig).signal, sig)
  })

  t.test(function test_inp() {
    t.throws(() => h.reqBui().inp({}), TypeError, `expected variant of [isScalar, isUint8Array, isReadableStream, isFormData], got {}`)

    testReqBui(h.reqBui().inp(), {body: undefined})
    testReqBui(h.reqBui().inp(`str`), {body: `str`})
    testReqBui(h.reqBui().inp(`str`).inp(), {body: undefined})
    testReqBui(h.reqBui().inp(10), {body: 10})
    testReqBui(h.reqBui().inp(new Uint8Array()), {body: new Uint8Array()})
  })

  t.test(function test_json() {
    testReqBui(h.reqBui().json(), {body: `null`, headers: {'content-type': `application/json`}})
    testReqBui(h.reqBui().json(10), {body: `10`, headers: {'content-type': `application/json`}})
    testReqBui(h.reqBui().json(10).json(), {body: `null`, headers: {'content-type': `application/json`}})
  })

  // Incomplete.
  t.test(function test_req() {
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
          [h.HEAD_CONTENT_TYPE]: h.TYPE_JSON,
          'x-session-id': `a4c187abf0ba4a5f94f50ed991da6225`,
        },
      }),
    )
  })
})

/*
TODO:

  * Test fetching from a local server in the same process.
  * Test instantiation of responses by `ReqBui`.
  * Test proxying of read-only fields that can't be instantiated manually.
  * Test various async "ok" methods.
*/
await t.test(async function test_Res() {
  await t.test(async function test_constructor() {
    await t.test(async function test_from_Response() {
      const src = new Response(`hello world`, {status: 400})
      const tar = new h.Res(src)
      await testResSimple(tar, src)
    })

    await t.test(async function test_from_body_and_Response() {
      const src = new Response(`goodbye world`, {status: 400})
      const res = new h.Res(`hello world`, src)
      await testResSimple(res, src)
    })

    await t.test(async function test_from_body_and_init() {
      const res = new h.Res(`hello world`, {status: 400})
      await testResSimple(res, res)
    })
  })
})

async function testResSimple(res, src) {
  t.is(await readFull(res.body), `hello world`)
  t.is(res.res, src)
  t.is(res.status, 400)
  t.no(res.ok)
}

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

/*
TODO: verify that all event listeners are "once", and that we remove the
listener when unlinking.
*/
t.test(function test_Ctx() {
  // This also indirectly checks that the constructor calls `.link`.
  t.throws(() => new h.Ctx(`str`), TypeError, `expected instance of AbortSignal, got "str"`)
  t.throws(() => new h.Ctx({}), TypeError, `expected instance of AbortSignal, got instance of Object {}`)

  t.inst(new h.Ctx(), AbortController)
  t.inst(new h.Ctx().signal, AbortSignal)

  testCtxDeinit(val => val.abort())
  testCtxDeinit(val => val.deinit())

  t.test(function test_link() {
    t.throws(() => new h.Ctx().link(`str`), TypeError, `expected instance of AbortSignal, got "str"`)

    t.test(function test_pre_abort() {
      const abc = new AbortController()
      abc.abort()
      t.ok(abc.signal.aborted)

      const ctx = new h.Ctx()
      t.no(ctx.signal.aborted)

      t.is(ctx.link(abc.signal), ctx)
      t.ok(ctx.signal.aborted)
    })

    t.test(function test_post_abort() {
      const abc = new AbortController()
      t.no(abc.signal.aborted)

      const ctx = new h.Ctx()
      t.no(ctx.signal.aborted)

      t.is(ctx.link(abc.signal), ctx)
      t.no(ctx.signal.aborted)

      abc.abort()
      t.ok(abc.signal.aborted)
      t.ok(ctx.signal.aborted)
    })

    t.test(function test_replace() {
      const ctx = new h.Ctx()
      const abc0 = new AbortController()
      const abc1 = new AbortController()

      ctx.link(abc0.signal)
      ctx.link(abc1.signal)

      abc0.abort()
      t.ok(abc0.signal.aborted)
      t.no(ctx.signal.aborted)

      abc1.abort()
      t.ok(abc1.signal.aborted)
      t.ok(ctx.signal.aborted)
    })

    testCtxUnlink(val => val.link())
  })

  t.test(function test_unlink() {
    testCtxUnlink(val => val.unlink())
  })
})

function testCtxDeinit(fun) {
  const ctx = new h.Ctx()
  t.no(ctx.signal.aborted)

  fun(ctx)
  t.ok(ctx.signal.aborted)
}

function testCtxUnlink(fun) {
  const abc = new AbortController()
  const ctx = new h.Ctx()

  ctx.link(abc.signal)
  fun(ctx)

  abc.abort()
  t.ok(abc.signal.aborted)
  t.no(ctx.signal.aborted)
}

/*
Cookie names and values are allowed to contain whitespace, but not semicolons,
even in quotes. So we don't have to handle that case.
*/
t.test(function test_cookieSplitPairs() {
  function test(src, exp) {t.eq(h.cookieSplitPairs(src), exp)}

  test(``, [])
  test(`;`, [])
  test(`one; two`, [`one`, `two`])
  test(`one; two;`, [`one`, `two`])
  test(`one ; two ;`, [`one`, `two`])
  test(` one; two `, [`one`, `two`])
  test(` one; two; `, [`one`, `two`])
  test(` one=two; three=four; `, [`one=two`, `three=four`])
})

t.test(function test_cookieSplitPair() {
  t.throws(() => h.cookieSplitPair(), TypeError, `expected variant of isStr, got undefined`)
  t.throws(() => h.cookieSplitPair(``), TypeError, `unexpected empty cookie pair`)
  t.throws(() => h.cookieSplitPair(10), TypeError, `expected variant of isStr, got 10`)
  t.throws(() => h.cookieSplitPair(`;`), TypeError, `invalid cookie pair ";"`)

  function test(src, exp) {t.eq(h.cookieSplitPair(src), exp)}

  t.test(function test_only_value() {
    test(`one`, [``, `one`])
    test(`=one`, [``, `one`])
    test(`one two`, [``, `one two`])
    test(`=one two`, [``, `one two`])
  })

  t.test(function test_only_name() {
    test(`=`, [``, ``])
    test(`one=`, [`one`, ``])
    test(`one two=`, [`one two`, ``])
  })

  t.test(function test_both() {
    test(`one==`, [`one`, `=`])
    test(`one=two`, [`one`, `two`])
    test(` one = two `, [`one`, `two`])
    test(`one two=three`, [`one two`, `three`])
    test(`one two=three four`, [`one two`, `three four`])
    test(`one=two=three`, [`one`, `two=three`])
  })
})

t.test(function test_Cookie() {
  t.test(function test_invalid() {
    t.throws(() => h.cook().setName({}), TypeError, `expected variant of isCookieName, got {}`)
    t.throws(() => h.cook().setName(`=`), TypeError, `expected variant of isCookieName, got "="`)
    t.throws(() => h.cook().setName(`;`), TypeError, `expected variant of isCookieName, got ";"`)

    t.throws(() => h.cook().setValue({}), TypeError, `expected variant of isCookieValue, got {}`)
    t.throws(() => h.cook().setValue(`;`), TypeError, `expected variant of isCookieValue, got ";"`)

    t.throws(() => h.cook().setPath({}), TypeError, `expected variant of isCookieAttr, got {}`)
    t.throws(() => h.cook().setPath(`;`), TypeError, `expected variant of isCookieAttr, got ";"`)
    t.throws(() => h.cook().setPath(` `), TypeError, `expected variant of isCookieAttr, got " "`)

    t.throws(() => h.cook().setDomain({}), TypeError, `expected variant of isCookieAttr, got {}`)
    t.throws(() => h.cook().setDomain(`;`), TypeError, `expected variant of isCookieAttr, got ";"`)
    t.throws(() => h.cook().setDomain(` `), TypeError, `expected variant of isCookieAttr, got " "`)

    t.throws(() => h.cook().setExpires({}), TypeError, `expected variant of isValidDate, got {}`)
    t.throws(() => h.cook().setMaxAge({}), TypeError, `expected variant of isNat, got {}`)
    t.throws(() => h.cook().setSecure({}), TypeError, `expected variant of isBool, got {}`)
    t.throws(() => h.cook().setHttpOnly({}), TypeError, `expected variant of isBool, got {}`)

    t.throws(() => h.cook().setSameSite({}), TypeError, `expected variant of isCookieAttr, got {}`)
    t.throws(() => h.cook().setSameSite(`;`), TypeError, `expected variant of isCookieAttr, got ";"`)
    t.throws(() => h.cook().setSameSite(` `), TypeError, `expected variant of isCookieAttr, got " "`)
  })

  t.test(function test_toString() {
    testStr(h.cook(), ``)
    testStr(h.cook().setName(`one`), ``)
    testStr(h.cook().setName(`one`).setValue(), ``)
    testStr(h.cook().setName(`one`).setValue(``), `one=`)

    testStr(h.cook().lax(), ``)
    testStr(h.cook().expired(), ``)
    testStr(h.cook().durable(), ``)

    testStr(h.cook().setName(`one`).expired(), `one=; max-age=0`)

    const base = Object.freeze(h.cook().setName(`one`).setValue(`two`))

    testStr(base, `one=two`)
    testStr(base.clone().lax(), `one=two; same-site=lax`)
    testStr(base.clone().expired(), `one=two; max-age=0`)
    testStr(base.clone().durable(), `one=two; max-age=536112000`)
    testStr(base.clone().setExpires(new Date(0)), `one=two; expires=Thu, 01 Jan 1970 00:00:00 GMT`)
  })

  // Uses `cookieSplitPair` which is tested separately.
  // This is a sanity check.
  t.test(function test_fromPair() {
    t.throws(() => h.Cookie.fromPair(10), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => h.Cookie.fromPair(``), TypeError, `unexpected empty cookie pair`)
    t.throws(() => h.Cookie.fromPair(`;`), TypeError, `invalid cookie pair ";"`)

    t.eq(
      h.Cookie.fromPair(`one two=three four`),
      h.cook().setName(`one two`).setValue(`three four`),
    )
  })

  // Uses `cookieSplitPairs` and `.fromPair` which are tested separately.
  // This is a sanity check.
  t.test(function test_fromPairs() {
    t.eq(h.Cookie.fromPairs(``), [])
    t.eq(h.Cookie.fromPairs(`    `), [])

    t.eq(
      h.Cookie.fromPairs(`one=two`),
      [h.cook().setName(`one`).setValue(`two`)],
    )

    t.eq(
      h.Cookie.fromPairs(`one=two; three=four`),
      [
        h.cook().setName(`one`).setValue(`two`),
        h.cook().setName(`three`).setValue(`four`),
      ],
    )
  })
})

if (import.meta.main) console.log(`[test] ok!`)
