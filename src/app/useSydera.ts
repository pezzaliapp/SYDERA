import { useCallback, useEffect, useState } from 'react'
import { isStorageAvailable } from '../core/storage/db.ts'
import { loadSydera, type StoredSydera } from '../core/storage/sydera.ts'

export type SyderaState =
  | { readonly status: 'loading' }
  | { readonly status: 'empty' }
  | { readonly status: 'ready'; readonly sydera: StoredSydera }
  | { readonly status: 'unavailable' }
  | { readonly status: 'error'; readonly message: string }

/** The single stored analysis, or its absence. */
export function useSydera(): { state: SyderaState; reload: () => void } {
  const [state, setState] = useState<SyderaState>({ status: 'loading' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!isStorageAvailable()) {
      setState({ status: 'unavailable' })
      return
    }
    setState({ status: 'loading' })
    loadSydera()
      .then((sydera) => {
        if (cancelled) return
        setState(sydera ? { status: 'ready', sydera } : { status: 'empty' })
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
