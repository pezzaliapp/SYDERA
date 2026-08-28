import { describe, expect, it } from 'vitest'
import { analyseName } from '../alphabet.ts'
import { expressionNumber, personalityNumber, soulUrgeNumber } from '../nameNumbers.ts'

/**
 * Synthetic fixture "TEST TESTSSON" (no real person):
 *   TEST     = T2 + E5 + S1 + T2 = 10
 *   TESTSSON = T2 + E5 + S1 + T2 + S1 + S1 + O6 + N5 = 23
 *   total    = 33  (master number)
 *   vowels   = E5 + E5 + O6 = 16 -> 7
 *   consonants = 33 - 16 = 17 -> 8
 */
const FIXTURE = analyseName('TEST TESTSSON')

describe('expression (destiny) number', () => {
  it('sums every letter of the full birth name', () => {
    const result = expressionNumber(FIXTURE)
    expect(result.reduction.rawValue).toBe(33)
    expect(result.value).toBe(33)
    expect(result.isMaster).toBe(true)
  })

  it('reduces the master total when master numbers are disabled', () => {
    expect(expressionNumber(FIXTURE, 'total', false).value).toBe(6)
  })

  it('supports the per-word summation method, which can differ', () => {
    // TEST 10 -> 1, TESTSSON 23 -> 5, then 1 + 5 = 6
    const result = expressionNumber(FIXTURE, 'per-word')
    expect(result.value).toBe(6)
    expect(result.reduction.steps[0]).toEqual({ expression: '1+5', value: 6 })
  })

  it('exposes the letters used, for transparency', () => {
    expect(expressionNumber(FIXTURE).inputs).toEqual([
      'T=2',
      'E=5',
      'S=1',
      'T=2',
      'T=2',
      'E=5',
      'S=1',
      'T=2',
      'S=1',
      'S=1',
      'O=6',
      'N=5',
    ])
  })
})

describe('soul urge number', () => {
  it('uses only the vowels', () => {
    const result = soulUrgeNumber(FIXTURE)
    expect(result.reduction.rawValue).toBe(16)
    expect(result.value).toBe(7)
    expect(result.inputs).toEqual(['E=5', 'E=5', 'O=6'])
  })

  it('counts a Y classified as a vowel', () => {
    // MARY TEST: vowels A1 + Y7 + E5 = 13 -> 4
    const result = soulUrgeNumber(analyseName('MARY TEST'))
    expect(result.reduction.rawValue).toBe(13)
    expect(result.value).toBe(4)
  })
})

describe('personality number', () => {
  it('uses only the consonants', () => {
    const result = personalityNumber(FIXTURE)
    expect(result.reduction.rawValue).toBe(17)
    expect(result.value).toBe(8)
  })

  it('counts a Y classified as a consonant', () => {
    // MAY: consonants M4 + Y7 = 11 (master preserved)
    const result = personalityNumber(analyseName('MAY'))
    expect(result.reduction.rawValue).toBe(11)
    expect(result.value).toBe(11)
    expect(result.isMaster).toBe(true)
  })
})

describe('vowels and consonants partition the name', () => {
  it('soul urge raw + personality raw equals expression raw', () => {
    for (const name of ['TEST TESTSSON', 'MARY TEST', 'AAA-BBB', "O'TEST LYNN"]) {
      const analysis = analyseName(name)
      const expression = expressionNumber(analysis).reduction.rawValue
      const vowels = soulUrgeNumber(analysis).reduction.rawValue
      const consonants = personalityNumber(analysis).reduction.rawValue
      expect(vowels + consonants).toBe(expression)
    }
  })
})
