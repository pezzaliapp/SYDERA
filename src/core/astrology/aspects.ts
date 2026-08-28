/**
 * Major aspects.
 *
 * Pure arithmetic on ecliptic longitudes: no astronomy is involved beyond the
 * positions that are passed in. The orb policy is data, not a hidden constant,
 * so the interface can show exactly which orb allowed each aspect.
 */
import { ASPECTS, type Aspect, type AspectId, type AspectPoint } from './types.ts'

export interface AspectSubject {
  readonly point: AspectPoint
  readonly longitude: number
  /** Degrees per day; null for the Ascendant and Midheaven. */
  readonly dailyMotion: number | null
}

/**
 * Orb allowances in degrees.
 *
 * Wider for the luminaries, as is traditional, and narrower for the calculated
 * angles, whose precision depends entirely on the birth time. The orb used for
 * a pair is the larger of the two allowances.
 */
export interface OrbPolicy {
  readonly luminaries: Readonly<Record<AspectId, number>>
  readonly planets: Readonly<Record<AspectId, number>>
  readonly angles: Readonly<Record<AspectId, number>>
}

export const DEFAULT_ORB_POLICY: OrbPolicy = {
  luminaries: { congiunzione: 10, opposizione: 10, quadrato: 8, trigono: 8, sestile: 6 },
  planets: { congiunzione: 8, opposizione: 8, quadrato: 7, trigono: 7, sestile: 5 },
  angles: { congiunzione: 5, opposizione: 5, quadrato: 5, trigono: 5, sestile: 5 },
}

function orbClass(point: AspectPoint): keyof OrbPolicy {
  if (point === 'sun' || point === 'moon') return 'luminaries'
  if (point === 'ascendant' || point === 'midheaven') return 'angles'
  return 'planets'
}

export function allowedOrb(a: AspectPoint, b: AspectPoint, aspect: AspectId, policy: OrbPolicy): number {
  return Math.max(policy[orbClass(a)][aspect], policy[orbClass(b)][aspect])
}

/** Angular separation of two longitudes, 0–180°. */
export function separation(longitudeA: number, longitudeB: number): number {
  const delta = Math.abs(((longitudeA - longitudeB) % 360 + 360) % 360)
  return delta > 180 ? 360 - delta : delta
}

/**
 * Whether the two points are moving towards the exact aspect.
 * Null when either point has no known motion, such as the Ascendant.
 */
function isApplying(a: AspectSubject, b: AspectSubject, exactAngle: number): boolean | null {
  if (a.dailyMotion === null || b.dailyMotion === null) return null
  const step = 1 / 24 // one hour, in days
  const now = Math.abs(separation(a.longitude, b.longitude) - exactAngle)
  const later = Math.abs(
    separation(a.longitude + a.dailyMotion * step, b.longitude + b.dailyMotion * step) - exactAngle,
  )
  return later < now
}

/**
 * Every major aspect between the supplied points, in a stable order.
 * Each pair is considered once, and the tightest aspect for a pair wins.
 */
export function findAspects(
  subjects: readonly AspectSubject[],
  policy: OrbPolicy = DEFAULT_ORB_POLICY,
): Aspect[] {
  const found: Aspect[] = []

  for (let i = 0; i < subjects.length; i += 1) {
    for (let j = i + 1; j < subjects.length; j += 1) {
      const a = subjects[i] as AspectSubject
      const b = subjects[j] as AspectSubject
      const gap = separation(a.longitude, b.longitude)

      let best: Aspect | null = null
      for (const aspect of ASPECTS) {
        const orb = Math.abs(gap - aspect.angle)
        const limit = allowedOrb(a.point, b.point, aspect.id, policy)
        if (orb > limit) continue
        if (best && orb >= best.orb) continue
        best = {
          a: a.point,
          b: b.point,
          aspect: aspect.id,
          exactAngle: aspect.angle,
          separation: gap,
          orb,
          allowedOrb: limit,
          applying: isApplying(a, b, aspect.angle),
        }
      }
      if (best) found.push(best)
    }
  }

  return found.sort((first, second) => first.orb - second.orb)
}
