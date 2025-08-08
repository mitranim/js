/*
Environment-independent low-level tool for "live reloading". Implements a
broadcaster that can be plugged into any Deno or Bun server. The broadcaster
serves its client script, maintains client connections, and broadcasts events.
*/

import * as l from './lang.mjs'
import * as o from './obj.mjs'
import * as u from './url.mjs'
import * as h from './http.mjs'
import * as hs from './http_srv.mjs'
import * as lc from './live_client.mjs'

export const LIVE_PATH = `/e8f2dcbe89994b14a1a1c59c2ea6eac7`
export const LIVE_PATH_SCRIPT = u.urlJoin(LIVE_PATH, `live_client.mjs`).href
export const LIVE_PATH_EVENTS = u.urlJoin(LIVE_PATH, `events`).href
export const LIVE_PATH_SEND = u.urlJoin(LIVE_PATH, `send`).href

let LIVE_SCRIPT

export function liveScript() {
  return LIVE_SCRIPT ??= `void ${lc.main.toString()}()`
}

export class LiveBroad extends hs.Broad {
  get Stream() {return hs.WritableReadableByteStream}
  get Res() {return Response}

  constructor(opt) {
    l.optRec(opt)
    super()
    const Res = l.optCls(opt?.Res)
    if (Res) o.priv(this, `Res`, Res)
  }

  response({req, pathname}) {
    pathname = l.optStr(pathname) || u.toUrl(req.url).pathname
    if (pathname === LIVE_PATH_SCRIPT) return this.clientRes(req)
    if (pathname === LIVE_PATH_EVENTS) return this.eventsRes(req)
    if (pathname === LIVE_PATH_SEND) return this.sendRes(req)
    return undefined
  }

  clientRes() {
    return new this.Res(liveScript(), {headers: HEADERS_LIVE_SCRIPT})
  }

  eventsRes() {
    return new this.Res(this.make(), {headers: HEADERS_LIVE_EVENT_STREAM})
  }

  async sendRes(req) {
    await this.writeEvent(await req.text())
    return new this.Res()
  }

  onWriteErr(err) {
    if (h.isErrAbort(err)) return
    console.error(`[live]`, err)
  }
}

// Used for HMR.
const LIVE_FILES = Symbol.for(`live_files`)

export class LiveClient extends l.Emp {
  get Res() {return Response}

  constructor(opt) {
    super()
    const {hostname, port, hot, Res} = l.laxRec(opt)
    const url = u.url(l.renderLax(hostname) || `http://localhost`).setPort(port)
    this.hostname = url.hostname
    this.port = l.optNat(port)
    this.host = url.href
    this.sendUrl = url.setPath(LIVE_PATH_SEND).href
    this.hot = l.optBool(hot)
    this.files = hot && l.onlyNpo(globalThis[LIVE_FILES]) || l.Emp()
    this.script = `<script type="module" src="${url.setPath(LIVE_PATH_SCRIPT)}"></script>`
    if (l.optCls(Res)) o.priv(this, `Res`, Res)
  }

  send(val) {return fetch(this.sendUrl, {method: h.POST, body: val}).then(h.resOk)}

  sendJson(val) {return this.send(h.jsonEncode(val))}

  addFile(file) {
    if (l.isNil(file)) return undefined

    const {fsPath, urlPath} = l.reqRec(file)
    l.reqStr(fsPath)
    l.reqStr(urlPath)

    const {files, hot} = this
    if (files[fsPath]) return file

    this.files[fsPath] = urlPath
    if (hot) globalThis[LIVE_FILES] = files
    return file
  }

  hasFile(path) {return l.reqStr(path) in this.files}

  fsPathToUrlPath(path) {return this.files[l.reqStr(path)]}

  liveResponse(res) {
    if (!isResHtmlText(res)) return res
    return new this.Res(hs.concatStreams(res.body, this.script), res)
  }

  liveHtml(html) {return l.reqStr(html) + `\n` + this.script}
}

const HEADERS_LIVE_SCRIPT = [
  ...hs.HEADERS_CORS_PROMISCUOUS,
  [h.HEADER_NAME_CONTENT_TYPE, `application/javascript`],
]

const HEADERS_LIVE_EVENT_STREAM = [
  ...hs.HEADERS_CORS_PROMISCUOUS,
  [h.HEADER_NAME_CONTENT_TYPE, `text/event-stream`],
  [`transfer-encoding`, `utf-8`],
]

export function isResHtmlText(res) {
  return (
    l.isInst(res, Response) &&
    !res.headers.get(h.HEADER_NAME_CONTENT_ENCODING) &&
    matchContentType(res.headers.get(h.HEADER_NAME_CONTENT_TYPE), h.MIME_TYPE_HTML)
  )
}

function matchContentType(src, exp) {
  src = strNorm(src)
  exp = strNorm(exp)
  return src === exp || src.startsWith(exp + `;`)
}

function strNorm(val) {return l.laxStr(val).trim().toLowerCase()}
