import { it } from '../../content/it.ts'
import { paths } from '../../app/router.ts'
import { themeMeaning } from '../../content/interpretation.it.ts'
import type { ConvergenceResult } from '../../core/convergence/taxonomy.ts'

const levelClass: Record<string, string> = {
  'convergenza-forte': 'level level--strong',
  'convergenza-moderata': 'level level--moderate',
  neutro: 'level level--neutral',
  contrasto: 'level level--contrast',
}

/**
 * What each theme means, what each system contributes to it, and what the two
 * together suggest — instead of a label and a bar.
 */
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

  // Themes neither system highlights are collapsed: listing eleven rows where
  // eight say "nothing here" buries the four that matter.
  const meaningful = convergence.comparisons.filter((entry) => entry.level !== 'neutro')
  const background = convergence.comparisons.filter((entry) => entry.level === 'neutro')

  return (
    <div className="document">
      <header className="document__head">
        <h1 className="document__title">{it.convergence.title}</h1>
        <p className="document__lead">{it.convergence.lead}</p>
      </header>

      <p className="notice small">{it.convergence.caution}</p>

      {meaningful.map((comparison) => (
        <section className="reading" key={comparison.theme}>
          <div className="reading__head">
            <h2 className="reading__title">{it.convergence.themes[comparison.theme]}</h2>
            <span className={levelClass[comparison.level]}>{it.convergence.levels[comparison.level]}</span>
          </div>

          <p className="reading__text">{`${capitalise(themeMeaning[comparison.theme] ?? '')}.`}</p>

          <dl className="contribution">
            <div>
              <dt>{it.convergence.astrologySays}</dt>
              <dd>
                {comparison.astrologyFactors.length > 0
                  ? comparison.astrologyFactors.join(', ')
                  : it.convergence.nothingFrom}
              </dd>
            </div>
            <div>
              <dt>{it.convergence.numerologySays}</dt>
              <dd>
                {comparison.numerologyFactors.length > 0
                  ? comparison.numerologyFactors.join(', ')
                  : it.convergence.nothingFrom}
              </dd>
            </div>
          </dl>

          <p className="reading__text">{it.convergence.combined[comparison.level]}</p>
        </section>
      ))}

      {background.length > 0 ? (
        <details className="method">
          <summary>{`${it.convergence.levels.neutro} (${background.length})`}</summary>
          <div className="method__body">
            <p className="small muted">{it.convergence.combined.neutro}</p>
            <p className="small muted">
              {background.map((entry) => it.convergence.themes[entry.theme]).join(', ')}.
            </p>
          </div>
        </details>
      ) : null}

      <details className="method">
        <summary>{it.convergence.methodTitle}</summary>
        <div className="method__body">
          <p className="small muted">{it.convergence.methodBody}</p>
        </div>
      </details>
    </div>
  )
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
