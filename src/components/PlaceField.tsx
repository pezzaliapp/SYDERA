import { useEffect, useState } from 'react'
import { it } from '../content/it.ts'
import type { Place } from '../core/places/dataset.ts'
import { searchPlacesAsync } from '../core/places/client.ts'
import { placeRegion, type PlaceMatch } from '../core/places/search.ts'
import { isValidTimeZone } from '../core/time/timezone.ts'

interface PlaceFieldProps {
  readonly value: Place | null
  readonly onChange: (place: Place | null) => void
  readonly error?: string | undefined
}

type DatasetState = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Birth place selection.
 *
 * The place list is a static file served from the same address as the
 * application, downloaded once on first use; the search itself runs entirely
 * here, so nothing typed in this field ever leaves the device. Manual
 * coordinates stay available for places the list does not contain.
 */
export function PlaceField({ value, onChange, error }: PlaceFieldProps) {
  const [query, setQuery] = useState('')
  const [dataset, setDataset] = useState<DatasetState>('idle')
  const [results, setResults] = useState<readonly PlaceMatch[]>([])
  const [manual, setManual] = useState(false)
  const [manualPlace, setManualPlace] = useState({ label: '', latitude: '', longitude: '', timeZoneId: '' })
  const [manualError, setManualError] = useState<string | null>(null)

  // The search runs in a worker, so a keystroke never waits for the datasets
  // to be parsed. Only the newest answer is shown.
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }
    let current = true
    setDataset((state) => (state === 'ready' ? state : 'loading'))
    searchPlacesAsync(import.meta.env.BASE_URL, trimmed)
      .then((outcome) => {
        if (!current) return
        setResults(outcome.matches)
        setDataset('ready')
      })
      .catch(() => {
        if (current) setDataset('error')
      })
    return () => {
      current = false
    }
  }, [query])

  if (value) {
    return (
      <div className="field">
        <span className="field__label">{it.entry.placeLabel}</span>
        <div className="chosen">
          <span className="chosen__mark" aria-hidden="true">
            ✓
          </span>
          <span className="chosen__body">
            <span className="chosen__state">{it.entry.placeConfirmed}</span>
            <strong className="chosen__name">
              {value.name}
              {placeRegion(value) ? ` · ${placeRegion(value)}` : ''}
            </strong>
            <span className="chosen__zone">{value.timeZoneId}</span>
          </span>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => {
              onChange(null)
              setQuery('')
              setManual(false)
            }}
          >
            {it.entry.placeChange}
          </button>
        </div>
      </div>
    )
  }

  if (manual) {
    return (
      <div className="field">
        <span className="field__label">{it.entry.placeManual}</span>
        <label className="field__help" htmlFor="manual-label">
          {it.entry.placeManualLabel}
        </label>
        <input
          id="manual-label"
          type="text"
          autoComplete="off"
          value={manualPlace.label}
          onChange={(event) => setManualPlace({ ...manualPlace, label: event.target.value })}
        />
        <label className="field__help" htmlFor="manual-lat">
          {it.entry.latitudeLabel}
        </label>
        <input
          id="manual-lat"
          type="text"
          autoComplete="off"
          inputMode="decimal"
          value={manualPlace.latitude}
          onChange={(event) => setManualPlace({ ...manualPlace, latitude: event.target.value })}
        />
        <label className="field__help" htmlFor="manual-lon">
          {it.entry.longitudeLabel}
        </label>
        <input
          id="manual-lon"
          type="text"
          autoComplete="off"
          inputMode="decimal"
          value={manualPlace.longitude}
          onChange={(event) => setManualPlace({ ...manualPlace, longitude: event.target.value })}
        />
        <label className="field__help" htmlFor="manual-zone">
          {it.entry.zoneLabel}
        </label>
        <input
          id="manual-zone"
          type="text"
          autoComplete="off"
          value={manualPlace.timeZoneId}
          placeholder="Europe/Rome"
          onChange={(event) => setManualPlace({ ...manualPlace, timeZoneId: event.target.value })}
        />
        <p className="field__help">{it.entry.zoneHelp}</p>
        {manualError ? (
          <p className="field__error" role="alert">
            {manualError}
          </p>
        ) : null}
        <div className="row">
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              const latitude = Number(manualPlace.latitude.replace(',', '.'))
              const longitude = Number(manualPlace.longitude.replace(',', '.'))
              if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
                setManualError(it.entry.errors.latitude)
                return
              }
              if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
                setManualError(it.entry.errors.longitude)
                return
              }
              if (!isValidTimeZone(manualPlace.timeZoneId.trim())) {
                setManualError(it.entry.errors.zone)
                return
              }
              setManualError(null)
              onChange({
                name: manualPlace.label.trim() || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
                aliases: [],
                countryCode: '',
                region: '',
                province: '',
                latitude,
                longitude,
                timeZoneId: manualPlace.timeZoneId.trim(),
                population: 0,
                haystack: '',
                folded: '',
                aliasKeys: '',
              })
            }}
          >
            {it.entry.manualConfirm}
          </button>
          <button type="button" className="button" onClick={() => setManual(false)}>
            {it.entry.cancel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor="place">
        {it.entry.placeLabel}
      </label>
      <input
        id="place"
        type="text"
        value={query}
        autoComplete="off"
        aria-describedby="place-help"
        {...(error ? { 'aria-invalid': true } : {})}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p className="field__help" id="place-help">
        {it.entry.placeHelp}
      </p>

      {dataset === 'loading' ? <p className="small muted">{it.entry.placeLoading}</p> : null}
      {dataset === 'error' ? <p className="notice notice--warning small">{it.entry.placeLoadError}</p> : null}

      {results.length > 0 ? (
        <div className="results">
          <p className="results__hint" id="place-results-hint">
            {it.entry.placeChooseHint}
          </p>
          <ul className="suggestions" aria-label={it.entry.placeResultsTitle}>
            {results.map((match) => (
              <li key={`${match.place.name}-${match.place.latitude}-${match.place.longitude}`}>
                <button
                  type="button"
                  className="suggestion"
                  aria-describedby="place-results-hint"
                  onClick={() => onChange(match.place)}
                >
                  <span className="suggestion__text">
                    <span className="suggestion__name">{match.place.name}</span>
                    <span className="suggestion__where">
                      {placeRegion(match.place) || match.place.timeZoneId}
                    </span>
                  </span>
                  <span className="suggestion__pick" aria-hidden="true">
                    {it.entry.placeChoose}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dataset === 'ready' && query.trim().length >= 2 && results.length === 0 ? (
        <p className="small muted">{it.entry.placeNoResults}</p>
      ) : null}

      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}

      <div>
        <button type="button" className="button button--quiet small" onClick={() => setManual(true)}>
          {it.entry.placeManual}
        </button>
      </div>
    </div>
  )
}
