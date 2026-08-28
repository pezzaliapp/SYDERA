/**
 * Traditional Pythagorean cycles.
 *
 * Personal Year / Month / Day are conventionally expressed on the 1–9 scale,
 * so master numbers are not preserved there; the un-reduced total remains
 * visible in the reduction trace.
 */
import { reduceNumber, reduceSum, reduceToSingleDigit } from './reduction.ts'
import type { BirthDate, NumberResult, ReductionResult } from './types.ts'

export interface Pinnacle {
  readonly index: 1 | 2 | 3 | 4
  readonly value: number
  readonly isMaster: boolean
  readonly startAge: number
  /** Null for the fourth pinnacle, which runs to the end of life. */
  readonly endAge: number | null
  readonly reduction: ReductionResult
}

export interface Challenge {
  readonly index: 1 | 2 | 3 | 4
  readonly value: number
  readonly expression: string
}

/** Maturity number: Life Path + Expression, reduced. */
export function maturityNumber(lifePath: number, expression: number, keepMasterNumbers = true): NumberResult {
  const reduction = reduceSum([lifePath, expression], keepMasterNumbers)
  return {
    value: reduction.value,
    isMaster: reduction.isMaster,
    reduction,
    inputs: [`lifePath=${lifePath}`, `expression=${expression}`],
  }
}

/** Personal Year for a given calendar year: birth month + birth day + that year. */
export function personalYearNumber(birth: BirthDate, referenceYear: number): NumberResult {
  const total = reduceToSingleDigit(birth.month) + reduceToSingleDigit(birth.day) + reduceToSingleDigit(referenceYear)
  const reduction = reduceNumber(total, false)
  return {
    value: reduction.value,
    isMaster: false,
    reduction: {
      ...reduction,
      steps: [
        {
          expression: `${reduceToSingleDigit(birth.month)}+${reduceToSingleDigit(birth.day)}+${reduceToSingleDigit(referenceYear)}`,
          value: total,
        },
        ...reduction.steps,
      ],
    },
    inputs: [`month=${birth.month}`, `day=${birth.day}`, `year=${referenceYear}`],
  }
}

/** Personal Month: Personal Year + calendar month. */
export function personalMonthNumber(personalYear: number, referenceMonth: number): NumberResult {
  const reduction = reduceSum([personalYear, referenceMonth], false)
  return {
    value: reduction.value,
    isMaster: false,
    reduction,
    inputs: [`personalYear=${personalYear}`, `month=${referenceMonth}`],
  }
}

/** Personal Day: Personal Month + calendar day. */
export function personalDayNumber(personalMonth: number, referenceDay: number): NumberResult {
  const reduction = reduceSum([personalMonth, referenceDay], false)
  return {
    value: reduction.value,
    isMaster: false,
    reduction,
    inputs: [`personalMonth=${personalMonth}`, `day=${referenceDay}`],
  }
}

/**
 * The four pinnacles, with their traditional age spans.
 * The first pinnacle ends at 36 minus the Life Path reduced to a single digit.
 */
export function pinnacles(birth: BirthDate, lifePathValue: number, keepMasterNumbers = true): Pinnacle[] {
  const month = reduceToSingleDigit(birth.month)
  const day = reduceToSingleDigit(birth.day)
  const year = reduceToSingleDigit(birth.year)

  const first = reduceSum([month, day], keepMasterNumbers)
  const second = reduceSum([day, year], keepMasterNumbers)
  const third = reduceSum([first.value, second.value], keepMasterNumbers)
  const fourth = reduceSum([month, year], keepMasterNumbers)

  const firstEnd = 36 - reduceToSingleDigit(lifePathValue)
  const spans: Array<[number, number | null]> = [
    [0, firstEnd],
    [firstEnd + 1, firstEnd + 9],
    [firstEnd + 10, firstEnd + 18],
    [firstEnd + 19, null],
  ]

  return [first, second, third, fourth].map((reduction, position) => {
    const span = spans[position] as [number, number | null]
    return {
      index: (position + 1) as 1 | 2 | 3 | 4,
      value: reduction.value,
      isMaster: reduction.isMaster,
      startAge: span[0],
      endAge: span[1],
      reduction,
    }
  })
}

/** The four challenges: absolute differences, always on the 0–8 scale. */
export function challenges(birth: BirthDate): Challenge[] {
  const month = reduceToSingleDigit(birth.month)
  const day = reduceToSingleDigit(birth.day)
  const year = reduceToSingleDigit(birth.year)

  const first = Math.abs(month - day)
  const second = Math.abs(day - year)
  const third = Math.abs(first - second)
  const fourth = Math.abs(month - year)

  return [
    { index: 1, value: first, expression: `|${month} - ${day}|` },
    { index: 2, value: second, expression: `|${day} - ${year}|` },
    { index: 3, value: third, expression: `|${first} - ${second}|` },
    { index: 4, value: fourth, expression: `|${month} - ${year}|` },
  ]
}
