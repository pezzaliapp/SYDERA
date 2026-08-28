/**
 * Period analysis: current transits.
 *
 * A transit is a calculated angular relationship between where a body is now
 * and where it was at birth. It is arithmetic, and it is presented as such —
 * the symbolic reading of a period lives in the content layer, and nothing in
 * SYDERA describes a future event as certain.
 */
import { findAspects, type AspectSubject, type OrbPolicy } from '../astrology/aspects.ts'
import { positionOf } from '../astrology/ephemeris.ts'
import type { Aspect, AspectPoint, BodyId } from '../astrology/types.ts'

/** Slow bodies only: faster ones change too often to describe a period. */
export const TRANSITING_BODIES: readonly BodyId[] = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

/** Natal points worth watching, in the order they are shown. */
export const NATAL_TARGETS: readonly AspectPoint[] = [
  'sun',
  'moon',
  'ascendant',
  'midheaven',
  'mercury',
  'venus',
  'mars',
]

/** Tight orbs: a transit is a period, and a wide orb would make it meaningless. */
const TRANSIT_ORB_POLICY: OrbPolicy = {
  luminaries: { congiunzione: 2, opposizione: 2, quadrato: 2, trigono: 2, sestile: 1.5 },
  planets: { congiunzione: 2, opposizione: 2, quadrato: 2, trigono: 2, sestile: 1.5 },
  angles: { congiunzione: 2, opposizione: 2, quadrato: 2, trigono: 2, sestile: 1.5 },
}

export interface Transit {
  readonly transiting: BodyId
  readonly natalPoint: AspectPoint
  readonly aspect: Aspect['aspect']
  readonly orb: number
  readonly applying: boolean | null
  readonly retrograde: boolean
}

export interface NatalPoint {
  readonly point: AspectPoint
  readonly longitude: number
}

/**
 * Transits in force at a given instant. The reference instant is supplied by
 * the caller, so the calculation stays deterministic and testable.
 */
export function currentTransits(natalPoints: readonly NatalPoint[], atMs: number): Transit[] {
  const transits: Transit[] = []

  for (const body of TRANSITING_BODIES) {
    const moving = positionOf(body, atMs)
    for (const natal of natalPoints) {
      if (!NATAL_TARGETS.includes(natal.point)) continue

      const subjects: AspectSubject[] = [
        { point: body, longitude: moving.longitude, dailyMotion: moving.dailyMotion },
        { point: natal.point, longitude: natal.longitude, dailyMotion: null },
      ]
      const [aspect] = findAspects(subjects, TRANSIT_ORB_POLICY)
      if (!aspect) continue

      transits.push({
        transiting: body,
        natalPoint: natal.point,
        aspect: aspect.aspect,
        orb: aspect.orb,
        applying: aspect.applying,
        retrograde: moving.retrograde,
      })
    }
  }

  return transits.sort((a, b) => a.orb - b.orb)
}
