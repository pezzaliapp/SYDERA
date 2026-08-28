import { it } from '../content/it.ts'
import { paths } from '../app/router.ts'

export function NotFoundView({ path }: { readonly path: string }) {
  return (
    <>
      <h1 className="page-title">404</h1>
      <p className="page-intro muted">{path}</p>
      <div className="row">
        <a className="button button--primary" href={paths.start}>
          {it.nav.myS}
        </a>
      </div>
    </>
  )
}
