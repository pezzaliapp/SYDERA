/**
 * Developer tool — NOT part of the build, NOT a dependency of SYDERA.
 *
 * Produces the independent Placidus reference values in
 * src/core/astrology/__tests__/fixtures/placidus-reference.json, using the
 * Swiss Ephemeris implementation of the Placidus construction.
 *
 * Swiss Ephemeris is deliberately **not** a dependency of this project: its
 * licence (AGPL, or a paid professional licence) is incompatible with SYDERA's
 * distribution model, which is exactly why the engine research rejected it.
 * It is used here only as a second, entirely independent implementation
 * against which SYDERA's own house calculation is checked. Nothing from it is
 * bundled, distributed or linked; only the resulting numbers — which are
 * facts, not software — are recorded.
 *
 * To regenerate, in a scratch directory OUTSIDE this repository:
 *
 *   mkdir /tmp/sydera-ref && cd /tmp/sydera-ref
 *   npm init -y && npm install sweph
 *   cp <this file> generate.mjs && node generate.mjs
 *
 * then copy placidus-reference.json into the fixtures directory.
 */
import s from 'sweph'
import { writeFileSync } from 'node:fs'

/** Synthetic technical charts. No real person's birth data. */
const CHARTS = [
  { id: 'rome-1984', label: 'European latitude', utc: '1984-01-19T06:30:00Z', latitude: 41.9028, longitude: 12.4964 },
  { id: 'sydney-1984', label: 'Southern hemisphere', utc: '1984-01-19T06:30:00Z', latitude: -33.8688, longitude: 151.2093 },
  { id: 'quito-1955', label: 'Equatorial', utc: '1955-11-05T22:04:00Z', latitude: -0.1807, longitude: -78.4678 },
  { id: 'reykjavik-2000', label: 'Near the high-latitude boundary (64.1 N)', utc: '2000-01-01T12:00:00Z', latitude: 64.1466, longitude: -21.9426 },
  { id: 'high-north-2026', label: 'Just inside the Placidus limit (65.5 N)', utc: '2026-08-28T00:00:00Z', latitude: 65.5, longitude: 12.0 },
  { id: 'high-south-1899', label: 'Just inside the limit, southern (-65.5)', utc: '1899-12-31T12:00:00Z', latitude: -65.5, longitude: 12.0 },
]

const charts = CHARTS.map((chart) => {
  const date = new Date(chart.utc)
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const jd = s.julday(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), hour, s.constants.SE_GREG_CAL)
  const result = s.houses(jd, chart.latitude, chart.longitude, 'P')
  if (result.flag < 0) throw new Error(`swe_houses failed for ${chart.id}`)
  return {
    ...chart,
    julianDayUt: jd,
    cusps: result.data.houses,
    ascendant: result.data.points[0],
    midheaven: result.data.points[1],
    armc: result.data.points[2],
  }
})

writeFileSync(
  'placidus-reference.json',
  JSON.stringify(
    {
      source: 'Swiss Ephemeris (Astrodienst), via the sweph Node binding',
      sweVersion: s.version(),
      call: "swe_houses(julday(UTC, SE_GREG_CAL), latitude, longitude, 'P')",
      note: 'Generated once, offline, by the developer. Swiss Ephemeris is NOT a dependency of SYDERA and is not distributed with it; only these numeric results are recorded.',
      generated: new Date().toISOString(),
      charts,
    },
    null,
    2,
  ),
)
console.log(`wrote ${charts.length} reference charts, Swiss Ephemeris ${s.version()}`)
