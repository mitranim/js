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
  const path = new URL(req.url).pathname

  const res = await (
    LIVE_BRO?.response(req, path) ||

    (await h.fileResponse({
      req,
      file: await DIRS.resolve(path),
      compressor: COMP,
      liveClient: LIVE_CLI,
    })) ||

    h.notFound(req.method, path)
  )

  /*
  Without these headers, Safari uses low-resolution timestamps, breaking our
  tests which rely on "high"-resolution timing, which is merely okay-resolution
  to begin with.
  */
  res.headers.append(`cross-origin-opener-policy`, `same-origin`)
  res.headers.append(`cross-origin-embedder-policy`, `require-corp`)
  return res
}

function onError(err) {
  if (h.isErrAbort(err)) return new Response()
  console.error(err)
  const msg = err?.stack || String(err)
  const status = err?.status || 500
  return new Response(msg, {status})
}

async function watch() {
  for await (let {type, path} of io.watchCwd()) {
    path = LIVE_CLI.fsPathToUrlPath(path)
    if (!path) continue
    LIVE_BRO.writeEventJson({type, path})
  }
}

if (import.meta.main) {
  serve()
  if (LIVE) watch()
}
