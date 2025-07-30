/* global Deno */

import * as l from './lang.mjs'
import * as io from './io_deno.mjs'
import * as hs from './http_srv.mjs'
export * from './http.mjs'
export * from './http_srv.mjs'

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
  static async resolve(opt) {
    const {fsPath} = opt
    l.reqScalar(fsPath)

    const info = await io.statOpt(fsPath)
    if (!info?.isFile) return undefined

    const out = new this(opt)
    out.info = info
    return out
  }

  async response(opt) {
    const body = this.bytes ?? this.text ?? (await Deno.open(this.fsPath)).readable
    return new this.Res(body, await this.resOpt(opt))
  }

  async getBytes() {return this.bytes ??= await io.readFileBytes(this.fsPath)}
  async getText() {return this.text ??= await io.readFileText(this.fsPath)}
  async getInfo() {return this.info ??= await io.stat(this.fsPath)}
}

export class HttpDir extends hs.BaseHttpDir {get HttpFile() {return HttpFile}}
