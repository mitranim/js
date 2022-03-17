import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as u from '../url.mjs'

const LONG = `scheme://user:pass@host:123/path?key=val#hash`

t.test(function test_query() {l.reqInst(u.query(), u.Query)})

t.test(function test_toQuery() {
  function same(val) {
    l.reqInst(val, u.Query)
    t.is(u.toQuery(val), val)
  }

  function make(src) {
    const out = u.toQuery(src)
    l.reqInst(out, u.Query)
    t.isnt(out, src)
    t.is(u.query(src).toString(), u.query(out).toString())
  }

  make(undefined)
  make(``)
  make(`one=two`)

  same(u.query())
  same(u.query(`one=two`))
})

t.test(function test_url() {l.reqInst(u.url(), u.Url)})

t.test(function test_toUrl() {
  function same(val) {
    l.reqInst(val, u.Url)
    t.is(u.toUrl(val), val)
  }

  function make(src) {
    const out = u.toUrl(src)
    l.reqInst(out, u.Url)
    t.isnt(out, src)
    t.is(u.url(src).toString(), u.url(out).toString())
  }

  make(undefined)
  make(``)
  make(`/one?two=three#four`)

  same(u.url())
  same(u.url(`/one?two=three#four`))
})

t.test(function test_urlJoin() {
  l.reqInst(u.urlJoin(), u.Url)

  testStr(u.urlJoin(), ``)
  testStr(u.urlJoin(`one`), `one`)
  testStr(u.urlJoin(`one`, `two`), `one/two`)
  testStr(u.urlJoin(`/one`, `two`), `/one/two`)
  testStr(u.urlJoin(`/one?two=three#four`, `five`, `six`), `/one/five/six?two=three#four`)
  testStr(u.urlJoin(`./one?two=three#four`, `five`, `six`), `./one/five/six?two=three#four`)
  testStr(u.urlJoin(`../one?two=three#four`, `five`, `six`), `../one/five/six?two=three#four`)
  testStr(u.urlJoin(`../one/two?three=four#five`, `six`), `../one/two/six?three=four#five`)
})

t.test(function test_Query() {
  t.test(function test_decoding() {
    function test(src, exp) {t.eq(u.query(src), exp)}
    function empty(src) {test(src, u.query())}

    empty(undefined)
    empty(null)
    empty(``)
    empty(`?`)

    test(`one=two`, u.query({one: `two`}))
    test(`?one=two`, u.query({one: [`two`]}))

    test(
      `one=two&one=three&four=five&five=six&seven=eight&nine=ten&nine=eleven`,
      u.query({
        one: [`two`, `three`],
        four: `five`,
        five: [`six`],
        seven: `eight`,
        nine: [`ten`, `eleven`],
      })
    )

    t.test(function test_decoding_plus() {
      test(
        `one+two=three+four++five`,
        u.query({'one two': `three four  five`}),
      )
    })

    t.test(function test_decoding_unicode() {
      test(
        `?one=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`,
        u.query({one: [`🙂😁😛`]}),
      )
    })
  })

  t.test(function test_encoding() {
    function test(src, exp) {testStr(u.query(src), exp)}

    function same(src) {test(src, src)}

    same(``)
    same(`one=two`)
    same(`one=two&three=four`)
    same(`one=two&one=three&four=five&five=six&seven=eight&nine=ten&nine=eleven`)

    test(`?`, ``)
    test(`??`, ``)
    test(`??one=two`, `one=two`)

    t.test(function test_encoding_date() {
      const val = new Date(1024)
      testStr(u.query().append(`key`, val), `key=1970-01-01T00%3A00%3A01.024Z`)
      testStr(u.query({key: val}), `key=1970-01-01T00%3A00%3A01.024Z`)
      testStr(u.query([[`key`, val]]), `key=1970-01-01T00%3A00%3A01.024Z`)
    })

    t.test(function test_encoding_plus() {
      testStr(
        u.query().append(`one two`, `three four  five`),
        `one+two=three+four++five`,
      )
    })

    t.test(function test_encoding_unicode() {
      testStr(
        u.query().append(`one`, `🙂😁😛`),
        `one=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`,
      )
    })
  })

  t.test(function test_toStringFull() {
    t.is(u.query().toStringFull(), ``)
    t.is(u.query(`one=two`).toStringFull(), `?one=two`)
  })

  t.test(function test_reset_from_str() {
    testSearchResetWith(l.id)
  })

  t.test(function test_mut_from_str() {
    testSearchMutWith(l.id)
  })

  t.test(function test_reset_from_Query() {
    testSearchResetWith(u.query)
  })

  t.test(function test_mut_from_Query() {
    testSearchMutWith(u.query)
  })

  t.test(function test_reset_from_URLSearchParams() {
    testSearchResetWith(function parse(src) {return new URLSearchParams(src)})
  })

  t.test(function test_mut_from_URLSearchParams() {
    testSearchMutWith(function parse(src) {return new URLSearchParams(src)})
  })

  t.test(function test_toURLSearchParams() {
    function test(str) {
      const src = u.query(str)
      const out = src.toURLSearchParams()
      const exp = new URLSearchParams(str)

      t.is(src.toString(), exp.toString())
      t.is(out.toString(), exp.toString())
      t.eq(out, exp)
      t.eq([...out], [...exp])
    }

    test(``)
    test(`one=two&one=three&two=four&two=five`)
    test(`one+two=three+four++five`)
    test(`%F0%9F%99%82=%F0%9F%98%81`)
  })

  t.test(function test_keys() {
    function test(src, exp) {t.eq([...src.keys()], exp)}

    test(u.query(), [])

    test(
      u.query(`one=two&one=three&four=five&four=six&seven=eight`),
      [`one`, `four`, `seven`],
    )

    test(
      u.query().set(`one two`, `three four  five`),
      [`one two`],
    )

    test(
      u.query(`%F0%9F%99%82=%F0%9F%98%81`),
      [`🙂`],
    )

    // For comparison.
    t.eq(
      [...new URLSearchParams(`one=two&one=three&four=five&four=six&seven=eight`).keys()],
      [`one`, `one`, `four`, `four`, `seven`],
    )
  })

  t.test(function test_values() {
    function test(src, exp) {t.eq([...src.values()], exp)}

    test(u.query(), [])

    test(
      u.query(`one=two&one=three&four=five&four=six&seven=eight`),
      [[`two`, `three`], [`five`, `six`], [`eight`]],
    )

    test(
      u.query().set(`one two`, `three four  five`),
      [[`three four  five`]],
    )

    test(
      u.query(`%F0%9F%99%82=%F0%9F%98%81`),
      [[`😁`]],
    )

    // For comparison.
    t.eq(
      [...new URLSearchParams(`one=two&one=three&four=five&four=six&seven=eight`).values()],
      [`two`, `three`, `five`, `six`, `eight`],
    )
  })

  t.test(function test_entries() {
    function test(src, exp) {t.eq([...src.entries()], exp)}

    test(u.query(), [])

    test(
      u.query(`one=two&one=three&four=five&four=six&seven=eight`),
      [[`one`, [`two`, `three`]], [`four`, [`five`, `six`]], [`seven`, [`eight`]]],
    )

    test(
      u.query().set(`one two`, `three four  five`),
      [[`one two`, [`three four  five`]]],
    )

    test(
      u.query(`%F0%9F%99%82=%F0%9F%98%81`),
      [[`🙂`, [`😁`]]],
    )

    // For comparison.
    t.eq(
      [...new URLSearchParams(`one=two&one=three&four=five&four=six&seven=eight`).entries()],
      [[`one`, `two`], [`one`, `three`], [`four`, `five`], [`four`, `six`], [`seven`, `eight`]],
    )
  })

  t.test(function test_toJSON() {
    t.is(u.query().toJSON(), null)
    t.is(u.query(``).toJSON(), null)
    t.is(u.query(`?`).toJSON(), null)
    t.is(u.query(`one=two`).toJSON(), `one=two`)
  })
})

