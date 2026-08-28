import { EquatorFromVector, MakeTime, RotateVector, Rotation_ECT_EQJ, Rotation_EQJ_EQD, Vector } from 'astronomy-engine'
import { describe, expect, it } from 'vitest'
import { ascendant, localSiderealTime, midheaven } from '../angles.ts'
import { normaliseDegrees, trueObliquity } from '../ephemeris.ts'
import { calculateHouses, equalCusps, houseOf, isPlacidusCalculable, placidusCusps, wholeSignCusps } from '../houses.ts'
import reference from './fixtures/horizons-raw.json' with { type: 'json' }

/**
 * Whole Sign and Equal are exact by construction and are checked against their
 * definitions. Placidus is checked against *its* definition — each intermediate
 * cusp divides the semi-arc of its own ecliptic degree in the prescribed ratio
 * — with the right ascension and declination of that degree obtained through
 * the library's rotation matrices, a different code path from the solver.
 *
 * Tolerance fixed before implementation: Placidus cusps <= 2 arcminutes.
 */
const ARCMINUTE = 1 / 60
const DEG = Math.PI / 180

interface SiteRow {
  instant: string
  site: string
  longitude: number
  latitude: number
}
const siteRows = reference.siteRows as SiteRow[]

/** Equatorial coordinates of an ecliptic degree, through an independent transform. */
function equatorialOfEclipticDegree(utcMs: number, longitudeDegrees: number): { ra: number; dec: number } {
  const time = MakeTime(new Date(utcMs))
  const lon = longitudeDegrees * DEG
  const ect = new Vector(Math.cos(lon), Math.sin(lon), 0, time)
  const eqd = RotateVector(Rotation_EQJ_EQD(time), RotateVector(Rotation_ECT_EQJ(time), ect))
  const equatorial = EquatorFromVector(eqd)
  return { ra: equatorial.ra * 15, dec: equatorial.dec }
}

describe('whole sign houses', () => {
  it('starts the first house at the beginning of the Ascendant sign', () => {
    const houses = wholeSignCusps(103.7, 15.2)
    expect(houses.cusps[0]).toBe(90)
    expect(houses.cusps[1]).toBe(120)
    expect(houses.cusps[11]).toBe(60)
    expect(houses.ascendant).toBe(103.7)
  })

  it('always produces twelve cusps exactly 30 degrees apart', () => {
    for (const asc of [0, 29.99, 30, 187.5, 359.9]) {
      const houses = wholeSignCusps(asc, 0)
      expect(houses.cusps).toHaveLength(12)
      for (let index = 0; index < 12; index += 1) {
        const gap = normaliseDegrees((houses.cusps[(index + 1) % 12] as number) - (houses.cusps[index] as number))
        expect(gap).toBeCloseTo(30, 9)
      }
    }
  })

  it('is defined at every latitude, including the poles', () => {
    for (const latitude of [-89, -66.6, 0, 41.9, 66.6, 89]) {
      const outcome = calculateHouses({
        utcMs: Date.parse('1984-01-19T06:30:00Z'),
        latitude,
        longitude: 12.5,
        system: 'whole-sign',
      })
      expect(outcome.ok, `latitude ${latitude}`).toBe(true)
    }
  })
})

describe('equal houses', () => {
  it('starts the first house exactly at the Ascendant', () => {
    const houses = equalCusps(103.7, 15.2)
    expect(houses.cusps[0]).toBeCloseTo(103.7, 9)
    expect(houses.cusps[3]).toBeCloseTo(193.7, 9)
    expect(houses.cusps[6]).toBeCloseTo(283.7, 9)
  })
})

