## Overview

[prax.mjs](../prax.mjs) provides a very simple and performant system for rendering DOM/XML/HTML. It was originally React-inspired, but semantics are much simpler and more universally useful.

Isomorphic SSR is supported via lightweight and performant [`dom_shim`](dom_shim_readme.md). Pairing these modules together, and using custom DOM elements, provides a good foundation for hybrid SSR/SPA.

Short overview of features:

  * Directly create DOM nodes.
    * No string templates.
    * No VDOM.
    * Can instantiate with `new`.
  * Convenient syntax. Nice-to-use in plain JS.
    * No templates.
    * No string parsing.
    * No need for JSX.
    * No need for a build system.
  * Render only once. Use native [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) for state.
    * Use [`dom_reg`](dom_reg_readme.md) for more convenient element registration.
  * Good for SSR/SPA hybrids.

Complemented by:

  * [`dom_shim`](dom_shim_readme.md) for SSR.
  * [`dom_reg`](dom_reg_readme.md) for registering custom elements in SSR.
  * [`obs_dom`](obs_dom_readme.md) for making custom elements automatically react to [observables](obs_readme.md).

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
  * [#SSR](#ssr)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

Rendering is done via `Ren`. You must create an instance, which should be a singleton. You can also subclass `Ren` and override individual methods to customize its behavior.

Browser example:

```js
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/prax.mjs'
import {A} from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/prax.mjs'

const ren = new p.Ren()
const E = ren.E.bind(ren)

const elem = E(`div`, {id: `main`, class: `outer`},
  E(`p`, {class: `inner`},
    `hello `,
    `world!`,
  ),
)

document.body.append(elem)

/*
The following elements (not strings) have been appended:

<div id="main" class="outer"><p class="inner">hello world!</p></div>
*/
```

For rendering to string, use `.outerHTML`:

```js
console.log(elem.outerHTML)

/*
<div id="main" class="outer"><p class="inner">hello world!</p></div>
*/
```

Usage with custom elements:

```js
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/prax.mjs'
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/dom_reg.mjs'

const ren = new p.Ren()
const E = ren.E.bind(ren)

class SomeLink extends dr.MixReg(HTMLAnchorElement) {
  init(href, text) {
    return E(this, {href, class: `link`}, text)
  }
}

document.body.append(
  new SomeLink().init(`/some-path`, `click me!`),
)
```

### SSR

For SSR (server-side rendering), Prax needs our lightweight DOM shim:

```js
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/prax.mjs'
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/dom_global_shim.mjs'

const ren = new p.Ren(dg.global.document)
const E = ren.E.bind(ren)

const elem = E(`div`, {id: `main`, class: `outer`},
  E(`p`, {class: `inner`}, `hello world!`),
)

console.log(elem.outerHTML)

/*
<div id="main" class="outer"><p class="inner">hello world!</p></div>
*/
```

For SSR/SPA hybrids, configure an [importmap](https://wicg.github.io/import-maps/) or [bundler](https://esbuild.github.io) to choose the right global `document` and pass it to `Ren`. The rest will just work.

```js
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/prax.mjs'

// Your bundler or importmap should choose the right one.
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/dom_global_shim.mjs'
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/dom_global_native.mjs'

const ren = new p.Ren(dg.global.document)
const E = ren.E.bind(ren)

// In both environments, this will be a DOM element.
// In SSR, it will be shimmed.
const elem = E(`div`, {id: `main`, class: `outer`},
  E(`p`, {class: `inner`}, `hello world!`),
)
```

Rendering a complete document with doctype:

```js
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/prax.mjs'
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.62/dom_global_shim.mjs'

const ren = new p.Ren(dg.global.document)
const E = ren.E.bind(ren)

const elem = E(`html`, {lang: `en`},
  E(`head`, null,
    E(`link`, {rel: `stylesheet`, href: `/styles/main.css`}),
    E(`title`, null, `page title`),
  ),
  E(`body`, null,
    E(`main`, {class: `main`}, `hello world!`),
  ),
)

console.log(p.DOCTYPE_HTML + elem.outerHTML)

/*
Formatted here for viewing convenience:

<!doctype html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="/styles/main.css" />
    <title>page title</title>
  </head>
  <body>
    <main class="main">hello world!</main>
  </body>
</html>
*/
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [prax.mjs](../prax.mjs).

  * [`const nsHtml`](../prax.mjs#L3)
  * [`const nsSvg`](../prax.mjs#L4)
  * [`const nsMathMl`](../prax.mjs#L5)
  * [`const BOOL`](../prax.mjs#L13)
  * [`const VOID`](../prax.mjs#L21)
  * [`class Ren`](../prax.mjs#L27)
  * [`class Raw`](../prax.mjs#L337)
  * [`class PropBui`](../prax.mjs#L384)
  * [`const DOCTYPE_HTML`](../prax.mjs#L531)
  * [`function isSeq`](../prax.mjs#L537)
  * [`function isNodable`](../prax.mjs#L541)
  * [`function reqNodable`](../prax.mjs#L542)
  * [`function isRaw`](../prax.mjs#L544)
  * [`function reqRaw`](../prax.mjs#L545)
  * [`function isNode`](../prax.mjs#L547)
  * [`function reqNode`](../prax.mjs#L548)
  * [`function isDocument`](../prax.mjs#L550)
  * [`function optDocument`](../prax.mjs#L558)
  * [`function reqDocument`](../prax.mjs#L559)
  * [`function isNamespaced`](../prax.mjs#L561)
  * [`function deref`](../prax.mjs#L564)
