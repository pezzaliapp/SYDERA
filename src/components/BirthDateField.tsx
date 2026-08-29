import { useRef } from 'react'
import { it } from '../content/it.ts'
import { earliestYear, sanitiseDigits, type BirthDateParts } from '../app/birthInput.ts'

interface BirthDateFieldProps {
  readonly value: BirthDateParts
  readonly onChange: (value: BirthDateParts) => void
  readonly currentYear: number
  readonly error?: string | undefined
}

/**
 * Birth date entry: three numbers, not a calendar.
 *
 * A birth date is normally decades in the past, and a native date picker opens
 * on today, which turns entering it into month-by-month navigation. Typing
 * three short numbers is faster on a phone and needs no navigation at all.
 * Each box asks for a numeric keyboard and moves on when it is full.
 */
export function BirthDateField({ value, onChange, currentYear, error }: BirthDateFieldProps) {
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  const update = (part: keyof BirthDateParts, raw: string, maxLength: number, next?: HTMLInputElement | null): void => {
    const digits = sanitiseDigits(raw, maxLength)
    onChange({ ...value, [part]: digits })
    // Move on once a box is full, so the whole date is one continuous typing
    // gesture; never move backwards, which would fight the user.
    if (digits.length === maxLength && next) next.focus()
  }

  return (
    <fieldset className="field group">
      <legend className="field__label">{it.entry.dateLabel}</legend>
      <div className="group__row">
        <span className="group__cell group__cell--short">
          <label className="group__label" htmlFor="birth-day">
            {it.entry.dayLabel}
          </label>
          <input
            id="birth-day"
            className="group__input"
            type="text"
            inputMode="numeric"
            autoComplete="bday-day"
            maxLength={2}
            placeholder="01"
            value={value.day}
            aria-describedby="birth-date-help"
            {...(error ? { 'aria-invalid': true } : {})}
            onChange={(event) => update('day', event.target.value, 2, monthRef.current)}
          />
        </span>

        <span className="group__cell group__cell--short">
          <label className="group__label" htmlFor="birth-month">
            {it.entry.monthLabel}
          </label>
          <input
            id="birth-month"
            className="group__input"
            type="text"
            inputMode="numeric"
            autoComplete="bday-month"
            maxLength={2}
            placeholder="09"
            value={value.month}
            ref={monthRef}
            aria-describedby="birth-date-help"
            {...(error ? { 'aria-invalid': true } : {})}
            onChange={(event) => update('month', event.target.value, 2, yearRef.current)}
          />
        </span>

        <span className="group__cell group__cell--long">
          <label className="group__label" htmlFor="birth-year">
            {it.entry.yearLabel}
          </label>
          <input
            id="birth-year"
            className="group__input"
            type="text"
            inputMode="numeric"
            autoComplete="bday-year"
            maxLength={4}
            placeholder="1964"
            value={value.year}
            ref={yearRef}
            aria-describedby="birth-date-help"
            {...(error ? { 'aria-invalid': true } : {})}
            onChange={(event) => update('year', event.target.value, 4)}
          />
        </span>
      </div>

      <p className="field__help" id="birth-date-help">
        {it.entry.dateHelp} {it.entry.yearRangeHelp(earliestYear(currentYear), currentYear)}
      </p>

      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
