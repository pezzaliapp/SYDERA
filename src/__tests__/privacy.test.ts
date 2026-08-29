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

/**
 * The application performs exactly one kind of request: downloading the static
 * birth-place dataset that ships beside it, from its own origin. Nothing else
 * may touch the network, and that one request may never carry user data.
 */
const PLACE_DATASET_LOADER = 'src/core/places/dataset.ts'

describe('no outbound traffic', () => {
  it('never calls a network API from application code, apart from the place dataset loader', () => {
    for (const { file, source } of FILES) {
      if (file === PLACE_DATASET_LOADER) continue
      expect(source, `${file} must not perform network requests`).not.toMatch(
        /\bfetch\s*\(|\bfetcher\s*\(|XMLHttpRequest|sendBeacon|new WebSocket|new EventSource/,
      )
    }
  })

  it('loads the place dataset from the application base, never from a host', () => {
    const source = FILES.find((entry) => entry.file === PLACE_DATASET_LOADER)?.source ?? ''
    expect(source, 'the dataset loader must exist').not.toBe('')
    // The path is relative and is joined to the base the app was served from.
    expect(source).toContain("export const PLACE_DATASET_PATHS = ['data/places-it.txt', 'data/places-world.txt']")
    expect(source).toContain('`${baseUrl}${PLACE_DATASET_URLS[0]}`')
    expect(source).toContain('`${baseUrl}${PLACE_DATASET_URLS[1]}`')
    // No absolute URL and no host.
    expect(source).not.toMatch(/https?:\/\//)
    // The only query string is the build's own dataset fingerprint. Nothing
    // the user types may ever be put into a URL.
    expect(source).toContain('?v=${__SYDERA_PLACES_IT_VERSION__}')
    expect(source).toContain('?v=${__SYDERA_PLACES_WORLD_VERSION__}')
    expect(source).not.toMatch(/encodeURIComponent|\?\$\{query|\?q=/)
  })

  it('never sends a search query anywhere: searching is pure computation', () => {
    const search = FILES.find((entry) => entry.file === 'src/core/places/search.ts')?.source ?? ''
    expect(search).not.toMatch(/fetch|XMLHttpRequest|http/)
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

  it('declares only the reviewed, permissive, cost-free runtime dependencies', () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
    }
    const dependencies = manifest.dependencies ?? {}
    // Each one is licence-reviewed in docs/DEPENDENCIES.md and needs no
    // account, no key and no paid tier. A new entry here must be reviewed
    // before this list is changed.
    expect(Object.keys(dependencies).sort()).toEqual(['astronomy-engine', 'react', 'react-dom'])
    // The astronomy engine is pinned exactly: no floating range.
    expect(dependencies['astronomy-engine']).toBe('2.1.19')
  })
})

describe('no bundled personal data', () => {
  it('ships no preloaded or demo analysis', () => {
    for (const { file, source } of FILES) {
      expect(source, `${file} must not contain a demo profile`).not.toMatch(
        /demoProfile|sampleProfile|exampleProfile|seedProfiles|PROFILO_DEMO/i,
      )
    }
  })

  it('stores one analysis under a fixed key, with no seeded content', () => {
    const store = readFileSync(join(SRC, 'core', 'storage', 'sydera.ts'), 'utf8')
    expect(store).toContain("export const SYDERA_KEY = 'current'")
    expect(store).not.toMatch(/const\s+(INITIAL|DEFAULT)_(PROFILES|SYDERA)/)
  })
})

describe('no profile-management interface', () => {
  const uiFiles = FILES.filter((entry) => entry.file.startsWith('src/views/') || entry.file.startsWith('src/components/'))

  it('presents no profile list, profile creation or profile cards', () => {
    for (const { file, source } of uiFiles) {
      expect(source, `${file} must not reintroduce profile management`).not.toMatch(
        /Profili salvati|Crea un profilo|profileCard|ProfilesView|listProfiles/i,
      )
    }
  })

  it('speaks of "la mia SYDERA" rather than of a profile', () => {
    const content = readFileSync(join(SRC, 'content', 'it.ts'), 'utf8')
    expect(content).toContain('La mia SYDERA')
  })
})

describe('the application never puts back what a person entered before', () => {
  const entry = FILES.find((file) => file.file === 'src/views/EntryView.tsx')?.source ?? ''

  it('has a calculation form that opens empty', () => {
    expect(entry, 'the entry view must exist').not.toBe('')
    // No state initialiser may read the stored record: that is exactly how
    // yesterday's birth date, place and name came back unasked.
    for (const field of ['birthDate', 'birthTime', 'birthTimePrecisionMinutes', 'fullBirthName']) {
      expect(entry, `the form pre-fills ${field}`).not.toMatch(
        new RegExp(`useState[^\\n]*input[?.]*\\.${field}`),
      )
    }
    expect(entry).toContain('useState<BirthDateParts>(dateToParts(null))')
    expect(entry).toContain('useState<BirthTimeParts>(timeToParts(null))')
    expect(entry).toContain("useState('')")
    expect(entry).toContain('useState<Place | null>(null)')
  })

  it('never asks the browser to remember a birth date', () => {
    // "bday-day" and friends are a request to autofill and store a birthday.
    for (const file of FILES) {
      expect(file.source, `${file.file} opts into birthday autofill`).not.toMatch(/autoComplete="bday/)
    }
  })

  it('turns autocomplete off on every personal field', () => {
    for (const name of [
      'src/components/BirthDateField.tsx',
      'src/components/BirthTimeField.tsx',
      'src/components/PlaceField.tsx',
    ]) {
      const source = FILES.find((file) => file.file === name)?.source ?? ''
      expect(source, `${name} not found`).not.toBe('')
      const inputs = source.match(/<input/g)?.length ?? 0
      const offs = source.match(/autoComplete="off"/g)?.length ?? 0
      expect(offs, `${name}: ${offs} of ${inputs} inputs opt out`).toBeGreaterThanOrEqual(inputs - 1)
    }
  })
})

describe('deleting personal data reaches everything SYDERA wrote', () => {
  const prefs = FILES.find((file) => file.file === 'src/core/prefs/preferences.ts')?.source ?? ''

  it('sweeps both web storages, not only localStorage', () => {
    expect(prefs).toContain('sessionStorage')
    expect(prefs).toContain('localStorage')
  })

  it('matches keys left by earlier versions, not only the current prefix', () => {
    expect(prefs).toMatch(/\/\^sydera\[/)
  })
})
