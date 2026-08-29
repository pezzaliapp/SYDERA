import { describe, expect, it } from 'vitest'
import { buildReport } from '../sintesi.ts'
import { buildPerson, TENDENCIES } from '../person.ts'
import { balance, combination, moment, voice } from '../../../content/person.it.ts'
import {
  A_FACTORS, A_NUMBERS, B_FACTORS, B_NUMBERS, C_NUMBERS, D_FACTORS, D_NUMBERS,
  chartOf, numerologyOf,
} from './fixtures.ts'

/**
 * The reading is written for someone who knows nothing about astrology or
 * numerology. These tests enforce that: what the reader sees must be about
 * them, in ordinary Italian, and must never explain how it was produced.
 */

/** Technical vocabulary of the two systems. None of it belongs in the reading. */
const TECHNICAL = [
  'Sole', 'Luna', 'Mercurio', 'Venere', 'Marte', 'Giove', 'Saturno', 'Urano', 'Nettuno', 'Plutone',
  'Ascendente', 'Medio Cielo', 'casa astrologica', 'zodiac', 'segno zodiacale',
  'trigono', 'quadrato', 'sestile', 'opposizione', 'congiunzione', 'orbita', 'retrogrado',
  'Sentiero di vita', 'Espressione', 'Anima', 'Personalità', 'numero maestro', 'Anno personale',
]

/** Language that talks about SYDERA instead of about the reader. */
const METHODOLOGICAL = [
  'le due letture', 'i due sistemi', 'le posizioni', 'i numeri', 'gli indicatori',
  'punti del quadro', 'del quadro', 'nel quadro', 'nel testo', 'sostenuto da', 'confermato da',
  'non trova conferma', 'le evidenze', 'fattori distinti', 'ricorre in più punti', 'converge',
  'entrambi i sistemi', 'una sola delle due', 'astrologia', 'numerologia', 'simbolic',
]

const REPORTS = {
  A: buildReport({ chart: chartOf(A_FACTORS), numerology: numerologyOf(A_NUMBERS) }),
  B: buildReport({ chart: chartOf(B_FACTORS), numerology: numerologyOf(B_NUMBERS) }),
  C: buildReport({ chart: null, numerology: numerologyOf(C_NUMBERS) }),
  D: buildReport({ chart: chartOf(D_FACTORS), numerology: numerologyOf(D_NUMBERS) }),
}

/**
 * Whole-word match. A plain substring test flags "Urano" inside "maturano",
 * and Italian accented endings defeat \b, so the boundaries are explicit.
 */
const mentions = (text: string, term: string): boolean =>
  new RegExp(`(?<![a-zà-ùA-ZÀ-Ù])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zà-ùA-ZÀ-Ù])`, 'i').test(text)

const visibleText = (report: { sections: readonly { paragraphs: readonly string[] }[] }) =>
  report.sections.flatMap((section) => section.paragraphs).join(' ')

