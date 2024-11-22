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
import * as hd from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.60/http_deno.mjs'

const srv = new class Srv extends hd.Srv {
  // Serves files from the current folder, with no filtering.
  dirs = hd.Dirs.of(hd.dirRel(`.`))

  async res(req) {
    const rou = new h.ReqRou(req)

    return (
      (await this.dirs.resolveSiteFileWithNotFound(req.url))?.res() ||
      rou.notFound()
    )
  }
}()

await srv.listen({port: somePort})
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [http_deno.mjs](../http_deno.mjs).

  * [`class ContentTypeMap`](../http_deno.mjs#L12)
  * [`class DirBase`](../http_deno.mjs#L40)
  * [`function dirAbs`](../http_deno.mjs#L75)
  * [`class DirAbs`](../http_deno.mjs#L77)
  * [`class DirRel`](../http_deno.mjs#L90)
  * [`function dirRel`](../http_deno.mjs#L109)
  * [`class DirRelFil`](../http_deno.mjs#L112)
  * [`class Dirs`](../http_deno.mjs#L124)
  * [`class HttpFileInfo`](../http_deno.mjs#L169)
  * [`class HttpFileStream`](../http_deno.mjs#L186)
  * [`class Srv`](../http_deno.mjs#L219)
  * [`function errRes`](../http_deno.mjs#L292)
  * [`class Fil`](../http_deno.mjs#L295)
  * [`function isErrCancel`](../http_deno.mjs#L305)
