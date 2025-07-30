/*
Compare `./io_deno.mjs`. The two modules should have the same interface.
For consumer code, the pseudo-module `./io` should automatically resolve
to the engine-specific implementation via `package.json`.`exports`.
*/

// deno-lint-ignore-file no-process-global
/* global Bun, process */

import * as fs from 'node:fs'
import * as fsp from 'node:fs/promises'
import * as os from 'node:os'
import * as l from './lang.mjs'
import * as pt from './path.mjs'

export const ENV = process.env

export function cwd() {return process.cwd()}

export function exit(...src) {return process.exit(...src)}

export function isErrNotFound(val) {return val?.code === `ENOENT`}
export function skipErrNotFound(val) {return l.errSkip(val, isErrNotFound)}

export function validPath(val) {
  if (l.isKey(val)) return val
  if (l.isInst(val, URL)) return val
  return l.reqScalar(val).toString()
}
export function validPathOpt(val) {return l.opt(val, validPath)}

export function readFileText(path) {return Bun.file(validPath(path)).text()}

export function readFileTextSync(path) {
  return fs.readFileSync(validPath(path), {encoding: `utf8`})
}

export function readFileBytes(path) {return Bun.file(validPath(path)).bytes()}
export function readFileBytesSync(path) {return fs.readFileSync(validPath(path))}

export function readFileTextOpt(path) {
  if (l.isNil(path)) return undefined
  return readFileText(path).catch(skipErrNotFound)
}

export function readFileTextOptSync(path) {
  if (l.isNil(path)) return undefined
  try {return readFileTextSync(path)}
  catch (err) {
    if (isErrNotFound(err)) return undefined
    throw err
  }
}

export function writeFile(path, body) {
  path = validPath(path)
  if (l.isNil(body)) return Bun.write(path, ``)
  if (l.isStr(body)) return Bun.write(path, body)
  if (l.isInst(body, Uint8Array)) return Bun.write(path, body)
  if (l.isInst(body, Response)) return Bun.write(path, body)
  if (l.isInst(body, ReadableStream)) return Bun.write(path, new Response(body))
  throw TypeError(`unable to write ${l.show(path)}: file body must be [string | Uint8Array | ReadableStream | Response], got ${l.show(body)}`)
}

export function writeFileSync(path, body, opt) {
  path = validPath(path)
  l.optRec(opt)
  if (l.isNil(body)) return fs.truncateSync(path)
  if (l.isStr(body)) return fs.writeFileSync(path, body, opt)
  if (l.isInst(body, Uint8Array)) return fs.writeFileSync(path, body, opt)
  throw TypeError(`unable to write ${l.show(path)}: file body must be [string | Uint8Array], got ${l.show(body)}`)
}

// Directory removal is assumed to be always recursive.
export function remove(path, opt) {
  path = validPath(path)
  l.optRec(opt)
  if (opt?.recursive) return fsp.rmdir(path, opt)
  return fsp.unlink(validPath(path), opt)
}

// Directory removal is assumed to be always recursive.
export function removeSync(path, opt) {
  path = validPath(path)
  l.optRec(opt)
  if (opt?.recursive) return fs.rmdirSync(path, opt)
  return fs.unlinkSync(validPath(path))
}

export function exists(path) {return fs.exists(validPath(path))}
export function existsSync(path) {return fs.existsSync(validPath(path))}

export async function stat(path) {
  return statNorm(await Bun.file(validPath(path)).stat())
}

export function statSync(path) {
  return statNorm(fs.statSync(validPath(path)))
}

export function statOpt(path) {
  path = validPath(path)
  if (l.isNil(path) || path === ``) return undefined
  return stat(path).catch(skipErrNotFound)
}

export function statOptSync(path) {
  path = validPath(path)
  if (l.isNil(path) || path === ``) return undefined
  try {return statSync(path)}
  catch (err) {
    if (isErrNotFound(err)) return undefined
    throw err
  }
}

export function statNorm(src) {
  if (!l.optRec(src)) return undefined

  return {
    __proto__: null,
    isDir: src.isDirectory(),
    isFile: src.isFile(),
    isSymlink: src.isSymbolicLink(),
    isBlockDevice: src.isBlockDevice(),
    isCharDevice: src.isCharacterDevice(),
    isSocket: src.isSocket(),
    isFifo: src.isFIFO(),
    size: src.size,
    mtime: src.mtimeMs,
    atime: src.atimeMs,
    birthtime: src.birthtimeMs,
    ctime: src.ctimeMs,
    uid: src.uid,
    gid: src.gid,
    dev: src.dev,
    ino: src.ino,
    rdev: src.rdev,
    mode: src.mode,
    nlink: src.nlink,
    blksize: src.blksize,
    blocks: src.blocks,
  }
}

// Caller must eventually call `.cancel` on the stream.
export function fileReadStream(path) {
  return Bun.file(validPath(path)).stream()
}

export function mkdir(path, opt) {return fsp.mkdir(validPath(path), opt)}
export function mkdirSync(path, opt) {return fs.mkdirSync(validPath(path), opt)}

export function mkdirTemp(opt) {return fsp.mkdtemp(tmpOpt(opt))}
export function mkdirTempSync(opt) {return fs.mkdtempSync(tmpOpt(opt))}

// Aims to align with Deno's default behavior.
function tmpOpt(opt) {
  l.optRec(opt)
  const dir = validPathOpt(opt?.dir) ?? os.tmpdir()
  const pre = l.optStr(opt?.prefix)
  return pre ? pt.join(dir, pre) : pt.dirLike(dir)
}

export function readDir(path, opt) {return fsp.readdir(validPath(path), opt)}
export function readDirSync(path, opt) {return fs.readdirSync(validPath(path), opt)}

export function rename(prev, next) {
  return fsp.rename(validPath(prev), validPath(next))
}

export function renameSync(prev, next) {
  return fs.renameSync(validPath(prev), validPath(next))
}

// Defined for symmetry with `io_deno.mjs`.
export function watchCwd() {return watchRel(`.`)}

// Defined for symmetry with `io_deno.mjs`.
export async function* watchRel(base) {
  base = l.reqStr(validPath(base))
  const iter = fsp.watch(base, {recursive: true})
  for await (const {eventType: type, filename: path} of iter) {
    yield {type, path}
  }
}
