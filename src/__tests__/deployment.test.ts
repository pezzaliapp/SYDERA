import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Deployment-path guardrails.
 *
 * SYDERA is published under a sub-directory (/SYDERA/), not at a domain root.
 * Every path that has to agree with that base is checked here, so the site can
 * never be published with references that only work from "/".
 */
const ROOT = process.cwd()
const viteConfig = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8')
const manifest = JSON.parse(readFileSync(join(ROOT, 'public', 'manifest.webmanifest'), 'utf8')) as {
  id: string
  start_url: string
  scope: string
  icons: Array<{ src: string }>
}

/** The single source of truth: the base declared in the Vite configuration. */
const base = (/base:\s*'([^']+)'/.exec(viteConfig)?.[1] ?? '') as string

describe('deployment base', () => {
  it('declares an absolute sub-directory base ending in a slash', () => {
    expect(base).toBe('/SYDERA/')
    expect(base.startsWith('/')).toBe(true)
    expect(base.endsWith('/')).toBe(true)
  })
})

describe('web app manifest', () => {
  it('keeps start_url, scope and id inside the deployment sub-directory', () => {
    expect(manifest.start_url).toBe(base)
    expect(manifest.scope).toBe(base)
    expect(manifest.id).toBe(base)
  })

  it('points every icon at the deployment sub-directory', () => {
    expect(manifest.icons.length).toBeGreaterThan(0)
    for (const icon of manifest.icons) {
      expect(icon.src, `${icon.src} must live under ${base}`).toMatch(new RegExp(`^${base}`))
    }
  })

  it('assumes no domain root and no external host', () => {
    const serialised = JSON.stringify(manifest)
    expect(serialised).not.toMatch(/"\/(?!SYDERA\/)/)
    expect(serialised).not.toMatch(/https?:\/\//)
  })
})

describe('index.html', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1] as string)

  it('references every asset through the base placeholder or the Vite entry', () => {
    for (const reference of references) {
      const derivesFromBase = reference.startsWith('%BASE_URL%')
      const isViteEntry = reference === '/src/main.tsx'
      expect(derivesFromBase || isViteEntry, `${reference} does not follow the deployment base`).toBe(true)
    }
  })

  it('assumes no domain root and loads nothing from another host', () => {
    expect(references.some((reference) => reference.startsWith('./'))).toBe(false)
    expect(html).not.toMatch(/(?:src|href)="https?:\/\//)
  })
})

describe('service worker registration', () => {
  const source = readFileSync(join(ROOT, 'src', 'pwa', 'registerServiceWorker.ts'), 'utf8')

  it('derives its path and scope from the Vite base instead of hard-coding them', () => {
    expect(source).toContain('import.meta.env.BASE_URL')
    expect(source).toContain('${base}sw.js')
    expect(source).toContain('scope: base')
    expect(source).not.toMatch(/register\('\/sw\.js'|scope: '\/'/)
  })
})

describe('service worker template', () => {
  const template = readFileSync(join(ROOT, 'build', 'sw-template.js'), 'utf8')

  it('uses only paths relative to its own location, so it follows the base', () => {
    // The worker is served from <base>sw.js: './x' therefore resolves to
    // <base>x. An absolute '/x' would silently point at the domain root.
    expect(template).not.toMatch(/(match|add|put|fetch)\(\s*'\//)
  })
})

describe('GitHub Pages workflow', () => {
  const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'deploy-pages.yml'), 'utf8')

  it('uses only official first-party actions', () => {
    const actions = [...workflow.matchAll(/uses:\s*(\S+)/g)].map((match) => match[1] as string)
    expect(actions.length).toBeGreaterThan(0)
    for (const action of actions) {
      expect(action, `${action} is not an official GitHub action`).toMatch(/^actions\//)
    }
  })

  it('builds with npm ci and npm run build and publishes dist/', () => {
    expect(workflow).toContain('npm ci')
    expect(workflow).toContain('npm run build')
    expect(workflow).toContain('actions/upload-pages-artifact')
    expect(workflow).toMatch(/path:\s*dist/)
  })

  it('requests the minimum permissions Pages deployment needs', () => {
    expect(workflow).toMatch(/contents:\s*read/)
    expect(workflow).toMatch(/pages:\s*write/)
    expect(workflow).toMatch(/id-token:\s*write/)
  })

  it('introduces no secret, token or external service', () => {
    expect(workflow).not.toMatch(/secrets\.|\$\{\{\s*secrets/)
    expect(workflow).not.toMatch(/https?:\/\/(?!www\.alessandropezzali\.it)/)
  })
})
