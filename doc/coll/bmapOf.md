Same as {{link coll Bmap}} `.of` but syntactically shorter and a function. The following is equivalent:

```js
c.bmapOf(10, 20, 30, 40)
c.Bmap.of(10, 20, 30, 40)
new c.Bmap([[10, 20], [30, 40]])
new c.Bmap().set(10, 20).set(30, 40)
```
