## Overview

[dom_reg.mjs](../dom_reg.mjs) enables automatic registration of custom DOM element classes. Features:

  * Automatically derive tag name from class name.
  * Automatically derive `{extends: '...'}` from super classes.
  * Registration is idempotent: passing the same class has no effect. This allows to call it with `new.target` in constructors.
  * Automatic registration on instantiation.
  * Base classes corresponding to various built-in HTML classes.
    * All base classes implement _automatic registration of subclasses on instantiation_ via `new.target`.
    * No need for manual registration _anywhere_ in the code. You don't even need decorators.
  * Compatible with Deno and Node.
    * Modules can be imported in all environments.
    * When DOM is not available, base classes are nops that simply inherit from `Object`.

## TOC

* [#Usage](#usage)
* [#API](#api)
  * [#`function reg`](#function-reg)
  * [#`class Reg`](#class-reg)
  * [#Undocumented](#undocumented)

## Usage

Example mockup for a pushstate link.

```js
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/dom_reg.mjs'

// Immediately ready for use. Tag is automatically set to `a-btn`.
class Btn extends dr.HTMLButtonElement {
  constructor(text) {
    super()
    this.textContent = text
  }
}

document.body.append(new Btn(`click me`))

// Immediately ready for use. Tag is automatically set to `my-link`.
class MyLink extends dr.HTMLAnchorElement {
  constructor(text, href) {
    super()
    this.textContent = text
    this.href = href
    this.onclick = this.onClick
  }

  onClick(event) {
    event.preventDefault()
    console.log(`clicked:`, this.href)
  }
}

// The class is ready for use!
document.body.append(new MyLink(`click me`, `/some-link`))
```

## API

### `function reg`

Links: [source](../dom_reg.mjs#L172); [test/example](../test/dom_reg_test.mjs#L16).

Shortcut for calling `Reg.main.reg`. Takes a custom element class and idempotently registers it, automatically deriving the custom element tag name _and_ the base tag for `extends`.

### `class Reg`

Links: [source](../dom_reg.mjs#L174); [test/example](../test/dom_reg_test.mjs#L43).

Registry for custom DOM element classes. Automatically derives tag name from class name, using salting when necessary to avoid collisions. Supports idempotent registration which can be safely called in an element constructor. Allows immediate registration, deferred registration, or a mix of those.

By default, this registry has **no global side effects**. To enable global registration, provide a "definer" to the registry.

```js
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.35/dom_reg.mjs'

class Btn extends HTMLButtonElement {
  static customName = `some-btn`

  // Registers `Btn` in `dr.Reg.main`, but NOT in `window.customElements`.
  static {dr.reg(this)}
}

// The element is NOT yet upgraded to our custom class.
document.body.append(document.createElement(`button`, {is: `some-btn`}))

// Registers the class and upgrades the element.
dr.Reg.main.setDefiner(customElements)
```

### Undocumented

The following APIs are exported but undocumented. Check [dom_reg.mjs](../dom_reg.mjs).

  * [`class TagToCls`](../dom_reg.mjs#L13)
  * [`class ClsToTag`](../dom_reg.mjs#L98)
  * [`class CustomElementRegistry`](../dom_reg.mjs#L134)
  * [`function MixReg`](../dom_reg.mjs#L159)
  * [`class MixRegCache`](../dom_reg.mjs#L161)
  * [`function isDefiner`](../dom_reg.mjs#L269)
  * [`function optDefiner`](../dom_reg.mjs#L270)
  * [`function isCustomName`](../dom_reg.mjs#L273)
  * [`function reqCustomName`](../dom_reg.mjs#L277)
