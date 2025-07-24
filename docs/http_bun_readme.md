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
import * as hb from '@mitranim/js/http_bun.mjs'

// Finds files in the current folder, with no filtering.
const DIRS = hb.HttpDirs.of(new hb.HttpDir(`.`))

async function respond(req) {
  const path = new URL(req.url).pathname

  return (
    (await DIRS.resolveSiteFileWithNotFound(path))?.res() ||
    new Response(`not found`, {status: 404})
  )
}

Bun.serve({fetch: respond})
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [http_bun.mjs](../http_bun.mjs).

  * [`function serve`](../http_bun.mjs#L10)
  * [`function srvUrl`](../http_bun.mjs#L19)
  * [`class HttpFile`](../http_bun.mjs#L21)
  * [`class HttpDir`](../http_bun.mjs#L55)
