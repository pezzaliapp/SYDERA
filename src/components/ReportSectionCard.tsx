import { useId, useState } from 'react'
import { it } from '../content/it.ts'
import type { ReportSection } from '../core/interpretation/types.ts'

/**
 * One section of the reading.
 *
 * The text comes first and reads as a document. The calculated facts behind it
 * are one tap away, never in the way — a curious reader can check every claim,
 * and everyone else can simply read.
 */
export function ReportSectionCard({ section, lead }: { readonly section: ReportSection; readonly lead?: boolean }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <section className={lead ? 'reading reading--lead' : 'reading'} aria-labelledby={`${panelId}-title`}>
      <h2 className="reading__title" id={`${panelId}-title`}>
        {section.title}
      </h2>

      {section.paragraphs.map((paragraph, index) => (
        <p className={index === 0 && lead ? 'reading__lead' : 'reading__text'} key={paragraph.slice(0, 48)}>
          {paragraph}
        </p>
      ))}

      {section.evidence.length > 0 ? (
        <>
          <button
            type="button"
            className="reading__why"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? it.report.whyClose : it.report.why}
          </button>

          {open ? (
            <div className="evidence" id={panelId}>
              <p className="evidence__intro small">{it.report.evidenceIntro}</p>
              <ul className="evidence__list">
                {section.evidence.map((item) => (
                  <li key={item.key} className="evidence__item">
                    <span className={item.system === 'astrologia' ? 'evidence__tag' : 'evidence__tag evidence__tag--alt'}>
                      {item.system === 'astrologia' ? 'Astrologia' : 'Numerologia'}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
