Idempotently converts a path from Windows-style to Posix-style. Useful in some edge case scenarios.

```js
import * as p from '{{featUrl}}'

console.log(p.toPosix(`one\\two\\three`))
// 'one/two/three'

console.log(p.toPosix(`one/two/three`))
// 'one/two/three'
```
