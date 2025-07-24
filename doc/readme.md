## Overview

Kinda "JS standard library" that doesn't suck. Or sucks less than X, insert some alternative here.

Important ***non-features***:

* Most modules run in all environments.
  * Some IO and HTTP modules are specific to Bun or Deno.
* Doesn't require TypeScript.
* Doesn't require a transpiler.
* Doesn't require a bundler.
* Doesn't require NPM.
* No external dependencies.
* No prototype pollution.
* No globals.
* No slowness.

Important features:

* Environment-independent. Runs in browsers, Bun, Deno, Node.
  * Approximate browser compatibility: evergreen, Safari 11+.
  * Bun compatibility: 1+.
  * Deno compatibility: 2+.
  * Node compatibility: 18+.
* Compact and performant.
* Relatively few source files.
* Relatively clear source code.
* Native JS modules.
  * Can be imported by URL in browsers and Deno.
  * Can be imported as an NPM module.
  * Compatible with all bundlers which support native modules.

Alternatives that suck:

* Using only built-ins.
* Google Closure.
* Deno stdlib.
* Lodash. (Can only be compared to `./iter.mjs`.)
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
import * as a from '{{url}}/all.mjs'
```

Otherwise, import specific modules you need. See the list below. Example:

```js
import * as l from '{{featUrl lang}}'
import * as s from '{{featUrl str}}'
```

Also available on NPM:

```sh
npm i -E @mitranim/js
```

Importing in Bun, Node, or when using bundlers:

```js
import * as a from '@mitranim/js/all.mjs'
```

## Features

{{features}}

Some other extremely useful features are undocumented for now. Docs are in progress.

## Perf

* Written carefully and with benchmarks.
* Balances optimization and code compactness.
* Avoids ludicrous inefficiencies.

## License

https://unlicense.org

## Misc

Contact me by opening an issue or via https://mitranim.com/#contacts.
