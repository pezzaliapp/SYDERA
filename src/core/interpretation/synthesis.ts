/**
 * From signals to a coherent reading.
 *
 * Two jobs: rank the themes that more than one factor supports, and name the
 * places where the evidence pulls in different directions. A tension is never
 * averaged away into a neutral sentence — that would hide the most interesting
 * thing the two systems have to say.
 */
import type { ConvergenceResult } from '../convergence/taxonomy.ts'
import {
  hardAspectConsequence,
  oppositionResolution,
  themeDrive,
  themeMeaning,
} from '../../content/interpretation.it.ts'
import { pickDistinct } from './italian.ts'
import { HARD_ASPECTS, MIN_FACTORS_FOR_STRENGTH, STRENGTH_RELATIVE_FLOOR } from './weights.ts'
import type { Evidence, Signal, SystemId, Tension, ThemeSupport } from './types.ts'

/** Rank themes by the weight of everything that supports them. */
export function rankThemes(signals: readonly Signal[]): ThemeSupport[] {
  const totals = new Map<string, { score: number; evidence: Evidence[]; systems: Set<SystemId> }>()

  for (const signal of signals) {
    for (const theme of signal.themes) {
      const entry = totals.get(theme) ?? { score: 0, evidence: [], systems: new Set<SystemId>() }
      entry.score += signal.weight
      entry.evidence.push(signal.evidence)
      entry.systems.add(signal.evidence.system)
      totals.set(theme, entry)
    }
  }

  return [...totals.entries()]
    .map(([theme, entry]) => ({
      theme: theme as ThemeSupport['theme'],
      score: entry.score,
      evidence: entry.evidence,
      systems: [...entry.systems],
    }))
    .sort((a, b) => b.score - a.score || a.theme.localeCompare(b.theme))
}

/**
 * The themes strong enough to be called a pattern: supported by at least two
 * distinct factors and not trivially far behind the leading theme.
 */
export function strengths(themes: readonly ThemeSupport[]): ThemeSupport[] {
  const leader = themes[0]
  if (!leader) return []
  return themes.filter(
    (theme) =>
      theme.evidence.length >= MIN_FACTORS_FOR_STRENGTH &&
      theme.score >= leader.score * STRENGTH_RELATIVE_FLOOR,
  )
}

/**
 * Where the reading disagrees with itself.
 *
 * Three sources, in order of interest: the two systems pointing different ways
 * about the same theme, a hard aspect between two personal points, and two
 * strongly supported themes that sit awkwardly together.
 */
