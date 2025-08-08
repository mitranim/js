import './internal_test_init.mjs'
import * as t from '../test.mjs'
import * as l from '../lang.mjs'
import * as s from '../str.mjs'

/* Global */

const {freeze} = Object

const LONG_NARROW = `one two three four five six seven eight nine ten`
const LONG_UNI = `🙂😁😛🙂😁😛🙂😁😛🙂😁😛🙂😁😛🙂😁😛🙂😁😛`
const LONG_BLANK = `                                             `
const ELL_NARROW = `one two`
const ELL_UNI = `🐒🐴🦖🦔🐲🐈`

const LONG_NARROW_LOWER = LONG_NARROW.toLowerCase()
const LONG_NARROW_TITLE = s.title(LONG_NARROW)

const MULTI = `
one
two
three
  four
  five
  six
  seven
eight
nine
ten
`

const multi = freeze(s.lines(s.trimLines(MULTI)))

const DRAFT = `one {{two}} three {{four}} five`

const draft = freeze(s.draftParse(DRAFT))

const draftCtx = freeze(new class {
  get two() {return `10`}
  four() {return `20`}
}())

/*
More limited than the version we actually export.
Performance should be fairly similar. If not, that's a bug.
*/
function draftRenderSimple(src, ctx) {
  l.reqComp(ctx)
  return l.laxStr(src).replace(s.RE_EMBED, function replace(_, key) {
    const val = l.reqGet(ctx, key)
    return l.renderLax(l.isFun(val) ? val.call(ctx) : val)
  })
}

function isBlankRegex(val) {return /^\s*$/.test(l.reqStr(val))}
function isBlankTrim(val) {return !l.reqStr(val).trim()}

function joinDumb(val, sep) {
  l.reqStr(sep)
  if (l.isNil(val)) return ``
  return l.reqArr(val).map(l.render).join(sep)
}

function joinLinesDumb(val) {return joinDumb(val, `\n`)}

function joinOptDumb(val, sep) {
  l.reqStr(sep)
  if (l.isNil(val)) return ``
  return l.reqArr(val).map(l.render).filter(l.id).join(sep)
}

function joinLinesOptDumb(val) {return joinOptDumb(val, `\n`)}

function spacedDumb(...val) {
  return val.map(l.renderLax).filter(l.id).join(` `)
}

function strStrictJoin(...src) {
  for (const val of src) l.reqStr(val)
  return src.join(``)
}

function strStrictPlus(...src) {
  let out = ``
  for (src of src) out += l.reqStr(src)
  return out
}

/*
Measurably faster than our exported version, but not available in dominant
Safari versions at the time of this writing.
*/
function uuidCryptoShort() {return crypto.randomUUID().replace(/-/g, ``)}

const uuidArr = s.uuidByteArr()

const strForwardSlash = Array(128).fill(`str`).join(`/`)
const strBackwardSlash = Array(128).fill(`str`).join(`\\`)

/* Bench */

t.bench(function bench_iter_chars() {for (const val of LONG_NARROW) l.nop(val)})

t.bench(function bench_isBlank_regex_miss() {l.nop(isBlankRegex(LONG_NARROW))})
t.bench(function bench_isBlank_regex_hit() {l.nop(isBlankRegex(LONG_BLANK))})

t.bench(function bench_isBlank_trim_miss() {l.nop(isBlankTrim(LONG_NARROW))})
t.bench(function bench_isBlank_trim_hit() {l.nop(isBlankTrim(LONG_BLANK))})

t.bench(function bench_isBlank_miss() {l.nop(s.isBlank(LONG_NARROW))})
t.bench(function bench_isBlank_hit() {l.nop(s.isBlank(LONG_BLANK))})

t.bench(function bench_isAscii_miss() {l.nop(s.isAscii(LONG_UNI))})
t.bench(function bench_isAscii_hit() {l.nop(s.isAscii(LONG_NARROW))})

t.bench(function bench_isNarrow_miss() {l.nop(s.isNarrow(LONG_UNI))})
t.bench(function bench_isNarrow_hit() {l.nop(s.isNarrow(LONG_NARROW))})

t.bench(function bench_isUni_miss() {l.nop(s.isUni(LONG_NARROW))})
t.bench(function bench_isUni_hit() {l.nop(s.isUni(LONG_UNI))})

