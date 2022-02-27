## Overview

{{codeHead}} provides a very simple and performant system for rendering DOM nodes in the browser. The syntax is React-inspired and compatible with JSX, but the semantics are much simpler and more universally useful.

Partially isomorphic with {{featLink ren_str}}. Pairing these modules together, and using custom DOM elements for interactive behaviors, provides a good foundation for hybrid SSR/SPA. Read https://github.com/mitranim/prax for more.

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
    * Use {{featLink dom_reg}} for automatic element registration.
    * Use shortcuts such as `mut` for DOM updates.
  * Partially isomorphic with {{featLink ren_str}}. Good for SSR/SPA hybrids.
  * Tiny with no external dependencies.

Complemented by:

  * {{featLink ren_str}} for SSR.
  * {{featLink dom_reg}} for automatically registering custom elements.
  * {{featLink obs_dom}} for making custom elements automatically react to {{featLink obs observables}}.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#API](#api)
{{toc}}

## Usage

Creating new nodes:

```js
import {E} from '{{featUrl}}'

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
import {A, ren} from '{{featUrl}}'
const {e} = ren

document.body.append(
  e.div(A.cls(`outer`),
    e.p(A.cls(`inner`), `hello world!`)
  )
)
```

Imperative updates:

```js
import {A} from '{{featUrl}}'
import * as r from '{{featUrl}}'
import * as dr from '{{url}}/dom_reg.mjs'

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

{{api}}
