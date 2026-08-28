/** Locally stored data model. Nothing here ever leaves the device. */
import type { BirthDate } from '../numerology/types.ts'

export const PROFILE_SCHEMA_VERSION = 1

export interface BirthTime {
  readonly hour: number
  readonly minute: number
}

/**
 * Birth place. Coordinates and timezone stay optional until the astrology
 * engine is approved: SYDERA does not collect data it cannot yet use.
 */
export interface BirthPlace {
  readonly label: string
  readonly latitude?: number
  readonly longitude?: number
  readonly timeZoneId?: string
}

export interface StoredProfile {
  readonly id: string
  readonly schemaVersion: number
  /** Short label chosen by the user to recognise the profile. */
  readonly label: string
  /** Full birth name, required only for numerology. */
  readonly fullBirthName: string
  readonly birthDate: BirthDate
  readonly birthTimeKnown: boolean
  readonly birthTime: BirthTime | null
  readonly birthPlace: BirthPlace | null
  readonly createdAt: string
  readonly updatedAt: string
}

export type NewProfile = Omit<StoredProfile, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt'>
