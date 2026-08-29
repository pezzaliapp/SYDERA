/**
 * Birth place datasets.
 *
 * Two files, both static and same-origin. Italy is complete — every comune and
 * every frazione, with no population threshold — because a birthplace is
 * usually a small place: the previous build kept only places above fifteen
 * thousand inhabitants, which left most Italian municipalities unfindable.
 * The rest of the world is a second file, fetched after Italy so that Italian
 * results are on screen without waiting for it.
 *
 * Both URLs carry a fingerprint of the file the build was made with, so a
 * release can never read another release's data whatever a cache has kept.
 */
export interface Place {
  readonly name: string
  /** Other names the place is known by: local forms, exonyms, historic names. */
  readonly aliases: readonly string[]
  readonly countryCode: string
  /** First-order division: "Toscana", "Bayern". Empty when unknown. */
  readonly region: string
  /** Second-order division: "Firenze". Empty when unknown. */
  readonly province: string
  readonly latitude: number
  readonly longitude: number
  readonly timeZoneId: string
  readonly population: number
  /** Everything searchable about the place, folded once at load. */
  readonly haystack: string
  /** The name alone, folded. */
  readonly folded: string
  /** The alternate names, folded and delimited, for an exact-alias test. */
  readonly aliasKeys: string
}

export interface PlaceDataset {
  readonly places: readonly Place[]
}

export const PLACE_DATASET_PATHS = ['data/places-it.txt', 'data/places-world.txt'] as const

export const PLACE_DATASET_URLS = [
  `${PLACE_DATASET_PATHS[0]}?v=${__SYDERA_PLACES_IT_VERSION__}`,
  `${PLACE_DATASET_PATHS[1]}?v=${__SYDERA_PLACES_WORLD_VERSION__}`,
] as const

/**
 * Accents, apostrophes and punctuation are removed on both sides of a
 * comparison, so "citta di castello" finds "Città di Castello" and "l aquila"
 * finds "L'Aquila".
 */
export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Mn}+/gu, '')
    .toLowerCase()
    .replace(/['’`]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

export function parsePlaceDataset(text: string): PlaceDataset {
  const [zoneBlock = '', a1Block = '', a2Block = '', placeBlock = ''] = text.split('\n\n')
  const zones = zoneBlock.split('\n').filter(Boolean)
  const regions = a1Block.split('\n').filter(Boolean).map((line) => line.split('\t')[1] ?? '')
  const provinces = a2Block.split('\n').filter(Boolean).map((line) => line.split('\t')[1] ?? '')

  const places: Place[] = []
  for (const line of placeBlock.split('\n')) {
    if (!line) continue
    const parts = line.split('\t')
    const zone = zones[Number(parts[7])]
    const name = parts[0]
    if (!name || !zone) continue

    const aliases = parts[1] ? parts[1].split('|') : []
    const region = parts[3] === '' || parts[3] === undefined ? '' : (regions[Number(parts[3])] ?? '')
    const province = parts[4] === '' || parts[4] === undefined ? '' : (provinces[Number(parts[4])] ?? '')
    const countryCode = parts[2] ?? ''
    const folded = fold(name)

    places.push({
      name,
      aliases,
      countryCode,
      region,
      province,
      latitude: Number(parts[5]),
      longitude: Number(parts[6]),
      timeZoneId: zone,
      population: parts[8] ? Number(parts[8]) : 0,
      // Folded once here so a keystroke never has to normalise the dataset:
      // doing it per search meant over a million string normalisations for
      // every character typed.
      haystack: fold([name, ...aliases, province, region, countryCode].join(' ')),
      folded,
      aliasKeys: aliases.length > 0 ? `|${aliases.map(fold).join('|')}|` : '',
    })
  }

  return { places }
}

let italy: PlaceDataset | null = null
let world: PlaceDataset | null = null
let italyInFlight: Promise<PlaceDataset> | null = null
let worldInFlight: Promise<PlaceDataset> | null = null

async function fetchDataset(url: string, fetcher: typeof fetch): Promise<PlaceDataset> {
  const response = await fetcher(url)
  if (!response.ok) throw new Error(`place dataset unavailable (${response.status})`)
  return parsePlaceDataset(await response.text())
}

/**
 * Italian places, which is what most searches need and the smaller of the two
 * files. Resolves as soon as they are usable.
 */
export async function loadPlaceDataset(baseUrl: string, fetcher: typeof fetch = fetch): Promise<PlaceDataset> {
  if (italy) return italy
  if (!italyInFlight) {
    italyInFlight = fetchDataset(`${baseUrl}${PLACE_DATASET_URLS[0]}`, fetcher).then((parsed) => {
      italy = parsed
      italyInFlight = null
      return parsed
    })
  }
  return italyInFlight
}

/** The rest of the world, loaded after Italy and never blocking a keystroke. */
export async function loadWorldDataset(baseUrl: string, fetcher: typeof fetch = fetch): Promise<PlaceDataset> {
  if (world) return world
  if (!worldInFlight) {
    worldInFlight = fetchDataset(`${baseUrl}${PLACE_DATASET_URLS[1]}`, fetcher).then((parsed) => {
      world = parsed
      worldInFlight = null
      return parsed
    })
  }
  return worldInFlight
}

/** Whatever is loaded right now, Italy first. */
export function loadedPlaces(): readonly Place[][] {
  const parts: Place[][] = []
  if (italy) parts.push(italy.places as Place[])
  if (world) parts.push(world.places as Place[])
  return parts
}

export function isDatasetLoaded(): boolean {
  return italy !== null
}

export function isWorldLoaded(): boolean {
  return world !== null
}

/** Test seam: install datasets without a network call. */
export function primePlaceDataset(dataset: PlaceDataset | null, worldDataset: PlaceDataset | null = null): void {
  italy = dataset
  world = worldDataset
  italyInFlight = null
  worldInFlight = null
}
