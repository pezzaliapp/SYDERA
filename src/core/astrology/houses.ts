/**
 * House systems.
 *
 * Whole Sign is the default because it is defined at every latitude and needs
 * no iteration — see docs/HOUSE_SYSTEM_DECISION.md. Placidus is offered
 * because most modern Western practice expects it, and is refused, never
 * approximated, where its construction has no solution.
 */
import { ascendant, localSiderealTime, midheaven, ramcDegrees } from './angles.ts'
import { normaliseDegrees, trueObliquity } from './ephemeris.ts'
import type { HouseCusps, HouseRefusal, HouseSystemId } from './types.ts'

const DEG = Math.PI / 180

/**
 * Latitude beyond which Placidus has no solution: an ecliptic degree that
 * never rises or never sets has no semi-diurnal arc to divide.
 */
export const PLACIDUS_LATITUDE_LIMIT = 66.0

export function isPlacidusCalculable(latitudeDegrees: number): boolean {
  return Math.abs(latitudeDegrees) < PLACIDUS_LATITUDE_LIMIT
}

/** Houses from the sign containing the Ascendant; each house is one whole sign. */
export function wholeSignCusps(ascendantDegrees: number, midheavenDegrees: number): HouseCusps {
  const start = Math.floor(normaliseDegrees(ascendantDegrees) / 30) * 30
  return {
    system: 'whole-sign',
    cusps: Array.from({ length: 12 }, (_, index) => normaliseDegrees(start + index * 30)),
    ascendant: normaliseDegrees(ascendantDegrees),
    midheaven: normaliseDegrees(midheavenDegrees),
  }
}

/** Houses of exactly 30°, the first beginning at the Ascendant. */
export function equalCusps(ascendantDegrees: number, midheavenDegrees: number): HouseCusps {
  const first = normaliseDegrees(ascendantDegrees)
  return {
    system: 'equal',
    cusps: Array.from({ length: 12 }, (_, index) => normaliseDegrees(first + index * 30)),
    ascendant: first,
    midheaven: normaliseDegrees(midheavenDegrees),
  }
}

/** Ecliptic longitude of the point on the ecliptic at a given right ascension. */
function longitudeFromRightAscension(raDegrees: number, obliquityDegrees: number): number {
  const ra = raDegrees * DEG
  const obliquity = obliquityDegrees * DEG
  return normaliseDegrees(Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(obliquity)) / DEG)
}

/** Declination of an ecliptic longitude on the ecliptic itself (latitude zero). */
function declinationOfLongitude(longitudeDegrees: number, obliquityDegrees: number): number {
  return Math.asin(Math.sin(obliquityDegrees * DEG) * Math.sin(longitudeDegrees * DEG)) / DEG
}

/**
 * Semi-diurnal arc: half the time an ecliptic degree spends above the horizon,
 * expressed in degrees of hour angle. Returns null when the degree never rises
 * or never sets, which is exactly when Placidus has no solution.
 */
function semiDiurnalArc(declinationDegrees: number, latitudeDegrees: number): number | null {
  const value = -Math.tan(latitudeDegrees * DEG) * Math.tan(declinationDegrees * DEG)
  if (value <= -1 || value >= 1) return null
  return Math.acos(value) / DEG
}

/**
 * Solve one Placidus cusp by fixed-point iteration on its own semi-arc.
 *
 * `fraction` is the share of the semi-arc that separates the cusp from the
 * meridian, and `nocturnal` selects the arc below the horizon. The unknown
 * appears on both sides — the arc depends on the declination of the degree the
 * arc is being computed for — so the equation is iterated until it settles.
 *
 * Offsets are measured eastward from the meridian, in the direction of
 * increasing right ascension: the Ascendant lies at RAMC + its own semi-diurnal
 * arc, and houses 11, 12, 2 and 3 fall between the Midheaven and it.
 */
