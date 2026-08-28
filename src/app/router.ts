/**
 * Hash-based router.
 *
 * A hash route keeps the application deployable as plain static files on any
 * host (GitHub Pages included) without server rewrites, and without adding a
 * routing dependency.
 */
import { useCallback, useSyncExternalStore } from 'react'

export type Route =
  | { readonly name: 'home' }
  | { readonly name: 'profiles' }
  | { readonly name: 'profile-new' }
  | { readonly name: 'analysis'; readonly profileId: string }
  | { readonly name: 'privacy' }
  | { readonly name: 'disclaimer' }
  | { readonly name: 'about' }
  | { readonly name: 'settings' }
  | { readonly name: 'not-found'; readonly path: string }

export const paths = {
  home: '#/',
  profiles: '#/profili',
  profileNew: '#/profili/nuovo',
  analysis: (profileId: string) => `#/analisi/${encodeURIComponent(profileId)}`,
  privacy: '#/privacy',
  disclaimer: '#/avvertenze',
  about: '#/informazioni',
  settings: '#/impostazioni',
} as const

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  const segments = path.split('/').filter(Boolean).map(decodeURIComponent)

  if (segments.length === 0) return { name: 'home' }
  switch (segments[0]) {
    case 'profili':
      return segments[1] === 'nuovo' ? { name: 'profile-new' } : { name: 'profiles' }
    case 'analisi':
      return segments[1] ? { name: 'analysis', profileId: segments[1] } : { name: 'profiles' }
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
