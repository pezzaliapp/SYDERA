# Dependency policy and licence audit

Author: Alessandro Pezzali
Reviewed: August 2026

## Policy

Before any package enters SYDERA it must satisfy all of the following:

1. permissive licence (MIT, BSD, Apache-2.0, ISC, CC0 or equivalent);
2. no account, API key or credential of any kind;
3. no possibility of generating a monetary cost, now or through a quota;
4. no outbound network traffic at runtime;
5. no tracking, fingerprinting or telemetry;
6. workable inside a static, offline-capable PWA;
7. small enough to be reasonable on a mobile connection;
8. maintained, or stable and self-contained enough that a pinned version is
   safe.

If a candidate fails any point, the problem is documented and the dependency is
not added.

## Runtime dependencies

The application ships exactly two runtime packages.

| Package | Version | Licence | Network | Cost | Notes |
|---------|---------|---------|---------|------|-------|
| react | 19.x | MIT | none | none | UI library |
| react-dom | 19.x | MIT | none | none | DOM renderer |
| astronomy-engine | **2.1.19, pinned exactly** | MIT | none | none | planetary and lunar positions; no dependencies, ~116 kB minified, re-verified immediately before installation |

Everything else — routing, storage, the service worker, the PWA icons, the
numerology engine, the historical timezone layer, the Ascendant, houses,
aspects, convergences and the place search — is written inside the project
rather than imported, which keeps the audited surface small.

The birth-place dataset is data, not code: a trimmed extract of GeoNames
(CC BY 4.0) shipped as a static file, downloaded from the application's own
origin the first time a place is searched, and attributed in
`THIRD_PARTY_NOTICES.md`.

## Build and test dependencies

Development-only; none of these reach the user's browser.

| Package | Version | Licence |
|---------|---------|---------|
| vite | 7.x | MIT |
| @vitejs/plugin-react | 5.x | MIT |
| vitest | 3.x | MIT |
| typescript | 5.9.x | Apache-2.0 |
| @types/react | 19.x | MIT |
| @types/react-dom | 19.x | MIT |
| @types/node | 24.x | MIT |

## Transitive licence survey

The installed tree contains 104 packages. Licence distribution:

| Licence | Packages |
|---------|----------|
| MIT | 93 |
| ISC | 6 |
| Apache-2.0 | 3 (typescript, expect-type, baseline-browser-mapping) |
| BSD-3-Clause | 1 (source-map-js) |
| CC-BY-4.0 | 1 (caniuse-lite, build-time browser data) |

No copyleft licence is present. No package requires an account, a key or a paid
plan. `npm audit --omit=dev` reports 0 vulnerabilities.

## Deliberately rejected

| Candidate | Reason |
|-----------|--------|
| Swiss Ephemeris (any binding) | AGPL propagation, or a paid professional licence (CHF 750) |
| `@photostructure/tz-lookup` and similar | not needed: the dataset carries each place's IANA zone, and manual entry covers the rest |
| Any hosted astrology or ephemeris API | metered cost, and would transmit birth data off-device |
| Any geocoding API | cost risk and privacy exposure |
| Any analytics or telemetry SDK | forbidden by the privacy architecture |
| Any external AI or LLM API | forbidden by the project rules; interpretation is deterministic and local |
| `moment` / `moment-timezone` | bundles a copy of the timezone database the browser already ships |
| A PWA plugin (workbox and friends) | a hand-written service worker covers the need with no added surface |
| A routing library | hash routing for eight views is a few dozen lines |
| An IndexedDB wrapper | one object store does not justify a dependency on the storage path |

## Verification procedure

Run before every release:

```
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Licence review is repeated whenever a dependency is added or upgraded, and the
tables above are updated in the same commit.
