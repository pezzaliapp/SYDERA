import { useEffect, useState } from 'react'
import { it } from '../content/it.ts'
import { paths } from '../app/router.ts'
import { NumberCard } from '../components/NumberCard.tsx'
import { MethodDisclosure } from '../components/MethodDisclosure.tsx'
import { getProfile } from '../core/storage/profiles.ts'
import { computeNumerologyProfile, type NumerologyProfile } from '../core/numerology/profile.ts'
import { themeFor } from '../content/numerologyThemes.it.ts'
import type { StoredProfile } from '../core/storage/types.ts'
import type { NumerologyIssue } from '../core/numerology/types.ts'

type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'missing' }
  | { readonly status: 'error'; readonly message: string }
  | {
      readonly status: 'ready'
      readonly profile: StoredProfile
      readonly result: NumerologyProfile | null
      readonly issues: readonly NumerologyIssue[]
      readonly warnings: readonly NumerologyIssue[]
    }

export function AnalysisView({ profileId }: { readonly profileId: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    getProfile(profileId)
      .then((profile) => {
        if (cancelled) return
        if (!profile) {
          setState({ status: 'missing' })
          return
        }
        // The reference date belongs to the interface, not to the engine: the
        // engine stays deterministic and receives it as an explicit input.
        const now = new Date()
        const outcome = computeNumerologyProfile({
          fullBirthName: profile.fullBirthName,
          birthDate: profile.birthDate,
          referenceDate: { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() },
        })
        setState(
          outcome.ok
            ? { status: 'ready', profile, result: outcome.value, issues: [], warnings: outcome.warnings }
            : { status: 'ready', profile, result: null, issues: outcome.issues, warnings: [] },
        )
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
      })
    return () => {
      cancelled = true
    }
  }, [profileId])

  if (state.status === 'loading') return <p className="muted">{it.common.loading}</p>
  if (state.status === 'error') return <p className="notice notice--danger">{state.message}</p>
  if (state.status === 'missing') {
    return (
      <>
        <h1 className="page-title">{it.analysis.title}</h1>
        <p className="notice notice--warning">{it.profiles.empty}</p>
        <a className="button" href={paths.profiles}>
          {it.nav.profiles}
        </a>
      </>
    )
  }

  const { profile, result, issues, warnings } = state

  return (
    <>
      <div className="stack stack--tight">
        <p className="eyebrow">{profile.label}</p>
        <h1 className="page-title">{it.analysis.title}</h1>
        <p className="page-intro">{it.analysis.layerNote}</p>
      </div>

      {issues.length > 0 ? (
        <section className="notice notice--warning" aria-labelledby="analysis-issues">
          <h2 className="section-title" id="analysis-issues">
            {it.analysis.notCalculable}
          </h2>
          <ul className="bullets">
            {issues.map((issue) => (
              <li key={issue.code}>
                {issueText(issue)}
                {issue.detail ? `: ${issue.detail}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result ? (
        <>
          {warnings.length > 0 ? (
            <p className="notice small">
              {it.analysis.normalisedName}
              {warnings.map((warning) => (warning.detail ? ` — ${warning.detail}` : '')).join('')}
            </p>
          ) : null}

          <section className="card" aria-labelledby="core-numbers">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 className="section-title" id="core-numbers">
                {it.analysis.coreNumbers}
              </h2>
              <span className="badge badge--calculated">{it.analysis.calculatedLayer}</span>
            </div>
            <div className="grid">
              <NumberCard
                name={it.analysis.numbers.lifePath}
                source={it.analysis.sources.lifePath}
                result={result.lifePath}
              />
              <NumberCard
                name={it.analysis.numbers.expression}
                source={it.analysis.sources.expression}
                result={result.expression}
              />
              <NumberCard
                name={it.analysis.numbers.soulUrge}
                source={it.analysis.sources.soulUrge}
                result={result.soulUrge}
              />
              <NumberCard
                name={it.analysis.numbers.personality}
                source={it.analysis.sources.personality}
                result={result.personality}
              />
              <NumberCard
                name={it.analysis.numbers.birthday}
                source={it.analysis.sources.birthday}
                result={result.birthday}
              />
              <NumberCard
                name={it.analysis.numbers.maturity}
                source={it.analysis.sources.maturity}
                result={result.maturity}
              />
            </div>
            <MethodDisclosure options={result.options} />
          </section>

          <section className="card" aria-labelledby="cycles">
            <h2 className="section-title" id="cycles">
              {it.analysis.cycles}
            </h2>
            <p className="small muted">
              {it.analysis.referenceDate}: {formatReference(result)}
            </p>
            <div className="grid">
              <NumberCard
                name={it.analysis.numbers.personalYear}
                source={it.analysis.sources.personalYear}
                result={result.personalYear}
              />
              <NumberCard
                name={it.analysis.numbers.personalMonth}
                source={it.analysis.sources.personalMonth}
                result={result.personalMonth}
              />
              <NumberCard
                name={it.analysis.numbers.personalDay}
                source={it.analysis.sources.personalDay}
                result={result.personalDay}
              />
            </div>
          </section>

          <section className="card" aria-labelledby="pinnacles">
            <h2 className="section-title" id="pinnacles">
              {it.analysis.pinnacles}
            </h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">{it.analysis.calculatedLayer}</th>
                    <th scope="col">{it.analysis.ageRange}</th>
                    <th scope="col">{it.analysis.interpretationLayer}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.pinnacles.map((pinnacle) => (
                    <tr key={pinnacle.index}>
                      <td>{pinnacle.index}</td>
                      <td>
                        {pinnacle.value}
                        {pinnacle.isMaster ? ' ★' : ''}
                      </td>
                      <td>
                        {pinnacle.endAge === null
                          ? `${it.analysis.fromAge} ${pinnacle.startAge} ${it.analysis.onwards}`
                          : `${pinnacle.startAge}–${pinnacle.endAge}`}
                      </td>
                      <td style={{ whiteSpace: 'normal' }}>{themeFor(pinnacle.value)?.keywords.join(', ') ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" aria-labelledby="challenges">
            <h2 className="section-title" id="challenges">
              {it.analysis.challenges}
            </h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">{it.analysis.calculatedLayer}</th>
                    <th scope="col">{it.analysis.method}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.challenges.map((challenge) => (
                    <tr key={challenge.index}>
                      <td>{challenge.index}</td>
                      <td>{challenge.value}</td>
                      <td>{challenge.expression}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" aria-labelledby="letters">
            <h2 className="section-title" id="letters">
              {it.analysis.letterTable}
            </h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">{it.profileForm.nameField}</th>
                    <th scope="col">{it.analysis.calculatedLayer}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.nameAnalysis.words.map((word, index) => (
                    <tr key={`${word.source}-${index}`}>
                      <td>{word.source}</td>
                      <td>
                        {word.letters
                          .map(
                            (letter) =>
                              `${letter.letter}=${letter.value} (${
                                letter.letterClass === 'vowel' ? it.analysis.vowel : it.analysis.consonant
                              })`,
                          )
                          .join(' · ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <section className="card card--quiet" aria-labelledby="astrology-pending">
        <h2 className="section-title" id="astrology-pending">
          {it.analysis.astrologyPending}
        </h2>
        <p className="muted">{it.analysis.astrologyPendingBody}</p>
      </section>
    </>
  )
}

function formatReference(result: NumerologyProfile): string {
  const { year, month, day } = result.referenceDate
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

function issueText(issue: NumerologyIssue): string {
  switch (issue.code) {
    case 'name-empty':
      return it.profileForm.requiredName
    case 'name-unsupported-characters':
      return 'Il nome contiene caratteri non previsti dalla mappatura pitagorica implementata'
    case 'date-invalid':
      return it.profileForm.invalidDate
    case 'date-out-of-range':
      return it.profileForm.outOfRangeDate
    case 'reference-date-invalid':
      return it.profileForm.invalidDate
    case 'name-normalised':
      return it.analysis.normalisedName
    default:
      return it.common.error
  }
}
