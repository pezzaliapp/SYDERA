import { useId, useState } from 'react'
import { it } from '../content/it.ts'
import { themeFor } from '../content/numerologyThemes.it.ts'
import type { NumberResult } from '../core/numerology/types.ts'

interface NumberCardProps {
  readonly name: string
  readonly source: string
  readonly result: NumberResult
}

/**
 * One calculated number. The calculated layer (value and derivation) and the
 * symbolic layer (traditional reading) are visually and textually separated.
 */
export function NumberCard({ name, source, result }: NumberCardProps) {
  const [showTrace, setShowTrace] = useState(false)
  const traceId = useId()
  const theme = themeFor(result.value)

  return (
    <article className="number-card">
      <div className="number-card__head">
        <div>
          <p className="number-card__name">{name}</p>
          <p className="small muted">{source}</p>
        </div>
        <p className="number-card__value" aria-label={`${name}: ${result.value}`}>
          {result.value}
        </p>
      </div>

      {result.isMaster ? (
        <p>
          <span className="badge badge--master">★ {it.analysis.masterNumber}</span>
        </p>
      ) : null}

      {theme ? (
        <p className="small muted">
          <span className="visually-hidden">{it.analysis.interpretationLayer}: </span>
          {theme.reading}
        </p>
      ) : null}

      <div>
        <button
          type="button"
          className="button button--quiet small"
          aria-expanded={showTrace}
          aria-controls={traceId}
          onClick={() => setShowTrace((value) => !value)}
        >
          {showTrace ? it.analysis.hideTrace : it.analysis.showTrace}
        </button>
      </div>

      {showTrace ? (
        <div className="trace" id={traceId}>
          <p>
            {it.analysis.calculatedLayer}: {result.inputs.join(' · ')}
          </p>
          <ol>
            <li>totale: {result.reduction.rawValue}</li>
            {result.reduction.steps.map((step, index) => (
              <li key={`${step.expression}-${index}`}>
                {step.expression} = {step.value}
              </li>
            ))}
            <li>
              risultato: {result.value}
              {result.isMaster ? ' (numero maestro, non ridotto)' : ''}
            </li>
          </ol>
        </div>
      ) : null}
    </article>
  )
}
