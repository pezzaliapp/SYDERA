/*
 * SYDERA service worker (generated at build time).
 *
 * Offline strategy:
 *  - application shell and hashed assets: cache-first (they are immutable);
 *  - navigation requests: network-first with cached shell fallback, so a
 *    freshly deployed version is picked up while offline use still works;
 *  - everything else (cross-origin, non-GET): passed straight through.
 *
 * SYDERA stores no personal data in the service worker caches. Profiles live
 * exclusively in IndexedDB on the user's device.
 */
const CACHE_VERSION = '__SYDERA_CACHE_VERSION__'
const CACHE_NAME = `sydera-shell-${CACHE_VERSION}`
const PRECACHE = __SYDERA_PRECACHE_MANIFEST__

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: 'reload' }))
          } catch {
            // A single missing optional asset must not break installation.
          }
        }),
      )
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key.startsWith('sydera-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYDERA_SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          const cache = await caches.open(CACHE_NAME)
          cache.put('./', fresh.clone())
          return fresh
        } catch {
          const cached = (await caches.match('./')) || (await caches.match('./index.html'))
          if (cached) return cached
          return new Response('SYDERA non e disponibile offline per questa richiesta.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }
      })(),
    )
    return
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME)
        cache.put(request, response.clone())
      }
      return response
    })(),
  )
})
