import * as l from './lang.mjs'

export const PICO_IN_SEC = 1_000_000_000_000
export const NANO_IN_SEC = 1_000_000_000
export const MICRO_IN_SEC = 1_000_000
export const MS_IN_SEC = 1_000
export const SEC_IN_MIN = 60
export const MIN_IN_HOUR = 60
export const HOUR_IN_DAY = 24
export const DAY_IN_WEEK = 7
export const DAY_IN_MON = 30
export const DAY_IN_YEAR = 365
export const MON_IN_YEAR = 12
export const MS_IN_MIN = MS_IN_SEC * SEC_IN_MIN
export const MS_IN_HOUR = MS_IN_MIN * MIN_IN_HOUR
export const MS_IN_DAY = MS_IN_HOUR * HOUR_IN_DAY
export const MS_IN_WEEK = MS_IN_DAY * DAY_IN_WEEK
export const MS_IN_MON = MS_IN_DAY * DAY_IN_MON
export const MS_IN_YEAR = MS_IN_DAY * DAY_IN_YEAR
export const SEC_IN_HOUR = SEC_IN_MIN * MIN_IN_HOUR
export const SEC_IN_DAY = SEC_IN_HOUR * HOUR_IN_DAY
export const SEC_IN_YEAR = SEC_IN_MIN * MIN_IN_HOUR * HOUR_IN_DAY * DAY_IN_YEAR

export const RE_DUR = /^P(?:(?<years>-?\d+)Y)?(?:(?<months>-?\d+)M)?(?:(?<days>-?\d+)D)?(?:T(?:(?<hours>-?\d+)H)?(?:(?<minutes>-?\d+)M)?(?:(?<seconds>-?\d+)S)?)?$/

export function dur(val) {return new Dur(val)}

// https://en.wikipedia.org/wiki/ISO_8601#Durations
export class Dur extends l.Emp {
  constructor(val) {super().reset(val)}

  clear() {
    this.years = 0
    this.months = 0
    this.days = 0
    this.hours = 0
    this.minutes = 0
    this.seconds = 0
    return this
  }

  setYears(val) {return (this.years = l.laxInt(val)), this}
  setMonths(val) {return (this.months = l.laxInt(val)), this}
  setDays(val) {return (this.days = l.laxInt(val)), this}
  setHours(val) {return (this.hours = l.laxInt(val)), this}
  setMinutes(val) {return (this.minutes = l.laxInt(val)), this}
  setSeconds(val) {return (this.seconds = l.laxInt(val)), this}

  withYears(val) {return this.clone().setYears(val)}
  withMonths(val) {return this.clone().setMonths(val)}
  withDays(val) {return this.clone().setDays(val)}
  withHours(val) {return this.clone().setHours(val)}
  withMinutes(val) {return this.clone().setMinutes(val)}
  withSeconds(val) {return this.clone().setSeconds(val)}

  isZero() {return !this.isValid()}
  isValid() {return this.hasDate() || this.hasTime()}
  hasDate() {return !!(this.years || this.months || this.days)}
  hasTime() {return !!(this.hours || this.minutes || this.seconds)}

  // Perf note: specialized `.setDur` would be several times faster than
  // `.resetFromRec`, but the costs are minor and not worth the lines.
  reset(val) {
    if (l.isNil(val)) return this.clear()
    if (l.isStr(val)) return this.resetFromStr(val)
    if (l.isRec(val)) return this.resetFromRec(val)
    throw l.errConvInst(val, this)
  }

  resetFromStr(val) {
    if (!l.reqStr(val)) return this.clear()
    const gro = reqGroups(val, RE_DUR, this.constructor.name)
    this.years = toInt(gro.years)
    this.months = toInt(gro.months)
    this.days = toInt(gro.days)
    this.hours = toInt(gro.hours)
    this.minutes = toInt(gro.minutes)
    this.seconds = toInt(gro.seconds)
    return this
  }

  resetFromRec(val) {
    l.reqRec(val)
    this.setYears(val.years)
    this.setMonths(val.months)
    this.setDays(val.days)
    this.setHours(val.hours)
    this.setMinutes(val.minutes)
    this.setSeconds(val.seconds)
    return this
  }

  resetFromMilli(val) {
    return this.resetFromSec(l.reqFin(val) / MS_IN_SEC)
  }

  // TODO needs its own dedicated tests.
  // We have tests for `.resetFromMilli` which uses this.
  resetFromSec(val) {
    l.reqFin(val)
    this.clear()

    this.hours = Math.trunc(val / SEC_IN_HOUR)
    val = val % SEC_IN_HOUR

    this.minutes = Math.trunc(val / SEC_IN_MIN)
    val = val % SEC_IN_MIN

    // TODO consider not truncating. Preserve fraction.
    this.seconds = Math.trunc(val)
    return this
  }

  mut(val) {return l.isNil(val) ? this : this.mutFromRec(val)}

