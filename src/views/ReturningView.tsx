import { it } from '../content/it.ts'
import { paths } from '../app/router.ts'
import type { StoredSydera } from '../core/storage/sydera.ts'

/**
 * What a returning visitor sees: their own analysis, not a list of records.
 */
export function ReturningView({ sydera }: { readonly sydera: StoredSydera }) {
  const calculated = new Date(sydera.updatedAt)
  const formatted = Number.isNaN(calculated.getTime())
    ? null
    : calculated.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="entry">
      <div className="entry__panel entry__panel--narrow">
        <header className="entry__head">
          <h1 className="entry__title">{it.app.name}</h1>
          <p className="entry__subtitle">{it.app.subtitle}</p>
        </header>

        <section className="card">
          <h2 className="section-title">{it.returning.title}</h2>
          {formatted ? (
            <p className="muted small">
              {it.returning.calculatedOn} {formatted}
            </p>
          ) : null}
          <div className="stack stack--tight">
            <a className="button button--primary button--wide" href={paths.result}>
              {it.returning.open}
            </a>
            <a className="button button--wide" href={paths.data}>
              {it.returning.edit}
            </a>
          </div>
          <p className="entry__privacy small">{it.app.localNotice}</p>
        </section>
      </div>
    </div>
  )
}
