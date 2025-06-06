## Overview

{{codeHead}} provides a very simple and performant system for rendering DOM/XML/HTML. It was originally React-inspired, but semantics are much simpler and more universally useful.

Isomorphic SSR is supported via lightweight and performant {{featLink dom_shim}}. Pairing these modules together, and using custom DOM elements, provides a good foundation for hybrid SSR/SPA.

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
    * Use {{featLink dom_reg}} for more convenient element registration.
  * Good for SSR/SPA hybrids.

Complemented by:

  * {{featLink dom_shim}} for SSR.
  * {{featLink dom_reg}} for registering custom elements in SSR.
  * {{featLink obs}} for observables and implicit reactivity for elements.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
  * [#SSR](#ssr)
* [#API](#api)
{{toc}}

## Usage

Rendering is done via `Ren`. You must create an instance, which should be a singleton. You can also subclass `Ren` and override individual methods to customize its behavior.

Browser example:

```js
import * as p from '{{featUrl prax}}'
import {A} from '{{featUrl prax}}'

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
import * as p from '{{featUrl prax}}'
import * as dr from '{{featUrl dom_reg}}'

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
import * as p from '{{featUrl prax}}'
import * as dg from '{{featUrl dom_global_shim}}'

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
import * as p from '{{featUrl prax}}'

// Your bundler or importmap should choose the right one.
import * as dg from '{{featUrl dom_global_shim}}'
import * as dg from '{{featUrl dom_global_native}}'

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
import * as p from '{{featUrl prax}}'
import * as dg from '{{featUrl dom_global_shim}}'

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

{{api}}
