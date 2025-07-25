## Overview

[http_shared.mjs](../http_shared.mjs) provides miscellaneous tools useful for HTTP servers. It uses only standard web APIs which work in all environments. For environment-specific tools, see the following modules, which also re-export everything from this module:
* [`http_bun`](http_bun_readme.md): tools for Bun servers.
* [`http_deno`](http_deno_readme.md): tools for Deno servers.

Also see [`http`](http_readme.md) for routing and cookies, and [`http_live`](http_live_readme.md) for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
  * [#Undocumented](#undocumented)

## API

### Undocumented

The following APIs are exported but undocumented. Check [http_shared.mjs](../http_shared.mjs).

  * [`const EXT_TO_MIME_TYPE`](../http_shared.mjs#L14)
  * [`function guessContentType`](../http_shared.mjs#L39)
  * [`const COMPRESSABLE`](../http_shared.mjs#L44)
  * [`class WritableReadableStream`](../http_shared.mjs#L52)
  * [`class WritableReadableByteStream`](../http_shared.mjs#L71)
  * [`function concatStreams`](../http_shared.mjs#L78)
  * [`class ConcatStreamSource`](../http_shared.mjs#L93)
  * [`class Broad`](../http_shared.mjs#L168)
  * [`class BaseHttpFile`](../http_shared.mjs#L220)
  * [`class BaseHttpDir`](../http_shared.mjs#L249)
  * [`class HttpDirs`](../http_shared.mjs#L324)
  * [`function slashPre`](../http_shared.mjs#L366)
  * [`function unslashPre`](../http_shared.mjs#L367)
  * [`function hasDotDot`](../http_shared.mjs#L368)
  * [`function etag`](../http_shared.mjs#L378)
  * [`function decodeAcceptEncoding`](../http_shared.mjs#L388)
  * [`class HttpCompressor`](../http_shared.mjs#L417)
