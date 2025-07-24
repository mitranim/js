import * as iti from './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as h from '../http.mjs'
import * as u from '../url.mjs'

/* Util */

/*
Used to begin with `scheme://user:pass@host:123`, but some newer JS
environments, including Chrome, refuse to construct a request with
username and password in the URL, presumably for security reasons.
*/
const URL_LONG = `scheme://host:123/path?key=val#hash`

function mockReq() {return new Request(URL_LONG, {method: h.POST})}
function mockReqRou() {return new h.ReqRou(mockReq())}
function simpleReq(url, meth) {return new Request(url, {method: meth})}

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

function testStr(src, exp) {t.is(src.toString(), exp)}

/* Test */

t.test(function test_GET() {t.is(h.GET, `GET`)})
t.test(function test_HEAD() {t.is(h.HEAD, `HEAD`)})
t.test(function test_OPTIONS() {t.is(h.OPTIONS, `OPTIONS`)})
t.test(function test_POST() {t.is(h.POST, `POST`)})
t.test(function test_PUT() {t.is(h.PUT, `PUT`)})
t.test(function test_PATCH() {t.is(h.PATCH, `PATCH`)})
t.test(function test_DELETE() {t.is(h.DELETE, `DELETE`)})
t.test(function test_HEADER_NAME_CONTENT_TYPE() {t.is(h.HEADER_NAME_CONTENT_TYPE, `content-type`)})
t.test(function test_MIME_TYPE_HTML() {t.is(h.MIME_TYPE_HTML, `text/html`)})
t.test(function test_MIME_TYPE_JSON() {t.is(h.MIME_TYPE_JSON, `application/json`)})
t.test(function test_MIME_TYPE_FORM() {t.is(h.MIME_TYPE_FORM, `application/x-www-form-urlencoded`)})
t.test(function test_MIME_TYPE_MULTI() {t.is(h.MIME_TYPE_MULTI, `multipart/form-data`)})

await t.test(async function test_resOk() {
  async function test(res, exp) {
    t.is(await h.resOk(res), res)
    t.is(await h.resOk(Promise.resolve(res)), res)
    t.is(await res.text(), exp)
  }

  async function fail(res, exp) {
    await t.throws(async () => h.resOk(res), h.ErrHttp, exp)
  }

  await test(new Response(), ``)
  await test(new Response(undefined, {status: 200}), ``)
  await test(new Response(`text`), `text`)
  await test(new Response(`text`, {status: 200}), `text`)

  await fail(new Response(undefined, {status: 301}), `unknown fetch error`)
  await fail(new Response(undefined, {status: 400}), `unknown fetch error`)
  await fail(new Response(undefined, {status: 500}), `unknown fetch error`)
  await fail(new Response(`text`, {status: 301}), `text`)
  await fail(new Response(`text`, {status: 400}), `text`)
  await fail(new Response(`text`, {status: 500}), `text`)
})

