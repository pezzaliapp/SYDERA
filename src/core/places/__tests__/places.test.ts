import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  PLACE_DATASET_PATHS,
  loadPlaceDataset,
  loadWorldDataset,
  parsePlaceDataset,
  primePlaceDataset,
  type Place,
} from '../dataset.ts'
import { describePlace, foldForSearch, placeRegion, searchPlaces } from '../search.ts'

const read = (file: string) => parsePlaceDataset(readFileSync(join(process.cwd(), 'public', 'data', file), 'utf8'))

/** The datasets that ship with the application, read from disk for the tests. */
const italy = read('places-it.txt')
const world = read('places-world.txt')
const all = [italy.places as Place[], world.places as Place[]]

/** The first result, or null. What a person sees at the top of the list. */
const top = (query: string) => searchPlaces(all, query)[0]?.place ?? null
const names = (query: string) => searchPlaces(all, query).map((match) => match.place.name)

describe('shipped datasets', () => {
  it('cover every Italian municipality, not only the large ones', () => {
    // Italy has just under eight thousand comuni; the previous dataset kept
    // only places above fifteen thousand inhabitants and had 661 of them.
    expect(italy.places.length).toBeGreaterThan(50_000)
    expect(world.places.length).toBeGreaterThan(50_000)
  })

  it('gives every place usable coordinates and a real IANA zone', () => {
    for (const place of [...italy.places.slice(0, 400), ...world.places.slice(0, 400)]) {
      expect(place.latitude).toBeGreaterThanOrEqual(-90)
      expect(place.latitude).toBeLessThanOrEqual(90)
      expect(place.longitude).toBeGreaterThanOrEqual(-180)
      expect(place.longitude).toBeLessThanOrEqual(180)
      expect(() => new Intl.DateTimeFormat('en-US', { timeZone: place.timeZoneId })).not.toThrow()
    }
  })

  it('carries the administrative context that tells two places apart', () => {
    const calenzano = top('Calenzano')
    expect(calenzano?.province).toBe('Firenze')
    expect(calenzano?.region).toBe('Toscana')
    expect(placeRegion(calenzano as Place)).toBe('Firenze · Toscana · Italia')
  })

  it('folds accents, apostrophes and case consistently', () => {
    expect(foldForSearch('  Zürich ')).toBe('zurich')
    expect(foldForSearch('SÃO PAULO')).toBe('sao paulo')
    expect(foldForSearch("L'Aquila")).toBe('l aquila')
    expect(foldForSearch('Città di Castello')).toBe('citta di castello')
  })
})

describe('the places a real person is born in', () => {
  /**
   * Municipalities across the whole country, deliberately including small ones.
   * Every one of these must be findable: a birthplace is usually not a city.
   */
  const COMUNI = [
    // North
    'Milano', 'Torino', 'Genova', 'Bergamo', 'Brescia', 'Como', 'Varese', 'Monza', 'Novara',
    'Alessandria', 'Asti', 'Cuneo', 'Vercelli', 'Biella', 'Aosta', 'Trento', 'Bolzano', 'Verona',
    'Vicenza', 'Padova', 'Treviso', 'Belluno', 'Rovigo', 'Venezia', 'Udine', 'Pordenone', 'Gorizia',
    'Trieste', 'Piacenza', 'Parma', "Reggio nell'Emilia", 'Modena', 'Bologna', 'Ferrara', 'Ravenna',
    'Cesena', 'Rimini', 'La Spezia', 'Savona', 'Imperia', 'Sondrio', 'Lecco', 'Lodi', 'Cremona',
    'Mantova', 'Pavia', 'Bormio', 'Chiavenna', 'Vigevano', 'Domodossola', 'Bardonecchia', 'Arona',
    // Centre
    'Firenze', 'Prato', 'Pistoia', 'Lucca', 'Pisa', 'Livorno', 'Grosseto', 'Siena', 'Arezzo',
    'Massa', 'Carrara', 'Perugia', 'Terni', 'Ancona', 'Pesaro', 'Macerata', 'Ascoli Piceno',
    'Fermo', 'Roma', 'Viterbo', 'Rieti', 'Latina', 'Frosinone', "L'Aquila", 'Teramo', 'Pescara',
    'Chieti', 'Calenzano', 'Sesto Fiorentino', 'Campi Bisenzio', 'Scandicci', 'Fiesole',
    'Bagno a Ripoli', 'Signa', 'Lastra a Signa', 'Impruneta', 'Empoli', 'Pontassieve', 'Poggibonsi',
    'Montevarchi', 'Città di Castello', 'San Benedetto del Tronto', 'Civitanova Marche', 'Norcia',
    'Gubbio', 'Spoleto', 'Orvieto', 'Cortona', 'Volterra', 'San Gimignano',
    // South
    'Napoli', 'Caserta', 'Salerno', 'Avellino', 'Benevento', 'Bari', 'Foggia', 'Lecce', 'Taranto',
    'Brindisi', 'Potenza', 'Matera', 'Catanzaro', 'Cosenza', 'Crotone', 'Vibo Valentia',
    'Campobasso', 'Isernia', 'Amalfi', 'Positano', 'Ravello', 'Maratea', 'Tropea', 'Scilla',
    'Alberobello', 'Ostuni', 'Gallipoli', 'Otranto',
    // Sicily and Sardinia
    'Palermo', 'Catania', 'Messina', 'Siracusa', 'Trapani', 'Ragusa', 'Agrigento', 'Caltanissetta',
    'Enna', 'Cefalù', 'Taormina', 'Noto', 'Modica', 'Erice', 'Marsala', 'Cagliari', 'Sassari',
    'Nuoro', 'Oristano', 'Olbia', 'Alghero', 'Iglesias', 'Carbonia', 'Bosa', 'Orgosolo',
  ] as const

  it(`finds all ${COMUNI.length} municipalities, each as the first result`, { timeout: 30_000 }, () => {
    const missing: string[] = []
    for (const comune of COMUNI) {
      const first = top(comune)
      if (!first || foldForSearch(first.name) !== foldForSearch(comune) || first.countryCode !== 'IT') {
        missing.push(`${comune} -> ${first ? `${first.name} (${first.countryCode})` : 'nothing'}`)
      }
    }
    expect(missing, `not found first:\n${missing.join('\n')}`).toEqual([])
  })

  it('finds the places named in the production report', () => {
    for (const [query, expected] of [
      ['Calenzano', 'Calenzano'],
      ['Sesto Fiorentino', 'Sesto Fiorentino'],
      ['Campi Bisenzio', 'Campi Bisenzio'],
      ['Fiesole', 'Fiesole'],
      ['Bagno a Ripoli', 'Bagno a Ripoli'],
      ['Lastra a Signa', 'Lastra a Signa'],
      ['Reggio di Calabria', 'Reggio di Calabria'],
      ["Reggio nell'Emilia", "Reggio nell'Emilia"],
    ] as const) {
      expect(top(query)?.name, query).toBe(expected)
    }
  })
})

