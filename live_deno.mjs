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

import {main as clientMain} from './live_client.mjs'
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
    return h.resBui()
      .inp(`void ${clientMain.toString()}()`)
      .type(`application/javascript`)
      .corsAll()
      .res()
  }

  eventsRes(rou) {
    return h.resBui().inp(this.make(rou.req.signal)).typeEventStream().corsAll().res()
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
