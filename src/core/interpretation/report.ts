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
import { personalYearTheme, themeMeaning } from '../../content/interpretation.it.ts'
import { bodyReadings } from '../../content/astrologyThemes.it.ts'
import { buildPortrait } from './portrait.ts'
import { aspectName, pointLabel, tidy, toPoint } from './italian.ts'
import { astrologySignals, numerologySignals } from './signals.ts'
import { capitalise, rankThemes, strengths, tensions } from './synthesis.ts'
import { MAX_STATEMENTS_PER_DOMAIN } from './weights.ts'
import { DOMAINS, type DomainId, type Evidence, type OmittedSection, type Report, type ReportSection, type Signal } from './types.ts'

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
      paragraphs: [it.report.framing, ...portrait.paragraphs],
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
    const lines = strong.slice(0, 4).map((entry) => {
      const support =
        entry.systems.length > 1
          ? it.report.convergesOnBoth
          : entry.systems[0] === 'astrologia'
            ? it.report.fromAstrology
            : it.report.fromNumerology
      return `${capitalise(it.convergence.themes[entry.theme])}: ${themeMeaning[entry.theme]} — ${support}.`
    })
    sections.push({
      id: 'forze',
      title: it.report.sections.forze,
      paragraphs: [it.report.strengthLead, ...lines],
      evidence: uniqueEvidence(
        strong.slice(0, 4).flatMap((entry) => entry.evidence.map((evidence) => ({ evidence, weight: 0, themes: [], domain: null, statement: '' }) as Signal)),
      ),
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
  // With a single strength, a thread that names the same theme is the same
  // paragraph written twice.
  const threadWouldRepeatStrength = strong.length <= 1 && leading !== undefined && strong[0]?.theme === leading.theme

  if (leading && leading.evidence.length >= 2 && !threadWouldRepeatStrength) {
    const where = sections
      .filter((section) => (DOMAINS as readonly string[]).includes(section.id))
      .filter((section) => section.evidence.some((evidence) => leading.evidence.some((item) => item.key === evidence.key)))
      .map((section) => section.title.toLowerCase())

    const spread =
      where.length > 1
        ? ` Lo si ritrova in più ambiti: ${where.slice(0, 3).join(', ')}.`
        : ''

    sections.push({
      id: 'filo',
      title: it.report.sections.filo,
      paragraphs: [
        `${it.report.threadLead} ${themeMeaning[leading.theme]} è l’elemento che ricorre più spesso, ` +
          `sostenuto da ${leading.evidence.length} indicatori distinti${leading.systems.length > 1 ? ' in entrambi i sistemi' : ''}.` +
          spread,
      ],
      evidence: leading.evidence.slice(0, 6),
    })
  } else {
    omitted.push({
      id: 'filo',
      title: it.report.sections.filo,
      reason: threadWouldRepeatStrength ? it.report.reasons.threadRepeats : it.report.reasons.noSignals,
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
  const tidied = sections.map((section) => ({ ...section, paragraphs: clean(section.paragraphs) }))

  return { sections: tidied, omitted, themes: ranked, signals }
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
