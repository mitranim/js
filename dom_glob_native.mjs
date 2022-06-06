/*
Mirror of `dom_glob_shim.mjs`, using native DOM globals.
Should be used for browser environments.
*/

export const glob = globalThis
export const dom = glob.document?.implementation
export const document = glob.document
export const customElements = glob.customElements
