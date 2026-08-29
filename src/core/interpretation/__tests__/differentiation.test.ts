import { describe, expect, it } from 'vitest'
import { buildReport } from '../sintesi.ts'
import { buildPerson, TENDENCIES, PRACTICAL, AFFECTIVE, type TendencyId } from '../person.ts'
import { combination, relatingPair, thinkingPair, voice, balance } from '../../../content/person.it.ts'
import {
  SHAPE_A_FACTORS, SHAPE_A_NUMBERS, SHAPE_B_FACTORS, SHAPE_B_NUMBERS,
  chartOf, numerologyOf, type Factors,
} from './fixtures.ts'

/**
 * Two different people must not be given the same reading.
 *
 * The reading used to open from the single strongest tendency, so anyone who
 * shared it got the same two sentences whatever else was true of them. These
 * tests hold the replacement in place: the opening comes from what the two
 * leading tendencies do to each other, and may only repeat when both of them
 * repeat.
 */

const SIGNS = [
  'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
  'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
] as const
const ASPECTS = ['congiunzione', 'sestile', 'quadrato', 'trigono', 'opposizione'] as const

/** Twenty synthetic configurations: signs, houses, aspects and numbers only. */
function profiles() {
  const steps = [1, 5, 7, 11, 2, 3, 8, 4]
  return Array.from({ length: 20 }, (_unused, i) => {
    const pick = (o: number) => SIGNS[(i * (steps[o % steps.length] as number) + o * 3 + Math.floor(i / 4)) % 12] as (typeof SIGNS)[number]
    const factors = {
      ascendant: pick(0),
      placements: [
        ['sun', pick(1), (i % 12) + 1], ['moon', pick(4), ((i + 3) % 12) + 1],
        ['mercury', pick(2), ((i + 5) % 12) + 1], ['venus', pick(7), ((i + 7) % 12) + 1],
        ['mars', pick(9), ((i + 2) % 12) + 1], ['jupiter', pick(3), ((i + 9) % 12) + 1],
        ['saturn', pick(6), ((i + 11) % 12) + 1],
      ],
      aspects: [
        ['sun', ASPECTS[i % 5], 'moon', 1 + (i % 4)],
        ['mercury', ASPECTS[(i + 2) % 5], 'venus', 2 + (i % 3)],
        ['mars', ASPECTS[(i + 4) % 5], 'saturn', 1 + (i % 5)],
      ],
    } as unknown as Factors
    const numbers = {
      lifePath: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33][i % 12] as number,
      expression: [7, 3, 9, 1, 11, 4, 6, 22, 2, 8, 5, 33][i % 12] as number,
      soulUrge: [5, 8, 2, 7, 3, 9, 1, 6, 4, 11, 22, 33][(i + 4) % 12] as number,
      personality: [3, 1, 6, 9, 4, 2, 8, 5, 7, 33, 11, 22][(i + 8) % 12] as number,
      personalYear: (i % 9) + 1,
    }
    const chart = chartOf(factors)
    const numerology = numerologyOf(numbers)
    const person = buildPerson(chart, numerology)
    const report = buildReport({ chart, numerology })
    const text = report.sections.flatMap((section) => section.paragraphs)
    return {
      id: `P${String(i + 1).padStart(2, '0')}`,
      tendencies: person.tendencies.map((tendency) => tendency.id),
      opening: report.sections.find((section) => section.id === 'ritratto')?.paragraphs[0] ?? '',
      sentences: new Set(
        text.flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/).map((s) => s.trim())).filter((s) => s.length > 20),
      ),
      words: text.join(' ').split(/\s+/).length,
    }
  })
}

const REPORTS = profiles()
const firstSentence = (text: string) => text.split(/(?<=[.!?])\s+/)[0] ?? ''
const jaccard = <T>(a: Set<T>, b: Set<T>) => {
  let shared = 0
  for (const value of a) if (b.has(value)) shared += 1
  const union = a.size + b.size - shared
  return union === 0 ? 0 : shared / union
}

