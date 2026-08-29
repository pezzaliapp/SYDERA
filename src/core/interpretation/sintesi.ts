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
import { balance, combination, moment, relatingPair, thinkingPair, voice } from '../../content/person.it.ts'
import { AFFECTIVE, OPPOSED, PRACTICAL, buildPerson, strongestIn, type Tendency, type TendencyId } from './person.ts'
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

  // 1. The portrait, written from the way the leading tendencies act on each
  //    other rather than from the strongest one alone. Opening from a single
  //    trait meant two people who shared it began with the same two sentences
  //    whatever else was true of them.
  const [first, second, third, fourth] = person.tendencies
  if (first && second) {
    const opening = combination[first.id][second.id]
    if (opening) {
      const used: Tendency[] = [first, second]
      const sentences = [opening]

      // A third tendency the evidence carries is what else is strongly there.
      if (third) {
        sentences.push(voice[third.id].second)
        used.push(third)
      }

      // The nuance comes from the next tendency down, so it is not another
      // statement about the ones already described.
      const nuance = fourth ?? third ?? second
      const paragraphs = [sentences.join(' '), voice[nuance.id].hidden]
      if (fourth) used.push(fourth)

      sections.push({
        id: 'ritratto',
        title: it.report.sections.ritratto,
        paragraphs,
        evidence: factsOf(used),
      })
    }
  }

  // 2. Thinking, deciding, working — opened by what the two strongest
  //    practical tendencies do to each other, not by a list of traits.
  const practical = strongestIn(person, PRACTICAL, 4)
  if (practical.length > 0) {
    sections.push({
      id: 'pensiero',
      title: it.report.sections.pensiero,
      paragraphs: paired(practical, thinkingPair, (tendency) => voice[tendency.id].thinking),
      evidence: factsOf(practical),
    })
  }

  // 3. Feelings and people, built the same way.
  const affective = strongestIn(person, AFFECTIVE, 4)
  if (affective.length > 0) {
    sections.push({
      id: 'emozioni',
      title: it.report.sections.emozioni,
      paragraphs: paired(affective, relatingPair, (tendency) => voice[tendency.id].relating),
      evidence: factsOf(affective),
    })
  }

  // 4. The balance point: the most meaningful interaction this person's
  //    evidence supports — a real pull between two tendencies where there is
  //    one, and never the pair the portrait has already described.
  const pair = balancePair(person.tendencies, first && second ? [first.id, second.id] : null)
  if (pair) {
    const text = balance[[pair[0].id, pair[1].id].sort().join('|')]
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

/**
 * A section written from the interaction of the two strongest tendencies in
 * its area, followed by what the third one adds.
 *
 * Falls back to the single-tendency sentences when the evidence carries only
 * one tendency, or when the pair has nothing written for it — never to
 * something vaguer.
 */
function paired(
  tendencies: readonly Tendency[],
  pairs: Readonly<Record<TendencyId, Readonly<Partial<Record<TendencyId, string>>>>>,
  alone: (tendency: Tendency) => string,
): string[] {
  const [first, second] = tendencies
  if (!first) return []
  const opening = second ? pairs[first.id][second.id] : undefined
  if (!opening) return tendencies.map(alone)
  // The interaction opens the section; the tendencies below the two that
  // produced it each add what they carry on their own. When there is nothing
  // below them, the second one still has more to say than the pair sentence
  // had room for.
  const rest = tendencies.slice(2)
  return rest.length > 0 ? [opening, ...rest.map(alone)] : [opening, alone(tendencies[1] as Tendency)]
}

/**
 * Which two tendencies the balance point should be about.
 *
 * A pull between opposites says more than two tendencies that simply coexist,
 * so one is preferred; and the pair the portrait already used is skipped while
 * any other is available, so the two sections describe two interactions rather
 * than the same one twice.
 */
function balancePair(
  tendencies: readonly Tendency[],
  usedByPortrait: readonly [TendencyId, TendencyId] | null,
): readonly [Tendency, Tendency] | null {
  const top = tendencies.slice(0, 4)
  if (top.length < 2) return null

  const pairs: Array<readonly [Tendency, Tendency]> = []
  for (let a = 0; a < top.length; a += 1) {
    for (let b = a + 1; b < top.length; b += 1) {
      pairs.push([top[a] as Tendency, top[b] as Tendency])
    }
  }

  const isPortraitPair = (candidate: readonly [Tendency, Tendency]): boolean =>
    usedByPortrait !== null &&
    ((candidate[0].id === usedByPortrait[0] && candidate[1].id === usedByPortrait[1]) ||
      (candidate[0].id === usedByPortrait[1] && candidate[1].id === usedByPortrait[0]))

  const opposed = (candidate: readonly [Tendency, Tendency]): boolean =>
    OPPOSED.includes([candidate[0].id, candidate[1].id].sort().join('|'))

  const byStrength = (x: readonly [Tendency, Tendency], y: readonly [Tendency, Tendency]): number =>
    y[0].score + y[1].score - (x[0].score + x[1].score)

  const fresh = pairs.filter((candidate) => !isPortraitPair(candidate))
  const opposedFresh = fresh.filter(opposed).sort(byStrength)
  if (opposedFresh[0]) return opposedFresh[0]
  const anyFresh = [...fresh].sort(byStrength)
  if (anyFresh[0]) return anyFresh[0]
  return pairs.sort(byStrength)[0] ?? null
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
