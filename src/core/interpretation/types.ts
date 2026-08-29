/**
 * SYDERA — interpretation layer.
 *
 * This layer turns validated calculations into a readable portrait. It never
 * calculates anything astronomical or numerological: it consumes the results
 * of the Phase 2 engines and decides what to say about them, and why.
 *
 * The chain is deliberately explicit:
 *
 *   calculated fact  ->  signal (weighted, with evidence)
 *                    ->  theme scores and domain statements
 *                    ->  report sections
 *
 * Every sentence in the final report descends from at least one signal, and
 * every signal carries the evidence that produced it. Nothing is generated
 * that cannot be traced back to a number the engines computed.
 */
import type { ThemeId } from '../convergence/taxonomy.ts'

export type SystemId = 'astrologia' | 'numerologia'

/** One calculated fact, in the form shown under "Perché questa lettura?". */
export interface Evidence {
  readonly system: SystemId
  /** Human-readable, e.g. "Sole in Capricorno, casa 1". */
  readonly label: string
  /** Stable machine key, e.g. "sun:capricorno". Tests use it to prove traceability. */
  readonly key: string
}

/**
 * The areas the report speaks about. Each maps to one section, and each is
 * fed by the factors that the two traditions actually associate with it —
 * not by a generic personality model.
 */
export const DOMAINS = ['presentazione', 'mente', 'emozioni', 'relazioni', 'azione'] as const
export type DomainId = (typeof DOMAINS)[number]

/** A single calculated factor, translated into what it contributes. */
export interface Signal {
  readonly evidence: Evidence
  /** Editorial weight. Documented in docs/INTERPRETATION_MODEL.md. */
  readonly weight: number
  /** Themes this factor speaks to, taken from the shared convergence taxonomy. */
  readonly themes: readonly ThemeId[]
  /** The domain this factor speaks about, when it speaks about one. */
  readonly domain: DomainId | null
  /** The sentence it contributes to that domain. */
  readonly statement: string
  /** A sentence for the opening portrait, for structural factors only. */
  readonly portrait?: string
}

/** A theme, with everything that supports it, ranked. */
export interface ThemeSupport {
  readonly theme: ThemeId
  readonly score: number
  /** Distinct factors supporting it; a theme with one factor is not a pattern. */
  readonly evidence: readonly Evidence[]
  readonly systems: readonly SystemId[]
}

/** Two signals that pull in different directions, named rather than averaged. */
export interface Tension {
  readonly kind: 'contrasto-fra-sistemi' | 'aspetto-di-tensione' | 'temi-opposti'
  readonly statement: string
  readonly evidence: readonly Evidence[]
}

export const SECTION_IDS = [
  'profilo',
  'presentazione',
  'mente',
  'emozioni',
  'relazioni',
  'azione',
  'forze',
  'tensioni',
  'filo',
  'ciclo',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface ReportSection {
  readonly id: SectionId
  readonly title: string
  readonly paragraphs: readonly string[]
  /** What the section is built on, shown on request. */
  readonly evidence: readonly Evidence[]
}

/** A section that could not be written, and the honest reason why. */
export interface OmittedSection {
  readonly id: SectionId
  readonly title: string
  readonly reason: string
}

export interface Report {
  readonly sections: readonly ReportSection[]
  readonly omitted: readonly OmittedSection[]
  /** Ranked themes, for the strengths section and the convergence screen. */
  readonly themes: readonly ThemeSupport[]
  /** Everything the report was built from, in evidence form. */
  readonly signals: readonly Signal[]
}
