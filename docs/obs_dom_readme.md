## Overview

[obs_dom.mjs](../obs_dom.mjs) allows [custom DOM elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to automatically subscribe to [observables](obs_readme.md) and automatically rerun updates on changes.

Updates are async-batched and run hierarchically, from ancestors to descendants. Scheduling is customizable.

Optionally combine with [`dom_reg`](dom_reg_readme.md) for automatic registration of element classes.

## TOC

* [#Usage](#usage)
* [#Limitations](#limitations)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

`MixReacElem` is a "mixin" that adds reactivity to the class:

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.63/obs.mjs'
import * as od from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.63/obs_dom.mjs'
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.63/dom_reg.mjs'

const obs = o.obs({msg: `hello!`})

class MyElem extends od.MixReacElem(dr.HTMLElement) {
  // Automatically runs on `.connectedCallback`.
  // Subscribes to observables. Reruns on changes.
  run() {this.textContent = obs.msg}
}

document.body.append(new MyElem())

obs.msg = `hello world!`
```

Reactivity is also available for `Text`:

```js
const obs = o.obs({msg: `hello!`})

document.body.append(od.reacText(() => obs.msg))

obs.msg = `hello world!`
```

## Limitations

This is intended and well-suited for SPA (single-page applications), or more generally, for custom elements which are client-only. This should be _avoided_ for any elements involved in _SSR_ (server-side rendering). Observable-based reactivity is fundamentally incompatible with the "ideal" way of using custom elements in apps featuring SSR.

One of the biggest benefits of custom elements is how they can enable client-side interactive features by instantiating in-place from existing HTML markup. (For comparison, many JS frameworks require you to re-render the entire markup on the client, which usually also requires re-fetching the source data, or inlining it into the HTML as JSON.) They can enrich SSR apps without forcing you to convert to a SPA. They're also well-suited for SSR/SPA hybrids, with the addition of a [`dom_shim`](dom_shim_readme.md) and a [rendering](prax_readme.md) compatible with both shimmed and native DOM.

However, this hybrid approach forces some limitations. In particular, when custom elements activate from existing HTML markup, the client side of your application doesn't have the same data which was available to the server side. This is typically a good thing, for a variety of reasons. This also means that for elements that react to changes in [observables](obs_readme.md), those observables are often not available during the initial activation. These issues _can_ be solved in special cases, for example by delaying the registration of custom element classes and creating the relevant global observables first. But in many cases, these issues are impractical to solve. Bottom line: observables are for client-only code.

## API

### Undocumented

The following APIs are exported but undocumented. Check [obs_dom.mjs](../obs_dom.mjs).

  * [`const SYM_REC`](../obs_dom.mjs#L5)
  * [`function reacText`](../obs_dom.mjs#L12)
  * [`class ReacText`](../obs_dom.mjs#L14)
  * [`function MixReacElem`](../obs_dom.mjs#L38)
  * [`class MixReacElemCache`](../obs_dom.mjs#L40)
  * [`const SYM_RECS`](../obs_dom.mjs#L59)
  * [`function MixReacsElem`](../obs_dom.mjs#L68)
  * [`class MixReacsElemCache`](../obs_dom.mjs#L70)
  * [`class NodeRecur`](../obs_dom.mjs#L99)
  * [`class ElemRecur`](../obs_dom.mjs#L116)
  * [`class FunElemRecur`](../obs_dom.mjs#L125)
  * [`const REG_DEINIT`](../obs_dom.mjs#L135)
  * [`function nodeDepth`](../obs_dom.mjs#L139)
  * [`function isNode`](../obs_dom.mjs#L146)
  * [`function reqNode`](../obs_dom.mjs#L147)
  * [`function isElement`](../obs_dom.mjs#L150)
  * [`function reqElement`](../obs_dom.mjs#L151)
