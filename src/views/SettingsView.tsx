import { useState } from 'react'
import { it } from '../content/it.ts'
import { paths } from '../app/router.ts'
import { ConfirmDialog } from '../components/ConfirmDialog.tsx'
import { deleteAllLocalData } from '../core/storage/wipe.ts'
import type { Preferences, ThemePreference } from '../core/prefs/preferences.ts'
import type { HouseSystemId } from '../core/astrology/types.ts'

interface SettingsViewProps {
  readonly preferences: Preferences
  readonly onPreferencesChange: (preferences: Preferences) => void
  readonly hasSydera: boolean
  readonly houseSystem: HouseSystemId
  readonly onHouseSystemChange: (system: HouseSystemId) => void
  readonly onDataDeleted: () => void
}

type DeletionState = 'idle' | 'confirming' | 'working' | 'blocked' | 'error'

const THEMES: ReadonlyArray<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: it.theme.system },
  { value: 'light', label: it.theme.light },
  { value: 'dark', label: it.theme.dark },
]

const HOUSE_SYSTEMS: readonly HouseSystemId[] = ['whole-sign', 'equal', 'placidus']

export function SettingsView({
  preferences,
  onPreferencesChange,
  hasSydera,
  houseSystem,
  onHouseSystemChange,
  onDataDeleted,
}: SettingsViewProps) {
  const [deletion, setDeletion] = useState<DeletionState>('idle')

  const wipe = async (): Promise<void> => {
    setDeletion('working')
    try {
      const report = await deleteAllLocalData()
      if (report.status === 'blocked') {
        setDeletion('blocked')
        return
      }
      setDeletion('idle')
      onDataDeleted()
    } catch {
      setDeletion('error')
    }
  }

  return (
    <>
      <h1 className="page-title">{it.settings.title}</h1>

      <section className="card" aria-labelledby="settings-appearance">
        <h2 className="section-title" id="settings-appearance">
          {it.settings.appearance}
        </h2>
        <div className="field">
          <span className="field__label" id="theme-label">
            {it.theme.label}
          </span>
          <div className="segmented" role="group" aria-labelledby="theme-label">
            {THEMES.map((option) => (
              <button
                key={option.value}
                type="button"
                className="segmented__option"
                aria-pressed={preferences.theme === option.value}
                onClick={() => onPreferencesChange({ ...preferences, theme: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card" aria-labelledby="settings-method">
        <h2 className="section-title" id="settings-method">
          {it.settings.method}
        </h2>
        <p className="muted small">{it.settings.methodBody}</p>
        <div className="field">
          <span className="field__label" id="house-label">
            {it.settings.houseSystem}
          </span>
          <div className="segmented" role="group" aria-labelledby="house-label">
            {HOUSE_SYSTEMS.map((system) => (
              <button
                key={system}
                type="button"
                className="segmented__option"
                aria-pressed={houseSystem === system}
                disabled={!hasSydera}
                onClick={() => onHouseSystemChange(system)}
              >
                {it.astrology.houseSystemNames[system]}
              </button>
            ))}
          </div>
          <p className="field__help">{it.settings.houseSystemHelp}</p>
        </div>
      </section>

      <section className="card" aria-labelledby="settings-data">
        <h2 className="section-title" id="settings-data">
          {it.settings.data}
        </h2>
        <p className="muted">{it.settings.dataBody}</p>
        <dl className="definition-list">
          <dt>{it.settings.stored}</dt>
          <dd>{hasSydera ? it.settings.storedYes : it.settings.storedNo}</dd>
        </dl>
        {deletion === 'blocked' ? (
          <div className="notice notice--warning" role="alert">
            <strong>{it.settings.deleteAllBlockedTitle}</strong>
            <p>{it.settings.deleteAllBlockedBody}</p>
          </div>
        ) : null}
        {deletion === 'error' ? (
          <div className="notice notice--danger" role="alert">
            <strong>{it.settings.deleteAllErrorTitle}</strong>
            <p>{it.settings.deleteAllErrorBody}</p>
          </div>
        ) : null}
        <div className="row">
          <button
            type="button"
            className="button button--danger"
            disabled={deletion === 'working'}
            onClick={() => setDeletion('confirming')}
          >
            {deletion === 'working'
              ? it.settings.deleteAllWorking
              : deletion === 'blocked' || deletion === 'error'
                ? it.settings.deleteAllRetry
                : it.settings.deleteAll}
          </button>
        </div>
      </section>

      <section className="card card--quiet" aria-labelledby="settings-documents">
        <h2 className="section-title" id="settings-documents">
          {it.settings.documents}
        </h2>
        <div className="row">
          <a className="button" href={paths.privacy}>
            {it.settings.reviewPrivacy}
          </a>
          <a className="button" href={paths.disclaimer}>
            {it.settings.reviewDisclaimer}
          </a>
          <a className="button" href={paths.about}>
            {it.nav.about}
          </a>
        </div>
      </section>

      {deletion === 'confirming' ? (
        <ConfirmDialog
          title={it.settings.deleteAllTitle}
          body={it.settings.deleteAllBody}
          confirmLabel={it.settings.deleteAllConfirm}
          tone="danger"
          onConfirm={() => {
            void wipe()
          }}
          onCancel={() => setDeletion('idle')}
        />
      ) : null}
    </>
  )
}
