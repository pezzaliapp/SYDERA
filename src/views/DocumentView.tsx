import type { LegalDocument } from '../content/types.ts'

/** Renders Privacy, Disclaimer and About from the content layer. */
export function DocumentView({ document: doc }: { readonly document: LegalDocument }) {
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
