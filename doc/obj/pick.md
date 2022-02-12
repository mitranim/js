Signature: `({[Key: A]}, A => bool) => {[Key: A]}`.

Similar to {{link iter filter}} but for dicts. Returns a version of the given dict with only the properties for which `fun` returned something truthy. Returns an empty dict if the input is {{link lang isNil nil}}.
