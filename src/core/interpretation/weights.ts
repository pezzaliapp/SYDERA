/**
 * The weighting model.
 *
 * Not every calculated factor deserves the same emphasis. These numbers decide
 * what the report leads with and what stays in the background. They are
 * **editorial and symbolic**: they encode how the two traditions rank their own
 * indicators, not a measurement of anything. They are never shown to the user
 * as a score, a percentage or a personality metric.
 *
 * The reasoning is documented in docs/INTERPRETATION_MODEL.md; the numbers
 * live here so a reader can check the two against each other.
 */
import type { AspectId, BodyId } from '../astrology/types.ts'

/**
 * Astrological factors.
 *
 * The luminaries and the Ascendant are the structural core of a chart in
 * ordinary practice, so they lead. The personal planets follow. Jupiter and
 * Saturn contribute, more faintly. The slow bodies are deliberately given no
 * weight for their *sign*, which they share with everyone born within years of
 * the person, and count only through their aspects and houses.
 */
export const BODY_WEIGHT: Readonly<Record<BodyId | 'ascendant' | 'midheaven', number>> = Object.freeze({
  sun: 3,
  moon: 3,
  ascendant: 3,
  midheaven: 2,
  mercury: 2,
  venus: 2,
  mars: 2,
  jupiter: 1,
  saturn: 1,
  uranus: 0,
  neptune: 0,
  pluto: 0,
})

/** Signs of the slow bodies describe a generation, not a person. */
export const GENERATIONAL_BODIES: readonly BodyId[] = ['uranus', 'neptune', 'pluto']

/** The angular houses are the ones traditionally read as most exposed. */
export const ANGULAR_HOUSES: readonly number[] = [1, 4, 7, 10]
export const ANGULAR_HOUSE_BONUS = 1

/** Hard aspects describe tension, soft ones ease; both are read, differently. */
export const ASPECT_WEIGHT: Readonly<Record<AspectId, number>> = Object.freeze({
  congiunzione: 2,
  opposizione: 2,
  quadrato: 2,
  trigono: 1,
  sestile: 1,
})

export const HARD_ASPECTS: readonly AspectId[] = ['quadrato', 'opposizione']

/**
 * A tight aspect speaks more loudly than one at the edge of its orb.
 * Returns a factor between 0.5 and 1, never zero: an aspect inside its orb is
 * always worth something.
 */
export function orbFactor(orb: number, allowedOrb: number): number {
  if (allowedOrb <= 0) return 1
  const tightness = 1 - Math.min(1, Math.max(0, orb / allowedOrb))
  return 0.5 + 0.5 * tightness
}

/**
 * Numerological factors, ranked as the Pythagorean tradition ranks them: the
 * Life Path and the Expression are the two structural numbers, the Soul Urge
 * and the Personality describe inner and outer facets, and the rest support.
 */
export const NUMBER_WEIGHT = Object.freeze({
  lifePath: 3,
  expression: 3,
  soulUrge: 2,
  personality: 2,
  birthday: 1,
  maturity: 1,
})

/** A theme needs support from more than one factor before it is called a pattern. */
export const MIN_FACTORS_FOR_STRENGTH = 2

/** Below this share of the leading theme's score, a theme is background noise. */
export const STRENGTH_RELATIVE_FLOOR = 0.45

/** How many statements a domain paragraph may carry before it stops being readable. */
export const MAX_STATEMENTS_PER_DOMAIN = 3
