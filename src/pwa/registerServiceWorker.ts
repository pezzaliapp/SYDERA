/**
 * Service worker registration and update flow.
 *
 * The worker is only registered for a production build served over HTTP(S).
 * When a new version is waiting, the caller is notified so the interface can
 * offer an explicit update instead of reloading under the user's hands.
 */
export type UpdateHandler = (applyUpdate: () => void) => void

export function registerServiceWorker(onUpdateReady: UpdateHandler): void {
  if (!('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return

  // Derived from the Vite base, so the worker path and scope always match the
  // directory the application is actually deployed in (/SYDERA/ in production,
  // the same base during development and preview).
  const base = import.meta.env.BASE_URL

  const register = (): void => {
    void navigator.serviceWorker
      .register(new URL(`${base}sw.js`, location.origin).href, { scope: base })
      .then((registration) => {
        const notifyIfWaiting = (worker: ServiceWorker | null): void => {
          if (!worker) return
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            onUpdateReady(() => worker.postMessage({ type: 'SYDERA_SKIP_WAITING' }))
          }
        }

        notifyIfWaiting(registration.waiting)
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing
          installing?.addEventListener('statechange', () => notifyIfWaiting(installing))
        })
      })
      .catch(() => {
        // Offline support is an enhancement: failing to register must never
        // prevent the application from working.
      })
  }

  // The load event may already have fired by the time React mounts, so
  // registering only from the listener would silently skip the worker.
  if (document.readyState === 'complete') {
    register()
  } else {
    window.addEventListener('load', register, { once: true })
  }

  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    location.reload()
  })
}
