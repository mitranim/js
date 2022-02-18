Like [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) but much better. See [#Overview](#overview) for some differences.

```ts
type StrLike       = boolean | number | string
type StrDictLax    = Record<string, string | string[]>
type StrDictSingle = Record<string, string>
type StrDictMulti  = Record<string, string[]>
type SearchLike    = string | Search | URLSearchParams | StrDictLax

class Search extends Map<string, string[]> {
  constructor(src?: SearchLike)

  /*
  Similar to the corresponding methods of `URLSearchParams`, but with stricter
  input validation. In addition, instead of returning void, they return the
  same reference for chaining. A nil key is considered missing, and the
  operation is a nop. A nil val is considered to be ''.
  */
  has(key: string): boolean
  get(key: string): string | undefined
  getAll(key: string): string[]
  set(key: string, val?: StrLike): Search
  append(key: string, val?: StrLike): Search
  delete(key: string): boolean

  /*
  Common-sense methods missing from `URLSearchParams`.
  Names and signatures are self-explanatory.
  */
  setAll(key: string, vals?: StrLike[]): Search
  setAny(key: string, val?: StrLike | StrLike[]): Search
  appendAll(key: string, vals?: StrLike[]): Search
  appendAny(key: string, val?: StrLike | StrLike[]): Search

  /*
  Reinitializes the `Search` object from the input.
  Mutates and returns the same reference.
  Passing nil is equivalent to `.clear`.
  */
  reset(src?: SearchLike): Search

  /*
  Appends the input's content to the current `Search` object.
  Mutates and returns the same reference.
  */
  mut(src?: SearchLike): Search

  /*
  Combination of `.get` and type conversion.
  Non-opt versions panic if conversion is unsuccessful.
  */
  boolOpt(key: string): boolean | undefined
  intOpt(key: string): number | undefined
  finOpt(key: string): number | undefined
  natOpt(key: string): number | undefined
  bool(key: string): boolean
  int(key: string): number
  fin(key: string): number
  nat(key: string): number

  // Conversion to a traditional "query dictionary".
  toDict(): StrDictSingle
  toDictAll(): StrDictMulti

  /*
  Returns a cloned version.
  Future mutations are not shared.
  Cheaper than reparsing.
  */
  clone(): Search

  /*
  Converts to built-in search params.
  Note that `new URLSearchParams(<u.Search>)` should be avoided.
  */
  toURLSearchParams(): URLSearchParams

  // Same as `.toString` but prepends '?' when non-empty.
  toStringFull(): string

  /*
  Encodes to a string like 'key=val'.
  Enables automatic JS stringification.
  */
  toString(): string

  /*
  Enables automatic JSON string encoding.
  As a special case, empty url is considered null.
  */
  toJSON(): string | null
}
```

Warning: while `Search` is mostly compatible with `URLSearchParams`, it has different iteration methods. The iteration methods of `URLSearchParams` are something bizarre and made-up just for this type:

```js
[...new URLSearchParams(`one=two&one=three&four=five`)]
// [[`one`, `two`], [`one`, `three`], [`four`, `five`]]
```

Meanwhile `Search` is `Map<string, string[]>`:

```js
[...new u.Search(`one=two&one=three&four=five`)]
// [[`one`, [`two`, `three`]], [`four`, [`five`]]]
```

The following works properly:

```js
new u.Search(new URLSearchParams(`one=two&one=three&four=five`))
new u.Search(`one=two&one=three&four=five`).toURLSearchParams()
```

But the following **does not work properly** and should be avoided:

```js
new URLSearchParams(new u.Search(`one=two&one=three&four=five`))
```
