## Overview

[obs_dom.mjs](../obs_dom.mjs) allows [custom DOM elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to automatically subscribe to [observables](obs_readme.md) and automatically rerun updates on changes.

Updates are async-batched and run hierarchically, from ancestors to descendants. Scheduling is customizable.

Optionally combine with [`dom_reg`](dom_reg_readme.md) for automatic registration of element classes.

## TOC

* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as o from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.7/obs.mjs'
import * as od from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.7/obs_dom.mjs'
import * as dr from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.7/dom_reg.mjs'

const obs = o.obs({msg: `hello!`})

class MyElem extends dr.HTMLElement {
  constructor() {od.reac(new.target), super()}

  // Automatically runs on `.connectedCallback`.
  // Subscribes to observables. Reruns on changes.
  run() {
    this.textContent = obs.msg
  }
}

document.body.append(new MyElem())

obs.msg = `hello world!`
```

`reac(new.target)` idempotently patches the class, acting like multiple inheritance. Newer JS syntax makes it cleaner, but has less browser support:

```js
class MyElem extends dr.HTMLElement {
  static {reac(this)}
}
```

[Decorators](https://github.com/tc39/proposal-decorators) are even cleaner:

```js
@reac
class MyElem extends dr.HTMLElement {}
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

  * [`function reac`](../obs_dom.mjs#L5)
  * [`class ReacText`](../obs_dom.mjs#L7)
  * [`class FunText`](../obs_dom.mjs#L29)
