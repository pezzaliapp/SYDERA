import { describe, expect, it } from 'vitest'
import { analyseName, PYTHAGOREAN_VALUES } from '../alphabet.ts'

/** All fixtures are synthetic technical values, never real personal profiles. */

function letters(name: string, policy?: Parameters<typeof analyseName>[1]): string[] {
  return analyseName(name, policy).words.flatMap((word) => word.letters.map((letter) => letter.letter))
}

function classesOf(name: string): string[] {
  return analyseName(name).words.flatMap((word) =>
    word.letters.map((letter) => `${letter.letter}:${letter.letterClass}`),
  )
}

describe('Pythagorean mapping', () => {
  it('maps the alphabet to the classic 1-9 cycle', () => {
    expect(PYTHAGOREAN_VALUES['A']).toBe(1)
    expect(PYTHAGOREAN_VALUES['I']).toBe(9)
    expect(PYTHAGOREAN_VALUES['J']).toBe(1)
    expect(PYTHAGOREAN_VALUES['R']).toBe(9)
    expect(PYTHAGOREAN_VALUES['S']).toBe(1)
    expect(PYTHAGOREAN_VALUES['Z']).toBe(8)
  })

  it('covers exactly the 26 Latin letters', () => {
    expect(Object.keys(PYTHAGOREAN_VALUES)).toHaveLength(26)
  })
})

describe('word splitting', () => {
  it('splits on spaces', () => {
    const analysis = analyseName('TEST TESTSSON')
    expect(analysis.words.map((word) => word.source)).toEqual(['TEST', 'TESTSSON'])
    expect(analysis.isCalculable).toBe(true)
  })

  it('treats hyphens as word separators without assigning them a value', () => {
    const analysis = analyseName('AAA-BBB')
    expect(analysis.words).toHaveLength(2)
    expect(letters('AAA-BBB')).toEqual(['A', 'A', 'A', 'B', 'B', 'B'])
  })

  it('removes apostrophes and keeps the name part joined', () => {
    const analysis = analyseName("O'TEST")
    expect(analysis.words).toHaveLength(1)
    expect(letters("O'TEST")).toEqual(['O', 'T', 'E', 'S', 'T'])
    expect(analysis.transformations).toEqual([{ from: "'", to: '', reason: 'separator-removed' }])
  })

  it('ignores repeated and typographic separators', () => {
    expect(analyseName('AA—BB ’ CC').words.map((w) => w.letters.length)).toEqual([2, 2, 2])
  })
})

describe('normalisation reporting', () => {
  it('strips diacritics and reports each substitution', () => {
    const analysis = analyseName('TÉST')
    expect(letters('TÉST')).toEqual(['T', 'E', 'S', 'T'])
    expect(analysis.transformations).toEqual([{ from: 'É', to: 'E', reason: 'diacritic' }])
    expect(analysis.isCalculable).toBe(true)
  })

  it('handles lowercase input and cedillas', () => {
    expect(letters('çedilla')).toEqual(['C', 'E', 'D', 'I', 'L', 'L', 'A'])
  })

  it('expands ligatures that Unicode does not decompose', () => {
    expect(letters('Aß')).toEqual(['A', 'S', 'S'])
    expect(letters('ÆTEST')).toEqual(['A', 'E', 'T', 'E', 'S', 'T'])
    expect(analyseName('Aß').transformations).toEqual([{ from: 'ß', to: 'SS', reason: 'ligature' }])
    expect(letters('ØTEST')).toEqual(['O', 'T', 'E', 'S', 'T'])
    expect(letters('ŁTEST')).toEqual(['L', 'T', 'E', 'S', 'T'])
  })

  it('marks unmappable characters instead of dropping them silently', () => {
    const analysis = analyseName('ΑΛΕΞ')
    expect(analysis.isCalculable).toBe(false)
    expect(analysis.unsupported.map((entry) => entry.character)).toEqual(['Α', 'Λ', 'Ε', 'Ξ'])
    expect(analysis.unsupported[0]?.codePoint).toBe('U+0391')
  })

  it('rejects digits and stray punctuation inside a name', () => {
    const analysis = analyseName('TEST 3')
    expect(analysis.isCalculable).toBe(false)
    expect(analysis.unsupported.map((entry) => entry.character)).toEqual(['3'])
  })

  it('reports an empty name as non-calculable', () => {
    expect(analyseName('   ').isCalculable).toBe(false)
    expect(analyseName('').words).toEqual([])
  })
})

describe('vowel and consonant classification', () => {
  it('classifies A E I O U as vowels', () => {
    expect(classesOf('AEIOU')).toEqual(['A:vowel', 'E:vowel', 'I:vowel', 'O:vowel', 'U:vowel'])
  })

  it('treats Y as a vowel when no neighbouring letter is a vowel', () => {
    expect(classesOf('LYNN')).toContain('Y:vowel')
    expect(classesOf('MARY')).toContain('Y:vowel')
    expect(classesOf('YVES')).toContain('Y:vowel')
  })

  it('treats Y as a consonant when it touches a vowel', () => {
    expect(classesOf('MAY')).toContain('Y:consonant')
    expect(classesOf('YOLANDA')).toContain('Y:consonant')
  })

  it('applies the Y rule per word, not across the whole name', () => {
    expect(classesOf('MAY LYNN')).toEqual([
      'M:consonant',
      'A:vowel',
      'Y:consonant',
      'L:consonant',
      'Y:vowel',
      'N:consonant',
      'N:consonant',
    ])
  })

  it('honours the explicit Y policies', () => {
    const asVowel = analyseName('MAY', 'y-as-vowel').words[0]?.letters.at(-1)
    const asConsonant = analyseName('LYNN', 'y-as-consonant').words[0]?.letters[1]
    expect(asVowel?.letterClass).toBe('vowel')
    expect(asConsonant?.letterClass).toBe('consonant')
  })

  it('flags letters classified through the Y rule', () => {
    const analysis = analyseName('MARY')
    expect(analysis.words[0]?.letters.map((letter) => letter.classifiedByYRule)).toEqual([false, false, false, true])
  })
})

describe('determinism', () => {
  it('produces identical output for identical input', () => {
    expect(analyseName('TÉST-CASE ÆLPHA')).toEqual(analyseName('TÉST-CASE ÆLPHA'))
  })
})
