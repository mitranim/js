Returns a new function that negates the result of the given function, like a delayed `!`.

```js
import * as l from '{{featUrl lang}}'

function eq(a, b) {return a === b}

const different = l.not(eq)

different(10, 20)
// !eq(10, 20) = true

// equivalent:
function different(a, b) {return !eq(a, b)}
```
