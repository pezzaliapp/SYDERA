import { describe, expect, it } from 'vitest'
import {
  YEAR_SPAN,
  dateToParts,
  earliestYear,
  parseBirthDate,
  parseBirthTime,
  sanitiseDigits,
  timeToParts,
  toIsoDate,
  toIsoTime,
} from '../birthInput.ts'

/** The current year is always an explicit input: nothing here reads the clock. */
const YEAR = 2026

describe('digit sanitising', () => {
  it('keeps digits only and respects the field length', () => {
    expect(sanitiseDigits('1a2', 2)).toBe('12')
    expect(sanitiseDigits('19/84', 4)).toBe('1984')
    expect(sanitiseDigits('123456', 4)).toBe('1234')
    expect(sanitiseDigits('', 2)).toBe('')
    expect(sanitiseDigits('--', 2)).toBe('')
  })
})

describe('valid dates', () => {
  it('accepts a complete date', () => {
    const result = parseBirthDate({ day: '19', month: '01', year: '1984' }, YEAR)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.date).toEqual({ year: 1984, month: 1, day: 19 })
  })

  it('treats a leading zero as optional', () => {
    const padded = parseBirthDate({ day: '01', month: '09', year: '1964' }, YEAR)
    const bare = parseBirthDate({ day: '1', month: '9', year: '1964' }, YEAR)
    expect(padded).toEqual(bare)
    if (!bare.ok) return
    expect(bare.date).toEqual({ year: 1964, month: 9, day: 1 })
  })

  it('accepts the first and last day of a month', () => {
    expect(parseBirthDate({ day: '1', month: '1', year: '2000' }, YEAR).ok).toBe(true)
    expect(parseBirthDate({ day: '31', month: '12', year: '2000' }, YEAR).ok).toBe(true)
    expect(parseBirthDate({ day: '30', month: '4', year: '2000' }, YEAR).ok).toBe(true)
  })
})

