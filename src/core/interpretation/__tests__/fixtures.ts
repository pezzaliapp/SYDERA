/**
 * Synthetic technical fixtures, described as symbolic factors.
 *
 * These are not people. Each fixture is a list of calculated values — signs,
 * houses, aspects, numbers — with no birth date, no place and no name, which
 * is all the interpretation layer ever reads. Nothing here corresponds to a
 * real person's data.
 */
import type { CompleteChart } from '../../astrology/chart.ts'
import type { AspectId, AspectPoint, BodyId, ZodiacSign } from '../../astrology/types.ts'
import type { NumerologyProfile } from '../../numerology/profile.ts'

const SIGN_INDEX: readonly ZodiacSign[] = [
  'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
  'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
]

export interface Factors {
  readonly placements: ReadonlyArray<readonly [BodyId, ZodiacSign, number]>
  readonly ascendant: ZodiacSign
  readonly aspects: ReadonlyArray<readonly [AspectPoint, AspectId, AspectPoint, number]>
}

/** Builds the chart shape the interpretation layer reads, and nothing more. */
export function chartOf(factors: Factors): CompleteChart {
  const longitudeOf = (sign: ZodiacSign, degrees = 15) => SIGN_INDEX.indexOf(sign) * 30 + degrees
  return {
    kind: 'complete',
    provenance: { caveats: [] },
    place: { latitude: 0, longitude: 0, label: 'Fixture' },
    positions: factors.placements.map(([body, sign, house]) => ({
      body,
      sign,
      house,
      longitude: longitudeOf(sign),
      retrograde: false,
      speed: 1,
      latitude: 0,
      distanceAu: 1,
    })),
    houses: null,
    houseRefusal: null,
    aspects: factors.aspects.map(([a, aspect, b, orb]) => ({
      a,
      b,
      aspect,
      exactAngle: 0,
      separation: 0,
      orb,
      allowedOrb: 6,
      applying: false,
    })),
    ascendantValue: longitudeOf(factors.ascendant),
    midheavenValue: 0,
    localSiderealTime: 0,
    obliquity: 23.44,
    ascendantUncertaintyDegrees: 0,
  } as unknown as CompleteChart
}

export function numerologyOf(values: {
  lifePath: number
  expression: number
  soulUrge: number
  personality: number
  personalYear: number
}): NumerologyProfile {
  const box = (value: number) => ({ value, steps: [], master: false })
  return {
    lifePath: box(values.lifePath),
    expression: box(values.expression),
    soulUrge: box(values.soulUrge),
    personality: box(values.personality),
    personalYear: box(values.personalYear),
  } as unknown as NumerologyProfile
}

/**
 * D — the shape that produced the reading a real reader could not use.
 *
 * A dense chart with strong emotional, structural and practical emphasis at
 * once: exactly the combination the previous narrative engine turned into
 * "la spinta trova un appoggio coerente". Kept as a fixture so that style
 * cannot come back unnoticed.
 */
export const D_FACTORS: Factors = {
  ascendant: 'capricorno',
  placements: [
    ['sun', 'capricorno', 1],
    ['moon', 'toro', 5],
    ['mercury', 'capricorno', 1],
    ['venus', 'sagittario', 12],
    ['mars', 'scorpione', 11],
    ['jupiter', 'sagittario', 12],
    ['saturn', 'scorpione', 11],
  ],
  aspects: [
    ['sun', 'congiunzione', 'mercury', 1.2],
    ['moon', 'trigono', 'sun', 2.4],
    ['venus', 'quadrato', 'saturn', 3.1],
    ['mars', 'opposizione', 'moon', 1.8],
  ],
}

export const D_NUMBERS = { lifePath: 6, expression: 11, soulUrge: 8, personality: 3, personalYear: 4 }

/** A — convergent: emotional and expressive evidence pointing the same way. */
export const A_FACTORS: Factors = {
  ascendant: 'cancro',
  placements: [
    ['sun', 'cancro', 1],
    ['moon', 'pesci', 9],
    ['mercury', 'gemelli', 12],
    ['venus', 'cancro', 1],
    ['mars', 'bilancia', 4],
    ['jupiter', 'gemelli', 12],
    ['saturn', 'bilancia', 4],
  ],
  aspects: [
    ['sun', 'congiunzione', 'venus', 0.8],
    ['moon', 'trigono', 'sun', 2.0],
  ],
}
export const A_NUMBERS = { lifePath: 2, expression: 3, soulUrge: 33, personality: 6, personalYear: 6 }

/** B — contrasting: independence and change against order and results. */
export const B_FACTORS: Factors = {
  ascendant: 'capricorno',
  placements: [
    ['sun', 'acquario', 2],
    ['moon', 'toro', 5],
    ['mercury', 'capricorno', 1],
    ['venus', 'acquario', 2],
    ['mars', 'sagittario', 12],
    ['saturn', 'sagittario', 12],
  ],
  aspects: [
    ['sun', 'quadrato', 'moon', 2.2],
    ['venus', 'opposizione', 'mars', 4.0],
  ],
}
export const B_NUMBERS = { lifePath: 9, expression: 7, soulUrge: 5, personality: 2, personalYear: 5 }

/** C — sparse: numbers only, no birth time and so no chart at all. */
export const C_NUMBERS = { lifePath: 4, expression: 8, soulUrge: 22, personality: 4, personalYear: 3 }

/**
 * The two configurations that produced the failure reported from real use.
 *
 * Both had emotional perception as their strongest tendency, and the reading
 * opened from that alone: two different people were given the same two
 * sentences, and only the third differed. What separates them is what the
 * second tendency does to the first — deciding alone with what you feel, or
 * checking it before you trust it. Symbolic factors only: no name, no date,
 * no place, nothing belonging to anyone.
 */
export const SHAPE_A_FACTORS: Factors = {
  ascendant: 'ariete',
  placements: [
    ['sun', 'ariete', 1],
    ['moon', 'gemelli', 4],
    ['mercury', 'scorpione', 3],
    ['venus', 'leone', 7],
    ['mars', 'leone', 10],
    ['saturn', 'toro', 11],
  ],
  aspects: [
    ['sun', 'trigono', 'moon', 2.0],
    ['mercury', 'quadrato', 'saturn', 3.0],
  ],
}
export const SHAPE_A_NUMBERS = { lifePath: 2, expression: 11, soulUrge: 7, personality: 1, personalYear: 6 }

export const SHAPE_B_FACTORS: Factors = {
  ascendant: 'ariete',
  placements: [
    ['sun', 'toro', 1],
    ['moon', 'cancro', 4],
    ['mercury', 'gemelli', 3],
    ['venus', 'vergine', 7],
    ['mars', 'vergine', 10],
    ['saturn', 'sagittario', 11],
  ],
  aspects: [
    ['sun', 'trigono', 'moon', 2.0],
    ['mercury', 'quadrato', 'saturn', 3.0],
  ],
}
export const SHAPE_B_NUMBERS = { lifePath: 1, expression: 7, soulUrge: 11, personality: 3, personalYear: 2 }
