/**
 * The natal chart, read rather than tabulated.
 *
 * This layer consumes the validated chart and produces short readable blocks
 * for the Astrologia tab. It calculates nothing: every value it uses is
 * already in the chart, and every block carries the exact factors it was
 * written from, so the technical data below the reading confirms it rather
 * than replacing it.
 *
 * It is deliberately separate from the Sintesi engine. The Sintesi answers
 * "what emerges when the two systems are put together"; this answers "what
 * does this chart say, and which piece of it says so".
 */
import type { CompleteChart } from '../astrology/chart.ts'
import type { AspectPoint, BodyId, ZodiacSign } from '../astrology/types.ts'
import { signReadings } from '../../content/astrologyThemes.it.ts'
import {
  aspectDynamics,
  aspectFamilyOf,
  houseArea,
  pointFrame,
  echoFrame,
  retrogradeNote,
  sameSignNote,
  signManner,
  type NatalPoint,
} from '../../content/natal.it.ts'

export interface NatalBlock {
  readonly id: string
  readonly title: string
  readonly paragraphs: readonly string[]
  /** The calculated factors this block was written from. */
  readonly evidence: readonly string[]
}

export interface NatalReading {
  readonly blocks: readonly NatalBlock[]
}

const SIGNS: readonly ZodiacSign[] = [
  'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
  'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
]

export function signOfLongitude(longitude: number): ZodiacSign {
  const wrapped = ((longitude % 360) + 360) % 360
  return SIGNS[Math.floor(wrapped / 30)] as ZodiacSign
}

const degrees = (value: number): string => {
  const whole = Math.floor(value)
  const minutes = Math.round((value - whole) * 60)
  return minutes === 60 ? `${whole + 1}° 00'` : `${whole}° ${String(minutes).padStart(2, '0')}'`
}

const POINT_LABEL: Readonly<Record<string, string>> = Object.freeze({
  sun: 'Sole', moon: 'Luna', mercury: 'Mercurio', venus: 'Venere', mars: 'Marte',
  jupiter: 'Giove', saturn: 'Saturno', uranus: 'Urano', neptune: 'Nettuno', pluto: 'Plutone',
  ascendant: 'Ascendente', midheaven: 'Medio Cielo',
})

/** Italian contracts a preposition with the article that follows it. */
const CONTRACTIONS: Readonly<Record<string, Readonly<Record<string, string>>>> = Object.freeze({
  in: { il: 'nel', lo: 'nello', la: 'nella', i: 'nei', gli: 'negli', le: 'nelle', 'l’': 'nell’' },
  di: { il: 'del', lo: 'dello', la: 'della', i: 'dei', gli: 'degli', le: 'delle', 'l’': 'dell’' },
  da: { il: 'dal', lo: 'dallo', la: 'dalla', i: 'dai', gli: 'dagli', le: 'dalle', 'l’': 'dall’' },
  con: { il: 'con il', lo: 'con lo', la: 'con la', i: 'con i', gli: 'con gli', le: 'con le', 'l’': 'con l’' },
})

function join(preposition: string | null, phrase: string): string {
  if (preposition === null) return phrase
  const table = CONTRACTIONS[preposition]
  if (!table) return `${preposition} ${phrase}`
  const elided = /^(l’)(.+)$/.exec(phrase)
  if (elided?.[1] && elided[2]) {
    const joined = table[elided[1]]
    if (joined) return `${joined}${elided[2]}`
  }
  const [article, ...rest] = phrase.split(' ')
  const joined = article ? table[article] : undefined
  return joined && rest.length > 0 ? `${joined} ${rest.join(' ')}` : `${preposition} ${phrase}`
}

/**
 * One placement, said as a sentence: which function, in what manner, and
 * where it shows.
 */
function placement(point: NatalPoint, sign: ZodiacSign, house: number | null, seen: boolean): string {
  const where = house === null ? null : houseArea[house]
  if (seen) {
    // The quality has already been described on this page; naming it again
    // word for word would read like a fault.
    const echo = sameSignNote[point] ?? echoFrame[point]
    return where ? `${echo}, soprattutto ${where}.` : `${echo}.`
  }
  const { preposition, frame } = pointFrame[point]
  const statement = frame(join(preposition, signManner[sign]))
  // Attached rather than made into a second clause with its own verb: the
  // frames already carry one, and two of them in a row read badly.
  return where ? `${statement.slice(0, -1)}, soprattutto ${where}.` : statement
}

