/**
 * SYDERA — interpretation layer.
 *
 * This layer never calculates anything astronomical or numerological. It reads
 * the results of the validated engines, builds a small model of the person
 * from them, and writes the reading from that model.
 *
 *   calculated fact  ->  tendency (weighted, with evidence)
 *                    ->  person model
 *                    ->  the five sections of the reading
 *
 * Every visible sentence descends from the model, and every part of the model
 * carries the calculated facts that produced it. Nothing is shown that cannot
 * be traced back to a number the engines computed.
 */
export type SystemId = 'astrologia' | 'numerologia'

/** One calculated fact, in the form shown under "Perché questa lettura?". */
export interface Evidence {
  readonly system: SystemId
  /** Human-readable, e.g. "Sole in Capricorno, casa 1". */
  readonly label: string
  /** Stable machine key, e.g. "sun:capricorno". Tests use it to prove traceability. */
  readonly key: string
}

export const SECTION_IDS = ['ritratto', 'pensiero', 'emozioni', 'equilibrio', 'momento'] as const
export type SectionId = (typeof SECTION_IDS)[number]

export interface ReportSection {
  readonly id: SectionId
  readonly title: string
  readonly paragraphs: readonly string[]
  /** The calculated facts this section rests on, shown on request. */
  readonly evidence: readonly Evidence[]
}

export interface Report {
  readonly sections: readonly ReportSection[]
}
