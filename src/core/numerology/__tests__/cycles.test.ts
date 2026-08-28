import { describe, expect, it } from 'vitest'
import {
  challenges,
  maturityNumber,
  personalDayNumber,
  personalMonthNumber,
  personalYearNumber,
  pinnacles,
} from '../cycles.ts'

const BIRTH = { year: 1984, month: 1, day: 19 } // synthetic technical fixture

describe('maturity number', () => {
  it('adds life path and expression', () => {
    // 6 + 33 = 39 -> 12 -> 3
    const result = maturityNumber(6, 33)
    expect(result.reduction.rawValue).toBe(39)
    expect(result.value).toBe(3)
  })

  it('can yield a master number', () => {
    const result = maturityNumber(9, 4)
    expect(result.reduction.rawValue).toBe(13)
    expect(result.value).toBe(4)
    expect(maturityNumber(11, 11).value).toBe(22)
    expect(maturityNumber(11, 11).isMaster).toBe(true)
  })
})

describe('personal cycles', () => {
  it('computes the personal year on the 1-9 scale', () => {
    // month 1 -> 1, day 19 -> 1, year 2020 -> 4; 1 + 1 + 4 = 6
    const result = personalYearNumber(BIRTH, 2020)
    expect(result.value).toBe(6)
    expect(result.isMaster).toBe(false)
    expect(result.reduction.steps[0]).toEqual({ expression: '1+1+4', value: 6 })
  })

  it('never keeps a master number in a personal year', () => {
    // month 9 -> 9, day 29 -> 2, year 2000 -> 2; 9 + 2 + 2 = 13 -> 4
    expect(personalYearNumber({ year: 1970, month: 9, day: 29 }, 2000).value).toBe(4)
    // a total of 11 must reduce to 2
    expect(personalYearNumber({ year: 1970, month: 3, day: 8 }, 2000).value).toBe(4)
  })

  it('computes personal month and personal day', () => {
    const personalYear = personalYearNumber(BIRTH, 2020).value
    const personalMonth = personalMonthNumber(personalYear, 7)
    const personalDay = personalDayNumber(personalMonth.value, 15)
    expect(personalMonth.value).toBe(4) // 6 + 7 = 13 -> 4
    expect(personalDay.value).toBe(1) // 4 + 15 = 19 -> 10 -> 1
  })

  it('is deterministic across calls', () => {
    expect(personalYearNumber(BIRTH, 2026)).toEqual(personalYearNumber(BIRTH, 2026))
  })
})

describe('pinnacles', () => {
  const result = pinnacles(BIRTH, 6)

  it('computes the four traditional pinnacles', () => {
    // month 1, day 1 (19 -> 1), year 4 (1984 -> 22 -> 4)
    expect(result.map((pinnacle) => pinnacle.value)).toEqual([2, 5, 7, 5])
  })

  it('uses the traditional age spans based on the life path', () => {
    expect(result.map((pinnacle) => [pinnacle.startAge, pinnacle.endAge])).toEqual([
      [0, 30],
      [31, 39],
      [40, 48],
      [49, null],
    ])
  })

  it('reduces a master life path when deriving the age spans', () => {
    const withMasterLifePath = pinnacles(BIRTH, 11)
    expect(withMasterLifePath[0]?.endAge).toBe(34) // 36 - 2
  })
})

describe('challenges', () => {
  it('computes the four challenges as absolute differences', () => {
    expect(challenges(BIRTH).map((challenge) => challenge.value)).toEqual([0, 3, 3, 3])
  })

  it('records the expression used', () => {
    expect(challenges(BIRTH)[1]?.expression).toBe('|1 - 4|')
  })

  it('always stays on the 0-8 scale', () => {
    for (let month = 1; month <= 12; month++) {
      for (const day of [1, 9, 11, 22, 29, 31]) {
        for (const year of [1900, 1984, 2000, 2026]) {
          for (const challenge of challenges({ year, month, day })) {
            expect(challenge.value).toBeGreaterThanOrEqual(0)
            expect(challenge.value).toBeLessThanOrEqual(8)
          }
        }
      }
    }
  })
})
