/**
 * The reading.
 *
 * Five sections, each written from the person model rather than from any
 * single calculated factor. A section that the evidence cannot support is left
 * out; nothing here exists to fill a page.
 */
import type { CompleteChart } from '../astrology/chart.ts'
import type { NumerologyProfile } from '../numerology/profile.ts'
import { it } from '../../content/it.ts'
import { balance, moment, voice } from '../../content/person.it.ts'
import { AFFECTIVE, PRACTICAL, balancePair, buildPerson, strongestIn, type Tendency } from './person.ts'
import type { Evidence, Report, ReportSection } from './types.ts'

export interface ReportInput {
  readonly chart: CompleteChart | null
  readonly numerology: NumerologyProfile | null
}

/** How many calculated facts to show per section. Enough to check, not a dump. */
const EVIDENCE_PER_SECTION = 6

export function buildReport({ chart, numerology }: ReportInput): Report {
  const person = buildPerson(chart, numerology)
  const sections: ReportSection[] = []

  // 1. The portrait. The first three sentences are the product: what this
  //    person is like, said plainly, with the nuance that stops it being
  //    a description of everybody.
  const [first, second, third] = person.tendencies
  if (first && second) {
    const paragraphs = [`${voice[first.id].lead} ${voice[first.id].drive} ${voice[second.id].second}`]
    // The nuance is what stops a portrait reading like everybody. When there is
    // no third tendency the second one supplies it, since it is what the
    // evidence actually carries.
    paragraphs.push(voice[(third ?? second).id].hidden)
    sections.push({
      id: 'ritratto',
      title: it.report.sections.ritratto,
      paragraphs,
      evidence: factsOf([first, second, ...(third ? [third] : [])]),
    })
  }

  // 2. Thinking, deciding, working.
  const practical = strongestIn(person, PRACTICAL, 3)
  if (practical.length > 0) {
    sections.push({
      id: 'pensiero',
      title: it.report.sections.pensiero,
      paragraphs: practical.map((tendency) => voice[tendency.id].thinking),
      evidence: factsOf(practical),
    })
  }

  // 3. Feelings and people.
  const affective = strongestIn(person, AFFECTIVE, 3)
  if (affective.length > 0) {
    sections.push({
      id: 'emozioni',
      title: it.report.sections.emozioni,
      paragraphs: affective.map((tendency) => voice[tendency.id].relating),
      evidence: factsOf(affective),
    })
  }

  // 4. The balance point: how the two strongest tendencies work on each other.
  //    One idea, written once for each pair, never averaged into neutrality.
  const pair = balancePair(person)
  if (pair) {
    const key = [pair[0].id, pair[1].id].sort().join('|')
    const text = balance[key]
    if (text) {
      sections.push({
        id: 'equilibrio',
        title: it.report.sections.equilibrio,
        paragraphs: [text],
        evidence: factsOf([pair[0], pair[1]]),
      })
    }
  }

  // 5. The current period, described rather than predicted.
  if (person.moment) {
    const text = moment[person.moment.year]
    if (text) {
      sections.push({
        id: 'momento',
        title: it.report.sections.momento,
        paragraphs: [text],
        evidence: [person.moment.evidence],
      })
    }
  }

  return { sections }
}

/** The calculated facts behind a set of tendencies, strongest first, deduped. */
function factsOf(tendencies: readonly Tendency[]): Evidence[] {
  const seen = new Set<string>()
  const facts: Evidence[] = []
  // Interleaved so each tendency shows its strongest fact before any shows a
  // second one: the list stays representative when it is cut short.
  const longest = Math.max(0, ...tendencies.map((tendency) => tendency.evidence.length))
  for (let index = 0; index < longest; index += 1) {
    for (const tendency of tendencies) {
      const fact = tendency.evidence[index]
      if (!fact || seen.has(fact.key)) continue
      seen.add(fact.key)
      facts.push(fact)
      if (facts.length >= EVIDENCE_PER_SECTION) return facts
    }
  }
  return facts
}
