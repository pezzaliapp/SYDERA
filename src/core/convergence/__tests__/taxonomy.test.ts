import { describe, expect, it } from 'vitest'
import {
  FACTOR_WEIGHTS,
  NUMBER_THEMES,
  SIGN_THEMES,
  THEMES,
  classify,
  compareSystems,
  scoreAstrology,
  scoreNumerology,
} from '../taxonomy.ts'

describe('taxonomy', () => {
  it('covers the documented themes', () => {
    expect(THEMES).toHaveLength(11)
    expect(THEMES).toContain('analisi')
    expect(THEMES).toContain('relazione')
    expect(THEMES).toContain('concretezza')
  })

  it('maps every sign and every core number', () => {
    expect(Object.keys(SIGN_THEMES)).toHaveLength(12)
    for (const value of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
      expect(NUMBER_THEMES[value], `number ${value}`).toBeDefined()
    }
  })

  it('weights the luminaries and the Ascendant above the personal planets', () => {
    expect(FACTOR_WEIGHTS['sun']).toBeGreaterThan(FACTOR_WEIGHTS['mercury'] as number)
    // The slow planets describe a generation, so they carry no weight here.
    expect(FACTOR_WEIGHTS['pluto']).toBeUndefined()
  })
})

describe('classification thresholds', () => {
  it('is fixed and symmetric', () => {
    expect(classify(1, 1)).toBe('convergenza-forte')
    expect(classify(0.7, 0.65)).toBe('convergenza-forte')
    expect(classify(1, 0.1)).toBe('contrasto')
    expect(classify(0.1, 1)).toBe('contrasto')
    expect(classify(0.4, 0.5)).toBe('convergenza-moderata')
    expect(classify(0.1, 0.1)).toBe('neutro')
    expect(classify(0, 0)).toBe('neutro')
  })

  it('gives the same answer whichever system is named first', () => {
    for (const [a, b] of [[0.9, 0.2], [0.3, 0.8], [0.5, 0.5]]) {
      expect(classify(a as number, b as number)).toBe(classify(b as number, a as number))
    }
  })
})

describe('scoring', () => {
  it('normalises astrology scores to a 0-1 range', () => {
    const { scores } = scoreAstrology({
      factors: [
        { factor: 'sun', sign: 'vergine' },
        { factor: 'moon', sign: 'vergine' },
        { factor: 'ascendant', sign: 'capricorno' },
      ],
    })
    expect(Math.max(...Object.values(scores))).toBeCloseTo(1, 9)
    expect(scores.analisi).toBeGreaterThan(0)
    for (const value of Object.values(scores)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it('records which factors produced each score', () => {
    const { factors } = scoreAstrology({ factors: [{ factor: 'sun', sign: 'gemelli' }] })
    expect(factors.comunicazione).toContain('sun in gemelli')
  })

  it('normalises numerology scores and records the numbers used', () => {
    const { scores, factors } = scoreNumerology({
      numbers: [
        { label: 'Sentiero di vita', value: 7 },
        { label: 'Espressione', value: 7 },
      ],
    })
    expect(scores.analisi).toBeCloseTo(1, 9)
    expect(factors.analisi).toContain('Sentiero di vita = 7')
  })

  it('ignores a number that carries no theme mapping', () => {
    const { scores } = scoreNumerology({ numbers: [{ label: 'x', value: 44 }] })
    expect(Math.max(...Object.values(scores))).toBe(0)
  })
})

describe('comparison', () => {
  it('finds a strong convergence when both systems stress the same theme', () => {
    const result = compareSystems(
      { factors: [{ factor: 'sun', sign: 'vergine' }, { factor: 'moon', sign: 'vergine' }] },
      { numbers: [{ label: 'Sentiero di vita', value: 7 }] },
    )
    const analysis = result.comparisons.find((entry) => entry.theme === 'analisi')
    expect(analysis?.level).toBe('convergenza-forte')
    expect(analysis?.astrologyFactors.length).toBeGreaterThan(0)
    expect(analysis?.numerologyFactors.length).toBeGreaterThan(0)
  })

  it('finds a contrast when only one system stresses a theme', () => {
    const result = compareSystems(
      { factors: [{ factor: 'sun', sign: 'acquario' }, { factor: 'moon', sign: 'acquario' }] },
      { numbers: [{ label: 'Sentiero di vita', value: 2 }] },
    )
    const innovation = result.comparisons.find((entry) => entry.theme === 'innovazione')
    expect(innovation?.level).toBe('contrasto')
  })

  it('reports incompleteness instead of comparing against nothing', () => {
    expect(compareSystems(null, { numbers: [{ label: 'x', value: 7 }] }).incomplete).toBe(true)
    expect(compareSystems({ factors: [] }, null).incomplete).toBe(true)
    expect(compareSystems(null, null).comparisons).toEqual([])
  })

  it('orders convergences first and neutral themes last', () => {
    const result = compareSystems(
      { factors: [{ factor: 'sun', sign: 'vergine' }] },
      { numbers: [{ label: 'Sentiero di vita', value: 7 }] },
    )
    const levels = result.comparisons.map((entry) => entry.level)
    expect(levels[0]).not.toBe('neutro')
    expect(levels[levels.length - 1]).toBe('neutro')
  })

  it('is deterministic', () => {
    const astrology = { factors: [{ factor: 'sun' as const, sign: 'bilancia' as const }] }
    const numerology = { numbers: [{ label: 'Espressione', value: 3 }] }
    expect(compareSystems(astrology, numerology)).toEqual(compareSystems(astrology, numerology))
  })
})
