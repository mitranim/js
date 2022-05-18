## Overview

[ren_str.mjs](../ren_str.mjs) provides a very simple and performant system for rendering XML/HTML strings. Good for servers and static sites. The syntax is React-inspired and compatible with JSX, but the semantics are much simpler and performance much higher.

Partially isomorphic with [`ren_dom`](ren_dom_readme.md). Pairing these modules together, and using custom DOM elements for interactive behaviors, provides a good foundation for hybrid SSR/SPA. Read https://github.com/mitranim/prax for more.

Short overview of features:

  * Directly render to strings.
    * No intermediary state.
    * No VDOM.
  * Convenient syntax. Nice-to-use in plain JS.
    * No templates.
    * No string parsing.
    * No need for JSX.
    * No need for a build system.
  * Decent performance.
    * Much faster than React/Preact.
  * Tiny with no external dependencies.

## TOC

* [#Overview](#overview)
* [#Usage](#usage)
* [#API](#api)
  * [#Undocumented](#undocumented)

## Usage

HTML rendering:

```js
import {E, ren} from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.21/ren_str.mjs'

console.log(
  Html({title: `home`, body: Index()})
)
// <!doctype html><html lang="en"><head><link rel="stylesheet" href="/styles/main.css"><title>home</title></head><body><div class="some-class">Hello world!</div><script type="module" src="/scripts/browser.mjs"></script></body></html>

function Html({title, body}) {
  return ren.doc(
    E(`html`, {lang: `en`},
      E(`head`, {},
        E(`link`, {rel: `stylesheet`, href: `/styles/main.css`}),
        !title ? null : E(`title`, {}, title),
      ),
      E(`body`, {},
        body,
        E(`script`, {type: `module`, src: `/scripts/browser.mjs`}),
      ),
    )
  )
}

function Index() {
  return E(`div`, {class: `some-class`}, `Hello world!`)
}
```

Specialized syntax is available:

```js
import {A, ren} from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.21/ren_str.mjs'
const {e, en} = ren

console.log(
  Html({title: `home`, body: Index()})
)
// <!doctype html><html lang="en"><head><link rel="stylesheet" href="/styles/main.css"><title>home</title></head><body><div class="some-class">Hello world!</div><script type="module" src="/scripts/browser.mjs"></script></body></html>

function Html({title, body}) {
  return ren.doc(
    e.html(A.lang(`en`),
      en.head(
        e.link(A.rel(`stylesheet`).href(`/styles/main.css`)),
        !title ? null : en.title(title),
      ),
      en.body(
        body,
        e.script(A.type(`module`).src(`/scripts/browser.mjs`)),
      ),
    )
  )
}

function Index() {
  return e.div(A.cls(`some-class`), `Hello world!`)
}
```

## API

### Undocumented

The following APIs are exported but undocumented. Check [ren_str.mjs](../ren_str.mjs).

  * [`function E`](../ren_str.mjs#L5)
  * [`function S`](../ren_str.mjs#L6)
  * [`function X`](../ren_str.mjs#L7)
  * [`function F`](../ren_str.mjs#L8)
  * [`class RenStr`](../ren_str.mjs#L17)
  * [`class RenHtmlBase`](../ren_str.mjs#L74)
  * [`class RenStrSvg`](../ren_str.mjs#L142)
  * [`class RenStrHtml`](../ren_str.mjs#L146)
  * [`const ren`](../ren_str.mjs#L163)
  * [`function escapeAttr`](../ren_str.mjs#L188)
  * [`function escapeText`](../ren_str.mjs#L201)
  * [`function escapeChar`](../ren_str.mjs#L208)
