import { useState, type FormEvent } from 'react'
import { it } from '../content/it.ts'
import { paths, useNavigate } from '../app/router.ts'
import { createProfile } from '../core/storage/profiles.ts'
import { isValidBirthDate, MAX_YEAR, MIN_YEAR } from '../core/numerology/dateNumbers.ts'
import type { NewProfile } from '../core/storage/types.ts'

interface FormErrors {
  label?: string
  fullBirthName?: string
  birthDate?: string
  birthTime?: string
}

/**
 * Profile creation.
 *
 * Only the fields required by the calculations are requested, and the form
 * states plainly where the data is stored before anything is saved.
 */
export function ProfileFormView({ onCreated }: { readonly onCreated: () => void }) {
  const navigate = useNavigate()
  const [label, setLabel] = useState('')
  const [fullBirthName, setFullBirthName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTimeKnown, setBirthTimeKnown] = useState(false)
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const nextErrors: FormErrors = {}

    if (label.trim() === '') nextErrors.label = it.profileForm.requiredLabel
    if (fullBirthName.trim() === '') nextErrors.fullBirthName = it.profileForm.requiredName

    const parsedDate = parseDateInput(birthDate)
    if (!parsedDate) {
      nextErrors.birthDate = birthDate === '' ? it.profileForm.requiredDate : it.profileForm.invalidDate
    } else if (!isValidBirthDate(parsedDate)) {
      nextErrors.birthDate = it.profileForm.invalidDate
    } else if (parsedDate.year < MIN_YEAR || parsedDate.year > MAX_YEAR) {
      nextErrors.birthDate = it.profileForm.outOfRangeDate
    }

    const parsedTime = birthTimeKnown ? parseTimeInput(birthTime) : null
    if (birthTimeKnown && !parsedTime) nextErrors.birthTime = it.profileForm.invalidTime

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !parsedDate) return

    const record: NewProfile = {
      label: label.trim(),
      fullBirthName: fullBirthName.trim(),
      birthDate: parsedDate,
      birthTimeKnown,
      birthTime: parsedTime,
      birthPlace: birthPlace.trim() === '' ? null : { label: birthPlace.trim() },
    }

    setSaving(true)
    setSaveError(null)
    try {
      const profile = await createProfile(record, new Date().toISOString())
      onCreated()
      navigate(paths.analysis(profile.id))
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="stack stack--tight">
        <h1 className="page-title">{it.profileForm.title}</h1>
        <p className="page-intro">{it.profileForm.subtitle}</p>
      </div>

      <form
        className="card"
        noValidate
        onSubmit={(event) => {
          void submit(event)
        }}
      >
        <Field
          id="label"
          label={it.profileForm.labelField}
          help={it.profileForm.labelHelp}
          error={errors.label}
          value={label}
          onChange={setLabel}
          autoComplete="off"
        />

        <Field
          id="fullBirthName"
          label={it.profileForm.nameField}
          help={it.profileForm.nameHelp}
          error={errors.fullBirthName}
          value={fullBirthName}
          onChange={setFullBirthName}
          autoComplete="off"
        />

        <div className="field">
          <label className="field__label" htmlFor="birthDate">
            {it.profileForm.dateField}
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            min={`${MIN_YEAR}-01-01`}
            max={`${MAX_YEAR}-12-31`}
            aria-describedby="birthDate-help"
            {...(errors.birthDate ? { 'aria-invalid': true } : {})}
            onChange={(event) => setBirthDate(event.target.value)}
          />
          <p className="field__help" id="birthDate-help">
            {it.profileForm.dateHelp}
          </p>
          {errors.birthDate ? (
            <p className="field__error" role="alert">
              {errors.birthDate}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={birthTimeKnown}
              onChange={(event) => setBirthTimeKnown(event.target.checked)}
            />
            <span>{it.profileForm.timeKnownField}</span>
          </label>
        </div>

        {birthTimeKnown ? (
          <div className="field">
            <label className="field__label" htmlFor="birthTime">
              {it.profileForm.timeField}
            </label>
            <input
              id="birthTime"
              type="time"
              value={birthTime}
              aria-describedby="birthTime-help"
              onChange={(event) => setBirthTime(event.target.value)}
            />
            <p className="field__help" id="birthTime-help">
              {it.profileForm.timeHelp}
            </p>
            {errors.birthTime ? (
              <p className="field__error" role="alert">
                {errors.birthTime}
              </p>
            ) : null}
          </div>
        ) : null}

        <Field
          id="birthPlace"
          label={it.profileForm.placeField}
          help={it.profileForm.placeHelp}
          value={birthPlace}
          onChange={setBirthPlace}
          autoComplete="off"
        />

        <p className="notice small">{it.profileForm.privacyReminder}</p>

        {saveError ? (
          <p className="notice notice--danger" role="alert">
            {saveError}
          </p>
        ) : null}

        <div className="row">
          <button type="submit" className="button button--primary" disabled={saving}>
            {it.profileForm.save}
          </button>
          <a className="button" href={paths.profiles}>
            {it.profileForm.cancel}
          </a>
        </div>
      </form>
    </>
  )
}

interface FieldProps {
  readonly id: string
  readonly label: string
  readonly help: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly error?: string | undefined
  readonly autoComplete?: string
}

function Field({ id, label, help, value, onChange, error, autoComplete }: FieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        autoComplete={autoComplete ?? 'off'}
        aria-describedby={`${id}-help`}
        {...(error ? { 'aria-invalid': true } : {})}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="field__help" id={`${id}-help`}>
        {help}
      </p>
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function parseDateInput(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  return { year: Number(year), month: Number(month), day: Number(day) }
}

export function parseTimeInput(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}