/** Rank-weighted overlap of the tendencies a reading is actually written from. */
function tendencySimilarity(a: readonly TendencyId[], b: readonly TendencyId[]): number {
  const weight = (list: readonly TendencyId[], id: TendencyId) => {
    const at = list.indexOf(id)
    return at === -1 ? 0 : 1 / (at + 1)
  }
  const top = (list: readonly TendencyId[]) => list.slice(0, 4)
  let shared = 0
  let total = 0
  for (const id of new Set([...top(a), ...top(b)])) {
    shared += Math.min(weight(top(a), id), weight(top(b), id))
    total += Math.max(weight(top(a), id), weight(top(b), id))
  }
  return total === 0 ? 0 : shared / total
}

describe('different configurations produce different readings', () => {
  it('gives no two profiles the same opening paragraph', () => {
    const openings = REPORTS.map((report) => report.opening)
    expect(new Set(openings).size, 'an opening paragraph repeated').toBe(openings.length)
  })

  it('repeats an opening sentence only when both leading tendencies repeat', () => {
    const violations: string[] = []
    for (let a = 0; a < REPORTS.length; a += 1) {
      for (let b = a + 1; b < REPORTS.length; b += 1) {
        const first = REPORTS[a] as (typeof REPORTS)[number]
        const other = REPORTS[b] as (typeof REPORTS)[number]
        if (firstSentence(first.opening) !== firstSentence(other.opening)) continue
        const pairOne = first.tendencies.slice(0, 2).join('>')
        const pairTwo = other.tendencies.slice(0, 2).join('>')
        // A shared dominant tendency alone must never be enough.
        if (pairOne !== pairTwo) violations.push(`${first.id}/${other.id}: ${pairOne} vs ${pairTwo}`)
      }
    }
    expect(violations, `openings repeated on one shared tendency:\n${violations.join('\n')}`).toEqual([])
  })

  it('never writes text more alike than the evidence behind it', () => {
    const suspicious: string[] = []
    for (let a = 0; a < REPORTS.length; a += 1) {
      for (let b = a + 1; b < REPORTS.length; b += 1) {
        const first = REPORTS[a] as (typeof REPORTS)[number]
        const other = REPORTS[b] as (typeof REPORTS)[number]
        const evidence = tendencySimilarity(first.tendencies, other.tendencies)
        const narrative = jaccard(first.sentences, other.sentences)
        if (narrative - evidence > 0.35) {
          suspicious.push(`${first.id}/${other.id}: evidence ${evidence.toFixed(2)} text ${narrative.toFixed(2)}`)
        }
      }
    }
    expect(suspicious, `text alike where the evidence is not:\n${suspicious.join('\n')}`).toEqual([])
  })

  it('keeps every reading a length a person will read', () => {
    for (const report of REPORTS) {
      expect(report.words, `${report.id} is ${report.words} words`).toBeGreaterThanOrEqual(120)
      expect(report.words, `${report.id} is ${report.words} words`).toBeLessThanOrEqual(550)
    }
  })
})

describe('the two configurations that produced the reported failure', () => {
  const reportOf = (factors: Factors, numbers: Parameters<typeof numerologyOf>[0]) => {
    const chart = chartOf(factors)
    const numerology = numerologyOf(numbers)
    return { person: buildPerson(chart, numerology), report: buildReport({ chart, numerology }) }
  }
  const A = reportOf(SHAPE_A_FACTORS, SHAPE_A_NUMBERS)
  const B = reportOf(SHAPE_B_FACTORS, SHAPE_B_NUMBERS)

  it('shares the dominant tendency, which is what made them collapse before', () => {
    expect(A.person.tendencies[0]?.id).toBe(B.person.tendencies[0]?.id)
    expect(A.person.tendencies[1]?.id).not.toBe(B.person.tendencies[1]?.id)
  })

  it('no longer opens them with the same words', () => {
    const openA = A.report.sections[0]?.paragraphs[0] ?? ''
    const openB = B.report.sections[0]?.paragraphs[0] ?? ''
    expect(openA).not.toBe(openB)
    expect(firstSentence(openA)).not.toBe(firstSentence(openB))
  })

  it('leaves them with little text in common', () => {
    const sentencesOf = (report: typeof A.report) =>
      new Set(
        report.sections
          .flatMap((section) => section.paragraphs)
          .flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/).map((s) => s.trim()))
          .filter((s) => s.length > 20),
      )
    const shared = [...sentencesOf(A.report)].filter((sentence) => sentencesOf(B.report).has(sentence))
    // What remains comes from an area where their tendencies genuinely coincide.
    expect(shared.length, `still shared:\n${shared.join('\n')}`).toBeLessThanOrEqual(4)
  })
})

