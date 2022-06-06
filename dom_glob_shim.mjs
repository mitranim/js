/*
Mirror of `dom_glob_native.mjs`, using the DOM shim.
Should be used for non-browser environments such as Deno/Node.
*/

export {glob, dom, document, customElements} from './dom_shim.mjs'
