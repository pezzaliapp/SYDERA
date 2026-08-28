/**
 * Pythagorean letter mapping and name normalisation.
 *
 * SYDERA never silently rewrites a name: every substitution applied before the
 * calculation is reported back to the caller so the interface can show it, and
 * any character outside the supported mapping makes the name non-calculable
 * instead of being dropped.
 *
 *   1 2 3 4 5 6 7 8 9
 *   A B C D E F G H I
 *   J K L M N O P Q R
 *   S T U V W X Y Z
 */
import type {
  AnalysedLetter,
  AnalysedWord,
  LetterClass,
  NameAnalysis,
  NameTransformation,
  UnsupportedCharacter,
  VowelPolicy,
} from './types.ts'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const PYTHAGOREAN_VALUES: Readonly<Record<string, number>> = Object.freeze(
  Object.fromEntries([...LETTERS].map((letter, index) => [letter, (index % 9) + 1])),
)

const HARD_VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

/**
 * Latin characters that Unicode NFD does not decompose. Expanding them keeps
 * the mapping honest for common European spellings; each expansion is reported.
 */
const LIGATURES: Readonly<Record<string, string>> = Object.freeze({
  Æ: 'AE',
  Œ: 'OE',
  ß: 'SS',
  ẞ: 'SS',
  Ø: 'O',
  Đ: 'D',
  Ð: 'D',
  Þ: 'TH',
  Ł: 'L',
  Ħ: 'H',
  Ŋ: 'NG',
  Ĳ: 'IJ',
})

/** Characters that join name parts without carrying a numerical value. */
const APOSTROPHES = new Set(["'", '’', 'ʼ', '‘', '`', '´'])
/** Characters that separate name parts. */
const WORD_SEPARATORS = new Set([' ', ' ', ' ', ' ', '-', '‐', '‑', '‒', '–', '—'])

interface PreparedCharacter {
  readonly letters: string
  readonly source: string
}

/**
 * Deterministic Y rule (documented in docs/NUMEROLOGY_METHOD.md):
 * a Y is a vowel unless one of its immediate neighbours inside the same word
 * is A, E, I, O or U.
 */
function classifyY(wordLetters: readonly string[], index: number, policy: VowelPolicy): LetterClass {
  if (policy === 'y-as-vowel') return 'vowel'
  if (policy === 'y-as-consonant') return 'consonant'
  const previous = index > 0 ? wordLetters[index - 1] : undefined
  const next = index + 1 < wordLetters.length ? wordLetters[index + 1] : undefined
  const touchesVowel = (previous !== undefined && HARD_VOWELS.has(previous)) || (next !== undefined && HARD_VOWELS.has(next))
  return touchesVowel ? 'consonant' : 'vowel'
}

function stripDiacritics(character: string): string {
  return character.normalize('NFD').replace(/\p{Mn}+/gu, '')
}

/**
 * Analyse a name: normalise it, split it into words and letters, and report
 * every transformation and every unsupported character.
 */
export function analyseName(source: string, policy: VowelPolicy = 'contextual'): NameAnalysis {
  const transformations: NameTransformation[] = []
  const unsupported: UnsupportedCharacter[] = []
  const words: AnalysedWord[] = []

  let currentSource = ''
  let currentCharacters: PreparedCharacter[] = []

  const flushWord = (): void => {
    if (currentCharacters.length === 0) {
      currentSource = ''
      return
    }
    const wordLetters = currentCharacters.flatMap((entry) => [...entry.letters])
    const letters: AnalysedLetter[] = []
    let cursor = 0
    for (const entry of currentCharacters) {
      for (const letter of entry.letters) {
        const isY = letter === 'Y'
        const letterClass: LetterClass = HARD_VOWELS.has(letter)
          ? 'vowel'
          : isY
            ? classifyY(wordLetters, cursor, policy)
            : 'consonant'
        letters.push({
          letter,
          source: entry.source,
          value: PYTHAGOREAN_VALUES[letter] as number,
          letterClass,
          classifiedByYRule: isY,
        })
        cursor += 1
      }
    }
    words.push({ source: currentSource, letters })
    currentSource = ''
    currentCharacters = []
  }

  for (const character of source) {
    if (WORD_SEPARATORS.has(character)) {
      flushWord()
      continue
    }
    if (APOSTROPHES.has(character)) {
      transformations.push({ from: character, to: '', reason: 'separator-removed' })
      continue
    }

    const upper = character.toUpperCase()
    const ligature = LIGATURES[upper] ?? LIGATURES[character]
    if (ligature !== undefined) {
      transformations.push({ from: character, to: ligature, reason: 'ligature' })
      currentSource += character
      currentCharacters.push({ letters: ligature, source: character })
      continue
    }

    const stripped = stripDiacritics(upper)
    if (stripped.length > 0 && [...stripped].every((letter) => LETTERS.includes(letter))) {
      if (stripped !== upper) {
        transformations.push({ from: character, to: stripped, reason: 'diacritic' })
      }
      currentSource += character
      currentCharacters.push({ letters: stripped, source: character })
      continue
    }

    unsupported.push({
      character,
      codePoint: `U+${(character.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`,
    })
  }
  flushWord()

  const hasLetters = words.some((word) => word.letters.length > 0)
  return {
    source,
    words,
    transformations,
    unsupported,
    isCalculable: hasLetters && unsupported.length === 0,
  }
}

export function allLetters(analysis: NameAnalysis): readonly AnalysedLetter[] {
  return analysis.words.flatMap((word) => word.letters)
}
