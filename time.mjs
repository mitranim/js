import * as l from './lang.mjs'

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
export class Dur {
  constructor(val) {
    this.clear()
    if (l.isSome(val)) this.mut(val)
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

  mut(val) {
    if (l.isNil(val)) return this.clear()
    if (l.isStr(val)) return this.setStr(val)
    if (l.isInst(val, Dur)) return this.setDur(val)
    if (l.isStruct(val)) return this.setStruct(val)
    throw l.errInst(val, this)
  }

  setStr(val) {
    l.reqStr(val)
    if (!val) return this.clear()

    const mat = l.reqStr(val).match(RE_DUR)
    const gr = mat && mat.groups
    if (!gr) throw l.errSynt(val, this.constructor.name)

    this.years = toInt(gr.years)
    this.months = toInt(gr.months)
    this.days = toInt(gr.days)
    this.hours = toInt(gr.hours)
    this.minutes = toInt(gr.minutes)
    this.seconds = toInt(gr.seconds)
    return this
  }

  setDur(val) {
    l.reqInst(val, Dur)
    this.years = val.years
    this.months = val.months
    this.days = val.days
    this.hours = val.hours
    this.minutes = val.minutes
    this.seconds = val.seconds
    return this
  }

  setStruct(val) {
    l.reqStruct(val)
    this.years = l.laxInt(val.years)
    this.months = l.laxInt(val.months)
    this.days = l.laxInt(val.days)
    this.hours = l.laxInt(val.hours)
    this.minutes = l.laxInt(val.minutes)
    this.seconds = l.laxInt(val.seconds)
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
  get [Symbol.toStringTag]() {return this.constructor.name}

  static isValid(val) {return l.isSome(val) && l.toInst(val, this).isValid()}
}

function toInt(val) {return l.isNil(val) ? 0 : Number.parseInt(val)}

function suff(val, suf) {return val ? (val + suf) : ``}

export function ts(val) {
  return l.convType(tsOpt(val), val, `timestamp`)
}

export function tsOpt(val) {return l.onlyFin(tsNum(val))}

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

export class DateTime extends Date {
  isValid() {return l.isFin(this.valueOf())}

  reqValid() {
    if (this.isValid()) return this
    throw TypeError(`invalid date`)
  }

  onlyValid() {return this.isValid() ? this : undefined}
  eq(val) {return l.is(this.valueOf(), tsNum(val))}
  toJSON() {return this.isValid() ? this.toString() : null}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export class Timestamp extends DateTime {
  toJSON() {return this.valueOf()}
}

export class DateIso extends DateTime {
  toString() {
    if (!this.isValid()) return ``
    return this.toISOString()
  }
}

// Compatible with `<input type=date>`.
export class DateShort extends DateTime {
  toString() {
    if (!this.isValid()) return ``
    return [this.getFullYear(), this.getMonth(), this.getDate()].join(`-`)
  }
}

export class Ts extends Number {
  constructor(val) {super(toFin(val))}

  picoStr() {return this.pico() + ` ps`}
  nanoStr() {return this.nano() + ` ns`}
  microStr() {return this.micro() + ` μs`}
  milliStr() {return this.milli() + ` ms`}

  // // TODO consider fancy printing like Go `time.Duration`.
  // toString() {return super.toString()}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

function toFin(val) {
  if (l.isNil(val)) return 0
  if (l.isFin(val)) return val
  if (l.isInst(val, Number)) return toFin(val.valueOf())
  throw l.errConv(val, `fin`)
}

export class Pico extends Ts {
  pico() {return this.valueOf()}
  nano() {return this.valueOf() / 1_000}
  micro() {return this.valueOf() / 1_000_1000}
  milli() {return this.valueOf() / 1_000_000_000}
  toString() {return this.picoStr()}
}

export class Nano extends Ts {
  pico() {return this.valueOf() * 1_000}
  nano() {return this.valueOf()}
  micro() {return this.valueOf() / 1_000}
  milli() {return this.valueOf() / 1_000_000}
  toString() {return this.nanoStr()}
}

export class Micro extends Ts {
  pico() {return this.valueOf() * 1_000_000}
  nano() {return this.valueOf() * 1_000}
  micro() {return this.valueOf()}
  milli() {return this.valueOf() / 1_000}
  toString() {return this.microStr()}
}

export class Milli extends Ts {
  pico() {return this.valueOf() * 1_000_000_000}
  nano() {return this.valueOf() * 1_000_000}
  micro() {return this.valueOf() * 1_000}
  milli() {return this.valueOf()}
  toString() {return this.milliStr()}
}

export function after(ms, sig) {
  l.reqFin(ms)
  if (l.optInst(sig, AbortSignal)) return afterSig(ms, sig)
  return afterSimple(ms)
}

function afterSig(ms, sig) {
  return new Promise(function init(done) {
    sig.addEventListener(`abort`, aborted)
    const id = setTimeout(reached, ms)

    function reached() {deinit(), done(true)}
    function aborted() {deinit(), done(false)}
    function deinit() {clearTimeout(id), sig.removeEventListener(`abort`, aborted)}
  })
}

function afterSimple(ms) {
  return new Promise(function init(done) {setTimeout(done, ms, true)})
}
