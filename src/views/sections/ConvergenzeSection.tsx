import { it } from '../../content/it.ts'
import { paths } from '../../app/router.ts'
import type { ConvergenceResult } from '../../core/convergence/taxonomy.ts'

/** Width bucket in five-per-cent steps, so the bar needs no inline style. */
function bucket(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value * 20) * 5))
}

const levelClass: Record<string, string> = {
  'convergenza-forte': 'level level--strong',
  'convergenza-moderata': 'level level--moderate',
  neutro: 'level level--neutral',
  contrasto: 'level level--contrast',
}

export function ConvergenzeSection({ convergence }: { readonly convergence: ConvergenceResult }) {
  if (convergence.incomplete) {
    return (
      <section className="card" aria-labelledby="convergence-missing">
        <h2 className="section-title" id="convergence-missing">
          {it.convergence.incomplete}
        </h2>
        <p className="muted">{it.convergence.incompleteBody}</p>
        <div className="row">
          <a className="button button--primary" href={paths.data}>
            {it.sintesi.completeData}
          </a>
        </div>
      </section>
    )
  }

  return (
    <>
      <div className="stack stack--tight">
        <h2 className="page-title">{it.convergence.title}</h2>
        <p className="page-intro">{it.convergence.lead}</p>
      </div>

      <p className="notice">{it.convergence.caution}</p>

      <div className="stack">
        {convergence.comparisons.map((comparison) => (
          <section className="card" key={comparison.theme}>
            <div className="row row--between">
              <h3 className="section-title">{it.convergence.themes[comparison.theme]}</h3>
              <span className={levelClass[comparison.level]}>{it.convergence.levels[comparison.level]}</span>
            </div>
            <p className="small muted">{it.convergence.levelExplanations[comparison.level]}</p>

            <div className="meter" role="img" aria-label={`Astrologia ${Math.round(comparison.astrology * 100)}%, numerologia ${Math.round(comparison.numerology * 100)}%`}>
              <div className="meter__row">
                <span className="meter__label small">Astrologia</span>
                <span className="meter__track">
                  <span className={`meter__fill meter__fill--p${bucket(comparison.astrology)}`} />
                </span>
              </div>
              <div className="meter__row">
                <span className="meter__label small">Numerologia</span>
                <span className="meter__track">
                  <span className={`meter__fill meter__fill--alt meter__fill--p${bucket(comparison.numerology)}`} />
                </span>
              </div>
            </div>

            {comparison.astrologyFactors.length > 0 || comparison.numerologyFactors.length > 0 ? (
              <details>
                <summary>{it.result.showCalculation}</summary>
                <dl className="definition-list small stack-top">
                  <dt>{it.convergence.fromAstrology}</dt>
                  <dd>{comparison.astrologyFactors.join(', ') || '—'}</dd>
                  <dt>{it.convergence.fromNumerology}</dt>
                  <dd>{comparison.numerologyFactors.join(', ') || '—'}</dd>
                </dl>
              </details>
            ) : null}
          </section>
        ))}
      </div>

      <details className="method">
        <summary>{it.convergence.methodTitle}</summary>
        <div className="method__body">
          <p className="small muted">{it.convergence.methodBody}</p>
        </div>
      </details>
    </>
  )
}