t.test(function test_jsonDecode() {
  t.throws(() => h.jsonDecode(10), TypeError, `expected variant of isStr, got 10`)
  t.throws(() => h.jsonDecode(`blah`), SyntaxError, `Unexpected`)

  t.is(h.jsonDecode(), undefined)
  t.is(h.jsonDecode(undefined), undefined)
  t.is(h.jsonDecode(null), undefined)
  t.is(h.jsonDecode(``), undefined)
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

t.test(function test_ErrHttp() {
  t.throws(() => new h.ErrHttp(10, 20), TypeError, `expected variant of isStr, got 10`)
  t.throws(() => new h.ErrHttp(``, `str`), TypeError, `expected variant of isNat, got "str"`)
  t.throws(() => new h.ErrHttp(``, 0, `str`), TypeError, `expected instance of Response, got "str"`)

  t.is(new h.ErrHttp(``, 0).name, `ErrHttp`)
  t.is(new h.ErrHttp(`one`, 0).message, `one`)
  t.is(new h.ErrHttp(`one`, 20).message, `20: one`)
})

t.test(function test_getStatus() {
  t.is(h.getStatus(), undefined)
  t.is(h.getStatus(Error()), undefined)
  t.is(h.getStatus(new h.ErrHttp(``, 0)), 0)
  t.is(h.getStatus(new h.ErrHttp(``, 400)), 400)
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

  t.no(h.hasStatus(new h.ErrHttp(``, 0), 400))
  t.no(h.hasStatus(new Response(``, {status: 200}), 400))

  t.ok(h.hasStatus(new h.ErrHttp(``, 400), 400))
  t.ok(h.hasStatus(new Response(``, {status: 400}), 400))
})

t.test(function test_Rou() {
  t.test(function test_constructor() {
    t.test(function test_invalid() {
      t.throws(() => new h.Rou(10), TypeError, `unable to convert 10 to Url`)
      t.throws(() => new h.Rou({}), TypeError, `unable to convert {} to Url`)
      t.throws(() => new h.Rou([]), TypeError, `unable to convert [] to Url`)
    })

    t.own(new h.Rou(URL_LONG), {url: u.url(URL_LONG), groups: undefined})
    t.own(new h.Rou(), {url: u.url(), groups: undefined})
  })

  t.test(function test_pat() {
    const rou = new h.Rou(URL_LONG)

    t.test(function test_invalid() {
      t.throws(() => rou.pat({}), TypeError, `unable to convert {} to pattern`)
    })

    t.test(function test_none() {
      function test(val) {
        t.no(val)
        t.eq(rou.groups, undefined)
      }

      test(rou.pat(`path`))
      test(rou.pat(`/path/`))
      test(rou.pat(`path/`))
      test(rou.pat(`/pat`))
      test(rou.pat(/path[/]/))
      test(rou.pat(/path_other/))
    })

    t.test(function test_some() {
      function test(val, exp) {
        t.ok(val)
        t.eq(rou.groups, exp)
      }

      test(rou.pat(), undefined)
      test(rou.pat(`/path`), undefined)
      test(rou.pat(/^[/](?<val>path)$/), {val: `path`})
    })
  })
})

t.test(function test_ReqRou() {
  t.test(function test_constructor() {
    t.test(function test_invalid() {
      t.throws(() => new h.ReqRou(), TypeError, `expected instance of Request, got undefined`)
      t.throws(() => new h.ReqRou(10), TypeError, `expected instance of Request, got 10`)
      t.throws(() => new h.ReqRou(`str`), TypeError, `expected instance of Request, got "str"`)
      t.throws(() => new h.ReqRou(URL_LONG), TypeError, `expected instance of Request, got ${l.show(URL_LONG)}`)
      t.throws(() => new h.ReqRou({}), TypeError, `expected instance of Request, got instance of Object {}`)
      t.throws(() => new h.ReqRou([]), TypeError, `expected instance of Request, got instance of Array []`)
    })

    const req = mockReq()
    const rou = new h.ReqRou(req)

    t.is(rou.req, req)
    t.own(rou, {req, url: u.url(URL_LONG), groups: undefined})
  })

  t.test(function test_method() {
    const rou = mockReqRou()

    t.throws(() => rou.method(), TypeError, `expected variant of isMethod, got undefined`)
    t.throws(() => rou.method({}), TypeError, `expected variant of isMethod, got {}`)

    t.no(rou.method(h.GET))
    t.no(rou.method(h.HEAD))

    t.ok(rou.method(h.POST))
  })

  t.test(function test_preflight() {
    t.no(new h.ReqRou(simpleReq(URL_LONG, h.GET)).preflight())
    t.no(new h.ReqRou(simpleReq(URL_LONG, h.POST)).preflight())

    t.ok(new h.ReqRou(simpleReq(URL_LONG, h.HEAD)).preflight())
    t.ok(new h.ReqRou(simpleReq(URL_LONG, h.OPTIONS)).preflight())
  })

  t.test(function test_match() {
    const rou = mockReqRou()

    t.test(function test_invalid() {
      t.throws(() => rou.match(undefined, /(?:)/), TypeError, `expected variant of isMethod, got undefined`)
      t.throws(() => rou.match(h.POST, {}), TypeError, `unable to convert {} to pattern`)
    })

    t.test(function test_none() {
      function test(val) {
        t.no(val)
        t.is(rou.groups, undefined)
      }

      test(rou.match(h.GET))
      test(rou.match(h.GET, `/path`))
      test(rou.match(h.GET, /(?:)/))

      test(rou.match(h.POST, `/pat`))
      test(rou.match(h.POST, /path_other/))
    })

    t.test(function test_some() {
      function test(val, exp) {
        t.ok(val)
        t.eq(rou.groups, exp)
      }

      test(rou.match(h.POST), undefined)
      test(rou.match(h.POST, `/path`), undefined)
      test(rou.match(h.POST, /^[/](?<val>path)$/), {val: `path`})
      test(rou.match(h.POST, `/path`), undefined)
      test(rou.match(h.POST, /^[/]path$/), undefined)
      test(rou.match(h.POST, /^[/](?<key>path)$/), {key: `path`})
    })
  })

  // TODO test async fallback.
  t.test(function test_found() {
    const rou = mockReqRou()

    t.test(function test_invalid() {
      t.throws(() => rou.found(), TypeError, `expected variant of isFun, got undefined`)
      t.throws(() => rou.found(10), TypeError, `expected variant of isFun, got 10`)
    })

    testRes(rou.found(l.nop), {status: 404})
    testRes(rou.found(() => new Response(``, {status: 400})), {status: 400})
  })
})

/*
TODO:
- Test GC-based cleanup. When child context is GC-d, event listener must be
  removed from parent signal.
*/
await t.test(async function test_Ctx() {
  t.throws(() => new h.Ctx(`str`), TypeError, `expected instance of AbortSignal, got "str"`)
  t.throws(() => new h.Ctx({}), TypeError, `expected instance of AbortSignal, got instance of Object {}`)

  t.inst(new h.Ctx(), AbortController)
  t.inst(new h.Ctx().signal, AbortSignal)

  testCtxDeinit(val => val.abort())
  testCtxDeinit(val => val.deinit())

  t.test(function test_pre_abort() {
    const abc = new AbortController()
    abc.abort()
    t.ok(abc.signal.aborted)

    const ctx = new h.Ctx(abc.signal)
    t.ok(ctx.signal.aborted)
    t.is(ctx.signal.reason, abc.signal.reason)
  })

  t.test(function test_post_abort() {
    const abc = new AbortController()
    t.no(abc.signal.aborted)

    const ctx = new h.Ctx(abc.signal)
    t.no(ctx.signal.aborted)

    abc.abort()
    t.ok(abc.signal.aborted)
    t.ok(ctx.signal.aborted)
    t.is(ctx.signal.reason, abc.signal.reason)
  })

  t.test(function test_deinit_idempotency() {
    const ctx = new h.Ctx()
    t.no(ctx.signal.aborted)

    ctx.deinit()
    t.ok(ctx.signal.aborted)

    ctx.deinit()
    t.ok(ctx.signal.aborted)

    ctx.deinit()
    t.ok(ctx.signal.aborted)
  })

  if (!iti.gc) return

  await t.test(async function test_gc_cleanup() {
    const abc = new AbortController()

    class Ctx extends h.Ctx {
      abort() {throw Error(`unreachable`)}
      deinit() {throw Error(`unreachable`)}
    }

    let ctx = new Ctx(abc.signal)
    l.nop(ctx) // Shut up linters.
    ctx = undefined
    await iti.waitForGcAndFinalizers()

    // If GC finalization doesn't work, this will abort the child context,
    // which will immediately throw an "unreachable" error.
    abc.abort()
  })
})

function testCtxDeinit(fun) {
  const ctx = new h.Ctx()
  t.no(ctx.signal.aborted)
  t.is(ctx.signal.reason, undefined)

  fun(ctx)
  t.ok(ctx.signal.aborted)
  t.inst(ctx.signal.reason, h.AbortError)
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

    testStr(h.cook().setName(``), ``)
    testStr(h.cook().setName(``).setValue(), ``)
    testStr(h.cook().setName(``).setValue(``), `=`)
    testStr(h.cook().setName(``).setValue(`one`), `=one`)

    testStr(h.cook().setName(`one`), ``)
    testStr(h.cook().setName(`one`).setValue(), ``)
    testStr(h.cook().setName(`one`).setValue(``), `one=`)
    testStr(h.cook().setName(`one`).setValue(`two`), `one=two`)

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
  t.test(function test_setPair() {
    t.throws(() => h.cook().setPair(10), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => h.cook().setPair(``), TypeError, `unexpected empty cookie pair`)
    t.throws(() => h.cook().setPair(`;`), TypeError, `invalid cookie pair ";"`)

    t.eq(
      h.cook().setPair(`one two=three four`),
      h.cook().setName(`one two`).setValue(`three four`),
    )
  })

  t.test(function test_make() {
    t.eq(h.Cookie.make(), new h.Cookie())

    t.eq(h.Cookie.make().root(), new h.Cookie().root())

    t.eq(h.Cookie.make(`one`), new h.Cookie().setName(`one`))

    t.eq(
      h.Cookie.make(`one`).root(),
      new h.Cookie().setName(`one`).root(),
    )

    t.eq(
      h.Cookie.make(`one`, `two`),
      new h.Cookie().setName(`one`).setValue(`two`),
    )
  })
})

// TODO more comprehensive test.
t.test(function test_Cookies() {
  function test(src, exp) {
    t.is(new h.Cookies(src).toString(), exp)
  }

  test(``, ``)
  test(`one`, `=one`)
  test(`=one`, `=one`)
  test(`one=`, `one=`)
  test(`one=two`, `one=two`)
  test(`one=two; three=four`, `one=two; three=four`)

  // In case of cookie name collision, the last one is preferred.
  test(`one=two; one=three`, `one=three`)
  test(`one=two; one=three; four=five`, `one=three; four=five`)
  test(`one; =two; three=`, `=two; three=`)
})

if (import.meta.main) console.log(`[test] ok!`)
