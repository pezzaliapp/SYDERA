import { useCallback, useEffect, useState } from 'react'
import { listProfiles } from '../core/storage/profiles.ts'
import { isStorageAvailable } from '../core/storage/db.ts'
import type { StoredProfile } from '../core/storage/types.ts'

export type ProfilesState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly profiles: readonly StoredProfile[] }
  | { readonly status: 'unavailable' }
  | { readonly status: 'error'; readonly message: string }

export function useProfiles(): { state: ProfilesState; reload: () => void } {
  const [state, setState] = useState<ProfilesState>({ status: 'loading' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!isStorageAvailable()) {
      setState({ status: 'unavailable' })
      return
    }
    setState({ status: 'loading' })
    listProfiles()
      .then((profiles) => {
        if (!cancelled) setState({ status: 'ready', profiles })
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
      })
    return () => {
      cancelled = true
    }
  }, [revision])

  const reload = useCallback(() => setRevision((value) => value + 1), [])
  return { state, reload }
}
