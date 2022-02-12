import '../cli_emptty.mjs'
import * as fs from '../fs_deno_async.mjs'
import * as l from '../lang.mjs'
import * as s from '../str.mjs'
import * as cl from '../cli.mjs'
import * as co from '../coll.mjs'
import * as o from '../obj.mjs'
import * as i from '../iter.mjs'

const VER = `0.1.0`
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
  [`dom`, `shortcuts for working with the DOM.`],
  [`dom_reg`, `shortcuts for registering custom DOM elements.`],
  [`cli`, `essential tools for CLI apps.`],
  [`test`, `tools for testing and benchmarking.`],
]

class Pkg extends o.MemGet {
  constructor(feats) {
    super()
    this.feats = new co.Coll()
    for (const [name, desc] of feats) {
      this.feats.push(new Feat(this, name, desc))
    }
  }

  get base() {return `https://cdn.jsdelivr.net/gh/mitranim/js`}
  get ver() {return VER}
  get url() {return s.str(this.base, `@`, this.ver)}
  get readmeSrcPath() {return fs.join(DIR_DOC_SRC, `readme.md`)}
  get readmeSrcText() {return fs.readText(this.readmeSrcPath).then(s.trim)}
  get readmeOutPath() {return `readme.md`}
  get readmeOutText() {return this.$readmeOutText()}
  get features() {return s.joinLinesOpt(i.map(this.feats, toHeadlineBullet))}

  async $readmeOutText() {return s.draftRenderAsync((await this.readmeSrcText), this)}

  link(feat, ident, text) {return this.feat(feat).identDocLinkFull(ident, text)}

  feat(name) {
    return (
      this.feats.get(name) ??
      l.panic(Error(`unable to find feat ${l.show(name)}`))
    )
  }
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
  get docCodePath() {return pathJoin(`..`, this.codePath)}
  get codeHead() {return mdLink(this.codePath, this.docCodePath)}
  get codeText() {return fs.readText(this.codePath)}
  get codeLines() {return this.$codeLines()}
  get testPath() {return fs.join(DIR_TEST, s.str(this.name, `_test.mjs`))}
  get docTestPath() {return pathJoin(`..`, this.testPath)}
  get testText() {return fs.readText(this.testPath)}
  get testLines() {return this.$testLines()}
  get readmeName() {return s.str(this.name, `_readme.md`)}
  get readmeSrcPath() {return fs.join(DIR_DOC_SRC, this.readmeName)}
  get readmeSrcText() {return fs.readText(this.readmeSrcPath).then(s.trim)}
  get readmeOutPath() {return fs.join(DIR_DOC_OUT, this.readmeName)}
  get readmeOutText() {return this.$readmeOutText()}
  get idents() {return this.$idents()}
  get identTestLines() {return this.$identTestLines()}
  get url() {return this.pkg.url}
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
  get headline() {return s.str(this.docLink, s.optPre(this.desc, `: `))}

  async $codeLines() {return s.lines(await this.codeText)}
  async $testLines() {return s.lines(await this.testText)}
  async $readmeOutText() {return s.draftRenderAsync((await this.readmeSrcText), this)}

  async $idents() {
    const buf = new co.Coll()
    for (const [ind, text] of (await this.codeLines).entries()) {
      const mat = text.match(/^export\s+(?:async\s+)?(\w+)\s+(\w+)\b/)
      if (mat) buf.push(new Ident(this, ind, mat[1], mat[2]))
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
      const mat = text.match(/^t[.]test[(]function test_(\w+)[(]/)
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

  async ident(name) {
    return (
      (await this.idents).get(name) ??
      l.panic(Error(`unable to find ident ${l.show(this.name)}.${l.show(name)}`))
    )
  }

  async identDocLinkFull(name, text) {
    return (await this.ident(name)).docPkgLink(text)
  }

  async link(name, text) {
    return (await this.ident(name)).docFeatLink(text)
  }
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
  get doc() {return this.$doc()}
  get docName() {return s.str(toDocName(this.name), `.md`)}
  get docPath() {return fs.join(DIR_DOC_SRC, this.feat.name, this.docName)}
  get docHead() {return this.$docHead()}
  get docSrcText() {return fs.readTextOpt(this.docPath).then(s.trim)}
  get docOutText() {return this.$docOutText()}
  get docLink() {return mdLinkInter(this.head)}
  get docShortLink() {return mdLink(s.str(`#`, this.codedName), mdHash(this.head))}
  get docLinks() {return this.$docLinks()}
  get hasDoc() {return this.$hasDoc()}
  get undocHead() {return mdLink(this.head, this.codeLink)}
  get docPkgLinkPath() {return s.str(this.feat.readmeName, mdHash(this.head))}

  link(feat, name, text) {
    if (feat === this.feat.name) return this.feat.link(name, text)
    return this.feat.pkg.link(feat, name, text)
  }

  docPkgLink(text) {
    return (
      text
      ? mdLink(text, this.docPkgLinkPath)
      : mdLink(this.codedName, this.docPkgLinkPath)
    )
  }

  docFeatLink(text) {
    return (
      text
      ? mdLink(s.str(`#`, text), mdHash(this.head))
      : this.docShortLink
    )
  }

  async $testRow() {return l.reqNat(await this.testLine) + 1}
  async $testLink() {return s.str(this.feat.docTestPath, `#L`, (await this.testRow))}
  async $testHead() {return mdLink(`test/example`, await this.testLink)}

  async $testLine() {
    const {name} = this
    return (
      (await this.feat.identTestLines).get(name) ??
      // Documented features must be tested.
      l.panic(Error(`unable to find test for ${l.show(name)}`))
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

  async $docOutText() {return s.draftRenderAsync((await this.docSrcText), this)}

  async reqDoc() {
    if (!(await this.hasDoc)) {
      throw Error(s.san`missing doc for ${l.show(this.feat.codePath)}.${l.show(this.name)}`)
    }
    return this.doc
  }
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
function allow(path) {return RE_WATCH.test(fs.maybeRel(path))}
function runTimed() {return cl.timed(run, `doc`)}
function runTimedOpt() {return runTimed().catch(console.error)}

// Not exported because this is a hazard if misused for URLs.
function pathJoin(...vals) {return vals.reduce(pathAdd)}
function pathAdd(one, two) {return s.inter(one, `/`, two)}

function toDocName(val) {
  l.reqStr(val)
  return /^[A-Z]/.test(val) ? `_` + val : val
}

async function main() {
  if (!WATCH) {
    await runTimed()
    return
  }

  await runTimedOpt()

  for await (const _ of fs.watch(allow)) {
    cl.emptty()
    await runTimedOpt()
  }
}

async function run() {
  const pkg = new Pkg(FEATS)
  await Promise.all([runFeat(pkg), ...i.map(pkg.feats, runFeat)])
}

async function runFeat(val) {
  await fs.writeText(val.readmeOutPath, await val.readmeOutText)
}

if (import.meta.main) await main()