  mutFromRec(val) {
    for (const key of l.recKeys(val)) {
      if (l.hasOwn(this, key)) this[key] = l.laxInt(val[key])
    }
    return this
  }

  // Suboptimal but short.
  eq(val) {
    if (l.isInst(val, Dur)) val = val.toISOString()
    return l.renderLax(val) === this.toISOString()
  }

  clone() {return new this.constructor(this)}

  toISOString() {
    const {years, months, days, hours, minutes, seconds} = this
    if (!(years || months || days || hours || minutes || seconds)) return `PT0S`
    return `P${suff(years, `Y`)}${suff(months, `M`)}${suff(days, `D`)}${hours || minutes || seconds ? `T` : ``}${suff(hours, `H`)}${suff(minutes, `M`)}${suff(seconds, `S`)}`
  }

  toJSON() {return this.toISOString()}
  toString() {return this.toISOString()}
  valueOf() {return this.toString()}

  static isValid(val) {return l.isSome(val) && l.toInst(val, this).isValid()}
  static fromMilli(val) {return new this().resetFromMilli(val)}
}

// Variant of `Date` with added convenience methods.
export class DateTime extends Date {
  isValid() {return l.isFin(this.valueOf())}

  reqValid() {
    if (this.isValid()) return this
    throw TypeError(super.toString())
  }

  onlyValid() {return this.isValid() ? this : undefined}

  eq(val) {return l.is(this.valueOf(), tsNum(val))}

  dateStr() {
    if (!this.isValid()) return ``
    return this.yearStr() + `-` + this.monthStr() + `-` + this.dayStr()
  }

  yearStr() {return zeroed(this.getFullYear(), 4)}
  monthStr() {return zeroed(this.getMonth() + 1, 2)}
  dayStr() {return zeroed(this.getDate(), 2)}

  static date(...val) {return new this(this.dateTs(...val))}

  static dateTs(year, month, day) {
    return this.UTC(l.reqInt(year), l.reqInt(month), l.reqInt(day), 0, 0, 0, 0)
  }
}

// TODO rename to `DateTimeValid`.
export class DateValid extends DateTime {
  constructor(...val) {
    super(...val)
    if (!l.isValidDate(this)) throw l.errConv(val[0], `valid date`)
  }
}

/*
Short for "date timestamp". Represents itself as a timestamp in JSON.
An invalid date is encoded as `null` because `NaN` → `null`.
*/
export class DateTs extends DateTime {
  toJSON() {return this.valueOf()}
}

// TODO rename to `DateTimeIso`.
export class DateIso extends DateTime {
  toString() {
    if (!this.isValid()) return ``
    return this.toISOString()
  }
}

/*
Compatible with `<input type=date>`. Doesn't automatically shorten for JSON,
to minimize information loss. Use `DateShortJson` for that.

TODO rename to `DateTimeShort`.
*/
export class DateShort extends DateTime {
  toString() {return this.dateStr()}
}

// TODO rename to `DateTimeShortJson`.
export class DateShortJson extends DateShort {
  toJSON() {return this.isValid() ? this.toString() : null}
}

// This is not time-specific. TODO move out, but where?
export class Finite extends Number {
  constructor(val) {super(toFin(val))}

  eq(val) {return this.valueOf() === toNum(val)}

  format(val) {return this.constructor.format(val)}

  /*
  Performance observed in V8:

    * `Number.prototype.toString` is WAY faster than `NumberFormat`,
      at least for integers, and should be preferred whenever its output
      is equivalent to the output of `NumberFormat`.

    * `Number.prototype.toLocaleString` is WAY slower than `NumberFormat`
      and must be avoided.

  We use `NumberFormat` to avoid the exponent notation, which is used by
  default by `.toString`.

  Known issue: `Number.prototype.toString` avoids thousand separators,
  which is consistent with our default formatter config, but may be
  inconsistent with custom formatters specified in subclasses.
  */
  static format(val) {
    l.reqFin(val)
    if (Number.isSafeInteger(val)) return val.toString()
    return this.getFmt().format(val)
  }

  static getFmt() {return l.getOwn(this, `fmt`) || (this.fmt = this.makeFmt())}

  /*
  Reference:

    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

  Magic "20" seems to be the maximum allowed value. `Infinity` is not accepted.
  */
  static makeFmt() {
    return new Intl.NumberFormat(`en-US`, {
      useGrouping: false,
      maximumFractionDigits: 20,
    })
  }
}

export class Sec extends Finite {
  picoStr() {return this.format(this.pico()) + ` ps`}
  nanoStr() {return this.format(this.nano()) + ` ns`}
  microStr() {return this.format(this.micro()) + ` ` + MICRO_SIGN + `s`}
  milliStr() {return this.format(this.milli()) + ` ms`}
  secStr() {return this.format(this.sec()) + ` s`}