describe('the reading speaks about the reader, not about the method', () => {
  for (const [name, report] of Object.entries(REPORTS)) {
    it(`${name} contains no technical astrology or numerology term`, () => {
      const text = visibleText(report)
      for (const term of TECHNICAL) {
        expect(mentions(text, term), `"${term}" appears in the reading`).toBe(false)
      }
    })

    it(`${name} never explains how it was produced`, () => {
      const text = visibleText(report).toLowerCase()
      for (const term of METHODOLOGICAL) {
        expect(text, `"${term}" appears in the reading`).not.toContain(term)
      }
    })

    it(`${name} has no repeated sentence`, () => {
      const seen = new Set<string>()
      for (const section of report.sections) {
        for (const paragraph of section.paragraphs) {
          for (const sentence of paragraph.split(/(?<=[.!?])\s+/).map((part) => part.trim())) {
            if (sentence.length < 20) continue
            expect(seen.has(sentence), `repeated: ${sentence}`).toBe(false)
            seen.add(sentence)
          }
        }
      }
    })

    it(`${name} has no empty section and no template leak`, () => {
      expect(report.sections.length).toBeGreaterThan(0)
      for (const section of report.sections) {
        expect(section.title.length).toBeGreaterThan(0)
        expect(section.paragraphs.length).toBeGreaterThan(0)
        for (const paragraph of section.paragraphs) {
          expect(paragraph.trim().length).toBeGreaterThan(20)
          expect(paragraph).not.toMatch(/undefined|NaN|\[object|\$\{/)
        }
      }
    })

    it(`${name} keeps every section traceable`, () => {
      for (const section of report.sections) {
        expect(section.evidence.length, `${section.id} shows nothing behind it`).toBeGreaterThan(0)
        for (const fact of section.evidence) {
          expect(fact.label.length).toBeGreaterThan(0)
          // Internal machinery must never reach the reader.
          expect(fact.label).not.toMatch(/weight|score|hash|:\d+\.\d+/)
        }
      }
    })
  }

  it('stays within a length a person will actually read', () => {
    for (const [name, report] of Object.entries(REPORTS)) {
      const words = visibleText(report).split(/\s+/).length
      expect(words, `${name} is ${words} words`).toBeGreaterThanOrEqual(150)
      expect(words, `${name} is ${words} words`).toBeLessThanOrEqual(500)
    }
  })
})

describe('the reading opens with the portrait', () => {
  it('leads with "Il tuo ritratto" whenever there is one', () => {
    for (const report of [REPORTS.A, REPORTS.B, REPORTS.D]) {
      expect(report.sections[0]?.id).toBe('ritratto')
    }
  })

  it('opens on what the leading tendencies do to each other', () => {
    const opening = REPORTS.D.sections[0]?.paragraphs[0] ?? ''
    const sentences = opening.split(/(?<=[.!?])\s+/).filter((part) => part.trim().length > 0)
    expect(sentences.length).toBeGreaterThanOrEqual(2)
    // Second person: the reading addresses the reader directly.
    expect(opening).toMatch(/\b(hai|ti|sei|senti|vai|decidi|noti|cerchi|vuoi|percepisci|giudichi)\b/i)

    // The first sentence must be one of the pair statements, never a
    // description of the single strongest tendency.
    const person = buildPerson(chartOf(D_FACTORS), numerologyOf(D_NUMBERS))
    const [first, second] = person.tendencies
    expect(sentences[0]).toBe(combination[first!.id][second!.id])
  })

  it('never opens with a disclaimer', () => {
    for (const report of Object.values(REPORTS)) {
      expect(report.sections[0]?.paragraphs[0] ?? '').not.toMatch(/lettura simbolica|non è una valutazione/i)
    }
  })
})

describe('sections appear only when the evidence supports them', () => {
  it('omits what a sparse profile cannot support', () => {
    const ids = REPORTS.C.sections.map((section) => section.id)
    expect(ids).toContain('ritratto')
    // Numbers alone give no affective tendency here, so that section is absent
    // rather than filled with something vaguer.
    expect(ids.length).toBeLessThan(REPORTS.A.sections.length)
  })

  it('produces nothing at all when nothing was calculated', () => {
    expect(buildReport({ chart: null, numerology: null }).sections).toHaveLength(0)
  })

  it('is deterministic', () => {
    const once = buildReport({ chart: chartOf(D_FACTORS), numerology: numerologyOf(D_NUMBERS) })
    const twice = buildReport({ chart: chartOf(D_FACTORS), numerology: numerologyOf(D_NUMBERS) })
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice))
  })

  it('says different things about different profiles', () => {
    expect(visibleText(REPORTS.A)).not.toBe(visibleText(REPORTS.B))
    expect(visibleText(REPORTS.B)).not.toBe(visibleText(REPORTS.D))
  })
})

describe('the person model stays small and supported', () => {
  it('needs more than one calculated factor before naming a tendency', () => {
    const person = buildPerson(chartOf(D_FACTORS), numerologyOf(D_NUMBERS))
    for (const tendency of person.tendencies) {
      expect(tendency.evidence.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('writes every tendency and every pair of tendencies', () => {
    for (const tendency of TENDENCIES) {
      expect(voice[tendency], `${tendency} has no voice`).toBeDefined()
    }
    for (const a of TENDENCIES) {
      for (const b of TENDENCIES) {
        if (a >= b) continue
        expect(balance[[a, b].sort().join('|')], `no balance text for ${a}|${b}`).toBeDefined()
      }
    }
  })

  it('describes every personal year the engine can produce', () => {
    for (const year of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
      expect(moment[year], `no text for personal year ${year}`).toBeDefined()
    }
  })
})

describe('the editorial content itself obeys the rules', () => {
  const everything = [
    ...Object.values(voice).flatMap((entry) => Object.values(entry)),
    ...Object.values(balance),
    ...Object.values(moment),
  ]

  it('contains no technical term anywhere in the library', () => {
    for (const text of everything) {
      for (const term of TECHNICAL) {
        expect(mentions(text, term), `"${term}" in: ${text.slice(0, 60)}`).toBe(false)
      }
    }
  })

  it('contains no methodological language anywhere in the library', () => {
    for (const text of everything) {
      for (const term of METHODOLOGICAL) {
        expect(text.toLowerCase(), `"${term}" in: ${text.slice(0, 60)}`).not.toContain(term)
      }
    }
  })

  it('avoids the algorithmic constructions of the previous engine', () => {
    const banned = [
      'trova un appoggio', 'registro affettivo', 'la direzione è di sintesi', 'come lo si porta in giro',
      'i due poli', 'poggia su un appoggio', 'si colloca sullo stesso asse', 'la dinamica si presenta',
      'una sicurezza fatta di', 'va presa per quello che è',
    ]
    for (const text of everything) {
      for (const phrase of banned) {
        expect(text.toLowerCase()).not.toContain(phrase)
      }
    }
  })

  it('addresses the reader in the second person throughout', () => {
    // A closed set of pronouns and auxiliaries, so the check does not need a
    // list of verbs kept in step with the prose.
    const secondPerson = /\b(ti|te|tu|tuo|tua|tuoi|tue|hai|sei|vuoi|puoi|devi|sai)\b/i
    for (const text of [
      ...Object.values(voice).flatMap((entry) => Object.values(entry)),
      ...Object.values(balance),
    ]) {
      expect(secondPerson.test(text), `not addressed to the reader: ${text.slice(0, 70)}`).toBe(true)
    }
  })
})
