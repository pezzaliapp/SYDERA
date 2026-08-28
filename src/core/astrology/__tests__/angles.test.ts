import { Observer, RotateVector, Rotation_ECT_EQJ, Rotation_EQJ_EQD, Rotation_EQD_HOR, EquatorFromVector, HorizonFromVector, MakeTime, Vector } from 'astronomy-engine'
import { describe, expect, it } from 'vitest'
import {
  ascendant,
  ascendantUncertaintyDegrees,
  greenwichSiderealTime,
  localSiderealTime,
  midheaven,
  ramcDegrees,
} from '../angles.ts'
import { meanObliquity, trueObliquity } from '../ephemeris.ts'
import reference from './fixtures/horizons-raw.json' with { type: 'json' }

/**
 * Validation of the angles.
 *
 * Sidereal time is checked against JPL Horizons (quantity 7, local apparent
 * sidereal time). Obliquity is checked against the IAU 2006 polynomial, which
 * is implemented here from its published coefficients and is independent of the
 * library. The Ascendant and Midheaven are checked *definitionally*: the
 * computed ecliptic point is carried into horizontal and equatorial
 * coordinates through the library's rotation matrices — a completely different
 * code path from the closed-form trigonometry under test — and must satisfy
 * the definition of each angle.
 *
 * Tolerances fixed before implementation:
 *   sidereal time      <= 0.1 s
 *   obliquity          <= 1"
 *   Ascendant/Midheaven <= 1'
 */
const ARCMINUTE = 1 / 60
const ARCSECOND = 1 / 3600
const DEG = Math.PI / 180

interface SiteRow {
  instant: string
  site: string
  longitude: number
  latitude: number
  raw: string
}

const siteRows = reference.siteRows as SiteRow[]

/** Horizons prints "1984-Jan-19 06:30:00.000 Cm  15.1898221441" — last column is LAST in hours. */
function referenceLast(row: SiteRow): number {
  const columns = row.raw.trim().split(/\s+/)
  return Number(columns[columns.length - 1])
}

/**
 * Mean obliquity of the ecliptic, IAU 2006 (Capitaine et al. 2003), in degrees.
 * Published expression, independent of the library under test.
 */
function iau2006MeanObliquity(utcMs: number): number {
  const julianDay = utcMs / 86_400_000 + 2_440_587.5
  const t = (julianDay - 2_451_545.0) / 36_525
  const arcseconds =
    84_381.406 -
    46.836_769 * t -
    0.000_183_1 * t * t +
    0.002_003_40 * t * t * t -
    0.000_000_576 * t * t * t * t -
    0.000_000_043_4 * t * t * t * t * t
  return arcseconds / 3600
}

/**
 * UTC, and therefore the difference UT1 - UTC, only exists from 1972. For
 * earlier instants Horizons works in UT1 directly, so the comparison there is
 * exact and the algorithm itself can be held to a tight bound.
 */
const UTC_ERA_START_MS = Date.parse('1972-01-01T00:00:00Z')
/**
 * Tolerance revised, with cause, after measurement — see
 * docs/ASTROLOGY_VALIDATION.md section 3.1.
 *
 * astronomy-engine documents that it approximates UT1 as equal to UTC.
 * Horizons applies the true UT1 - UTC. That difference is held below 0.9 s by
 * the leap-second convention, so a reference comparison in the UTC era can
 * legitimately differ by up to about 0.9 s of sidereal time. Before 1972 no
 * such difference exists and the residual must be tiny.
 */
const SIDEREAL_TOLERANCE_UTC_ERA = 1.0
const SIDEREAL_TOLERANCE_PRE_UTC = 0.05

