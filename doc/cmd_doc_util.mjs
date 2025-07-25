import * as l from '../lang.mjs'
import * as o from '../obj.mjs'

export class Strict extends l.Emp {
  // eslint-disable-next-line constructor-super
  constructor() {return new Proxy(super(), PH)}
}

export const PH = {
  __proto__: null,

  get(tar, key, pro) {
    if (l.hasOwn(tar, key)) return tar[key]

    /*
    For async/await. JS engines don't try the `.has` trap for this property,
    they just `.get` it.
    */
    if (key === `then`) return tar[key]

    // For compatibility with `memGet`.
    const desc = o.descIn(tar, key)
    if (!desc) throw l.errIn(tar, key)
    if (desc.get) return desc.get.call(pro)

    return desc.value
  },
}
