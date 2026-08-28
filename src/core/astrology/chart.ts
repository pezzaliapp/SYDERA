/**
 * Chart assembly.
 *
 * Turns validated birth input into calculated astrological data, and refuses
 * clearly when the input cannot support a calculation. Nothing here fills a
 * gap with a default: an unknown birth time produces a chart that says what it
 * does not know, never one computed at noon.
 */
import { ascendant, ascendantUncertaintyDegrees, localSiderealTime, midheaven } from './angles.ts'
import { DEFAULT_ORB_POLICY, findAspects, type AspectSubject, type OrbPolicy } from './aspects.ts'
import { allPositions, degreeInSign, normaliseDegrees, positionOf, signOf, trueObliquity } from './ephemeris.ts'
import { calculateHouses, houseOf } from './houses.ts'
import {
  BODIES,
  type Aspect,
  type BodyId,
  type BodyPosition,
  type ChartProvenance,
  type GeoPosition,
  type HouseCusps,
  type HouseRefusal,
  type HouseSystemId,
  type ZodiacSign,
} from './types.ts'
import { describeBirthInstant, instantFromManualOffset, resolveLocalToUtc } from '../time/timezone.ts'
import type { LocalDateTime, OffsetSource } from '../time/types.ts'

export const ENGINE_VERSION = 'astronomy-engine 2.1.19'

export interface ChartRequest {
  readonly birthDate: { readonly year: number; readonly month: number; readonly day: number }
  /** Null when the user stated the birth time is unknown. */
  readonly birthTime: { readonly hour: number; readonly minute: number } | null
  /** How precisely the birth time is known, in minutes. */
  readonly birthTimePrecisionMinutes: number
  readonly place: GeoPosition | null
  readonly zoneId: string | null
  readonly houseSystem: HouseSystemId
  /** Set when the user resolved an ambiguous local time or overrode the offset. */
  readonly offsetOverrideMinutes?: number | null
  readonly orbPolicy?: OrbPolicy
}

/** A body's possible range of positions across a day, when the time is unknown. */
export interface PartialBodyPosition {
  readonly body: BodyId
  readonly minLongitude: number
  readonly maxLongitude: number
  /** Set only when the body stays in one sign for the whole day. */
  readonly sign: ZodiacSign | null
  readonly rangeDegrees: number
  readonly degreeInSignRange: readonly [number, number] | null
}

export interface CompleteChart {
  readonly kind: 'complete'
  readonly provenance: ChartProvenance
  readonly place: GeoPosition
  readonly positions: readonly BodyPosition[]
  readonly houses: HouseCusps | null
  readonly houseRefusal: HouseRefusal | null
  readonly aspects: readonly Aspect[]
  readonly ascendantValue: number
  readonly midheavenValue: number
  readonly localSiderealTime: number
  readonly obliquity: number
  readonly ascendantUncertaintyDegrees: number
}

export interface PartialChart {
  readonly kind: 'partial-no-time'
  readonly dateIso: string
  readonly zoneId: string | null
  readonly place: GeoPosition | null
  readonly positions: readonly PartialBodyPosition[]
  /** What cannot be calculated without an exact birth time. */
  readonly unavailable: readonly ['ascendente', 'medio-cielo', 'case', 'aspetti']
  readonly engine: string
}

export type Chart = CompleteChart | PartialChart

export type ChartIssueCode =
  | 'invalid-date'
  | 'missing-place'
  | 'missing-zone'
  | 'invalid-zone'
  | 'ambiguous-local-time'
  | 'nonexistent-local-time'

export interface ChartIssue {
  readonly code: ChartIssueCode
  readonly detail?: string
  /** For an ambiguous time: the two possible offsets, for the user to choose. */
  readonly options?: readonly { readonly offsetMinutes: number; readonly utcIso: string }[]
}

export type ChartOutcome =
  | { readonly ok: true; readonly chart: Chart }
  | { readonly ok: false; readonly issue: ChartIssue }

function isValidDate(date: ChartRequest['birthDate']): boolean {
  const { year, month, day } = date
  if (![year, month, day].every(Number.isInteger)) return false
  if (month < 1 || month > 12) return false
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day >= 1 && day <= (lengths[month - 1] as number)
}

/**
 * Positions across a whole local day, for a birth whose time is unknown.
 * A body keeps a sign only if it never leaves it during that day.
 */
function partialPositions(startMs: number, endMs: number): PartialBodyPosition[] {
  return BODIES.map((body) => {
    const samples: number[] = []
    const steps = 24
    for (let index = 0; index <= steps; index += 1) {
      samples.push(positionOf(body, startMs + ((endMs - startMs) * index) / steps).longitude)
    }
    // Unwrap so a body crossing 0° is still measured as a small movement.
    const unwrapped = samples.map((value, index) => {
      if (index === 0) return value
      let candidate = value
      const previous = samples[index - 1] as number
      while (candidate - previous > 180) candidate -= 360
      while (previous - candidate > 180) candidate += 360
      samples[index] = candidate
      return candidate
    })
    const min = Math.min(...unwrapped)
    const max = Math.max(...unwrapped)
    const sameSign = signOf(min) === signOf(max) && max - min < 30
    return {
      body,
      minLongitude: normaliseDegrees(min),
      maxLongitude: normaliseDegrees(max),
      sign: sameSign ? signOf(min) : null,
      rangeDegrees: max - min,
      degreeInSignRange: sameSign ? ([degreeInSign(min), degreeInSign(max)] as const) : null,
    }
  })
}

