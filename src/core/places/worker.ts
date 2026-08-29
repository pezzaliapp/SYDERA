/// <reference lib="webworker" />
/**
 * Place search, off the main thread.
 *
 * Parsing a hundred and thirty thousand places blocked the interface for
 * three quarters of a second — measured, not assumed — and typing is the one
 * thing that must never stutter. The worker owns the datasets and answers
 * queries; only the handful of matches shown ever crosses back.
 *
 * Italy is loaded on the first query. The rest of the world is fetched only
 * when a query is not well answered by Italy, so the common case never waits
 * for it.
 */
import { loadPlaceDataset, loadWorldDataset, loadedPlaces, isWorldLoaded } from './dataset.ts'
import { searchPlaces, type PlaceMatch } from './search.ts'

export interface SearchRequest {
  readonly kind: 'search'
  readonly id: number
  readonly base: string
  readonly query: string
}

export interface SearchResponse {
  readonly kind: 'results'
  readonly id: number
  readonly matches: readonly PlaceMatch[]
  /** True once every place this build ships is searchable. */
  readonly complete: boolean
}

export interface FailureResponse {
  readonly kind: 'failed'
  readonly id: number
}

/** Below this, Italy alone probably did not answer the question. */
const ENOUGH = 3

const scope = self as unknown as DedicatedWorkerGlobalScope

scope.addEventListener('message', (event: MessageEvent<SearchRequest>) => {
  const request = event.data
  if (request?.kind !== 'search') return

  void (async () => {
    try {
      await loadPlaceDataset(request.base)
      let matches = searchPlaces(loadedPlaces(), request.query)

      // Only reach for the world file when Italy did not answer well. Most
      // searches never pay for it.
      if (matches.length < ENOUGH && !isWorldLoaded()) {
        await loadWorldDataset(request.base)
        matches = searchPlaces(loadedPlaces(), request.query)
      }

      const response: SearchResponse = {
        kind: 'results',
        id: request.id,
        matches,
        complete: isWorldLoaded(),
      }
      scope.postMessage(response)
    } catch {
      const response: FailureResponse = { kind: 'failed', id: request.id }
      scope.postMessage(response)
    }
  })()
})
