import { describe, expect, it } from 'vitest'
import { calculateChart, type ChartRequest } from '../chart.ts'

/** Synthetic technical input. No real person's birth data. */
const ROME = { latitude: 41.9028, longitude: 12.4964, label: 'Luogo di prova' }

const BASE: ChartRequest = {
  birthDate: { year: 1984, month: 1, day: 19 },
  birthTime: { hour: 7, minute: 30 },
  birthTimePrecisionMinutes: 1,
  place: ROME,
  zoneId: 'Europe/Rome',
  houseSystem: 'whole-sign',
}

function chartOf(overrides: Partial<ChartRequest> = {}) {
  const outcome = calculateChart({ ...BASE, ...overrides })
  if (!outcome.ok) throw new Error(`unexpected refusal: ${JSON.stringify(outcome.issue)}`)
  return outcome.chart
}

describe('complete chart', () => {
  it('produces all ten bodies with signs and houses', () => {
    const chart = chartOf()
    expect(chart.kind).toBe('complete')
    if (chart.kind !== 'complete') return
    expect(chart.positions).toHaveLength(10)
    for (const position of chart.positions) {
      expect(position.longitude).toBeGreaterThanOrEqual(0)
      expect(position.longitude).toBeLessThan(360)
      expect(position.house).toBeGreaterThanOrEqual(1)
      expect(position.house).toBeLessThanOrEqual(12)
    }
  })

  it('records the UTC conversion it used', () => {
    const chart = chartOf()
    if (chart.kind !== 'complete') return
    // 07:30 local in January in Rome is 06:30 UTC.
    expect(chart.provenance.utcIso).toBe('1984-01-19T06:30:00.000Z')
    expect(chart.provenance.offsetMinutes).toBe(60)
    expect(chart.provenance.zoneId).toBe('Europe/Rome')
    expect(chart.provenance.offsetSource).toBe('iana')
    expect(chart.provenance.engine).toContain('astronomy-engine')
  })

  it('flags a pre-1970 birth as needing confirmation', () => {
    const chart = chartOf({ birthDate: { year: 1965, month: 6, day: 15 } })
    if (chart.kind !== 'complete') return
    expect(chart.provenance.caveats).toContain('pre-1970')
  })

  it('reports the Ascendant uncertainty that the birth time precision implies', () => {
    const precise = chartOf({ birthTimePrecisionMinutes: 1 })
    const rough = chartOf({ birthTimePrecisionMinutes: 30 })
    if (precise.kind !== 'complete' || rough.kind !== 'complete') return
    expect(precise.ascendantUncertaintyDegrees).toBeGreaterThan(0)
    expect(rough.ascendantUncertaintyDegrees).toBeGreaterThan(precise.ascendantUncertaintyDegrees * 5)
  })

  it('finds aspects, each within its stated allowance', () => {
    const chart = chartOf()
    if (chart.kind !== 'complete') return
    expect(chart.aspects.length).toBeGreaterThan(0)
    for (const aspect of chart.aspects) {
      expect(aspect.orb).toBeLessThanOrEqual(aspect.allowedOrb)
    }
  })

  it('is deterministic', () => {
    expect(chartOf()).toEqual(chartOf())
  })
})

describe('house system selection', () => {
  it('uses whole sign by default and reports it', () => {
    const chart = chartOf()
    if (chart.kind !== 'complete') return
    expect(chart.houses?.system).toBe('whole-sign')
    expect(chart.provenance.houseSystem).toBe('whole-sign')
  })

  it('calculates placidus when asked and possible', () => {
    const chart = chartOf({ houseSystem: 'placidus' })
    if (chart.kind !== 'complete') return
    expect(chart.houses?.system).toBe('placidus')
    expect(chart.houseRefusal).toBeNull()
  })

  it('refuses placidus above the polar circle without substituting another system', () => {
    const chart = chartOf({
      houseSystem: 'placidus',
      place: { latitude: 69.6492, longitude: 18.9553, label: 'Luogo polare di prova' },
      zoneId: 'Europe/Oslo',
    })
    if (chart.kind !== 'complete') return
    expect(chart.houses).toBeNull()
    expect(chart.houseRefusal?.system).toBe('placidus')
    expect(chart.houseRefusal?.alternatives).toEqual(['whole-sign', 'equal'])
    // Positions remain, but no body claims a house.
    expect(chart.positions.every((position) => position.house === null)).toBe(true)
  })
})

