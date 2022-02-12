Renders a value for user display. Counterpart to {{link lang show}}, which renders a value for debug purposes. Intended only for {{link lang isScalar scalar}} values. Rules:

  * {{link lang isNil Nil}} → `''`.
  * {{link lang isScalar Scalar}} → default JS stringification.
  * All other inputs → `TypeError` exception.
