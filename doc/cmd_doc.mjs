import * as a from '../all.mjs'
import * as io from '../io_deno.mjs'
import * as cl from '../cli.mjs'
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
  [`dom_shim`, `lightweight and performant shim for DOM nodes and elements.`],
  [`dom_glob_shim`, `shimmed DOM globals, interchangeable with \`dom_glob_native\``],
  [`dom_glob_native`, `native DOM globals, interchangeable with \`dom_glob_shim\``],
  [`dom_reg`, `shortcuts for registering custom DOM elements.`],
  [`prax`, `simple system for rendering DOM elements. React-inspired syntax, better semantics and performance.`],
  [`obs`, `observables via proxies.`],
  [`obs_dom`, `automatic reactivity for custom DOM elements.`],
  [`cli`, `essential tools for CLI apps.`],
  [`test`, `tools for testing and benchmarking.`],
]

class Pkg extends a.Strict {
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
  get readmeSrcPath() {return p.posix.join(DIR_DOC_SRC, `readme.md`)}
  get readmeSrcText() {return io.readText(this.readmeSrcPath).then(a.trim)}
  get readmeOutPath() {return `readme.md`}
  get readmeOutText() {return this.$readmeOutText()}
  get features() {return a.joinLinesOpt(a.map(this.feats, toHeadlineBullet))}

  async $readmeOutText() {return renderNamed(this.readmeSrcText, this, this.readmeSrcPath)}

  link(feat, ident, text) {return this.feat(feat).identDocLinkFull(ident, text)}

  featLink(name, text) {return this.feat(name).selfLink(text)}

  feat(name) {
    return (
      this.feats.get(name) ??
      a.panic(Error(`unable to find feat ${a.show(name)}`))
    )
  }

  featUrl(name) {return this.feat(name).selfUrl}
}

class Feat extends a.Strict {
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
  get codeText() {return io.readText(this.codePath)}
  get codeLines() {return this.$codeLines()}
  get testPath() {return p.posix.join(DIR_TEST, a.str(this.name, `_test.mjs`))}
  get docTestPath() {return a.urlJoin(`..`, this.testPath)}
  get testText() {return io.readText(this.testPath)}
  get testLines() {return this.$testLines()}
  get readmeName() {return a.str(this.name, `_readme.md`)}
  get readmeSrcPath() {return p.posix.join(DIR_DOC_SRC, this.readmeName)}
  get readmeSrcText() {return io.readText(this.readmeSrcPath).then(a.trim)}
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
  get headline() {return a.str(this.docLink, a.optPre(this.desc, `: `))}

  async $codeLines() {return a.lines(await this.codeText)}
  async $testLines() {return a.lines(await this.testText)}
  async $readmeOutText() {return renderNamed(this.readmeSrcText, this, this.readmeSrcPath)}

  async $idents() {
    const buf = new a.Coll()
    for (const [ind, text] of (await this.codeLines).entries()) {
      const mat = text.match(/^export\s+(?:async\s+)?(\w+)\s+(\w+)\b/)
      if (mat) buf.add(new Ident(this, ind, mat[1], mat[2]))
    }
    return buf
  }

  async $identGroups() {
    const idents = await this.idents
    const flags = new Map(await Promise.all(a.map(idents, identWithHasDoc)))
    return a.partition(idents, val => flags.get(val))
  }

  async $identsWithDoc() {return (await this.identGroups)[0]}
  async $identsWithoutDoc() {return (await this.identGroups)[1]}

  async $identTestLines() {
    const buf = new StrNatMap()
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
    return a.joinLinesOpt([(await this.tocDoc), (await this.tocUndoc)])
  }

  async $tocDoc() {
    return a.joinLines(a.map((await this.identsWithDoc), toDocLinkBullet))
  }

  async $tocUndoc() {
    const idents = await this.identsWithoutDoc
    if (!idents.length) return ``
    return a.str(INDENT, `* `, mdLink(`#Undocumented`, `#undocumented`))
  }

  async $api() {
    return a.joinLinesOpt([(await this.apiDoc), (await this.apiUndoc)])
  }

  async $apiDoc() {
    return a.joinLines(await Promise.all(a.map((await this.identsWithDoc), identDoc)))
  }

