import * as a from '../all.mjs'
import * as cl from '../cli.mjs'
import * as pt from '../path.mjs'
import * as u from './cmd_doc_util.mjs'
import * as io from '#io'
import pkg from '../package.json' with {type: 'json'}

const VER = pkg.version
const CLI = cl.Flag.os()
const WATCH = CLI.boolOpt(`--watch`)
const CLEAR = CLI.boolOpt(`--clear`)
const RE_WATCH = /(?:^doc[/](?:\w+[/])*)\w+[.]md|(?:\w+[.]mjs$)/
const DIR_DOC_SRC = `doc`
const DIR_DOC_OUT = `docs`
const DIR_TEST = `test`
const INDENT = `  `

const FEATS = [
  [`lang`, `type assertions and other essentials needed by all other code.`],
  [`iter`, `tools for iteration and functional programming.`],
  [`obj`, `tools for manipulating JS objects and plain dicts.`],
  [`str`, `tools for manipulating strings.`],
  [`coll`, `extended versions of JS data structure classes, with better APIs.`],
  [`url`, `better URL implementation.`],
  [`time`, `tools for datetimes and intervals.`],
  [`path`, `various functions for working with FS paths.`],
  [`dom`, `shortcuts for working with the DOM.`],
  [`dom_shim`, `lightweight and performant shim for DOM nodes and elements.`],
  [`dom_global_shim`, `shimmed DOM globals, interchangeable with \`dom_global_native\``],
  [`dom_global_native`, `native DOM globals, interchangeable with \`dom_global_shim\``],
  [`dom_reg`, `shortcuts for registering custom DOM elements.`],
  [`prax`, `simple system for rendering DOM elements. React-inspired syntax, better semantics and performance.`],
  [`obs`, `observables and reactivity.`],
  [`http`, `shortcuts for the fetch/Response APIs, URL routing, cookie decoding/encoding.`],
  [`http_bun`, `tools for HTTP servers running in Bun.`],
  [`http_deno`, `tools for HTTP servers running in Deno.`],
  [`http_srv`, `streaming and broadcasting tools for generic HTTP servers.`],
  [`http_live`, `tools for live-reloading in development.`],
  [`cli`, `essential tools for CLI apps.`],
  [`test`, `tools for testing and benchmarking.`],

  // TODO: this needs documentation.
  // [`io_bun`, ``],
  // [`io_deno`, ``],
]

class Pkg extends u.Strict {
  constructor(feats) {
    super()
    this.feats = new a.Coll()
    for (const [name, desc] of feats) {
      this.feats.add(new Feat(this, name, desc))
    }
  }

  static {a.memGet(this)}
  get base() {return `https://cdn.jsdelivr.net/npm/@mitranim/js`}
  get ver() {return VER}
  get url() {return a.inter(this.base, `@`, this.ver)}
  get readmeSrcPath() {return pt.join(DIR_DOC_SRC, `readme.md`)}
  get readmeSrcText() {return io.readFileTextSync(this.readmeSrcPath).then(a.trim)}
  get readmeOutPath() {return `readme.md`}
  get readmeOutText() {return renderNamed(this.readmeSrcText, this, this.readmeSrcPath)}
  get features() {return a.joinLinesOpt(a.map(this.feats, toHeadlineBullet))}

  link(feat, ident, ...text) {return this.feat(feat).identDocLinkFull(ident, ...text)}

  featLink(name, ...text) {return this.feat(name).selfLink(...text)}

  feat(name) {
    return (
      this.feats.get(name) ??
      a.panic(Error(`unable to find feat ${a.show(name)}`))
    )
  }

  featUrl(name) {return this.feat(name).selfUrl}
}

class Feat extends u.Strict {
  constructor(pkg, name, desc) {
    super()
    this.pkg = a.reqInst(pkg, Pkg)
    this.name = a.reqStr(name)
    this.desc = a.reqStr(desc)
  }

  pk() {return this.name}

