/**
 * From calculated facts to signals.
 *
 * Each function here reads validated output and produces signals: a weighted
 * statement plus the evidence that justifies it. Nothing is emitted without a
 * calculated fact behind it, so a chart that lacks a placement simply produces
 * fewer signals rather than a vaguer sentence.
 */
import type { CompleteChart } from '../astrology/chart.ts'
import type { AspectPoint, BodyId, ZodiacSign } from '../astrology/types.ts'
import { SIGN_THEMES, NUMBER_THEMES, type ThemeId } from '../convergence/taxonomy.ts'
import type { NumerologyProfile } from '../numerology/profile.ts'
import {
  ANGULAR_HOUSES,
  ANGULAR_HOUSE_BONUS,
  ASPECT_WEIGHT,
  BODY_WEIGHT,
  NUMBER_WEIGHT,
  orbFactor,
} from './weights.ts'
import type { DomainId, Signal } from './types.ts'
import {
  ascendantInSign,
  aspectPhrase,
  bodyFunction,
  expressionStyle,
  houseArea,
  lifePathDirection,
  marsInSign,
  mercuryInSign,
  moonInSign,
  personalityOuter,
  retrogradeNote,
  soulUrgeInner,
  sunInSign,
  venusInSign,
} from '../../content/interpretation.it.ts'
import { signReadings } from '../../content/astrologyThemes.it.ts'

const SIGN_LABEL = (sign: ZodiacSign): string => signReadings[sign].label

const themesOfSign = (sign: ZodiacSign): ThemeId[] => Object.keys(SIGN_THEMES[sign]) as ThemeId[]
const themesOfNumber = (value: number): ThemeId[] => Object.keys(NUMBER_THEMES[value] ?? {}) as ThemeId[]

/** Personal factors: each owns the domain the tradition reads it for. */
const PERSONAL_FACTORS: ReadonlyArray<{
  readonly point: BodyId | 'ascendant'
  readonly domain: DomainId
  readonly text: Readonly<Record<ZodiacSign, string>>
  readonly inPortrait: boolean
}> = [
  { point: 'sun', domain: 'azione', text: sunInSign, inPortrait: true },
  { point: 'ascendant', domain: 'presentazione', text: ascendantInSign, inPortrait: true },
  { point: 'moon', domain: 'emozioni', text: moonInSign, inPortrait: true },
  { point: 'mercury', domain: 'mente', text: mercuryInSign, inPortrait: false },
  { point: 'venus', domain: 'relazioni', text: venusInSign, inPortrait: false },
  { point: 'mars', domain: 'azione', text: marsInSign, inPortrait: false },
]

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Signals from a complete chart: placements first, then aspects. */
export function astrologySignals(chart: CompleteChart): Signal[] {
  const signals: Signal[] = []
  const byBody = new Map(chart.positions.map((position) => [position.body, position]))

  for (const factor of PERSONAL_FACTORS) {
    const isAscendant = factor.point === 'ascendant'
    const position = isAscendant ? null : byBody.get(factor.point as BodyId)
    const sign = isAscendant ? signOfLongitude(chart.ascendantValue) : position?.sign
    if (!sign) continue

    const house = isAscendant ? 1 : (position?.house ?? null)
    // The Ascendant is the first house by definition, so saying so adds nothing.
    const showHouse = house !== null && !(isAscendant && house === 1)
    const houseClause = showHouse ? `, ${houseArea[house as number]}` : ''
    const label = isAscendant
      ? `Ascendente in ${SIGN_LABEL(sign)}`
      : `${capitalise(bodyFunction[factor.point])} — ${labelOf(factor.point)} in ${SIGN_LABEL(sign)}${house ? `, casa ${house}` : ''}`

    let weight = BODY_WEIGHT[factor.point]
    if (house && ANGULAR_HOUSES.includes(house)) weight += ANGULAR_HOUSE_BONUS

    const statement = `${factor.text[sign]}${houseClause}`

    signals.push({
      evidence: { system: 'astrologia', label, key: `${factor.point}:${sign}${house ? `:h${house}` : ''}` },
      weight,
      themes: themesOfSign(sign),
      domain: factor.domain,
      statement,
      ...(factor.inPortrait ? { portrait: factor.text[sign] } : {}),
    })

    // A retrograde personal planet turns its function inward; said once, plainly.
    if (position?.retrograde && retrogradeNote[factor.point]) {
      signals.push({
        evidence: {
          system: 'astrologia',
          label: `${labelOf(factor.point)} retrogrado`,
          key: `${factor.point}:retrograde`,
        },
        weight: 1,
        themes: ['introspezione'],
        domain: factor.domain,
        statement: retrogradeNote[factor.point] as string,
      })
    }
  }

  // Aspects between points that carry weight. A generational body counts only
  // when it touches a personal one, which is the only way it becomes personal.
  for (const aspect of chart.aspects) {
    const weightA = BODY_WEIGHT[aspect.a as keyof typeof BODY_WEIGHT] ?? 0
    const weightB = BODY_WEIGHT[aspect.b as keyof typeof BODY_WEIGHT] ?? 0
    const touchesPersonal = weightA >= 2 || weightB >= 2
    if (!touchesPersonal) continue

    const weight = ASPECT_WEIGHT[aspect.aspect] * orbFactor(aspect.orb, aspect.allowedOrb)
    const functionA = bodyFunction[aspect.a as keyof typeof bodyFunction]
    const functionB = bodyFunction[aspect.b as keyof typeof bodyFunction]
    if (!functionA || !functionB) continue

    signals.push({
      evidence: {
        system: 'astrologia',
        label: `${labelOf(aspect.a)} ${aspectWord(aspect.aspect, labelOf(aspect.b))} (orbita ${aspect.orb.toFixed(1)}°)`,
        key: `aspect:${aspect.a}:${aspect.aspect}:${aspect.b}`,
      },
      weight,
      themes: [],
      domain: domainOfAspect(aspect.a, aspect.b),
      statement: aspectPhrase[aspect.aspect](functionA, functionB),
    })
  }

  return signals
}

