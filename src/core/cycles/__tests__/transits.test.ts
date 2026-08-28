import { describe, expect, it } from 'vitest'
import { NATAL_TARGETS, TRANSITING_BODIES, currentTransits } from '../transits.ts'
import { positionOf } from '../../astrology/ephemeris.ts'

/** Synthetic natal points; the reference instant is always explicit. */
const AT = Date.parse('2026-08-28T00:00:00Z')

describe('transits', () => {
  it('uses only the slow bodies', () => {
    expect(TRANSITING_BODIES).toEqual(['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'])
  })

  it('finds an exact transit built from a real position', () => {
    // Place a natal point exactly on the current longitude of Saturn: the
    // conjunction must be found with an orb of zero.
    const saturn = positionOf('saturn', AT)
    const transits = currentTransits([{ point: 'sun', longitude: saturn.longitude }], AT)
    const conjunction = transits.find((transit) => transit.transiting === 'saturn')
    expect(conjunction?.aspect).toBe('congiunzione')
    expect(conjunction?.orb).toBeLessThan(0.001)
  })

  it('respects the tight transit orb', () => {
    const saturn = positionOf('saturn', AT)
    const inside = currentTransits([{ point: 'sun', longitude: saturn.longitude + 1.9 }], AT)
    const outside = currentTransits([{ point: 'sun', longitude: saturn.longitude + 2.1 }], AT)
    expect(inside.some((transit) => transit.transiting === 'saturn')).toBe(true)
    expect(outside.some((transit) => transit.transiting === 'saturn')).toBe(false)
  })

  it('ignores natal points that are not watched', () => {
    const saturn = positionOf('saturn', AT)
    const transits = currentTransits([{ point: 'pluto', longitude: saturn.longitude }], AT)
    expect(transits).toHaveLength(0)
    expect(NATAL_TARGETS).not.toContain('pluto')
  })

  it('reports whether the transiting body is retrograde', () => {
    const jupiter = positionOf('jupiter', AT)
    const transits = currentTransits([{ point: 'moon', longitude: jupiter.longitude }], AT)
    expect(transits[0]?.retrograde).toBe(jupiter.retrograde)
  })

  it('orders the tightest transit first', () => {
    const saturn = positionOf('saturn', AT)
    const jupiter = positionOf('jupiter', AT)
    const transits = currentTransits(
      [
        { point: 'sun', longitude: saturn.longitude + 1.5 },
        { point: 'moon', longitude: jupiter.longitude + 0.2 },
      ],
      AT,
    )
    expect(transits[0]?.orb).toBeLessThanOrEqual(transits[1]?.orb ?? Infinity)
  })

  it('is deterministic and never reads the clock', () => {
    const points = [{ point: 'sun' as const, longitude: 100 }]
    expect(currentTransits(points, AT)).toEqual(currentTransits(points, AT))
  })
})
