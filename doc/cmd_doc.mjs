import * as io from '../io_deno.mjs'
import * as l from '../lang.mjs'
import * as s from '../str.mjs'
import * as cl from '../cli.mjs'
import * as co from '../coll.mjs'
import * as o from '../obj.mjs'
import * as i from '../iter.mjs'
import * as u from '../url.mjs'
import * as p from '../path.mjs'

const VER = (await io.readJson(`package.json`)).version
const CLI = cl.Flag.os()
const WATCH = CLI.boolOpt(`watch`)
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
  [`http`, `shortcuts for the native fetch/Request/Response APIs.`],
  [`path`, `various functions for working with FS paths.`],
  [`dom`, `shortcuts for working with the DOM.`],
  [`dom_reg`, `shortcuts for registering custom DOM elements.`],
  [`ren_dom`, `simple system for rendering DOM nodes in the browser. React-inspired syntax, JSX-compatible, better semantics and performance.`],
  [`ren_str`, `simple system for rendering XML/HTML on the server. React-inspired syntax, JSX-compatible, better semantics and performance.`],
  [`obs`, `observables via proxies.`],
  [`obs_dom`, `automatic reactivity for custom DOM elements.`],
  [`cli`, `essential tools for CLI apps.`],
  [`test`, `tools for testing and benchmarking.`],
]

class Pkg extends o.MemGet {
  constructor(feats) {
    super()
    this.feats = new co.Coll()
    for (const [name, desc] of feats) {
      this.feats.add(new Feat(this, name, desc))
    }
  }

  get base() {return `https://cdn.jsdelivr.net/npm/@mitranim/js`}
  get ver() {return VER}
  get url() {return s.inter(this.base, `@`, this.ver)}
  get readmeSrcPath() {return p.posix.join(DIR_DOC_SRC, `readme.md`)}
  get readmeSrcText() {return io.readText(this.readmeSrcPath).then(s.trim)}
  get readmeOutPath() {return `readme.md`}
  get readmeOutText() {return this.$readmeOutText()}
  get features() {return s.joinLinesOpt(i.map(this.feats, toHeadlineBullet))}

  async $readmeOutText() {return renderNamed(this.readmeSrcText, this, this.readmeSrcPath)}

  link(feat, ident, text) {return this.feat(feat).identDocLinkFull(ident, text)}

  featLink(name, text) {return this.feat(name).selfLink(text)}

  feat(name) {
    return (
      this.feats.get(name) ??
      l.panic(Error(`unable to find feat ${l.show(name)}`))
    )
  }

  featUrl(name) {return this.feat(name).selfUrl}
}

class Feat extends o.MemGet {
  constructor(pkg, name, desc) {
    super()
    this.pkg = l.reqInst(pkg, Pkg)
    this.name = l.reqStr(name)
    this.desc = l.reqStr(desc)
  }

  pk() {return this.name}

  get codePath() {return s.str(this.name, `.mjs`)}
  get docCodePath() {return u.urlJoin(`..`, this.codePath)}
  get codeHead() {return mdLink(this.codePath, this.docCodePath)}
  get codeText() {return io.readText(this.codePath)}
  get codeLines() {return this.$codeLines()}
  get testPath() {return p.posix.join(DIR_TEST, s.str(this.name, `_test.mjs`))}
  get docTestPath() {return u.urlJoin(`..`, this.testPath)}
  get testText() {return io.readText(this.testPath)}
  get testLines() {return this.$testLines()}
  get readmeName() {return s.str(this.name, `_readme.md`)}
  get readmeSrcPath() {return p.posix.join(DIR_DOC_SRC, this.readmeName)}
  get readmeSrcText() {return io.readText(this.readmeSrcPath).then(s.trim)}
  get readmeOutPath() {return p.posix.join(DIR_DOC_OUT, this.readmeName)}
  get readmeOutText() {return this.$readmeOutText()}
  get idents() {return this.$idents()}
  get identTestLines() {return this.$identTestLines()}
  get url() {return this.pkg.url}
  get selfUrl() {return p.posix.join(this.url, this.codePath)}
  get toc() {return this.$toc()}
  get tocDoc() {return this.$tocDoc()}
  get tocUndoc() {return this.$tocUndoc()}
  get api() {return this.$api()}
  get apiDoc() {return this.$apiDoc()}
  get apiUndoc() {return this.$apiUndoc()}
  get identGroups() {return this.$identGroups()}
  get identsWithDoc() {return this.$identsWithDoc()}
  get identsWithoutDoc() {return this.$identsWithoutDoc()}
  get docLink() {return mdLink(coded(this.name), this.readmeOutPath)}
  get docRelPath() {return this.readmeName}
  get docRelLink() {return mdLink(coded(this.name), this.docRelPath)}
  get headline() {return s.str(this.docLink, s.optPre(this.desc, `: `))}

