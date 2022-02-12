If the built-in global `customElements` exists, then this re-exports it and patches it, hooking into its `define` method. All subsequent calls to `customElements.define`, including those made internally by this package, register the given tag and class in the internal registry `cer`, which is also exported separately. This allows idempotent registration, which is an important feature of this package.

If the global `customElements` does not exist, this is an alias for the shim `cer` which is also exported separately.
