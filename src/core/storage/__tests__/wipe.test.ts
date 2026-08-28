import { describe, expect, it, vi } from 'vitest'
import { deleteAllLocalData } from '../wipe.ts'
import { deleteDatabase, DATABASE_NAME } from '../db.ts'

describe('deleteAllLocalData', () => {
  it('reports deletion only after the database has actually been removed', async () => {
    const clearPreferences = vi.fn(() => ['sydera.theme', 'sydera.introductionCompleted'])
    const report = await deleteAllLocalData({
      isStorageAvailable: () => true,
      deleteDatabase: async () => 'deleted',
      clearPreferences,
    })
    expect(report.status).toBe('deleted')
    expect(report.databaseDeleted).toBe(true)
    expect(report.preferenceKeysRemoved).toEqual(['sydera.theme', 'sydera.introductionCompleted'])
    expect(clearPreferences).toHaveBeenCalledOnce()
  })

  it('never reports success when the deletion is blocked by another tab', async () => {
    const clearPreferences = vi.fn(() => ['sydera.theme'])
    const report = await deleteAllLocalData({
      isStorageAvailable: () => true,
      deleteDatabase: async () => 'blocked',
      clearPreferences,
    })
    expect(report.status).toBe('blocked')
    expect(report.databaseDeleted).toBe(false)
    expect(report.preferenceKeysRemoved).toEqual([])
  })

  it('leaves the preferences untouched while the deletion is blocked', async () => {
    const clearPreferences = vi.fn(() => [])
    await deleteAllLocalData({
      isStorageAvailable: () => true,
      deleteDatabase: async () => 'blocked',
      clearPreferences,
    })
    // Clearing them would send the user back to the introduction while the
    // profiles are still stored on the device.
    expect(clearPreferences).not.toHaveBeenCalled()
  })

  it('still clears preferences when the browser offers no IndexedDB', async () => {
    const deleteDatabaseSpy = vi.fn(async () => 'deleted' as const)
    const report = await deleteAllLocalData({
      isStorageAvailable: () => false,
      deleteDatabase: deleteDatabaseSpy,
      clearPreferences: () => ['sydera.theme'],
    })
    expect(deleteDatabaseSpy).not.toHaveBeenCalled()
    expect(report.status).toBe('deleted')
    expect(report.databaseDeleted).toBe(false)
    expect(report.storageAvailable).toBe(false)
    expect(report.preferenceKeysRemoved).toEqual(['sydera.theme'])
  })

  it('propagates a deletion error instead of claiming success', async () => {
    await expect(
      deleteAllLocalData({
        isStorageAvailable: () => true,
        deleteDatabase: async () => {
          throw new Error('quota failure')
        },
        clearPreferences: () => [],
      }),
    ).rejects.toThrow('quota failure')
  })
})

/** Minimal IDBFactory stand-in exercising the three deletion event paths. */
function fakeFactory(fire: 'success' | 'blocked' | 'error' | 'blocked-then-success') {
  const request: Record<string, unknown> = { error: fire === 'error' ? new Error('denied') : null }
  const factory = {
    deleteDatabase(name: string) {
      expect(name).toBe(DATABASE_NAME)
      queueMicrotask(() => {
        const onsuccess = request['onsuccess'] as (() => void) | undefined
        const onblocked = request['onblocked'] as (() => void) | undefined
        const onerror = request['onerror'] as (() => void) | undefined
        if (fire === 'success') onsuccess?.()
        if (fire === 'error') onerror?.()
        if (fire === 'blocked') onblocked?.()
        if (fire === 'blocked-then-success') {
          onblocked?.()
          onsuccess?.()
        }
      })
      return request
    },
  }
  return factory as unknown as IDBFactory
}

describe('deleteDatabase outcomes', () => {
  const install = (factory: IDBFactory | undefined): void => {
    Object.defineProperty(globalThis, 'indexedDB', { value: factory, configurable: true })
  }

  it('resolves "deleted" when the deletion completes', async () => {
    install(fakeFactory('success'))
    await expect(deleteDatabase()).resolves.toBe('deleted')
  })

  it('resolves "blocked" when another connection holds the database', async () => {
    install(fakeFactory('blocked'))
    await expect(deleteDatabase()).resolves.toBe('blocked')
  })

  it('keeps the blocked outcome even if the deletion completes later', async () => {
    install(fakeFactory('blocked-then-success'))
    // The user was already told to retry; a late success must not flip the
    // reported outcome after the fact.
    await expect(deleteDatabase()).resolves.toBe('blocked')
  })

  it('rejects on a deletion error', async () => {
    install(fakeFactory('error'))
    await expect(deleteDatabase()).rejects.toThrow()
  })
})
