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
    const name = foldForSearch(place.name)
    const ascii = place.asciiName ? foldForSearch(place.asciiName) : ''

    if (name.startsWith(needle) || (ascii !== '' && ascii.startsWith(needle))) {
      starts.push({ place, rank: 0 })
      if (starts.length >= limit) break
      continue
    }
    if (contains.length < limit && (name.includes(needle) || (ascii !== '' && ascii.includes(needle)))) {
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
