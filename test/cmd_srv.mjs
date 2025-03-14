/*
Tiny server for running tests in the browser.
Serves files and performs live reloading.
*/

import * as l from '../lang.mjs'
import * as h from '../http.mjs'
import * as hd from '../http_deno.mjs'
import * as ld from '../live_deno.mjs'

const srv = new class Srv extends hd.Srv {
  bro = new ld.LiveBroad()
  dirs = ld.LiveDirs.of(hd.dirRel(`.`))

  onListen() {
    const port = l.reqNat(this.lis.addr.port)
    console.log(`[srv] listening on http://localhost:${port}/test/test.html`)
  }

  async res(req) {
    const rou = new h.ReqRou(req)

    return ld.withLiveClient(this.bro.clientPath, await (
      (await this.bro.res(rou)) ||
      (await this.dirs.resolveSiteFileWithNotFound(req.url))?.res() ||
      rou.notFound()
    ))
  }

  async watch() {
    for await (const val of this.dirs.watchLive()) {
      this.bro.writeEventJson(val)
    }
  }

  errRes(err) {
    return new Response(err?.stack || l.show(err), {status: 500})
  }
}()

srv.watch()
await srv.listen({port: 37285})