  async $apiUndoc() {
    const idents = await this.identsWithoutDoc
    if (!idents.length) return ``

    return a.san`### Undocumented

The following APIs are exported but undocumented. Check ${this.codeHead}.

${a.joinLines(a.map(idents, toUndocBullet))}
`
  }

  identAddr(name) {
    return a.inter(a.show(this.codePath), ` → `, a.show(a.reqStr(name)))
  }

  async ident(name) {
    return (
      (await this.idents).get(name) ??
      a.panic(Error(`unable to find ident ${this.identAddr(name)}`))
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

class Ident extends a.Strict {
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
  get testRow() {return this.$testRow()}
  get testLine() {return this.$testLine()}
  get head() {return coded(this.type, ` `, this.name)}
  get codedName() {return coded(this.name)}
  get codeLink() {return a.str(this.feat.docCodePath, `#L`, this.row)}
  get testLink() {return this.$testLink()}
  get sourceHead() {return mdLink(`source`, this.codeLink)}
  get testHead() {return this.$testHead()}
  get url() {return this.feat.url}
  get doc() {return this.$doc()}
  get docName() {return a.str(toDocName(this.name), `.md`)}
  get docPath() {return p.posix.join(DIR_DOC_SRC, this.feat.name, this.docName)}
  get docHead() {return this.$docHead()}
  get docSrcText() {return io.readTextOpt(this.docPath).then(a.trim)}
  get docOutText() {return this.$docOutText()}
  get docLink() {return mdLinkInter(this.head)}
  get docShortLink() {return mdLink(a.str(`#`, this.codedName), mdHash(this.head))}
  get docLinks() {return this.$docLinks()}
  get hasDoc() {return this.$hasDoc()}
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

  featIdentLink(text) {
    return (
      text
      ? mdLink(a.str(`#`, text), mdHash(this.head))
      : this.docShortLink
    )
  }

  featLink(name, text) {return this.feat.pkg.featLink(name, text)}

  async $testRow() {return a.reqNat(await this.testLine) + 1}
  async $testLink() {return a.str(this.feat.docTestPath, `#L`, (await this.testRow))}
  async $testHead() {return mdLink(`test/example`, await this.testLink)}

  async $testLine() {
    const {name} = this
    return (
      (await this.feat.identTestLines).get(name) ??
      // Documented features must be tested.
      a.panic(Error(`unable to find test for ${this.addr}`))
    )
  }

  async $docHead() {return a.str(`### `, this.head, `\n\n`, await this.docLinks)}
  async $hasDoc() {return !!(await this.docOutText)}

  async $docLinks() {
    return a.san`Links: ${this.sourceHead}; ${await this.testHead}.`
  }

  async $doc() {
    return withNewlines(await this.docHead, 2) + withNewline(await this.docOutText)
  }

  async $docOutText() {return renderNamed(this.docSrcText, this, this.docPath)}

  async reqDoc() {
    if (!(await this.hasDoc)) throw Error(a.san`missing doc for ${this.addr}`)
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
function identDoc(val) {return val.reqDoc()}
async function identWithHasDoc(val) {return [val, a.reqBool(await val.hasDoc)]}
function withNewline(val) {return withNewlines(val, 1)}
function withNewlines(val, len) {return a.trim(val) + newlines(len)}
function newlines(len) {return `\n`.repeat(len)}
function mdLink(text, link) {return a.str(`[`, text, `](`, link, `)`)}
function mdLinkInter(text) {return mdLink(a.str(`#`, text), mdHash(text))}
function mdHash(val) {return `#` + a.words(val.toLowerCase()).lowerKebab()}
function coded(...val) {return a.str('`', ...val, '`')}
function allow(path) {return RE_WATCH.test(path)}
function runTimed() {return cl.timed(run, `doc`)}
function runTimedOpt() {return runTimed().catch(console.error)}

function toDocName(val) {
  a.reqStr(val)
  return /^[A-Z]/.test(val) ? `_` + val : val
}

async function renderNamed(src, ctx, msg) {
  try {
    return await a.draftRenderAsync(await src, ctx)
  }
  catch (err) {
    throw Error(`unexpected rendering error in ${a.show(msg)}`, {cause: err})
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
  await Promise.all([runFeat(pkg), ...a.map(pkg.feats, runFeat)])
}

async function runFeat(val) {
  await io.writeText(val.readmeOutPath, await val.readmeOutText)
}

if (import.meta.main) await main()
