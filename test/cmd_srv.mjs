/*
Tiny server for running tests in the browser.
Serves files and performs live reloading.
Can run in both Bun and Deno.
*/

import * as l from '../lang.mjs'
import * as cl from '../cli.mjs'
import * as hl from '../http_live.mjs'
import * as h from '#http'
import * as io from '#io'

const PORT = 37285
const CLI = cl.Flag.os()
const LIVE = CLI.boolOpt(`--live`)
const LIVE_BRO = l.vac(LIVE) && new hl.LiveBroad()
const LIVE_CLI = l.vac(LIVE) && new hl.LiveClient({port: PORT, hot: true})
const CACHING = false // Toggle for manual debug.
const DIR = new h.HttpDir({fsPath: `.`})
const DIRS = h.HttpDirs.of(DIR).setOpt({caching: CACHING})
const COMP = new h.HttpCompressor()

function serve() {
  h.serve({port: PORT, onRequest, onError, onListen})
}

function onListen(srv) {
  const url = new URL(`test/test.html`, h.srvUrl(srv))
  console.log(`[srv] listening on`, url.href)
}

async function onRequest(req) {
  const {pathname} = new URL(req.url)
  const {method} = req

  const res = await (
    ((method === h.HEAD || method === h.OPTIONS) && new Response()) ||

    LIVE_BRO?.response({req, pathname}) ||

    (await h.fileResponse({
      req,
      file: await DIRS.resolve(pathname),
      compressor: COMP,
      liveClient: LIVE_CLI,
    })) ||

    h.notFound({method, pathname})
  )

  const head = res.headers

  /*
  Without these headers, Safari uses low-resolution timestamps, breaking our
  tests which rely on "high"-resolution timing, which is merely okay-resolution
  to begin with.
  */
  head.append(`cross-origin-opener-policy`, `same-origin`)
  head.append(`cross-origin-embedder-policy`, `require-corp`)
  return cors(res)
}

function onError(err) {
  if (h.isErrAbort(err)) {
    return new Response(undefined, {headers: h.HEADERS_CORS_PROMISCUOUS})
  }
  console.error(err)
  const msg = err?.stack || String(err)
  const status = err?.status || 500
  return new Response(msg, {status, headers: h.HEADERS_CORS_PROMISCUOUS})
}

async function watch() {
  for await (let {type, path} of io.watchCwd()) {
    path = LIVE_CLI.fsPathToUrlPath(path)
    if (!path) continue
    LIVE_BRO.writeEventJson({type, path})
  }
}

function cors(res) {
  const head = res.headers
  for (const [key, val] of h.HEADERS_CORS_PROMISCUOUS) head.append(key, val)
  return res
}

if (import.meta.main) {
  serve()
  if (LIVE) watch()
}
