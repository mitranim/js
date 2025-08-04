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
* [#SSR](#ssr)
  * [#`function reg`](#function-reg)
  * [#`class Reg`](#class-reg)
  * [#Undocumented](#undocumented)

## Usage

Example mockup for a pushstate link.

```js
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.81/dom_reg.mjs'

// Immediately ready for use. Tag is automatically set to `a-btn`.
// The mixin `MixReg` enables automatic registration on instantiation.
class Btn extends dr.MixReg(HTMLButtonElement) {
  constructor(text) {
    super()
    this.textContent = text
  }
}

document.body.append(new Btn(`click me`))

// Immediately ready for use. Tag is automatically set to `my-link`.
class MyLink extends dr.MixReg(HTMLAnchorElement) {
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

## SSR

Apps which use server-side rendering and client-side upgrading of custom elements need a slightly different approach. `MixReg` registers an element class at construction time, when the class is invoked with `new`. Custom elements described in HTML markup are initially not associated with any class, and so the browser wouldn't know what to `new`.

Instead, use `dr.reg`, which is also used internally by `MixReg`. This is simply a shortcut for using the [#default registry](#class-reg) provided by this module.

```js
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.81/dom_reg.mjs'

class Btn extends HTMLButtonElement {
  /*
  Optional. If omitted, `dr.reg` autogenerates
  this from the name of the class.

    static customName = `some-btn`
  */

  // Automatically derives the name `a-btn` and registers the class.
  static {dr.reg(this)}
}

const elem = new Btn()
console.log(elem.outerHTML)
`<button is="a-btn"></button>`
```

## API

### `function reg`

Links: [source](../dom_reg.mjs#L148); [test/example](../test/dom_reg_test.mjs#L15).

Shortcut for calling `Reg.main.reg`. Takes a custom element class and idempotently registers it, automatically deriving the custom element tag name _and_ the base tag for `extends`.

### `class Reg`

Links: [source](../dom_reg.mjs#L150); [test/example](../test/dom_reg_test.mjs#L21).

Registry for custom DOM element classes. Automatically derives tag name from class name, using salting when necessary to avoid collisions. Supports idempotent registration which can be safely called in an element constructor. Allows immediate registration, deferred registration, or a mix of those.

By default, the main registry uses `globalThis.customElements`, which exists only in browser environments. In non-browser environments, by default it has no global side effects, but does still modify registered classes by deriving their `.customName`, for rendering to HTML.

For browser-only code, prefer the mixin `MixReg` from the same module which is easier to use. See examples in the [readme](dom_reg_readme.md).

Simple usage:

```js
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.81/dom_reg.mjs'

class Btn extends HTMLButtonElement {
  /*
  Optional. If omitted, `dr.reg` autogenerates
  this from the name of the class.

    static customName = `some-btn`
  */

  // Automatically derives the name `a-btn` and registers the class.
  static {dr.reg(this)}
}

document.body.append(new Btn())
```

You can unset the default definer to defer registration:

```js
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.81/dom_reg.mjs'

dr.Reg.main.setDefiner()

class Btn extends HTMLButtonElement {
  // Registers `Btn` in `dr.Reg.main`,
  // but not in `window.customElements` quite yet.
  static {dr.reg(this)}
}

// The element is not yet upgraded to our custom class.
document.body.append(document.createElement(`button`, {is: `some-btn`}))

// Registers the class and upgrades the element.
dr.Reg.main.setDefiner(customElements)
```

### Undocumented

The following APIs are exported but undocumented. Check [dom_reg.mjs](../dom_reg.mjs).

  * [`const TAG_TO_CLS`](../dom_reg.mjs#L8)
  * [`const CLS_TO_TAG`](../dom_reg.mjs#L95)
  * [`function clsLocalName`](../dom_reg.mjs#L113)
  * [`function MixReg`](../dom_reg.mjs#L133)
  * [`class MixinReg`](../dom_reg.mjs#L135)
  * [`function setDefiner`](../dom_reg.mjs#L146)
  * [`function isDefiner`](../dom_reg.mjs#L255)
  * [`function optDefiner`](../dom_reg.mjs#L256)
  * [`function reqDefiner`](../dom_reg.mjs#L257)
  * [`function onlyDefiner`](../dom_reg.mjs#L258)
  * [`function isCustomName`](../dom_reg.mjs#L263)
  * [`function reqCustomName`](../dom_reg.mjs#L267)
