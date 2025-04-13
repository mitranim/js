/*
Tiny server for running tests in the browser.
Serves files and performs live reloading.
*/

/* global Deno */

import * as h from '../http.mjs'
import * as hd from '../http_deno.mjs'
import * as ld from '../live_deno.mjs'

const BRO = new ld.LiveBroad()
const DIRS = ld.LiveDirs.of(hd.dirRel(`.`))

function serve() {
  Deno.serve({
    port: 37285,
    handler: respond,
    onListen({port, hostname}) {
      if (hostname === `0.0.0.0`) hostname = `localhost`
      console.log(`[srv] listening on http://${hostname}:${port}/test/test.html`)
    },
    onError: respondErr,
  })
}

async function respond(req) {
  const rou = new h.ReqRou(req)

  return ld.withLiveClient(BRO.clientPath, await (
    (await BRO.res(rou)) ||
    (await DIRS.resolveSiteFileWithNotFound(req.url))?.res() ||
    rou.notFound()
  ))
}

function respondErr(err) {
  if (h.isErrAbort(err)) return new Response()
  console.error(err)

  const msg = err?.stack || String(err)
  const status = err?.status || 500
  return new Response(msg, {status})
}

async function watch() {
  for await (const val of DIRS.watchLive()) BRO.writeEventJson(val)
}

if (import.meta.main) {
  serve()
  watch()
}