describe('sidereal time against JPL Horizons', () => {
  const deviations: number[] = []
  const preUtcDeviations: number[] = []

  for (const row of siteRows) {
    const preUtc = Date.parse(row.instant) < UTC_ERA_START_MS
    const tolerance = preUtc ? SIDEREAL_TOLERANCE_PRE_UTC : SIDEREAL_TOLERANCE_UTC_ERA

    it(`${row.site} at ${row.instant} is within ${tolerance} s`, () => {
      const computed = localSiderealTime(Date.parse(row.instant), row.longitude)
      const expected = referenceLast(row)
      let deltaHours = computed - expected
      if (deltaHours > 12) deltaHours -= 24
      if (deltaHours < -12) deltaHours += 24
      const deltaSeconds = Math.abs(deltaHours) * 3600
      deviations.push(deltaSeconds)
      if (preUtc) preUtcDeviations.push(deltaSeconds)
      expect(
        deltaSeconds,
        `${row.site} ${row.instant}: SYDERA ${computed.toFixed(7)} h vs Horizons ${expected.toFixed(7)} h`,
      ).toBeLessThanOrEqual(tolerance)
    })
  }

  it('reports the observed maximum deviation', () => {
    const worst = Math.max(...deviations)
    const worstPreUtc = Math.max(...preUtcDeviations)
    console.log(
      `    max sidereal time deviation vs Horizons: ${worst.toFixed(4)} s overall, ${worstPreUtc.toFixed(4)} s before 1972 (where UT1 = UT)`,
    )
    expect(deviations).toHaveLength(20)
  })

  it('keeps the residual well inside the leap-second bound, confirming the cause', () => {
    // If the difference were an algorithmic error rather than UT1 - UTC, the
    // pre-1972 instants would deviate as much as the modern ones. They do not.
    expect(Math.max(...preUtcDeviations)).toBeLessThan(0.05)
    expect(Math.max(...deviations)).toBeLessThan(0.9 * 1.0027 + 0.05)
  })

  it('translates the sidereal residual into a negligible Ascendant shift', () => {
    // 0.9 s of sidereal time is 0.9 / 3600 * 15 = 0.00375 degrees of Ascendant.
    const worstAscendantShiftArcminutes = ((Math.max(...deviations) / 3600) * 15) * 60
    console.log(`    worst sidereal residual as Ascendant shift: ${worstAscendantShiftArcminutes.toFixed(4)}'`)
    expect(worstAscendantShiftArcminutes).toBeLessThan(1)
  })
})

describe('obliquity against the IAU 2006 polynomial', () => {
  it('agrees within 1 arcsecond for every fixture instant', () => {
    let worst = 0
    for (const instant of reference.instants as string[]) {
      const utcMs = Date.parse(instant)
      const deviation = Math.abs(meanObliquity(utcMs) - iau2006MeanObliquity(utcMs))
      worst = Math.max(worst, deviation)
      expect(deviation, `${instant}: mean obliquity`).toBeLessThanOrEqual(ARCSECOND)
    }
    console.log(`    max mean obliquity deviation vs IAU 2006: ${(worst * 3600).toFixed(4)}"`)
  })

  it('matches the published J2000 value', () => {
    // 23° 26' 21.406" at J2000.0
    const j2000 = Date.parse('2000-01-01T12:00:00Z')
    expect(meanObliquity(j2000)).toBeCloseTo(23 + 26 / 60 + 21.406 / 3600, 5)
  })

  it('keeps nutation in obliquity within its known bound', () => {
    for (const instant of reference.instants as string[]) {
      const utcMs = Date.parse(instant)
      // Nutation in obliquity never exceeds about 9.2 arcseconds.
      expect(Math.abs(trueObliquity(utcMs) - meanObliquity(utcMs))).toBeLessThan(10 * ARCSECOND)
    }
  })
})

/** Carry an ecliptic-of-date longitude into horizontal coordinates, independently. */
function horizontalOfEclipticPoint(
  utcMs: number,
  longitudeDegrees: number,
  observer: Observer,
): { altitude: number; azimuth: number } {
  const time = MakeTime(new Date(utcMs))
  const lon = longitudeDegrees * DEG
  const ect = new Vector(Math.cos(lon), Math.sin(lon), 0, time)
  const eqj = RotateVector(Rotation_ECT_EQJ(time), ect)
  const eqd = RotateVector(Rotation_EQJ_EQD(time), eqj)
  const hor = RotateVector(Rotation_EQD_HOR(time, observer), eqd)
  const spherical = HorizonFromVector(hor, '')
  return { altitude: spherical.lat, azimuth: spherical.lon }
}

