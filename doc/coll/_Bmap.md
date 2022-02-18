Short for "better map". Variant of built-in `Map` with additional common-sense behaviors:

  * Supports {{link lang isDict plain_dicts}}:
    * Can be instantiated from a dict.
    * Can be patched by a dict by calling `.mut`.
    * Can be converted to a dict by calling `.toDict`.
    * Behaves like a dict in JSON.
  * Supports JSON encoding. Only entries with string keys are sent to JSON, other entries are ignored.
  * Adding entries from another collection can be done any time by calling `.mut`, not just in the constructor.
  * Has additional iteration methods such as `.map` and `.filter`.
  * Has additional instantiation shortcuts such as static `.of`.
