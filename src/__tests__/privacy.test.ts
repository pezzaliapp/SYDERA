import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Privacy and zero-cost guardrails enforced on the source tree.
 *
 * SYDERA promises that no personal data leaves the device and that the
 * application makes no third-party requests. These tests turn that promise
 * into something a build can verify.
 */
const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.(ts|tsx|css)$/.test(entry) ? [full] : []
  })
}

// Test files themselves are excluded: they legitimately name the patterns
// they forbid.
const FILES = sourceFiles(SRC)
  .filter((file) => !file.includes('__tests__'))
  .map((file) => ({ file: file.slice(ROOT.length + 1), source: readFileSync(file, 'utf8') }))

describe('no outbound traffic', () => {
  it('never calls a network API from application code', () => {
    for (const { file, source } of FILES) {
      expect(source, `${file} must not perform network requests`).not.toMatch(
        /\bfetch\s*\(|XMLHttpRequest|sendBeacon|new WebSocket|new EventSource/,
      )
    }
  })

  it('contains no analytics, telemetry or tracking endpoints', () => {
    for (const { file, source } of FILES) {
      expect(source, `${file} must stay free of trackers`).not.toMatch(
        /google-analytics|googletagmanager|gtag\(|mixpanel|segment\.io|sentry\.io|plausible|hotjar|facebook\.net/i,
      )
    }
  })

  it('loads no remote fonts or stylesheets', () => {
    for (const { file, source } of FILES) {
      expect(source, `${file} must not import remote assets`).not.toMatch(/fonts\.googleapis|fonts\.gstatic|@import\s+url\(\s*['"]?https?:/i)
    }
  })

  it('keeps index.html free of external resources', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
    const externalReferences = html.match(/(?:src|href)\s*=\s*"https?:\/\/[^"]+"/g) ?? []
    expect(externalReferences).toEqual([])
  })
})

describe('no external AI or paid services', () => {
  it('references no AI provider endpoints or SDKs', () => {
    for (const { file, source } of FILES) {
      expect(source, `${file} must not depend on an external AI service`).not.toMatch(
        /api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis|openai|anthropic/i,
      )
    }
  })

  it('declares only permissive, cost-free dependencies', () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
    }
    expect(Object.keys(manifest.dependencies ?? {}).sort()).toEqual(['react', 'react-dom'])
  })
})

describe('no bundled personal profiles', () => {
  it('ships no preloaded or demo profile', () => {
    for (const { file, source } of FILES) {
      expect(source, `${file} must not contain a demo profile`).not.toMatch(
        /demoProfile|sampleProfile|exampleProfile|seedProfiles|PROFILO_DEMO/i,
      )
    }
  })

  it('keeps the profile store empty until the user creates a profile', () => {
    const profiles = readFileSync(join(SRC, 'core', 'storage', 'profiles.ts'), 'utf8')
    expect(profiles).not.toMatch(/const\s+(INITIAL|DEFAULT)_PROFILES/)
  })
})
