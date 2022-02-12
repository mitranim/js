## Overview

{{codeHead}} provides tiny syntactic shortcuts for native `Request`/`Response`/`Headers`/`fetch`.

* Fluent builder-style API.
* Interoperable with built-ins.
* Shortcuts for common actions, such as:
  * Building HTTP requests.
    * A builder-style API is more concise and flexible than the native one.
  * Handling HTTP errors in responses.
    * Constructing descriptive exceptions with HTTP status and response text.

## TOC

* [#Usage](#usage)
* [#Misc](#misc)
* [#API](#api)
{{toc}}

## Usage

```js
import * as h from '{{url}}/http.mjs'

const reqBody = {msg: `hello world`}
const resBody = await h.reqBui().to(`/api`).post().json(reqBody).fetchOkJson()
```

## Misc

`Req..headers` is a null-prototype dict, rather than `Headers`, for performance and compatibility reasons. In Deno, many operations involving `Headers` are stupidly slow. Using plain dicts for headers seems to performs better, and is automatically compatible with object rest/spread and `Object.assign`.

Each header is stored as a single string. When appending, values are joined with `, `. This matches the limitations of the `Headers` and `fetch` APIs, which don't seem to support multiple occurrences of the same header.

## API

{{api}}
