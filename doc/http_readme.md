## Overview

{{codeHead}} provides essential tools for HTTP servers and clients:

* Shortcuts for making requests via native `fetch`.
* Cookie decoding and encoding.
* URL-based routing for SSR and SPA apps.

Also see {{featLink http_deno}} for Deno HTTP servers, {{featLink http_srv}} for generic tools for HTTP servers using native stream APIs, and {{featLink live_deno}} for live-reload tools for development.

## TOC

* [#Usage](#usage)
* [#API](#api)
* [#Misc](#misc)
{{toc}}

## Usage

```js
import * as h from '{{featUrl http}}'

const reqBody = {msg: `hello world`}
const resBody = await h.reqBui().to(`/api`).post().json(reqBody).fetchOkJson()
```

## API

{{api}}