t.bench(function bench_lenStr() {l.nop(s.lenStr(LONG_NARROW))})
t.bench(function bench_lenUni_narrow_with_arr() {l.nop([...LONG_NARROW].length)})
t.bench(function bench_lenUni_narrow_current() {l.nop(s.lenUni(LONG_NARROW))})
t.bench(function bench_lenUni_uni_with_arr() {l.nop([...LONG_UNI].length)})
t.bench(function bench_lenUni_uni_current() {l.nop(s.lenUni(LONG_UNI))})

t.bench(function bench_ell_narrow_miss() {s.ell(ELL_NARROW, 128)})
t.bench(function bench_ell_narrow_hit() {s.ell(ELL_NARROW, 4)})

t.bench(function bench_ell_uni_miss() {s.ell(ELL_UNI, 128)})
t.bench(function bench_ell_uni_hit() {s.ell(ELL_UNI, 4)})

t.bench(function bench_words() {l.nop(s.words(LONG_NARROW))})

t.bench(function bench_words_split_join_inline() {l.nop(LONG_NARROW.match(s.RE_WORD).join(` `))})
t.bench(function bench_words_split_join_current() {l.nop(s.words(LONG_NARROW).str())})

t.bench(function bench_words_split_change_join_inline() {l.nop(LONG_NARROW.match(s.RE_WORD).map(s.upper).join(` `))})
t.bench(function bench_words_split_change_join_current() {l.nop(s.words(LONG_NARROW).upperSpaced())})

t.bench(function bench_title_narrow_miss() {l.nop(s.title(LONG_NARROW_TITLE))})
t.bench(function bench_title_narrow_hit() {l.nop(s.title(LONG_NARROW_LOWER))})
t.bench(function bench_title_uni_miss() {l.nop(s.title(LONG_UNI))})

t.bench(function bench_lines() {l.nop(s.lines(MULTI))})
t.bench(function bench_trimLines() {l.nop(s.trimLines(MULTI))})

t.bench(function bench_join_lines_dumb() {l.nop(joinLinesDumb(multi))})
t.bench(function bench_join_lines_current() {l.nop(s.joinLines(multi))})

t.bench(function bench_join_lines_opt_dumb() {l.nop(joinLinesOptDumb(multi))})
t.bench(function bench_join_lines_opt_current() {l.nop(s.joinLinesOpt(multi))})

t.bench(function bench_join_spaced_dumb() {l.nop(spacedDumb(...multi))})
t.bench(function bench_join_spaced_current() {l.nop(s.spaced(...multi))})

// `Math.random` is unsuitable for cryptography but very fast. It makes a decent
// baseline benchmark for other "random" functions.
t.bench(function bench_rnd_Math_random() {l.nop(Math.random())})
t.bench(function bench_rnd_uuidArr() {l.nop(s.uuidByteArr())})

t.bench(function bench_rnd_str_Math_random() {l.nop(Math.random().toString())})
t.bench(function bench_rnd_str_rndHex() {l.nop(s.rndHex(16))})
t.bench(function bench_rnd_str_uuid() {l.nop(s.uuid())})
t.bench(function bench_rnd_str_uuid_crypto_long() {l.nop(crypto.randomUUID())})
t.bench(function bench_rnd_str_uuid_crypto_short() {l.nop(uuidCryptoShort())})

const mapMut = new Map().set(`one`, `two`).set(`three`, `four`)
const strMapMut = s.strMap().set(`one`, `two`).set(`three`, `four`)
mapMut.clear()
strMapMut.clear()
t.bench(function bench_map_clear_without_size_check() {l.nop(mapMut.clear())})
t.bench(function bench_map_clear_with_size_check() {l.nop(mapMut.size && mapMut.clear())})
t.bench(function bench_map_clear_StrMap() {l.nop(strMapMut.clear())})

t.bench(function bench_str_map_new() {l.nop(new s.StrMap())})

t.bench(function bench_draft_new_empty() {l.nop(new s.Draft())})

t.bench(function bench_draft_new_preparsed() {
  l.nop(s.Draft.of(
    `one `,
    new s.Embed(`two`),
    ` three `,
    new s.Embed(`four`),
    ` five`,
  ))
})

t.bench(function bench_draft_parse() {l.nop(s.draftParse(DRAFT))})
t.bench(function bench_draft_render() {l.nop(draft.render(draftCtx))})

