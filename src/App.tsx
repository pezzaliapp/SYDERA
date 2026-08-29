import { useCallback, useEffect, useState } from 'react'
import { AppShell } from './components/AppShell.tsx'
import { paths, useRoute } from './app/router.ts'
import { useTheme } from './app/useTheme.ts'
import { useSydera } from './app/useSydera.ts'
import { buildAnalysis } from './app/useAnalysis.ts'
import { registerServiceWorker } from './pwa/registerServiceWorker.ts'
import {
  DEFAULT_PREFERENCES,
  DISCLAIMER_VERSION,
  isDisclaimerCurrent,
  loadPreferences,
  savePreferences,
  type Preferences,
} from './core/prefs/preferences.ts'
import { saveSydera } from './core/storage/sydera.ts'
import { aboutDocument, disclaimerDocument, it, privacyDocument } from './content/it.ts'
import { EntryView } from './views/EntryView.tsx'
import { ReturningView } from './views/ReturningView.tsx'
import { ResultView } from './views/ResultView.tsx'
import { DocumentView } from './views/DocumentView.tsx'
import { SettingsView } from './views/SettingsView.tsx'
import { DataDeletedView } from './views/DataDeletedView.tsx'
import { NotFoundView } from './views/NotFoundView.tsx'
import type { HouseSystemId } from './core/astrology/types.ts'

export function App() {
  const route = useRoute()
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)
  const [dataDeleted, setDataDeleted] = useState(false)
  const { state: sydera, reload } = useSydera()

  useEffect(() => {
    setPreferences(loadPreferences())
    setPreferencesLoaded(true)
  }, [])

  useEffect(() => {
    registerServiceWorker()
  }, [])

  useTheme(preferences.theme)

  const updatePreferences = useCallback((next: Preferences) => {
    setPreferences(next)
    savePreferences(next)
  }, [])

  const acknowledge = useCallback(() => {
    updatePreferences({ ...loadPreferences(), disclaimerAcknowledged: DISCLAIMER_VERSION, introductionCompleted: true })
  }, [updatePreferences])

  const stored = sydera.status === 'ready' ? sydera.sydera : null

  const changeHouseSystem = useCallback(
    (system: HouseSystemId) => {
      if (!stored) return
      void saveSydera({ ...stored.input, houseSystem: system }, new Date().toISOString(), stored).then(reload)
    },
    [stored, reload],
  )

  if (!preferencesLoaded || sydera.status === 'loading') return null

  if (dataDeleted) {
    return (
      <DataDeletedView
        onContinue={() => {
          setDataDeleted(false)
          setPreferences(DEFAULT_PREFERENCES)
          reload()
        }}
      />
    )
  }

  const acknowledged = isDisclaimerCurrent(preferences)
  // The reference date belongs to the interface: every engine receives it as
  // an explicit input and stays deterministic.
  const analysis = stored ? buildAnalysis(stored, Date.now()) : null
  const currentYear = new Date().getFullYear()

  const bare = route.name === 'start' || route.name === 'data'

  const content = (() => {
    switch (route.name) {
      case 'start':
        return stored ? (
          <ReturningView sydera={stored} />
        ) : (
          <EntryView
            existing={null}
            acknowledged={acknowledged}
            onAcknowledge={acknowledge}
            onSaved={reload}
            currentYear={currentYear}
          />
        )
      case 'data':
        return (
          <EntryView
            existing={stored}
            acknowledged={acknowledged}
            onAcknowledge={acknowledge}
            onSaved={reload}
            currentYear={currentYear}
          />
        )
      case 'result':
        if (!stored || !analysis) {
          return (
            <section className="card">
              <h1 className="page-title">{it.app.name}</h1>
              <p className="muted">{it.sintesi.missingAstrology}</p>
              <div className="row">
                <a className="button button--primary" href={paths.start}>
                  {it.sintesi.completeData}
                </a>
              </div>
            </section>
          )
        }
        return <ResultView section={route.section} analysis={analysis} sydera={stored} />
      case 'privacy':
        return <DocumentView document={privacyDocument} />
      case 'disclaimer':
        return <DocumentView document={disclaimerDocument} />
      case 'about':
        return <DocumentView document={aboutDocument} showRelease />
      case 'settings':
        return (
          <SettingsView
            preferences={preferences}
            onPreferencesChange={updatePreferences}
            hasSydera={stored !== null}
            houseSystem={stored?.input.houseSystem ?? 'whole-sign'}
            onHouseSystemChange={changeHouseSystem}
            onDataDeleted={() => setDataDeleted(true)}
          />
        )
      default:
        return <NotFoundView path={route.path} />
    }
  })()

  return (
    <AppShell
      route={route}
      bare={bare}
    >
      {content}
    </AppShell>
  )
}