const evidenceFor = (point: NatalPoint, sign: ZodiacSign, degree: number, house: number | null): string =>
  `${POINT_LABEL[point]} · ${degrees(degree)} ${signReadings[sign].label}${house === null ? '' : ` · casa ${house}`}`

/** The dynamics worth narrating, strongest first. */
const PERSONAL: readonly AspectPoint[] = ['sun', 'moon', 'ascendant', 'mercury', 'venus', 'mars']

function rankedDynamics(chart: CompleteChart, limit: number) {
  return chart.aspects
    .map((aspect) => {
      const key = [aspect.a, aspect.b].sort().join('|')
      const family = aspectFamilyOf[aspect.aspect]
      const text = aspectDynamics[key]?.[family]
      if (!text) return null
      // Aspects touching the personal points come first; then the tighter one.
      const personal = (PERSONAL.includes(aspect.a) ? 1 : 0) + (PERSONAL.includes(aspect.b) ? 1 : 0)
      const tightness = aspect.allowedOrb > 0 ? 1 - aspect.orb / aspect.allowedOrb : 0
      return { aspect, text, weight: personal * 2 + tightness }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.weight - a.weight || a.aspect.orb - b.aspect.orb)
    .slice(0, limit)
}

/** How many dynamics a page should carry before it stops being read. */
const MAX_DYNAMICS = 5

export function buildNatalReading(chart: CompleteChart, titles: Readonly<Record<string, string>>): NatalReading {
  const byBody = new Map(chart.positions.map((position) => [position.body, position]))
  const blocks: NatalBlock[] = []
  // Across the whole page, not only within one block.
  const signsUsed = new Set<ZodiacSign>()

  const add = (id: string, points: ReadonlyArray<readonly [NatalPoint, ZodiacSign, number, number | null]>): void => {
    if (points.length === 0) return
    const paragraphs: string[] = []
    const evidence: string[] = []
    for (const [point, sign, degree, house] of points) {
      paragraphs.push(placement(point, sign, house, signsUsed.has(sign)))
      signsUsed.add(sign)
      evidence.push(evidenceFor(point, sign, degree, house))
      const position = byBody.get(point as BodyId)
      const note = position?.retrograde ? retrogradeNote[point as BodyId] : undefined
      if (note) {
        paragraphs.push(note)
        evidence.push(`${POINT_LABEL[point]} retrogrado`)
      }
    }
    blocks.push({ id, title: titles[id] as string, paragraphs, evidence })
  }

  const of = (body: BodyId): readonly [NatalPoint, ZodiacSign, number, number | null] | null => {
    const position = byBody.get(body)
    return position ? [body, position.sign, position.degreeInSign, position.house ?? null] : null
  }
  const present = (...entries: Array<ReturnType<typeof of>>) =>
    entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  const ascendantSign = signOfLongitude(chart.ascendantValue)
  add('presentazione', [['ascendant', ascendantSign, chart.ascendantValue % 30, null]])

  const midheavenSign = signOfLongitude(chart.midheavenValue)
  add('identita', [
    ...present(of('sun')),
    ['midheaven', midheavenSign, chart.midheavenValue % 30, null] as const,
  ])

  add('emozioni', present(of('moon')))
  add('mente', present(of('mercury')))
  add('relazioni', present(of('venus')))
  add('azione', present(of('mars')))
  add('crescita', present(of('jupiter'), of('saturn')))

  const dynamics = rankedDynamics(chart, MAX_DYNAMICS)
  if (dynamics.length > 0) {
    blocks.push({
      id: 'dinamiche',
      title: titles['dinamiche'] as string,
      paragraphs: dynamics.map((entry) => entry.text),
      evidence: dynamics.map(
        (entry) =>
          `${POINT_LABEL[entry.aspect.a]} — ${POINT_LABEL[entry.aspect.b]} · ${aspectLabel(
            entry.aspect.aspect,
          )} · orbita ${entry.aspect.orb.toFixed(2)}°`,
      ),
    })
  }

  return { blocks }
}

const ASPECT_LABEL: Readonly<Record<string, string>> = Object.freeze({
  congiunzione: 'congiunzione',
  sestile: 'sestile',
  trigono: 'trigono',
  quadrato: 'quadrato',
  opposizione: 'opposizione',
})

function aspectLabel(aspect: string): string {
  return ASPECT_LABEL[aspect] ?? aspect
}