describe('the interaction content is complete and specific', () => {
  it('writes every ordered pair of leading tendencies', () => {
    for (const a of TENDENCIES) {
      for (const b of TENDENCIES) {
        if (a === b) continue
        expect(combination[a][b], `no opening for ${a} shaped by ${b}`).toBeDefined()
      }
    }
  })

  it('writes every ordered pair within each area of life', () => {
    for (const a of PRACTICAL) {
      for (const b of PRACTICAL) {
        if (a !== b) expect(thinkingPair[a][b], `no thinking pair ${a}/${b}`).toBeDefined()
      }
    }
    for (const a of AFFECTIVE) {
      for (const b of AFFECTIVE) {
        if (a !== b) expect(relatingPair[a][b], `no relating pair ${a}/${b}`).toBeDefined()
      }
    }
  })

  it('says nothing that would fit almost anybody', () => {
    // The shapes a statement takes when it fits everybody: a hedge that covers
    // both cases, or a need every human has. Not a list of banned words — the
    // point is the construction, and a qualifier inside a specific claim is
    // not one of these.
    const generic = [
      // "sometimes X, sometimes the opposite"
      /\b(a volte|ogni tanto|talvolta)\b[^.]*\b(a volte|ogni tanto|talvolta|altre volte)\b/i,
      // "you are X but also the opposite of X"
      /\bsai essere\b[^.]*\bma anche\b/i,
      /\bpuoi essere\b[^.]*\bma anche\b/i,
      // needs no reader would deny
      /hai bisogno dei tuoi spazi/i,
      /cerchi autenticità/i,
      /hai bisogno di sentirti capito/i,
      /hai bisogno di essere amato/i,
      /\bpensi troppo\b/i,
      // an opening that hedges before it says anything
      /^(a volte|ogni tanto|talvolta|in generale|di solito)\b/i,
      /come tutti/i,
    ]
    const everything = [
      ...Object.values(combination).flatMap((entry) => Object.values(entry)),
      ...Object.values(thinkingPair).flatMap((entry) => Object.values(entry)),
      ...Object.values(relatingPair).flatMap((entry) => Object.values(entry)),
      ...Object.values(voice).flatMap((entry) => Object.values(entry)),
      ...Object.values(balance),
    ]
    for (const text of everything) {
      for (const shape of generic) {
        expect(shape.test(text), `generic: ${text.slice(0, 70)}`).toBe(false)
      }
      // Every statement has to make a claim, not hedge into nothing.
      expect(text.length, `too short to say anything: ${text}`).toBeGreaterThan(40)
    }
  })
})

describe('every visible statement stays traceable', () => {
  it('shows the calculated facts behind each section', () => {
    for (const profile of [SHAPE_A_FACTORS, SHAPE_B_FACTORS].map((factors, index) => ({
      factors,
      numbers: index === 0 ? SHAPE_A_NUMBERS : SHAPE_B_NUMBERS,
    }))) {
      const report = buildReport({ chart: chartOf(profile.factors), numerology: numerologyOf(profile.numbers) })
      for (const section of report.sections) {
        expect(section.evidence.length, `${section.id} shows nothing behind it`).toBeGreaterThan(0)
      }
    }
  })
})
