import type { LegalDocument } from '../content/types.ts'
import { it } from '../content/it.ts'
import { release } from '../app/release.ts'

/** Renders Privacy, Disclaimer and About from the content layer. */
export function DocumentView({
  document: doc,
  showRelease = false,
}: {
  readonly document: LegalDocument
  /** Informazioni states which build is running; a green deploy does not. */
  readonly showRelease?: boolean
}) {
  return (
    <>
      <div className="stack stack--tight">
        <h1 className="page-title">{doc.title}</h1>
        <p className="small muted">{doc.updated}</p>
        <p className="page-intro">{doc.intro}</p>
      </div>

      {doc.sections.map((section) => (
        <section className="card" key={section.title} aria-labelledby={`section-${slug(section.title)}`}>
          <h2 className="section-title" id={`section-${slug(section.title)}`}>
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p className="muted" key={paragraph.slice(0, 40)}>
              {paragraph}
            </p>
          ))}
          {section.bullets ? (
            <ul className="bullets">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      {showRelease ? (
        <section className="card" aria-labelledby="section-versione">
          <h2 className="section-title" id="section-versione">
            {it.about.releaseTitle}
          </h2>
          <dl className="release">
            <dt>{it.about.version}</dt>
            <dd>{release.version}</dd>
            <dt>{it.about.build}</dt>
            <dd>{release.commit}</dd>
            <dt>{it.about.buildDate}</dt>
            <dd>{release.buildDate}</dd>
          </dl>
        </section>
      ) : null}
    </>
  )
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