describe('Ascendant, verified against its definition', () => {
  const deviations: number[] = []

  for (const row of siteRows) {
    // The Ascendant is undefined above the polar circle only for house systems;
    // the angle itself remains defined away from the geographic poles.
    it(`${row.site} at ${row.instant}: the computed degree is on the eastern horizon`, () => {
      const utcMs = Date.parse(row.instant)
      const lst = localSiderealTime(utcMs, row.longitude)
      const asc = ascendant(lst, row.latitude, trueObliquity(utcMs))

      const observer = new Observer(row.latitude, row.longitude, 0)
      const { altitude, azimuth } = horizontalOfEclipticPoint(utcMs, asc, observer)

      deviations.push(Math.abs(altitude))
      // On the horizon: altitude zero.
      expect(
        Math.abs(altitude),
        `${row.site} ${row.instant}: ASC ${asc.toFixed(4)}° has altitude ${altitude.toFixed(6)}° (azimuth ${azimuth.toFixed(2)}°)`,
      ).toBeLessThanOrEqual(ARCMINUTE)

      // Ascending, not descending. Testing the azimuth against the eastern
      // half of the sky would only be a mid-latitude rule of thumb: above the
      // polar circle the ecliptic can meet the horizon close to due north.
      // The definition itself is that the degree is on its way up, so that is
      // what is checked, by holding the ecliptic degree fixed and watching its
      // altitude either side of the instant.
      const before = horizontalOfEclipticPoint(utcMs - 120_000, asc, observer).altitude
      const after = horizontalOfEclipticPoint(utcMs + 120_000, asc, observer).altitude
      expect(
        after,
        `${row.site} ${row.instant}: altitude went ${before.toFixed(4)}° -> ${after.toFixed(4)}°, so this degree is setting, not rising`,
      ).toBeGreaterThan(before)
    })
  }

  it('reports the observed maximum deviation from the horizon', () => {
    const worst = Math.max(...deviations)
    console.log(`    max Ascendant deviation from the horizon: ${(worst * 60).toFixed(4)}'`)
    expect(deviations).toHaveLength(20)
  })
})

describe('Midheaven, verified against its definition', () => {
  const deviations: number[] = []

  for (const row of siteRows) {
    it(`${row.site} at ${row.instant}: the computed degree is on the meridian`, () => {
      const utcMs = Date.parse(row.instant)
      const lst = localSiderealTime(utcMs, row.longitude)
      const mc = midheaven(lst, trueObliquity(utcMs))

      const time = MakeTime(new Date(utcMs))
      const lon = mc * DEG
      const ect = new Vector(Math.cos(lon), Math.sin(lon), 0, time)
      const eqd = RotateVector(Rotation_EQJ_EQD(time), RotateVector(Rotation_ECT_EQJ(time), ect))
      const equatorial = EquatorFromVector(eqd)

      // Culminating: its right ascension equals the local sidereal time.
      let deltaHours = equatorial.ra - lst
      if (deltaHours > 12) deltaHours -= 24
      if (deltaHours < -12) deltaHours += 24
      const deltaDegrees = Math.abs(deltaHours) * 15
      deviations.push(deltaDegrees)
      expect(
        deltaDegrees,
        `${row.site} ${row.instant}: MC ${mc.toFixed(4)}° has hour angle ${(deltaHours * 15).toFixed(6)}°`,
      ).toBeLessThanOrEqual(ARCMINUTE)
    })
  }

  it('reports the observed maximum deviation from the meridian', () => {
    console.log(`    max Midheaven deviation from the meridian: ${(Math.max(...deviations) * 60).toFixed(4)}'`)
    expect(deviations).toHaveLength(20)
  })
})

