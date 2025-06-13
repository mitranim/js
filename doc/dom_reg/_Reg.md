Registry for custom DOM element classes. Automatically derives tag name from class name, using salting when necessary to avoid collisions. Supports idempotent registration which can be safely called in an element constructor. Allows immediate registration, deferred registration, or a mix of those.

By default, the main registry uses `globalThis.customElements`, which exists only in browser environments. In non-browser environments, by default it has no global side effects, but does still modify registered classes by deriving their `.customName`, for rendering to HTML.

For browser-only code, prefer the mixin `MixReg` from the same module which is easier to use. See examples in the {{featLink dom_reg readme}}.

Simple usage:

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

document.body.append(new Btn())
```

You can unset the default definer to defer registration:

```js
import * as dr from '{{featUrl dom_reg}}'

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
