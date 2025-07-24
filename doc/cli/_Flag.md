Parser for CLI args. Features:

  * Supports flags prefixed with `-`, `--`.
  * Supports `=` pairs.
  * Separates flags from unflagged args.
  * Parses flags into a map.
  * Stores remaining args as an array.
  * On-demand parsing of booleans and numbers.

```js
const flags = cl.Flag.os()
const args = flags.args
const watch = flags.boolOpt(`-w`)
```