/** Signals from the numerological profile. */
export function numerologySignals(profile: NumerologyProfile): Signal[] {
  const signals: Signal[] = []

  const entries: ReadonlyArray<{
    readonly key: keyof typeof NUMBER_WEIGHT
    readonly label: string
    readonly value: number
    readonly domain: DomainId
    readonly text: Readonly<Record<number, string>>
    readonly inPortrait: boolean
  }> = [
    { key: 'lifePath', label: 'Sentiero di vita', value: profile.lifePath.value, domain: 'azione', text: lifePathDirection, inPortrait: true },
    { key: 'expression', label: 'Espressione', value: profile.expression.value, domain: 'mente', text: expressionStyle, inPortrait: true },
    { key: 'soulUrge', label: 'Anima', value: profile.soulUrge.value, domain: 'emozioni', text: soulUrgeInner, inPortrait: false },
    { key: 'personality', label: 'Personalità', value: profile.personality.value, domain: 'presentazione', text: personalityOuter, inPortrait: false },
  ]

  for (const entry of entries) {
    const statement = entry.text[entry.value]
    if (!statement) continue
    signals.push({
      evidence: { system: 'numerologia', label: `${entry.label} ${entry.value}`, key: `${entry.key}:${entry.value}` },
      weight: NUMBER_WEIGHT[entry.key],
      themes: themesOfNumber(entry.value),
      domain: entry.domain,
      statement,
      ...(entry.inPortrait ? { portrait: statement } : {}),
    })
  }

  return signals
}

function labelOf(point: AspectPoint): string {
  const names: Record<string, string> = {
    sun: 'Sole',
    moon: 'Luna',
    mercury: 'Mercurio',
    venus: 'Venere',
    mars: 'Marte',
    jupiter: 'Giove',
    saturn: 'Saturno',
    uranus: 'Urano',
    neptune: 'Nettuno',
    pluto: 'Plutone',
    ascendant: 'Ascendente',
    midheaven: 'Medio Cielo',
  }
  return names[point] ?? point
}

/** "a" elides before a vowel: "in quadrato all'Ascendente", not "a Ascendente". */
function aspectWord(aspect: string, target: string): string {
  const vowelStart = /^[AEIOU]/i.test(target)
  const preposition = vowelStart ? 'all’' : 'a '
  const words: Record<string, string> = {
    congiunzione: `congiunto ${preposition}`,
    sestile: `in sestile ${preposition}`,
    quadrato: `in quadrato ${preposition}`,
    trigono: `in trigono ${preposition}`,
    opposizione: `in opposizione ${preposition}`,
  }
  return `${words[aspect] ?? aspect}${target}`
}

/** An aspect speaks about the domain of the more personal point involved. */
function domainOfAspect(a: AspectPoint, b: AspectPoint): DomainId | null {
  const domains: Partial<Record<string, DomainId>> = {
    ascendant: 'presentazione',
    mercury: 'mente',
    moon: 'emozioni',
    venus: 'relazioni',
    mars: 'azione',
    sun: 'azione',
  }
  return domains[a] ?? domains[b] ?? null
}

function signOfLongitude(longitude: number): ZodiacSign {
  const signs: ZodiacSign[] = [
    'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
    'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
  ]
  const wrapped = ((longitude % 360) + 360) % 360
  return signs[Math.floor(wrapped / 30)] as ZodiacSign
}

export { signOfLongitude }
