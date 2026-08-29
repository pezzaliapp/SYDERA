/**
 * Italian morphology for generated text.
 *
 * Composed sentences get grammar wrong in predictable ways: a preposition
 * before a proper noun, an article where none belongs, a participle that does
 * not agree with its subject. Rather than patching each call site, every
 * generated label goes through here.
 *
 * Two facts decide almost everything:
 *  - planets are proper nouns and take no article ("in quadrato a Venere"),
 *    while the calculated points are common nouns and do ("al Medio Cielo");
 *  - only the participle "congiunto" inflects; the other aspect names do not.
 */
import type { AspectId, AspectPoint } from '../astrology/types.ts'

interface PointGrammar {
  readonly label: string
  readonly gender: 'm' | 'f'
  /** True for common nouns, which take the article after a preposition. */
  readonly takesArticle: boolean
  /** True when the label begins with a vowel, so the article elides. */
  readonly vowelInitial: boolean
}

export const POINTS: Readonly<Record<AspectPoint, PointGrammar>> = Object.freeze({
  sun: { label: 'Sole', gender: 'm', takesArticle: false, vowelInitial: false },
  moon: { label: 'Luna', gender: 'f', takesArticle: false, vowelInitial: false },
  mercury: { label: 'Mercurio', gender: 'm', takesArticle: false, vowelInitial: false },
  venus: { label: 'Venere', gender: 'f', takesArticle: false, vowelInitial: false },
  mars: { label: 'Marte', gender: 'm', takesArticle: false, vowelInitial: false },
  jupiter: { label: 'Giove', gender: 'm', takesArticle: false, vowelInitial: false },
  saturn: { label: 'Saturno', gender: 'm', takesArticle: false, vowelInitial: false },
  uranus: { label: 'Urano', gender: 'm', takesArticle: false, vowelInitial: true },
  neptune: { label: 'Nettuno', gender: 'm', takesArticle: false, vowelInitial: false },
  pluto: { label: 'Plutone', gender: 'm', takesArticle: false, vowelInitial: false },
  ascendant: { label: 'Ascendente', gender: 'm', takesArticle: true, vowelInitial: true },
  midheaven: { label: 'Medio Cielo', gender: 'm', takesArticle: true, vowelInitial: false },
})

export function pointLabel(point: AspectPoint): string {
  return POINTS[point]?.label ?? String(point)
}

/**
 * "a" plus a point, with the article only where Italian wants one:
 *   a Venere · a Urano · all'Ascendente · al Medio Cielo
 */
export function toPoint(point: AspectPoint): string {
  const grammar = POINTS[point]
  if (!grammar) return `a ${String(point)}`
  if (!grammar.takesArticle) return `a ${grammar.label}`
  return grammar.vowelInitial ? `all’${grammar.label}` : `al ${grammar.label}`
}

/** The aspect name, agreeing with its subject where the language requires it. */
export function aspectName(aspect: AspectId, subject: AspectPoint): string {
  if (aspect !== 'congiunzione') {
    const names: Record<string, string> = {
      sestile: 'in sestile',
      quadrato: 'in quadrato',
      trigono: 'in trigono',
      opposizione: 'in opposizione',
    }
    return names[aspect] ?? aspect
  }
  // Only this one is a participle, so only this one agrees.
  return POINTS[subject]?.gender === 'f' ? 'congiunta' : 'congiunto'
}

/** "Luna congiunta a Venere", "Mercurio in quadrato al Medio Cielo". */
export function aspectLabel(subject: AspectPoint, aspect: AspectId, target: AspectPoint): string {
  return `${pointLabel(subject)} ${aspectName(aspect, subject)} ${toPoint(target)}`
}

/** Euphonic "ed" before a vowel, and an Oxford-free list. */
export function joinWithAnd(parts: readonly string[]): string {
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0] as string
  const last = parts[parts.length - 1] as string
  const conjunction = /^[aeiouAEIOU]/.test(last) ? 'ed' : 'e'
  return `${parts.slice(0, -1).join(', ')} ${conjunction} ${last}`
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Tidies the artefacts composition produces: doubled punctuation, a space
 * before a mark, a stray sequence of two full stops.
 */
export function tidy(text: string): string {
  return text
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/([,;:])\1+/g, '$1')
    .replace(/\.{2,}/g, '.')
    .replace(/:\s*:/g, ':')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * A stable index from a pair of names, so a phrasing variant is chosen by the
 * factors involved and never changes between runs.
 */
export function stableIndex(key: string, buckets: number): number {
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 1_000_003
  }
  return buckets > 0 ? hash % buckets : 0
}
