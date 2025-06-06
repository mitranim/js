## Overview

[http_deno.mjs](../http_deno.mjs) provides essential tools for HTTP servers running in [Deno](https://deno.land).

* Tools for serving files (with content type detection) and directories (with optional file filtering / whitelisting / blacklisting).
* Tools for simple HTML file servers, with automatic matching of "clean" URL paths such as `/` and `/posts` to HTML files such as `index.html` and `posts.html`.

Also see [`http`](http_readme.md) for routing and cookies, and [`live_deno`](live_deno_readme.md) for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
  * [#Undocumented](#undocumented)

## Usage

Simple example of a server that serves files from the current directory, automatically matching URL paths to HTML files:

```js
import * as hd from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.65/http_deno.mjs'

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

### Undocumented

The following APIs are exported but undocumented. Check [http_deno.mjs](../http_deno.mjs).

  * [`const EXT_TO_MIME_TYPE`](../http_deno.mjs#L11)
  * [`function guessContentType`](../http_deno.mjs#L33)
  * [`class DirBase`](../http_deno.mjs#L35)
  * [`function dirAbs`](../http_deno.mjs#L70)
  * [`class DirAbs`](../http_deno.mjs#L72)
  * [`class DirRel`](../http_deno.mjs#L85)
  * [`function dirRel`](../http_deno.mjs#L104)
  * [`class DirRelFil`](../http_deno.mjs#L107)
  * [`class Dirs`](../http_deno.mjs#L119)
  * [`class HttpFileInfo`](../http_deno.mjs#L164)
  * [`class HttpFileStream`](../http_deno.mjs#L180)
  * [`class Fil`](../http_deno.mjs#L212)
  * [`function isErrCancel`](../http_deno.mjs#L222)
