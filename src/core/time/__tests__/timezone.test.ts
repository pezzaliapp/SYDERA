import { describe, expect, it } from 'vitest'
import {
  caveatsFor,
  formatOffset,
  instantFromManualOffset,
  isValidTimeZone,
  localFieldsAt,
  offsetMinutesAt,
  resolveLocalToUtc,
  zoneFingerprint,
} from '../timezone.ts'

/**
 * Expected values in this file come from documented time zone history and
 * legislation, never from SYDERA's own output:
 *
 *  - EU Directive 2000/84/EC: summer time runs from the last Sunday of March
 *    01:00 UTC to the last Sunday of October 01:00 UTC. Italy uses CET (+1) and
 *    CEST (+2), so the clock goes 02:00 -> 03:00 in spring and 03:00 -> 02:00
 *    in autumn, local time.
 *  - Italy suspended summer time from 1949 to 1965 and reintroduced it in 1966
 *    (22 May to 24 September 1966).
 *  - Italy adopted Central European Time on 1 November 1893; before that Rome
 *    kept local mean time, about 12°29' east of Greenwich, i.e. roughly +50
 *    minutes.
 *  - United States, Emergency Daylight Saving Time Energy Conservation Act of
 *    1973: daylight time was observed through the winter of 1974, from
 *    6 January 1974.
 *  - Australia observes summer time in the southern summer: Sydney is +11 in
 *    January and +10 in July.
 *  - Nepal keeps a +05:45 offset, which is not a whole or half hour.
 */

const ROME = 'Europe/Rome'

describe('zone validation', () => {
  it('accepts real IANA identifiers and rejects invented ones', () => {
    expect(isValidTimeZone(ROME)).toBe(true)
    expect(isValidTimeZone('America/New_York')).toBe(true)
    expect(isValidTimeZone('UTC')).toBe(true)
    expect(isValidTimeZone('Europe/Atlantis')).toBe(false)
    expect(isValidTimeZone('')).toBe(false)
  })
})

describe('current and historical offsets', () => {
  it('applies Central European Time in an Italian winter', () => {
    const winter = Date.UTC(2024, 0, 15, 11, 0)
    expect(offsetMinutesAt(winter, ROME)).toBe(60)
  })

  it('applies Central European Summer Time in an Italian summer', () => {
    const summer = Date.UTC(2024, 6, 15, 10, 0)
    expect(offsetMinutesAt(summer, ROME)).toBe(120)
  })

  it('knows that Italy kept standard time all through 1965', () => {
    // Summer time was suspended in Italy from 1949 to 1965 inclusive.
    const june1965 = Date.UTC(1965, 5, 15, 11, 0)
    expect(offsetMinutesAt(june1965, ROME)).toBe(60)
  })

  it('knows that Italy observed summer time again in June 1966', () => {
    // Reintroduced for 22 May - 24 September 1966.
    const june1966 = Date.UTC(1966, 5, 15, 10, 0)
    expect(offsetMinutesAt(june1966, ROME)).toBe(120)
  })

  it('never assumes the present-day rule for a historical date', () => {
    const june1965 = Date.UTC(1965, 5, 15, 11, 0)
    const june2024 = Date.UTC(2024, 5, 15, 11, 0)
    expect(offsetMinutesAt(june1965, ROME)).not.toBe(offsetMinutesAt(june2024, ROME))
  })

  it('reports local mean time before Italy adopted CET in 1893', () => {
    // Rome sits near 12°29' east: 12.483° / 15 = 0.832 h = about 50 minutes.
    const offset = offsetMinutesAt(Date.UTC(1880, 0, 1, 12, 0), ROME)
    expect(offset).toBeGreaterThanOrEqual(45)
    expect(offset).toBeLessThanOrEqual(55)
    expect(offset).not.toBe(60)
  })

  it('applies the United States winter daylight time of 1974', () => {
    const january1974 = Date.UTC(1974, 0, 15, 17, 0)
    expect(offsetMinutesAt(january1974, 'America/New_York')).toBe(-240)
  })

  it('applies standard time in the United States in January 1973', () => {
    const january1973 = Date.UTC(1973, 0, 15, 17, 0)
    expect(offsetMinutesAt(january1973, 'America/New_York')).toBe(-300)
  })

  it('handles the southern hemisphere', () => {
    expect(offsetMinutesAt(Date.UTC(2024, 0, 15, 1, 0), 'Australia/Sydney')).toBe(660)
    expect(offsetMinutesAt(Date.UTC(2024, 6, 15, 2, 0), 'Australia/Sydney')).toBe(600)
  })

  it('handles offsets that are not whole hours', () => {
    expect(offsetMinutesAt(Date.UTC(2024, 0, 15, 6, 0), 'Asia/Kolkata')).toBe(330)
    expect(offsetMinutesAt(Date.UTC(2024, 0, 15, 6, 0), 'Asia/Kathmandu')).toBe(345)
  })
})

