import { describe, expect, it as test } from 'vitest'
import { calculateChart, type CompleteChart } from '../../astrology/chart.ts'
import { compareSystems } from '../../convergence/taxonomy.ts'
import { currentTransits } from '../../cycles/transits.ts'
import { computeNumerologyProfile, type NumerologyProfile } from '../../numerology/profile.ts'
import { buildReport, type ReportInput } from '../report.ts'
import { astrologySignals, signOfLongitude } from '../signals.ts'
import { rankThemes, strengths, tensions } from '../synthesis.ts'
import { DOMAINS } from '../types.ts'

/**
 * Synthetic technical fixtures. No real person's data anywhere.
 *
 * The point of these tests is not to judge the prose — that is editorial — but
 * to prove the engine cannot say anything it has no calculated reason to say.
 */
const ROME = { latitude: 41.9028, longitude: 12.4964, label: 'Luogo di prova' }
const AT = Date.parse('2026-08-28T00:00:00Z')

function chartFor(date: { year: number; month: number; day: number }, time: { hour: number; minute: number } | null): CompleteChart | null {
  const outcome = calculateChart({
    birthDate: date,
    birthTime: time,
    birthTimePrecisionMinutes: time ? 1 : 0,
    place: ROME,
    zoneId: 'Europe/Rome',
    houseSystem: 'whole-sign',
  })
  if (!outcome.ok || outcome.chart.kind !== 'complete') return null
  return outcome.chart
}

function numerologyFor(name: string, date: { year: number; month: number; day: number }): NumerologyProfile | null {
  const outcome = computeNumerologyProfile({
    fullBirthName: name,
    birthDate: date,
    referenceDate: { year: 2026, month: 8, day: 28 },
  })
  return outcome.ok ? outcome.value : null
}

function inputFor(
  date: { year: number; month: number; day: number },
  time: { hour: number; minute: number } | null,
  name: string | null,
): ReportInput {
  const chart = time ? chartFor(date, time) : null
  const numerology = name ? numerologyFor(name, date) : null
  const astrologyFactors =
    chart
      ? {
          factors: [
            ...chart.positions
              .filter((position) => ['sun', 'moon', 'mercury', 'venus', 'mars'].includes(position.body))
              .map((position) => ({ factor: position.body, sign: position.sign })),
            { factor: 'ascendant' as const, sign: signOfLongitude(chart.ascendantValue) },
          ],
        }
      : null
  const numerologyFactors = numerology
    ? {
        numbers: [
          { label: 'Sentiero di vita', value: numerology.lifePath.value },
          { label: 'Espressione', value: numerology.expression.value },
          { label: 'Anima', value: numerology.soulUrge.value },
          { label: 'Personalità', value: numerology.personality.value },
        ],
      }
    : null

  const natalPoints = chart
    ? [
        ...chart.positions.map((position) => ({ point: position.body, longitude: position.longitude })),
        { point: 'ascendant' as const, longitude: chart.ascendantValue },
        { point: 'midheaven' as const, longitude: chart.midheavenValue },
      ]
    : []

  return {
    chart,
    numerology,
    convergence: compareSystems(astrologyFactors, numerologyFactors),
    transits: natalPoints.length > 0 ? currentTransits(natalPoints, AT) : [],
  }
}

const FULL = inputFor({ year: 1984, month: 1, day: 19 }, { hour: 7, minute: 30 }, 'TEST TESTSSON')
const OTHER = inputFor({ year: 1971, month: 7, day: 4 }, { hour: 21, minute: 15 }, 'ALTRO CASOSSON')
const NO_TIME = inputFor({ year: 1984, month: 1, day: 19 }, null, 'TEST TESTSSON')
const NO_NAME = inputFor({ year: 1984, month: 1, day: 19 }, { hour: 7, minute: 30 }, null)

describe('determinism', () => {
  test('identical input always produces an identical report', () => {
    expect(buildReport(FULL)).toEqual(buildReport(FULL))
  })

  test('the section order is stable', () => {
    const first = buildReport(FULL).sections.map((section) => section.id)
    const second = buildReport(FULL).sections.map((section) => section.id)
    expect(first).toEqual(second)
    expect(first[0]).toBe('profilo')
  })
})

