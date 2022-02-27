Like [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) but much better. See [#Overview](#overview) for some differences.

```ts
type StrLike       = boolean | number | string
type StrDictLax    = Record<string, string | string[]>
type StrDictSingle = Record<string, string>
type StrDictMulti  = Record<string, string[]>
type QueryLike     = string | Query | URLSearchParams | StrDictLax

class Query extends Map<string, string[]> {
  constructor(src?: QueryLike)

  /*
  Similar to the corresponding methods of `URLSearchParams`, but with stricter
  input validation. In addition, instead of returning void, they return the
  same reference for chaining. A nil key is considered missing, and the
  operation is a nop. A nil val is considered to be ''.
  */
  has(key: string): boolean
  get(key: string): string | undefined
  getAll(key: string): string[]
  set(key: string, val?: StrLike): Query
  append(key: string, val?: StrLike): Query
  delete(key: string): boolean

  /*
  Common-sense methods missing from `URLSearchParams`.
  Names and signatures are self-explanatory.
  */
  setAll(key: string, vals?: StrLike[]): Query
  setAny(key: string, val?: StrLike | StrLike[]): Query
  appendAll(key: string, vals?: StrLike[]): Query
  appendAny(key: string, val?: StrLike | StrLike[]): Query

  /*
  Reinitializes the `Query` object from the input.
  Mutates and returns the same reference.
  Passing nil is equivalent to `.clear`.
  */
  reset(src?: QueryLike): Query

  /*
  Appends the input's content to the current `Query` object.
  Mutates and returns the same reference.
  */
  mut(src?: QueryLike): Query

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
  clone(): Query

  /*
  Converts to built-in search params.
  Note that `new URLSearchParams(<u.Query>)` should be avoided.
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

Warning: while `Query` is mostly compatible with `URLSearchParams`, it has different iteration methods. The iteration methods of `URLSearchParams` are something bizarre and made-up just for this type:

```js
[...new URLSearchParams(`one=two&one=three&four=five`)]
// [[`one`, `two`], [`one`, `three`], [`four`, `five`]]
```

Meanwhile `Query` is `Map<string, string[]>`:

```js
[...new u.Query(`one=two&one=three&four=five`)]
// [[`one`, [`two`, `three`]], [`four`, [`five`]]]
```

The following works properly:

```js
new u.Query(new URLSearchParams(`one=two&one=three&four=five`))
new u.Query(`one=two&one=three&four=five`).toURLSearchParams()
```

But the following **does not work properly** and should be avoided:

```js
new URLSearchParams(new u.Query(`one=two&one=three&four=five`))
```
