Same as {{link coll Bset}} `.of` but syntactically shorter and a function. The following is equivalent:

```js
c.bsetOf(10, 20, 30)
c.Bset.of(10, 20, 30)
new c.Bset([10, 20, 30])
new c.Bset().add(10).add(20).add(30)
```
