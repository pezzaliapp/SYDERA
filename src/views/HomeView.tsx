import { it } from '../content/it.ts'
import { paths } from '../app/router.ts'
import type { ProfilesState } from '../app/useProfiles.ts'

export function HomeView({ profiles }: { readonly profiles: ProfilesState }) {
  const hasProfiles = profiles.status === 'ready' && profiles.profiles.length > 0

  return (
    <>
      <div className="stack stack--tight">
        <p className="eyebrow">{it.app.name}</p>
        <h1 className="page-title">{it.home.title}</h1>
        <p className="page-intro">{it.app.summary}</p>
      </div>

      <section className="card" aria-labelledby="home-profiles">
        <h2 className="section-title" id="home-profiles">
          {profiles.status === 'ready' && !hasProfiles ? it.home.emptyTitle : it.home.profilesTitle}
        </h2>
        {profiles.status === 'loading' ? <p className="muted">{it.common.loading}</p> : null}
        {profiles.status === 'unavailable' ? <p className="notice notice--warning">{it.common.storageUnavailable}</p> : null}
        {profiles.status === 'error' ? <p className="notice notice--danger">{profiles.message}</p> : null}
        {profiles.status === 'ready' && !hasProfiles ? <p className="muted">{it.home.emptyBody}</p> : null}
        {hasProfiles ? (
          <ul className="list-plain">
            {profiles.profiles.map((profile) => (
              <li key={profile.id}>
                <a className="button" href={paths.analysis(profile.id)}>
                  {profile.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="row">
          <a className="button button--primary" href={paths.profileNew}>
            {it.home.createProfile}
          </a>
        </div>
      </section>

      <section className="card" aria-labelledby="home-status">
        <h2 className="section-title" id="home-status">
          {it.home.statusTitle}
        </h2>
        <dl className="definition-list">
          <dt>{it.home.statusNumerology}</dt>
          <dd>{it.home.statusNumerologyValue}</dd>
          <dt>{it.home.statusAstrology}</dt>
          <dd>{it.home.statusAstrologyValue}</dd>
          <dt>{it.home.statusConvergence}</dt>
          <dd>{it.home.statusConvergenceValue}</dd>
        </dl>
        <p className="small muted">{it.home.statusAstrologyNote}</p>
      </section>

      <section className="card card--quiet" aria-labelledby="home-storage">
        <h2 className="section-title" id="home-storage">
          {it.home.storageTitle}
        </h2>
        <p className="muted">{it.home.storageBody}</p>
        <div className="row">
          <a className="button" href={paths.privacy}>
            {it.nav.privacy}
          </a>
          <a className="button" href={paths.disclaimer}>
            {it.nav.disclaimer}
          </a>
        </div>
      </section>
    </>
  )
}
