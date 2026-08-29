/**
 * The person model.
 *
 * Between the calculated facts and the words there is exactly one step: a
 * small set of ordinary human tendencies, each scored from the evidence that
 * supports it. Nothing is written from a single planet, number or aspect —
 * every sentence in the reading is chosen by this model, never by a factor.
 *
 *   calculated facts  ->  tendencies (few, human, weighted)
 *                     ->  the relationship between the strongest two
 *                     ->  the reading
 *
 * The tendencies are deliberately fewer than the eleven symbolic themes of the
 * convergence taxonomy: several of those describe the same thing in a person,
 * and a reader does not need the distinction.
 */
import type { CompleteChart } from '../astrology/chart.ts'
import type { AspectPoint, BodyId, ZodiacSign } from '../astrology/types.ts'
import { NUMBER_THEMES, SIGN_THEMES, type ThemeId } from '../convergence/taxonomy.ts'
import type { NumerologyProfile } from '../numerology/profile.ts'
import { signReadings } from '../../content/astrologyThemes.it.ts'
import { ANGULAR_HOUSES, ANGULAR_HOUSE_BONUS, ASPECT_WEIGHT, BODY_WEIGHT, NUMBER_WEIGHT, orbFactor } from './weights.ts'
import type { Evidence, SystemId } from './types.ts'

export const TENDENCIES = [
  'autonomia',
  'struttura',
  'concretezza',
  'analisi',
  'espressione',
  'relazione',
  'sensibilita',
  'cambiamento',
] as const

export type TendencyId = (typeof TENDENCIES)[number]

/**
 * How the symbolic themes map onto tendencies a person would recognise.
 * "Comunicazione" and "creatività" are one thing when you describe someone;
 * so are "emotività" and "introspezione".
 */
const FROM_THEME: Readonly<Record<ThemeId, TendencyId>> = Object.freeze({
  indipendenza: 'autonomia',
  organizzazione: 'struttura',
  stabilita: 'concretezza',
  concretezza: 'concretezza',
  analisi: 'analisi',
  comunicazione: 'espressione',
  creativita: 'espressione',
  relazione: 'relazione',
  emotivita: 'sensibilita',
  introspezione: 'sensibilita',
  innovazione: 'cambiamento',
})

/** Which tendencies speak about thinking and working, and which about people. */
export const PRACTICAL: readonly TendencyId[] = ['analisi', 'struttura', 'concretezza', 'espressione', 'cambiamento', 'autonomia']
export const AFFECTIVE: readonly TendencyId[] = ['sensibilita', 'relazione', 'autonomia', 'espressione']

export interface Tendency {
  readonly id: TendencyId
  readonly score: number
  /** The calculated facts behind it, strongest first. */
  readonly evidence: readonly Evidence[]
  readonly systems: readonly SystemId[]
}

export interface PersonModel {
  /** Ranked, strongest first. Only tendencies the evidence actually supports. */
  readonly tendencies: readonly Tendency[]
  /** The current period, when the numbers are there to place it. */
  readonly moment: { readonly year: number; readonly evidence: Evidence } | null
}

interface Contribution {
  readonly tendency: TendencyId
  readonly amount: number
  readonly evidence: Evidence
}

const signLabel = (sign: ZodiacSign): string => signReadings[sign].label

const BODY_LABEL: Readonly<Record<string, string>> = Object.freeze({
  sun: 'Sole', moon: 'Luna', mercury: 'Mercurio', venus: 'Venere', mars: 'Marte',
  jupiter: 'Giove', saturn: 'Saturno', uranus: 'Urano', neptune: 'Nettuno', pluto: 'Plutone',
  ascendant: 'Ascendente', midheaven: 'Medio Cielo',
})

