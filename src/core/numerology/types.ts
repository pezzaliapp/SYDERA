/**
 * SYDERA — Pythagorean numerology: shared types.
 *
 * The engine is deterministic and side-effect free. It never reads the system
 * clock, never uses randomness and never performs network access: identical
 * validated input always yields an identical result.
 */

/** Numbers traditionally preserved instead of being reduced further. */
export const MASTER_NUMBERS = [11, 22, 33] as const
export type MasterNumber = (typeof MASTER_NUMBERS)[number]

/** One step of a digit-reduction chain, kept so the UI can show the derivation. */
export interface ReductionStep {
  /** Human-readable expression, e.g. "1+9+8+4". */
  readonly expression: string
  /** Result of that step. */
  readonly value: number
}

export interface ReductionResult {
  /** Value before any reduction (the raw sum). */
  readonly rawValue: number
  /** Final value: 1..9, or a preserved master number. */
  readonly value: number
  readonly isMaster: boolean
  readonly steps: readonly ReductionStep[]
}

/** How a Y is classified when splitting a name into vowels and consonants. */
export type VowelPolicy = 'contextual' | 'y-as-vowel' | 'y-as-consonant'

/** How the letters of a multi-word name are summed. */
export type NameSumMethod = 'total' | 'per-word'

/** How the Life Path is derived from the birth date. */
export type LifePathMethod = 'component' | 'digit-sum'

export interface NumerologyOptions {
  /** Preserve 11/22/33 instead of reducing them (default: true). */
  readonly keepMasterNumbers: boolean
  readonly vowelPolicy: VowelPolicy
  readonly nameSumMethod: NameSumMethod
  readonly lifePathMethod: LifePathMethod
}

export const DEFAULT_NUMEROLOGY_OPTIONS: NumerologyOptions = {
  keepMasterNumbers: true,
  vowelPolicy: 'contextual',
  nameSumMethod: 'total',
  lifePathMethod: 'component',
}

export type LetterClass = 'vowel' | 'consonant'

export interface AnalysedLetter {
  /** Normalised uppercase A–Z letter actually used by the calculation. */
  readonly letter: string
  /** Character as written by the user (before normalisation). */
  readonly source: string
  readonly value: number
  readonly letterClass: LetterClass
  /** True when the classification came from the Y rule rather than the A/E/I/O/U set. */
  readonly classifiedByYRule: boolean
}

export interface AnalysedWord {
  readonly source: string
  readonly letters: readonly AnalysedLetter[]
}

/** A character rewritten before mapping (e.g. "É" → "E", "ß" → "SS"). */
export interface NameTransformation {
  readonly from: string
  readonly to: string
  readonly reason: 'diacritic' | 'ligature' | 'separator-removed'
}

/** A character SYDERA cannot map to a Pythagorean value. */
export interface UnsupportedCharacter {
  readonly character: string
  readonly codePoint: string
}

export interface NameAnalysis {
  readonly source: string
  readonly words: readonly AnalysedWord[]
  readonly transformations: readonly NameTransformation[]
  readonly unsupported: readonly UnsupportedCharacter[]
  /** False when the name contains characters outside the Pythagorean mapping, or no letters at all. */
  readonly isCalculable: boolean
}

export interface BirthDate {
  readonly year: number
  readonly month: number
  readonly day: number
}

/** A calculated number together with the trace explaining how it was obtained. */
export interface NumberResult {
  readonly value: number
  readonly isMaster: boolean
  readonly reduction: ReductionResult
  /** Short machine-readable description of the inputs used. */
  readonly inputs: readonly string[]
}

export type NumerologyIssueCode =
  | 'name-empty'
  | 'name-unsupported-characters'
  | 'name-normalised'
  | 'date-invalid'
  | 'date-out-of-range'
  | 'reference-date-invalid'

export interface NumerologyIssue {
  readonly code: NumerologyIssueCode
  /** Technical detail; user-facing wording lives in the content layer. */
  readonly detail?: string
}

export type NumerologyOutcome<T> =
  | { readonly ok: true; readonly value: T; readonly warnings: readonly NumerologyIssue[] }
  | { readonly ok: false; readonly issues: readonly NumerologyIssue[] }
