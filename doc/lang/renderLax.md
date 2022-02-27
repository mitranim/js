Renders a value for user display. Intended only for {{link lang isScalar scalar}} values. Unlike {{link lang render}}, this allows nil. Rules:

  * {{link lang isNil Nil}} → `''`.
  * Otherwise → {{link lang render}}.
