/*
Tiny server for running tests in the browser.
TODO add live reloading, using `live_deno.mjs`
*/

/* global Deno */

import * as h from '../http.mjs'
import * as hd from '../http_deno.mjs'

const dirs = hd.Dirs.of(new hd.DirRel(`.`))

const srv = new class Srv extends hd.Srv {
  listen() {
    const port = 37285
    const lis = Deno.listen({port})
    console.log(`[srv] listening on http://localhost:${port}/test/test.html`)
    return this.serve(lis)
  }

  async res(req) {
    const rou = new h.Rou(req)

    return (
      (await dirs.resolveSiteFileWithNotFound(req.url))?.res() ||
      h.resNotFound(rou)
    )
  }
}()

await srv.listen()
