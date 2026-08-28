import { useState } from 'react'
import { it } from '../content/it.ts'
import { paths } from '../app/router.ts'
import { ConfirmDialog } from '../components/ConfirmDialog.tsx'
import { deleteProfile } from '../core/storage/profiles.ts'
import type { ProfilesState } from '../app/useProfiles.ts'
import type { StoredProfile } from '../core/storage/types.ts'

interface ProfilesViewProps {
  readonly profiles: ProfilesState
  readonly onChanged: () => void
}

export function ProfilesView({ profiles, onChanged }: ProfilesViewProps) {
  const [pendingDeletion, setPendingDeletion] = useState<StoredProfile | null>(null)

  const confirmDeletion = async (): Promise<void> => {
    if (!pendingDeletion) return
    await deleteProfile(pendingDeletion.id)
    setPendingDeletion(null)
    onChanged()
  }

  return (
    <>
      <div className="stack stack--tight">
        <h1 className="page-title">{it.profiles.title}</h1>
        <p className="page-intro">{it.profiles.subtitle}</p>
      </div>

      <div className="row">
        <a className="button button--primary" href={paths.profileNew}>
          {it.profiles.create}
        </a>
      </div>

      {profiles.status === 'loading' ? <p className="muted">{it.common.loading}</p> : null}
      {profiles.status === 'unavailable' ? <p className="notice notice--warning">{it.common.storageUnavailable}</p> : null}
      {profiles.status === 'error' ? <p className="notice notice--danger">{profiles.message}</p> : null}

      {profiles.status === 'ready' && profiles.profiles.length === 0 ? (
        <p className="muted">{it.profiles.empty}</p>
      ) : null}

      {profiles.status === 'ready' && profiles.profiles.length > 0 ? (
        <ul className="list-plain">
          {profiles.profiles.map((profile) => (
            <li className="card" key={profile.id}>
              <h2 className="section-title">{profile.label}</h2>
              <dl className="definition-list small">
                <dt>{it.profileForm.dateField}</dt>
                <dd>{formatDate(profile)}</dd>
                <dt>{it.profileForm.timeField}</dt>
                <dd>{formatTime(profile)}</dd>
                <dt>{it.profiles.createdAt}</dt>
                <dd>{formatTimestamp(profile.createdAt)}</dd>
              </dl>
              <div className="row">
                <a className="button button--primary" href={paths.analysis(profile.id)}>
                  {it.profiles.open}
                </a>
                <button type="button" className="button button--danger" onClick={() => setPendingDeletion(profile)}>
                  {it.profiles.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {pendingDeletion ? (
        <ConfirmDialog
          title={it.profiles.deleteConfirmTitle}
          body={`${pendingDeletion.label} — ${it.profiles.deleteConfirmBody}`}
          confirmLabel={it.profiles.confirmDelete}
          tone="danger"
          onConfirm={() => {
            void confirmDeletion()
          }}
          onCancel={() => setPendingDeletion(null)}
        />
      ) : null}
    </>
  )
}

function formatDate(profile: StoredProfile): string {
  const { year, month, day } = profile.birthDate
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

function formatTime(profile: StoredProfile): string {
  if (!profile.birthTimeKnown || !profile.birthTime) return it.profiles.unknownTime
  return `${String(profile.birthTime.hour).padStart(2, '0')}:${String(profile.birthTime.minute).padStart(2, '0')}`
}

function formatTimestamp(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('it-IT')
}
