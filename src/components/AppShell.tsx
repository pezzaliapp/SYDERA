import { useEffect, useRef, type ReactNode } from 'react'
import { it } from '../content/it.ts'
import { release } from '../app/release.ts'
import { paths, type Route } from '../app/router.ts'

interface AppShellProps {
  readonly route: Route
  readonly children: ReactNode
  /** Chrome is hidden on the entry and returning screens, which are the whole app there. */
  readonly bare: boolean
}

const SECONDARY = [
  { path: paths.privacy, label: it.nav.privacy, match: 'privacy' },
  { path: paths.disclaimer, label: it.nav.disclaimer, match: 'disclaimer' },
  { path: paths.about, label: it.nav.about, match: 'about' },
  { path: paths.settings, label: it.nav.settings, match: 'settings' },
] as const

export function AppShell({ route, children, bare }: AppShellProps) {
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus()
    window.scrollTo({ top: 0 })
  }, [route])

  if (bare) {
    return (
      <div className="app app--bare">
        <main className="main main--bare" id="main" ref={mainRef} tabIndex={-1}>
          {children}
        </main>
        {/* Which build is running has to be answerable on every screen,
            including the one a new user sees first. */}
        <footer className="app-footer app-footer--bare">
          <p className="footer__release small">{release.label}</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {it.nav.skipToContent}
      </a>

      <header className="app-header">
        <a className="brand" href={paths.result}>
          <span className="brand__name">{it.app.name}</span>
          <span className="brand__tagline">{it.app.subtitle}</span>
        </a>
        <nav className="app-header__nav" aria-label={it.nav.secondaryLabel}>
          <a className="button button--quiet small" href={paths.data}>
            {it.nav.data}
          </a>
          <a className="button button--quiet small" href={paths.settings}>
            {it.nav.settings}
          </a>
        </nav>
      </header>


      <main className="main" id="main" ref={mainRef} tabIndex={-1}>
        {children}
      </main>

      <footer className="app-footer">
        <nav aria-label={it.nav.secondaryLabel}>
          <ul className="footer__list">
            {SECONDARY.map((item) => (
              <li key={item.path}>
                <a
                  className="footer__link"
                  href={item.path}
                  {...(route.name === item.match ? { 'aria-current': 'page' as const } : {})}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer__note small">{it.app.localNotice}</p>
        <p className="footer__release small">{release.label}</p>
      </footer>
    </div>
  )
}
