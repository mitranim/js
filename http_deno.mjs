/* global Deno */

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as h from './http.mjs'
import * as io from './io_deno.mjs'
import * as hs from './http_shared.mjs'
export * from './http.mjs'
export * from './http_shared.mjs'

export function serve(opt) {
  const {onRequest, ...rest} = l.optRec(opt)
  return Deno.serve({handler: onRequest, ...rest})
}

export function srvUrl({hostname, port}) {
  if (hostname === `0.0.0.0` || hostname === `::1`) hostname = ``
  const url = new URL(`http://` + (hostname || `localhost`))
  url.port = port
  return url
}

export class HttpFile extends hs.BaseHttpFile {
  info = undefined

  static async make(urlPath, fsPath) {
    l.reqScalar(urlPath)
    l.reqScalar(fsPath)

    const info = await io.statOpt(fsPath)
    if (!info) return undefined

    const out = new this(urlPath, fsPath)
    out.info = info
    return out
  }

  async res(opt) {
    opt = this.opt(opt)
    const file = await Deno.open(this.fsPath)
    try {
      const res = new Response(file.readable, opt)
      this.setHeaders(res.headers)
      return res
    }
    catch (err) {
      file.close()
      throw err
    }
  }

  stat() {return this.info}
  onlyFile() {return this.info.isFile ? this : undefined}
  onlyDir() {return this.info.isDir ? this : undefined}

  // Not used automatically. User code can opt in.
  etag() {
    const {size, mtime, birthtime} = this.info
    const out = s.dashed(birthtime?.valueOf(), mtime?.valueOf(), size)
    return out && (`W/` + h.jsonEncode(out))
  }
}

export class HttpDir extends hs.BaseHttpDir {get HttpFile() {return HttpFile}}
