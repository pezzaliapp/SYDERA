import { useEffect, useRef, type ReactNode } from 'react'
import { it } from '../content/it.ts'
import { paths, type Route } from '../app/router.ts'

interface AppShellProps {
  readonly route: Route
  readonly children: ReactNode
  readonly updateAvailable: boolean
  readonly onApplyUpdate: () => void
}

const NAV_ITEMS = [
  { path: paths.home, label: it.nav.home, icon: '◎', match: ['home'] },
  { path: paths.profiles, label: it.nav.profiles, icon: '☰', match: ['profiles', 'profile-new', 'analysis'] },
  { path: paths.privacy, label: it.nav.privacy, icon: '⚿', match: ['privacy'] },
  { path: paths.disclaimer, label: it.nav.disclaimer, icon: '⚠', match: ['disclaimer'] },
  { path: paths.about, label: it.nav.about, icon: 'ⓘ', match: ['about'] },
  { path: paths.settings, label: it.nav.settings, icon: '⚙', match: ['settings'] },
] as const

export function AppShell({ route, children, updateAvailable, onApplyUpdate }: AppShellProps) {
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // Move focus to the main region on navigation so keyboard and screen-reader
  // users land on the new content instead of the top of the document.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus()
    window.scrollTo({ top: 0 })
  }, [route])

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {it.nav.skipToContent}
      </a>

      <header className="app-header">
        <div className="brand">
          <span className="brand__name">{it.app.name}</span>
          <span className="brand__tagline">{it.app.tagline}</span>
        </div>
      </header>

      {updateAvailable ? (
        <div className="banner" role="status">
          <span>{it.common.updateAvailable}</span>
          <button type="button" className="button button--quiet" onClick={onApplyUpdate}>
            {it.common.updateAction}
          </button>
        </div>
      ) : null}

      <div className="app-body">
        <nav className="nav" aria-label={it.nav.label}>
          <ul className="nav__list">
            {NAV_ITEMS.map((item) => {
              const current = (item.match as readonly string[]).includes(route.name)
              return (
                <li key={item.path}>
                  <a className="nav__link" href={item.path} {...(current ? { 'aria-current': 'page' as const } : {})}>
                    <span className="nav__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <main className="main" id="main" ref={mainRef} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
