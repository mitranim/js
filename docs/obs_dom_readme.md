## Overview

[obs_dom.mjs](../obs_dom.mjs) allows [custom DOM elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to automatically subscribe to [observables](obs_readme.md) and automatically rerun updates on changes.

Updates are async-batched and run hierarchically, from ancestors to descendants. Scheduling is customizable.

Optionally combine with [`dom_reg`](dom_reg_readme.md) for automatic registration of element classes.

## TOC

* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

`MixReac` is a "mixin" that adds reactivity to the class:

```js
import * as o from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.21/obs.mjs'
import * as od from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.21/obs_dom.mjs'
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.21/dom_reg.mjs'

const obs = o.obs({msg: `hello!`})

class MyElem extends od.MixReac(dr.HTMLElement) {
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

document.body.append(
  new od.FunText(() => obs.msg)
)

obs.msg = `hello world!`
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [obs_dom.mjs](../obs_dom.mjs).

  * [`function MixReac`](../obs_dom.mjs#L11)
  * [`class ReacText`](../obs_dom.mjs#L26)
  * [`class FunText`](../obs_dom.mjs#L48)
  * [`class ReacMoebius`](../obs_dom.mjs#L65)
  * [`class Reac`](../obs_dom.mjs#L94)
  * [`class ElementReac`](../obs_dom.mjs#L114)
  * [`class TextReac`](../obs_dom.mjs#L128)
