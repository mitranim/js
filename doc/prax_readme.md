## Overview

{{codeHead}} provides a very simple and performant system for rendering DOM elements. Syntax is React-inspired but semantics are much simpler and more universally useful. JSX-compatible syntax is available.

Isomorphic server-side rendering is supported via lightweight and performant {{featLink dom_shim}}. Pairing these modules together, and using custom DOM elements, provides a good foundation for hybrid SSR/SPA.

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
    * Use {{featLink dom_reg}} for automatic element registration.
  * Good for SSR/SPA hybrids.

Complemented by:

  * {{featLink dom_shim}} for SSR.
  * {{featLink dom_reg}} for automatically registering custom elements.
  * {{featLink obs_dom}} for making custom elements automatically react to {{featLink obs observables}}.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
  * [#SSR](#ssr)
* [#API](#api)
{{toc}}

## Usage

Rendering is done by `Ren`. You must create an instance, which should be a singleton. You can also subclass `Ren` and override individual methods to customize its behavior.

Browser example:

```js
import {Ren, A} from '{{featUrl prax}}'

const ren = new Ren(document).patchProto(Element)
const {E} = ren

document.body.append(
  E.div.props(A.id(`main`).cls(`outer`)).chi(
    E.p.props(A.cls(`inner`)).chi(
      `hello `,
      `world!`,
    ),
  ),
)

/*
The following elements (not strings) have been appended:

<div id="main" class="outer">
  <p class="inner">hello world!</p>
</div>
*/
```

For string rendering, use `.outerHTML`:

```js
import {Ren, A} from '{{featUrl prax}}'

const ren = new Ren(document).patchProto(Element)
const {E} = ren

// Note the `.outerHTML` call at the end.
console.log(
  E.div.props(A.id(`main`).cls(`outer`)).chi(
    E.p.props(A.cls(`inner`)).chi(
      `hello `,
      `world!`,
    ),
  ).outerHTML,
)

/*
<div id="main" class="outer">
  <p class="inner">hello world!</p>
</div>
*/
```

Usage with custom elements. The methods `.props` and `.chi` are provided by patching the prototype of the given base element class, which is entirely opt-in.

```js
import {Ren, A} from '{{featUrl prax}}'
import * as dr from '{{featUrl dom_reg}}'

const ren = new Ren(document).patchProto(Element)

class SomeLink extends dr.MixReg(HTMLAnchorElement) {
  init(href, text) {
    return this
      .props(A.href(href).cls(`link`))
      .chi(text)
  }
}

document.body.append(
  new SomeLink().init(`/some-path`, `click me!`),
)
```

### SSR

For SSR/SPA hybrids, configure an [importmap](https://wicg.github.io/import-maps/) or [bundler](https://esbuild.github.io) to choose the right "dom globals" for the right environment, and pass those globals to the `Ren` you're instantiating. The rest will just work.

```js
import * as p from '{{featUrl prax}}'

// Choose the right one.
import * as dg from '{{featUrl dom_glob_shim}}'
import * as dg from '{{featUrl dom_glob_native}}'

const ren = new p.Ren(dg.document).patchProto(dg.glob.Element)
```

Rendering a complete document with doctype:

```js
import * as p from '{{featUrl prax}}'
import {A} from '{{featUrl prax}}'
import * as dg from '{{featUrl dom_glob_shim}}'

const ren = new p.Ren(dg.document).patchProto(dg.glob.Element)
const {E} = ren

console.log(p.renderDocument(
  E.html.props(A.lang(`en`)).chi(
    E.head.chi(
      E.link.props(A.rel(`stylesheet`).href(`/styles/main.css`)),
      E.title.chi(`page title`),
    ),
    E.body.chi(
      E.main.props(A.cls(`main`)).chi(
        `hello world!`,
      ),
    ),
  ),
))

/*
<!doctype html><html lang="en"><head><link rel="stylesheet" href="/styles/main.css" /><title>page title</title></head><body><main class="main">hello world!</main></body></html>
*/
```

## API

{{api}}
