/*
Various tools for FS paths like those used in Posix and Windows.
Only string operations, no IO.

Limitations:

  * Not well tested. Expect to delete random files on your disk.
  * No support for network paths starting with `\\`.
  * No support for `file:` URLs.
  * Performance has not been optimized or even benchmarked.
  * No support for URL paths. Use `url.mjs` for that.

This module is environment-independent and doesn't detect the current OS.
Default OS-specific instance can be imported from OS-aware module,
namely from `io_deno.mjs`.
*/

import * as l from './lang.mjs'
import * as s from './str.mjs'

export const SEP_WINDOWS = `\\`
export const SEP_POSIX = `/`

/*
Allows strings and custom stringable objects, such as file URLs supported by
Node and Deno. Note that `Paths.prototype.toStr` currently doesn't support
non-strings. We may change that later.
*/
export function isPath(val) {return l.isStr(val) || (l.isObj(val) && l.isScalar(val))}
export function reqPath(val) {return l.req(val, isPath)}
export function optPath(val) {return l.opt(val, isPath)}

export function toPosix(val) {return windows.replaceSep(val, posix.dirSep)}

/*
Collection of functions for manipulating FS paths. Base class used by
OS-specific implementations. Why this is defined as a class:

  * Makes it easy to share logic between Windows and Posix variants.
    They use overrides without having to pass "options" between functions.

  * Makes it possible to implement other variants with a few overrides.

  * Makes it possible to monkey-patch.

  * Subclasses may choose to be stateful.

Default global instances are exported below.
*/
export class Paths extends l.Emp {
  // "Directory separator".
  get dirSep() {throw l.errImpl()}

  // "Extension separator".
  get extSep() {return `.`}

  // "Current working directory relative path".
  get cwdRel() {return `.`}

  // "Current working directory empty value".
  get cwdEmp() {return ``}

  relPre() {return this.cwdRel + this.dirSep}

  // "Volume".
  vol() {return ``}

  // "Has a volume".
  hasVol(val) {return !!this.vol(val)}

  isAbs(val) {
    val = this.toStr(val)
    return this.hasVol(val) || val.startsWith(this.dirSep)
  }

  isRel(val) {return !this.isAbs(val)}

  /*
  Can only be trusted when `true`. Cannot be trusted when `false`.
  The following code is invalid and should not compile:

    if (!paths.isDir(path)) {}
  */
  isDir(val) {
    val = this.toStr(val)
    return this.isCwdRel(val) || val.endsWith(this.dirSep)
  }

  isRoot(val) {
    val = this.toStr(val)
    if (val === this.dirSep) return true
    const vol = this.vol(val)
    return !!vol && (val === vol || val === vol + this.dirSep)
  }

  // "Is relative path to current working directory".
  isCwdRel(val) {
    val = this.toStr(val)
    return val === this.cwdEmp || val === this.cwdRel || val === this.relPre()
  }

  clean(val) {return this.cleanPre(this.cleanSuf(val))}

  cleanPre(val) {
    val = this.toStr(val)
    if (this.isCwdRel(val)) return this.cwdEmp
    if (this.isAbs(val)) return val
    return s.stripPre(val, this.relPre())
  }

  cleanSuf(val) {
    val = this.toStr(val)
    if (this.isRoot(val)) return val
    return s.stripSuf(val, this.dirSep)
  }

  // Missing feature: `..` flattening.
  join(base, ...vals) {
    base = this.clean(base)

    for (const src of vals) {
      const val = this.clean(src)
      if (this.isAbs(val)) {
        throw Error(`unable to append absolute path ${l.show(src)} to ${l.show(base)}`)
      }
      base = s.inter(base, this.dirSep, val)
    }

    return base
  }

  isRelTo(val, pre) {
    val = this.clean(val)
    pre = this.clean(pre)

    return (
      (this.isAbs(val) === this.isAbs(pre)) &&
      (val === pre || val.startsWith(this.dirLike(pre)))
    )
  }

  // Questionable implementation.
  relTo(val, pre) {
    val = this.clean(val)
    pre = this.clean(pre)

    if (!this.isRelTo(val, pre)) {
      throw Error(`unable to make ${l.show(val)} relative to ${l.show(pre)}`)
    }

    if (val === pre) return this.cwdEmp
    return s.stripPre(val, this.dirLike(pre))
  }

  /*
  Should append the directory separator if the path is non-empty and doesn't
  already end with the separator. For other paths, including `.isCwdRel()`,
  this should be a nop.
  */
  dirLike(val) {return s.optSuf(this.clean(val), this.dirSep)}

  dir(val) {
    val = this.toStr(val)

    if (this.isCwdRel(val)) return this.cwdEmp
    if (val.endsWith(this.dirSep)) return this.clean(val)

    val = this.clean(val)
    if (this.isRoot(val)) return val

    const ind = val.lastIndexOf(this.dirSep)
    return this.clean(val.slice(0, ind + this.dirSep.length))
  }

  /*
  Usually called "basename" in other libs.
  Returns the last dir or file name, including the extension if any.
  */
  base(val) {
    val = this.clean(val)
    if (this.isRoot(val)) return val

    const ind = val.lastIndexOf(this.dirSep)
    return this.clean(val.slice(ind + this.dirSep.length))
  }

  // "Extension".
  ext(val) {return ext(this.base(val), this.extSep)}

  // Returns the part of `base` without an extension.
  name(val) {
    val = this.base(val)
    return s.stripSuf(val, ext(val, this.extSep))
  }

  replaceSep(val, sep) {
    return s.replaceAll(this.toStr(val), this.dirSep, sep)
  }

  /*
  More lax than `l.reqStr`, more strict than `l.render`. Not part of `lang.mjs`
  because allowing only this set of inputs is relatively rare.
  */
  toStr(val) {
    if (l.isStr(val)) return val
    if (l.isInst(val, String)) return val.toString()
    throw l.errConv(val, `string`)
  }
}

export class PathsPosix extends Paths {
  get dirSep() {return SEP_POSIX}
}

/*
Known limitations:

  * No support for `/`. We simply assume that all FS paths use `\`.
  * No support for relative paths with a volume, like `C:path`.
  * No support for network paths.
*/
export class PathsWindows extends Paths {
  get dirSep() {return SEP_WINDOWS}

  vol(val) {
    const mat = this.toStr(val).match(/^[A-Za-z]:/)
    return (mat && mat[0]) || ``
  }

  isDir(val) {
    val = this.toStr(val)
    return super.isDir(val) || val === this.vol(val)
  }
}

/*
Default global instances. The appropriate instance for the current OS must be
chosen by OS-aware modules such as `io_deno.mjs`.
*/
export const posix = new PathsPosix()
export const windows = new PathsWindows()

/* Internal */

// Must be called ONLY on the file name, without the directory path.
function ext(val, sep) {
  l.reqStr(val)
  l.reqStr(sep)
  const ind = val.lastIndexOf(sep)
  return ind > 0 ? val.slice(ind) : ``
}
