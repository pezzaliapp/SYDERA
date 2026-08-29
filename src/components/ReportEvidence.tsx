import { useId, useState } from 'react'
import { it } from '../content/it.ts'
import type { ReportSection } from '../core/interpretation/types.ts'

/**
 * Every calculated fact the reading rests on, in one place.
 *
 * Grouping the evidence by section keeps each claim traceable — the promise
 * the per-section controls used to make — while leaving the reading itself
 * uninterrupted.
 */
export function ReportEvidence({ sections }: { readonly sections: readonly ReportSection[] }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const groups = sections.filter((section) => section.evidence.length > 0)
  if (groups.length === 0) return null

  return (
    <section className="reading reading--quiet">
      <button
        type="button"
        className="reading__why"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? it.report.whyClose : it.report.evidenceTitle}
      </button>

      {open ? (
        <div className="evidence" id={panelId}>
          <p className="evidence__intro small">{it.report.evidenceLead}</p>
          {groups.map((section) => (
            <div className="evidence__group" key={section.id}>
              <h3 className="evidence__heading">{section.title}</h3>
              <ul className="evidence__list">
                {section.evidence.map((item) => (
                  <li key={item.key} className="evidence__item">
                    <span
                      className={item.system === 'astrologia' ? 'evidence__tag' : 'evidence__tag evidence__tag--alt'}
                    >
                      {item.system === 'astrologia' ? 'Astrologia' : 'Numerologia'}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
