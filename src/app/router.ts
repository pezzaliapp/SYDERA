/**
 * Hash-based router.
 *
 * A hash route keeps the application deployable as plain static files on any
 * host, without server rewrites and without a routing dependency.
 */
import { useCallback, useSyncExternalStore } from 'react'

export const RESULT_SECTIONS = ['sintesi', 'astrologia', 'numerologia', 'convergenze', 'cicli'] as const
export type ResultSection = (typeof RESULT_SECTIONS)[number]

export type Route =
  | { readonly name: 'start' }
  | { readonly name: 'data' }
  | { readonly name: 'result'; readonly section: ResultSection }
  | { readonly name: 'privacy' }
  | { readonly name: 'disclaimer' }
  | { readonly name: 'about' }
  | { readonly name: 'settings' }
  | { readonly name: 'not-found'; readonly path: string }

export const paths = {
  start: '#/',
  data: '#/dati',
  result: '#/sydera',
  section: (section: ResultSection) => (section === 'sintesi' ? '#/sydera' : `#/sydera/${section}`),
  privacy: '#/privacy',
  disclaimer: '#/avvertenze',
  about: '#/informazioni',
  settings: '#/impostazioni',
} as const

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  const segments = path.split('/').filter(Boolean).map(decodeURIComponent)

  if (segments.length === 0) return { name: 'start' }
  switch (segments[0]) {
    case 'dati':
      return { name: 'data' }
    case 'sydera': {
      const section = segments[1]
      if (!section) return { name: 'result', section: 'sintesi' }
      return (RESULT_SECTIONS as readonly string[]).includes(section)
        ? { name: 'result', section: section as ResultSection }
        : { name: 'result', section: 'sintesi' }
    }
    case 'privacy':
      return { name: 'privacy' }
    case 'avvertenze':
      return { name: 'disclaimer' }
    case 'informazioni':
      return { name: 'about' }
    case 'impostazioni':
      return { name: 'settings' }
    default:
      return { name: 'not-found', path }
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '#/',
  )
  return parseHash(hash)
}

export function navigate(target: string): void {
  window.location.hash = target.startsWith('#') ? target.slice(1) : target
}

export function useNavigate(): (target: string) => void {
  return useCallback((target: string) => navigate(target), [])
}
