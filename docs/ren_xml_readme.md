## Overview

[ren_xml.mjs](../ren_xml.mjs) provides a very simple and performant system for rendering XML/HTML strings. Good for servers and static sites. The syntax is React-inspired and compatible with JSX, but the semantics are much simpler and performance much higher.

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
import {E, ren} from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.24/ren_xml.mjs'

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
import {A, ren} from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.24/ren_xml.mjs'
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

The following APIs are exported but undocumented. Check [ren_xml.mjs](../ren_xml.mjs).

  * [`function E`](../ren_xml.mjs#L6)
  * [`function S`](../ren_xml.mjs#L7)
  * [`function X`](../ren_xml.mjs#L8)
  * [`function F`](../ren_xml.mjs#L9)
  * [`class RenXml`](../ren_xml.mjs#L19)
  * [`class RenHtmlBase`](../ren_xml.mjs#L81)
  * [`class RenXmlSvg`](../ren_xml.mjs#L149)
  * [`class RenXmlHtml`](../ren_xml.mjs#L162)
  * [`const ren`](../ren_xml.mjs#L174)
  * [`const elems`](../ren_xml.mjs#L176)
  * [`class Node`](../ren_xml.mjs#L198)
  * [`class Text`](../ren_xml.mjs#L211)
  * [`class Comment`](../ren_xml.mjs#L216)
  * [`class Element`](../ren_xml.mjs#L221)
  * [`class HTMLElement`](../ren_xml.mjs#L257)
  * [`class SVGElement`](../ren_xml.mjs#L261)
  * [`function escapeAttr`](../ren_xml.mjs#L279)
  * [`function escapeText`](../ren_xml.mjs#L292)
  * [`function escapeChar`](../ren_xml.mjs#L299)
  * [`const propsKey`](../ren_xml.mjs#L308)
  * [`const parentNodeKey`](../ren_xml.mjs#L309)
  * [`const childNodesKey`](../ren_xml.mjs#L310)
  * [`const textContentKey`](../ren_xml.mjs#L311)
