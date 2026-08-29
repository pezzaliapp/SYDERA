/*
 * Builds the place datasets SYDERA ships.
 *
 *   node scripts/build-place-dataset.mjs <geonames-dir>
 *
 * The directory must contain, downloaded from https://download.geonames.org:
 *   IT.txt                 every place in Italy
 *   cities5000.txt         populated places over 5000 inhabitants, worldwide
 *   admin1CodesASCII.txt   first-order divisions
 *   admin2Codes.txt        second-order divisions
 *
 * GeoNames data is licensed CC BY 4.0; the attribution is in README.md and in
 * the application's Informazioni screen.
 *
 * Two files are produced. Italy is complete — every comune and every frazione,
 * with no population threshold, because a birthplace is usually a small place
 * and the previous 15 000-inhabitant cut made most of them unfindable. The
 * world file keeps places above 5000 inhabitants. They are separate so the
 * application can have Italian results on screen without waiting for the rest
 * of the world to arrive.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const source = process.argv[2]
if (!source) {
  process.stderr.write('usage: node scripts/build-place-dataset.mjs <geonames-dir>\n')
  process.exit(1)
}

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data')

const stripDiacritics = (value) => value.normalize('NFD').replace(/\p{Mn}/gu, '')
const fold = (value) => stripDiacritics(value).toLowerCase().replace(/['’]/g, ' ').replace(/\s+/g, ' ').trim()

/** GeoNames columns, one-based as documented. */
const NAME = 1, ASCII = 2, ALT = 3, LAT = 4, LON = 5, CLASS = 6, CODE = 7, CC = 8, A1 = 10, A2 = 11, POP = 14, TZ = 17

