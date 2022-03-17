/* global Deno */

import * as a from '../all.mjs'

const FILE = `ver`

class SemVer extends a.Emp {
  constructor(major, minor, patch) {
    super().reset(major, minor, patch)
  }

  reset(major, minor, patch) {
    this.major = a.laxNat(major)
    this.minor = a.laxNat(minor)
    this.patch = a.laxNat(patch)
    return this
  }

  parse(src) {
    this.reset(...a.split(src, `.`).map(a.nat))
    return this
  }

  incMajor() {return this.major++, this}
  incMinor() {return this.minor++, this}
  incPatch() {return this.patch++, this}

  toString() {
    return a.str(this.major, `.`, this.minor, `.`, this.patch)
  }
}

Deno.writeTextFileSync(
  FILE,
  new SemVer().parse(Deno.readTextFileSync(FILE)).incPatch().toString(),
)
