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
export function clearPreferences(): string[] {
  const removed: string[] = []
  try {
    const keys: string[] = []
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index)
      if (key !== null && key.startsWith(PREFERENCE_PREFIX)) keys.push(key)
    }
    for (const key of keys) {
      localStorage.removeItem(key)
      removed.push(key)
    }
  } catch {
    // Nothing to clear if storage is unavailable.
  }
  return removed
}
