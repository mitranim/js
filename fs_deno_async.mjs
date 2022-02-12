/* global Deno */

import * as l from './lang.mjs'
import * as s from './str.mjs'

export const IS_WINDOWS = l.reqStr(Deno.build.os) === `windows`
export const SEP = IS_WINDOWS ? `\\` : `/`

export function isPath(val) {return l.isScalar(val)}
export function reqPath(val) {return l.req(val, isPath)}

export function isErrNotFound(val) {return l.isInst(val, Deno.errors.NotFound)}

export function join(...vals) {
  vals.forEach(l.reqStr)
  return vals.join(SEP)
}

export function readText(path) {return Deno.readTextFile(reqPath(path))}

export async function readTextOpt(path) {
  try {return await readText(path)}
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

export function stat(path) {return Deno.stat(reqPath(path))}

export async function statOpt(path) {
  try {return await stat(path)}
  catch (err) {
    if (isErrNotFound(err)) return undefined
    throw err
  }
}

export function create(path) {return Deno.create(reqPath(path))}

export async function touch(path) {
  const info = await statOpt(path)
  if (!info) {
    await create(path)
    return
  }
  if (!info.isFile) throw Error(`${l.show(path)} is not a file`)
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
