Same as {{link coll Bset}} `.of` but syntactically shorter and a function. The following is equivalent:

```js
co.bsetOf(10, 20, 30)
co.Bset.of(10, 20, 30)
new co.Bset([10, 20, 30])
new co.Bset().add(10).add(20).add(30)
```
