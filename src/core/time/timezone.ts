/**
 * Historical UTC offset resolution, using the IANA time zone database that the
 * browser already ships through ICU. No dependency, no download, no service.
 *
 * The database includes historical transitions, not just current rules, so a
 * birth in Rome in 1965 resolves to the offset that was actually in force then
 * rather than today's. Its limitations before 1970 are real and are surfaced
 * as caveats rather than hidden.
 */
import type {
  LocalDateTime,
  OffsetCaveat,
  ResolutionOutcome,
  ResolvedBirthInstant,
  UtcInstant,
} from './types.ts'

const MINUTE_MS = 60_000

export function isValidTimeZone(zoneId: string): boolean {
  if (zoneId === '') return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zoneId })
    return true
  } catch {
    return false
  }
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function partsFormatter(zoneId: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(zoneId)
  if (cached) return cached
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zoneId,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    era: 'short',
  })
  formatterCache.set(zoneId, formatter)
  return formatter
}

/** The wall-clock fields shown by a zone at a given instant. */
export function localFieldsAt(epochMs: number, zoneId: string): LocalDateTime & { second: number } {
  const parts = partsFormatter(zoneId).formatToParts(new Date(epochMs))
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((entry) => entry.type === type)
    return part ? Number(part.value) : 0
  }
  const era = parts.find((entry) => entry.type === 'era')?.value
  const year = read('year')
  return {
    // "1 BC" is year 0 in astronomical numbering; earlier years continue negative.
    year: era === 'BC' || era === 'B' ? 1 - year : year,
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  }
}

/**
 * Offset of a zone at a given instant, in minutes east of UTC.
 *
 * Derived by comparing the zone's wall clock with the UTC wall clock, which
 * works for every offset the database contains, including the odd local mean
 * time values used before standard time was adopted.
 */
export function offsetMinutesAt(epochMs: number, zoneId: string): number {
  const local = localFieldsAt(epochMs, zoneId)
  const asIfUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second)
  // Date.UTC maps years 0-99 into the 20th century; undo that for old dates.
  const corrected = local.year >= 0 && local.year < 100 ? asIfUtc - centuryShiftMs(local.year) : asIfUtc
  return Math.round((corrected - Math.floor(epochMs / 1000) * 1000) / MINUTE_MS)
}

function centuryShiftMs(year: number): number {
  const shifted = Date.UTC(year, 0, 1)
  const real = Date.UTC(year + 1900, 0, 1)
  return real - shifted === 0 ? 0 : real - shifted
}

function utcFromFields(local: LocalDateTime): number {
  const ms = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, 0, 0)
  if (local.year >= 0 && local.year < 100) {
    // Keep years 0..99 literal instead of being mapped to 1900..1999.
    const date = new Date(ms)
    date.setUTCFullYear(local.year)
    return date.getTime()
  }
  return ms
}

function sameLocalTime(epochMs: number, zoneId: string, local: LocalDateTime): boolean {
  const fields = localFieldsAt(epochMs, zoneId)
  return (
    fields.year === local.year &&
    fields.month === local.month &&
    fields.day === local.day &&
    fields.hour === local.hour &&
    fields.minute === local.minute
  )
}

