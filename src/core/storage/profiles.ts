/** Profile repository. All records live in the browser's IndexedDB. */
import { PROFILE_STORE, withStore } from './db.ts'
import { PROFILE_SCHEMA_VERSION, type NewProfile, type StoredProfile } from './types.ts'

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function listProfiles(): Promise<StoredProfile[]> {
  const profiles = await withStore<StoredProfile[]>('readonly', (store) => store.getAll() as IDBRequest<StoredProfile[]>)
  return profiles.sort((a, b) => a.label.localeCompare(b.label, 'it'))
}

export async function getProfile(id: string): Promise<StoredProfile | undefined> {
  return withStore<StoredProfile | undefined>('readonly', (store) => store.get(id) as IDBRequest<StoredProfile | undefined>)
}

export async function createProfile(input: NewProfile, now: string): Promise<StoredProfile> {
  const profile: StoredProfile = {
    ...input,
    id: newId(),
    schemaVersion: PROFILE_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
  }
  await withStore('readwrite', (store) => store.put(profile) as IDBRequest<IDBValidKey>)
  return profile
}

export async function updateProfile(profile: StoredProfile, now: string): Promise<StoredProfile> {
  const updated: StoredProfile = { ...profile, updatedAt: now }
  await withStore('readwrite', (store) => store.put(updated) as IDBRequest<IDBValidKey>)
  return updated
}

export async function deleteProfile(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id) as IDBRequest<undefined>)
}

export async function countProfiles(): Promise<number> {
  return withStore<number>('readonly', (store) => store.count() as IDBRequest<number>)
}

export { PROFILE_STORE }
