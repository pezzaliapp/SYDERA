/**
 * Developer tool — NOT part of the build and never executed by the application.
 *
 * Generates the independent reference values that the astrology validation
 * suite is checked against, by querying NASA/JPL Horizons once and writing the
 * results into src/core/astrology/__tests__/fixtures/. The fixtures are then
 * committed, so the test suite is fully offline and reproducible.
 *
 * Run manually with:  npm run fixtures:fetch
 *
 * Horizons is a free public service of the Jet Propulsion Laboratory. It is
 * used here only to produce static reference data during development; SYDERA
 * itself never contacts it, at build time or at run time.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'core', 'astrology', '__tests__', 'fixtures')
const API = 'https://ssd.jpl.nasa.gov/api/horizons.api'

/** Synthetic technical instants. No real person's birth data. */
const INSTANTS = [
  '1899-12-31T12:00:00Z',
  '1955-11-05T22:04:00Z',
  '1984-01-19T06:30:00Z',
  '2000-01-01T12:00:00Z',
  '2026-08-28T00:00:00Z',
]

const BODIES = [
  ['Sun', '10'],
  ['Moon', '301'],
  ['Mercury', '199'],
  ['Venus', '299'],
  ['Mars', '499'],
  ['Jupiter', '599'],
  ['Saturn', '699'],
  ['Uranus', '799'],
  ['Neptune', '899'],
  ['Pluto', '999'],
]

/** Synthetic observation sites, chosen to exercise latitude extremes. */
const SITES = [
  ['rome', 12.4964, 41.9028],
  ['sydney', 151.2093, -33.8688],
  ['quito', -78.4678, -0.1807],
  ['tromso', 18.9553, 69.6492],
]

const julianDay = (iso) => Date.parse(iso) / 86_400_000 + 2_440_587.5

async function horizons(params) {
  const query = new URLSearchParams({ format: 'text', ...params })
  const response = await fetch(`${API}?${query}`)
  if (!response.ok) throw new Error(`Horizons HTTP ${response.status}`)
  const text = await response.text()
  const start = text.indexOf('$$SOE')
  const end = text.indexOf('$$EOE')
  if (start < 0 || end < 0) throw new Error(`Horizons returned no ephemeris block:\n${text.slice(0, 400)}`)
  return text
    .slice(start + 5, end)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

const tlist = INSTANTS.map((iso) => julianDay(iso).toFixed(9)).join(',')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const bodyRows = []
for (const [name, command] of BODIES) {
  const lines = await horizons({
    COMMAND: `'${command}'`,
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'500@399'",
    TLIST: `'${tlist}'`,
    TLIST_TYPE: "'JD'",
    TIME_TYPE: "'UT'",
    QUANTITIES: "'31'",
    CAL_FORMAT: "'CAL'",
    ANG_FORMAT: "'DEG'",
  })
  lines.forEach((line, index) => {
    const columns = line.split(/\s+/)
    const longitude = Number(columns[columns.length - 2])
    const latitude = Number(columns[columns.length - 1])
    if (!Number.isFinite(longitude)) throw new Error(`unparsed line for ${name}: ${line}`)
    bodyRows.push({ instant: INSTANTS[index], body: name, longitude, latitude, raw: line })
  })
  process.stdout.write(`  ${name}: ${lines.length} rows\n`)
  await sleep(400)
}

const siteRows = []
for (const [name, longitude, latitude] of SITES) {
  const lines = await horizons({
    COMMAND: "'10'",
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'coord@399'",
    COORD_TYPE: "'GEODETIC'",
    SITE_COORD: `'${longitude},${latitude},0'`,
    TLIST: `'${tlist}'`,
    TLIST_TYPE: "'JD'",
    TIME_TYPE: "'UT'",
    QUANTITIES: "'7'",
    CAL_FORMAT: "'CAL'",
    ANG_FORMAT: "'DEG'",
  })
  lines.forEach((line, index) => {
    siteRows.push({ instant: INSTANTS[index], site: name, longitude, latitude, raw: line })
  })
  process.stdout.write(`  site ${name}: ${lines.length} rows\n`)
  await sleep(400)
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(
  join(OUT_DIR, 'horizons-raw.json'),
  JSON.stringify({ generated: new Date().toISOString(), api: API, instants: INSTANTS, bodyRows, siteRows }, null, 2),
)
process.stdout.write(`\nwrote ${bodyRows.length} body rows and ${siteRows.length} site rows\n`)