function isValidLocalDateTime(local: LocalDateTime): boolean {
  const { year, month, day, hour, minute } = local
  if (![year, month, day, hour, minute].every(Number.isInteger)) return false
  if (month < 1 || month > 12) return false
  if (hour < 0 || hour > 23) return false
  if (minute < 0 || minute > 59) return false
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day >= 1 && day <= (lengths[month - 1] as number)
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Resolve a local civil time in a zone to a UTC instant.
 *
 * Both directions of the daylight-saving discontinuity are detected instead of
 * being silently collapsed: a repeated hour returns both real instants, and a
 * skipped hour returns the size of the gap.
 */
export function resolveLocalToUtc(local: LocalDateTime, zoneId: string): ResolutionOutcome {
  if (!isValidTimeZone(zoneId)) return { kind: 'invalid-zone', zoneId }
  if (!isValidLocalDateTime(local)) return { kind: 'invalid-local-time' }

  const asIfUtc = utcFromFields(local)

  // Probe the offsets in force around the requested moment and try each one as
  // a conversion. A single fixed-point iteration is not enough: when the clock
  // is set back, both the pre-transition and the post-transition offset produce
  // a real instant showing the same wall clock, and the iteration converges on
  // only one of them. The probe window reaches far enough either side to cover
  // ordinary daylight-saving shifts as well as the larger historical jumps.
  const probeHours = [-36, -12, 0, 12, 36]
  const offsets = new Set(probeHours.map((hours) => offsetMinutesAt(asIfUtc + hours * 60 * MINUTE_MS, zoneId)))

  const candidates: UtcInstant[] = []
  for (const offset of offsets) {
    const epochMs = asIfUtc - offset * MINUTE_MS
    // Only an instant that shows exactly the requested wall clock is valid.
    if (!sameLocalTime(epochMs, zoneId, local)) continue
    if (candidates.some((candidate) => candidate.epochMs === epochMs)) continue
    candidates.push({ epochMs, offsetMinutes: offsetMinutesAt(epochMs, zoneId) })
  }

  if (candidates.length === 1) {
    return { kind: 'resolved', instant: candidates[0] as UtcInstant }
  }
  if (candidates.length > 1) {
    const ordered = [...candidates].sort((a, b) => a.epochMs - b.epochMs)
    return { kind: 'ambiguous', candidates: ordered }
  }

  // No instant maps back to this local time: the clock skipped over it.
  const before = offsetMinutesAt(asIfUtc - 12 * 60 * MINUTE_MS, zoneId)
  const after = offsetMinutesAt(asIfUtc + 12 * 60 * MINUTE_MS, zoneId)
  /* c8 ignore next */
  return {
    kind: 'nonexistent',
    offsetBeforeMinutes: before,
    offsetAfterMinutes: after,
    gapMinutes: after - before,
  }
}

/** "+01:00", "-05:30", "+00:49" — always signed, always two-part. */
export function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+'
  const total = Math.abs(offsetMinutes)
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * A short signature of the zone's behaviour, stored with a chart so that a
 * later recomputation can tell whether the platform's time zone data changed.
 */
export function zoneFingerprint(zoneId: string, aroundEpochMs: number): string {
  const probes = [
    aroundEpochMs,
    aroundEpochMs - 182 * 24 * 60 * MINUTE_MS,
    aroundEpochMs + 182 * 24 * 60 * MINUTE_MS,
    Date.UTC(2000, 0, 1),
  ]
  return probes.map((probe) => offsetMinutesAt(probe, zoneId)).join(',')
}

/** Offsets that are not whole hours or half hours deserve a second look. */
function isUnusualOffset(offsetMinutes: number): boolean {
  return offsetMinutes % 30 !== 0
}

export function caveatsFor(local: LocalDateTime, instant: UtcInstant, manual: boolean): OffsetCaveat[] {
  const caveats: OffsetCaveat[] = []
  if (manual) caveats.push('manual-override')
  if (local.year < 1970) caveats.push('pre-1970')
  if (isUnusualOffset(instant.offsetMinutes)) {
    // Before standard time was adopted, zones report local mean time, which is
    // an arbitrary number of minutes from the meridian.
    caveats.push(local.year < 1935 ? 'local-mean-time' : 'unusual-offset')
  }
  return caveats
}

/** Assemble the record that travels with a chart and makes it reproducible. */
export function describeBirthInstant(
  local: LocalDateTime,
  zoneId: string,
  instant: UtcInstant,
  source: ResolvedBirthInstant['source'],
): ResolvedBirthInstant {
  return {
    local,
    zoneId,
    instant,
    source,
    caveats: caveatsFor(local, instant, source === 'manual'),
    zoneFingerprint: zoneFingerprint(zoneId, instant.epochMs),
  }
}

/** Build an instant from an offset the user supplied, bypassing the zone rules. */
export function instantFromManualOffset(local: LocalDateTime, offsetMinutes: number): UtcInstant {
  return { epochMs: utcFromFields(local) - offsetMinutes * MINUTE_MS, offsetMinutes }
}
