/*
 * SYDERA service worker (generated at build time).
 *
 * Strategy:
 *  - hashed build assets: cache-first, because their name changes when they do;
 *  - everything else same-origin: stale-while-revalidate, so a file served at
 *    an unchanging URL can never be stuck on an old copy;
 *  - navigation: network-first with the cached shell as the offline fallback;
 *  - cross-origin and non-GET: passed straight through.
 *
 * The worker takes over as soon as it is installed. The previous design waited
 * for the user to accept a prompt, so a device could run a new application
 * against a previous release's cached data indefinitely.
 *
 * SYDERA stores no personal data in these caches. Profiles live exclusively in
 * IndexedDB on the user's device.
 */
const CACHE_VERSION = '__SYDERA_CACHE_VERSION__'
const CACHE_NAME = `sydera-shell-${CACHE_VERSION}`
const PRECACHE = __SYDERA_PRECACHE_MANIFEST__

/** Vite writes a content hash into these names, so they are safe to keep. */
const IMMUTABLE = /\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/

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
      // Do not wait for every tab to close before the fix reaches the user.
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key.startsWith('sydera-') && key !== CACHE_NAME).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYDERA_SKIP_WAITING') self.skipWaiting()
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
          return new Response('SYDERA non è disponibile offline per questa richiesta.', {
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
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(request)

      // A hashed asset cannot change behind its name.
      if (cached && IMMUTABLE.test(url.pathname)) return cached

      // Everything else is revalidated in the background, so the copy on disk
      // is at most one visit out of date and never permanently wrong.
      const network = fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') cache.put(request, response.clone())
          return response
        })
        .catch(() => null)

      if (cached) {
        event.waitUntil(network)
        return cached
      }
      const response = await network
      if (response) return response
      return new Response('', { status: 504 })
    })(),
  )
})
