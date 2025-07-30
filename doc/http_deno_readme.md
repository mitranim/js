## Overview

{{codeHead}} provides essential tools for HTTP servers running in [Deno](https://deno.land). The API mirrors {{featLink http_bun}}.

* Tools for serving files (with content type detection) and directories (with optional file filtering / whitelisting / blacklisting).
* Tools for simple HTML file servers, with automatic matching of "clean" URL paths such as `/` and `/posts` to HTML files such as `index.html` and `posts.html`.

Also see {{featLink http}} for routing and cookies, {{featLink http_bun}} for Bun HTTP servers, and {{featLink http_live}} for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
{{toc}}

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

{{api}}
