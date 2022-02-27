Short for "better set". Variant of built-in `Set` with additional common-sense behaviors:

  * Supports JSON encoding, behaving like an array.
  * Supports adding other collections at any time by calling `.mut`, not just in the constructor.
  * Has additional instantiation shortcuts such as static `.of`.
