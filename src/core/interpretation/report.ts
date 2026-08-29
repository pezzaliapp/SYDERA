/**
 * The report.
 *
 * Ten possible sections, each built only from signals that exist. A section
 * with nothing behind it is omitted and the reason is recorded, rather than
 * padded with a sentence that would fit anyone.
 */
import type { Chart } from '../astrology/chart.ts'
import type { ConvergenceResult } from '../convergence/taxonomy.ts'
import type { Transit } from '../cycles/transits.ts'
import type { NumerologyProfile } from '../numerology/profile.ts'
import { it } from '../../content/it.ts'
import {
  personalYearTheme,
  strengthsOpening,
  themeCharacter,
  themeDrive,
  threadPhrases,
} from '../../content/interpretation.it.ts'
import { bodyReadings } from '../../content/astrologyThemes.it.ts'
import { buildPortrait } from './portrait.ts'
import { aspectName, pointLabel, tidy, toPoint } from './italian.ts'
import { astrologySignals, numerologySignals } from './signals.ts'
import { capitalise, rankThemes, strengths, tensions } from './synthesis.ts'
import { MAX_STATEMENTS_PER_DOMAIN } from './weights.ts'
import {
  DOMAINS,
  type DomainId,
  type Evidence,
  type OmittedSection,
  type Report,
  type ReportSection,
  type Signal,
} from './types.ts'

export interface ReportInput {
  readonly chart: Chart | null
  readonly numerology: NumerologyProfile | null
  readonly convergence: ConvergenceResult
  readonly transits: readonly Transit[]
}

/** One statement per sentence: sober, and easy to read on a phone. */
function paragraphFrom(signals: readonly Signal[]): string {
  const usedClauses = new Set<string>()
  return signals
    .map((signal) => {
      // The same "…, soprattutto nel lavoro quotidiano" twice in one paragraph
      // reads as a template rather than a reading.
      const [head, ...tail] = signal.statement.split(', soprattutto ')
      if (tail.length === 0) return capitalise(signal.statement)
      const clause = tail.join(', soprattutto ')
      if (usedClauses.has(clause)) return capitalise(head as string)
      usedClauses.add(clause)
      return capitalise(signal.statement)
    })
    .map((sentence) => `${sentence}.`)
    .join(' ')
}

/** Every paragraph the report emits passes through the tidier. */
function clean(paragraphs: readonly string[]): string[] {
  return paragraphs.map((paragraph) => tidy(paragraph))
}

function uniqueEvidence(signals: readonly Signal[]): Evidence[] {
  const seen = new Set<string>()
  const evidence: Evidence[] = []
  for (const signal of signals) {
    if (seen.has(signal.evidence.key)) continue
    seen.add(signal.evidence.key)
    evidence.push(signal.evidence)
  }
  return evidence
}

const DOMAIN_SECTION: Record<DomainId, keyof typeof it.report.sections> = {
  presentazione: 'presentazione',
  mente: 'mente',
  emozioni: 'emozioni',
  relazioni: 'relazioni',
  azione: 'azione',
}