  static {a.memGet(this)}
  get codePath() {return a.str(this.name, `.mjs`)}
  get docCodePath() {return a.urlJoin(`..`, this.codePath)}
  get codeHead() {return mdLink(this.codePath, this.docCodePath)}
  get codeText() {return io.readFileTextSync(this.codePath)}
  get codeLines() {return a.lines(this.codeText)}
  get testPath() {return pt.join(DIR_TEST, a.str(this.name, `_test.mjs`))}
  get docTestPath() {return a.urlJoin(`..`, this.testPath)}
  get testText() {return io.readFileTextSync(this.testPath)}
  get testLines() {return a.lines(this.testText)}
  get readmeName() {return a.str(this.name, `_readme.md`)}
  get readmeSrcPath() {return pt.join(DIR_DOC_SRC, this.readmeName)}
  get readmeSrcText() {return a.trim(io.readFileTextSync(this.readmeSrcPath))}
  get readmeOutPath() {return pt.join(DIR_DOC_OUT, this.readmeName)}
  get readmeOutText() {return renderNamed(this.readmeSrcText, this, this.readmeSrcPath)}
  get url() {return this.pkg.url}
  get selfUrl() {return pt.join(this.url, this.codePath)}
  get toc() {return a.joinLinesOpt([this.tocDoc, this.tocUndoc])}
  get tocDoc() {return a.joinLines(a.map(this.identsWithDoc, toDocLinkBullet))}
  get api() {return a.joinLinesOpt([this.apiDoc, this.apiUndoc])}
  get apiDoc() {return a.joinLines(a.map(this.identsWithDoc, identDoc))}
  get identsWithDoc() {return this.identGroups[0]}
  get identsWithoutDoc() {return this.identGroups[1]}
  get docLink() {return mdLink(coded(this.name), this.readmeOutPath)}
  get docRelPath() {return this.readmeName}
  get docRelLink() {return mdLink(coded(this.name), this.docRelPath)}
  get headline() {return a.str(this.docLink, a.optPre(this.desc, `: `))}

  get idents() {
    const buf = new a.Coll()
    for (const [ind, text] of this.codeLines.entries()) {
      const mat = text.match(/^export\s+(?:async\s+)?(\w+)\s+(\w+)\b/)
      if (mat) buf.add(new Ident(this, ind, mat[1], mat[2]))
    }
    return buf
  }

  get identGroups() {
    const idents = this.idents
    const flags = new Map(a.map(idents, identWithHasDoc))
    return a.partition(idents, val => flags.get(val))
  }

