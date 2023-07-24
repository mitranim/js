Renders a value for user display. Counterpart to {{link lang show}}, which renders a value for debug purposes. Intended only for {{link lang isScalar scalar}} values. Rules:

  * {{link lang isDate Date}} with default `.toString` → use `.toISOString`. This overrides the insane JS default stringification of dates, defaulting to the _reversible_ machine-decodable representation used for JSON.
  * Other {{link lang isSome non-nil}} {{link lang isScalar scalars}} → default JS stringification.
  * All other inputs including {{link lang isNil nil}} → `TypeError` exception.
