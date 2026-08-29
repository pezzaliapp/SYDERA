/**
 * Place search, executed locally against the loaded datasets.
 *
 * Nothing typed here ever leaves the device: this is a scan over a static file
 * the application already downloaded, not a request to a geocoder.
 *
 * Matching is tokenised, because people type a place the way they say it —
 * "calenzano firenze", "san benedetto tronto", "citta di castello". Accents and
 * apostrophes are removed on both sides, so writing "l aquila" finds L'Aquila.
 */
import { fold, type Place, type PlaceDataset } from './dataset.ts'

export { fold as foldForSearch }

export interface PlaceMatch {
  readonly place: Place
  /** Lower is better. Documented by RANK below. */
  readonly rank: number
  /** Which dataset it came from; the first is the one this build is for. */
  readonly source: number
}

/**
 * What a match is worth. A small comune named exactly as typed must come above
 * a large city that merely contains the word.
 */
const RANK = {
  exactName: 0,
  exactAlias: 1,
  allTokensInName: 2,
  namePrefix: 3,
  allTokensWithAdmin: 4,
  contained: 5,
  /** Only reached when nothing matches every token; see the fallback below. */
  partial: 6,
} as const

/** True when every token starts a word in the text. */
function tokensMatch(text: string, tokens: readonly string[]): boolean {
  for (const token of tokens) {
    if (!hasWordStarting(text, token)) return false
  }
  return true
}

function hasWordStarting(text: string, token: string): boolean {
  let from = 0
  for (;;) {
    const at = text.indexOf(token, from)
    if (at === -1) return false
    if (at === 0 || text.charCodeAt(at - 1) === 32) return true
    from = at + 1
  }
}

function score(place: Place, needle: string, tokens: readonly string[]): number | null {
  if (place.folded === needle) return RANK.exactName

  // Someone typing "laquila" means L'Aquila, whose folded name has a space
  // where the apostrophe was. Guarded by the first letter, so it costs
  // nothing on the rest of the dataset — and checked before the rejection
  // below, which looks for the token with its space still in it.
  if (tokens.length === 1 && place.folded.charCodeAt(0) === needle.charCodeAt(0) && place.folded.includes(' ')) {
    const compact = place.folded.replace(/ /g, '')
    if (compact === needle) return RANK.exactName
    if (compact.startsWith(needle)) return RANK.namePrefix
  }

  // Cheapest possible rejection: a place whose searchable text does not
  // contain the first token cannot match anything below.
  if (!place.haystack.includes(tokens[0] as string)) return null
  if (place.aliasKeys !== '' && place.aliasKeys.includes(`|${needle}|`)) return RANK.exactAlias
  if (tokensMatch(place.folded, tokens)) {
    return place.folded.startsWith(needle) ? RANK.namePrefix : RANK.allTokensInName
  }
  if (tokensMatch(place.haystack, tokens)) return RANK.allTokensWithAdmin
  if (place.haystack.includes(needle)) return RANK.contained
  return null
}

/**
 * Rank first; then the home dataset, because Lodi in Lombardia is the answer
 * an Italian typing "Lodi" wants even though Lodi in California is larger;
 * population only settles what is left.
 */
function better(a: PlaceMatch, b: PlaceMatch): number {
  return a.rank - b.rank || a.source - b.source || b.place.population - a.place.population
}

export function searchPlaces(
  dataset: PlaceDataset | readonly Place[][] | readonly Place[],
  query: string,
  limit = 12,
): PlaceMatch[] {
  const needle = fold(query)
  if (needle.length < 2) return []
  const tokens = needle.split(' ').filter((token) => token.length > 0)
  const sources = normaliseSources(dataset)

  const found: PlaceMatch[] = []
  for (let source = 0; source < sources.length; source += 1) {
    for (const place of sources[source] as readonly Place[]) {
      const rank = score(place, needle, tokens)
      if (rank !== null) found.push({ place, rank, source })
    }
  }

  if (found.length === 0 && tokens.length > 1) return partialMatches(sources, tokens, limit)

  found.sort(better)
  return dedupe(found, limit)
}

/**
 * "prato calenzano" names two towns, not one. Rather than return nothing, offer
 * the best candidates for each word and let the person choose — never guess
 * which one was meant.
 */
function partialMatches(sources: readonly (readonly Place[])[], tokens: readonly string[], limit: number): PlaceMatch[] {
  const perToken = Math.max(2, Math.ceil(limit / tokens.length))
  const collected: PlaceMatch[] = []

  for (const token of tokens) {
    if (token.length < 2) continue
    const forToken: PlaceMatch[] = []
    for (let source = 0; source < sources.length; source += 1) {
      for (const place of sources[source] as readonly Place[]) {
        if (place.folded === token) forToken.push({ place, rank: RANK.exactName, source })
        else if (hasWordStarting(place.folded, token)) forToken.push({ place, rank: RANK.partial, source })
      }
    }
    forToken.sort(better)
    collected.push(...dedupe(forToken, perToken))
  }

  collected.sort(better)
  return dedupe(collected, limit)
}

function dedupe(matches: readonly PlaceMatch[], limit: number): PlaceMatch[] {
  const seen = new Set<string>()
  const result: PlaceMatch[] = []
  for (const match of matches) {
    const key = `${match.place.name}|${match.place.latitude}|${match.place.longitude}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(match)
    if (result.length >= limit) break
  }
  return result
}

function normaliseSources(
  dataset: PlaceDataset | readonly Place[][] | readonly Place[],
): readonly (readonly Place[])[] {
  if (Array.isArray(dataset)) {
    return dataset.length > 0 && Array.isArray(dataset[0])
      ? (dataset as readonly Place[][])
      : [dataset as readonly Place[]]
  }
  return [(dataset as PlaceDataset).places]
}

/** "Calenzano, IT" — short and unambiguous, for labels that need one line. */
export function describePlace(place: Place): string {
  const where = [place.province, place.region].filter(Boolean)[0]
  return where ? `${place.name}, ${where}` : `${place.name}, ${place.countryCode}`
}

/**
 * Where the place is, in words: "Firenze · Toscana · Italia".
 * This is what tells two places of the same name apart.
 */
export function placeRegion(place: Place): string {
  const country = countryName(place.countryCode)
  const parts = [place.province, place.region, country].filter(Boolean)
  // "Firenze · Firenze · Italia" reads like a mistake.
  return parts.filter((part, index) => parts.indexOf(part) === index).join(' · ')
}

export function countryName(countryCode: string): string {
  if (!countryCode) return ''
  try {
    return new Intl.DisplayNames(['it'], { type: 'region' }).of(countryCode) ?? countryCode
  } catch {
    return countryCode
  }
}
