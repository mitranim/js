## Overview

Kinda "JS standard library" that doesn't suck. Or sucks less than X, insert some alternative here.

Important ***non-features***:

  * Doesn't require Node or Deno.
  * Doesn't require TypeScript.
  * Doesn't require a transpiler.
  * Doesn't require a bundler.
  * Doesn't require NPM.
  * No external dependencies.
  * No prototype pollution.
  * No globals.
  * No slowness.

Important features:

  * Environment-independent. Runs in browsers, Deno, Node.
    * Approximate browser compatibility: evergreen, Safari 11+.
    * Node compatibility: 18+.
  * Compact and performant.
  * Relatively few source files.
  * Relatively clear source code.
  * Native JS modules. Can be imported by URL.

Alternatives that suck:

  * Using only built-ins.
  * Google Closure.
  * Deno stdlib.
  * Lodash.
  * Various other things.

## TOC

* [#Usage](#usage)
* [#Features](#features)
* [#Perf](#perf)
* [#License](#license)
* [#Misc](#misc)

## Usage

Uses native JS modules, which can be imported by URL in browsers and Deno. The truly lazy can import many core modules at once:

```js
import * as a from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.72/all.mjs'
```

Otherwise, import specific modules you need. See the list below. Example:

```js
import * as l from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.72/lang.mjs'
import * as s from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.72/str.mjs'
```

Also available on NPM:

```sh
npm i -E @mitranim/js
```

## Features

  * [`lang`](docs/lang_readme.md): type assertions and other essentials needed by all other code.
  * [`iter`](docs/iter_readme.md): tools for iteration and functional programming.
  * [`obj`](docs/obj_readme.md): tools for manipulating JS objects and plain dicts.
  * [`str`](docs/str_readme.md): tools for manipulating strings.
  * [`coll`](docs/coll_readme.md): extended versions of JS data structure classes, with better APIs.
  * [`url`](docs/url_readme.md): better URL implementation.
  * [`time`](docs/time_readme.md): tools for datetimes and intervals.
  * [`path`](docs/path_readme.md): various functions for working with FS paths.
  * [`dom`](docs/dom_readme.md): shortcuts for working with the DOM.
  * [`dom_shim`](docs/dom_shim_readme.md): lightweight and performant shim for DOM nodes and elements.
  * [`dom_global_shim`](docs/dom_global_shim_readme.md): shimmed DOM globals, interchangeable with `dom_global_native`
  * [`dom_global_native`](docs/dom_global_native_readme.md): native DOM globals, interchangeable with `dom_global_shim`
  * [`dom_reg`](docs/dom_reg_readme.md): shortcuts for registering custom DOM elements.
  * [`prax`](docs/prax_readme.md): simple system for rendering DOM elements. React-inspired syntax, better semantics and performance.
  * [`obs`](docs/obs_readme.md): observables and reactivity.
  * [`http`](docs/http_readme.md): shortcuts for the fetch/Response APIs, URL routing, cookie decoding/encoding.
  * [`http_deno`](docs/http_deno_readme.md): tools for HTTP servers running in Deno.
  * [`http_srv`](docs/http_srv_readme.md): streaming and broadcasting tools for generic HTTP servers.
  * [`live_deno`](docs/live_deno_readme.md): tools for live-reloading in development.
  * [`cli`](docs/cli_readme.md): essential tools for CLI apps.
  * [`test`](docs/test_readme.md): tools for testing and benchmarking.

Some other extremely useful features are undocumented for now. Docs are in progress.

## Perf

* Written carefully and with benchmarks.
* Balances optimization and code compactness.
* Tries to avoid ludicrous inefficiencies.
* Benchmarked only in V8 for now. (Engine used in Deno / Node / Chrome.)

## License

https://unlicense.org

## Misc

Contact me by opening an issue or via https://mitranim.com/#contacts.