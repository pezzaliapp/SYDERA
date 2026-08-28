/**
 * Convergence taxonomy.
 *
 * The comparison between the two systems is a comparison of *themes*, not of
 * truths. Each system contributes a score to a fixed list of symbolic themes
 * through published, deterministic rules; the two scores are then compared.
 *
 * A convergence means the two symbolic vocabularies happen to emphasise the
 * same theme. It is not evidence about a person, and nothing here is written
 * as if it were. The rules are documented in docs/CONVERGENCE_TAXONOMY.md.
 */
import type { BodyId, ZodiacSign } from '../astrology/types.ts'

export const THEMES = [
  'analisi',
  'comunicazione',
  'indipendenza',
  'creativita',
  'stabilita',
  'emotivita',
  'relazione',
  'organizzazione',
  'innovazione',
  'introspezione',
  'concretezza',
] as const

export type ThemeId = (typeof THEMES)[number]

export type ThemeWeights = Partial<Record<ThemeId, number>>

const emptyScores = (): Record<ThemeId, number> =>
  Object.fromEntries(THEMES.map((theme) => [theme, 0])) as Record<ThemeId, number>

/**
 * Numerological contribution. Each number carries the themes the Pythagorean
 * tradition associates with it; the same table drives the readings shown in
 * the numerology section.
 */
export const NUMBER_THEMES: Readonly<Record<number, ThemeWeights>> = Object.freeze({
  1: { indipendenza: 3, innovazione: 1 },
  2: { relazione: 3, emotivita: 2 },
  3: { comunicazione: 3, creativita: 3 },
  4: { stabilita: 3, organizzazione: 2, concretezza: 2 },
  5: { innovazione: 2, comunicazione: 2, indipendenza: 1 },
  6: { relazione: 2, stabilita: 2, emotivita: 1 },
  7: { analisi: 3, introspezione: 3 },
  8: { organizzazione: 3, concretezza: 2 },
  9: { emotivita: 1, creativita: 1, introspezione: 2 },
  11: { introspezione: 2, emotivita: 2, innovazione: 1 },
  22: { organizzazione: 3, concretezza: 3, stabilita: 1 },
  33: { relazione: 3, emotivita: 2, comunicazione: 1 },
})

/** Astrological contribution by sign, following element and modality. */
export const SIGN_THEMES: Readonly<Record<ZodiacSign, ThemeWeights>> = Object.freeze({
  ariete: { indipendenza: 3, innovazione: 1 },
  toro: { stabilita: 3, concretezza: 2 },
  gemelli: { comunicazione: 3, analisi: 1 },
  cancro: { emotivita: 3, relazione: 1 },
  leone: { creativita: 3, indipendenza: 1 },
  vergine: { analisi: 3, organizzazione: 2, concretezza: 1 },
  bilancia: { relazione: 3, comunicazione: 1 },
  scorpione: { introspezione: 3, emotivita: 2 },
  sagittario: { innovazione: 2, comunicazione: 1, indipendenza: 1 },
  capricorno: { organizzazione: 3, concretezza: 2, stabilita: 1 },
  acquario: { innovazione: 3, indipendenza: 2 },
  pesci: { emotivita: 2, introspezione: 2, creativita: 1 },
})

/**
 * Weight of each chart factor. The luminaries and the Ascendant carry more
 * than the personal planets, as in common practice; the slow planets are left
 * out entirely because they describe a generation rather than a person.
 */
export const FACTOR_WEIGHTS: Readonly<Record<string, number>> = Object.freeze({
  sun: 3,
  moon: 3,
  ascendant: 3,
  mercury: 2,
  venus: 2,
  mars: 2,
})

export type ConvergenceLevel = 'convergenza-forte' | 'convergenza-moderata' | 'neutro' | 'contrasto'

export interface ThemeComparison {
  readonly theme: ThemeId
  /** 0–1 after normalisation. */
  readonly astrology: number
  readonly numerology: number
  readonly level: ConvergenceLevel
  /** The factors that produced each score, for the transparency panel. */
  readonly astrologyFactors: readonly string[]
  readonly numerologyFactors: readonly string[]
}