describe('every sentence is traceable to a calculated fact', () => {
  const report = buildReport(FULL)

  test('no section is emitted without evidence, except the explicit no-tension finding', () => {
    for (const section of report.sections) {
      if (section.id === 'tensioni' && section.evidence.length === 0) continue
      expect(section.evidence.length, `section ${section.id} has no evidence`).toBeGreaterThan(0)
    }
  })

  test('every evidence key corresponds to a real calculated value', () => {
    const chart = FULL.chart
    const numerology = FULL.numerology
    expect(chart?.kind).toBe('complete')
    if (chart?.kind !== 'complete' || !numerology) return

    const validKeys = new Set<string>()
    for (const position of chart.positions) {
      validKeys.add(`${position.body}:${position.sign}`)
      if (position.house) validKeys.add(`${position.body}:${position.sign}:h${position.house}`)
      if (position.retrograde) validKeys.add(`${position.body}:retrograde`)
    }
    validKeys.add(`ascendant:${signOfLongitude(chart.ascendantValue)}:h1`)
    for (const aspect of chart.aspects) validKeys.add(`aspect:${aspect.a}:${aspect.aspect}:${aspect.b}`)
    validKeys.add(`lifePath:${numerology.lifePath.value}`)
    validKeys.add(`expression:${numerology.expression.value}`)
    validKeys.add(`soulUrge:${numerology.soulUrge.value}`)
    validKeys.add(`personality:${numerology.personality.value}`)
    validKeys.add(`personalYear:${numerology.personalYear.value}`)

    for (const section of report.sections) {
      for (const evidence of section.evidence) {
        const known = validKeys.has(evidence.key) || evidence.key.startsWith('transit:')
        expect(known, `evidence "${evidence.key}" in section ${section.id} matches no calculated value`).toBe(true)
      }
    }
  })

  test('every signal carries both a weight and its evidence', () => {
    for (const signal of report.signals) {
      expect(signal.evidence.key).not.toBe('')
      expect(signal.evidence.label).not.toBe('')
      expect(signal.weight).toBeGreaterThan(0)
    }
  })
})

describe('no generic fallback invents a personality', () => {
  test('two different charts produce different portraits', () => {
    const first = buildReport(FULL).sections.find((section) => section.id === 'profilo')
    const second = buildReport(OTHER).sections.find((section) => section.id === 'profilo')
    expect(first?.paragraphs[1]).not.toBe(second?.paragraphs[1])
  })

  test('every domain section differs between two different charts', () => {
    const a = buildReport(FULL)
    const b = buildReport(OTHER)
    for (const domain of DOMAINS) {
      const first = a.sections.find((section) => section.id === domain)?.paragraphs.join(' ')
      const second = b.sections.find((section) => section.id === domain)?.paragraphs.join(' ')
      if (!first || !second) continue
      expect(first, `domain ${domain} reads identically for two different charts`).not.toBe(second)
    }
  })

  test('an empty input produces no invented sections', () => {
    const empty = buildReport({ chart: null, numerology: null, convergence: { comparisons: [], incomplete: true }, transits: [] })
    expect(empty.sections).toHaveLength(0)
    expect(empty.omitted.length).toBeGreaterThan(0)
    for (const omission of empty.omitted) expect(omission.reason).not.toBe('')
  })
})

describe('missing data removes the readings that depend on it', () => {
  test('without a birth time no astrological evidence appears anywhere', () => {
    const report = buildReport(NO_TIME)
    const evidence = report.sections.flatMap((section) => section.evidence)
    expect(evidence.length).toBeGreaterThan(0)
    expect(evidence.every((item) => item.system === 'numerologia')).toBe(true)
  })

  test('without a birth time the sections only astrology feeds are omitted', () => {
    const report = buildReport(NO_TIME)
    // "Relazioni" rests on Venus alone, so it cannot be written.
    expect(report.omitted.map((entry) => entry.id)).toContain('relazioni')
  })

  test('a section that numerology alone can support is still written', () => {
    // "Come ti presenti al mondo" also rests on the Personality number, so it
    // degrades rather than disappearing: a partial reading, not an absent one.
    const report = buildReport(NO_TIME)
    const presentation = report.sections.find((section) => section.id === 'presentazione')
    expect(presentation).toBeDefined()
    expect(presentation?.evidence.every((item) => item.system === 'numerologia')).toBe(true)
  })

  test('without a name there are no numerological sections', () => {
    const report = buildReport(NO_NAME)
    const evidence = report.sections.flatMap((section) => section.evidence)
    expect(evidence.some((item) => item.system === 'numerologia')).toBe(false)
    expect(report.omitted.map((entry) => entry.id)).toContain('ciclo')
  })

  test('an omitted section always states why', () => {
    for (const report of [buildReport(NO_TIME), buildReport(NO_NAME)]) {
      for (const omission of report.omitted) {
        expect(omission.reason.length).toBeGreaterThan(10)
        expect(omission.title).not.toBe('')
      }
    }
  })
})

