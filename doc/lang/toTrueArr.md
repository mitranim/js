Idempotent conversion to a {{link lang isTrueArr true array}}. Allowed inputs:

  * {{link lang isNil Nil}} → return `[]`.
  * {{link lang isTrueArr True array}} → return as-is.
  * {{link lang isIter Iterable}} → convert to `Array`.
  * Otherwise → `TypeError` exception.