const LATIN_NAME = /^[\p{Script=Latin}0-9 '’.\-]+$/u

/**
 * Alternate names worth searching by: no codes, no phrases from other
 * languages.
 *
 * GeoNames lists them alphabetically, so a plain cap keeps "Ottobrunn" and
 * loses "München" — and Munich, filed under its English name, became
 * unreachable behind its own suburbs. They are ranked by how close they are to
 * the canonical name first, which is what a local or Italian form usually is,
 * then by length.
 */
function aliasesOf(row, cap) {
  const name = fold(row[NAME] ?? '')
  const known = new Set([name, fold(row[ASCII] ?? '')])
  const candidates = []
  for (const raw of (row[ALT] ?? '').split(',')) {
    const alias = raw.trim()
    if (alias.length < 2 || alias.length > 40) continue
    if (!LATIN_NAME.test(alias)) continue
    if (alias.length <= 4 && alias === alias.toUpperCase()) continue
    if (alias.split(/\s+/).length > 4) continue
    const key = fold(alias)
    if (known.has(key)) continue
    known.add(key)
    let closeness = 3
    if (key.slice(0, 4) === name.slice(0, 4)) closeness = 0
    else if (key.slice(0, 2) === name.slice(0, 2)) closeness = 1
    else if (key.charAt(0) === name.charAt(0)) closeness = 2
    candidates.push({ alias, closeness, length: alias.length })
  }
  candidates.sort((a, b) => a.closeness - b.closeness || a.length - b.length)
  return candidates.slice(0, cap).map((entry) => entry.alias)
}

/**
 * The Italian provinces, by their official two-letter code.
 *
 * GeoNames names them in English even in Italy's own file — the province of
 * Firenze is filed as "Province of Florence" — and "Calenzano · Florence"
 * is not what an Italian reads. These codes are official and stable.
 */
const ITALIAN_PROVINCES = {
  AG: 'Agrigento', AL: 'Alessandria', AN: 'Ancona', AO: 'Aosta', AP: 'Ascoli Piceno',
  AQ: "L'Aquila", AR: 'Arezzo', AT: 'Asti', AV: 'Avellino', BA: 'Bari', BG: 'Bergamo',
  BI: 'Biella', BL: 'Belluno', BN: 'Benevento', BO: 'Bologna', BR: 'Brindisi', BS: 'Brescia',
  BT: 'Barletta-Andria-Trani', BZ: 'Bolzano', CA: 'Cagliari', CB: 'Campobasso', CE: 'Caserta',
  CH: 'Chieti', CI: 'Carbonia-Iglesias', CL: 'Caltanissetta', CN: 'Cuneo', CO: 'Como',
  CR: 'Cremona', CS: 'Cosenza', CT: 'Catania', CZ: 'Catanzaro', EN: 'Enna', FC: 'Forlì-Cesena',
  FE: 'Ferrara', FG: 'Foggia', FI: 'Firenze', FM: 'Fermo', FR: 'Frosinone', GE: 'Genova',
  GO: 'Gorizia', GR: 'Grosseto', IM: 'Imperia', IS: 'Isernia', KR: 'Crotone', LC: 'Lecco',
  LE: 'Lecce', LI: 'Livorno', LO: 'Lodi', LT: 'Latina', LU: 'Lucca', MB: 'Monza e Brianza',
  MC: 'Macerata', ME: 'Messina', MI: 'Milano', MN: 'Mantova', MO: 'Modena', MS: 'Massa-Carrara',
  MT: 'Matera', NA: 'Napoli', NO: 'Novara', NU: 'Nuoro', OG: 'Ogliastra', OR: 'Oristano',
  OT: 'Olbia-Tempio', PA: 'Palermo', PC: 'Piacenza', PD: 'Padova', PE: 'Pescara', PG: 'Perugia',
  PI: 'Pisa', PN: 'Pordenone', PO: 'Prato', PR: 'Parma', PT: 'Pistoia', PU: 'Pesaro e Urbino',
  PV: 'Pavia', PZ: 'Potenza', RA: 'Ravenna', RC: 'Reggio Calabria', RE: 'Reggio Emilia',
  RG: 'Ragusa', RI: 'Rieti', RM: 'Roma', RN: 'Rimini', RO: 'Rovigo', SA: 'Salerno', SI: 'Siena',
  SO: 'Sondrio', SP: 'La Spezia', SR: 'Siracusa', SS: 'Sassari', SU: 'Sud Sardegna',
  SV: 'Savona', TA: 'Taranto', TE: 'Teramo', TN: 'Trento', TO: 'Torino', TP: 'Trapani',
  TR: 'Terni', TS: 'Trieste', TV: 'Treviso', UD: 'Udine', VA: 'Varese',
  VB: 'Verbano-Cusio-Ossola', VC: 'Vercelli', VE: 'Venezia', VI: 'Vicenza', VR: 'Verona',
  VS: 'Medio Campidano', VT: 'Viterbo', VV: 'Vibo Valentia',
}

/** "Provincia di Siena" reads better as "Siena" next to the town. */
const bareName = (name) =>
  name.replace(/^(Provincia di |Province of |Metropolitan City of |Città metropolitana di |Regione Autonoma |Regione )/i, '')

function readAdminNames() {
  const admin1 = new Map()
  for (const line of readFileSync(join(source, 'admin1CodesASCII.txt'), 'utf8').split('\n')) {
    const [key, name] = line.split('\t')
    if (key && name) admin1.set(key, bareName(name))
  }
  const admin2 = new Map()
  for (const line of readFileSync(join(source, 'admin2Codes.txt'), 'utf8').split('\n')) {
    const [key, name] = line.split('\t')
    if (key && name) admin2.set(key, bareName(name))
  }

  // Italy's own division records name themselves in Italian, where the global
  // code tables use English exonyms — "Florence" for Firenze, "Lombardy" for
  // Lombardia. For an Italian application the local name is the right one.
  for (const line of readFileSync(join(source, 'IT.txt'), 'utf8').split('\n')) {
    if (!line) continue
    const row = line.split('\t')
    if (row[CC] !== 'IT') continue
    if (row[CODE] === 'ADM1') admin1.set(`IT.${row[A1]}`, bareName(row[NAME]))
    if (row[CODE] === 'ADM2') {
      admin2.set(`IT.${row[A1]}.${row[A2]}`, ITALIAN_PROVINCES[row[A2]] ?? bareName(row[NAME]))
    }
  }

  return { admin1, admin2 }
}

function collect(file, keep, aliasCap) {
  const places = []
  for (const line of readFileSync(join(source, file), 'utf8').split('\n')) {
    if (!line) continue
    const row = line.split('\t')
    if (!keep(row)) continue
    const latitude = Number(row[LAT])
    const longitude = Number(row[LON])
    const timeZoneId = row[TZ]
    const name = row[NAME]
    if (!name || !timeZoneId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue
    places.push({
      name,
      aliases: aliasesOf(row, aliasCap(Number(row[POP]) || 0)),
      countryCode: row[CC] ?? '',
      admin1: row[A1] ?? '',
      admin2: row[A2] ?? '',
      latitude: Number(latitude.toFixed(4)),
      longitude: Number(longitude.toFixed(4)),
      timeZoneId,
      population: Number(row[POP]) || 0,
      rank: RANK[row[CODE]] ?? 5,
    })
  }
  return places
}

/** A comune outranks one of its own hamlets when both match a query. */
const RANK = { PPLC: 0, PPLA: 1, PPLA2: 2, PPLA3: 3, PPL: 4, PPLL: 6, PPLX: 6, PPLF: 6, PPLS: 6 }

function serialise(places, admin) {
  // Most useful first, so a bounded scan still finds the obvious answer.
  places.sort((a, b) => a.rank - b.rank || b.population - a.population || a.name.localeCompare(b.name))

  const zones = [...new Set(places.map((p) => p.timeZoneId))].sort()
  const zoneIndex = new Map(zones.map((z, i) => [z, i]))

  const a1 = new Map()
  const a2 = new Map()
  for (const place of places) {
    const k1 = `${place.countryCode}.${place.admin1}`
    if (place.admin1 && admin.admin1.has(k1)) a1.set(k1, admin.admin1.get(k1))
    const k2 = `${k1}.${place.admin2}`
    if (place.admin2 && admin.admin2.has(k2)) a2.set(k2, admin.admin2.get(k2))
  }
  const a1Keys = [...a1.keys()]
  const a2Keys = [...a2.keys()]
  const a1Index = new Map(a1Keys.map((k, i) => [k, i]))
  const a2Index = new Map(a2Keys.map((k, i) => [k, i]))

  const rows = places.map((p) => {
    const k1 = `${p.countryCode}.${p.admin1}`
    const k2 = `${k1}.${p.admin2}`
    return [
      p.name,
      p.aliases.join('|'),
      p.countryCode,
      a1Index.has(k1) ? a1Index.get(k1) : '',
      a2Index.has(k2) ? a2Index.get(k2) : '',
      p.latitude.toFixed(4),
      p.longitude.toFixed(4),
      zoneIndex.get(p.timeZoneId),
      p.population || '',
    ].join('\t')
  })

  return [
    zones.join('\n'),
    a1Keys.map((k) => `${k}\t${a1.get(k)}`).join('\n'),
    a2Keys.map((k) => `${k}\t${a2.get(k)}`).join('\n'),
    rows.join('\n'),
  ].join('\n\n') + '\n'
}

const admin = readAdminNames()

// Italy: every populated place, plus any comune with no populated-place record.
const italy = collect('IT.txt', (row) => row[CLASS] === 'P', () => 40)
const seen = new Set(italy.map((p) => `${fold(p.name)}|${p.admin2}`))
for (const comune of collect('IT.txt', (row) => row[CODE] === 'ADM3', () => 40)) {
  const key = `${fold(comune.name)}|${comune.admin2}`
  if (seen.has(key)) continue
  seen.add(key)
  italy.push({ ...comune, rank: 3 })
}

// The rest of the world, above five thousand inhabitants.
/**
 * A capital is searched by every language's name for it; a town of six
 * thousand people is searched by its own. The budget follows that.
 */
const worldAliasCap = (population) => (population > 400_000 ? 40 : population > 80_000 ? 16 : 6)

const world = collect('cities5000.txt', (row) => row[CC] !== 'IT', worldAliasCap)

mkdirSync(OUT_DIR, { recursive: true })
for (const [file, places] of [['places-it.txt', italy], ['places-world.txt', world]]) {
  const output = serialise(places, admin)
  writeFileSync(join(OUT_DIR, file), output)
  const hash = createHash('sha256').update(output).digest('hex').slice(0, 12)
  process.stdout.write(`${file}: ${places.length} luoghi · ${(Buffer.byteLength(output) / 1048576).toFixed(2)} MB · ${hash}\n`)
}
