/**
 * Talking to the place-search worker.
 *
 * One worker for the whole application, started when the field is first used.
 * Only the latest query matters, so an answer that arrives after a newer
 * keystroke is discarded rather than shown.
 *
 * Where workers are unavailable the search runs on this thread instead: a
 * slower keystroke is better than a field that does not work.
 */
import { loadPlaceDataset, loadWorldDataset, loadedPlaces, isWorldLoaded } from './dataset.ts'
import { searchPlaces, type PlaceMatch } from './search.ts'
import type { FailureResponse, SearchRequest, SearchResponse } from './worker.ts'

export interface SearchOutcome {
  readonly matches: readonly PlaceMatch[]
  /** False while only part of what this build ships is searchable. */
  readonly complete: boolean
}

let worker: Worker | null = null
let workerUnavailable = false
let nextId = 1
const pending = new Map<number, (outcome: SearchOutcome | null) => void>()

function ensureWorker(): Worker | null {
  if (worker || workerUnavailable) return worker
  try {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (event: MessageEvent<SearchResponse | FailureResponse>) => {
      const resolve = pending.get(event.data.id)
      if (!resolve) return
      pending.delete(event.data.id)
      resolve(event.data.kind === 'results' ? { matches: event.data.matches, complete: event.data.complete } : null)
    })
    worker.addEventListener('error', () => {
      workerUnavailable = true
      for (const resolve of pending.values()) resolve(null)
      pending.clear()
    })
  } catch {
    workerUnavailable = true
    worker = null
  }
  return worker
}

const ENOUGH = 3

/** Runs the same search here when no worker is available. */
async function searchOnThisThread(base: string, query: string): Promise<SearchOutcome> {
  await loadPlaceDataset(base)
  let matches = searchPlaces(loadedPlaces(), query)
  if (matches.length < ENOUGH && !isWorldLoaded()) {
    await loadWorldDataset(base)
    matches = searchPlaces(loadedPlaces(), query)
  }
  return { matches, complete: isWorldLoaded() }
}

export async function searchPlacesAsync(base: string, query: string): Promise<SearchOutcome> {
  const instance = ensureWorker()
  if (!instance) return searchOnThisThread(base, query)

  const id = nextId++
  const request: SearchRequest = { kind: 'search', id, base, query }
  const outcome = await new Promise<SearchOutcome | null>((resolve) => {
    pending.set(id, resolve)
    instance.postMessage(request)
  })
  // A worker that failed falls back rather than leaving the field empty.
  return outcome ?? searchOnThisThread(base, query)
}
