## Overview

[obs.mjs](../obs.mjs) implements observables and reactivity.

* Nice-to-use in plain JS. Doesn't rely on decorators, TS features, etc.
* Easy to wire into any UI system.
* Automatic cleanup on GC via `FinalizationRegistry`.
* Tiny with no external dependencies.

Two types of observables are available:
* Proxy-based observables: `obs`: wraps any object in a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which monitors all its fields.
* Atomic single-value observables: `ObsRef`: only the `.val` getter and setter is observable.

Proxy-based observables via `obs`:
* Can wrap any object.
  * No subclassing needed.
  * No derived getters or setters.
  * No modifications to your objects.
  * Your objects remain pristine, exactly how you defined them.
* Accessing any field in a reactive context (see below) implicitly establishes subscriptions.
* Modifying any field triggers all subscribers.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#SSR considerations](#ssr_considerations)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

```js
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.66/obs.mjs'
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.66/dom_reg.mjs'

// Both types of observables are compatible with implicit monitoring.
const MSG = ob.obs({msg: `hello`})
const NAME = ob.obsRef(`world`)

class MyElem extends dr.MixReg(HTMLElement) {
  constructor() {
    super()

    // Contrived for demonstration purposes.
    this.msg = new Text()
    this.name = new Text()
    this.append(msg, ` `, name)

    /*
    Immediately runs each provided method in a reactive context. During each
    method call, any accessed observables implicitly become monitored by this
    element. The methods will rerun when the observables they monitor are
    triggered. In this case, that's when their fields are modified.

    You can pass any number of methods here, from 0 to N.

    Deinitialization happens automatically when the element is
    garbage-collected, via `FinalizationRegistry`.
    */
    ob.reac(this, this.onMsg, this.onName)
  }

  // Seriously worth remembering that the DOM is implicitly reactive too!
  onMsg() {this.msg.textContent = MSG.msg}
  onName() {this.name.textContent = NAME.val}
}

document.body.append(new MyElem())

/*
These modifications automatically trigger all subscribers monitoring the
observables, in this case a single instance of `MyElem`. DOM updates are
delayed, batched, and run hierarchically from ancestors to descendants.
In this case, the methods `onMsg` and `onName` will be invoked only once
more (each), and only one UI repaint will happen.
*/
MSG.msg = `welcome`
NAME.val = `home`
```

Reactivity is also available for `Text` nodes:

```js
const obs = o.obs({msg: `hello!`})

const text = od.reacText(() => obs.msg)

text instanceof Text // true

document.body.append(text)

obs.msg = `hello world!`
```

## SSR considerations

Implicit reactivity, as shown above, is extremely convenient for UI updates. This is especially true if your UI is rendered only on the client. However, if you're developing a hybrid SSR/SPA app, there are some gotchas to consider.

The ideal way of making web apps, from a user experience perspective, involves a combination of SSR with client-side interactivity; and the less JS, the better.

One of the biggest benefits of custom elements is how they can enable client-side interactive features by instantiating in-place from existing HTML markup. They can enrich SSR apps without forcing you to convert to a SPA. They're also well-suited for SSR/SPA hybrids, with the addition of a [`dom_shim`](dom_shim_readme.md) and a [rendering](prax_readme.md) compatible with both shimmed and native DOM.

For comparison, many other JS frameworks require you to re-render the entire markup on the client, which usually also requires re-fetching the source data, or inlining it into the HTML as JSON.

The hybrid approach forces some limitations. In particular, when custom elements activate from existing HTML markup, the client side of your application doesn't have the same data which was available to the server side. This is typically a good thing: less data transferred, fewer requests, and so on. This also means that for elements that react to observables, those observables are often not available during the initial activation. These issues _can_ be solved in special cases, for example by delaying the registration of custom element classes and creating the relevant global observables first. But in many cases, these issues are impractical to solve. Bottom line: observables are for client-only code.

## API

The docs are a work in progress. This module was originally ported from https://github.com/mitranim/espo, although the API has changed quite a bit. See that library's readme for more info.

### Undocumented

The following APIs are exported but undocumented. Check [obs.mjs](../obs.mjs).

  * [`const TRIG`](../obs.mjs#L4)
  * [`const SYM_PH`](../obs.mjs#L5)
  * [`const SYM_TAR`](../obs.mjs#L6)
  * [`const SYM_REC`](../obs.mjs#L7)
  * [`const SYM_RECS`](../obs.mjs#L8)
  * [`function isRunner`](../obs.mjs#L10)
  * [`function reqRunner`](../obs.mjs#L11)
  * [`function isTrigger`](../obs.mjs#L13)
  * [`function reqTrigger`](../obs.mjs#L14)
  * [`function obs`](../obs.mjs#L16)
  * [`function getPh`](../obs.mjs#L17)
  * [`function getTar`](../obs.mjs#L18)
  * [`class Que`](../obs.mjs#L33)
  * [`class ShardedQue`](../obs.mjs#L84)
  * [`class RunQue`](../obs.mjs#L99)
  * [`class ShardedRunQue`](../obs.mjs#L100)
  * [`class ShedSync`](../obs.mjs#L123)
  * [`class ShedAsync`](../obs.mjs#L141)
  * [`class ShedMicro`](../obs.mjs#L178)
  * [`class ShedMacro`](../obs.mjs#L182)
  * [`class WeakQue`](../obs.mjs#L195)
  * [`class TriggerWeakQue`](../obs.mjs#L236)
  * [`function obsRef`](../obs.mjs#L247)
  * [`class ObsRef`](../obs.mjs#L254)
  * [`class TypedObsRef`](../obs.mjs#L281)
  * [`class ObsPh`](../obs.mjs#L288)
  * [`class RecurRef`](../obs.mjs#L338)
  * [`class Recur`](../obs.mjs#L364)
  * [`class FunRecur`](../obs.mjs#L395)
  * [`class MethRecur`](../obs.mjs#L400)
  * [`class NodeMethRecur`](../obs.mjs#L416)
  * [`function nodeDepth`](../obs.mjs#L421)
  * [`class MethRecurs`](../obs.mjs#L427)
  * [`function reac`](../obs.mjs#L462)
  * [`function unreac`](../obs.mjs#L463)
  * [`function preferShed`](../obs.mjs#L465)
  * [`function preferSync`](../obs.mjs#L466)
  * [`function preferMicro`](../obs.mjs#L467)
  * [`function preferMacro`](../obs.mjs#L468)
  * [`function reacText`](../obs.mjs#L475)
  * [`class ReacText`](../obs.mjs#L477)