t.bench(function bench_draft_parse_and_render_once_fun_simple() {
  l.nop(draftRenderSimple(DRAFT, draftCtx))
})

t.bench(function bench_draft_parse_and_render_once_fun_full() {
  l.nop(s.draftRender(DRAFT, draftCtx))
})

t.bench(function bench_draft_parse_and_render_once_cls() {
  l.nop(s.draftParse(DRAFT).render(draftCtx))
})

t.bench(function bench_draft_parse_and_render_twice_fun_simple() {
  l.nop(draftRenderSimple(DRAFT, draftCtx))
  l.nop(draftRenderSimple(DRAFT, draftCtx))
})

t.bench(function bench_draft_parse_and_render_twice_fun_full() {
  l.nop(s.draftRender(DRAFT, draftCtx))
  l.nop(s.draftRender(DRAFT, draftCtx))
})

t.bench(function bench_draft_parse_and_render_twice_cls() {
  const ref = s.draftParse(DRAFT)
  l.nop(ref.render(draftCtx))
  l.nop(ref.render(draftCtx))
})

t.bench(function bench_str_empty() {l.nop(s.str())})
t.bench(function bench_str_str_1() {l.nop(s.str(`one`))})
t.bench(function bench_str_str_2() {l.nop(s.str(`one`, `two`))})
t.bench(function bench_str_str_3() {l.nop(s.str(`one`, `two`, `three`))})
t.bench(function bench_str_num_1() {l.nop(s.str(10))})
t.bench(function bench_str_num_2() {l.nop(s.str(10, 20))})
t.bench(function bench_str_num_3() {l.nop(s.str(10, 20, 30))})

t.bench(function bench_str_strict_join_empty() {l.nop(strStrictJoin())})
t.bench(function bench_str_strict_join_str_1() {l.nop(strStrictJoin(`one`))})
t.bench(function bench_str_strict_join_str_2() {l.nop(strStrictJoin(`one`, `two`))})
t.bench(function bench_str_strict_join_str_3() {l.nop(strStrictJoin(`one`, `two`, `three`))})

t.bench(function bench_str_strict_plus_empty() {l.nop(strStrictPlus())})
t.bench(function bench_str_strict_plus_str_1() {l.nop(strStrictPlus(`one`))})
t.bench(function bench_str_strict_plus_str_2() {l.nop(strStrictPlus(`one`, `two`))})
t.bench(function bench_str_strict_plus_str_3() {l.nop(strStrictPlus(`one`, `two`, `three`))})

t.bench(function bench_strConcat_nil() {l.nop(s.strConcat())})
t.bench(function bench_strConcat_empty() {l.nop(s.strConcat([]))})
t.bench(function bench_strConcat_str_1() {l.nop(s.strConcat([`one`]))})
t.bench(function bench_strConcat_str_2() {l.nop(s.strConcat([`one`, `two`]))})
t.bench(function bench_strConcat_str_3() {l.nop(s.strConcat([`one`, `two`, `three`]))})
t.bench(function bench_strConcat_num_1() {l.nop(s.strConcat([10]))})
t.bench(function bench_strConcat_num_2() {l.nop(s.strConcat([10, 20]))})
t.bench(function bench_strConcat_num_3() {l.nop(s.strConcat([10, 20, 30]))})

t.bench(function bench_san_empty() {l.nop(s.san``)})
t.bench(function bench_san_str_1() {l.nop(s.san`one ${`two`}`)})
t.bench(function bench_san_str_2() {l.nop(s.san`one ${`two`} three ${`four`}`)})
t.bench(function bench_san_str_3() {l.nop(s.san`one ${`two`} three ${`four`} five ${`six`}`)})
t.bench(function bench_san_num_1() {l.nop(s.san`one ${10}`)})
t.bench(function bench_san_num_2() {l.nop(s.san`one ${10} two ${20}`)})
t.bench(function bench_san_num_3() {l.nop(s.san`one ${10} two ${20} three ${30}`)})

t.bench(function bench_byteArrHex() {l.nop(s.byteArrHex(uuidArr))})

t.bench(function bench_replaceAll_miss() {l.nop(s.replaceAll(strForwardSlash, `\\`, `/`))})
t.bench(function bench_replaceAll_hit() {l.nop(s.replaceAll(strBackwardSlash, `\\`, `/`))})

if (import.meta.main) {
  t.deopt()
  t.benches()
}
