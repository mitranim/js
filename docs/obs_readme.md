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
  * [`function isDe`](../obs.mjs#L6)
  * [`function reqDe`](../obs.mjs#L7)
  * [`function isObs`](../obs.mjs#L9)
  * [`function reqObs`](../obs.mjs#L10)
  * [`function isTrig`](../obs.mjs#L12)
  * [`function reqTrig`](../obs.mjs#L13)
  * [`function isSub`](../obs.mjs#L15)
  * [`function reqSub`](../obs.mjs#L16)
  * [`function isSubber`](../obs.mjs#L18)
  * [`function reqSubber`](../obs.mjs#L19)
  * [`function isRunTrig`](../obs.mjs#L21)
  * [`function reqRunTrig`](../obs.mjs#L22)
  * [`function ph`](../obs.mjs#L24)
  * [`function self`](../obs.mjs#L25)
  * [`const keyPh`](../obs.mjs#L27)
  * [`const keySelf`](../obs.mjs#L28)
  * [`function de`](../obs.mjs#L30)
  * [`function obs`](../obs.mjs#L31)
  * [`function deObs`](../obs.mjs#L32)
  * [`class StaticProxied`](../obs.mjs#L34)
  * [`class Proxied`](../obs.mjs#L41)
  * [`class De`](../obs.mjs#L48)
  * [`class Obs`](../obs.mjs#L49)
  * [`class DeObs`](../obs.mjs#L50)
  * [`const ctx`](../obs.mjs#L52)
  * [`class Sched`](../obs.mjs#L82)
  * [`class ImpObs`](../obs.mjs#L128)
  * [`class Rec`](../obs.mjs#L157)
  * [`class Moebius`](../obs.mjs#L207)
  * [`class Loop`](../obs.mjs#L213)
  * [`class Ph`](../obs.mjs#L220)
  * [`class DeinitPh`](../obs.mjs#L287)
  * [`class ObsPh`](../obs.mjs#L298)
  * [`class DeObsPh`](../obs.mjs#L331)
  * [`function deinitAll`](../obs.mjs#L342)
