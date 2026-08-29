import { useId } from 'react'
import type { ReportSection } from '../core/interpretation/types.ts'

/**
 * One section of the reading, and nothing else.
 *
 * The calculated facts behind every section are disclosed once, together, at
 * the end of the report: a control repeated under each section turned the page
 * into a list of buttons and broke the reading into fragments.
 */
export function ReportSectionCard({ section, lead }: { readonly section: ReportSection; readonly lead?: boolean }) {
  const titleId = useId()

  return (
    <section className={lead ? 'reading reading--lead' : 'reading'} aria-labelledby={titleId}>
      <h2 className="reading__title" id={titleId}>
        {section.title}
      </h2>

      {section.paragraphs.map((paragraph, index) => (
        <p className={index === 0 && lead ? 'reading__lead' : 'reading__text'} key={paragraph.slice(0, 48)}>
          {paragraph}
        </p>
      ))}
    </section>
  )
}