export function buildReport(input: ReportInput): Report {
  const { chart, numerology, convergence, transits } = input

  const signals: Signal[] = [
    ...(chart?.kind === 'complete' ? astrologySignals(chart) : []),
    ...(numerology ? numerologySignals(numerology) : []),
  ]

  const sections: ReportSection[] = []
  const omitted: OmittedSection[] = []
  const ranked = rankThemes(signals)

  const missingReason = (): string => {
    if (!chart || chart.kind !== 'complete') {
      return numerology ? it.report.reasons.noChart : it.report.reasons.noSignals
    }
    return numerology ? it.report.reasons.noSignals : it.report.reasons.noName
  }

  // 1. The portrait, composed from relations between factors rather than from
  //    a list of them. A chart with nothing to relate gets no portrait.
  const portrait = buildPortrait({
    chart: chart?.kind === 'complete' ? chart : null,
    numerology,
    themes: ranked,
  })

  if (portrait && portrait.combinations >= 1) {
    sections.push({
      id: 'profilo',
      title: it.report.sections.profilo,
      paragraphs: [...portrait.paragraphs],
      evidence: portrait.evidence,
    })
  } else {
    omitted.push({ id: 'profilo', title: it.report.sections.profilo, reason: missingReason() })
  }

  // 2-6. One section per domain, from the factors that speak about it.
  // The portrait speaks its own language now, so a domain sentence can never
  // duplicate it. The guard stays as a structural safety net.
  const portraitSentences = new Set(
    (portrait?.paragraphs ?? []).flatMap((paragraph) => paragraph.split(/(?<=\.)\s+/).map((s) => s.trim())),
  )

  for (const domain of DOMAINS) {
    const candidates = signals.filter((signal) => signal.domain === domain).sort((a, b) => b.weight - a.weight)

    // The strongest factor always opens its own section, even if the portrait
    // quoted it: dropping the Ascendant from "come ti presenti" to avoid an
    // echo would cost more than the echo does.
    const [primary, ...others] = candidates
    if (!primary) {
      omitted.push({ id: domain, title: it.report.sections[DOMAIN_SECTION[domain]], reason: missingReason() })
      continue
    }

    // Aspects support a reading; more than one in a paragraph turns into a
    // list of near-identical clauses.
    let aspectsUsed = 0
    const supporting = others
      .filter((signal) => !portraitSentences.has(`${capitalise(signal.statement)}.`))
      .filter((signal) => {
        if (!signal.evidence.key.startsWith('aspect:')) return true
        if (aspectsUsed >= 1) return false
        aspectsUsed += 1
        return true
      })

    const forDomain = [primary, ...supporting].slice(0, MAX_STATEMENTS_PER_DOMAIN)

    // A section resting on a single, secondary statement is not a reading of
    // that area: it is one sentence with a heading over it.
    if (forDomain.length === 1 && (forDomain[0] as Signal).weight < 2) {
      omitted.push({
        id: domain,
        title: it.report.sections[DOMAIN_SECTION[domain]],
        reason: it.report.reasons.thinEvidence,
      })
      continue
    }

    sections.push({
      id: domain,
      title: it.report.sections[DOMAIN_SECTION[domain]],
      paragraphs: [paragraphFrom(forDomain)],
      evidence: uniqueEvidence(forDomain),
    })
  }

  // 7. Strengths: themes more than one factor supports.
  const strong = strengths(ranked)
  if (strong.length > 1) {
    const [first, second] = strong
    const paragraphs: string[] = []

    if (first) {
      const distinct = new Set(first.evidence.map((item) => item.key)).size
      const support = first.systems.length > 1 ? strengthsOpening.bothSystems : strengthsOpening.oneSystem
      const drive = themeDrive[first.theme] ?? it.convergence.themes[first.theme]
      const character = themeCharacter[first.theme]
      const where = domainsOf(first.evidence, sections)

      paragraphs.push(
        `${strengthsOpening.lead(drive, distinct)}${support}. ` +
          (character ? `${capitalise(character)}.` : '') +
          (where ? ` ${strengthsOpening.domainsLead(where)}.` : ''),
      )
    }

    if (second && first) {
      const drive = themeDrive[second.theme] ?? it.convergence.themes[second.theme]
      const character = themeCharacter[second.theme]
      const support = second.systems.length > 1 ? strengthsOpening.bothSystems : strengthsOpening.oneSystem

      const firstDomains = domainTitles(first.evidence, sections)
      const shared = domainTitles(second.evidence, sections).filter((title) => firstDomains.includes(title))
      // Re-listing the domains the paragraph above just named adds nothing;
      // when the overlap is total, saying so is shorter and more honest.
      const relation =
        shared.length === 0
          ? strengthsOpening.apartFrom(themeDrive[first.theme] ?? '', drive)
          : shared.length === firstDomains.length
            ? strengthsOpening.sameGround
            : strengthsOpening.meetIn(joinTitles(shared))

      paragraphs.push(
        `${strengthsOpening.alongside(drive)}${support}. ` +
          (character ? `${capitalise(character)}. ` : '') +
          `${relation}.`,
      )
    }

    sections.push({
      id: 'forze',
      title: it.report.sections.forze,
      paragraphs,
      evidence: dedupeEvidence(strong.slice(0, 3).flatMap((entry) => entry.evidence)),
    })
  } else {
    omitted.push({
      id: 'forze',
      title: it.report.sections.forze,
      reason: strong.length === 1 ? it.report.reasons.singleStrength : missingReason(),
    })
  }

  // 8. Tensions, named rather than averaged away.
  const domainText = sections
    .filter((section) => (DOMAINS as readonly string[]).includes(section.id))
    .flatMap((section) => section.paragraphs)
    .join(' ')

  const foundTensions = tensions(signals, convergence, ranked).filter((tension) => {
    // A hard aspect already explained inside a domain does not need repeating.
    const firstSentence = tension.statement.split(/(?<=\.)\s+/)[0]?.trim() ?? ''
    return firstSentence.length < 25 || !domainText.includes(firstSentence)
  })
  // Three paragraphs built from the same template read as filler. One example
  // of each kind of tension says more than three of the same kind.
  const varied = ['contrasto-fra-sistemi', 'temi-opposti', 'aspetto-di-tensione']
    .flatMap((kind) => foundTensions.filter((tension) => tension.kind === kind).slice(0, kind === 'aspetto-di-tensione' ? 2 : 1))
    .slice(0, 3)

  if (varied.length > 0) {
    sections.push({
      id: 'tensioni',
      title: it.report.sections.tensioni,
      paragraphs: varied.map((tension) => tension.statement),
      evidence: dedupeEvidence(varied.flatMap((tension) => tension.evidence)),
    })
  } else if (signals.length > 0) {
    // Saying "nothing in conflict" is a finding, not filler — but only when
    // there was enough evidence for the question to mean anything.
    sections.push({
      id: 'tensioni',
      title: it.report.sections.tensioni,
      paragraphs: [it.report.noTensionFound],
      evidence: [],
    })
  } else {
    omitted.push({ id: 'tensioni', title: it.report.sections.tensioni, reason: missingReason() })
  }

  // 9. The thread: the single dominant theme and where it shows up.
  const leading = ranked[0]

  // The closing section earns its place only when there is both something that
  // recurs and something that qualifies it. A thread that restates the leading
  // theme is the same paragraph written twice.
  // A tension between two themes describes a richer dynamic than a single
  // system falling silent, so it is preferred when both are available.
  const qualifying =
    foundTensions.find((tension) => tension.kind === 'temi-opposti' && tension.poles) ??
    foundTensions.find((tension) => tension.kind === 'contrasto-fra-sistemi' && tension.poles)

  const threadPossible = leading !== undefined && leading.evidence.length >= 2 && qualifying?.poles !== undefined

  if (threadPossible && leading && qualifying?.poles) {
    const leadingDrive = themeDrive[leading.theme] ?? it.convergence.themes[leading.theme]
    // If the leading tendency is itself one pole of the tension, the other
    // pole is what qualifies it; otherwise the tension's own leading pole does.
    const counterDrive =
      qualifying.poles.leading === leadingDrive ? qualifying.poles.counter : qualifying.poles.leading
    // A system contrast already states that one language is silent; adding
    // "both readings arrive here" on top of it would contradict the sentence
    // immediately before.
    const systems =
      qualifying.kind === 'contrasto-fra-sistemi'
        ? ''
        : leading.systems.length > 1
          ? threadPhrases.bothSystems
          : threadPhrases.oneSystem

    sections.push({
      id: 'filo',
      title: it.report.sections.filo,
      paragraphs: [
        `${threadPhrases.opening(leadingDrive)}, ${threadPhrases.qualifiedBy(counterDrive)}. ` +
          `${threadPhrases.closing[qualifying.kind] ?? ''} ${systems}`.trim(),
      ],
      evidence: dedupeEvidence([...leading.evidence.slice(0, 3), ...qualifying.evidence.slice(0, 3)]),
    })
  } else {
    omitted.push({
      id: 'filo',
      title: it.report.sections.filo,
      reason: leading ? it.report.reasons.threadRepeats : it.report.reasons.noSignals,
    })
  }

  // 10. The current cycle, only where the calculations support it.
  if (numerology) {
    const yearTheme = personalYearTheme[numerology.personalYear.value]
    const paragraphs: string[] = []
    const evidence: Evidence[] = [
      {
        system: 'numerologia',
        label: `Anno personale ${numerology.personalYear.value}`,
        key: `personalYear:${numerology.personalYear.value}`,
      },
    ]
    if (yearTheme) paragraphs.push(`${it.report.cycleLead} ${yearTheme}.`)

    const notable = transits.slice(0, 2)
    if (notable.length > 0) {
      paragraphs.push(
        `${it.report.transitsLead} ${notable
          .map(
            (transit) =>
              `${pointLabel(transit.transiting)} ${aspectName(transit.aspect, transit.transiting)} ` +
              `${toPoint(transit.natalPoint)} natale, che tocca ${bodyReadings[transit.transiting].keywords[0]}`,
          )
          .join('; ')}.`,
      )
      for (const transit of notable) {
        evidence.push({
          system: 'astrologia',
          label:
            `${pointLabel(transit.transiting)} ${aspectName(transit.aspect, transit.transiting)} ` +
            `${toPoint(transit.natalPoint)} natale (orbita ${transit.orb.toFixed(1)}°)`,
          key: `transit:${transit.transiting}:${transit.aspect}:${transit.natalPoint}`,
        })
      }
    }

    if (paragraphs.length > 0) {
      sections.push({ id: 'ciclo', title: it.report.sections.ciclo, paragraphs, evidence })
    } else {
      omitted.push({ id: 'ciclo', title: it.report.sections.ciclo, reason: it.report.reasons.noCycle })
    }
  } else {
    omitted.push({ id: 'ciclo', title: it.report.sections.ciclo, reason: it.report.reasons.noName })
  }

  // Every paragraph passes through the tidier, so composition artefacts never
  // reach the page.
  const tidied = sections
    .map((section) => ({ ...section, paragraphs: clean(section.paragraphs) }))
    .map(withoutRepeatedSentences())

  return { sections: tidied, omitted, themes: ranked, signals }
}

