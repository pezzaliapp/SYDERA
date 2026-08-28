import { useEffect } from 'react'
import type { ThemePreference } from '../core/prefs/preferences.ts'

/** Apply the theme preference to the document root. */
export function useTheme(theme: ThemePreference): void {
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])
}
