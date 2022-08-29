Variant of {{link coll Bmap}} with support for key and value checks. Subclasses must override methods `.reqKey` and `.reqVal`. These methods are automatically called by `.set`. Method `.reqKey` must validate and return the given key, and method `.reqVal` must validate and return the given value. Use type assertions provided by {{featLink lang}}.

```js
import * as l from '{{featUrl lang}}'
import * as co from '{{featUrl coll}}'

class StrNatMap extends co.TypedMap {
  reqKey(key) {return l.reqStr(key)}
  reqVal(val) {return l.reqNat(val)}
}
```