function placidusCusp(
  ramc: number,
  latitudeDegrees: number,
  obliquityDegrees: number,
  fraction: number,
  nocturnal: boolean,
): number | null {
  let eastwardOffset = nocturnal ? 90 + fraction * 90 : fraction * 90

  for (let iteration = 0; iteration < 60; iteration += 1) {
    const rightAscension = normaliseDegrees(ramc + eastwardOffset)
    const longitude = longitudeFromRightAscension(rightAscension, obliquityDegrees)
    const declination = declinationOfLongitude(longitude, obliquityDegrees)
    const semiArc = semiDiurnalArc(declination, latitudeDegrees)
    if (semiArc === null) return null

    const target = nocturnal ? semiArc + fraction * (180 - semiArc) : fraction * semiArc
    if (Math.abs(target - eastwardOffset) < 1e-10) {
      return longitudeFromRightAscension(normaliseDegrees(ramc + target), obliquityDegrees)
    }
    eastwardOffset = target
  }
  // No convergence: refuse rather than return a half-solved cusp.
  return null
}

/**
 * Placidus cusps, or null when the construction has no solution for this
 * latitude. Houses 4 to 9 are the opposites of houses 10 to 3.
 */
export function placidusCusps(
  localSiderealHours: number,
  latitudeDegrees: number,
  obliquityDegrees: number,
): HouseCusps | null {
  if (!isPlacidusCalculable(latitudeDegrees)) return null

  const ramc = ramcDegrees(localSiderealHours)
  const mc = midheaven(localSiderealHours, obliquityDegrees)
  const asc = ascendant(localSiderealHours, latitudeDegrees, obliquityDegrees)

  const eleventh = placidusCusp(ramc, latitudeDegrees, obliquityDegrees, 1 / 3, false)
  const twelfth = placidusCusp(ramc, latitudeDegrees, obliquityDegrees, 2 / 3, false)
  const second = placidusCusp(ramc, latitudeDegrees, obliquityDegrees, 1 / 3, true)
  const third = placidusCusp(ramc, latitudeDegrees, obliquityDegrees, 2 / 3, true)
  if (eleventh === null || twelfth === null || second === null || third === null) return null

  const cusps = [
    asc,
    second,
    third,
    normaliseDegrees(mc + 180),
    normaliseDegrees(eleventh + 180),
    normaliseDegrees(twelfth + 180),
    normaliseDegrees(asc + 180),
    normaliseDegrees(second + 180),
    normaliseDegrees(third + 180),
    mc,
    eleventh,
    twelfth,
  ]

  return { system: 'placidus', cusps, ascendant: asc, midheaven: mc }
}

export interface HouseRequest {
  readonly utcMs: number
  readonly latitude: number
  readonly longitude: number
  readonly system: HouseSystemId
}

export type HouseOutcome =
  | { readonly ok: true; readonly houses: HouseCusps }
  | { readonly ok: false; readonly refusal: HouseRefusal }

/** Calculate the requested system, or refuse it with the reason and the alternatives. */
export function calculateHouses(request: HouseRequest): HouseOutcome {
  const { utcMs, latitude, longitude, system } = request
  const obliquity = trueObliquity(utcMs)
  const lst = localSiderealTime(utcMs, longitude)
  const asc = ascendant(lst, latitude, obliquity)
  const mc = midheaven(lst, obliquity)

  if (system === 'whole-sign') return { ok: true, houses: wholeSignCusps(asc, mc) }
  if (system === 'equal') return { ok: true, houses: equalCusps(asc, mc) }

  const placidus = placidusCusps(lst, latitude, obliquity)
  if (placidus) return { ok: true, houses: placidus }
  return {
    ok: false,
    refusal: { system: 'placidus', reason: 'latitude-out-of-range', alternatives: ['whole-sign', 'equal'] },
  }
}

/** House number 1–12 containing a longitude, for a given set of cusps. */
export function houseOf(longitudeDegrees: number, houses: HouseCusps): number {
  const target = normaliseDegrees(longitudeDegrees)
  for (let index = 0; index < 12; index += 1) {
    const start = houses.cusps[index] as number
    const end = houses.cusps[(index + 1) % 12] as number
    const span = normaliseDegrees(end - start)
    const offset = normaliseDegrees(target - start)
    if (offset < span) return index + 1
  }
  /* c8 ignore next */
  return 12
}
