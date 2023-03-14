Takes a class and hacks its prototype, converting all non-inherited getters to lazy/memoizing versions of themselves that only execute _once_. The resulting value replaces the getter. Inherited getters are unaffected.

```js
import * as o from '{{featUrl obj}}'

class Bucket {
  static {o.memGet(this)}
  get one() {return new o.StructLax()}
  get two() {return new o.StructLax()}
}

const ref = new Bucket()
// Bucket {}

ref.one.three = 30
ref
// Bucket { one: Struct { three: 30 } }

ref.two.four = 40
ref
// Bucket { one: Struct { three: 30 }, two: Struct { four: 40 } }
```
