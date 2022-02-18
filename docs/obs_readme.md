## Overview

[obs.mjs](../obs.mjs) implements observables via [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). This is a stripped-down version of https://github.com/mitranim/espo. The core API is identical. Check the readme in the linked repo.

Short overview of features:

  * Any object can be made observable. Subclassing is available but not required.
  * Sub/resub can be made invisible and completely automatic, just by accessing properties.
  * Trigger can be completely invisible and automatic, by property modification.
  * Arbitrary properties can be observed. No need for special annotations.
    * Non-enumerable properties are exempt. This provides an opt-out.
  * Implicit resource cleanup: automatically calls `.deinit()` on removed/replaced objects.
  * Your objects are squeaky clean, with no added library junk other than mandatory `.deinit()`.
  * Nice-to-use in plain JS. Doesn't rely on decorators, TS features, etc.
  * Easy to wire into any UI system.
  * Tiny with no external dependencies.

## TOC

* [#Overview](#overview)
* [#API](#api)
  * [#Undocumented](#undocumented)

## API

Until the docs are fully migrated, see https://github.com/mitranim/espo. The core API is identical.

### Undocumented

The following APIs are exported but undocumented. Check [obs.mjs](../obs.mjs).

  * [`function isDe`](../obs.mjs#L3)
  * [`function isObs`](../obs.mjs#L4)
  * [`function isTrig`](../obs.mjs#L5)
  * [`function isSub`](../obs.mjs#L6)
  * [`function isSubber`](../obs.mjs#L7)
  * [`function isRunTrig`](../obs.mjs#L8)
  * [`function reqDe`](../obs.mjs#L10)
  * [`function reqObs`](../obs.mjs#L11)
  * [`function reqTrig`](../obs.mjs#L12)
  * [`function reqSub`](../obs.mjs#L13)
  * [`function reqSubber`](../obs.mjs#L14)
  * [`function reqRunTrig`](../obs.mjs#L15)
  * [`function ph`](../obs.mjs#L17)
  * [`function self`](../obs.mjs#L18)
  * [`function deinit`](../obs.mjs#L19)
  * [`function de`](../obs.mjs#L21)
  * [`function obs`](../obs.mjs#L22)
  * [`function comp`](../obs.mjs#L23)
  * [`function lazyComp`](../obs.mjs#L24)
  * [`class Deinit`](../obs.mjs#L26)
  * [`class Obs`](../obs.mjs#L27)
  * [`class Comp`](../obs.mjs#L28)
  * [`class LazyComp`](../obs.mjs#L29)
  * [`const ctx`](../obs.mjs#L33)
  * [`const keyPh`](../obs.mjs#L50)
  * [`const keySelf`](../obs.mjs#L51)
  * [`class Rec`](../obs.mjs#L53)
  * [`class Moebius`](../obs.mjs#L98)
  * [`class Loop`](../obs.mjs#L104)
  * [`class DeinitPh`](../obs.mjs#L110)
  * [`class ObsBase`](../obs.mjs#L135)
  * [`class ObsPh`](../obs.mjs#L166)
  * [`class LazyCompPh`](../obs.mjs#L200)
  * [`class CompPh`](../obs.mjs#L231)
  * [`class CompRec`](../obs.mjs#L235)
  * [`class Sched`](../obs.mjs#L254)
  * [`const sch`](../obs.mjs#L276)
