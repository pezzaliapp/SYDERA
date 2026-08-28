/**
 * Sidereal time, Ascendant and Midheaven.
 *
 * These are SYDERA's own calculations, not the library's: the library supplies
 * Greenwich apparent sidereal time and the obliquity, and the closed-form
 * trigonometry below turns them into the two angles a natal chart is built on.
 * Keeping them here makes them independently testable against the definition
 * of what an Ascendant is.
 */
import { SiderealTime } from 'astronomy-engine'
import { normaliseDegrees, trueObliquity } from './ephemeris.ts'

const DEG = Math.PI / 180

/** Greenwich apparent sidereal time in hours, 0–24. */
export function greenwichSiderealTime(utcMs: number): number {
  const hours = SiderealTime(new Date(utcMs))
  const wrapped = hours % 24
  return wrapped < 0 ? wrapped + 24 : wrapped
}

/**
 * Local apparent sidereal time in hours.
 * Longitude is degrees east of Greenwich, the convention used throughout SYDERA.
 */
export function localSiderealTime(utcMs: number, longitudeEast: number): number {
  const hours = greenwichSiderealTime(utcMs) + longitudeEast / 15
  const wrapped = hours % 24
  return wrapped < 0 ? wrapped + 24 : wrapped
}

/** Right ascension of the meridian, in degrees. */
export function ramcDegrees(localSiderealHours: number): number {
  return normaliseDegrees(localSiderealHours * 15)
}

/**
 * Midheaven: the ecliptic degree culminating on the local meridian.
 *
 *   tan(MC) = tan(RAMC) / cos(ε)
 */
export function midheaven(localSiderealHours: number, obliquityDegrees: number): number {
  const ramc = ramcDegrees(localSiderealHours) * DEG
  const obliquity = obliquityDegrees * DEG
  return normaliseDegrees(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(obliquity)) / DEG)
}

/**
 * Ascendant: the ecliptic degree rising on the eastern horizon.
 *
 *   tan(ASC) = cos(RAMC) / −(sin(RAMC)·cos ε + tan φ·sin ε)
 *
 * The ecliptic crosses the horizon at two points 180° apart, one rising and
 * one setting, and the arc tangent alone cannot always tell them apart. At
 * mid latitudes its quadrant convention happens to pick the rising one; above
 * the polar circle, where the ecliptic can lie almost flat against the
 * horizon, it does not, and the raw formula returns the *descending* degree.
 * The ascending point is the one that follows the Midheaven within half a
 * turn of ecliptic longitude, which is the criterion applied here. Verified
 * definitionally in the tests: the returned degree is on the horizon and its
 * altitude is increasing.
 *
 * Undefined at the geographic poles, where no ecliptic degree is fixed on the
 * horizon; the caller must not ask for it there.
 */
export function ascendant(localSiderealHours: number, latitudeDegrees: number, obliquityDegrees: number): number {
  const ramc = ramcDegrees(localSiderealHours) * DEG
  const latitude = latitudeDegrees * DEG
  const obliquity = obliquityDegrees * DEG
  const y = Math.cos(ramc)
  const x = -(Math.sin(ramc) * Math.cos(obliquity) + Math.tan(latitude) * Math.sin(obliquity))
  const raw = normaliseDegrees(Math.atan2(y, x) / DEG)

  const meridian = midheaven(localSiderealHours, obliquityDegrees)
  const followsMeridian = normaliseDegrees(raw - meridian)
  return followsMeridian > 180 ? normaliseDegrees(raw + 180) : raw
}

/** Latitude beyond which the Ascendant loses meaning. */
export const MAX_ASCENDANT_LATITUDE = 89.5

export function isAscendantCalculable(latitudeDegrees: number): boolean {
  return Math.abs(latitudeDegrees) <= MAX_ASCENDANT_LATITUDE
}

/**
 * How far the Ascendant moves for a given uncertainty in the birth time.
 *
 * This is a property of the input, not of the calculation, and it dominates
 * the arcminute-level accuracy of the engine: the interface must report it so
 * that a rounded birth time is never presented as a precise Ascendant.
 */
export function ascendantUncertaintyDegrees(
  utcMs: number,
  latitudeDegrees: number,
  longitudeEast: number,
  precisionMinutes: number,
): number {
  if (precisionMinutes <= 0) return 0
  const offsetMs = precisionMinutes * 60 * 1000
  const at = (ms: number): number =>
    ascendant(localSiderealTime(ms, longitudeEast), latitudeDegrees, trueObliquity(ms))
  const before = at(utcMs - offsetMs)
  const after = at(utcMs + offsetMs)
  let spread = Math.abs(after - before)
  if (spread > 180) spread = 360 - spread
  return spread / 2
}

export { trueObliquity }