describe('impossible dates', () => {
  it('rejects the 31st of a thirty-day month', () => {
    expect(parseBirthDate({ day: '31', month: '4', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
    expect(parseBirthDate({ day: '31', month: '6', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
    expect(parseBirthDate({ day: '31', month: '9', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
    expect(parseBirthDate({ day: '31', month: '11', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
  })

  it('rejects 31 February', () => {
    expect(parseBirthDate({ day: '31', month: '2', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
    expect(parseBirthDate({ day: '30', month: '2', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
  })

  it('rejects a day or month outside its range', () => {
    expect(parseBirthDate({ day: '0', month: '1', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'day-range' })
    expect(parseBirthDate({ day: '32', month: '1', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'day-range' })
    expect(parseBirthDate({ day: '1', month: '0', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'month-range' })
    expect(parseBirthDate({ day: '1', month: '13', year: '2000' }, YEAR)).toEqual({ ok: false, problem: 'month-range' })
  })
})

describe('leap years', () => {
  it('accepts 29 February in a leap year', () => {
    expect(parseBirthDate({ day: '29', month: '2', year: '2000' }, YEAR).ok).toBe(true)
    expect(parseBirthDate({ day: '29', month: '2', year: '2024' }, YEAR).ok).toBe(true)
    expect(parseBirthDate({ day: '29', month: '2', year: '1996' }, YEAR).ok).toBe(true)
  })

  it('rejects 29 February in a common year', () => {
    expect(parseBirthDate({ day: '29', month: '2', year: '2023' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
    expect(parseBirthDate({ day: '29', month: '2', year: '2025' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
  })

  it('applies the century rule', () => {
    // 1900 is not a leap year; 2000 is.
    expect(parseBirthDate({ day: '29', month: '2', year: '1900' }, YEAR)).toEqual({ ok: false, problem: 'impossible-date' })
    expect(parseBirthDate({ day: '29', month: '2', year: '2000' }, YEAR).ok).toBe(true)
  })
})

describe('year boundaries', () => {
  it('offers a generous historical span ending at the current year', () => {
    expect(YEAR_SPAN).toBe(130)
    expect(earliestYear(2026)).toBe(1896)
  })

  it('accepts both ends of the range', () => {
    expect(parseBirthDate({ day: '1', month: '1', year: String(earliestYear(YEAR)) }, YEAR).ok).toBe(true)
    expect(parseBirthDate({ day: '1', month: '1', year: String(YEAR) }, YEAR).ok).toBe(true)
  })

  it('rejects a year before the range or in the future', () => {
    expect(parseBirthDate({ day: '1', month: '1', year: String(earliestYear(YEAR) - 1) }, YEAR)).toEqual({
      ok: false,
      problem: 'year-range',
    })
    expect(parseBirthDate({ day: '1', month: '1', year: String(YEAR + 1) }, YEAR)).toEqual({ ok: false, problem: 'year-range' })
  })

  it('moves with the current year', () => {
    expect(parseBirthDate({ day: '1', month: '1', year: '2030' }, 2030).ok).toBe(true)
    expect(parseBirthDate({ day: '1', month: '1', year: '2030' }, 2026).ok).toBe(false)
  })
})

describe('incomplete input', () => {
  it('says nothing was entered when the fields are empty', () => {
    expect(parseBirthDate({ day: '', month: '', year: '' }, YEAR)).toEqual({ ok: false, problem: 'empty' })
  })

  it('asks for the missing part rather than guessing', () => {
    expect(parseBirthDate({ day: '19', month: '', year: '1984' }, YEAR)).toEqual({ ok: false, problem: 'incomplete' })
    expect(parseBirthDate({ day: '', month: '1', year: '1984' }, YEAR)).toEqual({ ok: false, problem: 'incomplete' })
    expect(parseBirthDate({ day: '19', month: '1', year: '' }, YEAR)).toEqual({ ok: false, problem: 'incomplete' })
  })

  it('waits for a four-digit year instead of reading 84 as 84 AD', () => {
    expect(parseBirthDate({ day: '19', month: '1', year: '84' }, YEAR)).toEqual({ ok: false, problem: 'incomplete' })
    expect(parseBirthDate({ day: '19', month: '1', year: '198' }, YEAR)).toEqual({ ok: false, problem: 'incomplete' })
  })
})

describe('time entry', () => {
  it('accepts a valid time', () => {
    const result = parseBirthTime({ hour: '07', minute: '30' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.time).toEqual({ hour: 7, minute: 30 })
  })

  it('treats a leading zero as optional', () => {
    expect(parseBirthTime({ hour: '7', minute: '5' })).toEqual({ ok: true, time: { hour: 7, minute: 5 } })
  })

  it('accepts midnight and the last minute of the day', () => {
    expect(parseBirthTime({ hour: '0', minute: '0' })).toEqual({ ok: true, time: { hour: 0, minute: 0 } })
    expect(parseBirthTime({ hour: '23', minute: '59' })).toEqual({ ok: true, time: { hour: 23, minute: 59 } })
  })

  it('rejects an hour or minute outside its range', () => {
    expect(parseBirthTime({ hour: '24', minute: '0' })).toEqual({ ok: false, problem: 'hour-range' })
    expect(parseBirthTime({ hour: '12', minute: '60' })).toEqual({ ok: false, problem: 'minute-range' })
  })

  it('asks for the missing part', () => {
    expect(parseBirthTime({ hour: '', minute: '' })).toEqual({ ok: false, problem: 'empty' })
    expect(parseBirthTime({ hour: '7', minute: '' })).toEqual({ ok: false, problem: 'incomplete' })
    expect(parseBirthTime({ hour: '', minute: '30' })).toEqual({ ok: false, problem: 'incomplete' })
  })
})

describe('serialisation preserved for the engines', () => {
  it('produces the internal date representation', () => {
    expect(toIsoDate({ year: 1984, month: 1, day: 19 })).toBe('1984-01-19')
    expect(toIsoDate({ year: 1964, month: 9, day: 1 })).toBe('1964-09-01')
    expect(toIsoDate({ year: 999, month: 12, day: 31 })).toBe('0999-12-31')
  })

  it('produces the internal time representation', () => {
    expect(toIsoTime({ hour: 7, minute: 30 })).toBe('07:30')
    expect(toIsoTime({ hour: 0, minute: 0 })).toBe('00:00')
    expect(toIsoTime({ hour: 23, minute: 5 })).toBe('23:05')
  })

  it('round-trips through the field representation', () => {
    for (const date of [
      { year: 1984, month: 1, day: 19 },
      { year: 2000, month: 2, day: 29 },
      { year: 1964, month: 9, day: 1 },
    ]) {
      const parts = dateToParts(date)
      const parsed = parseBirthDate(parts, YEAR)
      expect(parsed.ok).toBe(true)
      if (parsed.ok) expect(parsed.date).toEqual(date)
    }
  })

  it('round-trips a time through the field representation', () => {
    for (const time of [{ hour: 7, minute: 30 }, { hour: 0, minute: 0 }, { hour: 23, minute: 59 }]) {
      const parsed = parseBirthTime(timeToParts(time))
      expect(parsed.ok).toBe(true)
      if (parsed.ok) expect(parsed.time).toEqual(time)
    }
  })

  it('returns empty fields when there is nothing stored', () => {
    expect(dateToParts(null)).toEqual({ day: '', month: '', year: '' })
    expect(timeToParts(null)).toEqual({ hour: '', minute: '' })
  })
})