export interface AstrologyThemeInput {
  /** Sign of each weighted factor; omit a factor that could not be calculated. */
  readonly factors: ReadonlyArray<{ readonly factor: BodyId | 'ascendant'; readonly sign: ZodiacSign }>
}

export interface NumerologyThemeInput {
  readonly numbers: ReadonlyArray<{ readonly label: string; readonly value: number }>
}

function normalise(scores: Record<ThemeId, number>): Record<ThemeId, number> {
  const max = Math.max(...Object.values(scores))
  if (max <= 0) return scores
  const result = emptyScores()
  for (const theme of THEMES) result[theme] = scores[theme] / max
  return result
}

export function scoreAstrology(input: AstrologyThemeInput): {
  scores: Record<ThemeId, number>
  factors: Record<ThemeId, string[]>
} {
  const scores = emptyScores()
  const factors = Object.fromEntries(THEMES.map((theme) => [theme, [] as string[]])) as Record<ThemeId, string[]>

  for (const entry of input.factors) {
    const weight = FACTOR_WEIGHTS[entry.factor] ?? 0
    if (weight === 0) continue
    for (const [theme, value] of Object.entries(SIGN_THEMES[entry.sign]) as Array<[ThemeId, number]>) {
      scores[theme] += value * weight
      factors[theme].push(`${entry.factor} in ${entry.sign}`)
    }
  }

  return { scores: normalise(scores), factors }
}

export function scoreNumerology(input: NumerologyThemeInput): {
  scores: Record<ThemeId, number>
  factors: Record<ThemeId, string[]>
} {
  const scores = emptyScores()
  const factors = Object.fromEntries(THEMES.map((theme) => [theme, [] as string[]])) as Record<ThemeId, string[]>

  for (const entry of input.numbers) {
    const weights = NUMBER_THEMES[entry.value]
    if (!weights) continue
    for (const [theme, value] of Object.entries(weights) as Array<[ThemeId, number]>) {
      scores[theme] += value
      factors[theme].push(`${entry.label} = ${entry.value}`)
    }
  }

  return { scores: normalise(scores), factors }
}

const HIGH = 0.6
const LOW = 0.25

/** Fixed thresholds, so the same pair of scores always yields the same level. */
export function classify(astrology: number, numerology: number): ConvergenceLevel {
  const bothHigh = astrology >= HIGH && numerology >= HIGH
  const bothPresent = astrology > LOW && numerology > LOW
  const oneHighOneAbsent =
    (astrology >= HIGH && numerology <= LOW) || (numerology >= HIGH && astrology <= LOW)

  if (bothHigh) return 'convergenza-forte'
  if (oneHighOneAbsent) return 'contrasto'
  if (bothPresent) return 'convergenza-moderata'
  return 'neutro'
}

export interface ConvergenceResult {
  readonly comparisons: readonly ThemeComparison[]
  /** True when one of the two systems could not be scored at all. */
  readonly incomplete: boolean
}

export function compareSystems(
  astrologyInput: AstrologyThemeInput | null,
  numerologyInput: NumerologyThemeInput | null,
): ConvergenceResult {
  if (!astrologyInput || !numerologyInput) {
    return { comparisons: [], incomplete: true }
  }

  const astrology = scoreAstrology(astrologyInput)
  const numerology = scoreNumerology(numerologyInput)

  const comparisons = THEMES.map((theme) => ({
    theme,
    astrology: astrology.scores[theme],
    numerology: numerology.scores[theme],
    level: classify(astrology.scores[theme], numerology.scores[theme]),
    astrologyFactors: [...new Set(astrology.factors[theme])],
    numerologyFactors: [...new Set(numerology.factors[theme])],
  }))

  const order: Record<ConvergenceLevel, number> = {
    'convergenza-forte': 0,
    contrasto: 1,
    'convergenza-moderata': 2,
    neutro: 3,
  }

  return {
    comparisons: [...comparisons].sort((a, b) => {
      const byLevel = order[a.level] - order[b.level]
      if (byLevel !== 0) return byLevel
      return b.astrology + b.numerology - (a.astrology + a.numerology)
    }),
    incomplete: false,
  }
}
