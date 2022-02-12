import * as l from './lang.mjs'

export const HAS_DOM = (
  typeof window === `object` && l.isObj(window) &&
  typeof document === `object` && l.isObj(document)
)

export const KEY_ESCAPE = `Escape`

export const CAPTURE = /* @__PURE__ */ Object.freeze({capture: true})

export const TARGET_BLANK = /* @__PURE__ */ Object.freeze({target: `_blank`, rel: `noopener noreferrer`})

export function isEvent(val) {return typeof Event === `function` && l.isInst(val, Event)}
export function reqEvent(val) {return l.req(val, isEvent)}
export function optEvent(val) {return l.opt(val, isEvent)}

export function isNode(val) {return typeof Node === `function` && l.isInst(val, Node)}
export function reqNode(val) {return l.req(val, isNode)}
export function optNode(val) {return l.opt(val, isNode)}

export function isElement(val) {return typeof Element === `function` && l.isInst(val, Element)}
export function reqElement(val) {return l.req(val, isElement)}
export function optElement(val) {return l.opt(val, isElement)}

export function isDomHandler(val) {return l.hasMeth(val, `handleEvent`)}
export function reqDomHandler(val) {return l.req(val, isDomHandler)}
export function optDomHandler(val) {return l.opt(val, isDomHandler)}

export function eventStop(val) {
  if (optEvent(val)) {
    val.preventDefault()
    val.stopPropagation()
  }
  return val
}

export function isEventModified(val) {
  return !!(optEvent(val) && (val.altKey || val.ctrlKey || val.metaKey || val.shiftKey))
}

export function nodeShow(val) {if (optNode(val) && val.hidden) val.hidden = false}
export function nodeHide(val) {if (optNode(val) && !val.hidden) val.hidden = true}
export function nodeRemove(val) {if (optNode(val)) val.remove()}
export function nodeSel(val, sel) {return val.querySelector(l.reqStr(sel))}
export function nodeSelAll(val, sel) {return val.querySelectorAll(l.reqStr(sel))}

export function isConnected(val) {return isNode(val) && val.isConnected}
export function isDisconnected(val) {return isNode(val) && !val.isConnected}

export function addEvents(node, names, opt) {
  reqDomHandler(node)
  for (const name of l.reqArr(names)) node.addEventListener(name, node, opt)
}

export function removeEvents(node, names, opt) {
  reqDomHandler(node)
  for (const name of l.reqArr(names)) node.removeEventListener(name, node, opt)
}

export function clip(val) {
  if (!(val = l.laxStr(val))) return

  const node = document.createElement(`input`)
  node.value = val

  document.body.append(node)
  try {clipNode(node)}
  finally {node.remove()}
}

export function clipNode(val) {selectText(val), document.execCommand(`copy`)}

export function selectText(val) {
  if (!optElement(val)) return

  if (l.hasMeth(val, `select`)) {
    val.select()
  }
  else if (l.hasMeth(val, `setSelectionRange`)) {
    val.setSelectionRange(0, l.laxStr(val.value).length)
  }
}
