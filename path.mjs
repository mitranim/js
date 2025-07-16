/*
Tools for operating on FS paths. Only string operations, no IO.
Always normalizes to Posix-style paths. At the time of writing,
all major JS engines allow to use Posix-style paths on Windows.

Limitations:
- Not completely well tested, especially on Windows.
- No special support for `file:` URLs.
- No special support for URL paths. Use `url.mjs` for that.
- No special support for relative Windows paths with a volume, like `C:path`.
- No special support for network paths starting with `\\`.
- Performance has not been optimized or even benchmarked.
*/

import * as l from './lang.mjs'
import * as s from './str.mjs'

export const FS_SEP_WINDOWS = `\\`
export const FS_SEP_POSIX = `/`

export function isPath(val) {return l.isStr(val) || l.isScalar(val)}
export function reqPath(val) {return l.req(val, isPath)}
export function optPath(val) {return l.opt(val, isPath)}

export function toPosix(val) {
  return normInner(val).replace(/[/\\]/g, FS_SEP_POSIX)
}

export function toWindows(val) {
  return normInner(val).replace(/[/\\]/g, FS_SEP_WINDOWS)
}

export function norm(...src) {return paths.norm(...src)}
export function clean(...src) {return paths.clean(...src)}
export function isRoot(...src) {return paths.isRoot(...src)}
export function isCwdRel(...src) {return paths.isCwdRel(...src)}
export function isAbs(...src) {return paths.isAbs(...src)}
export function isRel(...src) {return paths.isRel(...src)}
export function isRelExplicit(...src) {return paths.isRelExplicit(...src)}
export function isRelImplicit(...src) {return paths.isRelImplicit(...src)}
export function isDirLike(...src) {return paths.isDirLike(...src)}
export function join(...src) {return paths.join(...src)}
export function isSubOf(...src) {return paths.isSubOf(...src)}
export function strictRelTo(...src) {return paths.strictRelTo(...src)}
export function relTo(...src) {return paths.relTo(...src)}
export function dirLike(...src) {return paths.dirLike(...src)}
export function dir(...src) {return paths.dir(...src)}
export function volume(...src) {return paths.volume(...src)}
export function hasVolume(...src) {return paths.hasVolume(...src)}
export function name(...src) {return paths.name(...src)}
export function ext(...src) {return paths.ext(...src)}
export function stem(...src) {return paths.stem(...src)}
export function replaceSep(...src) {return paths.replaceSep(...src)}

/*
Collection of functions for manipulating FS paths. Defined as a class to make it
possible to subclass and override default methods used by other methods. Also
makes it possible to implement OS-specific versions, if that's ever going to be
needed. Default global instance is exported below.
*/
export class Paths extends l.Emp {
  // Preferred "directory separator".
  get dirSep() {return FS_SEP_POSIX}

  // "Extension separator".
  get extSep() {return `.`}

  // "Current working directory empty value".
  get cwdEmp() {return ``}

  // "Current working directory relative path".
  get cwdRel() {return `.`}

  // "Parent directory relative path".
  get parRel() {return `..`}

  // "Relative to current directory prefix".
  get relPre() {return this.cwdRel + this.dirSep}

  // "Relative to parent directory prefix".
  get parRelPre() {return this.parRel + this.dirSep}

  norm(val) {return normInner(val).replace(/[/\\]/g, this.dirSep)}

  // Limitations:
  // - No support for collapsing `..`.
  // - No support for collapsing inner `//`.
  clean(val) {
    val = this.norm(val)
    if (this.isCwdRel(val)) return this.cwdEmp

    const sep = this.dirSep
    if (val === sep) return val

    const vol = this.volume(val)
    if (val === vol) return val

    const root = vol + sep
    if (val === root) return val

    const len = sep.length
    const dup = sep + sep
    const pre = this.relPre

    while (val.endsWith(sep) && val !== sep && val !== root) {
      val = val.slice(0, -len)
    }

    if (val.startsWith(pre)) {
      val = val.slice(pre.length)
    }
    else {
      while (val.startsWith(dup)) val = val.slice(len)
    }
    return val
  }

  isRoot(val) {
    val = this.norm(val)
    const sep = this.dirSep
    return (val === sep) || (val === (this.volume(val) + sep))
  }

  isCwdRel(val) {
    val = this.norm(val)
    return val === this.cwdEmp || val === this.cwdRel || val === this.relPre
  }

  isAbs(val) {
    val = this.norm(val)
    return this.hasVolume(val) || val.startsWith(this.dirSep)
  }

  isRel(val) {return !this.isAbs(val)}

