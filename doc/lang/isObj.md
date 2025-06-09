Same as `typeof val === 'object' && val !== null`. True for any JS object: plain dict, array, various other classes. Doesn't include functions, even though JS functions are extensible objects.

* Compare {{link lang isComp}} which returns true for objects _and_ functions.
* For plain objects used as dictionaries, see {{link lang isDict}}.
* For fancy non-list objects, see {{link lang isRec}}.
