Simple router that uses only URL and pathname. Suitable for SPA. For servers, use {{link http ReqRou}} which supports requests and HTTP methods.

Basics:

```js
const rou = new h.Rou(`https://example.com/path?query#hash`)

rou.url // Url { https://example.com/path?query#hash }
rou.url.href === `https://example.com/path?query#hash`
rou.pathname === `/path`
rou.groups === undefined

rou.pat(`/`) === false
rou.pat(`/blah`) === false
rou.pat(`/path`) === true

rou.pat(/^[/](?<key>[^/]+)$/) === true
rou.groups // {key: `path`}
```

Routing is imperative:

```js
import * as h from '{{featUrl http}}'
import * as l from '{{featUrl lang}}'

const nextPage = route(window.location)

function route(loc) {
  const rou = new h.Rou(loc)

  if (rou.pat(`/`)) return PageIndex(rou)
  if (rou.pat(`/articles`)) return PageArticles(rou)
  if (rou.pat(/^[/]articles[/](?<key>[^/]+)$/)) return PageArticle(rou)
  return Page404(rou)
}

function PageArticle(rou) {
  const key = l.reqPk(rou.reqGroups().key)
  return `page for article ${key}`
}
```
