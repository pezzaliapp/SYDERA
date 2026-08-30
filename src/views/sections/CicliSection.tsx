import { useId, useState } from 'react'
import { it } from '../../content/it.ts'
import { NumberCard } from '../../components/NumberCard.tsx'
import { aspectReadings, bodyReadings, angleReadings } from '../../content/astrologyThemes.it.ts'
import { buildCyclesReading, type LifePhase } from '../../core/interpretation/cycles.ts'
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

/** The calculated factors behind a piece of the reading, one tap away. */
function Why({ facts }: { readonly facts: readonly string[] }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  if (facts.length === 0) return null

  return (
    <>
      <button
        type="button"
        className="reading__why"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? it.report.whyClose : it.cycles.whyReading}
      </button>
      {open ? (
        <ul className="evidence__list" id={panelId}>
          {facts.map((fact) => (
            <li className="evidence__item" key={fact}>
              <span className="evidence__tag">{it.result.calculated}</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

function PhaseCard({ phase }: { readonly phase: LifePhase }) {
  const ages =
    phase.endAge === null ? it.cycles.fromAge(phase.startAge) : it.cycles.ageRange(phase.startAge, phase.endAge)
  const years =
    phase.endYear === null ? it.cycles.fromYear(phase.startYear) : it.cycles.yearRange(phase.startYear, phase.endYear)

  return (
    <li className={phase.current ? 'phase phase--current' : 'phase'}>
      <p className="phase__when">
        <span className="phase__ages">{ages}</span>
        <span className="phase__years">{years}</span>
      </p>
      <h3 className="phase__title">{phase.title}</h3>
      {phase.current ? <p className="phase__badge">{it.cycles.currentPhase}</p> : null}
      <p className="reading__text">{phase.reading}</p>
      <Why facts={phase.evidence} />
    </li>
  )
}

/**
 * Where a person is in their life, when it started, when it ends and what it
 * is about — before any number. The calculations stay complete, underneath.
 */
export function CicliSection({ transits, numerology, hasCompleteChart, referenceDate }: Props) {
  const formatted = `${String(referenceDate.day).padStart(2, '0')}/${String(referenceDate.month).padStart(2, '0')}/${referenceDate.year}`
  const reading = buildCyclesReading(numerology, transits)
  const currentPhase = reading.phases.find((phase) => phase.current)

  return (
    <>
      <div className="stack stack--tight">
        <h2 className="page-title">{it.cycles.title}</h2>
        <p className="page-intro">{it.cycles.lead}</p>
        <p className="small muted">
          {it.result.referenceDate}: {formatted}
        </p>
      </div>

      {reading.phases.length > 0 ? (
        <section className="card" aria-labelledby="phases-title">
          <h3 className="section-title" id="phases-title">
            {it.cycles.phasesTitle}
          </h3>
          {/* On a small screen the current phase can be the third of four, so
              the answer is stated once before the timeline rather than found
              by scrolling to it. */}
          {currentPhase ? (
            <p className="phase__now">
              {it.cycles.nowIn(
                currentPhase.endAge === null
                  ? it.cycles.fromAge(currentPhase.startAge)
                  : it.cycles.ageRange(currentPhase.startAge, currentPhase.endAge),
                currentPhase.endYear === null
                  ? it.cycles.fromYear(currentPhase.startYear)
                  : it.cycles.yearRange(currentPhase.startYear, currentPhase.endYear),
                currentPhase.title,
              )}
            </p>
          ) : null}
          <ol className="phases">
            {reading.phases.map((phase) => (
              <PhaseCard phase={phase} key={phase.index} />
            ))}
          </ol>
        </section>
      ) : null}

      {reading.year ? (
        <section className="card" aria-labelledby="period-title">
          <h3 className="section-title" id="period-title">
            {it.cycles.periodTitle}
          </h3>
          <p className="phase__when">
            <span className="phase__ages">{reading.year.calendarYear}</span>
          </p>
          <p className="reading__text">{reading.year.reading}</p>
          <p className="small muted">{it.cycles.periodRange(reading.year.from, reading.year.to)}</p>
          <Why facts={reading.year.evidence} />

          {reading.month || reading.day ? (
            <dl className="shortterm">
              {reading.month ? (
                <>
                  <dt>{it.cycles.thisMonth}</dt>
                  <dd>{reading.month.note}</dd>
                </>
              ) : null}
              {reading.day ? (
                <>
                  <dt>{it.cycles.today}</dt>
                  <dd>{reading.day.note}</dd>
                </>
              ) : null}
            </dl>
          ) : null}
        </section>
      ) : (
        <section className="card">
          <h3 className="section-title">{it.cycles.periodTitle}</h3>
          <p className="muted">{it.cycles.personalUnavailable}</p>
        </section>
      )}

      <section className="card" aria-labelledby="moment-title">
        <h3 className="section-title" id="moment-title">
          {it.cycles.momentTitle}
        </h3>
        {!hasCompleteChart ? (
          <p className="muted">{it.cycles.transitsUnavailable}</p>
        ) : reading.moment ? (
          <>
            {reading.moment.paragraphs.map((paragraph) => (
              <p className="reading__text" key={paragraph.slice(0, 40)}>
                {paragraph}
              </p>
            ))}
            <Why facts={reading.moment.evidence} />
          </>
        ) : (
          <p className="muted">{it.cycles.momentEmpty}</p>
        )}
      </section>

      <p className="notice small">{it.cycles.caution}</p>

      <details className="method method--data">
        <summary>{it.cycles.showCalculations}</summary>
        <div className="method__body">
          <div className="stack">
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
                  <table className="table--stacks">
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
                          <td data-label={it.cycles.transiting}>
                            {bodyReadings[transit.transiting].label}
                            {transit.retrograde ? <span className="muted small"> · R</span> : null}
                          </td>
                          <td data-label="Aspetto">{aspectReadings[transit.aspect].label}</td>
                          <td data-label={it.cycles.onNatal}>{pointLabel(transit.natalPoint)}</td>
                          <td data-label={it.cycles.orb}>{transit.orb.toFixed(2)}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </details>
    </>
  )
}
