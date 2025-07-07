## Overview

[obs.mjs](../obs.mjs) implements observables and reactivity.

* Nice-to-use in plain JS. Doesn't rely on decorators, TS features, etc.
* Easy to use in UI.
* Automatic cleanup on GC via `FinalizationRegistry`.
  * Requires ES2021 or higher.
* Tiny with no external dependencies.

Three types of observables are available:
* Proxy-based observables: `obs`: wraps any object in a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which monitors all its fields.
* Atomic single-value observables: `obsRef`: only the `.val` getter and setter is observable.
* Calculated observables via `calc`.

Proxy-based observables via `obs`:
* Can wrap any object.
  * No subclassing needed.
  * No derived getters or setters.
  * No modifications to your objects.
  * Your objects remain pristine, exactly how you defined them.
* Accessing any field in a reactive context (see below) implicitly establishes subscriptions.
* Modifying any field notifies all observers.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#Timing](#timing)
* [#Errors](#errors)
* [#SSR considerations](#ssr_considerations)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

* Instantiate observables for your app's data.
* Observe them by various tools provided by the library.
* Modify observables to notify observers.

Since the most common and important use of observables is UI updates, we start with a higher-level example that involves this library's DOM rendering module `prax`.

```js
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obs.mjs'
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/prax.mjs'

const obs0 = ob.obs({val: `hello`})
const obs1 = ob.obsRef(`world`)
const msg = ob.calc(() => obs0.val + ` ` + obs1.val)

// Default renderer.
const {E} = p.Ren.main

/*
The renderer has built-in support for observables and functions.
Any of the following will render the same message and update as needed.
*/

E(document.body, {chi: msg})
E(document.body, {chi: () => msg})
E(document.body, {chi: () => msg.val})
E(document.body, {chi: () => l.deref(msg)})
E(document.body, {chi: () => obs0.val + ` ` + obs1.val})
E(document.body, {chi: () => [obs0.val, ` `, obs1.val]})

document.body.appendChild(E(`span`, {chi: msg}))
document.body.appendChild(E(`span`, {chi: () => msg}))
document.body.appendChild(E(`span`, {chi: () => msg.val}))
document.body.appendChild(E(`span`, {chi: () => l.deref(msg)}))
document.body.appendChild(E(`span`, {chi: () => obs0.val + ` ` + obs1.val}))
document.body.appendChild(E(`span`, {chi: () => [obs0.val, ` `, obs1.val]}))

/*
These modifications automatically notify all observers monitoring the
observables. In browser environments, by default, the renderer uses the
scheduler `ob.ShedTask`, which delays its runs via `requestAnimationFrame`
and runs them hierarchically from ancestors to descendants. In this case,
despite having two observable modifications, each function will be invoked
only once, and only one UI repaint will happen.
*/
setTimeout(() => {
  obs0.val = `welcome to`
  obs1.val = `the future`
}, 1024)

/*
Remove all nodes. When the engine runs garbage collection, all observers will
be automatically deinitialized and removed from observable queues.
*/
E(document.body, {chi: undefined})
```

For operations with side effects, you can use lower-level procedural tools such as `recur`. Takes a function and an argument (in any order), and invokes it in a reactive context; future modifications of any observables accessed during the call will rerun the function.

The observer object returned by `recur` (instance of `ob.FunRecur`) is automatically deinitialized when garbage collected. Make sure to store it while you need it.

```js
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obs.mjs'
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/dom_reg.mjs'

const obs = ob.obs({msg: `hello world`})

class MyElem extends dr.MixReg(HTMLElement) {
  constructor() {
    super()
    this.rec = ob.recur(this, this.draw)
  }

  draw() {this.textContent = obs.msg}
}

document.body.appendChild(new MyElem())

setTimeout(() => {obs.msg = `welcome to the future`}, 1024)
```

`recur` doesn't require an object, you can just pass a function:

```js
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obs.mjs'

const obs = ob.obs({msg: `hello world`})

let rec = ob.recur(function test() {
  console.log(obs.msg)
})

setTimeout(() => {
  obs.msg = `welcome to the future`

  // You can stop the observer explicitly. But this is not required.
  // The library uses `FinalizationRegistry` for cleanup.
  // Note that this requires `ES2021` or higher.
  if (false) rec.deinit()

  // We're done with this observer, let GC reclaim it.
  // But make sure to keep it while you need it!
  rec = undefined
}, 1024)
```

`calc` and all "recur" variants hold their inputs strongly. This is because the their inputs are often instantiated inline and not held by user code.

## Timing

This library gives you fine-grained control over _when_ your observers will rerun on changes. 3 timing modes are provided:

* Synchronous (`ob.ShedSync.main`), with support for pausing and resuming.
* Microtasks (`ob.ShedMicro.main`) via [`queueMicrotask`](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) ([MDN guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)).
* Tasks (`ob.ShedTask.main`): prefers [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), falls back on `setTimeout`.

The important thing to know is that the "task" timing should be used for browser DOM updates, and should not be used for anything else. This library attempts to provide the right defaults.

The function `recur` uses microtasks by default, which can be changed via `ob.setDefaultShed`. It also has variants with explicit timing:
* `recurSync`
* `recurMicro`
* `recurTask`

All variants of "recur" first invoke the callback synchronously. The scheduling mode only affects the future reruns.

Inside observer callbacks, you can also change the scheduling mode via:
* `preferShed`
* `preferSync`
* `preferMicro`
* `preferTask`

`calc` uses synchronous scheduling in all environments. You can change that via the "prefer" functions, but async scheduling makes them "eventually consistent", allowing you to observe outdated calc states immeditely after modifying observables on which they depend.

### Advice for choosing the timing mode

For best results, you should understand the JS event loop, and how JS engines, especially browsers, schedule jobs. This [MDN guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model#job_queue_and_event_loop) might be a good start.

During the microtask phase, _more_ microtasks can be inserted into the phase. _All_ pending microtasks will complete before the nearest task.

Browsers have an additional feature: `requestAnimationFrame`, which schedules a task aligned with the rendering loop. This has a subtle distinction from tasks created via `setTimeout`.

For observable modifications which ultimately lead to UI updates, this is your ideal operation order:

```
┌──────────────────────────────────┐
│ data  → data  → data  →    UI    │
├───────┬───────┬───────┬──────────┤
│ micro │ micro │ micro │   task   │
└───────┴───────┴───────┴──────────┘
```

...Where data is modified in microtasks, and UI is modified in a single task, which was scheduled via `requestAnimationFrame`.

The sole purpose of async scheduling is to prevent expensive operations from running redundantly.

Consider an observer which watches multiple observables. Suppose several of them are modified synchronously "at once", from the perspective of the code doing that. If the observer is synchronous, and the synchronous scheduler is not paused (see below), it reruns repeatedly in-between these modifications, even several times for one observable if several of its fields are modified. This is often a complete waste.

On the other hand, if the observer is async, each synchronous observable modification idempotently places it in a queue (very cheaply), and it runs once.

Use the "task" mode (`recurTask`, `ShedTask`) for UI-updating observers. It runs just before a browser repaint, and avoids wasted reruns during the microtask phase.

Use the "micro" mode (`recurMicro`, `ShedMicro`) for operations which watch multiple observables and do not directly update the UI.

Use the "sync" mode (`recurSync`, `ShedSync`) for small, cheap non-UI operations, especially when only one observable is involved.

In the "task" phase, avoid modifying any UI observables. Otherwise, the following can happen:

* In the "sync" phase, some UI observable is modified.
* Some observers (in _any_ phase) modify the UI before the next repaint.
* Some misbehaving observer in the "task" phase modifies more UI observables.
* For non-synchronous UI-modifying observers, it is now too late to react to this change. They end up scheduling their update into the next frame.
* The UI is updated twice instead of once, and the intermediary partially-updated state flickers before the user's eyes.

### DOM rendering

Our DOM rendering module `prax.mjs` supports observables and implicit reactivity. See the example code above.

Every rendering call is entirely synchronous. When you pass functions or observable references into markup as "nodes", they are immediately called or dereferenced, placing the result in the DOM. In both cases, the renderer sets up a reactive context; any observables accessed during this call, if modified later, will cause a DOM update.

By default, it uses "task" scheduling (`ob.ShedTask.main`) in browsers, and "microtask" scheduling (`ob.ShedMicro.main`) in non-browsers.

### Pause and resume

The synchronous scheduler `ShedSync` can be paused to briefly prevent synchronous observers from running, and resumed to flush them all at once.

```js
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obs.mjs'

const obs = ob.obs({one: 10, two: 20})

const rec = ob.recurSync(function onChange() {
  console.log(`sum:`, obs.one + obs.two)
})

rec.run() // sum: 30

/*
Without pausing, the callback will run twice:
*/
obs.one = 30 // sum: 50
obs.two = 40 // sum: 70

/*
Pausing and resuming causes it to run just once.
Always use `try/finally` to prevent exceptions
from keeping the scheduler paused.
*/
const shed = ob.ShedSync.main
shed.pause()
try {
  // Notably, "sum: 90" is NOT printed here.
  obs.one = 50
  obs.two = 60
}
finally {
  shed.flush() // sum: 110
}
```

### Classes

Any class can become observable by wrapping the instance in `obs` straight in the constructor. Make sure to actually return the resulting object from the constructor.

```js
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obs.mjs'

class MyCls {constructor() {return ob.obs(this)}}

const val = new MyCls()

val instanceof MyCls // true

ob.isObsRef(val) // true
```

## Errors

In non-browser environments, exceptions in async scheduler callbacks crash the process. In browsers, they may lead to silent failures. In all environments, you should define your own error handling callbacks, with the logic appropriate for your app, and provide them to async schedulers.

Note that synchronous exceptions, such as during any initial call to `ob.recur`, are _not_ caught this way. This is intentional.

```js
import * as ob from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.76/obs.mjs'

ob.ShedMicro.main.onerror = console.error
ob.ShedTask.main.onerror = console.error

const obs = ob.obsRef()

const rec = ob.recur(function panic() {
  const {val} = obs
  if (val) throw val
})

obs.val = Error(`no longer crashes the process`)
```

## SSR considerations

Implicit reactivity, as shown above, is extremely convenient for UI updates. This is especially true if your UI is rendered only on the client. However, if you're developing a hybrid SSR/SPA app, there are some gotchas to consider.

The ideal way of making web apps, from a user experience perspective, involves a combination of SSR with client-side interactivity; and the less JS, the better.

One of the biggest benefits of custom elements is how they can enable client-side interactive features by instantiating in-place from existing HTML markup. They can enrich SSR apps without forcing you to convert to a SPA. They're also well-suited for SSR/SPA hybrids, with the addition of a [`dom_shim`](dom_shim_readme.md) and a [rendering system](prax_readme.md) compatible with both shimmed and native DOM.

For comparison, many other JS frameworks require you to re-render the entire markup on the client, which usually also requires re-fetching the source data, or inlining it into the HTML as JSON.

The hybrid approach forces some limitations. In particular, when custom elements activate from existing HTML markup, the client side of your application doesn't have the same data which was available to the server side. This is typically a good thing: less data transferred, fewer requests, and so on. This also means that for elements that react to observables, those observables are often not available during the initial activation. These issues _can_ be solved in special cases, for example by delaying the registration of custom element classes and creating the relevant global observables first. But in many cases, these issues are impractical to solve. Bottom line: observables are for client-side code.

That said, the observable system provided by this library works in all environments. It's up to you how to use it.

## API

The docs are a work in progress. This module was originally ported from https://github.com/mitranim/espo, although the API has changed quite a bit. See that library's readme for more info.

### Undocumented

The following APIs are exported but undocumented. Check [obs.mjs](../obs.mjs).

  * [`class DynRunRef`](../obs.mjs#L4)
  * [`const RUN_REF`](../obs.mjs#L8)
  * [`const HAS_DOM`](../obs.mjs#L10)
  * [`let UI_SHED`](../obs.mjs#L16)
  * [`function setUiShed`](../obs.mjs#L17)
  * [`function getUiShed`](../obs.mjs#L18)
  * [`let DEFAULT_SHED`](../obs.mjs#L22)
  * [`function setDefaultShed`](../obs.mjs#L23)
  * [`function getDefaultShed`](../obs.mjs#L24)
  * [`const PH`](../obs.mjs#L26)
  * [`const TAR`](../obs.mjs#L27)
  * [`const QUE`](../obs.mjs#L28)
  * [`function isRunner`](../obs.mjs#L30)
  * [`function optRunner`](../obs.mjs#L31)
  * [`function reqRunner`](../obs.mjs#L32)
  * [`function isObs`](../obs.mjs#L34)
  * [`function optObs`](../obs.mjs#L35)
  * [`function reqObs`](../obs.mjs#L36)
  * [`function isObsRef`](../obs.mjs#L38)
  * [`function optObsRef`](../obs.mjs#L39)
  * [`function reqObsRef`](../obs.mjs#L40)
  * [`function isQue`](../obs.mjs#L42)
  * [`function optQue`](../obs.mjs#L43)
  * [`function reqQue`](../obs.mjs#L44)
  * [`function obs`](../obs.mjs#L46)
  * [`function getPh`](../obs.mjs#L47)
  * [`function getTar`](../obs.mjs#L48)
  * [`function getQue`](../obs.mjs#L49)
  * [`function recur`](../obs.mjs#L51)
  * [`function recurSync`](../obs.mjs#L52)
  * [`function recurMicro`](../obs.mjs#L53)
  * [`function recurTask`](../obs.mjs#L54)
  * [`function recurShed`](../obs.mjs#L56)
  * [`function preferShed`](../obs.mjs#L62)
  * [`function preferSync`](../obs.mjs#L63)
  * [`function preferMicro`](../obs.mjs#L64)
  * [`function preferTask`](../obs.mjs#L65)
  * [`function nodeDepth`](../obs.mjs#L67)
  * [`class WeakerRef`](../obs.mjs#L73)
  * [`class RunRef`](../obs.mjs#L80)
  * [`class Que`](../obs.mjs#L94)
  * [`class ShardedQue`](../obs.mjs#L170)
  * [`class ShedSync`](../obs.mjs#L189)
  * [`class ShedAsync`](../obs.mjs#L211)
  * [`class ShedMicro`](../obs.mjs#L262)
  * [`class ShedTask`](../obs.mjs#L266)
  * [`class ObsPh`](../obs.mjs#L280)
  * [`class Obs`](../obs.mjs#L327)
  * [`function obsRef`](../obs.mjs#L336)
  * [`class ObsRef`](../obs.mjs#L343)
  * [`class TypedObsRef`](../obs.mjs#L357)
  * [`function calc`](../obs.mjs#L363)
  * [`class ObsCalc`](../obs.mjs#L365)
  * [`function MixScheduleRun`](../obs.mjs#L415)
  * [`class MixinScheduleRun`](../obs.mjs#L417)
  * [`function MixRecur`](../obs.mjs#L448)
  * [`class MixinRecur`](../obs.mjs#L450)
  * [`class Recur`](../obs.mjs#L486)
  * [`class FunRecur`](../obs.mjs#L488)
  * [`class CalcRecur`](../obs.mjs#L505)
