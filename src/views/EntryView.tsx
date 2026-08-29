import { useState, type FormEvent } from 'react'
import { it } from '../content/it.ts'
import { paths, useNavigate } from '../app/router.ts'
import { PlaceField } from '../components/PlaceField.tsx'
import { BirthDateField } from '../components/BirthDateField.tsx'
import { BirthTimeField } from '../components/BirthTimeField.tsx'
import { saveSydera, type StoredSydera, type SyderaInput } from '../core/storage/sydera.ts'
import {
  dateToParts,
  earliestYear,
  parseBirthDate,
  parseBirthTime,
  timeToParts,
  type BirthDateParts,
  type BirthTimeParts,
  type DateProblem,
  type TimeProblem,
} from '../app/birthInput.ts'
import type { Place } from '../core/places/dataset.ts'

interface EntryViewProps {
  readonly existing: StoredSydera | null
  readonly acknowledged: boolean
  readonly onAcknowledge: () => void
  readonly onSaved: () => void
  /** Supplied by the caller so the form stays deterministic in tests. */
  readonly currentYear: number
}

interface FormErrors {
  date?: string
  time?: string
  place?: string
  acknowledgement?: string
}

const PRECISIONS = [
  { minutes: 1, key: 'exact' },
  { minutes: 5, key: 'five' },
  { minutes: 15, key: 'fifteen' },
  { minutes: 60, key: 'hour' },
] as const

const PRECISION_VALUES = PRECISIONS.map((option) => option.minutes)

/**
 * The whole application before a calculation exists: four fields and one
 * button. The disclaimer acknowledgement is part of this screen on first use,
 * so the introduction never becomes a separate bureaucratic flow.
 */
