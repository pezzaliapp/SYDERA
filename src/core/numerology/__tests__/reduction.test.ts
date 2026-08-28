import { describe, expect, it } from 'vitest'
import { digitsOf, isMasterNumber, reduceNumber, reduceSum, reduceToSingleDigit, sumDigits } from '../reduction.ts'

describe('digit helpers', () => {
  it('splits a number into digits', () => {
    expect(digitsOf(1984)).toEqual([1, 9, 8, 4])
    expect(digitsOf(0)).toEqual([0])
  })

  it('sums digits', () => {
    expect(sumDigits(1984)).toBe(22)
    expect(sumDigits(9)).toBe(9)
  })

  it('recognises master numbers', () => {
    expect(isMasterNumber(11)).toBe(true)
    expect(isMasterNumber(22)).toBe(true)
    expect(isMasterNumber(33)).toBe(true)
    expect(isMasterNumber(44)).toBe(false)
    expect(isMasterNumber(3)).toBe(false)
  })
})

describe('reduceNumber', () => {
  it('leaves single digits untouched', () => {
    const result = reduceNumber(7)
    expect(result.value).toBe(7)
    expect(result.rawValue).toBe(7)
    expect(result.isMaster).toBe(false)
    expect(result.steps).toEqual([])
  })

  it('reduces to a single digit', () => {
    const result = reduceNumber(1984)
    // 1+9+8+4 = 22 -> master, preserved by default
    expect(result.value).toBe(22)
    expect(result.isMaster).toBe(true)
    expect(result.steps).toEqual([{ expression: '1+9+8+4', value: 22 }])
  })

  it('preserves master numbers at intermediate steps', () => {
    expect(reduceNumber(29).value).toBe(11)
    expect(reduceNumber(29).isMaster).toBe(true)
    expect(reduceNumber(499).value).toBe(22)
    expect(reduceNumber(6999).value).toBe(33)
  })

  it('reduces master numbers when the option is disabled', () => {
    expect(reduceNumber(29, false).value).toBe(2)
    expect(reduceNumber(1984, false).value).toBe(4)
    expect(reduceNumber(6999, false).value).toBe(6)
  })

  it('records every reduction step', () => {
    const result = reduceNumber(9876, false)
    expect(result.steps).toEqual([
      { expression: '9+8+7+6', value: 30 },
      { expression: '3+0', value: 3 },
    ])
    expect(result.value).toBe(3)
  })

  it('handles zero', () => {
    expect(reduceNumber(0).value).toBe(0)
  })

  it('rejects negative and non-finite input', () => {
    expect(() => reduceNumber(-1)).toThrow(RangeError)
    expect(() => reduceNumber(Number.NaN)).toThrow(RangeError)
    expect(() => reduceNumber(Number.POSITIVE_INFINITY)).toThrow(RangeError)
  })
})

describe('reduceToSingleDigit', () => {
  it('always collapses master numbers', () => {
    expect(reduceToSingleDigit(11)).toBe(2)
    expect(reduceToSingleDigit(22)).toBe(4)
    expect(reduceToSingleDigit(33)).toBe(6)
    expect(reduceToSingleDigit(2020)).toBe(4)
  })
})

describe('reduceSum', () => {
  it('prefixes the trace with the component sum', () => {
    const result = reduceSum([1, 1, 22])
    expect(result.rawValue).toBe(24)
    expect(result.value).toBe(6)
    expect(result.steps[0]).toEqual({ expression: '1+1+22', value: 24 })
  })

  it('keeps a master total', () => {
    const result = reduceSum([9, 9, 4])
    expect(result.value).toBe(22)
    expect(result.isMaster).toBe(true)
  })
})
