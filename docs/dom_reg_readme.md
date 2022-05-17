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
  * [#`class HTMLElement`](#class-htmlelement)
  * [#`function reg`](#function-reg)
  * [#`const cer`](#const-cer)
  * [#Undocumented](#undocumented)

## Usage

Example mockup for a pushstate link.

```js
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.20/dom_reg.mjs'

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

### `class HTMLElement`

Links: [source](../dom_reg.mjs#L5); [test/example](../test/dom_reg_test.mjs#L38).

This, and various other "HTML_X_Element" classes, are shortcuts provided by this library to enable automatic registration and compatibility with SSR imports. See examples in the readme.

### `function reg`

Links: [source](../dom_reg.mjs#L77); [test/example](../test/dom_reg_test.mjs#L57).

Shortcut for calling `cer.reg`. Takes a custom element class and idempotently registers it with `customElements`, automatically deriving the custom element tag name _and_ the base tag for `extends`.

### `const cer`

Links: [source](../dom_reg.mjs#L195); [test/example](../test/dom_reg_test.mjs#L65).

Wrapper and/or shim for `customElements` with a similarly-shaped API. Keeps track of which classes and tags have already been defined, enabling idempotent registration and name salting. In browsers it also calls `customElements.define`. Note that it doesn't "patch" the global. Directly using global `customElements` bypasses our registration mechanisms and may lead to redundant registration attempts.

Registration can be delayed:

```js
import * as dr from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.20/dom_reg.mjs'

dr.cer.setDefiner()

class Btn extends HTMLButtonElement {
  // Registers `Btn` in `cer`, but NOT in `window.customElements`.
  static {dr.regAs(this, `a-btn`)}
}

// The element is NOT yet upgraded to our custom class.
document.body.append(document.createElement(`a-btn`))

// Registers the class and upgrades the element.
dr.cer.setDefiner(customElements)
```

### Undocumented

The following APIs are exported but undocumented. Check [dom_reg.mjs](../dom_reg.mjs).

  * [`class HTMLAnchorElement`](../dom_reg.mjs#L9)
  * [`class HTMLAreaElement`](../dom_reg.mjs#L10)
  * [`class HTMLAudioElement`](../dom_reg.mjs#L11)
  * [`class HTMLBaseElement`](../dom_reg.mjs#L12)
  * [`class HTMLBodyElement`](../dom_reg.mjs#L13)
  * [`class HTMLBRElement`](../dom_reg.mjs#L14)
  * [`class HTMLButtonElement`](../dom_reg.mjs#L15)
  * [`class HTMLCanvasElement`](../dom_reg.mjs#L16)
  * [`class HTMLDataElement`](../dom_reg.mjs#L17)
  * [`class HTMLDataListElement`](../dom_reg.mjs#L18)
  * [`class HTMLDetailsElement`](../dom_reg.mjs#L19)
  * [`class HTMLDialogElement`](../dom_reg.mjs#L20)
  * [`class HTMLDivElement`](../dom_reg.mjs#L21)
  * [`class HTMLDListElement`](../dom_reg.mjs#L22)
  * [`class HTMLEmbedElement`](../dom_reg.mjs#L23)
  * [`class HTMLFieldSetElement`](../dom_reg.mjs#L24)
  * [`class HTMLFontElement`](../dom_reg.mjs#L25)
  * [`class HTMLFormElement`](../dom_reg.mjs#L26)
  * [`class HTMLFrameElement`](../dom_reg.mjs#L27)
  * [`class HTMLFrameSetElement`](../dom_reg.mjs#L28)
  * [`class HTMLHeadElement`](../dom_reg.mjs#L29)
  * [`class HTMLHeadingElement`](../dom_reg.mjs#L30)
  * [`class HTMLHRElement`](../dom_reg.mjs#L31)
  * [`class HTMLHtmlElement`](../dom_reg.mjs#L32)
  * [`class HTMLIFrameElement`](../dom_reg.mjs#L33)
  * [`class HTMLImageElement`](../dom_reg.mjs#L34)
  * [`class HTMLInputElement`](../dom_reg.mjs#L35)
  * [`class HTMLLabelElement`](../dom_reg.mjs#L36)
  * [`class HTMLLegendElement`](../dom_reg.mjs#L37)
  * [`class HTMLLIElement`](../dom_reg.mjs#L38)
  * [`class HTMLLinkElement`](../dom_reg.mjs#L39)
  * [`class HTMLMapElement`](../dom_reg.mjs#L40)
  * [`class HTMLMarqueeElement`](../dom_reg.mjs#L41)
  * [`class HTMLMenuElement`](../dom_reg.mjs#L42)
  * [`class HTMLMetaElement`](../dom_reg.mjs#L43)
  * [`class HTMLMeterElement`](../dom_reg.mjs#L44)
  * [`class HTMLModElement`](../dom_reg.mjs#L45)
  * [`class HTMLObjectElement`](../dom_reg.mjs#L46)
  * [`class HTMLOListElement`](../dom_reg.mjs#L47)
  * [`class HTMLOptGroupElement`](../dom_reg.mjs#L48)
  * [`class HTMLOptionElement`](../dom_reg.mjs#L49)
  * [`class HTMLOutputElement`](../dom_reg.mjs#L50)
  * [`class HTMLParagraphElement`](../dom_reg.mjs#L51)
  * [`class HTMLParamElement`](../dom_reg.mjs#L52)
  * [`class HTMLPictureElement`](../dom_reg.mjs#L53)
  * [`class HTMLPreElement`](../dom_reg.mjs#L54)
  * [`class HTMLProgressElement`](../dom_reg.mjs#L55)
  * [`class HTMLQuoteElement`](../dom_reg.mjs#L56)
  * [`class HTMLScriptElement`](../dom_reg.mjs#L57)
  * [`class HTMLSelectElement`](../dom_reg.mjs#L58)
  * [`class HTMLSlotElement`](../dom_reg.mjs#L59)
  * [`class HTMLSourceElement`](../dom_reg.mjs#L60)
  * [`class HTMLSpanElement`](../dom_reg.mjs#L61)
  * [`class HTMLStyleElement`](../dom_reg.mjs#L62)
  * [`class HTMLTableCaptionElement`](../dom_reg.mjs#L63)
  * [`class HTMLTableCellElement`](../dom_reg.mjs#L64)
  * [`class HTMLTableColElement`](../dom_reg.mjs#L65)
  * [`class HTMLTableElement`](../dom_reg.mjs#L66)
  * [`class HTMLTableRowElement`](../dom_reg.mjs#L67)
  * [`class HTMLTableSectionElement`](../dom_reg.mjs#L68)
  * [`class HTMLTemplateElement`](../dom_reg.mjs#L69)
  * [`class HTMLTextAreaElement`](../dom_reg.mjs#L70)
  * [`class HTMLTimeElement`](../dom_reg.mjs#L71)
  * [`class HTMLTitleElement`](../dom_reg.mjs#L72)
  * [`class HTMLTrackElement`](../dom_reg.mjs#L73)
  * [`class HTMLUListElement`](../dom_reg.mjs#L74)
  * [`class HTMLVideoElement`](../dom_reg.mjs#L75)
  * [`function regAs`](../dom_reg.mjs#L78)
  * [`class CustomElementRegistry`](../dom_reg.mjs#L80)
  * [`function clsTag`](../dom_reg.mjs#L211)
