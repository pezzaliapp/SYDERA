import { describe, expect, it } from 'vitest'
import { computeNumerologyProfile, type NumerologyInput } from '../profile.ts'

/** Synthetic technical fixture — not a real person's data. */
const INPUT: NumerologyInput = {
  fullBirthName: 'TEST TESTSSON',
  birthDate: { year: 1984, month: 1, day: 19 },
  referenceDate: { year: 2020, month: 7, day: 15 },
}

function profileOf(overrides: Partial<NumerologyInput> = {}) {
  const outcome = computeNumerologyProfile({ ...INPUT, ...overrides })
  if (!outcome.ok) throw new Error(`unexpected failure: ${JSON.stringify(outcome.issues)}`)
  return outcome
}

describe('computeNumerologyProfile', () => {
  it('computes the full core profile', () => {
    const { value } = profileOf()
    expect(value.lifePath.value).toBe(6)
    expect(value.expression.value).toBe(33)
    expect(value.soulUrge.value).toBe(7)
    expect(value.personality.value).toBe(8)
    expect(value.birthday.value).toBe(1)
    expect(value.maturity.value).toBe(3)
  })

  it('computes the personal cycles from the supplied reference date', () => {
    const { value } = profileOf()
    expect(value.personalYear.value).toBe(6)
    expect(value.personalMonth.value).toBe(4)
    expect(value.personalDay.value).toBe(1)
  })

  it('computes pinnacles and challenges', () => {
    const { value } = profileOf()
    expect(value.pinnacles.map((pinnacle) => pinnacle.value)).toEqual([2, 5, 7, 5])
    expect(value.challenges.map((challenge) => challenge.value)).toEqual([0, 3, 3, 3])
  })

  it('keeps the options actually used in the result', () => {
    const { value } = profileOf()
    expect(value.options).toEqual({
      keepMasterNumbers: true,
      vowelPolicy: 'contextual',
      nameSumMethod: 'total',
      lifePathMethod: 'component',
    })
  })

  it('honours option overrides', () => {
    const { value } = profileOf({ options: { keepMasterNumbers: false, lifePathMethod: 'digit-sum' } })
    expect(value.expression.value).toBe(6)
    expect(value.lifePath.value).toBe(6)
    expect(value.options.keepMasterNumbers).toBe(false)
  })

  it('is deterministic', () => {
    expect(profileOf()).toEqual(profileOf())
  })

  it('never depends on the current date', () => {
    const a = profileOf({ referenceDate: { year: 2020, month: 7, day: 15 } })
    const b = profileOf({ referenceDate: { year: 2026, month: 1, day: 1 } })
    expect(a.value.lifePath).toEqual(b.value.lifePath)
    expect(a.value.personalYear.value).not.toBe(b.value.personalYear.value)
  })

  it('reports the name normalisation as a warning without failing', () => {
    const outcome = profileOf({ fullBirthName: 'TÉST TESTSSON' })
    expect(outcome.value.expression.value).toBe(33)
    expect(outcome.warnings.map((warning) => warning.code)).toEqual(['name-normalised'])
  })
})

describe('validation failures', () => {
  it('refuses an impossible birth date', () => {
    const outcome = computeNumerologyProfile({ ...INPUT, birthDate: { year: 2023, month: 2, day: 29 } })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issues.map((issue) => issue.code)).toContain('date-invalid')
  })

  it('refuses a year outside the supported range', () => {
    const outcome = computeNumerologyProfile({ ...INPUT, birthDate: { year: 999, month: 1, day: 1 } })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issues.map((issue) => issue.code)).toContain('date-out-of-range')
  })

  it('refuses an empty name instead of inventing a result', () => {
    const outcome = computeNumerologyProfile({ ...INPUT, fullBirthName: '   ' })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issues.map((issue) => issue.code)).toContain('name-empty')
  })

  it('refuses a name containing characters outside the Pythagorean mapping', () => {
    const outcome = computeNumerologyProfile({ ...INPUT, fullBirthName: 'ΑΛΕΞ TEST' })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    const issue = outcome.issues.find((entry) => entry.code === 'name-unsupported-characters')
    expect(issue?.detail).toContain('U+0391')
  })

  it('refuses an invalid reference date', () => {
    const outcome = computeNumerologyProfile({ ...INPUT, referenceDate: { year: 2020, month: 13, day: 1 } })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issues.map((issue) => issue.code)).toContain('reference-date-invalid')
  })
})