  async $codeLines() {return s.lines(await this.codeText)}
  async $testLines() {return s.lines(await this.testText)}
  async $readmeOutText() {return renderNamed(this.readmeSrcText, this, this.readmeSrcPath)}

  async $idents() {
    const buf = new co.Coll()
    for (const [ind, text] of (await this.codeLines).entries()) {
      const mat = text.match(/^export\s+(?:async\s+)?(\w+)\s+(\w+)\b/)
      if (mat) buf.add(new Ident(this, ind, mat[1], mat[2]))
    }
    return buf
  }

  async $identGroups() {
    const idents = await this.idents
    const flags = new Map(await Promise.all(i.map(idents, identWithHasDoc)))
    return i.partition(idents, val => flags.get(val))
  }

  async $identsWithDoc() {return (await this.identGroups)[0]}
  async $identsWithoutDoc() {return (await this.identGroups)[1]}

  async $identTestLines() {
    const buf = new Map/*<str, nat>*/()
    for (const [ind, text] of (await this.testLines).entries()) {
      const mat = (
        text.match(/^t[.]test[(]function test_(\w+)[(]/) ||
        text.match(/^await t[.]test[(]async function test_(\w+)[(]/)
      )
      if (mat) buf.set(mat[1], ind)
    }
    return buf
  }

  async $toc() {
    return s.joinLinesOpt([(await this.tocDoc), (await this.tocUndoc)])
  }

  async $tocDoc() {
    return s.joinLines(i.map((await this.identsWithDoc), toDocLinkBullet))
  }

  async $tocUndoc() {
    const idents = await this.identsWithoutDoc
    if (!idents.length) return ``
    return s.str(INDENT, `* `, mdLink(`#Undocumented`, `#undocumented`))
  }

  async $api() {
    return s.joinLinesOpt([(await this.apiDoc), (await this.apiUndoc)])
  }

  async $apiDoc() {
    return s.joinLines(await Promise.all(i.map((await this.identsWithDoc), identDoc)))
  }

  async $apiUndoc() {
    const idents = await this.identsWithoutDoc
    if (!idents.length) return ``

    return s.san`### Undocumented

The following APIs are exported but undocumented. Check ${this.codeHead}.

${s.joinLines(i.map(idents, toUndocBullet))}
`
  }

  identAddr(name) {
    return s.inter(l.show(this.codePath), ` → `, l.show(l.reqStr(name)))
  }

  async ident(name) {
    return (
      (await this.idents).get(name) ??
      l.panic(Error(`unable to find ident ${this.identAddr(name)}`))
    )
  }

  async identDocLinkFull(name, text) {
    return (await this.ident(name)).pkgIdentLink(text)
  }

  link(feat, name, text) {
    if (feat === this.name) return this.identLink(name, text)
    return this.pkg.link(feat, name, text)
  }

  async identLink(name, text) {
    return (await this.ident(name)).featIdentLink(text)
  }

  featLink(name, text) {return this.pkg.featLink(name, text)}

  selfLink(text) {
    return text ? mdLink(text, this.docRelPath) : this.docRelLink
  }

  featUrl(name) {return this.pkg.featUrl(name)}
}

class Ident extends o.MemGet {
  constructor(feat, line, type, name) {
    super()
    this.feat = l.reqInst(feat, Feat)
    this.line = l.reqNat(line)
    this.type = l.reqStr(type)
    this.name = l.reqStr(name)
  }

  pk() {return this.name}

  get row() {return this.line + 1}
  get testRow() {return this.$testRow()}
  get testLine() {return this.$testLine()}
  get head() {return coded(this.type, ` `, this.name)}
  get codedName() {return coded(this.name)}
  get codeLink() {return s.str(this.feat.docCodePath, `#L`, this.row)}
  get testLink() {return this.$testLink()}
  get sourceHead() {return mdLink(`source`, this.codeLink)}
  get testHead() {return this.$testHead()}
  get url() {return this.feat.url}
  get doc() {return this.$doc()}
  get docName() {return s.str(toDocName(this.name), `.md`)}
  get docPath() {return p.posix.join(DIR_DOC_SRC, this.feat.name, this.docName)}
  get docHead() {return this.$docHead()}
  get docSrcText() {return io.readTextOpt(this.docPath).then(s.trim)}
  get docOutText() {return this.$docOutText()}
  get docLink() {return mdLinkInter(this.head)}
  get docShortLink() {return mdLink(s.str(`#`, this.codedName), mdHash(this.head))}
  get docLinks() {return this.$docLinks()}
  get hasDoc() {return this.$hasDoc()}
  get undocHead() {return mdLink(this.head, this.codeLink)}
  get docPkgLinkPath() {return s.str(this.feat.readmeName, mdHash(this.head))}
  get addr() {return this.feat.identAddr(this.name)}

  link(...val) {return this.feat.link(...val)}

  pkgIdentLink(text) {
    return (
      text
      ? mdLink(text, this.docPkgLinkPath)
      : mdLink(this.codedName, this.docPkgLinkPath)
    )
  }

  featIdentLink(text) {
    return (
      text
      ? mdLink(s.str(`#`, text), mdHash(this.head))
      : this.docShortLink
    )
  }

  featLink(name, text) {return this.feat.pkg.featLink(name, text)}

  async $testRow() {return l.reqNat(await this.testLine) + 1}
  async $testLink() {return s.str(this.feat.docTestPath, `#L`, (await this.testRow))}
  async $testHead() {return mdLink(`test/example`, await this.testLink)}

  async $testLine() {
    const {name} = this
    return (
      (await this.feat.identTestLines).get(name) ??
      // Documented features must be tested.
      l.panic(Error(`unable to find test for ${this.addr}`))
    )
  }

  async $docHead() {return s.str(`### `, this.head, `\n\n`, await this.docLinks)}
  async $hasDoc() {return !!(await this.docOutText)}

  async $docLinks() {
    return s.san`Links: ${this.sourceHead}; ${await this.testHead}.`
  }

  async $doc() {
    return withNewlines(await this.docHead, 2) + withNewline(await this.docOutText)
  }

  async $docOutText() {return renderNamed(this.docSrcText, this, this.docPath)}

  async reqDoc() {
    if (!(await this.hasDoc)) throw Error(s.san`missing doc for ${this.addr}`)
    return this.doc
  }

  featUrl(name) {return this.feat.featUrl(name)}
}

function toDocLinkBullet(val) {return s.str(INDENT, `* `, val.docLink)}
function toUndocBullet(val) {return s.str(INDENT, `* `, val.undocHead)}
function toHeadlineBullet(val) {return s.str(INDENT, `* `, val.headline)}
function identDoc(val) {return val.reqDoc()}
async function identWithHasDoc(val) {return [val, l.reqBool(await val.hasDoc)]}
function withNewline(val) {return withNewlines(val, 1)}
function withNewlines(val, len) {return s.trim(val) + newlines(len)}
function newlines(len) {return `\n`.repeat(len)}
function mdLink(text, link) {return s.str(`[`, text, `](`, link, `)`)}
function mdLinkInter(text) {return mdLink(s.str(`#`, text), mdHash(text))}
function mdHash(val) {return `#` + s.words(val.toLowerCase()).lowerKebab()}
function coded(...val) {return s.str('`', ...val, '`')}
function allow(path) {return RE_WATCH.test(path)}
function runTimed() {return cl.timed(run, `doc`)}
function runTimedOpt() {return runTimed().catch(console.error)}

function toDocName(val) {
  l.reqStr(val)
  return /^[A-Z]/.test(val) ? `_` + val : val
}

async function renderNamed(src, ctx, msg) {
  const pre = `unexpected rendering error in ${l.show(msg)}: `

  try {
    return await s.draftRenderAsync(await src, ctx)
  }
  catch (err) {
    l.reqInst(err, Error)
    err.message = pre + err.message

    // Seems to be unnecessary, but not sure.
    // May depend on whether you rethrow the error, which we do.
    // err.stack = pre + err.stack

    throw err
  }
}

async function main() {
  if (!WATCH) {
    await runTimed()
    return
  }

  await runTimedOpt()

  for await (const _ of io.filterWatch(io.watchCwd(), allow)) {
    cl.emptty()
    await runTimedOpt()
  }
}

async function run() {
  const pkg = new Pkg(FEATS)
  await Promise.all([runFeat(pkg), ...i.map(pkg.feats, runFeat)])
}

async function runFeat(val) {
  await io.writeText(val.readmeOutPath, await val.readmeOutText)
}

if (import.meta.main) await main()