function testSearchResetWith(fun) {
  testReset(u.query(),          fun(),                      ``)
  testReset(u.query(),          fun(``),                    ``)
  testReset(u.query(),          fun(`one=two`),             `one=two`)
  testReset(u.query(`one=two`), fun(`one=three`),           `one=three`)
  testReset(u.query(`one=two`), fun(`three=four`),          `three=four`)
  testReset(u.query(`one=two`), fun(`three=four&five=six`), `three=four&five=six`)
}

function testSearchMutWith(fun) {
  testMut(u.query(),          fun(),                      ``)
  testMut(u.query(),          fun(``),                    ``)
  testMut(u.query(),          fun(`one=two`),             `one=two`)
  testMut(u.query(`one=two`), fun(`one=three`),           `one=two&one=three`)
  testMut(u.query(`one=two`), fun(`three=four`),          `one=two&three=four`)
  testMut(u.query(`one=two`), fun(`three=four&five=six`), `one=two&three=four&five=six`)
}

/*
TODO more tests for IPv4.
TODO more tests for IPv6.
*/
t.test(function test_Url() {
  t.test(function test_structure() {
    t.eq(
      new u.Url(`one://two:three@four.five:123/six?seven=eight#nine`),
      Object.assign(Object.create(u.Url.prototype), {
        [u.schemeKey]: `one`,
        [u.slashKey]: `//`,
        [u.usernameKey]: `two`,
        [u.passwordKey]: `three`,
        [u.hostnameKey]: `four.five`,
        [u.portKey]: `123`,
        [u.pathnameKey]: `/six`,
        [u.queryKey]: `seven=eight`,
        [u.hashKey]: `nine`,
      }),
    )
  })

  t.test(function test_scheme() {
    t.throws(() => u.url().scheme = 10, TypeError, `unable to convert 10 to scheme`)
    t.throws(() => u.url().scheme = `https:`, SyntaxError, `unable to convert "https:" to scheme`)
    t.throws(() => u.url().scheme = `https://`, SyntaxError, `unable to convert "https://" to scheme`)
    t.throws(() => u.url().scheme = `one two`, SyntaxError, `unable to convert "one two" to scheme`)

    function test(src, exp) {t.is(u.url(src).scheme, exp)}

    test(``, ``)
    test(`one:`, `one`)
    test(`one:two`, `one`)
    test(`one:two/three`, `one`)
    test(`one:/two/three`, `one`)
    test(`one://two/three`, `one`)
    test(`one://two.three`, `one`)
    test(`one://two.three/four`, `one`)
  })

  // TODO validate that username and password get updated.
  t.test(function test_setScheme() {
    function test(src, val, exp) {testStr(u.url(src).setScheme(val), exp)}

    test(``, ``, ``)
    test(`scheme:path`, ``, `path`)
    test(`scheme://host`, ``, ``)
    test(`scheme://host/path`, ``, `/path`)
    test(`scheme://host/path?key=val#hash`, ``, `/path?key=val#hash`)

    test(``,              `scheme`, `scheme:`)
    test(`scheme:path`,   `mailto`, `mailto:path`)
    test(`scheme://host`, `https`,  `https://host`)
  })

  t.test(function test_slash() {
    t.throws(() => u.url().slash = 10, TypeError, `unable to convert 10 to slash`)
    t.throws(() => u.url().slash = `str`, SyntaxError, `unable to convert "str" to slash`)

    function test(src, exp) {t.is(u.url(src).slash, exp)}

    test(``, ``)
    test(`one:`, ``)
    test(`one:two`, ``)
    test(`one:/two`, ``)
    test(`one://two`, `//`)
  })

  // TODO validate that username and password get updated.
  t.test(function test_setSlash() {
    function test(src, val, exp) {testStr(u.url(src).setSlash(val), exp)}

    test(``,          ``,    ``)
    test(``,          `/`,   `/`)
    test(``,          `//`,  `//`)
    test(``,          `///`, `///`)
    test(`one:two`,   `//`,  `one://two`)
    test(`one:/two`,  `/`,   `one://two`)
    test(`one:/two`,  `//`,  `one:///two`)
    test(`one:/two`,  ``,    `one:/two`)

    test(`scheme:val`, `//`, `scheme://val`)

    // For the most part, we don't support or allow this.
    // TODO consider avoiding.
    test(`/path`, `//`, `///path`)

    test(`scheme://`, ``, `scheme:`)
    test(`scheme://host`, ``, `scheme:`)
    test(`scheme://host/path`, ``, `scheme:/path`)
    test(`scheme://host/path?key=val#hash`, ``, `scheme:/path?key=val#hash`)
  })

  t.test(function test_username() {
    t.throws(() => u.url().username = 10, TypeError, `unable to convert 10 to username`)
    t.throws(() => u.url().username = `/`, SyntaxError, `unable to convert "/" to username`)
    t.throws(() => u.url().username = `user`, SyntaxError, `username is forbidden in URL without protocol double slash`)

    {
      const url = u.url(`scheme:path`)
      t.throws(() => url.username = `user`, SyntaxError, `username is forbidden in URL without protocol double slash`)
    }

    function test(src, exp) {t.is(u.url(src).username, exp)}
    testEmpty(test)

    // User info is allowed only after scheme with //.
    test(`scheme:nonuser:nonpass@nondomain`, ``)
    test(`scheme:nonuser:@nondomain`, ``)
    test(`scheme::nonpass@nondomain`, ``)

    test(`scheme://domain`, ``)
    test(`scheme://@domain`, ``)
    test(`scheme://user:pass@domain`, `user`)
    test(`scheme://user:@domain`, `user`)
    test(`scheme://:pass@domain`, ``)
  })

  t.test(function test_setUsername() {
    function test(src, val, exp) {testStr(u.url(src).setUsername(val), exp)}

    test(``, ``, ``)
    test(`scheme://@domain`, ``, `scheme://domain`)
    test(`scheme://user@domain`, ``, `scheme://domain`)
    test(`scheme://:pass@domain`, ``, `scheme://:pass@domain`)
    test(`scheme://user:pass@domain`, ``, `scheme://:pass@domain`)
    test(`scheme://domain`, `user`, `scheme://user@domain`)
    test(`scheme://user@domain`, `username`, `scheme://username@domain`)
    test(`scheme://:pass@domain`, `user`, `scheme://user:pass@domain`)
    test(`scheme://user:pass@domain`, `username`, `scheme://username:pass@domain`)
  })

  t.test(function test_password() {
    t.throws(() => u.url().password = 10, TypeError, `unable to convert 10 to password`)
    t.throws(() => u.url().password = `/`, SyntaxError, `unable to convert "/" to password`)
    t.throws(() => u.url().password = `pass`, SyntaxError, `password is forbidden in URL without protocol double slash`)

    {
      const url = u.url(`scheme:path`)
      t.throws(() => url.password = `pass`, SyntaxError, `password is forbidden in URL without protocol double slash`)
    }

    function test(src, exp) {t.is(u.url(src).password, exp)}
    testEmpty(test)

    // User info is allowed only after scheme with //.
    test(`scheme:nonuser:nonpass@nondomain`, ``)
    test(`scheme:nonuser:@nondomain`, ``)
    test(`scheme::nonpass@nondomain`, ``)

    test(`scheme://domain`, ``)
    test(`scheme://@domain`, ``)
    test(`scheme://user:pass@domain`, `pass`)
    test(`scheme://user:@domain`, ``)
    test(`scheme://:pass@domain`, `pass`)
  })

  t.test(function test_setPassword() {
    function test(src, val, exp) {testStr(u.url(src).setPassword(val), exp)}

    test(``, ``, ``)
    test(`scheme://@domain`, ``, `scheme://domain`)
    test(`scheme://user@domain`, ``, `scheme://user@domain`)
    test(`scheme://:pass@domain`, ``, `scheme://domain`)
    test(`scheme://user:pass@domain`, ``, `scheme://user@domain`)
    test(`scheme://domain`, `pass`, `scheme://:pass@domain`)
    test(`scheme://user@domain`, `pass`, `scheme://user:pass@domain`)
    test(`scheme://:pass@domain`, `password`, `scheme://:password@domain`)
    test(`scheme://user:pass@domain`, `password`, `scheme://user:password@domain`)
  })

  t.test(function test_hostname() {
    t.throws(() => u.url().hostname = `/`, SyntaxError, `unable to convert "/" to hostname`)
    t.throws(() => u.url().hostname = `?`, SyntaxError, `unable to convert "?" to hostname`)
    t.throws(() => u.url().hostname = `#`, SyntaxError, `unable to convert "#" to hostname`)
    t.throws(() => u.url().hostname = `one/two`, SyntaxError, `unable to convert "one/two" to hostname`)
    t.throws(() => u.url().hostname = `one?two`, SyntaxError, `unable to convert "one?two" to hostname`)
    t.throws(() => u.url().hostname = `one#two`, SyntaxError, `unable to convert "one#two" to hostname`)
    t.throws(() => u.url().hostname = `one two`, SyntaxError, `unable to convert "one two" to hostname`)
    t.throws(() => u.url().hostname = `one`, SyntaxError, `hostname is forbidden in URL without protocol double slash`)

    {
      const url = u.url(`scheme:path`)
      t.throws(() => url.hostname = `one`, SyntaxError, `hostname is forbidden in URL without protocol double slash`)
    }

    function test(src, exp) {t.is(u.url(src).hostname, exp)}
    testEmpty(test)

    test(`one:two`, ``)
    test(`one:two.three`, ``)
    test(`one:two.three.four`, ``)

    test(`one://two`, `two`)
    test(`one://two.three`, `two.three`)
    test(`one://two.three.four`, `two.three.four`)

    test(`http://1.2.3.4:5678`, `1.2.3.4`)
    test(`http://12.23.34.45:5678`, `12.23.34.45`)
    test(`http://[::1]:1234`, `[::1]`)
    test(`http://[2001:0db8:0000:0000:0000:8a2e:0370:7334]:1234`, `[2001:0db8:0000:0000:0000:8a2e:0370:7334]`)
    test(`http://[2001:db8::8a2e:370:7334]:1234`, `[2001:db8::8a2e:370:7334]`)
  })

  t.test(function test_setHostname() {
    function test(src, val, exp) {testStr(u.url(src).setHostname(val), exp)}

    test(``, ``, ``)
    test(`scheme:path`, ``, `scheme:path`)
    test(`scheme://host`, ``, `scheme://`)
    test(`scheme://host:123`, ``, `scheme://`)
    test(`scheme://host:123/path`, ``, `scheme:///path`)
    test(`scheme://host`, `hostname`, `scheme://hostname`)
    test(`scheme://host/path`, `hostname`, `scheme://hostname/path`)
    test(`scheme://host:123`, `hostname`, `scheme://hostname:123`)
    test(`scheme://host:123/path`, `hostname`, `scheme://hostname:123/path`)
  })

  t.test(function test_port() {
    t.throws(() => u.url().port = `/`, SyntaxError, `unable to convert "/" to port`)
    t.throws(() => u.url().port = `123`, SyntaxError, `port is forbidden in URL without protocol double slash`)

    function test(src, exp) {t.is(u.url(src).port, exp)}
    testEmpty(test)

    test(`scheme:one@two.three:123`, ``)

    test(`scheme://host`, ``)
    test(`scheme://host/path`, ``)
    test(`scheme://host:123`, `123`)
    test(`scheme://one.two:123`, `123`)
    test(`scheme://one.two.three:123`, `123`)
  })

  t.test(function test_setPort() {
    function test(src, val, exp) {testStr(u.url(src).setPort(val), exp)}

    test(``, ``, ``)
    test(`scheme:path`, ``, `scheme:path`)
    test(`scheme://host`, ``, `scheme://host`)
    test(`scheme://host:123`, ``, `scheme://host`)
    test(`scheme://host`, `234`, `scheme://host:234`)
    test(`scheme://host:123`, `234`, `scheme://host:234`)
    test(`scheme://host`, 0, `scheme://host:0`)
    test(`scheme://host:123`, 0, `scheme://host:0`)
    test(`scheme://host`, 234, `scheme://host:234`)
    test(`scheme://host:123`, 234, `scheme://host:234`)
  })

  t.test(function test_pathname() {
    t.throws(() => u.url().pathname = `?`, SyntaxError, `unable to convert "?" to pathname`)
    t.throws(() => u.url().pathname = `#`, SyntaxError, `unable to convert "#" to pathname`)
    t.throws(() => u.url().pathname = `one?two`, SyntaxError, `unable to convert "one?two" to pathname`)
    t.throws(() => u.url().pathname = `one#two`, SyntaxError, `unable to convert "one#two" to pathname`)
    t.throws(() => u.url().pathname = `one two`, SyntaxError, `unable to convert "one two" to pathname`)

    function test(src, exp) {t.is(u.url(src).pathname, exp)}
    testEmpty(test)

    test(undefined, ``)
    test(null, ``)
    test(``, ``)

    test(`one:`, ``)
    test(`one:two`, `two`)
    test(`one:two.three`, `two.three`)
    test(`one:two.three.four`, `two.three.four`)

    test(`scheme:`, ``)
    test(`scheme:one@two.three`, `one@two.three`)
    test(`scheme:nonuser:nonpass@nondomain`, `nonuser:nonpass@nondomain`)
    test(`scheme:nonuser:nonpass@nondomain?key=val#hash`, `nonuser:nonpass@nondomain`)

    test(`scheme://user:pass@domain/path?key=val#hash`, `/path`)
    test(`scheme://user:pass@domain/?key=val#hash`, `/`)
    test(`scheme://user:pass@domain?key=val#hash`, ``)

    test(`./one`, `./one`)
    test(`../one`, `../one`)
    test(`one/../two`, `one/../two`)
    test(`/one/../two`, `/one/../two`)
    test(`./one/../two`, `./one/../two`)
    test(`../one/../two`, `../one/../two`)

    test(`scheme://user:pass@domain/../one`, `/../one`)
    test(`scheme://user:pass@domain/one/../two`, `/one/../two`)
  })

  t.test(function test_setPathname() {
    function test(src, val, exp) {testStr(u.url(src).setPathname(val), exp)}

    test(``, ``, ``)
    test(``, `path`, `path`)
    test(``, `/path`, `/path`)
    test(`scheme:path`, ``, `scheme:`)
    test(`scheme:`, `path`, `scheme:path`)
    test(`scheme:`, `/path`, `scheme:/path`)
    test(`scheme://`, `path`, `scheme://path`)
    test(`scheme://`, `/path`, `scheme:///path`)
    test(`scheme://host`, `path`, `scheme://host/path`)
    test(`scheme://host`, `/path`, `scheme://host/path`)
    test(`scheme://host/path`, `pathname`, `scheme://host/pathname`)
    test(`scheme://host/path`, `/pathname`, `scheme://host/pathname`)
    test(`scheme://host:123/path`, `/pathname`, `scheme://host:123/pathname`)
    test(`scheme://host/path?search#hash`, `/pathname`, `scheme://host/pathname?search#hash`)
  })

  t.test(function test_search() {
    t.throws(() => u.url().search = `#`, SyntaxError, `unable to convert "#" to Query`)
    t.throws(() => u.url().search = `one#two`, SyntaxError, `unable to convert "one#two" to Query`)
    t.throws(() => u.url().search = 10, TypeError, `expected variant of isStr, got 10`)
    t.throws(() => u.url().search = u.query(), TypeError, `expected variant of isStr, got [object Query]`)
    t.throws(() => u.url().search = u.url(), TypeError, `expected variant of isStr, got [object Url]`)
    t.throws(() => u.url().search = {key: `val`}, TypeError, `expected variant of isStr, got {"key":"val"}`)

    function test(src, exp) {t.is(u.url(src).search, exp)}

    testUrlSearchGet(test)
    test(`scheme://?one=two?three`, `one=two?three`)
    test(`scheme://host/path?one=two?three`, `one=two?three`)
    test(`scheme://host/path?one=two?three#four`, `one=two?three`)
    test(`scheme://host/path?one=two?three#four?five`, `one=two?three`)
    test(`scheme://host/path?one=two?three#four?five#six`, `one=two?three`)
  })

  t.test(function test_setSearch() {
    t.throws(() => u.url().setSearch(10), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => u.url().setSearch(u.query()), TypeError, `expected variant of isStr, got [object Query]`)
    t.throws(() => u.url().setSearch({key: `val`}), TypeError, `expected variant of isStr, got {"key":"val"}`)

    testUrlSearchSet(function test(src, val, exp) {
      testStr(u.url(src).setSearch(val), exp)
    })
  })

  t.test(function test_searchParams() {
    t.throws(() => u.url().searchParams = `#`, SyntaxError, `unable to convert "#" to Query`)
    t.throws(() => u.url().searchParams = `one#two`, SyntaxError, `unable to convert "one#two" to Query`)
    t.throws(() => u.url().searchParams = 10, TypeError, `unable to convert 10 to Query`)

    l.reqInst(u.url().searchParams, u.Query)
    l.reqInst(u.url(`?key=val`).searchParams, u.Query)
    t.eq(u.url(`?key=val`).searchParams, u.query(`key=val`))

    function test(src, exp) {
      t.is(u.url(src).searchParams.toString(), exp)
      t.eq(u.url(src).searchParams, u.query(exp))
    }

    testUrlSearchGet(test)
    test(`scheme://?one=two?three`, `one=two%3Fthree`)
    test(`scheme://host/path?one=two?three`, `one=two%3Fthree`)
    test(`scheme://host/path?one=two?three#four`, `one=two%3Fthree`)
    test(`scheme://host/path?one=two?three#four?five`, `one=two%3Fthree`)
    test(`scheme://host/path?one=two?three#four?five#six`, `one=two%3Fthree`)
  })

  t.test(function test_setSearchParams() {
    t.throws(() => u.url().setSearch(10), TypeError, `expected variant of isStr, got 10`)

    function test(src, val, exp) {testStr(u.url(src).setSearchParams(val), exp)}
    testUrlSearchSet(test)

    test(``, new URLSearchParams(`key=val`), `?key=val`)
    test(``, u.query(`key=val`), `?key=val`)
    test(``, {key: `val`}, `?key=val`)
    test(`?one=two`, u.query(`three=four`), `?three=four`)
  })

  t.test(function test_query() {
    const url = u.url()
    t.is(url.query, url.searchParams)

    url.searchParams = `one=two`
    t.is(url.query, url.searchParams)
  })

  t.test(function test_setQuery() {
    function test(src, val, exp) {testStr(u.url(src).setQuery(val), exp)}

    test(``, u.query(`key=val`), `?key=val`)
    test(`?one=two`, u.query(`three=four`), `?three=four`)
  })

  t.test(function test_mutQuery() {
    function test(src, val, exp) {testStr(u.url(src).mutQuery(val), exp)}

    test(``, u.query(`key=val`), `?key=val`)
    test(`?one=two`, u.query(`three=four`), `?one=two&three=four`)
  })

  t.test(function test_hash() {
    t.throws(() => u.url().hash = 10, TypeError, `unable to convert 10 to hash`)
    t.throws(() => u.url().hash = `one two`, SyntaxError, `unable to convert "one two" to hash`)

    function test(src, exp) {t.is(u.url(src).hash, exp)}
    testEmpty(test)

    test(`scheme:path?key=val`, ``)
    test(`scheme:path?key=val#hash`, `hash`)
    test(`scheme:path#hash`, `hash`)

    test(`scheme://user:pass@domain/path?key=val`, ``)
    test(`scheme://user:pass@domain/path?key=val#`, ``)
    test(`scheme://user:pass@domain/path?key=val##`, `#`)
    test(`scheme://user:pass@domain/path?key=val#hash`, `hash`)
    test(`scheme://user:pass@domain/path?key=val##hash`, `#hash`)
    test(`scheme://user:pass@domain/path?key=val#hash?one`, `hash?one`)
    test(`scheme://user:pass@domain/path?key=val##hash?one`, `#hash?one`)
    test(`scheme://user:pass@domain/path?key=val#hash#two`, `hash#two`)
    test(`scheme://user:pass@domain/path?key=val##hash#two`, `#hash#two`)
    test(`scheme://user:pass@domain/path?key=val#hash?one#two`, `hash?one#two`)
    test(`scheme://user:pass@domain/path?key=val##hash?one#two`, `#hash?one#two`)
  })

  t.test(function test_setHash() {
    t.throws(() => u.url().setHash(10), TypeError, `unable to convert 10 to hash`)
    t.throws(() => u.url().setHash(`one two`), SyntaxError, `unable to convert "one two" to hash`)

    function test(src, val, exp) {testStr(u.url(src).setHash(val), exp)}

    test(``, ``, ``)
    test(``, `hash`, `#hash`)

    /*
    Stripping of leading `#` is questionable. It's done for compatibility with
    existing asinine APIs such as `URL` and `Location`, where non-empty `.hash`
    begins with `#`. Without this stripping, it would be WAY too easy to
    accidentally stack up `###`. We also provide `.setHashExact` to bypass it.
    */
    test(``, `#hash`, `#hash`)
    test(``, `##hash`, `#hash`)
    test(``, `###hash`, `#hash`)

    test(`scheme:`, ``, `scheme:`)
    test(`scheme:`, `hash`, `scheme:#hash`)
    test(`scheme:path`, `hash`, `scheme:path#hash`)
    test(`scheme:/path`, `hash`, `scheme:/path#hash`)

    test(`scheme://`, ``, `scheme://`)
    test(`scheme://`, `hash`, `scheme://#hash`)
    test(`scheme://host`, `hash`, `scheme://host#hash`)
    test(`scheme://host/path`, `hash`, `scheme://host/path#hash`)
    test(`scheme://host/path?key=val`, `hash`, `scheme://host/path?key=val#hash`)
    test(`scheme://host/path?key=val#one`, `two`, `scheme://host/path?key=val#two`)
    test(`scheme://host/path?key=val#one?two#three`, `four`, `scheme://host/path?key=val#four`)
    test(`scheme://host/path?key=val#one?two#three`, `four?five#six`, `scheme://host/path?key=val#four?five#six`)
  })

  t.test(function test_setHashExact() {
    t.throws(() => u.url().setHashExact(10), TypeError, `unable to convert 10 to hash`)
    t.throws(() => u.url().setHashExact(`one two`), SyntaxError, `unable to convert "one two" to hash`)

    function test(src, val, exp) {testStr(u.url(src).setHashExact(val), exp)}

    test(``, ``, ``)
    test(``, `hash`, `#hash`)
    test(``, `#hash`, `##hash`)
    test(``, `##hash`, `###hash`)
  })

  t.test(function test_protocol() {
    t.throws(() => u.url().protocol = 10, TypeError, `expected variant of isStr, got 10`)
    t.throws(() => u.url().protocol = `/`, SyntaxError, `unable to convert "/" to protocol`)
    t.throws(() => u.url().protocol = `one`, SyntaxError, `unable to convert "one" to protocol`)

    function test(src, exp) {t.is(u.url(src).protocol, exp)}
    testEmpty(test)

    test(``, ``)
    test(`scheme:`, `scheme:`)
    test(`scheme:path`, `scheme:`)
    test(`scheme:path:morepath`, `scheme:`)
    test(`scheme:/path:morepath`, `scheme:`)
    test(`scheme://host`, `scheme://`)
    test(`scheme://host.host`, `scheme://`)
    test(`scheme://host.host/path`, `scheme://`)
  })

  t.test(function test_setProtocol() {
    t.throws(() => u.url().setProtocol(10), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => u.url().setProtocol(`/`), SyntaxError, `unable to convert "/" to protocol`)
    t.throws(() => u.url().setProtocol(`one`), SyntaxError, `unable to convert "one" to protocol`)

    function test(src, val, exp) {testStr(u.url(src).setProtocol(val), exp)}

    test(``, ``, ``)
    test(`/path`, ``, `/path`)
    test(`scheme:path`, ``, `path`)
    test(`scheme:/path`, ``, `/path`)
    test(`scheme://host`, ``, ``)
    test(`scheme://host/path?key=val#hash`, ``, `/path?key=val#hash`)

    test(``, `scheme:`, `scheme:`)
    test(``, `scheme://`, `scheme://`)

    test(`path`, `scheme:`, `scheme:path`)
    test(`host`, `scheme://`, `scheme://host`)

    test(`scheme:path`, `mailto:`, `mailto:path`)
    test(`scheme:path?key=val#hash`, `mailto:`, `mailto:path?key=val#hash`)
    test(`scheme://host`, `mailto:`, `mailto:`)
    test(`scheme://host/path?key=val#hash`, `mailto:`, `mailto:/path?key=val#hash`)

    test(`scheme:val`, `https://`, `https://val`)
    test(`scheme:val?key=val#hash`, `https://`, `https://val?key=val#hash`)

    test(`scheme://host`, `https://`, `https://host`)
    test(`scheme://host/path?key=val#hash`, `https://`, `https://host/path?key=val#hash`)
  })

  t.test(function test_host() {
    t.throws(() => u.url().host = 10, SyntaxError, `host is forbidden in URL without protocol double slash`)
    t.throws(() => u.url().host = `one`, SyntaxError, `host is forbidden in URL without protocol double slash`)
    t.throws(() => u.url(`scheme://`).host = 10, TypeError, `expected variant of isStr, got 10`)
    t.throws(() => u.url(`scheme://`).host = `/`, SyntaxError, `unable to convert "/" to host`)

    function test(src, exp) {t.is(u.url(src).host, exp)}
    testEmpty(test)

    test(`scheme:`, ``)
    test(`scheme:path`, ``)
    test(`scheme:/path`, ``)
    test(`scheme:path:morepath`, ``)
    test(`scheme:/path:morepath`, ``)

    test(`scheme://`, ``)
    test(`scheme://:123`, ``)
    test(`scheme://host`, `host`)
    test(`scheme://host:123`, `host:123`)
    test(`scheme://host/path`, `host`)
    test(`scheme://host:123/path`, `host:123`)
    test(`scheme://host/path:morepath`, `host`)
    test(`scheme://host:123/path:morepath`, `host:123`)
  })

  t.test(function test_setHost() {
    t.throws(() => u.url().setHost(10), SyntaxError, `host is forbidden in URL without protocol double slash`)
    t.throws(() => u.url().setHost(`one`), SyntaxError, `host is forbidden in URL without protocol double slash`)
    t.throws(() => u.url(`scheme://`).setHost(10), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => u.url(`scheme://`).setHost(`/`), SyntaxError, `unable to convert "/" to host`)

    function test(src, val, exp) {testStr(u.url(src).setHost(val), exp)}

    test(``, ``, ``)
    test(`/path`, ``, `/path`)
    test(`scheme:path`, ``, `scheme:path`)
    test(`scheme:path?key=val#hash`, ``, `scheme:path?key=val#hash`)
    test(`scheme://host`, ``, `scheme://`)
    test(`scheme://host?key=val#hash`, ``, `scheme://?key=val#hash`)
    test(`scheme://host/path?key=val#hash`, ``, `scheme:///path?key=val#hash`)

    test(`scheme://`, `host`, `scheme://host`)
    test(`scheme:///path`, `host:123`, `scheme://host:123/path`)
    test(`scheme://?key=val#hash`, `host:123`, `scheme://host:123?key=val#hash`)
    test(`scheme:///path?key=val#hash`, `host:123`, `scheme://host:123/path?key=val#hash`)
  })

  t.test(function test_origin() {
    t.throws(() => u.url().origin = 10, TypeError, `expected variant of isStr, got 10`)
    t.throws(() => u.url().origin = `/`, SyntaxError, `unable to convert "/" to origin`)
    t.throws(() => u.url().origin = `one`, SyntaxError, `unable to convert "one" to origin`)
    t.throws(() => u.url().origin = `scheme:path`, SyntaxError, `unable to convert "scheme:path" to origin`)
    t.throws(() => u.url().origin = `scheme://host/path`, SyntaxError, `unable to convert "scheme://host/path" to origin`)

    function test(src, exp) {t.is(u.url(src).origin, exp)}
    testEmpty(test)

    test(`one://two.three/four/five`, `one://two.three`)
    test(`one://two.three:123/four/five`, `one://two.three:123`)
    test(`one:two.three/four/five`, ``)
    test(`one:two.three:123/four/five`, ``)
  })

  // TODO validate that username and password get updated.
  t.test(function test_setOrigin() {
    t.throws(() => u.url().setOrigin(10), TypeError, `expected variant of isStr, got 10`)
    t.throws(() => u.url().setOrigin(`/`), SyntaxError, `unable to convert "/" to origin`)
    t.throws(() => u.url().setOrigin(`one`), SyntaxError, `unable to convert "one" to origin`)
    t.throws(() => u.url().setOrigin(`scheme:path`), SyntaxError, `unable to convert "scheme:path" to origin`)
    t.throws(() => u.url().setOrigin(`scheme://host/path`), SyntaxError, `unable to convert "scheme://host/path" to origin`)

    function test(src, val, exp) {testStr(u.url(src).setOrigin(val), exp)}

    test(``, ``, ``)
    test(``, `scheme:`, `scheme:`)
    test(``, `scheme://`, `scheme://`)
    test(``, `scheme://host`, `scheme://host`)
    test(``, `scheme://host:123`, `scheme://host:123`)

    test(`?key=val#hash`, ``, `?key=val#hash`)
    test(`?key=val#hash`, `scheme:`, `scheme:?key=val#hash`)
    test(`?key=val#hash`, `scheme://`, `scheme://?key=val#hash`)
    test(`?key=val#hash`, `scheme://host`, `scheme://host?key=val#hash`)
    test(`?key=val#hash`, `scheme://host:123`, `scheme://host:123?key=val#hash`)

    test(`/path?key=val#hash`, ``, `/path?key=val#hash`)
    test(`/path?key=val#hash`, `scheme:`, `scheme:/path?key=val#hash`)
    test(`/path?key=val#hash`, `scheme://`, `scheme:///path?key=val#hash`)
    test(`/path?key=val#hash`, `scheme://host`, `scheme://host/path?key=val#hash`)
    test(`/path?key=val#hash`, `scheme://host:123`, `scheme://host:123/path?key=val#hash`)

    test(`mailto:/path?key=val#hash`, ``, `/path?key=val#hash`)
    test(`mailto:/path?key=val#hash`, `scheme:`, `scheme:/path?key=val#hash`)
    test(`mailto:/path?key=val#hash`, `scheme://`, `scheme:///path?key=val#hash`)
    test(`mailto:/path?key=val#hash`, `scheme://host`, `scheme://host/path?key=val#hash`)
    test(`mailto:/path?key=val#hash`, `scheme://host:123`, `scheme://host:123/path?key=val#hash`)

    test(`https://prev/path?key=val#hash`, ``, `/path?key=val#hash`)
    test(`https://prev/path?key=val#hash`, `scheme:`, `scheme:/path?key=val#hash`)
    test(`https://prev/path?key=val#hash`, `scheme://`, `scheme:///path?key=val#hash`)
    test(`https://prev/path?key=val#hash`, `scheme://host`, `scheme://host/path?key=val#hash`)
    test(`https://prev/path?key=val#hash`, `scheme://host:123`, `scheme://host:123/path?key=val#hash`)

    test(`https://prev:234/path?key=val#hash`, ``, `/path?key=val#hash`)
    test(`https://prev:234/path?key=val#hash`, `scheme:`, `scheme:/path?key=val#hash`)
    test(`https://prev:234/path?key=val#hash`, `scheme://`, `scheme:///path?key=val#hash`)
    test(`https://prev:234/path?key=val#hash`, `scheme://host`, `scheme://host/path?key=val#hash`)
    test(`https://prev:234/path?key=val#hash`, `scheme://host:123`, `scheme://host:123/path?key=val#hash`)
  })

  t.test(function test_href() {
    t.throws(() => u.url().href = 10, TypeError, `unable to convert 10 to Url`)
    t.throws(() => u.url().href = `one two`, SyntaxError, `unable to convert "one two" to URL`)

    function test(src, exp) {t.is(u.url(src).href, exp)}
    function same(src) {test(src, src)}

    // Known cases of information loss / normalization.
    // For other URLs, decoding and encoding should be reversible.
    test(`scheme://user@domain`, `scheme://user@domain`)
    test(`scheme://user:@domain`, `scheme://user@domain`)

    same(`one:two.three/four/five`)
    same(`one:two.three:123/four/five`)
    same(`one:/two.three/four/five`)
    same(`one:/two.three:123/four/five`)
    same(`one:/two.three:123/four/five?six=seven`)
    same(`one:/two.three:123/four/five?six=seven#eight`)
    same(`one:/two.three:123/four/five?six=seven#eight?nine`)
    same(`one:/two.three:123/four/five?six=seven#eight?nine=ten`)
    same(`one:/two.three:123/four/five?six=seven#eight?nine=ten#eleven`)

    same(`scheme://user:pass@domain`)
    same(`scheme://:pass@domain`)
    same(`scheme://user:pass@domain:123`)
    same(`scheme://:pass@domain:123`)

    same(`scheme://user:pass@domain:123/path?key=val`)
    same(`scheme://user:pass@domain:123/path?key=val##`)
    same(`scheme://user:pass@domain:123/path?key=val#hash`)
    same(`scheme://user:pass@domain:123/path?key=val##hash`)
  })

  t.test(function test_setHref() {
    t.throws(() => u.url().setHref(10), TypeError, `unable to convert 10 to Url`)
    t.throws(() => u.url().setHref(`one two`), SyntaxError, `unable to convert "one two" to URL`)

    function test(src, val, exp) {testStr(u.url(src).setHref(val), exp)}

    test(``, ``, ``)
    test(``, `one://two/three?four#five`, `one://two/three?four#five`)
    test(`one://two/three?four#five`, ``, ``)
    test(`one://two/three?four#five`, `six:seven`, `six:seven`)
  })

  t.test(function test_schemeFull() {
    function test(src, exp) {t.is(u.url(src).schemeFull(), exp)}
    testEmpty(test)

    test(u.url().setScheme(``), ``)
    test(u.url().setScheme(`scheme`), `scheme:`)

    test(`/path`, ``)
    test(`?search`, ``)
    test(`#hash`, ``)
    test(`scheme:path`, `scheme:`)
    test(`scheme://`, `scheme:`)
    test(`scheme://host`, `scheme:`)
  })

  t.test(function test_portFull() {
    function test(src, exp) {t.is(u.url(src).portFull(), exp)}
    testEmpty(test)

    test(`/path`, ``)
    test(`?search`, ``)
    test(`#hash`, ``)
    test(`scheme:path`, ``)
    test(`scheme://`, ``)
    test(`scheme://:123`, `:123`)
    test(`scheme://host`, ``)
    test(`scheme://host:123`, `:123`)
  })

  t.test(function test_pathnameFull() {
    function test(src, exp) {t.is(u.url(src).pathnameFull(), exp)}

    test(``, `/`)
    test(`path`, `/path`)
    test(`/path`, `/path`)
    test(`scheme:`, `/`)
    test(`scheme:path`, `/path`)
    test(`scheme:/path`, `/path`)
    test(`scheme://host`, `/`)
    test(`scheme://host/path`, `/path`)
  })

  t.test(function test_searchFull() {
    function test(src, exp) {t.is(u.url(src).searchFull(), exp)}
    testEmpty(test)

    test(`?`, ``)
    test(`?search`, `?search`)
  })

  t.test(function test_hashFull() {
    function test(src, exp) {t.is(u.url(src).hashFull(), exp)}
    testEmpty(test)

    test(`#`, ``)
    test(`#hash`, `#hash`)
  })

  t.test(function test_base() {
    function test(src, exp) {t.is(u.url(src).base(), exp)}
    testEmpty(test)

    test(`scheme:`, `scheme:`)
    test(`scheme:path`, `scheme:`)
    test(`scheme:/path`, `scheme:`)
    test(`scheme://host`, `scheme://host`)
    test(`scheme://host/path`, `scheme://host`)
    test(`scheme://host:123/path`, `scheme://host:123`)
    test(`scheme://user:pass@host:123/path`, `scheme://user:pass@host:123`)
    test(`scheme://user:pass@host:123/path?key=val#hash`, `scheme://user:pass@host:123`)
  })

  t.test(function test_hostPath() {
    function test(src, exp) {t.is(u.url(src).hostPath(), exp)}
    testEmpty(test)

    test(`scheme:`, ``)
    test(`scheme:path`, `path`)
    test(`scheme:/path`, `/path`)
    test(`scheme://host`, `host`)
    test(`scheme://host/path`, `host/path`)
    test(`scheme://host/path?key=val#hash`, `host/path`)
    test(`scheme://host:123/path?key=val#hash`, `host:123/path`)
  })

  t.test(function test_auth() {
    function test(src, exp) {t.is(u.url(src).auth(), exp)}
    testEmpty(test)

    test(`scheme:`, ``)
    test(`scheme:one:two@three`, ``)

    test(`scheme://`, ``)
    test(`scheme://host`, ``)
    test(`scheme://@host`, ``)
    test(`scheme://:@host`, ``)
    test(`scheme://user:pass@host`, `user:pass`)
    test(`scheme://user@host`, `user`)
    test(`scheme://:pass@host`, `:pass`)
  })

  t.test(function test_authFull() {
    function test(src, exp) {t.is(u.url(src).authFull(), exp)}
    testEmpty(test)

    test(`scheme:`, ``)
    test(`scheme:one:two@three`, ``)

    test(`scheme://`, ``)
    test(`scheme://host`, ``)
    test(`scheme://@host`, ``)
    test(`scheme://:@host`, ``)
    test(`scheme://user:pass@host`, `user:pass@`)
    test(`scheme://user@host`, `user@`)
    test(`scheme://:pass@host`, `:pass@`)
  })

  t.test(function test_rel() {
    function test(src, exp) {t.is(u.url(src).rel(), exp)}
    testEmpty(test)

    test(`scheme:`, ``)
    test(`scheme:path`, `path`)
    test(`scheme:/path`, `/path`)
    test(`scheme:/path?key=val#hash`, `/path?key=val#hash`)

    test(`scheme://`, ``)
    test(`scheme://host`, ``)
    test(`scheme://host?key=val#hash`, `?key=val#hash`)
    test(`scheme://host/path`, `/path`)
    test(`scheme://host/path?key=val#hash`, `/path?key=val#hash`)
  })

  t.test(function test_clean() {
    function test(src, exp) {t.is(u.url(src).clean(), exp)}

    test(``, ``)
    test(`/path`, `/path`)

    test(`scheme:`, `scheme:`)
    test(`scheme:path`, `scheme:path`)
    test(`scheme:path?key=val#hash`, `scheme:path`)

    test(`scheme://`, `scheme://`)
    test(`scheme://host`, `scheme://host`)
    test(`scheme://host:123`, `scheme://host:123`)
    test(`scheme://host:123/path`, `scheme://host:123/path`)
    test(`scheme://user:pass@host:123/path`, `scheme://user:pass@host:123/path`)
    test(`scheme://user:pass@host:123/path?key=val#hash`, `scheme://user:pass@host:123/path`)
  })

  // Delegates to `.addPath`. This is mostly a sanity check.
  t.test(function test_setPath() {
    function test(src, vals, exp) {testStr(u.url(src).setPath(...vals), exp)}

    test(``, [], ``)
    test(`/one`, [], ``)
    test(`/one`, [`two`], `two`)
    test(`/one`, [`/two`], `/two`)
    test(`/one`, [`two`, `three`], `two/three`)
    test(`/one`, [`/two`, `three`], `/two/three`)
    test(`/one`, [`two`, `/three`], `two/three`)
    test(`/one`, [`/two`, `/three`], `/two/three`)
  })

  // TODO also test `.setPath`, dedup.
  t.test(function test_addPath() {
    t.test(function test_invalid_type() {
      function test(src, vals) {
        const url = u.url(src)
        t.throws(() => url.addPath(...vals), TypeError, `unable to convert`)
      }

      test(``, [{}])
      test(``, [[]])
      test(``, [Object.create(null)])
      test(``, [Promise.resolve()])
      test(``, [u.url])
    })

    t.test(function test_empty_segment() {
      function test(src, vals) {
        const url = u.url(src)
        t.throws(() => url.addPath(...vals), SyntaxError, `invalid empty URL segment`)
      }

      test(``, [undefined])
      test(``, [null])
      test(``, [``])
      test(``, [{toString() {return ``}}])
      test(``, [new String()])
      test(``, [u.url()])
    })

    t.test(function test_valid() {
      function test(src, vals, exp) {testStr(u.url(src).addPath(...vals), exp)}

      test(``, [], ``)
      test(`one`, [], `one`)
      test(`/one`, [], `/one`)
      test(`one`, [`two`], `one/two`)
      test(`/one`, [`two`], `/one/two`)
      test(`/one`, [`/two`], `/one/two`)
      test(`/one/`, [`/two`], `/one/two`)
      test(`/one/`, [`two`], `/one/two`)
      test(`/one/`, [`two/`], `/one/two/`)
      test(`/one`, [`two`, `three`], `/one/two/three`)
      test(`/one`, [`/two`, `three`], `/one/two/three`)
      test(`/one/`, [`/two`, `three`], `/one/two/three`)
      test(`/one/`, [`two`, `three`], `/one/two/three`)
      test(`/one/`, [`two/`, `three`], `/one/two/three`)
      test(`/one`, [`two`, `/three`], `/one/two/three`)
      test(`/one`, [`/two`, `/three`], `/one/two/three`)
      test(`/one/`, [`/two`, `/three`], `/one/two/three`)
      test(`/one/`, [`two`, `/three`], `/one/two/three`)
      test(`/one/`, [`two/`, `/three`], `/one/two/three`)

      test(`scheme:`, [], `scheme:`)
      test(`scheme:`, [`one`], `scheme:one`)
      test(`scheme:`, [`/one`], `scheme:/one`)
      test(`scheme:`, [`one`, `two`], `scheme:one/two`)
      test(`scheme:`, [`/one`, `two`], `scheme:/one/two`)

      test(`scheme://`, [], `scheme://`)
      test(`scheme://`, [`one`], `scheme://one`)
      test(`scheme://`, [`/one`], `scheme:///one`)
      test(`scheme://`, [`one`, `two`], `scheme://one/two`)
      test(`scheme://`, [`/one`, `two`], `scheme:///one/two`)

      test(`scheme://host`, [], `scheme://host`)
      test(`scheme://host`, [`one`], `scheme://host/one`)
      test(`scheme://host`, [`/one`], `scheme://host/one`)
      test(`scheme://host`, [`one`, `two`], `scheme://host/one/two`)
      test(`scheme://host`, [`/one`, `two`], `scheme://host/one/two`)

      test(`scheme://host/`, [], `scheme://host/`)
      test(`scheme://host/`, [`one`], `scheme://host/one`)
      test(`scheme://host/`, [`/one`], `scheme://host/one`)
      test(`scheme://host/`, [`one`, `two`], `scheme://host/one/two`)
      test(`scheme://host/`, [`/one`, `two`], `scheme://host/one/two`)
    })
  })

  // TODO validate no mutation of source reference.
  t.test(function test_withScheme() {
    testStr(u.url(LONG).withScheme(``), `/path?key=val#hash`)
    testStr(u.url(LONG).withScheme(`one`), `one://user:pass@host:123/path?key=val#hash`)
  })

  t.test(function test_withSlash() {
    testStr(u.url(LONG).withSlash(``), `scheme:/path?key=val#hash`)
    testStr(u.url(LONG).withSlash(`/`), `scheme:/user:pass@host:123/path?key=val#hash`)
    testStr(u.url(LONG).withSlash(`//`), `scheme://user:pass@host:123/path?key=val#hash`)
    testStr(u.url(LONG).withSlash(`///`), `scheme:///user:pass@host:123/path?key=val#hash`)
  })

  t.test(function test_withUsername() {
    testStr(u.url(LONG).withUsername(``), `scheme://:pass@host:123/path?key=val#hash`)
    testStr(u.url(LONG).withUsername(`username`), `scheme://username:pass@host:123/path?key=val#hash`)
  })

  t.test(function test_withPassword() {
    testStr(u.url(LONG).withPassword(``), `scheme://user@host:123/path?key=val#hash`)
    testStr(u.url(LONG).withPassword(`password`), `scheme://user:password@host:123/path?key=val#hash`)
  })

  t.test(function test_withHostname() {
    testStr(u.url(LONG).withHostname(``), `scheme://user:pass@/path?key=val#hash`)
    testStr(u.url(LONG).withHostname(`hostname`), `scheme://user:pass@hostname:123/path?key=val#hash`)
  })

  t.test(function test_withPort() {
    testStr(u.url(LONG).withPort(``), `scheme://user:pass@host/path?key=val#hash`)
    testStr(u.url(LONG).withPort(`234`), `scheme://user:pass@host:234/path?key=val#hash`)
  })

  t.test(function test_withPathname() {
    testStr(u.url(LONG).withPathname(``), `scheme://user:pass@host:123?key=val#hash`)
    testStr(u.url(LONG).withPathname(`pathname`), `scheme://user:pass@host:123/pathname?key=val#hash`)
  })

  t.test(function test_withSearch() {
    testStr(u.url(LONG).withSearch(``), `scheme://user:pass@host:123/path#hash`)
    testStr(u.url(LONG).withSearch(`one=two`), `scheme://user:pass@host:123/path?one=two#hash`)
  })

  t.test(function test_withSearchParams() {
    testStr(u.url(LONG).withSearchParams(``), `scheme://user:pass@host:123/path#hash`)
    testStr(u.url(LONG).withSearchParams(`one=two`), `scheme://user:pass@host:123/path?one=two#hash`)
  })

  t.test(function test_withQuery() {
    testStr(u.url(LONG).withQuery(``), `scheme://user:pass@host:123/path#hash`)
    testStr(u.url(LONG).withQuery(`one=two`), `scheme://user:pass@host:123/path?one=two#hash`)
  })

  t.test(function test_withHash() {
    testStr(u.url(LONG).withHash(``), `scheme://user:pass@host:123/path?key=val`)
    testStr(u.url(LONG).withHash(`hashname`), `scheme://user:pass@host:123/path?key=val#hashname`)
    testStr(u.url(LONG).withHash(`#hashname`), `scheme://user:pass@host:123/path?key=val#hashname`)
  })

  t.test(function test_withHashExact() {
    testStr(u.url(LONG).withHashExact(``), `scheme://user:pass@host:123/path?key=val`)
    testStr(u.url(LONG).withHashExact(`hashname`), `scheme://user:pass@host:123/path?key=val#hashname`)
    testStr(u.url(LONG).withHashExact(`#hashname`), `scheme://user:pass@host:123/path?key=val##hashname`)
  })

  t.test(function test_withProtocol() {
    testStr(u.url(LONG).withProtocol(``), `/path?key=val#hash`)
    testStr(u.url(LONG).withProtocol(`one:`), `one:/path?key=val#hash`)
    testStr(u.url(LONG).withProtocol(`one://`), `one://user:pass@host:123/path?key=val#hash`)
  })

  t.test(function test_withHost() {
    testStr(u.url(LONG).withHost(``), `scheme://user:pass@/path?key=val#hash`)
    testStr(u.url(LONG).withHost(`hostname`), `scheme://user:pass@hostname/path?key=val#hash`)
    testStr(u.url(LONG).withHost(`hostname:234`), `scheme://user:pass@hostname:234/path?key=val#hash`)
    testStr(u.url(LONG).withHost(`:234`), `scheme://user:pass@/path?key=val#hash`)
  })

  t.test(function test_withOrigin() {
    testStr(u.url(LONG).withOrigin(``), `/path?key=val#hash`)
    testStr(u.url(LONG).withOrigin(`one:`), `one:/path?key=val#hash`)
    testStr(u.url(LONG).withOrigin(`one://`), `one:///path?key=val#hash`)
    testStr(u.url(LONG).withOrigin(`one://hostname`), `one://hostname/path?key=val#hash`)
    testStr(u.url(LONG).withOrigin(`one://username:password@hostname`), `one://username:password@hostname/path?key=val#hash`)
    testStr(u.url(LONG).withOrigin(`one://username:password@hostname:234`), `one://username:password@hostname:234/path?key=val#hash`)
  })

  t.test(function test_withHref() {
    testStr(u.url(LONG).withHref(``), ``)
    testStr(u.url(LONG).withHref(`one://two.three`), `one://two.three`)
  })

  t.test(function test_toJSON() {
    t.test(function test_empty() {
      function test(src) {t.is(u.url(src).toJSON(), null)}

      test(undefined)
      test(null)
      test(``)
      test(`?`)
      test(`#`)
    })

    t.test(function test_non_empty() {
      function test(src) {t.is(u.url(src).toJSON(), src)}

      test(`scheme://user:pass@domain:123/path?key=val#hash`)
    })
  })

  t.test(function test_resetFromStr() {
    const src = `https://user:pass@host:123/path?key=val#hash`
    const tar = u.url()
    tar.resetFromStr(src)
    t.is(tar.href, src)
  })

  t.test(function test_resetFromURL() {
    const src = new URL(`https://user:pass@host:123/path?key=val#hash`)
    const tar = u.url()
    tar.resetFromURL(src)
    t.is(src.href, `https://user:pass@host:123/path?key=val#hash`)
    t.is(tar.href, `https://user:pass@host:123/path?key=val#hash`)
  })

  t.test(function test_resetFromUrl() {
    const src = u.url(`https://user:pass@host:123/path?key=val#hash`)
    const tar = u.url()
    tar.resetFromUrl(src)
    t.is(src.href, `https://user:pass@host:123/path?key=val#hash`)
    t.is(tar.href, `https://user:pass@host:123/path?key=val#hash`)
  })
})

