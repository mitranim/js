## Overview

[ren_dom.mjs](../ren_dom.mjs) provides a very simple and performant system for rendering DOM nodes in the browser. The syntax is React-inspired and compatible with JSX, but the semantics are much simpler and more universally useful.

This is a port and rework of https://github.com/mitranim/prax, more specifically its DOM component. The semantics are exactly the same. The top-level APIs are very similar. The underlying implementation is more flexible. Docs are in progress. Read the linked repo's docs to understand the motivation, use cases, and semantics.

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
    * Use [dom_reg](../ren_dom_readme.md) for automatic element registration.
    * Use shortcuts such as `mut` for DOM updates.
  * Tiny with no external dependencies.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

Creating new nodes:

```js
import {E} from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/ren_dom.mjs'

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

Shorter syntax:

```js
import {Ren} from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/ren_dom.mjs'

const t = Ren.main.tag

document.body.append(
  t.div({class: `outer`},
    t.p({class: `inner`}, `hello world!`)
  )
)
```

Imperative updates:

```js
import * as dr from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/dom_reg.mjs'
import * as x from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.1/ren_dom.mjs'

class SomeLink extends dr.HTMLAnchorElement {
  constructor(href, text) {
    super()
    x.mut(this, {class: `link`, href}, text)
  }
}

document.body.append(
  new SomeLink(`/some-path`, `click me!`)
)
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [ren_dom.mjs](../ren_dom.mjs).

  * [`function E`](../ren_dom.mjs#L3)
  * [`function S`](../ren_dom.mjs#L4)
  * [`function mut`](../ren_dom.mjs#L5)
  * [`function mutProps`](../ren_dom.mjs#L6)
  * [`function mutChi`](../ren_dom.mjs#L7)
  * [`class MakerPh`](../ren_dom.mjs#L9)
  * [`class TagPh`](../ren_dom.mjs#L20)
  * [`class TagnPh`](../ren_dom.mjs#L24)
  * [`class Ren`](../ren_dom.mjs#L34)
  * [`class RenSvg`](../ren_dom.mjs#L212)
  * [`class Raw`](../ren_dom.mjs#L225)
  * [`function merge`](../ren_dom.mjs#L265)