/** The placements a reading rests on. Slow bodies describe a generation. */
const PLACEMENTS: readonly (BodyId | 'ascendant')[] = ['sun', 'moon', 'ascendant', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']

function signOfLongitude(longitude: number): ZodiacSign {
  const signs: ZodiacSign[] = [
    'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
    'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
  ]
  const wrapped = ((longitude % 360) + 360) % 360
  return signs[Math.floor(wrapped / 30)] as ZodiacSign
}

/**
 * Builds the model. A missing system simply produces fewer tendencies, never a
 * vaguer one: what is not calculated contributes nothing.
 */
export function buildPerson(
  chart: CompleteChart | null,
  numerology: NumerologyProfile | null,
): PersonModel {
  const contributions: Contribution[] = []

  if (chart) {
    const byBody = new Map(chart.positions.map((position) => [position.body, position]))
    const signOf = new Map<AspectPoint, ZodiacSign>()

    for (const point of PLACEMENTS) {
      const isAscendant = point === 'ascendant'
      const position = isAscendant ? null : byBody.get(point as BodyId)
      const sign = isAscendant ? signOfLongitude(chart.ascendantValue) : position?.sign
      if (!sign) continue
      signOf.set(point as AspectPoint, sign)

      const house = isAscendant ? 1 : (position?.house ?? null)
      let weight = BODY_WEIGHT[point]
      if (house && ANGULAR_HOUSES.includes(house)) weight += ANGULAR_HOUSE_BONUS
      if (weight <= 0) continue

      const label = isAscendant
        ? `Ascendente in ${signLabel(sign)}`
        : `${BODY_LABEL[point]} in ${signLabel(sign)}${house ? `, casa ${house}` : ''}`
      const evidence: Evidence = {
        system: 'astrologia',
        label,
        key: `${point}:${sign}${house ? `:h${house}` : ''}`,
      }
      add(contributions, SIGN_THEMES[sign], weight, evidence)
    }

    // An aspect does not introduce a tendency of its own: it emphasises the two
    // placements it links, which is how the tradition reads it and the only
    // claim the calculation supports.
    for (const aspect of chart.aspects) {
      const signA = signOf.get(aspect.a)
      const signB = signOf.get(aspect.b)
      if (!signA && !signB) continue
      const strength = ASPECT_WEIGHT[aspect.aspect] * orbFactor(aspect.orb, aspect.allowedOrb) * 0.5
      if (strength <= 0) continue
      const evidence: Evidence = {
        system: 'astrologia',
        label: `${BODY_LABEL[aspect.a] ?? aspect.a} ${ASPECT_LABEL[aspect.aspect]} ${BODY_LABEL[aspect.b] ?? aspect.b}`,
        key: `aspect:${aspect.a}:${aspect.aspect}:${aspect.b}`,
      }
      if (signA) add(contributions, SIGN_THEMES[signA], strength, evidence)
      if (signB) add(contributions, SIGN_THEMES[signB], strength, evidence)
    }
  }

  if (numerology) {
    const numbers: ReadonlyArray<{ key: keyof typeof NUMBER_WEIGHT; label: string; value: number }> = [
      { key: 'lifePath', label: 'Sentiero di vita', value: numerology.lifePath.value },
      { key: 'expression', label: 'Espressione', value: numerology.expression.value },
      { key: 'soulUrge', label: 'Anima', value: numerology.soulUrge.value },
      { key: 'personality', label: 'Personalità', value: numerology.personality.value },
    ]
    for (const number of numbers) {
      const weights = NUMBER_THEMES[number.value]
      if (!weights) continue
      add(contributions, weights, NUMBER_WEIGHT[number.key], {
        system: 'numerologia',
        label: `${number.label} ${number.value}`,
        key: `${number.key}:${number.value}`,
      })
    }
  }

  return {
    tendencies: rank(contributions),
    moment: numerology
      ? {
          year: numerology.personalYear.value,
          evidence: {
            system: 'numerologia',
            label: `Anno personale ${numerology.personalYear.value}`,
            key: `personalYear:${numerology.personalYear.value}`,
          },
        }
      : null,
  }
}

const ASPECT_LABEL: Readonly<Record<string, string>> = Object.freeze({
  congiunzione: 'congiunto a',
  sestile: 'in sestile a',
  quadrato: 'in quadrato a',
  trigono: 'in trigono a',
  opposizione: 'in opposizione a',
})

function add(
  into: Contribution[],
  weights: Partial<Record<ThemeId, number>>,
  factor: number,
  evidence: Evidence,
): void {
  for (const [theme, value] of Object.entries(weights) as Array<[ThemeId, number]>) {
    const tendency = FROM_THEME[theme]
    if (!tendency) continue
    into.push({ tendency, amount: value * factor, evidence })
  }
}

/**
 * A tendency needs support from more than one calculated factor before it
 * describes someone. One placement is a detail, not a way of being.
 */
const MIN_FACTORS = 2

/** Below this share of the leading tendency, what is left is background. */
const RELATIVE_FLOOR = 0.3

function rank(contributions: readonly Contribution[]): Tendency[] {
  const scores = new Map<TendencyId, number>()
  const evidence = new Map<TendencyId, Map<string, { evidence: Evidence; amount: number }>>()

  for (const entry of contributions) {
    scores.set(entry.tendency, (scores.get(entry.tendency) ?? 0) + entry.amount)
    const seen = evidence.get(entry.tendency) ?? new Map()
    const already = seen.get(entry.evidence.key)
    seen.set(entry.evidence.key, {
      evidence: entry.evidence,
      amount: (already?.amount ?? 0) + entry.amount,
    })
    evidence.set(entry.tendency, seen)
  }

  const all = [...scores.entries()]
    .map(([id, score]) => {
      const facts = [...(evidence.get(id)?.values() ?? [])]
        .sort((a, b) => b.amount - a.amount)
        .map((entry) => entry.evidence)
      return {
        id,
        score,
        evidence: facts,
        systems: [...new Set(facts.map((fact) => fact.system))],
      }
    })
    .filter((tendency) => tendency.evidence.length >= MIN_FACTORS)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))

  const leader = all[0]?.score ?? 0
  return all.filter((tendency) => tendency.score >= leader * RELATIVE_FLOOR)
}

/** The two strongest tendencies, which is where the balance point lives. */
export function balancePair(model: PersonModel): readonly [Tendency, Tendency] | null {
  const [first, second] = model.tendencies
  if (!first || !second) return null
  return [first, second]
}

/** The strongest tendencies within one area of life. */
export function strongestIn(model: PersonModel, area: readonly TendencyId[], count: number): Tendency[] {
  return model.tendencies.filter((tendency) => area.includes(tendency.id)).slice(0, count)
}
