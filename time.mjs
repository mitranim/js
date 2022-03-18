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
  constructor(val) {
    super().clear()
    if (l.isSome(val)) this.reset(val)
  }

  clear() {
    this.years = 0
    this.months = 0
    this.days = 0
    this.hours = 0
    this.minutes = 0
    this.seconds = 0
    return this
  }

  setYears(val) {return this.years = l.laxInt(val), this}
  setMonths(val) {return this.months = l.laxInt(val), this}
  setDays(val) {return this.days = l.laxInt(val), this}
  setHours(val) {return this.hours = l.laxInt(val), this}
  setMinutes(val) {return this.minutes = l.laxInt(val), this}
  setSeconds(val) {return this.seconds = l.laxInt(val), this}

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
  // `.resetFromStruct`, but the costs are minor and not worth the lines.
  reset(val) {
    if (l.isNil(val)) return this.clear()
    if (l.isStr(val)) return this.resetFromStr(val)
    if (l.isStruct(val)) return this.resetFromStruct(val)
    throw l.errInst(val, this)
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

  resetFromStruct(val) {
    l.reqStruct(val)
    this.setYears(val.years)
    this.setMonths(val.months)
    this.setDays(val.days)
    this.setHours(val.hours)
    this.setMinutes(val.minutes)
    this.setSeconds(val.seconds)
    return this
  }

  mut(val) {return l.isNil(val) ? this : this.mutFromStruct(val)}

  mutFromStruct(val) {
    for (const key of l.structKeys(val)) {
      if (l.hasOwn(this, key)) this[key] = l.laxInt(val[key])
    }
    return this
  }

  clone() {return new this.constructor(this)}

  toString() {
    const {years, months, days, hours, minutes, seconds} = this
    if (!(years || months || days || hours || minutes || seconds)) return `PT0S`
    return `P${suff(years, `Y`)}${suff(months, `M`)}${suff(days, `D`)}${hours || minutes || seconds ? `T` : ``}${suff(hours, `H`)}${suff(minutes, `M`)}${suff(seconds, `S`)}`
  }

  toJSON() {return this.isZero() ? null : this.toString()}
  valueOf() {return this.toString()}

  static isValid(val) {return l.isSome(val) && l.toInst(val, this).isValid()}
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
Short for "timestamp number". Converts one of a few supported types to a numeric
timestamp. Output may be `NaN`. See `ts` and `tsOpt`. Doesn't allow `Number`
subclasses because we ourselves use several of them for different units,
therefore can't assume a specific unit. Primitive numeric timestamps are
usually in milliseconds, so it's RELATIVELY safe to assume ms. Sometimes
timestamps are stored and transmitted in seconds. That's out of our hands. The
caller should convert seconds in advance.
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
  if (l.isNil(val)) return undefined
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
}

/*
Short for "date timestamp". Represents itself as a timestamp in JSON.
An invalid date is encoded as `null` because `NaN` → `null`.
*/
export class DateTs extends DateTime {
  toJSON() {return this.valueOf()}
}

export class DateIso extends DateTime {
  toString() {
    if (!this.isValid()) return ``
    return this.toISOString()
  }
}

/*
Compatible with `<input type=date>`. Doesn't automatically shorten for JSON,
to minimize information loss. Use `DateShortJson` for that.
*/
export class DateShort extends DateTime {
  toString() {return this.dateStr()}
}

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
      at least for integers.
    * `Number.prototype.toLocaleString` is WAY slower than `NumberFormat`.

  We resort to `NumberFormat` when `.toString` would have used the exponent
  notation, which we aim to avoid.
  */
  static format(val) {
    l.reqFin(val)
    if (Number.isSafeInteger(val)) return val.toString()
    return this.fmt.format(val)
  }
}

/*
Reference:

  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat

Magic "20" seems to be the maximum allowed value. `Infinity` is not accepted.
*/
Finite.fmt = /* @__PURE__ */ new Intl.NumberFormat(`en-US`, {
  useGrouping: false,
  maximumFractionDigits: 20,
})

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

  dur() {
    let rem = this.sec()

    const hour = Math.trunc(rem / SEC_IN_HOUR)
    rem = rem % SEC_IN_HOUR

    const min = Math.trunc(rem / SEC_IN_MIN)
    rem = rem % SEC_IN_MIN

    return new this.Dur().setHours(hour).setMinutes(min).setSeconds(rem)
  }

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
    sig.addEventListener(`abort`, aborted)
    const id = setTimeout(reached, ms)

    function reached() {deinit(), done(true)}
    function aborted() {deinit(), done(false)}
    function deinit() {clearTimeout(id), sig.removeEventListener(`abort`, aborted)}
  })
}
