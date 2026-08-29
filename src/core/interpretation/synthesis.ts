/**
 * From signals to a coherent reading.
 *
 * Two jobs: rank the themes that more than one factor supports, and name the
 * places where the evidence pulls in different directions. A tension is never
 * averaged away into a neutral sentence — that would hide the most interesting
 * thing the two systems have to say.
 */
import type { ConvergenceResult } from '../convergence/taxonomy.ts'
import { themeMeaning } from '../../content/interpretation.it.ts'
import { it } from '../../content/it.ts'
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

  // 1. The systems disagree about a theme.
  for (const comparison of convergence.comparisons) {
    if (comparison.level !== 'contrasto') continue
    const leadingIsAstrology = comparison.astrology >= comparison.numerology
    // "la astrologia" is wrong in Italian; the article elides.
    const leadingSystem = leadingIsAstrology ? 'dall’astrologia' : 'dalla numerologia'
    const otherSystem = leadingIsAstrology ? 'la numerologia' : 'l’astrologia'
    const meaning = themeMeaning[comparison.theme] ?? it.convergence.themes[comparison.theme]
    const supporting = leadingIsAstrology ? comparison.astrologyFactors : comparison.numerologyFactors

    found.push({
      kind: 'contrasto-fra-sistemi',
      statement:
        `Sul tema «${it.convergence.themes[comparison.theme]}» — ${meaning} — le due letture non coincidono: ` +
        `emerge con forza ${leadingSystem}, mentre ${otherSystem} non lo mette in evidenza. ` +
        `Non è una contraddizione da risolvere: indica che quella spinta poggia su un solo appoggio, e regge finché quello regge.`,
      evidence: (ranked.find((entry) => entry.theme === comparison.theme)?.evidence ?? []).slice(0, 4),
    })
    if (supporting.length === 0) continue
  }

  // 2. A hard aspect between two personal points is a tension by definition.
  for (const signal of signals) {
    const parts = signal.evidence.key.split(':')
    if (parts[0] !== 'aspect') continue
    const aspect = parts[2] as (typeof HARD_ASPECTS)[number]
    if (!HARD_ASPECTS.includes(aspect)) continue
    found.push({
      kind: 'aspetto-di-tensione',
      statement: `${capitalise(signal.statement)}.`,
      evidence: [signal.evidence],
    })
  }

  // 3. Two strong themes that ask for opposite things.
  const opposed: ReadonlyArray<readonly [string, string, string]> = [
    ['indipendenza', 'relazione', 'il bisogno di decidere da soli e quello di tenere insieme il rapporto'],
    ['innovazione', 'stabilita', 'la spinta a cambiare e il bisogno di terreno fermo'],
    ['analisi', 'creativita', 'la verifica prima di muoversi e la spinta a dare forma subito'],
    ['emotivita', 'organizzazione', 'la centralità del sentire e la richiesta di gestire con metodo'],
  ]
  const strong = new Set(strengths(ranked).map((entry) => entry.theme))
  for (const [first, second, description] of opposed) {
    if (!strong.has(first as ThemeSupport['theme']) || !strong.has(second as ThemeSupport['theme'])) continue
    const evidence = [
      ...(ranked.find((entry) => entry.theme === first)?.evidence ?? []).slice(0, 2),
      ...(ranked.find((entry) => entry.theme === second)?.evidence ?? []).slice(0, 2),
    ]
    found.push({
      kind: 'temi-opposti',
      statement:
        `Due spinte forti convivono e chiedono cose diverse: ${description}. ` +
        `Nel quadro non si annullano: si alternano, e il punto è capire quale delle due sta guidando in un dato momento.`,
      evidence,
    })
  }

  return found
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export { capitalise }
