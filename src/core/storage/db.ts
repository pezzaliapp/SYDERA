/**
 * Minimal IndexedDB access layer.
 *
 * Hand-written on purpose: the schema is one object store, and avoiding a
 * wrapper dependency keeps the storage path fully auditable — an important
 * property for an application whose main promise is that personal data never
 * leaves the device.
 */
export const DATABASE_NAME = 'sydera'
export const DATABASE_VERSION = 2
/**
 * One record, one analysis. SYDERA is not a profile manager: the store holds
 * the single set of birth data the person entered, under a fixed key.
 */
export const SYDERA_STORE = 'sydera'
/** Removed in version 2, when the profile collection was dropped. */
const LEGACY_PROFILE_STORE = 'profiles'

export class StorageUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('IndexedDB is not available in this browser context')
    this.name = 'StorageUnavailableError'
    this.cause = cause
  }
}

function requireIndexedDB(): IDBFactory {
  if (typeof indexedDB === 'undefined') throw new StorageUnavailableError()
  return indexedDB
}

export function isStorageAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

export function openDatabase(): Promise<IDBDatabase> {
  const factory = requireIndexedDB()
  return new Promise((resolve, reject) => {
    const request = factory.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(SYDERA_STORE)) {
        database.createObjectStore(SYDERA_STORE)
      }
      // Version 1 stored a collection of profiles. That concept is gone, so
      // the old store is removed rather than migrated: nothing in it belongs
      // to the single-analysis model.
      if (database.objectStoreNames.contains(LEGACY_PROFILE_STORE)) {
        database.deleteObjectStore(LEGACY_PROFILE_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new StorageUnavailableError())
    request.onblocked = () => reject(new Error('IndexedDB upgrade blocked by another open tab'))
  })
}

export async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(SYDERA_STORE, mode)
    const result = await promisify(run(transaction.objectStore(SYDERA_STORE)))
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'))
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
    })
    return result
  } finally {
    database.close()
  }
}

/**
 * Outcome of a database deletion.
 *
 * 'blocked' means another connection (typically SYDERA open in a second tab)
 * is holding the database: the browser will only complete the deletion once
 * that connection closes, so the caller must NOT report the data as removed.
 */
export type DeleteDatabaseOutcome = 'deleted' | 'blocked'

/**
 * Permanently delete the whole SYDERA database.
 *
 * Resolves 'deleted' only when the deletion has actually completed. A blocked
 * deletion resolves 'blocked' instead of pretending to have succeeded.
 */
export function deleteDatabase(): Promise<DeleteDatabaseOutcome> {
  const factory = requireIndexedDB()
  return new Promise((resolve, reject) => {
    const request = factory.deleteDatabase(DATABASE_NAME)
    let settled = false
    const settle = (outcome: DeleteDatabaseOutcome): void => {
      if (settled) return
      settled = true
      resolve(outcome)
    }
    request.onsuccess = () => settle('deleted')
    request.onblocked = () => settle('blocked')
    request.onerror = () => {
      if (settled) return
      settled = true
      reject(request.error ?? new Error('Unable to delete the SYDERA database'))
    }
  })
}
