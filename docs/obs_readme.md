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

  * [`const TRIG`](../obs.mjs#L4)
  * [`const SYM_PH`](../obs.mjs#L5)
  * [`const SYM_TAR`](../obs.mjs#L6)
  * [`function isRunner`](../obs.mjs#L8)
  * [`function reqRunner`](../obs.mjs#L9)
  * [`function isTrig`](../obs.mjs#L11)
  * [`function reqTrig`](../obs.mjs#L12)
  * [`function obs`](../obs.mjs#L14)
  * [`function getPh`](../obs.mjs#L15)
  * [`function getTar`](../obs.mjs#L16)
  * [`class ObsPh`](../obs.mjs#L19)
  * [`class Broad`](../obs.mjs#L64)
  * [`const REG_PAIR`](../obs.mjs#L122)
  * [`class Recur`](../obs.mjs#L143)
  * [`class FunRecur`](../obs.mjs#L170)
  * [`class ObsRef`](../obs.mjs#L175)
  * [`class Que`](../obs.mjs#L208)
  * [`class Shed`](../obs.mjs#L239)
