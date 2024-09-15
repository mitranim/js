/*
Implementation of "live reloading". Provides a broadcaster that can be
plugged into any Deno server. The broadcaster serves its client script,
maintains client connections, and broadcasts events.

Use `LiveDirs` to both serve files and filter FS events. This avoids duplication
between your file-serving and watch-filtering configs.

Simplified example of sending notifications to clients:

  import * as ld from '{{url}}/live_deno.mjs'
  import * as hd from '{{url}}/http_deno.mjs'

  const dirs = ld.LiveDirs.of(new hd.DirRel(`.`))
  const bro = new ld.LiveBroad()

  for await (const event of dirs.watchLive()) {
    await bro.writeEventJson(event)
  }
*/

import * as lc from './live_client.mjs'
import * as l from './lang.mjs'
import * as h from './http.mjs'
import * as hd from './http_deno.mjs'
import * as hs from './http_srv.mjs'
import * as io from './io_deno.mjs'
import * as p from './path.mjs'

export const LIVE_PATH = `/e8f2dcbe89994b14a1a1c59c2ea6eac7`

export class LiveBroad extends hs.Broad {
  get basePath() {return LIVE_PATH}
  get clientPath() {return p.posix.join(this.basePath, `live_client.mjs`)}
  get eventsPath() {return p.posix.join(this.basePath, `events`)}
  get sendPath() {return p.posix.join(this.basePath, `send`)}

  res(val) {
    const rou = h.toReqRou(val)
    if (rou.get(this.clientPath)) return this.clientRes(rou)
    if (rou.get(this.eventsPath)) return this.eventsRes(rou)
    if (rou.post(this.sendPath)) return this.sendRes(rou)
    return undefined
  }

  clientRes() {
    return new Response(
      `void ${lc.main.toString()}()`,
      {headers: HEADERS_LIVE_SCRIPT},
    )
  }

  eventsRes(rou) {
    return new Response(
      this.make(rou.req.signal),
      {headers: HEADERS_LIVE_EVENT_STREAM},
    )
  }

  async sendRes(rou) {
    await this.writeEvent(await rou.req.text())
    return rou.empty()
  }

  onWriteErr(err) {
    if (hd.isErrCancel(err) || hs.isStreamWriteErr(err)) return
    throw err
  }
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

export function dirs(...val) {return LiveDirs.of(...val)}

export class LiveDirs extends hd.Dirs {
  /*
  Watches the current working directory, converting Deno FS events to events
  understood by the live client:

    * Convert "kind" to "type".
    * Flatten "paths" into "path".
    * Convert absolute path to relative.
    * Convert Windows-style to Posix-style.
    * Resolve against relative directories.
    * Test against directory tests.

  The resulting events can be sent to the live client.
  */
  async *watchLive() {
    for await (const {kind: type, paths} of io.watchCwd()) {
      for (let path of paths) {
        path = this.fsPathToUrlPath(path)
        if (l.isSome(path)) yield {type, path}
      }
    }
  }
}

/*
Takes a URL for the "live" client script and an arbitrary response. If the
response is HTML, returns a modified response with an HTML script tag that
loads the live client. Otherwise returns the response as-is.

The client URL can be acquired from a `LiveBroad` instance, constructed via URL
tools, hardcoded, etc.
*/
export function withLiveClient(url, res) {
  if (isResHtml(res)) {
    return new Response(
      io.ConcatStreamSource.stream(res.body, script(url)),
      res,
    )
  }
  return res
}

/*
Interpolating arbitrary strings into HTML is a horrible malpractice. NEVER do
this in production code. ALWAYS use structured markup tools like our `prax.mjs`
module. However, in this case it would be an excessive dependency for such a
small use case. This is a development tool, the input should be trusted and
shouldn't contain characters that require escaping.
*/
function script(src) {
  return `<script type="module" src="${l.render(src)}"></script>`
}

// May consider moving to `http_srv.mjs` later.
function isResHtml(res) {
  return (
    l.isInst(res, Response) &&
    contentTypeMatch(res?.headers.get(h.HEADER_NAME_CONTENT_TYPE), h.MIME_TYPE_HTML)
  )
}

// May consider moving to `http_srv.mjs` later.
function contentTypeMatch(src, exp) {
  src = strNorm(src)
  exp = strNorm(exp)
  return src === exp || src.startsWith(exp + `;`)
}

function strNorm(val) {return l.laxStr(val).trim().toLowerCase()}
