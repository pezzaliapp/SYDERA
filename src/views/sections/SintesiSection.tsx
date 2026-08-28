import { it } from '../../content/it.ts'
import { paths } from '../../app/router.ts'
import { bodyReadings, signReadings, angleReadings } from '../../content/astrologyThemes.it.ts'
import { themeFor } from '../../content/numerologyThemes.it.ts'
import type { Analysis } from '../../app/useAnalysis.ts'

/**
 * The first screen after a calculation: what stands out, in words, with a link
 * to the section that shows the numbers behind it. Never a data table.
 */
export function SintesiSection({ analysis }: { readonly analysis: Analysis }) {
  const { chart, numerology, convergence } = analysis
  const complete = chart?.kind === 'complete' ? chart : null

  const sun = complete?.positions.find((position) => position.body === 'sun')
  const moon = complete?.positions.find((position) => position.body === 'moon')
  const ascendantSign = complete ? signOf(complete.ascendantValue) : null

  const strongest = convergence.comparisons.filter((entry) => entry.level === 'convergenza-forte').slice(0, 2)
  const contrasts = convergence.comparisons.filter((entry) => entry.level === 'contrasto').slice(0, 1)

  return (
    <>
      <div className="stack stack--tight">
        <h2 className="page-title">{it.sintesi.title}</h2>
        <p className="page-intro">{it.sintesi.lead}</p>
      </div>

      <p className="notice small">{it.result.layerNote}</p>

      <section className="card" aria-labelledby="sintesi-astro">
        <h3 className="section-title" id="sintesi-astro">
          {it.sintesi.astroTitle}
        </h3>
        {complete ? (
          <ul className="bullets">
            {sun ? (
              <li>
                <strong>{bodyReadings.sun.label} in {signReadings[sun.sign].label}</strong> — {signReadings[sun.sign].reading}
              </li>
            ) : null}
            {moon ? (
              <li>
                <strong>{bodyReadings.moon.label} in {signReadings[moon.sign].label}</strong> — {bodyReadings.moon.reading}
              </li>
            ) : null}
            {ascendantSign ? (
              <li>
                <strong>{angleReadings.ascendant.label} in {signReadings[ascendantSign].label}</strong> —{' '}
                {angleReadings.ascendant.reading}
              </li>
            ) : null}
          </ul>
        ) : chart?.kind === 'partial-no-time' ? (
          <p className="muted">{it.astrology.partialBody}</p>
        ) : (
          <p className="muted">{it.sintesi.missingAstrology}</p>
        )}
        <div className="row">
          <a className="button button--quiet" href={paths.section('astrologia')}>
            {it.sections.astrologia} →
          </a>
        </div>
      </section>

      <section className="card" aria-labelledby="sintesi-numero">
        <h3 className="section-title" id="sintesi-numero">
          {it.sintesi.numeroTitle}
        </h3>
        {numerology ? (
          <ul className="bullets">
            <li>
              <strong>
                {it.numerology.numbers.lifePath} {numerology.lifePath.value}
              </strong>{' '}
              — {themeFor(numerology.lifePath.value)?.reading}
            </li>
            <li>
              <strong>
                {it.numerology.numbers.expression} {numerology.expression.value}
              </strong>{' '}
              — {themeFor(numerology.expression.value)?.reading}
            </li>
          </ul>
        ) : (
          <p className="muted">{it.sintesi.missingNumerology}</p>
        )}
        <div className="row">
          <a className="button button--quiet" href={paths.section('numerologia')}>
            {it.sections.numerologia} →
          </a>
        </div>
      </section>

      <section className="card" aria-labelledby="sintesi-conv">
        <h3 className="section-title" id="sintesi-conv">
          {it.sintesi.convergenceTitle}
        </h3>
        {convergence.incomplete ? (
          <p className="muted">{it.sintesi.missingConvergence}</p>
        ) : (
          <ul className="bullets">
            {strongest.map((entry) => (
              <li key={entry.theme}>
                <strong>{it.convergence.themes[entry.theme]}</strong> — {it.convergence.levelExplanations[entry.level]}
              </li>
            ))}
            {contrasts.map((entry) => (
              <li key={entry.theme}>
                <strong>{it.convergence.themes[entry.theme]}</strong> — {it.convergence.levelExplanations[entry.level]}
              </li>
            ))}
            {strongest.length === 0 && contrasts.length === 0 ? <li>{it.convergence.levelExplanations.neutro}</li> : null}
          </ul>
        )}
        <div className="row">
          <a className="button button--quiet" href={paths.section('convergenze')}>
            {it.sections.convergenze} →
          </a>
        </div>
      </section>
    </>
  )
}

function signOf(longitude: number) {
  const signs = [
    'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
    'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
  ] as const
  const wrapped = ((longitude % 360) + 360) % 360
  return signs[Math.floor(wrapped / 30)] as (typeof signs)[number]
}
