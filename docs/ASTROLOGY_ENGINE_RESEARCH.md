# Astrology engine research

Status: **research complete — implementation not yet started**
Date: August 2026
Author: Alessandro Pezzali

This document is the mandatory evaluation required before any astrology
dependency is added to SYDERA. No astrological library is installed in the
repository at the time of writing, and none will be until the decisions below
are confirmed.

---

## 1. Requirements the engine must satisfy

| # | Requirement | Reason |
|---|-------------|--------|
| R1 | Geocentric apparent ecliptic longitude of Sun, Moon, Mercury…Pluto | Core natal chart |
| R2 | Accuracy sufficient to determine sign, house and aspect without ambiguity (target ≤ 1 arcminute) | Credibility of the result |
| R3 | Runs entirely in the browser, offline, after installation | Local-first architecture |
| R4 | No API key, no account, no metered service, no possible billing | Zero-cost requirement |
| R5 | Licence compatible with a public, permissively licensed open-source PWA | Redistribution |
| R6 | Deterministic: identical input always produces an identical result | Testability |
| R7 | Reasonable download size for a mobile PWA (target ≤ ~500 kB for the astronomy layer) | Mobile and foldable devices |
| R8 | Ascendant, Midheaven and house cusps — natively or computable on top of the library | Natal chart completeness |
| R9 | Correct handling of the conversion from local civil birth time to UTC | Historical timezone accuracy |
| R10 | Maintained, or stable and self-contained enough that a frozen version is acceptable | Long-term viability |

R9 is deliberately **not** an astronomy-library concern: it is handled by the
geographic and timezone layer described in `GEO_TIMEZONE_RESEARCH.md`. The
astronomy engine must receive an unambiguous UTC instant.

---

## 2. Candidates evaluated

### 2.1 astronomy-engine (`astronomy-engine`)

* Repository: https://github.com/cosinekitty/astronomy
* Latest published version at time of review: 2.1.19
* Licence: **MIT**
* Runtime dependencies: **none**
* Origin of the model: truncated VSOP87 series for the planets, plus models
  derived from NOVAS C 3.1; the project states an accuracy target of better
  than ±1 arcminute and is unit-tested against NOVAS, JPL Horizons and other
  reference sources.

Assessment against the requirements:

* R1 — satisfied. Provides heliocentric and geocentric vectors, ecliptic and
  equatorial coordinates, and includes Pluto.
* R2 — satisfied within the documented validity window (Pluto is the limiting
  body; the published model is intended for roughly 1700–2200).
* R3 — satisfied. Pure JavaScript/TypeScript, no binary, no data files to
  fetch at runtime, no network access.
* R4 — satisfied. Library only, no service.
* R5 — satisfied. MIT is compatible with the SYDERA licence and with GitHub
  Pages redistribution.
* R6 — satisfied. Pure functions of a time value.
* R7 — acceptable. The package is a single self-contained module; the
  astronomical part of the bundle stays well inside the target once tree
  shaking removes unused features.
* R8 — **not provided.** The library gives sidereal time and coordinate
  transforms, but no astrological house system and no Ascendant helper. Those
  must be implemented inside SYDERA (see section 4).
* R9 — out of scope for the library, as intended.
* R10 — the codebase is mature and its last release predates this review by
  a considerable margin. This is judged acceptable because the library is
  self-contained, has no dependencies, and implements fixed astronomical
  models that do not need frequent updates; a pinned version remains valid.

### 2.2 astronomia (`astronomia`)

* Repository: https://github.com/commenthol/astronomia
* Licence: **MIT**, no runtime dependencies, actively updated.
* A comprehensive JavaScript port of the algorithms in Jean Meeus,
  *Astronomical Algorithms*, plus optional VSOP87 data modules.

Assessment: technically suitable and permissively licensed, but the
astronomical result must be assembled by the caller from lower-level building
blocks (nutation, aberration, light-time, frame conversions), and the VSOP87
data modules are large if full precision is required. It is a strong
**secondary reference for cross-validation**, and a fallback if the primary
choice ever becomes untenable, but it demands materially more calculation code
in SYDERA for the same result.

### 2.3 Swiss Ephemeris (`sweph`, `swisseph`, WebAssembly ports)

* Upstream: Astrodienst AG.
* Licence: dual — **AGPL-3.0** or a **paid professional licence**. The
  published professional licence fee is CHF 750 for the first licence
  (additional licences CHF 400), which is by itself disqualifying under the
  zero-cost requirement. The npm package `sweph` currently declares
  `(AGPL-3.0-or-later OR LGPL-3.0-or-later)`, which does **not** match the
  upstream dual model as documented by Astrodienst; that discrepancy would
  have to be clarified in writing with the rights holder before any use.

Assessment: **rejected for Phase 2.**

* The AGPL branch would force the entire SYDERA application under AGPL or a
  compatible licence, changing the project's licensing model.
* The commercial branch costs money, which the project forbids.
* The Node binding is a native addon and cannot run in a browser; the
  WebAssembly ports carry the same AGPL terms and additionally require
  shipping multi-megabyte ephemeris files.
