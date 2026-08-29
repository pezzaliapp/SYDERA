/**
 * Application preferences.
 *
 * localStorage holds only small non-personal application settings: the theme,
 * the acknowledged disclaimer version and whether the introduction has been
 * completed. No profile data is ever written here.
 */
export const PREFERENCE_PREFIX = 'sydera.'

export const DISCLAIMER_VERSION = '2026-08-1'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface Preferences {
  readonly theme: ThemePreference
  /** Version of the disclaimer explicitly acknowledged by the user, if any. */
  readonly disclaimerAcknowledged: string | null
  readonly introductionCompleted: boolean
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  disclaimerAcknowledged: null,
  introductionCompleted: false,
}

const KEYS = {
  theme: `${PREFERENCE_PREFIX}theme`,
  disclaimerAcknowledged: `${PREFERENCE_PREFIX}disclaimerAcknowledged`,
  introductionCompleted: `${PREFERENCE_PREFIX}introductionCompleted`,
} as const

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // Storage can be unavailable (private mode, blocked cookies): fall back to defaults.
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Preferences are a convenience, never a requirement.
  }
}

export function loadPreferences(): Preferences {
  const theme = safeGet(KEYS.theme)
  return {
    theme: theme === 'light' || theme === 'dark' || theme === 'system' ? theme : DEFAULT_PREFERENCES.theme,
    disclaimerAcknowledged: safeGet(KEYS.disclaimerAcknowledged),
    introductionCompleted: safeGet(KEYS.introductionCompleted) === 'true',
  }
}

export function savePreferences(preferences: Preferences): void {
  safeSet(KEYS.theme, preferences.theme)
  safeSet(KEYS.introductionCompleted, String(preferences.introductionCompleted))
  if (preferences.disclaimerAcknowledged === null) {
    try {
      localStorage.removeItem(KEYS.disclaimerAcknowledged)
    } catch {
      /* ignore */
    }
  } else {
    safeSet(KEYS.disclaimerAcknowledged, preferences.disclaimerAcknowledged)
  }
}

export function isDisclaimerCurrent(preferences: Preferences): boolean {
  return preferences.disclaimerAcknowledged === DISCLAIMER_VERSION
}

/** Remove every SYDERA preference key. Used by "delete all my data". */
/**
 * Anything SYDERA has ever written, not only what it writes today.
 *
 * Matching on the name rather than on the current prefix means a key left
 * behind by an earlier version is removed too: "delete all my data" that
 * quietly skips an old record is not a deletion.
 */
const SYDERA_KEY = /^sydera[.:_-]/i

function sweep(storage: Storage): string[] {
  const removed: string[] = []
  const keys: string[] = []
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index)
    if (key !== null && SYDERA_KEY.test(key)) keys.push(key)
  }
  for (const key of keys) {
    storage.removeItem(key)
    removed.push(key)
  }
  return removed
}

export function clearPreferences(): string[] {
  const removed: string[] = []
  for (const storage of [
    typeof localStorage === 'undefined' ? null : localStorage,
    typeof sessionStorage === 'undefined' ? null : sessionStorage,
  ]) {
    if (!storage) continue
    try {
      removed.push(...sweep(storage))
    } catch {
      // Nothing to clear if this storage is unavailable.
    }
  }
  return removed
}