function testEmpty(test) {
  test(undefined, ``)
  test(null, ``)
  test(``, ``)
}

function testStr(src, exp) {t.is(src.toString(), exp)}

function testReset(ref, src, exp) {
  t.is(ref.reset(src), ref)
  testStr(ref, exp)
}

function testMut(ref, src, exp) {
  t.is(ref.mut(src), ref)
  testStr(ref, exp)
}

function testUrlSearchGet(test) {
  testEmpty(test)

  test(``, ``)
  test(`scheme:`, ``)
  test(`scheme:?`, ``)
  test(`scheme:?key=val`, `key=val`)
  test(`scheme:path?key=val`, `key=val`)
  test(`scheme:path?key=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`, `key=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`)
  test(`scheme:/path?key=val`, `key=val`)

  test(`scheme://`, ``)
  test(`scheme://host`, ``)
  test(`scheme://host.host`, ``)
  test(`scheme://host/path`, ``)
  test(`scheme://host.host/path`, ``)

  test(`scheme://#hash`, ``)
  test(`scheme://host#hash`, ``)
  test(`scheme://host.host#hash`, ``)
  test(`scheme://host/path#hash`, ``)
  test(`scheme://host.host/path#hash`, ``)

  test(`scheme://?key=val`, `key=val`)
  test(`scheme://host?key=val`, `key=val`)
  test(`scheme://host.host?key=val`, `key=val`)
  test(`scheme://host/path?key=val`, `key=val`)
  test(`scheme://host.host/path?key=val`, `key=val`)

  test(`scheme://?key=val#hash`, `key=val`)
  test(`scheme://host?key=val#hash`, `key=val`)
  test(`scheme://host.host?key=val#hash`, `key=val`)
  test(`scheme://host/path?key=val#hash`, `key=val`)
  test(`scheme://host.host/path?key=val#hash`, `key=val`)
}

