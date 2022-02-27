Like [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) but much better. See [#Overview](#overview) for some differences.

```ts
type UrlLike    = string | Url | URL | Location
type StrLike    = boolean | number | string
type StrDictLax = Record<string, string | string[]>
type QueryLike  = string | Query | URLSearchParams | StrDictLax

class Url {
  constructor(src?: UrlLike)

  // All of the following are getter/setters.
  // Many are covariant with each other.
  scheme:       string // Without ':' or '//'.
  slash:        string // Either '' or '//'.
  username:     string // Without '@'.
  password:     string // Without ':' or '@'.
  hostname:     string
  port:         string
  pathname:     string
  search:       string // Without leading '?'.
  searchParams: Query
  query:        Query
  hash:         string // Without leading '#'.
  protocol:     string
  host:         string
  origin:       string
  href:         string

  // All of the following set the corresponding property,
  // mutating and returning the same `Url` reference.
  // Passing nil clears the corresponding property.
  setScheme       (val?: string): Url
  setSlash        (val?: string): Url
  setUsername     (val?: string): Url
  setPassword     (val?: string): Url
  setHostname     (val?: string): Url
  setPort         (val?: number | string): Url
  setPathname     (val?: string): Url
  setSearch       (val?: string): Url
  setSearchParams (val?: QueryLike): Url
  setQuery        (val?: QueryLike): Url
  setHash         (val?: string): Url
  setHashExact    (val?: string): Url
  setProtocol     (val?: string): Url
  setHost         (val?: string): Url
  setOrigin       (val?: string): Url
  setHref         (val?: string): Url

  // All of these return a clone with the corresponding property updated.
  withScheme       (val?: string): Url
  withSlash        (val?: string): Url
  withUsername     (val?: string): Url
  withPassword     (val?: string): Url
  withHostname     (val?: string): Url
  withPort         (val?: number | string): Url
  withPathname     (val?: string): Url
  withSearch       (val?: string): Url
  withSearchParams (val?: QueryLike): Url
  withQuery        (val?: QueryLike): Url
  withHash         (val?: string): Url
  withHashExact    (val?: string): Url
  withProtocol     (val?: string): Url
  withHost         (val?: string): Url
  withOrigin       (val?: string): Url
  withHref         (val?: string): Url

  // Replace `.pathname` with slash-separated segments.
  // Empty or non-stringable segments cause an exception.
  setPath(...val: StrLike[]): Url

  // Like `.setPath` but appends to an existing path.
  addPath(...val: StrLike[]): Url

  // Reinitializes the `Url` object from the input.
  // Mutates and returns the same reference.
  // Passing nil is equivalent to `.clear`.
  reset(src?: UrlLike): Url

  // Clears all properties. Mutates and returns the same reference.
  clear(): Url

  // Returns a cloned version.
  // Future mutations are not shared.
  // Cheaper than reparsing.
  clone(): Url

  // Converts to built-in `URL`, for compatibility with APIs that require it.
  toURL(): URL

  // Same as `.href`. Enables automatic JS stringification.
  toString(): string

  // Enables automatic JSON string encoding.
  // As a special case, empty url is considered null.
  toJSON(): string | null

  // Equivalent to `.toString()`. This object may be considered
  // a primitive/scalar, equivalent to a string in some contexts.
  valueOf(): string

  // Class used internally for instantiating `.searchParams`.
  // Can override in subclass.
  get Query(): {new(): Query}

  // Shortcut for `new this(val).setPath(...vals)`.
  static join(val: UrlLike, ...vals: StrLike[]): Url
}
```

Warning: this library does not support parsing bare-domain URLs like `example.com` without a scheme. They cannot be syntactically distinguished from a bare pathname, which is a more important use case. However, `Url` does provide a shortcut for generating a string like this:

```js
u.url(`https://example.com/path`).hostPath() === `example.com/path`
u.url(`scheme://host:123/path?key=val#hash`).hostPath() === `host:123/path`
```
