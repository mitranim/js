Shortcut for `Url.join`. Correctly appends to URL path without mangling the other components.

```js
u.urlJoin(`/persons?key=val#hash`, `3f55a4`, `get`)
// Url { pathname: `/persons/3f55a4/get?key=val#hash` }
```
