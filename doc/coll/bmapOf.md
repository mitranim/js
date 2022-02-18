Same as {{link coll Bmap}} `.of` but syntactically shorter and a function. The following is equivalent:

```js
co.bmapOf(10, 20, 30, 40)
co.Bmap.of(10, 20, 30, 40)
new co.Bmap([[10, 20], [30, 40]])
new co.Bmap().set(10, 20).set(30, 40)
```