describe('international coverage', () => {
  const PLACES = [
    'Paris', 'London', 'Berlin', 'Madrid', 'Lisboa', 'Wien', 'Zürich', 'Genève', 'München',
    'Köln', 'Hamburg', 'Frankfurt am Main', 'Rotterdam', 'Utrecht', 'Antwerpen', 'Gent', 'Lyon',
    'Marseille', 'Toulouse', 'Bordeaux', 'Nice', 'Strasbourg', 'Sevilla', 'Valencia', 'Bilbao',
    'Granada', 'Porto', 'Coimbra', 'Braga', 'Kraków', 'Wrocław', 'Gdańsk', 'Brno', 'Bratislava',
    'Ljubljana', 'Zagreb', 'Split', 'Sarajevo', 'Beograd', 'Thessaloniki', 'Uppsala', 'Bergen',
    'Aarhus', 'Tampere', 'Reykjavík', 'Salzburg', 'Innsbruck', 'Maastricht', 'Cambridge', 'Toledo',
  ] as const

  it(`finds all ${PLACES.length} international places`, { timeout: 30_000 }, () => {
    const missing: string[] = []
    for (const place of PLACES) {
      // Found by its own name or by the name it is filed under: many are
      // filed under an English exonym (Wien -> Vienna, Lisboa -> Lisbon).
      const first = top(place)
      const matches =
        first !== null &&
        (foldForSearch(first.name) === foldForSearch(place) ||
          first.aliases.some((alias) => foldForSearch(alias) === foldForSearch(place)))
      if (!matches) missing.push(`${place} -> ${first?.name ?? 'nothing'}`)
    }
    expect(missing, `not found:\n${missing.join('\n')}`).toEqual([])
  })

  it('finds a place written without its accents', () => {
    expect(top('Zurich')?.name).toBe('Zürich')
    expect(top('Munchen')?.name).toBe('Munich')
    expect(top('Krakow')?.name).toBe('Kraków')
  })

  it('keeps same-name places in different countries distinguishable', () => {
    const springfields = searchPlaces(all, 'Springfield', 12).filter((m) => m.place.name === 'Springfield')
    expect(springfields.length).toBeGreaterThan(1)
    const described = springfields.map((m) => placeRegion(m.place))
    expect(new Set(described).size, 'each must say where it is').toBeGreaterThan(1)
  })
})

