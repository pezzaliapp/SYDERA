import { describe, expect, it as test } from 'vitest'
import { calculateChart, type CompleteChart } from '../../astrology/chart.ts'
import { buildNatalReading } from '../natal.ts'
import { it } from '../../../content/it.ts'
import { aspectDynamics, houseArea, pointFrame, signManner } from '../../../content/natal.it.ts'
import { ZODIAC_SIGNS } from '../../astrology/types.ts'

/**
 * The Astrologia tab used to open on tables: correct values, and no answer to
 * "e quindi?". These tests hold the reading in front of the data, and hold the
 * data complete behind it.
 */

const ROME = { latitude: 41.9028, longitude: 12.4964, label: 'Luogo di prova' }

function chartOf(year: number, month: number, day: number, hour: number, minute: number): CompleteChart {
  const outcome = calculateChart({
    birthDate: { year, month, day },
    birthTime: { hour, minute },
    birthTimePrecisionMinutes: 1,
    place: ROME,
    zoneId: 'Europe/Rome',
    houseSystem: 'whole-sign',
  })
  if (!outcome.ok || outcome.chart.kind !== 'complete') throw new Error('unexpected refusal')
  return outcome.chart
}

/** Twelve synthetic charts spread across the year and the clock. */
const CHARTS = [
  [1979, 4, 12, 15, 20], [1984, 1, 19, 7, 30], [1991, 7, 3, 22, 10], [2001, 11, 27, 4, 45],
  [1966, 9, 8, 12, 0], [1973, 2, 14, 18, 35], [1988, 5, 30, 9, 15], [1995, 12, 21, 23, 50],
  [2010, 8, 17, 6, 5], [1958, 6, 2, 13, 40], [2004, 3, 9, 20, 25], [1969, 10, 24, 11, 55],
].map(([y, m, d, h, mi]) => chartOf(y as number, m as number, d as number, h as number, mi as number))

const readings = CHARTS.map((chart) => buildNatalReading(chart, it.astrology.readingBlocks))
const prose = (reading: (typeof readings)[number]) => reading.blocks.flatMap((block) => block.paragraphs)