describe('placidus houses, verified against their definition', () => {
  const deviations: number[] = []

  for (const row of siteRows.filter((entry) => isPlacidusCalculable(entry.latitude))) {
    it(`${row.site} at ${row.instant}: each cusp divides its own semi-arc correctly`, () => {
      const utcMs = Date.parse(row.instant)
      const lst = localSiderealTime(utcMs, row.longitude)
      const obliquity = trueObliquity(utcMs)
      const houses = placidusCusps(lst, row.latitude, obliquity)
      expect(houses, `${row.site} should be calculable`).not.toBeNull()
      if (!houses) return

      const ramc = normaliseDegrees(lst * 15)
      // House 11 sits one third of its semi-diurnal arc east of the meridian,
      // house 12 two thirds; houses 2 and 3 divide the nocturnal arc likewise.
      const checks: Array<{ house: number; fraction: number; nocturnal: boolean }> = [
        { house: 11, fraction: 1 / 3, nocturnal: false },
        { house: 12, fraction: 2 / 3, nocturnal: false },
        { house: 2, fraction: 1 / 3, nocturnal: true },
        { house: 3, fraction: 2 / 3, nocturnal: true },
      ]

      for (const check of checks) {
        const cusp = houses.cusps[check.house - 1] as number
        const { ra, dec } = equatorialOfEclipticDegree(utcMs, cusp)
        // Eastward offset from the meridian, the same convention the solver uses.
        let eastwardOffset = normaliseDegrees(ra - ramc)
        if (eastwardOffset > 180) eastwardOffset -= 360

        const cosArg = -Math.tan(row.latitude * DEG) * Math.tan(dec * DEG)
        expect(Math.abs(cosArg), `${row.site} house ${check.house}: degree never rises`).toBeLessThan(1)
        const semiArc = (Math.acos(cosArg) / DEG)
        const expected = check.nocturnal
          ? semiArc + check.fraction * (180 - semiArc)
          : check.fraction * semiArc

        const deviationDegrees = Math.abs(eastwardOffset - expected)
        deviations.push(deviationDegrees)
        expect(
          deviationDegrees,
          `${row.site} ${row.instant} house ${check.house}: offset ${eastwardOffset.toFixed(5)}° vs required ${expected.toFixed(5)}°`,
        ).toBeLessThanOrEqual(2 * ARCMINUTE)
      }

      // Structural check alongside the definitional one: a cusp can satisfy the
      // semi-arc ratio on the wrong side of the meridian, so the intermediate
      // cusps must also fall between the Midheaven and the Ascendant in
      // zodiacal order.
      const fromMc = (value: number): number => normaliseDegrees(value - houses.midheaven)
      expect(fromMc(houses.cusps[10] as number), 'house 11 after the MC').toBeGreaterThan(0)
      expect(fromMc(houses.cusps[11] as number), 'house 12 after house 11').toBeGreaterThan(
        fromMc(houses.cusps[10] as number),
      )
      expect(fromMc(houses.ascendant), 'Ascendant after house 12').toBeGreaterThan(fromMc(houses.cusps[11] as number))
    })
  }

  it('reports the observed maximum deviation', () => {
    console.log(`    max Placidus cusp deviation from its definition: ${(Math.max(...deviations) * 60).toFixed(4)}'`)
    expect(deviations.length).toBeGreaterThan(0)
  })

  it('keeps the angles as the first and tenth cusps', () => {
    const utcMs = Date.parse('1984-01-19T06:30:00Z')
    const lst = localSiderealTime(utcMs, 12.4964)
    const obliquity = trueObliquity(utcMs)
    const houses = placidusCusps(lst, 41.9028, obliquity)
    expect(houses).not.toBeNull()
    if (!houses) return
    expect(houses.cusps[0]).toBeCloseTo(ascendant(lst, 41.9028, obliquity), 9)
    expect(houses.cusps[9]).toBeCloseTo(midheaven(lst, obliquity), 9)
  })

  it('produces cusps in increasing zodiacal order', () => {
    const utcMs = Date.parse('2026-08-28T00:00:00Z')
    const lst = localSiderealTime(utcMs, 12.4964)
    const houses = placidusCusps(lst, 41.9028, trueObliquity(utcMs))
    expect(houses).not.toBeNull()
    if (!houses) return
    let total = 0
    for (let index = 0; index < 12; index += 1) {
      const span = normaliseDegrees((houses.cusps[(index + 1) % 12] as number) - (houses.cusps[index] as number))
      expect(span, `house ${index + 1} span`).toBeGreaterThan(0)
      total += span
    }
    expect(total).toBeCloseTo(360, 6)
  })

  it('places opposite cusps exactly 180 degrees apart', () => {
    const utcMs = Date.parse('1955-11-05T22:04:00Z')
    const lst = localSiderealTime(utcMs, 151.2093)
    const houses = placidusCusps(lst, -33.8688, trueObliquity(utcMs))
    expect(houses).not.toBeNull()
    if (!houses) return
    for (let index = 0; index < 6; index += 1) {
      const opposite = normaliseDegrees((houses.cusps[index + 6] as number) - (houses.cusps[index] as number))
      expect(opposite).toBeCloseTo(180, 6)
    }
  })
})

