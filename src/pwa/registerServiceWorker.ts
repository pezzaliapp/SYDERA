/**
 * Service worker registration and update flow.
 *
 * The worker takes over as soon as it installs, and the page reloads once when
 * it does. The previous design put a new release behind a banner the user had
 * to notice and accept; a device that never accepted it went on running an old
 * application, and — worse — an old copy of data served at an unchanging URL.
 *
 * The worker is only registered for a production build served over HTTP(S).
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return

  // Derived from the Vite base, so the worker path and scope always match the
  // directory the application is actually deployed in.
  const base = import.meta.env.BASE_URL

  // The worker script is registered under the build it belongs to.
  //
  // The host serves sw.js with a four-hour cache, and a content delivery
  // network answered an update check with the previous release's worker: a
  // device stayed on the old application for hours after a deployment, which
  // is exactly what the automatic update is supposed to prevent. A URL the
  // edge has never seen cannot be answered from its cache. The scope is set
  // explicitly below, so it stays the application directory regardless.
  const script = new URL(`${base}sw.js?build=${__SYDERA_COMMIT__}`, location.origin).href

  // Whether this page was already under a worker's control. On the very first
  // visit the worker claims the page and the controller changes for the first
  // time; reloading then would be a reload nobody asked for.
  const hadController = navigator.serviceWorker.controller !== null

  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    location.reload()
  })

  const register = (): void => {
    void navigator.serviceWorker
      .register(script, { scope: base })
      .then((registration) => {
        const check = (): void => {
          if (!navigator.onLine) return
          void registration.update().catch(() => {
            // A failed check is not a problem: the next one will do.
          })
        }

        // At startup, whenever the app comes back to the foreground, and as
        // soon as the network returns — the three moments a phone actually
        // gives an installed application to notice a new release.
        check()
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') check()
        })
        window.addEventListener('focus', check)
        window.addEventListener('online', check)
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
}
