/**
 * Place search, executed locally against the loaded dataset.
 *
 * Matching ignores accents in both directions, so "Zurich" finds "Zürich" and
 * "Tromso" finds "Tromsø", and it also uses the stored transliteration for
 * names written in other alphabets. The dataset is ordered by population, so
 * preserving its order is what makes the obvious answer come first.
 */
import type { Place, PlaceDataset } from './dataset.ts'

export function foldForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Mn}+/gu, '')
    .toLowerCase()
    .trim()
}

export interface PlaceMatch {
  readonly place: Place
  /** 0 for a name starting with the query, 1 for a match inside the name. */
  readonly rank: 0 | 1
}

export function searchPlaces(dataset: PlaceDataset, query: string, limit = 12): PlaceMatch[] {
  const needle = foldForSearch(query)
  if (needle.length < 2) return []

  const starts: PlaceMatch[] = []
  const contains: PlaceMatch[] = []

  for (const place of dataset.places) {
    // The name the place is filed under, plus any other name it is known by:
    // GeoNames files Rome under "Rome", and an Italian types "Roma".
    const forms = [foldForSearch(place.name)]
    if (place.asciiName) forms.push(foldForSearch(place.asciiName))
    for (const alias of place.aliases) forms.push(foldForSearch(alias))

    if (forms.some((form) => form.startsWith(needle))) {
      starts.push({ place, rank: 0 })
      if (starts.length >= limit) break
      continue
    }
    if (contains.length < limit && forms.some((form) => form.includes(needle))) {
      contains.push({ place, rank: 1 })
    }
  }

  return [...starts, ...contains].slice(0, limit)
}

/** A short, unambiguous label: "Roma, IT" or "Springfield, US-IL". */
export function describePlace(place: Place): string {
  const region = place.admin1 && place.countryCode === 'US' ? `${place.countryCode}-${place.admin1}` : place.countryCode
  return `${place.name}, ${region}`
}

/**
 * The country in words, for the confirmed place.
 *
 * `Intl.DisplayNames` ships with the browser, so this costs no dataset and
 * works offline. A code the browser cannot name is shown as it is rather than
 * guessed at.
 */
export function countryName(countryCode: string): string {
  if (!countryCode) return ''
  try {
    return new Intl.DisplayNames(['it'], { type: 'region' }).of(countryCode) ?? countryCode
  } catch {
    return countryCode
  }
}

/** Where the place is, in words: "Prato · Italia", "Springfield · Stati Uniti (MO)". */
export function placeRegion(place: Place): string {
  const country = countryName(place.countryCode)
  // Only the United States carries a state code that reads as one.
  const state = place.countryCode === 'US' && place.admin1 ? ` (${place.admin1})` : ''
  return country ? `${country}${state}` : ''
}
