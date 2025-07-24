/* global Bun */

import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as h from './http.mjs'
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

  static async make(urlPath, fsPath) {
    l.reqScalar(urlPath)
    l.reqScalar(fsPath)

    const file = Bun.file(fsPath)
    if (!await file.exists()) return undefined

    const out = new this(urlPath, fsPath)
    out.file = file
    return out
  }

  async res(opt) {
    const res = new Response(this.file, this.opt(opt))
    this.setHeaders(res.headers)
    return res
  }

  stat() {return this.info ??= this.file.stat()}
  async onlyFile() {return (await this.stat()).isFile() ? this : undefined}
  async onlyDir() {return (await this.stat()).isDirectory() ? this : undefined}

  // Not used automatically. User code can opt in.
  async etag() {
    const {size, mtimeMs, birthtimeMs} = await this.file.stat()
    const out = s.dashed(birthtimeMs?.valueOf(), mtimeMs?.valueOf(), size)
    return out && (`W/` + h.jsonEncode(out))
  }
}

export class HttpDir extends hs.BaseHttpDir {get HttpFile() {return HttpFile}}