  get identTestLines() {
    const buf = new StrNatMap()
    for (const [ind, text] of this.testLines.entries()) {
      const mat = (
        text.match(/^t[.]test[(]function test_(\w+)[(]/) ||
        text.match(/^await t[.]test[(]async function test_(\w+)[(]/)
      )
      if (mat) buf.set(mat[1], ind)
    }
    return buf
  }

  get tocUndoc() {
    const idents = this.identsWithoutDoc
    if (!idents.length) return ``
    return a.str(INDENT, `* `, mdLink(`#Undocumented`, `#undocumented`))
  }

  get apiUndoc() {
    const idents = this.identsWithoutDoc
    if (!idents.length) return ``

    return a.san`### Undocumented

The following APIs are exported but undocumented. Check ${this.codeHead}.

${a.joinLines(a.map(idents, toUndocBullet))}
`
  }

  identAddr(name) {
    return a.inter(a.show(this.codePath), ` → `, a.show(a.reqStr(name)))
  }

  ident(name) {
    return (
      this.idents.get(name) ??
      a.panic(Error(`unable to find ident ${this.identAddr(name)}`))
    )
  }

  identDocLinkFull(name, ...text) {
    text = a.spaced(...text)
    return this.ident(name).pkgIdentLink(...text)
  }

  link(feat, name, ...text) {
    if (feat === this.name) return this.identLink(name, ...text)
    return this.pkg.link(feat, name, ...text)
  }

  identLink(name, ...text) {return this.ident(name).featIdentLink(...text)}
  featLink(name, ...text) {return this.pkg.featLink(name, ...text)}
  featUrl(name) {return this.pkg.featUrl(name)}

  selfLink(...text) {
    text = a.spaced(...text)
    return text ? mdLink(text, this.docRelPath) : this.docRelLink
  }
}

class Ident extends u.Strict {
  constructor(feat, line, type, name) {
    super()
    this.feat = a.reqInst(feat, Feat)
    this.line = a.reqNat(line)
    this.type = a.reqStr(type)
    this.name = a.reqStr(name)
  }

  pk() {return this.name}

  static {a.memGet(this)}
  get row() {return this.line + 1}
  get testRow() {return a.reqNat(this.testLine) + 1}
  get head() {return coded(this.type, ` `, this.name)}
  get codedName() {return coded(this.name)}
  get codeLink() {return a.str(this.feat.docCodePath, `#L`, this.row)}
  get testLink() {return a.str(this.feat.docTestPath, `#L`, this.testRow)}
  get sourceHead() {return mdLink(`source`, this.codeLink)}
  get testHead() {return mdLink(`test/example`, this.testLink)}
  get url() {return this.feat.url}
  get doc() {return withNewlines(this.docHead, 2) + withNewline(this.docOutText)}
  get docHead() {return a.str(`### `, this.head, `\n\n`, this.docLinks)}
  get docName() {return a.str(toDocName(this.name), `.md`)}
  get docPath() {return pt.join(DIR_DOC_SRC, this.feat.name, this.docName)}
  get docLinks() {return a.san`Links: ${this.sourceHead}; ${this.testHead}.`}
  get docOutText() {return renderNamed(this.docSrcText, this, this.docPath)}
  get docSrcText() {return a.trim(io.readFileTextOptSync(this.docPath))}
  get docLink() {return mdLinkInter(this.head)}
  get docShortLink() {return mdLink(a.str(`#`, this.codedName), mdHash(this.head))}
  get hasDoc() {return !!this.docOutText}
  get undocHead() {return mdLink(this.head, this.codeLink)}
  get docPkgLinkPath() {return a.str(this.feat.readmeName, mdHash(this.head))}
  get addr() {return this.feat.identAddr(this.name)}

  link(...val) {return this.feat.link(...val)}

  pkgIdentLink(text) {
    return (
      text
      ? mdLink(text, this.docPkgLinkPath)
      : mdLink(this.codedName, this.docPkgLinkPath)
    )
  }

  featIdentLink(...text) {
    text = a.spaced(...text)
    return (
      text
      ? mdLink(a.str(`#`, text), mdHash(this.head))
      : this.docShortLink
    )
  }

  featLink(name, ...text) {return this.feat.pkg.featLink(name, ...text)}

  get testLine() {
    const {name} = this
    return (
      this.feat.identTestLines.get(name) ??
      // Documented features must be tested.
      a.panic(Error(`unable to find test for ${this.addr}`))
    )
  }

  get reqDoc() {
    if (!this.hasDoc) throw Error(a.san`missing doc for ${this.addr}`)
    return this.doc
  }

  featUrl(name) {return this.feat.featUrl(name)}
}

class StrNatMap extends a.TypedMap {
  reqKey(key) {return a.reqStr(key)}
  reqVal(val) {return a.reqNat(val)}
}

function toDocLinkBullet(val) {return a.str(INDENT, `* `, val.docLink)}
function toUndocBullet(val) {return a.str(INDENT, `* `, val.undocHead)}
function toHeadlineBullet(val) {return a.str(INDENT, `* `, val.headline)}
function identDoc(val) {return val.reqDoc}
function identWithHasDoc(val) {return [val, a.reqBool(val.hasDoc)]}
function withNewline(val) {return withNewlines(val, 1)}
function withNewlines(val, len) {return a.trim(val) + newlines(len)}
function newlines(len) {return `\n`.repeat(len)}
function mdLink(text, link) {return a.str(`[`, text, `](`, link, `)`)}
function mdLinkInter(text) {return mdLink(a.str(`#`, text), mdHash(text))}
function mdHash(val) {return `#` + a.words(val.toLowerCase()).lowerKebab()}
function coded(...val) {return a.str('`', ...val, '`')}
function runTimed() {return cl.timed(`doc`, run)}

function toDocName(val) {
  a.reqStr(val)
  return /^[A-Z]/.test(val) ? `_` + val : val
}

function renderNamed(src, ctx, msg) {
  try {return a.draftRender(src, ctx)}
  catch (err) {
    throw a.errWrap(err, Error, `unexpected rendering error in ${a.show(msg)}`)
  }
}

async function main() {
  if (!WATCH) {
    runTimed()
    return
  }

  try {runTimed()} catch (err) {console.error(err)}

  for await (const {path} of io.watchCwd()) {
    if (!RE_WATCH.test(path)) continue
    if (CLEAR) cl.emptty()
    try {runTimed()} catch (err) {console.error(err)}
  }
}

function run() {
  const pkg = new Pkg(FEATS)
  for (const feat of pkg.feats) runFeat(feat)
}

function runFeat(val) {io.writeFileSync(val.readmeOutPath, val.readmeOutText)}

if (import.meta.main) await main()
