/**
 * SYDERA — astrological calculation types.
 *
 * Everything here is calculated data: positions, angles, cusps and orbs. The
 * symbolic reading of those numbers lives in the content layer and is never
 * mixed into these structures.
 *
 * The engine is deterministic and never invents a value. When an input is
 * missing or unreliable, the corresponding result is absent and carries the
 * reason, rather than being filled with a default.
 */

export const BODIES = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const

export type BodyId = (typeof BODIES)[number]

export const ZODIAC_SIGNS = [
  'ariete',
  'toro',
  'gemelli',
  'cancro',
  'leone',
  'vergine',
  'bilancia',
  'scorpione',
  'sagittario',
  'capricorno',
  'acquario',
  'pesci',
] as const

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number]

/** A position on the ecliptic, plus the sign breakdown used for display. */
export interface EclipticPosition {
  /** Apparent geocentric ecliptic longitude of date, 0–360°. */
  readonly longitude: number
  /** Ecliptic latitude in degrees; absent for computed points such as the Ascendant. */
  readonly latitude: number | null
  readonly sign: ZodiacSign
  /** Degrees within the sign, 0–30. */
  readonly degreeInSign: number
  /** Apparent daily motion in longitude, degrees per day. Negative when retrograde. */
  readonly dailyMotion: number | null
  readonly retrograde: boolean
}

export interface BodyPosition extends EclipticPosition {
  readonly body: BodyId
  /** House number 1–12, when houses could be calculated. */
  readonly house: number | null
}

export type HouseSystemId = 'whole-sign' | 'equal' | 'placidus'

export interface HouseCusps {
  readonly system: HouseSystemId
  /** Twelve cusp longitudes in degrees, starting with the first house. */
  readonly cusps: readonly number[]
  readonly ascendant: number
  readonly midheaven: number
}

/** Why a house system could not be used for this chart. */
export type HouseRefusalReason =
  | 'no-birth-time'
  | 'no-location'
  | 'unreliable-utc'
  | 'latitude-out-of-range'

export interface HouseRefusal {
  readonly system: HouseSystemId
  readonly reason: HouseRefusalReason
  /** Systems that can be calculated for this chart instead. */
  readonly alternatives: readonly HouseSystemId[]
}

export const ASPECTS = [
  { id: 'congiunzione', angle: 0 },
  { id: 'sestile', angle: 60 },
  { id: 'quadrato', angle: 90 },
  { id: 'trigono', angle: 120 },
  { id: 'opposizione', angle: 180 },
] as const

export type AspectId = (typeof ASPECTS)[number]['id']

/** A point that can take part in an aspect: a body, or the Ascendant/Midheaven. */
export type AspectPoint = BodyId | 'ascendant' | 'midheaven'

export interface Aspect {
  readonly a: AspectPoint
  readonly b: AspectPoint
  readonly aspect: AspectId
  /** Exact angle of the aspect in degrees. */
  readonly exactAngle: number
  /** Actual angular separation of the two points, 0–180°. */
  readonly separation: number
  /** How far the separation is from exact, in degrees. */
  readonly orb: number
  /** Orb allowed for this pair, in degrees. */
  readonly allowedOrb: number
  /** True when the two points are moving towards the exact angle. */
  readonly applying: boolean | null
}

export interface GeoPosition {
  /** Degrees, positive north. */
  readonly latitude: number
  /** Degrees, positive east. */
  readonly longitude: number
  readonly label: string
}

/** Everything needed to reproduce a chart exactly, stored alongside it. */
export interface ChartProvenance {
  readonly utcIso: string
  readonly offsetMinutes: number
  readonly zoneId: string
  readonly offsetSource: string
  readonly caveats: readonly string[]
  readonly zoneFingerprint: string
  readonly engine: string
  readonly houseSystem: HouseSystemId
  /** Uncertainty of the entered birth time, in minutes. */
  readonly birthTimePrecisionMinutes: number
}

export interface NatalChart {
  readonly provenance: ChartProvenance
  readonly place: GeoPosition | null
  readonly positions: readonly BodyPosition[]
  readonly houses: HouseCusps | null
  readonly houseRefusal: HouseRefusal | null
  readonly aspects: readonly Aspect[]
  /** Sidereal time in hours at the birth place; null when it could not be computed. */
  readonly localSiderealTime: number | null
  /** True obliquity of the ecliptic in degrees. */
  readonly obliquity: number
  /**
   * Estimated Ascendant uncertainty in degrees, derived from the precision of
   * the entered birth time — not from the precision of the calculation.
   */
  readonly ascendantUncertaintyDegrees: number | null
}
