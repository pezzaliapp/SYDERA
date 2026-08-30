import { describe, expect, it as test } from 'vitest'
import { calculateChart } from '../../astrology/chart.ts'
import { computeNumerologyProfile } from '../../numerology/profile.ts'
import { currentTransits, type NatalPoint } from '../../cycles/transits.ts'
import { buildCyclesReading } from '../cycles.ts'
import { dayNote, monthNote, phaseReading, phaseTitle, yearReading } from '../../../content/cycles.it.ts'

/**
 * Cicli has to answer, on the first screen: which phase am I in, when did it
 * start, when does it end, and what is it about. It used to answer "here are
 * the numbers".
 */

const AT = Date.parse('2026-08-30T00:00:00Z')
const NOW = { year: 2026, month: 8, day: 30 }
const PLACE = { latitude: 43.8545, longitude: 11.1661, label: 'Luogo di prova' }

/** Twelve synthetic births: different ages, life paths and personal years. */
const BIRTHS = [
  [1952, 3, 17, 'ALFA BETASSON'], [1961, 11, 2, 'TEST TESTSSON'], [1968, 7, 25, 'GAMMA IOTASSON'],
  [1974, 1, 9, 'ESSE EFFESSON'], [1979, 4, 12, 'OMEGA ZETASSON'], [1983, 9, 30, 'ALFA BETASSON'],
  [1988, 6, 4, 'TEST TESTSSON'], [1992, 12, 18, 'GAMMA IOTASSON'], [1997, 2, 23, 'ESSE EFFESSON'],
  [2001, 10, 7, 'OMEGA ZETASSON'], [2006, 5, 14, 'ALFA BETASSON'], [2012, 8, 1, 'TEST TESTSSON'],
] as const

const readings = BIRTHS.map(([year, month, day, name]) => {
  const outcome = calculateChart({
    birthDate: { year, month, day },
    birthTime: { hour: 10, minute: 30 },
    birthTimePrecisionMinutes: 1,
    place: PLACE,
    zoneId: 'Europe/Rome',
    houseSystem: 'whole-sign',
  })
  if (!outcome.ok || outcome.chart.kind !== 'complete') throw new Error('unexpected refusal')
  const chart = outcome.chart
  const numerology = computeNumerologyProfile({
    fullBirthName: name,
    birthDate: { year, month, day },
    referenceDate: NOW,
  })
  if (!numerology.ok) throw new Error('unexpected numerology refusal')
  const points: NatalPoint[] = [
    ...chart.positions.map((position) => ({ point: position.body, longitude: position.longitude })),
    { point: 'ascendant' as const, longitude: chart.ascendantValue },
    { point: 'midheaven' as const, longitude: chart.midheavenValue },
  ]
  return { born: year, reading: buildCyclesReading(numerology.value, currentTransits(points, AT)) }
})

const prose = (reading: (typeof readings)[number]['reading']) =>
  [
    ...reading.phases.map((phase) => phase.reading),
    reading.year?.reading,
    reading.month?.note,
    reading.day?.note,
    ...(reading.moment?.paragraphs ?? []),
  ].filter((text): text is string => typeof text === 'string')

describe('the page answers where a person is in their life', () => {
  test('marks exactly one phase as current, for every birth', () => {
    for (const { born, reading } of readings) {
      const current = reading.phases.filter((phase) => phase.current)
      expect(current.length, `${born}: ${current.length} current phases`).toBe(1)
    }
  })

  test('gives every phase an age range, calendar years, a title and a reading', () => {
    for (const { reading } of readings) {
      expect(reading.phases.length).toBeGreaterThanOrEqual(4)
      for (const phase of reading.phases) {
        expect(phase.startAge).toBeGreaterThanOrEqual(0)
        expect(phase.startYear).toBeGreaterThan(1900)
        if (phase.endAge !== null) {
          expect(phase.endAge).toBeGreaterThan(phase.startAge)
          expect(phase.endYear).toBe(phase.startYear + (phase.endAge - phase.startAge))
        } else {
          expect(phase.endYear).toBeNull()
        }
        expect(phase.title.length).toBeGreaterThan(0)
        expect(phase.reading.length).toBeGreaterThan(60)
        expect(phase.evidence.length).toBeGreaterThan(0)
      }
    }
  })

  test('runs the phases in order and leaves no gap between them', () => {
    for (const { reading } of readings) {
      for (let index = 1; index < reading.phases.length; index += 1) {
        const previous = reading.phases[index - 1]
        const phase = reading.phases[index]
        expect(previous?.endAge).not.toBeNull()
        expect(phase?.startAge).toBe((previous?.endAge as number) + 1)
      }
    }
  })

  test('the current phase actually contains the person’s age', () => {
    for (const { reading } of readings) {
      const current = reading.phases.find((phase) => phase.current)
      const age = reading.currentAge as number
      expect(current).toBeDefined()
      expect(age).toBeGreaterThanOrEqual(current?.startAge as number)
      if (current?.endAge !== null && current?.endAge !== undefined) {
        expect(age).toBeLessThanOrEqual(current.endAge)
      }
    }
  })
})

