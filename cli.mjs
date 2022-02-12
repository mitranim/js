import * as l from './lang.mjs'
import * as s from './str.mjs'

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

  const {Deno} = globalThis

  if (Deno?.isatty) {
    if (Deno.isatty()) {
      Deno.stdout.writeSync(soft ? clearSoftArr : clearHardArr)
      return true
    }
    return false
  }

  const {process} = globalThis

  if (process?.stdout) {
    if (process.stdout.isTTY) {
      process.stdout.write(soft ? clearSoftArr : clearHardArr)
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
    if (l.isSome(val)) this.add(val)
  }

  boolOpt(key) {
    const val = this.get(key)
    return val === `` || s.boolOpt(val)
  }

  bool(key) {
    const val = this.get(key)
    return val === `` || s.bool(val)
  }

  add(val) {
    if (l.isArr(val)) return this.addArr(val)
    return super.add(val)
  }

  addArr(val) {
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

function isFlag(str) {return str.startsWith(`-`)}
function unFlag(str) {return s.stripPre(str, `-`)}

const enc = new TextEncoder()

// Copied from `https://github.com/mitranim/emptty`.
export const esc = `\x1b`
export const clearSoft = esc + `c`
export const clearScroll = esc + `[3J`
export const clearHard = clearSoft + clearScroll
export const clearSoftArr = enc.encode(clearSoft)
export const clearScrollArr = enc.encode(clearScroll)
export const clearHardArr = enc.encode(clearHard)

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
