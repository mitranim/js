Signature: `({[Key: A]}, keys) => {[Key: A]}`.

Returns a version of the given dict, keeping only the given properties. Keys can be either a `Set` or an arbitrary {{link iter values sequence}}. Each key must satisfy {{link lang isKey}}. Existence is not required: missing properties are silently ignored. Returns an empty dict if the input is {{link lang isNil nil}}.
