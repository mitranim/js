## Overview

{{codeHead}} implements observables via [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). This is a stripped-down version of https://github.com/mitranim/espo. The core API is identical. Check the readme in the linked repo.

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
{{toc}}

## API

Until the docs are fully migrated, see https://github.com/mitranim/espo. The core API is identical.

{{api}}
