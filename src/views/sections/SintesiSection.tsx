import { it } from '../../content/it.ts'
import { paths } from '../../app/router.ts'
import { ReportSectionCard } from '../../components/ReportSectionCard.tsx'
import { ReportEvidence } from '../../components/ReportEvidence.tsx'
import type { Analysis } from '../../app/useAnalysis.ts'

/**
 * The reading itself: the first thing a person sees after calculating, and the
 * part that answers the question they actually came with. The numbers behind it
 * are reachable from every section, and in full in the other tabs.
 */
export function SintesiSection({ analysis }: { readonly analysis: Analysis }) {
  const { report } = analysis
  const [lead, ...rest] = report.sections

  if (!lead) {
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

      <ReportSectionCard section={lead} lead />

      {rest.map((section) => (
        <ReportSectionCard section={section} key={section.id} />
      ))}

      <ReportEvidence sections={report.sections} />

      {report.omitted.length > 0 ? (
        <section className="reading reading--quiet">
          <h2 className="reading__title">{it.report.omitted}</h2>
          <p className="reading__text small">{it.report.omittedIntro}</p>
          <ul className="bullets small">
            {report.omitted.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.title}</strong> — {entry.reason}.
              </li>
            ))}
          </ul>
          <div className="row">
            <a className="button button--quiet" href={paths.data}>
              {it.sintesi.completeData}
            </a>
          </div>
        </section>
      ) : null}
    </div>
  )
}