* Accuracy is excellent, but no requirement of SYDERA needs sub-arcsecond
  precision.

This rejection is about licence and cost, not quality.

### 2.4 circular-natal-horoscope-js

* Licence: Unlicense (public-domain dedication).
* Provides a complete astrological layer — houses, Ascendant, aspects — which
  is attractive, but it depends on `moment`, `moment-timezone` and the older
  `tz-lookup`, its last release dates from 2022, and its planetary positions
  come from its own simplified model whose accuracy is not documented against
  a reference ephemeris.

Assessment: **not adopted as the calculation engine.** Its house and aspect
formulations are useful reading, and it can serve as a rough independent
cross-check during development, but SYDERA cannot present positions whose
error budget is unknown.

### 2.5 Remote ephemeris services (JPL Horizons, astrology APIs)

Assessment: **rejected on principle.** Any remote lookup would transmit birth
date, time and location to a third party, contradicting the privacy
architecture, and metered or commercial astrology APIs contradict the
zero-cost requirement. Free public services additionally introduce rate limits
and an availability dependency that would break offline operation.

---

## 3. Comparison summary

| Candidate | Licence | Cost | Offline | Browser | Positions | Houses/ASC | Verdict |
|-----------|---------|------|---------|---------|-----------|------------|---------|
| astronomy-engine | MIT | none | yes | yes | documented, ≤1′ | no | **recommended** |
| astronomia | MIT | none | yes | yes | Meeus/VSOP87, configurable | no | viable alternative / cross-check |
| Swiss Ephemeris | AGPL or paid | CHF 750 professional | yes | via WASM only | highest | yes | rejected (licence + cost) |
| circular-natal-horoscope-js | Unlicense | none | yes | yes | undocumented accuracy | yes | reference only |
| Remote APIs | varies | metered | no | yes | varies | varies | rejected (privacy + cost) |

---

## 4. Recommended architecture

**Recommended engine: `astronomy-engine` (MIT), pinned to an exact version.**

SYDERA implements the astrological layer itself on top of it:

1. **Time layer** — local civil birth time plus the resolved historical UTC
   offset produce a UTC instant; the instant, the offset and the source of the
   offset are stored with the chart so a result can always be reproduced.
2. **Astronomy layer** — `astronomy-engine` returns apparent geocentric
   ecliptic longitudes and latitudes for the ten bodies.
3. **Chart layer (SYDERA code, fully unit-tested)**
   * obliquity of the ecliptic and local apparent sidereal time;
   * Ascendant and Midheaven from sidereal time, obliquity and geographic
     latitude;
   * house cusps: whole-sign and equal houses first (closed formulas, no
     failure cases), then Placidus, which is undefined at extreme latitudes
     and must degrade explicitly rather than silently;
   * aspects with configurable orbs, computed from longitudes only.
4. **Presentation layer** — every displayed position carries its calculated
   value, and the interface keeps the calculated layer separate from the
   symbolic reading.

### Explicit failure modes to implement

* Birth time unknown → Ascendant, Midheaven, houses and any house-dependent
  reading are withheld, with an explanation. No default of 12:00 is used.
* Birth place unknown or coordinates missing → same treatment; planetary
  longitudes may still be shown if the UTC instant is reliable, with the Moon
  flagged as time-sensitive.
* Historical UTC offset uncertain → the chart is marked as uncertain and the
  reason is displayed.
* Date outside the validity window of the planetary model → refuse rather than
  extrapolate.
* Placidus houses near the polar circles → refuse that house system and offer
  whole-sign or equal houses instead.

---

## 5. Validation plan before the engine is enabled

1. Assemble a fixture set of synthetic date/time/location triples (never a real
   person's data) spanning: modern and pre-1900 dates, both hemispheres, high
   latitudes, dates near a DST transition, and dates near a sign cusp.
2. Compare the computed longitudes against independently published reference
   values (Astronomical Almanac tables and JPL Horizons output generated
   manually and committed as static fixtures), documenting the source of every
   reference value in the test file.
3. Require agreement within one arcminute for the Sun, Moon and planets; record
   the observed maximum deviation in the test suite.
4. Validate Ascendant and house cusps against worked examples from published
   astronomical and astrological literature, with the source cited.
5. Only after all of the above pass is the astrology section shown in the
   interface.

---

## 6. Open questions

* Confirm the exact validity window of the Pluto model in the chosen version
  and reflect it in the input validation.
* Decide the default house system for SYDERA (candidate: whole sign, as it is
  numerically robust everywhere and easy to explain) while offering Placidus
  where it is defined.
* Decide whether the true or mean lunar node, and Chiron, are worth adding;
  Chiron is not covered by the recommended library and would require a
  separate, separately licensed data source.
* Confirm the licence text shipped with the chosen version and add it to the
  third-party notices before release.

## 7. Decision

Proceed to Phase 2 with `astronomy-engine` as the planetary source and a
SYDERA-owned, tested chart layer. Do not install it until the validation
fixtures of section 5 exist, so that the library and its verification arrive
together.
