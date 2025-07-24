/*
Compare `./io_bun.mjs`. The two modules should have the same shape.
Consumer code should be able to import `./io` and have it automatically
resolved to the engine-specific implementation.
*/

/* global Deno */

import * as l from './lang.mjs'
import * as pt from './path.mjs'

export const ENV = globalThis.process.env

export function cwd() {return Deno.cwd()}
export function exit(...src) {return Deno.exit(...src)}

export function isErrNotFound(val) {return l.isInst(val, Deno.errors.NotFound)}
export function skipErrNotFound(val) {return l.errSkip(val, isErrNotFound)}

export function validPath(val) {
  if (l.isPrim(val)) return val
  if (l.isInst(val, URL)) return val
  return l.reqScalar(val).toString()
}

export function readFileText(path) {return Deno.readTextFile(validPath(path))}
export function readFileTextSync(path) {return Deno.readTextFileSync(validPath(path))}

export function readFileBytes(path) {return Deno.readFile(path)}
export function readFileBytesSync(path) {return Deno.readFileSync(path)}

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

export function writeFile(path, body, opt) {
  path = validPath(path)
  l.optRec(opt)
  if (l.isNil(body)) return Deno.create(path)
  if (l.isStr(body)) return Deno.writeTextFile(path, body, opt)
  if (l.isInst(body, Uint8Array)) return Deno.writeFile(path, body, opt)
  if (l.isInst(body, ReadableStream)) return Deno.writeFile(path, body, opt)
  throw TypeError(`unable to write ${l.show(path)}: file body must be [string | Uint8Array | ReadableStream], got ${l.show(body)}`)
}

export function writeFileSync(path, body, opt) {
  validPath(path)
  l.optRec(opt)
  if (l.isNil(body)) return Deno.createSync(path)
  if (l.isStr(body)) return Deno.writeTextFileSync(path, body, opt)
  if (l.isInst(body, Uint8Array)) return Deno.writeFileSync(path, body, opt)
  throw TypeError(`unable to write ${l.show(path)}: file body must be [string | Uint8Array], got ${l.show(body)}`)
}

export function remove(path) {return Deno.remove(path)}
export function removeSync(path) {return Deno.removeSync(path)}

export async function exists(path) {return !!await statOpt(path)}
export function existsSync(path) {return !!statOptSync(path)}

export async function stat(path) {
  return statNorm(await Deno.stat(validPath(path)))
}

export function statSync(path) {
  return statNorm(Deno.statSync(validPath(path)))
}

export function statOpt(path) {
  if (l.isNil(path) || path === ``) return undefined
  return stat(path).catch(skipErrNotFound)
}

export function statOptSync(path) {
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
    isDir: src.isDirectory,
    isFile: src.isFile,
    isSymlink: src.isSymlink,
    isBlockDevice: src.isBlockDevice,
    isCharDevice: src.isCharDevice,
    isSocket: src.isSocket,
    isFifo: src.isFifo,
    size: src.size,
    mtime: src.mtime?.valueOf(),
    atime: src.atime?.valueOf(),
    birthtime: src.birthtime?.valueOf(),
    ctime: src.ctime?.valueOf(),
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
export async function fileReadStream(path) {
  return (await Deno.open(path)).readable
}

// Caller must eventually call `.close` on the stream.
export async function fileWriteStream(path) {
  return (await Deno.open(path)).writable
}

export function mkdir(path, opt) {
  return Deno.mkdir(validPath(path), l.reqRec(opt))
}

export function mkdirSync(path, opt) {
  return Deno.mkdirSync(validPath(path), l.reqRec(opt))
}

export async function readDir(path) {
  const out = []
  for await (const val of Deno.readDir(validPath(path))) {
    val.toString = toStringGetName
    out.push(val)
  }
  return out
}

export function readDirSync(path) {
  const out = [...Deno.readDirSync(validPath(path))]
  for (const val of out) val.toString = toStringGetName
  return out
}

export function watchCwd() {return watchRel(Deno.cwd())}

export async function* watchRel(base) {
  l.req(base, pt.isAbs)
  const iter = Deno.watchFs(base, {recursive: true})
  for await (const {kind: type, paths} of iter) {
    for (const path of paths) yield {type, path: pt.strictRelTo(path, base)}
  }
}

/* Internal */

/* eslint-disable no-invalid-this */
function toStringGetName() {return this.name}
/* eslint-enable no-invalid-this */