describe('placidus refusal above the polar circle', () => {
  it('refuses instead of fabricating cusps at 69.6 N', () => {
    const outcome = calculateHouses({
      utcMs: Date.parse('1984-01-19T06:30:00Z'),
      latitude: 69.6492,
      longitude: 18.9553,
      system: 'placidus',
    })
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.refusal.system).toBe('placidus')
    expect(outcome.refusal.reason).toBe('latitude-out-of-range')
    expect(outcome.refusal.alternatives).toEqual(['whole-sign', 'equal'])
  })

  it('refuses in the southern polar region too', () => {
    const outcome = calculateHouses({
      utcMs: Date.parse('2000-01-01T12:00:00Z'),
      latitude: -70.1,
      longitude: 0,
      system: 'placidus',
    })
    expect(outcome.ok).toBe(false)
  })

  it('still calculates just inside the limit', () => {
    expect(isPlacidusCalculable(65.9)).toBe(true)
    expect(isPlacidusCalculable(-65.9)).toBe(true)
    expect(isPlacidusCalculable(66.1)).toBe(false)
  })

  it('never silently substitutes another system', () => {
    const outcome = calculateHouses({
      utcMs: Date.parse('1984-01-19T06:30:00Z'),
      latitude: 69.6492,
      longitude: 18.9553,
      system: 'placidus',
    })
    // The refusal carries no cusps at all: the caller must ask again.
    expect(outcome.ok).toBe(false)
    expect(outcome).not.toHaveProperty('houses')
  })
})

describe('house lookup', () => {
  it('assigns a longitude to the right whole sign house', () => {
    const houses = wholeSignCusps(103.7, 15.2)
    expect(houseOf(95, houses)).toBe(1)
    expect(houseOf(125, houses)).toBe(2)
    expect(houseOf(89, houses)).toBe(12)
  })

  it('assigns a longitude to the right placidus house', () => {
    const utcMs = Date.parse('1984-01-19T06:30:00Z')
    const lst = localSiderealTime(utcMs, 12.4964)
    const houses = placidusCusps(lst, 41.9028, trueObliquity(utcMs))
    expect(houses).not.toBeNull()
    if (!houses) return
    for (let index = 0; index < 12; index += 1) {
      const start = houses.cusps[index] as number
      const end = houses.cusps[(index + 1) % 12] as number
      const middle = normaliseDegrees(start + normaliseDegrees(end - start) / 2)
      expect(houseOf(middle, houses), `middle of house ${index + 1}`).toBe(index + 1)
    }
  })
})

describe('determinism', () => {
  it('returns identical cusps for identical input', () => {
    const request = {
      utcMs: Date.parse('1984-01-19T06:30:00Z'),
      latitude: 41.9028,
      longitude: 12.4964,
      system: 'placidus' as const,
    }
    expect(calculateHouses(request)).toEqual(calculateHouses(request))
  })
})
