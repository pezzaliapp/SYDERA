import { describe, expect, it } from 'vitest'
import { birthdayNumber, daysInMonth, isLeapYear, isValidBirthDate, lifePathNumber } from '../dateNumbers.ts'

describe('calendar validation', () => {
  it('identifies leap years', () => {
    expect(isLeapYear(2000)).toBe(true)
    expect(isLeapYear(1900)).toBe(false)
    expect(isLeapYear(2024)).toBe(true)
    expect(isLeapYear(2023)).toBe(false)
  })

  it('returns the correct month lengths', () => {
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2023, 2)).toBe(28)
    expect(daysInMonth(2023, 4)).toBe(30)
    expect(daysInMonth(2023, 12)).toBe(31)
  })

  it('rejects impossible dates', () => {
    expect(isValidBirthDate({ year: 2023, month: 2, day: 29 })).toBe(false)
    expect(isValidBirthDate({ year: 2024, month: 2, day: 29 })).toBe(true)
    expect(isValidBirthDate({ year: 2023, month: 13, day: 1 })).toBe(false)
    expect(isValidBirthDate({ year: 2023, month: 0, day: 1 })).toBe(false)
    expect(isValidBirthDate({ year: 2023, month: 6, day: 0 })).toBe(false)
    expect(isValidBirthDate({ year: 2023.5, month: 6, day: 1 })).toBe(false)
  })
})

describe('life path number', () => {
  /**
   * Synthetic date 1984-01-19.
   *   component method: month 1 -> 1, day 19 -> 1, year 1984 -> 22 (master)
   *                     1 + 1 + 22 = 24 -> 6
   *   digit-sum method: 1 + (1+9) + (1+9+8+4) = 33 (master)
   */
  const date = { year: 1984, month: 1, day: 19 }

  it('uses the component method by default', () => {
    const result = lifePathNumber(date)
    expect(result.value).toBe(6)
    expect(result.reduction.rawValue).toBe(24)
    expect(result.inputs).toContain('year 1984 -> 22')
  })

  it('produces a different result with the digit-sum method', () => {
    const result = lifePathNumber(date, 'digit-sum')
    expect(result.reduction.rawValue).toBe(33)
    expect(result.value).toBe(33)
    expect(result.isMaster).toBe(true)
  })

  it('preserves master components', () => {
    // 2000-11-29: month 11, day 29 -> 11, year 2000 -> 2; 11 + 11 + 2 = 24 -> 6
    const result = lifePathNumber({ year: 2000, month: 11, day: 29 })
    expect(result.reduction.rawValue).toBe(24)
    expect(result.value).toBe(6)
    expect(result.inputs).toEqual([
      'month 11 -> 11',
      'day 29 -> 11',
      'year 2000 -> 2',
      'method=component',
    ])
  })

  it('agrees with the digit-sum method on that date', () => {
    expect(lifePathNumber({ year: 2000, month: 11, day: 29 }, 'digit-sum').value).toBe(6)
  })

  it('can be computed without master numbers', () => {
    expect(lifePathNumber({ year: 1984, month: 1, day: 19 }, 'component', false).value).toBe(6)
    expect(lifePathNumber({ year: 1984, month: 1, day: 19 }, 'digit-sum', false).value).toBe(6)
  })

  it('is deterministic', () => {
    expect(lifePathNumber(date)).toEqual(lifePathNumber(date))
  })
})

describe('birthday number', () => {
  it('reduces the day of the month', () => {
    expect(birthdayNumber({ year: 2000, month: 1, day: 19 }).value).toBe(1)
    expect(birthdayNumber({ year: 2000, month: 1, day: 7 }).value).toBe(7)
  })

  it('preserves 11 and 22', () => {
    expect(birthdayNumber({ year: 2000, month: 1, day: 29 }).value).toBe(11)
    expect(birthdayNumber({ year: 2000, month: 1, day: 22 }).value).toBe(22)
    expect(birthdayNumber({ year: 2000, month: 1, day: 22 }).isMaster).toBe(true)
  })

  it('reduces them when master numbers are disabled', () => {
    expect(birthdayNumber({ year: 2000, month: 1, day: 29 }, false).value).toBe(2)
  })
})
