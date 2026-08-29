import { it } from '../../content/it.ts'
import { paths } from '../../app/router.ts'
import { NumberCard } from '../../components/NumberCard.tsx'
import { MethodDisclosure } from '../../components/MethodDisclosure.tsx'
import { themeFor } from '../../content/numerologyThemes.it.ts'
import type { NumerologyProfile } from '../../core/numerology/profile.ts'
import type { NumerologyIssue } from '../../core/numerology/types.ts'

interface Props {
  readonly numerology: NumerologyProfile | null
  readonly issues: readonly NumerologyIssue[]
  readonly warnings: readonly NumerologyIssue[]
  readonly hasName: boolean
}

export function NumerologiaSection({ numerology, issues, warnings, hasName }: Props) {
  if (!hasName) {
    return (
      <section className="card" aria-labelledby="numerology-missing">
        <h2 className="section-title" id="numerology-missing">
          {it.numerology.missingName}
        </h2>
        <p className="muted">{it.numerology.missingNameBody}</p>
        <div className="row">
          <a className="button button--primary" href={paths.data}>
            {it.numerology.addName}
          </a>
        </div>
      </section>
    )
  }

  if (!numerology) {
    return (
      <section className="notice notice--warning">
        <h2 className="section-title">{it.numerology.notCalculable}</h2>
        <ul className="bullets">
          {issues.map((issue) => (
            <li key={issue.code}>{issue.detail ?? issue.code}</li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <>
      <div className="stack stack--tight">
        <h2 className="page-title">{it.numerology.title}</h2>
        <p className="page-intro">{it.numerology.lead}</p>
      </div>

      {warnings.length > 0 ? (
        <p className="notice small">
          {it.numerology.normalisedName}
          {warnings.map((warning) => (warning.detail ? ` — ${warning.detail}` : '')).join('')}
        </p>
      ) : null}

      <section className="card" aria-labelledby="core-numbers">
        <div className="row row--between">
          <h3 className="section-title" id="core-numbers">
            {it.numerology.coreNumbers}
          </h3>
          <span className="badge badge--calculated">{it.result.calculated}</span>
        </div>
        <div className="grid">
          <NumberCard name={it.numerology.numbers.lifePath} source={it.numerology.sources.lifePath} result={numerology.lifePath} />
          <NumberCard name={it.numerology.numbers.expression} source={it.numerology.sources.expression} result={numerology.expression} />
          <NumberCard name={it.numerology.numbers.soulUrge} source={it.numerology.sources.soulUrge} result={numerology.soulUrge} />
          <NumberCard name={it.numerology.numbers.personality} source={it.numerology.sources.personality} result={numerology.personality} />
          <NumberCard name={it.numerology.numbers.birthday} source={it.numerology.sources.birthday} result={numerology.birthday} />
          <NumberCard name={it.numerology.numbers.maturity} source={it.numerology.sources.maturity} result={numerology.maturity} />
        </div>
        <MethodDisclosure options={numerology.options} />
      </section>

      <details className="method method--data">
        <summary>{it.numerology.showData}</summary>
        <div className="method__body">
          <div className="stack">
      <section className="card" aria-labelledby="pinnacles">
        <h3 className="section-title" id="pinnacles">
          {it.numerology.pinnacles}
        </h3>
        <div className="table-wrap">
          <table className="table--stacks">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{it.result.calculated}</th>
                <th scope="col">{it.numerology.ageRange}</th>
                <th scope="col">{it.result.symbolic}</th>
              </tr>
            </thead>
            <tbody>
              {numerology.pinnacles.map((pinnacle) => (
                <tr key={pinnacle.index}>
                  <td data-label="#">{pinnacle.index}</td>
                  <td data-label={it.result.calculated}>
                    {pinnacle.value}
                    {pinnacle.isMaster ? ' ★' : ''}
                  </td>
                  <td data-label={it.numerology.ageRange}>
                    {pinnacle.endAge === null
                      ? `${it.numerology.fromAge} ${pinnacle.startAge} ${it.numerology.onwards}`
                      : `${pinnacle.startAge}–${pinnacle.endAge}`}
                  </td>
                  <td className="cell-wrap" data-label={it.result.symbolic}>
                    {themeFor(pinnacle.value)?.keywords.join(', ') ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="challenges">
        <h3 className="section-title" id="challenges">
          {it.numerology.challenges}
        </h3>
        <div className="table-wrap">
          <table className="table--stacks">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{it.result.calculated}</th>
                <th scope="col">{it.numerology.method}</th>
              </tr>
            </thead>
            <tbody>
              {numerology.challenges.map((challenge) => (
                <tr key={challenge.index}>
                  <td data-label="#">{challenge.index}</td>
                  <td data-label={it.result.calculated}>{challenge.value}</td>
                  <td data-label={it.numerology.method}>{challenge.expression}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="letters">
        <h3 className="section-title" id="letters">
          {it.numerology.letterTable}
        </h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">{it.result.calculated}</th>
              </tr>
            </thead>
            <tbody>
              {numerology.nameAnalysis.words.map((word, index) => (
                <tr key={`${word.source}-${index}`}>
                  <td>{word.source}</td>
                  <td>
                    {word.letters
                      .map(
                        (letter) =>
                          `${letter.letter}=${letter.value} (${letter.letterClass === 'vowel' ? it.numerology.vowel : it.numerology.consonant})`,
                      )
                      .join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
          </div>
        </div>
      </details>
    </>
  )
}
