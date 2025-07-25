/* global Bun */

import * as l from './lang.mjs'
import * as io from './io_bun.mjs'
import * as hs from './http_shared.mjs'
export * from './http.mjs'
export * from './http_shared.mjs'

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
  file = undefined
  info = undefined
  body = undefined

  static async make(urlPath, fsPath) {
    l.reqScalar(urlPath)
    l.reqScalar(fsPath)

    const file = Bun.file(fsPath)
    if (!await file.exists()) return undefined

    const out = new this(urlPath, fsPath)
    out.file = file
    return out
  }

  async response(opt) {
    const {body, file} = this
    return new this.Res((body ?? file), await this.opt(opt))
  }

  async bytes() {return this.body ??= await this.file.bytes()}
  async stat() {return this.info ??= io.statNorm(await this.file.stat())}
  statSync() {return this.info ??= io.statNorm(io.statSync(this.fsPath))}
  async onlyFile() {return (await this.stat()).isFile ? this : undefined}
  async onlyDir() {return (await this.stat()).isDir ? this : undefined}
}

export class HttpDir extends hs.BaseHttpDir {get HttpFile() {return HttpFile}}
