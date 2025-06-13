## Overview

{{codeHead}} enables automatic registration of custom DOM element classes. Features:

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
{{toc}}

## Usage

Example mockup for a pushstate link.

```js
import * as dr from '{{featUrl dom_reg}}'

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

Instead, use `dr.reg`, which is also used internally by `MixReg`. This is simply a shortcut for using the {{link dom_reg Reg default registry}} provided by this module.

```js
import * as dr from '{{featUrl dom_reg}}'

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

{{api}}