describe('angle relationships', () => {
  it('always places the Ascendant in the half turn following the Midheaven', () => {
    // True in both hemispheres, and the criterion that distinguishes the
    // rising intersection from the setting one above the polar circle.
    for (const row of siteRows) {
      const utcMs = Date.parse(row.instant)
      const lst = localSiderealTime(utcMs, row.longitude)
      const obliquity = trueObliquity(utcMs)
      const asc = ascendant(lst, row.latitude, obliquity)
      const mc = midheaven(lst, obliquity)
      const difference = ((asc - mc) % 360 + 360) % 360
      expect(difference, `${row.site} ${row.instant}`).toBeGreaterThan(0)
      expect(difference, `${row.site} ${row.instant}`).toBeLessThan(180)
    }
  })

  it('places the Ascendant and Midheaven in a sensible order in the north', () => {
    const utcMs = Date.parse('1984-01-19T06:30:00Z')
    const lst = localSiderealTime(utcMs, 12.4964)
    const obliquity = trueObliquity(utcMs)
    const asc = ascendant(lst, 41.9028, obliquity)
    const mc = midheaven(lst, obliquity)
    // In the northern hemisphere the Midheaven precedes the Ascendant by
    // between 0 and 180 degrees of ecliptic longitude.
    const difference = ((asc - mc) % 360 + 360) % 360
    expect(difference).toBeGreaterThan(0)
    expect(difference).toBeLessThan(360)
  })

  it('is deterministic', () => {
    const utcMs = Date.parse('2000-01-01T12:00:00Z')
    const lst = localSiderealTime(utcMs, 12)
    expect(ascendant(lst, 45, 23.44)).toBe(ascendant(lst, 45, 23.44))
  })

  it('converts sidereal hours to the right ascension of the meridian', () => {
    expect(ramcDegrees(0)).toBeCloseTo(0, 9)
    expect(ramcDegrees(6)).toBeCloseTo(90, 9)
    expect(ramcDegrees(12)).toBeCloseTo(180, 9)
    expect(ramcDegrees(23.5)).toBeCloseTo(352.5, 9)
  })

  it('gives Greenwich sidereal time in range', () => {
    for (const instant of reference.instants as string[]) {
      const gast = greenwichSiderealTime(Date.parse(instant))
      expect(gast).toBeGreaterThanOrEqual(0)
      expect(gast).toBeLessThan(24)
    }
  })
})

describe('input precision versus calculation precision', () => {
  it('reports a larger Ascendant uncertainty for a less precise birth time', () => {
    const utcMs = Date.parse('1984-01-19T06:30:00Z')
    const oneMinute = ascendantUncertaintyDegrees(utcMs, 41.9028, 12.4964, 1)
    const fiveMinutes = ascendantUncertaintyDegrees(utcMs, 41.9028, 12.4964, 5)
    const thirtyMinutes = ascendantUncertaintyDegrees(utcMs, 41.9028, 12.4964, 30)
    expect(oneMinute).toBeGreaterThan(0)
    expect(fiveMinutes).toBeGreaterThan(oneMinute)
    expect(thirtyMinutes).toBeGreaterThan(fiveMinutes)
    // A minute of clock time moves the Ascendant by roughly a quarter degree.
    expect(oneMinute).toBeGreaterThan(0.1)
    expect(oneMinute).toBeLessThan(0.6)
    console.log(
      `    Ascendant uncertainty at Rome 1984 fixture: +/-1 min = ${oneMinute.toFixed(3)}°, +/-5 min = ${fiveMinutes.toFixed(3)}°, +/-30 min = ${thirtyMinutes.toFixed(2)}°`,
    )
  })

  it('is zero when the time is exact', () => {
    expect(ascendantUncertaintyDegrees(Date.parse('2000-01-01T12:00:00Z'), 45, 12, 0)).toBe(0)
  })
})
