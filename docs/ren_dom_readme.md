## Overview

[ren_dom.mjs](../ren_dom.mjs) provides a very simple and performant system for rendering DOM nodes in the browser. The syntax is React-inspired and compatible with JSX, but the semantics are much simpler and more universally useful.

Partially isomorphic with [`ren_str`](ren_str_readme.md). Pairing these modules together, and using custom DOM elements for interactive behaviors, provides a good foundation for hybrid SSR/SPA. Read https://github.com/mitranim/prax for more.

This is a port and rework of https://github.com/mitranim/prax, more specifically its DOM component. The semantics are exactly the same. The top-level API is very similar. The underlying implementation is more flexible. Docs are in progress. Read the linked repo's docs to understand the motivation, use cases, and semantics.

Short overview of features:

  * Directly create DOM nodes.
    * No strings.
    * No VDOM.
  * Convenient syntax. Nice-to-use in plain JS.
    * No templates.
    * No string parsing.
    * No need for JSX.
    * No need for a build system.
  * Render only once. Use native [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) for state.
    * Use [`dom_reg`](dom_reg_readme.md) for automatic element registration.
    * Use shortcuts such as `mut` for DOM updates.
  * Partially isomorphic with [`ren_str`](ren_str_readme.md). Good for SSR/SPA hybrids.
  * Tiny with no external dependencies.

Complemented by:

  * [`ren_str`](ren_str_readme.md) for SSR.
  * [`dom_reg`](dom_reg_readme.md) for automatically registering custom elements.
  * [`obs_dom`](obs_dom_readme.md) for making custom elements automatically react to [observables](obs_readme.md).

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

Creating new nodes:

```js
import {E} from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.2/ren_dom.mjs'

document.body.append(
  E(`div`, {class: `outer`},
    E(`p`, {class: `inner`}, `hello world!`)
  )
)

/*
The following elements have been appended:

<div class="outer">
  <p class="inner">hello world!</p>
</div>
*/
```

Specialized syntax is available:

```js
import {A, ren} from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.2/ren_dom.mjs'
const {e} = ren

document.body.append(
  e.div(A.cls(`outer`),
    e.p(A.cls(`inner`), `hello world!`)
  )
)
```

Imperative updates:

```js
import {A} from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.2/ren_dom.mjs'
import * as r from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.2/ren_dom.mjs'
import * as dr from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.2/dom_reg.mjs'

class SomeLink extends dr.HTMLAnchorElement {
  constructor(href, text) {
    super()
    r.mut(this, A.href(href).cls(`link`), text)
  }
}

document.body.append(
  new SomeLink(`/some-path`, `click me!`)
)
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [ren_dom.mjs](../ren_dom.mjs).

  * [`function E`](../ren_dom.mjs#L5)
  * [`function S`](../ren_dom.mjs#L6)
  * [`function mut`](../ren_dom.mjs#L7)
  * [`function mutProps`](../ren_dom.mjs#L8)
  * [`function mutChi`](../ren_dom.mjs#L9)
  * [`class RenDom`](../ren_dom.mjs#L15)
  * [`class RenDomHtml`](../ren_dom.mjs#L174)
  * [`const ren`](../ren_dom.mjs#L178)
  * [`class RenDomSvg`](../ren_dom.mjs#L186)
