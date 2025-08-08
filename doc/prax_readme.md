## Overview

{{codeHead}} provides a very simple and performant system for rendering DOM/XML/HTML. It was originally React-inspired, but semantics are much simpler and more universally useful.

Isomorphic SSR is supported via lightweight and performant {{featLink dom_shim}}. Pairing these modules together, and using custom DOM elements, provides a good foundation for hybrid SSR/SPA.

Supports observables and reactivity via the module {{featLink obs}}.

Short overview of features:

* Directly create DOM nodes.
  * No string templates.
  * No VDOM.
  * Can instantiate with `new`.
* Convenient syntax. Nice-to-use in plain JS.
  * No templates.
  * No string parsing.
  * No need for JSX. (Compatible with it.)
  * No need for a build system.
* Built-in reactivity with {{featLink obs}}.
* Can use native [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) for state.
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

For server-side rendering, see the section [SSR](#ssr) below.

Browser example:

```js
import * as p from '{{featUrl prax}}'

const {E} = p.Ren.main

const elem = E(`div`, {
  id: `main`,
  class: `outer`,
  chi: E(`p`, {
    class: `inner`
    chi: [`hello `, `world!`],
  }),
})

document.body.append(elem)

/*
The following elements (not strings) have been appended:

<div id="main" class="outer"><p class="inner">hello world!</p></div>
*/
```

Usage with custom elements:

```js
import * as p from '{{featUrl prax}}'
import * as dr from '{{featUrl dom_reg}}'

const {E} = p.Ren.main

class SomeLink extends dr.MixReg(HTMLAnchorElement) {
  init(href, text) {
    return E(this, {href, class: `link`, chi: text || href})
  }
}

document.body.append(
  new SomeLink().init(`/some-path`, `click me!`),
)
```

Reactivity:

```js
import * as l from '{{featUrl lang}}'
import * as p from '{{featUrl prax}}'
import * as ob from '{{featUrl obs}}'

const {E} = p.Ren.main
const obs0 = ob.obs({val: `hello`})
const obs1 = ob.obsRef(`world`)
const msg = ob.calc(() => obs0.val + ` ` + obs1.val)

/*
The renderer specially detects and supports functions and observables.
Any of the following will render the same message and update as needed.
*/

E(document.body, {chi: msg})
E(document.body, {chi: () => msg})
E(document.body, {chi: () => msg.val})
E(document.body, {chi: () => l.deref(msg)})
E(document.body, {chi: () => obs0.val + ` ` + obs1.val})
E(document.body, {chi: () => [obs0.val, ` `, obs1.val]})

document.body.appendChild(E(`span`, {chi: msg}))
document.body.appendChild(E(`span`, {chi: () => msg}))
document.body.appendChild(E(`span`, {chi: () => msg.val}))
document.body.appendChild(E(`span`, {chi: () => l.deref(msg)}))
document.body.appendChild(E(`span`, {chi: () => obs0.val + ` ` + obs1.val}))
document.body.appendChild(E(`span`, {chi: () => [obs0.val, ` `, obs1.val]}))

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
E(document.body, {chi: undefined})
```

Functions and observables can be passed to `E` just about anywhere:
* As the entire props.
* As any individual prop.
  * For props whose keys begin with `on`, functions are treated non-reactively and simply assigned to the element.
* As child nodes. They can be freely mixed with non-reactive children.

Prax encourages top-down rendering, bottom-up re-rendering. Render your elements once, then let the framework make updates in just the right places,
by passing functions or observable references in place of props or child nodes.

### SSR

For SSR (server-side rendering), Prax needs our lightweight DOM shim:

```js
import * as p from '{{featUrl prax}}'
import * as dg from '{{featUrl dom_global_shim}}'

const ren = new p.Ren({env: dg.global})
const {E} = ren

const elem = E(`div`, {
  id: `main`,
  class: `outer`,
  chi: E(`p`, {class: `inner`, chi: `hello world!`}),
})

console.log(elem.outerHTML)

/*
<div id="main" class="outer"><p class="inner">hello world!</p></div>
*/
```

For SSR/SPA hybrids, configure an [importmap](https://wicg.github.io/import-maps/) or [bundler](https://esbuild.github.io) to choose the right global "environment" and pass it to `Ren`. The rest will just work.

```js
import * as p from '{{featUrl prax}}'

// Your bundler or importmap needs to choose the right one.
import * as dg from '{{featUrl dom_global_shim}}'
import * as dg from '{{featUrl dom_global_native}}'

const ren = new p.Ren({env: dg.global})
const {E} = ren

// In both environments, this will be a DOM element.
// In SSR, it will be shimmed.
const elem = E(`div`, {
  id: `main`,
  class: `outer`,
  chi: E(`p`, {class: `inner`, chi: `hello world!`}),
})
```

Rendering a complete document with doctype:

```js
import * as p from '{{featUrl prax}}'
import * as dg from '{{featUrl dom_global_shim}}'

const ren = new p.Ren({env: dg.global})
const {E} = ren

const elem = E(`html`, {
  lang: `en`,
  chi: [
    E(`head`, {chi: [
      E(`link`, {rel: `stylesheet`, href: `/styles/main.css`}),
      E(`title`, {chi: `page title`}),
    ]}),
    E(`body`, {chi: E(`main`, {class: `main`, chi: `hello world!`})}),
  ],
})

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

{{api}}
