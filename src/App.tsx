import { useCallback, useEffect, useState } from 'react'
import { AppShell } from './components/AppShell.tsx'
import { useRoute } from './app/router.ts'
import { useTheme } from './app/useTheme.ts'
import { useProfiles } from './app/useProfiles.ts'
import { registerServiceWorker } from './pwa/registerServiceWorker.ts'
import {
  DEFAULT_PREFERENCES,
  DISCLAIMER_VERSION,
  isDisclaimerCurrent,
  loadPreferences,
  savePreferences,
  type Preferences,
} from './core/prefs/preferences.ts'
import { aboutDocument, disclaimerDocument, privacyDocument } from './content/it.ts'
import { HomeView } from './views/HomeView.tsx'
import { ProfilesView } from './views/ProfilesView.tsx'
import { ProfileFormView } from './views/ProfileFormView.tsx'
import { AnalysisView } from './views/AnalysisView.tsx'
import { DocumentView } from './views/DocumentView.tsx'
import { SettingsView } from './views/SettingsView.tsx'
import { OnboardingView } from './views/OnboardingView.tsx'
import { DataDeletedView } from './views/DataDeletedView.tsx'
import { NotFoundView } from './views/NotFoundView.tsx'

export function App() {
  const route = useRoute()
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null)
  const [dataDeleted, setDataDeleted] = useState(false)
  const { state: profiles, reload } = useProfiles()

  useEffect(() => {
    setPreferences(loadPreferences())
    setPreferencesLoaded(true)
  }, [])

  useEffect(() => {
    registerServiceWorker((apply) => setApplyUpdate(() => apply))
  }, [])

  useTheme(preferences.theme)

  const updatePreferences = useCallback((next: Preferences) => {
    setPreferences(next)
    savePreferences(next)
  }, [])

  const completeOnboarding = useCallback(() => {
    updatePreferences({
      ...loadPreferences(),
      introductionCompleted: true,
      disclaimerAcknowledged: DISCLAIMER_VERSION,
    })
  }, [updatePreferences])

  if (!preferencesLoaded) return null

  // After a successful deletion the application does not jump straight back to
  // the introduction: the user first sees an explicit confirmation of what was
  // removed, and only "Continua" resets SYDERA to its initial state.
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

  // The introduction, including the explicit disclaimer acknowledgement, must
  // precede any personal analysis.
  if (!preferences.introductionCompleted || !isDisclaimerCurrent(preferences)) {
    return <OnboardingView onComplete={completeOnboarding} />
  }

  return (
    <AppShell
      route={route}
      updateAvailable={applyUpdate !== null}
      onApplyUpdate={() => {
        applyUpdate?.()
        setApplyUpdate(null)
      }}
    >
      {route.name === 'home' ? <HomeView profiles={profiles} /> : null}
      {route.name === 'profiles' ? <ProfilesView profiles={profiles} onChanged={reload} /> : null}
      {route.name === 'profile-new' ? <ProfileFormView onCreated={reload} /> : null}
      {route.name === 'analysis' ? <AnalysisView profileId={route.profileId} /> : null}
      {route.name === 'privacy' ? <DocumentView document={privacyDocument} /> : null}
      {route.name === 'disclaimer' ? <DocumentView document={disclaimerDocument} /> : null}
      {route.name === 'about' ? <DocumentView document={aboutDocument} /> : null}
      {route.name === 'settings' ? (
        <SettingsView
          preferences={preferences}
          onPreferencesChange={updatePreferences}
          profiles={profiles}
          onDataDeleted={() => setDataDeleted(true)}
        />
      ) : null}
      {route.name === 'not-found' ? <NotFoundView path={route.path} /> : null}
    </AppShell>
  )
}
