Variant of {{link coll Bmap}} with support for key and value checks. Subclasses must override methods `.key` and `.val`. These methods are automatically called by `.set`. Method `.key` must validate and return the given key, and method `.val` must validate and return the given value. Use type assertions provided by {{featLink lang}}.

```js
import * as l from '{{featUrl lang}}'
import * as co from '{{featUrl coll}}'

class StrNatMap extends co.TypedMap {
  key(key) {return l.reqStr(key)}
  val(val) {return l.reqNat(val)}
}
```
