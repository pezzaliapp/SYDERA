/**
 * Planetary positions.
 *
 * A thin adapter over astronomy-engine (MIT, no dependencies, no network),
 * which supplies apparent geocentric positions from truncated VSOP87 series
 * and NOVAS-derived models, accurate to about one arcminute.
 *
 * SYDERA converts them to the apparent ecliptic longitude of date that
 * astrology works in, and adds nothing else: no smoothing, no correction, no
 * substitution when a value is unavailable.
 */
import { Body, EclipticGeoMoon, Ecliptic, GeoVector, MakeTime, e_tilt } from 'astronomy-engine'
import { BODIES, ZODIAC_SIGNS, type BodyId, type EclipticPosition, type ZodiacSign } from './types.ts'

const ENGINE_BODY: Readonly<Record<BodyId, Body>> = {
  sun: Body.Sun,
  moon: Body.Moon,
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
  pluto: Body.Pluto,
}

export function normaliseDegrees(value: number): number {
  const wrapped = value % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

export function signOf(longitude: number): ZodiacSign {
  const index = Math.floor(normaliseDegrees(longitude) / 30)
  return ZODIAC_SIGNS[index] as ZodiacSign
}

export function degreeInSign(longitude: number): number {
  return normaliseDegrees(longitude) % 30
}

/**
 * Apparent geocentric ecliptic longitude and latitude of date.
 *
 * The Moon has its own high-accuracy routine in the library; the other bodies
 * go through the geocentric vector, corrected for aberration, rotated into the
 * true ecliptic of date.
 */
export function eclipticOfDate(body: BodyId, utcMs: number): { longitude: number; latitude: number } {
  const time = MakeTime(new Date(utcMs))

  if (body === 'moon') {
    const moon = EclipticGeoMoon(time)
    return { longitude: normaliseDegrees(moon.lon), latitude: moon.lat }
  }

  // Ecliptic() takes a J2000 mean equator vector and performs the rotation to
  // the true ecliptic of date itself; rotating beforehand would apply it twice.
  const vector = GeoVector(ENGINE_BODY[body], time, true)
  const ecliptic = Ecliptic(vector)
  return { longitude: normaliseDegrees(ecliptic.elon), latitude: ecliptic.elat }
}

/** True obliquity of the ecliptic in degrees, including nutation. */
export function trueObliquity(utcMs: number): number {
  return e_tilt(MakeTime(new Date(utcMs))).tobl
}

/** Mean obliquity of the ecliptic in degrees. */
export function meanObliquity(utcMs: number): number {
  return e_tilt(MakeTime(new Date(utcMs))).mobl
}

const MOTION_WINDOW_MS = 30 * 60 * 1000

/**
 * Apparent daily motion in longitude, from a symmetric difference over one
 * hour. Negative values are retrograde motion.
 */
export function dailyMotion(body: BodyId, utcMs: number): number {
  const before = eclipticOfDate(body, utcMs - MOTION_WINDOW_MS).longitude
  const after = eclipticOfDate(body, utcMs + MOTION_WINDOW_MS).longitude
  let delta = after - before
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta * 24
}

export function positionOf(body: BodyId, utcMs: number): EclipticPosition {
  const { longitude, latitude } = eclipticOfDate(body, utcMs)
  const motion = dailyMotion(body, utcMs)
  return {
    longitude,
    latitude,
    sign: signOf(longitude),
    degreeInSign: degreeInSign(longitude),
    dailyMotion: motion,
    retrograde: motion < 0,
  }
}

export function allPositions(utcMs: number): Record<BodyId, EclipticPosition> {
  const entries = BODIES.map((body) => [body, positionOf(body, utcMs)] as const)
  return Object.fromEntries(entries) as Record<BodyId, EclipticPosition>
}
