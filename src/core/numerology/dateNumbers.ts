/**
 * Date-derived numbers: Life Path and Birthday number.
 *
 * The civil calendar date as written on the birth record is used. Numerology
 * operates on the written date, so no timezone conversion is involved here —
 * that concern belongs to the astrology engine.
 */
import { reduceNumber, reduceSum, sumDigits } from './reduction.ts'
import type { BirthDate, LifePathMethod, NumberResult } from './types.ts'

export const MIN_YEAR = 1000
export const MAX_YEAR = 2400

export function isValidBirthDate(date: BirthDate): boolean {
  const { year, month, day } = date
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false
  if (month < 1 || month > 12) return false
  if (day < 1) return false
  return day <= daysInMonth(year, month)
}

export function daysInMonth(year: number, month: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return lengths[month - 1] ?? 0
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Life Path.
 *
 * 'component' (default, most widely documented): month, day and year are each
 * reduced first — preserving master numbers — and the three results are then
 * summed and reduced.
 *
 * 'digit-sum': every digit of the full date is summed in one pass. The two
 * methods usually agree but not always, which is why the method used is part
 * of the result.
 */
export function lifePathNumber(
  date: BirthDate,
  method: LifePathMethod = 'component',
  keepMasterNumbers = true,
): NumberResult {
  if (method === 'digit-sum') {
    const total = sumDigits(date.month) + sumDigits(date.day) + sumDigits(date.year)
    const reduction = reduceNumber(total, keepMasterNumbers)
    return {
      value: reduction.value,
      isMaster: reduction.isMaster,
      reduction: {
        ...reduction,
        steps: [
          {
            expression: `${digitsExpression(date.month)}+${digitsExpression(date.day)}+${digitsExpression(date.year)}`,
            value: total,
          },
          ...reduction.steps,
        ],
      },
      inputs: [`month=${date.month}`, `day=${date.day}`, `year=${date.year}`, 'method=digit-sum'],
    }
  }

  const month = reduceNumber(date.month, keepMasterNumbers)
  const day = reduceNumber(date.day, keepMasterNumbers)
  const year = reduceNumber(date.year, keepMasterNumbers)
  const reduction = reduceSum([month.value, day.value, year.value], keepMasterNumbers)
  return {
    value: reduction.value,
    isMaster: reduction.isMaster,
    reduction,
    inputs: [
      `month ${date.month} -> ${month.value}`,
      `day ${date.day} -> ${day.value}`,
      `year ${date.year} -> ${year.value}`,
      'method=component',
    ],
  }
}

/** Birthday number: the day of the month, reduced (11 and 22 are preserved). */
export function birthdayNumber(date: BirthDate, keepMasterNumbers = true): NumberResult {
  const reduction = reduceNumber(date.day, keepMasterNumbers)
  return {
    value: reduction.value,
    isMaster: reduction.isMaster,
    reduction,
    inputs: [`day=${date.day}`],
  }
}

function digitsExpression(value: number): string {
  return String(value).split('').join('+')
}
