# SYDERA

**Two symbolic systems. One personal profile. Transparent calculations. Private by design.**

SYDERA is a Progressive Web App for personal symbolic analysis that combines
Western natal astrology and Pythagorean numerology, keeping the calculated data
and the symbolic interpretation clearly separated.

Everything runs locally in the browser. There is no account, no server, no
tracking, and no cost of operation.

Concept, design and development: **Alessandro Pezzali**.

---

## Status — Phase 1

| Area | State |
|------|-------|
| Pythagorean numerology engine | implemented and tested |
| Local-first data architecture (IndexedDB) | implemented |
| Application shell, Privacy, Disclaimer, About | implemented |
| PWA: manifest, icons, service worker, offline shell | implemented |
| Astrology engine | researched, **not implemented** — see `docs/ASTROLOGY_ENGINE_RESEARCH.md` |
| Birth place and historical timezone resolution | researched, **not implemented** — see `docs/GEO_TIMEZONE_RESEARCH.md` |
| Convergence engine between the two systems | not started |

No astrological position is displayed until the engine is validated. SYDERA
prefers an empty section to an invented number.

---

## Principles

* **Correctness first.** Calculations are deterministic and reproducible; every
  result carries the derivation that produced it.
* **Two layers, never mixed.** Arithmetic and astronomy on one side, symbolic
  reading on the other, visibly distinguished in the interface.
* **Private by design.** Personal information stays in the browser of the
  device that entered it.
* **Zero cost.** No paid API, no metered service, no subscription, no external
  AI service. Static hosting only.
* **Honest failure.** When something cannot be computed reliably, SYDERA says
  so instead of guessing.

---

## Architecture

```
src/
  core/
    numerology/   deterministic Pythagorean engine (no clock, no I/O, no network)
    storage/      IndexedDB profile repository and the "delete everything" path
    prefs/        localStorage, application preferences only
  content/        every user-facing string, and the symbolic reading layer
  app/            hash router, theme and data hooks
  components/     shell, dialogue, number card
  views/          one file per screen
  pwa/            service worker registration and update flow
build/            service worker template used by the build
scripts/          deterministic PWA icon generation (no image dependency)
docs/             research and method documentation
```

Runtime dependencies: `react` and `react-dom`. Routing, storage, the service
worker and the icon pipeline are part of the project rather than imported —
see `docs/DEPENDENCIES.md` for the full licence audit.

---

## Getting started

```bash
npm install       # install dependencies
npm run dev       # development server
npm test          # run the test suite
npm run typecheck # TypeScript, strict
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

Node.js 20 or newer is required. The build output in `dist/` is a set of static
files that can be served by any static host, including GitHub Pages: the app
uses a relative base path and hash routing, so it works from any sub-path
without server rewrites.

---

## Privacy

* No account, registration or login.
* Profiles are stored in IndexedDB on the device; preferences (theme, disclaimer
  acknowledgement) in localStorage. Nothing else is stored.
* No analytics, telemetry, advertising, fingerprinting or third-party scripts.
* No remote fonts, no external requests: the application makes no network calls
  of its own once loaded.
* Individual profiles can be deleted, and Settings offers a complete
  **delete all my data** command with an explicit confirmation. Deletion is
  reported as done only once the browser has actually removed the database; if
  another SYDERA tab is holding it open, nothing is deleted and the user is
  asked to close that tab and retry. A dedicated confirmation screen states
  what was removed before the app returns to its initial state.

The behaviour above is enforced by tests in `src/__tests__/privacy.test.ts`,
which fail the build if application code introduces a network call, a tracker,
a remote asset or a bundled demo profile.

The application ships with no preloaded profile, no sample profile and no demo
mode. It starts empty.

---

## Disclaimer

SYDERA is a personal exploration tool based on the traditional symbolic systems
of Western astrology and Pythagorean numerology. Astrology and numerology are
not scientifically validated predictive methods; results are provided for
informational, cultural and personal reflection purposes. Astronomical and
numerical values may come from mathematical calculation, while their
interpretation belongs to symbolic traditions and is not scientific evidence
about personality, compatibility or future events.

SYDERA does not provide medical, psychological, psychiatric, financial,
investment, legal or employment advice, and must not be the sole basis for
important personal decisions. To the extent permitted by applicable law, the
developer is not responsible for decisions, actions or consequences arising
from reliance on the symbolic interpretations it provides.

The full documents are available inside the application, in separate Privacy
and Disclaimer sections, and the disclaimer requires explicit acknowledgement
before the first personal analysis.

---

## Documentation

* `docs/NUMEROLOGY_METHOD.md` — exactly which numerological conventions are
  implemented, and where schools disagree.
* `docs/ASTROLOGY_ENGINE_RESEARCH.md` — evaluation of astronomy libraries,
  licences and costs, with the recommended engine and its validation plan.
* `docs/GEO_TIMEZONE_RESEARCH.md` — birth place resolution and historical
  timezone accuracy without paid or privacy-invasive services.
* `docs/DEPENDENCIES.md` — dependency policy and full licence audit.

---

## Tests

```bash
npm test
```

The suite covers digit reduction and master numbers, the Pythagorean mapping,
name normalisation (diacritics, ligatures, apostrophes, hyphens, unsupported
alphabets), the Y classification rule, the core numbers, cycles, pinnacles and
challenges, input validation and refusal paths, engine determinism, view
rendering, preference handling and the privacy guardrails. All fixtures are
synthetic technical values; no real personal data is used anywhere in the
repository.

---

## Licence

MIT — see `LICENSE`. Copyright (c) 2026 Alessandro Pezzali.
