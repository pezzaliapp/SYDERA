import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}

/** The commit the build came from, so a running app can be identified. */
function commitSha(): string {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    return 'sconosciuto'
  }
}

/**
 * A fingerprint of the place dataset.
 *
 * The file lives in `public/`, so Vite does not hash its name, and it is
 * requested at a URL that never changes. A service worker that had cached the
 * previous release's copy therefore kept serving it for ever: the application
 * shipped with alternate names for Italian places while the browser was still
 * reading a file that had none, and "Firenze" found nothing. Carrying this
 * fingerprint in the query string means a release can never read another
 * release's dataset, whatever any cache decides to keep.
 */
function placesVersion(): string {
  const file = readFileSync(new URL('./public/data/places.txt', import.meta.url))
  return createHash('sha256').update(file).digest('hex').slice(0, 12)
}

/**
 * SYDERA service worker plugin.
 *
 * Deliberately hand-written instead of pulling in a PWA plugin dependency:
 * the app shell is small, the precache list is fully derivable from the
 * bundle, and this keeps the dependency surface (and therefore the licence
 * and supply-chain surface) minimal.
 *
 * The generated worker:
 *  - precaches the built application shell;
 *  - serves navigations from cache when offline;
 *  - never touches the network for anything other than same-origin assets.
 */
function syderaServiceWorker(): Plugin {
  return {
    name: 'sydera-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const precache = new Set<string>(['./', './index.html', './manifest.webmanifest'])
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName === 'sw.js') continue
        // Source maps are not needed offline.
        if (fileName.endsWith('.map')) continue
        if (chunk.type === 'asset' || chunk.type === 'chunk') {
          precache.add(`./${fileName}`)
        }
      }
      for (const icon of [
        './icons/icon-192.png',
        './icons/icon-512.png',
        './icons/icon-maskable-512.png',
      ]) {
        precache.add(icon)
      }

      const manifest = [...precache].sort()
      // The dataset is not part of the bundle, so hashing the file list alone
      // left the worker byte-identical when only the dataset changed — and a
      // worker that does not change is a worker that never activates.
      const version = createHash('sha256')
        .update(manifest.join('\n'))
        .update(placesVersion())
        .digest('hex')
        .slice(0, 12)
      const template = readFileSync(new URL('./build/sw-template.js', import.meta.url), 'utf8')
      const source = template
        .replace('__SYDERA_CACHE_VERSION__', version)
        .replace('__SYDERA_PRECACHE_MANIFEST__', JSON.stringify(manifest, null, 2))

      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({
  // SYDERA is published as a GitHub Pages project site, served from the
  // /SYDERA/ sub-directory (https://www.alessandropezzali.it/SYDERA/).
  // Everything that needs to know the deployment path derives it from here:
  // the service worker registration uses import.meta.env.BASE_URL, and a test
  // asserts that public/manifest.webmanifest stays in step with this value.
  base: '/SYDERA/',
  plugins: [react(), syderaServiceWorker()],
  define: {
    __SYDERA_VERSION__: JSON.stringify(packageJson.version),
    __SYDERA_COMMIT__: JSON.stringify(commitSha()),
    __SYDERA_BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __SYDERA_PLACES_VERSION__: JSON.stringify(placesVersion()),
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
