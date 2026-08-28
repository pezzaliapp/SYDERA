/**
 * "Delete all my data".
 *
 * Removes every piece of information SYDERA keeps on the device:
 *  - the IndexedDB database holding the profiles;
 *  - the localStorage preference keys.
 *
 * Deletion is only ever reported as completed once IndexedDB has actually
 * removed the database. If another SYDERA tab holds the database open, the
 * browser defers the deletion: in that case nothing is cleared, the caller is
 * told the operation is blocked, and the user is asked to close the other
 * tabs and retry.
 *
 * The offline application shell cache is intentionally left in place: it holds
 * only the program itself and never any personal information. Files the user
 * exported deliberately are outside the application and are never touched.
 */
import { clearPreferences } from '../prefs/preferences.ts'
import { deleteDatabase, isStorageAvailable, type DeleteDatabaseOutcome } from './db.ts'

export type WipeStatus = 'deleted' | 'blocked'

export interface WipeReport {
  /** 'deleted' only when everything SYDERA manages has actually been removed. */
  readonly status: WipeStatus
  /** True when the IndexedDB database was really deleted. */
  readonly databaseDeleted: boolean
  /** False when this browser context offers no IndexedDB at all (nothing to delete). */
  readonly storageAvailable: boolean
  readonly preferenceKeysRemoved: readonly string[]
}

/** Injection points, so the blocked path can be tested without a browser. */
export interface WipeDependencies {
  readonly isStorageAvailable: () => boolean
  readonly deleteDatabase: () => Promise<DeleteDatabaseOutcome>
  readonly clearPreferences: () => string[]
}

const defaultDependencies: WipeDependencies = {
  isStorageAvailable,
  deleteDatabase,
  clearPreferences,
}

export async function deleteAllLocalData(overrides: Partial<WipeDependencies> = {}): Promise<WipeReport> {
  const deps: WipeDependencies = { ...defaultDependencies, ...overrides }
  const storageAvailable = deps.isStorageAvailable()

  if (storageAvailable) {
    const outcome = await deps.deleteDatabase()
    if (outcome === 'blocked') {
      // Nothing is cleared: reporting a partial wipe as done would be a lie,
      // and clearing the preferences would send the user back to the
      // introduction while the profiles are still on the device.
      return {
        status: 'blocked',
        databaseDeleted: false,
        storageAvailable,
        preferenceKeysRemoved: [],
      }
    }
  }

  return {
    status: 'deleted',
    databaseDeleted: storageAvailable,
    storageAvailable,
    preferenceKeysRemoved: deps.clearPreferences(),
  }
}
