## Overview

{{codeHead}} allows [custom DOM elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to automatically subscribe to {{featLink obs observables}} and automatically rerun updates on changes.

Updates are async-batched and run hierarchically, from ancestors to descendants. Scheduling is customizable.

Optionally combine with {{featLink dom_reg}} for automatic registration of element classes.

## TOC

* [#Usage](#usage)
* [#API](#api)
{{toc}}

## Usage

```js
import * as o from '{{url}}/obs.mjs'
import * as od from '{{url}}/obs_dom.mjs'
import * as dr from '{{url}}/dom_reg.mjs'

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

{{api}}
