import { describe, expect, it } from 'vitest'
import { ascendant, localSiderealTime, midheaven } from '../angles.ts'
import { normaliseDegrees, trueObliquity } from '../ephemeris.ts'
import { placidusCusps } from '../houses.ts'
import reference from './fixtures/placidus-reference.json' with { type: 'json' }

/**
 * Placidus against a fully independent implementation.
 *
 * The expected cusps were produced by the Swiss Ephemeris implementation of
 * the Placidus construction — a different codebase, by different authors,
 * using a different ephemeris — and committed under fixtures/. Swiss Ephemeris
 * is deliberately not a dependency of SYDERA; only its numeric output is
 * recorded here. See scripts/generate-placidus-reference.mjs for provenance.
 *
 * This complements, and does not replace, the definitional test in
 * houses.test.ts: that one proves each cusp divides its own semi-arc
 * correctly, this one proves SYDERA reaches the same cusps as an unrelated
 * implementation of the same system.
 *
 * Tolerance fixed before implementation: Placidus cusps <= 2 arcminutes.
 */
const ARCMINUTE = 1 / 60

interface ReferenceChart {
  id: string
  label: string
  utc: string
  latitude: number
  longitude: number
  cusps: number[]
  ascendant: number
  midheaven: number
}

const charts = reference.charts as ReferenceChart[]

function separationDegrees(a: number, b: number): number {
  let delta = Math.abs(normaliseDegrees(a) - normaliseDegrees(b))
  if (delta > 180) delta = 360 - delta
  return delta
}

describe('Placidus against Swiss Ephemeris', () => {
  const perChart: Array<{ id: string; worstArcminutes: number }> = []

  for (const chart of charts) {
    it(`${chart.id} (${chart.label}) matches within 2'`, () => {
      const utcMs = Date.parse(chart.utc)
      const lst = localSiderealTime(utcMs, chart.longitude)
      const obliquity = trueObliquity(utcMs)
      const houses = placidusCusps(lst, chart.latitude, obliquity)

      expect(houses, `${chart.id} must be calculable`).not.toBeNull()
      if (!houses) return

      let worst = 0
      const rows: string[] = []
      for (let index = 0; index < 12; index += 1) {
        const mine = houses.cusps[index] as number
        const theirs = chart.cusps[index] as number
        const deviation = separationDegrees(mine, theirs)
        worst = Math.max(worst, deviation)
        rows.push(`cusp ${index + 1}: SYDERA ${mine.toFixed(5)}° vs Swiss ${theirs.toFixed(5)}° = ${(deviation * 60).toFixed(4)}'`)
      }
      perChart.push({ id: chart.id, worstArcminutes: worst * 60 })

      expect(worst, `${chart.id}\n  ${rows.join('\n  ')}`).toBeLessThanOrEqual(2 * ARCMINUTE)
    })

    it(`${chart.id}: the angles match too`, () => {
      const utcMs = Date.parse(chart.utc)
      const lst = localSiderealTime(utcMs, chart.longitude)
      const obliquity = trueObliquity(utcMs)

      const ascDeviation = separationDegrees(ascendant(lst, chart.latitude, obliquity), chart.ascendant)
      const mcDeviation = separationDegrees(midheaven(lst, obliquity), chart.midheaven)

      expect(ascDeviation, `${chart.id} Ascendant`).toBeLessThanOrEqual(ARCMINUTE)
      expect(mcDeviation, `${chart.id} Midheaven`).toBeLessThanOrEqual(ARCMINUTE)
    })
  }

  it('reports the observed maximum deviation per chart', () => {
    const summary = perChart.map((entry) => `${entry.id}=${entry.worstArcminutes.toFixed(4)}'`).join(' ')
    console.log(`    max Placidus deviation vs Swiss Ephemeris: ${summary}`)
    const overall = Math.max(...perChart.map((entry) => entry.worstArcminutes))
    console.log(`    overall maximum: ${overall.toFixed(4)}'`)
    expect(perChart).toHaveLength(charts.length)
  })

  it('covers the latitudes the audit asked for', () => {
    const labels = charts.map((chart) => chart.label).join(' | ')
    expect(labels).toContain('European latitude')
    expect(labels).toContain('Southern hemisphere')
    expect(labels).toContain('Near the high-latitude boundary')
    // Both signs of the practical limit are exercised.
    expect(charts.some((chart) => chart.latitude > 64)).toBe(true)
    expect(charts.some((chart) => chart.latitude < -64)).toBe(true)
  })
})