export function tensions(
  signals: readonly Signal[],
  convergence: ConvergenceResult,
  ranked: readonly ThemeSupport[],
): Tension[] {
  const found: Tension[] = []

  // 1. The systems disagree about a theme. Both sides are named, with the
  //    factors that actually support them, and what the other language puts
  //    in that place instead.
  for (const comparison of convergence.comparisons) {
    if (comparison.level !== 'contrasto') continue
    const leadingIsAstrology = comparison.astrology >= comparison.numerology
    const supporting = leadingIsAstrology ? comparison.astrologyFactors : comparison.numerologyFactors
    if (supporting.length === 0) continue

    const drive = themeDrive[comparison.theme] ?? themeMeaning[comparison.theme] ?? ''
    const leadingName = leadingIsAstrology ? 'nelle posizioni' : 'nei numeri'
    const otherName = leadingIsAstrology ? 'i numeri' : 'le posizioni'

    // What the quiet system emphasises instead, so the contrast has two poles.
    const counterTheme = convergence.comparisons
      .filter((entry) => entry.theme !== comparison.theme)
      .sort((a, b) =>
        leadingIsAstrology ? b.numerology - a.numerology : b.astrology - a.astrology,
      )[0]
    const counterFactors = counterTheme
      ? leadingIsAstrology
        ? counterTheme.numerologyFactors
        : counterTheme.astrologyFactors
      : []
    const counterDrive = counterTheme ? themeDrive[counterTheme.theme] ?? '' : ''

    const counterClause =
      counterTheme && counterDrive && counterFactors.length > 0
        ? ` ${capitalise(otherName)} indicano piuttosto un’altra direzione: ${counterDrive} (${readableFactors(counterFactors)}).`
        : ` ${capitalise(otherName)} non aggiungono nulla su questo punto.`

    found.push({
      kind: 'contrasto-fra-sistemi',
      statement:
        `${capitalise(drive)} compare ${leadingName} — ${readableFactors(supporting)} — ma non trova conferma dall’altra parte.` +
        counterClause +
        ` Le due spinte non si annullano: la prima resta, e va tenuta sapendo che poggia su un appoggio solo.`,
      evidence: (ranked.find((entry) => entry.theme === comparison.theme)?.evidence ?? []).slice(0, 4),
      ...(counterDrive ? { poles: { leading: drive, counter: counterDrive } } : {}),
    })
  }

  // 2. A hard aspect between two personal points is a tension by definition.
  //    The two functions are already named; what was missing was the cost.
  const usedCosts = new Set<string>()
  for (const signal of signals) {
    const parts = signal.evidence.key.split(':')
    if (parts[0] !== 'aspect') continue
    const aspect = parts[2] as (typeof HARD_ASPECTS)[number]
    if (!HARD_ASPECTS.includes(aspect)) continue
    const consequence = pickDistinct(hardAspectConsequence[aspect] ?? [], signal.evidence.key, usedCosts)
    // The base sentence already carries a colon, so the consequence is joined
    // as a clause rather than with a second one.
    const base = capitalise(signal.statement)
    found.push({
      kind: 'aspetto-di-tensione',
      statement: consequence ? `${base}. In pratica ${consequence}.` : `${base}.`,
      evidence: [signal.evidence],
    })
  }

  // 3. Two strong themes that ask for opposite things.
  const opposed: ReadonlyArray<readonly [string, string]> = [
    ['indipendenza', 'relazione'],
    ['innovazione', 'stabilita'],
    ['analisi', 'creativita'],
    ['emotivita', 'organizzazione'],
  ]
  const strong = new Set(strengths(ranked).map((entry) => entry.theme))
  for (const [first, second] of opposed) {
    if (!strong.has(first as ThemeSupport['theme']) || !strong.has(second as ThemeSupport['theme'])) continue
    const evidence = [
      ...(ranked.find((entry) => entry.theme === first)?.evidence ?? []).slice(0, 2),
      ...(ranked.find((entry) => entry.theme === second)?.evidence ?? []).slice(0, 2),
    ]
    const firstEvidence = (ranked.find((entry) => entry.theme === first)?.evidence ?? []).slice(0, 2)
    const secondEvidence = (ranked.find((entry) => entry.theme === second)?.evidence ?? []).slice(0, 2)
    const resolution = oppositionResolution[`${first}|${second}`] ?? ''

    found.push({
      kind: 'temi-opposti',
      statement:
        `Da una parte ${themeDrive[first] ?? first} (${labelList(firstEvidence)}); ` +
        `dall’altra ${themeDrive[second] ?? second} (${labelList(secondEvidence)}).` +
        (resolution ? ` ${resolution}` : ` Le due cose non si annullano: si alternano, e conta sapere quale sta guidando.`),
      evidence,
      poles: { leading: themeDrive[first] ?? first, counter: themeDrive[second] ?? second },
    })
  }

  return found
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const BODY_LABELS: Readonly<Record<string, string>> = {
  sun: 'Sole', moon: 'Luna', mercury: 'Mercurio', venus: 'Venere', mars: 'Marte',
  jupiter: 'Giove', saturn: 'Saturno', uranus: 'Urano', neptune: 'Nettuno', pluto: 'Plutone',
  ascendant: 'Ascendente',
}

/**
 * Turns the two shapes the convergence engine produces into readable Italian:
 * "sun in vergine" -> "Sole in Vergine", "Anima = 8" -> "Anima 8".
 */
function readableFactors(factors: readonly string[]): string {
  const labels = factors.slice(0, 3).map((factor) => {
    if (factor.includes(' = ')) {
      const [label, value] = factor.split(' = ')
      return `${label} ${value}`
    }
    const match = /^(\S+) in (\S+)$/.exec(factor)
    if (!match) return factor
    const bodyLabel = BODY_LABELS[match[1] ?? ''] ?? (match[1] ?? '')
    const sign = match[2] ?? ''
    return `${bodyLabel} in ${sign.charAt(0).toUpperCase()}${sign.slice(1)}`
  })
  return joinWithAnd(labels)
}

function labelList(evidence: readonly Evidence[]): string {
  return joinWithAnd(evidence.map((item) => item.label.replace(/^[^—]+ — /, '')))
}

function joinWithAnd(parts: readonly string[]): string {
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0] as string
  const last = parts[parts.length - 1] as string
  // Euphonic "ed" before a word starting with a vowel.
  const conjunction = /^[aeiouAEIOU]/.test(last) ? 'ed' : 'e'
  return `${parts.slice(0, -1).join(', ')} ${conjunction} ${last}`
}

export { capitalise }
