/* global Deno */

import * as l from './lang.mjs'
import * as s from './str.mjs'

export const IS_WINDOWS = l.reqStr(Deno.build.os) === `windows`
export const SEP = IS_WINDOWS ? `\\` : `/`

export function isPath(val) {return l.isSome(val) && l.isScalar(val)}
export function reqPath(val) {return l.req(val, isPath)}
export function optPath(val) {return l.opt(val, isPath)}

export function isErrNotFound(val) {return l.isInst(val, Deno.errors.NotFound)}

export function join(...val) {return s.join(val, SEP)}

export function ext(val) {
  const mat = l.reqStr(val).match(/(?<=[^/\\])[.]\w+$/)
  return (mat && mat[0]) || ``
}

export function readText(path) {return Deno.readTextFile(reqPath(path))}

export async function readTextOpt(path) {
  if (l.isNil(path)) return ``

  try {
    return await readText(path)
  }
  catch (err) {
    if (isErrNotFound(err)) return ``
    throw err
  }
}

export async function readTextCreate(path) {
  try {return await readText(path)}
  catch (err) {
    if (isErrNotFound(err)) {
      await create(path)
      return ``
    }
    throw err
  }
}

export async function readJson(path) {
  return JSON.parse(await readText(path))
}

export function writeText(path, val, opt) {
  return Deno.writeTextFile(reqPath(path), l.reqStr(val), opt)
}

export function create(path) {return Deno.create(reqPath(path))}

export async function touch(path) {
  const info = await FileInfo.statOpt(path)

  if (!info) {
    await create(path)
    return
  }

  if (!info.isFile()) throw Error(`${l.show(path)} is not a file`)
}

export function maybeRel(path) {
  return s.stripPre(path, s.optSuf(Deno.cwd(), SEP))
}

export async function* watch(fun) {
  l.reqFun(fun)
  for await (const event of Deno.watchFs(`.`, {recursive: true})) {
    if (event.paths.some(fun)) yield event
  }
}

export class FileInfo {
  constructor(stat, path) {
    this.stat = l.reqStruct(stat)
    this.path = reqPath(path)
  }

  isFile() {return this.stat.isFile}
  isDir() {return this.stat.isDirectory}

  onlyFile() {return this.isFile() ? this : undefined}
  onlyDir() {return this.isDir() ? this : undefined}

  static async stat(path) {
    return new this(await Deno.stat(reqPath(path)), path)
  }

  static async statOpt(path) {
    if (l.isNil(path)) return undefined

    try {
      return await this.stat(path)
    }
    catch (err) {
      if (isErrNotFound(err)) return undefined
      throw err
    }
  }

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export function isReader(val) {return l.hasMeth(val, `read`)}
export function reqReader(val) {return l.req(val, isReader)}

export function isCloser(val) {return l.hasMeth(val, `close`)}
export function reqCloser(val) {return l.req(val, isCloser)}

function optClose(val) {if (isCloser(val)) val.close()}

// Adapter between `Deno.Reader` and standard `ReadableStream`.
export class StreamSource {
  constructor(src) {
    this.src = reqReader(src)
    this.closed = false
  }

  // Called by `ReadableStream` when data is requested.
  async pull(ctr) {
    const buf = new Uint8Array(this.size)

    try {
      const len = await this.src.read(buf)

      if (l.isNil(len)) {
        this.deinit()
        ctr.close()
      }
      else {
        ctr.enqueue(buf.subarray(0, len))
      }
    }
    catch (err) {
      this.deinit()
      ctr.error(err)
    }
  }

  // Called by `ReadableStream` when canceled.
  cancel() {this.deinit()}

  // Just for completeness.
  close() {this.deinit()}

  deinit() {
    if (!this.closed) {
      this.closed = true
      optClose(this.src)
    }
  }

  static async open(path) {return new this(await Deno.open(path))}

  get size() {return 4096}
  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class FileStream extends ReadableStream {
  constructor(src, path) {
    super(src)
    this.src = l.reqInst(src, StreamSource)
    this.path = optPath(path)
  }

  cancel() {return this.deinit(), super.cancel()}
  close() {this.deinit()}
  deinit() {this.src.deinit()}

  static async open(path) {
    return new this(await this.Source.open(path), path)
  }

  static get Source() {return StreamSource}
  get [Symbol.toStringTag]() {return this.constructor.name}
}
