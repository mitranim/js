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

  * [`function deinit`](../obs.mjs#L3)
  * [`function isDe`](../obs.mjs#L5)
  * [`function reqDe`](../obs.mjs#L6)
  * [`function isObs`](../obs.mjs#L8)
  * [`function reqObs`](../obs.mjs#L9)
  * [`function isTrig`](../obs.mjs#L11)
  * [`function reqTrig`](../obs.mjs#L12)
  * [`function isSub`](../obs.mjs#L14)
  * [`function reqSub`](../obs.mjs#L15)
  * [`function isSubber`](../obs.mjs#L17)
  * [`function reqSubber`](../obs.mjs#L18)
  * [`function isRunTrig`](../obs.mjs#L20)
  * [`function reqRunTrig`](../obs.mjs#L21)
  * [`function ph`](../obs.mjs#L23)
  * [`function self`](../obs.mjs#L24)
  * [`const keyPh`](../obs.mjs#L26)
  * [`const keySelf`](../obs.mjs#L27)
  * [`function de`](../obs.mjs#L29)
  * [`function obs`](../obs.mjs#L30)
  * [`function deObs`](../obs.mjs#L31)
  * [`class StaticProxied`](../obs.mjs#L33)
  * [`class Proxied`](../obs.mjs#L40)
  * [`class De`](../obs.mjs#L47)
  * [`class Obs`](../obs.mjs#L48)
  * [`class DeObs`](../obs.mjs#L49)
  * [`const ctx`](../obs.mjs#L51)
  * [`class Sched`](../obs.mjs#L75)
  * [`class ImpObs`](../obs.mjs#L121)
  * [`class Rec`](../obs.mjs#L150)
  * [`class Moebius`](../obs.mjs#L201)
  * [`class Loop`](../obs.mjs#L207)
  * [`class Ph`](../obs.mjs#L214)
  * [`class DeinitPh`](../obs.mjs#L281)
  * [`class ObsPh`](../obs.mjs#L292)
  * [`class DeObsPh`](../obs.mjs#L325)
  * [`function deinitAll`](../obs.mjs#L336)
