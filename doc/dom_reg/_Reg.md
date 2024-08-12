Registry for custom DOM element classes. Automatically derives tag name from class name, using salting when necessary to avoid collisions. Supports idempotent registration which can be safely called in an element constructor. Allows immediate registration, deferred registration, or a mix of those.

By default, this registry has **no global side effects**. To enable global registration, provide a "definer" to the registry.

```js
import * as dr from '{{featUrl dom_reg}}'

class Btn extends HTMLButtonElement {
  // Optional. If omitted, `dr.reg` autogenerates
  // this from the name of the class.
  static customName = `some-btn`

  // Registers `Btn` in `dr.Reg.main`,
  // but NOT in `window.customElements`.
  static {dr.reg(this)}
}

// The element is NOT yet upgraded to our custom class.
document.body.append(document.createElement(`button`, {is: `some-btn`}))

// Registers the class and upgrades the element.
dr.Reg.main.setDefiner(customElements)
```