describe('unknown birth time', () => {
  const chart = chartOf({ birthTime: null })

  it('never invents a time and returns a partial chart', () => {
    expect(chart.kind).toBe('partial-no-time')
  })

  it('withholds the angles, the houses and the aspects', () => {
    if (chart.kind !== 'partial-no-time') return
    expect(chart.unavailable).toEqual(['ascendente', 'medio-cielo', 'case', 'aspetti'])
    expect(chart).not.toHaveProperty('houses')
    expect(chart).not.toHaveProperty('aspects')
  })

  it('keeps the slow bodies, whose sign a whole day cannot change', () => {
    if (chart.kind !== 'partial-no-time') return
    const saturn = chart.positions.find((position) => position.body === 'saturn')
    expect(saturn?.sign).not.toBeNull()
    expect(saturn?.rangeDegrees).toBeLessThan(0.5)
  })

  it('reports the Moon as a range, because it moves through a whole day', () => {
    if (chart.kind !== 'partial-no-time') return
    const moon = chart.positions.find((position) => position.body === 'moon')
    expect(moon?.rangeDegrees).toBeGreaterThan(11)
    expect(moon?.rangeDegrees).toBeLessThan(16)
  })

  it('states the sign only when the body stays inside it all day', () => {
    if (chart.kind !== 'partial-no-time') return
    for (const position of chart.positions) {
      if (position.sign === null) {
        expect(position.rangeDegrees).toBeGreaterThan(0)
      }
    }
  })
})

describe('refusals', () => {
  it('refuses an impossible date', () => {
    const outcome = calculateChart({ ...BASE, birthDate: { year: 2023, month: 2, day: 29 } })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issue.code).toBe('invalid-date')
  })

  it('refuses to place a timed chart without a location', () => {
    const outcome = calculateChart({ ...BASE, place: null })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issue.code).toBe('missing-place')
  })

  it('refuses an unknown time zone rather than assuming one', () => {
    const outcome = calculateChart({ ...BASE, zoneId: 'Europe/Atlantis' })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issue.code).toBe('invalid-zone')
  })

  it('asks the user to choose when the local time occurred twice', () => {
    const outcome = calculateChart({
      ...BASE,
      birthDate: { year: 2024, month: 10, day: 27 },
      birthTime: { hour: 2, minute: 30 },
    })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issue.code).toBe('ambiguous-local-time')
    expect(outcome.issue.options).toHaveLength(2)
    expect(outcome.issue.options?.[0]?.offsetMinutes).toBe(120)
    expect(outcome.issue.options?.[1]?.offsetMinutes).toBe(60)
  })

  it('reports a local time that never existed', () => {
    const outcome = calculateChart({
      ...BASE,
      birthDate: { year: 2024, month: 3, day: 31 },
      birthTime: { hour: 2, minute: 30 },
    })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.issue.code).toBe('nonexistent-local-time')
    expect(outcome.issue.detail).toBe('60')
  })

  it('accepts a manual offset override and records it', () => {
    const chart = chartOf({
      birthDate: { year: 2024, month: 10, day: 27 },
      birthTime: { hour: 2, minute: 30 },
      offsetOverrideMinutes: 120,
    })
    if (chart.kind !== 'complete') return
    expect(chart.provenance.offsetSource).toBe('manual')
    expect(chart.provenance.offsetMinutes).toBe(120)
    expect(chart.provenance.caveats).toContain('manual-override')
  })
})
