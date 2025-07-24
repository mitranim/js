## Overview

{{codeHead}} provides essential tools for HTTP servers running in [Bun](https://bun.com). The API mirrors {{featLink http_deno}}.

* Tools for serving files (with content type detection) and directories (with optional file filtering / whitelisting / blacklisting).
* Tools for simple HTML file servers, with automatic matching of "clean" URL paths such as `/` and `/posts` to HTML files such as `index.html` and `posts.html`.

Also see {{featLink http}} for routing and cookies, {{featLink http_deno}} for Deno HTTP servers, and {{featLink http_live}} for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
{{toc}}

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

{{api}}