describe('local civil time to UTC', () => {
  it('converts an ordinary winter birth time', () => {
    const outcome = resolveLocalToUtc({ year: 1984, month: 1, day: 19, hour: 7, minute: 30 }, ROME)
    expect(outcome.kind).toBe('resolved')
    if (outcome.kind !== 'resolved') return
    expect(outcome.instant.offsetMinutes).toBe(60)
    expect(new Date(outcome.instant.epochMs).toISOString()).toBe('1984-01-19T06:30:00.000Z')
  })

  it('converts an ordinary summer birth time', () => {
    const outcome = resolveLocalToUtc({ year: 1984, month: 7, day: 19, hour: 7, minute: 30 }, ROME)
    expect(outcome.kind).toBe('resolved')
    if (outcome.kind !== 'resolved') return
    expect(outcome.instant.offsetMinutes).toBe(120)
    expect(new Date(outcome.instant.epochMs).toISOString()).toBe('1984-07-19T05:30:00.000Z')
  })

  it('converts a 1965 Italian summer birth without applying summer time', () => {
    const outcome = resolveLocalToUtc({ year: 1965, month: 6, day: 15, hour: 12, minute: 0 }, ROME)
    expect(outcome.kind).toBe('resolved')
    if (outcome.kind !== 'resolved') return
    expect(outcome.instant.offsetMinutes).toBe(60)
    expect(new Date(outcome.instant.epochMs).toISOString()).toBe('1965-06-15T11:00:00.000Z')
  })

  it('converts a 1966 Italian summer birth with summer time', () => {
    const outcome = resolveLocalToUtc({ year: 1966, month: 6, day: 15, hour: 12, minute: 0 }, ROME)
    expect(outcome.kind).toBe('resolved')
    if (outcome.kind !== 'resolved') return
    expect(outcome.instant.offsetMinutes).toBe(120)
    expect(new Date(outcome.instant.epochMs).toISOString()).toBe('1966-06-15T10:00:00.000Z')
  })

  it('detects a local time that never existed', () => {
    // 31 March 2024 was the last Sunday of March: 02:00 became 03:00.
    const outcome = resolveLocalToUtc({ year: 2024, month: 3, day: 31, hour: 2, minute: 30 }, ROME)
    expect(outcome.kind).toBe('nonexistent')
    if (outcome.kind !== 'nonexistent') return
    expect(outcome.offsetBeforeMinutes).toBe(60)
    expect(outcome.offsetAfterMinutes).toBe(120)
    expect(outcome.gapMinutes).toBe(60)
  })

  it('detects a local time that happened twice', () => {
    // 27 October 2024 was the last Sunday of October: 03:00 became 02:00.
    const outcome = resolveLocalToUtc({ year: 2024, month: 10, day: 27, hour: 2, minute: 30 }, ROME)
    expect(outcome.kind).toBe('ambiguous')
    if (outcome.kind !== 'ambiguous') return
    expect(outcome.candidates).toHaveLength(2)
    expect(outcome.candidates[0]?.offsetMinutes).toBe(120)
    expect(outcome.candidates[1]?.offsetMinutes).toBe(60)
    // The two instants are exactly one hour apart.
    expect((outcome.candidates[1] as { epochMs: number }).epochMs - (outcome.candidates[0] as { epochMs: number }).epochMs).toBe(3_600_000)
    expect(new Date(outcome.candidates[0]!.epochMs).toISOString()).toBe('2024-10-27T00:30:00.000Z')
    expect(new Date(outcome.candidates[1]!.epochMs).toISOString()).toBe('2024-10-27T01:30:00.000Z')
  })

  it('resolves the hour either side of an ambiguous one without ambiguity', () => {
    expect(resolveLocalToUtc({ year: 2024, month: 10, day: 27, hour: 1, minute: 30 }, ROME).kind).toBe('resolved')
    expect(resolveLocalToUtc({ year: 2024, month: 10, day: 27, hour: 4, minute: 30 }, ROME).kind).toBe('resolved')
  })

  it('rejects an impossible calendar date or clock time', () => {
    expect(resolveLocalToUtc({ year: 2023, month: 2, day: 29, hour: 12, minute: 0 }, ROME).kind).toBe('invalid-local-time')
    expect(resolveLocalToUtc({ year: 2024, month: 1, day: 1, hour: 24, minute: 0 }, ROME).kind).toBe('invalid-local-time')
    expect(resolveLocalToUtc({ year: 2024, month: 1, day: 1, hour: 12, minute: 60 }, ROME).kind).toBe('invalid-local-time')
  })

  it('rejects an unknown zone instead of guessing one', () => {
    const outcome = resolveLocalToUtc({ year: 2024, month: 1, day: 1, hour: 12, minute: 0 }, 'Europe/Atlantis')
    expect(outcome.kind).toBe('invalid-zone')
  })

  it('round-trips: the resolved instant shows the requested wall clock', () => {
    for (const local of [
      { year: 1901, month: 3, day: 4, hour: 5, minute: 6 },
      { year: 1943, month: 9, day: 8, hour: 21, minute: 0 },
      { year: 1984, month: 1, day: 19, hour: 7, minute: 30 },
      { year: 2000, month: 2, day: 29, hour: 0, minute: 1 },
      { year: 2026, month: 8, day: 28, hour: 23, minute: 59 },
    ]) {
      const outcome = resolveLocalToUtc(local, ROME)
      expect(outcome.kind, JSON.stringify(local)).toBe('resolved')
      if (outcome.kind !== 'resolved') continue
      const fields = localFieldsAt(outcome.instant.epochMs, ROME)
      expect({ ...fields, second: undefined }).toEqual({ ...local, second: undefined })
    }
  })

  it('is deterministic', () => {
    const local = { year: 1984, month: 1, day: 19, hour: 7, minute: 30 }
    expect(resolveLocalToUtc(local, ROME)).toEqual(resolveLocalToUtc(local, ROME))
  })
})