  pico() {return this.conv(PICO_IN_SEC)}
  nano() {return this.conv(NANO_IN_SEC)}
  micro() {return this.conv(MICRO_IN_SEC)}
  milli() {return this.conv(MS_IN_SEC)}
  sec() {return this.conv(1)}
  minute() {return this.conv(1 / SEC_IN_MIN)}
  hour() {return this.conv(1 / SEC_IN_HOUR)}

  mod() {return 1}
  conv(mul) {return this.valueOf() * (l.reqNum(mul) / l.reqNum(this.mod()))}
  dur() {return this.Dur.fromMilli(this.milli())}
  toString() {return this.secStr()}
  get Dur() {return Dur}
}

/*
TODO may consider generalizing the "pico/nano/etc" numeric classes.
The unit conversions are relevant for other units, not just seconds.
*/
export class Pico extends Sec {
  mod() {return PICO_IN_SEC}
  toString() {return this.picoStr()}
}

export class Nano extends Sec {
  mod() {return NANO_IN_SEC}
  toString() {return this.nanoStr()}
}

export class Micro extends Sec {
  mod() {return MICRO_IN_SEC}
  toString() {return this.microStr()}
}

export class Milli extends Sec {
  mod() {return MS_IN_SEC}
  toString() {return this.milliStr()}
}

/*
Our regex ensures that captured groups are ±integers, which means we can skip
checks for invalid inputs.
*/
function toInt(val) {return l.isNil(val) ? 0 : Number.parseInt(val)}

function suff(val, suf) {return val ? (val + suf) : ``}

// Short for "timestamp".
export function ts(val) {
  return l.convType(tsOpt(val), val, `timestamp`)
}

// Short for "timestamp optional".
export function tsOpt(val) {return l.onlyFin(tsNum(val))}

/*
Short for "timestamp number". Converts any of several supported types to a
numeric timestamp. Output may be `NaN`. See `ts` and `tsOpt`. Doesn't accept
`Number` subclasses because we use such subclasses for different units,
therefore can't assume a specific unit. Primitive numeric timestamps are
usually in milliseconds, so it's RELATIVELY safe to assume ms. Sometimes
timestamps are stored and transmitted in seconds. That's out of our hands.
The caller should convert seconds in advance.
*/
export function tsNum(val) {
  if (l.isNum(val)) return val
  if (l.isStr(val)) return Date.parse(val)
  if (l.isDate(val)) return val.valueOf()
  return NaN
}

export function date(val) {
  return l.convType(dateOpt(val), val, `date`)
}

export function dateOpt(val) {
  if (l.isNil(val)) return val
  return l.toInst(val, DateTime).onlyValid()
}

export function msToSec(val) {return l.laxFin(val) / MS_IN_SEC}
export function msToMin(val) {return l.laxFin(val) / MS_IN_MIN}
export function msToHour(val) {return l.laxFin(val) / MS_IN_HOUR}

export function secToMs(val) {return l.laxFin(val) * MS_IN_SEC}
export function secToMin(val) {return l.laxFin(val) / SEC_IN_MIN}
export function secToHour(val) {return l.laxFin(val) / SEC_IN_HOUR}

export function minToMs(val) {return l.laxFin(val) * MS_IN_MIN}
export function minToSec(val) {return l.laxFin(val) * SEC_IN_MIN}
export function minToHour(val) {return l.laxFin(val) / MIN_IN_HOUR}

export function hourToMs(val) {return l.laxFin(val) * MS_IN_HOUR}
export function hourToSec(val) {return l.laxFin(val) * SEC_IN_HOUR}
export function hourToMin(val) {return l.laxFin(val) * MIN_IN_HOUR}

export function after(ms, sig) {
  l.reqFin(ms)
  if (l.optInst(sig, AbortSignal)) return afterSig(ms, sig)
  return afterSimple(ms)
}

/* Internal */

// This is Unicode micro sign which LOOKS like a Greek mu,
// but is considered a distinct code unit.
const MICRO_SIGN = `µ`

function toFin(val) {return l.reqFin(toNum(val))}

function toNum(val) {
  if (l.isNum(val)) return val
  if (l.isInst(val, Number)) return l.reqNum(val.valueOf())
  throw l.errFun(val, l.isNum)
}

function zeroed(src, len) {return l.reqInt(src).toString().padStart(len, `0`)}

// Duplicate from `url.mjs` to minimize deps.
function reqGroups(val, reg, msg) {
  const mat = l.laxStr(val).match(reg)
  return l.convSynt(mat && mat.groups, val, msg)
}

function afterSimple(ms) {
  return new Promise(function init(done) {setTimeout(done, ms, true)})
}

function afterSig(ms, sig) {
  if (sig.aborted) return Promise.resolve(false)

  return new Promise(function init(done) {
    sig.addEventListener(`abort`, aborted, {once: true})
    const id = setTimeout(reached, ms)

    function reached() {deinit(); done(true)}
    function aborted() {deinit(); done(false)}
    function deinit() {clearTimeout(id); sig.removeEventListener(`abort`, aborted)}
  })
}
