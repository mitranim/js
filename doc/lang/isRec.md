Short for "is record".

True if the value is a non-iterable object. Excludes both {{link lang isIter sync_iterables}} and {{link lang isIterAsync async_iterables}}. Note that {{link lang isDict dicts}} are automatically records, but not all records are dicts.

Technically, promises would qualify as records under this definition. But as a
special case, instances of `Promise` are excluded to help detect the common
case of forgetting `await`. The overhead on that check should be virtually
unmeasurable.