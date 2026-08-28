import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

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
      const version = createHash('sha256').update(manifest.join('\n')).digest('hex').slice(0, 12)
      const template = readFileSync(new URL('./build/sw-template.js', import.meta.url), 'utf8')
      const source = template
        .replace('__SYDERA_CACHE_VERSION__', version)
        .replace('__SYDERA_PRECACHE_MANIFEST__', JSON.stringify(manifest, null, 2))

      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({
  // Relative base: the build works on GitHub Pages project pages, on a custom
  // domain, or from any sub-path, without rebuilding.
  base: './',
  plugins: [react(), syderaServiceWorker()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
