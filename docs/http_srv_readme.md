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

  * [`const HEADER_NAME_ACCEPT_ENCODING`](../http_srv.mjs#L12)
  * [`const HEADER_NAME_CONTENT_ENCODING`](../http_srv.mjs#L13)
  * [`const HEADER_NAME_CORS_CREDENTIALS`](../http_srv.mjs#L14)
  * [`const HEADER_NAME_CORS_HEADERS`](../http_srv.mjs#L15)
  * [`const HEADER_NAME_CORS_METHODS`](../http_srv.mjs#L16)
  * [`const HEADER_NAME_CORS_ORIGIN`](../http_srv.mjs#L17)
  * [`const HEADER_NAME_ETAG`](../http_srv.mjs#L18)
  * [`const HEADER_NAME_HOST`](../http_srv.mjs#L19)
  * [`const HEADER_NAME_IF_MODIFIED_SINCE`](../http_srv.mjs#L20)
  * [`const HEADER_NAME_IF_NONE_MATCH`](../http_srv.mjs#L21)
  * [`const HEADER_NAME_LAST_MODIFIED`](../http_srv.mjs#L22)
  * [`const HEADER_NAME_ORIGIN`](../http_srv.mjs#L23)
  * [`const HEADER_NAME_VARY`](../http_srv.mjs#L24)
  * [`const HEADERS_CORS_PROMISCUOUS`](../http_srv.mjs#L26)
  * [`const EXT_TO_MIME_TYPE`](../http_srv.mjs#L41)
  * [`function guessContentType`](../http_srv.mjs#L66)
  * [`const COMPRESSIBLE`](../http_srv.mjs#L71)
  * [`class WritableReadableStream`](../http_srv.mjs#L81)
  * [`class WritableReadableByteStream`](../http_srv.mjs#L100)
  * [`function concatStreams`](../http_srv.mjs#L107)
  * [`class ConcatStreamSource`](../http_srv.mjs#L122)
  * [`class Broad`](../http_srv.mjs#L197)
  * [`function fileResponse`](../http_srv.mjs#L248)
  * [`class BaseHttpFile`](../http_srv.mjs#L279)
  * [`class BaseHttpDir`](../http_srv.mjs#L450)
  * [`class HttpDirs`](../http_srv.mjs#L534)
  * [`function slashPre`](../http_srv.mjs#L636)
  * [`function unslashPre`](../http_srv.mjs#L637)
  * [`function hasDotDot`](../http_srv.mjs#L638)
  * [`function etag`](../http_srv.mjs#L641)
  * [`function decodeAcceptEncoding`](../http_srv.mjs#L652)
  * [`const COMPRESSION_ALGOS`](../http_srv.mjs#L664)
  * [`const COMPRESSION_OPTS`](../http_srv.mjs#L666)
  * [`class HttpCompressor`](../http_srv.mjs#L685)
  * [`class CompressionStreamPolyfill`](../http_srv.mjs#L857)
  * [`class DecompressionStreamPolyfill`](../http_srv.mjs#L869)