describe('people type a place the way they say it', () => {
  it('accepts a municipality with its province or region', () => {
    expect(top('calenzano firenze')?.name).toBe('Calenzano')
    expect(top('sesto fiorentino firenze')?.name).toBe('Sesto Fiorentino')
    expect(top('prato toscana')?.name).toBe('Prato')
  })

  it('accepts a name with words left out', () => {
    expect(top('san benedetto tronto')?.name).toBe('San Benedetto del Tronto')
  })

  it('accepts missing accents and missing apostrophes', () => {
    expect(top('citta di castello')?.name).toBe('Città di Castello')
    expect(top('l aquila')?.name).toBe("L'Aquila")
    expect(top('laquila')?.name).toBe("L'Aquila")
  })

  it('offers candidates when two places are typed, instead of nothing', () => {
    // The production case: this used to return NESSUN RISULTATO.
    const found = names('prato calenzano')
    expect(found.length).toBeGreaterThan(0)
    expect(found).toContain('Prato')
    expect(found).toContain('Calenzano')
  })

  it('ranks a small exact municipality above a large weak match', () => {
    // "Signa" is a comune of eight thousand people; "Lastra a Signa" and
    // "Signa" both contain the word, and the exact one has to win.
    expect(top('Signa')?.name).toBe('Signa')
    expect(top('Fiesole')?.name).toBe('Fiesole')
    expect(top('Noto')?.name).toBe('Noto')
  })

  it('finds a place filed under another name, by the name people use', () => {
    // These are filed under their English exonym worldwide; the Italian file
    // carries the Italian form, and either way the search has to land on the
    // right city rather than on a suburb that merely contains the word.
    for (const [query, province] of [
      ['Roma', 'Roma'],
      ['Firenze', 'Firenze'],
      ['Venezia', 'Venezia'],
      ['Milano', 'Milano'],
    ] as const) {
      const first = top(query)
      expect(first?.province, query).toBe(province)
      expect(first?.countryCode, query).toBe('IT')
    }
    expect(top('Munchen')?.name).toBe('Munich')
    expect(top('Wien')?.name).toBe('Vienna')
    expect(top('Lisboa')?.name).toBe('Lisbon')
    expect(top('Beograd')?.name).toBe('Belgrade')
  })

  it('ignores a query too short to mean anything', () => {
    expect(searchPlaces(all, 'a')).toEqual([])
    expect(searchPlaces(all, ' ')).toEqual([])
  })

  it('describes a place in one line when a label needs one', () => {
    expect(describePlace(top('Calenzano') as Place)).toBe('Calenzano, Firenze')
  })
})

describe('dataset loading', () => {
  const body = (name: string) =>
    `Europe/Rome\n\nIT.16\tToscana\n\nIT.16.FI\tFirenze\n\n${name}\t\tIT\t0\t0\t43.85\t11.16\t0\t12623\n`

  it('requests only same-origin paths built from the application base', async () => {
    primePlaceDataset(null)
    const requested: string[] = []
    const fakeFetch = (async (input: string) => {
      requested.push(String(input))
      return { ok: true, text: async () => body('Calenzano') } as Response
    }) as unknown as typeof fetch

    const loaded = await loadPlaceDataset('/SYDERA/', fakeFetch)
    await loadWorldDataset('/SYDERA/', fakeFetch)

    // Each URL carries the fingerprint of the file this build was made with,
    // so a release can never read another release's data.
    expect(requested).toHaveLength(2)
    expect(requested[0]).toMatch(/^\/SYDERA\/data\/places-it\.txt\?v=[0-9a-f]+$/)
    expect(requested[1]).toMatch(/^\/SYDERA\/data\/places-world\.txt\?v=[0-9a-f]+$/)
    for (const url of requested) expect(url).not.toMatch(/^https?:\/\//)
    for (const path of PLACE_DATASET_PATHS) expect(path).not.toMatch(/^\//)

    expect(loaded.places[0]?.name).toBe('Calenzano')
    expect(loaded.places[0]?.province).toBe('Firenze')
    expect(loaded.places[0]?.region).toBe('Toscana')
    primePlaceDataset(null)
  })

  it('loads each file once and reuses the result', async () => {
    primePlaceDataset(null)
    let calls = 0
    const fakeFetch = (async () => {
      calls += 1
      return { ok: true, text: async () => body('Calenzano') } as Response
    }) as unknown as typeof fetch

    await Promise.all([loadPlaceDataset('/SYDERA/', fakeFetch), loadPlaceDataset('/SYDERA/', fakeFetch)])
    await loadPlaceDataset('/SYDERA/', fakeFetch)
    expect(calls).toBe(1)
    primePlaceDataset(null)
  })

  it('reports a failure instead of pretending the dataset is empty', async () => {
    primePlaceDataset(null)
    const failing = (async () => ({ ok: false, status: 404 }) as Response) as unknown as typeof fetch
    await expect(loadPlaceDataset('/SYDERA/', failing)).rejects.toThrow()
    primePlaceDataset(null)
  })
})
