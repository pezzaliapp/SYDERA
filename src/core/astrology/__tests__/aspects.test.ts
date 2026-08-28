import { describe, expect, it } from 'vitest'
import { DEFAULT_ORB_POLICY, allowedOrb, findAspects, separation, type AspectSubject } from '../aspects.ts'

/** Aspect detection is closed-form arithmetic, so it is verified exactly. */
const subject = (point: AspectSubject['point'], longitude: number, dailyMotion: number | null = 1): AspectSubject => ({
  point,
  longitude,
  dailyMotion,
})

describe('angular separation', () => {
  it('measures the short way round', () => {
    expect(separation(10, 20)).toBeCloseTo(10, 12)
    expect(separation(20, 10)).toBeCloseTo(10, 12)
    expect(separation(350, 10)).toBeCloseTo(20, 12)
    expect(separation(10, 350)).toBeCloseTo(20, 12)
    expect(separation(0, 180)).toBeCloseTo(180, 12)
    expect(separation(0, 181)).toBeCloseTo(179, 12)
    expect(separation(0, 0)).toBe(0)
  })

  it('is symmetric and never exceeds 180 degrees', () => {
    for (let a = 0; a < 360; a += 7) {
      for (let b = 0; b < 360; b += 11) {
        const forward = separation(a, b)
        expect(separation(b, a)).toBeCloseTo(forward, 12)
        expect(forward).toBeGreaterThanOrEqual(0)
        expect(forward).toBeLessThanOrEqual(180)
      }
    }
  })
})

describe('orb policy', () => {
  it('gives the luminaries the widest allowance', () => {
    expect(allowedOrb('sun', 'mars', 'congiunzione', DEFAULT_ORB_POLICY)).toBe(10)
    expect(allowedOrb('mars', 'venus', 'congiunzione', DEFAULT_ORB_POLICY)).toBe(8)
    expect(allowedOrb('mars', 'venus', 'sestile', DEFAULT_ORB_POLICY)).toBe(5)
  })

  it('uses the larger allowance of the pair', () => {
    expect(allowedOrb('moon', 'ascendant', 'trigono', DEFAULT_ORB_POLICY)).toBe(8)
    expect(allowedOrb('ascendant', 'midheaven', 'quadrato', DEFAULT_ORB_POLICY)).toBe(5)
  })
})

describe('aspect detection', () => {
  it('finds an exact conjunction', () => {
    const aspects = findAspects([subject('sun', 100), subject('venus', 100)])
    expect(aspects).toHaveLength(1)
    expect(aspects[0]?.aspect).toBe('congiunzione')
    expect(aspects[0]?.orb).toBeCloseTo(0, 12)
  })

  it('finds each major aspect at its exact angle', () => {
    const cases: Array<[number, string]> = [
      [0, 'congiunzione'],
      [60, 'sestile'],
      [90, 'quadrato'],
      [120, 'trigono'],
      [180, 'opposizione'],
    ]
    for (const [angle, expected] of cases) {
      const aspects = findAspects([subject('mars', 0), subject('jupiter', angle)])
      expect(aspects[0]?.aspect, `${angle}°`).toBe(expected)
      expect(aspects[0]?.orb).toBeCloseTo(0, 12)
    }
  })

  it('reports the orb and the allowance that admitted the aspect', () => {
    const aspects = findAspects([subject('mars', 0), subject('jupiter', 94)])
    expect(aspects[0]?.aspect).toBe('quadrato')
    expect(aspects[0]?.orb).toBeCloseTo(4, 12)
    expect(aspects[0]?.allowedOrb).toBe(7)
  })

  it('rejects a separation just outside the allowance', () => {
    // Planet square: allowance 7 degrees.
    expect(findAspects([subject('mars', 0), subject('jupiter', 97)])).toHaveLength(1)
    expect(findAspects([subject('mars', 0), subject('jupiter', 97.01)])).toHaveLength(0)
  })

  it('respects the wider luminary allowance at the boundary', () => {
    // Sun conjunction: allowance 10 degrees.
    expect(findAspects([subject('sun', 0), subject('saturn', 10)])).toHaveLength(1)
    expect(findAspects([subject('sun', 0), subject('saturn', 10.01)])).toHaveLength(0)
  })

  it('works across the zero degree boundary', () => {
    const aspects = findAspects([subject('sun', 355), subject('moon', 5)])
    expect(aspects[0]?.aspect).toBe('congiunzione')
    expect(aspects[0]?.separation).toBeCloseTo(10, 12)
  })

  it('keeps only the tightest aspect for a pair', () => {
    const aspects = findAspects([subject('mars', 0), subject('venus', 58)])
    expect(aspects).toHaveLength(1)
    expect(aspects[0]?.aspect).toBe('sestile')
  })

  it('considers each pair once', () => {
    const aspects = findAspects([subject('sun', 0), subject('moon', 90), subject('mars', 180)])
    expect(aspects).toHaveLength(3)
    const pairs = aspects.map((aspect) => [aspect.a, aspect.b].sort().join('-')).sort()
    expect(pairs).toEqual(['mars-sun', 'mars-moon'.split('-').sort().join('-'), 'moon-sun'].sort())
  })

  it('orders results from the tightest orb outwards', () => {
    const aspects = findAspects([subject('sun', 0), subject('mars', 92), subject('venus', 180.5)])
    const orbs = aspects.map((aspect) => aspect.orb)
    expect([...orbs].sort((a, b) => a - b)).toEqual(orbs)
  })
})

describe('applying and separating', () => {
  it('marks a faster body catching an aspect as applying', () => {
    // The Moon at 85 degrees moving 13 degrees per day closes on a square to
    // the Sun at 0 degrees moving 1 degree per day.
    const aspects = findAspects([subject('sun', 0, 1), subject('moon', 85, 13)])
    expect(aspects[0]?.aspect).toBe('quadrato')
    expect(aspects[0]?.applying).toBe(true)
  })

  it('marks a body leaving an aspect as separating', () => {
    const aspects = findAspects([subject('sun', 0, 1), subject('moon', 95, 13)])
    expect(aspects[0]?.aspect).toBe('quadrato')
    expect(aspects[0]?.applying).toBe(false)
  })

  it('leaves the direction unknown for the angles, which have no motion', () => {
    const aspects = findAspects([subject('ascendant', 0, null), subject('mars', 2, 0.5)])
    expect(aspects[0]?.applying).toBeNull()
  })
})

describe('determinism', () => {
  it('produces identical output for identical input', () => {
    const subjects = [subject('sun', 12.3), subject('moon', 101.7), subject('mars', 192.4)]
    expect(findAspects(subjects)).toEqual(findAspects(subjects))
  })
})
