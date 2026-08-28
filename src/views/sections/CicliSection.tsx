import { it } from '../../content/it.ts'
import { NumberCard } from '../../components/NumberCard.tsx'
import { aspectReadings, bodyReadings, angleReadings } from '../../content/astrologyThemes.it.ts'
import type { Transit } from '../../core/cycles/transits.ts'
import type { NumerologyProfile } from '../../core/numerology/profile.ts'
import type { AspectPoint } from '../../core/astrology/types.ts'

interface Props {
  readonly transits: readonly Transit[]
  readonly numerology: NumerologyProfile | null
  readonly hasCompleteChart: boolean
  readonly referenceDate: { year: number; month: number; day: number }
}

const pointLabel = (point: AspectPoint): string => {
  if (point === 'ascendant') return angleReadings.ascendant.label
  if (point === 'midheaven') return angleReadings.midheaven.label
  return bodyReadings[point].label
}

export function CicliSection({ transits, numerology, hasCompleteChart, referenceDate }: Props) {
  const formatted = `${String(referenceDate.day).padStart(2, '0')}/${String(referenceDate.month).padStart(2, '0')}/${referenceDate.year}`

  return (
    <>
      <div className="stack stack--tight">
        <h2 className="page-title">{it.cycles.title}</h2>
        <p className="page-intro">{it.cycles.lead}</p>
        <p className="small muted">
          {it.result.referenceDate}: {formatted}
        </p>
      </div>

      <p className="notice">{it.cycles.caution}</p>

      <section className="card" aria-labelledby="transits-title">
        <div className="row row--between">
          <h3 className="section-title" id="transits-title">
            {it.cycles.transitsTitle}
          </h3>
          <span className="badge badge--calculated">{it.result.calculated}</span>
        </div>
        {!hasCompleteChart ? (
          <p className="muted">{it.cycles.transitsUnavailable}</p>
        ) : transits.length === 0 ? (
          <p className="muted">{it.cycles.transitsEmpty}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{it.cycles.transiting}</th>
                  <th scope="col">Aspetto</th>
                  <th scope="col">{it.cycles.onNatal}</th>
                  <th scope="col">{it.cycles.orb}</th>
                </tr>
              </thead>
              <tbody>
                {transits.map((transit) => (
                  <tr key={`${transit.transiting}-${transit.natalPoint}-${transit.aspect}`}>
                    <td>
                      {bodyReadings[transit.transiting].label}
                      {transit.retrograde ? <span className="muted small"> · R</span> : null}
                    </td>
                    <td>{aspectReadings[transit.aspect].label}</td>
                    <td>{pointLabel(transit.natalPoint)}</td>
                    <td>{transit.orb.toFixed(2)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {transits.length > 0 ? (
          <details>
            <summary>{it.result.symbolic}</summary>
            <ul className="bullets stack-top">
              {transits.map((transit) => (
                <li key={`${transit.transiting}-${transit.natalPoint}-reading`}>
                  <strong>
                    {bodyReadings[transit.transiting].label} · {aspectReadings[transit.aspect].label} ·{' '}
                    {pointLabel(transit.natalPoint)}
                  </strong>{' '}
                  — {aspectReadings[transit.aspect].reading} {bodyReadings[transit.transiting].reading}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section className="card" aria-labelledby="personal-cycles">
        <h3 className="section-title" id="personal-cycles">
          {it.cycles.personalTitle}
        </h3>
        {numerology ? (
          <div className="grid">
            <NumberCard
              name={it.numerology.numbers.personalYear}
              source={it.numerology.sources.personalYear}
              result={numerology.personalYear}
            />
            <NumberCard
              name={it.numerology.numbers.personalMonth}
              source={it.numerology.sources.personalMonth}
              result={numerology.personalMonth}
            />
            <NumberCard
              name={it.numerology.numbers.personalDay}
              source={it.numerology.sources.personalDay}
              result={numerology.personalDay}
            />
          </div>
        ) : (
          <p className="muted">{it.cycles.personalUnavailable}</p>
        )}
      </section>
    </>
  )
}
