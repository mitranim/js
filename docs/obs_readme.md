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

  * [`function deinit`](../obs.mjs#L4)
  * [`function isDe`](../obs.mjs#L7)
  * [`function reqDe`](../obs.mjs#L8)
  * [`function isObs`](../obs.mjs#L10)
  * [`function reqObs`](../obs.mjs#L11)
  * [`function isTrig`](../obs.mjs#L13)
  * [`function reqTrig`](../obs.mjs#L14)
  * [`function isSub`](../obs.mjs#L16)
  * [`function reqSub`](../obs.mjs#L17)
  * [`function isSubber`](../obs.mjs#L19)
  * [`function reqSubber`](../obs.mjs#L20)
  * [`function isRunTrig`](../obs.mjs#L22)
  * [`function reqRunTrig`](../obs.mjs#L23)
  * [`function ph`](../obs.mjs#L25)
  * [`function self`](../obs.mjs#L26)
  * [`const keyPh`](../obs.mjs#L28)
  * [`const keySelf`](../obs.mjs#L29)
  * [`function de`](../obs.mjs#L31)
  * [`function obs`](../obs.mjs#L32)
  * [`function deObs`](../obs.mjs#L33)
  * [`class StaticProxied`](../obs.mjs#L35)
  * [`class Proxied`](../obs.mjs#L42)
  * [`class De`](../obs.mjs#L49)
  * [`class Obs`](../obs.mjs#L50)
  * [`class DeObs`](../obs.mjs#L51)
  * [`const dyn`](../obs.mjs#L53)
  * [`class Sched`](../obs.mjs#L74)
  * [`class ImpObs`](../obs.mjs#L119)
  * [`class Rec`](../obs.mjs#L148)
  * [`class Moebius`](../obs.mjs#L198)
  * [`class Loop`](../obs.mjs#L204)
  * [`class Ph`](../obs.mjs#L211)
  * [`class DeinitPh`](../obs.mjs#L278)
  * [`class ObsPh`](../obs.mjs#L288)
  * [`class DeObsPh`](../obs.mjs#L321)
  * [`function deinitAll`](../obs.mjs#L332)
