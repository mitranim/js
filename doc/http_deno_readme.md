## Overview

{{codeHead}} provides essential tools for HTTP servers running in [Deno](https://deno.land).

* Tools for serving files (with content type detection) and directories (with optional file filtering / whitelisting / blacklisting).
* Tools for simple HTML file servers, with automatic matching of "clean" URL paths such as `/` and `/posts` to HTML files such as `index.html` and `posts.html`.

Also see {{featLink http}} for routing and cookies, and {{featLink live_deno}} for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
{{toc}}

## Usage

Simple example of a server that serves files from the current directory, automatically matching URL paths to HTML files:

```js
import * as hd from '{{featUrl http_deno}}'

// Finds files in the current folder, with no filtering.
const DIRS = hd.Dirs.of(hd.dirRel(`.`))

async function handler(req) {
  const rou = new h.ReqRou(req)

  return (
    (await this.dirs.resolveSiteFileWithNotFound(req.url))?.res() ||
    rou.notFound()
  )
}

Deno.serve({handler})
```

## API

{{api}}
