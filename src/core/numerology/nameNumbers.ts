/**
 * Name-derived numbers: Expression (Destiny), Soul Urge and Personality.
 */
import { reduceNumber, reduceSum } from './reduction.ts'
import type { AnalysedLetter, NameAnalysis, NameSumMethod, NumberResult } from './types.ts'

function sumLetters(letters: readonly AnalysedLetter[]): number {
  return letters.reduce((total, letter) => total + letter.value, 0)
}

function describe(letters: readonly AnalysedLetter[]): string[] {
  return letters.map((letter) => `${letter.letter}=${letter.value}`)
}

function computeFromLetters(
  analysis: NameAnalysis,
  select: (letters: readonly AnalysedLetter[]) => readonly AnalysedLetter[],
  method: NameSumMethod,
  keepMasterNumbers: boolean,
): NumberResult {
  const selectedPerWord = analysis.words.map((word) => select(word.letters))
  const selected = selectedPerWord.flat()

  if (method === 'per-word') {
    const wordValues = selectedPerWord
      .filter((letters) => letters.length > 0)
      .map((letters) => reduceNumber(sumLetters(letters), keepMasterNumbers).value)
    const reduction = reduceSum(wordValues, keepMasterNumbers)
    return {
      value: reduction.value,
      isMaster: reduction.isMaster,
      reduction,
      inputs: describe(selected),
    }
  }

  const reduction = reduceNumber(sumLetters(selected), keepMasterNumbers)
  return {
    value: reduction.value,
    isMaster: reduction.isMaster,
    reduction,
    inputs: describe(selected),
  }
}

/** Expression / Destiny number: every letter of the full birth name. */
export function expressionNumber(
  analysis: NameAnalysis,
  method: NameSumMethod = 'total',
  keepMasterNumbers = true,
): NumberResult {
  return computeFromLetters(analysis, (letters) => letters, method, keepMasterNumbers)
}

/** Soul Urge (Heart's Desire): the vowels of the full birth name. */
export function soulUrgeNumber(
  analysis: NameAnalysis,
  method: NameSumMethod = 'total',
  keepMasterNumbers = true,
): NumberResult {
  return computeFromLetters(
    analysis,
    (letters) => letters.filter((letter) => letter.letterClass === 'vowel'),
    method,
    keepMasterNumbers,
  )
}

/** Personality: the consonants of the full birth name. */
export function personalityNumber(
  analysis: NameAnalysis,
  method: NameSumMethod = 'total',
  keepMasterNumbers = true,
): NumberResult {
  return computeFromLetters(
    analysis,
    (letters) => letters.filter((letter) => letter.letterClass === 'consonant'),
    method,
    keepMasterNumbers,
  )
}
