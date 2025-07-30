/* global Bun */

import * as l from './lang.mjs'
import * as io from './io_bun.mjs'
import * as hs from './http_srv.mjs'
export * from './http.mjs'
export * from './http_srv.mjs'

export function serve(opt) {
  const {onRequest, onError, onListen, ...rest} = l.optRec(opt)
  rest.development ??= false
  rest.idleTimeout ??= 0
  const srv = Bun.serve({fetch: onRequest, error: onError, ...rest})
  onListen?.(srv)
  return srv
}

export function srvUrl(srv) {return srv.url}

export class HttpFile extends hs.BaseHttpFile {
  bunFile = undefined

  static async resolve(opt) {
    const {fsPath} = l.reqRec(opt)
    l.reqScalar(fsPath)

    const info = await io.statOpt(fsPath)
    if (!info?.isFile) return undefined

    const out = new this(opt)
    out.info = info
    return out
  }

  async response(opt) {
    const body = this.bytes ?? this.text ?? this.getBunFile()
    return new this.Res(body, await this.resOpt(opt))
  }

  async getBytes() {return this.bytes ??= await this.getBunFile().bytes()}
  async getText() {return this.text ??= await this.getBunFile().text()}
  async getInfo() {return this.info ??= await io.stat(this.fsPath)}
  getBunFile() {return this.bunFile ??= Bun.file(this.fsPath)}
}

export class HttpDir extends hs.BaseHttpDir {get HttpFile() {return HttpFile}}
