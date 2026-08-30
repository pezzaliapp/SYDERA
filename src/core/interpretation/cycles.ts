/**
 * The life timeline.
 *
 * Consumes the already-calculated cycles and answers, in order, the questions
 * a person actually has: which phase am I in, when did it start, when does it
 * end, and what is it about. It calculates nothing — the ages, the numbers and
 * the transits all come from the engines — and it invents no events: a
 * calculated cycle can describe a period's emphasis, never a biography.
 */
import type { Transit } from '../cycles/transits.ts'
import type { NumerologyProfile } from '../numerology/profile.ts'
import type { AspectPoint, BodyId } from '../astrology/types.ts'
import {
  dayNote,
  monthNote,
  phaseReading,
  phaseTitle,
  transitTheme,
  transitTouches,
  yearReading,
  type TransitTone,
} from '../../content/cycles.it.ts'

export interface LifePhase {
  readonly index: number
  readonly startAge: number
  /** Null for the phase that stays open. */
  readonly endAge: number | null
  readonly startYear: number
  readonly endYear: number | null
  readonly title: string
  readonly reading: string
  readonly current: boolean
  readonly evidence: readonly string[]
}

export interface CyclesReading {
  readonly phases: readonly LifePhase[]
  readonly currentAge: number | null
  readonly year: {
    readonly calendarYear: number
    readonly reading: string
    readonly from: string
    readonly to: string
    readonly evidence: readonly string[]
  } | null
  readonly month: { readonly note: string; readonly evidence: readonly string[] } | null
  readonly day: { readonly note: string; readonly evidence: readonly string[] } | null
  readonly moment: { readonly paragraphs: readonly string[]; readonly evidence: readonly string[] } | null
}

const ASPECT_TONE: Readonly<Record<string, TransitTone>> = Object.freeze({
  congiunzione: 'congiunzione',
  sestile: 'armonico',
  trigono: 'armonico',
  quadrato: 'teso',
  opposizione: 'teso',
})

const BODY_LABEL: Readonly<Record<string, string>> = Object.freeze({
  sun: 'Sole', moon: 'Luna', mercury: 'Mercurio', venus: 'Venere', mars: 'Marte',
  jupiter: 'Giove', saturn: 'Saturno', uranus: 'Urano', neptune: 'Nettuno', pluto: 'Plutone',
  ascendant: 'Ascendente', midheaven: 'Medio Cielo',
})

const ASPECT_LABEL: Readonly<Record<string, string>> = Object.freeze({
  congiunzione: 'congiunto', sestile: 'in sestile', quadrato: 'in quadrato',
  trigono: 'in trigono', opposizione: 'in opposizione',
})

/**
 * "in quadrato a Ascendente" is not Italian: the angles take an article and
 * the preposition contracts with it, the planets take neither.
 */
function toNatalPoint(point: AspectPoint): string {
  if (point === 'ascendant') return `all’${BODY_LABEL[point]}`
  if (point === 'midheaven') return `al ${BODY_LABEL[point]}`
  return `a ${BODY_LABEL[point]}`
}

/** Whole years lived at the reference date. */
function ageAt(birth: { year: number; month: number; day: number }, at: { year: number; month: number; day: number }): number {
  let age = at.year - birth.year
  if (at.month < birth.month || (at.month === birth.month && at.day < birth.day)) age -= 1
  return age
}

/**
 * The slow bodies say something about a period; the fast ones move on within
 * days and would only add noise here.
 */
const SLOW: readonly BodyId[] = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
const MAX_DYNAMICS = 3

