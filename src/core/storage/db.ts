/**
 * Minimal IndexedDB access layer.
 *
 * Hand-written on purpose: the schema is one object store, and avoiding a
 * wrapper dependency keeps the storage path fully auditable — an important
 * property for an application whose main promise is that personal data never
 * leaves the device.
 */
export const DATABASE_NAME = 'sydera'
export const DATABASE_VERSION = 1
export const PROFILE_STORE = 'profiles'

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
      if (!database.objectStoreNames.contains(PROFILE_STORE)) {
        database.createObjectStore(PROFILE_STORE, { keyPath: 'id' })
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
    const transaction = database.transaction(PROFILE_STORE, mode)
    const result = await promisify(run(transaction.objectStore(PROFILE_STORE)))
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
