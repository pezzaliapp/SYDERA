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
| Astrology engine | implemented and validated against independent references |
| Historical timezone and UTC conversion | implemented, with ambiguity, gap and pre-1970 handling |
| Birth place resolution | implemented, local dataset, no geocoding service |
| Convergence engine between the two systems | implemented — see `docs/CONVERGENCE_TAXONOMY.md` |
| Period analysis (transits and numerological cycles) | implemented |

SYDERA prefers an empty section to an invented number: without a birth time it
calculates no Ascendant, no Midheaven and no houses, and says so; without a
birth name it calculates no numerology and says so.

Validation summary (observed maxima, tolerances in `docs/ASTROLOGY_VALIDATION.md`):
planetary longitudes within **0.21′** of JPL Horizons, the Moon within
**0.05′**, mean obliquity within **0.0001″** of the IAU 2006 polynomial,
Ascendant and Midheaven **0.0000′** from their geometric definitions, Placidus
cusps **0.0000′** from theirs.

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

Node.js 20 or newer is required (the Pages workflow builds on Node 22). The
output in `dist/` is a set of static files served by any static host.

## Deployment

SYDERA is published to GitHub Pages by `.github/workflows/deploy-pages.yml`,
which runs on every push to `main` using only first-party GitHub actions
(`checkout`, `setup-node`, `configure-pages`, `upload-pages-artifact`,
`deploy-pages`) — no secret, no token, no third-party service, no cost.

The site is served from a sub-directory, `https://www.alessandropezzali.it/SYDERA/`,
so `vite.config.ts` sets `base: '/SYDERA/'`. That value is the single source of
truth: `index.html` references assets through the `%BASE_URL%` placeholder, the
service worker is registered at `` `${import.meta.env.BASE_URL}sw.js` `` with the
same value as its scope, and the worker's own precache entries are relative to
its location. `src/__tests__/deployment.test.ts` fails the build if the manifest,
`index.html` or the worker ever stop agreeing with the configured base.

Routing stays hash-based, so no server rewrite is needed and a reload of any
route resolves to the same document. The repository intentionally contains no
`CNAME` file: the custom domain belongs to the user site, and project pages
inherit it automatically.

### Content Security Policy

`index.html` carries a strict policy — every directive is `'self'`, with no
`'unsafe-inline'`, no `'unsafe-eval'`, no wildcard and no external host. SYDERA
needs no external runtime resource, so nothing is given up by this.

It also serves a privacy purpose. A hosting layer or CDN can inject a script
into the HTML it serves — an analytics or RUM beacon, typically — which would
contradict SYDERA's promise of no analytics and no third-party scripts. Under
`script-src 'self'` such a script is refused by the browser before it runs, so
the promise holds regardless of how the site is hosted.

Two limitations of delivering the policy in a `<meta>` tag rather than an HTTP
header, stated because they are real:

* `frame-ancestors` is ignored in a meta policy, so clickjacking protection
  would need a response header. Static hosting cannot set one; a CDN in front
  of the site could, at no cost.
* A meta policy governs everything the parser encounters after it. The tag sits
  immediately after `<meta charset>`, before any other element, so an injected
  script placed anywhere later in the document is covered — which is where
  edge-injected beacons are placed.

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
