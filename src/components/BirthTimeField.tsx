import { useRef } from 'react'
import { it } from '../content/it.ts'
import { sanitiseDigits, type BirthTimeParts } from '../app/birthInput.ts'

interface BirthTimeFieldProps {
  readonly value: BirthTimeParts
  readonly onChange: (value: BirthTimeParts) => void
  readonly error?: string | undefined
}

/**
 * Birth time entry: hours and minutes as two numbers.
 *
 * The native time control is a clock dial on Android and a spinner on iOS,
 * both of which are slower than typing four digits and behave differently on
 * every device. The value entered is still the local civil time of birth: only
 * the way it is typed changes.
 */
export function BirthTimeField({ value, onChange, error }: BirthTimeFieldProps) {
  const minuteRef = useRef<HTMLInputElement>(null)

  const update = (part: keyof BirthTimeParts, raw: string, next?: HTMLInputElement | null): void => {
    const digits = sanitiseDigits(raw, 2)
    onChange({ ...value, [part]: digits })
    if (digits.length === 2 && next) next.focus()
  }

  return (
    <fieldset className="field group">
      <legend className="field__label">{it.entry.timeLabel}</legend>
      <div className="group__row">
        <span className="group__cell group__cell--short">
          <label className="group__label" htmlFor="birth-hour">
            {it.entry.hourLabel}
          </label>
          <input
            id="birth-hour"
            className="group__input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            placeholder="07"
            value={value.hour}
            aria-describedby="birth-time-help"
            {...(error ? { 'aria-invalid': true } : {})}
            onChange={(event) => update('hour', event.target.value, minuteRef.current)}
          />
        </span>

        <span className="group__cell group__cell--short">
          <label className="group__label" htmlFor="birth-minute">
            {it.entry.minuteLabel}
          </label>
          <input
            id="birth-minute"
            className="group__input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            placeholder="30"
            value={value.minute}
            ref={minuteRef}
            aria-describedby="birth-time-help"
            {...(error ? { 'aria-invalid': true } : {})}
            onChange={(event) => update('minute', event.target.value)}
          />
        </span>
      </div>

      <p className="field__help" id="birth-time-help">
        {it.entry.timeHelp}
      </p>

      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
