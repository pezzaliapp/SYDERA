import { it } from '../../content/it.ts'
import { paths } from '../../app/router.ts'
import { ReportEvidence } from '../../components/ReportEvidence.tsx'
import type { Analysis } from '../../app/useAnalysis.ts'

/**
 * The reading: a short document about the reader, and nothing else.
 *
 * No cards, no scores, no badges. The calculated facts behind it are in one
 * disclosure at the end, and in full in the technical tabs.
 */
export function SintesiSection({ analysis }: { readonly analysis: Analysis }) {
  const { report } = analysis

  if (report.sections.length === 0) {
    return (
      <section className="card">
        <h2 className="section-title">{it.report.title}</h2>
        <p className="muted">{it.sintesi.missingAstrology}</p>
        <div className="row">
          <a className="button button--primary" href={paths.data}>
            {it.sintesi.completeData}
          </a>
        </div>
      </section>
    )
  }

  return (
    <div className="document">
      <header className="document__head">
        <h1 className="document__title">{it.report.title}</h1>
        <p className="document__framing">
          {it.report.shortFraming}{' '}
          <a className="link" href={paths.disclaimer}>
            {it.report.readDisclaimer}
          </a>
        </p>
      </header>

      {report.sections.map((section, index) => (
        <section className={index === 0 ? 'reading reading--lead' : 'reading'} key={section.id}>
          <h2 className="reading__title">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p className={index === 0 ? 'reading__lead' : 'reading__text'} key={paragraph.slice(0, 48)}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <ReportEvidence sections={report.sections} />
    </div>
  )
}
