Short for "request router" or "request-response router". Advanced version of {{link http Rou}}. Suitable for servers and SSR/SPA hybrid apps.

Routing can be shared between SSR and SPA:

```js
import * as h from '{{featUrl http}}'

function route(rou) {
  l.reqInst(rou, h.ReqRou)

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

SSR uses incoming requests:

```js
function response(req) {
  return htmlRes(route(new h.ReqRou(req)))
}

// Consider also using `h.ResBui`.
function htmlRes(body) {
  return new Response(body, {headers: {[h.HEAD_CONTENT_TYPE]: h.TYPE_HTML}})
}
```

SPA uses current URL:

```js
const page = route(h.ReqRou.from(window.location))
```

For SSR/SPA isomorphic rendering, use the pair of "ren" modules: {{featLink ren_xml}} on the server and {{featLink ren_dom}} in browsers.
