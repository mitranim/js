import * as l from './lang.mjs'
import * as s from './str.mjs'
import * as c from './coll.mjs'

// Returns OS args in Deno and Node. Returns `[]` in other environemnts.
export function args() {
  return globalThis.Deno?.args ?? globalThis.process?.args ?? []
}

// Returns the OS arg at the given index, or undefined. Uses `args`.
export function arg(ind) {return args()[l.reqNat(ind)]}

export function consoleCols() {
  return (
    globalThis.Deno?.consoleSize?.()?.columns ??
    globalThis.process?.stdout?.columns
  ) | 0
}

/*
Clears the console, returning true if cleared and false otherwise. The optional
argument "soft", if true, avoids clearing the scrollback buffer; the default is
to clear scrollback.

If the environment doesn't appear to be a browser or a TTY, for example if the
program's output is piped to a file, this should be a nop. Note that
`console.clear` doesn't always perform this detection, and may print garbage to
stdout, so we avoid calling it unless we're sure. For example, `console.clear`
has TTY detection in Node 16 but not in Deno 1.17. We also don't want to rely
on Node's detection, because various polyfills/shims for Node globals may not
implement that.
*/
export function emptty(soft) {
  soft = l.laxBool(soft)

  const Deno = globalThis.Deno

  if (Deno?.isatty) {
    if (Deno.isatty()) {
      Deno.stdout.writeSync(soft ? clearSoftArr() : clearHardArr())
      return true
    }
    return false
  }

  const process = globalThis.process

  if (process?.stdout) {
    if (process.stdout.isTTY) {
      process.stdout.write(soft ? clearSoftArr() : clearHardArr())
      return true
    }
    return false
  }

  if (l.isObj(globalThis.document)) {
    console.clear()
    return true
  }

  return false
}

/*
Parser for CLI args. Features:

  * Supports flags prefixed with `-`, `--`.
  * Supports `=` pairs.
  * Separates flags from unflagged args.
  * Parses flags into a map.
  * Stores remaining args as an array.
  * On-demand parsing of booleans and numbers.
*/
export class Flag extends s.StrMap {
  constructor(val) {
    super()
    this.args = []
    this.mut(val)
  }

  boolOpt(key) {
    const val = this.get(key)
    return val === `` || s.boolOpt(val)
  }

  bool(key) {
    const val = this.get(key)
    return val === `` || s.bool(val)
  }

  mut(val) {
    if (l.isArr(val)) return this.mutFromArr(val)
    return super.mut(val)
  }

  mutFromArr(val) {
    l.reqArr(val)

    let flag
    for (val of val) {
      l.reqStr(val)

      if (!isFlag(val)) {
        if (flag) {
          this.append(flag, val)
          flag = undefined
          continue
        }

        this.args.push(val)
        continue
      }

      if (flag) {
        this.set(flag, ``)
        flag = undefined
      }

      const ind = val.indexOf(`=`)
      if (ind >= 0) {
        this.append(unFlag(val.slice(0, ind)), val.slice(ind+1))
        continue
      }

      flag = unFlag(val)
    }

    if (flag) this.set(flag, ``)
    return this
  }

  static os() {return new this(args())}
}

/*
Simple "env" map with support for parsing "env properties" strings. The parser
supports comments with `#` but not `!`, doesn't support backslash escapes, and
doesn't allow whitespace around `=`. Doesn't perform any IO; see `io_deno.mjs`
→ `EnvMap` which is a subclass.
*/
export class EnvMap extends c.Bmap {
  set(key, val) {return super.set(l.reqStr(key), l.render(val))}

  mut(val) {
    if (l.isStr(val)) return this.mutFromStr(val)
    return super.mut(val)
  }

  mutFromStr(val) {
    for (const line of this.lines(val)) this.addLine(line)
    return this
  }

  addLine(val) {
    const mat = l.reqStr(val).match(/^(\w+)=(.*)$/)
    if (!mat) throw SyntaxError(`expected valid env/properties line, got ${l.show(val)}`)
    this.set(mat[1], mat[2])
    return this
  }

  lines(val) {
    return s.lines(val).map(s.trim).filter(this.isLineNonEmpty, this)
  }

  isLineEmpty(val) {
    val = s.trim(val)
    return !val || val.startsWith(`#`)
  }

  isLineNonEmpty(val) {return !this.isLineEmpty(val)}
}

// Copied from `https://github.com/mitranim/emptty`.
export const esc = `\x1b`
export const clearSoft = esc + `c`
export const clearScroll = esc + `[3J`
export const clearHard = clearSoft + clearScroll

/*
`TextEncoder..encode` is stupidly slow. `new` is not the bottleneck.
We could encode the arrays "statically" but then it wastes CPU on module
initialization even if unused.
*/
export function clearSoftArr() {return new TextEncoder().encode(clearSoft)}
export function clearScrollArr() {return new TextEncoder().encode(clearScroll)}
export function clearHardArr() {return new TextEncoder().encode(clearHard)}

export async function timed(fun, tag) {
  const pre = tag ? s.san`[${tag}] ` : ``
  const start = performance.now()

  try {
    return await fun()
  }
  finally {
    const end = performance.now()
    console.log(s.san`${pre}done in ${end - start} ms`)
  }
}

/* Internal */

function isFlag(str) {return str.startsWith(`-`)}
function unFlag(str) {return s.stripPre(str, `-`)}