function testUrlSearchSet(test) {
  test(``, ``, ``)
  test(``, `key=val`, `?key=val`)

  test(`scheme:`, `key=val`, `scheme:?key=val`)
  test(`scheme:path`, `key=val`, `scheme:path?key=val`)
  test(`scheme:/path`, `key=val`, `scheme:/path?key=val`)
  test(`scheme://host`, `key=val`, `scheme://host?key=val`)
  test(`scheme://host/path`, `key=val`, `scheme://host/path?key=val`)
  test(`scheme://host/path#hash`, `key=val`, `scheme://host/path?key=val#hash`)

  test(`scheme:?one=two`, `key=val`, `scheme:?key=val`)
  test(`scheme:path?one=two`, `key=val`, `scheme:path?key=val`)
  test(`scheme:/path?one=two`, `key=val`, `scheme:/path?key=val`)
  test(`scheme://host?one=two`, `key=val`, `scheme://host?key=val`)
  test(`scheme://host/path?one=two`, `key=val`, `scheme://host/path?key=val`)
  test(`scheme://host/path?one=two#hash`, `key=val`, `scheme://host/path?key=val#hash`)

  t.test(function test_unicode() {
    test(``, `key=🙂😁😛`, `?key=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`)
    test(``, `key=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`, `?key=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`)

    // For comparison. Our behavior should align.
    t.test(function test_native() {
      function test(src) {
        const url = new URL(`https://example.com`)
        url.search = src

        t.is(url.search, `?key=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`)
        t.is(url.searchParams.get(`key`), `🙂😁😛`)
      }

      test(`key=🙂😁😛`)
      test(`key=%F0%9F%99%82%F0%9F%98%81%F0%9F%98%9B`)
    })
  })
}

if (import.meta.main) console.log(`[test] ok!`)