describe('offset formatting', () => {
  it('formats signed offsets', () => {
    expect(formatOffset(60)).toBe('+01:00')
    expect(formatOffset(120)).toBe('+02:00')
    expect(formatOffset(-300)).toBe('-05:00')
    expect(formatOffset(345)).toBe('+05:45')
    expect(formatOffset(50)).toBe('+00:50')
    expect(formatOffset(0)).toBe('+00:00')
  })
})

describe('manual override', () => {
  it('builds an instant from an offset supplied by the user', () => {
    const instant = instantFromManualOffset({ year: 1984, month: 1, day: 19, hour: 7, minute: 30 }, 60)
    expect(new Date(instant.epochMs).toISOString()).toBe('1984-01-19T06:30:00.000Z')
    expect(instant.offsetMinutes).toBe(60)
  })
})

describe('caveats', () => {
  it('flags births before 1970', () => {
    const caveats = caveatsFor({ year: 1965, month: 6, day: 15, hour: 12, minute: 0 }, { epochMs: 0, offsetMinutes: 60 }, false)
    expect(caveats).toContain('pre-1970')
  })

  it('does not flag a modern birth', () => {
    const caveats = caveatsFor({ year: 1990, month: 6, day: 15, hour: 12, minute: 0 }, { epochMs: 0, offsetMinutes: 120 }, false)
    expect(caveats).toEqual([])
  })

  it('flags local mean time offsets', () => {
    const caveats = caveatsFor({ year: 1880, month: 1, day: 1, hour: 12, minute: 0 }, { epochMs: 0, offsetMinutes: 50 }, false)
    expect(caveats).toContain('local-mean-time')
  })

  it('flags a manual override', () => {
    const caveats = caveatsFor({ year: 1990, month: 1, day: 1, hour: 12, minute: 0 }, { epochMs: 0, offsetMinutes: 60 }, true)
    expect(caveats).toContain('manual-override')
  })
})

