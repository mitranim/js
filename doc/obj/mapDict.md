Signature: `({[Key: A]}, A => B) => {[Key: B]}`.

Similar to {{link iter map}} but for dicts. Creates a version of the given dict where values have been replaced by calling the given function for each value. Returns an empty dict if the input is {{link lang isNil nil}}.
