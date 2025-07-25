/* global Deno */

import * as l from './lang.mjs'
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
  body = undefined

  static async make(urlPath, fsPath) {
    l.reqScalar(urlPath)
    l.reqScalar(fsPath)

    const info = await io.statOpt(fsPath)
    if (!info) return undefined

    const out = new this(urlPath, fsPath)
    out.info = info
    return out
  }

  async response(opt) {
    const {body, fsPath} = this
    opt = await this.opt(opt)
    return new this.Res((body ?? (await Deno.open(fsPath)).readable), opt)
  }

  async bytes() {return this.body ??= await io.readFileBytes(this.fsPath)}
  stat() {return this.info}
  statSync() {return this.info}
  onlyFile() {return this.info.isFile ? this : undefined}
  onlyDir() {return this.info.isDir ? this : undefined}
}

export class HttpDir extends hs.BaseHttpDir {get HttpFile() {return HttpFile}}
