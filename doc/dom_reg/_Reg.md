Registry for custom DOM element classes. Somewhat analogous to the built-in `window.customElements`. Keeps track of which classes and tags have already been defined, enabling idempotent registration and name salting. In browsers it also wraps `window.customElements` by default, calling `window.customElements.define` for each registration. Note that it doesn't "patch" the global. Directly using global `customElements` bypasses our registration mechanisms and may lead to redundant registration attempts.

Registration can be deferred:

```js
import * as dr from '{{featUrl dom_reg}}'

dr.Reg.main.setDefiner()

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
