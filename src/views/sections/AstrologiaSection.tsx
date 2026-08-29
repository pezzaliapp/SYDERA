import { it } from '../../content/it.ts'
import { ReportSectionCard } from '../../components/ReportSectionCard.tsx'
import type { Report } from '../../core/interpretation/types.ts'
import { angleReadings, aspectReadings, bodyReadings, houseReadings, signReadings } from '../../content/astrologyThemes.it.ts'
import { formatOffset } from '../../core/time/timezone.ts'
import type { Chart } from '../../core/astrology/chart.ts'
import type { AspectPoint } from '../../core/astrology/types.ts'

const pointLabel = (point: AspectPoint): string => {
  if (point === 'ascendant') return angleReadings.ascendant.label
  if (point === 'midheaven') return angleReadings.midheaven.label
  return bodyReadings[point].label
}

const degrees = (value: number): string => {
  const whole = Math.floor(value)
  const minutes = Math.round((value - whole) * 60)
  return minutes === 60 ? `${whole + 1}° 00'` : `${whole}° ${String(minutes).padStart(2, '0')}'`
}

export function AstrologiaSection({ chart, report }: { readonly chart: Chart | null; readonly report: Report }) {
  // The sections of the reading that rest on astrological evidence.
  const astrological = report.sections.filter((section) =>
    section.evidence.some((evidence) => evidence.system === 'astrologia'),
  )

  if (!chart) {
    return (
      <section className="card">
        <h2 className="section-title">{it.astrology.title}</h2>
        <p className="notice notice--warning">{it.sintesi.missingAstrology}</p>
      </section>
    )
  }

  if (chart.kind === 'partial-no-time') {
    return (
      <>
        <div className="stack stack--tight">
          <h2 className="page-title">{it.astrology.title}</h2>
          <p className="page-intro">{it.result.layerNote}</p>
        </div>
        <section className="notice notice--warning" aria-labelledby="partial-title">
          <h3 className="section-title" id="partial-title">
            {it.astrology.partialTitle}
          </h3>
          <p>{it.astrology.partialBody}</p>
        </section>
        <section className="card" aria-labelledby="partial-positions">
          <div className="row row--between">
            <h3 className="section-title" id="partial-positions">
              {it.astrology.positions}
            </h3>
            <span className="badge badge--calculated">{it.result.calculated}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Corpo</th>
                  <th scope="col">Segno</th>
                  <th scope="col">{it.astrology.partialRange}</th>
                </tr>
              </thead>
              <tbody>
                {chart.positions.map((position) => (
                  <tr key={position.body}>
                    <td>{bodyReadings[position.body].label}</td>
                    <td>{position.sign ? signReadings[position.sign].label : it.astrology.partialSignUncertain}</td>
                    <td>{position.rangeDegrees.toFixed(2)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    )
  }

  const { provenance } = chart

  return (
    <>
      <div className="stack stack--tight">
        <h2 className="page-title">{it.astrology.title}</h2>
        <p className="page-intro">{it.astrology.lead}</p>
      </div>

      {astrological.length > 0 ? (
        <div className="document document--inline">
          {astrological.map((section) => (
            <ReportSectionCard section={section} key={`astro-${section.id}`} />
          ))}
        </div>
      ) : null}

      {provenance.caveats.length > 0 ? (
        <div className="notice notice--warning">
          <ul className="bullets">
            {provenance.caveats.map((caveat) => (
              <li key={caveat}>{it.astrology.caveats[caveat as keyof typeof it.astrology.caveats]}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="method method--data">
        <summary>{it.astrology.showData}</summary>
        <div className="method__body">
          <div className="stack">
      <section className="card" aria-labelledby="angles-title">
        <div className="row row--between">
          <h3 className="section-title" id="angles-title">
            {it.astrology.angles}
          </h3>
          <span className="badge badge--calculated">{it.result.calculated}</span>
        </div>
        <dl className="definition-list">
          <dt>{it.astrology.ascendant}</dt>
          <dd>
            {degrees(chart.ascendantValue % 30)} {signReadings[signOf(chart.ascendantValue)].label}
          </dd>
          <dt>{it.astrology.midheaven}</dt>
          <dd>
            {degrees(chart.midheavenValue % 30)} {signReadings[signOf(chart.midheavenValue)].label}
          </dd>
        </dl>
        <p className="small muted">{angleReadings.ascendant.reading}</p>
        {chart.ascendantUncertaintyDegrees > 0 ? (
          <p className="notice small">
            {it.astrology.uncertaintyBody(
              chart.ascendantUncertaintyDegrees.toFixed(2),
              String(provenance.birthTimePrecisionMinutes),
            )}
          </p>
        ) : null}
      </section>

      <section className="card" aria-labelledby="positions-title">
        <div className="row row--between">
          <h3 className="section-title" id="positions-title">
            {it.astrology.positions}
          </h3>
          <span className="badge badge--calculated">{it.result.calculated}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Corpo</th>
                <th scope="col">Posizione</th>
                <th scope="col">{it.astrology.house}</th>
              </tr>
            </thead>
            <tbody>
              {chart.positions.map((position) => (
                <tr key={position.body}>
                  <td>{bodyReadings[position.body].label}</td>
                  <td>
                    {degrees(position.degreeInSign)} {signReadings[position.sign].label}
                    {position.retrograde ? <span className="muted small"> · {it.astrology.retrograde}</span> : null}
                  </td>
                  <td>{position.house ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details>
          <summary>{it.result.symbolic}</summary>
          <ul className="bullets stack-top">
            {chart.positions.map((position) => (
              <li key={position.body}>
                <strong>{bodyReadings[position.body].label}</strong> — {bodyReadings[position.body].reading}{' '}
                {signReadings[position.sign].reading}
                {position.house ? ` ${houseReadings[position.house]?.reading ?? ''}` : ''}
              </li>
            ))}
          </ul>
        </details>
      </section>

      {chart.houses ? (
        <section className="card" aria-labelledby="houses-title">
          <div className="row row--between">
            <h3 className="section-title" id="houses-title">
              {it.astrology.houses}
            </h3>
            <span className="badge">{it.astrology.houseSystemNames[chart.houses.system]}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Casa</th>
                  <th scope="col">Cuspide</th>
                  <th scope="col">{it.result.symbolic}</th>
                </tr>
              </thead>
              <tbody>
                {chart.houses.cusps.map((cusp, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {degrees(cusp % 30)} {signReadings[signOf(cusp)].label}
                    </td>
                    <td className="cell-wrap">{houseReadings[index + 1]?.keywords.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {chart.houseRefusal ? (
        <section className="notice notice--warning" aria-labelledby="refused-title">
          <h3 className="section-title" id="refused-title">
            {it.astrology.refusedTitle}
          </h3>
          <p>{it.astrology.refusedBody}</p>
          <p className="small">{it.astrology.refusedChoose}</p>
        </section>
      ) : null}

      <section className="card" aria-labelledby="aspects-title">
        <div className="row row--between">
          <h3 className="section-title" id="aspects-title">
            {it.astrology.aspects}
          </h3>
          <span className="badge badge--calculated">{it.result.calculated}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Relazione</th>
                <th scope="col">Aspetto</th>
                <th scope="col">{it.astrology.orb}</th>
              </tr>
            </thead>
            <tbody>
              {chart.aspects.map((aspect) => (
                <tr key={`${aspect.a}-${aspect.b}-${aspect.aspect}`}>
                  <td>
                    {pointLabel(aspect.a)} — {pointLabel(aspect.b)}
                  </td>
                  <td>{aspectReadings[aspect.aspect].label}</td>
                  <td>
                    {aspect.orb.toFixed(2)}° / {aspect.allowedOrb}°
                    {aspect.applying === null ? null : (
                      <span className="muted small">
                        {' '}
                        · {aspect.applying ? it.astrology.applying : it.astrology.separating}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className="method">
        <summary>{it.result.showCalculation}</summary>
        <div className="method__body">
          <dl className="method__list">
            <div>
              <dt>{it.astrology.utcUsed}</dt>
              <dd>{provenance.utcIso}</dd>
            </div>
            <div>
              <dt>{it.astrology.offsetUsed}</dt>
              <dd>{formatOffset(provenance.offsetMinutes)}</dd>
            </div>
            <div>
              <dt>{it.astrology.zoneUsed}</dt>
              <dd>{provenance.zoneId}</dd>
            </div>
            <div>
              <dt>{it.astrology.siderealTime}</dt>
              <dd>{chart.localSiderealTime.toFixed(6)} h</dd>
            </div>
            <div>
              <dt>{it.astrology.obliquity}</dt>
              <dd>{chart.obliquity.toFixed(6)}°</dd>
            </div>
            <div>
              <dt>{it.astrology.houseSystem}</dt>
              <dd>{it.astrology.houseSystemNames[provenance.houseSystem]}</dd>
            </div>
            <div>
              <dt>Motore</dt>
              <dd>{provenance.engine}</dd>
            </div>
          </dl>
        </div>
      </details>
          </div>
        </div>
      </details>
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
