## Overview

[http_srv.mjs](../http_srv.mjs) provides miscellaneous tools useful for HTTP servers. It uses only standard web APIs which work in all environments. For environment-specific tools, see the following modules, which also re-export everything from this module:
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

The following APIs are exported but undocumented. Check [http_srv.mjs](../http_srv.mjs).

  * [`const EXT_TO_MIME_TYPE`](../http_srv.mjs#L15)
  * [`function guessContentType`](../http_srv.mjs#L40)
  * [`const COMPRESSIBLE`](../http_srv.mjs#L45)
  * [`class WritableReadableStream`](../http_srv.mjs#L53)
  * [`class WritableReadableByteStream`](../http_srv.mjs#L72)
  * [`function concatStreams`](../http_srv.mjs#L79)
  * [`class ConcatStreamSource`](../http_srv.mjs#L94)
  * [`class Broad`](../http_srv.mjs#L169)
  * [`function fileResponse`](../http_srv.mjs#L217)
  * [`class BaseHttpFile`](../http_srv.mjs#L243)
  * [`class BaseHttpDir`](../http_srv.mjs#L349)
  * [`class HttpDirs`](../http_srv.mjs#L433)
  * [`function slashPre`](../http_srv.mjs#L537)
  * [`function unslashPre`](../http_srv.mjs#L538)
  * [`function hasDotDot`](../http_srv.mjs#L539)
  * [`function etag`](../http_srv.mjs#L546)
  * [`function decodeAcceptEncoding`](../http_srv.mjs#L556)
  * [`const COMPRESSION_ALGOS`](../http_srv.mjs#L568)
  * [`const COMPRESSION_OPTS`](../http_srv.mjs#L570)
  * [`class HttpCompressor`](../http_srv.mjs#L589)
  * [`class CompressionStreamPolyfill`](../http_srv.mjs#L754)
  * [`class DecompressionStreamPolyfill`](../http_srv.mjs#L766)
