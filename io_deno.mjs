/* global Deno */

import * as l from './lang.mjs'
import * as p from './path.mjs'
import * as cl from './cli.mjs'

export const IS_WINDOWS = l.reqStr(Deno.build.os) === `windows`
export const SEP = IS_WINDOWS ? p.SEP_WINDOWS : p.SEP_POSIX
export const paths = IS_WINDOWS ? p.windows : p.posix

export function isErrNotFound(val) {return l.isInst(val, Deno.errors.NotFound)}

// Defined for symmetry with `readTextOpt`.
export function readText(path) {return Deno.readTextFile(path)}

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

// Defined for symmetry with `readTextSyncOpt`.
export function readTextSync(path) {return Deno.readTextFileSync(path)}

export function readTextSyncOpt(path) {
  if (l.isNil(path)) return ``

  try {
    return Deno.readTextFileSync(path)
  }
  catch (err) {
    if (isErrNotFound(err)) return ``
    throw err
  }
}

export async function readTextCreate(path) {
  try {
    return await readText(path)
  }
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
  return Deno.writeTextFile(p.reqPath(path), l.reqStr(val), opt)
}

export function create(path) {return Deno.create(p.reqPath(path))}

export async function touch(path) {
  const info = await FileInfo.statOpt(path)

  if (!info) {
    await create(path)
    return
  }

  if (!info.isFile()) throw Error(`${l.show(path)} is not a file`)
}

export function cwd() {return Deno.cwd()}

export function watchCwd() {return watchRel(Deno.cwd())}

/*
Needs a better name. Watches a path, converting all paths in each `Deno.FsEvent`
from absolute to relative.
*/
export async function* watchRel(base) {
  l.req(base, paths.isAbs.bind(paths))
  const toRel = path => paths.strictRelTo(path, base)

  for await (const event of Deno.watchFs(base, {recursive: true})) {
    event.paths = event.paths.map(toRel)
    yield event
  }
}

export async function* filterWatch(iter, fun) {
  l.reqFun(fun)
  for await (const event of iter) {
    if (event.paths.some(fun)) yield event
  }
}

export class FileInfo extends l.Emp {
  constructor(stat, path) {
    super()
    this.path = p.reqPath(path)
    this.stat = l.reqStruct(stat)
  }

  isFile() {return this.stat.isFile}
  isDir() {return this.stat.isDirectory}

  onlyFile() {return this.isFile() ? this : undefined}
  onlyDir() {return this.isDir() ? this : undefined}

  static async stat(path) {
    return new this(await Deno.stat(p.reqPath(path)), path)
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
}

export function isReader(val) {return l.hasMeth(val, `read`)}
export function reqReader(val) {return l.req(val, isReader)}

export function isCloser(val) {return l.hasMeth(val, `close`)}
export function reqCloser(val) {return l.req(val, isCloser)}

function optClose(val) {if (isCloser(val)) val.close()}

// Adapter between `Deno.Reader` and standard `ReadableStream`.
export class ReaderStreamSource extends l.Emp {
  constructor(src) {
    super()
    this.src = reqReader(src)
    this.closed = false
  }

  // Called by `ReadableStream` when data is requested.
  async pull(ctr) {
    const buf = new Uint8Array(this.size())

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

  size() {return 4096 * 16}
}

export class FileStream extends ReadableStream {
  constructor(src, path) {
    super(src)
    this.src = l.reqInst(src, ReaderStreamSource)
    this.path = p.optPath(path)
  }

  cancel() {return this.deinit(), super.cancel()}
  close() {this.deinit()}
  deinit() {this.src.deinit()}

  static async open(path) {
    return new this(await this.Source.open(path), path)
  }

  static get Source() {return ReaderStreamSource}
}

/*
Concatenates inputs into one stream. Supported inputs:

  * Nils.
  * `ReadableStream` instances.
  * `Uint8Array` instances.
  * String values.
  * Stringable primitives such as numbers.
  * Stringable objects such as `URL` instances.

Other inputs are rejected with an exception.

This class uses only standard web APIs, nothing Deno-related. If we end up
writing other stream tools, we'll move this to a dedicated module.
*/
export class ConcatStreamSource extends l.Emp {
  constructor(...src) {
    super()
    this.src = src.map(this.usable, this).filter(l.id)
  }

  async pull(ctr) {
    try {await this.pullUnchecked(ctr)}
    catch (err) {
      this.deinit(err)
      ctr.error(err)
    }
  }

  async pullUnchecked(ctr) {
    while (this.src.length) {
      const src = this.src[0]
      if (l.isNil(src)) {
        this.src.shift()
        continue
      }

      if (l.isInst(src, Uint8Array)) {
        this.src.shift()
        ctr.enqueue(src)
        return
      }

      const {done, value} = await src.read()
      if (done) {
        this.src.shift()
        continue
      }

      ctr.enqueue(value)
      return
    }

    ctr.close()
  }

  cancel(why) {return this.deinit(why)}

  deinit(why) {
    for (const val of this.src) deinit(val, why)
    this.src.length = 0
  }

  usable(val) {
    if (l.isNil(val)) return val
    if (l.isInst(val, ReadableStream)) return val.getReader()
    if (l.isInst(val, Uint8Array)) return val
    return new TextEncoder().encode(l.renderLax(val))
  }

  static stream(...val) {return new this.Stream(new this(...val))}
  static get Stream() {return ReadableStream}
}

// Readers implement only `.cancel`. However, as a policy, we always support
// `.deinit` which is our "standard" deinitialization interface.
function deinit(val, why) {
  if (l.hasMeth(val, `cancel`)) val.cancel(why)
  else if (l.hasMeth(val, `deinit`)) val.deinit(why)
}

export class EnvMap extends cl.EnvMap {
  mutFromFile(path) {return this.mut(readTextSync(path))}
  mutFromFileOpt(path) {return this.mut(readTextSyncOpt(path))}

  deleteInstalled() {
    for (const key of this.keys()) {
      if (l.isSome(Deno.env.get(key))) this.delete(key)
    }
    return this
  }

  install() {
    for (const [key, val] of this.entries()) {
      Deno.env.set(l.reqStr(key), l.render(val))
    }
    return this
  }
}
