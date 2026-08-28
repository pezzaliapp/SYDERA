import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearPreferences,
  DEFAULT_PREFERENCES,
  DISCLAIMER_VERSION,
  isDisclaimerCurrent,
  loadPreferences,
  PREFERENCE_PREFIX,
  savePreferences,
} from '../preferences.ts'

/** Minimal in-memory Storage stand-in; the real one lives in the browser. */
class MemoryStorage implements Storage {
  private entries = new Map<string, string>()

  get length(): number {
    return this.entries.size
  }

  clear(): void {
    this.entries.clear()
  }

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.entries.delete(key)
  }

  setItem(key: string, value: string): void {
    this.entries.set(key, value)
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true })
})

describe('preferences', () => {
  it('falls back to defaults when nothing is stored', () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES)
  })

  it('round-trips a saved preference set', () => {
    const preferences = {
      theme: 'dark',
      disclaimerAcknowledged: DISCLAIMER_VERSION,
      introductionCompleted: true,
    } as const
    savePreferences(preferences)
    expect(loadPreferences()).toEqual(preferences)
  })

  it('ignores an unknown theme value', () => {
    localStorage.setItem(`${PREFERENCE_PREFIX}theme`, 'neon')
    expect(loadPreferences().theme).toBe('system')
  })

  it('stores no personal data', () => {
    savePreferences({ theme: 'light', disclaimerAcknowledged: DISCLAIMER_VERSION, introductionCompleted: true })
    const stored: string[] = []
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index)
      if (key) stored.push(`${key}=${localStorage.getItem(key) ?? ''}`)
    }
    expect(stored.every((entry) => entry.startsWith(PREFERENCE_PREFIX))).toBe(true)
    expect(stored.join('|')).not.toMatch(/nome|nascita|birth|fullName/i)
  })

  it('recognises the acknowledged disclaimer version', () => {
    expect(isDisclaimerCurrent({ ...DEFAULT_PREFERENCES, disclaimerAcknowledged: DISCLAIMER_VERSION })).toBe(true)
    expect(isDisclaimerCurrent({ ...DEFAULT_PREFERENCES, disclaimerAcknowledged: 'older' })).toBe(false)
    expect(isDisclaimerCurrent(DEFAULT_PREFERENCES)).toBe(false)
  })

  it('removes every SYDERA key when data is deleted', () => {
    savePreferences({ theme: 'dark', disclaimerAcknowledged: DISCLAIMER_VERSION, introductionCompleted: true })
    localStorage.setItem('other-app.key', 'kept')
    const removed = clearPreferences()
    expect(removed.every((key) => key.startsWith(PREFERENCE_PREFIX))).toBe(true)
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES)
    expect(localStorage.getItem('other-app.key')).toBe('kept')
  })
})
