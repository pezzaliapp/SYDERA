import { useEffect, useRef } from 'react'
import { it } from '../content/it.ts'

/**
 * Dedicated confirmation shown after a successful "delete all my data".
 *
 * It is rendered instead of the application, so the confirmation cannot be
 * missed or navigated away from: only the explicit "Continua" action returns
 * SYDERA to its initial state.
 */
export function DataDeletedView({ onContinue }: { readonly onContinue: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="onboarding">
      <div className="onboarding__panel">
        <section className="card" role="status" aria-labelledby="data-deleted-title">
          <h1 className="page-title" id="data-deleted-title" tabIndex={-1} ref={headingRef}>
            {it.dataDeleted.title}
          </h1>
          <p className="muted">{it.dataDeleted.lead}</p>

          <h2 className="section-title">{it.dataDeleted.removedTitle}</h2>
          <ul className="bullets">
            {it.dataDeleted.removed.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>

          <h2 className="section-title">{it.dataDeleted.keptTitle}</h2>
          <ul className="bullets">
            {it.dataDeleted.kept.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>

          <p className="notice small">{it.dataDeleted.note}</p>

          <div className="row">
            <button type="button" className="button button--primary" onClick={onContinue}>
              {it.dataDeleted.continue}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
