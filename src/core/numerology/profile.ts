/**
 * Full numerological profile: validation, calculation and traceability.
 *
 * The engine deliberately receives the reference date as an explicit input.
 * Nothing here reads the system clock, which keeps every result reproducible
 * and testable.
 */
import { analyseName } from './alphabet.ts'
import { challenges, maturityNumber, personalDayNumber, personalMonthNumber, personalYearNumber, pinnacles } from './cycles.ts'
import { birthdayNumber, isValidBirthDate, lifePathNumber, MAX_YEAR, MIN_YEAR } from './dateNumbers.ts'
import { expressionNumber, personalityNumber, soulUrgeNumber } from './nameNumbers.ts'
import {
  DEFAULT_NUMEROLOGY_OPTIONS,
  type BirthDate,
  type NameAnalysis,
  type NumberResult,
  type NumerologyIssue,
  type NumerologyOptions,
  type NumerologyOutcome,
} from './types.ts'
import type { Challenge, Pinnacle } from './cycles.ts'

export interface NumerologyInput {
  /** Full birth name as written on the birth record. */
  readonly fullBirthName: string
  readonly birthDate: BirthDate
  /** Calendar date used for the personal cycles. Supplied by the caller: the engine never reads the clock. */
  readonly referenceDate: BirthDate
  readonly options?: Partial<NumerologyOptions>
}

export interface NumerologyProfile {
  readonly options: NumerologyOptions
  readonly nameAnalysis: NameAnalysis
  readonly birthDate: BirthDate
  readonly referenceDate: BirthDate
  readonly lifePath: NumberResult
  readonly expression: NumberResult
  readonly soulUrge: NumberResult
  readonly personality: NumberResult
  readonly birthday: NumberResult
  readonly maturity: NumberResult
  readonly personalYear: NumberResult
  readonly personalMonth: NumberResult
  readonly personalDay: NumberResult
  readonly pinnacles: readonly Pinnacle[]
  readonly challenges: readonly Challenge[]
}

export function computeNumerologyProfile(input: NumerologyInput): NumerologyOutcome<NumerologyProfile> {
  const options: NumerologyOptions = { ...DEFAULT_NUMEROLOGY_OPTIONS, ...input.options }
  const issues: NumerologyIssue[] = []
  const warnings: NumerologyIssue[] = []

  if (!isValidBirthDate(input.birthDate)) {
    issues.push({
      code: 'date-invalid',
      detail: `${input.birthDate.year}-${input.birthDate.month}-${input.birthDate.day}`,
    })
  } else if (input.birthDate.year < MIN_YEAR || input.birthDate.year > MAX_YEAR) {
    issues.push({ code: 'date-out-of-range', detail: String(input.birthDate.year) })
  }

  if (!isValidBirthDate(input.referenceDate)) {
    issues.push({
      code: 'reference-date-invalid',
      detail: `${input.referenceDate.year}-${input.referenceDate.month}-${input.referenceDate.day}`,
    })
  }

  const nameAnalysis = analyseName(input.fullBirthName, options.vowelPolicy)
  if (nameAnalysis.words.length === 0 || nameAnalysis.words.every((word) => word.letters.length === 0)) {
    issues.push({ code: 'name-empty' })
  }
  if (nameAnalysis.unsupported.length > 0) {
    issues.push({
      code: 'name-unsupported-characters',
      detail: nameAnalysis.unsupported.map((entry) => `${entry.character} (${entry.codePoint})`).join(', '),
    })
  }

  if (issues.length > 0) {
    return { ok: false, issues }
  }

  const { birthDate, referenceDate } = input
  const keepMasters = options.keepMasterNumbers

  const lifePath = lifePathNumber(birthDate, options.lifePathMethod, keepMasters)
  const expression = expressionNumber(nameAnalysis, options.nameSumMethod, keepMasters)
  const soulUrge = soulUrgeNumber(nameAnalysis, options.nameSumMethod, keepMasters)
  const personality = personalityNumber(nameAnalysis, options.nameSumMethod, keepMasters)
  const birthday = birthdayNumber(birthDate, keepMasters)
  const maturity = maturityNumber(lifePath.value, expression.value, keepMasters)
  const personalYear = personalYearNumber(birthDate, referenceDate.year)
  const personalMonth = personalMonthNumber(personalYear.value, referenceDate.month)
  const personalDay = personalDayNumber(personalMonth.value, referenceDate.day)

  if (nameAnalysis.transformations.length > 0) {
    warnings.push({
      code: 'name-normalised',
      detail: `normalised: ${nameAnalysis.transformations.map((t) => `${t.from}->${t.to || '∅'}`).join(', ')}`,
    })
  }

  return {
    ok: true,
    warnings,
    value: {
      options,
      nameAnalysis,
      birthDate,
      referenceDate,
      lifePath,
      expression,
      soulUrge,
      personality,
      birthday,
      maturity,
      personalYear,
      personalMonth,
      personalDay,
      pinnacles: pinnacles(birthDate, lifePath.value, keepMasters),
      challenges: challenges(birthDate),
    },
  }
}