export function EntryView({ existing, acknowledged, onAcknowledge, onSaved, currentYear }: EntryViewProps) {
  const navigate = useNavigate()
  const input = existing?.input

  const [date, setDate] = useState<BirthDateParts>(dateToParts(input?.birthDate ?? null))
  const [timeKnown, setTimeKnown] = useState(input ? input.birthTime !== null : true)
  const [time, setTime] = useState<BirthTimeParts>(timeToParts(input?.birthTime ?? null))
  const [precision, setPrecision] = useState(input?.birthTimePrecisionMinutes ?? 1)
  const [place, setPlace] = useState<Place | null>(
    input?.place
      ? {
          name: input.place.label,
          asciiName: '',
          countryCode: '',
          admin1: '',
          aliases: [],
          latitude: input.place.latitude,
          longitude: input.place.longitude,
          timeZoneId: input.place.timeZoneId,
        }
      : null,
  )
  const [name, setName] = useState(input?.fullBirthName ?? '')
  const [accepted, setAccepted] = useState(acknowledged)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const next: FormErrors = {}

    const dateResult = parseBirthDate(date, currentYear)
    if (!dateResult.ok) next.date = dateProblemMessage(dateResult.problem, currentYear)

    const timeResult = timeKnown ? parseBirthTime(time) : null
    if (timeResult && !timeResult.ok) next.time = timeProblemMessage(timeResult.problem)
    if (timeKnown && !place) next.place = it.entry.errors.placeRequired
    if (!accepted) next.acknowledgement = it.intro.acknowledgeRequired

    setErrors(next)
    if (Object.keys(next).length > 0 || !dateResult.ok) return
    const parsedTime = timeResult && timeResult.ok ? timeResult.time : null

    const record: SyderaInput = {
      fullBirthName: name.trim() === '' ? null : name.trim(),
      birthDate: dateResult.date,
      birthTime: parsedTime,
      birthTimePrecisionMinutes: timeKnown ? precision : 0,
      place: place
        ? { label: place.name, latitude: place.latitude, longitude: place.longitude, timeZoneId: place.timeZoneId }
        : null,
      houseSystem: input?.houseSystem ?? 'whole-sign',
      offsetOverrideMinutes: null,
    }

    setSaving(true)
    setSaveError(null)
    try {
      if (!acknowledged) onAcknowledge()
      await saveSydera(record, new Date().toISOString(), existing ?? undefined)
      onSaved()
      navigate(paths.result)
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="entry">
      <div className="entry__panel">
        <header className="entry__head">
          <h1 className="entry__title">{it.app.name}</h1>
          <p className="entry__subtitle">{it.app.subtitle}</p>
        </header>

        {!acknowledged ? <p className="entry__intro muted">{it.intro.what}</p> : null}

        <form
          className="card entry__form"
          noValidate
          onSubmit={(event) => {
            void submit(event)
          }}
        >
          <BirthDateField
            value={date}
            onChange={(next) => {
              setDate(next)
              // Stop showing an error while it is being corrected.
              if (errors.date) setErrors(({ date: _cleared, ...rest }) => rest)
            }}
            currentYear={currentYear}
            error={errors.date}
          />

          {timeKnown ? (
            <BirthTimeField
              value={time}
              onChange={(next) => {
                setTime(next)
                if (errors.time) setErrors(({ time: _cleared, ...rest }) => rest)
              }}
              error={errors.time}
            />
          ) : (
            <p className="notice notice--warning small">{it.entry.timeUnknownHelp}</p>
          )}

          <label className="checkbox">
            <input
              type="checkbox"
              checked={!timeKnown}
              onChange={(event) => setTimeKnown(!event.target.checked)}
            />
            <span>{it.entry.timeUnknown}</span>
          </label>

          {timeKnown ? (
            <div className="field">
              <label className="field__label" htmlFor="precision">
                {it.entry.precisionLabel}
              </label>
              <select
                id="precision"
                value={precision}
                aria-describedby="precision-help"
                onChange={(event) => setPrecision(Number(event.target.value))}
              >
                {PRECISIONS.map((option) => (
                  <option key={option.key} value={option.minutes}>
                    {it.entry.precisionOptions[option.key]}
                  </option>
                ))}
              </select>
              <p className="field__help" id="precision-help">
                {it.entry.precisionHelp}
              </p>
            </div>
          ) : null}

          <PlaceField
            value={place}
            onChange={(chosen) => {
              setPlace(chosen)
              if (chosen && errors.place) setErrors(({ place: _cleared, ...rest }) => rest)
            }}
            error={errors.place}
          />

          <div className="field">
            <label className="field__label" htmlFor="birth-name">
              {it.entry.nameLabel}
            </label>
            <input
              id="birth-name"
              type="text"
              value={name}
              autoComplete="off"
              aria-describedby="birth-name-help"
              onChange={(event) => setName(event.target.value)}
            />
            <p className="field__help" id="birth-name-help">
              {it.entry.nameHelp}
            </p>
          </div>

          {!acknowledged ? (
            <div className="field">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => {
                    setAccepted(event.target.checked)
                    if (event.target.checked) {
                      setErrors((current) => {
                        const { acknowledgement: _removed, ...rest } = current
                        return rest
                      })
                    }
                  }}
                />
                <span className="small">{it.intro.acknowledge}</span>
              </label>
              <div className="row">
                <a className="button button--quiet small" href={paths.disclaimer}>
                  {it.intro.readDisclaimer}
                </a>
                <a className="button button--quiet small" href={paths.privacy}>
                  {it.intro.readPrivacy}
                </a>
              </div>
              {errors.acknowledgement ? (
                <p className="field__error" role="alert">
                  {errors.acknowledgement}
                </p>
              ) : null}
            </div>
          ) : null}

          {saveError ? (
            <p className="notice notice--danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className="row">
            <button type="submit" className="button button--primary button--wide" disabled={saving}>
              {existing ? it.entry.submitEdit : it.entry.submit}
            </button>
            {existing ? (
              <a className="button" href={paths.result}>
                {it.entry.cancel}
              </a>
            ) : null}
          </div>

          <p className="entry__privacy small">{it.app.localNotice}</p>
        </form>
      </div>
    </div>
  )
}

function dateProblemMessage(problem: DateProblem, currentYear: number): string {
  switch (problem) {
    case 'empty':
      return it.entry.errors.dateRequired
    case 'incomplete':
      return it.entry.errors.dateIncomplete
    case 'day-range':
      return it.entry.errors.dayRange
    case 'month-range':
      return it.entry.errors.monthRange
    case 'year-range':
      return it.entry.errors.yearRange(earliestYear(currentYear), currentYear)
    default:
      return it.entry.errors.dateImpossible
  }
}

function timeProblemMessage(problem: TimeProblem): string {
  switch (problem) {
    case 'empty':
      return it.entry.errors.timeRequired
    case 'incomplete':
      return it.entry.errors.timeIncomplete
    case 'hour-range':
      return it.entry.errors.hourRange
    default:
      return it.entry.errors.minuteRange
  }
}

export { PRECISION_VALUES }