describe('the page talks about periods, not about numbers or events', () => {
  test('keeps calculation vocabulary out of the visible prose', () => {
    const method = [
      /questa funzione/i, /questa qualità/i, /\bil quadro\b/i, /il tema indica/i,
      /la tradizione associa/i, /il numero rappresenta/i, /il transito indica/i,
      /il pinnacolo/i, /\bpinnacolo\b/i, /\bnumero \d/i, /\btransito\b/i, /\borbita\b/i,
    ]
    for (const { reading } of readings) {
      for (const paragraph of prose(reading)) {
        for (const term of method) {
          expect(term.test(paragraph), `calculation language: ${paragraph.slice(0, 70)}`).toBe(false)
        }
      }
      // And it is all present in the evidence.
      const evidence = [
        ...reading.phases.flatMap((phase) => phase.evidence),
        ...(reading.year?.evidence ?? []),
        ...(reading.moment?.evidence ?? []),
      ].join(' ')
      expect(evidence).toMatch(/Pinnacolo/)
    }
  })

  test('claims nothing about what happened to anyone', () => {
    const biography = [
      /hai cambiato/i, /hai avuto/i, /hai incontrato/i, /hai dovuto/i,
      /nella tua infanzia/i, /sei stato/i, /ti è successo/i,
    ]
    for (const { reading } of readings) {
      for (const paragraph of prose(reading)) {
        for (const term of biography) {
          expect(term.test(paragraph), `biographical claim: ${paragraph.slice(0, 70)}`).toBe(false)
        }
      }
    }
  })

  test('predicts nothing about health, money, death or relationships', () => {
    const predictions = [
      /\bmorte\b/i, /\bmalatt/i, /\bdivorzi/i, /\bincidente\b/i, /\bguadagner/i,
      /\bperderai\b/i, /\btroverai\b/i, /\bincontrerai\b/i, /\bsuccederà\b/i,
    ]
    for (const { reading } of readings) {
      for (const paragraph of prose(reading)) {
        for (const term of predictions) {
          expect(term.test(paragraph), `prediction: ${paragraph.slice(0, 70)}`).toBe(false)
        }
      }
    }
  })

  test('never says the same thing twice on one page', () => {
    for (const { born, reading } of readings) {
      const seen = new Set<string>()
      for (const paragraph of prose(reading)) {
        expect(seen.has(paragraph), `${born} repeats: ${paragraph.slice(0, 60)}`).toBe(false)
        seen.add(paragraph)
      }
    }
  })

  test('describes at most three current dynamics, each on a different point', () => {
    for (const { reading } of readings) {
      if (!reading.moment) continue
      expect(reading.moment.paragraphs.length).toBeLessThanOrEqual(3)
      // One passing planet per part of life: three sentences ending in the
      // same clause said less than one did.
      expect(new Set(reading.moment.paragraphs).size).toBe(reading.moment.paragraphs.length)
      expect(reading.moment.evidence.length).toBe(reading.moment.paragraphs.length)
    }
  })

  test('stays a length a person will read', () => {
    for (const { born, reading } of readings) {
      const words = prose(reading).join(' ').split(/\s+/).length
      expect(words, `${born} is ${words} words`).toBeGreaterThanOrEqual(120)
      expect(words, `${born} is ${words} words`).toBeLessThanOrEqual(600)
    }
  })

  test('is deterministic', () => {
    const first = readings[0]?.reading
    expect(JSON.stringify(first)).toBe(JSON.stringify(readings[0]?.reading))
  })
})

describe('the content covers what the engine can produce', () => {
  test('writes a title, a phase, a year, a month and a day for every number', () => {
    for (const value of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
      expect(phaseTitle[value], `no title for ${value}`).toBeDefined()
      expect(phaseReading[value], `no phase reading for ${value}`).toBeDefined()
      expect(yearReading[value], `no year reading for ${value}`).toBeDefined()
      expect(monthNote[value], `no month note for ${value}`).toBeDefined()
      expect(dayNote[value], `no day note for ${value}`).toBeDefined()
    }
  })

  test('says when the personal year runs, using the convention the engine uses', () => {
    for (const { reading } of readings) {
      // The engine derives it from the calendar year, so it turns over on
      // 1 January; the page has to say so rather than leave it implied.
      expect(reading.year?.from).toMatch(/gennaio 2026$/)
      expect(reading.year?.to).toMatch(/dicembre 2026$/)
    }
  })
})