describe('zone fingerprint', () => {
  it('is stable for the same zone and instant', () => {
    const at = Date.UTC(1984, 0, 19, 6, 30)
    expect(zoneFingerprint(ROME, at)).toBe(zoneFingerprint(ROME, at))
  })

  it('differs between zones with different rules', () => {
    const at = Date.UTC(1984, 0, 19, 6, 30)
    expect(zoneFingerprint(ROME, at)).not.toBe(zoneFingerprint('America/New_York', at))
  })
})

describe('the pre-1970 caveat says something true', () => {
  /**
   * The IANA maintainers declare pre-1970 data best effort, and that is why
   * the caveat exists. But for Italy the record is complete: warning a 1964
   * Italian birth that its offset may be approximate told the user to doubt a
   * number that is right. These cases are the evidence for narrowing it.
   */
  const offsetAt = (year: number, month: number, day: number, zone = 'Europe/Rome'): number => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
      .formatToParts(new Date(Date.UTC(year, month - 1, day, 12)))
      .find((part) => part.type === 'timeZoneName')?.value
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(parts ?? '')
    if (!match) return 0
    return (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3]))
  }

  it('reproduces the documented Italian periods of summer time', () => {
    // year, a date in standard time, a date inside that year's ora legale
    const periods: ReadonlyArray<readonly [number, readonly [number, number], readonly [number, number]]> = [
      [1916, [3, 1], [7, 1]],
      [1920, [2, 1], [6, 1]],
      [1943, [2, 1], [6, 1]],
      [1946, [2, 1], [6, 1]],
      [1947, [2, 1], [6, 1]],
      [1948, [1, 15], [6, 1]],
      [1966, [3, 1], [7, 15]],
      [1967, [4, 1], [8, 1]],
      [1968, [4, 1], [7, 1]],
      [1969, [4, 1], [7, 1]],
    ]
    for (const [year, standard, summer] of periods) {
      expect(offsetAt(year, standard[0], standard[1]), `${year} standard`).toBe(60)
      expect(offsetAt(year, summer[0], summer[1]), `${year} ora legale`).toBe(120)
    }
  })

  it('knows Italy kept standard time all year between 1949 and 1965', () => {
    for (const year of [1950, 1955, 1960, 1965]) {
      expect(offsetAt(year, 1, 15), `${year} gennaio`).toBe(60)
      expect(offsetAt(year, 7, 15), `${year} luglio`).toBe(60)
    }
  })

  it('does not warn about a verified zone, and still warns about the others', () => {
    const born1964 = { year: 1964, month: 9, day: 1, hour: 7, minute: 30 }
    const instant = { epochMs: 0, offsetMinutes: 60 }
    expect(caveatsFor(born1964, instant, false, 'Europe/Rome')).not.toContain('pre-1970')
    expect(caveatsFor(born1964, instant, false, 'Europe/Vatican')).not.toContain('pre-1970')
    expect(caveatsFor(born1964, instant, false, 'America/Sao_Paulo')).toContain('pre-1970')
    // Unknown zone: the honest default is to keep the caveat.
    expect(caveatsFor(born1964, instant, false)).toContain('pre-1970')
  })

  it('still flags a birth before Italy adopted a standard time', () => {
    // Rome ran on local mean time until 1893: +49 minutes, not a round offset.
    expect(offsetAt(1880, 6, 1)).toBe(49)
    const caveats = caveatsFor(
      { year: 1880, month: 6, day: 1, hour: 12, minute: 0 },
      { epochMs: 0, offsetMinutes: 49 },
      false,
      'Europe/Rome',
    )
    expect(caveats).toContain('local-mean-time')
  })
})