describe('the chart is explained before it is tabulated', () => {
  test('every chart produces readable blocks, each with its own evidence', () => {
    for (const reading of readings) {
      expect(reading.blocks.length).toBeGreaterThanOrEqual(5)
      for (const block of reading.blocks) {
        expect(block.title.length).toBeGreaterThan(0)
        expect(block.paragraphs.length).toBeGreaterThan(0)
        expect(block.evidence.length, `${block.id} shows nothing behind it`).toBeGreaterThan(0)
        for (const paragraph of block.paragraphs) {
          expect(paragraph.length).toBeGreaterThan(30)
          expect(paragraph).not.toMatch(/undefined|NaN|\[object|\$\{/)
        }
      }
    }
  })

  test('keeps astrological jargon out of the prose and in the evidence', () => {
    // The reader is told what it means; the terms belong to the factors below.
    const jargon = [
      /\bcasa \d/i, /\borbita\b/i, /\bcongiunzion/i, /\btrigon/i, /\bsestil/i,
      /\bquadrat[oi]\b/i, /\bopposizion/i, /\bretrogrado\b/i, /\bAscendente\b/, /\bMedio Cielo\b/,
      /\bSole\b/, /\bLuna\b/, /\bMercurio\b/, /\bVenere\b/, /\bMarte\b/, /\bGiove\b/, /\bSaturno\b/,
      /\b\d+°/,
    ]
    for (const reading of readings) {
      for (const paragraph of prose(reading)) {
        for (const term of jargon) {
          expect(term.test(paragraph), `jargon in the reading: ${paragraph.slice(0, 70)}`).toBe(false)
        }
      }
      // And it is all present in the evidence.
      const evidence = reading.blocks.flatMap((block) => block.evidence).join(' ')
      expect(evidence).toMatch(/\d+°/)
      expect(evidence).toMatch(/Ascendente/)
    }
  })

  test('talks about the person, never about the interpretation', () => {
    // The reading used to say "questa funzione lavora più verso l'interno" —
    // the machinery describing itself. Those belong to the evidence, if
    // anywhere.
    const method = [
      /questa funzione/i, /questa qualità/i, /la stessa qualità/i, /questa posizione/i,
      /questa energia/i, /questo fattore/i, /questa configurazione/i, /\bil tema\b/i,
      /\bil quadro\b/i, /lavora verso/i, /si manifesta/i, /trova espressione/i,
      /viene sostenuto da/i, /trovi il bisogno di/i, /ha a che fare con la tendenza/i,
    ]
    for (const reading of readings) {
      for (const paragraph of prose(reading)) {
        for (const term of method) {
          expect(term.test(paragraph), `method language: ${paragraph.slice(0, 70)}`).toBe(false)
        }
      }
    }
  })

  test('claims nothing about what actually happened to anyone', () => {
    // A chart cannot establish a biography. "Le prove che ti hanno formato"
    // said that it could.
    const biography = [
      /prove che ti hanno formato/i, /hai vissuto/i, /nella tua infanzia/i,
      /le esperienze che hai avuto/i, /sei stato costretto/i, /gli altri ti hanno/i,
      /ti hanno formato/i, /è passato da/i, /non sei più la persona/i, /hai dovuto meritare/i,
    ]
    for (const reading of readings) {
      for (const paragraph of prose(reading)) {
        for (const term of biography) {
          expect(term.test(paragraph), `biographical claim: ${paragraph.slice(0, 70)}`).toBe(false)
        }
      }
    }
  })

  test('never opens two sections in a row with the same back-reference', () => {
    for (const reading of readings) {
      const paragraphs = prose(reading)
      for (let index = 1; index < paragraphs.length; index += 1) {
        const previous = (paragraphs[index - 1] ?? '').startsWith('Lo stesso vale')
        const current = (paragraphs[index] ?? '').startsWith('Lo stesso vale')
        expect(previous && current, `two back-references in a row: ${paragraphs[index]?.slice(0, 60)}`).toBe(false)
      }
    }
  })

  test('says nothing mystical, predictive or clinical', () => {
    const banned = [
      /energia cosmica/i, /vibrazion/i, /destino/i, /l’universo/i, /sei nato per/i,
      /la tua vera essenza/i, /inevitabilmente/i, /certamente sei/i, /questo dimostra/i,
      /diagnos/i, /patolog/i, /guarir/i,
    ]
    const everything = [
      ...Object.values(signManner),
      ...Object.values(houseArea),
      ...Object.values(aspectDynamics).flatMap((entry) => Object.values(entry)),
      ...readings.flatMap(prose),
    ]
    for (const text of everything) {
      for (const term of banned) expect(term.test(text), `banned: ${text.slice(0, 60)}`).toBe(false)
    }
  })

  test('never repeats the same sentence inside one chart', () => {
    for (const reading of readings) {
      const seen = new Set<string>()
      for (const paragraph of prose(reading)) {
        expect(seen.has(paragraph), `repeated: ${paragraph.slice(0, 60)}`).toBe(false)
        seen.add(paragraph)
      }
    }
  })

  test('different charts are read differently', () => {
    const texts = readings.map((reading) => prose(reading).join(' '))
    expect(new Set(texts).size, 'two charts read identically').toBe(texts.length)
  })

  test('stays a length a person will read', () => {
    for (const reading of readings) {
      const words = prose(reading).join(' ').split(/\s+/).length
      expect(words).toBeGreaterThanOrEqual(150)
      expect(words).toBeLessThanOrEqual(900)
    }
  })

  test('narrates only a handful of dynamics, never the whole aspect list', () => {
    for (let index = 0; index < readings.length; index += 1) {
      const dynamics = readings[index]?.blocks.find((block) => block.id === 'dinamiche')
      if (!dynamics) continue
      expect(dynamics.paragraphs.length).toBeLessThanOrEqual(5)
      // Everything calculated stays available in the table below.
      expect((CHARTS[index] as CompleteChart).aspects.length).toBeGreaterThanOrEqual(
        dynamics.paragraphs.length,
      )
    }
  })

  test('is deterministic', () => {
    const chart = CHARTS[0] as CompleteChart
    const once = buildNatalReading(chart, it.astrology.readingBlocks)
    const twice = buildNatalReading(chart, it.astrology.readingBlocks)
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice))
  })
})

describe('the interpretation content covers what a chart can produce', () => {
  test('writes a manner for every sign and an area for every house', () => {
    for (const sign of ZODIAC_SIGNS) expect(signManner[sign], `no manner for ${sign}`).toBeDefined()
    for (let house = 1; house <= 12; house += 1) expect(houseArea[house], `no area for house ${house}`).toBeDefined()
  })

  test('writes a frame for every point that can be placed', () => {
    for (const point of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'ascendant', 'midheaven'] as const) {
      expect(pointFrame[point], `no frame for ${point}`).toBeDefined()
    }
  })

  test('joins the preposition to the article instead of writing "in la"', () => {
    for (const reading of readings) {
      for (const paragraph of prose(reading)) {
        expect(paragraph, `uncontracted preposition: ${paragraph.slice(0, 60)}`).not.toMatch(
          /\b(in|di|da|su)\s+(il|lo|la|i|gli|le)\s/i,
        )
      }
    }
  })
})
