/**
 * The opening portrait.
 *
 * Built by combining factors, not by listing them. Each factor contributes a
 * noun phrase; the joins express a *relation* between two of them, and whether
 * that relation is one of agreement or of distance is decided by the elements
 * involved — a documented, deterministic rule, not a judgement.
 *
 * The result is one or two cohesive paragraphs. A chart with too little
 * evidence to relate anything gets no portrait at all, rather than a
 * concatenation dressed up as a synthesis.
 */
import type { CompleteChart } from '../astrology/chart.ts'
import type { ZodiacSign } from '../astrology/types.ts'
import type { NumerologyProfile } from '../numerology/profile.ts'
import {
  ascendantManner,
  lifePathModifier,
  moonSecurity,
  portraitJoin,
  signElement,
  sunNeed,
  themeDrive,
} from '../../content/interpretation.it.ts'
import { it } from '../../content/it.ts'
import { signOfLongitude } from './signals.ts'
import type { Evidence, ThemeSupport } from './types.ts'

export interface Portrait {
  readonly paragraphs: readonly string[]
  readonly evidence: readonly Evidence[]
  /** How many factors were actually related to one another. */
  readonly combinations: number
}

/** Fire and air go together, earth and water go together; across, they do not. */
function elementsAgree(a: ZodiacSign, b: ZodiacSign): boolean {
  const first = signElement[a]
  const second = signElement[b]
  if (first === second) return true
  const warm = new Set(['fuoco', 'aria'])
  const cool = new Set(['terra', 'acqua'])
  return (warm.has(first) && warm.has(second)) || (cool.has(first) && cool.has(second))
}

function signLabel(sign: ZodiacSign): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1)
}

export interface PortraitInput {
  readonly chart: CompleteChart | null
  readonly numerology: NumerologyProfile | null
  readonly themes: readonly ThemeSupport[]
}

export function buildPortrait(input: PortraitInput): Portrait | null {
  const { chart, numerology, themes } = input
  const evidence: Evidence[] = []
  const sentences: string[] = []
  let combinations = 0

  const sun = chart?.positions.find((position) => position.body === 'sun')
  const moon = chart?.positions.find((position) => position.body === 'moon')
  const ascendant = chart ? signOfLongitude(chart.ascendantValue) : null

  // 1. Identity meeting its own manner: the first relation, and the one that
  //    usually carries the most.
  if (sun && ascendant) {
    const need = sunNeed[sun.sign]
    const manner = ascendantManner[ascendant]
    const join = elementsAgree(sun.sign, ascendant) ? portraitJoin.agreement : portraitJoin.tension
    sentences.push(`${capitalise(join(need, manner))}.`)
    combinations += 1
    evidence.push(
      { system: 'astrologia', label: `Sole in ${signLabel(sun.sign)}`, key: `sun:${sun.sign}` },
      { system: 'astrologia', label: `Ascendente in ${signLabel(ascendant)}`, key: `ascendant:${ascendant}:h1` },
    )
  } else if (sun) {
    // Without a birth time there is no Ascendant to relate the Sun to.
    sentences.push(`${capitalise(sunNeed[sun.sign])} è il centro del quadro.`)
    evidence.push({ system: 'astrologia', label: `Sole in ${signLabel(sun.sign)}`, key: `sun:${sun.sign}` })
  }

  // 2. The emotional floor, related to the identity rather than stated apart.
  if (sun && moon) {
    const security = moonSecurity[moon.sign]
    const join = elementsAgree(sun.sign, moon.sign) ? portraitJoin.moonSupports : portraitJoin.moonDiverges
    sentences.push(`${join(security)}.`)
    combinations += 1
    evidence.push({ system: 'astrologia', label: `Luna in ${signLabel(moon.sign)}`, key: `moon:${moon.sign}` })
  }

  if (sentences.length === 0) return null

  // 3. The Life Path qualifies the whole, attached to the last sentence rather
  //    than standing on its own.
  if (numerology) {
    const modifier = lifePathModifier[numerology.lifePath.value]
    if (modifier) {
      const last = sentences.pop() as string
      sentences.push(`${last.replace(/\.$/, '')}, ${modifier}.`)
      combinations += 1
      evidence.push({
        system: 'numerologia',
        label: `Sentiero di vita ${numerology.lifePath.value}`,
        key: `lifePath:${numerology.lifePath.value}`,
      })
    }
  }

  // 4. Where both systems lean the same way, say so as a relation between them.
  const shared = themes.find((theme) => theme.systems.length > 1 && theme.evidence.length >= 3)
  if (shared) {
    const drive = themeDrive[shared.theme] ?? it.convergence.themes[shared.theme]
    sentences.push(
      `Su un punto le due letture si sovrappongono: ${drive} torna sia nelle posizioni sia nei numeri, ed è la cosa che il quadro ripete di più.`,
    )
    combinations += 1
    evidence.push(...shared.evidence.slice(0, 3))
  }

  return {
    paragraphs: [sentences.join(' ')],
    evidence: dedupe(evidence),
    combinations,
  }
}

function dedupe(items: readonly Evidence[]): Evidence[] {
  const seen = new Set<string>()
  const result: Evidence[] = []
  for (const item of items) {
    if (seen.has(item.key)) continue
    seen.add(item.key)
    result.push(item)
  }
  return result
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
