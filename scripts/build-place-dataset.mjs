/**
 * Developer tool — NOT part of the production build.
 *
 * Turns the GeoNames cities15000 export into the compact, trimmed dataset that
 * SYDERA ships and searches entirely in the browser. Run manually:
 *
 *   npm run places:build -- /path/to/cities15000.txt
 *
 * GeoNames data is © GeoNames, licensed CC BY 4.0. The attribution travels
 * with the application in THIRD_PARTY_NOTICES.md and the About section.
 *
 * The file is written as .txt so that it is served as text/plain and gets
 * compressed by static hosts; a .tsv extension is not on the usual
 * compressible-type lists.
 *
 * Output format, chosen to keep the download small on a mobile connection:
 *
 *   line 1..n   the distinct IANA time zone identifiers, one per line
 *   blank line
 *   one place per line, tab separated, sorted by descending population so a
 *   prefix search surfaces the larger places first (the order carries the
 *   population, so the number itself is not stored):
 *
 *     name  asciiName  countryCode  admin1  latitude  longitude  zoneIndex
 *
 * Coordinates keep three decimals, about 110 m, which is far finer than any
 * astrological calculation can use: 0.001° of longitude shifts the Ascendant
 * by well under an arcsecond.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const source = process.argv[2]
if (!source) {
  process.stderr.write('usage: node scripts/build-place-dataset.mjs <cities15000.txt>\n')
  process.exit(1)
}

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data')

const stripDiacritics = (value) => value.normalize('NFD').replace(/\p{Mn}/gu, '')

/**
 * Alternate names, for Italian places only.
 *
 * GeoNames stores the widely used English exonym as the primary name, so the
 * dataset called Rome "Rome" and Florence "Florence" — and an Italian typing
 * "Roma" or "Firenze" found nothing. The alternate names carry the Italian
 * form. Keeping them for every city on earth would add well over half a
 * megabyte to a file that has to reach a phone; keeping them for Italy costs
 * about fifty kilobytes and fixes the case this application actually has.
 *
 * Airport codes and descriptive phrases from other languages ("Lungsod ng
 * Roma") are dropped: they would only add noise to the result list.
 */
const LATIN_NAME = /^[\p{Script=Latin}0-9 '’.-]+$/u
// The alternate names arrive in alphabetical order, so a low cap cuts off
// exactly the forms that sort late — "Venezia" came after "Venetië". Italy is
// small enough to keep them all.
const MAX_ALIASES = 80

function aliasesFor(countryCode, alternates, known) {
  if (countryCode !== 'IT') return []
  const kept = []
  for (const raw of (alternates ?? '').split(',')) {
    const alias = raw.trim()
    if (alias.length < 2 || alias.length > 30) continue
    if (!LATIN_NAME.test(alias)) continue
    // An all-capitals short token is an airport or station code, not a name.
    if (alias.length <= 4 && alias === alias.toUpperCase()) continue
    if (alias.split(/\s+/).length > 2) continue
    const folded = stripDiacritics(alias).toLowerCase()
    if (known.has(folded)) continue
    known.add(folded)
    kept.push(alias)
    if (kept.length >= MAX_ALIASES) break
  }
  return kept
}

const rows = readFileSync(source, 'utf8').split('\n').filter(Boolean)
const places = []

for (const row of rows) {
  const columns = row.split('\t')
  const name = columns[1]
  const asciiName = columns[2]
  const alternates = columns[3]
  const latitude = Number(columns[4])
  const longitude = Number(columns[5])
  const countryCode = columns[8]
  const admin1 = columns[10] ?? ''
  const population = Number(columns[14]) || 0
  const timeZoneId = columns[17]

  if (!name || !timeZoneId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue

  // The ASCII form is stored only when it cannot be derived at run time.
  // Accented Latin names (Zürich, Malmö) are handled by Unicode normalisation
  // in the browser; a transliteration is kept only for names in other scripts.
  const derivable = stripDiacritics(name).toLowerCase() === (asciiName ?? '').toLowerCase()

  const known = new Set([stripDiacritics(name).toLowerCase(), (asciiName ?? '').toLowerCase()])

  places.push({
    name,
    aliases: aliasesFor(countryCode, alternates, known),
    asciiName: derivable ? '' : (asciiName ?? ''),
    countryCode,
    admin1,
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
    timeZoneId,
    population,
  })
}

places.sort((a, b) => b.population - a.population)

const zones = [...new Set(places.map((place) => place.timeZoneId))].sort()
const zoneIndex = new Map(zones.map((zone, index) => [zone, index]))

const lines = places.map((place) =>
  [
    place.name,
    place.asciiName,
    place.countryCode,
    place.admin1,
    place.latitude.toFixed(3),
    place.longitude.toFixed(3),
    zoneIndex.get(place.timeZoneId),
    place.aliases.join('|'),
  ].join('\t'),
)

mkdirSync(OUT_DIR, { recursive: true })
const output = `${zones.join('\n')}\n\n${lines.join('\n')}\n`
writeFileSync(join(OUT_DIR, 'places.txt'), output)

process.stdout.write(`places: ${places.length}\n`)
process.stdout.write(`zones:  ${zones.length}\n`)
process.stdout.write(`bytes:  ${Buffer.byteLength(output)}\n`)
