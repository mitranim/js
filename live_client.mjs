/*
Client for "live reloading" in browsers.
Served and fed by the broadcaster in `live_deno.mjs`.

Limitations:

  * Currently doesn't support `<base>`.
*/

export function main() {
  class Client {
    constructor() {
      this.url = new URL(import.meta.url)
      this.delay = 1024
      this.req = undefined
      this.timer = undefined
    }

    reinit() {
      this.deinit()
      const req = this.req = new EventSource(new URL(`events`, this.url))
      req.onmessage = this.onNetMsg.bind(this)
      req.onerror = this.onNetErr.bind(this)
    }

    deinit() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = undefined
      }

      if (this.req) {
        this.req.close()
        this.req = undefined
      }
    }

    onNetErr() {
      this.deinit()
      this.timer = setTimeout(this.reinit.bind(this), this.delay)
    }

    onNetMsg(event) {
      this.onMsg(JSON.parse(event.data || `null`))
    }

    get key() {return this.url.searchParams.get(`key`)}

    isMsgAllowed(msg) {return !!(msg && eq(msg.key, this.key))}

    onMsg(msg) {
      if (!this.isMsgAllowed(msg)) return
      const {type} = msg

      if (type === `deinit`) {this.deinit(); return}
      if (this.isChangeType(type)) {this.onChange(msg); return}
    }

    isChangeType(val) {
      return (
        val === `change` || // Used by Node.
        val === `rename` || // Used by Node.
        val === `modify`    // Used by Deno.
      )
    }

    onChange(msg) {
      const ext = extName(msg.path)
      if (ext === `.map`) return
      if (ext === `.css`) {this.onCssChange(msg); return}
      window.location.reload()
    }

    /*
    This may be triggered multiple times concurrently. We must handle the case
    where multiple links reload the same stylesheet at once, racing each other.
    */
    onCssChange({path}) {
      const next = document.createElement(`link`)
      next.rel = `stylesheet`
      next.href = path
      next.href = salted(next.href)

      const prev = similarStylesheets(next)
      if (!prev.length || prev.some(isPending)) return

      next.onload = linkOnLoad
      next.onerror = next.remove
      last(prev).insertAdjacentElement(`afterend`, next)
    }
  }

  new Client().reinit()

  function similarStylesheets(next) {
    const path = new URL(next.href).pathname

    return filter(
      document.head.querySelectorAll(`link[rel=stylesheet]`),
      prev => new URL(prev.href).pathname === path,
    )
  }

  function linkOnLoad() {
    this.onload = null
    this.onerror = null

    for (const node of similarStylesheets(this)) {
      if (node !== this) node.remove()
    }
  }

  function isPending(val) {return !!val.onload}

  function salted(val) {
    val = new URL(val)
    val.search = val.search || salt()
    return val
  }

  function salt() {
    return String(Math.random()).replace(/\d*\./, ``).slice(0, 6)
  }

  function extName(path = ``) {
    const match = path.match(/.([.][^.]+)$/)
    return !match ? `` : match[1]
  }

  function eq(a, b) {return Object.is(a ?? undefined, b ?? undefined)}
  function last(list) {return list[list.length - 1]}
  function filter(list, fun) {return Array.prototype.filter.call(list ?? [], fun)}
}
