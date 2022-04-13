/*
This module has tools relevant for HTTP servers, using only standard web APIs
which are environment-independent and should work in service workers, Deno, and
with polyfills also in Node. For tools relevant for HTTP clients, see
`http.mjs`. For Deno-specific tools, see `http_deno.mjs`.
*/

import * as l from './lang.mjs'
import * as h from './http.mjs'

/*
Orkaround for the insane DOM stream API which seems to
provide NO WAY to make a reader-writer pair.
*/
export class WritableReadableStream extends ReadableStream {
  constructor(sig) {
    let ctr
    super({start: val => {ctr = val}})
    this.ctr = reqStreamController(ctr)
    this.sig = l.optInst(sig, AbortSignal)

    this.throwIfAborted()
    sig?.addEventListener(`abort`, this, {once: true})
  }

  /*
  Would prefer `this.sig?.throwIfAborted()`, but at the time of writing,
  it has very little browser support.
  */
  throwIfAborted() {if (this.sig?.aborted) throw new this.AbortError()}

  handleEvent(event) {
    if (event.type === `abort`) {
      event.target.removeEventListener(event.type, this)
      this.error(new this.AbortError())
      this.deinit()
    }
  }

  write(val) {return this.ctr.enqueue(val)}

  error(val) {return this.ctr.error(val)}

  /*
  Note: `.cancel` is intended for readers and is not allowed to close a locked
  stream; `.close` is intended for writers and does close a locked stream used
  by a reader. Controller `.close` is synchronous and void. WHATWG streams have
  non-idempotent close, throwing on repeated calls. We suppress their
  exceptions because we prefer idempotent, repeatable close.
  */
  close() {try {this.ctr.close()} catch {}}

  deinit() {return this.close()}

  get AbortError() {return h.AbortError}
}

/*
Short for "broadcaster". Maintains a set of writable/readable streams and allows
broadcasting to them. Uses the standard stream APIs, which are compatible with
Deno and browsers.
*/
export class Broad extends Set {
  /*
  The registered stream is not removed immediately when its signal is aborted,
  only when writing to it after abort. We may consider fixing this later, but
  it involves more code and more states which are tricky to get right. At the
  time of writing, Deno doesn't immediately abort request signals nor does it
  immediately invoke stream cancel, so it wouldn't even work for Deno servers.

  Relevant Deno issues:

    https://github.com/denoland/deno/issues/10829
    https://github.com/denoland/deno/issues/10854
  */
  make(sig) {
    const cli = new this.Stream(sig)
    this.add(cli)
    return cli
  }

  write(val) {
    val = this.toBytes(val)
    const buf = []
    for (const cli of this) buf.push(this.writeTo(cli, val))
    return Promise.all(buf)
  }

  writeJson(val) {return this.write(h.jsonEncode(val))}

  /*
  Writes text in the "event stream" message format.
  The input should be a single line without newlines.

  References:

    https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    https://developer.mozilla.org/en-US/docs/Web/API/EventSource
  */
  writeEvent(val) {return this.write(eventSourceLine(val))}

  writeEventJson(val) {return this.writeEvent(h.jsonEncode(val))}

  async writeTo(cli, val) {
    try {
      await cli.write(val)
    }
    catch (err) {
      this.delete(cli)
      cli.deinit()
      this.onWriteErr(err)
    }
  }

  onWriteErr(err) {
    if (h.isErrAbort(err) || isStreamWriteErr(err)) return
    throw err
  }

  /*
  Even though the stream API supports strings, encoding to bytes seems to be
  required in Deno. Unclear if required in other environments. Using strings
  produces cryptic and unhelpful errors.

  Perf note: `new TextEncoder` is not nearly as expensive as actual encoding.
  Unclear if we should cache an instance.
  */
  toBytes(val) {
    if (l.isInst(val, Uint8Array)) return val
    if (l.isStr(val)) return new TextEncoder().encode(val)
    throw l.errConv(val, `bytes`)
  }

  deinit() {
    for (const cli of this) {
      this.delete(cli)
      cli.deinit()
    }
  }

  get Stream() {return WritableReadableStream}
}

function isStreamController(val) {return l.hasMeth(val, `enqueue`) && l.hasMeth(val, `close`)}
function reqStreamController(val) {return l.req(val, isStreamController)}

function eventSourceLine(val) {return `data: ` + l.reqStr(val) + `\n\n`}

export function isStreamWriteErr(val) {
  return l.isInst(val, TypeError) && val.message.includes(`stream controller cannot close or enqueue`)
}