/**
 * Drops any sentence the report has already used.
 *
 * The phrase pools are chosen so that two factors rarely land on the same
 * wording, but a chart with more hard aspects than there are ways to describe
 * one will exhaust a pool, and the reader then meets the same sentence twice.
 * A generic phrase that has already been read adds nothing the second time, so
 * the later copy goes rather than being reworded into something the evidence
 * does not say. A paragraph never loses its first sentence, so none is emptied.
 */
function withoutRepeatedSentences(): (section: ReportSection) => ReportSection {
  const seen = new Set<string>()
  return (section) => ({
    ...section,
    paragraphs: section.paragraphs.map((paragraph) => {
      const sentences = paragraph.split(/(?<=[.!?])\s+/)
      const kept = sentences.filter((sentence, index) => {
        const key = sentence.trim()
        if (index === 0 || key.length < 25) return true
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      const first = sentences[0]?.trim()
      if (first && first.length >= 25) seen.add(first)
      return kept.join(' ')
    }),
  })
}

/** Which sections of the report a set of evidence actually shows up in. */
function domainTitles(evidence: readonly Evidence[], sections: readonly ReportSection[]): string[] {
  const keys = new Set(evidence.map((item) => item.key))
  return sections
    .filter((section) => (DOMAINS as readonly string[]).includes(section.id))
    .filter((section) => section.evidence.some((item) => keys.has(item.key)))
    .map((section) => section.title.toLowerCase())
}

function joinTitles(titles: readonly string[]): string {
  if (titles.length === 0) return ''
  if (titles.length === 1) return titles[0] as string
  return `${titles.slice(0, -1).join(', ')} e ${titles[titles.length - 1]}`
}

function domainsOf(evidence: readonly Evidence[], sections: readonly ReportSection[]): string {
  return joinTitles(domainTitles(evidence, sections))
}

function dedupeEvidence(items: readonly Evidence[]): Evidence[] {
  const seen = new Set<string>()
  const result: Evidence[] = []
  for (const item of items) {
    if (seen.has(item.key)) continue
    seen.add(item.key)
    result.push(item)
  }
  return result
}
