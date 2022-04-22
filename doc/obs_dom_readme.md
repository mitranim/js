## Overview

{{codeHead}} allows [custom DOM elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to automatically subscribe to {{featLink obs observables}} and automatically rerun updates on changes.

Updates are async-batched and run hierarchically, from ancestors to descendants. Scheduling is customizable.

Optionally combine with {{featLink dom_reg}} for automatic registration of element classes.

## TOC

* [#Usage](#usage)
* [#API](#api)
{{toc}}

## Usage

`MixReac` is a "mixin" that adds reactivity to the class:

```js
import * as o from '{{featUrl obs}}'
import * as od from '{{featUrl obs_dom}}'
import * as dr from '{{featUrl dom_reg}}'

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

{{api}}
