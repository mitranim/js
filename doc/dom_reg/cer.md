Wrapper and/or shim for `customElements` with a similarly-shaped API. Keeps track of which classes and tags have already been defined, enabling idempotent registration and name salting. In browsers it also calls `customElements.define`. Note that it doesn't "patch" the global. Directly using global `customElements` bypasses our registration mechanisms and may lead to redundant registration attempts.

Registration can be delayed:

```js
import * as dr from '{{featUrl dom_reg}}'

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