  isRelExplicit(val) {
    val = this.norm(val)
    return (
      val === this.cwdRel ||
      val === this.parRel ||
      val.startsWith(this.relPre) ||
      val.startsWith(this.parRelPre)
    )
  }

  isRelImplicit(val) {
    val = this.norm(val)
    return !this.isAbs(val) && !this.isRelExplicit(val)
  }

  /*
  True if the path ends with a directory separator or describes the root of a
  volume. When this returns `true`, the path definitely describes a directory.
  However, when this returns `false` and the path is non-empty, it may be also
  valid for files.
  */
  isDirLike(val) {
    val = this.norm(val)
    return (
      val === this.cwdEmp ||
      val === this.cwdRel ||
      val === this.parRel ||
      val.endsWith(this.dirSep) ||
      !!val && val === this.volume(val)
    )
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

  // Needs a more specific name because this also returns true
  // if the paths are equivalent.
  isSubOf(sub, sup) {
    sub = this.clean(sub)
    sup = this.clean(sup)

    return (
      (this.isAbs(sub) === this.isAbs(sup)) &&
      (sub === sup || sub.startsWith(this.dirLike(sup)))
    )
  }

  // Known inefficiency: in the success case, this builds and checks/strips
  // the directory prefix twice. TODO tune.
  strictRelTo(sub, sup) {
    sub = this.clean(sub)
    sup = this.clean(sup)

    if (!this.isSubOf(sub, sup)) {
      throw Error(`unable to make ${l.show(sub)} strictly relative to ${l.show(sup)}: not a subpath`)
    }

    if (sub === sup) return this.cwdEmp
    return s.stripPre(sub, this.dirLike(sup))
  }

  relTo(sub, sup) {
    sub = this.clean(sub)
    sup = this.clean(sup)

    const subAbs = this.isAbs(sub)
    const supAbs = this.isAbs(sup)
    if (subAbs !== supAbs) {
      throw Error(`unable to make ${l.show(sub)} relative to ${l.show(sup)}: paths must be both absolute or both relative`)
    }

    const subPath = s.split(sub, this.dirSep)
    const supPath = s.split(sup, this.dirSep)

    // Length of the common prefix.
    let len = 0
    while (len < subPath.length && len < supPath.length) {
      if (subPath[len] !== supPath[len]) break
      len += 1
    }

    const preLen = supPath.length - len
    const sep = this.dirSep
    const pre = preLen ? Array(preLen).fill(this.parRel).join(sep) : ``
    const suf = subPath.slice(len)
    return s.inter(pre, sep, suf.join(sep))
  }

  /*
  Should append the directory separator if the path is non-empty and doesn't
  already end with the separator. For other paths, including `.isCwdRel()`,
  this should be a nop.
  */
  dirLike(val) {return s.optSuf(this.clean(val), this.dirSep)}

  dir(val) {
    val = this.norm(val)

    if (this.isCwdRel(val)) return this.cwdEmp
    if (val.endsWith(this.dirSep)) return this.clean(val)

    val = this.clean(val)
    if (this.isRoot(val)) return val
    if (val === this.volume(val)) return val

    const ind = val.lastIndexOf(this.dirSep)
    return this.clean(val.slice(0, ind + this.dirSep.length))
  }

  volume(val) {
    val = this.norm(val)
    return l.laxStr(l.laxStr(val).match(/^[A-Za-z]:/)?.[0])
  }

  hasVolume(val) {return !!this.volume(val)}

  /*
  Usually called "basename" in other libs.
  Returns the last dir or file name, including the extension if any.
  */
  name(val) {
    val = this.norm(val)
    val = s.stripPre(val, this.volume(val))
    val = this.clean(val)
    const sep = this.dirSep
    const ind = val.lastIndexOf(sep)
    if (ind >= 0) return val.slice(ind + sep.length)
    return val
  }

  // "Extension".
  ext(val) {return extInner(this.name(val), this.extSep)}

  // Returns the part of `name` without an extension.
  stem(val) {
    val = this.name(val)
    return s.stripSuf(val, extInner(val, this.extSep))
  }

  replaceSep(val, sep) {
    return s.replaceAll(this.norm(val), this.dirSep, sep)
  }
}

const paths = new Paths()
export default paths

/* Internal */

function normInner(val) {
  if (l.isInst(val, URL)) return val.pathname
  val = l.renderLax(val)
  val = s.stripPre(val, `file://`)
  return val
}

// Must be called ONLY on the file name, without the directory path.
function extInner(val, sep) {
  l.reqStr(val)
  l.reqStr(sep)
  const ind = val.lastIndexOf(sep)
  return ind > 0 ? val.slice(ind) : ``
}
