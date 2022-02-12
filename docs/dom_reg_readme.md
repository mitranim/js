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
  * [#`const customElements`](#const-customelements)
  * [#Undocumented](#undocumented)

## Usage

Example mockup for a pushstate link.

```js
import * as dr from 'https://cdn.jsdelivr.net/gh/mitranim/js@0.1.0/dom_reg.mjs'

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

Links: [source](../dom_reg.mjs#L7); [test/example](../test/dom_reg_test.mjs#L118).

This, and various other "HTML_X_Element" classes, are shortcuts provided by this library to enable automatic registration and compatibility with SSR imports. See examples in the readme.

### `function reg`

Links: [source](../dom_reg.mjs#L79); [test/example](../test/dom_reg_test.mjs#L23).

Takes a custom element class and idempotently registers it with `customElements`, automatically deriving the custom element tag name _and_ the base tag for `extends`.

### `const cer`

Links: [source](../dom_reg.mjs#L130); [test/example](../test/dom_reg_test.mjs#L6).

Internal shim for `customElements` with a similarly-shaped API. In browsers, this package patches the `customElements` global, duplicating `.define` calls to `cer`. This allows tracking which classes and tags have already been defined, enabling idempotent registration.

### `const customElements`

Links: [source](../dom_reg.mjs#L132); [test/example](../test/dom_reg_test.mjs#L19).

If the built-in global `customElements` exists, then this re-exports it and patches it, hooking into its `define` method. All subsequent calls to `customElements.define`, including those made internally by this package, register the given tag and class in the internal registry `cer`, which is also exported separately. This allows idempotent registration, which is an important feature of this package.

If the global `customElements` does not exist, this is an alias for the shim `cer` which is also exported separately.

### Undocumented

The following APIs are exported but undocumented. Check [dom_reg.mjs](../dom_reg.mjs).

  * [`class HTMLAnchorElement`](../dom_reg.mjs#L11)
  * [`class HTMLAreaElement`](../dom_reg.mjs#L12)
  * [`class HTMLAudioElement`](../dom_reg.mjs#L13)
  * [`class HTMLBaseElement`](../dom_reg.mjs#L14)
  * [`class HTMLBodyElement`](../dom_reg.mjs#L15)
  * [`class HTMLBRElement`](../dom_reg.mjs#L16)
  * [`class HTMLButtonElement`](../dom_reg.mjs#L17)
  * [`class HTMLCanvasElement`](../dom_reg.mjs#L18)
  * [`class HTMLDataElement`](../dom_reg.mjs#L19)
  * [`class HTMLDataListElement`](../dom_reg.mjs#L20)
  * [`class HTMLDetailsElement`](../dom_reg.mjs#L21)
  * [`class HTMLDialogElement`](../dom_reg.mjs#L22)
  * [`class HTMLDivElement`](../dom_reg.mjs#L23)
  * [`class HTMLDListElement`](../dom_reg.mjs#L24)
  * [`class HTMLEmbedElement`](../dom_reg.mjs#L25)
  * [`class HTMLFieldSetElement`](../dom_reg.mjs#L26)
  * [`class HTMLFontElement`](../dom_reg.mjs#L27)
  * [`class HTMLFormElement`](../dom_reg.mjs#L28)
  * [`class HTMLFrameElement`](../dom_reg.mjs#L29)
  * [`class HTMLFrameSetElement`](../dom_reg.mjs#L30)
  * [`class HTMLHeadElement`](../dom_reg.mjs#L31)
  * [`class HTMLHeadingElement`](../dom_reg.mjs#L32)
  * [`class HTMLHRElement`](../dom_reg.mjs#L33)
  * [`class HTMLHtmlElement`](../dom_reg.mjs#L34)
  * [`class HTMLIFrameElement`](../dom_reg.mjs#L35)
  * [`class HTMLImageElement`](../dom_reg.mjs#L36)
  * [`class HTMLInputElement`](../dom_reg.mjs#L37)
  * [`class HTMLLabelElement`](../dom_reg.mjs#L38)
  * [`class HTMLLegendElement`](../dom_reg.mjs#L39)
  * [`class HTMLLIElement`](../dom_reg.mjs#L40)
  * [`class HTMLLinkElement`](../dom_reg.mjs#L41)
  * [`class HTMLMapElement`](../dom_reg.mjs#L42)
  * [`class HTMLMarqueeElement`](../dom_reg.mjs#L43)
  * [`class HTMLMenuElement`](../dom_reg.mjs#L44)
  * [`class HTMLMetaElement`](../dom_reg.mjs#L45)
  * [`class HTMLMeterElement`](../dom_reg.mjs#L46)
  * [`class HTMLModElement`](../dom_reg.mjs#L47)
  * [`class HTMLObjectElement`](../dom_reg.mjs#L48)
  * [`class HTMLOListElement`](../dom_reg.mjs#L49)
  * [`class HTMLOptGroupElement`](../dom_reg.mjs#L50)
  * [`class HTMLOptionElement`](../dom_reg.mjs#L51)
  * [`class HTMLOutputElement`](../dom_reg.mjs#L52)
  * [`class HTMLParagraphElement`](../dom_reg.mjs#L53)
  * [`class HTMLParamElement`](../dom_reg.mjs#L54)
  * [`class HTMLPictureElement`](../dom_reg.mjs#L55)
  * [`class HTMLPreElement`](../dom_reg.mjs#L56)
  * [`class HTMLProgressElement`](../dom_reg.mjs#L57)
  * [`class HTMLQuoteElement`](../dom_reg.mjs#L58)
  * [`class HTMLScriptElement`](../dom_reg.mjs#L59)
  * [`class HTMLSelectElement`](../dom_reg.mjs#L60)
  * [`class HTMLSlotElement`](../dom_reg.mjs#L61)
  * [`class HTMLSourceElement`](../dom_reg.mjs#L62)
  * [`class HTMLSpanElement`](../dom_reg.mjs#L63)
  * [`class HTMLStyleElement`](../dom_reg.mjs#L64)
  * [`class HTMLTableCaptionElement`](../dom_reg.mjs#L65)
  * [`class HTMLTableCellElement`](../dom_reg.mjs#L66)
  * [`class HTMLTableColElement`](../dom_reg.mjs#L67)
  * [`class HTMLTableElement`](../dom_reg.mjs#L68)
  * [`class HTMLTableRowElement`](../dom_reg.mjs#L69)
  * [`class HTMLTableSectionElement`](../dom_reg.mjs#L70)
  * [`class HTMLTemplateElement`](../dom_reg.mjs#L71)
  * [`class HTMLTextAreaElement`](../dom_reg.mjs#L72)
  * [`class HTMLTimeElement`](../dom_reg.mjs#L73)
  * [`class HTMLTitleElement`](../dom_reg.mjs#L74)
  * [`class HTMLTrackElement`](../dom_reg.mjs#L75)
  * [`class HTMLUListElement`](../dom_reg.mjs#L76)
  * [`class HTMLVideoElement`](../dom_reg.mjs#L77)
  * [`class CustomElementRegistry`](../dom_reg.mjs#L86)
  * [`const baseTags`](../dom_reg.mjs#L193)
