import { useState, type FormEvent } from 'react'
import { it } from '../content/it.ts'
import { paths, useNavigate } from '../app/router.ts'
import { PlaceField } from '../components/PlaceField.tsx'
import { saveSydera, type StoredSydera, type SyderaInput } from '../core/storage/sydera.ts'
import { MAX_YEAR, MIN_YEAR, isValidBirthDate } from '../core/numerology/dateNumbers.ts'
import type { Place } from '../core/places/dataset.ts'

interface EntryViewProps {
  readonly existing: StoredSydera | null
  readonly acknowledged: boolean
  readonly onAcknowledge: () => void
  readonly onSaved: () => void
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

/**
 * The whole application before a calculation exists: four fields and one
 * button. The disclaimer acknowledgement is part of this screen on first use,
 * so the introduction never becomes a separate bureaucratic flow.
 */
export function EntryView({ existing, acknowledged, onAcknowledge, onSaved }: EntryViewProps) {
  const navigate = useNavigate()
  const input = existing?.input

  const [date, setDate] = useState(
    input ? `${String(input.birthDate.year).padStart(4, '0')}-${String(input.birthDate.month).padStart(2, '0')}-${String(input.birthDate.day).padStart(2, '0')}` : '',
  )
  const [timeKnown, setTimeKnown] = useState(input ? input.birthTime !== null : true)
  const [time, setTime] = useState(
    input?.birthTime ? `${String(input.birthTime.hour).padStart(2, '0')}:${String(input.birthTime.minute).padStart(2, '0')}` : '',
  )
  const [precision, setPrecision] = useState(input?.birthTimePrecisionMinutes ?? 1)
  const [place, setPlace] = useState<Place | null>(
    input?.place
      ? {
          name: input.place.label,
          asciiName: '',
          countryCode: '',
          admin1: '',
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

    const parsedDate = parseDate(date)
    if (!parsedDate) next.date = date === '' ? it.entry.errors.dateRequired : it.entry.errors.dateInvalid
    else if (!isValidBirthDate(parsedDate)) next.date = it.entry.errors.dateInvalid
    else if (parsedDate.year < MIN_YEAR || parsedDate.year > MAX_YEAR) next.date = it.entry.errors.dateRange

    const parsedTime = timeKnown ? parseTime(time) : null
    if (timeKnown && !parsedTime) next.time = time === '' ? it.entry.errors.timeRequired : it.entry.errors.timeInvalid
    if (timeKnown && !place) next.place = it.entry.errors.placeRequired
    if (!accepted) next.acknowledgement = it.intro.acknowledgeRequired

    setErrors(next)
    if (Object.keys(next).length > 0 || !parsedDate) return

    const record: SyderaInput = {
      fullBirthName: name.trim() === '' ? null : name.trim(),
      birthDate: parsedDate,
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
          <div className="field">
            <label className="field__label" htmlFor="birth-date">
              {it.entry.dateLabel}
            </label>
            <input
              id="birth-date"
              type="date"
              value={date}
              min={`${MIN_YEAR}-01-01`}
              max={`${MAX_YEAR}-12-31`}
              aria-describedby="birth-date-help"
              {...(errors.date ? { 'aria-invalid': true } : {})}
              onChange={(event) => setDate(event.target.value)}
            />
            <p className="field__help" id="birth-date-help">
              {it.entry.dateHelp}
            </p>
            {errors.date ? (
              <p className="field__error" role="alert">
                {errors.date}
              </p>
            ) : null}
          </div>

          {timeKnown ? (
            <div className="field">
              <label className="field__label" htmlFor="birth-time">
                {it.entry.timeLabel}
              </label>
              <input
                id="birth-time"
                type="time"
                value={time}
                aria-describedby="birth-time-help"
                {...(errors.time ? { 'aria-invalid': true } : {})}
                onChange={(event) => setTime(event.target.value)}
              />
              <p className="field__help" id="birth-time-help">
                {it.entry.timeHelp}
              </p>
              {errors.time ? (
                <p className="field__error" role="alert">
                  {errors.time}
                </p>
              ) : null}
            </div>
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
              <span className="field__label" id="precision-label">
                {it.entry.precisionLabel}
              </span>
              <div className="segmented" role="group" aria-labelledby="precision-label">
                {PRECISIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className="segmented__option"
                    aria-pressed={precision === option.minutes}
                    onClick={() => setPrecision(option.minutes)}
                  >
                    {it.entry.precisionOptions[option.key]}
                  </button>
                ))}
              </div>
              <p className="field__help">{it.entry.precisionHelp}</p>
            </div>
          ) : null}

          <PlaceField value={place} onChange={setPlace} error={errors.place} />

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

export function parseDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

export function parseTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}
