/**
 * The stored SYDERA.
 *
 * Exactly one record: the birth data the person entered, kept under a fixed
 * key. There is no collection, no list and no identifier to manage — SYDERA is
 * one personal analysis, not a database of profiles.
 */
import { SYDERA_STORE, withStore } from './db.ts'
import type { HouseSystemId } from '../astrology/types.ts'

export const SYDERA_KEY = 'current'
export const SYDERA_SCHEMA_VERSION = 2

export interface StoredPlace {
  readonly label: string
  readonly latitude: number
  readonly longitude: number
  readonly timeZoneId: string
}

export interface SyderaInput {
  /** Optional: needed for numerology only, never for astrology. */
  readonly fullBirthName: string | null
  readonly birthDate: { readonly year: number; readonly month: number; readonly day: number }
  /** Null when the person stated the birth time is unknown. */
  readonly birthTime: { readonly hour: number; readonly minute: number } | null
  readonly birthTimePrecisionMinutes: number
  readonly place: StoredPlace | null
  readonly houseSystem: HouseSystemId
  /** Set when an ambiguous local time was resolved, or the offset overridden. */
  readonly offsetOverrideMinutes: number | null
}

export interface StoredSydera {
  readonly schemaVersion: number
  readonly input: SyderaInput
  readonly createdAt: string
  readonly updatedAt: string
}

export async function loadSydera(): Promise<StoredSydera | undefined> {
  return withStore<StoredSydera | undefined>(
    'readonly',
    (store) => store.get(SYDERA_KEY) as IDBRequest<StoredSydera | undefined>,
  )
}

export async function saveSydera(input: SyderaInput, now: string, existing?: StoredSydera): Promise<StoredSydera> {
  const record: StoredSydera = {
    schemaVersion: SYDERA_SCHEMA_VERSION,
    input,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await withStore('readwrite', (store) => store.put(record, SYDERA_KEY) as IDBRequest<IDBValidKey>)
  return record
}

export async function clearSydera(): Promise<void> {
  await withStore('readwrite', (store) => store.delete(SYDERA_KEY) as IDBRequest<undefined>)
}

export { SYDERA_STORE }