export function calculateChart(request: ChartRequest): ChartOutcome {
  const { birthDate, birthTime, place, zoneId, houseSystem } = request

  if (!isValidDate(birthDate)) {
    return { ok: false, issue: { code: 'invalid-date' } }
  }

  // Without an exact time there is no instant, and inventing one would be a
  // fabrication. A partial chart states what a whole day still determines.
  if (birthTime === null) {
    const dayStart = Date.UTC(birthDate.year, birthDate.month - 1, birthDate.day, 0, 0)
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    return {
      ok: true,
      chart: {
        kind: 'partial-no-time',
        dateIso: `${String(birthDate.year).padStart(4, '0')}-${String(birthDate.month).padStart(2, '0')}-${String(birthDate.day).padStart(2, '0')}`,
        zoneId,
        place,
        positions: partialPositions(dayStart, dayEnd),
        unavailable: ['ascendente', 'medio-cielo', 'case', 'aspetti'],
        engine: ENGINE_VERSION,
      },
    }
  }

  if (!place) return { ok: false, issue: { code: 'missing-place' } }
  if (!zoneId) return { ok: false, issue: { code: 'missing-zone' } }

  const local: LocalDateTime = {
    year: birthDate.year,
    month: birthDate.month,
    day: birthDate.day,
    hour: birthTime.hour,
    minute: birthTime.minute,
  }

  let instant
  let source: OffsetSource = 'iana'

  if (typeof request.offsetOverrideMinutes === 'number') {
    instant = instantFromManualOffset(local, request.offsetOverrideMinutes)
    source = 'manual'
  } else {
    const resolution = resolveLocalToUtc(local, zoneId)
    switch (resolution.kind) {
      case 'resolved':
        instant = resolution.instant
        break
      case 'ambiguous':
        return {
          ok: false,
          issue: {
            code: 'ambiguous-local-time',
            options: resolution.candidates.map((candidate) => ({
              offsetMinutes: candidate.offsetMinutes,
              utcIso: new Date(candidate.epochMs).toISOString(),
            })),
          },
        }
      case 'nonexistent':
        return {
          ok: false,
          issue: { code: 'nonexistent-local-time', detail: `${resolution.gapMinutes}` },
        }
      case 'invalid-zone':
        return { ok: false, issue: { code: 'invalid-zone', detail: resolution.zoneId } }
      default:
        return { ok: false, issue: { code: 'invalid-date' } }
    }
  }

  const described = describeBirthInstant(local, zoneId, instant, source)
  const utcMs = instant.epochMs
  const obliquity = trueObliquity(utcMs)
  const lst = localSiderealTime(utcMs, place.longitude)
  const asc = ascendant(lst, place.latitude, obliquity)
  const mc = midheaven(lst, obliquity)

  const houseOutcome = calculateHouses({
    utcMs,
    latitude: place.latitude,
    longitude: place.longitude,
    system: houseSystem,
  })
  const houses = houseOutcome.ok ? houseOutcome.houses : null
  const houseRefusal = houseOutcome.ok ? null : houseOutcome.refusal

  const raw = allPositions(utcMs)
  const positions: BodyPosition[] = BODIES.map((body) => ({
    ...raw[body],
    body,
    house: houses ? houseOf(raw[body].longitude, houses) : null,
  }))

  const subjects: AspectSubject[] = [
    ...positions.map((position) => ({
      point: position.body as AspectSubject['point'],
      longitude: position.longitude,
      dailyMotion: position.dailyMotion,
    })),
    { point: 'ascendant', longitude: asc, dailyMotion: null },
    { point: 'midheaven', longitude: mc, dailyMotion: null },
  ]

  const provenance: ChartProvenance = {
    utcIso: new Date(utcMs).toISOString(),
    offsetMinutes: instant.offsetMinutes,
    zoneId,
    offsetSource: source,
    caveats: described.caveats,
    zoneFingerprint: described.zoneFingerprint,
    engine: ENGINE_VERSION,
    houseSystem,
    birthTimePrecisionMinutes: request.birthTimePrecisionMinutes,
  }

  return {
    ok: true,
    chart: {
      kind: 'complete',
      provenance,
      place,
      positions,
      houses,
      houseRefusal,
      aspects: findAspects(subjects, request.orbPolicy ?? DEFAULT_ORB_POLICY),
      ascendantValue: asc,
      midheavenValue: mc,
      localSiderealTime: lst,
      obliquity,
      ascendantUncertaintyDegrees: ascendantUncertaintyDegrees(
        utcMs,
        place.latitude,
        place.longitude,
        request.birthTimePrecisionMinutes,
      ),
    },
  }
}
