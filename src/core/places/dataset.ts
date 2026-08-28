/**
 * Birth place dataset.
 *
 * A trimmed extract of GeoNames cities15000 (CC BY 4.0) is shipped as a static
 * file next to the application and searched entirely in the browser. No place
 * name, and no coordinate, is ever sent anywhere: the only request involved is
 * the one that downloads this file from the same origin the application was
 * loaded from, once, after which the service worker keeps it.
 */
export interface Place {
  readonly name: string
  /** Transliteration for names not written in the Latin alphabet. */
  readonly asciiName: string
  readonly countryCode: string
  readonly admin1: string
  readonly latitude: number
  readonly longitude: number
  readonly timeZoneId: string
}

export interface PlaceDataset {
  readonly places: readonly Place[]
  readonly zones: readonly string[]
}

/**
 * Relative to the application base, so it follows the deployment sub-directory.
 *
 * The `.txt` extension is deliberate: it is served as `text/plain`, which every
 * static host and CDN compresses. A `.tsv` extension yields
 * `text/tab-separated-values`, which is not on the usual compressible-type
 * lists, and an uncompressed transfer of this file measured 12 seconds on a
 * slow 3G connection against roughly half that when compressed.
 */
export const PLACE_DATASET_PATH = 'data/places.txt'

export function parsePlaceDataset(text: string): PlaceDataset {
  const [zoneBlock = '', placeBlock = ''] = text.split('\n\n')
  const zones = zoneBlock.split('\n').filter(Boolean)

  const places: Place[] = []
  for (const line of placeBlock.split('\n')) {
    if (!line) continue
    const [name, asciiName, countryCode, admin1, latitude, longitude, zoneIndex] = line.split('\t')
    const zone = zones[Number(zoneIndex)]
    if (!name || !zone) continue
    places.push({
      name,
      asciiName: asciiName ?? '',
      countryCode: countryCode ?? '',
      admin1: admin1 ?? '',
      latitude: Number(latitude),
      longitude: Number(longitude),
      timeZoneId: zone,
    })
  }

  return { places, zones }
}

let cached: PlaceDataset | null = null
let inFlight: Promise<PlaceDataset> | null = null

/**
 * Load the dataset once. The URL is built from the application's own base, so
 * it is always same-origin and never points anywhere else.
 */
export async function loadPlaceDataset(baseUrl: string, fetcher: typeof fetch = fetch): Promise<PlaceDataset> {
  if (cached) return cached
  if (inFlight) return inFlight

  inFlight = (async () => {
    const response = await fetcher(`${baseUrl}${PLACE_DATASET_PATH}`)
    if (!response.ok) throw new Error(`place dataset unavailable (${response.status})`)
    const parsed = parsePlaceDataset(await response.text())
    cached = parsed
    inFlight = null
    return parsed
  })()

  return inFlight
}

export function isDatasetLoaded(): boolean {
  return cached !== null
}

/** Test seam: install a dataset without a network call. */
export function primePlaceDataset(dataset: PlaceDataset | null): void {
  cached = dataset
  inFlight = null
}
