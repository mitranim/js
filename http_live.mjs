/*
Environment-independent low-level tool for "live reloading". Implements a
broadcaster that can be plugged into any Deno or Bun server. The broadcaster
serves its client script, maintains client connections, and broadcasts events.
*/

import * as l from './lang.mjs'
import * as h from './http.mjs'
import * as u from './url.mjs'
import * as hs from './http_shared.mjs'
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

  res(req, path) {
    path = l.optStr(path) || u.toUrl(req.url).pathname
    if (path === LIVE_PATH_SCRIPT) return this.clientRes(req)
    if (path === LIVE_PATH_EVENTS) return this.eventsRes(req)
    if (path === LIVE_PATH_SEND) return this.sendRes(req)
    return undefined
  }

  clientRes() {
    return new Response(liveScript(), {headers: HEADERS_LIVE_SCRIPT})
  }

  eventsRes() {
    return new Response(this.make(), {headers: HEADERS_LIVE_EVENT_STREAM})
  }

  async sendRes(req) {
    await this.writeEvent(await req.text())
    return new Response()
  }

  onWriteErr(err) {
    if (h.isErrAbort(err)) return
    console.error(`[live]`, err)
  }
}

export class LiveClient extends l.Emp {
  constructor(src) {
    super()
    l.optRec(src)
    this.host = l.optScalar(src?.host)
    this.files = l.Emp()
    this.script = `<script type="module" src="${u.urlJoin(this.host, LIVE_PATH_SCRIPT)}"></script>`
  }

  sendJson(val) {return this.send(h.jsonEncode(val))}

  send(val) {
    const url = u.urlJoin(this.host, LIVE_PATH_SEND)
    return fetch(url, {method: h.POST, body: val}).then(h.resOk)
  }

  addFile(file) {
    const {fsPath, urlPath} = l.reqInst(file, hs.BaseHttpFile)
    this.files[l.reqStr(fsPath)] = l.reqStr(urlPath)
    return file
  }

  hasFile(path) {return l.reqStr(path) in this.files}
  fsPathToUrlPath(path) {return this.files[l.reqStr(path)]}

  withLiveScript(res) {
    if (!isResHtml(res)) return res
    return new Response(hs.concatStreams(res.body, this.script), res)
  }
}

export function withLiveScript(cli, res) {
  l.optInst(cli, LiveClient)
  if (!cli) return res
  return cli.withLiveScript(res)
}

const HEADERS_LIVE_SCRIPT = [
  ...h.HEADERS_CORS_PROMISCUOUS,
  [h.HEADER_NAME_CONTENT_TYPE, `application/javascript`],
]

const HEADERS_LIVE_EVENT_STREAM = [
  ...h.HEADERS_CORS_PROMISCUOUS,
  [h.HEADER_NAME_CONTENT_TYPE, `text/event-stream`],
  [`transfer-encoding`, `utf-8`],
]

export function isResHtml(res) {
  return (
    l.isInst(res, Response) &&
    matchContentType(res?.headers.get(h.HEADER_NAME_CONTENT_TYPE), h.MIME_TYPE_HTML)
  )
}

function matchContentType(src, exp) {
  src = strNorm(src)
  exp = strNorm(exp)
  return src === exp || src.startsWith(exp + `;`)
}

function strNorm(val) {return l.laxStr(val).trim().toLowerCase()}
