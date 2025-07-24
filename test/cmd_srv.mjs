/*
Tiny server for running tests in the browser.
Serves files and performs live reloading.
Compatible with Bun and Deno.
*/

import * as l from '../lang.mjs'
import * as cl from '../cli.mjs'
import * as hl from '../http_live.mjs'
import * as h from '#http'
import * as io from '#io'

const CLI = cl.Flag.os()
const LIVE = CLI.boolOpt(`--live`)
const DIR = new h.HttpDir(`.`)
const LIVE_BRO = l.vac(LIVE) && new hl.LiveBroad()
const LIVE_CLI = l.vac(LIVE) && new hl.LiveClient()

function serve() {
  h.serve({port: 37285, onRequest, onError, onListen})
}

function onListen(srv) {
  const url = new URL(`test/test.html`, h.srvUrl(srv))
  console.log(`[srv] listening on`, url.href)
}

async function onRequest(req) {
  const path = new URL(req.url).pathname

  const res = await (
    LIVE_BRO?.res(req, path) ||
    (await serveFile(path)) ||
    h.notFound(req.method, path)
  )

  /*
  Without these headers, Safari uses low-resolution timestamps,
  breaking our tests which rely on "high"-resolution timing.
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

async function serveFile(path) {
  const file = await DIR.resolveSiteFile(path)
  if (!file) return undefined
  if (!LIVE_CLI) return file.res()
  LIVE_CLI.addFile(file)
  return LIVE_CLI.withLiveScript(await file.res())
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