export function buildCyclesReading(
  numerology: NumerologyProfile | null,
  transits: readonly Transit[],
): CyclesReading {
  if (!numerology) {
    return { phases: [], currentAge: null, year: null, month: null, day: null, moment: moment(transits) }
  }

  const { birthDate, referenceDate } = numerology
  const age = ageAt(birthDate, referenceDate)

  // Two phases can carry the same number. Printing the same paragraph twice
  // reads like a fault; that the same emphasis comes back is the more useful
  // thing to say.
  const seenValues = new Set<number>()

  const phases: LifePhase[] = numerology.pinnacles.map((pinnacle) => {
    const startYear = birthDate.year + pinnacle.startAge
    const endYear = pinnacle.endAge === null ? null : birthDate.year + pinnacle.endAge
    const full = phaseReading[pinnacle.value] ?? ''
    const repeated = seenValues.has(pinnacle.value)
    seenValues.add(pinnacle.value)
    const reading = repeated
      ? `Lo stesso accento torna una seconda volta. ${full.split(/(?<=[.!?])\s+/)[0] ?? full}`
      : full
    return {
      index: pinnacle.index,
      startAge: pinnacle.startAge,
      endAge: pinnacle.endAge,
      startYear,
      endYear,
      title: phaseTitle[pinnacle.value] ?? '',
      reading,
      current: age >= pinnacle.startAge && (pinnacle.endAge === null || age <= pinnacle.endAge),
      evidence: [
        `Pinnacolo ${pinnacle.index} · numero ${pinnacle.value}${pinnacle.isMaster ? ' (numero maestro)' : ''}`,
        pinnacle.endAge === null ? `da ${pinnacle.startAge} anni` : `${pinnacle.startAge}–${pinnacle.endAge} anni`,
      ],
    }
  })

  const yearValue = numerology.personalYear.value
  const monthValue = numerology.personalMonth.value
  const dayValue = numerology.personalDay.value

  return {
    phases,
    currentAge: age,
    year: yearReading[yearValue]
      ? {
          calendarYear: referenceDate.year,
          reading: yearReading[yearValue] as string,
          // The engine derives the personal year from the calendar year, so
          // it turns over on 1 January. Said plainly rather than assumed.
          from: `1º gennaio ${referenceDate.year}`,
          to: `31 dicembre ${referenceDate.year}`,
          evidence: [`Anno personale ${yearValue}`, `anno di riferimento ${referenceDate.year}`],
        }
      : null,
    month: monthNote[monthValue]
      ? { note: monthNote[monthValue] as string, evidence: [`Mese personale ${monthValue}`] }
      : null,
    day: dayNote[dayValue]
      ? { note: dayNote[dayValue] as string, evidence: [`Giorno personale ${dayValue}`] }
      : null,
    moment: moment(transits),
  }
}

/** The transits worth saying out loud, translated. */
function moment(transits: readonly Transit[]): CyclesReading['moment'] {
  const ranked = transits
    .filter((transit) => SLOW.includes(transit.transiting))
    .map((transit) => {
      const tone = ASPECT_TONE[transit.aspect]
      const theme = tone ? transitTheme[transit.transiting]?.[tone] : undefined
      return theme ? { transit, theme } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => a.transit.orb - b.transit.orb)

  // Three passing planets on the same natal point produced three sentences
  // ending in the same clause. The tightest one per point says as much and
  // spreads what is described across different parts of life.
  const perPoint = new Map<AspectPoint, (typeof ranked)[number]>()
  for (const entry of ranked) {
    if (!perPoint.has(entry.transit.natalPoint)) perPoint.set(entry.transit.natalPoint, entry)
  }
  const chosen = [...perPoint.values()].slice(0, MAX_DYNAMICS)

  if (chosen.length === 0) return null

  return {
    paragraphs: chosen.map(
      (entry) => `${entry.theme} ${transitTouches[entry.transit.natalPoint as AspectPoint]}`,
    ),
    evidence: chosen.map(
      (entry) =>
        `${BODY_LABEL[entry.transit.transiting]}${entry.transit.retrograde ? ' retrogrado' : ''} ${
          ASPECT_LABEL[entry.transit.aspect]
        } ${toNatalPoint(entry.transit.natalPoint)} natale · orbita ${entry.transit.orb.toFixed(2)}°`,
    ),
  }
}