describe('themes and strengths', () => {
  const report = buildReport(FULL)

  test('no theme appears that no signal supports', () => {
    const supported = new Set(report.signals.flatMap((signal) => signal.themes))
    for (const theme of report.themes) {
      expect(supported.has(theme.theme), `theme ${theme.theme} is unsupported`).toBe(true)
    }
  })

  test('a strength needs at least two distinct supporting factors', () => {
    for (const strength of strengths(report.themes)) {
      const keys = new Set(strength.evidence.map((evidence) => evidence.key))
      expect(keys.size, `theme ${strength.theme} rests on a single factor`).toBeGreaterThanOrEqual(2)
    }
  })

  test('themes are ranked by weight, not alphabetically', () => {
    const scores = report.themes.map((theme) => theme.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
  })
})

describe('contrasts are never quietly turned into agreement', () => {
  test('a contrast in the convergence result reaches the tensions section', () => {
    const contrasted = compareSystems(
      { factors: [{ factor: 'sun', sign: 'acquario' }, { factor: 'moon', sign: 'acquario' }] },
      { numbers: [{ label: 'Sentiero di vita', value: 2 }] },
    )
    const found = tensions([], contrasted, [])
    expect(found.some((tension) => tension.kind === 'contrasto-fra-sistemi')).toBe(true)
    const statement = found.find((tension) => tension.kind === 'contrasto-fra-sistemi')?.statement ?? ''
    // It must state the disagreement, not smooth it over.
    expect(statement).toMatch(/non trova conferma/)
    expect(statement).not.toMatch(/equilibrio fra i due|si compensano/)
  })

  test('a contrast names both competing tendencies, not just the theme', () => {
    const contrasted = compareSystems(
      { factors: [{ factor: 'sun', sign: 'acquario' }, { factor: 'moon', sign: 'acquario' }] },
      { numbers: [{ label: 'Sentiero di vita', value: 2 }] },
    )
    const statement = tensions([], contrasted, []).find((t) => t.kind === 'contrasto-fra-sistemi')?.statement ?? ''
    // Side A: a drive in plain language, with the factors that support it.
    expect(statement).toMatch(/spinta|bisogno|esigenza|centralità|movimento/)
    expect(statement).toMatch(/Sole in Acquario|Luna in Acquario/)
    // Side B: what the other language puts there instead.
    expect(statement).toMatch(/indicano piuttosto un’altra direzione|non aggiungono nulla/)
    // And how the two qualify one another.
    expect(statement).toMatch(/poggia su un appoggio solo/)
  })

  test('contrast wording changes when the supporting factors change', () => {
    const first = compareSystems(
      { factors: [{ factor: 'sun', sign: 'acquario' }, { factor: 'moon', sign: 'acquario' }] },
      { numbers: [{ label: 'Sentiero di vita', value: 2 }] },
    )
    const second = compareSystems(
      { factors: [{ factor: 'sun', sign: 'vergine' }, { factor: 'moon', sign: 'vergine' }] },
      { numbers: [{ label: 'Sentiero di vita', value: 3 }] },
    )
    const a = tensions([], first, []).find((t) => t.kind === 'contrasto-fra-sistemi')?.statement
    const b = tensions([], second, []).find((t) => t.kind === 'contrasto-fra-sistemi')?.statement
    expect(a).toBeDefined()
    expect(b).toBeDefined()
    expect(a).not.toBe(b)
  })

  test('two opposed strong themes are named on both sides with their evidence', () => {
    const report = buildReport(FULL)
    const opposed = tensions(report.signals, FULL.convergence, report.themes).find(
      (tension) => tension.kind === 'temi-opposti',
    )
    if (!opposed) return
    // Both poles named, each with the factors behind it.
    expect(opposed.statement).toMatch(/Da una parte .+; dall’altra .+/)
    expect(opposed.evidence.length).toBeGreaterThanOrEqual(2)
    // Each pole carries its evidence in parentheses.
    expect((opposed.statement.match(/\(/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })

  test('a hard aspect states what the friction costs, not only that it exists', () => {
    const chart = FULL.chart
    if (chart?.kind !== 'complete') return
    const signals = astrologySignals(chart)
    const hard = tensions(signals, { comparisons: [], incomplete: false }, rankThemes(signals)).find(
      (tension) => tension.kind === 'aspetto-di-tensione',
    )
    if (!hard) return
    expect(hard.statement).toMatch(/tende a cedere|oscillare fra i due poli/)
  })

  test('a hard aspect between personal points becomes a named tension', () => {
    const chart = FULL.chart
    if (chart?.kind !== 'complete') return
    const signals = astrologySignals(chart)
    const hard = signals.filter((signal) => /aspect:.*(quadrato|opposizione)/.test(signal.evidence.key))
    if (hard.length === 0) return
    const found = tensions(signals, { comparisons: [], incomplete: false }, rankThemes(signals))
    expect(found.some((tension) => tension.kind === 'aspetto-di-tensione')).toBe(true)
  })

  test('when nothing conflicts the report says so instead of staying silent', () => {
    const report = buildReport(NO_NAME)
    const section = report.sections.find((entry) => entry.id === 'tensioni')
    expect(section).toBeDefined()
    expect(section?.paragraphs.join(' ').length).toBeGreaterThan(40)
  })
})

describe('the portrait is a synthesis, not a concatenation', () => {
  const report = buildReport(FULL)
  const profile = report.sections.find((section) => section.id === 'profilo')

  test('it relates factors to one another', () => {
    const text = profile?.paragraphs[1] ?? ''
    // A relation, not two sentences side by side.
    expect(text).toMatch(/che si presenta con|Sotto,/)
  })

  test('it draws on more than one factor', () => {
    expect(profile?.evidence.length).toBeGreaterThanOrEqual(3)
    const systems = new Set(profile?.evidence.map((item) => item.system))
    expect(systems.size).toBe(2)
  })

  test('no portrait sentence appears verbatim in any domain section', () => {
    const portraitSentences = (profile?.paragraphs.slice(1) ?? [])
      .flatMap((paragraph) => paragraph.split(/(?<=\.)\s+/))
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 25)

    const domainText = report.sections
      .filter((section) => (DOMAINS as readonly string[]).includes(section.id))
      .flatMap((section) => section.paragraphs)
      .join(' ')

    for (const sentence of portraitSentences) {
      expect(domainText, `portrait sentence repeated in a domain: "${sentence.slice(0, 60)}"`).not.toContain(sentence)
    }
  })

  test('the Life Path qualifies the portrait instead of standing alone', () => {
    const text = profile?.paragraphs[1] ?? ''
    expect(text).toMatch(/, con una direzione/)
  })

  test('a chart with nothing to relate gets no portrait at all', () => {
    // Numerology only: no Sun, no Ascendant, nothing to combine.
    const report = buildReport({ ...NO_TIME, chart: null })
    expect(report.sections.find((section) => section.id === 'profilo')).toBeUndefined()
    expect(report.omitted.map((entry) => entry.id)).toContain('profilo')
  })

  test('it stays one or two paragraphs', () => {
    // The framing line plus the portrait itself.
    expect(profile?.paragraphs.length).toBeLessThanOrEqual(3)
  })
})

describe('language discipline', () => {
  const text = buildReport(FULL)
    .sections.flatMap((section) => section.paragraphs)
    .join(' ')

  test('never claims certainty or prediction', () => {
    expect(text).not.toMatch(/sei sicuramente|il tuo destino|accadrà|le stelle dimostrano|questo prova/i)
  })

  test('does not repeat the tradition qualifier in every paragraph', () => {
    const occurrences = text.match(/tradizion/gi) ?? []
    expect(occurrences.length).toBeLessThanOrEqual(1)
  })

  test('states the symbolic framing once, at the start', () => {
    const profile = buildReport(FULL).sections.find((section) => section.id === 'profilo')
    expect(profile?.paragraphs[0]).toMatch(/non è una descrizione scientifica/i)
  })

  test('offers no percentage or measurement of the person', () => {
    expect(text).not.toMatch(/\d+\s*%/)
    expect(text).not.toMatch(/punteggio|score|indice di personalità/i)
  })
})

describe('offline and local', () => {
  test('report generation touches no network or storage API', () => {
    const source = ['report.ts', 'signals.ts', 'synthesis.ts', 'weights.ts', 'types.ts']
    for (const file of source) {
      const contents = readModule(file)
      expect(contents, `${file} must not reach the network`).not.toMatch(/fetch\(|XMLHttpRequest|WebSocket/)
      expect(contents, `${file} must not touch storage`).not.toMatch(/localStorage|indexedDB/)
      expect(contents, `${file} must not read the clock`).not.toMatch(/Date\.now|new Date\(/)
    }
  })
})

function readModule(file: string): string {
  // eslint-disable-next-line
  const { readFileSync } = require('node:fs') as typeof import('node:fs')
  const { join } = require('node:path') as typeof import('node:path')
  return readFileSync(join(process.cwd(), 'src', 'core', 'interpretation', file), 'utf8')
}
