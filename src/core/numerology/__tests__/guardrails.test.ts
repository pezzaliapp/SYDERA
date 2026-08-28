import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Architectural guardrails.
 *
 * The calculation engine must stay deterministic (no clock, no randomness) and
 * must never reach the network. These tests fail loudly if that ever changes.
 */
const ENGINE_DIR = join(process.cwd(), 'src', 'core', 'numerology')

function engineSources(): Array<{ file: string; source: string }> {
  return readdirSync(ENGINE_DIR)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => ({ file, source: readFileSync(join(ENGINE_DIR, file), 'utf8') }))
}

describe('numerology engine guardrails', () => {
  it('contains no source of non-determinism', () => {
    for (const { file, source } of engineSources()) {
      expect(source, `${file} must not read the clock`).not.toMatch(/Date\.now|new Date\(/)
      expect(source, `${file} must not use randomness`).not.toMatch(/Math\.random/)
    }
  })

  it('performs no network access', () => {
    for (const { file, source } of engineSources()) {
      expect(source, `${file} must not perform network access`).not.toMatch(
        /\bfetch\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/,
      )
    }
  })

  it('does not touch persistent storage directly', () => {
    for (const { file, source } of engineSources()) {
      expect(source, `${file} must stay free of storage side effects`).not.toMatch(
        /localStorage|sessionStorage|indexedDB/,
      )
    }
  })
})
