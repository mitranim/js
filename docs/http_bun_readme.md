## Overview

[http_bun.mjs](../http_bun.mjs) provides essential tools for HTTP servers running in [Bun](https://bun.com). The API mirrors [`http_deno`](http_deno_readme.md).

* Tools for serving files (with content type detection) and directories (with optional file filtering / whitelisting / blacklisting).
* Tools for simple HTML file servers, with automatic matching of "clean" URL paths such as `/` and `/posts` to HTML files such as `index.html` and `posts.html`.

Also see [`http`](http_readme.md) for routing and cookies, [`http_deno`](http_deno_readme.md) for Deno HTTP servers, and [`http_live`](http_live_readme.md) for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
  * [#Undocumented](#undocumented)

## Usage

Simple example of a server that serves files from the current directory, automatically matching URL paths to HTML files:

```js
import * as h from '@mitranim/js/http'

// Resolves files relatively to the current folder.
const DIRS = h.HttpDirs.of(new h.HttpDir({fsPath: `.`}))

h.serve({onRequest})

async function onRequest(req) {
  const path = new URL(req.url).pathname

  return (
    (await serveFile(req, path)) ||
    new Response(`not found`, {status: 404})
  )
}

async function serveFile(req, path) {
  const file = await DIRS.resolveSiteFileWithNotFound(path)
  return file?.response()
}
```

For production, enable compression and caching:

```js
import * as h from '@mitranim/js/http'

const DIRS = h.HttpDirs.of(new h.HttpDir({fsPath: `.`}))
const COMP = new h.HttpCompressor()

DIRS.setOpt({caching: true})

h.serve({onRequest})

async function onRequest(req) {
  const path = new URL(req.url).pathname

  return (
    (await serveFile(req, path)) ||
    new Response(`not found`, {status: 404})
  )
}

async function serveFile(req, path) {
  return h.fileResponse({
    req,
    file: await DIRS.resolveSiteFileWithNotFound(path),
    compressor: COMP,
  })
}
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [http_bun.mjs](../http_bun.mjs).

  * [`function serve`](../http_bun.mjs#L9)
  * [`function srvUrl`](../http_bun.mjs#L18)
  * [`class HttpFile`](../http_bun.mjs#L20)
  * [`class HttpDir`](../http_bun.mjs#L46)
