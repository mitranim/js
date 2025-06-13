## Overview

[prax.mjs](../prax.mjs) provides a very simple and performant system for rendering DOM/XML/HTML. It was originally React-inspired, but semantics are much simpler and more universally useful.

Isomorphic SSR is supported via lightweight and performant [`dom_shim`](dom_shim_readme.md). Pairing these modules together, and using custom DOM elements, provides a good foundation for hybrid SSR/SPA.

Supports observables and reactivity via the module [`obs`](obs_readme.md).

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
  * Can use native [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) for state.
    * Use [`dom_reg`](dom_reg_readme.md) for more convenient element registration.
  * Built-in reactivity with [`obs`](obs_readme.md).
  * Good for SSR/SPA hybrids.

Complemented by:

  * [`dom_shim`](dom_shim_readme.md) for SSR.
  * [`dom_reg`](dom_reg_readme.md) for registering custom elements in SSR.
  * [`obs`](obs_readme.md) for observables and implicit reactivity for elements.

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
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/prax.mjs'

const {E} = p.Ren.main

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
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/prax.mjs'
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/dom_reg.mjs'

const {E} = p.Ren.main

class SomeLink extends dr.MixReg(HTMLAnchorElement) {
  init(href, text) {
    return E(this, {href, class: `link`}, text)
  }
}

document.body.append(
  new SomeLink().init(`/some-path`, `click me!`),
)
```

Reactivity:

```js
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/obs.mjs'
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/prax.mjs'

const {E} = p.Ren.main
const obs0 = ob.obs({val: `hello`})
const obs1 = ob.obsRef(`world`)
const msg = ob.calc(() => obs0.val + ` ` + obs1.val)

/*
The renderer specially detects and supports functions and observables.
Any of the following will render the same message and update as needed.
*/

E(document.body, {}, msg)
E(document.body, {}, () => msg)
E(document.body, {}, () => msg.val)
E(document.body, {}, () => obs0.val + ` ` + obs1.val)
E(document.body, {}, () => [obs0.val, ` `, obs1.val])

document.body.appendChild(E(`span`, {}, msg))
document.body.appendChild(E(`span`, {}, () => msg))
document.body.appendChild(E(`span`, {}, () => msg.val))
document.body.appendChild(E(`span`, {}, () => obs0.val + ` ` + obs1.val))
document.body.appendChild(E(`span`, {}, () => [obs0.val, ` `, obs1.val]))

/*
These modifications automatically notify all observers monitoring the
observables. In browser environments, by default, the renderer uses the
scheduler `ob.ShedTask`, which delays its runs via `requestAnimationFrame`
and runs them hierarchically from ancestors to descendants. In this case,
despite having two observable modifications, each function will be invoked
only once, and only one UI repaint will happen.
*/
setTimeout(() => {
  obs0.val = `welcome to`
  obs1.val = `the future`
}, 1024)

/*
Remove all nodes. When the engine runs garbage collection, all observers will
be automatically deinitialized and removed from observable queues.
*/
E(document.body, {}, undefined)
```

### SSR

For SSR (server-side rendering), Prax needs our lightweight DOM shim:

```js
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/prax.mjs'
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/dom_global_shim.mjs'

const ren = new p.Ren(dg.global)
const {E} = ren

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
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/prax.mjs'

// Your bundler or importmap should choose the right one.
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/dom_global_shim.mjs'
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/dom_global_native.mjs'

const ren = new p.Ren(dg.global)
const {E} = ren

// In both environments, this will be a DOM element.
// In SSR, it will be shimmed.
const elem = E(`div`, {id: `main`, class: `outer`},
  E(`p`, {class: `inner`}, `hello world!`),
)
```

Rendering a complete document with doctype:

```js
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/prax.mjs'
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.70/dom_global_shim.mjs'

const ren = new p.Ren(dg.global)
const {E} = ren

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

In non-browser environments, observers are invoked synchronously by default. Modifying observables causes DOM updates as expected. The user code is responsible for making sure that they're done with observable modifications before rendering to string.

## API

### Undocumented

The following APIs are exported but undocumented. Check [prax.mjs](../prax.mjs).

  * [`const PROP_REC`](../prax.mjs#L5)
  * [`const PROP_KEYS`](../prax.mjs#L6)
  * [`const NS_HTML`](../prax.mjs#L8)
  * [`const NS_SVG`](../prax.mjs#L9)
  * [`const NS_MATH_ML`](../prax.mjs#L10)
  * [`const BOOL`](../prax.mjs#L18)
  * [`const VOID`](../prax.mjs#L26)
  * [`class Ren`](../prax.mjs#L32)
  * [`class Raw`](../prax.mjs#L422)
  * [`function MixInitRun`](../prax.mjs#L426)
  * [`class MixinInitRun`](../prax.mjs#L428)
  * [`class RecPropFun`](../prax.mjs#L447)
  * [`class RecPropRef`](../prax.mjs#L453)
  * [`function MixRecNode`](../prax.mjs#L476)
  * [`class MixinRecNode`](../prax.mjs#L478)
  * [`function MixRecNodeFun`](../prax.mjs#L548)
  * [`class MixinRecNodeFun`](../prax.mjs#L550)
  * [`function MixRecNodeRef`](../prax.mjs#L576)
  * [`class MixinRecNodeRef`](../prax.mjs#L578)
  * [`class PropBui`](../prax.mjs#L653)
  * [`const DOCTYPE_HTML`](../prax.mjs#L791)
  * [`function isSeq`](../prax.mjs#L797)
  * [`function isNodable`](../prax.mjs#L801)
  * [`function reqNodable`](../prax.mjs#L802)
  * [`function isRaw`](../prax.mjs#L804)
  * [`function reqRaw`](../prax.mjs#L805)
  * [`function isNode`](../prax.mjs#L807)
  * [`function reqNode`](../prax.mjs#L808)
  * [`function isDocument`](../prax.mjs#L810)
  * [`function optDocument`](../prax.mjs#L818)
  * [`function reqDocument`](../prax.mjs#L819)
  * [`function isDomEnv`](../prax.mjs#L821)
  * [`function optDomEnv`](../prax.mjs#L829)
  * [`function reqDomEnv`](../prax.mjs#L830)
  * [`function isNamespaced`](../prax.mjs#L832)
