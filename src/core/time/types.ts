/**
 * SYDERA — conversion from local civil birth time to UTC.
 *
 * The birth record states a local civil time. Every astronomical calculation
 * needs an unambiguous instant. Between the two sits the historical rule set
 * of the birth place, which SYDERA must apply honestly: today's offset is
 * never assumed to have been in force in the past, and where the rules leave
 * a genuine ambiguity the user decides — the engine does not guess.
 */

/** A civil date and time as written on a birth record. */
export interface LocalDateTime {
  readonly year: number
  readonly month: number
  readonly day: number
  readonly hour: number
  readonly minute: number
}

export interface UtcInstant {
  /** Milliseconds since the Unix epoch. */
  readonly epochMs: number
  /** Offset applied, in minutes east of UTC (Rome in winter = +60). */
  readonly offsetMinutes: number
}

export type OffsetSource =
  /** Resolved from the IANA rules shipped with the browser. */
  | 'iana'
  /** Chosen by the user among the candidates of an ambiguous local time. */
  | 'iana-user-choice'
  /** Entered by the user, overriding the resolved value. */
  | 'manual'

/**
 * Outcome of resolving a local civil time in a zone.
 *
 * 'ambiguous'   the clock was set back, so this local time occurred twice;
 * 'nonexistent' the clock jumped forward, so this local time never occurred.
 */
export type ResolutionOutcome =
  | { readonly kind: 'resolved'; readonly instant: UtcInstant }
  | {
      readonly kind: 'ambiguous'
      /** Both instants are real; the user must say which one. Earlier first. */
      readonly candidates: readonly UtcInstant[]
    }
  | {
      readonly kind: 'nonexistent'
      /** Offsets in force immediately before and after the gap. */
      readonly offsetBeforeMinutes: number
      readonly offsetAfterMinutes: number
      /** Length of the skipped interval, in minutes. */
      readonly gapMinutes: number
    }
  | { readonly kind: 'invalid-zone'; readonly zoneId: string }
  | { readonly kind: 'invalid-local-time' }

/** Why a resolved offset may still deserve a warning. */
export type OffsetCaveat =
  /** Birth before 1970: the IANA data is explicitly best-effort before then. */
  | 'pre-1970'
  /** Before the zone adopted standard time: the offset is local mean time. */
  | 'local-mean-time'
  /** The offset is not a whole number of minutes off a standard meridian. */
  | 'unusual-offset'
  /** The user overrode the resolved value. */
  | 'manual-override'

export interface ResolvedBirthInstant {
  readonly local: LocalDateTime
  readonly zoneId: string
  readonly instant: UtcInstant
  readonly source: OffsetSource
  readonly caveats: readonly OffsetCaveat[]
  /**
   * Offsets at fixed probe instants, recorded so a later recomputation can
   * detect that the platform's time zone database has changed underneath a
   * stored chart instead of silently producing different positions.
   */
  readonly zoneFingerprint: string
}
