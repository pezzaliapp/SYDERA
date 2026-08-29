/**
 * Birth date and time entry.
 *
 * A birth date is decades in the past, so a calendar that opens on today and
 * has to be walked backwards month by month is the wrong instrument. The form
 * asks for three numbers instead — day, month, year — and this module turns
 * what was typed into the values the engines expect, or explains why it cannot.
 *
 * The engines are untouched: this only produces the same `{ year, month, day }`
 * and `{ hour, minute }` shapes they already take, and defers the calendar
 * question to the engine's own `isValidBirthDate`.
 */
import { isValidBirthDate } from '../core/numerology/dateNumbers.ts'

export interface BirthDateParts {
  readonly day: string
  readonly month: string
  readonly year: string
}

export interface BirthTimeParts {
  readonly hour: string
  readonly minute: string
}

export interface BirthDate {
  readonly year: number
  readonly month: number
  readonly day: number
}

export interface BirthTime {
  readonly hour: number
  readonly minute: number
}

export type DateProblem =
  | 'empty'
  | 'incomplete'
  | 'day-range'
  | 'month-range'
  | 'year-range'
  | 'impossible-date'

export type TimeProblem = 'empty' | 'incomplete' | 'hour-range' | 'minute-range'

export type DateResult =
  | { readonly ok: true; readonly date: BirthDate }
  | { readonly ok: false; readonly problem: DateProblem }

export type TimeResult =
  | { readonly ok: true; readonly time: BirthTime }
  | { readonly ok: false; readonly problem: TimeProblem }

/** Oldest year offered: generous enough for any living person. */
export const YEAR_SPAN = 130

export function earliestYear(currentYear: number): number {
  return currentYear - YEAR_SPAN
}

/** Keep only digits, and never more than the field can hold. */
export function sanitiseDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

/**
 * Parse the three fields.
 *
 * A leading zero is optional while typing, so "1" and "01" are the same day.
 * The calendar itself is checked by the engine, so 31/02 is rejected and
 * 29/02 is accepted only in a leap year.
 */
export function parseBirthDate(parts: BirthDateParts, currentYear: number): DateResult {
  const day = parts.day.trim()
  const month = parts.month.trim()
  const year = parts.year.trim()

  if (day === '' && month === '' && year === '') return { ok: false, problem: 'empty' }
  if (day === '' || month === '' || year === '') return { ok: false, problem: 'incomplete' }
  if (year.length < 4) return { ok: false, problem: 'incomplete' }

  const dayValue = Number(day)
  const monthValue = Number(month)
  const yearValue = Number(year)

  if (!Number.isInteger(dayValue) || dayValue < 1 || dayValue > 31) return { ok: false, problem: 'day-range' }
  if (!Number.isInteger(monthValue) || monthValue < 1 || monthValue > 12) return { ok: false, problem: 'month-range' }
  if (!Number.isInteger(yearValue) || yearValue < earliestYear(currentYear) || yearValue > currentYear) {
    return { ok: false, problem: 'year-range' }
  }

  const date = { year: yearValue, month: monthValue, day: dayValue }
  // Leap years and short months are the engine's rule, not a second opinion.
  if (!isValidBirthDate(date)) return { ok: false, problem: 'impossible-date' }

  return { ok: true, date }
}

export function parseBirthTime(parts: BirthTimeParts): TimeResult {
  const hour = parts.hour.trim()
  const minute = parts.minute.trim()

  if (hour === '' && minute === '') return { ok: false, problem: 'empty' }
  if (hour === '' || minute === '') return { ok: false, problem: 'incomplete' }

  const hourValue = Number(hour)
  const minuteValue = Number(minute)

  if (!Number.isInteger(hourValue) || hourValue < 0 || hourValue > 23) return { ok: false, problem: 'hour-range' }
  if (!Number.isInteger(minuteValue) || minuteValue < 0 || minuteValue > 59) return { ok: false, problem: 'minute-range' }

  return { ok: true, time: { hour: hourValue, minute: minuteValue } }
}

/** The internal representation the rest of the application already uses. */
export function toIsoDate(date: BirthDate): string {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

export function toIsoTime(time: BirthTime): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
}

/** Fill the three fields from a stored date, for the "modify my data" screen. */
export function dateToParts(date: BirthDate | null): BirthDateParts {
  if (!date) return { day: '', month: '', year: '' }
  return {
    day: String(date.day).padStart(2, '0'),
    month: String(date.month).padStart(2, '0'),
    year: String(date.year),
  }
}

export function timeToParts(time: BirthTime | null): BirthTimeParts {
  if (!time) return { hour: '', minute: '' }
  return { hour: String(time.hour).padStart(2, '0'), minute: String(time.minute).padStart(2, '0') }
}
