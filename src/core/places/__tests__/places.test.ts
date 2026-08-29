import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PLACE_DATASET_PATH, loadPlaceDataset, parsePlaceDataset, primePlaceDataset } from '../dataset.ts'
import { describePlace, foldForSearch, searchPlaces } from '../search.ts'

/** The dataset that ships with the application, read from disk for the tests. */
const dataset = parsePlaceDataset(
  readFileSync(join(process.cwd(), 'public', 'data', 'places.txt'), 'utf8'),
)

describe('shipped dataset', () => {
  it('parses into places and zones', () => {
    expect(dataset.places.length).toBeGreaterThan(30_000)
    expect(dataset.zones.length).toBeGreaterThan(300)
  })

  it('gives every place usable coordinates and a real IANA zone', () => {
    for (const place of dataset.places.slice(0, 500)) {
      expect(place.latitude).toBeGreaterThanOrEqual(-90)
      expect(place.latitude).toBeLessThanOrEqual(90)
      expect(place.longitude).toBeGreaterThanOrEqual(-180)
      expect(place.longitude).toBeLessThanOrEqual(180)
      expect(() => new Intl.DateTimeFormat('en-US', { timeZone: place.timeZoneId })).not.toThrow()
    }
  })

  it('is ordered by descending population, so the obvious answer comes first', () => {
    const first = dataset.places[0]
    expect(first?.name.length).toBeGreaterThan(0)
    expect(searchPlaces(dataset, 'roma')[0]?.place.name.toLowerCase()).toContain('rom')
  })
})

describe('search', () => {
  it('finds a city by its exact name', () => {
    const results = searchPlaces(dataset, 'Rome')
    expect(results[0]?.place.name).toBe('Rome')
    expect(results[0]?.place.timeZoneId).toBe('Europe/Rome')
    expect(results[0]?.place.countryCode).toBe('IT')
  })

  it('ignores accents in the query', () => {
    const withAccent = searchPlaces(dataset, 'Zürich')[0]?.place
    const withoutAccent = searchPlaces(dataset, 'Zurich')[0]?.place
    expect(withAccent?.name).toBe('Zürich')
    expect(withoutAccent?.name).toBe('Zürich')
    expect(withoutAccent?.timeZoneId).toBe('Europe/Zurich')
  })

  it('finds a name written with a letter the query lacks', () => {
    const results = searchPlaces(dataset, 'Tromso')
    expect(results[0]?.place.name).toBe('Tromsø')
    expect(results[0]?.place.latitude).toBeCloseTo(69.649, 2)
  })

  it('finds a place through its stored transliteration', () => {
    const results = searchPlaces(dataset, 'Tokyo')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]?.place.timeZoneId).toBe('Asia/Tokyo')
  })

  it('prefers names that start with the query', () => {
    const results = searchPlaces(dataset, 'Milan')
    expect(results[0]?.rank).toBe(0)
    expect(results[0]?.place.name.toLowerCase().startsWith('milan')).toBe(true)
  })

  it('ignores a query that is too short to be useful', () => {
    expect(searchPlaces(dataset, '')).toEqual([])
    expect(searchPlaces(dataset, 'a')).toEqual([])
  })

  it('returns nothing rather than a wrong guess for an unknown place', () => {
    expect(searchPlaces(dataset, 'Zzzzqqqxyz')).toEqual([])
  })

  it('respects the result limit', () => {
    expect(searchPlaces(dataset, 'san', 5)).toHaveLength(5)
  })

  it('labels a place unambiguously', () => {
    const rome = searchPlaces(dataset, 'Rome')[0]?.place
    expect(rome && describePlace(rome)).toBe('Rome, IT')
  })

  it('folds text consistently', () => {
    expect(foldForSearch('  Zürich ')).toBe('zurich')
    expect(foldForSearch('SÃO PAULO')).toBe('sao paulo')
  })
})

describe('dataset loading', () => {
  it('requests only a same-origin path built from the application base', async () => {
    primePlaceDataset(null)
    const requested: string[] = []
    const fakeFetch = (async (input: string) => {
      requested.push(String(input))
      return { ok: true, text: async () => 'Europe/Rome\n\nRoma\t\tIT\t07\t41.892\t12.511\t0\n' } as Response
    }) as unknown as typeof fetch

    const loaded = await loadPlaceDataset('/SYDERA/', fakeFetch)
    expect(requested).toEqual(['/SYDERA/data/places.txt'])
    expect(loaded.places[0]?.name).toBe('Roma')
    // Relative to the base: no absolute host, no third party.
    expect(requested[0]).not.toMatch(/^https?:\/\//)
    expect(PLACE_DATASET_PATH).not.toMatch(/^\//)
    primePlaceDataset(null)
  })

  it('loads once and reuses the result', async () => {
    primePlaceDataset(null)
    let calls = 0
    const fakeFetch = (async () => {
      calls += 1
      return { ok: true, text: async () => 'Europe/Rome\n\nRoma\t\tIT\t07\t41.892\t12.511\t0\n' } as Response
    }) as unknown as typeof fetch

    await loadPlaceDataset('/SYDERA/', fakeFetch)
    await loadPlaceDataset('/SYDERA/', fakeFetch)
    expect(calls).toBe(1)
    primePlaceDataset(null)
  })

  it('reports an unavailable dataset instead of failing silently', async () => {
    primePlaceDataset(null)
    const fakeFetch = (async () => ({ ok: false, status: 404 }) as Response) as unknown as typeof fetch
    await expect(loadPlaceDataset('/SYDERA/', fakeFetch)).rejects.toThrow('place dataset unavailable')
    primePlaceDataset(null)
  })
})

describe('Italian names find Italian places', () => {
  /**
   * GeoNames files these cities under their English exonym, so before the
   * alternate names were carried in the dataset an Italian typing "Roma" or
   * "Firenze" found nothing at all.
   */
  const cities: ReadonlyArray<readonly [string, string]> = [
    ['Roma', 'Rome'],
    ['Milano', 'Milan'],
    ['Firenze', 'Florence'],
    ['Napoli', 'Naples'],
    ['Torino', 'Turin'],
    ['Venezia', 'Venice'],
    ['Genova', 'Genoa'],
  ]

  for (const [typed, filedAs] of cities) {
    it(`"${typed}" finds ${filedAs}, first`, () => {
      const results = searchPlaces(dataset, typed)
      const top = results[0]
      expect(top, `"${typed}" found nothing`).toBeDefined()
      expect(top?.place.name).toBe(filedAs)
      expect(top?.place.countryCode).toBe('IT')
    })
  }

  it('still finds places by the name they are filed under', () => {
    for (const [typed, filedAs] of [...cities, ['Prato', 'Prato'], ['Paris', 'Paris'], ['London', 'London']] as const) {
      const byFiledName = searchPlaces(dataset, filedAs)[0]
      expect(byFiledName, `${filedAs} not found`).toBeDefined()
      expect(searchPlaces(dataset, typed).length).toBeGreaterThan(0)
    }
  })

  it('keeps the dataset small enough to reach a phone', () => {
    const bytes = readFileSync(join(process.cwd(), 'public', 'data', 'places.txt')).byteLength
    expect(bytes).toBeLessThan(1_400_000)
  })
})
