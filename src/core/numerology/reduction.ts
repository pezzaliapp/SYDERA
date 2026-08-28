/**
 * Digit reduction, the primitive every Pythagorean calculation is built on.
 *
 * Rule implemented: repeatedly replace a number by the sum of its digits until
 * it is a single digit, stopping early if an intermediate total is a master
 * number (11, 22, 33) and master numbers are enabled.
 */
import { MASTER_NUMBERS, type ReductionResult, type ReductionStep } from './types.ts'

export function isMasterNumber(value: number): boolean {
  return (MASTER_NUMBERS as readonly number[]).includes(value)
}

export function digitsOf(value: number): number[] {
  return Math.abs(Math.trunc(value))
    .toString(10)
    .split('')
    .map((digit) => Number(digit))
}

export function sumDigits(value: number): number {
  return digitsOf(value).reduce((total, digit) => total + digit, 0)
}

export function reduceNumber(input: number, keepMasterNumbers = true): ReductionResult {
  if (!Number.isFinite(input) || input < 0) {
    throw new RangeError(`reduceNumber expects a finite non-negative number, received ${String(input)}`)
  }

  const rawValue = Math.trunc(input)
  const steps: ReductionStep[] = []
  let value = rawValue

  while (value > 9 && !(keepMasterNumbers && isMasterNumber(value))) {
    const digits = digitsOf(value)
    const next = digits.reduce((total, digit) => total + digit, 0)
    steps.push({ expression: digits.join('+'), value: next })
    value = next
  }

  return {
    rawValue,
    value,
    isMaster: keepMasterNumbers && isMasterNumber(value),
    steps,
  }
}

/** Reduce a value all the way to 1..9, ignoring master numbers. */
export function reduceToSingleDigit(input: number): number {
  return reduceNumber(input, false).value
}

/** Sum several already-reduced components, then reduce the total. */
export function reduceSum(components: readonly number[], keepMasterNumbers = true): ReductionResult {
  const total = components.reduce((sum, component) => sum + component, 0)
  const result = reduceNumber(total, keepMasterNumbers)
  return {
    ...result,
    steps: [{ expression: components.join('+'), value: total }, ...result.steps],
  }
}
